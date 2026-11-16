const store = require('../../utils/store');

Page({
  data: {
    recipeId: '',
    recipe: null,
    stock: null,
    selectedSpec: '',
    stepItems: []
  },

  onLoad(options) {
    this.setData({ recipeId: (options && options.id) || '' });
  },

  onShow() {
    this.loadDetail();
  },

  loadDetail() {
    const recipe = store.getRecipeById(this.data.recipeId);
    if (!recipe) {
      wx.showToast({ title: '菜谱不存在', icon: 'none' });
      return;
    }
    const stock = store.checkRecipeStockStatus(recipe);
    const stepItems = (recipe.steps || []).map((text) => {
      const m = String(text).match(/(\d+)\s*分钟/);
      return {
        text,
        minutes: m ? parseInt(m[1], 10) : 0
      };
    });
    const selectedSpec =
      this.data.selectedSpec && recipe.specs.indexOf(this.data.selectedSpec) >= 0
        ? this.data.selectedSpec
        : (recipe.specs && recipe.specs[0]) || '默认口味';

    this.setData({ recipe, stock, stepItems, selectedSpec });
    wx.setNavigationBarTitle({ title: recipe.name });
  },

  selectSpec(e) {
    this.setData({ selectedSpec: e.currentTarget.dataset.spec });
  },

  onAddMissingToShopping() {
    const added = store.addMissingIngredientsToShopping(this.data.recipe);
    wx.showToast({
      title: added > 0 ? `已将 ${added} 项缺货加入买菜清单` : '缺货食材已在清单中',
      icon: 'none'
    });
  },

  startStepTimer(e) {
    const { minutes, step } = e.currentTarget.dataset;
    const label = `${this.data.recipe.name}-第${step}步`;
    const timers = store.addTimer(label, Number(minutes) * 60);
    if (timers && timers[0]) {
      store.toggleTimer(timers[0].id);
    }
    wx.showModal({
      title: '计时器已启动',
      content: `已为您开启「${label}」${minutes}分钟倒计时，是否前往计时器页面查看？`,
      confirmText: '去查看',
      cancelText: '留在本页',
      success: (res) => {
        if (res.confirm) {
          wx.navigateTo({ url: '/pages/timerManagement/index' });
        }
      }
    });
  },

  onAddToCart() {
    const { recipe, selectedSpec } = this.data;
    store.addToCart(recipe.kitchenId, recipe, selectedSpec);
    wx.showToast({ title: '已加入菜篮', icon: 'success' });
  },

  onEdit() {
    wx.navigateTo({ url: `/pages/addCookbook/index?id=${this.data.recipe.id}` });
  },

  onDelete() {
    wx.showModal({
      title: '删除菜谱',
      content: `确定要删除「${this.data.recipe.name}」吗？`,
      success: (res) => {
        if (res.confirm) {
          store.deleteRecipe(this.data.recipe.id);
          wx.showToast({ title: '已删除', icon: 'success' });
          setTimeout(() => wx.navigateBack(), 400);
        }
      }
    });
  }
});
