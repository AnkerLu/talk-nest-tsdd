import classNames from "classnames";
import React from "react";
import WKApp from "../../App";
import { Part, PartType } from "../../Service/Model";
import MessageBase from "../Base";
import { MessageCell } from "../MessageCell";
import "./index.css";

// 文本消息
export class TextCell extends MessageCell {
  constructor(props: any) {
    super(props);
  }

  getCommonText(k: number, part: Part) {
    const texts = part.text.split("\n");
    const { message } = this.props;
    return (
      <span
        key={`${message.clientMsgNo}-text-${k}`}
        className="yw-message-text-commontext"
      >
        {texts.map((text, i) => {
          return (
            <span
              key={`${message.clientMsgNo}-common-${i}`}
              className="yw-message-text-richtext"
            >
              {text}
              {i !== texts.length - 1 ? <br /> : undefined}
            </span>
          );
        })}
      </span>
    );
  }

  getMentionText(k: number, part: Part) {
    const { message, context } = this.props;
    return (
      <span
        onClick={() => {
          if (part.data?.uid) {
            context.showUser(part.data?.uid);
          }
        }}
        key={`${message.clientMsgNo}-mention-${k}`}
        className={classNames(
          "yw-message-text-richmention",
          message.send ? "yw-message-text-send" : "yw-message-text-recv"
        )}
      >
        {part.text}
      </span>
    );
  }

  getEmojiText(k: number, part: Part) {
    const { message } = this.props;
    const emojiURL = WKApp.emojiService.getImage(part.text);
    return (
      <span
        key={`${message.clientMsgNo}-emoji-${k}`}
        className="yw-message-text-richemoji"
      >
        {emojiURL !== "" ? <img alt="" src={emojiURL} /> : part.text}
      </span>
    );
  }

  getLinkText(k: number, part: Part) {
    const { message } = this.props;
    let link = part.text;
    if (link.indexOf("http") !== 0) {
      link = "http://" + link;
    }
    return (
      <a key={`${message.clientMsgNo}-link-${k}`} href={link} target="__blank">
        {part.text}
      </a>
    );
  }

  getRenderMessageText() {
    const { message } = this.props;
    const parts = message.parts;
    const elements = new Array<JSX.Element>();
    if (parts && parts.length > 0) {
      let i = 0;
      for (const part of parts) {
        part.text.split("\n");
        if (part.type === PartType.text) {
          elements.push(this.getCommonText(i, part));
        } else if (part.type === PartType.mention) {
          elements.push(this.getMentionText(i, part));
        } else if (part.type === PartType.emoji) {
          elements.push(this.getEmojiText(i, part));
        } else if (part.type === PartType.link) {
          elements.push(this.getLinkText(i, part));
        }
        i++;
      }
    }
    return elements;
  }

  render() {
    const { message, context } = this.props;
    return (
      <>
        <MessageBase message={message} context={context} onBubble={() => {}}>
          {message?.content.reply ? (
            <div
              className={classNames(
                "yw-message-text-reply",
                message.send ? undefined : "yw-message-text-reply-recv"
              )}
              onClick={() => {
                context.locateMessage(message?.content.reply.messageSeq);
              }}
            >
              <div className="yw-message-text-reply-author">
                <div className="yw-message-text-reply-authoravatar">
                  <img
                    alt=""
                    src={WKApp.shared.avatarUser(message.content.reply.fromUID)}
                    style={{
                      width: "12px",
                      height: "12px",
                      borderRadius: "50%",
                    }}
                  />
                </div>
                <div className="yw-message-text-reply-authorname">
                  {message.content.reply.fromName}
                </div>
              </div>
              <div className="yw-message-text-reply-content">
                {message.content.reply.content?.conversationDigest}
              </div>
            </div>
          ) : undefined}

          <p className="yw-message-text-content">
            {this.getRenderMessageText()}
          </p>
        </MessageBase>
      </>
    );
  }
}
