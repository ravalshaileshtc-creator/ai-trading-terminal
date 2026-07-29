const express = require('express');
const path = require('path');
const db = require('./database');
const { aiAgent, encodeMarketState } = require('./ai_engine');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory system broadcast notifications queue
let systemBroadcasts = [
  { id: 1, message: "Welcome to TradeMaster! Real-time paper trading is live.", type: 'info', timestamp: new Date() }
];
let broadcastIdCounter = 2;

function addBroadcast(message, type = 'info') {
  systemBroadcasts.unshift({
    id: broadcastIdCounter++,
    message,
    type,
    timestamp: new Date()
  });
  // Keep only last 50 broadcasts
  if (systemBroadcasts.length > 50) {
    systemBroadcasts.pop();
  }
}

// ----------------- USER & SUBSCRIPTION APIS -----------------

// Fetch default trader profile (id = 1)
app.get('/api/user', async (req, res) => {
  try {
    const user = await db.get("SELECT * FROM users WHERE id = 1");
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reset balance to ₹1,00,000
app.post('/api/user/reset-balance', async (req, res) => {
  try {
    await db.run("UPDATE users SET paper_balance = 100000.00 WHERE id = 1");
    // Also close all active positions
    const activePositions = await db.query("SELECT * FROM positions WHERE status = 'ACTIVE'");
    for (const pos of activePositions) {
      await db.run("UPDATE positions SET status = 'CLOSED', exit_price = ?, pnl = 0.0 WHERE id = ?", [pos.entry_price, pos.id]);
    }
    addBroadcast("Simulator paper balance reset to ₹1,00,000.00", "warning");
    res.json({ message: "Balance reset successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upgrade Subscription (Razorpay Checkout Simulation)
app.post('/api/subscription/upgrade', async (req, res) => {
  const { tier, billing_cycle } = req.body; // Free, Pro, Prime
  if (!['Free', 'Pro', 'Prime'].includes(tier)) {
    return res.status(400).json({ error: "Invalid subscription tier" });
  }
  try {
    await db.run("UPDATE users SET subscription_tier = ?, billing_cycle = ? WHERE id = 1", [tier, billing_cycle || 'monthly']);
    addBroadcast(`Subscription upgraded to TradeMaster ${tier}!`, "success");
    res.json({ success: true, tier });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin update user subscription
app.post('/api/admin/users/update', async (req, res) => {
  const { tier, balance } = req.body;
  try {
    await db.run("UPDATE users SET subscription_tier = ?, paper_balance = ? WHERE id = 1", [tier, balance]);
    addBroadcast(`Admin updated account settings. Plan: ${tier}, Balance: ₹${balance}`, "info");
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ----------------- MARKET PRICES APIS -----------------

// Fetch current market prices
app.get('/api/market', async (req, res) => {
  try {
    const prices = await db.query("SELECT * FROM market_prices");
    res.json(prices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin updates stock live price manually
app.post('/api/market/update', async (req, res) => {
  const { symbol, price } = req.body;
  if (!symbol || isNaN(price)) {
    return res.status(400).json({ error: "Invalid symbol or price" });
  }
  try {
    const oldPriceData = await db.get("SELECT price FROM market_prices WHERE symbol = ?", [symbol]);
    const oldPrice = oldPriceData ? oldPriceData.price : price;
    const changePercent = oldPrice !== 0 ? ((price - oldPrice) / oldPrice * 100) : 0;
    
    await db.run(
      "INSERT INTO market_prices (symbol, price, change_percent, timestamp) VALUES (?, ?, ?, CURRENT_TIMESTAMP) ON CONFLICT(symbol) DO UPDATE SET price = excluded.price, change_percent = excluded.change_percent, timestamp = CURRENT_TIMESTAMP",
      [symbol, price, changePercent]
    );

    addBroadcast(`Market price update: ${symbol} overridden to ₹${price.toLocaleString()}`, "info");
    res.json({ success: true, symbol, price, changePercent });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ----------------- SIGNALS APIS -----------------

// Fetch technical signals (filtering/obscuring based on subscription tier)
app.get('/api/signals', async (req, res) => {
  try {
    const user = await db.get("SELECT * FROM users WHERE id = 1");
    const tier = user ? user.subscription_tier : 'Free';
    const allSignals = await db.query("SELECT * FROM signals ORDER BY timestamp DESC");
    const systemMarketPrices = (await db.query("SELECT * FROM market_prices")) || [];
    
    // Process signals based on tier
    // Free: Basic signals only (is_premium = 0). SMC signals and other premium signals (is_premium = 1) are locked.
    // Pro: All standard signals. SMC is premium, so it's locked.
    // Prime: Unlocks everything.
    const processedSignals = allSignals.map(sig => {
      let locked = false;
      if (tier === 'Free' && sig.is_premium === 1) {
        locked = true;
      } else if (tier === 'Pro' && sig.category === 'SMC') {
        locked = true;
      }

      if (locked) {
        return {
          ...sig,
          locked: true,
          entry_price: null,
          t1: null,
          t2: null,
          t3: null,
          sl: null,
          rr_ratio: 'Locked'
        };
      }

      // Dynamically adjust entry_price, Targets, and SL based on real live market prices
      let entry_price = sig.entry_price;
      let t1 = sig.t1;
      let t2 = sig.t2;
      let t3 = sig.t3;
      let sl = sig.sl;

      const liveObj = systemMarketPrices.find(p => p.symbol === sig.symbol);
      if (liveObj && liveObj.price) {
        const liveP = liveObj.price;
        entry_price = liveP;
        if (sig.type === 'BUY') {
          sl = parseFloat((liveP * 0.992).toFixed(2));
          t1 = parseFloat((liveP * 1.015).toFixed(2));
          t2 = parseFloat((liveP * 1.030).toFixed(2));
          t3 = parseFloat((liveP * 1.050).toFixed(2));
        } else {
          sl = parseFloat((liveP * 1.008).toFixed(2));
          t1 = parseFloat((liveP * 0.985).toFixed(2));
          t2 = parseFloat((liveP * 0.970).toFixed(2));
          t3 = parseFloat((liveP * 0.950).toFixed(2));
        }
      }

      return {
        ...sig,
        locked: false,
        entry_price,
        t1,
        t2,
        t3,
        sl
      };
    });

    res.json(processedSignals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin injects manual signal
app.post('/api/signals/create', async (req, res) => {
  const { symbol, strategy_name, category, type, entry_price, t1, t2, t3, sl, rr_ratio, is_premium } = req.body;
  if (!symbol || !strategy_name || !category || !type || isNaN(entry_price)) {
    return res.status(400).json({ error: "Missing or invalid signal properties" });
  }
  try {
    await db.run(
      `INSERT INTO signals 
      (symbol, strategy_name, category, type, entry_price, t1, t2, t3, sl, rr_ratio, is_premium)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [symbol, strategy_name, category, type.toUpperCase(), entry_price, t1, t2, t3, sl, rr_ratio || '1:3.0', is_premium ? 1 : 0]
    );

    addBroadcast(`New Signal Injected: ${symbol} ${type.toUpperCase()} via ${strategy_name} (${category})`, "success");
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ----------------- PAPER TRADING APIS -----------------

// Get Portfolio (balance, active positions, closed history)
app.get('/api/portfolio', async (req, res) => {
  try {
    const user = await db.get("SELECT * FROM users WHERE id = 1");
    const activePositions = await db.query("SELECT * FROM positions WHERE status = 'ACTIVE' ORDER BY timestamp DESC");
    const closedLedger = await db.query("SELECT * FROM positions WHERE status = 'CLOSED' ORDER BY timestamp DESC LIMIT 50");
    
    res.json({
      balance: user ? user.paper_balance : 100000.00,
      subscription_tier: user ? user.subscription_tier : 'Free',
      activePositions,
      closedLedger
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Place paper trading order (Market / Limit)
// We support both Buy/Long and Short Sell positions.
app.post('/api/trade/place', async (req, res) => {
  const { symbol, type, orderType, price, size, stopLoss, takeProfit } = req.body; // type: BUY, SHORT; orderType: MARKET, LIMIT
  if (!symbol || !type || !orderType || isNaN(size) || size <= 0) {
    return res.status(400).json({ error: "Invalid order parameters" });
  }

  try {
    const user = await db.get("SELECT * FROM users WHERE id = 1");
    if (!user) return res.status(404).json({ error: "User profile not found" });

    // Fetch current market price to evaluate margin or order validation
    const priceData = await db.get("SELECT price FROM market_prices WHERE symbol = ?", [symbol]);
    if (!priceData) return res.status(404).json({ error: "Asset price not found" });
    const currentPrice = priceData.price;

    const entryPrice = orderType === 'MARKET' ? currentPrice : parseFloat(price);
    if (isNaN(entryPrice) || entryPrice <= 0) {
      return res.status(400).json({ error: "Invalid entry price" });
    }

    // Margin Calculation (e.g. 5x leverage is standard in intraday, meaning margin = (entryPrice * size) / 5)
    // We'll keep it simple: margin is the full cost or leveraged cost. Let's do 5x leverage margin.
    const positionValue = entryPrice * size;
    const marginRequired = positionValue / 5;

    if (user.paper_balance < marginRequired) {
      return res.status(400).json({ error: "Insufficient paper trading balance" });
    }

    if (orderType === 'MARKET') {
      // Execute immediately: deduct margin from balance and insert active position
      const newBalance = user.paper_balance - marginRequired;
      await db.run("UPDATE users SET paper_balance = ? WHERE id = 1", [newBalance]);
      
      const posResult = await db.run(
        `INSERT INTO positions (symbol, type, entry_price, size, margin, status, exit_price, pnl) 
         VALUES (?, ?, ?, ?, ?, 'ACTIVE', NULL, 0.0)`,
        [symbol, type.toUpperCase(), entryPrice, size, marginRequired]
      );
      
      addBroadcast(`Position Opened: ${type.toUpperCase()} ${size} ${symbol} at ₹${entryPrice}`, "success");
      res.json({ success: true, message: "Order executed successfully", positionId: posResult.id, newBalance });
    } else {
      // LIMIT order: We will save it as a PENDING position (we can store status as 'PENDING')
      // Deduct margin on placement to lock the funds
      const newBalance = user.paper_balance - marginRequired;
      await db.run("UPDATE users SET paper_balance = ? WHERE id = 1", [newBalance]);
      
      const posResult = await db.run(
        `INSERT INTO positions (symbol, type, entry_price, size, margin, status, exit_price, pnl) 
         VALUES (?, ?, ?, ?, ?, 'PENDING', NULL, 0.0)`,
        [symbol, type.toUpperCase(), entryPrice, size, marginRequired]
      );
      
      addBroadcast(`Limit Order Placed: ${type.toUpperCase()} ${size} ${symbol} at ₹${entryPrice}`, "info");
      res.json({ success: true, message: "Limit order placed successfully", positionId: posResult.id, newBalance });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Close active position manually
app.post('/api/trade/close', async (req, res) => {
  const { positionId } = req.body;
  if (!positionId) return res.status(400).json({ error: "Position ID is required" });

  try {
    const pos = await db.get("SELECT * FROM positions WHERE id = ?", [positionId]);
    if (!pos) return res.status(404).json({ error: "Position not found" });
    if (pos.status !== 'ACTIVE' && pos.status !== 'PENDING') {
      return res.status(400).json({ error: "Position is not active or pending" });
    }

    const user = await db.get("SELECT * FROM users WHERE id = 1");
    if (!user) return res.status(404).json({ error: "User profile not found" });

    if (pos.status === 'PENDING') {
      // Cancel limit order: return margin to balance
      const newBalance = user.paper_balance + pos.margin;
      await db.run("UPDATE users SET paper_balance = ? WHERE id = 1", [newBalance]);
      await db.run("UPDATE positions SET status = 'CLOSED', exit_price = ?, pnl = 0.0 WHERE id = ?", [pos.entry_price, positionId]);
      
      addBroadcast(`Limit order cancelled: ${pos.symbol}`, "warning");
      return res.json({ success: true, message: "Limit order cancelled successfully", newBalance });
    }

    // ACTIVE position: get current market price to exit
    const priceData = await db.get("SELECT price FROM market_prices WHERE symbol = ?", [pos.symbol]);
    if (!priceData) return res.status(404).json({ error: "Current asset price not found" });
    const currentPrice = priceData.price;

    // Calculate final P&L
    let finalPnl = 0.0;
    if (pos.type === 'BUY') {
      finalPnl = (currentPrice - pos.entry_price) * pos.size;
    } else if (pos.type === 'SHORT') {
      finalPnl = (pos.entry_price - currentPrice) * pos.size;
    }

    // Return Margin + P&L back to user balance
    const payout = pos.margin + finalPnl;
    const newBalance = user.paper_balance + payout;
    
    await db.run("UPDATE users SET paper_balance = ? WHERE id = 1", [newBalance]);
    await db.run("UPDATE positions SET status = 'CLOSED', exit_price = ?, pnl = ? WHERE id = ?", [currentPrice, finalPnl, positionId]);

    const currencySymbol = '₹';
    addBroadcast(`Position Closed: ${pos.type} ${pos.symbol}. Profit: ${finalPnl >= 0 ? '+' : ''}${currencySymbol}${finalPnl.toFixed(2)}`, finalPnl >= 0 ? "success" : "error");

    res.json({ success: true, finalPnl, newBalance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ----------------- JOURNAL APIS -----------------

// Fetch journal entries
app.get('/api/journal', async (req, res) => {
  try {
    const journalEntries = await db.query("SELECT * FROM journal ORDER BY timestamp DESC");
    res.json(journalEntries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create journal entry
app.post('/api/journal/create', async (req, res) => {
  const { symbol, strategy_tag, note, emotion, reflection } = req.body;
  if (!symbol || !note) {
    return res.status(400).json({ error: "Symbol and note are required" });
  }
  try {
    await db.run(
      "INSERT INTO journal (symbol, strategy_tag, note, emotion, reflection) VALUES (?, ?, ?, ?, ?)",
      [symbol, strategy_tag || 'General', note, emotion || 'Disciplined', reflection || '']
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ----------------- BROADCASTS APIS -----------------

// Fetch broadcasts
app.get('/api/broadcasts', (req, res) => {
  res.json(systemBroadcasts);
});

// Dispatch broadcast notification manually (Admin)
app.post('/api/broadcasts/create', (req, res) => {
  const { message, type } = req.body;
  if (!message) return res.status(400).json({ error: "Message is required" });
  addBroadcast(message, type || 'info');
  res.json({ success: true });
});


// ----------------- SIMULATION SERVICE LOOP -----------------

const yahooSymbolMap = {
  'NIFTY 50': '^NSEI',
  'BANK NIFTY': '^NSEBANK',
  'FIN NIFTY': '^CNXFIN',
  'RELIANCE': 'RELIANCE.NS',
  'TCS': 'TCS.NS',
  'INFY': 'INFY.NS',
  'HDFCBANK': 'HDFCBANK.NS',
  'ICICIBANK': 'ICICIBANK.NS',
  'SBIN': 'SBIN.NS',
  'TATAMOTORS': 'TATAMOTORS.NS',
  'ITC': 'ITC.NS',
  'BHARTIARTL': 'BHARTIARTL.NS',
  'LT': 'LT.NS',
  'HINDUNILVR': 'HINDUNILVR.NS',
  'AXISBANK': 'AXISBANK.NS',
  'KOTAKBANK': 'KOTAKBANK.NS',
  'ADANIENT': 'ADANIENT.NS',
  'BAJFINANCE': 'BAJFINANCE.NS',
  'M&M': 'M&M.NS',
  'SUNPHARMA': 'SUNPHARMA.NS',
  'ASIANPAINT': 'ASIANPAINT.NS',
  'MARUTI': 'MARUTI.NS',
  'TITAN': 'TITAN.NS',
  'ULTRACEMCO': 'ULTRACEMCO.NS',
  'WIPRO': 'WIPRO.NS',
  'TATASTEEL': 'TATASTEEL.NS',
  'JSWSTEEL': 'JSWSTEEL.NS',
  'POWERGRID': 'POWERGRID.NS',
  'NTPC': 'NTPC.NS',
  'HCLTECH': 'HCLTECH.NS',
  'ONGC': 'ONGC.NS',
  'ADANIPORTS': 'ADANIPORTS.NS',
  'COALINDIA': 'COALINDIA.NS',
  'GRASIM': 'GRASIM.NS',
  'BAJAJFINSV': 'BAJAJFINSV.NS',
  'INDUSINDBK': 'INDUSINDBK.NS',
  'HINDALCO': 'HINDALCO.NS',
  'SBILIFE': 'SBILIFE.NS',
  'BPCL': 'BPCL.NS',
  'EICHERMOT': 'EICHERMOT.NS',
  'JIOFIN': 'JIOFIN.NS',
  'HEROMOTOCO': 'HEROMOTOCO.NS',
  'CIPLA': 'CIPLA.NS',
  'TATACONSUM': 'TATACONSUM.NS',
  'APOLLOHOSP': 'APOLLOHOSP.NS',
  'NESTLEIND': 'NESTLEIND.NS',
  'BRITANNIA': 'BRITANNIA.NS',
  'TECHM': 'TECHM.NS'
};

async function fetchRealPrices() {
  const symbols = Object.keys(yahooSymbolMap);
  for (const sym of symbols) {
    const ySym = yahooSymbolMap[sym];
    try {
      const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ySym)}`);
      const data = await res.json();
      if (data.chart && data.chart.result && data.chart.result[0]) {
        const meta = data.chart.result[0].meta;
        const currentPrice = meta.regularMarketPrice;
        const prevClose = meta.chartPreviousClose || currentPrice;
        const changePercent = ((currentPrice - prevClose) / prevClose) * 100;

        await db.run(
          "INSERT INTO market_prices (symbol, price, change_percent, timestamp) VALUES (?, ?, ?, CURRENT_TIMESTAMP) ON CONFLICT(symbol) DO UPDATE SET price = excluded.price, change_percent = excluded.change_percent, timestamp = CURRENT_TIMESTAMP",
          [sym, currentPrice, changePercent]
        );
      }
    } catch (err) {
      console.error(`Error fetching real price for ${sym}:`, err.message);
    }
  }
}

// Fetch real prices immediately on startup
fetchRealPrices().then(() => console.log("Initial real prices loaded from Yahoo Finance.")).catch(err => console.error(err));

// Periodically fetch real prices from Yahoo Finance every 10 seconds
setInterval(fetchRealPrices, 10000);

// Random walk pricing generator & auto-trade triggers
setInterval(async () => {
  try {
    const prices = await db.query("SELECT * FROM market_prices");
    const activePositions = await db.query("SELECT * FROM positions WHERE status = 'ACTIVE'");
    const pendingOrders = await db.query("SELECT * FROM positions WHERE status = 'PENDING'");
    
    // 1. Tick prices
    for (const p of prices) {
      // Standard micro-fluctuations (0.01% max tick) to keep UI active between fetches
      const volatility = 0.0001;
      
      const changePercent = (Math.random() - 0.49) * 2 * volatility; // -volatility to +volatility
      const newPrice = p.price * (1 + changePercent);
      const dayChange = p.change_percent + (changePercent * 100);

      await db.run(
        "UPDATE market_prices SET price = ?, change_percent = ? WHERE symbol = ?",
        [newPrice, dayChange, p.symbol]
      );

      // ----------------- AI SIMULATOR ENGINE LOOP INTEGRATION -----------------
      const aiCycleCountKey = `ai_cycle_${p.symbol.replace('/', '_')}`;
      if (!global[aiCycleCountKey]) global[aiCycleCountKey] = 0;
      global[aiCycleCountKey]++;

      // 1. Resolve active AI trades
      const activeAiTrade = await db.get("SELECT * FROM ai_trades WHERE symbol = ? AND status = 'ACTIVE'", [p.symbol]);
      if (activeAiTrade) {
        // AI position is open. Evaluate resolution (closes after 8 cycles or if target hit)
        const startCycleKey = `${aiCycleCountKey}_start`;
        if (!global[startCycleKey]) global[startCycleKey] = global[aiCycleCountKey];
        const cyclesOpen = global[aiCycleCountKey] - global[startCycleKey];
        
        const entryValue = activeAiTrade.entry_price;
        const priceDiff = ((newPrice - entryValue) / entryValue) * 100;
        
        let shouldClose = false;
        let finalPnl = 0.0;
        
        if (activeAiTrade.predicted_action === 1) { // BUY
          finalPnl = priceDiff * 1000.00; // Simulated 1000 margin size
          if (priceDiff >= 1.0 || priceDiff <= -0.6 || cyclesOpen >= 6) {
            shouldClose = true;
          }
        } else if (activeAiTrade.predicted_action === 2) { // SHORT
          finalPnl = -priceDiff * 1000.00;
          if (priceDiff <= -1.0 || priceDiff >= 0.6 || cyclesOpen >= 6) {
            shouldClose = true;
          }
        }

        if (shouldClose) {
          // Calculate point rewards and penalties
          let pts = 0;
          let reasons = [];
          
          const isWin = finalPnl >= 0;
          if (isWin) {
            pts += 10;
            reasons.push("Successful prediction (+10)");
            if (finalPnl >= 500) {
              pts += 20;
              reasons.push("Profitable trade setup (+20)");
            }
          } else {
            pts -= 10;
            reasons.push("Wrong prediction (-10)");
            if (finalPnl <= -300) {
              pts -= 20;
              reasons.push("High risk mistake (-20)");
            }
          }

          // Correct trend prediction check
          const isBuy = activeAiTrade.predicted_action === 1;
          const trendMatches = (isBuy && priceDiff > 0) || (!isBuy && priceDiff < 0);
          if (trendMatches) {
            pts += 5;
            reasons.push("Correct trend direction (+5)");
          }

          // Check for repeated mistake
          const lastSameTrade = await db.get(
            "SELECT pnl FROM ai_trades WHERE state_string = ? AND predicted_action = ? AND id < ? ORDER BY id DESC LIMIT 1",
            [activeAiTrade.state_string, activeAiTrade.predicted_action, activeAiTrade.id]
          );
          if (lastSameTrade && lastSameTrade.pnl < 0 && !isWin) {
            pts -= 15;
            reasons.push("Repeated mistake on same pattern (-15)");
          }

          const explanation = reasons.join(", ") + `. PnL: ₹${finalPnl.toFixed(2)} (${priceDiff.toFixed(2)}% price change).`;

          // Scale points for Q-learning stability (e.g. +35 points -> +3.5 reward)
          const reward = pts / 10.0;

          const nextStateStr = encodeMarketState(p, [{ open: newPrice, high: newPrice, low: newPrice, close: newPrice }]);
          
          // Learn Bellman Update
          await aiAgent.learn(activeAiTrade.state_string, activeAiTrade.predicted_action, reward, nextStateStr);

          // Update position status in DB
          await db.run(
            "UPDATE ai_trades SET status = 'CLOSED', exit_price = ?, pnl = ?, reward = ?, reward_points = ?, explanation = ?, timestamp = CURRENT_TIMESTAMP WHERE id = ?",
            [newPrice, finalPnl, reward, pts, explanation, activeAiTrade.id]
          );

          // Silent internal log only - no popup toast on every settlement
          // Only log to console, visible in AI Agent tab history
          console.log(`[AI] Trade Settled: ${p.symbol} | ${pts >= 0 ? '+' : ''}${pts} pts | PnL: ₹${finalPnl.toFixed(2)}`);
        }
      } else {
        // No active trade. Try to open a new one every 8 cycles (16 seconds)
        // But first check: max 3 active AI trades globally at any time
        if (global[aiCycleCountKey] % 8 === 0) {
          const totalActiveCount = await db.get("SELECT COUNT(*) as cnt FROM ai_trades WHERE status = 'ACTIVE'");
          const activeCount = totalActiveCount ? totalActiveCount.cnt : 0;

          if (activeCount < 3) {
            const stateStr = encodeMarketState(p, [{ open: newPrice, high: newPrice, low: newPrice, close: newPrice }]);
            const { action, decisionMode } = await aiAgent.predictAction(stateStr, 0.25);

            if (action !== 0) { // BUY or SELL
              global[`${aiCycleCountKey}_start`] = global[aiCycleCountKey];
              await db.run(
                "INSERT INTO ai_trades (symbol, state_string, predicted_action, entry_price, status) VALUES (?, ?, ?, ?, 'ACTIVE')",
                [p.symbol, stateStr, action, newPrice]
              );
              // Silent log only - no toast popup for new trades
              console.log(`[AI] New trade opened: ${action === 1 ? 'BUY' : 'SHORT'} ${p.symbol} @ ₹${newPrice} (${decisionMode})`);
            }
          }
        }
      }

      // Check pending limit orders for execution
      for (const order of pendingOrders) {
        if (order.symbol === p.symbol) {
          let trigger = false;
          if (order.type === 'BUY' && newPrice <= order.entry_price) {
            trigger = true;
          } else if (order.type === 'SHORT' && newPrice >= order.entry_price) {
            trigger = true;
          }

          if (trigger) {
            await db.run("UPDATE positions SET status = 'ACTIVE', entry_price = ?, timestamp = CURRENT_TIMESTAMP WHERE id = ?", [newPrice, order.id]);
            addBroadcast(`Limit Order Triggered: ${order.type} ${order.symbol} executed at ₹${newPrice.toFixed(2)}`, "success");
          }
        }
      }

      // Check target or stop-loss hits for active positions
      // Since signals in our table have specific SL/T1/T2/T3, we can check if this position matches any active signal bounds
      // Or we can dynamically simulate SL and Take-Profit bounds based on entry price for manual trades!
      for (const pos of activePositions) {
        if (pos.symbol === p.symbol) {
          // Calculate updated real-time PnL
          let currentPnl = 0.0;
          if (pos.type === 'BUY') {
            currentPnl = (newPrice - pos.entry_price) * pos.size;
          } else if (pos.type === 'SHORT') {
            currentPnl = (pos.entry_price - newPrice) * pos.size;
          }
          await db.run("UPDATE positions SET pnl = ? WHERE id = ?", [currentPnl, pos.id]);

          // Check automatic safety boundaries (Take Profit @ +15% of position value, Stop Loss @ -8% of position value or similar)
          // To make it highly interactive, let's trigger target hits/SL exits based on signals:
          // We can fetch a matching signal in the database for target checks, or if it doesn't exist, we set static limits:
          // Target boundary: +10% of margin, Stop loss: -10% of margin
          const entryValue = pos.entry_price * pos.size;
          const leverageMultiplier = 5;
          const percentageGain = currentPnl / pos.margin; // relative to margin

          let autoExitType = null; // 'SL' or 'TP'
          let exitReason = "";

          // Target Hit (TP)
          if (percentageGain >= 0.20) { // 20% gain on margin
            autoExitType = 'TP';
            exitReason = "Target 1 Hit (+20% margin gain)";
          } 
          // Stop Loss Hit (SL)
          else if (percentageGain <= -0.15) { // 15% loss on margin
            autoExitType = 'SL';
            exitReason = "Stop Loss Triggered (-15% margin limit)";
          }

          if (autoExitType) {
            const user = await db.get("SELECT * FROM users WHERE id = 1");
            const payout = pos.margin + currentPnl;
            const newBalance = user.paper_balance + payout;
            
            await db.run("UPDATE users SET paper_balance = ? WHERE id = 1", [newBalance]);
            await db.run("UPDATE positions SET status = 'CLOSED', exit_price = ?, pnl = ? WHERE id = ?", [newPrice, currentPnl, pos.id]);

            const currencySymbol = '₹';
            const statusType = autoExitType === 'TP' ? 'success' : 'error';
            addBroadcast(`Auto-Exit: ${pos.symbol} ${pos.type} position closed. ${exitReason}. Exit Price: ${currencySymbol}${newPrice.toFixed(2)}, P&L: ${currentPnl >= 0 ? '+' : ''}${currencySymbol}${currentPnl.toFixed(2)}`, statusType);
          }
        }
      }
    }
  } catch (err) {
    console.error("Simulation engine loop error:", err);
  }
}, 2000);


// ----------------- AI TRADING ENGINE APIS -----------------

// Fetch learning stats and historical predictions
app.get('/api/ai/stats', async (req, res) => {
  try {
    const statesCount = await db.get("SELECT COUNT(DISTINCT state_string) as count FROM ai_q_table");
    const totalTrades = await db.get("SELECT COUNT(*) as count FROM ai_trades WHERE status = 'CLOSED'");
    const winTrades = await db.get("SELECT COUNT(*) as count FROM ai_trades WHERE status = 'CLOSED' AND pnl > 0");
    const netReward = await db.get("SELECT SUM(reward) as total FROM ai_trades");
    const recentPredictions = await db.query("SELECT * FROM ai_trades ORDER BY timestamp DESC LIMIT 10");

    const total = totalTrades.count || 0;
    const wins = winTrades.count || 0;
    const accuracy = total > 0 ? Math.round((wins / total) * 100) : 50;

    res.json({
      statesLearned: statesCount.count || 0,
      totalPredictions: total,
      wins,
      accuracy,
      netReward: netReward.total ? parseFloat(netReward.total.toFixed(2)) : 0.0,
      recentPredictions
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch pattern success metrics for pattern recognition analytics
app.get('/api/ai/patterns', async (req, res) => {
  try {
    const qStates = await db.query("SELECT state_string, SUM(frequency) as total_seen FROM ai_q_table GROUP BY state_string ORDER BY total_seen DESC LIMIT 8");
    const patternAnalytics = [];
    
    for (const q of qStates) {
      // Find historical trade outcomes for this state
      const winsRow = await db.get("SELECT COUNT(*) as count FROM ai_trades WHERE state_string = ? AND pnl >= 0", [q.state_string]);
      const lossesRow = await db.get("SELECT COUNT(*) as count FROM ai_trades WHERE state_string = ? AND pnl < 0", [q.state_string]);
      
      const wins = winsRow ? winsRow.count : 0;
      const losses = lossesRow ? lossesRow.count : 0;
      const totalTrades = wins + losses;
      
      let successRate = 50;
      if (totalTrades > 0) {
        successRate = Math.round((wins / totalTrades) * 100);
      } else {
        // Fallback calculation based on Q-values to simulate success probability before real trades close
        const qBuy = await db.get("SELECT q_value FROM ai_q_table WHERE state_string = ? AND action = 1", [q.state_string]);
        const qSell = await db.get("SELECT q_value FROM ai_q_table WHERE state_string = ? AND action = 2", [q.state_string]);
        const maxQ = Math.max(qBuy ? qBuy.q_value : 0, qSell ? qSell.q_value : 0);
        
        if (maxQ > 0) {
          successRate = Math.min(Math.round(50 + maxQ * 15), 92);
        } else if (maxQ < 0) {
          successRate = Math.max(Math.round(50 + maxQ * 15), 15);
        }
      }
      
      const upwardMoves = wins || Math.round(q.total_seen * (successRate / 100));
      
      patternAnalytics.push({
        state: q.state_string,
        totalSeen: q.total_seen,
        upwardMoves,
        successRate,
        formatted: `Similar pattern appeared ${q.total_seen} times. ${upwardMoves} times market moved upward. Success probability: ${successRate}%`
      });
    }
    
    res.json(patternAnalytics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Chat Assistant endpoint for natural language query execution
app.post('/api/ai/chat', async (req, res) => {
  const { message, symbol } = req.body;
  if (!message) return res.status(400).json({ error: "Message is required" });

  const msgLower = message.toLowerCase();
  let reply = "";

  try {
    // 1. "Market condition today?"
    if (msgLower.includes("market condition") || msgLower.includes("condition today") || msgLower.includes("aaj ka market") || msgLower.includes("aaj kya market")) {
      const activeSignals = await db.query("SELECT COUNT(*) as count FROM signals");
      const activeSignalsCount = activeSignals[0] ? activeSignals[0].count : 0;
      
      const prices = await db.query("SELECT * FROM market_prices ORDER BY ABS(change_percent) DESC");
      const gainers = prices.filter(p => p.change_percent > 0).slice(0, 2);
      const losers = prices.filter(p => p.change_percent < 0).slice(0, 2);
      
      reply = `Today's market conditions:
- **Top Gainers:** ${gainers.map(g => `${g.symbol} (+${g.change_percent.toFixed(2)}%)`).join(', ') || 'N/A'}.
- **Top Losers:** ${losers.map(l => `${l.symbol} (${l.change_percent.toFixed(2)}%)`).join(', ') || 'N/A'}.
- **Active Technical Signals:** ${activeSignalsCount} strategies currently triggering setups.
- **AI Stance:** System recommends selecting high R:R setups with trend confluence during peak volume hours (9:15-11:00 AM).`;
    } 
    // 2. "Is this setup good?" or "Analyze this chart"
    else if (msgLower.includes("setup good") || msgLower.includes("analyze this") || msgLower.includes("chart analyze") || msgLower.includes("kese le stock") || msgLower.includes("setup kaisa")) {
      const activeSymbol = symbol || 'RELIANCE';
      const priceData = await db.get("SELECT price, change_percent FROM market_prices WHERE symbol = ?", [activeSymbol]);
      
      if (!priceData) {
        reply = `I couldn't find pricing data for ${activeSymbol}. Please select a valid Nifty 50 constituent and try again.`;
      } else {
        const stateStr = encodeMarketState(priceData, [{ open: priceData.price, high: priceData.price, low: priceData.price, close: priceData.price }]);
        
        // Find Q-value weights for BUY (1) and SHORT (2)
        const qBuy = await db.get("SELECT q_value, frequency FROM ai_q_table WHERE state_string = ? AND action = 1", [stateStr]);
        const qSell = await db.get("SELECT q_value, frequency FROM ai_q_table WHERE state_string = ? AND action = 2", [stateStr]);
        
        const buyQ = qBuy ? qBuy.q_value : 0.0;
        const sellQ = qSell ? qSell.q_value : 0.0;
        const freq = (qBuy ? qBuy.frequency : 0) + (qSell ? qSell.frequency : 0);
        
        const bestAction = buyQ > sellQ ? 'BUY' : (sellQ > buyQ ? 'SHORT' : 'HOLD');
        const maxQ = Math.max(buyQ, sellQ);
        
        // Calculate dynamic confidence score
        let confidence = 50;
        if (maxQ > 0) {
          confidence = Math.min(Math.round(50 + maxQ * 12), 94);
        } else if (maxQ < 0) {
          confidence = Math.max(Math.round(50 + maxQ * 12), 15);
        }
        
        const riskLevel = confidence > 75 ? 'Low' : (confidence > 55 ? 'Medium' : 'High');
        
        reply = `AI Assistant Analysis for **${activeSymbol}**:
- **Market Direction:** ${bestAction === 'HOLD' ? 'Neutral' : (bestAction === 'BUY' ? 'Bullish 📈' : 'Bearish 📉')}
- **Confidence Score:** ${confidence}% (derived from ${freq} training occurrences)
- **Suggested Entry Zone:** ₹${(priceData.price * 0.999).toFixed(2)} - ₹${(priceData.price * 1.001).toFixed(2)}
- **Stop Loss Suggestion:** ₹${bestAction === 'BUY' ? (priceData.price * 0.993).toFixed(2) : (priceData.price * 1.007).toFixed(2)}
- **Take Profit Target:** ₹${bestAction === 'BUY' ? (priceData.price * 1.015).toFixed(2) : (priceData.price * 0.985).toFixed(2)}
- **Risk Level:** ${riskLevel}
- **AI Brain Rationale:** State pattern analyzed is \`${stateStr.split('|').slice(3).join(', ')}\`. Crossover and FVG indicators support this directional bias.`;
      }
    } 
    // 3. "Why did this trade fail?"
    else if (msgLower.includes("trade fail") || msgLower.includes("nuksan kyu hua") || msgLower.includes("loss kyu") || msgLower.includes("trade galat")) {
      const lastFailedTrade = await db.get("SELECT * FROM ai_trades WHERE pnl < 0 ORDER BY id DESC LIMIT 1");
      if (!lastFailedTrade) {
        reply = `I have no recorded failed trades in my memory. All simulated positions have closed in profit so far!`;
      } else {
        reply = `Memory Recall: Last failed trade occurred on **${lastFailedTrade.symbol}** (${lastFailedTrade.predicted_action === 1 ? 'BUY' : 'SHORT'}):
- **Entry Price:** ₹${lastFailedTrade.entry_price.toFixed(2)} | **Exit Price:** ₹${lastFailedTrade.exit_price.toFixed(2)}
- **PnL:** -₹${Math.abs(lastFailedTrade.pnl).toFixed(2)} (Reward: ${lastFailedTrade.reward.toFixed(1)})
- **Mistake Analysis:** ${lastFailedTrade.explanation || 'Market volatility exceeded support thresholds.'}
- **Correction applied:** Penalized state-action pair \`${lastFailedTrade.state_string}\` in the Q-table to prevent repeating this counter-trend execution.`;
      }
    } 
    // 4. "Improve my strategy"
    else if (msgLower.includes("improve my strategy") || msgLower.includes("strategy improve") || msgLower.includes("parameter kaise settings") || msgLower.includes("strategy acchi")) {
      const backtest = await db.get("SELECT * FROM ai_backtests ORDER BY id DESC LIMIT 1");
      const avgWinRate = backtest ? backtest.win_rate : 65;
      
      reply = `AI Optimization Strategy:
- **Current Model Accuracy:** ${avgWinRate}%
- **Suggested Parameter Tweak:**
  - Increase **Exploration Rate (Epsilon)** to \`0.20\` to allow the robot to find new breakout zones.
  - Set **Learning Rate (Alpha)** to \`0.15\` to integrate recent market trends faster.
  - Set **Discount Factor (Gamma)** to \`0.95\` to value long-term gains over micro-scalps.
- **Safety Warning:** Intraday setups are highly volatile. Always test strategy changes on our paper trading simulator (with virtual ₹1,00,000) for at least 10 days before deploying capital.`;
    } 
    // 5. Default Fallback response
    else {
      reply = `Hello! I am your AI Smart Trading Brain. I observe markets, learn from historical data, and remember previous experiences.

You can ask me:
1. *"Market condition today?"* (To check overall trends and top gainers/losers)
2. *"Is this setup good?"* (To analyze the selected symbol ${symbol || '(no asset selected)'})
3. *"Why did this trade fail?"* (To retrieve and dissect the latest counter-trend mistake)
4. *"Improve my strategy"* (To check model accuracy and request Q-learning adjustments)`;
    }

    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch top AI recommendations based on Q-table weights and active state
app.get('/api/ai/top-picks', async (req, res) => {
  try {
    const prices = await db.query("SELECT * FROM market_prices");
    const picks = [];
    
    for (const p of prices) {
      // Encode market state
      const stateStr = encodeMarketState(p, [{ open: p.price, high: p.price, low: p.price, close: p.price }]);
      
      const buyRecord = await db.get("SELECT q_value FROM ai_q_table WHERE state_string = ? AND action = 1", [stateStr]);
      const sellRecord = await db.get("SELECT q_value FROM ai_q_table WHERE state_string = ? AND action = 2", [stateStr]);
      
      const buyQ = buyRecord ? buyRecord.q_value : 0.0;
      const sellQ = sellRecord ? sellRecord.q_value : 0.0;
      
      if (buyQ > 0.1 || sellQ > 0.1) {
        picks.push({
          symbol: p.symbol,
          type: buyQ > sellQ ? 'BUY' : 'SHORT',
          score: Math.max(buyQ, sellQ),
          price: p.price,
          reason: buyQ > sellQ ? "Bullish trend confirmed by Q-Learning matrix." : "Bearish trend confirmed by Q-Learning matrix."
        });
      }
    }
    
    // Sort by highest Q score first
    picks.sort((a, b) => b.score - a.score);
    
    // Fallback: Seed with liquid assets
    if (picks.length < 3) {
      const fallbacks = [
        { symbol: 'RELIANCE', type: 'BUY', score: 1.5, price: 0, reason: "Breakout zone consolidation setup predicted." },
        { symbol: 'TCS', type: 'BUY', score: 1.2, price: 0, reason: "Support bounce indicator confluence predicted." },
        { symbol: 'INFY', type: 'SHORT', score: 1.1, price: 0, reason: "Resistance reject structure predicted." }
      ];
      
      for (const f of fallbacks) {
        if (!picks.some(p => p.symbol === f.symbol)) {
          const priceData = await db.get("SELECT price FROM market_prices WHERE symbol = ?", [f.symbol]);
          f.price = priceData ? priceData.price : 1000;
          picks.push(f);
        }
      }
    }
    
    res.json(picks.slice(0, 3));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch Q-table entries for visualization
app.get('/api/ai/q-table', async (req, res) => {
  try {
    const records = await db.query("SELECT * FROM ai_q_table ORDER BY frequency DESC LIMIT 100");
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// User feedback rewards
app.post('/api/ai/feedback', async (req, res) => {
  const { tradeId, feedback } = req.body; // feedback: LIKE, DISLIKE
  if (!tradeId || !['LIKE', 'DISLIKE'].includes(feedback)) {
    return res.status(400).json({ error: "Invalid parameters" });
  }

  try {
    const trade = await db.get("SELECT * FROM ai_trades WHERE id = ?", [tradeId]);
    if (!trade) return res.status(404).json({ error: "AI trade not found" });

    // Update feedback
    await db.run("UPDATE ai_trades SET user_feedback = ? WHERE id = ?", [feedback, tradeId]);

    // Apply reinforcement learning adjustment
    // Add dynamic positive or negative reward directly to the Q-table
    const adjustment = feedback === 'LIKE' ? 1.5 : -1.5;
    const newReward = trade.reward + adjustment;
    await db.run("UPDATE ai_trades SET reward = ? WHERE id = ?", [newReward, tradeId]);

    // Update Q-value weights
    const nextState = "FEEDBACK|UPDATED|LOW|NONE"; // dummy transition state
    await aiAgent.learn(trade.state_string, trade.predicted_action, adjustment, nextState);

    addBroadcast(`User trained AI for ${trade.symbol}! Feedback: ${feedback === 'LIKE' ? '👍 Approved' : '👎 Rejected'}`, "success");
    res.json({ success: true, newReward });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Backtesting Training simulation
app.post('/api/ai/backtest', async (req, res) => {
  const { episodes, learningRate, discountFactor, explorationRate } = req.body;
  const count = parseInt(episodes) || 50;

  try {
    let balance = 100000.00;
    const balanceHistory = [balance];
    let wins = 0;
    let losses = 0;

    // Simulate historical price series
    let price = 50000.00;
    const mockCandles = [];

    // Prepopulate some starting mock candles
    for (let i = 0; i < 10; i++) {
      price = price * (1 + (Math.random() - 0.49) * 0.01);
      mockCandles.push({ open: price, high: price * 1.005, low: price * 0.995, close: price });
    }

    // Run training episodes
    for (let ep = 0; ep < count; ep++) {
      // 1. Encode current state
      const mockChange = (Math.random() - 0.49) * 2;
      const marketData = { change_percent: mockChange };
      const stateStr = encodeMarketState(marketData, mockCandles);

      // 2. Predict action
      const { action } = await aiAgent.predictAction(stateStr, parseFloat(explorationRate) || 0.2);

      // 3. Step forward (simulate price change outcome)
      const tickWalk = (Math.random() - 0.485) * 0.03; // slight positive drift
      const outcomePrice = price * (1 + tickWalk);
      price = outcomePrice;
      mockCandles.shift();
      mockCandles.push({ open: price, high: price * 1.01, low: price * 0.99, close: price });

      // 4. Calculate P&L outcome & Reinforcement Reward
      let reward = 0;
      let profit = 0;

      if (action === 1) { // BUY
        profit = tickWalk * 100000.00; // Simulated position sizing
        reward = tickWalk > 0 ? 1.0 : -1.2;
      } else if (action === 2) { // SHORT
        profit = -tickWalk * 100000.00;
        reward = tickWalk < 0 ? 1.0 : -1.2;
      } else { // HOLD
        reward = 0.1; // small reward for staying out in high volatility
      }

      if (action !== 0) {
        balance += profit;
        if (profit > 0) wins++;
        else losses++;
      }

      balanceHistory.push(parseFloat(balance.toFixed(2)));

      // 5. Update next state
      const nextMarketData = { change_percent: tickWalk * 100 };
      const nextStateStr = encodeMarketState(nextMarketData, mockCandles);

      // 6. Learn
      await aiAgent.learn(stateStr, action, reward, nextStateStr);
    }

    const totalTrades = wins + losses;
    const winRate = totalTrades > 0 ? Math.round((wins / totalTrades) * 100) : 50;

    // Record backtest result
    await db.run(
      "INSERT INTO ai_backtests (episodes, win_rate, profit_factor, final_balance) VALUES (?, ?, ?, ?)",
      [count, winRate, totalTrades > 0 ? (wins / (losses || 1)) : 1.0, balance]
    );

    res.json({
      success: true,
      winRate,
      finalBalance: balance,
      balanceHistory
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get('/api/scanner', async (req, res) => {
  try {
    const marketPrices = await db.query("SELECT * FROM market_prices ORDER BY ABS(change_percent) DESC");
    
    const breakouts = marketPrices.filter(p => Math.abs(p.change_percent) >= 1.0).slice(0, 5);
    const highVolume = marketPrices.slice(0, 6);
    const strongTrend = marketPrices.filter(p => p.change_percent > 0.3).slice(0, 5);
    const oversold = marketPrices.filter(p => p.change_percent < -0.5).slice(0, 4);

    const topPicks = marketPrices.slice(0, 10).map((item, index) => ({
      rank: index + 1,
      symbol: item.symbol,
      price: item.price,
      change_percent: item.change_percent,
      signal: item.change_percent >= 0 ? 'BUY' : 'SHORT',
      confidence: Math.min(96, Math.max(72, Math.round(92 - index * 2.1))),
      rsi: Math.round(45 + (item.change_percent * 8)),
      trend: item.change_percent >= 0 ? 'Bullish' : 'Bearish'
    }));

    res.json({
      breakouts,
      highVolume,
      strongTrend,
      oversold,
      topPicks
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------- NEWS SENTIMENT AI API -----------------
app.get('/api/news', async (req, res) => {
  try {
    const mockNews = [
      {
        id: 1,
        title: "Reliance Industries Reports Strong Q1 Margin Expansion in Retail & Telecom",
        source: "Economic Times",
        symbol: "RELIANCE",
        timestamp: new Date().toISOString(),
        sentiment: "Positive",
        score: 0.85,
        impact: "High Bullish Impact"
      },
      {
        id: 2,
        title: "RBI Keeps Repo Rate Unchanged; Banking Sector Rallies as Inflation Cools",
        source: "Moneycontrol",
        symbol: "BANK NIFTY",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        sentiment: "Positive",
        score: 0.72,
        impact: "Bullish Impact"
      },
      {
        id: 3,
        title: "TCS Secures $1.2B Multi-Year Cloud Transformation Deal with US Retailer",
        source: "LiveMint",
        symbol: "TCS",
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        sentiment: "Positive",
        score: 0.91,
        impact: "High Bullish Impact"
      },
      {
        id: 4,
        title: "IT Sector Sees Muted Short-Term Spends Amid Global Macro Uncertainties",
        source: "CNBC TV18",
        symbol: "INFY",
        timestamp: new Date(Date.now() - 14400000).toISOString(),
        sentiment: "Negative",
        score: -0.45,
        impact: "Bearish Pullback"
      },
      {
        id: 5,
        title: "HDFC Bank Credit Growth Outpaces Market; Net Interest Margin Stabilizes",
        source: "Business Standard",
        symbol: "HDFCBANK",
        timestamp: new Date(Date.now() - 21600000).toISOString(),
        sentiment: "Positive",
        score: 0.78,
        impact: "Bullish Impact"
      }
    ];

    res.json(mockNews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve the index.html on all route fallbacks (client router integration)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`TradeMaster Full-Stack Server running at http://localhost:${PORT}`);
});
