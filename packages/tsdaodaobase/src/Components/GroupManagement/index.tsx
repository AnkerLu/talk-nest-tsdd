import React, { useEffect, useState } from "react";
import { Section, Row } from "../../Service/Section";
import { ListItem, ListItemSwitch, ListItemSwitchContext } from "../ListItem";
import { ChannelSettingRouteData } from "../ChannelSetting/context";
import { Toast } from "@douyinfe/semi-ui";
import { Modal } from "@douyinfe/semi-ui";
import { Channel, ChannelInfo, ChannelTypeGroup, Subscriber } from "wukongimjssdk";
import { GroupRole } from "../../Service/Const";
import { ChannelSettingManager } from "../../Service/ChannelSetting";
import IndexTable from "../IndexTable";
import { SubscriberList } from "../Subscribers/list";
import RouteContext, { FinishButtonContext } from "../../Service/Context";
import Sections from "../Sections";

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

    console.warn("🚀 ~ GroupManagement ~ updateChannelInfo ~ channelInfo:", channelInfo)
    console.warn("🚀 ~ GroupManagement ~ updateChannelInfo ~ subscribers:", subscribers)
  }

  return (
    <Sections
      sections={[
        new Section({
          rows: [
            new Row({
              cell: ListItem,
              properties: {
                title: "群主管理权转让",
                onClick: () => {
                  context.push(
                    <IndexTable
                      items={subscribers.map((item) => ({
                        id: item.uid,
                        name: item.name,
                        avatar: item.avatar,
                      }))}
                      disableSelectList={disableSelectList}
                      onSelect={(items) => {
                        Modal.confirm({
                          title: "选择新的群主",
                          content: `确定要将群主管理权转让给 ${items[0].name} 吗？转让后你将成为普通成员。`,
                          onOk: async () => {
                            try {
                              await ChannelSettingManager.shared.transferOwner(
                                items[0].id,
                                channel
                              );
                              Toast.success("群主转让成功");
                              data.refresh();
                              context.pop();
                            } catch (err: any) {
                              Toast.error(err.msg || "群主转让失败");
                            }
                          },
                        });
                      }}
                      canSelect={false}
                    />
                  );
                },
              },
            }),
            new Row({
              cell: ListItem,
              properties: {
                title: "添加管理员",
                onClick: () => {
                  const disableSelectList = subscribers
                    .filter(
                      (item) =>
                        item.role === GroupRole.manager ||
                        item.role === GroupRole.owner
                    )
                    .map((item) => item.uid);
                  context.push(
                    <IndexTable
                      items={subscribers.map((item) => ({
                        id: item.uid,
                        name: item.name,
                        avatar: item.avatar,
                      }))}
                      disableSelectList={disableSelectList}
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
                          // 设置选中成员为管理员
                          await ChannelSettingManager.shared.addManager(
                            selectedItems.map((item) => item.id),
                            channel
                          );
                          data.refresh();
                          Toast.success("添加群管理员成功");
                          context.pop();
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
                },
              },
            }),
            new Row({
              cell: ListItem,
              properties: {
                title: "删除管理员",
                onClick: () => {
                  const disableSelectList = subscribers
                    .filter((item) => item.role === GroupRole.owner)
                    .map((item) => item.uid);
                  context.push(
                    <SubscriberList
                      channel={channel}
                      disableSelectList={disableSelectList}
                      onSelect={(items) => {
                        selectedItems = items;
                        selectFinishButtonContext.disable(items.length === 0);
                      }}
                      canSelect={true}
                    />,
                    {
                      title: "删除管理员",
                      showFinishButton: true,
                      onFinish: async () => {
                        selectFinishButtonContext.loading(true);
                        try {
                          await ChannelSettingManager.shared.removeManager(
                            selectedItems.map((item) => item.uid),
                            channel
                          );
                          data.refresh();
                          Toast.success("删除群管理员成功");
                          context.pop();
                        } catch (err: any) {
                          Toast.error(err.msg || "删除群管理员失败");
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
              },
            }),
            new Row({
              cell: ListItem,
              properties: {
                title: "管理员列表",
                onClick: () => {
                  context.push(<SubscriberList channel={channel} />, {
                    title: "管理员列表",
                  });
                },
              },
            }),
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
                title: "群黑名单",
                onClick: () => {
                  ChannelSettingManager.shared.clearPinnedMessage(channel);
                },
              },
            }),
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
      ]}
    />
  );
};
