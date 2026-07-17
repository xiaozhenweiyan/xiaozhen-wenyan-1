# Tasks

- [ ] Task 1: 初始化项目结构，搭建基础 HTML/CSS/JS 框架
  - [ ] SubTask 1.1: 创建项目目录结构（index.html, css/, js/, assets/）
  - [ ] SubTask 1.2: 创建 index.html 主入口文件，引入 PeerJS CDN 和像素字体
  - [ ] SubTask 1.3: 创建全局样式文件，定义像素风格 CSS 变量和基础样式
  - [ ] SubTask 1.4: 创建游戏状态管理模块 js/state.js

- [ ] Task 2: 实现开始界面和临时账户注册
  - [ ] SubTask 2.1: 实现开始界面（游戏标题 + 开始游戏按钮），像素风格
  - [ ] SubTask 2.2: 实现临时账户注册界面（昵称输入 + 确认按钮 + 验证）
  - [ ] SubTask 2.3: 实现界面切换逻辑（开始 → 注册 → 主菜单）

- [ ] Task 3: 实现主菜单界面
  - [ ] SubTask 3.1: 实现主菜单界面（创建房间 + 加入房间按钮）

- [ ] Task 4: 实现房间设置界面
  - [ ] SubTask 4.1: 实现房间设置界面（房间名字、公有/私有、密码、邀请码生成）
  - [ ] SubTask 4.2: 实现邀请码生成逻辑（XXXXX-XX 格式，大写英文+数字随机）
  - [ ] SubTask 4.3: 实现公有/私有切换时密码输入框的显示/隐藏
  - [ ] SubTask 4.4: 实现表单验证（房间名字必填等）

- [ ] Task 5: 实现 2D 方块地图渲染
  - [ ] SubTask 5.1: 使用 HTML5 Canvas 实现方块地图渲染引擎
  - [ ] SubTask 5.2: 绘制草地和海水地图（中间草地，四周海水）
  - [ ] SubTask 5.3: 实现地图视口和拖拽/缩放交互

- [ ] Task 6: 实现领地创建系统
  - [ ] SubTask 6.1: 实现点击方块创建领地逻辑（半透明玩家颜色方块）
  - [ ] SubTask 6.2: 实现领地数据结构和管理（玩家颜色分配、领地归属）
  - [ ] SubTask 6.3: 实现已占领方块不可覆盖逻辑

- [ ] Task 7: 实现加入房间功能
  - [ ] SubTask 7.1: 实现公共房间列表界面（返回按钮 + 房间列表 + 加入私有房间按钮）
  - [ ] SubTask 7.2: 实现私有房间加入界面（邀请码 + 密码输入 + 加入按钮）

- [ ] Task 8: 实现 PeerJS 多人联机系统
  - [ ] SubTask 8.1: 实现房主端 PeerJS 连接管理（创建 Peer、监听连接、同步房间信息）
  - [ ] SubTask 8.2: 实现客户端 PeerJS 连接（通过邀请码连接到房主）
  - [ ] SubTask 8.3: 实现地图状态实时同步（领地变化同步到所有玩家）
  - [ ] SubTask 8.4: 实现玩家列表同步和房主标识
  - [ ] SubTask 8.5: 实现开始游戏按钮显示逻辑（≥2人时房主可见）

- [ ] Task 9: 上传到 GitHub 并部署 GitHub Pages
  - [ ] SubTask 9.1: 初始化 Git 仓库，提交所有代码
  - [ ] SubTask 9.2: 创建 GitHub 远程仓库并推送代码
  - [ ] SubTask 9.3: 启用 GitHub Pages 静态网页托管

# Task Dependencies
- [Task 2] depends on [Task 1]
- [Task 3] depends on [Task 2]
- [Task 4] depends on [Task 3]
- [Task 5] depends on [Task 4]
- [Task 6] depends on [Task 5]
- [Task 7] depends on [Task 3]
- [Task 8] depends on [Task 4] and [Task 7]
- [Task 9] depends on [Task 8]
