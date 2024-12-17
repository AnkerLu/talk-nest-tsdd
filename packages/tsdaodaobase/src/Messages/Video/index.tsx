import { MediaMessageContent, MessageContent } from "wukongimjssdk";
import React from "react";
import WKApp from "../../App";
import MessageBase from "../Base";
import { MessageCell } from "../MessageCell";
import "./index.css";
import { MessageContentTypeConst } from "../../Service/Const";
export class VideoContent extends MediaMessageContent {
  url!: string; // 视频下载地址
  cover!: string; // 视频封面图片
  size: number = 0; // 视频大小 单位byte
  width!: number; // 视频宽度
  height!: number; // 视频高度
  duration!: number; // 视频时长(秒)
  videoData?: string; // 视频数据
  extension: string = ".mp4"; // 视频文件扩展名
  constructor(
    file?: File,
    videoData?: string,
    width?: number,
    height?: number,
    duration?: number,
    cover?: string
  ) {
    super();
    this.file = file;
    this.videoData = videoData;
    this.width = width || 0;
    this.height = height || 0;
    this.duration = duration || 0;
    this.cover = cover || "";
    this.extension = "." + (file?.name.split(".").pop() || "").toLowerCase();
  }

  decodeJSON(content: any) {
    this.remoteUrl = content["url"] || "";
    this.url = content["url"] || "";
    this.cover = content["cover"] || "";
    this.size = content["size"] || 0;
    this.width = content["width"] || 0;
    this.height = content["height"] || 0;
    this.duration = content["duration"] || 0;
    this.extension = content["extension"] || ".mp4";
  }

  encodeJSON() {
    return {
      url: this.remoteUrl || "",
      cover: this.cover || "",
      size: this.size || 0,
      width: this.width || 0,
      height: this.height || 0,
      duration: this.duration || 0,
      extension: this.extension || ".mp4",
    };
  }

  get contentType() {
    return MessageContentTypeConst.smallVideo;
  }

  get conversationDigest() {
    return "[视频]";
  }
}

interface VideoCellState {
  playProgress: number;
  isError: boolean;
}

export class VideoCell extends MessageCell<any, VideoCellState> {
  constructor(props: any) {
    super(props);
    this.state = {
      playProgress: 0,
      isError: false,
    };
  }

  secondFormat(second: number): string {
    const minute = Math.floor(second / 60);
    const realSecond = Math.floor(second % 60);
    return `${minute.toString().padStart(2, "0")}:${realSecond
      .toString()
      .padStart(2, "0")}`;
  }

  videoScale(
    orgWidth: number,
    orgHeight: number,
    maxWidth = 380,
    maxHeight = 380
  ) {
    let actSize = { width: orgWidth || 480, height: orgHeight || 360 };
    if (orgWidth > orgHeight) {
      if (orgWidth > maxWidth) {
        let rate = maxWidth / orgWidth;
        actSize.width = maxWidth;
        actSize.height = orgHeight * rate;
      }
    } else if (orgWidth < orgHeight) {
      if (orgHeight > maxHeight) {
        let rate = maxHeight / orgHeight;
        actSize.width = orgWidth * rate;
        actSize.height = maxHeight;
      }
    } else if (orgWidth === orgHeight) {
      if (orgWidth > maxWidth) {
        let rate = maxWidth / orgWidth;
        actSize.width = maxWidth;
        actSize.height = orgHeight * rate;
      }
    }
    return actSize;
  }

  render() {
    const { message, context } = this.props;
    const { isError } = this.state;
    const content = message.content as VideoContent;
    const actSize = this.videoScale(content.width, content.height);

    // 获取视频URL
    const videoUrl = content.remoteUrl || content.url;
    const realVideoUrl = WKApp.dataSource.commonDataSource.getFileURL(videoUrl);

    const coverUrl = WKApp.dataSource.commonDataSource.getFileURL(
      content.cover
    );

    console.log("Rendering video:", {
      url: videoUrl,
      realUrl: realVideoUrl,
      width: content.width,
      height: content.height,
      duration: content.duration,
    });

    return (
      <MessageBase hiddeBubble={true} message={message} context={context}>
        <div
          className="wk-message-video"
          style={{ width: actSize.width, height: actSize.height }}
        >
          <div className="wk-message-video-content">
            {content.duration > 0 && (
              <span className="wk-message-video-content-time">
                {this.secondFormat(content.duration)}
              </span>
            )}
            <div className="wk-message-video-content-video">
              <video
                key={realVideoUrl} // 添加key以确保URL变化时重新创建视频元素
                poster={coverUrl}
                width={actSize.width}
                height={actSize.height}
                controls
                preload="metadata"
                playsInline
                style={{
                  borderRadius: "4px",
                  backgroundColor: "#000",
                  objectFit: "contain",
                  display: isError ? "none" : "block",
                }}
                onError={(e) => {
                  console.error("Video error:", e);
                  this.setState({ isError: true });
                }}
                onLoadedMetadata={() => {
                  console.log("Video loaded metadata");
                  this.setState({ isError: false });
                }}
              >
                <source src={realVideoUrl} type="video/mp4" />
                您的浏览器不支持视频播放
              </video>
              {isError && content.cover && (
                <img
                  src={coverUrl}
                  alt="视频封面"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    borderRadius: "4px",
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </MessageBase>
    );
  }
}
