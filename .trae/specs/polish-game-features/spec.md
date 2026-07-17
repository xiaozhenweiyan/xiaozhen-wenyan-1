# 游戏功能优化与修复 Spec

## Why
用户发现残留无用房间未清理、加入房间速度慢、需要聊天功能、需要数字ID替代纯昵称、所有提示框应使用自定义UI而非浏览器原生alert。

## What Changes
- 自动清理 localStorage 中残留的无人/无用房间
- 房间列表每个房间旁边加"加入"按钮 + 加入时显示"正在加入"加载画面
- 优化加入房间速度（分析 PeerJS 连接瓶颈）
- 右下角新增聊天区域，按T键输入消息发送
- 昵称可重复但数字ID不可重复；注册时自动生成数字ID，退出时销毁临时账户
- 所有 alert() 替换为自定义像素风格 Modal/Toast 提示框

## Impact
- Affected code: js/state.js（数字ID生成、房间清理、账户管理）、js/screens.js（加入按钮、加载画面、聊天UI、Modal组件）、js/network.js（聊天消息同步、连接优化、房间清理）、js/map.js（键盘监听）、index.html（聊天区域、Modal容器、加载画面）、css/style.css（聊天样式、Modal样式、加载画面样式）

## MODIFIED Requirements

### Requirement: 自动清理残留房间
系统 SHALL 在有玩家在线时自动清理 localStorage 中无人或无用的残留房间。

#### Scenario: 进入加入房间界面时清理
- **WHEN** 用户进入加入房间界面
- **THEN** 系统检查 localStorage 中的公共房间列表，移除所有无法连接的房间（尝试连接失败即视为无用），移除人数为0的房间

#### Scenario: 定期清理
- **WHEN** 游戏运行期间
- **THEN** 每次刷新房间列表时自动清理无用房间

### Requirement: 房间列表加入按钮与加载画面
系统 SHALL 在每个房间卡片旁提供明确的"加入"按钮，并显示加载画面。

#### Scenario: 房间卡片加入按钮
- **WHEN** 用户浏览公共房间列表
- **THEN** 每个房间卡片右侧有一个像素风格的"加入"按钮，点击后才触发加入流程（而非点击整个卡片）

#### Scenario: 正在加入加载画面
- **WHEN** 用户点击加入按钮后
- **THEN** 显示"正在加入房间..."的加载画面（像素风格动画），直到连接成功或失败

#### Scenario: 加入失败
- **WHEN** 连接失败时
- **THEN** 加载画面消失，使用自定义Modal提示"连接失败"而非alert

### Requirement: 聊天区域
系统 SHALL 在游戏界面右下角提供聊天区域。

#### Scenario: 聊天区域显示
- **WHEN** 用户进入游戏界面
- **THEN** 右下角显示聊天区域，包含消息列表和输入框

#### Scenario: 按T键发送消息
- **WHEN** 用户在游戏中按T键
- **THEN** 聊天输入框激活/聚焦，用户输入消息后按回车发送

#### Scenario: 聊天消息同步
- **WHEN** 玩家发送聊天消息
- **THEN** 消息通过PeerJS同步到所有玩家，显示格式为"[昵称#数字ID]: 消息内容"

#### Scenario: 按ESC取消输入
- **WHEN** 用户在聊天输入中按ESC
- **THEN** 取消输入，关闭聊天输入框

### Requirement: 数字ID与临时账户
系统 SHALL 为每个临时账户生成唯一数字ID，退出时自动销毁。

#### Scenario: 注册时生成数字ID
- **WHEN** 用户注册临时账户时
- **THEN** 自动生成一个唯一数字ID（格式如 #1234），昵称可重复但数字ID不会重复

#### Scenario: 显示数字ID
- **WHEN** 界面中显示玩家信息时
- **THEN** 格式为"昵称#数字ID"，如"小明#1234"

#### Scenario: 退出销毁账户
- **WHEN** 用户退出游戏/关闭页面时
- **THEN** 临时账户自动销毁，数字ID回收

#### Scenario: 主菜单显示数字ID
- **WHEN** 用户在主菜单中
- **THEN** 显示"昵称#数字ID"

### Requirement: 自定义提示框
系统 SHALL 使用自定义像素风格 Modal/Toast 替代所有浏览器原生 alert/prompt/confirm。

#### Scenario: 所有提示使用自定义UI
- **WHEN** 任何需要提示的场景
- **THEN** 使用像素风格的 Modal（模态框）或 Toast（短暂提示），不使用浏览器原生 alert/prompt/confirm

#### Scenario: Modal确认框
- **WHEN** 需要用户确认操作时（如房主退出确认）
- **THEN** 显示像素风格的 Modal 确认框，包含"确认"和"取消"按钮

#### Scenario: Modal提示框
- **WHEN** 需要通知用户信息时（如连接失败、房间不存在）
- **THEN** 显示像素风格的 Modal 提示框，包含"确定"按钮

### Requirement: 加入房间速度优化
系统 SHALL 优化PeerJS连接速度。

#### Scenario: 连接优化
- **WHEN** 用户加入房间时
- **THEN** 尽量减少PeerJS连接等待时间，优先使用 PeerJS 的 reliable 连接模式，在连接建立前显示加载画面
