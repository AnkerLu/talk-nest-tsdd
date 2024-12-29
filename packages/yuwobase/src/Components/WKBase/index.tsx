import { Modal } from "@douyinfe/semi-ui";
import { Channel } from "wukongimjssdk";
import React, { Component, HTMLProps, ReactNode } from "react";
import ConversationSelect from "../ConversationSelect";
import UserInfo from "../UserInfo";
import WKApp from "../../App";
import "./index.css";

export interface WKBaseState {
  showUserInfo?: boolean;
  userUID?: string;
  vercode?: string; // 加好友的验证码
  fromChannel?: Channel;
  showConversationSelect?: boolean;
  conversationSelectTitle?: string;
  showAlert?: boolean;
  alertContent?: string;
  alertTitle?: string;
  onAlertOk?: () => void;
  conversationSelectFinished?: (channel: Channel[]) => void;

  showGlobalModal?: boolean; // 显示全局弹窗
  globalModalOptions?: GlobalModalOptions;

  showJoinOrgInfo?: boolean;
  orgId?: string;
  orgCode?: string;
  orgUid?: string;
}

export class GlobalModalOptions {
  width?: string;
  height?: string;
  body?: ReactNode;
  footer?: ReactNode;
  className?: string;
  closable?: boolean;
}

export interface WKBaseProps {
  children: React.ReactNode;
  onContext?: (context: WKBaseContext) => void;
}

export interface WKBaseContext {
  // 显示最近会话选择
  showConversationSelect(
    onFinished?: (channels: Channel[]) => void,
    title?: string
  ): void;

  // 显示用户信息
  showUserInfo(uid: string, fromChannel?: Channel, vercode?: string): void;
  // 隐藏用户信息
  hideUserInfo(): void;
  // 弹出提示框
  showAlert(conf: {
    content?: string;
    title?: string | ReactNode;
    onOk?: () => void;
    isDangerous?: boolean;
  }): void;

  showGlobalModal(options: GlobalModalOptions): void;

  // 显示加入组织
  showJoinOrgInfo(org_id: string, uid: string, code: string): void;

  hideGlobalModal(): void;
}

export default class WKBase
  extends Component<WKBaseProps, WKBaseState>
  implements WKBaseContext
{
  constructor(props: any) {
    super(props);
    this.state = {};
  }
  showUserInfo(uid: string, fromChannel?: Channel, vercode?: string): void {
    this.setState({
      showUserInfo: true,
      userUID: uid,
      fromChannel: fromChannel,
      vercode: vercode,
    });
  }

  showAlert(conf: {
    content: string;
    title?: string;
    onOk?: () => void;
  }): void {
    this.setState({
      alertContent: conf.content,
      alertTitle: conf.title,
      onAlertOk: conf.onOk,
      showAlert: true,
    });
  }

  showConversationSelect(
    onFinished?: (channels: Channel[]) => void,
    title?: string
  ) {
    this.setState({
      showConversationSelect: true,
      conversationSelectFinished: onFinished,
      conversationSelectTitle: title,
    });
  }

  hideUserInfo() {
    this.setState({
      showUserInfo: false,
      userUID: undefined,
      vercode: undefined,
    });
  }

  showGlobalModal(options: GlobalModalOptions) {
    this.setState({
      showGlobalModal: true,
      globalModalOptions: options,
    });
  }
  hideGlobalModal() {
    this.setState({
      showGlobalModal: false,
    });
  }

  componentDidMount() {
    const { onContext } = this.props;
    if (onContext) {
      onContext(this);
    }
  }

  cancelAlert() {
    this.setState({
      showAlert: false,
      alertContent: undefined,
      alertTitle: undefined,
      onAlertOk: undefined,
    });
  }

  showJoinOrgInfo(org_id: string, uid: string, code: string) {
    this.setState({
      showJoinOrgInfo: true,
      orgId: org_id,
      orgCode: code,
      orgUid: uid,
    });
  }

  render(): ReactNode {
    const {
      showUserInfo,
      userUID,
      fromChannel,
      vercode,
      showConversationSelect,
      conversationSelectTitle,
      conversationSelectFinished,
      onAlertOk,
      alertContent,
      alertTitle,
      showJoinOrgInfo,
      orgId,
      orgCode,
      orgUid,
    } = this.state;
    const baseURl = WKApp.apiClient.config.apiURL.replace("v1/", "");
    return (
      <div className="yw-base">
        {this.props.children}
        <Modal
          width={400}
          footer={null}
          closeIcon={<div></div>}
          className="yw-base-modal-userinfo yw-base-modal"
          visible={showUserInfo}
          mask={false}
          centered
          onCancel={() => {
            this.setState({
              showUserInfo: false,
              userUID: undefined,
            });
          }}
        >
          {userUID && userUID !== "" ? (
            <UserInfo
              fromChannel={fromChannel}
              vercode={vercode}
              uid={userUID}
              onClose={() => {
                this.setState({
                  showUserInfo: false,
                  userUID: undefined,
                });
              }}
            ></UserInfo>
          ) : undefined}
        </Modal>

        <Modal
          className="yw-base-modal"
          width={400}
          footer={null}
          visible={showConversationSelect}
          mask={false}
          onCancel={() => {
            this.setState({
              showConversationSelect: false,
            });
          }}
        >
          <ConversationSelect
            onFinished={(channels: Channel[]) => {
              this.setState({
                showConversationSelect: false,
              });
              if (conversationSelectFinished) {
                conversationSelectFinished(channels);
              }
            }}
            title={conversationSelectTitle}
          ></ConversationSelect>
        </Modal>

        <Modal
          className="yw-base-modal-alert"
          closeIcon={
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12.7993 8.08475C12.9165 7.96754 12.9823 7.80857 12.9823 7.64281C12.9823 7.47705 12.9165 7.31808 12.7993 7.20087C12.682 7.08366 12.5231 7.01781 12.3573 7.01781C12.1916 7.01781 12.0326 7.08366 11.9154 7.20087L10 9.11625L8.08462 7.20087C7.96741 7.08366 7.80844 7.01781 7.64268 7.01781C7.47692 7.01781 7.31795 7.08366 7.20074 7.20087C7.08353 7.31808 7.01768 7.47705 7.01768 7.64281C7.01768 7.80857 7.08353 7.96754 7.20074 8.08475L9.11612 10.0001L7.20074 11.9155C7.08353 12.0327 7.01768 12.1917 7.01768 12.3574C7.01768 12.5232 7.08353 12.6822 7.20074 12.7994C7.31795 12.9166 7.47692 12.9824 7.64268 12.9824C7.80844 12.9824 7.96741 12.9166 8.08462 12.7994L10 10.884L11.9154 12.7994C12.0326 12.9166 12.1916 12.9824 12.3573 12.9824C12.5231 12.9824 12.682 12.9166 12.7993 12.7994C12.9165 12.6822 12.9823 12.5232 12.9823 12.3574C12.9823 12.1917 12.9165 12.0327 12.7993 11.9155L10.8839 10.0001L12.7993 8.08475Z"
                fill="#333333"
              />
              <path
                d="M10.0477 1.45874H9.95273C8.12773 1.45874 6.69273 1.45874 5.57398 1.60874C4.42648 1.76249 3.51648 2.08624 2.80148 2.80124C2.08523 3.51624 1.76398 4.42624 1.60898 5.57374C1.45898 6.69249 1.45898 8.12624 1.45898 9.95249V10.0475C1.45898 11.8725 1.45898 13.3075 1.60898 14.4262C1.76273 15.5737 2.08523 16.4837 2.80148 17.1987C3.51648 17.9137 4.42648 18.2362 5.57398 18.3912C6.69273 18.5412 8.12648 18.5412 9.95273 18.5412H10.0477C11.8727 18.5412 13.3077 18.5412 14.4265 18.3912C15.574 18.2375 16.484 17.915 17.199 17.1987C17.914 16.4837 18.2365 15.5737 18.3915 14.4262C18.5415 13.3075 18.5415 11.8737 18.5415 10.0475V9.95249C18.5415 8.12749 18.5415 6.69249 18.3915 5.57374C18.2377 4.42624 17.9152 3.51624 17.199 2.80124C16.484 2.08499 15.574 1.76374 14.4265 1.60874C13.3077 1.45874 11.874 1.45874 10.0477 1.45874ZM3.68523 3.68374C4.12898 3.23999 4.73148 2.98374 5.74023 2.84749C6.76648 2.70999 8.11648 2.70874 10.0002 2.70874C11.884 2.70874 13.234 2.70874 14.2602 2.84749C15.269 2.98374 15.8715 3.23999 16.3152 3.68499C16.7602 4.12874 17.0165 4.73124 17.1527 5.73999C17.2902 6.76624 17.2915 8.11624 17.2915 9.99999C17.2915 11.8837 17.2915 13.2337 17.1527 14.26C17.0165 15.2687 16.7602 15.8712 16.3152 16.315C15.8715 16.76 15.269 17.0162 14.2602 17.1525C13.234 17.29 11.884 17.2912 10.0002 17.2912C8.11648 17.2912 6.76648 17.2912 5.74023 17.1525C4.73148 17.0162 4.12898 16.76 3.68523 16.315C3.24023 15.8712 2.98398 15.2687 2.84773 14.26C2.71023 13.2337 2.70898 11.8837 2.70898 9.99999C2.70898 8.11624 2.70898 6.76624 2.84773 5.73999C2.98398 4.73124 3.24023 4.12874 3.68523 3.68499V3.68374Z"
                fill="#333333"
              />
            </svg>
          }
          title={alertTitle}
          visible={this.state.showAlert}
          onOk={() => {
            if (onAlertOk) {
              onAlertOk();
            }
            this.cancelAlert();
          }}
          onCancel={() => {
            this.cancelAlert();
          }}
          maskClosable={false}
        >
          {alertContent}
        </Modal>
        <Modal
          closable={this.state.globalModalOptions?.closable}
          className={this.state.globalModalOptions?.className}
          visible={this.state.showGlobalModal}
          width={this.state.globalModalOptions?.width}
          footer={this.state.globalModalOptions?.footer}
        >
          {this.state.globalModalOptions?.body}
        </Modal>
        {/* 加入组织 */}
        <Modal
          visible={showJoinOrgInfo}
          width={400}
          title="加入组织"
          className="yw-base-modal-join-org"
          footer={null}
          mask={false}
          centered
          onCancel={() => {
            this.setState({
              showJoinOrgInfo: false,
              orgId: undefined,
              orgUid: undefined,
              orgCode: undefined,
            });
          }}
        >
          {orgId && orgUid && orgCode && (
            <iframe
              src={`${baseURl}web/join_org.html?org_id=${orgId}&uid=${orgUid}&code=${orgCode}`}
              style={{ width: "100%", height: "100%", border: "none" }}
            ></iframe>
          )}
        </Modal>
      </div>
    );
  }
}
