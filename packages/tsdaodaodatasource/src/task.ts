import { WKApp } from "@tsdaodao/base";
import axios, { Canceler } from "axios";
import { MediaMessageContent } from "wukongimjssdk";
import { MessageTask, TaskStatus } from "wukongimjssdk";

export class MediaMessageUploadTask extends MessageTask {
  private _progress?: number;
  private canceler: Canceler | undefined;
  getUUID() {
    var len = 32; //32长度
    var radix = 16; //16进制
    var chars =
      "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split(
        ""
      );
    var uuid = [],
      i;
    radix = radix || chars.length;
    if (len) {
      for (i = 0; i < len; i++) uuid[i] = chars[0 | (Math.random() * radix)];
    } else {
      var r;
      uuid[8] = uuid[13] = uuid[18] = uuid[23] = "-";
      uuid[14] = "4";
      for (i = 0; i < 36; i++) {
        if (!uuid[i]) {
          r = 0 | (Math.random() * 16);
          uuid[i] = chars[i === 19 ? (r & 0x3) | 0x8 : r];
        }
      }
    }
    return uuid.join("");
  }

  async start(): Promise<void> {
    const mediaContent = this.message.content as MediaMessageContent;
    if (mediaContent.file) {
      // ���传主文件
      const fileName = this.getUUID();
      const path = `/${this.message.channel.channelType}/${
        this.message.channel.channelID
      }/${fileName}${mediaContent.extension ?? ""}`;
      const uploadURL = await this.getUploadURL(path);

      // 如果存在 base64 格式的封面，先上传封面
      if (mediaContent.cover && mediaContent.cover.startsWith("data:image")) {
        const coverFile = this.base64ToFile(
          mediaContent.cover,
          `${fileName}_cover.jpg`
        );
        const coverPath = `/${this.message.channel.channelType}/${this.message.channel.channelID}/${fileName}_cover.jpg`;
        const coverUploadURL = await this.getUploadURL(coverPath);
        if (coverUploadURL) {
          await this.uploadFile(coverFile, coverUploadURL, true);
        }
      }

      if (uploadURL) {
        await this.uploadFile(mediaContent.file, uploadURL, false);
      } else {
        console.log("获取上传地址失败！");
        this.status = TaskStatus.fail;
        this.update();
      }
    } else {
      console.log("多媒体消息不存在附件！");
      if (mediaContent.remoteUrl && mediaContent.remoteUrl !== "") {
        this.status = TaskStatus.success;
        this.update();
      } else {
        this.status = TaskStatus.fail;
        this.update();
      }
    }
  }

  async uploadFile(file: File, uploadURL: string, isCover: boolean = false) {
    const param = new FormData();
    param.append("file", file);
    const resp = await axios
      .post(uploadURL, param, {
        headers: { "Content-Type": "multipart/form-data" },
        cancelToken: new axios.CancelToken((c: Canceler) => {
          this.canceler = c;
        }),
        onUploadProgress: (e) => {
          var completeProgress = (e.loaded / e.total) | 0;
          this._progress = completeProgress;
          this.update();
        },
      })
      .catch((error) => {
        console.log("文件上传失败！->", error);
        this.status = TaskStatus.fail;
        this.update();
      });
    if (resp) {
      if (resp.data.path) {
        const mediaContent = this.message.content as MediaMessageContent;
        if (isCover) {
          mediaContent.cover = resp.data.path;
        } else {
          mediaContent.remoteUrl = resp.data.path;
          this.status = TaskStatus.success;
          this.update();
        }
      }
    }
  }

  // 获取上传路径
  async getUploadURL(path: string): Promise<string | undefined> {
    const result = await WKApp.apiClient.get(
      `file/upload?path=${path}&type=chat`
    );
    if (result) {
      return result.url;
    }
  }

  suspend(): void {}
  resume(): void {}
  cancel(): void {
    this.status = TaskStatus.cancel;
    if (this.canceler) {
      this.canceler();
    }
    this.update();
  }
  progress(): number {
    return this._progress ?? 0;
  }

  // 添加新的辅助方法用于转换 base64 为 File
  private base64ToFile(base64String: string, filename: string): File {
    const arr = base64String.split(",");
    const mime = arr[0].match(/:(.*?);/)?.[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }
}
