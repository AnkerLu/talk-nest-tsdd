import { ConversationContext, FileHelper, WKApp } from "@yuwo/base";
import React from "react";
import { Component, ReactNode } from "react";

import "./index.css";
import { Toast, Modal } from "@douyinfe/semi-ui";
import SVGIcon from "../SVGIcon";
import { FileContent } from "../../Messages/File";

interface FileToolbarProps {
  conversationContext: ConversationContext;
  icon: string;
}

interface FileToolbarState {
  file?: any;
}

export default class FileToolbar extends Component<
  FileToolbarProps,
  FileToolbarState
> {
  fileInputRef: any;
  constructor(props: any) {
    super(props);
    this.state = {};
  }

  chooseFile = () => {
    this.fileInputRef?.click();
  };

  onSend(file: any) {
    const { conversationContext } = this.props;

    conversationContext.sendMessage(new FileContent(file));
  }

  handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const originfile = event.target.files?.[0];
    if (originfile?.size && originfile.size > 100 * 1024 * 1024) {
      // 100MB 限制
      Toast.error("文件大小不能超过100MB");
      return;
    }
    if (originfile) {
      this.setState((prevState) => ({
        ...prevState,
        file: originfile,
      }));
      this.onSend(originfile);
    }
    // 清空 input 值，允许选择相同文件
    event.target.value = "";
  };

  render(): ReactNode {
    const { icon } = this.props;

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
              type="file"
              ref={(ref) => (this.fileInputRef = ref)}
              style={{ display: "none" }}
              onChange={this.handleFileSelect}
            />
          </div>
        </div>
      </div>
    );
  }
}
