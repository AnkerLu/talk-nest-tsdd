import {
  ConversationContext,
  FileHelper,
  ImageContent,
  WKApp,
  VideoContent,
} from "@yuwo/base";
import React from "react";
import { Component, ReactNode } from "react";

import "./index.css";
import { Toast, Modal } from "@douyinfe/semi-ui";
import SVGIcon from "../SVGIcon";

interface ImageToolbarProps {
  conversationContext: ConversationContext;
  icon: string;
}

interface ImageToolbarState {
  showDialog: boolean;
  file?: any;
  fileType?: string;
  previewUrl?: any;
  fileIconInfo?: any;
  canSend?: boolean;
  width?: number;
  height?: number;
  duration?: number;
  cover?: string;
}

export default class ImageToolbar extends Component<
  ImageToolbarProps,
  ImageToolbarState
> {
  pasteListen!: (event: any) => void;
  constructor(props: any) {
    super(props);
    this.state = {
      showDialog: false,
    };
  }

  componentDidMount() {
    let self = this;

    const { conversationContext } = this.props;

    this.pasteListen = function (event: any) {
      // 监听粘贴里的文件
      let files = event.clipboardData.files;
      if (files.length > 0) {
        self.showFile(files[0]);
      }
    };
    document.addEventListener("paste", this.pasteListen);

    conversationContext.setDragFileCallback((file) => {
      self.showFile(file);
    });
  }

  componentWillUnmount() {
    document.removeEventListener("paste", this.pasteListen);
  }

  $fileInput: any;
  onFileClick = (event: any) => {
    event.target.value = ""; // 防止选中一个文件取消后不能再选中同一个文件
  };
  onFileChange() {
    let file = this.$fileInput.files[0];
    this.showFile(file);
  }
  chooseFile = () => {
    this.$fileInput.click();
  };
  showFile(file: any) {
    const self = this;
    console.log(
      "File type:",
      file.type,
      "File name:",
      file.name,
      "File size:",
      file.size
    );

    // 改进视频格式检测
    const isImage = file.type.startsWith("image/");
    const isVideo =
      file.type.startsWith("video/") ||
      file.name.toLowerCase().endsWith(".mp4") ||
      file.name.toLowerCase().endsWith(".mov") ||
      file.name.toLowerCase().endsWith(".webm");

    if (isImage) {
      // 图片处理保持不变
      var reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = function (e: any) {
        self.setState({
          file: file,
          fileType: "image",
          previewUrl: e.target.result,
          showDialog: true,
        });
      };
    } else if (isVideo) {
      try {
        // 标准化视频 MIME 类型
        let videoType = file.type;
        if (!videoType && file.name.toLowerCase().endsWith(".mp4")) {
          videoType = "video/mp4";
        }

        // 创建视频预览URL
        const videoURL = URL.createObjectURL(file);
        console.log("Processing video:", {
          originalType: file.type,
          normalizedType: videoType,
          fileName: file.name,
          fileSize: file.size,
          url: videoURL,
        });

        // 创建视频元素
        const video = document.createElement("video");
        video.preload = "metadata";
        video.playsInline = true;
        video.muted = true;

        // 先设置基本状态
        self.setState({
          file: file,
          fileType: "video",
          previewUrl: videoURL,
          showDialog: true,
          canSend: false,
        });

        // 监听元数据加载
        video.addEventListener("loadedmetadata", () => {
          console.log("Video metadata loaded:", {
            width: video.videoWidth,
            height: video.videoHeight,
            duration: video.duration,
            readyState: video.readyState,
          });

          // 设置视频尺寸和时长
          const width = video.videoWidth || 480;
          const height = video.videoHeight || 360;
          const duration = video.duration || 0;

          // 生成视频封面
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");

          if (ctx) {
            // 设置到视频开始位置以获取封面
            video.currentTime = 0.1;
            video.addEventListener(
              "seeked",
              () => {
                try {
                  ctx.drawImage(video, 0, 0, width, height);
                  const cover = canvas.toDataURL("image/jpeg", 0.7);

                  self.setState({
                    width,
                    height,
                    duration,
                    cover,
                    canSend: true,
                  });
                } catch (e) {
                  console.warn("Failed to generate video cover:", e);
                  // 即使封面生成失败也允许发送
                  self.setState({
                    width,
                    height,
                    duration,
                    canSend: true,
                  });
                }
              },
              { once: true }
            ); // 只监听一次
          } else {
            // 无法生成封面时也更新状态
            self.setState({
              width,
              height,
              duration,
              canSend: true,
            });
          }
        });

        // 监听错误
        video.addEventListener("error", (e) => {
          console.error("Video error:", {
            error: video.error,
            code: video.error?.code,
            message: video.error?.message,
            event: e,
          });

          let errorMessage = "视频加载失败";
          if (video.error?.code === 4) {
            errorMessage = "视频格式不支持，请使用 MP4 格式";
          }
          Toast.error(errorMessage);
        });

        // 设置视频源
        video.src = videoURL;

        // 强制加载
        try {
          video.load();
        } catch (e) {
          console.error("Video load failed:", e);
          Toast.error("视频加载失败，请检查格式");
        }
      } catch (error) {
        console.error("Video processing error:", error);
        Toast.error("视频处理失败");
        self.setState({
          canSend: false,
          showDialog: false,
        });
      }
    } else {
      Toast.error("不支持的文件类型，请使用 MP4 格式视频");
    }
  }

  onSend() {
    const { conversationContext } = this.props;
    const { file, previewUrl, width, height, fileType, duration, cover } =
      this.state;

    if (fileType === "image") {
      conversationContext.sendMessage(
        new ImageContent(file, previewUrl, width, height)
      );
    } else if (fileType === "video") {
      console.log("Sending video:", {
        fileName: file?.name,
        fileType: file?.type,
        width,
        height,
        duration,
        hasCover: !!cover,
      });

      const videoContent = new VideoContent(
        file,
        previewUrl,
        width,
        height,
        duration,
        cover
      );

      if (file?.size) {
        videoContent.size = file.size;
      }

      conversationContext.sendMessage(videoContent);
    }

    this.setState({
      showDialog: false,
    });
  }
  onPreviewLoad(e: any) {
    const { fileType } = this.state;
    if (fileType === "image") {
      // 图片加载完成后设置宽高
      let img = e.target;
      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;
      this.setState({
        width: width,
        height: height,
        canSend: true,
      });
    }
    // 视频的加载已经在 showFile 中处理
  }
  render(): ReactNode {
    const { icon } = this.props;
    const { showDialog, canSend, fileType, previewUrl, file } = this.state;

    return (
      <div className="yw-imagetoolbar">
        <div
          className="yw-imagetoolbar-content"
          onClick={() => {
            this.chooseFile();
          }}
        >
          <div className="yw-imagetoolbar-content-icon">
            <img src={icon} alt="" />
            <input
              onClick={this.onFileClick}
              onChange={this.onFileChange.bind(this)}
              ref={(ref) => {
                this.$fileInput = ref;
              }}
              type="file"
              multiple={false}
              accept="image/*,video/*"
              style={{ display: "none" }}
            />
          </div>
        </div>
        {showDialog && (
          <ImageDialog
            visible={showDialog}
            onClose={() => {
              if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
              }
              this.setState({
                showDialog: false,
                previewUrl: undefined,
                canSend: false,
              });
            }}
            fileType={fileType}
            previewUrl={previewUrl}
            canSend={canSend}
            onSend={this.onSend.bind(this)}
            onLoad={this.onPreviewLoad.bind(this)}
          />
        )}
      </div>
    );
  }
}

interface ImageDialogProps {
  onClose: () => void;
  onSend?: () => void;
  fileType?: string;
  previewUrl?: string;
  file?: any;
  fileIconInfo?: any;
  canSend?: boolean;
  onLoad: (e: any) => void;
  loading?: boolean;
  visible: boolean;
}

class ImageDialog extends Component<ImageDialogProps> {
  // 格式化文件大小
  getFileSizeFormat(size: number) {
    if (size < 1024) {
      return `${size} B`;
    }
    if (size > 1024 && size < 1024 * 1024) {
      return `${(size / 1024).toFixed(2)} KB`;
    }
    if (size > 1024 * 1024 && size < 1024 * 1024 * 1024) {
      return `${(size / 1024 / 1024).toFixed(2)} M`;
    }
    return `${(size / (1024 * 1024 * 1024)).toFixed(2)}G`;
  }

  render() {
    const {
      onClose,
      onSend,
      fileType,
      previewUrl,
      file,
      canSend,
      fileIconInfo,
      onLoad,
      loading,
      visible,
    } = this.props;

    const modalContent = (
      <div className="yw-imagedialog-content-body">
        {fileType === "image" ? (
          <div className="yw-imagedialog-content-preview">
            <img
              alt=""
              className="yw-imagedialog-content-previewImg"
              src={previewUrl}
              onLoad={onLoad}
            />
          </div>
        ) : fileType === "video" ? (
          <div className="yw-imagedialog-content-preview">
            <video
              className="yw-imagedialog-content-previewVideo"
              src={previewUrl}
              controls
              playsInline
              preload="metadata"
              style={{
                maxWidth: "100%",
                maxHeight: "400px",
                objectFit: "contain",
                borderRadius: "4px",
              }}
              onError={(e) => {
                console.error("Preview video error:", e);
              }}
            />
          </div>
        ) : null}
      </div>
    );

    const modalFooter = (
      <div className="yw-imagedialog-footer">
        <button onClick={onClose}>取消</button>
        <button
          onClick={onSend}
          className="yw-imagedialog-footer-okbtn"
          disabled={!canSend}
          style={{
            backgroundColor: canSend ? WKApp.config.themeColor : "gray",
          }}
        >
          发送
        </button>
      </div>
    );

    return (
      <Modal
        visible={visible}
        onCancel={onClose}
        footer={null}
        closeIcon={<SVGIcon name="close" />}
        className="yw-base-modal yw-imagedialog-modal"
        title={`发送${fileType === "image" ? "图片" : "文件"}`}
        width={360}
        centered
        maskClosable={false}
      >
        {modalContent}
        {modalFooter}
      </Modal>
    );
  }
}
