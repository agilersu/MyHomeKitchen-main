const store = require('../../utils/store');

Page({
  data: {
    activeTab: 'pending',
    allOrders: [],
    displayOrders: [],
    pendingCount: 0,
    completedCount: 0,
    showCompleteModal: false,
    completingOrderId: '',
    workImage: '',
    workNote: '',
    deductFridge: true,
    showSharedModal: false,
    sharedOrder: null,
    showShareSelectModal: false,
    shareSourceOrderId: '',
    shareDishOptions: [],
    shareSelectedCount: 0,
    shareAllSelected: false
  },

  onLoad(options) {
    if (options && options.shareOrder) {
      this.openSharedOrderPreview(options.shareOrder);
    }
  },

  onShow() {
    this.loadOrders();
    const app = typeof getApp === 'function' ? getApp() : null;
    if (app && app.globalData && app.globalData.pendingShareOrder) {
      const raw = app.globalData.pendingShareOrder;
      app.globalData.pendingShareOrder = '';
      this.openSharedOrderPreview(raw);
    }
  },

  loadOrders() {
    const allOrders = store.getOrders();
    const pendingCount = allOrders.filter((o) => o.status === 'pending').length;
    const completedCount = allOrders.filter((o) => o.status === 'completed').length;
    const displayOrders = allOrders.filter((o) => o.status === this.data.activeTab);
    this.setData({
      allOrders,
      displayOrders,
      pendingCount,
      completedCount
    });
  },

  switchTab(e) {
    const activeTab = e.currentTarget.dataset.tab;
    const displayOrders = this.data.allOrders.filter((o) => o.status === activeTab);
    this.setData({ activeTab, displayOrders });
  },

  openRecipeDetail(e) {
    const id = e.currentTarget.dataset.id;
    if (id) {
      wx.navigateTo({ url: `/pages/cookbookDetails/index?id=${id}` });
    }
  },

  openCompleteModal(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({
      showCompleteModal: true,
      completingOrderId: id,
      workImage: '',
      workNote: '',
      deductFridge: true
    });
  },

  closeCompleteModal() {
    this.setData({ showCompleteModal: false, completingOrderId: '' });
  },

  chooseWorkPhoto() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempPath = res.tempFilePaths && res.tempFilePaths[0];
        if (tempPath) {
          this.setData({ workImage: tempPath });
        }
      }
    });
  },

  previewWorkImage(e) {
    const src = e.currentTarget.dataset.src;
    if (src) {
      wx.previewImage({ urls: [src], current: src });
    }
  },

  onWorkNoteInput(e) {
    this.setData({ workNote: e.detail.value });
  },

  toggleDeductFridge() {
    this.setData({ deductFridge: !this.data.deductFridge });
  },

  onDeductSwitchChange(e) {
    this.setData({ deductFridge: !!e.detail.value });
  },

  confirmCompleteOrder() {
    const { completingOrderId, workImage, workNote, deductFridge } = this.data;
    if (!completingOrderId) return;
    store.completeOrder(completingOrderId, {
      workImage,
      workNote: workNote || '今日下厨圆满完成，美味光盘！',
      deductFridge
    });
    this.setData({ showCompleteModal: false, activeTab: 'completed' });
    this.loadOrders();
    wx.showToast({ title: '打卡成功！', icon: 'success' });
  },

  onDeleteOrder(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '删除订单',
      content: '确定删除这条订单记录吗？',
      success: (res) => {
        if (res.confirm) {
          store.deleteOrder(id);
          this.loadOrders();
        }
      }
    });
  },

  goShopping() {
    wx.navigateTo({ url: '/pages/vegetableBasket/index' });
  },

  goMealPlan() {
    wx.navigateTo({ url: '/pages/mealPlan/index' });
  },

  goTimers() {
    wx.navigateTo({ url: '/pages/timerManagement/index' });
  },

  openSharedOrderPreview(raw) {
    const sharedOrder = store.parseOrderSharePayload(raw);
    if (!sharedOrder) {
      wx.showToast({ title: '分享订单内容无效', icon: 'none' });
      return;
    }
    this.setData({
      showSharedModal: true,
      sharedOrder
    });
  },

  closeSharedModal() {
    this.setData({
      showSharedModal: false,
      sharedOrder: null
    });
  },

  confirmImportSharedOrder() {
    const { sharedOrder } = this.data;
    if (!sharedOrder) return;
    store.importSharedOrder(sharedOrder);
    this.setData({
      showSharedModal: false,
      sharedOrder: null,
      activeTab: 'pending'
    });
    this.loadOrders();
    wx.showToast({ title: '已加入待做订单', icon: 'success' });
  },

  openShareSelectModal(e) {
    const orderId = e.currentTarget.dataset.id || '';
    const pendingOrders = (this.data.allOrders || []).filter((o) => o.status === 'pending');
    const ordered = [];
    const primary = pendingOrders.find((o) => o.id === orderId);
    if (primary) ordered.push(primary);
    pendingOrders.forEach((o) => {
      if (o.id !== orderId) ordered.push(o);
    });

    const shareDishOptions = [];
    ordered.forEach((order) => {
      const isPrimary = order.id === orderId;
      (order.items || []).forEach((dish, idx) => {
        shareDishOptions.push({
          uid: `${order.id}__${idx}`,
          orderId: order.id,
          recipeId: dish.recipeId || '',
          name: dish.name,
          emoji: dish.emoji || '🍲',
          spec: dish.spec || '',
          qty: Number(dish.qty) || 1,
          cookTime: Number(dish.cookTime) || 15,
          mealHint: `${order.mealDate} ${order.mealLabel}`,
          checked: isPrimary
        });
      });
    });

    const shareSelectedCount = shareDishOptions.filter((d) => d.checked).length;
    this.setData({
      showShareSelectModal: true,
      shareSourceOrderId: orderId,
      shareDishOptions,
      shareSelectedCount,
      shareAllSelected: shareDishOptions.length > 0 && shareSelectedCount === shareDishOptions.length
    });
  },

  closeShareSelectModal() {
    this.setData({ showShareSelectModal: false });
  },

  toggleShareDishItem(e) {
    const uid = e.currentTarget.dataset.uid;
    const shareDishOptions = (this.data.shareDishOptions || []).map((d) =>
      d.uid === uid ? Object.assign({}, d, { checked: !d.checked }) : d
    );
    const shareSelectedCount = shareDishOptions.filter((d) => d.checked).length;
    this.setData({
      shareDishOptions,
      shareSelectedCount,
      shareAllSelected: shareDishOptions.length > 0 && shareSelectedCount === shareDishOptions.length
    });
  },

  toggleSelectAllShareDishes() {
    const target = !this.data.shareAllSelected;
    const shareDishOptions = (this.data.shareDishOptions || []).map((d) =>
      Object.assign({}, d, { checked: target })
    );
    const shareSelectedCount = target ? shareDishOptions.length : 0;
    this.setData({
      shareDishOptions,
      shareSelectedCount,
      shareAllSelected: target
    });
  },

  onEmptyShareTap() {
    wx.showToast({ title: '请至少选择 1 道菜', icon: 'none' });
  },

  onShareAppMessage(res) {
    const orders = this.data.allOrders && this.data.allOrders.length > 0 ? this.data.allOrders : store.getOrders();
    let targetOrder = null;

    if (
      res &&
      res.from === 'button' &&
      res.target &&
      res.target.dataset &&
      res.target.dataset.mode === 'custom'
    ) {
      const selected = (this.data.shareDishOptions || []).filter((d) => d.checked);
      if (selected.length > 0) {
        const base =
          orders.find((o) => o.id === this.data.shareSourceOrderId) ||
          orders.find((o) => o.id === selected[0].orderId) ||
          orders.find((o) => o.status === 'pending') ||
          {};
        targetOrder = Object.assign({}, base, {
          items: selected.map((d) => ({
            recipeId: d.recipeId,
            name: d.name,
            emoji: d.emoji,
            spec: d.spec,
            qty: d.qty,
            cookTime: d.cookTime
          }))
        });
        this.setData({ showShareSelectModal: false });
      }
    } else if (res && res.from === 'button' && res.target && res.target.dataset && res.target.dataset.id) {
      targetOrder = orders.find((o) => o.id === res.target.dataset.id) || null;
    }

    if (!targetOrder) {
      targetOrder = orders.find((o) => o.status === 'pending') || null;
    }
    if (!targetOrder || !targetOrder.items || targetOrder.items.length === 0) {
      return {
        title: '厨神与吃货 · 一起来点菜下厨吧！',
        path: '/pages/index/index'
      };
    }
    const names = (targetOrder.items || []).map((d) => d.name).filter(Boolean);
    const summary = names.length > 2 ? `${names.slice(0, 2).join('、')}等${names.length}道菜` : names.join('、');
    const encoded = encodeURIComponent(store.encodeOrderSharePayload(targetOrder));
    return {
      title: `🍽️ ${targetOrder.mealDate} ${targetOrder.mealLabel}待做：${summary}`,
      path: `/pages/cook/index?shareOrder=${encoded}`
    };
  },

  noop() {}
});
