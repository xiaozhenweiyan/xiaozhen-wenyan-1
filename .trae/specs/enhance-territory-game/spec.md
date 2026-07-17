# 增强领地争夺战功能 Spec

## Why
用户需要修改领地机制（每人只能拥有一块领地）、增加房主退出销毁房间逻辑、增加退出房间按钮、修改邀请码格式为"房间名-房间ID-XXXXX-XX"。

## What Changes
- **BREAKING**: 领地机制从"无限占领"改为"每人只能拥有一块领地"，点击新位置时旧领地消失并提示
- 新增退出房间按钮，房主退出时销毁整个房间
- 房主退出/断开连接时自动销毁房间，通知所有玩家
- 邀请码格式从"XXXXX-XX"改为"房间名-房间ID-XXXXX-XX"，房间ID含时间戳确保唯一性
- 邀请码生成时检查重复（localStorage 已有邀请码列表）

## Impact
- Affected code: js/state.js（邀请码生成、房间ID）、js/map.js（领地创建逻辑）、js/network.js（房主退出销毁房间、退出按钮逻辑）、js/screens.js（退出按钮、提示消息）、index.html（退出按钮UI）、css/style.css（退出按钮样式）

## MODIFIED Requirements

### Requirement: 领地创建（每人一块）
系统 SHALL 限制每个玩家只能拥有一块领地。点击新位置时旧领地消失并显示提示。

#### Scenario: 玩家首次创建领地
- **WHEN** 玩家点击地图上的草地方块且当前没有领地
- **THEN** 该方块变为该玩家颜色的半透明领地

#### Scenario: 玩家移动领地
- **WHEN** 玩家已有领地并点击另一个空草地方块
- **THEN** 旧领地消失，新方块变为该玩家领地，显示提示"你的领地已移动到新位置"

#### Scenario: 玩家点击已被其他玩家占据的方块
- **WHEN** 玩家点击已被他人占据的方块
- **THEN** 不执行任何操作

### Requirement: 邀请码格式（房间名-房间ID-XXXXX-XX）
系统 SHALL 生成格式为"房间名-房间ID-XXXXX-XX"的邀请码，确保唯一性和防重复。

#### Scenario: 生成邀请码
- **WHEN** 房主创建房间时生成邀请码
- **THEN** 邀请码格式为 `房间名-房间ID-XXXXX-XX`
  - 房间名：用户输入的房间名（可重复）
  - 房间ID：含时间戳的唯一ID，不可能重复
  - XXXXX-XX：大写英文+数字随机后缀
- 邀请码不可修改

#### Scenario: 邀请码防重复
- **WHEN** 生成邀请码时
- **THEN** 检查 localStorage 中已有邀请码列表，确保不与现有邀请码重复；若后缀XXXXX-XX重复则重新生成

### Requirement: 退出房间按钮
系统 SHALL 在游戏界面提供"退出房间"按钮。

#### Scenario: 普通玩家退出房间
- **WHEN** 普通玩家点击"退出房间"按钮
- **THEN** 离开房间，返回主菜单，其他玩家收到该玩家离开通知

#### Scenario: 房主退出房间
- **WHEN** 房主点击"退出房间"按钮
- **THEN** 销毁房间，所有其他玩家收到"房间已销毁"通知并被踢回主菜单

### Requirement: 房主退出自动销毁房间
系统 SHALL 在房主退出或断开连接时自动销毁房间。

#### Scenario: 房主断开连接
- **WHEN** 房主的 PeerJS 连接意外断开
- **THEN** 所有其他玩家收到通知"房主已退出，房间已销毁"，被踢回主菜单

#### Scenario: 房间销毁清理
- **WHEN** 房间销毁时
- **THEN** 从 localStorage 公共房间列表中移除该房间，关闭所有 PeerJS 连接
