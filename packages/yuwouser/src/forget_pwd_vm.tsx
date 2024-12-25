import { ProviderListener, WKApp } from "@yuwo/base";

export class ForgetPwdVM extends ProviderListener {
  zone: string = "86";
  phone: string = "";
  code: string = "";
  pwd: string = "";
  loading: boolean = false;

  // 重置密码请求
  async requestResetPassword() {
    if (this.loading) {
      return;
    }

    // 表单验证
    if (!this.phone) {
      throw { msg: "手机号不能为空！" };
    }
    if (!this.code) {
      throw { msg: "验证码不能为空！" };
    }
    if (!this.pwd) {
      throw { msg: "新密码不能为空！" };
    }

    this.loading = true;
    this.notifyListener();

    try {
      await WKApp.apiClient.post("user/pwdforget", {
        zone: this.zone,
        phone: this.phone,
        code: this.code,
        pwd: this.pwd,
      });
      return true;
    } finally {
      this.loading = false;
      this.notifyListener();
    }
  }
}
