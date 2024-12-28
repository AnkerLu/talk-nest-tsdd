import { ChannelInfo } from "wukongimjssdk";

// 获取离线时间显示文本
export function getOfflineTimeText(lastOffline: number): string {
  const nowTime = new Date().getTime() / 1000;
  const btwTime = nowTime - lastOffline;
  if (btwTime < 60) {
    return "刚刚离线";
  }
  if (btwTime < 3600) {
    return `${Math.floor(btwTime / 60)}分钟前离线`;
  }
  if (btwTime < 86400) {
    return `${Math.floor(btwTime / 3600)}小时前离线`;
  }
  // 超过一天显示具体日期
  const date = new Date(lastOffline * 1000);
  return `最后在线 ${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// 是否需要显示在线状态
export function needShowOnlineStatus(channelInfo?: ChannelInfo): boolean {
  if (!channelInfo) {
    return false;
  }
  // if (channelInfo.online) {
  //   return true;
  // }
  // const nowTime = new Date().getTime() / 1000;
  // const btwTime = nowTime - channelInfo.lastOffline;
  // if (btwTime > 0 && btwTime < 60 * 60) {
  //   // 小于1小时才显示
  //   return true;
  // }
  return true;
}
