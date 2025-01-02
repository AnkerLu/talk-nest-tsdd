import { MediaMessageContent } from "wukongimjssdk";
import React from "react";
import WKApp from "../../App";
import { MessageContentTypeConst } from "../../Service/Const";
import MessageBase from "../Base";
import { MessageCell } from "../MessageCell";
import SVGIcon from "../../Components/SVGIcon";
import "./index.css";

export class FileContent extends MediaMessageContent {
  fileName: string = ""; // 文件名
  fileSize: number = 0; // 文件大小(字节)
  url: string = ""; // 文件下载地址
  extension: string = ""; // 文件扩展名

  constructor(file?: File) {
    super();
    if (file) {
      this.file = file;
      this.fileName = file.name;
      this.fileSize = file.size;
      this.extension = "." + (file.name.split(".").pop() || "").toLowerCase();
    }
  }

  decodeJSON(content: any) {
    this.fileName = content["file_name"] || "";
    this.fileSize = content["file_size"] || 0;
    this.url = content["url"] || content["remote_url"] || "";
    this.extension = content["extension"] || "";
    this.remoteUrl = this.url;
  }

  encodeJSON() {
    return {
      file_name: this.fileName || "",
      file_size: this.fileSize || 0,
      url: this.remoteUrl || "",
      extension: this.extension || "",
    };
  }

  get contentType() {
    return MessageContentTypeConst.file;
  }

  get conversationDigest() {
    return "[文件]";
  }
}

export class FileCell extends MessageCell {
  formatFileSize(bytes: number) {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  getFileIcon(extension: string) {
    // 转换为小写便于匹配
    const ext = extension.toLowerCase();

    // 文件类型映射表
    const iconMap: { [key: string]: string } = {
      // 文档类型
      ".pdf": "file-pdf",
      ".doc": "file-doc",
      ".docx": "file-docx",
      ".xls": "file-excel",
      ".xlsx": "file-excel",
      ".ppt": "file-ppt",
      ".pptx": "file-ppt",
      ".txt": "file-text",
      ".rtf": "file-text",
      ".md": "file-text",

      // 压缩文件
      ".zip": "file-zip",
      ".rar": "file-zip",
      ".7z": "file-zip",
      ".tar": "file-zip",
      ".gz": "file-zip",

      // 图片文件
      ".jpg": "file-image",
      ".jpeg": "file-image",
      ".png": "file-image",
      ".gif": "file-image",
      ".bmp": "file-image",
      ".webp": "file-image",

      // 音频文件
      ".mp3": "file-audio",
      ".wav": "file-audio",
      ".aac": "file-audio",
      ".flac": "file-audio",
      ".m4a": "file-audio",

      // 视频文件
      ".mp4": "file-video",
      ".avi": "file-video",
      ".mov": "file-video",
      ".wmv": "file-video",
      ".mkv": "file-video",
      ".flv": "file-video",

      // // 代码文件
      // ".js": "file-code",
      // ".ts": "file-code",
      // ".jsx": "file-code",
      // ".tsx": "file-code",
      // ".html": "file-code",
      // ".css": "file-code",
      // ".json": "file-code",
    };

    return iconMap[ext] || "file-default"; // 未匹配的文件使用默认图标
  }

  render() {
    const { message, context } = this.props;
    const content = message.content as FileContent;

    const fileUrl = content.remoteUrl || content.url;

    const realFileUrl = WKApp.dataSource.commonDataSource.getFileURL(fileUrl);
    return (
      <MessageBase message={message} context={context}>
        <div
          className="yw-message-file"
          onClick={() => {
            if (realFileUrl) {
              window.open(realFileUrl);
            }
          }}
        >
          <div className="yw-message-file-icon">
            <SVGIcon
              name={this.getFileIcon(content.extension)}
              width={32}
              height={42}
            />
          </div>
          <div className="yw-message-file-info">
            <div className="yw-message-file-name">{content.fileName}</div>
            <div className="yw-message-file-size">
              {this.formatFileSize(content.fileSize)}
            </div>
          </div>
          <SVGIcon
            className="yw-message-file-preview"
            name="file-preview"
            width={16}
            height={16}
          />
        </div>
      </MessageBase>
    );
  }
}
