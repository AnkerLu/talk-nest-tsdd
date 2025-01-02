import React, { Component, ElementType, HTMLProps } from "react";
import {
  MentionsInput as OriginalMentionsInput,
  Mention as OriginalMention,
  SuggestionDataItem,
} from "react-mentions";
import ConversationContext from "../Conversation/context";
import clazz from "classnames";
import "./mention.css";
import WKSDK, {
  Channel,
  ChannelInfo,
  ChannelTypePerson,
  Subscriber,
} from "wukongimjssdk";
import hotkeys from "hotkeys-js";
import WKApp from "../../App";
import "./index.css";
import InputStyle from "./defaultStyle";
import { IconSend } from "@douyinfe/semi-icons";
import { Notification, Button, Toast } from "@douyinfe/semi-ui";
import { GroupForbidden, GroupRole, GroupStatus } from "../../Utils/const";
import SVGIcon from "../SVGIcon";

const MentionsInput = OriginalMentionsInput as any;
const Mention = OriginalMention as any;

export type OnInsertFnc = (text: string) => void;
export type OnAddMentionFnc = (uid: string, name: string) => void;

interface MessageInputProps extends HTMLProps<any> {
  context: ConversationContext;
  onSend?: (text: string, mention?: MentionModel) => void;
  members?: Array<Subscriber>;
  onInputRef?: any;
  onInsertText?: (fnc: OnInsertFnc) => void;
  onAddMention?: (fnc: OnAddMentionFnc) => void;
  hideMention?: boolean;
  toolbar?: JSX.Element;
  onContext?: (ctx: MessageInputContext) => void;
  topView?: JSX.Element;
}

interface MessageInputState {
  value: string | undefined;
  mentionCache: any;
  quickReplySelectIndex: number;
}

export class MentionModel {
  all: boolean = false;
  uids?: Array<string>;
}

class MemberSuggestionDataItem implements SuggestionDataItem {
  id!: string | number;
  display!: string;
  icon!: string;
}

export interface MessageInputContext {
  insertText(text: string): void;
  addMention(uid: string, name: string): void;
  text(): string | undefined;
}

export default class MessageInput
  extends Component<MessageInputProps, MessageInputState>
  implements MessageInputContext
{
  toolbars: Array<ElementType>;
  inputRef: any;
  eventListener: any;
  constructor(props: MessageInputProps) {
    super(props);
    this.toolbars = [];
    this.state = {
      value: "",
      mentionCache: {},
      quickReplySelectIndex: 0,
    };
    if (props.onAddMention) {
      props.onAddMention(this.addMention.bind(this));
    }
  }
  text(): string | undefined {
    const { value } = this.state;
    return value;
  }

  componentDidMount() {
    const self = this;
    const scope = "messageInput";
    hotkeys.filter = function (event) {
      return true;
    };
    hotkeys("ctrl+enter", scope, function (event, handler) {
      const { value } = self.state;
      self.setState({
        value: value + "\n",
        mentionCache: {},
      });
    });
    hotkeys.setScope(scope);

    const { onInsertText } = this.props;
    if (onInsertText) {
      onInsertText(this.insertText.bind(this));
    }

    const { onContext } = this.props;
    if (onContext) {
      onContext(this);
    }
    // this.inputRef.focus(); // 自动聚焦在iOS手机端体验不好
  }

  // quickReplyPanelIsShow() { // 快捷回复面板是否显示
  //     const { quickReplyModels } = this.state
  //     return quickReplyModels && quickReplyModels.length > 0
  // }
  componentWillUnmount() {
    const scope = "messageInput";
    hotkeys.unbind("ctrl+enter", scope);

    if (this.eventListener) {
      document.removeEventListener("keydown", this.eventListener);
    }
  }

  handleKeyPressed(e: any) {
    if (e.charCode !== 13) {
      //非回车
      return;
    }
    if (e.charCode === 13 && e.ctrlKey) {
      // ctrl+Enter不处理
      return;
    }
    e.preventDefault();

    this.send();
  }

  send() {
    const { value } = this.state;
    if (value && value.length > 1000) {
      Notification.error({
        content: "输入内容长度不能大于1000字符！",
      });
      return;
    }
    if (this.props.onSend && value && value.trim() !== "") {
      let formatValue = this.formatMentionText(value);
      let mention = this.parseMention(formatValue);
      this.props.onSend(formatValue, mention);
    }
    this.setState({
      value: "",
      quickReplySelectIndex: 0,
      mentionCache: {},
    });
  }

  formatMentionText(text: string) {
    let newText = text;
    let mentionMatchResult = newText.match(/@([^ ]+) /g);
    if (mentionMatchResult && mentionMatchResult.length > 0) {
      for (let i = 0; i < mentionMatchResult.length; i++) {
        let mentionStr = mentionMatchResult[i];
        let name = mentionStr.replace("@[", "@").replace("]", "");
        newText = newText.replace(mentionStr, name);
      }
    }
    return newText;
  }
  // 解析@
  parseMention(text: string) {
    const { mentionCache } = this.state;
    let mention: MentionModel = new MentionModel();
    if (mentionCache) {
      let mentions = Object.values(mentionCache);
      let all = false;
      if (mentions.length > 0) {
        let mentionUIDS = new Array();
        let mentionMatchResult = text.match(/@([^ ]+) /g);
        if (mentionMatchResult && mentionMatchResult.length > 0) {
          for (let i = 0; i < mentionMatchResult.length; i++) {
            let mentionStr = mentionMatchResult[i];
            let name = mentionStr.trim().replace("@", "");
            let member = mentionCache[name];
            if (member) {
              if (member.uid === -1) {
                // -1表示@所有人
                all = true;
              } else {
                mentionUIDS.push(member.uid);
              }
            }
          }
        }
        if (all) {
          mention.all = true;
        } else {
          mention.uids = mentionUIDS;
        }
      }
      return mention;
    }
    return undefined;
  }

  handleChange(event: { target: { value: string } }) {
    const value = event.target.value;
    this.setState({
      value: value,
    });
  }

  insertText(text: string): void {
    let newText = this.state.value + text;
    this.setState({
      value: newText,
    });
    this.inputRef.focus();
  }

  addMention(uid: string, name: string): void {
    const { mentionCache } = this.state;
    if (name) {
      mentionCache[`${name}`] = { uid: uid, name: name };
      this.insertText(`@[${name}] `);
      this.setState({
        mentionCache: mentionCache,
      });
    }
  }

  // 判断群是否正常状态
  isGroupNormal(channelInfo?: ChannelInfo): boolean {
    if (!channelInfo) {
      return false;
    }
    return channelInfo.orgData?.status === GroupStatus.NORMAL;
  }

  // 判断群是否全员禁言或者自己被群主禁言
  isGroupForbidden(channelInfo?: ChannelInfo): boolean {
    if (!channelInfo) {
      return false;
    }
    return channelInfo.orgData?.forbidden === GroupForbidden.FORBIDDEN;
  }

  render() {
    const { members, onInputRef, topView, toolbar, context } = this.props;
    const { value, mentionCache } = this.state;
    const hasValue = value && value.length > 0;
    let selectedItems = new Array<MemberSuggestionDataItem>();
    if (members && members.length > 0) {
      selectedItems = members.map<MemberSuggestionDataItem>((member) => {
        const item = new MemberSuggestionDataItem();
        item.id = member.uid;
        item.icon = WKApp.shared.avatarChannel(
          new Channel(member.uid, ChannelTypePerson)
        );
        item.display = member.name;
        return item;
      });
      selectedItems.splice(0, 0, {
        icon: require("./mention.png"),
        id: -1,
        display: "所有人",
      });
    }

    const channelInfo = WKSDK.shared().channelManager.getChannelInfo(
      context.vm.channel
    );
    const mySelf = WKSDK.shared().channelManager.getSubscribeOfMe(
      context.vm.channel
    );

    // 判断具体的禁用原因
    let disabledReason = "";
    if (!this.isGroupNormal(channelInfo)) {
      disabledReason = "该群已解散";
    } else if (mySelf?.orgData?.forbidden_expir_time > 0) {
      disabledReason = "您已被禁言";
    } else if (
      this.isGroupForbidden(channelInfo) &&
      mySelf?.role !== GroupRole.OWNER &&
      mySelf?.role !== GroupRole.ADMIN
    ) {
      disabledReason = "全员禁言中";
    }

    const disabled = disabledReason !== "";

    if (disabled) {
      return (
        <div className="yw-messageinput-disabled">
          <span>{disabledReason}</span>
        </div>
      );
    }

    return (
      <div className="yw-messageinput-box">
        {topView ? (
          <div className="yw-messageinput-box-top">{topView}</div>
        ) : undefined}

        <div className="yw-messageinput-bar">
          {/* <div className="yw-messageinput-tabs"></div> */}
          <div className="yw-messageinput-toolbar">
            <div className="yw-messageinput-actionbox">{toolbar}</div>
            <Button
              className="yw-messageinput-sendbtn"
              type="primary"
              icon={
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M19.5112 10.8266C20.1413 10.5391 20.1431 10.0741 19.5112 9.786L2.4 1.97913C1.77 1.69163 1.25875 2.02163 1.2575 2.70475L1.25 8.33975L15.1087 10.306L1.25 12.2723L1.2575 17.9079C1.25875 18.596 1.76812 18.9216 2.4 18.6335L19.5112 10.8266Z"
                    fill="white"
                  />
                </svg>
              }
              onClick={() => {
                this.send();
              }}
            ></Button>
          </div>
        </div>
        <div className="yw-messageinput-inputbox">
          <MentionsInput
            style={InputStyle.getStyle()}
            value={value}
            onKeyPress={(e: any) => this.handleKeyPressed.bind(this)(e)}
            onChange={this.handleChange.bind(this)}
            className="yw-messageinput-input"
            placeholder={`按 Ctrl + Enter 换行，按 Enter 发送`}
            allowSuggestionsAboveCursor={true}
            inputRef={(ref: any) => {
              this.inputRef = ref;
              if (onInputRef) {
                onInputRef(ref);
              }
            }}
          >
            <Mention
              className="mentions__mention"
              trigger={new RegExp(`(@([^'\\s'@]*))$`)}
              data={selectedItems}
              markup="@[__display__]"
              displayTransform={(id: any, display: any) => `@${display}`}
              appendSpaceOnAdd={true}
              onAdd={(id: any, display: any) => {
                mentionCache[display] = { uid: id, name: display };
              }}
              renderSuggestion={(
                suggestion: any,
                search: any,
                highlightedDisplay: any,
                index: any,
                focused: any
              ) => {
                return (
                  <div
                    className={clazz(
                      "yw-messageinput-member",
                      focused ? "yw-messageinput-selected" : null
                    )}
                  >
                    <div className="yw-messageinput-iconbox">
                      <img
                        alt=""
                        className="yw-messageinput-icon"
                        style={{
                          width: `24px`,
                          height: `24px`,
                          borderRadius: `24px`,
                        }}
                        src={(suggestion as MemberSuggestionDataItem).icon}
                      />
                    </div>
                    <div>
                      <strong>{highlightedDisplay}</strong>
                    </div>
                  </div>
                );
              }}
            />
          </MentionsInput>
        </div>
      </div>
    );
  }
}
