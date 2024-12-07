import { Toast } from "@douyinfe/semi-ui";
import { Channel } from "wukongimjssdk";
import WKApp from "../App";


export class ChannelSettingManager {

    private constructor() {
    }
    public static shared = new ChannelSettingManager()


    mute(v: boolean, channel: Channel): Promise<void> {
        return this._onSetting({ "mute": v ? 1 : 0 }, channel)
    }

    top(v: boolean, channel: Channel): Promise<void> {
        return this._onSetting({ "top": v ? 1 : 0 }, channel)
    }

    save(v: boolean, channel: Channel): Promise<void> {
        return this._onSetting({ "save": v ? 1 : 0 }, channel)
    }

    invite(v: boolean, channel: Channel): Promise<void> {
        return this._onSetting({ "invite": v ? 1 : 0 }, channel)
    }

    // 消息回执
    receipt(v: boolean, channel: Channel): Promise<void> {
        return this._onSetting({ "receipt": v ? 1 : 0 }, channel)
    }

    // 频道禁言
    forbidden(v: boolean, channel: Channel): Promise<void> {
        return this._onSetting({ "forbidden": v ? 1 : 0 }, channel)
    }

    // 禁止互加好友
    forbiddenAddFriend(v: boolean, channel: Channel): Promise<void> {
        return this._onSetting({ "forbidden_add_friend": v ? 1 : 0 }, channel)
    }

    // 设置管理员
    addManager(uids: string[], channel: Channel): Promise<void> {
        return this._onAddManager(uids, channel)
    }

    // 移除管理员
    removeManager(uids: string[], channel: Channel): Promise<void> {
        return this._onRemoveManager(uids, channel)
    }

    // 转移群主
    transferOwner(uid: string, channel: Channel): Promise<void> {
        return this._onTransferOwner(uid, channel)
    }

    // 设置成员禁言
    muteSubscriber(uid: string, channel: Channel, action: number, key: number): Promise<void> {
        return this._onMuteSubscriber(uid, channel, action, key)
    }

    // 获取成员禁言状态
    getSubscriberMuteInfo(): Promise<void> {
        return this._onGetSubscriberMuteInfo()
    }

    _onSetting(setting: any, channel: Channel): Promise<void> {
        return WKApp.dataSource.channelDataSource.updateSetting(setting, channel).catch((err) => {
            Toast.error(err.msg)
        })
    }

    _onAddManager(uids: string[], channel: Channel): Promise<void> {
        return WKApp.dataSource.channelDataSource.managerAdd(channel, uids).catch((err) => {
            Toast.error(err.msg)
        })
    }

    _onRemoveManager(uids: string[], channel: Channel): Promise<void> {
        return WKApp.dataSource.channelDataSource.managerRemove(channel, uids).catch((err) => {
            Toast.error(err.msg)
        })
    }

    _onTransferOwner(uid: string, channel: Channel): Promise<void> {
        return WKApp.dataSource.channelDataSource.channelTransferOwner(channel, uid).catch((err) => {
            Toast.error(err.msg)
        })
    }

    _onMuteSubscriber(uid: string, channel: Channel, action: number, key: number): Promise<void> {
        return WKApp.dataSource.channelDataSource.muteSubscriber(channel, uid, action, key).catch((err) => {
            Toast.error(err.msg)
        })
    }

    _onGetSubscriberMuteInfo(): Promise<void> {
        return WKApp.dataSource.channelDataSource.getSubscriberMuteInfo().catch((err) => {
            Toast.error(err.msg)
        })
    }
}
