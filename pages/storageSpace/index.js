const store = require('../../utils/store');

Page({
  data: {
    zones: store.STORAGE_ZONES,
    allItems: [],
    filteredItems: [],
    activeZone: 'all',
    statusFilter: 'all',
    totalCount: 0,
    soonCount: 0,
    expiredCount: 0,
    showItemModal: false,
    form: {
      id: '',
      name: '',
      zone: 'cold',
      qty: '1',
      unit: '个',
      expireDate: '',
      note: ''
    }
  },

  onShow() {
    this.loadFridge();
  },

  loadFridge() {
    const zoneMap = {};
    store.STORAGE_ZONES.forEach((z) => {
      zoneMap[z.id] = z;
    });

    const allItems = store.getFridgeItems().map((item) => {
      const z = zoneMap[item.zone] || store.STORAGE_ZONES[0];
      return Object.assign({}, item, {
        zoneName: z.name,
        zoneEmoji: z.emoji
      });
    });

    const totalCount = allItems.length;
    const soonCount = allItems.filter((i) => i.expiry.status === 'soon').length;
    const expiredCount = allItems.filter((i) => i.expiry.status === 'expired').length;

    this.setData(
      { allItems, totalCount, soonCount, expiredCount },
      () => this.applyFilter()
    );
  },

  applyFilter() {
    const { allItems, activeZone, statusFilter } = this.data;
    const filteredItems = allItems.filter((item) => {
      if (activeZone !== 'all' && item.zone !== activeZone) return false;
      if (statusFilter !== 'all' && item.expiry.status !== statusFilter) return false;
      return true;
    });
    this.setData({ filteredItems });
  },

  selectZone(e) {
    this.setData({ activeZone: e.currentTarget.dataset.zone }, () => this.applyFilter());
  },

  selectStatusFilter(e) {
    this.setData({ statusFilter: e.currentTarget.dataset.status }, () => this.applyFilter());
  },

  onAdjustQty(e) {
    const { id, delta } = e.currentTarget.dataset;
    store.updateFridgeItemQty(id, Number(delta));
    this.loadFridge();
  },

  onDeleteItem(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '移除食材',
      content: '确认从冰箱移除这项食材吗？',
      success: (res) => {
        if (res.confirm) {
          store.deleteFridgeItem(id);
          this.loadFridge();
        }
      }
    });
  },

  openAddModal() {
    const today = store.formatDate(new Date());
    this.setData({
      showItemModal: true,
      form: {
        id: '',
        name: '',
        zone: this.data.activeZone === 'all' ? 'cold' : this.data.activeZone,
        qty: '1',
        unit: '个',
        expireDate: store.addDays(today, 7),
        note: ''
      }
    });
  },

  openEditModal(e) {
    const id = e.currentTarget.dataset.id;
    const target = this.data.allItems.find((i) => i.id === id);
    if (!target) return;
    this.setData({
      showItemModal: true,
      form: {
        id: target.id,
        name: target.name,
        zone: target.zone,
        qty: String(target.qty),
        unit: target.unit,
        expireDate: target.expireDate,
        note: target.note || ''
      }
    });
  },

  closeItemModal() {
    this.setData({ showItemModal: false });
  },

  onFormInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [`form.${field}`]: e.detail.value });
  },

  onSelectFormZone(e) {
    this.setData({ 'form.zone': e.currentTarget.dataset.zone });
  },

  onExpireDateChange(e) {
    this.setData({ 'form.expireDate': e.detail.value });
  },

  saveFormItem() {
    const { form } = this.data;
    if (!String(form.name || '').trim()) {
      wx.showToast({ title: '请输入食材名称', icon: 'none' });
      return;
    }
    store.saveFridgeItem({
      id: form.id || undefined,
      name: form.name,
      zone: form.zone,
      qty: Number(form.qty) || 0,
      unit: form.unit || '个',
      expireDate: form.expireDate,
      note: form.note
    });
    this.setData({ showItemModal: false });
    this.loadFridge();
    wx.showToast({ title: '已保存到冰箱', icon: 'success' });
  },

  noop() {}
});
