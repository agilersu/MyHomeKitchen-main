const store = require('../../utils/store');

Page({
  data: {
    kitchen: null,
    categories: [],
    allRecipes: [],
    pickCount: 2,
    selectedCategoryId: 'all',
    pickedDishes: [],
    isRolling: false
  },

  onShow() {
    const kitchen = store.getCurrentKitchen();
    const categories = store.getCategories(kitchen.id);
    const allRecipes = store.getRecipes(kitchen.id).map((r) =>
      Object.assign({}, r, { stock: store.checkRecipeStockStatus(r) })
    );
    this.setData({ kitchen, categories, allRecipes });
    if (this.data.pickedDishes.length === 0 && allRecipes.length > 0) {
      this.rollDishes();
    }
  },

  selectCount(e) {
    this.setData({ pickCount: Number(e.currentTarget.dataset.count) });
  },

  selectCategory(e) {
    this.setData({ selectedCategoryId: e.currentTarget.dataset.id });
  },

  getPool() {
    const { allRecipes, selectedCategoryId } = this.data;
    if (selectedCategoryId === 'all') return allRecipes;
    return allRecipes.filter((r) => r.categoryId === selectedCategoryId);
  },

  rollDishes() {
    const pool = this.getPool();
    if (pool.length === 0) {
      wx.showToast({ title: '该分类下暂无菜谱', icon: 'none' });
      return;
    }
    this.setData({ isRolling: true });
    setTimeout(() => {
      const shuffled = pool.slice().sort(() => Math.random() - 0.5);
      const pickedDishes = shuffled.slice(0, Math.min(this.data.pickCount, shuffled.length));
      this.setData({ pickedDishes, isRolling: false });
    }, 260);
  },

  swapOne(e) {
    const index = e.currentTarget.dataset.index;
    const pool = this.getPool();
    const currentIds = this.data.pickedDishes.map((d) => d.id);
    const candidates = pool.filter((r) => currentIds.indexOf(r.id) < 0);
    const nextDish =
      candidates.length > 0
        ? candidates[Math.floor(Math.random() * candidates.length)]
        : pool[Math.floor(Math.random() * pool.length)];
    if (!nextDish) return;
    const nextList = this.data.pickedDishes.slice();
    nextList[index] = nextDish;
    this.setData({ pickedDishes: nextList });
  },

  openDetail(e) {
    wx.navigateTo({ url: `/pages/cookbookDetails/index?id=${e.currentTarget.dataset.id}` });
  },

  addAllToCart() {
    const { pickedDishes, kitchen } = this.data;
    pickedDishes.forEach((d) => {
      store.addToCart(kitchen.id, d, (d.specs && d.specs[0]) || '默认口味');
    });
    wx.showToast({ title: `已将 ${pickedDishes.length} 道菜加入菜篮`, icon: 'success' });
    setTimeout(() => {
      wx.switchTab({ url: '/pages/index/index' });
    }, 500);
  }
});
