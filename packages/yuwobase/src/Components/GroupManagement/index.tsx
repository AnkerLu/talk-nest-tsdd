import React, { useCallback, useEffect, useRef, useState } from "react";
import { Section, Row } from "../../Service/Section";
import {
  ListItem,
  ListItemButton,
  ListItemButtonType,
  ListItemSwitch,
  ListItemSwitchContext,
} from "../ListItem";
import { ChannelSettingRouteData } from "../ChannelSetting/context";
import {
  Toast,
  Modal,
  Button,
  Avatar,
  Select,
  IconButton,
  Typography,
} from "@douyinfe/semi-ui";
import {
  Channel,
  ChannelInfo,
  ChannelTypeGroup,
  Subscriber,
} from "wukongimjssdk";
import { GroupRole } from "../../Service/Const";
import { ChannelSettingManager } from "../../Service/ChannelSetting";
import IndexTable from "../IndexTable";
import { SubscriberList } from "../Subscribers/list";
import RouteContext, { FinishButtonContext } from "../../Service/Context";
import Sections from "../Sections";
import WKApp from "../../App";
import "./index.css";
import { IconPlusCircle, IconMinusCircle } from "@douyinfe/semi-icons";

const { Text } = Typography;

// Props 类型定义
export interface GroupManagementProps {
  context: RouteContext<ChannelSettingRouteData>;
  data: ChannelSettingRouteData;
  channel: Channel;
  channelInfo?: ChannelInfo;
  subscribers: Subscriber[];
}

// 添加类型定义
interface MuteTimeItem {
  key: number;
  text: string;
}

interface SelectedItem {
  id: string;
  uid: string;
  name: string;
  avatar: string;
}

// 主组件
export const GroupManagement: React.FC<GroupManagementProps> = ({
  context,
  data,
  channel: initialChannel,
  channelInfo: initialChannelInfo,
  subscribers: initialSubscribers,
}) => {
  // State 定义
  const [channel, setChannel] = useState(initialChannel);
  const [channelInfo, setChannelInfo] = useState(initialChannelInfo);
  const [subscribers, setSubscribers] = useState(initialSubscribers);
  const selectedMuteTime = useRef(1);
  const updateTimerRef = useRef<NodeJS.Timeout>();

  // 清理定时器
  useEffect(() => {
    return () => {
      if (updateTimerRef.current) {
        clearTimeout(updateTimerRef.current);
      }
    };
  }, []);

  // 更新频道信息
  const updateChannelInfo = useCallback(() => {
    try {
      const data = context.routeData() as ChannelSettingRouteData;
      if (!data?.channel || !data?.channelInfo) {
        console.warn("Invalid channel data received");
        return;
      }
      Promise.resolve().then(() => {
        setChannel(data.channel);
        setChannelInfo(data.channelInfo);
        setSubscribers(data.subscribers);
      });
    } catch (error) {
      console.error("Failed to update channel info:", error);
    }
  }, [context]);

  // 延迟更新
  const delayedUpdate = useCallback(() => {
    if (updateTimerRef.current) {
      clearTimeout(updateTimerRef.current);
    }
    updateTimerRef.current = setTimeout(() => {
      updateChannelInfo();
      updateTimerRef.current = undefined;
    }, 50);
  }, [updateChannelInfo]);

  // 处理禁言成员
  const handleMuteSubscriber = async (selectedItems: SelectedItem[]) => {
    try {
      for (const member of selectedItems) {
        await ChannelSettingManager.shared.muteSubscriber(
          channel.channelID,
          {
            member_uid: member.uid || member.id,
            action: 1,
            key: selectedMuteTime.current,
          },
          channel
        );
      }
      Toast.success("设置禁言成功");
      // 等待 Modal 完全关闭后再执行导航
      const timer = setTimeout(() => {
        clearTimeout(timer);
        context.pop();
        // 更新数据
        data.refresh();
        delayedUpdate();
      }, 300);
    } catch (err: any) {
      Toast.error(err.msg || "设置禁言失败");
    }
  };

  // 添加解禁处理函数
  const handleUnmuteSubscriber = async (selectedItems: SelectedItem[]) => {
    try {
      for (const member of selectedItems) {
        await ChannelSettingManager.shared.muteSubscriber(
          channel.channelID,
          {
            member_uid: member.uid,
            action: 0,
            key: 0,
          },
          channel
        );
      }
      Toast.success("解除禁言成功");
      context.pop(); // 先执行返回动画
      await data.refresh();
      delayedUpdate();
    } catch (err: any) {
      Toast.error(err.msg || "解除禁言失败");
    }
  };

  // 修复切换开关处理函数
  const handleSwitchToggle = async (
    v: boolean,
    ctx: ListItemSwitchContext,
    action: string
  ) => {
    ctx.loading = true;
    try {
      switch (action) {
        case "forbiddenAddFriend":
          await ChannelSettingManager.shared.forbiddenAddFriend(v, channel);
          break;
        case "invite":
          await ChannelSettingManager.shared.invite(v, channel);
          break;
        case "allowViewHistoryMsg":
          await ChannelSettingManager.shared.allowViewHistoryMsg(v, channel);
          break;
        case "allowTopMessage":
          await ChannelSettingManager.shared.allowTopMessage(v, channel);
          break;
      }
      data.refresh();
      delayedUpdate();
    } catch (err: any) {
      Toast.error(err.msg || "操作失败");
    } finally {
      ctx.loading = false;
    }
  };

  // 处理解散群聊
  const handleDisbandGroup = async () => {
    if (!data.isManagerOrCreatorOfMe) {
      Toast.error("只有群主可以解散群");
      return;
    }

    Modal.confirm({
      title: "解散群聊",
      content: "解散后，所有成员将被移出群聊，且不会再收到此群的消息",
      onOk: async () => {
        try {
          await ChannelSettingManager.shared.groupDisband(data.channel);
          Toast.success("群聊已解散");
          WKApp.routeRight.pop();
        } catch (err: any) {
          Toast.error(err.msg || "解散群失败");
        }
      },
    });
  };

  // 修改 SubscriberList 组件的使用方式
  const handleMuteMembers = async () => {
    try {
      const muteTimeList =
        ((await ChannelSettingManager.shared.getSubscriberMuteInfo()) as any) ||
        [];

      context.push(
        <SubscriberList
          channel={channel}
          canSelect={false}
          disableSelectList={subscribers
            .filter((item) => item.role === GroupRole.owner)
            .map((item) => item.uid)}
          extraInfo={(subscriber) => {
            // 获取禁言状态
            // if (subscriber.orgData?.forbidden_expir_time) {
            //   const deadline = subscriber.orgData.forbidden_expir_time * 1000;
            //   if (deadline > Date.now()) {
            //     return "已禁言";
            //   }
            // }
            return "";
          }}
          extraAction={(subscriber) => {
            if (subscriber.role === GroupRole.owner) return null;

            const isMuted =
              subscriber.orgData?.forbidden_expir_time &&
              subscriber.orgData.forbidden_expir_time * 1000 > Date.now();

            return (
              <Button
                type="tertiary"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  if (isMuted) {
                    // 已禁言
                    handleUnmuteSubscriber([
                      {
                        id: subscriber.uid,
                        uid: subscriber.uid,
                        name: subscriber.name,
                        avatar: subscriber.avatar,
                      },
                    ]);
                  } else {
                    // 未禁言，显示禁言时长选择框
                    Modal.confirm({
                      title: "设置禁言时长",
                      content: (
                        <Select
                          defaultValue={1}
                          onChange={(value) =>
                            (selectedMuteTime.current = value as number)
                          }
                          style={{ width: "100%" }}
                        >
                          {muteTimeList.map((item: MuteTimeItem) => (
                            <Select.Option key={item.key} value={item.key}>
                              {item.text}
                            </Select.Option>
                          ))}
                        </Select>
                      ),
                      onOk: async () => {
                        try {
                          await handleMuteSubscriber([
                            {
                              id: subscriber.uid,
                              uid: subscriber.uid,
                              name: subscriber.name,
                              avatar: subscriber.avatar,
                            },
                          ]);
                        } catch (err: any) {
                          Toast.error(err.msg || "设置禁言失败");
                        }
                      },
                    });
                  }
                }}
              >
                {isMuted ? "解除禁言" : "禁言"}
              </Button>
            );
          }}
        />,
        {
          title: "群成员",
        }
      );
    } catch (err: any) {
      Toast.error(err.msg || "获取禁言时长失败");
    }
  };

  // 验证和错误处理
  if (
    !data ||
    !channel ||
    channel.channelType !== ChannelTypeGroup ||
    !data.isManagerOrCreatorOfMe
  ) {
    return null;
  }

  // 渲染组件
  return (
    <Sections
      sections={[
        // 消息管理
        new Section({
          rows: [
            new Row({
              cell: ListItem,
              properties: {
                title: "清除置顶消息",
                onClick: () => {
                  ChannelSettingManager.shared.clearPinnedMessage(channel);
                },
              },
            }),
            new Row({
              cell: ListItem,
              properties: {
                title: "群成员禁言管理",
                onClick: handleMuteMembers,
              },
            }),
          ],
        }),

        // 权限管理
        new Section({
          rows: [
            new Row({
              cell: ListItemSwitch,
              properties: {
                title: "禁止群内互加好友",
                checked: channelInfo?.orgData.forbidden_add_friend === 1,
                onCheck: (v: boolean, ctx: ListItemSwitchContext) => {
                  handleSwitchToggle(v, ctx, "forbiddenAddFriend");
                },
              },
            }),
            new Row({
              cell: ListItemSwitch,
              properties: {
                title: "邀请确认",
                checked: channelInfo?.orgData.invite === 1,
                onCheck: (v: boolean, ctx: ListItemSwitchContext) => {
                  handleSwitchToggle(v, ctx, "invite");
                },
              },
            }),
            new Row({
              cell: ListItemSwitch,
              properties: {
                title: "允许新成员查看历史消息",
                checked: channelInfo?.orgData.allow_view_history_msg === 1,
                onCheck: (v: boolean, ctx: ListItemSwitchContext) => {
                  handleSwitchToggle(v, ctx, "allowViewHistoryMsg");
                },
              },
            }),
            new Row({
              cell: ListItemSwitch,
              properties: {
                title: "允许成员置顶消息",
                checked: channelInfo?.orgData.allow_member_pinned_message === 1,
                onCheck: (v: boolean, ctx: ListItemSwitchContext) => {
                  handleSwitchToggle(v, ctx, "allowTopMessage");
                },
              },
            }),
          ],
        }),

        // 管理员设置
        new Section({
          rows: [
            new Row({
              cell: AdminList,
              properties: {
                subscribers,
                channel,
                context,
                data,
                delayedUpdate,
              },
            }),
          ],
        }),

        // 危险操作区
        new Section({
          rows: [
            new Row({
              cell: ListItemButton,
              properties: {
                title: "解散群聊",
                type: ListItemButtonType.warn,
                onClick: handleDisbandGroup,
              },
            }),
          ],
        }),
      ]}
    />
  );
};

// AdminList 子组件
interface AdminListProps {
  subscribers: Subscriber[];
  channel: Channel;
  context: RouteContext<ChannelSettingRouteData>;
  data: ChannelSettingRouteData;
  delayedUpdate: () => void;
}

const AdminList: React.FC<AdminListProps> = ({
  subscribers,
  channel,
  context,
  data,
  delayedUpdate,
}) => {
  const admins = subscribers.filter(
    (sub) => sub.role === GroupRole.manager || sub.role === GroupRole.owner
  );

  // 处理添加管理员
  const handleAddAdmin = () => {
    let selectFinishButtonContext: FinishButtonContext;
    let selectedItems: any[];

    context.push(
      <IndexTable
        items={subscribers.map((item) => ({
          id: item.uid,
          name: item.name,
          avatar: item.avatar,
        }))}
        disableSelectList={subscribers
          .filter(
            (item) =>
              item.role === GroupRole.manager || item.role === GroupRole.owner
          )
          .map((item) => item.uid)}
        onSelect={(items) => {
          selectedItems = items;
          selectFinishButtonContext.disable(items.length === 0);
        }}
        canSelect={true}
      />,
      {
        title: "添加管理员",
        showFinishButton: true,
        onFinish: async () => {
          selectFinishButtonContext.loading(true);
          try {
            await ChannelSettingManager.shared.addManager(
              selectedItems.map((item) => item.id),
              channel
            );
            data.refresh();
            Toast.success("添加群管理员成功");
            context.pop();
            delayedUpdate();
          } catch (err: any) {
            Toast.error(err.msg || "添加群管理员失败");
          }
          selectFinishButtonContext.loading(false);
        },
        onFinishContext: (context) => {
          selectFinishButtonContext = context;
          selectFinishButtonContext.disable(true);
        },
      }
    );
  };

  // 处理移除管理员
  const handleRemoveAdmin = async (admin: Subscriber) => {
    Modal.confirm({
      title: "删除管理员",
      content: `确定要删除管理员 ${admin.name} 吗？`,
      onOk: async () => {
        try {
          await ChannelSettingManager.shared.removeManager(
            [admin.uid],
            channel
          );
          data.refresh();
          Toast.success("删除群管理员成功");
          delayedUpdate();
        } catch (err: any) {
          Toast.error(err.msg || "删除群管理员失败");
        }
      },
    });
  };

  return (
    <div className="admin-list-section">
      <div className="admin-list-header">
        <span>群主、管理员</span>
        {data.isManagerOrCreatorOfMe && (
          <Button
            icon={<IconPlusCircle />}
            theme="light"
            type="tertiary"
            onClick={handleAddAdmin}
          >
            添加管理员
          </Button>
        )}
      </div>

      <div className="admin-list-content">
        {admins.map((admin) => (
          <div key={admin.uid} className="admin-item">
            <Avatar
              src={WKApp.shared.avatarUser(admin.uid)}
              style={{ width: "40px", height: "40px" }}
            />
            <div className="admin-info">
              <div className="admin-name">{admin.name}</div>
              <div className="admin-role">
                {admin.role === GroupRole.owner ? "群主" : "管理员"}
              </div>
            </div>
            {data.isManagerOrCreatorOfMe && admin.role !== GroupRole.owner && (
              <IconMinusCircle
                className="admin-remove-icon"
                onClick={() => handleRemoveAdmin(admin)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// 错误边界组件
class GroupManagementErrorBoundary extends React.Component<{
  children: React.ReactNode;
}> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("GroupManagement Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div>��组管理加载失败,请刷新重试</div>;
    }
    return this.props.children;
  }
}

// 导出带错误边界组件
export const GroupManagementWithErrorBoundary: React.FC<
  GroupManagementProps
> = (props) => (
  <GroupManagementErrorBoundary>
    <GroupManagement {...props} />
  </GroupManagementErrorBoundary>
);
