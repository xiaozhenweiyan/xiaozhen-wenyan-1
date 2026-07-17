# 游戏功能修复与增强 Spec

## Why
用户反馈6项问题：聊天消息跨房间泄漏、缺少刷新和复制按钮、右上角信息需要整合为房间详情面板、房间列表需要搜索功能且存在公共房间不可见bug（main.js无条件清除localStorage导致）、邀请码系统需要简化为直接输入房间ID。

## What Changes
- **BREAKING**: 邀请码系统简化，直接输入房间ID即可加入，不再使用复杂邀请码格式
- 聊天历史存储在房主端内存中，新玩家加入时同步历史消息，房间销毁时清空
- 加入房间界面添加刷新按钮
- 创建房间时添加复制邀请码（房间ID）按钮
- 游戏界面右上角替换为"房间详情"按钮，点击展开面板显示房间信息+复制按钮
- 房间列表添加搜索框（支持房间名和房间ID搜索，按ID字典序排序）
- 修复公共房间不可见bug（main.js不再无条件清除localStorage，改为智能清理）

## Impact
- Affected code: js/state.js（简化邀请码、房间ID即PeerID）、js/screens.js（刷新按钮、搜索框、房间详情面板、复制功能）、js/network.js（聊天历史同步、房间ID连接）、js/main.js（修复localStorage清理逻辑）、index.html（新增UI元素）、css/style.css（新增样式）

## MODIFIED Requirements

### Requirement: 简化邀请码为房间ID
系统 SHALL 使用房间ID直接作为连接标识，不再使用复杂邀请码格式。

#### Scenario: 创建房间
- **WHEN** 房主创建房间
- **THEN** 房间ID（如 RxxxxxYY）直接作为PeerID，邀请码显示为房间ID

#### Scenario: 加入房间
- **WHEN** 用户加入房间
- **THEN** 只需输入房间ID即可连接，不再需要完整邀请码格式

#### Scenario: 公共房间列表
- **WHEN** 浏览公共房间列表
- **THEN** 每个房间显示房间名、创建者、房间ID，右侧有加入按钮

### Requirement: 聊天历史同步（不跨房间保留）
系统 SHALL 房主端维护聊天历史，新玩家加入时同步，房间销毁时清空。

#### Scenario: 房主维护聊天历史
- **WHEN** 房主创建房间后
- **THEN** 内存中维护 chatHistory 数组（不存localStorage），记录所有聊天消息

#### Scenario: 新玩家加入同步历史
- **WHEN** 新玩家加入房间时
- **THEN** 房主在 welcome 消息中发送 chatHistory，客户端渲染所有历史消息

#### Scenario: 聊天不跨房间保留
- **WHEN** 房间销毁或玩家离开
- **THEN** 聊天历史随房间销毁而清空，不会出现在其他房间

### Requirement: 刷新按钮
系统 SHALL 在加入房间界面提供刷新按钮。

#### Scenario: 刷新房间列表
- **WHEN** 用户点击刷新按钮
- **THEN** 重新从 localStorage 读取并显示最新的公共房间列表

### Requirement: 复制邀请码按钮
系统 SHALL 在创建房间界面提供复制按钮。

#### Scenario: 创建房间时复制
- **WHEN** 用户在房间设置界面
- **THEN** 邀请码（房间ID）旁边有"复制"按钮，点击后复制到剪贴板并提示

### Requirement: 房间详情面板
系统 SHALL 在游戏界面提供房间详情面板。

#### Scenario: 显示房间详情
- **WHEN** 用户点击"房间详情"按钮
- **THEN** 弹出面板显示：房间名、房间ID、创建者、当前人数、剩余时间、邀请码（可一键复制）

#### Scenario: 关闭面板
- **WHEN** 用户点击面板外区域或关闭按钮
- **THEN** 面板关闭

### Requirement: 房间列表搜索
系统 SHALL 在公共房间列表提供搜索功能。

#### Scenario: 按房间名搜索
- **WHEN** 用户输入房间名关键词
- **THEN** 实时过滤显示匹配的房间（不区分大小写）

#### Scenario: 按房间ID搜索
- **WHEN** 用户输入房间ID
- **THEN** 实时过滤显示匹配的房间

#### Scenario: 搜索结果排序
- **WHEN** 显示搜索结果
- **THEN** 按房间ID字典序升序排列

### Requirement: 修复公共房间不可见bug
系统 SHALL 修复 main.js 中无条件清除 localStorage 导致公共房间不可见的问题。

#### Scenario: 多标签页共享房间
- **WHEN** 用户A在标签页1创建公共房间，用户B在标签页2打开游戏
- **THEN** 用户B应该能在公共房间列表中看到用户A创建的房间

#### Scenario: 智能清理
- **WHEN** 页面加载时
- **THEN** 只清理当前用户自己之前遗留的过期数据，不清理其他标签页正在使用的房间数据
