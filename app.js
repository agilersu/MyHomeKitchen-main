const store = require('./utils/store');

App({
  globalData: {
    timerAlertId: null,
    pendingShareOrder: ''
  },

  onLaunch(options) {
    store.initStore();
    this.captureShareOrder(options);
    this.startTimerWatcher();
  },

  onShow(options) {
    this.captureShareOrder(options);
    this.checkTimersNow();
    this.startTimerWatcher();
  },

  captureShareOrder(options) {
    if (options && options.query && options.query.shareOrder) {
      this.globalData.pendingShareOrder = options.query.shareOrder;
    }
  },

  onHide() {
    if (this._timerWatcher) {
      clearInterval(this._timerWatcher);
      this._timerWatcher = null;
    }
  },

  startTimerWatcher() {
    if (this._timerWatcher) {
      clearInterval(this._timerWatcher);
    }
    this._timerWatcher = setInterval(() => {
      this.checkTimersNow();
    }, 1000);
  },

  checkTimersNow() {
    const timers = store.getTimers();
    const now = Date.now();
    for (let i = 0; i < timers.length; i++) {
      const t = timers[i];
      if (t.status === 'running' && t.endTime && now >= t.endTime) {
        store.markTimerFinished(t.id);
        if (typeof wx !== 'undefined' && wx.vibrateLong) {
          wx.vibrateLong({ fail: () => {} });
        }
        if (typeof wx !== 'undefined' && wx.showModal && this.globalData.timerAlertId !== t.id) {
          this.globalData.timerAlertId = t.id;
          wx.showModal({
            title: '计时器时间到！',
            content: `「${t.name}」倒计时已结束，请注意火候~`,
            confirmText: '知道了',
            showCancel: false,
            success: () => {
              store.ackTimerAlert(t.id);
              this.globalData.timerAlertId = null;
            }
          });
        }
        break;
      }
    }
  }
});
