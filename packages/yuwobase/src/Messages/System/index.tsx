import { SystemContent } from "wukongimjssdk";
import React from "react";
import { MessageCell } from "../MessageCell";
import { Modal } from "@douyinfe/semi-ui";
import "./index.css";
import { MessageContentTypeConst } from "../../Service/Const";
import WKApp from "../../App";

export class SystemCell extends MessageCell {
  state = {
    showModal: false,
    iframeUrl: "",
  };

  render() {
    const { message } = this.props;
    const { showModal, iframeUrl } = this.state;
    const content = message.content as SystemContent;
    const { displayText } = content;
    const contentType = message.contentType;

    const handleInvite = async () => {
      const inviteNo = content.content.invite_no;
      if (!inviteNo) {
        return;
      }
      let result = await WKApp.dataSource.channelDataSource.getInviteConfirmURL(
        message.channel,
        inviteNo
      );
      if (result) {
        this.setState({
          showModal: true,
          iframeUrl: decodeURIComponent(result),
        });
      }
    };

    const renderSystemText = () => {
      if (!content.content?.content || !content.content?.extra) {
        return displayText;
      }

      const originalText = content.content.content;
      const extras = content.content.extra;

      let lastIndex = 0;
      const parts = [];

      // Find all placeholders {0}, {1}, etc. and replace with styled names
      for (let i = 0; i < extras.length; i++) {
        const placeholder = `{${i}}`;
        const index = originalText.indexOf(placeholder, lastIndex);

        if (index === -1) continue;

        // Add text before placeholder
        if (index > lastIndex) {
          parts.push(originalText.substring(lastIndex, index));
        }

        // Add styled username
        parts.push(
          <span key={i} className="yw-message-system-username">
            {extras[i].name}
          </span>
        );

        lastIndex = index + placeholder.length;
      }

      // Add remaining text
      if (lastIndex < originalText.length) {
        parts.push(originalText.substring(lastIndex));
      }

      return <>{parts}</>;
    };

    return (
      <>
        <div className="yw-message-system">
          {renderSystemText()}
          {contentType === MessageContentTypeConst.invite && (
            <div className="yw-message-system-invite" onClick={handleInvite}>
              去确认
            </div>
          )}
        </div>

        <Modal
          title="确认邀请"
          visible={showModal}
          onCancel={() => this.setState({ showModal: false })}
          width="80%"
          height="80%"
          footer={null}
        >
          <iframe
            src={iframeUrl}
            style={{
              width: "100%",
              height: "100%",
              border: "none",
            }}
          />
        </Modal>
      </>
    );
  }
}
