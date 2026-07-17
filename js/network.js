/**
 * network.js - PeerJS 多人联机系统
 * 处理房间的创建、加入、数据同步
 */

// 房间倒计时定时器
let roomTimerInterval = null;

// 加载画面秒表定时器
let loadingTimerInterval = null;
let loadingTimeout = null;

/**
 * 格式化秒数为 MM:SS
 * @param {number} seconds - 秒数
 * @returns {string} 格式化后的时间字符串
 */
function formatTime(seconds) {
  if (seconds <= 0) return '00:00';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}

/**
 * 创建房间（房主调用）
 */
function createRoom() {
  const peerId = inviteCodeToPeerId(gameState.room.inviteCode);

  // 创建 PeerJS 实例
  gameState.peer = new Peer(peerId);

  gameState.peer.on('open', (id) => {
    gameState.peerId = id;
    console.log('房间已创建，PeerID:', id);

    // 房主添加自己到玩家列表
    const colorInfo = allocateColor();
    const hostPlayer = {
      id: id,
      nickname: gameState.nickname,
      digitalId: gameState.digitalId,
      color: colorInfo.color,
      colorIndex: colorInfo.colorIndex,
    };
    gameState.players.push(hostPlayer);

    // 如果是公共房间，保存到 localStorage
    if (gameState.room.isPublic) {
      savePublicRoom({
        inviteCode: gameState.room.inviteCode,
        name: gameState.room.name,
        playerCount: gameState.players.length,
        peerId: id,
        creator: gameState.nickname,
        roomId: gameState.room.roomId,
      });
      // 保存邀请码到列表
      addInviteCodeList(gameState.room.inviteCode);
    }

    // 设置房间过期时间（1小时后）
    gameState.room.expiresAt = Date.now() + 3600000;

    // 切换到游戏界面
    switchScreen('game');
    initMap();
    rebindCanvasEvents();
    updateGameUI();
    // 启动房间倒计时
    startRoomTimer();
  });

  gameState.peer.on('connection', (conn) => {
    console.log('有玩家连接:', conn.peer);
    handleIncomingConnection(conn);
  });

  gameState.peer.on('error', (err) => {
    console.error('PeerJS 错误:', err);
    if (err.type === 'unavailable-id') {
      showModal('邀请码已被使用，请重新创建房间', 'alert');
      gameState.peer.destroy();
      gameState.peer = null;
      switchScreen('room-settings');
    }
  });
}

/**
 * 处理加入的玩家连接（房主端）
 */
function handleIncomingConnection(conn) {
  conn.on('open', () => {
    // 监听数据消息
    conn.on('data', (data) => {
      switch (data.type) {
        case 'join':
          handleJoinRequest(conn, data);
          break;
        case 'territory-update':
          handleClientTerritoryUpdate(conn, data);
          break;
        case 'territory-move':
          handleClientTerritoryMove(conn, data);
          break;
        case 'territory-release':
          handleClientTerritoryRelease(conn, data);
          break;
        case 'leave':
          handleClientLeave(conn, data);
          break;
        case 'chat':
          // 房主收到聊天消息：广播给所有玩家
          broadcastAll({
            type: 'chat',
            senderNickname: data.senderNickname,
            senderDigitalId: data.senderDigitalId,
            message: data.message,
          });
          // 房主自己也显示
          addChatMessage(data.senderNickname, data.senderDigitalId, data.message);
          break;
      }
    });

    conn.on('close', () => {
      handlePlayerDisconnect(conn.peer);
    });

    conn.on('error', (err) => {
      console.error('连接错误:', err);
    });
  });
}

/**
 * 处理加入房间请求（房主端）
 */
function handleJoinRequest(conn, data) {
  // 验证密码（私有房间）
  if (!gameState.room.isPublic && gameState.room.password) {
    if (data.password !== gameState.room.password) {
      conn.send({ type: 'join-rejected', reason: '密码错误' });
      conn.close();
      return;
    }
  }

  // 分配颜色
  const colorInfo = allocateColor();
  const newPlayer = {
    id: conn.peer,
    nickname: data.nickname,
    digitalId: data.digitalId || '',
    color: colorInfo.color,
    colorIndex: colorInfo.colorIndex,
  };
  gameState.players.push(newPlayer);
  gameState.connections[conn.peer] = conn;

  // 发送当前游戏状态给新玩家
  conn.send({
    type: 'welcome',
    room: gameState.room,
    players: gameState.players,
    territories: gameState.territories,
    playerTerritoryMap: gameState.playerTerritoryMap,
    yourColor: colorInfo.color,
    yourColorIndex: colorInfo.colorIndex,
    digitalId: data.digitalId || '',
    expiresAt: gameState.room.expiresAt,
  });

  // 通知所有其他玩家
  broadcastToOthers(conn.peer, {
    type: 'player-joined',
    player: newPlayer,
  });

  // 更新公共房间列表中的人数
  if (gameState.room.isPublic) {
    savePublicRoom({
      inviteCode: gameState.room.inviteCode,
      name: gameState.room.name,
      playerCount: gameState.players.length,
      peerId: gameState.peerId,
      creator: gameState.room.creator || gameState.players[0]?.nickname || '',
      roomId: gameState.room.roomId,
    });
  }

  // 更新游戏UI
  updateGameUI();
}

/**
 * 房主处理来自客户端的领地更新
 */
function handleClientTerritoryUpdate(conn, data) {
  const key = data.key;
  const territory = data.territory;

  // 检查该方块是否已被占领
  if (gameState.territories[key]) return;

  // 更新房主的地图
  gameState.territories[key] = territory;

  // 更新玩家领地映射
  gameState.playerTerritoryMap[territory.owner] = key;

  // 广播给所有玩家（包括发送者，以确认更新）
  broadcastAll({
    type: 'territory-update',
    key: key,
    territory: territory,
  });
}

/**
 * 房主处理来自客户端的领地移动
 */
function handleClientTerritoryMove(conn, data) {
  const oldKey = data.oldKey;
  const newKey = data.newKey;
  const territory = data.territory;

  // 删除旧领地
  delete gameState.territories[oldKey];

  // 创建新领地
  gameState.territories[newKey] = territory;

  // 更新玩家领地映射
  gameState.playerTerritoryMap[territory.owner] = newKey;

  // 广播给所有玩家
  broadcastAll({
    type: 'territory-move',
    oldKey: oldKey,
    newKey: newKey,
    territory: territory,
  });
}

/**
 * 房主处理来自客户端的领地释放
 */
function handleClientTerritoryRelease(conn, data) {
  const key = data.key;
  const playerId = data.playerId;

  // 删除领地
  delete gameState.territories[key];
  delete gameState.playerTerritoryMap[playerId];

  // 广播给所有玩家
  broadcastAll({
    type: 'territory-release',
    key: key,
    playerId: playerId,
  });
}

/**
 * 房主处理客户端主动退出
 */
function handleClientLeave(conn, data) {
  const peerId = conn.peer;
  // 释放该玩家的领地
  const territoryKey = gameState.playerTerritoryMap[peerId];
  if (territoryKey) {
    delete gameState.territories[territoryKey];
    delete gameState.playerTerritoryMap[peerId];
    // 广播领地释放
    broadcastAll({
      type: 'territory-release',
      key: territoryKey,
      playerId: peerId,
    });
  }

  // 从玩家列表中移除
  gameState.players = gameState.players.filter(p => p.id !== peerId);
  delete gameState.connections[peerId];

  // 通知其他玩家
  broadcastAll({
    type: 'player-left',
    playerId: peerId,
    players: gameState.players,
  });

  // 更新公共房间列表
  if (gameState.room.isPublic) {
    savePublicRoom({
      inviteCode: gameState.room.inviteCode,
      name: gameState.room.name,
      playerCount: gameState.players.length,
      peerId: gameState.peerId,
      creator: gameState.room.creator || gameState.players[0]?.nickname || '',
      roomId: gameState.room.roomId,
    });
  }

  updateGameUI();
}

/**
 * 玩家断开连接处理（房主端）
 */
function handlePlayerDisconnect(peerId) {
  console.log('玩家断开连接:', peerId);

  // 释放该玩家的领地
  const territoryKey = gameState.playerTerritoryMap[peerId];
  if (territoryKey) {
    delete gameState.territories[territoryKey];
    delete gameState.playerTerritoryMap[peerId];
    // 广播领地释放给其他玩家
    broadcastAll({
      type: 'territory-release',
      key: territoryKey,
      playerId: peerId,
    });
  }

  // 从玩家列表中移除
  gameState.players = gameState.players.filter(p => p.id !== peerId);
  delete gameState.connections[peerId];

  // 通知其他玩家
  broadcastAll({
    type: 'player-left',
    playerId: peerId,
    players: gameState.players,
  });

  // 更新公共房间列表
  if (gameState.room.isPublic) {
    savePublicRoom({
      inviteCode: gameState.room.inviteCode,
      name: gameState.room.name,
      playerCount: gameState.players.length,
      peerId: gameState.peerId,
      creator: gameState.room.creator || gameState.players[0]?.nickname || '',
      roomId: gameState.room.roomId,
    });
  }

  updateGameUI();
}

/**
 * 加入公共房间
 * @param {string} inviteCode - 邀请码
 */
function joinPublicRoom(inviteCode) {
  const peerId = inviteCodeToPeerId(inviteCode);
  joinRoom(peerId, '');
}

/**
 * 加入私有房间
 * @param {string} inviteCode - 邀请码（新格式：房间名-房间ID-XXXXX-XX）
 * @param {string} password - 密码
 */
function joinPrivateRoom(inviteCode, password) {
  // 新格式邀请码直接使用，从中提取 roomId 作为 PeerID
  const peerId = inviteCodeToPeerId(inviteCode);
  joinRoom(peerId, password);
}

/**
 * 加入房间通用逻辑
 * @param {string} hostPeerId - 房主的 PeerID
 * @param {string} password - 密码
 */
function joinRoom(hostPeerId, password) {
  // 先显示加载画面
  showLoadingScreen();

  // 创建自己的 Peer 实例（随机ID）
  gameState.peer = new Peer();

  gameState.peer.on('open', (myId) => {
    gameState.peerId = myId;
    console.log('我的 PeerID:', myId, '，正在连接房主:', hostPeerId);

    // 使用可靠的 JSON 序列化连接房主
    const conn = gameState.peer.connect(hostPeerId, {
      serialization: 'json',
      reliable: true,
    });

    conn.on('open', () => {
      // 发送加入请求
      conn.send({
        type: 'join',
        nickname: gameState.nickname,
        digitalId: gameState.digitalId,
        password: password,
      });

      gameState.connections[hostPeerId] = conn;
    });

    conn.on('data', (data) => {
      handleHostMessage(data);
    });

    conn.on('close', () => {
      console.log('与房主的连接已断开');
      // 如果在游戏中，提示断开
      if (gameState.currentScreen === 'game') {
        showModal('房主已退出，房间已销毁', 'alert', () => {
          resetState();
          switchScreen('menu');
        });
      }
    });

    conn.on('error', (err) => {
      console.error('连接房主失败:', err);
      hideLoadingScreen();
      showModal('连接失败，请检查邀请码是否正确', 'alert', () => {
        resetState();
        switchScreen('menu');
      });
    });
  });

  gameState.peer.on('error', (err) => {
    console.error('PeerJS 错误:', err);
    if (err.type === 'peer-unavailable') {
      hideLoadingScreen();
      // 根据当前界面决定错误提示方式
      if (gameState.currentScreen === 'loading' || gameState.currentScreen === 'join-private') {
        // 私有房间界面或加载画面：在页面上显示错误，不跳转
        const joinPrivateError = document.getElementById('join-private-error');
        if (joinPrivateError) joinPrivateError.textContent = '房间不存在';
        if (gameState.peer) {
          gameState.peer.destroy();
          gameState.peer = null;
        }
        switchScreen('join-private');
      } else {
        // 公共房间界面：Modal提示，返回加入界面
        showModal('房间不存在', 'alert', () => {
          resetState();
          switchScreen('join');
        });
      }
    }
  });
}

/**
 * 处理房主发来的消息（非房主端）
 */
function handleHostMessage(data) {
  switch (data.type) {
    case 'welcome':
      // 成功加入房间
      gameState.isHost = false;
      gameState.room = data.room;
      gameState.players = data.players;
      gameState.territories = data.territories;
      // 同步 playerTerritoryMap
      gameState.playerTerritoryMap = data.playerTerritoryMap || {};
      // 接收房间过期时间
      if (data.expiresAt) {
        gameState.room.expiresAt = data.expiresAt;
      }

      // 确保自己在玩家列表中（房主已包含）
      hideLoadingScreen();
      switchScreen('game');
      initMap();
      rebindCanvasEvents();
      updateGameUI();
      // 启动房间倒计时
      startRoomTimer();
      break;

    case 'chat':
      // 客户端收到聊天消息
      addChatMessage(data.senderNickname, data.senderDigitalId, data.message);
      break;

    case 'join-rejected':
      showModal('加入失败：' + data.reason, 'alert', () => {
        resetState();
        switchScreen('menu');
      });
      break;

    case 'player-joined':
      // 添加新玩家到列表
      if (data.player && !gameState.players.find(p => p.id === data.player.id)) {
        gameState.players.push(data.player);
      }
      updateGameUI();
      break;

    case 'player-left':
      gameState.players = gameState.players.filter(p => p.id !== data.playerId);
      updateGameUI();
      break;

    case 'territory-update':
      gameState.territories[data.key] = data.territory;
      // 更新玩家领地映射
      gameState.playerTerritoryMap[data.territory.owner] = data.key;
      break;

    case 'territory-move':
      // 删除旧领地
      delete gameState.territories[data.oldKey];
      // 创建新领地
      gameState.territories[data.newKey] = data.territory;
      // 更新玩家领地映射
      gameState.playerTerritoryMap[data.territory.owner] = data.newKey;
      break;

    case 'territory-release':
      // 删除领地
      delete gameState.territories[data.key];
      delete gameState.playerTerritoryMap[data.playerId];
      break;

    case 'room-destroyed':
      // 房主退出，房间已销毁
      showModal('房主已退出，房间已销毁', 'alert', () => {
        resetState();
        switchScreen('menu');
      });
      break;

    case 'full-sync':
      gameState.territories = data.territories;
      gameState.players = data.players;
      gameState.playerTerritoryMap = data.playerTerritoryMap || {};
      updateGameUI();
      break;
  }
}

/**
 * 领地变化时的同步（由 map.js 调用）
 * @param {string} key - 方块坐标键 'x,y'
 * @param {object} territory - 领地数据
 */
function onTerritoryChange(key, territory) {
  if (gameState.isHost) {
    // 房主：广播给所有其他玩家
    broadcastAll({
      type: 'territory-update',
      key: key,
      territory: territory,
    });
  } else {
    // 非房主：发送给房主
    const hostConn = getHostConnection();
    if (hostConn) {
      hostConn.send({
        type: 'territory-update',
        key: key,
        territory: territory,
      });
    }
  }
}

/**
 * 领地移动时的同步（由 map.js 调用）
 * @param {string} oldKey - 旧方块坐标键 'x,y'
 * @param {string} newKey - 新方块坐标键 'x,y'
 * @param {object} territory - 领地数据
 */
function onTerritoryMove(oldKey, newKey, territory) {
  if (gameState.isHost) {
    // 房主：广播给所有其他玩家
    broadcastAll({
      type: 'territory-move',
      oldKey: oldKey,
      newKey: newKey,
      territory: territory,
    });
  } else {
    // 非房主：发送给房主
    const hostConn = getHostConnection();
    if (hostConn) {
      hostConn.send({
        type: 'territory-move',
        oldKey: oldKey,
        newKey: newKey,
        territory: territory,
      });
    }
  }
}

/**
 * 获取到房主的连接（非房主端）
 */
function getHostConnection() {
  // 房主的 peerId 就是 roomId（从邀请码中提取）
  const hostPeerId = inviteCodeToPeerId(gameState.room.inviteCode);
  return gameState.connections[hostPeerId];
}

/**
 * 普通玩家退出房间
 */
function leaveRoom() {
  const hostConn = getHostConnection();

  // 发送领地释放消息给房主
  const myTerritory = gameState.playerTerritoryMap[gameState.peerId];
  if (myTerritory && hostConn) {
    hostConn.send({
      type: 'territory-release',
      key: myTerritory,
      playerId: gameState.peerId,
    });
  }

  // 发送离开消息给房主
  if (hostConn) {
    hostConn.send({ type: 'leave' });
  }

  // 停止房间倒计时
  stopRoomTimer();

  // 关闭所有连接，销毁 Peer
  resetState();

  // 切换回主菜单
  switchScreen('menu');
}

/**
 * 房主销毁房间
 */
function destroyRoom() {
  // 广播 room-destroyed 消息给所有玩家
  broadcastAll({ type: 'room-destroyed' });

  // 从 localStorage 移除公共房间信息和邀请码
  if (gameState.room.isPublic) {
    removePublicRoom(gameState.room.inviteCode);
  }
  removeInviteCodeList(gameState.room.inviteCode);

  // 停止房间倒计时
  stopRoomTimer();

  // 关闭所有连接，销毁 Peer
  resetState();

  // 切换回主菜单
  switchScreen('menu');
}

/**
 * 向所有连接的玩家广播消息（房主端）
 */
function broadcastAll(message) {
  Object.values(gameState.connections).forEach(conn => {
    if (conn && conn.open) {
      conn.send(message);
    }
  });
}

/**
 * 向除指定玩家外的所有玩家广播消息（房主端）
 */
function broadcastToOthers(excludePeerId, message) {
  Object.entries(gameState.connections).forEach(([peerId, conn]) => {
    if (peerId !== excludePeerId && conn && conn.open) {
      conn.send(message);
    }
  });
}

/**
 * 启动房间倒计时
 */
function startRoomTimer() {
  stopRoomTimer(); // 先清除旧的定时器
  const timerEl = document.getElementById('game-room-timer');
  if (!timerEl) return;

  const tick = () => {
    const remaining = gameState.room.expiresAt - Date.now();
    if (remaining <= 0) {
      // 房间已过期
      timerEl.textContent = '剩余时间: 00:00';
      stopRoomTimer();
      if (gameState.isHost) {
        // 房主销毁房间
        broadcastAll({ type: 'room-expired' });
        destroyRoom();
      } else {
        showModal('房间时间已到，房间已关闭', 'alert', () => {
          resetState();
          switchScreen('menu');
        });
      }
      return;
    }
    const seconds = Math.ceil(remaining / 1000);
    timerEl.textContent = '剩余时间: ' + formatTime(seconds);
  };

  tick(); // 立即执行一次
  roomTimerInterval = setInterval(tick, 1000);
}

/**
 * 停止房间倒计时
 */
function stopRoomTimer() {
  if (roomTimerInterval) {
    clearInterval(roomTimerInterval);
    roomTimerInterval = null;
  }
}

/**
 * 发送聊天消息
 * @param {string} message - 聊天内容
 */
function sendChatMessage(message) {
  if (!message.trim()) return;

  if (gameState.isHost) {
    // 房主直接广播给所有玩家
    broadcastAll({
      type: 'chat',
      senderNickname: gameState.nickname,
      senderDigitalId: gameState.digitalId,
      message: message,
    });
    // 房主自己也显示
    addChatMessage(gameState.nickname, gameState.digitalId, message);
  } else {
    // 客户端发送给房主
    const hostConn = getHostConnection();
    if (hostConn) {
      hostConn.send({
        type: 'chat',
        senderNickname: gameState.nickname,
        senderDigitalId: gameState.digitalId,
        message: message,
      });
    }
  }
}

/**
 * 显示加载画面并启动秒表
 */
function showLoadingScreen() {
  let countdown = 30;
  const timerEl = document.getElementById('loading-timer');
  if (timerEl) timerEl.textContent = countdown;

  switchScreen('loading');

  // 启动秒表倒数
  loadingTimerInterval = setInterval(() => {
    countdown--;
    if (timerEl) timerEl.textContent = countdown;
    if (countdown <= 0) {
      // 超时
      hideLoadingScreen();
      showModal('连接超时，请重试', 'alert');
      cancelJoinRoom();
    }
  }, 1000);

  // 设置30秒超时
  loadingTimeout = setTimeout(() => {
    hideLoadingScreen();
    showModal('连接超时，请重试', 'alert');
    cancelJoinRoom();
  }, 30000);
}

/**
 * 隐藏加载画面并停止秒表
 */
function hideLoadingScreen() {
  if (loadingTimerInterval) {
    clearInterval(loadingTimerInterval);
    loadingTimerInterval = null;
  }
  if (loadingTimeout) {
    clearTimeout(loadingTimeout);
    loadingTimeout = null;
  }
}

/**
 * 取消加入房间
 */
function cancelJoinRoom() {
  hideLoadingScreen();
  // 销毁 Peer 连接
  if (gameState.peer) {
    gameState.peer.destroy();
    gameState.peer = null;
  }
  gameState.peerId = '';
  gameState.connections = {};
  switchScreen('join');
}
