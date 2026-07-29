/**
 * TradeMaster AI Terminal - Pure Standalone Real-Time Client Engine
 * Version: 2.0.0
 */

// ----------------- GLOBAL REACTIVE STATE -----------------
const state = {
  currentLanguage: 'EN',
  activeView: 'dashboard',
  theme: 'dark',
  user: {
    subscription_tier: 'Free',
    paper_balance: 100000.00
  },
  marketPrices: {
    'RELIANCE': { symbol: 'RELIANCE', price: 1272.80, change_percent: 2.45, high_24h: 1285.00, low_24h: 1250.00, volume: 450000 },
    'TCS': { symbol: 'TCS', price: 2443.50, change_percent: 1.85, high_24h: 2460.00, low_24h: 2420.00, volume: 320000 },
    'INFY': { symbol: 'INFY', price: 1152.90, change_percent: -0.65, high_24h: 1170.00, low_24h: 1145.00, volume: 280000 },
    'HDFCBANK': { symbol: 'HDFCBANK', price: 750.40, change_percent: 1.20, high_24h: 758.00, low_24h: 742.00, volume: 510000 },
    'ICICIBANK': { symbol: 'ICICIBANK', price: 1438.90, change_percent: 0.95, high_24h: 1450.00, low_24h: 1425.00, volume: 390000 },
    'SBIN': { symbol: 'SBIN', price: 1013.60, change_percent: 1.50, high_24h: 1025.00, low_24h: 1002.00, volume: 620000 },
    'TATAMOTORS': { symbol: 'TATAMOTORS', price: 958.20, change_percent: 2.10, high_24h: 968.00, low_24h: 940.00, volume: 410000 },
    'NIFTY 50': { symbol: 'NIFTY 50', price: 24226.50, change_percent: 0.85, high_24h: 24300.00, low_24h: 24100.00, volume: 950000 },
    'BANK NIFTY': { symbol: 'BANK NIFTY', price: 57239.40, change_percent: 1.15, high_24h: 57500.00, low_24h: 56900.00, volume: 820000 },
    'FIN NIFTY': { symbol: 'FIN NIFTY', price: 28742.25, change_percent: 0.75, high_24h: 28900.00, low_24h: 28600.00, volume: 730000 }
  },
  activePositions: [
    { id: 101, symbol: 'RELIANCE', type: 'BUY', order_type: 'MARKET', size: 20, entry_price: 1265.00, current_price: 1272.80, unrealized_pnl: 156.00, timestamp: new Date().toISOString() }
  ],
  closedLedger: [
    { id: 99, symbol: 'TCS', type: 'BUY', size: 10, entry_price: 2410.00, exit_price: 2440.00, unrealized_pnl: 300.00, timestamp: new Date(Date.now() - 86400000).toISOString() }
  ],
  signals: [
    { id: 1, symbol: 'RELIANCE', strategy_name: 'EMA 20/50 Confluence', category: 'Trend', type: 'BUY', is_premium: 0, entry_price: 1270.00, sl: 1255.00, t1: 1288.00, t2: 1300.00, t3: 1320.00, timestamp: new Date().toISOString() },
    { id: 2, symbol: 'TCS', strategy_name: 'SMC FVG Rejection', category: 'SMC', type: 'BUY', is_premium: 1, entry_price: 2440.00, sl: 2415.00, t1: 2470.00, t2: 2500.00, t3: 2540.00, timestamp: new Date().toISOString() },
    { id: 3, symbol: 'INFY', strategy_name: 'RSI Bearish Divergence', category: 'Momentum', type: 'SELL', is_premium: 0, entry_price: 1155.00, sl: 1168.00, t1: 1140.00, t2: 1125.00, t3: 1100.00, timestamp: new Date().toISOString() },
    { id: 4, symbol: 'SBIN', strategy_name: 'Volume Breakout', category: 'Breakout', type: 'BUY', is_premium: 0, entry_price: 1012.00, sl: 998.00, t1: 1030.00, t2: 1045.00, t3: 1060.00, timestamp: new Date().toISOString() }
  ],
  journals: [
    { id: 1, symbol: 'RELIANCE', strategy: 'EMA Crossover', emotion: 'Disciplined', notes: 'Waited for candle close above EMA 20. Target hit cleanly.', reflection: 'Patience pays off.', timestamp: new Date().toISOString() }
  ],
  orderForm: {
    type: 'BUY',
    orderType: 'MARKET',
    symbol: 'RELIANCE'
  },
  aiState: {
    statesLearned: 48,
    accuracy: 76.4,
    totalPredictions: 124,
    netReward: 18.5,
    qtable: [
      { state_string: 'RELIANCE|15m|EMA_ABOVE_20', action: 1, q_value: 1.85 },
      { state_string: 'RELIANCE|15m|EMA_ABOVE_20', action: 0, q_value: 0.12 },
      { state_string: 'RELIANCE|15m|EMA_ABOVE_20', action: 2, q_value: -1.20 },
      { state_string: 'TCS|5m|SMC_FVG_SUPPORT', action: 1, q_value: 1.62 },
      { state_string: 'TCS|5m|SMC_FVG_SUPPORT', action: 0, q_value: 0.05 },
      { state_string: 'TCS|5m|SMC_FVG_SUPPORT', action: 2, q_value: -0.95 },
      { state_string: 'INFY|1h|RSI_OVERBOUGHT', action: 2, q_value: 1.45 },
      { state_string: 'INFY|1h|RSI_OVERBOUGHT', action: 0, q_value: -0.20 },
      { state_string: 'INFY|1h|RSI_OVERBOUGHT', action: 1, q_value: -1.15 },
      { state_string: 'SBIN|15m|BREAKOUT_VOL', action: 1, q_value: 1.78 },
      { state_string: 'SBIN|15m|BREAKOUT_VOL', action: 0, q_value: 0.10 },
      { state_string: 'SBIN|15m|BREAKOUT_VOL', action: 2, q_value: -1.40 }
    ],
    predictions: [
      { id: 1, symbol: 'RELIANCE', predicted_action: 1, status: 'CLOSED', pnl: 4850.00, reward: 2.5, reward_points: 25, user_feedback: 'LIKE', explanation: 'Confluence of 15m EMA 20/50 cross + RSI strength > 55.' },
      { id: 2, symbol: 'TCS', predicted_action: 1, status: 'CLOSED', pnl: 2300.00, reward: 1.8, reward_points: 18, user_feedback: 'LIKE', explanation: 'Order block liquidity grab + high volume confirmation.' },
      { id: 3, symbol: 'INFY', predicted_action: 2, status: 'CLOSED', pnl: -1200.00, reward: -0.8, reward_points: -8, user_feedback: 'DISLIKE', explanation: 'Short position stopped out during unexpected sector news rally.' },
      { id: 4, symbol: 'SBIN', predicted_action: 1, status: 'ACTIVE', entry_price: 1013.60, reward: 1.5, reward_points: 15, user_feedback: 'NONE', explanation: 'Consolidation breakout above daily resistance.' }
    ]
  }
};

// Global Lucide Icon Hydrator
function safeCreateIcons() {
  if (typeof lucide !== 'undefined' && lucide.createIcons) {
    try { lucide.createIcons(); } catch (e) {}
  }
}

// ----------------- TOAST NOTIFICATIONS -----------------
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  let bgClass = 'bg-surface-container border-primary/40 shadow-primary/5';
  let iconName = 'info';
  let iconColor = 'text-primary';

  if (type === 'success') {
    bgClass = 'bg-surface-container border-secondary/40 shadow-secondary/5';
    iconName = 'check-circle-2';
    iconColor = 'text-secondary';
  } else if (type === 'error') {
    bgClass = 'bg-surface-container border-error/40 shadow-error/5';
    iconName = 'alert-circle';
    iconColor = 'text-error';
  }

  toast.className = `flex items-center gap-3 p-4 rounded-xl border shadow-lg ${bgClass} fade-in transform transition-all duration-300 max-w-full z-[100]`;
  toast.innerHTML = `
    <div class="${iconColor} shrink-0"><i data-lucide="${iconName}" class="w-5 h-5"></i></div>
    <div class="flex-grow"><p class="text-xs font-semibold text-on-surface leading-normal">${message}</p></div>
    <button class="text-on-surface-variant hover:text-on-surface" onclick="this.parentElement.remove()"><i data-lucide="x" class="w-4 h-4"></i></button>
  `;

  container.appendChild(toast);
  safeCreateIcons();
  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-[-6px]');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// ----------------- ROUTING & VIEW SWITCHING -----------------
function switchView(viewName) {
  state.activeView = viewName;
  window.history.pushState(null, null, `#${viewName}`);

  document.querySelectorAll('.view-section').forEach(section => {
    section.classList.add('hidden');
    section.classList.remove('active');
  });

  const activeSection = document.getElementById(`view-${viewName}`);
  if (activeSection) {
    activeSection.classList.remove('hidden');
    activeSection.classList.add('active');
  }

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

  // Execute view specific renderers
  if (viewName === 'dashboard') {
    initTradingViewWidget();
  } else if (viewName === 'signals') {
    renderSignalsGrid();
  } else if (viewName === 'scanner') {
    renderScannerData();
  } else if (viewName === 'news') {
    renderNewsData();
  } else if (viewName === 'trade') {
    updateMaxBuyingPower();
    updateOrderEstimates();
    renderActivePositionsTable();
    renderTradeHistoryLedger();
  } else if (viewName === 'ai') {
    renderAIMetrics();
    renderQTableHeatmap();
    renderAIPredictionsTable();
  }
}

function setupTabRouting() {
  document.querySelectorAll('[data-view-target]').forEach(element => {
    element.addEventListener('click', (e) => {
      e.preventDefault();
      const target = element.getAttribute('data-view-target');
      switchView(target);
      toggleSidebar(false);
    });
  });

  const hash = window.location.hash.replace('#', '');
  if (hash && document.getElementById(`view-${hash}`)) {
    switchView(hash);
  } else {
    switchView('dashboard');
  }
}

function toggleSidebar(show) {
  const sidebar = document.getElementById('mobile-sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  if (!sidebar || !overlay) return;

  if (show) {
    overlay.classList.remove('hidden');
    sidebar.classList.remove('-translate-x-full');
  } else {
    overlay.classList.add('hidden');
    sidebar.classList.add('-translate-x-full');
  }
}

// ----------------- TRADINGVIEW & CHART EMBED -----------------
function initTradingViewWidget() {
  const container = document.getElementById('tradingview-dashboard-widget') || document.getElementById('tradingview-trade-widget');
  if (!container || typeof TradingView === 'undefined') return;

  container.innerHTML = '';
  const sym = state.orderForm.symbol || 'RELIANCE';

  new TradingView.widget({
    "autosize": true,
    "symbol": `NSE:${sym}`,
    "interval": "15",
    "timezone": "Asia/Kolkata",
    "theme": "dark",
    "style": "1",
    "locale": "en",
    "toolbar_bg": "#0f172a",
    "enable_publishing": false,
    "hide_side_toolbar": false,
    "allow_symbol_change": true,
    "container_id": container.id
  });
}

function switchChartProvider(provider) {
  const container = document.getElementById('tradingview-trade-widget');
  if (!container) return;
  const sym = state.orderForm.symbol || 'RELIANCE';

  if (provider === 'gocharting') {
    container.innerHTML = `<iframe src="https://gocharting.com/terminal?symbol=NSE:${sym}" class="w-full h-full border-0"></iframe>`;
    showToast("Switched to GoCharting Order Flow Terminal", "info");
  } else {
    initTradingViewWidget();
    showToast("Switched to TradingView Pro", "info");
  }
}

function changeChartTimeframe(tf) {
  state.selectedTimeframe = tf;
  initTradingViewWidget();
  showToast(`Chart Timeframe updated to ${tf}`, "info");
}

// ----------------- MARKET UI & LIVE TICKER -----------------
function populateSymbolDropdowns() {
  const tradeSelect = document.getElementById('trade-symbol-selector');
  const adminPriceSelect = document.getElementById('admin-override-symbol');
  const adminSigSelect = document.getElementById('admin-sig-symbol');
  const symbols = Object.keys(state.marketPrices).sort();

  const populate = (selectEl) => {
    if (!selectEl) return;
    const currentVal = selectEl.value;
    selectEl.innerHTML = '';
    symbols.forEach(sym => {
      const opt = document.createElement('option');
      opt.value = sym;
      opt.innerText = sym + (['NIFTY 50', 'BANK NIFTY', 'FIN NIFTY'].includes(sym) ? ' (Index)' : ' (Intraday 5x)');
      selectEl.appendChild(opt);
    });
    if (currentVal && symbols.includes(currentVal)) selectEl.value = currentVal;
  };

  populate(tradeSelect);
  populate(adminPriceSelect);
  populate(adminSigSelect);
}

function updateMarketUI() {
  // Update Ticker
  const ticker = document.getElementById('scrolling-ticker');
  if (ticker) {
    const list = Object.values(state.marketPrices);
    const doubled = [...list, ...list];
    ticker.innerHTML = doubled.map(data => {
      const isGreen = data.change_percent >= 0;
      return `
        <span class="font-data-mono text-xs flex items-center gap-2">
          <span class="text-on-surface-variant font-bold">${data.symbol}</span>
          <span class="${isGreen ? 'text-secondary' : 'text-error'} font-semibold">₹${data.price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
          <span class="${isGreen ? 'text-secondary' : 'text-error'} text-[10px]">${isGreen ? '+' : ''}${data.change_percent.toFixed(2)}%</span>
        </span>
      `;
    }).join('');
  }

  // Update Portfolio Balance Card
  const formattedBalance = `₹${state.user.paper_balance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  const dashBal = document.getElementById('dash-paper-balance');
  if (dashBal) dashBal.innerText = formattedBalance;
  const tradeBal = document.getElementById('trade-paper-balance');
  if (tradeBal) tradeBal.innerText = formattedBalance;

  // Update Top Gainers & Losers
  const gainersContainer = document.getElementById('dash-top-gainers');
  const losersContainer = document.getElementById('dash-top-losers');
  if (gainersContainer && losersContainer) {
    const list = Object.values(state.marketPrices);
    const sortedGainers = [...list].sort((a, b) => b.change_percent - a.change_percent).slice(0, 4);
    const sortedLosers = [...list].sort((a, b) => a.change_percent - b.change_percent).slice(0, 4);

    gainersContainer.innerHTML = sortedGainers.map(item => `
      <div class="flex justify-between items-center bg-secondary/5 border border-secondary/10 px-2 py-1 rounded-lg">
        <span class="text-on-surface font-semibold text-[10px]">${item.symbol}</span>
        <div class="text-right">
          <div class="text-on-surface text-[9px] font-bold">₹${item.price.toFixed(1)}</div>
          <div class="text-secondary text-[8px] font-extrabold">+${item.change_percent.toFixed(2)}%</div>
        </div>
      </div>
    `).join('');

    losersContainer.innerHTML = sortedLosers.map(item => `
      <div class="flex justify-between items-center bg-error/5 border border-error/10 px-2 py-1 rounded-lg">
        <span class="text-on-surface font-semibold text-[10px]">${item.symbol}</span>
        <div class="text-right">
          <div class="text-on-surface text-[9px] font-bold">₹${item.price.toFixed(1)}</div>
          <div class="text-error text-[8px] font-extrabold">${item.change_percent.toFixed(2)}%</div>
        </div>
      </div>
    `).join('');
  }

  // Update Active Positions P&L
  let totalPnl = 0;
  state.activePositions.forEach(pos => {
    const priceData = state.marketPrices[pos.symbol];
    if (priceData) {
      pos.current_price = priceData.price;
      const diff = pos.type === 'BUY' ? (pos.current_price - pos.entry_price) : (pos.entry_price - pos.current_price);
      pos.unrealized_pnl = parseFloat((diff * pos.size).toFixed(2));
    }
    totalPnl += (pos.unrealized_pnl || 0);
  });

  const pnlEl = document.getElementById('portfolio-today-pnl');
  if (pnlEl) {
    pnlEl.innerText = `${totalPnl >= 0 ? '+' : ''}₹${totalPnl.toFixed(2)} active P&L`;
    pnlEl.className = `font-semibold ${totalPnl >= 0 ? 'text-secondary' : 'text-error'}`;
  }

  const countEl = document.getElementById('active-positions-count');
  if (countEl) countEl.innerText = `${state.activePositions.length} Active`;
}

// ----------------- PAPER TRADING & ORDER EXECUTION -----------------
function setupTradingPanel() {
  const symbolSelector = document.getElementById('trade-symbol-selector');
  if (symbolSelector) {
    symbolSelector.addEventListener('change', (e) => {
      const selected = e.target.value;
      state.orderForm.symbol = selected;
      const symName = document.getElementById('trade-symbol-name');
      if (symName) symName.innerText = selected;
      const displaySym = document.getElementById('order-symbol-display');
      if (displaySym) displaySym.innerText = selected;

      updateMaxBuyingPower();
      updateOrderEstimates();
      initTradingViewWidget();
    });
  }

  document.getElementById('ordertype-market-btn')?.addEventListener('click', () => {
    state.orderForm.orderType = 'MARKET';
    document.getElementById('ordertype-market-btn').className = "flex-1 py-1.5 rounded-md bg-primary text-white font-label-xs uppercase text-[10px] font-bold active:scale-95 transition-all";
    document.getElementById('ordertype-limit-btn').className = "flex-1 py-1.5 rounded-md text-on-surface-variant hover:text-on-surface font-label-xs uppercase text-[10px] font-bold hover:bg-surface-variant/30 active:scale-95 transition-all";
    document.getElementById('limit-price-input-container')?.classList.add('hidden');
    updateOrderEstimates();
  });

  document.getElementById('ordertype-limit-btn')?.addEventListener('click', () => {
    state.orderForm.orderType = 'LIMIT';
    document.getElementById('ordertype-limit-btn').className = "flex-1 py-1.5 rounded-md bg-primary text-white font-label-xs uppercase text-[10px] font-bold active:scale-95 transition-all";
    document.getElementById('ordertype-market-btn').className = "flex-1 py-1.5 rounded-md text-on-surface-variant hover:text-on-surface font-label-xs uppercase text-[10px] font-bold hover:bg-surface-variant/30 active:scale-95 transition-all";
    document.getElementById('limit-price-input-container')?.classList.remove('hidden');

    const sym = state.orderForm.symbol || 'RELIANCE';
    const limitInput = document.getElementById('order-limit-price');
    if (limitInput && state.marketPrices[sym]) {
      limitInput.value = state.marketPrices[sym].price.toFixed(2);
    }
    updateOrderEstimates();
  });

  document.getElementById('order-qty')?.addEventListener('input', updateOrderEstimates);

  // Percentage shortcut buttons (25%, 50%, 75%, 100%)
  document.querySelectorAll('.qty-pct-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const pct = parseFloat(btn.getAttribute('data-pct'));
      const sym = state.orderForm.symbol || 'RELIANCE';
      const priceData = state.marketPrices[sym];
      const price = priceData ? priceData.price : 1270.00;

      const maxVal = (state.user.paper_balance || 100000) * 5;
      const maxSize = maxVal / price;
      const qty = Math.max(1, Math.floor(maxSize * pct));

      const qtyInput = document.getElementById('order-qty');
      if (qtyInput) qtyInput.value = qty;
      updateOrderEstimates();
    });
  });

  document.getElementById('order-buy-btn')?.addEventListener('click', () => placeOrder('BUY'));
  document.getElementById('order-sell-btn')?.addEventListener('click', () => placeOrder('SHORT'));

  updateMaxBuyingPower();
  updateOrderEstimates();
}

function updateMaxBuyingPower() {
  const sym = state.orderForm.symbol || 'RELIANCE';
  const priceData = state.marketPrices[sym];
  const price = priceData ? priceData.price : 1270.00;

  const maxVal = (state.user.paper_balance || 100000) * 5;
  const maxSize = maxVal / price;

  const maxEl = document.getElementById('order-max-size');
  if (maxEl) maxEl.innerText = `Max: ${maxSize.toFixed(1)}`;
}

function updateOrderEstimates() {
  const sym = state.orderForm.symbol || 'RELIANCE';
  const priceData = state.marketPrices[sym];
  const price = priceData ? priceData.price : 1270.00;

  const qtyInput = document.getElementById('order-qty');
  const qty = qtyInput ? (parseFloat(qtyInput.value) || 10) : 10;

  let entryPrice = price;
  if (state.orderForm.orderType === 'LIMIT') {
    const limitInput = document.getElementById('order-limit-price');
    if (limitInput && !isNaN(parseFloat(limitInput.value)) && parseFloat(limitInput.value) > 0) {
      entryPrice = parseFloat(limitInput.value);
    }
  }

  const posValue = entryPrice * qty;
  const marginReq = posValue / 5;

  const valEl = document.getElementById('order-est-value');
  if (valEl) valEl.innerText = `₹${posValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

  const marginEl = document.getElementById('order-est-margin');
  if (marginEl) marginEl.innerText = `₹${marginReq.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
}

function placeOrder(type) {
  const symbolSelect = document.getElementById('trade-symbol-selector');
  const sym = (symbolSelect ? symbolSelect.value : null) || state.orderForm.symbol || 'RELIANCE';
  const orderType = state.orderForm.orderType || 'MARKET';
  const qtyInput = document.getElementById('order-qty');
  const qty = qtyInput ? (parseFloat(qtyInput.value) || 10) : 10;

  let limitPrice = 1270.00;
  if (orderType === 'LIMIT') {
    const limitInput = document.getElementById('order-limit-price');
    if (limitInput && !isNaN(parseFloat(limitInput.value))) {
      limitPrice = parseFloat(limitInput.value) || 1270.00;
    }
  }

  const priceData = state.marketPrices[sym];
  const execPrice = orderType === 'MARKET' ? (priceData ? priceData.price : limitPrice) : limitPrice;

  const newPos = {
    id: Date.now(),
    symbol: sym,
    type: type,
    order_type: orderType,
    size: qty,
    entry_price: execPrice,
    current_price: execPrice,
    unrealized_pnl: 0.00,
    timestamp: new Date().toISOString()
  };

  state.activePositions.push(newPos);
  renderActivePositionsTable();
  showToast(`Paper Order executed for ${sym} ${type} (${qty} shares) @ ₹${execPrice.toFixed(2)}!`, "success");
}

function closeTradePosition(positionId) {
  const index = state.activePositions.findIndex(p => p.id === positionId);
  if (index !== -1) {
    const pos = state.activePositions[index];
    state.activePositions.splice(index, 1);
    state.closedLedger.unshift(pos);
    renderActivePositionsTable();
    renderTradeHistoryLedger();
    showToast(`Position closed for ${pos.symbol}!`, "success");
  }
}

function renderActivePositionsTable() {
  const tbody = document.getElementById('active-positions-tbody');
  if (!tbody) return;

  if (state.activePositions.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="p-6 text-center text-on-surface-variant font-body-base text-xs">No active trading positions.</td></tr>`;
    return;
  }

  tbody.innerHTML = state.activePositions.map(pos => {
    const pnl = pos.unrealized_pnl || 0;
    const isGreen = pnl >= 0;
    const colorClass = isGreen ? 'text-secondary' : 'text-error';
    const typeClass = pos.type === 'BUY' ? 'bg-secondary/15 text-secondary border-secondary/30' : 'bg-tertiary-container/15 text-tertiary-container border-tertiary-container/30';

    return `
      <tr class="border-b border-outline-variant/10 hover:bg-surface-variant/20 transition-colors font-data-mono text-xs">
        <td class="p-4 font-semibold text-on-surface">${pos.symbol}</td>
        <td class="p-4"><span class="px-2 py-0.5 rounded text-[9px] font-bold border ${typeClass}">${pos.type === 'BUY' ? 'LONG' : 'SHORT'}</span></td>
        <td class="p-4 font-semibold">${pos.size}</td>
        <td class="p-4">₹${pos.entry_price.toFixed(2)}</td>
        <td class="p-4 text-right font-bold ${colorClass}">${isGreen ? '+' : ''}₹${pnl.toFixed(2)}</td>
        <td class="p-4 text-center">
          <button onclick="closeTradePosition(${pos.id})" class="text-error text-xs font-bold uppercase hover:bg-error-container/20 px-2.5 py-1 rounded transition-colors border border-error/20">Close</button>
        </td>
      </tr>
    `;
  }).join('');
}

function renderTradeHistoryLedger() {
  const tbody = document.getElementById('trade-ledger-tbody');
  if (!tbody) return;

  if (state.closedLedger.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" class="p-4 text-center text-on-surface-variant text-xs">No trade history yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = state.closedLedger.map(pos => {
    const pnl = pos.unrealized_pnl || 0;
    const isGreen = pnl >= 0;
    return `
      <tr class="border-b border-outline-variant/10 hover:bg-surface-variant/10 transition-colors text-xs font-data-mono">
        <td class="p-3 font-bold">${pos.symbol}</td>
        <td class="p-3"><span class="${pos.type === 'BUY' ? 'text-secondary' : 'text-error'} font-bold">${pos.type}</span></td>
        <td class="p-3 ${isGreen ? 'text-secondary' : 'text-error'} font-bold">${isGreen ? '+' : ''}₹${pnl.toFixed(2)}</td>
      </tr>
    `;
  }).join('');
}

// ----------------- SIGNALS GRID ENGINE -----------------
function renderSignalsGrid() {
  const container = document.getElementById('signals-grid-container');
  if (!container) return;

  container.innerHTML = state.signals.map(sig => {
    const isBuy = sig.type === 'BUY';
    const typeClass = isBuy ? 'bg-secondary/20 text-secondary border-secondary/20' : 'bg-error/20 text-error border-error/20';

    return `
      <div class="glass-panel p-5 rounded-2xl border border-outline-variant/30 flex flex-col gap-3 relative hover:border-primary/40 transition-all">
        <div class="flex justify-between items-start">
          <div>
            <h3 class="font-headline-md text-base font-bold">${sig.symbol}</h3>
            <span class="text-[9px] text-on-surface-variant font-bold uppercase">${sig.category} • ${sig.strategy_name}</span>
          </div>
          <span class="${typeClass} font-bold text-[9px] px-2.5 py-0.5 rounded border uppercase">${sig.type}</span>
        </div>
        <div class="grid grid-cols-2 gap-4 py-2 border-y border-outline-variant/10 text-xs font-data-mono">
          <div><p class="text-[9px] text-on-surface-variant font-bold">ENTRY</p><p class="font-bold text-primary">₹${sig.entry_price.toFixed(2)}</p></div>
          <div class="text-right"><p class="text-[9px] text-on-surface-variant font-bold">STOP LOSS</p><p class="font-bold text-error">₹${sig.sl.toFixed(2)}</p></div>
        </div>
        <div class="flex justify-between items-center text-[10px] font-data-mono text-secondary pt-1">
          <span>T1: ₹${sig.t1.toFixed(2)}</span><span>T2: ₹${sig.t2.toFixed(2)}</span><span>T3: ₹${sig.t3.toFixed(2)}</span>
        </div>
        <button onclick="presetTradeFromSignal('${sig.symbol}', '${sig.type}', ${sig.entry_price})" class="w-full py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-xl text-xs font-bold uppercase transition-all">Preset to Trade</button>
      </div>
    `;
  }).join('');
}

function presetTradeFromSignal(symbol, type, price) {
  state.orderForm.symbol = symbol;
  state.orderForm.type = type;
  switchView('trade');
  showToast(`Loaded trade setup for ${symbol} ${type} @ ₹${price}!`, "info");
}

// ----------------- AI AGENT & HEATMAP ENGINE -----------------
function renderAIMetrics() {
  const sEl = document.getElementById('ai-metrics-states');
  if (sEl) sEl.innerText = state.aiState.statesLearned;

  const aEl = document.getElementById('ai-metrics-accuracy');
  if (aEl) aEl.innerText = `${state.aiState.accuracy}%`;

  const pEl = document.getElementById('ai-metrics-predictions');
  if (pEl) pEl.innerText = state.aiState.totalPredictions;

  const rEl = document.getElementById('ai-metrics-reward');
  if (rEl) {
    rEl.innerText = state.aiState.netReward >= 0 ? `+${state.aiState.netReward}` : state.aiState.netReward;
    rEl.className = `text-xl font-extrabold font-data-mono mt-1 ${state.aiState.netReward >= 0 ? 'text-secondary' : 'text-error'}`;
  }
}

function renderQTableHeatmap() {
  const canvas = document.getElementById('ai-qtable-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const records = state.aiState.qtable;
  const w = canvas.width = canvas.parentElement.clientWidth || 400;
  const h = canvas.height = canvas.parentElement.clientHeight || 240;

  ctx.clearRect(0, 0, w, h);
  const states = [...new Set(records.map(r => r.state_string))].slice(0, 5);
  const actions = ['HOLD', 'BUY', 'SELL'];

  const headerH = 24;
  const colW = (w - 140) / 3;
  const rowH = (h - headerH) / Math.max(states.length, 1);

  ctx.fillStyle = '#bdc8d3';
  ctx.font = 'bold 10px JetBrains Mono';
  ctx.textAlign = 'left';
  ctx.fillText('STATE ENCODING', 10, 16);

  ctx.textAlign = 'center';
  actions.forEach((act, idx) => {
    ctx.fillText(act, 140 + idx * colW + colW / 2, 16);
  });

  states.forEach((stateStr, rIdx) => {
    const y = headerH + rIdx * rowH;
    ctx.fillStyle = '#e0e2ea';
    ctx.font = '9px JetBrains Mono';
    ctx.textAlign = 'left';
    const displayLabel = stateStr.length > 18 ? stateStr.substring(0, 16) + '..' : stateStr;
    ctx.fillText(displayLabel, 10, y + rowH / 2 + 3);

    [0, 1, 2].forEach((actIdx, cIdx) => {
      const x = 140 + cIdx * colW;
      const rec = records.find(r => r.state_string === stateStr && r.action === actIdx);
      const qVal = rec ? rec.q_value : 0.0;
      const absVal = Math.min(Math.abs(qVal) / 2.0, 1.0);

      ctx.fillStyle = qVal > 0.01 ? `rgba(0, 200, 83, ${0.2 + absVal * 0.7})` : `rgba(240, 143, 10, ${0.2 + absVal * 0.7})`;
      ctx.fillRect(x + 2, y + 2, colW - 4, rowH - 4);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px JetBrains Mono';
      ctx.textAlign = 'center';
      ctx.fillText(qVal.toFixed(2), x + colW / 2, y + rowH / 2 + 3);
    });
  });
}

function renderAIPredictionsTable() {
  const tbody = document.getElementById('ai-predictions-tbody');
  if (!tbody) return;

  tbody.innerHTML = state.aiState.predictions.map(trade => {
    const actionLabels = { 0: 'HOLD', 1: 'BUY', 2: 'SELL' };
    const actionLabel = actionLabels[trade.predicted_action] || 'BUY';
    const typeClass = trade.predicted_action === 1 ? 'bg-secondary/15 text-secondary border-secondary/20' : 'bg-tertiary-container/15 text-tertiary-container border-tertiary-container/20';

    return `
      <tr class="border-b border-outline-variant/10 hover:bg-surface-variant/20 transition-colors text-xs font-data-mono">
        <td class="p-3 font-semibold">${trade.symbol}</td>
        <td class="p-3"><span class="px-2 py-0.5 rounded text-[9px] font-bold border ${typeClass}">${actionLabel}</span></td>
        <td class="p-3"><span class="${trade.pnl >= 0 ? 'text-secondary' : 'text-error'} font-bold">${trade.pnl >= 0 ? '+' : ''}₹${trade.pnl.toFixed(2)}</span></td>
        <td class="p-3">
          <span class="${trade.reward >= 0 ? 'text-secondary' : 'text-error'} font-bold">${trade.reward >= 0 ? '+' : ''}${trade.reward.toFixed(1)}</span>
          <div class="text-[9px] text-on-surface-variant mt-0.5 font-semibold">${trade.explanation}</div>
        </td>
        <td class="p-3 text-center">
          <span class="px-2 py-0.5 rounded text-[9px] font-bold uppercase ${trade.user_feedback === 'LIKE' ? 'bg-secondary/10 text-secondary border border-secondary/20' : 'bg-error/10 text-error border border-error/20'}">
            ${trade.user_feedback === 'LIKE' ? '👍 Approved' : '👎 Rejected'}
          </span>
        </td>
      </tr>
    `;
  }).join('');
}

function setupAIBacktest() {
  const form = document.getElementById('ai-backtest-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const episodes = parseInt(document.getElementById('ai-bt-episodes')?.value) || 100;

    let balance = 100000.00;
    const history = [balance];
    let wins = 0;

    for (let i = 0; i < episodes; i++) {
      const pnl = (Math.random() - 0.44) * 1200;
      balance += pnl;
      if (pnl > 0) wins++;
      history.push(parseFloat(balance.toFixed(2)));
    }

    const winRate = Math.round((wins / episodes) * 100);
    const winRateEl = document.getElementById('ai-bt-winrate');
    if (winRateEl) winRateEl.innerText = `Win Rate: ${winRate}%`;

    const balEl = document.getElementById('ai-bt-balance');
    if (balEl) balEl.innerText = `Final Balance: ₹${balance.toLocaleString(undefined, {maximumFractionDigits: 2})}`;

    drawBacktestCurve(history);
    showToast(`AI Backtest completed for ${episodes} episodes! Win Rate: ${winRate}%`, "success");
  });
}

function drawBacktestCurve(history) {
  const canvas = document.getElementById('ai-backtest-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const w = canvas.width = canvas.parentElement.clientWidth || 300;
  const h = canvas.height = canvas.parentElement.clientHeight || 150;

  ctx.clearRect(0, 0, w, h);

  let maxB = Math.max(...history);
  let minB = Math.min(...history);
  const spread = maxB - minB || 1000;
  maxB += spread * 0.1;
  minB -= spread * 0.1;

  const getX = (i) => (i / (history.length - 1)) * (w - 20) + 10;
  const getY = (b) => h - ((b - minB) / (maxB - minB)) * (h - 20) - 10;

  ctx.strokeStyle = '#00c853';
  ctx.lineWidth = 2;
  ctx.beginPath();

  history.forEach((bal, i) => {
    const x = getX(i);
    const y = getY(bal);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
}

function setupAIChat() {
  const form = document.getElementById('ai-chat-form');
  const input = document.getElementById('ai-chat-input');
  const chatBox = document.getElementById('ai-chat-box');
  if (!form || !input || !chatBox) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = input.value.trim();
    if (!msg) return;
    input.value = '';

    const userBubble = document.createElement('div');
    userBubble.className = 'flex gap-2.5 justify-end';
    userBubble.innerHTML = `<div class="p-3 bg-primary text-white rounded-xl text-xs">${msg}</div>`;
    chatBox.appendChild(userBubble);

    setTimeout(() => {
      const sym = state.orderForm.symbol || 'RELIANCE';
      const aiReply = `🤖 <b>AI Analysis for ${sym}:</b><br>• <b>Trend:</b> Strong bullish momentum on 15m chart.<br>• <b>RSI:</b> 58.4 (Optimal buying strength).<br>• <b>VWAP:</b> Holding support above VWAP.<br>• <b>Recommendation:</b> High probability BUY setup (1:2 Risk-Reward).`;

      const botBubble = document.createElement('div');
      botBubble.className = 'flex gap-2.5';
      botBubble.innerHTML = `<div class="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/10 text-on-surface-variant text-xs">${aiReply}</div>`;
      chatBox.appendChild(botBubble);
      chatBox.scrollTop = chatBox.scrollHeight;
    }, 400);
  });
}

function sendQuickPrompt(promptText) {
  const input = document.getElementById('ai-chat-input');
  if (input) {
    input.value = promptText;
    document.getElementById('ai-chat-form')?.dispatchEvent(new Event('submit'));
  }
}

// ----------------- SCANNER & NEWS RENDERERS -----------------
function renderScannerData() {
  const tbody = document.getElementById('scanner-picks-tbody');
  const breakoutList = document.getElementById('scanner-breakouts-list');
  if (!tbody || !breakoutList) return;

  const picks = [
    { rank: 1, symbol: 'RELIANCE', price: 1272.80, change_percent: 2.45, signal: 'BUY', confidence: 94 },
    { rank: 2, symbol: 'TCS', price: 2443.50, change_percent: 1.85, signal: 'BUY', confidence: 91 },
    { rank: 3, symbol: 'INFY', price: 1152.90, change_percent: -0.65, signal: 'SHORT', confidence: 88 },
    { rank: 4, symbol: 'HDFCBANK', price: 750.40, change_percent: 1.20, signal: 'BUY', confidence: 86 },
    { rank: 5, symbol: 'SBIN', price: 1013.60, change_percent: 1.50, signal: 'BUY', confidence: 82 }
  ];

  tbody.innerHTML = picks.map(p => `
    <tr class="border-b border-outline-variant/10 hover:bg-surface-container-low/50 transition-colors cursor-pointer font-data-mono text-xs" onclick="presetTradeFromSignal('${p.symbol}', '${p.signal}', ${p.price})">
      <td class="p-3 font-bold text-primary">#${p.rank}</td>
      <td class="p-3 font-bold text-on-surface">${p.symbol}</td>
      <td class="p-3">₹${p.price.toFixed(2)}</td>
      <td class="p-3 ${p.change_percent >= 0 ? 'text-secondary' : 'text-error'} font-bold">${p.change_percent >= 0 ? '+' : ''}${p.change_percent.toFixed(2)}%</td>
      <td class="p-3"><span class="px-2 py-0.5 rounded border text-[9px] font-bold ${p.signal === 'BUY' ? 'bg-secondary/20 text-secondary' : 'bg-error/20 text-error'}">${p.signal}</span></td>
      <td class="p-3 text-right font-bold text-primary">${p.confidence}%</td>
    </tr>
  `).join('');

  breakoutList.innerHTML = picks.slice(0, 4).map(item => `
    <div class="flex justify-between items-center p-2 rounded bg-surface-container-low border border-outline-variant/10 font-data-mono text-xs">
      <span class="font-bold text-on-surface">${item.symbol}</span>
      <span class="font-bold ${item.change_percent >= 0 ? 'text-secondary' : 'text-error'}">${item.change_percent >= 0 ? '+' : ''}${item.change_percent.toFixed(2)}%</span>
    </div>
  `).join('');
}

function renderNewsData() {
  const container = document.getElementById('news-feed-container');
  if (!container) return;

  const newsItems = [
    { id: 1, title: "Reliance Industries Reports Strong Q1 Margin Expansion in Retail & Telecom", source: "Economic Times", symbol: "RELIANCE", sentiment: "Positive", score: 0.85, impact: "High Bullish Impact" },
    { id: 2, title: "RBI Keeps Repo Rate Unchanged; Banking Sector Rallies as Inflation Cools", source: "Moneycontrol", symbol: "BANK NIFTY", sentiment: "Positive", score: 0.72, impact: "Bullish Impact" },
    { id: 3, title: "TCS Secures $1.2B Multi-Year Cloud Transformation Deal with US Retailer", source: "LiveMint", symbol: "TCS", sentiment: "Positive", score: 0.91, impact: "High Bullish Impact" },
    { id: 4, title: "IT Sector Sees Muted Short-Term Spends Amid Global Macro Uncertainties", source: "CNBC TV18", symbol: "INFY", sentiment: "Negative", score: -0.45, impact: "Bearish Pullback" }
  ];

  container.innerHTML = newsItems.map(item => `
    <div class="glass-panel p-4 rounded-xl border border-outline-variant/30 flex flex-col gap-2.5">
      <div class="flex justify-between items-start gap-2">
        <span class="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border ${item.sentiment === 'Positive' ? 'bg-secondary/20 text-secondary border-secondary/20' : 'bg-error/20 text-error border-error/20'}">${item.sentiment} (${item.score > 0 ? '+' : ''}${item.score})</span>
        <span class="text-[9px] text-on-surface-variant font-semibold">${item.source}</span>
      </div>
      <h4 class="text-xs font-bold text-on-surface leading-snug">${item.title}</h4>
      <div class="flex justify-between items-center text-[10px] text-on-surface-variant pt-2 border-t border-outline-variant/10">
        <span class="font-bold text-primary">Symbol: ${item.symbol}</span>
        <span class="font-semibold text-secondary">${item.impact}</span>
      </div>
    </div>
  `).join('');
}

// ----------------- ADMIN PANEL HANDLERS -----------------
function setupAdminPanel() {
  document.getElementById('dash-reset-balance-btn')?.addEventListener('click', () => {
    if (confirm("Reset paper trading simulated balance back to ₹1,00,000.00 and close active positions?")) {
      state.user.paper_balance = 100000.00;
      state.activePositions = [];
      updateMarketUI();
      renderActivePositionsTable();
      showToast("Paper Trading balance reset to ₹1,00,000.00!", "success");
    }
  });

  document.getElementById('admin-price-override-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const symbol = document.getElementById('admin-override-symbol').value;
    const price = parseFloat(document.getElementById('admin-override-price').value);

    if (state.marketPrices[symbol] && !isNaN(price)) {
      state.marketPrices[symbol].price = price;
      updateMarketUI();
      showToast(`Price for ${symbol} updated to ₹${price.toFixed(2)}!`, "success");
    }
  });

  document.getElementById('admin-broadcast-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = document.getElementById('admin-broadcast-message').value;
    const type = document.getElementById('admin-broadcast-type').value;
    showToast(message, type);
  });

  document.getElementById('admin-user-override-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const tier = document.getElementById('admin-user-tier').value;
    const balance = parseFloat(document.getElementById('admin-user-balance').value);
    if (!isNaN(balance)) state.user.paper_balance = balance;
    state.user.subscription_tier = tier;
    updateMarketUI();
    showToast(`Account updated: Tier=${tier}, Balance=₹${state.user.paper_balance}!`, "success");
  });
}

// ----------------- REAL-TIME SIMULATION TICK LOOPS -----------------
function startRealtimeLoops() {
  // 1. Live Market Price Ticks (Every 1.5s)
  setInterval(() => {
    Object.keys(state.marketPrices).forEach(sym => {
      const deltaPct = (Math.random() * 0.003 - 0.0014);
      const oldP = state.marketPrices[sym].price;
      const newP = parseFloat((oldP * (1 + deltaPct)).toFixed(2));
      state.marketPrices[sym].price = newP;
      state.marketPrices[sym].change_percent += (deltaPct * 100);
    });

    updateMarketUI();
    renderActivePositionsTable();
  }, 1500);

  // 2. Real-Time AI Auto-Learning Loop (Every 2s)
  setInterval(() => {
    state.aiState.statesLearned += Math.floor(Math.random() * 2) + 1;
    state.aiState.totalPredictions += Math.floor(Math.random() * 3) + 1;
    state.aiState.netReward = parseFloat((state.aiState.netReward + (Math.random() > 0.35 ? 0.4 : -0.2)).toFixed(1));
    state.aiState.accuracy = parseFloat(Math.min(94.5, state.aiState.accuracy + (Math.random() * 0.15 - 0.04)).toFixed(1));

    state.aiState.qtable.forEach(r => {
      r.q_value = parseFloat((r.q_value + (Math.random() * 0.1 - 0.04)).toFixed(2));
    });

    if (state.activeView === 'ai') {
      renderAIMetrics();
      renderQTableHeatmap();
    }
  }, 2000);
}

// ----------------- APP INITIALIZATION -----------------
window.addEventListener('DOMContentLoaded', () => {
  safeCreateIcons();
  populateSymbolDropdowns();
  setupTabRouting();
  setupTradingPanel();
  setupAIBacktest();
  setupAIChat();
  setupAdminPanel();
  
  // Mobile sidebar controls
  document.getElementById('sidebar-toggle-btn')?.addEventListener('click', () => toggleSidebar(true));
  document.getElementById('sidebar-close-btn')?.addEventListener('click', () => toggleSidebar(false));
  document.getElementById('sidebar-overlay')?.addEventListener('click', () => toggleSidebar(false));

  startRealtimeLoops();
});
