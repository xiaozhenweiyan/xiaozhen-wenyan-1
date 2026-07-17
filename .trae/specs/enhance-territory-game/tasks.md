# Tasks

- [ ] Task 1: 修改领地机制为每人一块（移动领地+提示）
  - [ ] SubTask 1.1: 在 state.js 中记录每个玩家的领地位置（playerTerritoryMap: {playerId: 'x,y'}）
  - [ ] SubTask 1.2: 在 map.js onCanvasClick 中：点击新空草地方块时，若玩家已有领地，先删除旧领地再创建新领地，并同步网络
  - [ ] SubTask 1.3: 在 screens.js 中添加领地移动提示逻辑（Toast提示"你的领地已移动到新位置"）

- [ ] Task 2: 修改邀请码格式为"房间名-房间ID-XXXXX-XX"
  - [ ] SubTask 2.1: 在 state.js 中添加 generateRoomId() 函数（含时间戳的唯一ID）
  - [ ] SubTask 2.2: 修改 generateInviteCode() 为 generateInviteCode(roomName, roomId) 返回"房间名-房间ID-XXXXX-XX"
  - [ ] SubTask 2.3: 添加 inviteCodeToPeerId() 适配新格式（将整个邀请码编码为PeerID）
  - [ ] SubTask 2.4: 在 localStorage 中维护已有邀请码列表，生成时检查重复

- [ ] Task 3: 增加退出房间按钮
  - [ ] SubTask 3.1: 在 index.html 游戏界面添加"退出房间"按钮
  - [ ] SubTask 3.2: 在 css/style.css 中添加退出按钮样式
  - [ ] SubTask 3.3: 在 screens.js 中添加退出按钮事件处理（区分房主和普通玩家）

- [ ] Task 4: 实现房主退出销毁房间逻辑
  - [ ] SubTask 4.1: 在 network.js 中房主退出时：广播销毁通知给所有玩家，关闭所有连接，移除localStorage房间
  - [ ] SubTask 4.2: 在 network.js 中客户端收到房主销毁通知时：提示"房主已退出，房间已销毁"，返回主菜单
  - [ ] SubTask 4.3: 在 network.js 中客户端检测房主断开连接时，同样触发销毁逻辑

- [ ] Task 5: 更新相关UI和同步逻辑
  - [ ] SubTask 5.1: 更新 screens.js 中领地移动的网络同步消息类型
  - [ ] SubTask 5.2: 更新 network.js 中领地同步逻辑（删除旧领地+创建新领地的两步操作）
  - [ ] SubTask 5.3: 更新加入房间界面的邀请码输入逻辑适配新格式

# Task Dependencies
- [Task 2] depends on [Task 1]（邀请码格式影响房间创建流程）
- [Task 3] depends on [Task 4]（退出按钮需要销毁逻辑）
- [Task 5] depends on [Task 1] and [Task 2]
