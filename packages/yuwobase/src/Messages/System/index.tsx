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

    return (
      <>
        <div className="yw-message-system">
          {displayText}
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
