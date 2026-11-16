const store = require('../../utils/store');

function formatClock(totalSec) {
  const s = Math.max(0, Math.floor(totalSec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const rem = s % 60;
  if (h > 0) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
}

Page({
  data: {
    presets: [
      { name: '溏心鸡蛋', sec: 360, label: '6分钟' },
      { name: '清蒸鲈鱼', sec: 480, label: '8分钟' },
      { name: '红烧收汁', sec: 900, label: '15分钟' },
      { name: '老火靓汤', sec: 2700, label: '45分钟' }
    ],
    timers: [],
    customName: '',
    customMinutes: '10'
  },

  onShow() {
    this.refreshTimers();
    this._tick = setInterval(() => {
      this.refreshTimers();
    }, 500);
  },

  onHide() {
    this.stopTick();
  },

  onUnload() {
    this.stopTick();
  },

  stopTick() {
    if (this._tick) {
      clearInterval(this._tick);
      this._tick = null;
    }
  },

  refreshTimers() {
    const raw = store.getTimers();
    const timers = raw.map((t) => {
      let statusText = '待开始';
      if (t.status === 'running') statusText = '计时中';
      else if (t.status === 'paused') statusText = '已暂停';
      else if (t.status === 'finished') statusText = '时间到';

      return Object.assign({}, t, {
        statusText,
        clockText: formatClock(t.displayRemainingSec),
        durationLabel: `${Math.round(t.durationSec / 60)} 分钟`
      });
    });
    this.setData({ timers });
  },

  onAddPreset(e) {
    const { name, sec } = e.currentTarget.dataset;
    store.addTimer(name, Number(sec));
    this.refreshTimers();
    wx.showToast({ title: `已添加「${name}」`, icon: 'none' });
  },

  onNameInput(e) {
    this.setData({ customName: e.detail.value });
  },

  onMinInput(e) {
    this.setData({ customMinutes: e.detail.value });
  },

  onAddCustom() {
    const min = Number(this.data.customMinutes);
    if (!min || min <= 0) {
      wx.showToast({ title: '请输入大于 0 的分钟数', icon: 'none' });
      return;
    }
    const name = String(this.data.customName || '').trim() || `自定义 ${min}分钟`;
    store.addTimer(name, min * 60);
    this.setData({ customName: '' });
    this.refreshTimers();
  },

  onToggle(e) {
    store.toggleTimer(e.currentTarget.dataset.id);
    this.refreshTimers();
  },

  onReset(e) {
    store.resetTimer(e.currentTarget.dataset.id);
    this.refreshTimers();
  },

  onDelete(e) {
    store.deleteTimer(e.currentTarget.dataset.id);
    this.refreshTimers();
  }
});
