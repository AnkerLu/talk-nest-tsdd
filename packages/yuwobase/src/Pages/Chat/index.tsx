import React, { Component, ReactNode } from "react";
import { Conversation } from "../../Components/Conversation";
import ConversationList from "../../Components/ConversationList";
import Provider from "../../Service/Provider";

import { Spin, Button, Popover } from "@douyinfe/semi-ui";
import { IconPlus } from "@douyinfe/semi-icons";
import { ChatVM } from "./vm";
import "./index.css";
import { ConversationWrap } from "../../Service/Model";
import WKApp, { ThemeMode } from "../../App";
import ChannelSetting from "../../Components/ChannelSetting";
import classNames from "classnames";
import {
  Channel,
  ChannelInfo,
  ChannelTypeGroup,
  ChannelTypePerson,
  WKSDK,
} from "wukongimjssdk";
import { ChannelInfoListener } from "wukongimjssdk";
import { ChatMenus } from "../../App";
import ConversationContext from "../../Components/Conversation/context";
import { generateFallbackAvatar } from "../../Utils/avatarUtils";
import {
  getOfflineTimeText,
  needShowOnlineStatus,
} from "../../Utils/timeUtils";

export interface ChatContentPageProps {
  channel: Channel;
  initLocateMessageSeq?: number;
}

export interface ChatContentPageState {
  showChannelSetting: boolean;
}
export class ChatContentPage extends Component<
  ChatContentPageProps,
  ChatContentPageState
> {
  channelInfoListener!: ChannelInfoListener;
  conversationContext!: ConversationContext;
  timer!: ReturnType<typeof setInterval>;

  constructor(props: any) {
    super(props);
    this.state = {
      showChannelSetting: false,
    };
  }

  componentDidMount() {
    const { channel } = this.props;
    this.channelInfoListener = (channelInfo: ChannelInfo) => {
      if (channelInfo.channel.isEqual(channel)) {
        this.setState({});
      } else if (
        channel.channelType === ChannelTypeGroup &&
        channelInfo.channel.channelType === ChannelTypePerson
      ) {
        WKSDK.shared().channelManager.fetchChannelInfo(channel);
      }
    };
    WKSDK.shared().channelManager.addListener(this.channelInfoListener);

    if (channel.channelType === ChannelTypeGroup) {
      WKSDK.shared().channelManager.fetchChannelInfo(channel);
    }

    this.timer = setInterval(() => {
      this.setState({});
    }, 60000);
  }

  componentWillUnmount() {
    WKSDK.shared().channelManager.removeListener(this.channelInfoListener);
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  render(): React.ReactNode {
    const { channel, initLocateMessageSeq } = this.props;
    const { showChannelSetting } = this.state;
    const channelInfo = WKSDK.shared().channelManager.getChannelInfo(channel);
    if (!channelInfo) {
      WKSDK.shared().channelManager.fetchChannelInfo(channel);
    }
    return (
      <div
        className={classNames(
          "yw-chat-content-right",
          showChannelSetting ? "yw-chat-channelsetting-open" : ""
        )}
      >
        <div className="yw-chat-content-chat">
          <div
            className="yw-chat-conversation-header"
            onClick={() => {
              this.setState({
                showChannelSetting: !this.state.showChannelSetting,
              });
            }}
          >
            <div className="yw-chat-conversation-header-content">
              <div className="yw-chat-conversation-header-left">
                <div
                  className="yw-chat-conversation-header-back"
                  onClick={(e) => {
                    e.stopPropagation();
                    WKApp.routeRight.pop();
                  }}
                >
                  <div className="yw-chat-conversation-header-back-icon"></div>
                </div>
                <div className="yw-chat-conversation-header-channel">
                  <div className="yw-chat-conversation-header-channel-avatar">
                    <img
                      alt=""
                      src={WKApp.shared.avatarChannel(channel)}
                      onError={(e) => {
                        e.currentTarget.src = generateFallbackAvatar(channel);
                      }}
                    ></img>
                  </div>
                  <div className="yw-chat-conversation-header-channel-info">
                    <div className="yw-chat-conversation-header-channel-info-name">
                      {channelInfo?.orgData?.displayName}
                    </div>
                    <div className="yw-chat-conversation-header-channel-info-tip">
                      {channelInfo?.channel.channelType ===
                      ChannelTypePerson ? (
                        <>
                          {channelInfo.online ? (
                            <span className="online-status">在线</span>
                          ) : channelInfo.lastOffline &&
                            needShowOnlineStatus(channelInfo) ? (
                            <span className="offline-status">
                              {getOfflineTimeText(channelInfo.lastOffline)}
                            </span>
                          ) : null}
                        </>
                      ) : channelInfo?.channel.channelType ===
                        ChannelTypeGroup ? (
                        <span className="group-status">
                          {channelInfo.orgData?.member_count || 0}个成员
                          {channelInfo.orgData?.online_count > 0 && (
                            <span className="online-count">
                              ({channelInfo.orgData.online_count}人在线)
                            </span>
                          )}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
              <div className="yw-chat-conversation-header-right">
                {WKApp.endpoints
                  .channelHeaderRightItems(channel)
                  .map((item: any, i: number) => {
                    return (
                      <div
                        key={i}
                        className="yw-chat-conversation-header-right-item"
                      >
                        {item}
                      </div>
                    );
                  })}
                <div className="yw-chat-conversation-header-right-item">
                  {/* <svg
                    fill={WKApp.config.themeColor}
                    height="28px"
                    role="presentation"
                    viewBox="0 0 36 36"
                    width="28px"
                  >
                    <path
                      clipRule="evenodd"
                      d="M18 29C24.0751 29 29 24.0751 29 18C29 11.9249 24.0751 7 18 7C11.9249 7 7 11.9249 7 18C7 24.0751 11.9249 29 18 29ZM19.5 18C19.5 18.8284 18.8284 19.5 18 19.5C17.1716 19.5 16.5 18.8284 16.5 18C16.5 17.1716 17.1716 16.5 18 16.5C18.8284 16.5 19.5 17.1716 19.5 18ZM23 19.5C23.8284 19.5 24.5 18.8284 24.5 18C24.5 17.1716 23.8284 16.5 23 16.5C22.1716 16.5 21.5 17.1716 21.5 18C21.5 18.8284 22.1716 19.5 23 19.5ZM14.5 18C14.5 18.8284 13.8284 19.5 13 19.5C12.1716 19.5 11.5 18.8284 11.5 18C11.5 17.1716 12.1716 16.5 13 16.5C13.8284 16.5 14.5 17.1716 14.5 18Z"
                      fillRule="evenodd"
                    ></path>
                  </svg> */}
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 6C13.1 6 14 5.1 14 4C14 2.9 13.1 2 12 2C10.9 2 10 2.9 10 4C10 5.1 10.9 6 12 6ZM12 10C10.9 10 10 10.9 10 12C10 13.1 10.9 14 12 14C13.1 14 14 13.1 14 12C14 10.9 13.1 10 12 10ZM12 18C10.9 18 10 18.9 10 20C10 21.1 10.9 22 12 22C13.1 22 14 21.1 14 20C14 18.9 13.1 18 12 18Z"
                      fill="#333333"
                    />
                  </svg>

                  <div className="yw-conversation-header-mask"></div>
                </div>
              </div>
            </div>
          </div>
          <div className="yw-chat-conversation">
            <Conversation
              initLocateMessageSeq={initLocateMessageSeq}
              shouldShowHistorySplit={true}
              onContext={(ctx) => {
                this.conversationContext = ctx;
                this.setState({});
              }}
              key={channel.getChannelKey()}
              chatBg={
                WKApp.config.themeMode === ThemeMode.dark
                  ? undefined
                  : require("./assets/chat_bg.svg").default
              }
              channel={channel}
            ></Conversation>
          </div>
        </div>

        <div className={classNames("yw-chat-channelsetting")}>
          <ChannelSetting
            conversationContext={this.conversationContext}
            key={channel.getChannelKey()}
            channel={channel}
            onClose={() => {
              this.setState({
                showChannelSetting: false,
              });
            }}
          ></ChannelSetting>
        </div>
      </div>
    );
  }
}

export default class ChatPage extends React.Component<any, any> {
  vm!: ChatVM;
  constructor(props: any) {
    super(props);
  }

  componentDidMount() {
    // WKApp.routeMain.replaceToRoot(<ChatContentPage vm={this.vm}></ChatContentPage>)
  }

  componentWillUnmount() {}

  render(): ReactNode {
    return (
      <Provider
        create={() => {
          this.vm = new ChatVM();
          return this.vm;
        }}
        render={(vm: ChatVM) => {
          return (
            <div className="yw-chat">
              <div
                className={classNames(
                  "yw-chat-content",
                  vm.selectedConversation ? "yw-conversation-open" : undefined
                )}
              >
                <div className="yw-chat-content-left">
                  <div className="yw-chat-search">
                    <div className="yw-chat-title">{vm.connectTitle}</div>
                    <Popover
                      onClickOutSide={() => {
                        vm.showAddPopover = false;
                      }}
                      className="yw-chat-popover"
                      position="bottomRight"
                      visible={vm.showAddPopover}
                      showArrow={false}
                      trigger="custom"
                      content={
                        <ChatMenusPopover
                          onItem={() => {
                            vm.showAddPopover = false;
                          }}
                        ></ChatMenusPopover>
                      }
                    >
                      <div
                        className="yw-chat-search-add"
                        onClick={() => {
                          vm.showAddPopover = !vm.showAddPopover;
                        }}
                      >
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M12.75 7.99951C12.75 7.8006 12.671 7.60983 12.5303 7.46918C12.3897 7.32853 12.1989 7.24951 12 7.24951C11.8011 7.24951 11.6103 7.32853 11.4697 7.46918C11.329 7.60983 11.25 7.8006 11.25 7.99951V11.25H7.99951C7.8006 11.25 7.60983 11.329 7.46918 11.4697C7.32853 11.6103 7.24951 11.8011 7.24951 12C7.24951 12.1989 7.32853 12.3897 7.46918 12.5303C7.60983 12.671 7.8006 12.75 7.99951 12.75H11.25V16.0005C11.25 16.1994 11.329 16.3902 11.4697 16.5308C11.6103 16.6715 11.8011 16.7505 12 16.7505C12.1989 16.7505 12.3897 16.6715 12.5303 16.5308C12.671 16.3902 12.75 16.1994 12.75 16.0005V12.75H16.0005C16.1994 12.75 16.3902 12.671 16.5308 12.5303C16.6715 12.3897 16.7505 12.1989 16.7505 12C16.7505 11.8011 16.6715 11.6103 16.5308 11.4697C16.3902 11.329 16.1994 11.25 16.0005 11.25H12.75V7.99951Z"
                            fill="#333333"
                          />
                          <path
                            d="M12.057 1.75049H11.943C9.75299 1.75049 8.03099 1.75049 6.68849 1.93049C5.31149 2.11499 4.21949 2.50349 3.36149 3.36149C2.50199 4.21949 2.11649 5.31149 1.93049 6.68849C1.75049 8.03099 1.75049 9.75149 1.75049 11.943V12.057C1.75049 14.247 1.75049 15.969 1.93049 17.3115C2.11499 18.6885 2.50199 19.7805 3.36149 20.6385C4.21949 21.4965 5.31149 21.8835 6.68849 22.0695C8.03099 22.2495 9.75149 22.2495 11.943 22.2495H12.057C14.247 22.2495 15.969 22.2495 17.3115 22.0695C18.6885 21.885 19.7805 21.498 20.6385 20.6385C21.4965 19.7805 21.8835 18.6885 22.0695 17.3115C22.2495 15.969 22.2495 14.2485 22.2495 12.057V11.943C22.2495 9.75299 22.2495 8.03099 22.0695 6.68849C21.885 5.31149 21.498 4.21949 20.6385 3.36149C19.7805 2.50199 18.6885 2.11649 17.3115 1.93049C15.969 1.75049 14.2485 1.75049 12.057 1.75049ZM4.42199 4.42049C4.95449 3.88799 5.67749 3.58049 6.88799 3.41699C8.11949 3.25199 9.73949 3.25049 12 3.25049C14.2605 3.25049 15.8805 3.25049 17.112 3.41699C18.3225 3.58049 19.0455 3.88799 19.578 4.42199C20.112 4.95449 20.4195 5.67749 20.583 6.88799C20.748 8.11949 20.7495 9.73949 20.7495 12C20.7495 14.2605 20.7495 15.8805 20.583 17.112C20.4195 18.3225 20.112 19.0455 19.578 19.578C19.0455 20.112 18.3225 20.4195 17.112 20.583C15.8805 20.748 14.2605 20.7495 12 20.7495C9.73949 20.7495 8.11949 20.7495 6.88799 20.583C5.67749 20.4195 4.95449 20.112 4.42199 19.578C3.88799 19.0455 3.58049 18.3225 3.41699 17.112C3.25199 15.8805 3.25049 14.2605 3.25049 12C3.25049 9.73949 3.25049 8.11949 3.41699 6.88799C3.58049 5.67749 3.88799 4.95449 4.42199 4.42199V4.42049Z"
                            fill="#333333"
                          />
                        </svg>
                      </div>
                      {/* <Button icon={<IconPlus></IconPlus>} onClick={() => {
                                    vm.showAddPopover = true
                                }}></Button> */}
                    </Popover>
                  </div>
                  <div className="yw-chat-conversation-list">
                    {vm.loading ? (
                      <div className="yw-chat-conversation-list-loading">
                        <Spin style={{ marginTop: "20px" }} />
                      </div>
                    ) : (
                      <ConversationList
                        select={WKApp.shared.openChannel}
                        conversations={vm.conversations}
                        onClick={(conversation: ConversationWrap) => {
                          vm.selectedConversation = conversation;
                          WKApp.endpoints.showConversation(
                            conversation.channel
                          );
                          vm.notifyListener();
                        }}
                      ></ConversationList>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        }}
      />
    );
  }
}

interface ChatMenusPopoverState {
  chatMenus: ChatMenus[];
}

interface ChatMenusPopoverProps {
  onItem?: (menus: ChatMenus) => void;
}
class ChatMenusPopover extends Component<
  ChatMenusPopoverProps,
  ChatMenusPopoverState
> {
  constructor(props: any) {
    super(props);
    this.state = {
      chatMenus: [],
    };
  }
  componentDidMount() {
    this.setState({
      chatMenus: WKApp.shared.chatMenus(),
    });
  }

  render(): React.ReactNode {
    const { chatMenus } = this.state;
    const { onItem } = this.props;
    return (
      <div className="yw-chatmenuspopover">
        <ul>
          {chatMenus.map((c, i) => {
            return (
              <li
                key={i}
                onClick={() => {
                  if (c.onClick) {
                    c.onClick();
                  }
                  if (onItem) {
                    onItem(c);
                  }
                }}
              >
                <div className="yw-chatmenuspopover-avatar">
                  <img alt="" src={c.icon}></img>
                </div>
                <div className="yw-chatmenuspopover-title">{c.title}</div>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
}
