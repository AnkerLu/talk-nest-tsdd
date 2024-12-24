import { ProviderListener, WKApp } from "@yuwo/base";
import { DeviceInfo } from "./login_vm";

export class RegisterVM extends ProviderListener {
  zone: string = "86";
  phone: string = "";
  code: string = "";
  password: string = "";
  name: string = "";
  invite_code: string = "";
  registerType: number = 1;
  username: string = "";
  registerLoading: boolean = false;

  setRegisterType(type: number) {
    this.registerType = type;
    this.notifyListener();
  }

  // 注册请求
  async requestRegister(deviceInfo: DeviceInfo) {
    if (this.registerLoading) {
      return;
    }

    // 表单验证
    if (this.registerType === 1) {
      if (!this.phone) {
        throw { msg: "手机号不能为空！" };
      }
      if (!this.code) {
        throw { msg: "验证码不能为空！" };
      }
    } else {
      if (!this.username) {
        throw { msg: "用户名不能为空！" };
      }
    }

    if (!this.password) {
      throw { msg: "密码不能为空！" };
    }

    this.registerLoading = true;
    this.notifyListener();

    try {
      const result = await WKApp.apiClient.post("user/register", {
        zone: this.zone,
        phone: this.phone,
        code: this.code,
        flag: 1, // PC端
        password: this.password,
        name: this.name,
        invite_code: this.invite_code,
        device: deviceInfo,
        registerType: this.registerType,
        username: this.username,
      });

      // 注册成功后直接处理登录
      this.registerSuccess(result);
      return result;
    } finally {
      this.registerLoading = false;
      this.notifyListener();
    }
  }

  // 注册成功处理
  registerSuccess(data: any) {
    const loginInfo = WKApp.loginInfo;
    loginInfo.appID = data.app_id;
    loginInfo.uid = data.uid;
    loginInfo.shortNo = data.short_no;
    loginInfo.token = data.token;
    loginInfo.name = data.name;
    loginInfo.sex = data.sex;
    loginInfo.save();

    WKApp.endpoints.callOnLogin();
  }
}
