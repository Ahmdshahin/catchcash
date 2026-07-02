window.App = (function() {
  
  let state = {
    user: null,
    transactions: [],
    activeTab: 'dashboard',
    filterType: 'all',
    filterCategory: 'all',
    filterDateRange: 'this_month',
    searchQuery: '',
    editingTransaction: null,
    editingCategory: null,
    historyLimit: 50
  };

  // DOM Elements
  const els = {};

  function init() {
    cacheDOM();
    bindEvents();
    
    window.Auth.init(onSignIn, onSignOut);
    // Note: I18n, Currency, Categories init are called inside onSignIn since they need UID
  }

  function cacheDOM() {
    // Screens
    els.loginScreen = document.getElementById('login-screen');
    els.appScreen = document.getElementById('app-screen');
    
    // Header
    els.userPhoto = document.getElementById('header-user-photo');
    els.userName = document.getElementById('header-user-name');
    els.displayCurrencyBadge = document.getElementById('display-currency-badge');
    
    // Views
    els.views = {
      dashboard: document.getElementById('view-dashboard'),
      history: document.getElementById('view-history'),
      analytics: document.getElementById('view-analytics'),
      settings: document.getElementById('view-settings'),
      categories: document.getElementById('view-categories')
    };
    
    // Nav
    els.tabBtns = document.querySelectorAll('.tab-btn[data-tab]');
    els.fabAdd = document.getElementById('fab-add');
    
    // Dashboard
    els.balanceTotal = document.getElementById('balance-total');
    els.balanceIncome = document.getElementById('balance-income');
    els.balanceExpense = document.getElementById('balance-expense');
    els.topCategoriesList = document.getElementById('top-categories-list');
    els.recentTransactionsList = document.getElementById('recent-transactions-list');
    
    // History filters
    els.historySearch = document.getElementById('history-search');
    els.filterType = document.getElementById('filter-type');
    els.filterCategory = document.getElementById('filter-category');
    els.filterDateRange = document.getElementById('filter-date-range');
    els.historyList = document.getElementById('history-list');
    els.historyEmpty = document.getElementById('history-empty');
    
    // Transaction Modal
    els.txModal = document.getElementById('transaction-modal');
    els.txModalTitle = document.getElementById('modal-title');
    els.txTypeIncome = document.getElementById('tx-type-income');
    els.txTypeExpense = document.getElementById('tx-type-expense');
    els.txAmount = document.getElementById('tx-amount');
    els.txCurrencySelect = document.getElementById('tx-currency-select');
    els.txRateContainer = document.getElementById('tx-rate-container');
    els.txRateValue = document.getElementById('tx-rate-value');
    els.txRateToggle = document.getElementById('tx-rate-toggle');
    els.txRateManual = document.getElementById('tx-rate-manual');
    els.txCategorySelect = document.getElementById('tx-category-select');
    els.txDescription = document.getElementById('tx-description');
    els.txDate = document.getElementById('tx-date');
    els.txId = document.getElementById('tx-id');
    els.btnSaveTx = document.getElementById('btn-save-tx');
    els.btnDeleteTx = document.getElementById('btn-delete-tx');
    els.btnCloseTxModal = document.getElementById('btn-close-modal');
    
    // Analytics
    els.analyticsDailyAvg = document.getElementById('analytics-daily-avg');
    els.analyticsBiggest = document.getElementById('analytics-biggest');
    els.analyticsTotalIncome = document.getElementById('analytics-total-income');
    els.analyticsTotalExpense = document.getElementById('analytics-total-expense');
    
    // Settings
    els.settingsDisplayCurrency = document.getElementById('settings-display-currency');
    els.settingsLanguage = document.getElementById('settings-language');
    els.settingsTheme = document.getElementById('settings-theme');
    els.btnManageCategories = document.getElementById('btn-manage-categories');
    els.btnExport = document.getElementById('btn-export');
    els.btnImport = document.getElementById('btn-import');
    els.importFileInput = document.getElementById('import-file-input');
    els.btnClearData = document.getElementById('btn-clear-data');
    els.btnSignOut = document.getElementById('btn-sign-out');
    
    // Categories Manager
    els.btnBackCategories = document.getElementById('btn-back-categories');
    els.categoriesList = document.getElementById('categories-list');
    els.btnAddCategory = document.getElementById('btn-add-category');
    els.btnResetCategories = document.getElementById('btn-reset-categories');
    
    // Category Modal
    els.catModal = document.getElementById('category-modal');
    els.catModalTitle = document.getElementById('cat-modal-title');
    els.catNameEn = document.getElementById('cat-name-en');
    els.catNameAr = document.getElementById('cat-name-ar');
    els.catEmojiGrid = document.getElementById('cat-emoji-grid');
    els.catSelectedEmoji = document.getElementById('cat-selected-emoji');
    els.catColorGrid = document.getElementById('cat-color-grid');
    els.catSelectedColor = document.getElementById('cat-selected-color');
    els.btnSaveCategory = document.getElementById('btn-save-category');
    els.btnCloseCatModal = document.getElementById('btn-close-cat-modal');
    
    // Confirm Dialog
    els.confirmDialog = document.getElementById('confirm-dialog');
    els.confirmMessage = document.getElementById('confirm-message');
    els.btnConfirmYes = document.getElementById('btn-confirm-yes');
    els.btnConfirmNo = document.getElementById('btn-confirm-no');
    
    // Toast
    els.toast = document.getElementById('toast');
    
    // Google Sign in
    els.btnSignInGoogle = document.getElementById('btn-sign-in-google');
    
    // Init Theme
    const savedTheme = localStorage.getItem('catchcash_theme') || 'dark';
    if (savedTheme === 'light') document.body.classList.add('light-mode');
  }

  function bindEvents() {
    
    els.tabBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = e.currentTarget.dataset.tab;
        switchTab(tab);
      });
    });
    
    els.fabAdd.addEventListener('click', () => openAddModal());
    els.btnCloseTxModal.addEventListener('click', closeTxModal);
    
    els.txTypeIncome.addEventListener('click', () => setTxType('income'));
    els.txTypeExpense.addEventListener('click', () => setTxType('expense'));
    
    els.btnSaveTx.addEventListener('click', saveTransaction);
    els.btnDeleteTx.addEventListener('click', () => deleteTransaction(els.txId.value));
    
    els.txCurrencySelect.addEventListener('change', updateTxExchangeRateUI);
    els.txRateToggle.addEventListener('change', (e) => {
      els.txRateManual.classList.toggle('hidden', !e.target.checked);
    });
    
    // History Filters
    els.historySearch.addEventListener('input', debounce(() => { state.historyLimit = 50; renderHistory(); }, 300));
    els.filterType.addEventListener('change', (e) => { state.filterType = e.target.value; state.historyLimit = 50; renderHistory(); });
    els.filterCategory.addEventListener('change', (e) => { state.filterCategory = e.target.value; state.historyLimit = 50; renderHistory(); });
    els.filterDateRange.addEventListener('change', (e) => { state.filterDateRange = e.target.value; state.historyLimit = 50; renderHistory(); });
    
    // Settings
    els.btnSignOut.addEventListener('click', () => window.Auth.signOut());
    els.settingsLanguage.addEventListener('click', toggleLanguage);
    els.settingsTheme.addEventListener('click', toggleTheme);
    els.settingsDisplayCurrency.addEventListener('change', (e) => {
      window.Currency.setDisplayCurrency(state.user.uid, e.target.value);
      translateUI();
      renderAll();
    });
    
    els.btnExport.addEventListener('click', () => {
      window.Data.exportCSV(state.transactions, window.Categories.getAll());
    });
    
    els.btnImport.addEventListener('click', () => els.importFileInput.click());
    els.importFileInput.addEventListener('change', handleImportCSV);
    
    els.btnClearData.addEventListener('click', () => {
      showConfirm(window.I18n.t('confirm_clear'), () => {
        state.transactions = [];
        saveTransactions();
        window.Categories.reset();
        renderAll();
        showToast(window.I18n.t('settings_saved'));
      });
    });
    
    // Categories Manager
    els.btnManageCategories.addEventListener('click', () => switchTab('categories'));
    els.btnBackCategories.addEventListener('click', () => switchTab('settings'));
    els.btnAddCategory.addEventListener('click', () => openCategoryModal());
    els.btnCloseCatModal.addEventListener('click', closeCategoryModal);
    els.btnSaveCategory.addEventListener('click', saveCategory);
    els.btnResetCategories.addEventListener('click', () => {
      showConfirm(window.I18n.t('confirm'), () => {
        window.Categories.reset();
        renderCategories();
        populateCategoryDropdowns();
        showToast(window.I18n.t('settings_saved'));
      });
    });
  }

  // --- Auth & Init ---
  
  function onSignIn(user) {
    state.user = user;
    
    // Initialize modules with uid
    window.I18n.init(user.uid);
    window.Currency.init(user.uid);
    window.Categories.init(user.uid);
    
    // Load Data
    loadTransactions();
    
    // Update Header
    els.userName.textContent = user.name;
    if (user.photoURL && els.userPhoto) {
      els.userPhoto.src = user.photoURL;
    }
    
    // Setup UI
    populateCurrencyDropdowns();
    populateCategoryDropdowns();
    translateUI();
    
    // Show App
    els.loginScreen.classList.remove('active');
    els.appScreen.classList.add('active');
    
    switchTab('dashboard');
    showToast(window.I18n.t('welcome_back') + ', ' + user.name);
  }
  
  function onSignOut() {
    state.user = null;
    state.transactions = [];
    window.Charts.destroyAll();
    
    els.appScreen.classList.remove('active');
    els.loginScreen.classList.add('active');
  }

  // --- Data ---
  
  function loadTransactions() {
    if (!state.user) return;
    const stored = localStorage.getItem(`catchcash_${state.user.uid}_transactions`);
    state.transactions = stored ? JSON.parse(stored) : [];
    // Sort descending by date, then createdAt
    state.transactions.sort((a,b) => {
      if(a.date !== b.date) return b.date.localeCompare(a.date);
      return b.createdAt.localeCompare(a.createdAt);
    });
  }
  
  function saveTransactions() {
    if (!state.user) return;
    localStorage.setItem(`catchcash_${state.user.uid}_transactions`, JSON.stringify(state.transactions));
  }

  // --- Navigation & Rendering ---
  
  function switchTab(tabName) {
    state.activeTab = tabName;
    
    // Update View visibility
    Object.keys(els.views).forEach(key => {
      if (els.views[key]) els.views[key].classList.remove('active');
    });
    if (els.views[tabName]) els.views[tabName].classList.add('active');
    
    // Update Tab Buttons (only main tabs)
    els.tabBtns.forEach(btn => {
      if (btn.dataset.tab === tabName) btn.classList.add('active');
      else btn.classList.remove('active');
    });
    
    // Render specific view
    if (tabName === 'dashboard') renderDashboard();
    else if (tabName === 'history') renderHistory();
    else if (tabName === 'analytics') renderAnalytics();
    else if (tabName === 'settings') renderSettings();
    else if (tabName === 'categories') renderCategories();
  }
  
  function renderAll() {
    populateCategoryDropdowns();
    if (state.activeTab === 'dashboard') renderDashboard();
    else if (state.activeTab === 'history') renderHistory();
    else if (state.activeTab === 'analytics') renderAnalytics();
    else if (state.activeTab === 'settings') renderSettings();
    else if (state.activeTab === 'categories') renderCategories();
    
    // Always update header badge
    els.displayCurrencyBadge.textContent = window.Currency.getDisplayCurrency();
  }

  function renderDashboard() {
    els.displayCurrencyBadge.textContent = window.Currency.getDisplayCurrency();
    const dc = window.Currency.getDisplayCurrency();
    
    // Calculate Totals
    let totalIn = 0, totalOut = 0;
    
    // Only current month for dashboard totals makes sense usually, but let's do all time or this month?
    // Let's do this month for dashboard balance
    const {start, end} = window.Data.getMonthRange();
    
    // Or maybe user wants absolute total balance. Let's do absolute total balance.
    state.transactions.forEach(tx => {
      const amt = window.Currency.convert(tx.amount, tx.currency, dc, tx.customRate);
      if (tx.type === 'income') totalIn += amt;
      else totalOut += amt;
    });
    
    const balance = totalIn - totalOut;
    
    animateCountUp(els.balanceTotal, balance, 1000, dc);
    els.balanceIncome.textContent = window.Currency.formatAmount(totalIn, dc);
    els.balanceExpense.textContent = window.Currency.formatAmount(totalOut, dc);
    
    // Recent Transactions
    els.recentTransactionsList.innerHTML = '';
    const recent = state.transactions.slice(0, 5);
    if (recent.length === 0) {
      els.recentTransactionsList.innerHTML = `<div class="empty-state">${window.I18n.t('no_transactions')}</div>`;
    } else {
      const frag = document.createDocumentFragment();
      recent.forEach(tx => frag.appendChild(createTransactionListItem(tx, dc)));
      els.recentTransactionsList.appendChild(frag);
    }
    
    // Update Charts
    setTimeout(() => {
      window.Charts.updateDashboard(state.transactions, window.Categories.getAll(), dc);
    }, 100); // slight delay for DOM to settle if just switched
  }

  function renderHistory() {
    const dc = window.Currency.getDisplayCurrency();
    const filtered = getFilteredTransactions();
    
    els.historyList.innerHTML = '';
    
    if (filtered.length === 0) {
      els.historyEmpty.classList.remove('hidden');
    } else {
      els.historyEmpty.classList.add('hidden');
      
      // Limit for performance
      let limited = filtered.slice(0, state.historyLimit);
      
      // Group by date
      const groups = {};
      limited.forEach(tx => {
        if (!groups[tx.date]) groups[tx.date] = [];
        groups[tx.date].push(tx);
      });
      
      const sortedDates = Object.keys(groups).sort((a,b) => b.localeCompare(a));
      
      const frag = document.createDocumentFragment();
      
      sortedDates.forEach(date => {
        const header = document.createElement('div');
        header.className = 'date-group-header';
        header.textContent = window.Data.formatDate(date, window.I18n.getCurrentLanguage());
        frag.appendChild(header);
        
        groups[date].forEach(tx => {
          const item = createTransactionListItem(tx, dc);
          item.addEventListener('click', () => openEditModal(tx.id));
          item.classList.add('clickable');
          frag.appendChild(item);
        });
      });
      
      if (filtered.length > state.historyLimit) {
        const loadMoreBtn = document.createElement('button');
        loadMoreBtn.className = 'btn-secondary w-full mt-4';
        loadMoreBtn.textContent = window.I18n.t('load_more') || 'Load More';
        loadMoreBtn.addEventListener('click', () => {
           state.historyLimit += 50;
           renderHistory();
        });
        frag.appendChild(loadMoreBtn);
      }
      
      els.historyList.appendChild(frag);
    }
  }

  function renderAnalytics() {
    const dc = window.Currency.getDisplayCurrency();
    
    let totalIn = 0, totalOut = 0;
    let maxExp = 0;
    
    const expenses = [];
    state.transactions.forEach(tx => {
      const amt = window.Currency.convert(tx.amount, tx.currency, dc, tx.customRate);
      if (tx.type === 'income') {
        totalIn += amt;
      } else {
        totalOut += amt;
        if (amt > maxExp) maxExp = amt;
        expenses.push({date: tx.date, amt});
      }
    });
    
    // Daily Average (over days with transactions or from oldest to newest)
    let dailyAvg = 0;
    if (expenses.length > 0) {
      // simplified: total / number of unique days with expenses
      const uniqueDays = new Set(expenses.map(e => e.date)).size;
      dailyAvg = totalOut / uniqueDays;
    }
    
    els.analyticsDailyAvg.textContent = window.Currency.formatAmount(dailyAvg, dc);
    els.analyticsBiggest.textContent = window.Currency.formatAmount(maxExp, dc);
    els.analyticsTotalIncome.textContent = window.Currency.formatAmount(totalIn, dc);
    els.analyticsTotalExpense.textContent = window.Currency.formatAmount(totalOut, dc);
    
    setTimeout(() => {
      window.Charts.updateAnalytics(state.transactions, window.Categories.getAll(), dc);
    }, 100);
  }

  function renderSettings() {
    els.settingsDisplayCurrency.value = window.Currency.getDisplayCurrency();
    
    const lang = window.I18n.getCurrentLanguage();
    els.settingsLanguage.textContent = lang === 'ar' ? 'العربية' : 'English';
    
    const isLight = document.body.classList.contains('light-mode');
    els.settingsTheme.textContent = isLight ? (lang === 'ar' ? 'الوضع الفاتح' : 'Light Mode') : (lang === 'ar' ? 'الوضع الداكن' : 'Dark Mode');
  }
  
  function toggleTheme() {
    const isLight = document.body.classList.toggle('light-mode');
    localStorage.setItem('catchcash_theme', isLight ? 'light' : 'dark');
    renderSettings();
    if (window.Charts) window.Charts.updateTheme();
  }
  
  function renderCategories() {
    els.categoriesList.innerHTML = '';
    const cats = window.Categories.getAll();
    const lang = window.I18n.getCurrentLanguage();
    
    const frag = document.createDocumentFragment();
    
    cats.forEach(cat => {
      const item = document.createElement('div');
      item.className = 'category-item';
      item.innerHTML = `
        <div class="cat-icon" style="background-color: ${cat.color}26; color: ${cat.color}">
          ${cat.emoji}
        </div>
        <div class="cat-info">
          <div class="cat-name">${lang === 'ar' ? cat.nameAR : cat.nameEN}</div>
        </div>
        <div class="cat-actions">
          <button class="btn-icon edit-cat" data-id="${cat.id}">✏️</button>
          <button class="btn-icon delete-cat" data-id="${cat.id}">🗑️</button>
        </div>
      `;
      
      item.querySelector('.edit-cat').addEventListener('click', () => openCategoryModal(cat.id));
      item.querySelector('.delete-cat').addEventListener('click', () => deleteCategory(cat.id));
      
      frag.appendChild(item);
    });
    
    els.categoriesList.appendChild(frag);
  }

  // --- Transactions UI ---

  function createTransactionListItem(tx, displayCurrency) {
    const item = document.createElement('div');
    item.className = 'transaction-item';
    
    const cat = window.Categories.getById(tx.categoryId);
    const lang = window.I18n.getCurrentLanguage();
    const catName = cat ? (lang === 'ar' ? cat.nameAR : cat.nameEN) : window.I18n.t('uncategorized');
    const catEmoji = cat ? cat.emoji : '❓';
    const catColor = cat ? cat.color : '#94A3B8';
    
    const isIncome = tx.type === 'income';
    const amountClass = isIncome ? 'text-income' : 'text-expense';
    const sign = isIncome ? '+' : '-';
    
    let amountHtml = '';
    const convertedAmt = window.Currency.convert(tx.amount, tx.currency, displayCurrency, tx.customRate);
    
    if (tx.currency === displayCurrency) {
      amountHtml = `<div class="tx-amt ${amountClass}">${sign}${window.Currency.formatAmount(tx.amount, displayCurrency)}</div>`;
    } else {
      amountHtml = `
        <div class="tx-amt ${amountClass}">${sign}${window.Currency.formatAmount(convertedAmt, displayCurrency)}</div>
        <div class="tx-orig-amt text-secondary text-xs">${sign}${window.Currency.formatAmount(tx.amount, tx.currency)}</div>
      `;
    }
    
    item.innerHTML = `
      <div class="tx-icon" style="background-color: ${catColor}26;">${catEmoji}</div>
      <div class="tx-details">
        <div class="tx-category">${catName}</div>
        <div class="tx-desc">${tx.description || ''}</div>
      </div>
      <div class="tx-amounts">
        ${amountHtml}
      </div>
    `;
    
    return item;
  }

  function setTxType(type) {
    if (type === 'income') {
      els.txTypeIncome.classList.add('active');
      els.txTypeExpense.classList.remove('active');
    } else {
      els.txTypeIncome.classList.remove('active');
      els.txTypeExpense.classList.add('active');
    }
  }

  function getTxType() {
    return els.txTypeIncome.classList.contains('active') ? 'income' : 'expense';
  }

  function openAddModal() {
    state.editingTransaction = null;
    els.txModalTitle.textContent = window.I18n.t('add_transaction');
    
    // Reset form
    setTxType('expense');
    els.txAmount.value = '';
    els.txCurrencySelect.value = window.Currency.getDisplayCurrency();
    els.txRateToggle.checked = false;
    els.txRateManual.classList.add('hidden');
    els.txRateManual.value = '';
    els.txDescription.value = '';
    els.txDate.value = new Date().toISOString().split('T')[0];
    els.btnDeleteTx.classList.add('hidden');
    
    updateTxExchangeRateUI();
    els.txModal.classList.add('active');
  }

  function openEditModal(txId) {
    const tx = state.transactions.find(t => t.id === txId);
    if (!tx) return;
    
    state.editingTransaction = tx;
    els.txModalTitle.textContent = window.I18n.t('edit_transaction');
    
    setTxType(tx.type);
    els.txId.value = tx.id;
    els.txAmount.value = tx.amount;
    els.txCurrencySelect.value = tx.currency;
    els.txCategorySelect.value = tx.categoryId;
    els.txDescription.value = tx.description;
    els.txDate.value = tx.date;
    
    if (tx.customRate) {
      els.txRateToggle.checked = true;
      els.txRateManual.classList.remove('hidden');
      els.txRateManual.value = tx.customRate;
    } else {
      els.txRateToggle.checked = false;
      els.txRateManual.classList.add('hidden');
      els.txRateManual.value = '';
    }
    
    updateTxExchangeRateUI();
    els.btnDeleteTx.classList.remove('hidden');
    els.txModal.classList.add('active');
  }
  
  function closeTxModal() {
    els.txModal.classList.remove('active');
  }

  async function updateTxExchangeRateUI() {
    const selectedCur = els.txCurrencySelect.value;
    const displayCur = window.Currency.getDisplayCurrency();
    
    if (selectedCur === displayCur) {
      els.txRateContainer.classList.add('hidden');
    } else {
      els.txRateContainer.classList.remove('hidden');
      
      // Try get fresh rate
      const cached = window.Currency.getCachedRates(displayCur);
      if (cached && cached.rates[selectedCur]) {
         const rate = 1 / cached.rates[selectedCur];
         els.txRateValue.textContent = `1 ${selectedCur} = ${rate.toFixed(4)} ${displayCur}`;
      } else {
        els.txRateValue.textContent = '...';
        try {
          const fresh = await window.Currency.fetchRates(displayCur);
          if(fresh.rates[selectedCur]) {
            const rate = 1 / fresh.rates[selectedCur];
            els.txRateValue.textContent = `1 ${selectedCur} = ${rate.toFixed(4)} ${displayCur}`;
          }
        } catch(e) {}
      }
    }
  }

  function saveTransaction() {
    const amt = parseFloat(els.txAmount.value);
    if (isNaN(amt) || amt <= 0) return alert('Enter valid amount');
    
    const cur = els.txCurrencySelect.value;
    const cat = els.txCategorySelect.value;
    const date = els.txDate.value;
    if (!date) return alert('Select date');
    
    let customRate = null;
    if (cur !== window.Currency.getDisplayCurrency() && els.txRateToggle.checked) {
      customRate = parseFloat(els.txRateManual.value);
      if (isNaN(customRate) || customRate <= 0) return alert('Enter valid manual rate');
    }

    const txData = {
      type: getTxType(),
      amount: amt,
      currency: cur,
      customRate: customRate,
      categoryId: cat,
      description: els.txDescription.value,
      date: date
    };

    if (state.editingTransaction) {
      Object.assign(state.editingTransaction, txData);
    } else {
      txData.id = window.Data.generateId();
      txData.createdAt = new Date().toISOString();
      state.transactions.unshift(txData); // Add to top
    }
    
    // Sort again
    state.transactions.sort((a,b) => {
      if(a.date !== b.date) return b.date.localeCompare(a.date);
      return b.createdAt.localeCompare(a.createdAt);
    });

    saveTransactions();
    closeTxModal();
    renderAll();
    showToast(window.I18n.t('save'));
  }

  function deleteTransaction(txId) {
    showConfirm(window.I18n.t('confirm_delete'), () => {
      state.transactions = state.transactions.filter(t => t.id !== txId);
      saveTransactions();
      closeTxModal();
      renderAll();
      showToast(window.I18n.t('delete'));
    });
  }

  // --- Filtering ---
  
  function getFilteredTransactions() {
    let filtered = [...state.transactions];
    
    if (state.filterType !== 'all') {
      filtered = filtered.filter(t => t.type === state.filterType);
    }
    
    if (state.filterCategory !== 'all') {
      filtered = filtered.filter(t => t.categoryId === state.filterCategory);
    }
    
    const query = state.searchQuery.toLowerCase();
    if (query) {
      filtered = filtered.filter(t => 
        (t.description && t.description.toLowerCase().includes(query)) ||
        t.amount.toString().includes(query)
      );
    }
    
    if (state.filterDateRange !== 'all_time') {
      const range = getDateRange(state.filterDateRange);
      if (range) {
        filtered = filtered.filter(t => t.date >= range.start && t.date <= range.end);
      }
    }
    
    return filtered;
  }
  
  function getDateRange(preset) {
    const Data = window.Data;
    switch(preset) {
      case 'this_week': return Data.getWeekRange();
      case 'this_month': return Data.getMonthRange(0);
      case 'last_month': return Data.getMonthRange(-1);
      case 'last_3_months': 
        const m3 = Data.getMonthRange(-2);
        const curr = Data.getMonthRange(0);
        return { start: m3.start, end: curr.end };
      case 'this_year': return Data.getYearRange();
      default: return null;
    }
  }

  // --- Category Management Modal ---
  
  function openCategoryModal(catId = null) {
    els.catEmojiGrid.innerHTML = '';
    els.catColorGrid.innerHTML = '';
    
    // Build Emoji Grid
    window.Categories.EMOJI_LIST.forEach(emoji => {
      const btn = document.createElement('div');
      btn.className = 'emoji-btn';
      btn.textContent = emoji;
      btn.addEventListener('click', () => selectEmoji(emoji));
      els.catEmojiGrid.appendChild(btn);
    });
    
    // Build Color Grid
    window.Categories.COLOR_PRESETS.forEach(color => {
      const btn = document.createElement('div');
      btn.className = 'color-btn';
      btn.style.backgroundColor = color;
      btn.addEventListener('click', () => selectColor(color));
      els.catColorGrid.appendChild(btn);
    });
    
    if (catId) {
      const cat = window.Categories.getById(catId);
      state.editingCategory = cat;
      els.catModalTitle.textContent = window.I18n.t('edit_category');
      els.catNameEn.value = cat.nameEN;
      els.catNameAr.value = cat.nameAR;
      selectEmoji(cat.emoji);
      selectColor(cat.color);
    } else {
      state.editingCategory = null;
      els.catModalTitle.textContent = window.I18n.t('add_category');
      els.catNameEn.value = '';
      els.catNameAr.value = '';
      selectEmoji(window.Categories.EMOJI_LIST[0]);
      selectColor(window.Categories.COLOR_PRESETS[0]);
    }
    
    els.catModal.classList.add('active');
  }
  
  function selectEmoji(emoji) {
    els.catSelectedEmoji.textContent = emoji;
    els.catSelectedEmoji.dataset.value = emoji;
    // Highlight in grid
    els.catEmojiGrid.querySelectorAll('.emoji-btn').forEach(btn => {
      btn.classList.toggle('selected', btn.textContent === emoji);
    });
  }
  
  function selectColor(color) {
    els.catSelectedColor.style.backgroundColor = color;
    els.catSelectedColor.dataset.value = color;
    // Highlight in grid
    els.catColorGrid.querySelectorAll('.color-btn').forEach(btn => {
      btn.classList.toggle('selected', btn.style.backgroundColor === color || btn.style.backgroundColor === _hexToRgb(color));
    });
  }
  
  function _hexToRgb(hex) {
    // simple helper because browser converts inline style hex to rgb
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})` : hex;
  }
  
  function closeCategoryModal() {
    els.catModal.classList.remove('active');
  }
  
  function saveCategory() {
    const en = els.catNameEn.value.trim();
    const ar = els.catNameAr.value.trim();
    if (!en || !ar) return alert('Enter both names');
    
    const emoji = els.catSelectedEmoji.dataset.value;
    const color = els.catSelectedColor.dataset.value;
    
    const catData = { nameEN: en, nameAR: ar, emoji, color };
    
    if (state.editingCategory) {
      window.Categories.update(state.editingCategory.id, catData);
    } else {
      window.Categories.add(catData);
    }
    
    closeCategoryModal();
    renderCategories();
    populateCategoryDropdowns(); // Update forms/filters
    renderAll(); // Rerender UI that might use categories (charts, lists)
    showToast(window.I18n.t('save'));
  }
  
  function deleteCategory(catId) {
    // Check if used
    const used = state.transactions.some(t => t.categoryId === catId);
    const msg = used ? window.I18n.t('category_in_use') + '\n\n' + window.I18n.t('confirm_delete') : window.I18n.t('confirm_delete');
    
    showConfirm(msg, () => {
      window.Categories.remove(catId);
      // Reassign transactions
      if (used) {
        state.transactions.forEach(t => {
          if (t.categoryId === catId) t.categoryId = 'cat_other'; // fallback
        });
        saveTransactions();
      }
      renderCategories();
      populateCategoryDropdowns();
      renderAll();
      showToast(window.I18n.t('delete'));
    });
  }

  // --- Populators & Helpers ---

  function populateCurrencyDropdowns() {
    const curs = window.Currency.CURRENCIES;
    const lang = window.I18n.getCurrentLanguage();
    
    let html = '';
    curs.forEach(c => {
      const name = lang === 'ar' ? c.nameAR : c.nameEN;
      html += `<option value="${c.code}">${c.flag} ${c.code} - ${name}</option>`;
    });
    
    els.txCurrencySelect.innerHTML = html;
    els.settingsDisplayCurrency.innerHTML = html;
    
    els.txCurrencySelect.value = window.Currency.getDisplayCurrency();
    els.settingsDisplayCurrency.value = window.Currency.getDisplayCurrency();
  }
  
  function populateCategoryDropdowns() {
    const cats = window.Categories.getAll();
    const lang = window.I18n.getCurrentLanguage();
    
    let htmlForm = '';
    let htmlFilter = `<option value="all" data-i18n="all">${window.I18n.t('all')}</option>`;
    
    cats.forEach(c => {
      const name = lang === 'ar' ? c.nameAR : c.nameEN;
      const opt = `<option value="${c.id}">${c.emoji} ${name}</option>`;
      htmlForm += opt;
      htmlFilter += opt;
    });
    
    els.txCategorySelect.innerHTML = htmlForm;
    els.filterCategory.innerHTML = htmlFilter;
    
    // Restore filter selection if possible
    if(cats.find(c => c.id === state.filterCategory)) {
       els.filterCategory.value = state.filterCategory;
    } else {
       state.filterCategory = 'all';
       els.filterCategory.value = 'all';
    }
  }

  function handleImportCSV(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    window.Data.importCSV(file).then(txs => {
      if (txs.length > 0) {
        state.transactions = [...state.transactions, ...txs];
        saveTransactions();
        renderAll();
        showToast(`Imported ${txs.length} transactions`);
      }
    }).catch(err => {
      alert("Error importing CSV: " + err.message);
    });
    e.target.value = ''; // reset
  }

  // --- Utilities ---
  
  function toggleLanguage() {
    const cur = window.I18n.getCurrentLanguage();
    window.I18n.setLanguage(cur === 'ar' ? 'en' : 'ar');
    translateUI();
    populateCurrencyDropdowns(); // Re-render for localized names
    populateCategoryDropdowns();
    renderAll();
  }
  
  function translateUI() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if (el.tagName === 'INPUT' && el.placeholder) {
        el.placeholder = window.I18n.t(key);
      } else {
        el.textContent = window.I18n.t(key);
      }
    });
    // Options inside selects that have i18n
    document.querySelectorAll('option[data-i18n]').forEach(el => {
       el.textContent = window.I18n.t(el.dataset.i18n);
    });
  }

  function showToast(msg) {
    els.toast.textContent = msg;
    els.toast.classList.add('show');
    setTimeout(() => els.toast.classList.remove('show'), 3000);
  }
  
  function showConfirm(msg, onYes) {
    els.confirmMessage.textContent = msg;
    els.confirmDialog.classList.add('active');
    
    const onYesClick = () => { cleanup(); onYes(); };
    const onNoClick = () => { cleanup(); };
    
    const cleanup = () => {
      els.confirmDialog.classList.remove('active');
      els.btnConfirmYes.removeEventListener('click', onYesClick);
      els.btnConfirmNo.removeEventListener('click', onNoClick);
    };
    
    els.btnConfirmYes.addEventListener('click', onYesClick);
    els.btnConfirmNo.addEventListener('click', onNoClick);
  }

  function debounce(func, wait) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  function animateCountUp(el, target, duration, currencyCode) {
    const start = 0;
    const startTime = performance.now();
    
    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing easeOutQuart
      const ease = 1 - Math.pow(1 - progress, 4);
      const current = start + (target - start) * ease;
      
      el.textContent = window.Currency.formatAmount(current, currencyCode);
      
      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }
    requestAnimationFrame(update);
  }

  // Expose init
  return { init };

})();

document.addEventListener('DOMContentLoaded', window.App.init);
