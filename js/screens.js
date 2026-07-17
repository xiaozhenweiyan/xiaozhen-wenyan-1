/**
 * screens.js - 界面切换和UI逻辑
 * 管理所有界面的显示/隐藏和交互逻辑
 */

/**
 * 显示自定义像素风格 Modal
 * @param {string} message - 提示消息
 * @param {string} type - 'alert'（仅确定按钮）或 'confirm'（确认+取消按钮）
 * @param {function} onConfirm - 确认回调（type='confirm'时生效）
 */
function showModal(message, type, onConfirm) {
  const overlay = document.getElementById('modal-overlay');
  const msgEl = document.getElementById('modal-message');
  const btnsEl = document.getElementById('modal-buttons');

  // 设置消息文本
  msgEl.textContent = message;
  // 清空旧按钮
  btnsEl.innerHTML = '';

  if (type === 'confirm') {
    // 确认按钮
    const btnConfirm = document.createElement('button');
    btnConfirm.className = 'pixel-btn btn-green btn-small';
    btnConfirm.textContent = '确认';
    btnConfirm.addEventListener('click', () => {
      overlay.style.display = 'none';
      if (onConfirm) onConfirm();
    });
    btnsEl.appendChild(btnConfirm);

    // 取消按钮
    const btnCancel = document.createElement('button');
    btnCancel.className = 'pixel-btn btn-red btn-small';
    btnCancel.textContent = '取消';
    btnCancel.addEventListener('click', () => {
      overlay.style.display = 'none';
    });
    btnsEl.appendChild(btnCancel);
  } else {
    // 默认 alert 类型：仅确定按钮
    const btnOk = document.createElement('button');
    btnOk.className = 'pixel-btn btn-green btn-small';
    btnOk.textContent = '确定';
    btnOk.addEventListener('click', () => {
      overlay.style.display = 'none';
      if (onConfirm) onConfirm();
    });
    btnsEl.appendChild(btnOk);
  }

  overlay.style.display = 'flex';
}

/**
 * 全局 Toast 提示（可在任何界面使用）
 * @param {string} message - 提示内容
 */
function showToastGlobal(message) {
  const toast = document.createElement('div');
  toast.className = 'toast-msg';
  toast.textContent = message;
  document.body.appendChild(toast);
  // 2秒后自动删除
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, 2000);
}

/**
 * 切换到指定界面
 * @param {string} screenId - 界面ID（不含 'screen-' 前缀）
 */
function switchScreen(screenId) {
  // 隐藏所有界面
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });
  // 显示目标界面
  const target = document.getElementById('screen-' + screenId);
  if (target) {
    target.classList.add('active');
    gameState.currentScreen = screenId;
  }
}

/**
 * 初始化开始界面逻辑
 */
function initStartScreen() {
  document.getElementById('btn-start').addEventListener('click', () => {
    switchScreen('register');
  });
}

/**
 * 初始化注册界面逻辑
 */
function initRegisterScreen() {
  const input = document.getElementById('input-nickname');
  const errorEl = document.getElementById('register-error');
  const btnConfirm = document.getElementById('btn-register');

  btnConfirm.addEventListener('click', () => {
    const nickname = input.value.trim();
    if (!nickname) {
      errorEl.textContent = '请输入昵称';
      return;
    }
    errorEl.textContent = '';
    gameState.nickname = nickname;
    gameState.digitalId = generateDigitalId();
    // 更新主菜单昵称显示（含数字ID）
    document.getElementById('display-nickname').textContent = nickname + gameState.digitalId;
    switchScreen('menu');
  });

  // 回车确认
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') btnConfirm.click();
  });
}

/**
 * 初始化主菜单逻辑
 */
function initMenuScreen() {
  document.getElementById('btn-create-room').addEventListener('click', () => {
    // 预生成房间ID和邀请码后缀
    gameState.room.roomId = generateRoomId();
    gameState.room.inviteSuffix = generateInviteSuffix();
    // 显示占位邀请码（房间名部分暂显示"？"）
    document.getElementById('display-invite-code').textContent = '？-' + gameState.room.roomId + '-' + gameState.room.inviteSuffix;
    // 重置房间设置
    gameState.room.name = '';
    gameState.room.isPublic = true;
    gameState.room.password = '';
    gameState.room.inviteCode = '';
    document.getElementById('input-room-name').value = '';
    document.getElementById('input-room-password').value = '';
    document.getElementById('password-group').style.display = 'none';
    document.getElementById('btn-public').classList.add('active');
    document.getElementById('btn-private').classList.remove('active');
    document.getElementById('settings-error').textContent = '';
    switchScreen('room-settings');
  });

  document.getElementById('btn-join-room').addEventListener('click', () => {
    refreshRoomList();
    switchScreen('join');
  });
}

/**
 * 初始化房间设置界面逻辑
 */
function initRoomSettingsScreen() {
  const btnPublic = document.getElementById('btn-public');
  const btnPrivate = document.getElementById('btn-private');
  const passwordGroup = document.getElementById('password-group');
  const btnBack = document.getElementById('btn-settings-back');
  const btnConfirm = document.getElementById('btn-settings-confirm');
  const errorEl = document.getElementById('settings-error');
  const inputRoomName = document.getElementById('input-room-name');

  // 房间类型切换
  btnPublic.addEventListener('click', () => {
    gameState.room.isPublic = true;
    btnPublic.classList.add('active');
    btnPrivate.classList.remove('active');
    passwordGroup.style.display = 'none';
  });

  btnPrivate.addEventListener('click', () => {
    gameState.room.isPublic = false;
    btnPrivate.classList.add('active');
    btnPublic.classList.remove('active');
    passwordGroup.style.display = 'block';
  });

  // 房间名输入时实时更新邀请码显示
  inputRoomName.addEventListener('input', () => {
    const roomName = inputRoomName.value.trim();
    const displayName = roomName || '？';
    document.getElementById('display-invite-code').textContent = displayName + '-' + gameState.room.roomId + '-' + gameState.room.inviteSuffix;
  });

  // 返回按钮
  btnBack.addEventListener('click', () => {
    switchScreen('menu');
  });

  // 确认按钮 - 创建房间
  btnConfirm.addEventListener('click', () => {
    const roomName = inputRoomName.value.trim();
    if (!roomName) {
      errorEl.textContent = '请输入房间名字';
      return;
    }
    errorEl.textContent = '';
    gameState.room.name = roomName;
    gameState.room.password = document.getElementById('input-room-password').value;
    gameState.isHost = true;

    // 用最终的房间名+房间ID+后缀组合成完整邀请码
    gameState.room.inviteCode = generateInviteCode(roomName, gameState.room.roomId);

    // 创建房间（调用网络模块）
    createRoom();
  });
}

/**
 * 刷新公共房间列表
 */
function refreshRoomList() {
  const roomListEl = document.getElementById('room-list');
  const noRoomsHint = document.getElementById('no-rooms-hint');
  const rooms = getPublicRooms();

  // 清除旧卡片（保留 noRoomsHint）
  const oldCards = roomListEl.querySelectorAll('.room-card');
  oldCards.forEach(card => card.remove());

  if (rooms.length === 0) {
    noRoomsHint.style.display = 'block';
  } else {
    noRoomsHint.style.display = 'none';
    rooms.forEach(room => {
      const card = document.createElement('div');
      card.className = 'room-card';
      card.innerHTML = `
        <div class="room-card-info-area">
          <span class="room-card-name">${escapeHtml(room.name)}</span>
          <span class="room-card-info">创建者：${escapeHtml(room.creator || '未知')} | 房间ID：${escapeHtml(room.roomId || '未知')}</span>
          <span class="room-card-players">${room.playerCount}人</span>
        </div>
        <button class="pixel-btn btn-green btn-small btn-join-card" data-code="${escapeHtml(room.inviteCode)}">加入</button>
      `;
      // 点击"加入"按钮才触发加入房间
      card.querySelector('.btn-join-card').addEventListener('click', (e) => {
        e.stopPropagation();
        joinPublicRoom(room.inviteCode);
      });
      roomListEl.appendChild(card);
    });
  }
}

/**
 * HTML 转义，防止 XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * 初始化加入房间界面逻辑
 */
function initJoinScreen() {
  document.getElementById('btn-join-back').addEventListener('click', () => {
    switchScreen('menu');
  });

  document.getElementById('btn-join-private').addEventListener('click', () => {
    // 清空输入
    document.getElementById('input-invite-code').value = '';
    document.getElementById('input-join-password').value = '';
    document.getElementById('join-private-error').textContent = '';
    switchScreen('join-private');
  });
}

/**
 * 初始化加入私有房间界面逻辑
 */
function initJoinPrivateScreen() {
  const btnBack = document.getElementById('btn-join-private-back');
  const btnConfirm = document.getElementById('btn-join-private-confirm');
  const errorEl = document.getElementById('join-private-error');

  btnBack.addEventListener('click', () => {
    switchScreen('join');
  });

  btnConfirm.addEventListener('click', () => {
    const inviteCode = document.getElementById('input-invite-code').value.trim().toUpperCase();
    const password = document.getElementById('input-join-password').value;

    if (!inviteCode) {
      errorEl.textContent = '请输入邀请码';
      return;
    }

    errorEl.textContent = '';
    joinPrivateRoom(inviteCode, password);
  });
}

/**
 * 更新游戏界面UI（房间名、玩家列表、邀请码等）
 */
function updateGameUI() {
  // 房间名称
  document.getElementById('game-room-name').textContent = gameState.room.name;

  // 玩家列表
  const playersListEl = document.getElementById('game-players-list');
  playersListEl.innerHTML = '';
  gameState.players.forEach(player => {
    const item = document.createElement('div');
    item.className = 'player-item';

    const nameSpan = document.createElement('span');
    nameSpan.textContent = player.nickname + '#' + (player.digitalId || '');

    const dot = document.createElement('span');
    dot.className = 'player-dot';
    dot.style.backgroundColor = PLAYER_COLORS_SOLID[player.colorIndex];

    item.appendChild(nameSpan);

    // 房主标识
    if (player.id === gameState.players[0]?.id) {
      const badge = document.createElement('span');
      badge.className = 'host-badge';
      badge.textContent = '👑';
      item.appendChild(badge);
    }

    item.appendChild(dot);
    playersListEl.appendChild(item);
  });

  // 邀请码
  document.getElementById('game-invite-code').textContent = '邀请码：' + gameState.room.inviteCode;

  // 开始游戏按钮（仅房主且>=2人时显示）
  const startBtn = document.getElementById('btn-start-game');
  if (gameState.isHost && gameState.players.length >= 2) {
    startBtn.style.display = 'block';
  } else {
    startBtn.style.display = 'none';
  }
}

/**
 * 初始化游戏界面逻辑
 */
// 聊天是否激活标志
let chatActive = false;

function initGameScreen() {
  document.getElementById('btn-start-game').addEventListener('click', () => {
    showModal('游戏即将开始！', 'alert');
  });

  // 退出房间按钮
  document.getElementById('btn-leave-room').addEventListener('click', () => {
    if (gameState.isHost) {
      // 房主退出：销毁房间
      destroyRoom();
    } else {
      // 普通玩家退出
      leaveRoom();
    }
  });

  // 聊天输入框事件
  const chatInput = document.getElementById('chat-input');

  // 回车发送聊天消息
  chatInput.addEventListener('keydown', (e) => {
    e.stopPropagation(); // 阻止事件冒泡到地图
    if (e.key === 'Enter') {
      const message = chatInput.value.trim();
      if (message) {
        sendChatMessage(message);
      }
      // 发送后隐藏输入框
      chatInput.style.display = 'none';
      chatInput.value = '';
      chatActive = false;
    } else if (e.key === 'Escape') {
      // ESC取消聊天
      chatInput.style.display = 'none';
      chatInput.value = '';
      chatActive = false;
    }
  });

  // 聊天输入框获焦时禁止地图交互
  chatInput.addEventListener('focus', () => {
    chatActive = true;
  });
  chatInput.addEventListener('blur', () => {
    chatActive = false;
  });

  // 取消加入按钮
  document.getElementById('btn-cancel-join').addEventListener('click', () => {
    cancelJoinRoom();
  });
}

/**
 * 激活聊天输入框
 */
function activateChat() {
  const chatInput = document.getElementById('chat-input');
  chatInput.style.display = 'block';
  chatInput.focus();
  chatActive = true;
}

/**
 * 取消聊天输入
 */
function deactivateChat() {
  const chatInput = document.getElementById('chat-input');
  chatInput.style.display = 'none';
  chatInput.value = '';
  chatActive = false;
}

/**
 * 添加聊天消息到聊天区域
 * @param {string} senderNickname - 发送者昵称
 * @param {string} senderDigitalId - 发送者数字ID
 * @param {string} message - 消息内容
 */
function addChatMessage(senderNickname, senderDigitalId, message) {
  const chatMessages = document.getElementById('chat-messages');
  if (!chatMessages) return;

  const msgEl = document.createElement('div');
  msgEl.className = 'chat-msg';
  msgEl.textContent = senderNickname + '#' + (senderDigitalId || '') + ': ' + message;
  chatMessages.appendChild(msgEl);

  // 自动滚动到底部
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

/**
 * 显示 Toast 提示消息（游戏界面内使用，兼容旧调用）
 * @param {string} message - 提示内容
 */
function showToast(message) {
  showToastGlobal(message);
}

/**
 * 初始化所有界面
 */
function initAllScreens() {
  initStartScreen();
  initRegisterScreen();
  initMenuScreen();
  initRoomSettingsScreen();
  initJoinScreen();
  initJoinPrivateScreen();
  initGameScreen();
}
