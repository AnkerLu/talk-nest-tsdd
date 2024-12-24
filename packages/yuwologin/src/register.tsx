import React, { Component } from "react";
import { Button, Toast } from "@douyinfe/semi-ui";
import { Provider, WKApp } from "@yuwo/base";
import { RegisterVM } from "./register_vm";
import classNames from "classnames";
import "./login.css";

type RegisterState = {
  getCodeLoading: boolean;
};

export type DeviceInfo = {
  device_id: string;
  device_name: string;
  device_model: string;
};

class Register extends Component<any, RegisterState> {
  state = {
    getCodeLoading: false,
  };

  // 复用 Login 组件的设备信息方法
  getDeviceInfo(): DeviceInfo {
    const ua = navigator.userAgent;
    let browserName = "Unknown";
    if (ua.indexOf("Chrome") > -1) {
      browserName = "Chrome";
    } else if (ua.indexOf("Firefox") > -1) {
      browserName = "Firefox";
    } else if (ua.indexOf("Safari") > -1) {
      browserName = "Safari";
    } else if (ua.indexOf("Edge") > -1) {
      browserName = "Edge";
    }

    return {
      device_id: localStorage.getItem("device_id") || this.generateDeviceId(),
      device_name: browserName,
      device_model: navigator.platform,
    };
  }

  generateDeviceId(): string {
    const deviceId = Math.random().toString(36).substring(2);
    localStorage.setItem("device_id", deviceId);
    return deviceId;
  }

  handleRegister = async (vm: RegisterVM) => {
    const deviceInfo = this.getDeviceInfo();

    try {
      await vm.requestRegister(deviceInfo);
      Toast.success("注册成功！");
      // 注册成功后直接跳转到首页
      window.location.href = "/";
    } catch (err: any) {
      Toast.error(err.msg || "注册失败");
    }
  };

  render() {
    return (
      <Provider
        create={() => new RegisterVM()}
        render={(vm: RegisterVM) => (
          <div className="yw-login">
            <div className="yw-login-panel">
              <div className="yw-login-content-header">
                <div className="yw-login-content-logo">
                  <img src={`${process.env.PUBLIC_URL}/logo.png`} alt="logo" />
                  <span className="yw-login-content-logo-title">语窝</span>
                </div>
                <div className="yw-login-content-slogan">
                  更愉快的与朋友交流
                </div>
              </div>

              <div className="yw-login-content">
                <div className="yw-login-card">
                  <div className="yw-login-tabs">
                    <div
                      className={classNames("yw-login-tab-item", {
                        active: vm.registerType === 1,
                      })}
                      onClick={() => vm.setRegisterType(1)}
                    >
                      手机号注册
                    </div>
                    <div
                      className={classNames("yw-login-tab-item", {
                        active: vm.registerType === 2,
                      })}
                      onClick={() => vm.setRegisterType(2)}
                    >
                      用户名注册
                    </div>
                  </div>

                  <div className="yw-login-content-form">
                    {vm.registerType === 1 ? (
                      <>
                        <input
                          type="text"
                          placeholder="手机号"
                          onChange={(e) => (vm.phone = e.target.value)}
                        />
                        <div className="yw-login-verify-code">
                          <input
                            type="text"
                            placeholder="验证码"
                            onChange={(e) => (vm.code = e.target.value)}
                          />
                          <Button
                            className="verify-code-btn"
                            loading={this.state.getCodeLoading}
                            onClick={() => {
                              // TODO: 获取验证码逻辑
                            }}
                          >
                            获取验证码
                          </Button>
                        </div>
                      </>
                    ) : (
                      <input
                        type="text"
                        placeholder="用户名"
                        onChange={(e) => (vm.username = e.target.value)}
                      />
                    )}

                    <input
                      type="password"
                      placeholder="密码"
                      onChange={(e) => (vm.password = e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="昵称"
                      onChange={(e) => (vm.name = e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="邀请码(选填)"
                      onChange={(e) => (vm.invite_code = e.target.value)}
                    />

                    <div className="yw-login-footer">
                      <Button
                        loading={vm.registerLoading}
                        className="yw-login-button"
                        type="primary"
                        theme="solid"
                        onClick={() => this.handleRegister(vm)}
                      >
                        注册
                      </Button>

                      <div className="yw-login-options">
                        <a onClick={() => (window.location.href = "/login")}>
                          返回登录
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="yw-login-panel yw-login-bg"></div>
          </div>
        )}
      />
    );
  }
}

export default Register;
