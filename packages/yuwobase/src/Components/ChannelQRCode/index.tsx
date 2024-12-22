import React, { Component } from "react";
import QRCode from "qrcode.react";
import "./index.css";
import { Channel, WKSDK } from "wukongimjssdk";
import WKApp from "../../App";
import Provider from "../../Service/Provider";
import { ChannelQRCodeVM } from "./vm";
import { Spin } from "@douyinfe/semi-ui";

export interface ChannelQRCodeProps {
  channel: Channel;
}

export default class ChannelQRCode extends Component<ChannelQRCodeProps> {
  render() {
    const { channel } = this.props;
    const channelInfo = WKSDK.shared().channelManager.getChannelInfo(channel);
    return (
      <Provider
        create={() => {
          return new ChannelQRCodeVM(channel);
        }}
        render={(vm: ChannelQRCodeVM) => {
          return (
            <div className="yw-channelqrcode">
              <div className="yw-channelqrcode-box">
                <div className="yw-channelqrcode-info">
                  <div className="yw-channelqrcode-info-avatar">
                    <img src={WKApp.shared.avatarChannel(channel)}></img>
                  </div>
                  <div className="yw-channelqrcode-info-name">
                    {channelInfo?.title}
                  </div>
                </div>

                <div className="yw-channelqrcode-qrcode-box">
                  {channelInfo?.orgData?.invite === 1 && vm.qrcodeResp ? (
                    <div className="yw-channelqrcode-qrcode-mask">
                      <p>该群已开启进群验证</p>
                      <p>只可通过邀请进群</p>
                    </div>
                  ) : undefined}

                  <div className="yw-channelqrcode-qrcode">
                    {vm.qrcodeResp ? undefined : (
                      <div className="yw-channelqrcode-qrcode-loading">
                        <Spin></Spin>
                      </div>
                    )}
                    {vm.qrcodeResp ? (
                      <QRCode
                        value={vm.qrcodeResp?.qrcode || ""}
                        size={250}
                        fgColor="#000000"
                      ></QRCode>
                    ) : undefined}
                  </div>
                  {vm.qrcodeResp ? (
                    <div className="yw-channelqrcode-expire">
                      该二维码7天内({vm.qrcodeResp.expire}
                      )前有效，重新进入将更新
                    </div>
                  ) : undefined}
                </div>
              </div>
            </div>
          );
        }}
      ></Provider>
    );
  }
}
