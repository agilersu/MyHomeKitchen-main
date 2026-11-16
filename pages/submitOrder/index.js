const store = require('../../utils/store');

Page({
  data: {
    kitchen: null,
    cart: [],
    totalCount: 0,
    mealTypes: store.MEAL_TYPES,
    mealDate: '',
    mealType: 'dinner',
    ordererName: '',
    remark: '',
    quickRemarks: ['少油少盐', '不要香菜', '免辣', '多汤汁下饭', '微辣开胃', '加个荷包蛋']
  },

  onLoad() {
    const kitchen = store.getCurrentKitchen();
    const cart = store.getCart(kitchen.id);
    const profile = store.getProfile();
    const totalCount = cart.reduce((sum, i) => sum + i.qty, 0);
    const h = new Date().getHours();
    let defaultMeal = 'dinner';
    if (h < 10) defaultMeal = 'breakfast';
    else if (h < 14) defaultMeal = 'lunch';
    else if (h < 17) defaultMeal = 'tea';

    this.setData({
      kitchen,
      cart,
      totalCount,
      mealDate: store.formatDate(new Date()),
      mealType: defaultMeal,
      ordererName: profile.nickName || '吃货'
    });
  },

  onDateChange(e) {
    this.setData({ mealDate: e.detail.value });
  },

  selectMealType(e) {
    this.setData({ mealType: e.currentTarget.dataset.id });
  },

  onOrdererInput(e) {
    this.setData({ ordererName: e.detail.value });
  },

  onRemarkInput(e) {
    this.setData({ remark: e.detail.value });
  },

  appendRemarkTag(e) {
    const tag = e.currentTarget.dataset.tag;
    const prev = String(this.data.remark || '').trim();
    const next = prev ? `${prev}，${tag}` : tag;
    this.setData({ remark: next });
  },

  onSubmitOrder() {
    const { kitchen, cart, mealDate, mealType, ordererName, remark } = this.data;
    if (!cart || cart.length === 0) {
      wx.showToast({ title: '菜篮为空，请先选菜', icon: 'none' });
      return;
    }
    store.submitOrder({
      kitchenId: kitchen.id,
      mealDate,
      mealType,
      ordererName,
      remark,
      items: cart,
      clearCart: true
    });
    wx.showToast({ title: '下单成功！', icon: 'success' });
    setTimeout(() => {
      wx.switchTab({ url: '/pages/cook/index' });
    }, 500);
  }
});
