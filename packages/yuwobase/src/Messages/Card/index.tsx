import { Channel, ChannelTypePerson, MessageContent } from "wukongimjssdk";
import React from "react";
import WKBase, { WKBaseContext } from "../../Components/WKBase";
import WKApp from "../../App";
import MessageBase from "../Base";
import MessageTrail from "../Base/tail";
import { MessageBaseCellProps, MessageCell } from "../MessageCell";

import "./index.css";
import { MessageContentTypeConst } from "../../Service/Const";
import { generateFallbackAvatar } from "../../Utils/avatarUtils";

export class Card extends MessageContent {
  name!: string;
  uid!: string;
  vercode!: string;
  _avatar!: string;

  get avatar() {
    if (this._avatar === "") {
      return WKApp.shared.avatarChannel(
        new Channel(this.uid, ChannelTypePerson)
      );
    }
    return this._avatar;
  }

  decodeJSON(content: any) {
    this.name = content["name"] || "";
    this.uid = content["uid"] || "";
    this.vercode = content["vercode"] || "";
    this._avatar = content["avatar"] || "";
  }
  encodeJSON(): any {
    return {
      name: this.name || "",
      uid: this.uid,
      vercode: this.vercode,
      avatar: this._avatar || "",
    };
  }
  get contentType() {
    return MessageContentTypeConst.card;
  }

  get conversationDigest() {
    return "[名片]";
  }
}

interface CardCellState {
  showUser: boolean;
  avatarSrc: string;
  loadedErr: boolean;
}

export class CardCell extends MessageCell<MessageBaseCellProps, CardCellState> {
  baseContext!: WKBaseContext;
  constructor(props: any) {
    super(props);
    this.state = {
      showUser: false,
      avatarSrc: this.getImageSrc(),
      loadedErr: false,
    };
  }

  getImageSrc() {
    const { message } = this.props;
    const content = message.content as Card;
    return WKApp.shared.avatarUser(content.uid);
  }

  handleImgError() {
    const { message } = this.props;
    const content = message.content as Card;
    const fallbackAvatar = generateFallbackAvatar(
      content.name || content.uid,
      64
    );
    if (fallbackAvatar) {
      this.setState({
        avatarSrc: fallbackAvatar,
        loadedErr: true,
      });
    }
  }

  componentDidMount() {
    const channel = new Channel(
      this.props.message.content.uid,
      ChannelTypePerson
    );
    const fallbackAvatar = generateFallbackAvatar(channel, 64);
    if (fallbackAvatar && this.baseContext) {
      this.setState({ avatarSrc: fallbackAvatar });
    }
  }

  render() {
    const { message, context } = this.props;
    const content = message.content as Card;
    const { showUser, avatarSrc } = this.state;

    return (
      <WKBase
        onContext={(ctx) => {
          this.baseContext = ctx;
        }}
      >
        <MessageBase hiddeBubble={true} message={message} context={context}>
          <div className="yw-message-card">
            <div
              className="yw-message-card-content"
              onClick={() => {
                WKApp.shared.baseContext.showUserInfo(
                  content.uid,
                  context.channel(),
                  content.vercode
                );
              }}
            >
              <div>
                <img
                  src={avatarSrc}
                  alt=""
                  onError={this.handleImgError.bind(this)}
                />
              </div>
              <div className="yw-message-card-content-name">{content.name}</div>
            </div>
            <div className="yw-message-card-bottom">
              <div className="yw-message-card-bottom-flag">个人名片</div>
              <div className="yw-message-card-bottom-time">
                <MessageTrail message={message} timeStyle={{ color: "#999" }} />
              </div>
            </div>
          </div>
        </MessageBase>
      </WKBase>
    );
  }
}
