import React, { useEffect, useRef, useState } from "react";
import { Section, Row } from "../../Service/Section";
import {
  ListItem,
  ListItemButton,
  ListItemButtonType,
  ListItemSwitch,
  ListItemSwitchContext,
} from "../ListItem";
import { ChannelSettingRouteData } from "../ChannelSetting/context";
import { Toast } from "@douyinfe/semi-ui";
import { Modal } from "@douyinfe/semi-ui";
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
import { Select } from "@douyinfe/semi-ui";
import { WKApp } from "../..";
import { Button } from "@douyinfe/semi-ui";
import { Avatar } from "@douyinfe/semi-ui";
import "./index.css";
export interface GroupManagementProps {
  context: RouteContext<ChannelSettingRouteData>;
  data: ChannelSettingRouteData;
  channel: Channel;
  channelInfo?: ChannelInfo;
  subscribers: Subscriber[];
}

export const GroupManagement: React.FC<GroupManagementProps> = ({
  context,
  data,
  channel: initialChannel,
  channelInfo: initialChannelInfo,
  subscribers: initialSubscribers,
}) => {
  const [channel, setChannel] = useState(initialChannel);
  const [channelInfo, setChannelInfo] = useState(initialChannelInfo);
  const [subscribers, setSubscribers] = useState(initialSubscribers);
  const selectedMuteTime = useRef(1);

  if (
    initialChannel.channelType !== ChannelTypeGroup ||
    !data.isManagerOrCreatorOfMe
  ) {
    return null;
  }

  let selectFinishButtonContext: FinishButtonContext;
  let selectedItems: any[];

  const disableSelectList = initialSubscribers
    .filter((item) => item.role === GroupRole.owner)
    .map((item) => item.uid);

  const updateChannelInfo = () => {
    const data = context.routeData() as ChannelSettingRouteData;
    setChannel(data.channel);
    setChannelInfo(data.channelInfo);
    setSubscribers(data.subscribers);

    console.warn(
      "🚀 ~ GroupManagement ~ updateChannelInfo ~ channelInfo:",
      channelInfo
    );
    console.warn(
      "🚀 ~ GroupManagement ~ updateChannelInfo ~ subscribers:",
      subscribers
    );
  };

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
                title: "禁言成员",
                onClick: async () => {
                  try {
                    // 先获取禁言时长列表
                    const muteTimeList =
                      (await ChannelSettingManager.shared.getSubscriberMuteInfo()) as any;

                    // 先弹出禁言时长选择
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
                          {muteTimeList.map((item: any) => (
                            <Select.Option key={item.key} value={item.key}>
                              {item.text}
                            </Select.Option>
                          ))}
                        </Select>
                      ),
                      onOk: () => {
                        // 选择完时长后再选择成员
                        context.push(
                          <SubscriberList
                            channel={channel}
                            onSelect={(items) => {
                              selectedItems = items;
                              selectFinishButtonContext.disable(
                                items.length === 0
                              );
                            }}
                            canSelect={true}
                            disableSelectList={subscribers
                              .filter((item) => item.role === GroupRole.owner)
                              .map((item) => item.uid)}
                            extraInfo={(subscriber) => {
                              // 显示成员的禁言状态
                              if (subscriber.orgData?.mute) {
                                return "已禁言";
                              }
                              return "";
                            }}
                          />,
                          {
                            title: "选择禁言成员",
                            showFinishButton: true,
                            onFinish: async () => {
                              selectFinishButtonContext.loading(true);
                              try {
                                for (const member of selectedItems) {
                                  await ChannelSettingManager.shared.muteSubscriber(
                                    channel.channelID,
                                    {
                                      member_uid: member.uid,
                                      action: 1,
                                      key: selectedMuteTime.current,
                                    },
                                    channel
                                  );
                                }
                                Toast.success("设置禁言成功");
                                context.pop();
                                data.refresh();
                                const timer = setTimeout(() => {
                                  clearTimeout(timer);
                                  updateChannelInfo();
                                }, 50);
                              } catch (err: any) {
                                Toast.error(err.msg || "设置禁言失败");
                              }
                              selectFinishButtonContext.loading(false);
                            },
                            onFinishContext: (context) => {
                              selectFinishButtonContext = context;
                              selectFinishButtonContext.disable(true);
                            },
                          }
                        );
                      },
                    });
                  } catch (err: any) {
                    Toast.error(err.msg || "获取禁言时长失败");
                  }
                },
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
                  ctx.loading = true;
                  ChannelSettingManager.shared
                    .forbiddenAddFriend(v, channel)
                    .then(() => {
                      ctx.loading = false;
                      data.refresh();
                      const timer = setTimeout(() => {
                        clearTimeout(timer);
                        updateChannelInfo();
                      }, 50);
                    })
                    .catch(() => {
                      ctx.loading = false;
                    });
                },
              },
            }),
            new Row({
              cell: ListItemSwitch,
              properties: {
                title: "邀请确认",
                checked: channelInfo?.orgData.invite === 1,
                onCheck: (v: boolean, ctx: ListItemSwitchContext) => {
                  ctx.loading = true;
                  ChannelSettingManager.shared
                    .invite(v, channel)
                    .then(() => {
                      ctx.loading = false;
                      data.refresh();
                      const timer = setTimeout(() => {
                        clearTimeout(timer);
                        updateChannelInfo();
                      }, 50);
                    })
                    .catch(() => {
                      ctx.loading = false;
                    });
                },
              },
            }),
            new Row({
              cell: ListItemSwitch,
              properties: {
                title: "允许新成员查看历史消息",
                checked: channelInfo?.orgData.allow_view_history_msg === 1,
                onCheck: (v: boolean, ctx: ListItemSwitchContext) => {
                  ctx.loading = true;
                  ChannelSettingManager.shared
                    .allowViewHistoryMsg(v, channel)
                    .then(() => {
                      ctx.loading = false;
                      data.refresh();
                      const timer = setTimeout(() => {
                        clearTimeout(timer);
                        updateChannelInfo();
                      }, 50);
                    })
                    .catch(() => {
                      ctx.loading = false;
                    });
                },
              },
            }),
            new Row({
              cell: ListItemSwitch,
              properties: {
                title: "允许成员置顶消息",
                checked: channelInfo?.orgData.allow_member_pinned_message === 1,
                onCheck: (v: boolean, ctx: ListItemSwitchContext) => {
                  ctx.loading = true;
                  ChannelSettingManager.shared
                    .allowTopMessage(v, channel)
                    .then(() => {
                      ctx.loading = false;
                      data.refresh();
                      const timer = setTimeout(() => {
                        clearTimeout(timer);
                        updateChannelInfo();
                      }, 50);
                    })
                    .catch(() => {
                      ctx.loading = false;
                    });
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
                updateChannelInfo,
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
                onClick: () => {
                  // 只有群主可以解散群
                  if (!data.isManagerOrCreatorOfMe) {
                    Toast.error("只有群主可以解散群");
                    return;
                  }

                  Modal.confirm({
                    title: "解散群聊",
                    content:
                      "解散后，所有成员将被移出群聊，且不会再收到此群的消息",
                    onOk: async () => {
                      try {
                        await ChannelSettingManager.shared.groupDisband(
                          data.channel
                        );
                        Toast.success("群聊已解散");
                        WKApp.routeRight.pop(); // 返回上一页
                      } catch (err: any) {
                        Toast.error(err.msg || "解散群失败");
                      }
                    },
                  });
                },
              },
            }),
          ],
        }),
      ]}
    />
  );
};

interface AdminListProps {
  subscribers: Subscriber[];
  channel: Channel;
  context: RouteContext<ChannelSettingRouteData>;
  data: ChannelSettingRouteData;
  updateChannelInfo: () => void;
}

const AdminList: React.FC<AdminListProps> = ({
  subscribers,
  channel,
  context,
  data,
  updateChannelInfo,
}) => {
  const admins = subscribers.filter(
    (sub) => sub.role === GroupRole.manager || sub.role === GroupRole.owner
  );

  let selectFinishButtonContext: FinishButtonContext;
  let selectedItems: any[];

  return (
    <div className="admin-list-section">
      <div className="admin-list-header">
        <span>群主、管理员</span>
        {data.isManagerOrCreatorOfMe && (
          <Button
            onClick={() => {
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
                        item.role === GroupRole.manager ||
                        item.role === GroupRole.owner
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
                      const timer = setTimeout(() => {
                        clearTimeout(timer);
                        updateChannelInfo();
                      }, 50);
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
            }}
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
              <Button
                onClick={() => {
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
                        const timer = setTimeout(() => {
                          clearTimeout(timer);
                          updateChannelInfo();
                        }, 50);
                      } catch (err: any) {
                        Toast.error(err.msg || "删除群管理员失败");
                      }
                    },
                  });
                }}
              >
                移除
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
