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
    inviteCode: '',        // 完整邀请码 房间名-房间ID-XXXXX-XX
    roomId: '',            // 房间唯一ID
    inviteSuffix: '',      // 邀请码后缀 XXXXX-XX（创建时预生成）
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
};

/**
 * 生成基于时间戳的唯一房间ID
 * 格式：R + Date.now().toString(36) + 随机2位大写字母
 */
function generateRoomId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const randomSuffix = chars.charAt(Math.floor(Math.random() * chars.length)) +
                       chars.charAt(Math.floor(Math.random() * chars.length));
  return 'R' + Date.now().toString(36) + randomSuffix;
}

/**
 * 生成邀请码后缀 XXXXX-XX（大写英文和数字随机）
 * 检查已有邀请码列表避免重复
 */
function generateInviteSuffix() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const existingCodes = getInviteCodeList();
  let suffix = '';
  let attempts = 0;
  do {
    suffix = '';
    // 前5位
    for (let i = 0; i < 5; i++) {
      suffix += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    suffix += '-';
    // 后2位
    for (let i = 0; i < 2; i++) {
      suffix += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    attempts++;
  } while (existingCodes.some(c => c.endsWith(suffix)) && attempts < 100);
  return suffix;
}

/**
 * 生成邀请码，格式：房间名-房间ID-XXXXX-XX
 * @param {string} roomName - 房间名称
 * @param {string} roomId - 房间唯一ID
 * @returns {string} 完整邀请码
 */
function generateInviteCode(roomName, roomId) {
  const suffix = generateInviteSuffix();
  return roomName + '-' + roomId + '-' + suffix;
}

/**
 * 从邀请码中提取房间ID（第二个横线分隔的部分）
 * 邀请码格式：房间名-房间ID-XXXXX-XX
 * @param {string} inviteCode - 完整邀请码
 * @returns {string} 房间ID
 */
function extractRoomIdFromInviteCode(inviteCode) {
  const parts = inviteCode.split('-');
  // 格式：房间名-房间ID-XXXXX-XX，至少4部分
  if (parts.length >= 4) {
    // 房间ID是第二部分
    return parts[1];
  }
  return inviteCode;
}

/**
 * 将邀请码转换为 PeerID
 * 新方案：PeerID 只用 roomId 部分，因为 roomId 已经唯一
 * @param {string} inviteCode - 邀请码
 * @returns {string} PeerID（即 roomId）
 */
function inviteCodeToPeerId(inviteCode) {
  return extractRoomIdFromInviteCode(inviteCode);
}

/**
 * 从 localStorage 获取已有邀请码列表
 * @returns {string[]} 邀请码数组
 */
function getInviteCodeList() {
  try {
    const data = localStorage.getItem('pixel_territory_invite_codes');
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

/**
 * 添加邀请码到 localStorage 列表
 * @param {string} code - 邀请码
 */
function addInviteCodeList(code) {
  const codes = getInviteCodeList();
  if (!codes.includes(code)) {
    codes.push(code);
    localStorage.setItem('pixel_territory_invite_codes', JSON.stringify(codes));
  }
}

/**
 * 从 localStorage 列表中移除邀请码
 * @param {string} code - 邀请码
 */
function removeInviteCodeList(code) {
  const codes = getInviteCodeList();
  const filtered = codes.filter(c => c !== code);
  localStorage.setItem('pixel_territory_invite_codes', JSON.stringify(filtered));
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
    roomId: '',
    inviteSuffix: '',
  };
  gameState.players = [];
  gameState.territories = {};
  gameState.playerTerritoryMap = {};
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
