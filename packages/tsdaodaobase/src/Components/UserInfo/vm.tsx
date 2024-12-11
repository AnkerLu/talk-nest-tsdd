import { ChannelInfoListener, SubscriberChangeListener } from "wukongimjssdk";
import {
  Channel,
  ChannelInfo,
  ChannelTypePerson,
  WKSDK,
  Subscriber,
} from "wukongimjssdk";
import { Row, Section } from "../../Service/Section";
import { ProviderListener } from "../../Service/Provider";
import WKApp from "../../App";
import RouteContext from "../../Service/Context";
import { GroupRole } from "../../Service/Const";
import { Convert } from "../../Service/Convert";
import { ListItem } from "../ListItem";

export class UserInfoRouteData {
  uid!: string;
  channelInfo?: ChannelInfo;
  fromChannel?: Channel;
  fromSubscriberOfUser?: Subscriber; // 当前用户在频道内的订阅信息
  isSelf!: boolean; // 是否是本人
  refresh!: () => void; // 刷新
}

export class UserInfoVM extends ProviderListener {
  uid!: string;
  fromChannel?: Channel;
  fromSubscriberOfUser?: Subscriber;
  subscriberOfMy?: Subscriber; // 当前登录用户在频道的订阅者信息
  fromChannelInfo?: ChannelInfo;
  channelInfo?: ChannelInfo;
  vercode?: string;
  subscriberChangeListener?: SubscriberChangeListener;
  private muteTimer?: ReturnType<typeof setInterval>;

  constructor(uid: string, fromChannel?: Channel, vercode?: string) {
    super();
    this.uid = uid;
    this.fromChannel = fromChannel;
    this.vercode = vercode;
  }

  didMount(): void {
    this.reloadSubscribers();

    WKApp.shared.changeChannelAvatarTag(
      new Channel(this.uid, ChannelTypePerson)
    ); // 更新头像

    if (
      this.fromChannel &&
      this.fromChannel.channelType !== ChannelTypePerson
    ) {
      this.subscriberChangeListener = () => {
        this.reloadSubscribers();
      };
      WKSDK.shared().channelManager.addSubscriberChangeListener(
        this.subscriberChangeListener
      );

      // WKSDK.shared().channelManager.syncSubscribes(this.channel)
    }

    this.reloadFromChannelInfo();

    this.reloadChannelInfo();
  }

  didUnMount(): void {
    if (this.subscriberChangeListener) {
      WKSDK.shared().channelManager.removeSubscriberChangeListener(
        this.subscriberChangeListener
      );
    }
    if (this.muteTimer) {
      clearInterval(this.muteTimer);
    }
  }

  reloadSubscribers() {
    if (
      this.fromChannel &&
      this.fromChannel.channelType !== ChannelTypePerson
    ) {
      const subscribers = WKSDK.shared().channelManager.getSubscribes(
        this.fromChannel
      );
      if (subscribers && subscribers.length > 0) {
        for (const subscriber of subscribers) {
          if (subscriber.uid === this.uid) {
            this.fromSubscriberOfUser = subscriber;
          } else if (subscriber.uid === WKApp.loginInfo.uid) {
            this.subscriberOfMy = subscriber;
          }
        }
      }
      this.notifyListener();
    }
  }

  sections(context: RouteContext<UserInfoRouteData>) {
    // // 1. 获取默认的sections
    // const defaultSections = WKApp.shared.userInfos(context) || []
    
    // // 2. 找到想要插入的位置
    // const insertIndex = defaultSections.findIndex(section => 
    //   section.title === "基本信息" // 或其他你想要的位置
    // )

    // // 3. 创建新的section
    // const newSection: Section = {
    //   title: "自定义信息",
    //   // 或者使用render自定义渲染
    //   rows: [
    //     new Row({
    //       cell: ListItem,
    //       properties: {
    //         title: "自定义内容",
    //         onClick: () => {
    //           console.log("自定义内容");
    //         },
    //       },
    //     })
    //   ],
    //   sortRows: [
    //     new Row({
    //       cell: ListItem,
    //       properties: {
    //         title: "自定义内容",
    //         onClick: () => {
    //           console.log("自定义内容");
    //         },
    //       },
    //     })
    //   ]
    // }

    // // 4. 插入新section
    // if (insertIndex !== -1) {
    //   defaultSections.splice(insertIndex + 1, 0, newSection)
    // } else {
    //   defaultSections.push(newSection)
    // }

    // return defaultSections
    context.setRouteData({
      uid: this.uid,
      channelInfo: this.channelInfo,
      fromChannel: this.fromChannel,
      fromSubscriberOfUser: this.fromSubscriberOfUser,
      isSelf: this.isSelf(),
      refresh: () => {
        this.notifyListener();
      },
    });
    return WKApp.shared.userInfos(context);
  }

  myIsManagerOrCreator() {
    return (
      this.subscriberOfMy?.role === GroupRole.manager ||
      this.subscriberOfMy?.role === GroupRole.owner
    );
  }

  shouldShowShort() {
    if (this.channelInfo?.orgData?.short_no) {
      return true;
    }
    return false;
  }

  relation(): number {
    return this.channelInfo?.orgData?.follow || 0;
  }

  displayName() {
    if (
      this.channelInfo?.orgData.remark &&
      this.channelInfo?.orgData.remark !== ""
    ) {
      return this.channelInfo?.orgData.remark;
    }
    if (
      this.fromSubscriberOfUser &&
      this.fromSubscriberOfUser.remark &&
      this.fromSubscriberOfUser.remark !== ""
    ) {
      return this.fromSubscriberOfUser.remark;
    }
    return this.channelInfo?.title;
  }

  // 是否显示昵称
  showNickname() {
    if (this.hasRemark()) {
      return true;
    }
    if (this.hasChannelNickname()) {
      return true;
    }
    return false;
  }

  hasRemark() {
    if (
      this.channelInfo?.orgData.remark &&
      this.channelInfo?.orgData.remark !== ""
    ) {
      return true;
    }
    return false;
  }

  hasChannelNickname() {
    if (
      this.fromSubscriberOfUser &&
      this.fromSubscriberOfUser.remark &&
      this.fromSubscriberOfUser.remark !== ""
    ) {
      return true;
    }
    return false;
  }

  // 是否显示频道昵称
  showChannelNickname() {
    if (this.hasRemark() && this.hasChannelNickname()) {
      return true;
    }
    return false;
  }

  // 是否是本人
  isSelf() {
    return WKApp.loginInfo.uid === this.uid;
  }

  async reloadChannelInfo() {
    const res = await WKApp.apiClient.get(`users/${this.uid}`, {
      param: { group_no: this.fromChannel?.channelID || "" },
    });
    this.channelInfo = Convert.userToChannelInfo(res);
    if (!this.vercode || this.vercode == "") {
      if (res.vercode && res.vercode !== "") {
        this.vercode = res.vercode;
      }
    }

    this.notifyListener();
  }
  reloadFromChannelInfo() {
    if (this.fromChannel) {
      this.fromChannelInfo = WKSDK.shared().channelManager.getChannelInfo(
        this.fromChannel
      );
      this.notifyListener();
    }
  }

  // 获取禁言信息
  getMuteInfo(): string {
    if (!this.fromSubscriberOfUser?.orgData.forbidden_expir_time) {
      return '';
    }

    const deadline = this.fromSubscriberOfUser.orgData.forbidden_expir_time * 1000;
    if (deadline <= Date.now()) {
      return '';
    }

    if (!this.muteTimer) {
      this.muteTimer = setInterval(() => {
        this.notifyListener();
      }, 1000);
    }

    const remainTime = Math.floor((deadline - Date.now()) / 1000);
    const days = Math.floor(remainTime / 86400);
    const hours = Math.floor((remainTime % 86400) / 3600);
    const minutes = Math.floor((remainTime % 3600) / 60);
    const seconds = remainTime % 60;

    let result = '禁言中（';
    // if (days > 0) result += `${days}天`;
    result += `${(days * 24 + hours).toString().padStart(2, '0')}:`;
    result += `${minutes.toString().padStart(2, '0')}:`;
    result += `${seconds.toString().padStart(2, '0')}）`;

    return result;
  }

  // 判断是否被禁言
  isMuted(): boolean {
    if (!this.fromSubscriberOfUser?.orgData.forbidden_expir_time) {
      return false;
    }
    const isMuted = this.fromSubscriberOfUser.orgData.forbidden_expir_time * 1000 > Date.now();
    return isMuted;
  }
}
