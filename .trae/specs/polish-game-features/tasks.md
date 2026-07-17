# Tasks

- [ ] Task 1: 替换所有 alert() 为自定义像素风格 Modal/Toast
  - [ ] SubTask 1.1: 在 screens.js 中创建 showModal(message, type, onConfirm) 函数（type: alert/confirm）
  - [ ] SubTask 1.2: 在 css/style.css 中添加 Modal 样式（像素风格遮罩层、边框、按钮）
  - [ ] SubTask 1.3: 在 index.html 中添加 Modal 容器 `<div id="modal-overlay">`
  - [ ] SubTask 1.4: 替换 network.js 中所有 alert() 调用（约6处）
  - [ ] SubTask 1.5: 替换 screens.js 中所有 alert() 调用（约1处）
  - [ ] SubTask 1.6: showToast 改为全局可用（非仅游戏界面）

- [ ] Task 2: 数字ID系统与数据清理
  - [ ] SubTask 2.1: 在 state.js 中添加 generateDigitalId() 函数（生成 #1000-#9999 随机数字ID）
  - [ ] SubTask 2.2: gameState 中添加 `digitalId: ''` 字段
  - [ ] SubTask 2.3: screens.js 注册界面：确认后自动生成数字ID，主菜单显示"昵称#数字ID"
  - [ ] SubTask 2.4: 所有玩家信息显示改为"昵称#数字ID"（玩家列表、聊天消息等）
  - [ ] SubTask 2.5: main.js 中页面加载时清除 localStorage 残留数据（pixel_territory_rooms 和 pixel_territory_invite_codes）
  - [ ] SubTask 2.6: window.onbeforeunload 中销毁临时账户

- [ ] Task 3: 房间1小时倒计时自动销毁
  - [ ] SubTask 3.1: gameState.room 中添加 `expiresAt: 0` 字段（创建时间+1小时的时间戳）
  - [ ] SubTask 3.2: createRoom() 时设置 expiresAt = Date.now() + 3600000
  - [ ] SubTask 3.3: screens.js 中添加倒计时显示函数，游戏界面显示"剩余时间: MM:SS"
  - [ ] SubTask 3.4: 添加 setInterval 每秒检查倒计时，归零时调用销毁房间逻辑
  - [ ] SubTask 3.5: welcome 消息中发送 expiresAt，客户端同步显示倒计时
  - [ ] SubTask 3.6: 倒计时归零时广播 room-expired 消息给所有玩家

- [ ] Task 4: 聊天区域
  - [ ] SubTask 4.1: 在 index.html 游戏界面右下角添加聊天区域（消息列表+输入框）
  - [ ] SubTask 4.2: 在 css/style.css 中添加聊天区域样式（像素风格、半透明背景、消息滚动、输入框）
  - [ ] SubTask 4.3: screens.js 中实现聊天逻辑：T键激活、ESC取消、回车发送
  - [ ] SubTask 4.4: screens.js 中实现 addChatMessage() 函数
  - [ ] SubTask 4.5: network.js 中添加 chat 消息类型，广播聊天消息到所有玩家
  - [ ] SubTask 4.6: map.js 中添加键盘事件监听（T键/ESC键），聊天输入时禁止地图交互

- [ ] Task 5: 加入按钮与加载画面（秒表+可退出）
  - [ ] SubTask 5.1: screens.js refreshRoomList：每个房间卡片右侧加"加入"按钮
  - [ ] SubTask 5.2: index.html 添加加载画面 screen-loading（文字+秒表+取消按钮）
  - [ ] SubTask 5.3: css/style.css 添加加载画面样式（像素风格动画、秒表字体、取消按钮）
  - [ ] SubTask 5.4: screens.js 中实现秒表：显示剩余秒数从30开始，每秒递减
  - [ ] SubTask 5.5: screens.js 中取消按钮：点击立即中断连接，返回房间列表
  - [ ] SubTask 5.6: network.js joinRoom：30秒超时机制，超时后用Modal提示"连接超时"
  - [ ] SubTask 5.7: 连接成功/失败后自动关闭加载画面

# Task Dependencies
- [Task 3] depends on [Task 1]（倒计时归零提示用Modal而非alert）
- [Task 4] depends on [Task 2]（聊天消息显示需要数字ID）
- [Task 5] depends on [Task 1]（加载画面的失败提示用Modal）
- [Task 6] -- 无额外Task6，优化已包含在Task5中
