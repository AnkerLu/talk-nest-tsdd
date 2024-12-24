import React, { Component } from "react";
import { Button, Toast } from "@douyinfe/semi-ui";
import { Provider } from "@yuwo/base";
import { ForgetPwdVM } from "./forget_pwd_vm";
import "./login.css";

type ForgetPwdState = {
  getCodeLoading: boolean;
};

class ForgetPwd extends Component<any, ForgetPwdState> {
  state = {
    getCodeLoading: false,
  };

  handleResetPassword = async (vm: ForgetPwdVM) => {
    try {
      await vm.requestResetPassword();
      Toast.success("密码重置成功！");
      // 重置成功后跳转到登录页
      window.location.href = "/login";
    } catch (err: any) {
      Toast.error(err.msg || "密码重置失败");
    }
  };

  render() {
    return (
      <Provider
        create={() => new ForgetPwdVM()}
        render={(vm: ForgetPwdVM) => (
          <div className="yw-login">
            <div className="yw-login-panel">
              <div className="yw-login-content-header">
                <div className="yw-login-content-logo">
                  <img src={`${process.env.PUBLIC_URL}/logo.png`} alt="logo" />
                  <span className="yw-login-content-logo-title">语窝</span>
                </div>
                <div className="yw-login-content-slogan">重置您的密码</div>
              </div>

              <div className="yw-login-content">
                <div className="yw-login-card">
                  <div className="yw-login-content-form">
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
                    <input
                      type="password"
                      placeholder="新密码"
                      onChange={(e) => (vm.pwd = e.target.value)}
                    />

                    <div className="yw-login-footer">
                      <Button
                        loading={vm.loading}
                        className="yw-login-button"
                        type="primary"
                        theme="solid"
                        onClick={() => this.handleResetPassword(vm)}
                      >
                        重置密码
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

export default ForgetPwd;
