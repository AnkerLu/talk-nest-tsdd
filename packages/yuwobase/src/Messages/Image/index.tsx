import { MediaMessageContent } from "wukongimjssdk";
import React from "react";
import WKApp from "../../App";
import { MessageContentTypeConst } from "../../Service/Const";
import MessageBase from "../Base";
import { MessageCell } from "../MessageCell";
import Viewer from "react-viewer";
import { Modal } from "@douyinfe/semi-ui";
import SVGIcon from "../../Components/SVGIcon";
import "./index.css";

export class ImageContent extends MediaMessageContent {
  width!: number;
  height!: number;
  url!: string;
  imgData?: string;
  constructor(file?: File, imgData?: string, width?: number, height?: number) {
    super();
    this.file = file;
    this.imgData = imgData;
    this.width = width || 0;
    this.height = height || 0;
  }
  decodeJSON(content: any) {
    this.width = content["width"] || 0;
    this.height = content["height"] || 0;
    this.url = content["url"] || "";
    this.remoteUrl = this.url;
  }
  encodeJSON() {
    return {
      width: this.width || 0,
      height: this.height || 0,
      url: this.remoteUrl || "",
    };
  }
  get contentType() {
    return MessageContentTypeConst.image;
  }
  get conversationDigest() {
    return "[图片]";
  }
}

interface ImageCellState {
  showPreview: boolean;
}

export class ImageCell extends MessageCell<any, ImageCellState> {
  constructor(props: any) {
    super(props);
    this.state = {
      showPreview: false,
    };
  }

  imageScale(
    orgWidth: number,
    orgHeight: number,
    maxWidth = 250,
    maxHeight = 250
  ) {
    let actSize = { width: orgWidth, height: orgHeight };
    if (orgWidth > orgHeight) {
      //横图
      if (orgWidth > maxWidth) {
        // 横图超过最大宽度
        let rate = maxWidth / orgWidth; // 缩放比例
        actSize.width = maxWidth;
        actSize.height = orgHeight * rate;
      }
    } else if (orgWidth < orgHeight) {
      //竖图
      if (orgHeight > maxHeight) {
        let rate = maxHeight / orgHeight; // 缩放比例
        actSize.width = orgWidth * rate;
        actSize.height = maxHeight;
      }
    } else if (orgWidth === orgHeight) {
      if (orgWidth > maxWidth) {
        let rate = maxWidth / orgWidth; // 缩放比例
        actSize.width = maxWidth;
        actSize.height = orgHeight * rate;
      }
    }
    return actSize;
  }

  getImageSrc(content: ImageContent) {
    if (content.url && content.url !== "") {
      // 等待发送的消息
      let downloadURL = WKApp.dataSource.commonDataSource.getImageURL(
        content.url,
        { width: content.width, height: content.height }
      );
      if (downloadURL.indexOf("?") != -1) {
        downloadURL += "&filename=image.png";
      } else {
        downloadURL += "?filename=image.png";
      }
      return downloadURL;
    }
    return content.imgData;
  }

  getImageElement() {
    const { message } = this.props;
    const content = message.content as ImageContent;
    let scaleSize = this.imageScale(content.width, content.height);
    const imageWidth = Math.max(scaleSize.width, 160);
    return (
      <img
        alt=""
        src={this.getImageSrc(content)}
        style={{
          borderRadius: "5px",
          width: imageWidth,
          height: "auto",
        }}
      />
    );
  }

  render() {
    const { message, context } = this.props;
    const { showPreview } = this.state;
    const content = message.content as ImageContent;
    let scaleSize = this.imageScale(content.width, content.height);
    const imageURL = this.getImageSrc(content) || "";
    const imageWidth = Math.max(scaleSize.width, 160);
    return (
      <MessageBase context={context} message={message}>
        <div
          style={{
            width: imageWidth,
            height: "auto",
            cursor: "pointer",
          }}
          onClick={() => {
            this.setState({
              showPreview: !this.state.showPreview,
            });
          }}
        >
          {this.getImageElement()}
        </div>
        <Modal
          width={720}
          height="auto"
          title="图片预览"
          footer={null}
          closeIcon={<SVGIcon name="close" />}
          className="yw-base-modal yw-image-preview-modal"
          visible={showPreview}
          centered
          maskClosable={true}
          onCancel={() => {
            this.setState({ showPreview: false });
          }}
        >
          <div className="yw-image-preview-wrapper">
            <img className="yw-image-preview-image" src={imageURL} alt="" />
          </div>
        </Modal>
      </MessageBase>
    );
  }
}
