# 游戏功能优化与修复 Spec

## Why
用户需要清除所有残留数据、加入房间体验改进（加载画面+秒表+可退出）、聊天功能、数字ID系统、自定义提示框、房间1小时倒计时自动销毁机制。

## What Changes
- 首次加载时清除 localStorage 中所有残留房间和用户数据
- 房间创建时设置1小时倒计时，倒计时归零且有玩家在线时自动销毁该房间
- 临时账户退出即销毁
- 房间列表每个房间旁边加"加入"按钮 + 加载画面带秒表(30秒) + 可随时退出
- 右下角新增聊天区域，按T键输入消息发送
- 昵称可重复但数字ID不可重复；注册时自动生成数字ID
- 所有 alert() 替换为自定义像素风格 Modal/Toast 提示框

## Impact
- Affected code: js/state.js（数字ID、房间倒计时、数据清理）、js/screens.js（加入按钮、加载画面、聊天UI、Modal、秒表）、js/network.js（聊天同步、30秒超时、可退出连接）、js/map.js（键盘监听）、index.html（聊天区域、Modal、加载画面）、css/style.css（聊天样式、Modal、加载画面、秒表）

## MODIFIED Requirements

### Requirement: 清除残留数据
系统 SHALL 在页面首次加载时清除所有 localStorage 残留数据。

#### Scenario: 页面加载时清理
- **WHEN** 页面首次加载
- **THEN** 清除 localStorage 中所有 pixel_territory_rooms 和 pixel_territory_invite_codes 数据，确保无残留

### Requirement: 房间1小时倒计时自动销毁
系统 SHALL 为每个房间设置1小时倒计时，倒计时归零且有玩家在线时自动销毁。

#### Scenario: 创建房间时设置倒计时
- **WHEN** 房主创建房间
- **THEN** 房间设置1小时倒计时，倒计时存储在 gameState.room.expiresAt（创建时间+1小时的时间戳）

#### Scenario: 倒计时归零且有玩家在线
- **WHEN** 房间倒计时归零且当前有玩家在线
- **THEN** 自动销毁该房间，所有玩家收到通知"房间时间已到，房间已销毁"，被踢回主菜单

#### Scenario: 倒计时归零且无玩家在线
- **WHEN** 房间倒计时归零且无玩家在线（房主已离开）
- **THEN** 房间数据自动从 localStorage 清理

#### Scenario: 倒计时显示
- **WHEN** 玩家在游戏界面时
- **THEN** 显示剩余时间（格式如"剩余时间: 59:00"），每秒更新

#### Scenario: 同步倒计时
- **WHEN** 新玩家加入房间时
- **THEN** 房主在 welcome 消息中发送 expiresAt 时间戳，客户端同步显示倒计时

### Requirement: 临时账户退出销毁
系统 SHALL 在临时账户退出时自动销毁。

#### Scenario: 退出游戏销毁
- **WHEN** 用户退出房间/关闭页面
- **THEN** 临时账户自动销毁，数字ID不持久化

### Requirement: 房间列表加入按钮与加载画面
系统 SHALL 提供明确的加入按钮、加载画面（带秒表）、可随时退出连接。

#### Scenario: 加入按钮
- **WHEN** 用户浏览房间列表
- **THEN** 每个房间卡片右侧有"加入"按钮

#### Scenario: 加载画面带秒表
- **WHEN** 用户点击加入后
- **THEN** 显示加载画面，包含：
  - "正在加入房间..."文字
  - 30秒倒计时秒表（显示剩余秒数）
  - "取消"按钮可随时退出连接

#### Scenario: 30秒连接超时
- **WHEN** 连接尝试超过30秒
- **THEN** 自动取消连接，用自定义Modal提示"连接超时"

#### Scenario: 手动取消连接
- **WHEN** 用户点击"取消"按钮
- **THEN** 立即中止连接尝试，返回房间列表

### Requirement: 聊天区域
系统 SHALL 在游戏界面右下角提供聊天区域。

#### Scenario: 聊天区域显示
- **WHEN** 用户进入游戏界面
- **THEN** 右下角显示聊天区域，包含消息列表和输入框（默认隐藏）

#### Scenario: 按T键发送消息
- **WHEN** 用户按T键
- **THEN** 聊天输入框激活，输入消息按回车发送，格式"[昵称#数字ID]: 消息"

#### Scenario: 按ESC取消
- **WHEN** 用户在聊天输入中按ESC
- **THEN** 取消输入，隐藏输入框

#### Scenario: 聊天消息同步
- **WHEN** 玩家发送聊天消息
- **THEN** 通过PeerJS同步到所有玩家

### Requirement: 数字ID
系统 SHALL 为每个临时账户生成唯一数字ID。

#### Scenario: 注册生成数字ID
- **WHEN** 用户注册临时账户
- **THEN** 自动生成唯一数字ID（格式 #1000-#9999），昵称可重复但数字ID不会重复

#### Scenario: 显示格式
- **WHEN** 显示玩家信息
- **THEN** 格式为"昵称#数字ID"

### Requirement: 自定义提示框
系统 SHALL 使用自定义像素风格 Modal/Toast 替代所有浏览器原生 alert/prompt/confirm。

#### Scenario: 所有提示使用自定义UI
- **WHEN** 需要提示
- **THEN** 使用像素风格Modal（确认/提示）或Toast（短暂提示），不使用alert/confirm
