# PROJECT_STATUS.md

> 更新时间：2026-11-16（本地离线版微信小程序 · 电子菜单）

## 1. 当前目标
完成微信小程序电子菜单的 UI 细节对齐修复、买菜清单「全选 + 一键入冰箱并自动清除」闭环，以及待做订单的多菜品合并微信分享功能，确保核心页面在微信开发者工具与真机中布局无裁切、无错位。

---

## 2. 已完成内容

### 2.1 标签与徽章文字上下不居中修复
- 修复微信小程序 `<text>` 标签内部换行与缩进空白被渲染为真实换行，导致徽章顶部出现空白行、文字偏下的问题：
  - 菜谱详情「缺货 / 冰箱有(...)」及「+ 缺货加买菜清单」
  - 待做订单「待下厨 / 已完成」
  - 厨房冰箱「剩 X 天临期 / 剩 X 天」
  - 计时管理状态徽章
- 全局 `.badge` 与 `.ing-stock` 补充 `inline-flex` 居中及 `line-height: 1.2`。

### 2.2 买菜清单全选与一键入冰箱后清除
- 买菜清单页新增「全选全部食材 / 取消全选（已选 X/Y 项）」交互栏，支持一键勾选全部自动汇总项与手动待买项后点击「已买一键入冰箱」。
- 修复此前一键入冰箱后，`autoItems` 因由待做订单与近 2 天饮食计划实时重算而仍留在清单中的问题，入库后立即从买菜清单清除，且不影响后续新增订单或新排饮食计划食材的正常出现。

### 2.3 全量页面布局与交互稳定性修复
- **厨房首页底部留白与卡片裁切**：移除右侧 `<scroll-view class="recipe-list">` 上的 `padding-bottom: 140rpx`，改为在列表末尾放置动态高度占位节点（有菜篮时 `140rpx`，空菜篮时 `24rpx`），避免 iOS 端 `scroll-view` 裁切底部可视区。
- **待做订单按钮单行收口**：将待做订单卡片底部「删除」「分享微信」「核对买菜」「完成做菜打卡」收口为单行不换行布局，修复原生 `<button open-type="share">` 默认宽度过大挤占换行的问题。
- **待做订单多选菜品分享**：点击「分享微信」打开「选择要分享的菜品」弹窗，默认预选当前订单菜品，同时展示其他待做订单菜品供跨单勾选与「全选 / 取消全选」，确认后打包为 `shareOrder` 分享给微信好友。
- **其他 UI 细节**：修复 `<switch>` 与父级 `bindtap` 双重触发冲突；为多个弹窗选中态标签补充 `border: 2rpx solid transparent` 消除切换时 4rpx 跳动；修复 flex 行内 `.form-input` 挤压与右侧徽章/按钮缺 `flex-shrink: 0` 问题；为菜谱详情底部栏补充 `env(safe-area-inset-bottom)` 安全区适配。

---

## 3. 关键技术决策
1. **已入库自动汇总项的持久化过滤（`stockedShoppingSources`）**：
   - 在 `utils/store.js` 中为每条待做订单与饮食计划的用料需求生成确定性来源 token（`order:<orderId>:<itemIdx>:<recipeId>` / `plan:<date>:<mealType>:<recipeId>:<occIdx>`），入库时将已勾选条目的 `sourceTokens` 写入 `db.stockedShoppingSources[key]` 并在读取时跳过，同时在入库时清理失效/过期 token。
   - 选择基于来源 token 而非直接修改订单/计划数据，保证「待做订单」与「三餐饮食计划」原始记录不被破坏。
2. **微信分享由「单按钮直发」改为「弹窗多选 + 确认触发 `open-type="share"`」**：
   - 卡片操作栏中「分享微信」使用 `<view>` 打开多选弹窗，弹窗内「确认分享」使用 `<button open-type="share" data-mode="custom">`，既解决了多按钮单行排版问题，又保留了原生微信转发卡片能力。
3. **`scroll-view` 底部安全留白使用内容末尾占位节点**：
   - 避免在小程序 `scroll-view` 容器本身设置大 `padding-bottom` 导致 iOS 视口底部被裁切。

---

## 4. 修改过的核心文件
- **状态与存储**：[utils/store.js](file:///Users/rob/Documents/AI项目/电子菜单/utils/store.js)（`setAllShoppingItemsChecked`、`stockedShoppingSources` 过滤与清理）
- **全局样式**：[app.wxss](file:///Users/rob/Documents/AI项目/电子菜单/app.wxss)（`.badge` 居中与行高、flex 行内 `.form-input` 宽度修正）
- **厨房首页**：[pages/index/index.wxml](file:///Users/rob/Documents/AI项目/电子菜单/pages/index/index.wxml)、[pages/index/index.wxss](file:///Users/rob/Documents/AI项目/电子菜单/pages/index/index.wxss)
- **买菜清单**：[pages/vegetableBasket/index.wxml](file:///Users/rob/Documents/AI项目/电子菜单/pages/vegetableBasket/index.wxml)、[pages/vegetableBasket/index.js](file:///Users/rob/Documents/AI项目/电子菜单/pages/vegetableBasket/index.js)、[pages/vegetableBasket/index.wxss](file:///Users/rob/Documents/AI项目/电子菜单/pages/vegetableBasket/index.wxss)
- **订单与作品**：[pages/cook/index.wxml](file:///Users/rob/Documents/AI项目/电子菜单/pages/cook/index.wxml)、[pages/cook/index.js](file:///Users/rob/Documents/AI项目/电子菜单/pages/cook/index.js)、[pages/cook/index.wxss](file:///Users/rob/Documents/AI项目/电子菜单/pages/cook/index.wxss)
- **菜谱详情**：[pages/cookbookDetails/index.wxml](file:///Users/rob/Documents/AI项目/电子菜单/pages/cookbookDetails/index.wxml)、[pages/cookbookDetails/index.wxss](file:///Users/rob/Documents/AI项目/电子菜单/pages/cookbookDetails/index.wxss)
- **冰箱储物**：[pages/storageSpace/index.wxml](file:///Users/rob/Documents/AI项目/电子菜单/pages/storageSpace/index.wxml)、[pages/storageSpace/index.wxss](file:///Users/rob/Documents/AI项目/电子菜单/pages/storageSpace/index.wxss)
- **其余页面防挤压/边框跳动/单行标签修复**：
  - [pages/timerManagement/index.wxml](file:///Users/rob/Documents/AI项目/电子菜单/pages/timerManagement/index.wxml)、[pages/timerManagement/index.wxss](file:///Users/rob/Documents/AI项目/电子菜单/pages/timerManagement/index.wxss)
  - [pages/my/index.wxml](file:///Users/rob/Documents/AI项目/电子菜单/pages/my/index.wxml)、[pages/my/index.wxss](file:///Users/rob/Documents/AI项目/电子菜单/pages/my/index.wxss)
  - [pages/categoryManagement/index.wxml](file:///Users/rob/Documents/AI项目/电子菜单/pages/categoryManagement/index.wxml)、[pages/categoryManagement/index.wxss](file:///Users/rob/Documents/AI项目/电子菜单/pages/categoryManagement/index.wxss)
  - [pages/mealPlan/index.wxml](file:///Users/rob/Documents/AI项目/电子菜单/pages/mealPlan/index.wxml)、[pages/mealPlan/index.wxss](file:///Users/rob/Documents/AI项目/电子菜单/pages/mealPlan/index.wxss)
  - [pages/submitOrder/index.wxml](file:///Users/rob/Documents/AI项目/电子菜单/pages/submitOrder/index.wxml)、[pages/submitOrder/index.wxss](file:///Users/rob/Documents/AI项目/电子菜单/pages/submitOrder/index.wxss)
  - [pages/addCookbook/index.wxss](file:///Users/rob/Documents/AI项目/电子菜单/pages/addCookbook/index.wxss)
  - [pages/randomDish/index.wxss](file:///Users/rob/Documents/AI项目/电子菜单/pages/randomDish/index.wxss)

---

## 5. 测试与验证结果
- **JS 语法校验**：`node -c utils/store.js`、`node -c pages/vegetableBasket/index.js`、`node -c pages/cook/index.js` 均退出码 0。
- **Node 冒烟测试**：模拟 `wx` 本地存储验证 `store.js`，单条勾选入库、全选入库均可清空 `autoItems` 与 `customItems`，且新订单/新饮食计划菜品可正常重新汇总出现。
- **微信开发者工具（`weixin-devtools` MCP）实测**：
  - **买菜清单**（`pages/vegetableBasket/index`）：实测点击「全选全部食材」→「已买一键入冰箱 (10)」，清单立即清空为 0 项，冰箱库存数由 8 增至 12。
  - **待做订单**（`pages/cook/index`）：快照验证 4 个操作按钮在同一水平线（`y = 375.5`，高度 `26`）无折行；点击「分享微信」实测 `showShareSelectModal` 正常打开，多选列表与 `onShareAppMessage` 生成的 `shareOrder` 路径正确。
  - **多页面快照巡检**：依次切换验证了 `pages/index/index`、`pages/cook/index`、`pages/storageSpace/index`、`pages/my/index`、`pages/cookbookDetails/index`、`pages/mealPlan/index`、`pages/timerManagement/index`、`pages/categoryManagement/index`，徽章高度与布局正常，无横向溢出。

---

## 6. 已知问题
- 当前工作区未初始化 Git 仓库（`NOT_A_GIT_REPO`），变更均直接保存在本地文件系统中，建议后续开发前先初始化 Git 并建立基线提交。
- `weixin-devtools` 实测覆盖了主要页面元素快照与核心交互逻辑，但 iOS 真机上 `scroll-view` 底部、安全区 `env(safe-area-inset-bottom)` 及微信真机转发卡片接收端回流（`?shareOrder=...`）仍需在真机预览中最终确认。
- 极端窄屏（如 320px 宽设备）下，待做订单单行 4 个按钮若后续新增按钮可能产生溢出，目前在 390px 宽度下正常。

---

## 7. 尝试过但失败的方案
- **Swarm 子代理直接调用 `weixin-devtools` MCP**：子代理沙盒上下文未注入 `weixin-devtools` 工具权限（报错 `server weixin-devtools is not allowed in this context`），因此改由主协调器直接调用 `weixin-devtools` 完成页面连接、点击与快照验证。
- **通过文本选择器点击菜谱卡片（`click` `target.kind="text"`）**：工具内部拼接 `wx-*` 选择器触发 `Failed to execute 'querySelectorAll' on 'Document': 'wx-*' is not a valid selector`；后续统一改用快照返回的 `ref` 或具体 CSS class 选择器完成点击。

---

## 8. 下一步开发顺序
1. **初始化版本控制**：在项目根目录执行 `git init` 并提交当前已验证代码，建立干净基线。
2. **真机预览回归测试**：在微信开发者工具开启真机调试，重点验证：
   - iOS 真机厨房首页底部无留白/裁切
   - 待做订单「分享微信」多选转发给好友后，好友点开能否正常弹出「收到好友分享的待做订单」并成功导入
   - 买菜清单全选入库后，新增订单或新增饮食计划时清单增量汇总是否符合预期
3. **继续完善其余交互/视觉需求**：根据真机回归反馈微调间距或新增功能。
