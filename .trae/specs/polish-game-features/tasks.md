# Tasks

- [ ] Task 1: 替换所有 alert() 为自定义像素风格 Modal/Toast
  - [ ] SubTask 1.1: 在 screens.js 中创建 showModal(message, type) 函数（type: alert/confirm），像素风格模态框
  - [ ] SubTask 1.2: 在 screens.js 中创建 showToastGlobal(message) 函数（全局Toast，非仅游戏界面）
  - [ ] SubTask 1.3: 在 css/style.css 中添加 Modal 样式（像素风格边框、按钮、遮罩层）
  - [ ] SubTask 1.4: 在 index.html 中添加 Modal 容器 `<div id="modal-overlay">`
  - [ ] SubTask 1.5: 替换所有 alert() 调用：network.js 中 6处、screens.js 中 1处、map.js 中如有

- [ ] Task 2: 数字ID与临时账户管理
  - [ ] SubTask 2.1: 在 state.js 中添加 generateDigitalId() 函数（生成 #1000-#9999 的随机数字ID）
  - [ ] SubTask 2.2: gameState 中添加 `digitalId: ''` 字段，注册时赋值
  - [ ] SubTask 2.3: screens.js 注册界面：确认后自动生成数字ID，主菜单显示"昵称#数字ID"
  - [ ] SubTask 2.3: index.html 注册界面增加数字ID预览显示
  - [ ] SubTask 2.4: 所有玩家信息显示改为"昵称#数字ID"格式
  - [ ] SubTask 2.5: 页面关闭时(window.onbeforeunload)销毁临时账户

- [ ] Task 3: 聊天区域
  - [ ] SubTask 3.1: 在 index.html 游戏界面右下角添加聊天区域（消息列表+输入框）
  - [ ] SubTask 3.2: 在 css/style.css 中添加聊天区域样式（像素风格、半透明背景、消息滚动）
  - [ ] SubTask 3.3: 在 screens.js 中实现聊天UI逻辑：按T键激活输入框、ESC取消、回车发送
  - [ ] SubTask 3.4: 在 screens.js 中实现聊天消息显示函数 addChatMessage(senderId, nickname, digitalId, message)
  - [ ] SubTask 3.5: 在 network.js 中添加聊天消息同步：chat 消息类型，广播到所有玩家
  - [ ] SubTask 3.6: map.js 中添加键盘事件监听（T键激活聊天），需在游戏状态下才响应

- [ ] Task 4: 房间列表加入按钮与加载画面
  - [ ] SubTask 4.1: 在 screens.js refreshRoomList 中，每个房间卡片右侧添加"加入"按钮（不再整个卡片可点击）
  - [ ] SubTask 4.2: 在 index.html 中添加加载画面 `<div id="screen-loading">`（"正在加入房间..."像素风格动画）
  - [ ] SubTask 4.3: 在 css/style.css 中添加加载画面样式和加入按钮样式
  - [ ] SubTask 4.4: 点击加入按钮后先显示加载画面，再调用 joinPublicRoom/joinPrivateRoom
  - [ ] SubTask 4.5: 连接成功或失败后自动关闭加载画面

- [ ] Task 5: 自动清理残留房间
  - [ ] SubTask 5.1: 在 state.js 中添加 cleanupInvalidRooms() 函数：过滤掉无法连接/无用的房间
  - [ ] SubTask 5.2: 在 screens.js refreshRoomList 中先调用 cleanupInvalidRooms() 再显示列表
  - [ ] SubTask 5.3: 清理逻辑：移除 playerCount<=0 的房间；尝试连接房间peerId，超时(3秒)则视为无效并移除

- [ ] Task 6: 加入速度优化
  - [ ] SubTask 6.1: 在 network.js joinRoom 中使用 PeerJS 的 serialization: 'json' 选项提高连接速度
  - [ ] SubTask 6.2: 设置 PeerJS 连接超时和重试机制（连接建立5秒超时）
  - [ ] SubTask 6.3: 加入房间时先切换到加载画面再开始连接，避免用户看到空白等待

# Task Dependencies
- [Task 3] depends on [Task 2]（聊天显示需要数字ID）
- [Task 4] depends on [Task 1]（加载画面中的失败提示需用Modal而非alert）
- [Task 5] depends on [Task 4]（清理房间需要测试连接）
- [Task 6] depends on [Task 4]（优化需配合加载画面）
