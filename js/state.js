/**
 * state.js - 游戏状态管理
 * 管理全局游戏状态数据
 */

// 玩家颜色预设
const PLAYER_COLORS = [
  'rgba(255, 99, 71, 0.5)',   // 番茄红
  'rgba(30, 144, 255, 0.5)',  // 道奇蓝
  'rgba(255, 215, 0, 0.5)',   // 金色
  'rgba(148, 0, 211, 0.5)',   // 紫色
  'rgba(0, 206, 209, 0.5)',   // 深青色
  'rgba(255, 105, 180, 0.5)', // 粉色
  'rgba(50, 205, 50, 0.5)',   // 酸橙绿
  'rgba(255, 165, 0, 0.5)',   // 橙色
];

// 玩家颜色对应的实色（用于UI圆点显示）
const PLAYER_COLORS_SOLID = [
  'rgb(255, 99, 71)',   // 番茄红
  'rgb(30, 144, 255)',  // 道奇蓝
  'rgb(255, 215, 0)',   // 金色
  'rgb(148, 0, 211)',   // 紫色
  'rgb(0, 206, 209)',   // 深青色
  'rgb(255, 105, 180)', // 粉色
  'rgb(50, 205, 50)',   // 酸橙绿
  'rgb(255, 165, 0)',   // 橙色
];

// 全局游戏状态
const gameState = {
  nickname: '',            // 当前玩家昵称
  digitalId: '',           // 数字ID（#1000-#9999）
  peerId: '',              // 当前玩家的 PeerJS ID
  isHost: false,           // 是否为房主
  room: {
    name: '',              // 房间名称
    isPublic: true,        // 是否公有房间
    password: '',          // 房间密码
    roomId: '',            // 房间唯一ID（同时也是 PeerID）
    expiresAt: 0,          // 房间过期时间戳（1小时倒计时）
  },
  players: [],             // 玩家列表 {id, nickname, color, colorIndex}
  territories: {},         // 领地数据 {'x,y': {owner: playerId, color: 'rgba(...)'}}
  playerTerritoryMap: {},  // 每个玩家拥有的领地坐标 {playerId: 'x,y'}
  mapWidth: 40,            // 地图宽度（方块数）
  mapHeight: 30,           // 地图高度（方块数）
  tileSize: 24,            // 每个方块像素大小
  currentScreen: 'start',  // 当前界面
  connections: {},         // PeerJS 连接 {peerId: dataConnection}
  peer: null,              // PeerJS 实例
  nextColorIndex: 0,       // 下一个分配的颜色索引
  chatHistory: [],         // 聊天历史（内存中，不跨房间持久化）
};

/**
 * 生成数字ID（#1000-#9999范围随机数）
 * 临时账户，退出即销毁，不持久化
 * @returns {string} 格式 "#1234"
 */
function generateDigitalId() {
  const num = Math.floor(Math.random() * 9000) + 1000;
  return '#' + num;
}

/**
 * 生成基于时间戳的唯一房间ID
 * 格式：R + Date.now().toString(36) + 随机2位大写字母
 * 该ID同时作为 PeerJS 的 PeerID，因此只包含字母和数字
 */
function generateRoomId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const randomSuffix = chars.charAt(Math.floor(Math.random() * chars.length)) +
                       chars.charAt(Math.floor(Math.random() * chars.length));
  return 'R' + Date.now().toString(36) + randomSuffix;
}

/**
 * 分配下一个玩家颜色
 */
function allocateColor() {
  const index = gameState.nextColorIndex % PLAYER_COLORS.length;
  gameState.nextColorIndex++;
  return {
    color: PLAYER_COLORS[index],
    colorIndex: index,
    colorSolid: PLAYER_COLORS_SOLID[index],
  };
}

/**
 * 重置游戏状态（回到初始值）
 */
function resetState() {
  gameState.isHost = false;
  gameState.digitalId = '';
  gameState.room = {
    name: '',
    isPublic: true,
    password: '',
    roomId: '',
    expiresAt: 0,
  };
  gameState.players = [];
  gameState.territories = {};
  gameState.playerTerritoryMap = {};
  gameState.nextColorIndex = 0;
  gameState.chatHistory = []; // 清空聊天历史（不跨房间保留）
  // 关闭所有连接
  Object.values(gameState.connections).forEach(conn => {
    if (conn && conn.close) conn.close();
  });
  gameState.connections = {};
  // 销毁 Peer 实例
  if (gameState.peer) {
    gameState.peer.destroy();
    gameState.peer = null;
  }
  gameState.peerId = '';
}

/**
 * 保存公共房间信息到 localStorage
 * 存储字段：roomId（即peerId）、name、playerCount、creator、isPublic
 */
function savePublicRoom(roomInfo) {
  const rooms = getPublicRooms();
  // 避免重复，按 roomId 查找
  const existing = rooms.findIndex(r => r.roomId === roomInfo.roomId);
  if (existing >= 0) {
    rooms[existing] = roomInfo;
  } else {
    rooms.push(roomInfo);
  }
  localStorage.setItem('pixel_territory_rooms', JSON.stringify(rooms));
}

/**
 * 从 localStorage 获取公共房间列表
 */
function getPublicRooms() {
  try {
    const data = localStorage.getItem('pixel_territory_rooms');
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

/**
 * 从 localStorage 移除指定房间（通过 roomId）
 */
function removePublicRoom(roomId) {
  const rooms = getPublicRooms();
  const filtered = rooms.filter(r => r.roomId !== roomId);
  localStorage.setItem('pixel_territory_rooms', JSON.stringify(filtered));
}

/**
 * 获取当前玩家信息
 */
function getCurrentPlayer() {
  return gameState.players.find(p => p.id === gameState.peerId);
}
