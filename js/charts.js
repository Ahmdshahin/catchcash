window.Charts = (function() {
  let dashboardSpendingChart = null;
  let dashboardTrendChart = null;
  let analyticsSpendingChart = null;
  let analyticsTrendChart = null;
  let analyticsCategoryChart = null;
  let analyticsCurrencyChart = null;

  // Chart.js global defaults for dark theme
  if (window.Chart) {
    Chart.defaults.color = '#94a3b8';
    Chart.defaults.font.family = "'Inter', sans-serif";
    Chart.defaults.scale.grid.color = 'rgba(255, 255, 255, 0.05)';
    Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    Chart.defaults.plugins.tooltip.padding = 12;
    Chart.defaults.plugins.tooltip.cornerRadius = 8;
  }

  function getCatName(cat) {
    if (!cat) return window.I18n.t('uncategorized');
    return window.I18n.getCurrentLanguage() === 'ar' ? cat.nameAR : cat.nameEN;
  }

  function groupByCategory(transactions, categories, displayCurrency) {
    const expenses = transactions.filter(t => t.type === 'expense');
    const grouped = {};
    
    expenses.forEach(tx => {
      const catId = tx.categoryId;
      const amount = window.Currency.convert(tx.amount, tx.currency, displayCurrency, tx.customRate);
      if (!grouped[catId]) {
        grouped[catId] = { amount: 0, cat: categories.find(c => c.id === catId) };
      }
      grouped[catId].amount += amount;
    });

    // Sort by amount descending
    const sorted = Object.values(grouped).sort((a, b) => b.amount - a.amount);
    
    return {
      labels: sorted.map(item => getCatName(item.cat)),
      data: sorted.map(item => item.amount),
      colors: sorted.map(item => item.cat ? item.cat.color : '#94a3b8')
    };
  }

  function groupByMonth(transactions, displayCurrency) {
    // Get last 6 months
    const months = [];
    for (let i = 5; i >= 0; i--) {
      months.push(window.Data.getMonthRange(-i).start.substring(0, 7)); // YYYY-MM
    }

    const income = Array(6).fill(0);
    const expense = Array(6).fill(0);

    transactions.forEach(tx => {
      const monthKey = window.Data.getMonthKey(tx.date);
      const index = months.indexOf(monthKey);
      if (index !== -1) {
        const amount = window.Currency.convert(tx.amount, tx.currency, displayCurrency, tx.customRate);
        if (tx.type === 'income') income[index] += amount;
        else expense[index] += amount;
      }
    });

    // Format labels nicely
    const isAr = window.I18n.getCurrentLanguage() === 'ar';
    const labels = months.map(m => {
      const d = new Date(m + '-01');
      return d.toLocaleDateString(isAr ? 'ar-SA' : 'en-US', { month: 'short' });
    });

    return { labels, income, expense };
  }

  function groupByCurrency(transactions) {
    const expenses = transactions.filter(t => t.type === 'expense');
    const grouped = {};
    
    expenses.forEach(tx => {
      if (!grouped[tx.currency]) grouped[tx.currency] = 0;
      grouped[tx.currency] += tx.amount; // original amount
    });

    const sorted = Object.entries(grouped).sort((a, b) => b[1] - a[1]);
    
    // Generate distinct colors for currencies
    const colors = ['#8B5CF6', '#F472B6', '#4ECDC4', '#FFE66D', '#FF6B6B', '#34D399', '#60A5FA'];

    return {
      labels: sorted.map(i => i[0]),
      data: sorted.map(i => i[1]),
      colors: sorted.map((_, i) => colors[i % colors.length])
    };
  }

  function createDoughnutChart(ctx, data, displayCurrency) {
    if (!ctx) return null;
    return new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: data.labels,
        datasets: [{
          data: data.data,
          backgroundColor: data.colors,
          borderWidth: 0,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 12, usePointStyle: true } },
          tooltip: {
            callbacks: {
              label: function(context) {
                let label = context.label || '';
                if (label) label += ': ';
                label += window.Currency.formatAmount(context.raw, displayCurrency);
                return label;
              }
            }
          }
        }
      }
    });
  }

  function createBarChart(ctx, data, displayCurrency) {
    if (!ctx) return null;
    return new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: [
          {
            label: window.I18n.t('income'),
            data: data.income,
            backgroundColor: '#10B981',
            borderRadius: 4
          },
          {
            label: window.I18n.t('expense'),
            data: data.expense,
            backgroundColor: '#EF4444',
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { grid: { display: false } },
          y: { 
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                // Shorten large numbers
                if (value >= 1000) return (value/1000) + 'k';
                return value;
              }
            }
          }
        },
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 12, usePointStyle: true } },
          tooltip: {
            callbacks: {
              label: function(context) {
                return context.dataset.label + ': ' + window.Currency.formatAmount(context.raw, displayCurrency);
              }
            }
          }
        }
      }
    });
  }

  function createHorizontalBarChart(ctx, data, displayCurrency) {
    if (!ctx) return null;
    return new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: [{
          data: data.data,
          backgroundColor: data.colors,
          borderRadius: 4
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(context) {
                return window.Currency.formatAmount(context.raw, displayCurrency);
              }
            }
          }
        },
        scales: {
          x: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } },
          y: { grid: { display: false } }
        }
      }
    });
  }

  function createCurrencyDoughnutChart(ctx, data) {
    if (!ctx) return null;
    return new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: data.labels,
        datasets: [{
          data: data.data,
          backgroundColor: data.colors,
          borderWidth: 0,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
          legend: { position: 'right', labels: { boxWidth: 12, usePointStyle: true } },
          tooltip: {
            callbacks: {
              label: function(context) {
                // For currency breakdown, we format in the original currency
                const code = data.labels[context.dataIndex];
                return code + ': ' + window.Currency.formatAmount(context.raw, code);
              }
            }
          }
        }
      }
    });
  }

  function initDashboard(transactions, categories, displayCurrency) {
    if (dashboardSpendingChart) dashboardSpendingChart.destroy();
    if (dashboardTrendChart) dashboardTrendChart.destroy();

    const spendingData = groupByCategory(transactions, categories, displayCurrency);
    const trendData = groupByMonth(transactions, displayCurrency);

    const spendCtx = document.getElementById('chart-spending-canvas');
    const trendCtx = document.getElementById('chart-trend-canvas');
    
    dashboardSpendingChart = createDoughnutChart(spendCtx, spendingData, displayCurrency);
    dashboardTrendChart = createBarChart(trendCtx, trendData, displayCurrency);
  }

  function initAnalytics(transactions, categories, displayCurrency) {
    if (analyticsSpendingChart) analyticsSpendingChart.destroy();
    if (analyticsTrendChart) analyticsTrendChart.destroy();
    if (analyticsCategoryChart) analyticsCategoryChart.destroy();
    if (analyticsCurrencyChart) analyticsCurrencyChart.destroy();

    const spendingData = groupByCategory(transactions, categories, displayCurrency);
    const trendData = groupByMonth(transactions, displayCurrency);
    const currData = groupByCurrency(transactions);

    const spendCtx = document.getElementById('chart-analytics-spending-canvas');
    const trendCtx = document.getElementById('chart-analytics-trend-canvas');
    const catCtx = document.getElementById('chart-analytics-category-canvas');
    const currCtx = document.getElementById('chart-analytics-currency-canvas');

    analyticsSpendingChart = createDoughnutChart(spendCtx, spendingData, displayCurrency);
    analyticsTrendChart = createBarChart(trendCtx, trendData, displayCurrency);
    analyticsCategoryChart = createHorizontalBarChart(catCtx, spendingData, displayCurrency); // Reusing spending data for ranking
    analyticsCurrencyChart = createCurrencyDoughnutChart(currCtx, currData);
  }

  function destroyAll() {
    if (dashboardSpendingChart) dashboardSpendingChart.destroy();
    if (dashboardTrendChart) dashboardTrendChart.destroy();
    if (analyticsSpendingChart) analyticsSpendingChart.destroy();
    if (analyticsTrendChart) analyticsTrendChart.destroy();
    if (analyticsCategoryChart) analyticsCategoryChart.destroy();
    if (analyticsCurrencyChart) analyticsCurrencyChart.destroy();
  }

  return {
    initDashboard,
    initAnalytics,
    updateDashboard: initDashboard,
    updateAnalytics: initAnalytics,
    destroyAll
  };
})();
