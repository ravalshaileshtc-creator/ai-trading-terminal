const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'trademaster.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening SQLite database:', err);
  } else {
    console.log('Connected to SQLite database: ' + dbPath);
    initializeTables();
  }
});

// Promisified DB helpers
const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

function initializeTables() {
  db.serialize(async () => {
    // 1. Create tables
    await run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT,
      subscription_tier TEXT DEFAULT 'Free',
      billing_cycle TEXT DEFAULT 'monthly',
      paper_balance REAL DEFAULT 100000.00
    )`);

    await run(`CREATE TABLE IF NOT EXISTS positions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      symbol TEXT,
      type TEXT, -- BUY / SHORT
      entry_price REAL,
      size REAL,
      margin REAL,
      status TEXT DEFAULT 'ACTIVE', -- ACTIVE / CLOSED
      exit_price REAL,
      pnl REAL DEFAULT 0.0,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    await run(`CREATE TABLE IF NOT EXISTS signals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      symbol TEXT,
      strategy_name TEXT,
      category TEXT, -- Trend, Momentum, Breakout, SMC
      type TEXT, -- BUY / SELL
      entry_price REAL,
      t1 REAL,
      t2 REAL,
      t3 REAL,
      sl REAL,
      rr_ratio TEXT,
      is_premium INTEGER, -- 0 or 1
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    await run(`CREATE TABLE IF NOT EXISTS journal (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      symbol TEXT,
      strategy_tag TEXT,
      note TEXT,
      emotion TEXT,
      reflection TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    await run(`CREATE TABLE IF NOT EXISTS market_prices (
      symbol TEXT PRIMARY KEY,
      price REAL,
      change_percent REAL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // AI Engine Schema Tables
    await run(`CREATE TABLE IF NOT EXISTS ai_q_table (
      state_string TEXT,
      action INTEGER,
      q_value REAL DEFAULT 0.0,
      frequency INTEGER DEFAULT 1,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (state_string, action)
    )`);

    await run(`CREATE TABLE IF NOT EXISTS ai_trades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      symbol TEXT,
      state_string TEXT,
      predicted_action INTEGER,
      entry_price REAL,
      exit_price REAL,
      pnl REAL DEFAULT 0.0,
      reward REAL DEFAULT 0.0,
      reward_points INTEGER DEFAULT 0,
      explanation TEXT,
      user_feedback TEXT DEFAULT 'NONE', -- LIKE, DISLIKE, NONE
      status TEXT DEFAULT 'ACTIVE', -- ACTIVE, CLOSED
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    await run(`CREATE TABLE IF NOT EXISTS ai_backtests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      episodes INTEGER,
      win_rate REAL,
      profit_factor REAL,
      final_balance REAL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    console.log('SQLite tables & AI schemas initialized successfully.');

    // DB Migrations for new columns
    try {
      await run("ALTER TABLE ai_trades ADD COLUMN reward_points INTEGER DEFAULT 0");
      console.log('Migration: Added reward_points to ai_trades');
    } catch (e) {
      // Column already exists
    }
    try {
      await run("ALTER TABLE ai_trades ADD COLUMN explanation TEXT");
      console.log('Migration: Added explanation to ai_trades');
    } catch (e) {
      // Column already exists
    }

    // 2. Prepopulate default User
    const user = await get("SELECT * FROM users WHERE id = 1");
    if (!user) {
      await run("INSERT INTO users (id, username, subscription_tier, billing_cycle, paper_balance) VALUES (1, 'trader', 'Free', 'monthly', 100000.00)");
      console.log('Default user (id = 1) created.');
    }

    // 3. Prepopulate default market prices
    const pricesCount = await get("SELECT COUNT(*) as count FROM market_prices");
    if (pricesCount.count === 0) {
      const initialPrices = [
        { symbol: 'NIFTY 50', price: 24350.00, change_percent: 0.45 },
        { symbol: 'BANK NIFTY', price: 52200.00, change_percent: 0.82 },
        { symbol: 'FIN NIFTY', price: 23950.00, change_percent: 0.55 },
        { symbol: 'RELIANCE', price: 2985.00, change_percent: 1.12 },
        { symbol: 'TCS', price: 3920.00, change_percent: -0.65 },
        { symbol: 'INFY', price: 1620.00, change_percent: 1.30 },
        { symbol: 'HDFCBANK', price: 1650.00, change_percent: -0.90 },
        { symbol: 'ICICIBANK', price: 1120.00, change_percent: 0.75 },
        { symbol: 'SBIN', price: 810.00, change_percent: -0.40 },
        { symbol: 'TATAMOTORS', price: 940.00, change_percent: 2.10 },
        { symbol: 'ITC', price: 430.00, change_percent: 0.20 },
        { symbol: 'BHARTIARTL', price: 1420.00, change_percent: 1.50 },
        { symbol: 'LT', price: 3550.00, change_percent: -0.30 },
        { symbol: 'HINDUNILVR', price: 2500.00, change_percent: 0.60 },
        { symbol: 'AXISBANK', price: 1220.00, change_percent: 0.10 },
        { symbol: 'KOTAKBANK', price: 1780.00, change_percent: -0.45 },
        { symbol: 'ADANIENT', price: 3150.00, change_percent: 1.80 },
        { symbol: 'BAJFINANCE', price: 7100.00, change_percent: -1.20 },
        { symbol: 'M&M', price: 2850.00, change_percent: 2.40 },
        { symbol: 'SUNPHARMA', price: 1520.00, change_percent: 0.90 },
        { symbol: 'ASIANPAINT', price: 2900.00, change_percent: -0.75 },
        { symbol: 'MARUTI', price: 12100.00, change_percent: 0.85 },
        { symbol: 'TITAN', price: 3300.00, change_percent: 1.10 },
        { symbol: 'ULTRACEMCO', price: 10400.00, change_percent: -0.20 },
        { symbol: 'WIPRO', price: 490.00, change_percent: 0.40 },
        { symbol: 'TATASTEEL', price: 165.00, change_percent: -1.50 },
        { symbol: 'JSWSTEEL', price: 920.00, change_percent: 0.70 },
        { symbol: 'POWERGRID', price: 310.00, change_percent: 0.15 },
        { symbol: 'NTPC', price: 380.00, change_percent: 1.25 },
        { symbol: 'HCLTECH', price: 1450.00, change_percent: 0.95 },
        { symbol: 'ONGC', price: 270.00, change_percent: -0.80 },
        { symbol: 'ADANIPORTS', price: 1350.00, change_percent: 0.50 },
        { symbol: 'COALINDIA', price: 470.00, change_percent: 1.10 },
        { symbol: 'GRASIM', price: 2500.00, change_percent: -0.40 },
        { symbol: 'BAJAJFINSV', price: 1600.00, change_percent: 0.30 },
        { symbol: 'INDUSINDBK', price: 1400.00, change_percent: -1.15 },
        { symbol: 'HINDALCO', price: 630.00, change_percent: 0.80 },
        { symbol: 'SBILIFE', price: 1450.00, change_percent: 0.25 },
        { symbol: 'BPCL', price: 310.00, change_percent: -0.60 },
        { symbol: 'EICHERMOT', price: 4700.00, change_percent: 1.45 },
        { symbol: 'JIOFIN', price: 350.00, change_percent: 0.90 },
        { symbol: 'HEROMOTOCO', price: 5400.00, change_percent: -0.50 },
        { symbol: 'CIPLA', price: 1500.00, change_percent: 0.65 },
        { symbol: 'TATACONSUM', price: 1100.00, change_percent: 0.35 },
        { symbol: 'APOLLOHOSP', price: 6200.00, change_percent: -0.10 },
        { symbol: 'NESTLEIND', price: 2500.00, change_percent: 0.40 },
        { symbol: 'BRITANNIA', price: 5300.00, change_percent: 1.20 },
        { symbol: 'TECHM', price: 1380.00, change_percent: 0.80 }
      ];

      for (const p of initialPrices) {
        await run("INSERT INTO market_prices (symbol, price, change_percent) VALUES (?, ?, ?)", [p.symbol, p.price, p.change_percent]);
      }
      console.log('Default Indian market prices populated.');
    }

    // 4. Prepopulate 30 technical signals representing requested strategies
    const signalsCount = await get("SELECT COUNT(*) as count FROM signals");
    if (signalsCount.count === 0) {
      const initialSignals = [
        // Trend Category (7)
        { symbol: 'RELIANCE', strategy_name: 'EMA 9/20 Crossover', category: 'Trend', type: 'BUY', entry_price: 1278.00, t1: 1298.00, t2: 1315.00, t3: 1340.00, sl: 1266.00, rr_ratio: '1:3.4', is_premium: 0 },
        { symbol: 'TCS', strategy_name: 'EMA 20/50 Crossover', category: 'Trend', type: 'SELL', entry_price: 3920.00, t1: 3870.00, t2: 3830.00, t3: 3750.00, sl: 3950.00, rr_ratio: '1:2.8', is_premium: 0 },
        { symbol: 'INFY', strategy_name: 'VWAP Pullback', category: 'Trend', type: 'BUY', entry_price: 1618.00, t1: 1640.00, t2: 1660.00, t3: 1690.00, sl: 1604.00, rr_ratio: '1:3.6', is_premium: 0 },
        { symbol: 'SBIN', strategy_name: 'Supertrend Bullish', category: 'Trend', type: 'BUY', entry_price: 810.00, t1: 825.00, t2: 835.00, t3: 850.00, sl: 801.00, rr_ratio: '1:3.3', is_premium: 0 },
        { symbol: 'HDFCBANK', strategy_name: 'ADX Trend Strength', category: 'Trend', type: 'BUY', entry_price: 1650.00, t1: 1675.00, t2: 1695.00, t3: 1720.00, sl: 1632.00, rr_ratio: '1:3.5', is_premium: 0 },
        { symbol: 'TATAMOTORS', strategy_name: 'Trendline Breakout', category: 'Trend', type: 'BUY', entry_price: 938.00, t1: 955.00, t2: 970.00, t3: 990.00, sl: 926.00, rr_ratio: '1:3.8', is_premium: 0 },
        { symbol: 'NIFTY 50', strategy_name: 'Donchian Channel Breakout', category: 'Trend', type: 'BUY', entry_price: 24150.00, t1: 24280.00, t2: 24380.00, t3: 24500.00, sl: 24050.00, rr_ratio: '1:3.1', is_premium: 0 },

        // Momentum Category (6)
        { symbol: 'RELIANCE', strategy_name: 'RSI Momentum Bullish', category: 'Momentum', type: 'BUY', entry_price: 1280.00, t1: 1302.00, t2: 1320.00, t3: 1350.00, sl: 1268.00, rr_ratio: '1:4.1', is_premium: 0 },
        { symbol: 'TCS', strategy_name: 'RSI Bearish Divergence', category: 'Momentum', type: 'SELL', entry_price: 3930.00, t1: 3870.00, t2: 3820.00, t3: 3740.00, sl: 3960.00, rr_ratio: '1:3.2', is_premium: 0 },
        { symbol: 'BANK NIFTY', strategy_name: 'MACD Crossover', category: 'Momentum', type: 'BUY', entry_price: 51800.00, t1: 52100.00, t2: 52400.00, t3: 52900.00, sl: 51550.00, rr_ratio: '1:3.7', is_premium: 0 },
        { symbol: 'INFY', strategy_name: 'Stochastic RSI Oversold', category: 'Momentum', type: 'BUY', entry_price: 1615.00, t1: 1638.00, t2: 1655.00, t3: 1680.00, sl: 1601.00, rr_ratio: '1:3.4', is_premium: 0 },
        { symbol: 'ICICIBANK', strategy_name: 'Rate of Change (ROC)', category: 'Momentum', type: 'BUY', entry_price: 1120.00, t1: 1140.00, t2: 1155.00, t3: 1175.00, sl: 1110.00, rr_ratio: '1:3.6', is_premium: 0 },
        { symbol: 'SBIN', strategy_name: 'CCI Trend Trigger', category: 'Momentum', type: 'SELL', entry_price: 812.00, t1: 800.00, t2: 790.00, t3: 775.00, sl: 820.00, rr_ratio: '1:3.3', is_premium: 0 },

        // Breakout Category (6)
        { symbol: 'TATAMOTORS', strategy_name: 'Opening Range Breakout (ORB)', category: 'Breakout', type: 'SELL', entry_price: 940.00, t1: 920.00, t2: 905.00, t3: 880.00, sl: 952.00, rr_ratio: '1:2.1', is_premium: 0 },
        { symbol: 'RELIANCE', strategy_name: 'Volume Breakout', category: 'Breakout', type: 'BUY', entry_price: 1282.00, t1: 1305.00, t2: 1325.00, t3: 1355.00, sl: 1270.00, rr_ratio: '1:3.0', is_premium: 0 },
        { symbol: 'HDFCBANK', strategy_name: 'Support/Resistance Breakout', category: 'Breakout', type: 'BUY', entry_price: 1652.00, t1: 1678.00, t2: 1695.00, t3: 1720.00, sl: 1638.00, rr_ratio: '1:3.5', is_premium: 0 },
        { symbol: 'NIFTY 50', strategy_name: 'CPR Breakout', category: 'Breakout', type: 'BUY', entry_price: 24160.00, t1: 24280.00, t2: 24380.00, t3: 24520.00, sl: 24060.00, rr_ratio: '1:3.8', is_premium: 0 },
        { symbol: 'BANK NIFTY', strategy_name: 'Bollinger Bands Squeeze', category: 'Breakout', type: 'BUY', entry_price: 51850.00, t1: 52150.00, t2: 52450.00, t3: 52950.00, sl: 51600.00, rr_ratio: '1:3.6', is_premium: 0 },
        { symbol: 'FIN NIFTY', strategy_name: 'Gap Breakout', category: 'Breakout', type: 'BUY', entry_price: 23660.00, t1: 23780.00, t2: 23880.00, t3: 24050.00, sl: 23550.00, rr_ratio: '1:3.7', is_premium: 0 },

        // Smart Money Concepts (SMC) (11) - All Premium
        { symbol: 'NIFTY 50', strategy_name: 'Bullish Order Block Rejection', category: 'SMC', type: 'BUY', entry_price: 24150.00, t1: 24280.00, t2: 24380.00, t3: 24500.00, sl: 24050.00, rr_ratio: '1:3.4', is_premium: 1 },
        { symbol: 'BANK NIFTY', strategy_name: 'Bearish Order Block Rejection', category: 'SMC', type: 'SELL', entry_price: 51800.00, t1: 51300.00, t2: 51000.00, t3: 50500.00, sl: 52150.00, rr_ratio: '1:3.5', is_premium: 1 },
        { symbol: 'RELIANCE', strategy_name: 'Fair Value Gap (FVG) Fill', category: 'SMC', type: 'BUY', entry_price: 1278.00, t1: 1298.00, t2: 1315.00, t3: 1340.00, sl: 1266.00, rr_ratio: '1:4.0', is_premium: 1 },
        { symbol: 'TCS', strategy_name: 'Liquidity Grab (Sellside)', category: 'SMC', type: 'BUY', entry_price: 3915.00, t1: 3965.00, t2: 4000.00, t3: 4080.00, sl: 3880.00, rr_ratio: '1:4.2', is_premium: 1 },
        { symbol: 'HDFCBANK', strategy_name: 'Liquidity Grab (Buyside)', category: 'SMC', type: 'SELL', entry_price: 1650.00, t1: 1625.00, t2: 1605.00, t3: 1575.00, sl: 1668.00, rr_ratio: '1:3.7', is_premium: 1 },
        { symbol: 'INFY', strategy_name: 'Break of Structure (BOS)', category: 'SMC', type: 'BUY', entry_price: 1620.00, t1: 1650.00, t2: 1680.00, t3: 1720.00, sl: 1600.00, rr_ratio: '1:3.2', is_premium: 1 },
        { symbol: 'SBIN', strategy_name: 'Change of Character (ChOCh)', category: 'SMC', type: 'BUY', entry_price: 810.00, t1: 825.00, t2: 835.00, t3: 855.00, sl: 801.00, rr_ratio: '1:3.9', is_premium: 1 },
        { symbol: 'TATAMOTORS', strategy_name: 'Premium Discount Mitigation', category: 'SMC', type: 'BUY', entry_price: 940.00, t1: 960.00, t2: 975.00, t3: 995.00, sl: 928.00, rr_ratio: '1:3.8', is_premium: 1 },
        { symbol: 'NIFTY 50', strategy_name: 'Mitigation Block Mitigation', category: 'SMC', type: 'SELL', entry_price: 24200.00, t1: 24050.00, t2: 23920.00, t3: 23750.00, sl: 24310.00, rr_ratio: '1:3.7', is_premium: 1 },
        { symbol: 'BANK NIFTY', strategy_name: 'Order Flow Reversal', category: 'SMC', type: 'BUY', entry_price: 51750.00, t1: 52100.00, t2: 52350.00, t3: 52750.00, sl: 51500.00, rr_ratio: '1:3.6', is_premium: 1 },
        { symbol: 'RELIANCE', strategy_name: 'High Time Frame POI Tap', category: 'SMC', type: 'BUY', entry_price: 1278.00, t1: 1298.00, t2: 1315.00, t3: 1340.00, sl: 1266.00, rr_ratio: '1:3.8', is_premium: 1.0 }
      ];

      for (const s of initialSignals) {
        await run(`INSERT INTO signals 
          (symbol, strategy_name, category, type, entry_price, t1, t2, t3, sl, rr_ratio, is_premium) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
          [s.symbol, s.strategy_name, s.category, s.type, s.entry_price, s.t1, s.t2, s.t3, s.sl, s.rr_ratio, s.is_premium]
        );
      }
    } else {
      // Auto-migrate outdated post-split RELIANCE signals (> 2000) to current price levels
      await run("UPDATE signals SET entry_price = 1278.00, sl = 1266.00, t1 = 1298.00, t2 = 1315.00, t3 = 1340.00 WHERE symbol = 'RELIANCE' AND entry_price > 2000");
    }
    console.log('30 default technical signals pre-populated.');
  });
}

module.exports = {
  db,
  query,
  run,
  get
};
