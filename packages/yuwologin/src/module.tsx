import { WKApp } from "@yuwo/base";
import { IModule } from "@yuwo/base";
import React from "react";
import Login from "./login";
import Register from "./register";
import ForgetPwd from "./forget_pwd";

export default class LoginModule implements IModule {
  id(): string {
    return "LoginModule";
  }
  init(): void {
    console.log("【LoginModule】初始化");
    WKApp.route.register("/login", () => <Login />);
    WKApp.route.register("/register", () => <Register />);
    WKApp.route.register("/forget_pwd", () => <ForgetPwd />);
  }
}
