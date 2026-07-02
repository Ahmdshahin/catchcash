window.Currency = (function() {
  const CURRENCIES = [
    { code:'USD', symbol:'$', flag:'🇺🇸', nameEN:'US Dollar', nameAR:'دولار أمريكي', decimals:2 },
    { code:'SAR', symbol:'﷼', flag:'🇸🇦', nameEN:'Saudi Riyal', nameAR:'ريال سعودي', decimals:2 },
    { code:'AED', symbol:'د.إ', flag:'🇦🇪', nameEN:'UAE Dirham', nameAR:'درهم إماراتي', decimals:2 },
    { code:'EUR', symbol:'€', flag:'🇪🇺', nameEN:'Euro', nameAR:'يورو', decimals:2 },
    { code:'GBP', symbol:'£', flag:'🇬🇧', nameEN:'British Pound', nameAR:'جنيه إسترليني', decimals:2 },
    { code:'EGP', symbol:'ج.م', flag:'🇪🇬', nameEN:'Egyptian Pound', nameAR:'جنيه مصري', decimals:2 },
    { code:'KWD', symbol:'د.ك', flag:'🇰🇼', nameEN:'Kuwaiti Dinar', nameAR:'دينار كويتي', decimals:3 },
    { code:'BHD', symbol:'.د.ب', flag:'🇧🇭', nameEN:'Bahraini Dinar', nameAR:'دينار بحريني', decimals:3 },
    { code:'QAR', symbol:'ر.ق', flag:'🇶🇦', nameEN:'Qatari Riyal', nameAR:'ريال قطري', decimals:2 },
    { code:'OMR', symbol:'ر.ع', flag:'🇴🇲', nameEN:'Omani Rial', nameAR:'ريال عماني', decimals:3 },
    { code:'JOD', symbol:'د.أ', flag:'🇯🇴', nameEN:'Jordanian Dinar', nameAR:'دينار أردني', decimals:3 },
    { code:'TRY', symbol:'₺', flag:'🇹🇷', nameEN:'Turkish Lira', nameAR:'ليرة تركية', decimals:2 },
    { code:'INR', symbol:'₹', flag:'🇮🇳', nameEN:'Indian Rupee', nameAR:'روبية هندية', decimals:2 },
    { code:'PKR', symbol:'Rs', flag:'🇵🇰', nameEN:'Pakistani Rupee', nameAR:'روبية باكستانية', decimals:2 },
    { code:'MAD', symbol:'د.م', flag:'🇲🇦', nameEN:'Moroccan Dirham', nameAR:'درهم مغربي', decimals:2 }
  ];

  let displayCurrency = 'SAR';
  let currentUserUid = null;

  function init(uid) {
    currentUserUid = uid;
    const savedSettings = JSON.parse(localStorage.getItem(`catchcash_${uid}_settings`) || '{}');
    displayCurrency = savedSettings.displayCurrency || 'SAR';
    
    // Attempt to fetch fresh rates
    fetchRates(displayCurrency).catch(e => console.warn('Could not fetch rates, will use cached', e));
  }

  function getDisplayCurrency() {
    return displayCurrency;
  }

  function setDisplayCurrency(uid, code) {
    if (CURRENCIES.find(c => c.code === code)) {
      displayCurrency = code;
      if (currentUserUid) {
        const savedSettings = JSON.parse(localStorage.getItem(`catchcash_${currentUserUid}_settings`) || '{}');
        savedSettings.displayCurrency = code;
        localStorage.setItem(`catchcash_${currentUserUid}_settings`, JSON.stringify(savedSettings));
      }
      fetchRates(code).catch(e => console.warn('Could not fetch rates', e));
    }
  }

  function getCurrencyByCode(code) {
    return CURRENCIES.find(c => c.code === code) || CURRENCIES[0];
  }

  async function fetchRates(baseCurrency) {
    try {
      const response = await fetch(`https://open.er-api.com/v6/latest/${baseCurrency}`);
      if (!response.ok) throw new Error('API response not ok');
      const data = await response.json();
      
      const cacheData = {
        base: data.base_code,
        rates: data.rates,
        timestamp: Date.now()
      };
      
      localStorage.setItem(`catchcash_rates_${baseCurrency}`, JSON.stringify(cacheData));
      return cacheData;
    } catch (error) {
      console.error('Error fetching rates:', error);
      throw error;
    }
  }

  function getCachedRates(baseCurrency) {
    const cached = localStorage.getItem(`catchcash_rates_${baseCurrency}`);
    if (cached) {
      const parsed = JSON.parse(cached);
      // Valid for 24 hours
      if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
        return parsed;
      }
    }
    return null;
  }

  function convert(amount, fromCode, toCode, customRate = null) {
    if (!amount) return 0;
    if (fromCode === toCode) return amount;
    
    if (customRate !== null && customRate > 0) {
       // Assuming custom rate is fromCode -> toCode
       return amount * customRate;
    }

    // Try to get cached rates from 'toCode' (since that's likely the display currency we fetched for)
    const ratesDataTo = getCachedRates(toCode);
    if (ratesDataTo && ratesDataTo.rates[fromCode]) {
      // We have base=toCode, rate for fromCode
      // 1 toCode = X fromCode  => amount fromCode / X = amount toCode
      return amount / ratesDataTo.rates[fromCode];
    }

    // Try the other way
    const ratesDataFrom = getCachedRates(fromCode);
    if (ratesDataFrom && ratesDataFrom.rates[toCode]) {
      // 1 fromCode = Y toCode
      return amount * ratesDataFrom.rates[toCode];
    }

    // Fallback: approximate if no rates
    return amount; 
  }

  // Cache for Intl.NumberFormat to massively improve animation performance
  const formattersCache = {};

  function formatAmount(amount, currencyCode) {
    const cur = getCurrencyByCode(currencyCode);
    const isAr = window.I18n ? window.I18n.getCurrentLanguage() === 'ar' : false;
    const locale = isAr ? 'ar-SA' : 'en-US';
    
    const cacheKey = `${locale}_${cur.decimals}`;
    
    if (!formattersCache[cacheKey]) {
      formattersCache[cacheKey] = new Intl.NumberFormat(locale, {
        minimumFractionDigits: cur.decimals,
        maximumFractionDigits: cur.decimals
      });
    }
    
    const formattedNum = formattersCache[cacheKey].format(amount);

    if (isAr) {
       return `${formattedNum} ${cur.symbol}`;
    }
    return `${cur.symbol}${formattedNum}`;
  }

  return {
    CURRENCIES,
    init,
    getDisplayCurrency,
    setDisplayCurrency,
    getCurrencyByCode,
    fetchRates,
    getCachedRates,
    convert,
    formatAmount
  };
})();
