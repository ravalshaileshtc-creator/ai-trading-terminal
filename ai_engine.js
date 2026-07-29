const db = require('./database');

// AI Hyperparameters
const LEARNING_RATE = 0.1;   // Alpha
const DISCOUNT_FACTOR = 0.9; // Gamma
const EXPLORATION_RATE = 0.25; // Epsilon (probability of picking a random action)

/**
 * Encodes the current market technical values into a discrete state string.
 * State format: "TREND|MOMENTUM|VOLATILITY|PATTERN"
 */
function encodeMarketState(marketData, candles = []) {
  // 1. Core Trend, Momentum, Volatility
  const trend = marketData.change_percent >= 0.15 ? 'BULLISH' : 
                marketData.change_percent <= -0.15 ? 'BEARISH' : 'FLAT';
  
  const momentum = marketData.change_percent > 1.5 ? 'OVERBOUGHT' :
                   marketData.change_percent < -1.5 ? 'OVERSOLD' : 'NEUTRAL';
  
  const volatility = Math.abs(marketData.change_percent) > 1.0 ? 'HIGH' : 'LOW';
  
  // 2. Candlestick Pattern
  const pattern = detectCandlestickPattern(candles);

  // 3. EMA 9/20 crossover calculation
  let emaState = 'EMA_FLAT';
  if (candles.length >= 20) {
    const prices = candles.map(c => c.close);
    const getEMA = (data, period) => {
      let ema = data[0];
      const k = 2 / (period + 1);
      for (let i = 1; i < data.length; i++) {
        ema = data[i] * k + ema * (1 - k);
      }
      return ema;
    };
    const ema9 = getEMA(prices, 9);
    const ema20 = getEMA(prices, 20);
    emaState = ema9 > ema20 ? 'EMA_UP' : 'EMA_DOWN';
  }

  // 4. VWAP Position (Typical Price * Volume)
  let vwapState = 'VWAP_FLAT';
  if (candles.length > 0) {
    let sumTypicalPriceVol = 0;
    let sumVol = 0;
    candles.forEach(c => {
      const typicalPrice = (c.high + c.low + c.close) / 3;
      const vol = c.volume || 100;
      sumTypicalPriceVol += typicalPrice * vol;
      sumVol += vol;
    });
    const vwap = sumTypicalPriceVol / (sumVol || 1);
    const latestPrice = candles[candles.length - 1].close;
    vwapState = latestPrice > vwap ? 'VWAP_UP' : 'VWAP_DOWN';
  }

  // 5. SMC Fair Value Gap (FVG) detection
  let smcState = 'SMC_NEUTRAL';
  if (candles.length >= 3) {
    const c1 = candles[candles.length - 3]; // candle 1
    const c2 = candles[candles.length - 2]; // candle 2
    const c3 = candles[candles.length - 1]; // candle 3

    // Bullish FVG
    if (c3.low > c1.high && (c2.close - c2.open) > (c2.high - c2.low) * 0.5) {
      smcState = 'SMC_FVG_BULLISH';
    }
    // Bearish FVG
    else if (c3.high < c1.low && (c2.open - c2.close) > (c2.high - c2.low) * 0.5) {
      smcState = 'SMC_FVG_BEARISH';
    }
  }

  return `${trend}|${momentum}|${volatility}|${pattern}|${emaState}|${vwapState}|${smcState}`;
}

/**
 * Recognizes visual candlestick shapes from the last 3 candles
 */
function detectCandlestickPattern(candles) {
  if (!candles || candles.length < 3) return 'NONE';

  const c1 = candles[candles.length - 1]; // latest closed candle
  const c2 = candles[candles.length - 2]; // second latest
  
  const bodySize = Math.abs(c1.close - c1.open);
  const totalRange = c1.high - c1.low;
  if (totalRange === 0) return 'NONE';

  const upperWick = c1.high - Math.max(c1.open, c1.close);
  const lowerWick = Math.min(c1.open, c1.close) - c1.low;

  // 1. Doji (Indecision)
  if (bodySize / totalRange < 0.1) {
    return 'DOJI';
  }

  // 2. Hammer (Bullish Reversal - small upper body, long lower wick)
  if (lowerWick / bodySize > 2 && upperWick / bodySize < 0.5) {
    return 'HAMMER';
  }

  // 3. Shooting Star (Bearish Reversal - small lower body, long upper wick)
  if (upperWick / bodySize > 2 && lowerWick / bodySize < 0.5) {
    return 'SHOOTING_STAR';
  }

  // 4. Bullish Engulfing (c1 green, c2 red, c1 body engulfs c2 body)
  const c1Bullish = c1.close > c1.open;
  const c2Bearish = c2.open > c2.close;
  if (c1Bullish && c2Bearish && c1.close > c2.open && c1.open < c2.close) {
    return 'BULLISH_ENGULFING';
  }

  // 5. Bearish Engulfing (c1 red, c2 green, c1 body engulfs c2 body)
  const c1Bearish = c1.open > c1.close;
  const c2Bullish = c2.close > c2.open;
  if (c1Bearish && c2Bullish && c1.close < c2.open && c1.open > c2.close) {
    return 'BEARISH_ENGULFING';
  }

  return 'NONE';
}

/**
 * Q-learning agent state decision logic
 */
class QLearningAgent {
  constructor() {
    // Local Q-table cache to minimize SQLite reads
    this.qTableCache = {};
  }

  // Action maps: 0 = HOLD/NO_TRADE, 1 = BUY/LONG, 2 = SELL/SHORT
  getActions() {
    return [0, 1, 2];
  }

  getActionLabel(actionCode) {
    const labels = { 0: 'HOLD', 1: 'BUY', 2: 'SELL' };
    return labels[actionCode] || 'HOLD';
  }

  /**
   * Loads state Q-values from local cache or DB
   */
  async getQValues(state) {
    if (this.qTableCache[state]) {
      return this.qTableCache[state];
    }

    // Default initialization
    const qValues = { 0: 0.0, 1: 0.0, 2: 0.0 };

    try {
      const records = await db.query("SELECT action, q_value FROM ai_q_table WHERE state_string = ?", [state]);
      records.forEach(r => {
        qValues[r.action] = r.q_value;
      });
      this.qTableCache[state] = qValues;
    } catch (err) {
      console.error("Error loading Q-values:", err);
    }

    return qValues;
  }

  /**
   * Predicts an action using Epsilon-Greedy Exploration/Exploitation strategy
   */
  async predictAction(state, epsilon = EXPLORATION_RATE) {
    const qValues = await this.getQValues(state);
    
    // Exploration (Pick random action)
    if (Math.random() < epsilon) {
      const actions = this.getActions();
      const randomIdx = Math.floor(Math.random() * actions.length);
      return {
        action: actions[randomIdx],
        qValues,
        decisionMode: 'Exploration'
      };
    }

    // Exploitation (Pick action with highest Q-value)
    let bestAction = 0;
    let maxQ = -Infinity;
    
    this.getActions().forEach(act => {
      if (qValues[act] > maxQ) {
        maxQ = qValues[act];
        bestAction = act;
      }
    });

    return {
      action: bestAction,
      qValues,
      decisionMode: 'Exploitation'
    };
  }

  /**
   * Updates state-action Q-values based on feedback reward via Bellman Equation
   */
  async learn(state, action, reward, nextState) {
    const qValues = await this.getQValues(state);
    const nextQValues = await this.getQValues(nextState);

    // Max Q-value for the next state's actions
    const maxNextQ = Math.max(nextQValues[0], nextQValues[1], nextQValues[2]);

    // Q-learning Bellman Update formula
    const oldQ = qValues[action];
    const newQ = oldQ + LEARNING_RATE * (reward + DISCOUNT_FACTOR * maxNextQ - oldQ);

    // Update local cache
    this.qTableCache[state][action] = newQ;

    // Update SQLite database
    try {
      await db.run(
        `INSERT INTO ai_q_table (state_string, action, q_value, frequency, timestamp) 
         VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP)
         ON CONFLICT(state_string, action) 
         DO UPDATE SET q_value = excluded.q_value, frequency = frequency + 1, timestamp = CURRENT_TIMESTAMP`,
        [state, action, newQ]
      );
    } catch (err) {
      console.error("Error writing Q-value weight updates:", err);
    }

    return newQ;
  }
}

const aiAgent = new QLearningAgent();

module.exports = {
  aiAgent,
  encodeMarketState,
  detectCandlestickPattern
};
