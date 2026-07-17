/**
 * main.js - 主入口逻辑
 * 初始化所有模块，启动游戏
 */

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', () => {
  // 初始化所有界面的事件监听
  initAllScreens();

  // 显示开始界面
  switchScreen('start');

  console.log('像素领地争夺战 已启动');
});
