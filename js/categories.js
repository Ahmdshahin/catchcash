window.Categories = (function() {
  let currentUserUid = null;
  let categories = [];

  const EMOJI_LIST = [
    '💰','💵','💳','🏠','🍔','🍕','☕','🚗','✈️','🚌','💡','📱','🛍️','👕','🎮',
    '🎬','🎵','📚','🏥','💊','🏋️','⚽','🐾','👶','💼','🎁','📦','🧾','💸','🏦',
    '📊','🔧','🛒','🍎','🥤','🌐','📰','💻','🎓','✂️','🧹','🏢','🎉','🚕'
  ];

  const COLOR_PRESETS = [
    '#FF6B6B','#FF8A65','#FFB74D','#FFE66D','#A5D6A7','#4ECDC4','#34D399','#10B981',
    '#60A5FA','#42A5F5','#7E57C2','#8B5CF6','#A78BFA','#F472B6','#EC4899','#94A3B8'
  ];

  function init(uid) {
    currentUserUid = uid;
    load();
  }

  function load() {
    if (!currentUserUid) return;
    const stored = localStorage.getItem(`catchcash_${currentUserUid}_categories`);
    if (stored) {
      categories = JSON.parse(stored);
    } else {
      reset(); // Sets to default and saves
    }
  }

  function save() {
    if (!currentUserUid) return;
    localStorage.setItem(`catchcash_${currentUserUid}_categories`, JSON.stringify(categories));
  }

  function getAll() {
    return [...categories];
  }

  function getById(id) {
    return categories.find(c => c.id === id) || null;
  }

  function add({ nameEN, nameAR, emoji, color }) {
    const newCat = {
      id: window.Data.generateId(),
      nameEN: nameEN || 'New Category',
      nameAR: nameAR || 'فئة جديدة',
      emoji: emoji || '📁',
      color: color || '#94A3B8'
    };
    categories.push(newCat);
    save();
    return newCat;
  }

  function update(id, updates) {
    const index = categories.findIndex(c => c.id === id);
    if (index !== -1) {
      categories[index] = { ...categories[index], ...updates };
      save();
      return true;
    }
    return false;
  }

  function remove(id) {
    const index = categories.findIndex(c => c.id === id);
    if (index !== -1) {
      categories.splice(index, 1);
      save();
      return true;
    }
    return false;
  }

  function reorder(orderedIds) {
    const newCats = [];
    orderedIds.forEach(id => {
      const cat = getById(id);
      if (cat) newCats.push(cat);
    });
    
    // Add any missing ones at the end
    categories.forEach(cat => {
      if (!orderedIds.includes(cat.id)) {
        newCats.push(cat);
      }
    });

    categories = newCats;
    save();
  }

  function reset() {
    // Clone defaults from Data
    categories = JSON.parse(JSON.stringify(window.Data.DEFAULT_CATEGORIES));
    save();
  }

  return {
    init,
    getAll,
    getById,
    add,
    update,
    remove,
    reorder,
    reset,
    save,
    EMOJI_LIST,
    COLOR_PRESETS
  };
})();
