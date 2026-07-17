/**
 * main.js - 主入口逻辑
 * 初始化所有模块，启动游戏
 */

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', () => {
  // 清除旧版 localStorage 数据（临时账户不持久化）
  localStorage.removeItem('pixel_territory_rooms');
  localStorage.removeItem('pixel_territory_invite_codes');

  // 初始化所有界面的事件监听
  initAllScreens();

  // 显示开始界面
  switchScreen('start');

  console.log('像素领地争夺战 已启动');
});

// 页面关闭前销毁临时账户数据
window.onbeforeunload = () => {
  // 清除临时数据，不持久化数字ID和房间信息
  localStorage.removeItem('pixel_territory_rooms');
  localStorage.removeItem('pixel_territory_invite_codes');
};
