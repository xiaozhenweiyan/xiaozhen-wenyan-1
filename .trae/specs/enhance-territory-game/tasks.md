# Tasks

- [x] Task 1: 修改领地选择机制为每人一块（选择+释放+提示）
  - [x] SubTask 1.1: 在 state.js 中添加 playerTerritoryMap: {playerId: 'x,y'}，记录每个玩家的领地位置
  - [x] SubTask 1.2: 在 map.js onCanvasClick 中：玩家已有领地时先释放旧领地再选择新领地；已有领地被其他玩家占据时不可选
  - [x] SubTask 1.3: 在 screens.js 中添加领地移动 Toast 提示"你的领地已移动到新位置"
  - [x] SubTask 1.4: 在 css/style.css 中添加 Toast 提示样式（像素风格，自动消失）

- [x] Task 2: 修改邀请码格式为"房间名-房间ID-XXXXX-XX"
  - [x] SubTask 2.1: 在 state.js 中添加 generateRoomId() 函数（基于时间戳的唯一ID，如 R+Date.now()）
  - [x] SubTask 2.2: 修改 generateInviteCode() 为 generateInviteCode(roomName, roomId)，返回格式"房间名-房间ID-XXXXX-XX"
  - [x] SubTask 2.3: 修改 inviteCodeToPeerId() 适配新格式（将整个邀请码编码为安全的PeerID）
  - [x] SubTask 2.4: 在 localStorage 中维护已有邀请码列表，生成XXXXX-XX时检查重复

- [x] Task 3: 增加退出房间按钮和销毁逻辑
  - [x] SubTask 3.1: 在 index.html 游戏界面添加"退出房间"按钮
  - [x] SubTask 3.2: 在 css/style.css 中添加退出按钮样式
  - [x] SubTask 3.3: 在 screens.js 中添加退出按钮事件处理（普通玩家：退出+释放领地；房主：销毁房间）
  - [x] SubTask 3.4: 在 network.js 中实现房主退出销毁逻辑：广播 room-destroyed 给所有玩家，关闭所有连接，移除localStorage房间
  - [x] SubTask 3.5: 在 network.js 中实现客户端收到 room-destroyed 时的处理：提示+返回主菜单

- [x] Task 4: 房间列表显示创建人名字和房间ID
  - [x] SubTask 4.1: 在 state.js savePublicRoom() 中保存创建人昵称和房间ID
  - [x] SubTask 4.2: 在 screens.js refreshRoomList() 中每个房间卡片下方显示创建人名字和房间ID

- [x] Task 5: 更新领地选择和退出的网络同步逻辑
  - [x] SubTask 5.1: 在 network.js 中领地选择同步改为 territory-move（包含旧位置和新位置），同步释放旧领地+创建新领地
  - [x] SubTask 5.2: 在 network.js 中玩家退出时同步释放该玩家领地（territory-release 消息类型）
  - [x] SubTask 5.3: 在 screens.js 中更新加入私有房间界面适配新邀请码格式

# Task Dependencies
- [Task 2] depends on [Task 1]（邀请码格式影响房间创建流程）
- [Task 3] depends on [Task 1]（退出时需释放领地）
- [Task 4] depends on [Task 2]（房间列表需显示房间ID）
- [Task 5] depends on [Task 1] and [Task 3]
