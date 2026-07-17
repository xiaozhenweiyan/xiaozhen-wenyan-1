/**
 * map.js - 2D方块地图渲染引擎
 * 使用 HTML5 Canvas 绘制像素风格的领地地图
 */

// 视口状态
const viewport = {
  x: 0,           // 视口偏移X
  y: 0,           // 视口偏移Y
  dragging: false, // 是否正在拖拽
  dragStartX: 0,   // 拖拽起始鼠标X
  dragStartY: 0,   // 拖拽起始鼠标Y
  dragOffsetX: 0,  // 拖拽起始视口偏移X
  dragOffsetY: 0,  // 拖拽起始视口偏移Y
};

// 海水波浪动画计数器
let waveCounter = 0;
let waveFrameCount = 0; // 用于减速波浪动画

// Canvas 和上下文引用
let canvas = null;
let ctx = null;

// 点击与拖拽区分标志
let clickStartX = 0;
let clickStartY = 0;
let isDragAction = false;

// 是否已初始化事件监听（防止重复绑定）
let mapEventsInitialized = false;

// 草地颜色预设（多种深浅绿色）
const GRASS_COLORS = [
  '#4a8c3f', '#5a9c4f', '#3a7c2f', '#4e9044', '#56994c',
  '#3f8033', '#529a48', '#47883a', '#5da055', '#3c7a2d',
];

// 海水颜色预设
const SEA_COLORS = ['#2980b9', '#3498db', '#2471a3', '#2e86c1'];

// 海水浅色（波浪高亮）
const SEA_LIGHT_COLORS = ['#5dade2', '#85c1e9', '#4aa3df', '#6cb4e4'];

/**
 * 初始化地图引擎
 */
function initMap() {
  canvas = document.getElementById('game-canvas');
  ctx = canvas.getContext('2d');

  // 设置Canvas尺寸为窗口大小
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // 只绑定一次事件
  if (!mapEventsInitialized) {
    mapEventsInitialized = true;

    // 鼠标拖拽与点击区分
    canvas.addEventListener('mousedown', onMapMouseDown);
    canvas.addEventListener('mousemove', onMapMouseMove);
    canvas.addEventListener('mouseup', onMapMouseUp);
    canvas.addEventListener('mouseleave', onMapMouseUp);

    // 触摸拖拽事件（移动端支持）
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd);

    // 点击领地
    canvas.addEventListener('click', onCanvasClick);
  }

  // 居中视口
  centerViewport();

  // 开始渲染循环
  requestAnimationFrame(renderLoop);
}

/**
 * 重新绑定Canvas事件（兼容旧调用）
 * 现在不再需要，因为事件只绑定一次
 */
function rebindCanvasEvents() {
  // 已在 initMap 中绑定，此函数保留为空以兼容调用
}

/**
 * 调整Canvas尺寸
 */
function resizeCanvas() {
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

/**
 * 居中视口到地图中央
 */
function centerViewport() {
  const mapPixelW = gameState.mapWidth * gameState.tileSize;
  const mapPixelH = gameState.mapHeight * gameState.tileSize;
  viewport.x = (mapPixelW - window.innerWidth) / 2;
  viewport.y = (mapPixelH - window.innerHeight) / 2;
}

/**
 * 获取指定位置的方块类型
 * @param {number} x - 方块列坐标
 * @param {number} y - 方块行坐标
 * @returns {string} 'sea' | 'grass'
 */
function getTileType(x, y) {
  const waterBorder = 3; // 海水环绕3格宽
  if (x < waterBorder || x >= gameState.mapWidth - waterBorder ||
      y < waterBorder || y >= gameState.mapHeight - waterBorder) {
    return 'sea';
  }
  return 'grass';
}

/**
 * 伪随机数生成（基于坐标，保证同一位置颜色一致）
 */
function tileRandom(x, y, seed) {
  let h = seed + x * 374761393 + y * 668265263;
  h = (h ^ (h >> 13)) * 1274126177;
  h = h ^ (h >> 16);
  return (h & 0x7fffffff) / 0x7fffffff;
}

/**
 * 绘制单个方块
 * @param {number} x - 方块列坐标
 * @param {number} y - 方块行坐标
 */
function drawTile(x, y) {
  const ts = gameState.tileSize;
  const px = x * ts - viewport.x;
  const py = y * ts - viewport.y;

  // 视口裁剪：只绘制可见方块
  if (px + ts < 0 || px > canvas.width || py + ts < 0 || py > canvas.height) {
    return;
  }

  const tileType = getTileType(x, y);
  const r = tileRandom(x, y, 42);

  if (tileType === 'sea') {
    // 海水方块，带波浪动画
    const colorIdx = Math.floor(r * SEA_COLORS.length);
    const waveR = tileRandom(x, y, waveCounter);
    if (waveR < 0.12) {
      // 波浪高亮效果
      const lightIdx = Math.floor(tileRandom(x, y, waveCounter + 100) * SEA_LIGHT_COLORS.length);
      ctx.fillStyle = SEA_LIGHT_COLORS[lightIdx];
    } else {
      ctx.fillStyle = SEA_COLORS[colorIdx];
    }
  } else {
    // 草地方块
    const colorIdx = Math.floor(r * GRASS_COLORS.length);
    ctx.fillStyle = GRASS_COLORS[colorIdx];
  }

  ctx.fillRect(px, py, ts, ts);

  // 绘制微妙的网格线（像素风格）
  ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
  ctx.fillRect(px, py + ts - 1, ts, 1);
  ctx.fillRect(px + ts - 1, py, 1, ts);
}

/**
 * 绘制领地
 */
function drawTerritories() {
  const ts = gameState.tileSize;

  for (const [key, territory] of Object.entries(gameState.territories)) {
    const [x, y] = key.split(',').map(Number);
    const px = x * ts - viewport.x;
    const py = y * ts - viewport.y;

    // 视口裁剪
    if (px + ts < 0 || px > canvas.width || py + ts < 0 || py > canvas.height) {
      continue;
    }

    // 半透明领地颜色
    ctx.fillStyle = territory.color;
    ctx.fillRect(px, py, ts, ts);

    // 领地边框
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(px + 0.5, py + 0.5, ts - 1, ts - 1);
  }
}

/**
 * 主渲染函数
 */
function render() {
  if (!ctx) return;

  // 清除画布
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 绘制所有方块
  for (let y = 0; y < gameState.mapHeight; y++) {
    for (let x = 0; x < gameState.mapWidth; x++) {
      drawTile(x, y);
    }
  }

  // 绘制领地
  drawTerritories();
}

/**
 * 渲染循环
 */
function renderLoop() {
  // 减速波浪动画：每15帧更新一次
  waveFrameCount++;
  if (waveFrameCount >= 15) {
    waveFrameCount = 0;
    waveCounter++;
  }

  render();
  requestAnimationFrame(renderLoop);
}

/**
 * 鼠标按下 - 开始拖拽，记录点击起始位置
 */
function onMapMouseDown(e) {
  clickStartX = e.clientX;
  clickStartY = e.clientY;
  isDragAction = false;
  viewport.dragging = true;
  viewport.dragStartX = e.clientX;
  viewport.dragStartY = e.clientY;
  viewport.dragOffsetX = viewport.x;
  viewport.dragOffsetY = viewport.y;
}

/**
 * 鼠标移动 - 拖拽移动视口
 */
function onMapMouseMove(e) {
  if (!viewport.dragging) return;
  const dx = e.clientX - viewport.dragStartX;
  const dy = e.clientY - viewport.dragStartY;
  // 如果移动超过5像素，视为拖拽而非点击
  if (Math.abs(e.clientX - clickStartX) > 5 || Math.abs(e.clientY - clickStartY) > 5) {
    isDragAction = true;
  }
  viewport.x = viewport.dragOffsetX - dx;
  viewport.y = viewport.dragOffsetY - dy;
}

/**
 * 鼠标松开 - 结束拖拽
 */
function onMapMouseUp(e) {
  viewport.dragging = false;
}

/**
 * 触摸开始
 */
function onTouchStart(e) {
  e.preventDefault();
  const touch = e.touches[0];
  viewport.dragging = true;
  viewport.dragStartX = touch.clientX;
  viewport.dragStartY = touch.clientY;
  viewport.dragOffsetX = viewport.x;
  viewport.dragOffsetY = viewport.y;
}

/**
 * 触摸移动
 */
function onTouchMove(e) {
  e.preventDefault();
  if (!viewport.dragging) return;
  const touch = e.touches[0];
  const dx = touch.clientX - viewport.dragStartX;
  const dy = touch.clientY - viewport.dragStartY;
  viewport.x = viewport.dragOffsetX - dx;
  viewport.y = viewport.dragOffsetY - dy;
}

/**
 * 触摸结束
 */
function onTouchEnd() {
  viewport.dragging = false;
}

/**
 * Canvas 点击 - 创建或移动领地（每人只能拥有一块领地）
 */
function onCanvasClick(e) {
  // 如果是拖拽操作，不处理点击
  if (isDragAction) return;

  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  // 计算点击的方块坐标
  const tileX = Math.floor((mouseX + viewport.x) / gameState.tileSize);
  const tileY = Math.floor((mouseY + viewport.y) / gameState.tileSize);

  // 检查边界
  if (tileX < 0 || tileX >= gameState.mapWidth || tileY < 0 || tileY >= gameState.mapHeight) {
    return;
  }

  // 只能在草地上创建领地
  if (getTileType(tileX, tileY) !== 'grass') {
    return;
  }

  const key = tileX + ',' + tileY;

  // 已被其他玩家占领的方块：不可选择
  if (gameState.territories[key]) {
    return;
  }

  // 获取当前玩家
  const currentPlayer = getCurrentPlayer();
  if (!currentPlayer) return;

  // 检查当前玩家是否已有领地
  const oldKey = gameState.playerTerritoryMap[currentPlayer.id];

  if (oldKey) {
    // 玩家已有领地，执行移动操作
    // 如果点击的就是自己的领地，不做操作
    if (oldKey === key) return;

    // 删除旧领地
    delete gameState.territories[oldKey];

    // 创建新领地
    const territoryData = {
      owner: currentPlayer.id,
      color: currentPlayer.color,
    };
    gameState.territories[key] = territoryData;

    // 更新玩家领地映射
    gameState.playerTerritoryMap[currentPlayer.id] = key;

    // 显示 Toast 提示
    showToast('你的领地已移动到新位置');

    // 通知其他玩家领地移动
    onTerritoryMove(oldKey, key, territoryData);
  } else {
    // 玩家首次选择领地
    const territoryData = {
      owner: currentPlayer.id,
      color: currentPlayer.color,
    };
    gameState.territories[key] = territoryData;

    // 在 playerTerritoryMap 中记录
    gameState.playerTerritoryMap[currentPlayer.id] = key;

    // 通知其他玩家（网络模块）
    onTerritoryChange(key, territoryData);
  }
}
