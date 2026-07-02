window.Data = (function() {
  const DEFAULT_CATEGORIES = [
    { id: 'cat_food', nameEN: 'Food & Dining', nameAR: 'طعام ومطاعم', emoji: '🍔', color: '#FF6B6B' },
    { id: 'cat_transport', nameEN: 'Transport', nameAR: 'المواصلات', emoji: '🚗', color: '#4ECDC4' },
    { id: 'cat_bills', nameEN: 'Bills & Utilities', nameAR: 'فواتير وخدمات', emoji: '💡', color: '#FFE66D' },
    { id: 'cat_shopping', nameEN: 'Shopping', nameAR: 'تسوق', emoji: '🛍️', color: '#A78BFA' },
    { id: 'cat_entertainment', nameEN: 'Entertainment', nameAR: 'ترفيه', emoji: '🎮', color: '#F472B6' },
    { id: 'cat_health', nameEN: 'Health', nameAR: 'صحة', emoji: '🏥', color: '#34D399' },
    { id: 'cat_education', nameEN: 'Education', nameAR: 'تعليم', emoji: '📚', color: '#60A5FA' },
    { id: 'cat_rent', nameEN: 'Rent', nameAR: 'إيجار', emoji: '🏠', color: '#FB923C' },
    { id: 'cat_salary', nameEN: 'Salary', nameAR: 'راتب', emoji: '💰', color: '#10B981' },
    { id: 'cat_freelance', nameEN: 'Freelance', nameAR: 'عمل حر', emoji: '💼', color: '#8B5CF6' },
    { id: 'cat_gifts', nameEN: 'Gifts', nameAR: 'هدايا', emoji: '🎁', color: '#EC4899' },
    { id: 'cat_other', nameEN: 'Other', nameAR: 'أخرى', emoji: '📦', color: '#94A3B8' }
  ];

  function generateId() {
    return 'id_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  function formatDate(dateStr, lang = 'en') {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  function getMonthKey(dateStr) {
    if (!dateStr) return '';
    return dateStr.substring(0, 7); // YYYY-MM
  }

  function getWeekRange() {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday
    // Assuming week starts on Sunday
    const start = new Date(now);
    start.setDate(now.getDate() - dayOfWeek);
    start.setHours(0,0,0,0);
    
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23,59,59,999);
    
    return { 
      start: start.toISOString().split('T')[0], 
      end: end.toISOString().split('T')[0] 
    };
  }

  function getMonthRange(offset = 0) {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    const end = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0);
    
    return {
      start: _formatToYYYYMMDD(start),
      end: _formatToYYYYMMDD(end)
    };
  }
  
  function getYearRange() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const end = new Date(now.getFullYear(), 11, 31);
    
    return {
      start: _formatToYYYYMMDD(start),
      end: _formatToYYYYMMDD(end)
    };
  }
  
  function _formatToYYYYMMDD(date) {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  function exportCSV(transactions, categories) {
    if (!transactions || transactions.length === 0) return;
    
    // Create map for fast category lookup
    const catMap = {};
    categories.forEach(c => catMap[c.id] = c);

    // CSV Header
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    csvContent += "Date,Type,Amount,Currency,Category(EN),Category(AR),Description\n";

    transactions.forEach(tx => {
      const cat = catMap[tx.categoryId];
      const catEN = cat ? `"${cat.nameEN.replace(/"/g, '""')}"` : '"Uncategorized"';
      const catAR = cat ? `"${cat.nameAR.replace(/"/g, '""')}"` : '"غير مصنف"';
      const desc = `"${(tx.description || '').replace(/"/g, '""')}"`;
      const type = tx.type;
      
      const row = `${tx.date},${type},${tx.amount},${tx.currency},${catEN},${catAR},${desc}`;
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `catchcash_export_${_formatToYYYYMMDD(new Date())}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function importCSV(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = function(e) {
        const text = e.target.result;
        try {
          const txs = _parseCSV(text);
          resolve(txs);
        } catch(err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  function _parseCSV(text) {
    // Basic CSV parser, ignoring headers if present
    const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
    const transactions = [];
    
    let startIdx = 0;
    if (lines[0].includes('Date,Type')) {
      startIdx = 1;
    }
    
    for(let i = startIdx; i < lines.length; i++) {
      // Very basic regex to handle quotes
      // Matches fields separated by comma, respecting quotes
      const matches = lines[i].match(/(?!\s*$)\s*(?:'([^'\\]*(?:\\[\s\S][^'\\]*)*)'|"([^"\\]*(?:\\[\s\S][^"\\]*)*)"|([^,'"\s\\]*(?:\s+[^,'"\s\\]+)*))\s*(?:,|$)/g);
      
      if (!matches) continue;
      
      const cols = matches.map(m => {
        let val = m.replace(/,$/, '').trim();
        if (val.startsWith('"') && val.endsWith('"')) {
          val = val.substring(1, val.length - 1).replace(/""/g, '"');
        }
        return val;
      });
      
      // Expected: Date, Type, Amount, Currency, Category(EN), Category(AR), Description
      if (cols.length >= 4) {
        const date = cols[0];
        const type = cols[1];
        const amount = parseFloat(cols[2]);
        const currency = cols[3];
        const description = cols.length >= 7 ? cols[6] : '';
        
        if (date && (type === 'income' || type === 'expense') && !isNaN(amount) && currency) {
          transactions.push({
            id: generateId(),
            type: type,
            amount: amount,
            currency: currency.toUpperCase(),
            customRate: null,
            categoryId: 'cat_other', // Fallback, will need proper mapping in app layer
            description: description,
            date: date,
            createdAt: new Date().toISOString()
          });
        }
      }
    }
    
    return transactions;
  }

  return {
    DEFAULT_CATEGORIES,
    generateId,
    formatDate,
    getMonthKey,
    getWeekRange,
    getMonthRange,
    getYearRange,
    exportCSV,
    importCSV
  };
})();
