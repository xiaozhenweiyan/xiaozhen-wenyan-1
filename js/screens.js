/**
 * screens.js - 界面切换和UI逻辑
 * 管理所有界面的显示/隐藏和交互逻辑
 */

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
    // 更新主菜单昵称显示
    document.getElementById('display-nickname').textContent = nickname;
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
    // 生成邀请码
    gameState.room.inviteCode = generateInviteCode();
    document.getElementById('display-invite-code').textContent = gameState.room.inviteCode;
    // 重置房间设置
    gameState.room.name = '';
    gameState.room.isPublic = true;
    gameState.room.password = '';
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

  // 返回按钮
  btnBack.addEventListener('click', () => {
    switchScreen('menu');
  });

  // 确认按钮 - 创建房间
  btnConfirm.addEventListener('click', () => {
    const roomName = document.getElementById('input-room-name').value.trim();
    if (!roomName) {
      errorEl.textContent = '请输入房间名字';
      return;
    }
    errorEl.textContent = '';
    gameState.room.name = roomName;
    gameState.room.password = document.getElementById('input-room-password').value;
    gameState.isHost = true;

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
        <span class="room-card-name">${escapeHtml(room.name)}</span>
        <span class="room-card-players">${room.playerCount}人</span>
      `;
      card.addEventListener('click', () => {
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
    nameSpan.textContent = player.nickname;

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
function initGameScreen() {
  document.getElementById('btn-start-game').addEventListener('click', () => {
    alert('游戏即将开始！');
  });
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
