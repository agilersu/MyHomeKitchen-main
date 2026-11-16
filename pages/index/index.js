const store = require('../../utils/store');

Page({
  data: {
    kitchen: null,
    categories: [],
    allRecipes: [],
    filteredRecipes: [],
    allRecipesCount: 0,
    activeCategoryId: 'all',
    searchKeyword: '',
    cart: [],
    cartTotalCount: 0,
    cartTotalMinutes: 0,
    showCartDrawer: false,
    showSpecModal: false,
    specRecipe: null,
    selectedSpec: ''
  },

  onShow() {
    this.reloadAll();
  },

  reloadAll() {
    const kitchen = store.getCurrentKitchen();
    const categories = store.getCategories(kitchen.id);
    const recipes = store.getRecipes(kitchen.id).map((r) =>
      Object.assign({}, r, { stock: store.checkRecipeStockStatus(r) })
    );

    const enrichedCategories = categories.map((c) =>
      Object.assign({}, c, {
        count: recipes.filter((r) => r.categoryId === c.id).length
      })
    );

    const activeCategoryId =
      this.data.activeCategoryId === 'all' ||
      enrichedCategories.some((c) => c.id === this.data.activeCategoryId)
        ? this.data.activeCategoryId
        : 'all';

    this.setData(
      {
        kitchen,
        categories: enrichedCategories,
        allRecipes: recipes,
        allRecipesCount: recipes.length,
        activeCategoryId
      },
      () => {
        this.applyFilter();
        this.refreshCart();
      }
    );
  },

  applyFilter() {
    const { allRecipes, activeCategoryId, searchKeyword } = this.data;
    const kw = String(searchKeyword || '').trim().toLowerCase();
    const filtered = allRecipes.filter((r) => {
      const catMatch = activeCategoryId === 'all' || r.categoryId === activeCategoryId;
      if (!catMatch) return false;
      if (!kw) return true;
      const inName = (r.name || '').toLowerCase().includes(kw);
      const inDesc = (r.description || '').toLowerCase().includes(kw);
      const inIng = (r.ingredients || []).some((i) => (i.name || '').toLowerCase().includes(kw));
      return inName || inDesc || inIng;
    });
    this.setData({ filteredRecipes: filtered });
  },

  refreshCart() {
    const kitchenId = this.data.kitchen.id;
    const cart = store.getCart(kitchenId);
    const cartTotalCount = cart.reduce((sum, item) => sum + item.qty, 0);
    const cartTotalMinutes = cart.reduce((sum, item) => sum + (item.cookTime || 15) * item.qty, 0);
    this.setData({
      cart,
      cartTotalCount,
      cartTotalMinutes,
      showCartDrawer: cartTotalCount > 0 ? this.data.showCartDrawer : false
    });
  },

  selectCategory(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({ activeCategoryId: id }, () => this.applyFilter());
  },

  onSearchInput(e) {
    this.setData({ searchKeyword: e.detail.value }, () => this.applyFilter());
  },

  clearSearch() {
    this.setData({ searchKeyword: '' }, () => this.applyFilter());
  },

  openDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/cookbookDetails/index?id=${id}` });
  },

  onQuickAdd(e) {
    const id = e.currentTarget.dataset.id;
    const recipe = this.data.allRecipes.find((r) => r.id === id);
    if (!recipe) return;
    if (recipe.specs && recipe.specs.length > 1) {
      this.setData({
        showSpecModal: true,
        specRecipe: recipe,
        selectedSpec: recipe.specs[0]
      });
    } else {
      store.addToCart(this.data.kitchen.id, recipe, (recipe.specs && recipe.specs[0]) || '默认口味');
      this.refreshCart();
      wx.showToast({ title: `已加入「${recipe.name}」`, icon: 'none' });
    }
  },

  selectSpecOption(e) {
    this.setData({ selectedSpec: e.currentTarget.dataset.spec });
  },

  confirmAddSpec() {
    const { specRecipe, selectedSpec, kitchen } = this.data;
    if (!specRecipe) return;
    store.addToCart(kitchen.id, specRecipe, selectedSpec);
    this.setData({ showSpecModal: false, specRecipe: null });
    this.refreshCart();
    wx.showToast({ title: '已加入菜篮', icon: 'success' });
  },

  closeSpecModal() {
    this.setData({ showSpecModal: false, specRecipe: null });
  },

  toggleCartDrawer() {
    this.setData({ showCartDrawer: !this.data.showCartDrawer });
  },

  closeCartDrawer() {
    this.setData({ showCartDrawer: false });
  },

  onChangeCartQty(e) {
    const { id, delta } = e.currentTarget.dataset;
    store.updateCartQty(this.data.kitchen.id, id, Number(delta));
    this.refreshCart();
  },

  onClearCart() {
    store.clearCart(this.data.kitchen.id);
    this.refreshCart();
  },

  goSubmitOrder() {
    this.setData({ showCartDrawer: false });
    wx.navigateTo({ url: '/pages/submitOrder/index' });
  },

  goAddRecipe() {
    wx.navigateTo({ url: '/pages/addCookbook/index' });
  },

  goCategoryManage() {
    wx.navigateTo({ url: '/pages/categoryManagement/index' });
  },

  goRandomDish() {
    wx.navigateTo({ url: '/pages/randomDish/index' });
  },

  goMealPlan() {
    wx.navigateTo({ url: '/pages/mealPlan/index' });
  },

  goShoppingList() {
    wx.navigateTo({ url: '/pages/vegetableBasket/index' });
  },

  goTimers() {
    wx.navigateTo({ url: '/pages/timerManagement/index' });
  },

  noop() {}
});
