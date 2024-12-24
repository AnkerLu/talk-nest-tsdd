import React, { Component } from "react";
import { WKApp, WKBase, Provider } from "@yuwo/base";
import { listen } from "@tauri-apps/api/event";
// import Provider from "limbase/src/Service/Provider";
import { MainPage } from "../Pages/Main";
import { Notification as NotificationUI, Button } from "@douyinfe/semi-ui";
import {
  checkUpdate,
  installUpdate,
  UpdateManifest,
} from "@tauri-apps/api/updater";
import { relaunch } from "@tauri-apps/api/process";
import { os } from "@tauri-apps/api";

const NOT_NEED_AUTH_PATH = ["/login", "/register", "/forget_pwd"];

export default class AppLayout extends Component {
  onLogin!: () => void;
  componentDidMount() {
    this.onLogin = () => {
      console.log("登录成功！");
      window.location.href = "./index.html";

      Notification.requestPermission(); // 请求通知权限
    };
    WKApp.endpoints.addOnLogin(this.onLogin);

    this.tauriCheckUpdate();
  }

  componentWillUnmount() {
    WKApp.endpoints.removeOnLogin(this.onLogin);
  }

  async tauriCheckUpdate() {
    if (!(window as any).__TAURI_IPC__) {
      return;
    }

    listen("tauri://update-status", function (res) {
      console.log("New status: ", res);
    });

    try {
      const { shouldUpdate, manifest } = await checkUpdate();
      if (shouldUpdate) {
        // display dialog
        console.log(
          `Installing update ${manifest.version}, ${manifest?.date}, ${manifest.body}`
        );
        if ((await os.platform()) === "darwin") {
          // mac 自动下载更新
          await installUpdate();
        }
        this.showUpdateUI(manifest);
      }
      console.log("manifest---->", manifest);
    } catch (error) {
      console.log(error);
    }
  }

  showUpdateUI(manifest: UpdateManifest) {
    const notifyID = NotificationUI.info({
      title: `有新版本 ${manifest.version}`,
      duration: 0,
      content: (
        <>
          <div>{manifest.body}</div>
          <div style={{ marginTop: 8 }}>
            <Button
              onClick={async () => {
                // install complete, restart app
                if ((await os.platform()) !== "darwin") {
                  await installUpdate();
                }
                await relaunch();
              }}
            >
              更新
            </Button>
            <Button
              onClick={() => {
                NotificationUI.close(notifyID);
              }}
              type="secondary"
              style={{ marginLeft: 20 }}
            >
              下次
            </Button>
          </div>
        </>
      ),
    });
  }

  showProgressUI() {}

  render() {
    return (
      <Provider
        create={() => {
          return WKApp.shared;
        }}
        render={(vm: WKApp): any => {
          const currentPath = window.location.pathname;
          const isAuthRequired = !NOT_NEED_AUTH_PATH.includes(currentPath);
          const isLoggedIn = WKApp.shared.isLogined();

          // 需要认证但未登录，跳转到登录页
          if (isAuthRequired && !isLoggedIn) {
            const loginComponent = WKApp.route.get("/login");
            if (!loginComponent) {
              return <div>没有登录模块！</div>;
            }
            return loginComponent;
          }

          // 不需要认证的路由，直接渲染对应组件
          if (!isAuthRequired) {
            const routeComponent = WKApp.route.get(currentPath);
            if (!routeComponent) {
              return <div>没有找到对应模块！</div>;
            }
            return routeComponent;
          }

          // 已登录或其他情况，显示主页面
          return (
            <WKBase
              onContext={(ctx) => {
                WKApp.shared.baseContext = ctx;
              }}
            >
              <MainPage />
            </WKBase>
          );
        }}
      />
    );
  }
}
