import React, { Component, ReactNode } from "react";
import RouteContext, { RouteContextConfig } from "../../Service/Context";
import Provider, { IProviderListener } from "../../Service/Provider";
import RoutePage from "../RoutePage";
import { MeInfoVM } from "./vm";
import "./index.css";
import Sections from "../Sections";
import WKApp from "../../App";
import { generateFallbackAvatar } from "../../Utils/avatarUtils";
import { Channel, ChannelTypePerson } from "wukongimjssdk";
import { WKAvatarEditor } from "../WKAvatarEditor";
import { FinishButtonContext } from "../../Service/Context";
import SVGIcon from "../SVGIcon";
import { SexSelect } from "../SexSelect";

export interface MeInfoProps {
  onClose: () => void;
}

export class MeInfo extends Component<MeInfoProps> {
  render() {
    const { onClose } = this.props;

    return (
      <Provider
        create={function (): IProviderListener {
          return new MeInfoVM();
        }}
        render={function (vm: MeInfoVM): ReactNode {
          return (
            <RoutePage
              type="modal"
              title="个人信息"
              onClose={() => {
                if (onClose) {
                  onClose();
                }
              }}
              render={function (context: RouteContext<any>): ReactNode {
                const showAvatarEditor = (file: File) => {
                  let finishButtonContext: FinishButtonContext;
                  context.push(
                    <WKAvatarEditor
                      file={file}
                      ref={(rf) => {
                        vm.avatarEdit = rf;
                      }}
                    />,
                    new RouteContextConfig({
                      showFinishButton: true,
                      onFinishContext(ctx) {
                        finishButtonContext = ctx;
                      },
                      onFinish: async () => {
                        let canvas = vm.avatarEdit?.getImageScaledToCanvas();
                        if (canvas) {
                          canvas.toBlob(async (bob: Blob | null) => {
                            if (bob) {
                              const file = new File(
                                [bob],
                                `profilePicture.png`,
                                {
                                  type: "image/png",
                                }
                              );
                              finishButtonContext.loading(true);
                              await vm.uploadAvatar(file);
                              WKApp.shared.changeChannelAvatarTag(
                                new Channel(
                                  WKApp.loginInfo.uid || "",
                                  ChannelTypePerson
                                )
                              );
                              finishButtonContext.loading(false);
                              context.pop();
                            }
                          });
                        }
                      },
                    })
                  );
                };

                const handleFileChange = (
                  e: React.ChangeEvent<HTMLInputElement>
                ) => {
                  const files = e.target.files;
                  if (!files || files.length === 0) return;
                  showAvatarEditor(files[0]);
                };

                return (
                  <div className="yw-meinfo">
                    <div className="yw-meinfo-content">
                      <div className="yw-meinfo-header">
                        <div className="yw-meinfo-user">
                          <div className="yw-meinfo-user-avatar">
                            <label
                              htmlFor="avatar-upload"
                              className="avatar-label"
                            >
                              <img
                                alt=""
                                src={WKApp.shared.avatarUser(
                                  WKApp.loginInfo.uid || ""
                                )}
                                onError={(e) => {
                                  const fallbackAvatar = generateFallbackAvatar(
                                    WKApp.loginInfo.name || "",
                                    40
                                  );
                                  if (fallbackAvatar) {
                                    e.currentTarget.src = fallbackAvatar;
                                  }
                                }}
                              />
                              <SVGIcon
                                className="avatar-label-upload"
                                name="upload"
                                size={20}
                              />
                            </label>
                            <input
                              id="avatar-upload"
                              type="file"
                              style={{ display: "none" }}
                              accept="image/*"
                              onChange={handleFileChange}
                              onClick={(e) => {
                                e.currentTarget.value = "";
                              }}
                            />
                          </div>
                          <div className="yw-meinfo-user-info">
                            <div className="yw-meinfo-user-info-name">
                              {WKApp.loginInfo.name}
                            </div>
                            <div className="yw-meinfo-user-info-others">
                              <ul>
                                <li>
                                  {WKApp.config.appName}号：
                                  {WKApp.loginInfo.shortNo}
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="yw-meinfo-sections">
                        <Sections sections={vm.sections(context)} />

                        {vm.showSexSelect && (
                          <div
                            ref={(ref) => {
                              vm.sexSelectRef = ref;
                            }}
                          >
                            <SexSelect
                              sex={WKApp.loginInfo.sex}
                              onSelect={async (sex) => {
                                await vm.updateMyInfo("sex", sex.toString());
                                WKApp.loginInfo.sex = sex;
                                WKApp.loginInfo.save();
                                vm.hideSexSelect();
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }}
            />
          );
        }}
      />
    );
  }
}
