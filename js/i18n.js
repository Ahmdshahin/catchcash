window.I18n = (function() {
  let currentLanguage = 'ar';
  let currentUserUid = null;

  const translations = {
    ar: {
      app_name: 'اطمن على فلوسك',
      sign_in: 'تسجيل الدخول',
      sign_in_google: 'تسجيل الدخول باستخدام جوجل',
      sign_out: 'تسجيل الخروج',
      dashboard: 'لوحة التحكم',
      history: 'السجل',
      analytics: 'التحليلات',
      settings: 'الإعدادات',
      add: 'إضافة',
      income: 'الدخل',
      expense: 'المصروفات',
      balance: 'الرصيد',
      total_income: 'إجمالي الدخل',
      total_expenses: 'إجمالي المصروفات',
      add_transaction: 'إضافة معاملة',
      edit_transaction: 'تعديل معاملة',
      save: 'حفظ',
      cancel: 'إلغاء',
      delete: 'حذف',
      confirm: 'تأكيد',
      amount: 'المبلغ',
      currency: 'العملة',
      category: 'الفئة',
      description: 'الوصف',
      date: 'التاريخ',
      exchange_rate: 'سعر الصرف',
      auto_rate: 'تلقائي',
      manual_rate: 'يدوي',
      search: 'بحث...',
      filter: 'تصفية',
      all: 'الكل',
      type: 'النوع',
      date_range: 'الفترة الزمنية',
      this_week: 'هذا الأسبوع',
      this_month: 'هذا الشهر',
      last_month: 'الشهر الماضي',
      last_3_months: 'آخر 3 أشهر',
      this_year: 'هذا العام',
      all_time: 'كل الوقت',
      custom_range: 'فترة مخصصة',
      manage_categories: 'إدارة الفئات',
      add_category: 'إضافة فئة',
      edit_category: 'تعديل فئة',
      delete_category: 'حذف فئة',
      reset_defaults: 'استعادة الافتراضيات',
      category_name_en: 'اسم الفئة (إنجليزي)',
      category_name_ar: 'اسم الفئة (عربي)',
      pick_emoji: 'اختر رمز تعبيري',
      pick_color: 'اختر لون',
      display_currency: 'عملة العرض',
      language: 'اللغة',
      export_csv: 'تصدير CSV',
      import_csv: 'استيراد CSV',
      clear_data: 'مسح بياناتي',
      confirm_delete: 'هل أنت متأكد أنك تريد حذف هذا العنصر؟',
      confirm_clear: 'هل أنت متأكد أنك تريد مسح جميع بياناتك؟ لا يمكن التراجع عن هذا الإجراء.',
      no_transactions: 'لا توجد معاملات بعد.',
      no_data: 'لا توجد بيانات',
      daily_average: 'المتوسط اليومي',
      biggest_expense: 'أكبر مصروف',
      monthly_trend: 'الاتجاه الشهري',
      spending_breakdown: 'تفصيل المصروفات',
      category_comparison: 'مقارنة الفئات',
      currency_breakdown: 'تفصيل العملات',
      top_categories: 'أعلى الفئات',
      recent_transactions: 'المعاملات الأخيرة',
      install_guide: 'دليل التثبيت',
      about: 'حول التطبيق',
      select_currency: 'اختر العملة',
      rate_info: 'سعر الصرف الحالي',
      welcome_back: 'مرحباً بعودتك',
      profile: 'الملف الشخصي',
      settings_saved: 'تم حفظ الإعدادات',
      category_in_use: 'هذه الفئة قيد الاستخدام في معاملات سابقة. سيتم تصنيفها كـ "غير مصنف" إذا قمت بحذفها.',
      uncategorized: 'غير مصنف',
      set_daily_reminder: 'تفعيل التذكير اليومي',
      reminder_title: 'تسجيل المصروفات 💰',
      reminder_desc: 'لا تنسى تسجيل مصروفاتك اليوم في تطبيق كاتش كاش!'
    },
    en: {
      app_name: 'Catch Cash',
      sign_in: 'Sign In',
      sign_in_google: 'Sign in with Google',
      sign_out: 'Sign Out',
      dashboard: 'Dashboard',
      history: 'History',
      analytics: 'Analytics',
      settings: 'Settings',
      add: 'Add',
      income: 'Income',
      expense: 'Expense',
      balance: 'Balance',
      total_income: 'Total Income',
      total_expenses: 'Total Expenses',
      add_transaction: 'Add Transaction',
      edit_transaction: 'Edit Transaction',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      confirm: 'Confirm',
      amount: 'Amount',
      currency: 'Currency',
      category: 'Category',
      description: 'Description',
      date: 'Date',
      exchange_rate: 'Exchange Rate',
      auto_rate: 'Auto',
      manual_rate: 'Manual',
      search: 'Search...',
      filter: 'Filter',
      all: 'All',
      type: 'Type',
      date_range: 'Date Range',
      this_week: 'This Week',
      this_month: 'This Month',
      last_month: 'Last Month',
      last_3_months: 'Last 3 Months',
      this_year: 'This Year',
      all_time: 'All Time',
      custom_range: 'Custom Range',
      manage_categories: 'Manage Categories',
      add_category: 'Add Category',
      edit_category: 'Edit Category',
      delete_category: 'Delete Category',
      reset_defaults: 'Reset Defaults',
      category_name_en: 'Category Name (EN)',
      category_name_ar: 'Category Name (AR)',
      pick_emoji: 'Pick Emoji',
      pick_color: 'Pick Color',
      display_currency: 'Display Currency',
      language: 'Language',
      export_csv: 'Export CSV',
      import_csv: 'Import CSV',
      clear_data: 'Clear My Data',
      confirm_delete: 'Are you sure you want to delete this item?',
      confirm_clear: 'Are you sure you want to clear all your data? This cannot be undone.',
      no_transactions: 'No transactions yet.',
      no_data: 'No data',
      daily_average: 'Daily Average',
      biggest_expense: 'Biggest Expense',
      monthly_trend: 'Monthly Trend',
      spending_breakdown: 'Spending Breakdown',
      category_comparison: 'Category Comparison',
      currency_breakdown: 'Currency Breakdown',
      top_categories: 'Top Categories',
      recent_transactions: 'Recent Transactions',
      install_guide: 'Install Guide',
      about: 'About',
      select_currency: 'Select Currency',
      rate_info: 'Current Exchange Rate',
      welcome_back: 'Welcome Back',
      profile: 'Profile',
      settings_saved: 'Settings Saved',
      category_in_use: 'This category is in use. Transactions will become "Uncategorized" if you delete it.',
      uncategorized: 'Uncategorized',
      set_daily_reminder: 'Set Daily Reminder',
      reminder_title: 'Track Expenses 💰',
      reminder_desc: 'Don\'t forget to track your daily expenses in Catch Cash!'
    }
  };

  function init(uid) {
    currentUserUid = uid;
    const savedSettings = JSON.parse(localStorage.getItem(`catchcash_${uid}_settings`) || '{}');
    currentLanguage = savedSettings.language || 'ar';
    applyLanguageToDocument();
  }

  function setLanguage(lang) {
    if (lang === 'ar' || lang === 'en') {
      currentLanguage = lang;
      if (currentUserUid) {
        const savedSettings = JSON.parse(localStorage.getItem(`catchcash_${currentUserUid}_settings`) || '{}');
        savedSettings.language = lang;
        localStorage.setItem(`catchcash_${currentUserUid}_settings`, JSON.stringify(savedSettings));
      }
      applyLanguageToDocument();
    }
  }

  function applyLanguageToDocument() {
    document.documentElement.lang = currentLanguage;
    document.documentElement.dir = currentLanguage === 'ar' ? 'rtl' : 'ltr';
  }

  function t(key) {
    return translations[currentLanguage][key] || translations['en'][key] || key;
  }

  function getCurrentLanguage() {
    return currentLanguage;
  }

  return {
    init,
    setLanguage,
    getCurrentLanguage,
    t
  };
})();
