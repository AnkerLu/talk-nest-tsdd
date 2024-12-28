import { Button, Spin, Toast } from "@douyinfe/semi-ui";
import { Channel, ChannelTypePerson } from "wukongimjssdk";
import React, { Component, HTMLProps, ReactNode } from "react";
import { UserRelation } from "../../Service/Const";
import WKApp, { FriendApply } from "../../App";
import Provider, { IProviderListener } from "../../Service/Provider";
import { Section } from "../../Service/Section";
import RoutePage from "../RoutePage";
import Sections from "../Sections";
import "./index.css";
import { UserInfoRouteData, UserInfoVM } from "./vm";
import FriendApplyUI from "../FriendApply";
import RouteContext, { FinishButtonContext } from "../../Service/Context";
import { Image } from "@douyinfe/semi-ui";
import { Icon } from "@douyinfe/semi-ui";
import { IconAlertTriangle } from "@douyinfe/semi-icons";
import { generateFallbackAvatar } from "../../Utils/avatarUtils";

export interface UserInfoProps extends HTMLProps<any> {
  uid: string;
  fromChannel?: Channel; // 从那个频道进来的
  sections?: Section[];
  vercode?: string; // 验证码，加好友需要，证明好友来源
  onClose?: () => void;
}

export default class UserInfo extends Component<UserInfoProps> {
  getBottomPanel(vm: UserInfoVM, context: RouteContext<any>) {
    if (vm.isSelf()) {
      return undefined;
    }

    var content = <></>;
    if (vm.relation() === UserRelation.friend) {
      content = (
        <Button
          theme="solid"
          type="primary"
          onClick={() => {
            WKApp.shared.baseContext.hideUserInfo();
            WKApp.endpoints.showConversation(
              new Channel(vm.uid, ChannelTypePerson)
            );
          }}
        >
          发消息
        </Button>
      );
    } else {
      if (!vm.vercode || vm.vercode == "") {
        // 没有验证码，不显示添加好友按钮
        return undefined;
      }
      content = (
        <Button
          onClick={() => {
            let msg = "我是";
            if (vm.fromChannelInfo) {
              msg += `群聊"${vm.fromChannelInfo.title}"的${WKApp.loginInfo.name}`;
            } else {
              msg += `${WKApp.loginInfo.name}`;
            }
            var finishButtonContext: FinishButtonContext;
            context.push(
              <FriendApplyUI
                placeholder={msg}
                onMessage={(m) => {
                  msg = m;
                  if (!m || m === "") {
                    finishButtonContext.disable(true);
                  } else {
                    finishButtonContext.disable(false);
                  }
                }}
              ></FriendApplyUI>,
              {
                title: "申请添加朋友",
                showFinishButton: true,
                onFinishContext: (ctx) => {
                  finishButtonContext = ctx;
                  finishButtonContext.disable(false);
                },
                onFinish: async () => {
                  finishButtonContext.loading(true);
                  await WKApp.dataSource.commonDataSource
                    .friendApply({
                      uid: vm.uid,
                      remark: msg,
                      vercode: vm.vercode || "",
                    })
                    .then(() => {
                      WKApp.shared.baseContext.hideUserInfo();
                    })
                    .catch((err) => {
                      Toast.error(err.msg);
                    });
                  finishButtonContext.loading(false);
                },
              }
            );
          }}
        >
          添加好友
        </Button>
      );
    }

    return (
      <div className="yw-userInfo-footer">
        <div className="yw-userinfo-footer-sendbutton">{content}</div>
      </div>
    );
  }

  render() {
    const { uid, onClose, fromChannel, vercode } = this.props;

    return (
      <Provider
        create={() => {
          return new UserInfoVM(uid, fromChannel, vercode);
        }}
        render={(vm: UserInfoVM) => {
          return (
            <RoutePage
              type="modal"
              title="用户信息"
              onClose={() => {
                if (onClose) {
                  onClose();
                }
              }}
              render={(context) => {
                return (
                  <div className="yw-userinfo">
                    <div className="yw-userinfo-content">
                      {vm.error ? (
                        <div className="yw-userinfo-error">
                          <Icon
                            svg={<IconAlertTriangle />}
                            style={{ marginRight: "8px", color: "#ff4d4f" }}
                          />
                          <span>{vm.errorMsg}</span>
                        </div>
                      ) : !vm.channelInfo ? (
                        <div className="yw-userinfo-loading">
                          <Spin></Spin>
                        </div>
                      ) : (
                        <>
                          <div className="yw-userinfo-header">
                            <div className="yw-userinfo-user">
                              <div className="yw-userinfo-user-avatar">
                                <img
                                  alt=""
                                  src={WKApp.shared.avatarUser(uid)}
                                  onError={(e) => {
                                    const fallbackAvatar =
                                      generateFallbackAvatar(
                                        vm.displayName() || "",
                                        40
                                      );
                                    if (fallbackAvatar) {
                                      e.currentTarget.src = fallbackAvatar;
                                    }
                                  }}
                                ></img>
                              </div>
                              <div className="yw-userinfo-user-info">
                                <div className="yw-userinfo-user-info-name">
                                  {vm.displayName()}
                                </div>
                                <div className="yw-userinfo-user-info-others">
                                  <ul>
                                    {vm.showNickname() ? (
                                      <li>昵称： {vm.channelInfo?.title}</li>
                                    ) : undefined}
                                    {vm.showChannelNickname() ? (
                                      <li>
                                        群昵称：{" "}
                                        {vm.fromSubscriberOfUser?.remark}
                                      </li>
                                    ) : undefined}
                                    {vm.shouldShowShort() ? (
                                      <li>
                                        {WKApp.config.appName}号：{" "}
                                        {vm.channelInfo?.orgData.short_no || ""}
                                      </li>
                                    ) : undefined}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="yw-userinfo-sections">
                            {vm.isMuted() && (
                              <div className="yw-userinfo-mute-section">
                                <div className="yw-userinfo-mute-section-title">
                                  群内禁言
                                </div>
                                <div className="yw-userinfo-mute-section-content">
                                  {/* <Icon svg={<IconAlertTriangle />} /> */}
                                  <span>{vm.getMuteInfo()}</span>
                                </div>
                              </div>
                            )}
                            <Sections sections={vm.sections(context)} />
                          </div>
                        </>
                      )}
                    </div>
                    {this.getBottomPanel(vm, context)}
                  </div>
                );
              }}
            ></RoutePage>
          );
        }}
      ></Provider>
    );
  }
}
