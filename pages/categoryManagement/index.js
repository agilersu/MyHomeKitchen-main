const store = require('../../utils/store');

Page({
  data: {
    themes: store.THEME_PRESETS,
    kitchens: [],
    currentKitchen: null,
    categories: [],
    showKitchenModal: false,
    kitchenForm: { id: '', name: '', notice: '', themeId: 'orange' },
    showCatModal: false,
    catForm: { id: '', name: '' }
  },

  onShow() {
    this.reload();
  },

  reload() {
    const kitchens = store.getKitchens();
    const currentKitchen = store.getCurrentKitchen();
    const categories = store.getCategories(currentKitchen.id);
    this.setData({ kitchens, currentKitchen, categories });
  },

  onSwitchKitchen(e) {
    const id = e.currentTarget.dataset.id;
    store.switchKitchen(id);
    this.reload();
    wx.showToast({ title: '已切换厨房', icon: 'success' });
  },

  openCreateKitchen() {
    this.setData({
      showKitchenModal: true,
      kitchenForm: { id: '', name: '', notice: '欢迎吃货点单！', themeId: 'orange' }
    });
  },

  openEditKitchen(e) {
    const id = e.currentTarget.dataset.id;
    const found = this.data.kitchens.find((k) => k.id === id);
    if (!found) return;
    this.setData({
      showKitchenModal: true,
      kitchenForm: {
        id: found.id,
        name: found.name,
        notice: found.notice,
        themeId: found.themeId
      }
    });
  },

  closeKitchenModal() {
    this.setData({ showKitchenModal: false });
  },

  onKitchenInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [`kitchenForm.${field}`]: e.detail.value });
  },

  selectKitchenTheme(e) {
    this.setData({ 'kitchenForm.themeId': e.currentTarget.dataset.id });
  },

  saveKitchenForm() {
    const { kitchenForm } = this.data;
    if (!String(kitchenForm.name || '').trim()) {
      wx.showToast({ title: '请输入厨房名称', icon: 'none' });
      return;
    }
    store.saveKitchen(kitchenForm);
    this.setData({ showKitchenModal: false });
    this.reload();
    wx.showToast({ title: '保存成功', icon: 'success' });
  },

  onDeleteKitchen(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '删除厨房',
      content: '删除厨房将同时删除该厨房下的分类和菜谱，确认删除吗？',
      success: (res) => {
        if (res.confirm) {
          const result = store.deleteKitchen(id);
          if (!result.ok) {
            wx.showToast({ title: result.reason, icon: 'none' });
          } else {
            this.reload();
          }
        }
      }
    });
  },

  openAddCategory() {
    this.setData({ showCatModal: true, catForm: { id: '', name: '' } });
  },

  openRenameCategory(e) {
    const { id, name } = e.currentTarget.dataset;
    this.setData({ showCatModal: true, catForm: { id, name } });
  },

  closeCatModal() {
    this.setData({ showCatModal: false });
  },

  onCatNameInput(e) {
    this.setData({ 'catForm.name': e.detail.value });
  },

  saveCatForm() {
    const { catForm, currentKitchen } = this.data;
    if (!String(catForm.name || '').trim()) {
      wx.showToast({ title: '请输入分类名称', icon: 'none' });
      return;
    }
    store.saveCategory({
      id: catForm.id || undefined,
      kitchenId: currentKitchen.id,
      name: catForm.name
    });
    this.setData({ showCatModal: false });
    this.reload();
  },

  onMoveCategory(e) {
    const { id, dir } = e.currentTarget.dataset;
    store.moveCategory(id, dir);
    this.reload();
  },

  onDeleteCategory(e) {
    const id = e.currentTarget.dataset.id;
    const res = store.deleteCategory(id);
    if (!res.ok) {
      wx.showToast({ title: res.reason, icon: 'none' });
    } else {
      this.reload();
    }
  },

  noop() {}
});
