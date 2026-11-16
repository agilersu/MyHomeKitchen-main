const store = require('../../utils/store');

Page({
  data: {
    profile: null,
    stats: null,
    showProfileModal: false,
    profileForm: {},
    showImportModal: false,
    importText: ''
  },

  onShow() {
    this.loadData();
  },

  loadData() {
    const profile = store.getProfile();
    const stats = store.getKitchenStats();
    this.setData({ profile, stats });
  },

  openRecipeDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/cookbookDetails/index?id=${id}` });
  },

  goTimers() {
    wx.navigateTo({ url: '/pages/timerManagement/index' });
  },

  goCategoryManage() {
    wx.navigateTo({ url: '/pages/categoryManagement/index' });
  },

  goMealPlan() {
    wx.navigateTo({ url: '/pages/mealPlan/index' });
  },

  goShopping() {
    wx.navigateTo({ url: '/pages/vegetableBasket/index' });
  },

  openProfileModal() {
    this.setData({
      showProfileModal: true,
      profileForm: Object.assign({}, this.data.profile)
    });
  },

  closeProfileModal() {
    this.setData({ showProfileModal: false });
  },

  onProfileInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [`profileForm.${field}`]: e.detail.value });
  },

  selectRole(e) {
    this.setData({ 'profileForm.role': e.currentTarget.dataset.role });
  },

  saveProfileForm() {
    store.saveProfile(this.data.profileForm);
    this.setData({ showProfileModal: false });
    this.loadData();
    wx.showToast({ title: '身份已更新', icon: 'success' });
  },

  exportCurrentKitchen() {
    const json = store.exportData('kitchen');
    wx.setClipboardData({
      data: json,
      success: () => {
        wx.showToast({ title: '已复制当前厨房菜单口令', icon: 'success' });
      }
    });
  },

  exportFullBackup() {
    const json = store.exportData('full');
    wx.setClipboardData({
      data: json,
      success: () => {
        wx.showToast({ title: '已复制全量备份 JSON', icon: 'success' });
      }
    });
  },

  openImportModal() {
    this.setData({ showImportModal: true, importText: '' });
  },

  closeImportModal() {
    this.setData({ showImportModal: false });
  },

  onImportInput(e) {
    this.setData({ importText: e.detail.value });
  },

  pasteFromClipboard() {
    wx.getClipboardData({
      success: (res) => {
        this.setData({ importText: res.data || '' });
      }
    });
  },

  confirmImport() {
    const res = store.importData(this.data.importText);
    if (res.ok) {
      this.setData({ showImportModal: false, importText: '' });
      this.loadData();
      wx.showModal({ title: '导入成功', content: res.message, showCancel: false });
    } else {
      wx.showToast({ title: res.message, icon: 'none' });
    }
  },

  onResetDemo() {
    wx.showModal({
      title: '恢复初始示例',
      content: '这会清除当前自定义修改，并恢复默认示例菜谱与冰箱数据，确认吗？',
      success: (res) => {
        if (res.confirm) {
          store.resetStore();
          this.loadData();
          wx.showToast({ title: '已恢复默认数据', icon: 'success' });
        }
      }
    });
  },

  noop() {}
});
