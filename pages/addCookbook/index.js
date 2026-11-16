const store = require('../../utils/store');

Page({
  data: {
    editId: '',
    mode: 'form',
    rawImportText: '',
    categories: [],
    difficulties: ['简单', '中等', '大厨级'],
    emojiOptions: ['🍲', '🍗', '🥩', '🐟', '🍅', '🥦', '🍤', '🍜', '🥗', '🍋'],
    specsText: '默认口味, 微辣',
    form: {
      name: '',
      description: '',
      categoryId: '',
      coverImage: '',
      emoji: '🍲',
      cookTime: '20',
      difficulty: '简单',
      ingredients: [{ name: '', amount: 1, unit: '份' }],
      steps: ['']
    }
  },

  onLoad(options) {
    const kitchen = store.getCurrentKitchen();
    const categories = store.getCategories(kitchen.id);
    const editId = (options && options.id) || '';

    if (editId) {
      const existing = store.getRecipeById(editId);
      if (existing) {
        wx.setNavigationBarTitle({ title: '编辑菜谱' });
        this.setData({
          editId,
          categories,
          specsText: (existing.specs || []).join(', '),
          form: {
            name: existing.name,
            description: existing.description || '',
            categoryId: existing.categoryId,
            coverImage: existing.coverImage || '',
            emoji: existing.emoji || '🍲',
            cookTime: String(existing.cookTime || 20),
            difficulty: existing.difficulty || '简单',
            ingredients: existing.ingredients && existing.ingredients.length
              ? existing.ingredients
              : [{ name: '', amount: 1, unit: '份' }],
            steps: existing.steps && existing.steps.length ? existing.steps : ['']
          }
        });
        return;
      }
    }

    this.setData({
      categories,
      'form.categoryId': categories[0] ? categories[0].id : ''
    });
  },

  switchMode(e) {
    this.setData({ mode: e.currentTarget.dataset.mode });
  },

  onRawTextInput(e) {
    this.setData({ rawImportText: e.detail.value });
  },

  fillDemoText() {
    this.setData({
      rawImportText:
        '糖醋小排\n外酥里嫩酸甜开胃，家常必学硬菜\n【用料】\n猪肋排 500克\n冰糖 30克\n香醋 3勺\n生抽 2勺\n生姜 3片\n【步骤】\n1. 肋排冷水下锅加姜片焯水3分钟后捞出沥干。\n2. 锅中放少量油和冰糖炒出糖色，下排骨翻炒上色。\n3. 加入生抽、香醋和开水，中小火加盖焖煮25分钟。\n4. 大火收浓汤汁，撒白芝麻出锅。'
    });
  },

  parseAndFillForm() {
    const raw = this.data.rawImportText;
    if (!String(raw || '').trim()) {
      wx.showToast({ title: '请先粘贴菜谱文本', icon: 'none' });
      return;
    }
    const parsed = store.parseRecipeText(raw);
    this.setData({
      mode: 'form',
      'form.name': parsed.name,
      'form.description': parsed.description,
      'form.cookTime': String(parsed.cookTime || 20),
      'form.ingredients': parsed.ingredients.length
        ? parsed.ingredients
        : [{ name: '', amount: 1, unit: '份' }],
      'form.steps': parsed.steps.length ? parsed.steps : ['']
    });
    wx.showToast({ title: '识别成功，请核对保存', icon: 'success' });
  },

  chooseCover() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const path = res.tempFilePaths && res.tempFilePaths[0];
        if (path) {
          this.setData({ 'form.coverImage': path });
        }
      }
    });
  },

  selectEmoji(e) {
    this.setData({ 'form.emoji': e.currentTarget.dataset.emoji });
  },

  onFieldInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [`form.${field}`]: e.detail.value });
  },

  selectCategory(e) {
    this.setData({ 'form.categoryId': e.currentTarget.dataset.id });
  },

  selectDifficulty(e) {
    this.setData({ 'form.difficulty': e.currentTarget.dataset.diff });
  },

  onSpecsInput(e) {
    this.setData({ specsText: e.detail.value });
  },

  addIngredientRow() {
    const list = this.data.form.ingredients.concat([{ name: '', amount: 1, unit: '克' }]);
    this.setData({ 'form.ingredients': list });
  },

  removeIngredientRow(e) {
    const idx = e.currentTarget.dataset.idx;
    const list = this.data.form.ingredients.slice();
    list.splice(idx, 1);
    this.setData({
      'form.ingredients': list.length ? list : [{ name: '', amount: 1, unit: '份' }]
    });
  },

  onIngInput(e) {
    const { idx, key } = e.currentTarget.dataset;
    this.setData({ [`form.ingredients[${idx}].${key}`]: e.detail.value });
  },

  addStepRow() {
    const steps = this.data.form.steps.concat(['']);
    this.setData({ 'form.steps': steps });
  },

  removeStepRow(e) {
    const idx = e.currentTarget.dataset.idx;
    const steps = this.data.form.steps.slice();
    steps.splice(idx, 1);
    this.setData({ 'form.steps': steps.length ? steps : [''] });
  },

  onStepInput(e) {
    const idx = e.currentTarget.dataset.idx;
    this.setData({ [`form.steps[${idx}]`]: e.detail.value });
  },

  saveRecipeForm() {
    const { form, specsText, editId } = this.data;
    if (!String(form.name || '').trim()) {
      wx.showToast({ title: '请填写菜品名称', icon: 'none' });
      return;
    }
    const specs = String(specsText || '')
      .split(/[,，、]/)
      .map((s) => s.trim())
      .filter(Boolean);

    store.saveRecipe({
      id: editId || undefined,
      name: form.name,
      description: form.description,
      categoryId: form.categoryId,
      coverImage: form.coverImage,
      emoji: form.emoji,
      cookTime: Number(form.cookTime) || 20,
      difficulty: form.difficulty,
      specs,
      ingredients: form.ingredients,
      steps: form.steps
    });

    wx.showToast({ title: '菜谱已保存', icon: 'success' });
    setTimeout(() => wx.navigateBack(), 400);
  }
});
