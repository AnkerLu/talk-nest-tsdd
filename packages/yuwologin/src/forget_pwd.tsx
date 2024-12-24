import React, { Component } from "react";
import { Button, Toast } from "@douyinfe/semi-ui";
import { Provider } from "@yuwo/base";
import { ForgetPwdVM } from "./forget_pwd_vm";
import "./forget_pwd.css";

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
          <div className="yw-forget">
            <div className="yw-forget-panel">
              <div className="yw-forget-content-header">
                <div className="yw-forget-content-logo">
                  <img src={`${process.env.PUBLIC_URL}/logo.png`} alt="logo" />
                  <span className="yw-forget-content-logo-title">语窝</span>
                </div>
                <div className="yw-forget-content-slogan">重置密码</div>
              </div>

              <div className="yw-forget-content">
                <div className="yw-forget-card">
                  <div className="yw-forget-form">
                    <input
                      type="text"
                      placeholder="手机号"
                      onChange={(e) => (vm.phone = e.target.value)}
                    />
                    <div className="yw-forget-verify-code">
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

                    <Button
                      loading={vm.loading}
                      className="yw-forget-button"
                      onClick={() => this.handleResetPassword(vm)}
                    >
                      重置密码
                    </Button>

                    <div className="yw-forget-options">
                      <a onClick={() => (window.location.href = "/login")}>
                        返回登录
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      />
    );
  }
}

export default ForgetPwd;
