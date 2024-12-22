import { Toast } from "@douyinfe/semi-ui";
import WKSDK, { Channel, ChannelTypePerson, MessageContent, Setting } from "wukongimjssdk";
import WKApp from "../App";

export class ChannelSettingManager {
  private static _shared: ChannelSettingManager;
  static get shared() {
    if (!this._shared) {
      this._shared = new ChannelSettingManager();
    }
    return this._shared;
  }

  // 发送系统消息到群
  async sendSystemMessage(channel: Channel, content: string) {
    const message = new MessageContent();
    message.contentObj = content;
    message.contentType = 1000; // 系统消息类型 
    let setting = new Setting()
    if (setting.receiptEnabled) {
      setting.receiptEnabled = true
    }
    await WKSDK.shared().chatManager.send(message, channel, setting);
  }

  mute(v: boolean, channel: Channel): Promise<void> {
    return this._onSetting({ mute: v ? 1 : 0 }, channel);
  }

  top(v: boolean, channel: Channel): Promise<void> {
    return this._onSetting({ top: v ? 1 : 0 }, channel);
  }

  save(v: boolean, channel: Channel): Promise<void> {
    return this._onSetting({ save: v ? 1 : 0 }, channel);
  }

  inviteConfirm(v: boolean, channel: Channel): Promise<void> {
    return this._onSetting({ invite: v ? 1 : 0 }, channel);
  }

  invite(v: boolean, channel: Channel): Promise<void> {
    return this._onSetting({ invite: v ? 1 : 0 }, channel);
  }

  // 消息回执
  receipt(v: boolean, channel: Channel): Promise<void> {
    return this._onSetting({ receipt: v ? 1 : 0 }, channel);
  }

  // 允许群成员查看历史消息
  allowViewHistoryMsg(v: boolean, channel: Channel): Promise<void> {
    return this._onSetting({ allow_view_history_msg: v ? 1 : 0 }, channel);
  }

  // 频道禁言
  forbidden(v: boolean, channel: Channel): Promise<void> {
    return this._onSetting({ forbidden: v ? 1 : 0 }, channel);
  }

  // 禁止互加好友
  forbiddenAddFriend(v: boolean, channel: Channel): Promise<void> {
    return this._onSetting({ forbidden_add_friend: v ? 1 : 0 }, channel);
  }

  // 允许群成员置顶消息
  allowTopMessage(v: boolean, channel: Channel): Promise<void> {
    return this._onSetting({ allow_member_pinned_message: v ? 1 : 0 }, channel);
  }

  // 设置管理员
  addManager(uids: string[], channel: Channel): Promise<void> {
    return this._onAddManager(uids, channel);
  }

  // 移除管理员
  removeManager(uids: string[], channel: Channel): Promise<void> {
    return this._onRemoveManager(uids, channel);
  }

  // 转移群主
  transferOwner(uid: string, channel: Channel): Promise<void> {
    return this._onTransferOwner(uid, channel);
  }

  // 设置成员禁言
  muteSubscriber(groupNo: string, params: any, channel: Channel): Promise<void> {
    // // 获取被禁言用户信息
    // const userChannel = new Channel(params.member_uid, ChannelTypePerson);
    // const userInfo = WKSDK.shared().channelManager.getChannelInfo(userChannel);
    // const userName = userInfo?.title || params.member_uid;

    // // 获取操作者信息
    // const operatorName = WKApp.loginInfo.name;

    // // 根据action发送不同的系统消息
    // if(params.action === 1) { // 禁言
    //   this.sendSystemMessage(
    //     channel,
    //     `群成员"${userName}"被管理员"${operatorName}"禁言一分钟`
    //   );
    // } else { // 解除禁言
    //   this.sendSystemMessage(
    //     channel,
    //     `群成员"${userName}"被管理员"${operatorName}"解除禁言`
    //   );
    // }
    return this._onMuteSubscriber(groupNo, params);
  }

  // 获取成员禁言状态
  getSubscriberMuteInfo(): Promise<void> {
    return this._onGetSubscriberMuteInfo();
  }

  // 清除置顶消息
  clearPinnedMessage(channel: Channel): Promise<void> {
    return this._onClearPinnedMessage(channel);
  }

  // 解散群
  groupDisband(channel: Channel): Promise<void> {
    return this._onGroupDisband(channel);
  }

  _onSetting(setting: any, channel: Channel): Promise<void> {
    return WKApp.dataSource.channelDataSource
      .updateSetting(setting, channel)
      .catch((err) => {
        Toast.error(err.msg);
      });
  }

  _onAddManager(uids: string[], channel: Channel): Promise<void> {
    return WKApp.dataSource.channelDataSource
      .managerAdd(channel, uids)
      .catch((err) => {
        Toast.error(err.msg);
      });
  }

  _onRemoveManager(uids: string[], channel: Channel): Promise<void> {
    return WKApp.dataSource.channelDataSource
      .managerRemove(channel, uids)
      .catch((err) => {
        Toast.error(err.msg);
      });
  }

  _onTransferOwner(uid: string, channel: Channel): Promise<void> {
    return WKApp.dataSource.channelDataSource
      .channelTransferOwner(channel, uid)
      .catch((err) => {
        Toast.error(err.msg);
      });
  }

  _onMuteSubscriber(groupNo: string, params: any): Promise<void> {
    return WKApp.dataSource.channelDataSource
      .muteSubscriber(groupNo, params)
      .catch((err) => {
        Toast.error(err.msg);
      });
  }

  _onGetSubscriberMuteInfo(): Promise<void> {
    return WKApp.dataSource.channelDataSource
      .getSubscriberMuteInfo()
      .catch((err) => {
        Toast.error(err.msg);
      });
  }

  _onClearPinnedMessage(channel: Channel): Promise<void> {
    return WKApp.dataSource.channelDataSource
      .clearPinnedMessage(channel)
      .catch((err) => {
        Toast.error(err.msg);
      });
  }

  _onGroupDisband(channel: Channel): Promise<void> {
    return WKApp.dataSource.channelDataSource
      .groupDisband(channel)
      .catch((err) => {
        Toast.error(err.msg);
      });
  }
}
