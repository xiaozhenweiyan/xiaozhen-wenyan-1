# Tasks

- [x] Task 1: 修复公共房间不可见bug + 简化邀请码为房间ID
  - [x] SubTask 1.1: 修改 main.js：移除无条件 localStorage 清除，改为页面关闭时仅清理当前会话数据
  - [x] SubTask 1.2: 修改 state.js：删除 generateInviteSuffix/generateInviteCode/extractRoomIdFromInviteCode 等复杂邀请码函数，房间ID直接作为PeerID
  - [x] SubTask 1.3: 修改 state.js savePublicRoom/getPublicRooms：只存储 roomId（作为peerId）、name、playerCount、creator
  - [x] SubTask 1.4: 修改 network.js createRoom：使用 roomId 直接作为 PeerID，不再编码
  - [x] SubTask 1.5: 修改 network.js joinRoom/joinPublicRoom/joinPrivateRoom：直接传入 roomId 连接
  - [x] SubTask 1.6: 修改 screens.js 房间设置界面：邀请码显示改为房间ID，删除 inviteSuffix 相关逻辑

- [x] Task 2: 创建房间时添加复制按钮 + 加入房间界面添加刷新按钮
  - [x] SubTask 2.1: 在 index.html 房间设置界面的邀请码旁边添加"复制"按钮
  - [x] SubTask 2.2: 在 css/style.css 添加复制按钮样式
  - [x] SubTask 2.3: 在 screens.js 中实现复制功能（navigator.clipboard.writeText + Toast提示"已复制"）
  - [x] SubTask 2.4: 在 index.html 加入房间界面添加"刷新"按钮
  - [x] SubTask 2.5: 在 screens.js initJoinScreen 中绑定刷新按钮事件（调用 refreshRoomList）

- [x] Task 3: 聊天历史同步（不跨房间保留）
  - [x] SubTask 3.1: 在 state.js gameState 中添加 chatHistory: []（内存中，不持久化）
  - [x] SubTask 3.2: 在 network.js 中房主收到 chat 消息时存入 chatHistory
  - [x] SubTask 3.3: 在 network.js handleJoinRequest 的 welcome 消息中添加 chatHistory 字段
  - [x] SubTask 3.4: 在 network.js handleHostMessage welcome 中接收 chatHistory 并渲染历史消息
  - [x] SubTask 3.5: 在 state.js resetState 中清空 chatHistory

- [x] Task 4: 房间详情面板
  - [x] SubTask 4.1: 在 index.html 游戏界面替换右上角文字为"房间详情"按钮
  - [x] SubTask 4.2: 在 index.html 添加房间详情面板容器（弹出层，显示房间名、ID、创建者、人数、剩余时间、复制按钮）
  - [x] SubTask 4.3: 在 css/style.css 添加房间详情面板样式（像素风格弹出面板）
  - [x] SubTask 4.4: 在 screens.js 中实现 toggleRoomDetailPanel() 函数（显示/隐藏面板）
  - [x] SubTask 4.5: 在 screens.js updateGameUI 中更新面板数据
  - [x] SubTask 4.6: 面板内添加复制房间ID按钮

- [x] Task 5: 房间列表搜索功能
  - [x] SubTask 5.1: 在 index.html 加入房间界面添加搜索输入框
  - [x] SubTask 5.2: 在 css/style.css 添加搜索框样式
  - [x] SubTask 5.3: 在 screens.js refreshRoomList 中实现搜索过滤逻辑（按房间名或房间ID匹配，不区分大小写）
  - [x] SubTask 5.4: 在 screens.js 中实现排序逻辑（按房间ID字典序升序）
  - [x] SubTask 5.5: 搜索框实时输入时触发过滤和重新渲染

# Task Dependencies
- [Task 2] depends on [Task 1]（复制按钮需要简化的房间ID）
- [Task 3] depends on [Task 1]（聊天历史同步需要简化的房间系统）
- [Task 4] depends on [Task 1]（房间详情面板需要简化的房间ID）
- [Task 5] depends on [Task 1]（搜索功能需要简化的房间数据）
