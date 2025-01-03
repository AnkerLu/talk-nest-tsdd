import WKSDK from "wukongimjssdk";
import { ChannelInfoListener } from "wukongimjssdk";
import {
  Channel,
  ChannelInfo,
  ChannelTypePerson,
  MessageStatus,
} from "wukongimjssdk";
import { Component, CSSProperties, HTMLProps } from "react";
import "./index.css";
import { BubblePosition, MessageWrap } from "../../Service/Model";
import ConversationContext from "../../Components/Conversation/context";
import React from "react";
import {
  MessageContentTypeConst,
  MessageReasonCode,
  MessageContentTypeClassName,
} from "../../Service/Const";
import { IConversationProvider } from "../../Service/DataSource/DataProvider";
import WKApp from "../../App";
import { css } from "@emotion/react";
// import ClockLoader from "react-spinners/ClockLoader";
import Checkbox from "../../Components/Checkbox";
import classNames from "classnames";
import { Popconfirm } from "@douyinfe/semi-ui";
import MessageTrail from "./tail";
import MessageHead from "./head";
import { generateFallbackAvatar } from "../../Utils/avatarUtils";

interface MessageBaseProps extends HTMLProps<any> {
  message: MessageWrap;
  context: ConversationContext;
  hiddenStatus?: boolean;
  bubbleStyle?: CSSProperties;
  hiddeBubble?: boolean;
  onBubble?: () => void;
}

export default class MessageBase extends Component<MessageBaseProps, any> {
  channelInfoListener!: ChannelInfoListener;
  conversationProvider: IConversationProvider;

  constructor(props: any) {
    super(props);
    this.conversationProvider = WKApp.conversationProvider;
  }
  componentDidMount() {
    const self = this;
    this.channelInfoListener = (channelInfo: ChannelInfo) => {
      if (!channelInfo) {
        return;
      }
      const { message } = self.props;
      if (message.fromUID === channelInfo.channel.channelID) {
        self.setState({});
      }
    };
    WKSDK.shared().channelManager.addListener(this.channelInfoListener);
  }

  componentWillUnmount() {
    WKSDK.shared().channelManager.removeListener(this.channelInfoListener);
  }

  // 消息是否连续的
  isContinue(): boolean {
    const { message } = this.props;
    if (message.preMessage) {
      if (message.fromUID === message.preMessage.fromUID) {
        return true;
      }
    }
    return false;
  }

  getMessageStyle(hasContinue: boolean, message: MessageWrap) {
    const messageStyle: any = {};
    messageStyle.marginBottom = "15px";
    if (hasContinue && message.send) {
      messageStyle.marginTop = "5px";
      messageStyle.marginBottom = "0px";
      messageStyle.marginLeft = "0px";
      messageStyle.marginRight = "5px";
    }
    if (hasContinue && !message.send) {
      messageStyle.marginTop = "5px";
      messageStyle.marginBottom = "0px";
      messageStyle.marginRight = "0px";
      messageStyle.marginLeft = "15px";
    }
    if (message.preMessage && message.preMessage.fromUID !== message.fromUID) {
      if (
        message.nextMessage &&
        message.nextMessage.fromUID === message.fromUID
      ) {
        messageStyle.marginBottom = "0px";
      }
    }
    if (
      message.nextMessage &&
      message.nextMessage.fromUID !== message.fromUID
    ) {
      messageStyle.marginBottom = "15px";
    }
    return messageStyle;
  }

  getBubbleRadius(hasContinue: boolean, message: MessageWrap): string {
    if (message.send) {
      return "20px 4px 8px 20px";
    }
    if (
      hasContinue &&
      message.nextMessage &&
      message.nextMessage.fromUID === message.fromUID
    ) {
      return "8px 20px 20px 8px";
    }
    if (
      hasContinue &&
      message.nextMessage &&
      message.nextMessage.fromUID !== message.fromUID
    ) {
      return "8px 20px 20px 8px";
    }
    return "8px 20px 20px";
  }

  getBubbleStyle() {
    const { bubbleStyle, message } = this.props;
    let newBubbleStyle = bubbleStyle;
    const hasContinue = this.isContinue();
    if (!newBubbleStyle) {
      newBubbleStyle = {};
    }
    newBubbleStyle.borderRadius = this.getBubbleRadius(hasContinue, message);
    console.log(newBubbleStyle);
    return newBubbleStyle;
  }

  onMessageRevoke() {
    const { message } = this.props;
    this.conversationProvider.revokeMessage(message.message);
  }

  onPinnedMessage() {
    const { context, message } = this.props;
    context.pinnedMessage(message.message);
  }

  onClearPinnedMessage() {
    const { context, message } = this.props;
    context.clearPinnedMessage(message.message);
  }

  onSyncPinnedMessage() {
    const { context, message } = this.props;
    context.syncPinnedMessage(message.message, 1);
  }

  onMultiple() {
    const { context } = this.props;
    context.setEditOn(true);
  }

  onMessageDelete() {
    const { context, message } = this.props;
    context.deleteMessages([message.message]);
  }

  getBubbleBoxClassName() {
    const { message, hiddeBubble } = this.props;
    let messageBubble = "yw-message-base-bubble-box";

    if (hiddeBubble) {
      messageBubble += " hide";
    }
    if (message.contentType === MessageContentTypeConst.file) {
      messageBubble += " fileBox";
    }
    if (message.send) {
      messageBubble += " send";
    } else {
      messageBubble += " recv";
    }
    if (message.bubblePosition === BubblePosition.first) {
      messageBubble += " first";
    } else if (message.bubblePosition === BubblePosition.middle) {
      messageBubble += " middle";
    } else if (message.bubblePosition === BubblePosition.last) {
      messageBubble += " last";
    } else if (message.bubblePosition === BubblePosition.single) {
      messageBubble += " single";
    }
    return messageBubble;
  }

  needAvatar() {
    const { message } = this.props;
    if (message.send) {
      return false;
    }
    const channelInfo = WKSDK.shared().channelManager.getChannelInfo(
      new Channel(message.fromUID, ChannelTypePerson)
    );
    return (
      (message.bubblePosition === BubblePosition.last ||
        message.bubblePosition === BubblePosition.single) &&
      channelInfo
    );
  }

  getMessageErrorReason() {
    const { message } = this.props;
    switch (message.reasonCode) {
      case MessageReasonCode.reasonSubscriberNotExist:
        return "您已被踢出群聊。";
      case MessageReasonCode.reasonNotAllowSend:
      case MessageReasonCode.reasonNotInWhitelist:
      case MessageReasonCode.reasonInBlacklist:
        return "你已被禁言或全员禁言";
      case MessageReasonCode.reasonSystemError:
        return "系统错误";
    }
  }

  render() {
    const { message, context, hiddeBubble, bubbleStyle } = this.props;
    const hasContinue = this.isContinue();
    const channelInfo = WKSDK.shared().channelManager.getChannelInfo(
      new Channel(message.fromUID, ChannelTypePerson)
    );
    if (!channelInfo && message.fromUID && message.fromUID !== "") {
      WKSDK.shared().channelManager.fetchChannelInfo(
        new Channel(message.fromUID, ChannelTypePerson)
      );
    }
    const messageStyle = this.getMessageStyle(hasContinue, message);

    return (
      <div
        className={classNames(
          "yw-message-base",
          context.editOn() ? "yw-message-base-check-open" : undefined,
          message.send ? "yw-message-sender" : "yw-message-receiver"
        )}
        onClick={
          context.editOn()
            ? (event) => {
                context.checkeMessage(message.message, !message.checked);
              }
            : undefined
        }
      >
        <div
          className="yw-message-base-checkBox"
          // style={{ marginBottom: messageStyle.marginBottom }}
        >
          <Checkbox checked={message.checked} />
        </div>
        <div
          className={
            message.send ? "yw-message-base-send" : "yw-message-base-recv"
          }
          // style={messageStyle}
        >
          <div
            className={"yw-message-base-box"}
            style={{ pointerEvents: context.editOn() ? "none" : undefined }}
          >
            <div
              className="senderAvatar"
              onClick={(el) => {
                context.onTapAvatar(message.fromUID, el);
              }}
            >
              <img
                alt=""
                src={WKApp.shared.avatarChannel(channelInfo?.channel!)}
                onError={(e) => {
                  if (message.fromUID) {
                    e.currentTarget.src = generateFallbackAvatar(
                      new Channel(message.fromUID, ChannelTypePerson)
                    );
                  }
                }}
              />
            </div>

            <div className={this.getBubbleBoxClassName()}>
              <div className="yw-message-base-bubble-box-top">
                <MessageHead message={message} />
                <MessageTrail message={message}>
                  {message.send && message.status === MessageStatus.Fail ? (
                    <Popconfirm
                      title="是否重新发送"
                      okText="是"
                      cancelText="否"
                      onConfirm={() => {
                        context.resendMessage(message.message);
                      }}
                    >
                      <div className="messageFail">
                        <img
                          src={require("./msg_status_fail.png")}
                          alt=""
                        ></img>
                      </div>
                    </Popconfirm>
                  ) : undefined}
                </MessageTrail>
              </div>
              <div
                className={classNames(
                  "yw-message-base-bubble",
                  `yw-message-type-${
                    MessageContentTypeClassName[message.contentType] ||
                    "unknown"
                  }`
                )}
                style={bubbleStyle}
                onContextMenu={(event) => {
                  context.showContextMenus(message.message, event);
                }}
              >
                <div className="yw-message-base-content">
                  {this.props.children}
                </div>
              </div>
            </div>
          </div>

          {
            //TODO:  yw-message-error-reason 谨用这个 这个会引起ui跳动
            message.status === MessageStatus.Fail ? (
              <div className="yw-message-error-reason">
                {this.getMessageErrorReason()}
              </div>
            ) : undefined
          }
        </div>
      </div>
    );
  }
}
