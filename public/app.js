// Global Application State
const state = {
  currentLanguage: 'EN',
  activeView: 'dashboard',
  theme: 'dark',
  user: {
    subscription_tier: 'Free',
    paper_balance: 100000.00
  },
  marketPrices: {},
  recentAiTrades: [],
  activePositions: [],
  closedLedger: [],
  signals: [],
  journals: [],
  notifications: [],
  orderForm: {
    type: 'BUY',       // BUY or SHORT
    orderType: 'MARKET', // MARKET or LIMIT
    symbol: 'RELIANCE'
  },
  selectedTimeframe: '1m',
  // Local candle history storage for the chart
};

// Global Safe Icon creator
function safeCreateIcons() {
  if (typeof lucide !== 'undefined' && lucide.createIcons) {
    try {
      lucide.createIcons();
    } catch (e) {
      console.warn("Lucide icon generation failed:", e);
    }
  }
}

// ----------------- TRANSLATION DICTIONARY -----------------
const i18n = {
  EN: {
    nav_dashboard: "Dashboard",
    nav_signals: "Signals",
    nav_trade: "Trade",
    nav_journal: "Journal",
    nav_subscription: "Go Pro",
    nav_admin: "Admin",
    sim_env: "Simulated Environment",
    paper_trading: "Paper Trading",
    curr_balance: "Current Balance",
    new_order: "New Order",
    quick_nav: "Quick Navigation",
    mental_radar: "Trader Mood Analytics",
    todays_signals: "Today's Top Signals",
    view_all: "View All Signals",
    live_market_watch: "Live Market Watch",
    signals_engine: "Technical Signals Engine",
    paper_mode: "Paper Trading Mode",
    active_positions: "Active Positions",
    available_margin: "Available Margin",
    buy_long: "BUY / LONG",
    sell_short: "SELL / SHORT",
    trade_ledger: "Trade History Ledger",
    log_trade: "Log Trade Reflection",
    emotion_state: "Emotional State",
    disciplined: "Disciplined",
    fearful: "Fearful",
    greedy: "Greedy",
    journal_logs: "Reflections & Journal Logs",
    elevate_edge: "Elevate Your Trading Edge",
    choose_plan: "Choose a plan that fits your professional trading journey. Unlock institutional-grade signals and advanced analytics.",
    nav_ai: "AI Agent",
    ai_agent_dashboard: "Self-Learning AI Trading Engine"
  },
  HI: {
    nav_dashboard: "डैशबोर्ड",
    nav_signals: "सिग्नल्स",
    nav_trade: "ट्रेड",
    nav_journal: "जर्नल",
    nav_subscription: "अपग्रेड करें",
    nav_admin: "एडमिन",
    sim_env: "सिम्युलेटेड वातावरण",
    paper_trading: "पेपर ट्रेडिंग",
    curr_balance: "वर्तमान बैलेंस",
    new_order: "नया ऑर्डर",
    quick_nav: "त्वरित नेविगेशन",
    mental_radar: "ट्रेडर मानसिक स्थिति",
    todays_signals: "आज के मुख्य सिग्नल्स",
    view_all: "सभी सिग्नल्स देखें",
    live_market_watch: "लाइव मार्केट वॉच",
    signals_engine: "तकनीकी सिग्नल्स इंजन",
    paper_mode: "पेपर ट्रेडिंग मोड",
    active_positions: "सक्रिय पोजीशंस",
    available_margin: "उपलब्ध मार्जिन",
    buy_long: "खरीदें / लॉन्ग",
    sell_short: "बेचें / शॉर्ट",
    trade_ledger: "ट्रेड इतिहास लेजर",
    log_trade: "ट्रेड रिफ्लेक्शन दर्ज करें",
    emotion_state: "भावना की स्थिति",
    disciplined: "अनुशासित",
    fearful: "भयभीत",
    greedy: "लालची",
    journal_logs: "रिफ्लेक्शंस और जर्नल लॉग्स",
    elevate_edge: "अपने ट्रेडिंग मुनाफे को बढ़ाएं",
    choose_plan: "अपनी पेशेवर ट्रेडिंग यात्रा के लिए सही प्लान चुनें। संस्थागत स्तर के सिग्नल्स और उन्नत विश्लेषण अनलॉक करें।",
    nav_ai: "एआई एजेंट",
    ai_agent_dashboard: "सेल्फ-लर्निंग एआई ट्रेडिंग इंजन"
  }
};

// Toggle Language translation
function translateApp(lang) {
  state.currentLanguage = lang;
  document.getElementById('language-label').innerText = lang;
  
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (i18n[lang] && i18n[lang][key]) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.setAttribute('placeholder', i18n[lang][key]);
      } else {
        el.innerText = i18n[lang][key];
      }
    }
  });
}

// ----------------- DYNAMIC TOAST SYSTEM -----------------
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  // Styling based on toast alert type
  let bgClass = 'bg-surface-container border-outline-variant';
  let iconName = 'info';
  let iconColor = 'text-primary';

  if (type === 'success') {
    bgClass = 'bg-surface-container border-secondary/40 shadow-secondary/5';
    iconName = 'check-circle';
    iconColor = 'text-secondary';
  } else if (type === 'warning') {
    bgClass = 'bg-surface-container border-tertiary-container/40 shadow-tertiary-container/5';
    iconName = 'alert-triangle';
    iconColor = 'text-tertiary-container';
  } else if (type === 'error') {
    bgClass = 'bg-surface-container border-error/40 shadow-error/5';
    iconName = 'alert-circle';
    iconColor = 'text-error';
  }

  toast.className = `flex items-center gap-3 p-4 rounded-xl border shadow-lg ${bgClass} fade-in transform transition-all duration-300 max-w-full`;
  toast.innerHTML = `
    <div class="${iconColor} shrink-0">
      <i data-lucide="${iconName}" class="w-5 h-5"></i>
    </div>
    <div class="flex-grow">
      <p class="text-xs font-semibold text-on-surface leading-normal">${message}</p>
    </div>
    <button class="text-on-surface-variant hover:text-on-surface" onclick="this.parentElement.remove()">
      <i data-lucide="x" class="w-4 h-4"></i>
    </button>
  `;

  container.appendChild(toast);
  safeCreateIcons();

  // Auto remove after 5 seconds
  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-[-6px]');
    setTimeout(() => toast.remove(), 300);
  }, 5000);
}

// ----------------- TAB ROUTING SYSTEM -----------------
function switchView(viewName) {
  state.activeView = viewName;

  // Update URL hash state
  window.history.pushState(null, null, `#${viewName}`);

  // Hide all sections
  document.querySelectorAll('.view-section').forEach(section => {
    section.classList.add('hidden');
    section.classList.remove('active');
  });

  // Show selected section
  const activeSection = document.getElementById(`view-${viewName}`);
  if (activeSection) {
    activeSection.classList.remove('hidden');
    activeSection.classList.add('active');
  }

  // Update navigation indicators in header
  document.querySelectorAll('.nav-tab-btn').forEach(btn => {
    const target = btn.getAttribute('data-view-target');
    const indicator = btn.querySelector('.nav-indicator');
    if (target === viewName) {
      btn.classList.add('text-primary');
      btn.classList.remove('text-on-surface-variant');
      if (indicator) indicator.classList.remove('hidden');
    } else {
      btn.classList.remove('text-primary');
      btn.classList.add('text-on-surface-variant');
      if (indicator) indicator.classList.add('hidden');
    }
  });

  // Update mobile bottom nav highlight
  document.querySelectorAll('nav.md\\:hidden button').forEach(btn => {
    const target = btn.getAttribute('data-view-target');
    if (target === viewName) {
      btn.classList.add('text-primary');
      btn.classList.remove('text-on-surface-variant');
      // For middle trade button
      if (viewName === 'trade') {
        btn.classList.add('bg-primary', 'text-white');
      }
    } else {
      btn.classList.remove('text-primary');
      btn.classList.add('text-on-surface-variant');
      if (target === 'trade') {
        btn.classList.remove('bg-primary', 'text-white');
      }
    }
  });

  // Re-render specifics if needed
  if (viewName === 'dashboard') {
    initTradingViewWidget();
    renderDashboardMoodStats();
  } else if (viewName === 'signals') {
    loadSignals();
    renderSignalsGrid();
  } else if (viewName === 'scanner') {
    loadScannerData();
  } else if (viewName === 'news') {
    loadNewsData();
  } else if (viewName === 'trade') {
    resizeChartCanvas();
    updateAICopilot();
  } else if (viewName === 'ai') {
    resizeAICanvases();
    pollAPI();
  }
}

// Initialize layout event links
function setupTabRouting() {
  document.querySelectorAll('[data-view-target]').forEach(element => {
    element.addEventListener('click', (e) => {
      e.preventDefault();
      const target = element.getAttribute('data-view-target');
      switchView(target);
      // Close sidebar if open on mobile
      toggleSidebar(false);
    });
  });

  // Read URL Hash route
  const hash = window.location.hash.replace('#', '');
  if (hash && ['dashboard', 'signals', 'trade', 'journal', 'subscription', 'admin', 'ai'].includes(hash)) {
    switchView(hash);
  } else {
    switchView('dashboard');
  }
}

// Mobile sidebar toggle control
function toggleSidebar(open) {
  const sidebar = document.getElementById('mobile-sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  if (open) {
    sidebar.classList.remove('-translate-x-full');
    overlay.classList.remove('hidden');
  } else {
    sidebar.classList.add('-translate-x-full');
    overlay.classList.add('hidden');
  }
}

// ----------------- LIGHT/DARK THEME TOGGLE -----------------
function setupThemeToggle() {
  const themeBtn = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');
  
  // Set default theme from HTML class
  state.theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  updateThemeUI();

  themeBtn.addEventListener('click', () => {
    if (state.theme === 'dark') {
      state.theme = 'light';
      document.documentElement.classList.remove('dark');
    } else {
      state.theme = 'dark';
      document.documentElement.classList.add('dark');
    }
    updateThemeUI();
    initTradingViewWidget(); // redraw TV widget with proper theme
  });
}

function updateThemeUI() {
  const themeIcon = document.getElementById('theme-icon');
  if (state.theme === 'dark') {
    themeIcon.setAttribute('data-lucide', 'sun');
  } else {
    themeIcon.setAttribute('data-lucide', 'moon');
  }
  safeCreateIcons();
}

// ----------------- TRADINGVIEW WIDGETS -----------------
let tvWidgetDashboard = null;
let tvWidgetTrade = null;

function getTradingViewSymbol(rawSymbol) {
  if (!rawSymbol) return 'NSE:RELIANCE';
  
  const map = {
    'NIFTY 50': 'NSE:NIFTY',
    'BANK NIFTY': 'NSE:BANKNIFTY',
    'FIN NIFTY': 'NSE:CNXFINANCE'
  };

  if (map[rawSymbol]) return map[rawSymbol];
  if (rawSymbol.includes('/')) return `BITSTAMP:${rawSymbol.replace('/', '')}`;
  
  const cleanSym = rawSymbol.replace('NSE:', '').replace('BSE:', '').trim();
  return `NSE:${cleanSym}`;
}

let currentChartProvider = 'tradingview';

function switchChartProvider(provider) {
  currentChartProvider = provider;
  const container = document.getElementById('tradingview-trade-widget');
  if (!container) return;

  const currentSym = state.orderForm ? (state.orderForm.symbol || 'RELIANCE') : 'RELIANCE';

  if (provider === 'gocharting') {
    const cleanSym = currentSym.replace('NSE:', '').replace('BSE:', '').replace('/', '').trim();
    container.innerHTML = `
      <iframe 
        src="https://gocharting.com/terminal?ticker=NSE:${encodeURIComponent(cleanSym)}" 
        style="width: 100%; height: 100%; border: 0; outline: none; display: block;"
        allowtransparency="true" 
        scrolling="no" 
        allowfullscreen>
      </iframe>
    `;
    showToast(`Switched to GoCharting Terminal (Order Flow & Vol Profile) for ${cleanSym}!`, "info");
  } else {
    initTradingViewWidget();
    showToast(`Switched to TradingView Pro Terminal!`, "info");
  }
}

let currentChartTimeframe = 'D';

function changeChartTimeframe(tf) {
  currentChartTimeframe = tf;

  const buttons = document.querySelectorAll('.tv-tf-btn');
  buttons.forEach(btn => {
    btn.className = "tv-tf-btn px-2.5 py-1 rounded hover:bg-surface-variant/40 text-on-surface-variant hover:text-on-surface text-[10px] font-bold transition-all";
  });

  const labelMap = { '1': '1m', '5': '5m', '15': '15m', '60': '1h', 'D': '1D' };
  const targetLabel = labelMap[tf] || '1D';

  buttons.forEach(btn => {
    if (btn.innerText.trim() === targetLabel) {
      btn.className = "tv-tf-btn px-2.5 py-1 rounded bg-primary text-white text-[10px] font-bold transition-all";
    }
  });

  initTradingViewWidget();
}

function initTradingViewWidget() {
  const dashContainer = document.getElementById('tradingview-dashboard-widget');
  const tradeContainer = document.getElementById('tradingview-trade-widget');
  
  if (!dashContainer && !tradeContainer) return;

  const currentSym = state.orderForm ? (state.orderForm.symbol || 'RELIANCE') : 'RELIANCE';
  const symbol = getTradingViewSymbol(currentSym);
  const theme = state.theme || 'dark';

  const createIframeHtml = (sym, interval = 'D') => `
    <iframe 
      src="https://www.tradingview-widget.com/embed-widget/advanced-chart/?symbol=${encodeURIComponent(sym)}&theme=${theme}&interval=${interval}&timezone=Asia%2FKolkata&style=1&locale=en&enable_publishing=false&hide_top_toolbar=false&hide_legend=false&save_image=true" 
      style="width: 100%; height: 100%; border: 0; outline: none; display: block;"
      allowtransparency="true" 
      scrolling="no" 
      allowfullscreen>
    </iframe>
  `;

  if (dashContainer) {
    dashContainer.innerHTML = createIframeHtml(symbol, '5');
  }

  if (tradeContainer) {
    tradeContainer.innerHTML = createIframeHtml(symbol, currentChartTimeframe);
  }
}

// ----------------- CUSTOM CANDLESTICK CHART -----------------
let chartCanvas = null;
let chartCtx = null;
const chartState = {
  candles: [],
  maxCandles: 40,
  lastPrice: 0
};

function setupChart() {
  chartCanvas = document.getElementById('interactive-candlestick-chart');
  if (!chartCanvas) return;
  chartCtx = chartCanvas.getContext('2d');
  
  // Create resize listener
  window.addEventListener('resize', resizeChartCanvas);
  resizeChartCanvas();

  // Populate initial mock candles
  generateMockCandles();
}

function resizeChartCanvas() {
  if (!chartCanvas) return;
  const parent = chartCanvas.parentElement;
  chartCanvas.width = parent.clientWidth * window.devicePixelRatio;
  chartCanvas.height = parent.clientHeight * window.devicePixelRatio;
  chartCtx.scale(window.devicePixelRatio, window.devicePixelRatio);
  drawCandlestickChart();
}

function generateMockCandles() {
  chartState.candles = [];
  const sym = state.orderForm ? (state.orderForm.symbol || 'RELIANCE') : 'RELIANCE';
  let basePrice = 1270.0;
  
  if (state.marketPrices[sym] && state.marketPrices[sym].price) {
    basePrice = state.marketPrices[sym].price;
  } else {
    // Smart price baselines per symbol to prevent initial load scale distortions
    if (sym === 'RELIANCE') basePrice = 1270.0;
    else if (sym === 'TCS') basePrice = 3920.0;
    else if (sym === 'INFY') basePrice = 1618.0;
    else if (sym.includes('BANK')) basePrice = 51800.0;
    else if (sym.includes('NIFTY')) basePrice = 24000.0;
    else if (sym.includes('BTC')) basePrice = 64000.0;
    else basePrice = 1000.0;
  }

  for (let i = 0; i < chartState.maxCandles; i++) {
    const change = (Math.random() - 0.49) * (basePrice * 0.003);
    const open = basePrice;
    const close = basePrice + change;
    const high = Math.max(open, close) + (Math.random() * (basePrice * 0.0015));
    const low = Math.min(open, close) - (Math.random() * (basePrice * 0.0015));
    
    chartState.candles.push({
      open,
      high,
      low,
      close,
      volume: Math.random() * 200 + 50
    });
    basePrice = close;
  }
  chartState.lastPrice = basePrice;
}

// Ticks the last candle on the chart
function updateChartLivePrice(price) {
  if (!price || isNaN(price)) return;
  
  if (chartState.candles.length === 0) {
    generateMockCandles();
    return;
  }

  const firstCandle = chartState.candles[0];
  // Auto-center chart candles if scale discrepancy exceeds 15% (e.g., initial load transition)
  if (firstCandle && Math.abs(firstCandle.open - price) / firstCandle.open > 0.15) {
    generateMockCandles();
  }
  
  const lastCandle = chartState.candles[chartState.candles.length - 1];
  
  // Real-time update logic
  lastCandle.close = price;
  if (price > lastCandle.high) lastCandle.high = price;
  if (price < lastCandle.low) lastCandle.low = price;
  
  chartState.lastPrice = price;
  drawCandlestickChart();
}

// Simulate periodic new candle creation (every 15 seconds)
setInterval(() => {
  if (state.activeView !== 'trade' || chartState.candles.length === 0) return;
  
  const lastCandle = chartState.candles[chartState.candles.length - 1];
  const open = lastCandle.close;
  
  chartState.candles.shift(); // remove oldest
  chartState.candles.push({
    open,
    high: open,
    low: open,
    close: open,
    volume: Math.random() * 200 + 50
  });
}, 15000);

function drawCandlestickChart() {
  if (!chartCanvas || !chartCtx || chartState.candles.length === 0) return;

  const width = chartCanvas.width / window.devicePixelRatio;
  const height = chartCanvas.height / window.devicePixelRatio;

  // Clear canvas
  chartCtx.clearRect(0, 0, width, height);

  // Background grids
  chartCtx.strokeStyle = state.theme === 'dark' ? '#22272e' : '#f1f5f9';
  chartCtx.lineWidth = 1;
  const gridRows = 5;
  for (let i = 1; i < gridRows; i++) {
    const y = (height / gridRows) * i;
    chartCtx.beginPath();
    chartCtx.moveTo(0, y);
    chartCtx.lineTo(width, y);
    chartCtx.stroke();
  }

  // Find min/max values
  let maxVal = -Infinity;
  let minVal = Infinity;
  for (const c of chartState.candles) {
    if (c.high > maxVal) maxVal = c.high;
    if (c.low < minVal) minVal = c.low;
  }

  // Margin buffer
  const spread = maxVal - minVal;
  maxVal += spread * 0.05;
  minVal -= spread * 0.05;

  const priceToY = (price) => {
    return height - ((price - minVal) / (maxVal - minVal)) * (height - 30) - 15;
  };

  // Draw candles
  const paddingRight = 60;
  const chartWidth = width - paddingRight;
  const numCandles = chartState.candles.length;
  const candleWidth = (chartWidth / numCandles) * 0.65;
  const candleGap = (chartWidth / numCandles) * 0.35;
  const startX = 10;

  for (let i = 0; i < numCandles; i++) {
    const c = chartState.candles[i];
    const isGreen = c.close >= c.open;
    const color = isGreen ? '#00c853' : '#f08f0a';

    const x = startX + i * (candleWidth + candleGap);
    const yOpen = priceToY(c.open);
    const yClose = priceToY(c.close);
    const yHigh = priceToY(c.high);
    const yLow = priceToY(c.low);

    // Draw wick line
    chartCtx.strokeStyle = color;
    chartCtx.lineWidth = 1.5;
    chartCtx.beginPath();
    chartCtx.moveTo(x + candleWidth / 2, yHigh);
    chartCtx.lineTo(x + candleWidth / 2, yLow);
    chartCtx.stroke();

    // Draw body block
    chartCtx.fillStyle = color;
    const bodyHeight = Math.abs(yClose - yOpen) || 1; // min 1px height
    chartCtx.fillRect(x, Math.min(yOpen, yClose), candleWidth, bodyHeight);
  }

  // Draw current live price line
  const currentPriceY = priceToY(chartState.lastPrice);
  chartCtx.strokeStyle = '#00b0ff';
  chartCtx.lineWidth = 1;
  chartCtx.setLineDash([4, 4]);
  chartCtx.beginPath();
  chartCtx.moveTo(0, currentPriceY);
  chartCtx.lineTo(chartWidth, currentPriceY);
  chartCtx.stroke();
  chartCtx.setLineDash([]); // Reset

  // Price box marker on the right
  chartCtx.fillStyle = '#00b0ff';
  chartCtx.fillRect(chartWidth, currentPriceY - 10, paddingRight, 20);
  chartCtx.fillStyle = '#ffffff';
  chartCtx.font = 'bold 10px JetBrains Mono';
  chartCtx.textAlign = 'center';
  chartCtx.fillText(chartState.lastPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}), chartWidth + paddingRight / 2, currentPriceY + 3);
}

// ----------------- SYNC AND POLLING LAYER -----------------
let syncInterval = null;
let recentNotificationIds = new Set();

async function pollAPI() {
  try {
    // 1. Fetch Market Prices
    const mRes = await fetch('/api/market');
    const prices = await mRes.json();
    const oldPrices = { ...state.marketPrices };

    prices.forEach(p => {
      state.marketPrices[p.symbol] = p;
    });

    // Dynamically populate dropdown selectors with intraday flags
    populateSymbolDropdowns();

    // 2. Fetch User Portfolio (Balance & Positions)
    const pRes = await fetch('/api/portfolio');
    const portfolio = await pRes.json();
    state.user.paper_balance = portfolio.balance;
    state.user.subscription_tier = portfolio.subscription_tier;
    state.activePositions = portfolio.activePositions;
    state.closedLedger = portfolio.closedLedger;

    // 3. Fetch Broadcast System Notifications
    const bRes = await fetch('/api/broadcasts');
    const broadcasts = await bRes.json();
    
    // Check for new broadcasts to show as Toast (ignoring all pre-existing on boot)
    const isFirstNotificationPoll = (recentNotificationIds.size === 0);
    broadcasts.forEach(b => {
      if (!recentNotificationIds.has(b.id)) {
        recentNotificationIds.add(b.id);
        if (!isFirstNotificationPoll) {
          showToast(b.message, b.type);
        }
      }
    });

    // Update UI elements
    updateMarketUI(oldPrices);
    updatePortfolioUI();
    
    // Update live visualizer values
    const currentSymbol = state.orderForm.symbol;
    if (state.marketPrices[currentSymbol]) {
      const livePrice = state.marketPrices[currentSymbol].price;
      const liveChange = state.marketPrices[currentSymbol].change_percent;
      
      const currencySymbol = '₹';
      document.getElementById('trade-live-price').innerText = `${currencySymbol}${livePrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
      document.getElementById('trade-live-change').innerText = `${liveChange >= 0 ? '+' : ''}${liveChange.toFixed(2)}%`;
      document.getElementById('trade-live-change').className = `font-data-mono text-[11px] ${liveChange >= 0 ? 'text-secondary' : 'text-error'}`;
      
      // Order buttons pricing preview
      document.getElementById('order-btn-buy-price').innerText = `Price: ${currencySymbol}${livePrice.toFixed(2)}`;
      document.getElementById('order-btn-sell-price').innerText = `Price: ${currencySymbol}${livePrice.toFixed(2)}`;

      // Update Chart canvas
      updateChartLivePrice(livePrice);
    }

    // 4. Poll AI stats or top picks depending on active view
    if (state.activeView === 'ai' || state.activeView === 'signals') {
      await pollAIStats();
    } else if (state.activeView === 'dashboard') {
      await pollAITopPicks();
    }
    
    // 5. Always update AI Copilot card in Trade view
    if (state.activeView === 'trade') {
      updateAICopilot();
    }

  } catch (err) {
    console.error("API Polling connection error:", err);
  }
}

function startSync() {
  pollAPI();
  // Poll every 2 seconds
  syncInterval = setInterval(pollAPI, 2000);
}

// ----------------- UI UPDATES AND RENDERERS -----------------

let dropdownsPopulated = false;
function populateSymbolDropdowns() {
  if (dropdownsPopulated) return;
  
  const tradeSelect = document.getElementById('trade-symbol-selector');
  const adminPriceSelect = document.getElementById('admin-override-symbol');
  const adminSigSelect = document.getElementById('admin-sig-symbol');
  
  const symbols = Object.keys(state.marketPrices).sort();
  if (symbols.length === 0) return;
  
  const createOptions = (selectEl) => {
    if (!selectEl) return;
    const prevVal = selectEl.value;
    selectEl.innerHTML = '';
    symbols.forEach(sym => {
      const isIndex = ['NIFTY 50', 'BANK NIFTY', 'FIN NIFTY'].includes(sym);
      const suffix = isIndex ? ' (Index)' : ' (Intraday MIS 5x)';
      
      const opt = document.createElement('option');
      opt.value = sym;
      opt.innerText = sym + suffix;
      selectEl.appendChild(opt);
    });
    if (prevVal && symbols.includes(prevVal)) {
      selectEl.value = prevVal;
    }
  };

  createOptions(tradeSelect);
  createOptions(adminPriceSelect);
  createOptions(adminSigSelect);
  
  dropdownsPopulated = true;
}

// Update pricing and ticker feeds
function updateMarketUI(oldPrices) {
  // Update scrolling ticker
  const ticker = document.getElementById('scrolling-ticker');
  if (ticker) {
    let tickerHtml = '';
    const symbols = Object.keys(state.marketPrices);
    // Double listing to support loop scrolling
    const list = [...symbols, ...symbols];
    list.forEach(symbol => {
      const data = state.marketPrices[symbol];
      const isGreen = data.change_percent >= 0;
      const glowClass = isGreen ? 'text-secondary' : 'text-error';
      const currencySymbol = '₹';
      tickerHtml += `
        <span class="font-data-mono text-xs flex items-center gap-2">
          <span class="text-on-surface-variant font-bold">${symbol}</span>
          <span class="${glowClass} font-semibold">${currencySymbol}${data.price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
          <span class="${isGreen ? 'text-secondary' : 'text-error'} text-[10px]">${isGreen ? '+' : ''}${data.change_percent.toFixed(2)}%</span>
        </span>
      `;
    });
    ticker.innerHTML = tickerHtml;
  }

  // Update Top Gainers & Losers on Dashboard
  const gainersContainer = document.getElementById('dash-top-gainers');
  const losersContainer = document.getElementById('dash-top-losers');
  if (gainersContainer && losersContainer) {
    const list = Object.values(state.marketPrices);
    
    // Sort for Gainers (highest change first)
    const sortedGainers = [...list].sort((a, b) => b.change_percent - a.change_percent).slice(0, 4);
    
    // Sort for Losers (lowest change first)
    const sortedLosers = [...list].sort((a, b) => a.change_percent - b.change_percent).slice(0, 4);
    
    const currencySymbol = '₹';

    gainersContainer.innerHTML = sortedGainers.map(item => `
      <div class="flex justify-between items-center bg-secondary/5 border border-secondary/10 px-2 py-1 rounded-lg">
        <span class="text-on-surface font-semibold text-[10px]">${item.symbol}</span>
        <div class="text-right">
          <div class="text-on-surface text-[9px] font-bold">${currencySymbol}${item.price.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1})}</div>
          <div class="text-secondary text-[8px] font-extrabold">+${item.change_percent.toFixed(2)}%</div>
        </div>
      </div>
    `).join('');

    losersContainer.innerHTML = sortedLosers.map(item => `
      <div class="flex justify-between items-center bg-error/5 border border-error/10 px-2 py-1 rounded-lg">
        <span class="text-on-surface font-semibold text-[10px]">${item.symbol}</span>
        <div class="text-right">
          <div class="text-on-surface text-[9px] font-bold">${currencySymbol}${item.price.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1})}</div>
          <div class="text-error text-[8px] font-extrabold">${item.change_percent.toFixed(2)}%</div>
        </div>
      </div>
    `).join('');
  }

  // Update Ticker Selector on Order Form if needed
  updateOrderEstimates();
}

// Portfolio & Ledger lists renderer
function updatePortfolioUI() {
  // Balance displays
  const formattedBalance = `₹${state.user.paper_balance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  document.getElementById('dash-paper-balance').innerText = formattedBalance;
  document.getElementById('trade-paper-balance').innerText = formattedBalance;

  // Header tier name
  document.getElementById('header-tier-name').innerText = state.user.subscription_tier;
  const freeBtn = document.getElementById('subs-free-btn');
  if (freeBtn) {
    freeBtn.innerText = state.user.subscription_tier === 'Free' ? 'Current Plan' : 'Standard Free';
    freeBtn.disabled = state.user.subscription_tier === 'Free';
  }
  const proBtn = document.getElementById('subs-pro-btn');
  if (proBtn) {
    proBtn.innerText = state.user.subscription_tier === 'Pro' ? 'Current Plan' : 'Upgrade to Pro';
    proBtn.disabled = state.user.subscription_tier === 'Pro';
  }
  const primeBtn = document.getElementById('subs-prime-btn');
  if (primeBtn) {
    primeBtn.innerText = state.user.subscription_tier === 'Prime' ? 'Current Plan' : 'Upgrade to Prime';
    primeBtn.disabled = state.user.subscription_tier === 'Prime';
  }

  // Today's total stats
  let totalPnl = 0;
  state.activePositions.forEach(p => {
    totalPnl += p.pnl;
  });
  const pnlEl = document.getElementById('portfolio-today-pnl');
  pnlEl.innerText = `${totalPnl >= 0 ? '+' : ''}₹${totalPnl.toFixed(2)} active P&L`;
  pnlEl.className = `font-semibold ${totalPnl >= 0 ? 'text-secondary' : 'text-error'}`;
  
  document.getElementById('portfolio-total-positions').innerText = `${state.activePositions.length} Active Trades`;
  document.getElementById('active-positions-count').innerText = `${state.activePositions.length} Active`;

  // Active Positions Table
  const tbody = document.getElementById('active-positions-tbody');
  if (tbody) {
    if (state.activePositions.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="p-6 text-center text-on-surface-variant font-body-base text-xs">No active trading positions.</td>
        </tr>
      `;
    } else {
      tbody.innerHTML = state.activePositions.map(pos => {
        const isGreen = pos.pnl >= 0;
        const colorClass = isGreen ? 'text-secondary' : 'text-error';
        const typeClass = pos.type === 'BUY' ? 'bg-secondary/15 text-secondary border-secondary/30' : 'bg-tertiary-container/15 text-tertiary-container border-tertiary-container/30';
        const currencySymbol = '₹';
        const exitActionLabel = pos.status === 'PENDING' ? 'Cancel' : 'Close';

        return `
          <tr class="border-b border-outline-variant/10 hover:bg-surface-variant/20 transition-colors">
            <td class="p-4 font-semibold text-on-surface">${pos.symbol}</td>
            <td class="p-4">
              <span class="px-2 py-0.5 rounded text-[9px] font-bold border ${typeClass}">${pos.type === 'BUY' ? 'LONG' : 'SHORT'}</span>
            </td>
            <td class="p-4 font-semibold">${pos.size}</td>
            <td class="p-4 font-data-mono text-xs">${currencySymbol}${pos.entry_price.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
            <td class="p-4 text-right font-data-mono font-bold ${colorClass}">
              ${pos.status === 'PENDING' ? '<span class="text-on-surface-variant italic text-xs">Pending Exec</span>' : (isGreen ? '+' : '') + currencySymbol + pos.pnl.toFixed(2)}
            </td>
            <td class="p-4 text-center">
              <button onclick="closeTradePosition(${pos.id})" class="text-error text-xs font-bold uppercase hover:bg-error-container/20 px-2.5 py-1 rounded transition-colors border border-error/20">
                ${exitActionLabel}
              </button>
            </td>
          </tr>
        `;
      }).join('');
    }
  }

  // Trade History Ledger Table
  const ledgerTbody = document.getElementById('trade-ledger-tbody');
  if (ledgerTbody) {
    if (state.closedLedger.length === 0) {
      ledgerTbody.innerHTML = `
        <tr>
          <td colspan="3" class="p-4 text-center text-on-surface-variant text-[11px]">No trade logs in ledger.</td>
        </tr>
      `;
    } else {
      ledgerTbody.innerHTML = state.closedLedger.map(pos => {
        const isGreen = pos.pnl >= 0;
        const colorClass = isGreen ? 'text-secondary' : 'text-error';
        const currencySymbol = '₹';

        return `
          <tr class="border-b border-outline-variant/5 hover:bg-surface-variant/10">
            <td class="p-3 font-semibold">${pos.symbol}</td>
            <td class="p-3 text-[10px] uppercase font-bold text-on-surface-variant">${pos.type === 'BUY' ? 'LONG' : 'SHORT'}</td>
            <td class="p-3 text-right font-bold ${colorClass}">${isGreen ? '+' : ''}${currencySymbol}${pos.pnl.toFixed(2)}</td>
          </tr>
        `;
      }).join('');
    }
  }
}

// ----------------- TECHNICAL SIGNALS ENGINE -----------------
async function loadSignals() {
  try {
    const res = await fetch('/api/signals');
    const signals = await res.json();
    state.signals = signals;
    
    renderSignalsGrid();
    renderDashboardTopSignals();
  } catch (err) {
    console.error("Error loading signals:", err);
  }
}

let activeSignalCategory = 'ALL';
function setupSignalFilters() {
  const searchInput = document.getElementById('signal-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', renderSignalsGrid);
  }

  document.querySelectorAll('.signal-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      // Highlight active button
      document.querySelectorAll('.signal-filter-btn').forEach(b => {
        b.className = "signal-filter-btn px-4 py-2 rounded-full bg-surface-container border border-outline-variant text-on-surface-variant hover:bg-surface-container-high transition-all text-xs font-bold uppercase tracking-wider whitespace-nowrap active:scale-95";
      });
      btn.className = "signal-filter-btn px-4 py-2 rounded-full bg-primary text-white text-xs font-bold uppercase tracking-wider whitespace-nowrap active:scale-95 transition-all";
      
      activeSignalCategory = btn.getAttribute('data-filter-cat');
      renderSignalsGrid();
    });
  });
}

function renderSignalsGrid() {
  const container = document.getElementById('signals-grid-container');
  if (!container) return;

  const searchInput = document.getElementById('signal-search-input');
  const searchQuery = searchInput && searchInput.value ? searchInput.value.toLowerCase() : '';
  const signalsList = state.signals || [];

  // 1. Build AI active trade cards html
  const activeAiTrades = (state.recentAiTrades || []).filter(t => t.status === 'ACTIVE');
  
  const filteredAiTrades = activeAiTrades.filter(t => {
    const matchesSearch = t.symbol ? t.symbol.toLowerCase().includes(searchQuery) : true;
    const matchesCat = activeSignalCategory === 'ALL' || activeSignalCategory === 'Trend' || activeSignalCategory === 'Momentum'; 
    return matchesCat && matchesSearch;
  });

  const currencySymbol = '₹';
  const aiCardsHtml = filteredAiTrades.map(trade => {
    const isBuy = trade.predicted_action === 1;
    const typeLabel = isBuy ? 'BUY' : 'SHORT';
    const typeClass = isBuy ? 'bg-secondary text-white' : 'bg-error text-white';
    const indicatorBorder = isBuy ? 'border-secondary' : 'border-error';
    const indicatorShadow = isBuy ? 'shadow-secondary/20' : 'shadow-error/20';

    let pnlHtml = '<span class="text-on-surface-variant italic">Calculating...</span>';
    const currentPriceData = state.marketPrices[trade.symbol];
    if (currentPriceData) {
      const currentPrice = currentPriceData.price;
      const priceDiff = ((currentPrice - trade.entry_price) / trade.entry_price) * 100;
      let pnl = 0.0;
      if (trade.predicted_action === 1) { // BUY
        pnl = priceDiff * 1000.00;
      } else if (trade.predicted_action === 2) { // SHORT
        pnl = -priceDiff * 1000.00;
      }
      const isProfit = pnl >= 0;
      pnlHtml = `<span class="${isProfit ? 'text-secondary' : 'text-error'} font-bold">${isProfit ? '+' : ''}${currencySymbol}${pnl.toFixed(2)}</span>`;
    }

    return `
      <div class="glass-panel p-5 rounded-2xl border-l-4 ${indicatorBorder} border-t-2 border-t-primary/20 bg-gradient-to-br from-primary/5 to-transparent hover:shadow-lg hover:${indicatorShadow} transition-all duration-200 flex flex-col gap-3 relative overflow-hidden ring-1 ring-primary/25">
        <div class="absolute top-0 right-0 bg-primary/10 text-primary text-[8px] font-extrabold uppercase px-2.5 py-0.5 rounded-bl">
          AI Auto Trade
        </div>

        <div class="flex justify-between items-start mt-1">
          <div>
            <h3 class="font-headline-md text-base text-on-surface font-bold flex items-center gap-1.5">
              <i data-lucide="brain-circuit" class="w-4 h-4 text-primary animate-pulse"></i>
              ${trade.symbol}
            </h3>
            <span class="text-[9px] text-primary uppercase tracking-widest font-extrabold">Active AI Prediction</span>
          </div>
          <div class="flex flex-col items-end">
            <span class="${typeClass} font-bold text-[9px] px-2 py-0.5 rounded shadow-sm">${typeLabel}</span>
            <span class="text-[9px] text-on-surface-variant mt-1 font-semibold">${formatTimestamp(trade.timestamp)}</span>
          </div>
        </div>
        
        <div class="grid grid-cols-2 gap-4 py-2 border-y border-outline-variant/15 text-xs">
          <div>
            <p class="text-[9px] text-on-surface-variant mb-0.5 font-bold uppercase tracking-wider">AI ENTRY PRICE</p>
            <p class="font-data-mono font-bold text-primary">${currencySymbol}${(trade.entry_price || 0).toFixed(2)}</p>
          </div>
          <div class="text-right">
            <p class="text-[9px] text-on-surface-variant mb-0.5 font-bold uppercase tracking-wider">LIVE TICKING PNL</p>
            <p class="font-data-mono font-bold">${pnlHtml}</p>
          </div>
        </div>

        <div class="flex justify-between items-center mt-2 pt-1">
          <span class="text-[10px] text-on-surface-variant font-bold flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
            AI IS TRACKING LIVE
          </span>
          <button onclick="copyAITradeToPanel('${trade.symbol}', '${typeLabel}', ${trade.entry_price})" class="bg-primary hover:brightness-110 text-white font-extrabold text-[10px] px-4 py-2 rounded-lg uppercase tracking-wider active:scale-95 transition-all shadow-md shadow-primary/10">
            Copy AI Trade
          </button>
        </div>
      </div>
    `;
  }).join('');

  // 2. Filter rules-based signals list
  const filtered = signalsList.filter(sig => {
    if (!sig) return false;
    const matchesCat = activeSignalCategory === 'ALL' || sig.category === activeSignalCategory;
    const matchesSearch = !searchQuery || (sig.symbol && sig.symbol.toLowerCase().includes(searchQuery)) || (sig.strategy_name && sig.strategy_name.toLowerCase().includes(searchQuery));
    return matchesCat && matchesSearch;
  });

  if (filtered.length === 0 && filteredAiTrades.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-12 text-center text-on-surface-variant">
        <i data-lucide="inbox" class="w-10 h-10 mx-auto text-on-surface-variant/40 mb-3"></i>
        <p class="font-body-base text-sm">No active signals match current criteria.</p>
      </div>
    `;
    safeCreateIcons();
    return;
  }

  const formatPrice = (val) => (val !== undefined && val !== null ? val.toLocaleString() : '--');

  const signalsHtml = filtered.map(sig => {
    const isBuy = sig.type === 'BUY';
    const typeClass = isBuy ? 'bg-secondary text-white' : 'bg-error text-white';
    const indicatorBorder = isBuy ? 'border-secondary' : 'border-error';
    const indicatorShadow = isBuy ? 'shadow-secondary/20' : 'shadow-error/20';

    if (sig.locked) {
      const requiredPlan = sig.category === 'SMC' ? 'Prime' : 'Pro';
      return `
        <div class="glass-panel p-5 rounded-2xl border border-outline-variant/30 flex flex-col gap-3 relative overflow-hidden h-72">
          <div class="absolute inset-0 bg-background/50 backdrop-blur-md z-10 flex flex-col items-center justify-center p-6 text-center">
            <div class="p-3 bg-primary/10 rounded-full text-primary mb-3 shadow-lg shadow-primary/20">
              <i data-lucide="lock" class="w-6 h-6"></i>
            </div>
            <h4 class="text-sm font-bold text-on-surface uppercase tracking-wider">${requiredPlan} Feature</h4>
            <p class="text-xs text-on-surface-variant mt-1.5 mb-4 max-w-[200px]">Unlock SMC order blocks & institutional signals.</p>
            <button data-view-target="subscription" class="px-5 py-2.5 bg-primary hover:brightness-110 text-white rounded-xl text-xs font-bold uppercase transition-all shadow-md shadow-primary/15 active:scale-95">
              Upgrade Now
            </button>
          </div>
          
          <div class="flex justify-between items-start opacity-30 select-none">
            <div>
              <h3 class="font-headline-md text-base text-on-surface font-bold">${sig.symbol}</h3>
              <span class="text-[9px] text-on-surface-variant uppercase tracking-widest font-semibold">${sig.category} • ${sig.strategy_name}</span>
            </div>
            <span class="px-2 py-0.5 rounded text-[9px] font-bold uppercase ${typeClass}">${sig.type}</span>
          </div>
          <div class="h-[1px] bg-outline-variant/10 w-full opacity-30 select-none"></div>
          <div class="flex-grow opacity-30 select-none flex flex-col justify-center">
            <p class="text-xs text-on-surface-variant font-semibold">Technical details are currently hidden.</p>
          </div>
        </div>
      `;
    }

    return `
      <div class="glass-panel p-5 rounded-2xl border-l-4 ${indicatorBorder} hover:shadow-lg hover:${indicatorShadow} transition-all duration-200 cursor-pointer flex flex-col gap-3 relative overflow-hidden">
        <div class="flex justify-between items-start">
          <div>
            <h3 class="font-headline-md text-base text-on-surface font-bold">${sig.symbol}</h3>
            <span class="text-[9px] text-on-surface-variant uppercase tracking-widest font-bold">${sig.category} • ${sig.strategy_name}</span>
          </div>
          <div class="flex flex-col items-end">
            <span class="${typeClass} font-bold text-[9px] px-2 py-0.5 rounded shadow-sm">${sig.type}</span>
            <span class="text-[9px] text-on-surface-variant mt-1 font-semibold">${formatTimestamp(sig.timestamp)}</span>
          </div>
        </div>
        
        <div class="grid grid-cols-2 gap-4 py-2 border-y border-outline-variant/15 text-xs">
          <div>
            <p class="text-[9px] text-on-surface-variant mb-0.5 font-bold uppercase tracking-wider">ENTRY PRICE</p>
            <p class="font-data-mono font-bold text-primary">${currencySymbol}${formatPrice(sig.entry_price)}</p>
          </div>
          <div class="text-right">
            <p class="text-[9px] text-on-surface-variant mb-0.5 font-bold uppercase tracking-wider">STOP LOSS</p>
            <p class="font-data-mono font-bold text-error">${currencySymbol}${formatPrice(sig.sl)}</p>
          </div>
        </div>
        
        <div class="flex flex-col gap-1.5">
          <p class="text-[9px] text-on-surface-variant uppercase font-bold tracking-wider">Take Profit Targets</p>
          <div class="flex items-center gap-2">
            <div class="flex-grow bg-surface-container/60 rounded p-1.5 border border-outline-variant/30 text-center">
              <span class="text-[8px] text-on-surface-variant block font-bold">T1</span>
              <span class="font-data-mono text-[10px] text-secondary font-bold">${currencySymbol}${formatPrice(sig.t1)}</span>
            </div>
            <div class="flex-grow bg-surface-container/60 rounded p-1.5 border border-outline-variant/30 text-center">
              <span class="text-[8px] text-on-surface-variant block font-bold">T2</span>
              <span class="font-data-mono text-[10px] text-on-surface-variant font-bold">${currencySymbol}${formatPrice(sig.t2)}</span>
            </div>
            <div class="flex-grow bg-surface-container/60 rounded p-1.5 border border-outline-variant/30 text-center">
              <span class="text-[8px] text-on-surface-variant block font-bold">T3</span>
              <span class="font-data-mono text-[10px] text-on-surface-variant font-bold">${currencySymbol}${formatPrice(sig.t3)}</span>
            </div>
          </div>
        </div>
        
        <div class="flex justify-between items-center mt-2 pt-1">
          <div class="flex items-center gap-1.5 text-[10px]">
            <span class="text-on-surface-variant font-bold uppercase">R:R RATIO:</span>
            <span class="font-bold text-on-surface font-data-mono">${sig.rr_ratio || '1:3.0'}</span>
          </div>
          <button onclick="executeSignalPreset(${sig.id})" class="bg-primary hover:brightness-110 text-white font-extrabold text-[10px] px-4 py-2 rounded-lg uppercase tracking-wider active:scale-95 transition-all shadow-md shadow-primary/10">
            Execute
          </button>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = aiCardsHtml + signalsHtml;
  safeCreateIcons();
  
  // Attach view switcher buttons event from dynamically added cards
  document.querySelectorAll('[data-view-target="subscription"]').forEach(btn => {
    btn.addEventListener('click', () => switchView('subscription'));
  });
}

function renderDashboardTopSignals() {
  const container = document.getElementById('dash-top-signals');
  if (!container) return;

  // Take first 3 unlocked or basic signals
  const displaySignals = state.signals.filter(s => !s.locked).slice(0, 3);
  if (displaySignals.length === 0) {
    container.innerHTML = `
      <div class="col-span-full p-6 text-center text-on-surface-variant glass-panel rounded-xl">
        No active basic signals.
      </div>
    `;
    return;
  }

  container.innerHTML = displaySignals.map(sig => {
    const isBuy = sig.type === 'BUY';
    const typeClass = isBuy ? 'bg-secondary text-white' : 'bg-error text-white';
    const currencySymbol = '₹';
    const pct = isBuy ? 65 : 40;
    const progressClass = isBuy ? 'bg-secondary' : 'bg-error';

    return `
      <div onclick="executeSignalPreset(${sig.id})" class="glass-panel rounded-xl p-4 flex flex-col hover:border-primary/50 transition-colors cursor-pointer relative overflow-hidden group shadow-sm">
        <div class="flex justify-between items-start mb-3">
          <span class="${typeClass} text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shadow-sm">${sig.type}</span>
          <span class="font-label-xs text-on-surface-variant text-[9px] font-semibold">${sig.category}</span>
        </div>
        <h5 class="font-headline-md text-on-surface font-bold text-sm mb-1">${sig.symbol}</h5>
        <p class="font-body-base text-on-surface-variant text-[11px] mb-4 truncate">${sig.strategy_name}</p>
        <div class="mt-auto">
          <div class="flex justify-between text-[10px] mb-1">
            <span class="text-on-surface-variant">Entry / Target</span>
            <span class="font-data-mono font-bold ${isBuy ? 'text-secondary' : 'text-error'}">${currencySymbol}${sig.entry_price.toLocaleString()} / ${currencySymbol}${sig.t1.toLocaleString()}</span>
          </div>
          <div class="w-full bg-surface-variant h-1 rounded-full overflow-hidden">
            <div class="${progressClass} w-[${pct}%] h-full"></div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function executeSignalPreset(signalId) {
  const sig = state.signals.find(s => s.id === signalId);
  if (!sig) return;

  // Set selector and focus
  const selector = document.getElementById('trade-symbol-selector');
  if (selector) {
    selector.value = sig.symbol;
    // trigger change
    selector.dispatchEvent(new Event('change'));
  }

  // Pre-fill Order Form state
  state.orderForm.type = sig.type === 'BUY' ? 'BUY' : 'SHORT';
  state.orderForm.orderType = 'LIMIT';
  
  // Set values
  document.getElementById('order-limit-price').value = sig.entry_price;
  
  // Toggle Limit UI
  document.getElementById('ordertype-limit-btn').click();
  
  // Update buttons styling
  updateOrderFormButtons();
  updateOrderEstimates();

  // Redirect view to trade tab
  switchView('trade');
  
  // Highlight/focus Quantity
  const qtyInput = document.getElementById('order-qty');
  if (qtyInput) {
    qtyInput.focus();
    qtyInput.select();
  }

  showToast(`Preset loaded for ${sig.symbol} Limit ${sig.type}!`, "info");
}

// ----------------- TRADING PANEL & PLACING ORDERS -----------------
function setupTradingPanel() {
  const symbolSelector = document.getElementById('trade-symbol-selector');
  if (symbolSelector) {
    symbolSelector.addEventListener('change', (e) => {
      const selected = e.target.value;
      state.orderForm.symbol = selected;
      document.getElementById('trade-symbol-name').innerText = selected;
      document.getElementById('order-symbol-display').innerText = selected;
      
      const unit = 'Shares';
      document.getElementById('order-asset-unit').innerText = unit;

      // Update Max buying power
      updateMaxBuyingPower();
      // Generate new mock chart data for this asset
      generateMockCandles();
      // Re-initialize tradingview widget
      initTradingViewWidget();
      // Update price visual
      updateOrderEstimates();
      // Update AI copilot card recommendation
      updateAICopilot();
    });
  }

  // Order Type triggers (Market vs Limit)
  document.getElementById('ordertype-market-btn').addEventListener('click', () => {
    state.orderForm.orderType = 'MARKET';
    document.getElementById('ordertype-market-btn').className = "flex-1 py-1.5 rounded-md bg-primary text-white font-label-xs uppercase text-[10px] font-bold active:scale-95 transition-all";
    document.getElementById('ordertype-limit-btn').className = "flex-1 py-1.5 rounded-md text-on-surface-variant hover:text-on-surface font-label-xs uppercase text-[10px] font-bold hover:bg-surface-variant/30 active:scale-95 transition-all";
    document.getElementById('limit-price-input-container').classList.add('hidden');
    updateOrderEstimates();
  });

  document.getElementById('ordertype-limit-btn').addEventListener('click', () => {
    state.orderForm.orderType = 'LIMIT';
    document.getElementById('ordertype-limit-btn').className = "flex-1 py-1.5 rounded-md bg-primary text-white font-label-xs uppercase text-[10px] font-bold active:scale-95 transition-all";
    document.getElementById('ordertype-market-btn').className = "flex-1 py-1.5 rounded-md text-on-surface-variant hover:text-on-surface font-label-xs uppercase text-[10px] font-bold hover:bg-surface-variant/30 active:scale-95 transition-all";
    document.getElementById('limit-price-input-container').classList.remove('hidden');
    
    // Fill current live price as base limit target
    const currentSymbol = state.orderForm.symbol;
    if (state.marketPrices[currentSymbol] && !document.getElementById('order-limit-price').value) {
      document.getElementById('order-limit-price').value = state.marketPrices[currentSymbol].price.toFixed(2);
    }
    updateOrderEstimates();
  });

  // Quantity input watchers
  document.getElementById('order-qty').addEventListener('input', updateOrderEstimates);

  // Percentage shortcuts buttons
  document.querySelectorAll('.qty-pct-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const pct = parseFloat(btn.getAttribute('data-pct'));
      
      const currentSymbol = state.orderForm.symbol;
      if (!state.marketPrices[currentSymbol]) return;
      const currentPrice = state.marketPrices[currentSymbol].price;

      // 5x Leverage buying power: Max margin is current balance.
      // Max position value is balance * 5. Max size is (balance * 5) / price
      const maxPositionVal = state.user.paper_balance * 5;
      const maxSize = maxPositionVal / currentPrice;

      const size = maxSize * pct;
      document.getElementById('order-qty').value = size.toFixed(4);
      updateOrderEstimates();
    });
  });

  // Execute buy/sell triggers
  document.getElementById('order-buy-btn').addEventListener('click', () => placeOrder('BUY'));
  document.getElementById('order-sell-btn').addEventListener('click', () => placeOrder('SHORT'));
  
  // Set default max size
  updateMaxBuyingPower();
}

function updateOrderFormButtons() {
  if (state.orderForm.orderType === 'MARKET') {
    document.getElementById('ordertype-market-btn').click();
  } else {
    document.getElementById('ordertype-limit-btn').click();
  }
}

function updateMaxBuyingPower() {
  const currentSymbol = state.orderForm.symbol;
  if (!state.marketPrices[currentSymbol]) return;
  const currentPrice = state.marketPrices[currentSymbol].price;

  const maxPositionVal = state.user.paper_balance * 5;
  const maxSize = maxPositionVal / currentPrice;
  
  document.getElementById('order-max-size').innerText = `Max: ${maxSize.toFixed(2)}`;
}

function updateOrderEstimates() {
  const currentSymbol = state.orderForm.symbol;
  if (!state.marketPrices[currentSymbol]) return;
  const currentPrice = state.marketPrices[currentSymbol].price;

  const qty = parseFloat(document.getElementById('order-qty').value) || 0;
  
  let entryPrice = currentPrice;
  if (state.orderForm.orderType === 'LIMIT') {
    const limitInput = parseFloat(document.getElementById('order-limit-price').value);
    if (!isNaN(limitInput) && limitInput > 0) entryPrice = limitInput;
  }

  const positionValue = entryPrice * qty;
  const marginRequired = positionValue / 5; // 5x leverage

  const currencySymbol = '₹';
  document.getElementById('order-est-value').innerText = `${currencySymbol}${positionValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  document.getElementById('order-est-margin').innerText = `₹${marginRequired.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
}

async function placeOrder(type) {
  const symbol = state.orderForm.symbol;
  const orderType = state.orderForm.orderType;
  const qty = parseFloat(document.getElementById('order-qty').value);

  if (isNaN(qty) || qty <= 0) {
    showToast("Please enter a valid quantity.", "error");
    return;
  }

  let limitPrice = 0;
  if (orderType === 'LIMIT') {
    limitPrice = parseFloat(document.getElementById('order-limit-price').value);
    if (isNaN(limitPrice) || limitPrice <= 0) {
      showToast("Please enter a valid limit price.", "error");
      return;
    }
  }

  try {
    const res = await fetch('/api/trade/place', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        symbol,
        type, // BUY or SHORT
        orderType, // MARKET or LIMIT
        price: limitPrice,
        size: qty
      })
    });

    const data = await res.json();
    if (!res.ok) {
      showToast(data.error || "Order execution failed.", "error");
    } else {
      showToast(data.message, "success");
      // Update balance and tables immediately
      pollAPI();
    }
  } catch (err) {
    console.error("Error executing order:", err);
    showToast("Network error executing order.", "error");
  }
}

async function closeTradePosition(positionId) {
  try {
    const res = await fetch('/api/trade/close', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ positionId })
    });
    const data = await res.json();
    if (!res.ok) {
      showToast(data.error || "Error exiting position.", "error");
    } else {
      showToast(data.message || "Position closed.", "success");
      pollAPI();
    }
  } catch (err) {
    console.error("Error closing position:", err);
    showToast("Network error closing position.", "error");
  }
}

// ----------------- TRADER JOURNAL LAYER -----------------
function setupJournalForm() {
  const form = document.getElementById('journal-form');
  if (!form) return;

  // Emotion selectors binding
  document.querySelectorAll('.mood-select-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.mood-select-btn').forEach(b => {
        b.className = "mood-select-btn py-2 border border-outline-variant/40 rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-1 hover:bg-surface-variant/30 text-on-surface-variant bg-surface-container";
        b.querySelector('i').classList.add('hidden');
      });
      
      btn.className = "mood-select-btn py-2 border-2 border-secondary rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1 bg-surface-container text-on-surface";
      btn.querySelector('i').classList.remove('hidden');
      
      // Save selected emotion
      form.dataset.selectedEmotion = btn.getAttribute('data-mood');
    });
  });

  // Set default emotion
  const defaultBtn = document.querySelector('.mood-select-btn[data-mood="Disciplined"]');
  if (defaultBtn) defaultBtn.click();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const symbol = document.getElementById('journal-symbol').value;
    const strategy_tag = document.getElementById('journal-strategy').value;
    const note = document.getElementById('journal-notes').value;
    const emotion = form.dataset.selectedEmotion || 'Disciplined';
    const reflection = document.getElementById('journal-reflection').value;

    try {
      const res = await fetch('/api/journal/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, strategy_tag, note, emotion, reflection })
      });

      if (res.ok) {
        showToast("Journal entry logged successfully!", "success");
        form.reset();
        if (defaultBtn) defaultBtn.click();
        loadJournals();
        renderDashboardMoodStats();
      } else {
        showToast("Error creating journal entry.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Connection error creating journal entry.", "error");
    }
  });
}

async function loadJournals() {
  try {
    const res = await fetch('/api/journal');
    const logs = await res.json();
    state.journals = logs;

    renderJournalsFeed();
  } catch (err) {
    console.error("Error fetching journals:", err);
  }
}

function renderJournalsFeed() {
  const container = document.getElementById('journal-logs-feed');
  const countLabel = document.getElementById('journal-logs-count');
  if (!container) return;

  countLabel.innerText = `${state.journals.length} Entries`;

  if (state.journals.length === 0) {
    container.innerHTML = `
      <div class="glass-panel p-8 rounded-xl text-center text-on-surface-variant">
        <i data-lucide="book" class="w-8 h-8 mx-auto opacity-30 mb-2"></i>
        <p class="text-xs">Your trading journal ledger is currently empty.</p>
      </div>
    `;
    safeCreateIcons();
    return;
  }

  container.innerHTML = state.journals.map(log => {
    let moodColor = 'bg-secondary/10 text-secondary border-secondary/20';
    if (log.emotion === 'Fearful') moodColor = 'bg-tertiary/10 text-tertiary border-tertiary/20';
    else if (log.emotion === 'Greedy') moodColor = 'bg-error/10 text-error border-error/20';

    return `
      <div class="glass-panel p-5 rounded-2xl border border-outline-variant/30 flex flex-col gap-2.5 shadow-sm">
        <div class="flex justify-between items-start">
          <div class="flex items-center gap-2">
            <span class="font-bold text-sm text-on-surface">${log.symbol}</span>
            <span class="px-2 py-0.5 bg-primary/10 border border-primary/20 rounded text-[9px] font-bold text-primary uppercase">${log.strategy_tag}</span>
          </div>
          <span class="text-[9px] text-on-surface-variant font-medium">${formatTimestamp(log.timestamp)}</span>
        </div>
        <p class="text-xs text-on-surface-variant leading-relaxed">${log.note}</p>
        
        ${log.reflection ? `
          <div class="bg-surface-container-lowest/50 p-2.5 rounded-xl border border-outline-variant/10 text-[11px] flex gap-2 items-start mt-1">
            <i data-lucide="award" class="w-3.5 h-3.5 text-primary shrink-0 mt-0.5"></i>
            <p class="italic text-on-surface-variant"><span class="font-bold uppercase text-[9px] not-italic text-primary mr-1">Reflection:</span>${log.reflection}</p>
          </div>
        ` : ''}
        
        <div class="flex items-center justify-between mt-1 pt-1.5 border-t border-outline-variant/10">
          <span class="text-[9px] text-on-surface-variant font-bold uppercase">Mental Radar:</span>
          <span class="px-2 py-0.5 border rounded-full text-[9px] font-bold uppercase tracking-wider ${moodColor}">${log.emotion}</span>
        </div>
      </div>
    `;
  }).join('');
  safeCreateIcons();
}

function renderDashboardMoodStats() {
  const container = document.getElementById('dash-mood-stats');
  if (!container) return;

  if (state.journals.length === 0) {
    container.innerHTML = `<p class="text-xs text-on-surface-variant text-center py-2">Log trade reflections to draw statistics.</p>`;
    return;
  }

  const counts = { Disciplined: 0, Fearful: 0, Greedy: 0 };
  state.journals.forEach(j => {
    if (counts[j.emotion] !== undefined) counts[j.emotion]++;
  });

  const total = state.journals.length;
  const pDisc = Math.round((counts.Disciplined / total) * 100) || 0;
  const pFear = Math.round((counts.Fearful / total) * 100) || 0;
  const pGree = Math.round((counts.Greedy / total) * 100) || 0;

  container.innerHTML = `
    <div class="flex flex-col gap-2.5 text-xs">
      <div>
        <div class="flex justify-between font-bold mb-1">
          <span class="text-secondary uppercase text-[10px]">Disciplined</span>
          <span>${pDisc}% (${counts.Disciplined})</span>
        </div>
        <div class="w-full bg-surface-variant h-1.5 rounded-full overflow-hidden">
          <div class="bg-secondary h-full" style="width: ${pDisc}%"></div>
        </div>
      </div>
      <div>
        <div class="flex justify-between font-bold mb-1">
          <span class="text-tertiary uppercase text-[10px]">Fearful</span>
          <span>${pFear}% (${counts.Fearful})</span>
        </div>
        <div class="w-full bg-surface-variant h-1.5 rounded-full overflow-hidden">
          <div class="bg-tertiary h-full" style="width: ${pFear}%"></div>
        </div>
      </div>
      <div>
        <div class="flex justify-between font-bold mb-1">
          <span class="text-error uppercase text-[10px]">Greedy</span>
          <span>${pGree}% (${counts.Greedy})</span>
        </div>
        <div class="w-full bg-surface-variant h-1.5 rounded-full overflow-hidden">
          <div class="bg-error h-full" style="width: ${pGree}%"></div>
        </div>
      </div>
    </div>
  `;
}

// ----------------- SUBSCRIPTION & PAYMENTS (RAZORPAY) -----------------
let selectedUpgradePlan = 'Pro';
let isYearlyBilling = false;
const planRates = {
  Pro: { monthly: 299, yearly: 239 },
  Prime: { monthly: 999, yearly: 799 }
};

function setupSubscriptions() {
  const billingToggle = document.getElementById('billing-toggle');
  
  billingToggle.addEventListener('click', () => {
    isYearlyBilling = !isYearlyBilling;
    const circle = document.getElementById('toggle-circle');
    const monthlyLabel = document.getElementById('monthly-label');
    const yearlyLabel = document.getElementById('yearly-label');
    const proPrice = document.getElementById('pro-price');
    const primePrice = document.getElementById('prime-price');

    if (isYearlyBilling) {
      circle.classList.add('translate-x-6');
      yearlyLabel.className = 'text-primary font-bold text-sm transition-colors';
      monthlyLabel.className = 'text-on-surface-variant font-bold text-sm transition-colors';
      
      proPrice.textContent = `₹${planRates.Pro.yearly}`;
      primePrice.textContent = `₹${planRates.Prime.yearly}`;
    } else {
      circle.classList.remove('translate-x-6');
      monthlyLabel.className = 'text-on-surface font-bold text-sm transition-colors';
      yearlyLabel.className = 'text-on-surface-variant font-bold text-sm transition-colors';
      
      proPrice.textContent = `₹${planRates.Pro.monthly}`;
      primePrice.textContent = `₹${planRates.Prime.monthly}`;
    }
  });

  // Upgrade buttons triggers
  document.getElementById('subs-pro-btn').addEventListener('click', () => openRazorpayModal('Pro'));
  document.getElementById('subs-prime-btn').addEventListener('click', () => openRazorpayModal('Prime'));

  // Razorpay controls
  document.getElementById('payment-modal-close-btn').addEventListener('click', closeRazorpayModal);
  document.getElementById('payment-modal-overlay').addEventListener('click', closeRazorpayModal);
  
  document.getElementById('pay-upi-btn').addEventListener('click', () => showPaymentDetails('upi'));
  document.getElementById('pay-card-btn').addEventListener('click', () => showPaymentDetails('card'));

  document.getElementById('pay-confirm-qr-btn').addEventListener('click', submitSubscriptionUpgrade);
  document.getElementById('pay-confirm-card-btn').addEventListener('click', submitSubscriptionUpgrade);
}

function openRazorpayModal(planName) {
  selectedUpgradePlan = planName;
  const rate = isYearlyBilling ? planRates[planName].yearly : planRates[planName].monthly;
  const total = isYearlyBilling ? rate * 12 : rate;

  document.getElementById('modal-amount').innerText = `₹${total.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
  document.querySelectorAll('.qr-amt').forEach(el => el.innerText = total.toLocaleString());

  const modal = document.getElementById('payment-modal');
  const modalContent = document.getElementById('modal-content');
  
  modal.classList.remove('hidden');
  setTimeout(() => {
    modalContent.classList.remove('scale-95');
    modalContent.classList.add('scale-100');
  }, 10);
  document.body.style.overflow = 'hidden';

  // Default to UPI view
  showPaymentDetails('upi');
}

function closeRazorpayModal() {
  const modal = document.getElementById('payment-modal');
  const modalContent = document.getElementById('modal-content');
  
  modalContent.classList.add('scale-95');
  modalContent.classList.remove('scale-100');
  
  setTimeout(() => {
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
  }, 200);
}

function showPaymentDetails(method) {
  const qrSection = document.getElementById('upi-qr-section');
  const cardSection = document.getElementById('card-details-section');

  const upiBtn = document.getElementById('pay-upi-btn');
  const cardBtn = document.getElementById('pay-card-btn');

  if (method === 'upi') {
    qrSection.classList.remove('hidden');
    cardSection.classList.add('hidden');
    upiBtn.className = "flex items-center gap-3 p-3 bg-white border border-blue-500 rounded-xl transition-colors shadow-sm text-left grow";
    cardBtn.className = "flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl hover:border-blue-500 transition-colors shadow-sm text-left grow";
  } else {
    cardSection.classList.remove('hidden');
    qrSection.classList.add('hidden');
    cardBtn.className = "flex items-center gap-3 p-3 bg-white border border-blue-500 rounded-xl transition-colors shadow-sm text-left grow";
    upiBtn.className = "flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl hover:border-blue-500 transition-colors shadow-sm text-left grow";
  }
}

async function submitSubscriptionUpgrade() {
  closeRazorpayModal();
  try {
    const res = await fetch('/api/subscription/upgrade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tier: selectedUpgradePlan,
        billing_cycle: isYearlyBilling ? 'yearly' : 'monthly'
      })
    });
    const data = await res.json();
    if (data.success) {
      // Refresh UI state
      pollAPI();
      loadSignals();
      switchView('dashboard');
    } else {
      showToast("Subscription upgrade failed.", "error");
    }
  } catch (err) {
    console.error(err);
    showToast("Network error completing transaction.", "error");
  }
}

// ----------------- ADMIN PANEL API FORM ACTIONS -----------------
function setupAdminPanel() {
  // Reset balance trigger
  const resetBtn = document.getElementById('dash-reset-balance-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', async () => {
      if (confirm("Reset paper trading simulated balance back to ₹1,00,000.00 and close active positions?")) {
        const res = await fetch('/api/user/reset-balance', { method: 'POST' });
        if (res.ok) {
          pollAPI();
        }
      }
    });
  }

  // Price overrides
  const priceForm = document.getElementById('admin-price-override-form');
  if (priceForm) {
    priceForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const symbol = document.getElementById('admin-override-symbol').value;
      const price = parseFloat(document.getElementById('admin-override-price').value);

      try {
        const res = await fetch('/api/market/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ symbol, price })
        });
        if (res.ok) {
          priceForm.reset();
          pollAPI();
        } else {
          showToast("Error overriding price.", "error");
        }
      } catch (err) {
        console.error(err);
        showToast("Connection error overriding price.", "error");
      }
    });
  }

  // Broadcast messages
  const broadcastForm = document.getElementById('admin-broadcast-form');
  if (broadcastForm) {
    broadcastForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const message = document.getElementById('admin-broadcast-message').value;
      const type = document.getElementById('admin-broadcast-type').value;

      try {
        const res = await fetch('/api/broadcasts/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message, type })
        });
        if (res.ok) {
          broadcastForm.reset();
          pollAPI();
        } else {
          showToast("Error dispatching broadcast.", "error");
        }
      } catch (err) {
        console.error(err);
        showToast("Connection error broadcasting.", "error");
      }
    });
  }

  // User Settings overrides
  const userForm = document.getElementById('admin-user-override-form');
  if (userForm) {
    userForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const tier = document.getElementById('admin-user-tier').value;
      const balance = parseFloat(document.getElementById('admin-user-balance').value);

      try {
        const res = await fetch('/api/admin/users/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tier, balance })
        });
        if (res.ok) {
          userForm.reset();
          pollAPI();
          loadSignals();
        } else {
          showToast("Error updating account settings.", "error");
        }
      } catch (err) {
        console.error(err);
        showToast("Connection error overriding settings.", "error");
      }
    });
  }

  // Signal injector manual
  const sigForm = document.getElementById('admin-signal-injector-form');
  if (sigForm) {
    sigForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const symbol = document.getElementById('admin-sig-symbol').value;
      const strategy_name = document.getElementById('admin-sig-name').value;
      const category = document.getElementById('admin-sig-cat').value;
      const type = document.getElementById('admin-sig-type').value;
      const entry_price = parseFloat(document.getElementById('admin-sig-entry').value);
      const sl = parseFloat(document.getElementById('admin-sig-sl').value);
      const t1 = parseFloat(document.getElementById('admin-sig-t1').value);
      const t2 = parseFloat(document.getElementById('admin-sig-t2').value);
      const t3 = parseFloat(document.getElementById('admin-sig-t3').value);
      const is_premium = parseInt(document.getElementById('admin-sig-premium').value);

      // Simple R:R calculation logic
      const entryDiff = Math.abs(entry_price - sl);
      const targetDiff = Math.abs(t1 - entry_price);
      const rr = (targetDiff / entryDiff).toFixed(1);
      const rr_ratio = `1:${rr}`;

      try {
        const res = await fetch('/api/signals/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            symbol, strategy_name, category, type, entry_price, t1, t2, t3, sl, rr_ratio, is_premium
          })
        });

        if (res.ok) {
          sigForm.reset();
          loadSignals();
        } else {
          showToast("Error injecting manual signal.", "error");
        }
      } catch (err) {
        console.error(err);
        showToast("Connection error injecting signal.", "error");
      }
    });
  }
}

// ----------------- AUXILIARY HELPERS -----------------
function formatTimestamp(tsString) {
  const date = new Date(tsString);
  const diffMs = new Date() - date;
  const diffSec = Math.floor(diffMs / 1000);
  
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  
  return date.toLocaleDateString();
}

// Language trigger
function setupLanguageSelector() {
  const btn = document.getElementById('language-toggle');
  btn.addEventListener('click', () => {
    const nextLang = state.currentLanguage === 'EN' ? 'HI' : 'EN';
    translateApp(nextLang);
  });
}

// ----------------- PWA AND SW ACTIVATOR -----------------
let deferredInstallPrompt = null;
function setupPWAFeatures() {
  const installBtn = document.getElementById('pwa-install-btn');

  // Intercept beforeinstallprompt
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    installBtn.classList.remove('hidden');
    installBtn.classList.add('flex');
  });

  installBtn.addEventListener('click', async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    const { outcome } = await deferredInstallPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted PWA installation');
      installBtn.classList.add('hidden');
      installBtn.classList.remove('flex');
    }
    deferredInstallPrompt = null;
  });

  window.addEventListener('appinstalled', () => {
    console.log('TradeMaster app successfully installed.');
    installBtn.classList.add('hidden');
    installBtn.classList.remove('flex');
  });

  // Register service worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('ServiceWorker registered with scope:', reg.scope))
        .catch(err => console.error('ServiceWorker registration failed:', err));
    });
  }
}

// ----------------- AI TRADING ENGINE CONTROLLER -----------------
let qtableCanvas = null;
let qtableCtx = null;
let backtestCanvas = null;
let backtestCtx = null;

function resizeAICanvases() {
  qtableCanvas = document.getElementById('ai-qtable-canvas');
  backtestCanvas = document.getElementById('ai-backtest-canvas');

  if (qtableCanvas) {
    const parent = qtableCanvas.parentElement;
    qtableCanvas.width = parent.clientWidth * window.devicePixelRatio;
    qtableCanvas.height = parent.clientHeight * window.devicePixelRatio;
    qtableCtx = qtableCanvas.getContext('2d');
    qtableCtx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  if (backtestCanvas) {
    const parent = backtestCanvas.parentElement;
    backtestCanvas.width = parent.clientWidth * window.devicePixelRatio;
    backtestCanvas.height = parent.clientHeight * window.devicePixelRatio;
    backtestCtx = backtestCanvas.getContext('2d');
    backtestCtx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }
}

async function pollAIStats() {
  try {
    // 1. Fetch Stats
    const statsRes = await fetch('/api/ai/stats');
    const stats = await statsRes.json();
    
    // Store in global state for cross-tab availability
    state.recentAiTrades = stats.recentPredictions || [];

    const statesEl = document.getElementById('ai-metrics-states');
    if (statesEl) statesEl.innerText = stats.statesLearned;
    
    const accEl = document.getElementById('ai-metrics-accuracy');
    if (accEl) accEl.innerText = `${stats.accuracy}%`;
    
    const predEl = document.getElementById('ai-metrics-predictions');
    if (predEl) predEl.innerText = stats.totalPredictions;
    
    const rewardEl = document.getElementById('ai-metrics-reward');
    if (rewardEl) {
      rewardEl.innerText = stats.netReward >= 0 ? `+${stats.netReward}` : stats.netReward;
      rewardEl.className = `text-xl font-extrabold font-data-mono mt-1 ${stats.netReward >= 0 ? 'text-secondary' : 'text-error'}`;
    }

    // 2. Fetch Q-Table records (only if canvas is present in view)
    const qtableCanvasEl = document.getElementById('ai-qtable-canvas');
    if (qtableCanvasEl) {
      const qtableRes = await fetch('/api/ai/q-table');
      const qtable = await qtableRes.json();
      drawQTableHeatmap(qtable);
    }

    // 3. Render Predictions Table (only if in view)
    const tbody = document.getElementById('ai-predictions-tbody');
    if (tbody) {
      if (stats.recentPredictions.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="5" class="p-4 text-center text-on-surface-variant font-body-base text-xs">AI agent has not placed any predictions yet. Waiting for market states...</td>
          </tr>
        `;
      } else {
        tbody.innerHTML = stats.recentPredictions.map(trade => {
          const actionLabels = { 0: 'HOLD', 1: 'BUY', 2: 'SELL' };
          const actionLabel = actionLabels[trade.predicted_action] || 'HOLD';
          
          let actionClass = 'bg-surface-variant/40 text-on-surface-variant border-outline-variant/30';
          if (trade.predicted_action === 1) actionClass = 'bg-secondary/15 text-secondary border-secondary/20';
          else if (trade.predicted_action === 2) actionClass = 'bg-tertiary-container/15 text-tertiary-container border-tertiary-container/20';

          const currencySymbol = '₹';
          
          let pnlText = '';
          if (trade.status === 'ACTIVE') {
            const currentPriceData = state.marketPrices[trade.symbol];
            if (currentPriceData) {
              const currentPrice = currentPriceData.price;
              const priceDiff = ((currentPrice - trade.entry_price) / trade.entry_price) * 100;
              let pnl = 0.0;
              if (trade.predicted_action === 1) { // BUY
                pnl = priceDiff * 1000.00; // Simulated position sizing
              } else if (trade.predicted_action === 2) { // SHORT
                pnl = -priceDiff * 1000.00;
              }
              const isProfit = pnl >= 0;
              pnlText = `<span class="${isProfit ? 'text-secondary' : 'text-error'} font-bold">${isProfit ? '+' : ''}${currencySymbol}${pnl.toFixed(2)}</span>`;
            } else {
              pnlText = '<span class="text-on-surface-variant italic">Active</span>';
            }
          } else {
            pnlText = `<span class="${trade.pnl >= 0 ? 'text-secondary' : 'text-error'} font-bold">${trade.pnl >= 0 ? '+' : ''}${currencySymbol}${trade.pnl.toFixed(2)}</span>`;
          }

          let feedbackUi = '';
          if (trade.user_feedback === 'NONE') {
            feedbackUi = `
              <div class="flex justify-center gap-2">
                <button onclick="submitAIFeedback(${trade.id}, 'LIKE')" class="p-1 hover:bg-secondary/20 text-on-surface-variant hover:text-secondary rounded border border-outline-variant/30">
                  <i data-lucide="thumbs-up" class="w-3.5 h-3.5"></i>
                </button>
                <button onclick="submitAIFeedback(${trade.id}, 'DISLIKE')" class="p-1 hover:bg-error/20 text-on-surface-variant hover:text-error rounded border border-outline-variant/30">
                  <i data-lucide="thumbs-down" class="w-3.5 h-3.5"></i>
                </button>
              </div>
            `;
          } else {
            const isLike = trade.user_feedback === 'LIKE';
            feedbackUi = `
              <span class="px-2 py-0.5 rounded text-[9px] font-bold uppercase ${isLike ? 'bg-secondary/10 text-secondary border border-secondary/20' : 'bg-error/10 text-error border border-error/20'}">
                ${isLike ? '👍 Approved' : '👎 Rejected'}
              </span>
            `;
          }

          const rewardPointsVal = trade.reward_points !== undefined ? trade.reward_points : 0;
          const pointsHtml = `<div class="text-[9px] font-bold ${rewardPointsVal >= 0 ? 'text-secondary' : 'text-error'} mt-0.5">${rewardPointsVal >= 0 ? '+' : ''}${rewardPointsVal} pts</div>`;
          const explanationHtml = `<div class="text-[9px] text-on-surface-variant leading-relaxed max-w-[280px] whitespace-normal mt-0.5 font-semibold">${trade.explanation || 'Running self-reflection loop analysis...'}</div>`;

          return `
            <tr class="border-b border-outline-variant/10 hover:bg-surface-variant/20 transition-colors">
              <td class="p-3 font-semibold">${trade.symbol}</td>
              <td class="p-3">
                <span class="px-2 py-0.5 rounded text-[9px] font-bold border ${actionClass}">${actionLabel}</span>
              </td>
              <td class="p-3">
                ${pnlText}
                ${pointsHtml}
              </td>
              <td class="p-3">
                <span class="font-semibold ${trade.reward >= 0 ? 'text-secondary' : 'text-error'}">${trade.reward >= 0 ? '+' : ''}${trade.reward.toFixed(1)}</span>
                ${explanationHtml}
              </td>
              <td class="p-3 text-center">${feedbackUi}</td>
            </tr>
          `;
        }).join('');
        safeCreateIcons();
      }
    }

    // 4. If currently on the signals tab, refresh the signals grid
    if (state.activeView === 'signals') {
      renderSignalsGrid();
    }

    // 5. If on AI Agent tab, poll pattern success analytics
    if (state.activeView === 'ai') {
      pollAIPatterns();
    }

  } catch (err) {
    console.error("Error polling AI stats:", err);
  }
}

async function submitAIFeedback(tradeId, feedback) {
  try {
    const res = await fetch('/api/ai/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tradeId, feedback })
    });
    if (res.ok) {
      pollAPI();
    } else {
      showToast("Error recording feedback.", "error");
    }
  } catch (err) {
    console.error(err);
  }
}

function drawQTableHeatmap(records) {
  if (!qtableCanvas || !qtableCtx || records.length === 0) return;

  const w = qtableCanvas.width / window.devicePixelRatio;
  const h = qtableCanvas.height / window.devicePixelRatio;

  qtableCtx.clearRect(0, 0, w, h);

  // Group states
  const states = [...new Set(records.map(r => r.state_string))].slice(0, 8); // top 8 states
  const actions = [0, 1, 2]; // HOLD, BUY, SELL
  const actionLabels = ['HOLD', 'BUY', 'SELL'];

  const headerH = 24;
  const colW = (w - 140) / 3;
  const rowH = (h - headerH) / Math.max(states.length, 1);

  // Draw Headers
  qtableCtx.fillStyle = state.theme === 'dark' ? '#bdc8d3' : '#31353b';
  qtableCtx.font = 'bold 10px JetBrains Mono';
  qtableCtx.textAlign = 'left';
  qtableCtx.fillText('STATE ENCODING', 10, 16);

  qtableCtx.textAlign = 'center';
  actions.forEach((act, idx) => {
    qtableCtx.fillText(actionLabels[idx], 140 + idx * colW + colW/2, 16);
  });

  // Render Rows
  states.forEach((stateStr, rIdx) => {
    const y = headerH + rIdx * rowH;

    // Draw state string label
    qtableCtx.fillStyle = state.theme === 'dark' ? '#e0e2ea' : '#0b0f14';
    qtableCtx.font = '9px JetBrains Mono';
    qtableCtx.textAlign = 'left';
    
    // Truncate state labels if too long
    const displayLabel = stateStr.length > 20 ? stateStr.substring(0, 18) + '..' : stateStr;
    qtableCtx.fillText(displayLabel, 10, y + rowH/2 + 4);

    // Draw Q-value cell boxes
    actions.forEach((act, cIdx) => {
      const x = 140 + cIdx * colW;
      const record = records.find(r => r.state_string === stateStr && r.action === act);
      const qVal = record ? record.q_value : 0.0;

      // Color intensity based on Q-value strength (clamped between -2.0 and +2.0)
      const absVal = Math.min(Math.abs(qVal) / 2.0, 1.0);
      let cellColor = 'rgba(100, 100, 100, 0.1)'; // default neutral gray
      if (qVal > 0.01) {
        cellColor = `rgba(0, 200, 83, ${0.1 + absVal * 0.7})`; // green saturation
      } else if (qVal < -0.01) {
        cellColor = `rgba(240, 143, 10, ${0.1 + absVal * 0.7})`; // orange/red saturation
      }

      qtableCtx.fillStyle = cellColor;
      qtableCtx.fillRect(x + 2, y + 2, colW - 4, rowH - 4);

      // Draw values inside cells
      qtableCtx.fillStyle = state.theme === 'dark' ? '#ffffff' : '#000000';
      qtableCtx.font = 'bold 9px JetBrains Mono';
      qtableCtx.textAlign = 'center';
      qtableCtx.fillText(qVal.toFixed(2), x + colW/2, y + rowH/2 + 4);
    });
  });
}

function setupAIBindings() {
  const form = document.getElementById('ai-backtest-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const episodes = document.getElementById('ai-bt-episodes').value;
    const epsilon = document.getElementById('ai-bt-epsilon').value;
    const alpha = document.getElementById('ai-bt-alpha').value;
    const gamma = document.getElementById('ai-bt-gamma').value;

    showToast("Running AI Backtest Simulation...", "info");

    try {
      const res = await fetch('/api/ai/backtest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ episodes, explorationRate: epsilon, learningRate: alpha, discountFactor: gamma })
      });
      const data = await res.json();
      if (data.success) {
        showToast("AI Backtest Optimization Complete!", "success");
        document.getElementById('ai-bt-winrate').innerText = `Win Rate: ${data.winRate}%`;
        document.getElementById('ai-bt-balance').innerText = `Final Balance: ₹${data.finalBalance.toLocaleString(undefined, {maximumFractionDigits: 2})}`;
        drawBacktestCurve(data.balanceHistory);
        pollAPI(); // refresh stats
      } else {
        showToast("Error running backtest.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error running backtest.", "error");
    }
  });
}

function drawBacktestCurve(history) {
  if (!backtestCanvas || !backtestCtx || history.length === 0) return;

  const w = backtestCanvas.width / window.devicePixelRatio;
  const h = backtestCanvas.height / window.devicePixelRatio;

  backtestCtx.clearRect(0, 0, w, h);

  let maxBalance = Math.max(...history);
  let minBalance = Math.min(...history);
  const spread = maxBalance - minBalance;
  
  maxBalance += spread * 0.1 || 1000;
  minBalance -= spread * 0.1 || 1000;

  const getX = (idx) => (idx / (history.length - 1)) * (w - 20) + 10;
  const getY = (bal) => h - ((bal - minBalance) / (maxBalance - minBalance)) * (h - 20) - 10;

  // Draw chart grids
  backtestCtx.strokeStyle = state.theme === 'dark' ? '#22272e' : '#e2e8f0';
  backtestCtx.lineWidth = 1;
  backtestCtx.beginPath();
  backtestCtx.moveTo(0, h/2);
  backtestCtx.lineTo(w, h/2);
  backtestCtx.stroke();

  // Draw Line
  backtestCtx.strokeStyle = '#00c853'; // green line for returns
  backtestCtx.lineWidth = 2;
  backtestCtx.beginPath();
  backtestCtx.moveTo(getX(0), getY(history[0]));

  for (let i = 1; i < history.length; i++) {
    backtestCtx.lineTo(getX(i), getY(history[i]));
  }
  backtestCtx.stroke();

  // Draw Points
  backtestCtx.fillStyle = '#00b0ff';
  backtestCtx.beginPath();
  backtestCtx.arc(getX(history.length - 1), getY(history[history.length - 1]), 4, 0, 2 * Math.PI);
  backtestCtx.fill();
}

function copyAITradeToPanel(symbol, type, price) {
  // 1. Switch to trading tab
  switchView('trade');
  
  // 2. Set the symbol in select control
  const tradeSelect = document.getElementById('trade-symbol-selector');
  if (tradeSelect) {
    tradeSelect.value = symbol;
    tradeSelect.dispatchEvent(new Event('change'));
  }
  
  // 3. Enable Limit mode
  const limitBtn = document.getElementById('ordertype-limit-btn');
  if (limitBtn) {
    limitBtn.click();
  }
  
  // 4. Fill price input field
  const priceInput = document.getElementById('order-limit-price');
  if (priceInput) {
    priceInput.value = price.toFixed(2);
  }
  
  showToast(`Copied AI Trade preset: ${type} ${symbol} @ ₹${price.toFixed(2)}!`, "success");
}
function pollAITopPicks() {
  const container = document.getElementById('dash-ai-picks');
  if (!container) return;
  
  fetch('/api/ai/top-picks')
    .then(res => res.json())
    .then(picks => {
      if (picks.length === 0) {
        container.innerHTML = `
          <div class="col-span-full py-4 text-center text-on-surface-variant text-xs">
            AI Agent is currently analyzing patterns...
          </div>
        `;
        return;
      }
      
      const currencySymbol = '₹';
      container.innerHTML = picks.map(p => {
        const isBuy = p.type === 'BUY';
        const typeClass = isBuy ? 'bg-secondary/15 text-secondary border-secondary/20' : 'bg-error/15 text-error border-error/20';
        const indicatorBorder = isBuy ? 'border-secondary' : 'border-error';

        return `
          <div class="glass-panel p-3.5 rounded-xl border-l-4 ${indicatorBorder} bg-surface-container-lowest/30 flex flex-col gap-2 relative group hover:shadow-md transition-all">
            <div class="flex justify-between items-start">
              <span class="text-xs font-bold text-on-surface">${p.symbol}</span>
              <span class="px-2 py-0.5 rounded text-[8px] font-extrabold uppercase border ${typeClass}">${p.type}</span>
            </div>
            <div class="text-[10px] text-on-surface-variant line-clamp-2 leading-relaxed">
              ${p.reason}
            </div>
            <div class="flex justify-between items-center mt-1 border-t border-outline-variant/10 pt-1.5 text-[10px]">
              <span class="font-data-mono font-bold text-primary">${currencySymbol}${p.price.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1})}</span>
              <button onclick="executeAIPickPreset('${p.symbol}', '${p.type}', ${p.price})" class="text-[8px] font-bold uppercase text-primary hover:underline flex items-center gap-0.5">
                Trade
                <i data-lucide="arrow-right" class="w-2.5 h-2.5"></i>
              </button>
            </div>
          </div>
        `;
      }).join('');
      
      safeCreateIcons();
    })
    .catch(err => console.error("Error polling AI top picks:", err));
}

function executeAIPickPreset(symbol, type, price) {
  switchView('trade');
  const tradeSelect = document.getElementById('trade-symbol-selector');
  if (tradeSelect) {
    tradeSelect.value = symbol;
    tradeSelect.dispatchEvent(new Event('change'));
  }
  const limitBtn = document.getElementById('ordertype-limit-btn');
  if (limitBtn) limitBtn.click();
  
  const priceInput = document.getElementById('order-limit-price');
  if (priceInput) priceInput.value = price.toFixed(2);
  
  showToast(`Loaded AI Top Pick: ${type} ${symbol} @ ₹${price.toFixed(2)}!`, "info");
}

function updateAICopilot() {
  const card = document.getElementById('ai-copilot-card');
  const statusEl = document.getElementById('ai-copilot-status');
  const recEl = document.getElementById('ai-copilot-recommendation');
  const actionsEl = document.getElementById('ai-copilot-actions');
  const applyBtn = document.getElementById('ai-copilot-apply-btn');
  
  if (!card || !recEl) return;
  
  const currentSymbol = state.orderForm.symbol;
  
  // 1. Look for active AI prediction first
  const activeAiTrade = (state.recentAiTrades || []).find(t => t.symbol === currentSymbol && t.status === 'ACTIVE');
  
  // 2. Look for active rule-based signal as fallback
  const activeSignal = (state.signals || []).find(s => s.symbol === currentSymbol && !s.locked);
  
  if (activeAiTrade) {
    const isBuy = activeAiTrade.predicted_action === 1;
    const typeLabel = isBuy ? 'BUY' : 'SHORT';
    
    statusEl.innerText = "Active AI Trade";
    statusEl.className = "text-[8px] font-extrabold uppercase bg-secondary/20 text-secondary border border-secondary/20 px-2 py-0.5 rounded";
    
    let pnlHtml = '<span class="text-on-surface-variant italic">Calculating...</span>';
    const currentPriceData = state.marketPrices[currentSymbol];
    const currencySymbol = '₹';
    if (currentPriceData) {
      const currentPrice = currentPriceData.price;
      const priceDiff = ((currentPrice - activeAiTrade.entry_price) / activeAiTrade.entry_price) * 100;
      let pnl = 0.0;
      if (activeAiTrade.predicted_action === 1) { // BUY
        pnl = priceDiff * 1000.00;
      } else if (activeAiTrade.predicted_action === 2) { // SHORT
        pnl = -priceDiff * 1000.00;
      }
      const isProfit = pnl >= 0;
      pnlHtml = `<span class="${isProfit ? 'text-secondary' : 'text-error'} font-bold">${isProfit ? '+' : ''}${currencySymbol}${pnl.toFixed(2)}</span>`;
    }

    recEl.innerHTML = `
      <div class="flex flex-col gap-1.5">
        <p class="font-semibold text-on-surface">🤖 AI suggests: <span class="${isBuy ? 'text-secondary' : 'text-error'} font-extrabold">${typeLabel} ${currentSymbol}</span></p>
        <p class="text-[10px] text-on-surface-variant leading-relaxed">The AI agent entered a trade at <span class="font-bold text-primary">₹${activeAiTrade.entry_price.toFixed(2)}</span>. Live P&L: ${pnlHtml}. Click below to mirror this entry setup.</p>
      </div>
    `;
    actionsEl.classList.remove('hidden');
    
    applyBtn.onclick = () => {
      const limitBtn = document.getElementById('ordertype-limit-btn');
      if (limitBtn) limitBtn.click();
      
      const priceInput = document.getElementById('order-limit-price');
      if (priceInput) priceInput.value = activeAiTrade.entry_price.toFixed(2);
      
      const targetBtn = isBuy ? document.getElementById('order-buy-btn') : document.getElementById('order-sell-btn');
      if (targetBtn) {
        targetBtn.classList.add('ring-4', 'ring-primary', 'scale-105');
        setTimeout(() => {
          targetBtn.classList.remove('ring-4', 'ring-primary', 'scale-105');
        }, 1500);
      }
      
      showToast(`AI setup loaded! Click the highlighted button to execute.`, "success");
    };
  } else if (activeSignal) {
    const isBuy = activeSignal.type === 'BUY';
    const currencySymbol = '₹';
    
    statusEl.innerText = "Technical Signal";
    statusEl.className = "text-[8px] font-extrabold uppercase bg-primary/20 text-primary border border-primary/20 px-2 py-0.5 rounded";
    
    recEl.innerHTML = `
      <div class="flex flex-col gap-1.5">
        <p class="font-semibold text-on-surface">📈 Strategy Pick: <span class="${isBuy ? 'text-secondary' : 'text-error'} font-extrabold">${activeSignal.type} ${currentSymbol}</span></p>
        <p class="text-[10px] text-on-surface-variant leading-relaxed">Trigger: <span class="font-semibold text-primary">${activeSignal.strategy_name}</span>. Entry: <span class="font-bold">₹${activeSignal.entry_price.toFixed(2)}</span>. Target 1: <span class="font-bold text-secondary">₹${activeSignal.t1.toFixed(2)}</span>. Stop Loss: <span class="font-bold text-error">₹${activeSignal.sl.toFixed(2)}</span>.</p>
      </div>
    `;
    actionsEl.classList.remove('hidden');
    
    applyBtn.onclick = () => {
      const limitBtn = document.getElementById('ordertype-limit-btn');
      if (limitBtn) limitBtn.click();
      
      const priceInput = document.getElementById('order-limit-price');
      if (priceInput) priceInput.value = activeSignal.entry_price.toFixed(2);
      
      const targetBtn = isBuy ? document.getElementById('order-buy-btn') : document.getElementById('order-sell-btn');
      if (targetBtn) {
        targetBtn.classList.add('ring-4', 'ring-primary', 'scale-105');
        setTimeout(() => {
          targetBtn.classList.remove('ring-4', 'ring-primary', 'scale-105');
        }, 1500);
      }
      
      showToast(`Signal setup loaded! Click the highlighted button to execute.`, "success");
    };
  } else {
    // Dynamic real-time AI analysis for ANY selected symbol
    const sym = currentSymbol || 'RELIANCE';
    const priceObj = state.marketPrices[sym];
    const livePrice = priceObj ? priceObj.price : 1270.0;
    const isBullish = priceObj ? priceObj.change_percent >= 0 : true;
    const typeLabel = isBullish ? 'BUY' : 'SHORT';
    const entryP = livePrice;
    const targetP = isBullish ? livePrice * 1.015 : livePrice * 0.985;
    const stopP = isBullish ? livePrice * 0.992 : livePrice * 1.008;

    statusEl.innerText = "Dynamic AI Analysis";
    statusEl.className = "text-[8px] font-extrabold uppercase bg-secondary/20 text-secondary border border-secondary/20 px-2 py-0.5 rounded";

    recEl.innerHTML = `
      <div class="flex flex-col gap-1.5">
        <p class="font-semibold text-on-surface">⚡ Live AI Setup: <span class="${isBullish ? 'text-secondary' : 'text-error'} font-extrabold">${typeLabel} ${sym}</span></p>
        <p class="text-[10px] text-on-surface-variant leading-relaxed">Trigger: <span class="font-semibold text-primary">Multi-Indicator Confluence</span>. Entry: <span class="font-bold">₹${entryP.toFixed(2)}</span>. Target 1: <span class="font-bold text-secondary">₹${targetP.toFixed(2)}</span>. Stop Loss: <span class="font-bold text-error">₹${stopP.toFixed(2)}</span>.</p>
      </div>
    `;
    actionsEl.classList.remove('hidden');

    applyBtn.onclick = () => {
      const limitBtn = document.getElementById('ordertype-limit-btn');
      if (limitBtn) limitBtn.click();

      const priceInput = document.getElementById('order-limit-price');
      if (priceInput) priceInput.value = entryP.toFixed(2);

      const targetBtn = isBullish ? document.getElementById('order-buy-btn') : document.getElementById('order-sell-btn');
      if (targetBtn) {
        targetBtn.classList.add('ring-4', 'ring-primary', 'scale-105');
        setTimeout(() => {
          targetBtn.classList.remove('ring-4', 'ring-primary', 'scale-105');
        }, 1500);
      }

      showToast(`AI Setup for ${sym} loaded! Click highlighted button to execute.`, "success");
    };
  }
}

function pollAIPatterns() {
  const tbody = document.getElementById('ai-patterns-tbody');
  if (!tbody) return;

  fetch('/api/ai/patterns')
    .then(res => res.json())
    .then(patterns => {
      if (patterns.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="4" class="p-4 text-center text-on-surface-variant font-body-base text-xs">Waiting for Q-table records to analyze patterns...</td>
          </tr>
        `;
        return;
      }

      tbody.innerHTML = patterns.map(p => {
        // Humanize the pattern state string
        const parts = p.state.split('|');
        const stateDesc = parts.slice(3).join(', '); // EMA, VWAP, SMC details
        
        return `
          <tr class="border-b border-outline-variant/10 hover:bg-surface-variant/20 transition-colors">
            <td class="p-3">
              <span class="font-bold text-on-surface block text-[11px]">${parts[0]} • ${parts[1]}</span>
              <span class="text-[9px] text-on-surface-variant font-semibold block mt-0.5">${stateDesc}</span>
            </td>
            <td class="p-3 text-center font-bold text-primary font-data-mono">${p.totalSeen}</td>
            <td class="p-3 text-center text-secondary font-data-mono">${p.upwardMoves}</td>
            <td class="p-3 text-right">
              <span class="px-2 py-0.5 rounded text-[10px] font-bold ${p.successRate >= 65 ? 'bg-secondary/15 text-secondary border border-secondary/20 font-data-mono' : 'bg-primary/10 text-primary border border-primary/20 font-data-mono'}">
                ${p.successRate}%
              </span>
            </td>
          </tr>
        `;
      }).join('');
    })
    .catch(err => console.error("Error polling pattern analytics:", err));
}

function sendQuickPrompt(promptText) {
  const input = document.getElementById('ai-chat-input');
  if (input) {
    input.value = promptText;
    const form = document.getElementById('ai-chat-form');
    if (form) {
      // Dispatch submit event cleanly
      form.dispatchEvent(new Event('submit'));
    }
  }
}

function setupAIChat() {
  const form = document.getElementById('ai-chat-form');
  const input = document.getElementById('ai-chat-input');
  const chatBox = document.getElementById('ai-chat-box');

  if (!form || !input || !chatBox) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = input.value.trim();
    if (!message) return;

    input.value = '';

    // Append user message bubble
    const userBubble = document.createElement('div');
    userBubble.className = 'flex gap-2.5 justify-end';
    userBubble.innerHTML = `
      <div class="p-3 bg-primary text-white rounded-xl leading-relaxed max-w-[85%] text-xs">
        ${message}
      </div>
      <div class="p-1.5 bg-primary rounded text-white h-fit"><i data-lucide="user" class="w-3.5 h-3.5"></i></div>
    `;
    chatBox.appendChild(userBubble);
    chatBox.scrollTop = chatBox.scrollHeight;
    safeCreateIcons();

    // Append typing bubble
    const typingBubble = document.createElement('div');
    typingBubble.className = 'flex gap-2.5';
    typingBubble.innerHTML = `
      <div class="p-1.5 bg-primary/10 rounded text-primary h-fit"><i data-lucide="brain-circuit" class="w-3.5 h-3.5"></i></div>
      <div id="ai-chat-typing" class="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/10 text-on-surface-variant max-w-[85%] font-semibold">
        Thinking...
      </div>
    `;
    chatBox.appendChild(typingBubble);
    chatBox.scrollTop = chatBox.scrollHeight;
    safeCreateIcons();

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, symbol: state.orderForm.symbol })
      });
      const data = await res.json();
      
      // Remove typing bubble
      if (chatBox.contains(typingBubble)) {
        chatBox.removeChild(typingBubble);
      }

      // Append AI response bubble with formatting replacement (for markdown breaks)
      const aiReply = data.reply.replace(/\n/g, '<br>');
      const botBubble = document.createElement('div');
      botBubble.className = 'flex gap-2.5';
      botBubble.innerHTML = `
        <div class="p-1.5 bg-primary/10 rounded text-primary h-fit"><i data-lucide="brain-circuit" class="w-3.5 h-3.5"></i></div>
        <div class="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/10 leading-relaxed text-on-surface-variant max-w-[85%]">
          ${aiReply}
        </div>
      `;
      chatBox.appendChild(botBubble);
      chatBox.scrollTop = chatBox.scrollHeight;
      safeCreateIcons();
    } catch (err) {
      console.error(err);
      if (chatBox.contains(typingBubble)) {
        chatBox.removeChild(typingBubble);
      }
      showToast("Error connecting to AI Trading Brain.", "error");
    }
  });
}

// ----------------- SCANNER & NEWS DATA FETCHERS -----------------
function loadScannerData() {
  const tbody = document.getElementById('scanner-picks-tbody');
  const breakoutList = document.getElementById('scanner-breakouts-list');
  if (!tbody || !breakoutList) return;

  const defaultPicks = [
    { rank: 1, symbol: 'RELIANCE', price: 1272.80, change_percent: 2.45, signal: 'BUY', confidence: 94 },
    { rank: 2, symbol: 'TCS', price: 2443.50, change_percent: 1.85, signal: 'BUY', confidence: 91 },
    { rank: 3, symbol: 'INFY', price: 1152.90, change_percent: -0.65, signal: 'SHORT', confidence: 88 },
    { rank: 4, symbol: 'HDFCBANK', price: 750.40, change_percent: 1.20, signal: 'BUY', confidence: 86 },
    { rank: 5, symbol: 'ICICIBANK', price: 1438.90, change_percent: 0.95, signal: 'BUY', confidence: 84 },
    { rank: 6, symbol: 'SBIN', price: 1013.60, change_percent: 1.50, signal: 'BUY', confidence: 82 },
    { rank: 7, symbol: 'TATAMOTORS', price: 958.20, change_percent: 2.10, signal: 'BUY', confidence: 80 },
    { rank: 8, symbol: 'NIFTY 50', price: 24226.50, change_percent: 0.85, signal: 'BUY', confidence: 78 },
    { rank: 9, symbol: 'BANK NIFTY', price: 57239.40, change_percent: 1.15, signal: 'BUY', confidence: 76 },
    { rank: 10, symbol: 'FIN NIFTY', price: 28742.25, change_percent: 0.75, signal: 'BUY', confidence: 74 }
  ];

  const defaultBreakouts = [
    { symbol: 'RELIANCE', change_percent: 2.45 },
    { symbol: 'TATAMOTORS', change_percent: 2.10 },
    { symbol: 'TCS', change_percent: 1.85 },
    { symbol: 'SBIN', change_percent: 1.50 }
  ];

  const renderScanner = (picks, breakouts) => {
    const currencySymbol = '₹';
    tbody.innerHTML = picks.map(pick => {
      const isBuy = pick.signal === 'BUY';
      const typeClass = isBuy ? 'bg-secondary/20 text-secondary border-secondary/20' : 'bg-error/20 text-error border-error/20';
      const changeClass = pick.change_percent >= 0 ? 'text-secondary' : 'text-error';

      return `
        <tr class="border-b border-outline-variant/10 hover:bg-surface-container-low/50 transition-colors cursor-pointer" onclick="executeAIPickPreset('${pick.symbol}', '${pick.signal}', ${pick.price})">
          <td class="p-3 font-bold text-primary">#${pick.rank}</td>
          <td class="p-3 font-bold text-on-surface">${pick.symbol}</td>
          <td class="p-3">${currencySymbol}${pick.price.toFixed(2)}</td>
          <td class="p-3 ${changeClass} font-bold">${pick.change_percent >= 0 ? '+' : ''}${pick.change_percent.toFixed(2)}%</td>
          <td class="p-3"><span class="px-2 py-0.5 rounded border text-[9px] font-bold ${typeClass}">${pick.signal}</span></td>
          <td class="p-3 text-right font-bold text-primary">${pick.confidence}%</td>
        </tr>
      `;
    }).join('');

    breakoutList.innerHTML = breakouts.map(item => {
      const isGreen = item.change_percent >= 0;
      const colorClass = isGreen ? 'text-secondary' : 'text-error';
      return `
        <div class="flex justify-between items-center p-2 rounded bg-surface-container-low border border-outline-variant/10">
          <span class="font-bold text-on-surface">${item.symbol}</span>
          <span class="font-bold ${colorClass}">${isGreen ? '+' : ''}${item.change_percent.toFixed(2)}%</span>
        </div>
      `;
    }).join('');
  };

  fetch('/api/scanner')
    .then(res => res.json())
    .then(data => {
      if (data && data.topPicks && data.topPicks.length > 0) {
        renderScanner(data.topPicks, data.breakouts);
      } else {
        renderScanner(defaultPicks, defaultBreakouts);
      }
    })
    .catch(err => {
      renderScanner(defaultPicks, defaultBreakouts);
    });
}

function loadNewsData() {
  const container = document.getElementById('news-feed-container');
  if (!container) return;

  const defaultNews = [
    { id: 1, title: "Reliance Industries Reports Strong Q1 Margin Expansion in Retail & Telecom", source: "Economic Times", symbol: "RELIANCE", timestamp: new Date().toISOString(), sentiment: "Positive", score: 0.85, impact: "High Bullish Impact" },
    { id: 2, title: "RBI Keeps Repo Rate Unchanged; Banking Sector Rallies as Inflation Cools", source: "Moneycontrol", symbol: "BANK NIFTY", timestamp: new Date(Date.now() - 3600000).toISOString(), sentiment: "Positive", score: 0.72, impact: "Bullish Impact" },
    { id: 3, title: "TCS Secures $1.2B Multi-Year Cloud Transformation Deal with US Retailer", source: "LiveMint", symbol: "TCS", timestamp: new Date(Date.now() - 7200000).toISOString(), sentiment: "Positive", score: 0.91, impact: "High Bullish Impact" },
    { id: 4, title: "IT Sector Sees Muted Short-Term Spends Amid Global Macro Uncertainties", source: "CNBC TV18", symbol: "INFY", timestamp: new Date(Date.now() - 14400000).toISOString(), sentiment: "Negative", score: -0.45, impact: "Bearish Pullback" },
    { id: 5, title: "HDFC Bank Credit Growth Outpaces Market; Net Interest Margin Stabilizes", source: "Business Standard", symbol: "HDFCBANK", timestamp: new Date(Date.now() - 21600000).toISOString(), sentiment: "Positive", score: 0.78, impact: "Bullish Impact" }
  ];

  const renderNews = (newsItems) => {
    container.innerHTML = newsItems.map(item => {
      const isPos = item.sentiment === 'Positive';
      const tagClass = isPos ? 'bg-secondary/20 text-secondary border-secondary/20' : 'bg-error/20 text-error border-error/20';

      return `
        <div class="glass-panel p-4 rounded-xl border border-outline-variant/30 flex flex-col gap-2.5">
          <div class="flex justify-between items-start gap-2">
            <span class="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border ${tagClass}">${item.sentiment} (${item.score > 0 ? '+' : ''}${item.score})</span>
            <span class="text-[9px] text-on-surface-variant font-semibold">${item.source} • ${formatTimestamp(item.timestamp)}</span>
          </div>
          <h4 class="text-xs font-bold text-on-surface leading-snug">${item.title}</h4>
          <div class="flex justify-between items-center text-[10px] text-on-surface-variant pt-2 border-t border-outline-variant/10">
            <span class="font-bold text-primary">Symbol: ${item.symbol}</span>
            <span class="font-semibold text-secondary">${item.impact}</span>
          </div>
        </div>
      `;
    }).join('');
  };

  fetch('/api/news')
    .then(res => res.json())
    .then(newsItems => {
      if (Array.isArray(newsItems) && newsItems.length > 0) {
        renderNews(newsItems);
      } else {
        renderNews(defaultNews);
      }
    })
    .catch(err => {
      renderNews(defaultNews);
    });
}

function executeAIPickPreset(symbol, signalType, price) {
  state.orderForm.symbol = symbol;
  state.orderForm.type = signalType === 'BUY' ? 'BUY' : 'SHORT';
  switchView('trade');
  showToast(`Loaded AI Pick preset for ${symbol}!`, "info");
}

// ----------------- APPLICATION INITIALIZER -----------------
window.addEventListener('DOMContentLoaded', () => {
  // Lucide icons hydration
  safeCreateIcons();

  // Setup UI behaviors
  setupTabRouting();
  setupThemeToggle();
  setupLanguageSelector();
  setupTradingPanel();
  setupChart();
  setupJournalForm();
  setupSubscriptions();
  setupAdminPanel();
  setupPWAFeatures();
  setupAIBindings();
  setupAIChat();

  // Mobile navigation button overlays binding
  document.getElementById('sidebar-toggle-btn').addEventListener('click', () => toggleSidebar(true));
  document.getElementById('sidebar-close-btn').addEventListener('click', () => toggleSidebar(false));
  document.getElementById('sidebar-overlay').addEventListener('click', () => toggleSidebar(false));

  // Initialize and run the polling engine
  startSync();
  loadSignals();
  loadJournals();
});
