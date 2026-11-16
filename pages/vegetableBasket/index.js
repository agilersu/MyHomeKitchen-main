const store = require('../../utils/store');

Page({
  data: {
    autoItems: [],
    customItems: [],
    checkedCount: 0,
    totalCount: 0,
    allChecked: false,
    newItemName: '',
    newItemAmt: ''
  },

  onShow() {
    this.loadShopping();
  },

  loadShopping() {
    const res = store.getShoppingList();
    const autoItems = res.autoItems.map((it) =>
      Object.assign({}, it, { sourcesText: (it.sources || []).join('、') })
    );
    const customItems = res.customItems;
    const checkedCount =
      autoItems.filter((i) => i.checked).length + customItems.filter((i) => i.checked).length;
    const totalCount = autoItems.length + customItems.length;
    const allChecked = totalCount > 0 && checkedCount === totalCount;

    this.setData({ autoItems, customItems, checkedCount, totalCount, allChecked });
  },

  onToggleItem(e) {
    const { key, custom } = e.currentTarget.dataset;
    store.toggleShoppingItem(key, custom === '1');
    this.loadShopping();
  },

  onToggleSelectAll() {
    if (this.data.totalCount === 0) return;
    store.setAllShoppingItemsChecked(!this.data.allChecked);
    this.loadShopping();
  },

  onNewNameInput(e) {
    this.setData({ newItemName: e.detail.value });
  },

  onNewAmtInput(e) {
    this.setData({ newItemAmt: e.detail.value });
  },

  onAddCustomItem() {
    if (!String(this.data.newItemName || '').trim()) {
      wx.showToast({ title: '请输入要买的食材', icon: 'none' });
      return;
    }
    store.addCustomShoppingItem(this.data.newItemName, this.data.newItemAmt || '1份');
    this.setData({ newItemName: '', newItemAmt: '' });
    this.loadShopping();
  },

  onRemoveCustom(e) {
    store.removeCustomShoppingItem(e.currentTarget.dataset.id);
    this.loadShopping();
  },

  onStockChecked() {
    if (this.data.checkedCount === 0) {
      wx.showToast({ title: '请先勾选已经买好的食材', icon: 'none' });
      return;
    }
    const count = store.stockPurchasedItemsToFridge();
    this.loadShopping();
    wx.showToast({ title: `已将 ${count} 项食材放入冰箱`, icon: 'success' });
  },

  copyListText() {
    const { autoItems, customItems } = this.data;
    const lines = ['【今日买菜清单】'];
    const missing = autoItems.filter((i) => !i.inFridge && !i.checked);
    const other = autoItems.filter((i) => i.inFridge && !i.checked);
    if (missing.length) {
      lines.push('急需采购（冰箱缺货）：');
      missing.forEach((i) => lines.push(`- ${i.name} ${i.amountText}`));
    }
    if (customItems.filter((c) => !c.checked).length) {
      lines.push('补充采购：');
      customItems.filter((c) => !c.checked).forEach((c) => lines.push(`- ${c.name} ${c.amountText}`));
    }
    if (other.length) {
      lines.push('冰箱已有可核对：');
      other.forEach((i) => lines.push(`- ${i.name} ${i.amountText} (${i.fridgeStockText})`));
    }
    wx.setClipboardData({
      data: lines.join('\n'),
      success: () => wx.showToast({ title: '已复制清单文本', icon: 'success' })
    });
  }
});
