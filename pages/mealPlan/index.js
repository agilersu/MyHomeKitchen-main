const store = require('../../utils/store');

const WEEK_NAMES = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

Page({
  data: {
    selectedDate: '',
    weekDays: [],
    mealSections: [],
    allRecipes: [],
    showPickerModal: false,
    targetMealType: 'dinner'
  },

  onLoad() {
    this.setData({ selectedDate: store.formatDate(new Date()) });
  },

  onShow() {
    this.loadPlan();
  },

  loadPlan() {
    const today = store.formatDate(new Date());
    const plansMap = store.getMealPlansMap();
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = store.addDays(today, i);
      const dObj = new Date(date.replace(/-/g, '/'));
      const p = plansMap[date] || {};
      const hasPlan = ['breakfast', 'lunch', 'tea', 'dinner'].some(
        (m) => Array.isArray(p[m]) && p[m].length > 0
      );
      weekDays.push({
        date,
        dayNum: String(dObj.getDate()),
        weekLabel: i === 0 ? '今天' : i === 1 ? '明天' : WEEK_NAMES[dObj.getDay()],
        hasPlan
      });
    }

    const dayPlan = store.getMealPlan(this.data.selectedDate);
    const mealSections = store.MEAL_TYPES.map((m) =>
      Object.assign({}, m, { dishes: dayPlan[m.id] || [] })
    );
    const allRecipes = store.getAllRecipes();

    this.setData({ weekDays, mealSections, allRecipes });
  },

  selectDate(e) {
    this.setData({ selectedDate: e.currentTarget.dataset.date }, () => this.loadPlan());
  },

  openPickerModal(e) {
    this.setData({
      showPickerModal: true,
      targetMealType: e.currentTarget.dataset.meal
    });
  },

  closePickerModal() {
    this.setData({ showPickerModal: false });
  },

  onPickRecipe(e) {
    const recipeId = e.currentTarget.dataset.id;
    store.addDishToMealPlan(this.data.selectedDate, this.data.targetMealType, recipeId);
    this.setData({ showPickerModal: false });
    this.loadPlan();
    wx.showToast({ title: '已加入计划', icon: 'success' });
  },

  onRemoveDish(e) {
    const { meal, idx } = e.currentTarget.dataset;
    store.removeDishFromMealPlan(this.data.selectedDate, meal, Number(idx));
    this.loadPlan();
  },

  openRecipeDetail(e) {
    wx.navigateTo({ url: `/pages/cookbookDetails/index?id=${e.currentTarget.dataset.id}` });
  },

  onConvertOrder() {
    const kitchen = store.getCurrentKitchen();
    const order = store.convertMealPlanToOrder(this.data.selectedDate, kitchen.id);
    if (!order) {
      wx.showToast({ title: '当日尚未安排任何菜品', icon: 'none' });
      return;
    }
    wx.showToast({ title: '已生成待做订单', icon: 'success' });
    setTimeout(() => {
      wx.switchTab({ url: '/pages/cook/index' });
    }, 500);
  },

  noop() {}
});
