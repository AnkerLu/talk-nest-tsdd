import axios from "axios";
import React, { Component } from "react";
import { Button, Checkbox, Spin, Toast } from "@douyinfe/semi-ui";
import "./login.css";
import QRCode from "qrcode.react";
import { Provider } from "@yuwo/base";
import { DeviceInfo, LoginStatus, LoginType, LoginVM } from "./login_vm";
import classNames from "classnames";

type LoginState = {
  loginStatus: string;
  loginUUID: string;
  getLoginUUIDLoading: boolean;
  scanner?: string; // 扫描者的uid
  qrcode?: string;
};

class Login extends Component<any, LoginState> {
  // 获取设备信息
  getDeviceInfo(): DeviceInfo {
    // 获取浏览器名称和版本
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

  // 生成设备ID
  generateDeviceId(): string {
    const deviceId = Math.random().toString(36).substring(2);
    localStorage.setItem("device_id", deviceId);
    return deviceId;
  }

  // 格式化手机号
  formatPhoneNumber(phone: string): string {
    if (!phone) return "";

    // 移除所有非数字字符
    phone = phone.replace(/\D/g, "");

    // 中国手机号
    if (phone.length === 11 && phone.startsWith("1")) {
      return phone;
    }

    // 其他国际号码
    return phone;
  }

  // 判断是否是手机号
  isPhoneNumber(value: string): boolean {
    return /^[0-9]+$/.test(value);
  }

  handleLogin = async (vm: LoginVM) => {
    if (!vm.username) {
      Toast.error("用户名/手机号不能为空！");
      return;
    }
    if (!vm.password) {
      Toast.error("密码不能为空！");
      return;
    }

    let username = vm.username;
    // 如果输入的是手机号，则进行格式化处理
    if (this.isPhoneNumber(vm.username)) {
      username = this.formatPhoneNumber(vm.username);
    }

    const deviceInfo = this.getDeviceInfo();

    try {
      await vm.requestLoginWithUsernameAndPwd(
        username,
        vm.password,
        deviceInfo
      );

      // 记住密码
      if (vm.rememberPassword) {
        localStorage.setItem("remembered_phone", vm.username);
        localStorage.setItem("remembered_password", window.btoa(vm.password));
      } else {
        localStorage.removeItem("remembered_phone");
        localStorage.removeItem("remembered_password");
      }
    } catch (err: unknown) {
      if (err && typeof err === "object" && "msg" in err) {
        Toast.error(err.msg);
      } else {
        Toast.error("登录失败");
      }
    }
  };

  render() {
    return (
      <Provider
        create={() => {
          return new LoginVM();
        }}
        render={(vm: LoginVM) => {
          return (
            <div className="yw-login">
              <div className="yw-login-panel">
                <div className="yw-login-content-header">
                  <div className="yw-login-content-logo">
                    <img
                      src={`${process.env.PUBLIC_URL}/logo.png`}
                      alt="logo"
                    />
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
                          active: vm.loginType === LoginType.phone,
                        })}
                        onClick={() => (vm.loginType = LoginType.phone)}
                      >
                        账号登录
                      </div>
                      <div
                        className={classNames("yw-login-tab-item", {
                          active: vm.loginType === LoginType.qrcode,
                        })}
                        onClick={() => (vm.loginType = LoginType.qrcode)}
                      >
                        扫码登录
                      </div>
                    </div>

                    <div className="yw-login-content-container">
                      <div
                        className={classNames("yw-login-content-phonelogin", {
                          "yw-login-content-phonelogin-show":
                            vm.loginType === LoginType.phone,
                        })}
                      >
                        <div className="yw-login-content-form">
                          <input
                            type="text"
                            placeholder="手机号/用户名"
                            defaultValue={
                              localStorage.getItem("remembered_phone") || ""
                            }
                            onChange={(v) => {
                              vm.username = v.target.value;
                            }}
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                this.handleLogin(vm);
                              }
                            }}
                          />
                          <div className="yw-login-password-wrapper">
                            <input
                              type="password"
                              placeholder="密码"
                              defaultValue={
                                localStorage.getItem("remembered_password")
                                  ? window.atob(
                                      localStorage.getItem(
                                        "remembered_password"
                                      )!
                                    )
                                  : ""
                              }
                              onChange={(v) => {
                                vm.password = v.target.value;
                              }}
                              onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                  this.handleLogin(vm);
                                }
                              }}
                            />
                            <i className="password-eye"></i>
                          </div>

                          {/* <div className="yw-login-remember">
                            <Checkbox
                              checked={vm.rememberPassword}
                              onChange={(e) =>
                                (vm.rememberPassword = e.target
                                  .checked as boolean)
                              }
                            >
                              记住密码
                            </Checkbox>
                          </div> */}

                          <Button
                            loading={vm.loginLoading}
                            className="yw-login-button"
                            type="primary"
                            theme="solid"
                            onClick={() => this.handleLogin(vm)}
                          >
                            登录
                          </Button>
                          <div className="yw-login-options">
                            <a
                              onClick={() =>
                                (window.location.href = "/register")
                              }
                            >
                              注册
                            </a>
                            <a
                              onClick={() =>
                                (window.location.href = "/forgot-password")
                              }
                            >
                              忘记密码
                            </a>
                          </div>
                        </div>
                      </div>

                      <div
                        className={classNames("yw-login-content-scanlogin", {
                          "yw-login-content-scanlogin-show":
                            vm.loginType === LoginType.qrcode,
                        })}
                      >
                        <div className="yw-login-content-wrapper">
                          <div className="yw-login-qrcode-tip">
                            请使用<span className="highlight">手机语窝</span>
                            扫描二维码登录
                            {/* {vm.countdown > 0 && (
                              <span className="countdown">
                                ，{vm.countdown}秒后二维码失效
                              </span>
                            )} */}
                          </div>

                          <div className="yw-login-content-scanlogin-qrcode">
                            <Spin size="large" spinning={vm.qrcodeLoading}>
                              {vm.qrcodeLoading || !vm.qrcode ? undefined : (
                                <QRCode
                                  value={vm.qrcode}
                                  size={240}
                                  fgColor="#c7000b"
                                />
                              )}
                            </Spin>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="yw-login-panel yw-login-bg"></div>
            </div>
          );
        }}
      ></Provider>
    );
  }
}

export default Login;
