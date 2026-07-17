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
  peerId: '',              // 当前玩家的 PeerJS ID
  isHost: false,           // 是否为房主
  room: {
    name: '',              // 房间名称
    isPublic: true,        // 是否公有房间
    password: '',          // 房间密码
    inviteCode: '',        // 邀请码 XXXXX-XX
  },
  players: [],             // 玩家列表 {id, nickname, color, colorIndex}
  territories: {},         // 领地数据 {'x,y': {owner: playerId, color: 'rgba(...)'}}
  mapWidth: 40,            // 地图宽度（方块数）
  mapHeight: 30,           // 地图高度（方块数）
  tileSize: 24,            // 每个方块像素大小
  currentScreen: 'start',  // 当前界面
  connections: {},         // PeerJS 连接 {peerId: dataConnection}
  peer: null,              // PeerJS 实例
  nextColorIndex: 0,       // 下一个分配的颜色索引
};

/**
 * 生成邀请码，格式 XXXXX-XX（大写英文和数字随机）
 */
function generateInviteCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  // 前5位
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  code += '-';
  // 后2位
  for (let i = 0; i < 2; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * 将邀请码转换为 PeerID（去掉横线）
 */
function inviteCodeToPeerId(inviteCode) {
  return inviteCode.replace('-', '');
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
  gameState.room = {
    name: '',
    isPublic: true,
    password: '',
    inviteCode: '',
  };
  gameState.players = [];
  gameState.territories = {};
  gameState.nextColorIndex = 0;
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
 */
function savePublicRoom(roomInfo) {
  const rooms = getPublicRooms();
  // 避免重复
  const existing = rooms.findIndex(r => r.inviteCode === roomInfo.inviteCode);
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
 * 从 localStorage 移除指定房间
 */
function removePublicRoom(inviteCode) {
  const rooms = getPublicRooms();
  const filtered = rooms.filter(r => r.inviteCode !== inviteCode);
  localStorage.setItem('pixel_territory_rooms', JSON.stringify(filtered));
}

/**
 * 获取当前玩家信息
 */
function getCurrentPlayer() {
  return gameState.players.find(p => p.id === gameState.peerId);
}
