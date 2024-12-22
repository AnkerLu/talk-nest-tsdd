import React, { Component, ReactNode } from "react";
import { Button } from "@douyinfe/semi-ui";
import {
  FriendApplyState,
  WKApp,
  WKViewQueueHeader,
  Provider,
} from "@yuwo/base";
import { FriendAdd } from "../FriendAdd";
import { NewFriendVM } from "./vm";
import "./index.css";

export class NewFriend extends Component {
  render(): ReactNode {
    return (
      <Provider
        create={() => {
          return new NewFriendVM();
        }}
        render={(vm: NewFriendVM) => {
          return (
            <div className="yw-newfriend">
              <WKViewQueueHeader
                title="新朋友"
                onBack={() => {
                  WKApp.routeLeft.pop();
                }}
                action={
                  <div className="yw-viewqueueheader-content-action">
                    <Button
                      size="small"
                      onClick={() => {
                        WKApp.routeLeft.push(
                          <FriendAdd
                            onBack={() => {
                              WKApp.routeLeft.pop();
                            }}
                          ></FriendAdd>
                        );
                      }}
                    >
                      添加好友
                    </Button>
                  </div>
                }
              ></WKViewQueueHeader>
              <div className="yw-newfriend-content">
                <ul>
                  {vm.friendApplys.map((f) => {
                    return (
                      <li key={f.to_uid}>
                        <div className="yw-newfriend-content-avatar">
                          <img src={WKApp.shared.avatarUser(f.to_uid)}></img>
                        </div>
                        <div className="yw-newfriend-content-title">
                          <div className="yw-newfriend-content-title-name">
                            {f.to_name}
                          </div>
                          <div className="yw-newfriend-content-title-remark">
                            {f.remark}
                          </div>
                        </div>
                        <div className="yw-newfriend-content-action">
                          <Button
                            loading={
                              vm.currentFriendApply?.to_uid === f.to_uid &&
                              vm.sureLoading
                            }
                            disabled={f.status == FriendApplyState.accepted}
                            onClick={() => {
                              vm.friendSure(f);
                            }}
                          >
                            {f.status == FriendApplyState.accepted
                              ? "已添加"
                              : "确认"}
                          </Button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          );
        }}
      ></Provider>
    );
  }
}
