/**
 * main.js - 主入口逻辑
 * 初始化所有模块，启动游戏
 */

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', () => {
  // 注意：临时账户数据（数字ID）不持久化，但公共房间列表需要共享给多标签页
  // 因此这里不再清除 pixel_territory_rooms，只由页面关闭时清理

  // 初始化所有界面的事件监听
  initAllScreens();

  // 显示开始界面
  switchScreen('start');

  console.log('像素领地争夺战 已启动');
});

// 页面关闭前销毁临时账户数据
window.onbeforeunload = () => {
  // 清除临时数据，不持久化数字ID和房间信息
  // 公共房间列表也在这里清理，因为是当前页面的临时房间
  localStorage.removeItem('pixel_territory_rooms');
  localStorage.removeItem('pixel_territory_invite_codes');
};
