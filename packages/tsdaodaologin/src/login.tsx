import axios from "axios";
import React, { Component } from "react";
import { Button, Spin, Toast } from "@douyinfe/semi-ui";
import "./login.css";
import QRCode from "qrcode.react";
import { WKApp, Provider } from "@tsdaodao/base";
import { LoginStatus, LoginType, LoginVM } from "./login_vm";
import classNames from "classnames";

type LoginState = {
  loginStatus: string;
  loginUUID: string;
  getLoginUUIDLoading: boolean;
  scanner?: string; // 扫描者的uid
  qrcode?: string;
};

class Login extends Component<any, LoginState> {
  handleLogin = async (vm: LoginVM) => {
    if (!vm.username) {
      Toast.error("手机号不能为空！");
      return;
    }
    if (!vm.password) {
      Toast.error("密码不能为空！");
      return;
    }
    let fullPhone = vm.username;
    if (vm.username.length == 11 && vm.username.substring(0, 1) === "1") {
      fullPhone = `0086${vm.username}`;
    } else {
      if (vm.username.startsWith("+")) {
        fullPhone = `00${vm.username.substring(1)}`;
      } else if (!vm.username.startsWith("00")) {
        fullPhone = `00${vm.username}`;
      }
    }
    vm.requestLoginWithUsernameAndPwd(fullPhone, vm.password).catch((err) => {
      Toast.error(err.msg);
    });
  };

  render() {
    return (
      <Provider
        create={() => {
          return new LoginVM();
        }}
        render={(vm: LoginVM) => {
          return (
            <div className="wk-login">
              <div className="wk-login-panel">
                <div className="wk-login-content-header">
                  <div className="wk-login-content-logo">
                    <img
                      src={`${process.env.PUBLIC_URL}/logo.png`}
                      alt="logo"
                    />
                    <span className="wk-login-content-logo-title">语窝</span>
                  </div>
                  <div className="wk-login-content-slogan">
                    更愉快的与朋友交流
                  </div>
                </div>

                <div className="wk-login-content">
                  <div className="wk-login-card">
                    <div className="wk-login-tabs">
                      <div
                        className={classNames("wk-login-tab-item", {
                          active: vm.loginType === LoginType.phone,
                        })}
                        onClick={() => (vm.loginType = LoginType.phone)}
                      >
                        手机号登录
                      </div>
                      <div
                        className={classNames("wk-login-tab-item", {
                          active: vm.loginType === LoginType.qrcode,
                        })}
                        onClick={() => (vm.loginType = LoginType.qrcode)}
                      >
                        扫码登录
                      </div>
                    </div>

                    <div className="wk-login-content-container">
                      <div
                        className={classNames("wk-login-content-phonelogin", {
                          "wk-login-content-phonelogin-show":
                            vm.loginType === LoginType.phone,
                        })}
                      >
                        <div className="wk-login-content-form">
                          <input
                            type="text"
                            placeholder="手机号"
                            onChange={(v) => {
                              vm.username = v.target.value;
                            }}
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                this.handleLogin(vm);
                              }
                            }}
                          />
                          <div className="wk-login-password-wrapper">
                            <input
                              type="password"
                              placeholder="密码"
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
                          <Button
                            loading={vm.loginLoading}
                            className="wk-login-button"
                            type="primary"
                            theme="solid"
                            onClick={() => this.handleLogin(vm)}
                          >
                            登录
                          </Button>
                          <div className="wk-login-options">
                            <span>注册</span>
                            <span>忘记密码</span>
                          </div>
                        </div>
                      </div>

                      <div
                        className={classNames("wk-login-content-scanlogin", {
                          "wk-login-content-scanlogin-show":
                            vm.loginType === LoginType.qrcode,
                        })}
                      >
                        <div className="wk-login-content-wrapper">
                          <div className="wk-login-qrcode-tip">
                            请使用<span className="highlight">手机语窝</span>
                            扫描二维码登录
                            {vm.countdown > 0 && (
                              <span className="countdown">
                                ，{vm.countdown}秒后二维码失效
                              </span>
                            )}
                          </div>

                          <div className="wk-login-content-scanlogin-qrcode">
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
              <div className="wk-login-panel wk-login-bg"></div>
            </div>
          );
        }}
      ></Provider>
    );
  }
}

export default Login;
