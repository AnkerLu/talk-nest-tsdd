// 群类型
export const SuperGroup = 1; // 超级群

// 群状态
export const GroupStatus = {
  BLOCKED: 0, // 已封禁
  NORMAL: 1, // 正常
  DISBANDED: 2, // 已解散
} as const;

// 群成员角色
export const GroupRole = {
  NORMAL: 0, // 普通成员
  OWNER: 1, // 群主
  ADMIN: 2, // 管理员
} as const;

// 群成员禁言状态
export const GroupForbidden = {
  NORMAL: 0, // 正常
  FORBIDDEN: 1, // 全员禁言
} as const;

// 性别
export const Sex = {
  FEMALE: 0, // 女
  MALE: 1, // 男
} as const;
