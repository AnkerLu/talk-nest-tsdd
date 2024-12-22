import { WKApp, Menus, ThemeMode, MeInfo } from "@tsdaodao/base";
import classnames from "classnames";
import React from "react";
import { Component } from "react";
import MainVM, { VersionInfo } from "./vm";
import "./tab_normal_screen.css";
import { Badge, Modal, Toast, Progress, Button } from "@douyinfe/semi-ui";

export interface TabNormalScreenProps {
  vm: MainVM;
}

export class TabNormalScreen extends Component<TabNormalScreenProps> {
  componentDidMount() {
    console.log("Window electron object:", (window as any).electron);
    (window as any).electron?.test?.();

    WKApp.menus.setRefresh = () => {
      this.setState({});
    };
  }
  render() {
    const { vm } = this.props;
    return (
      <div className="yw-main-sider">
        <div className="yw-main-sider-header">
          <div className="yw-main-sider-logo">
            <img
              className="yw-main-sider-logo-img"
              src={`${process.env.PUBLIC_URL}/logo.png`}
              alt="logo"
            />
            <span className="yw-main-sider-logo-title">
              {WKApp.config.appName}
            </span>
          </div>
          <div
            className="yw-main-sider-theme-toggle"
            onClick={() => {
              if (WKApp.config.themeMode === ThemeMode.dark) {
                WKApp.config.themeMode = ThemeMode.light;
              } else {
                WKApp.config.themeMode = ThemeMode.dark;
              }
            }}
          >
            {WKApp.config.themeMode === ThemeMode.dark ? (
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M9.37 5.51A7.35 7.35 0 0 0 9.1 7.5c0 4.08 3.32 7.4 7.4 7.4c.68 0 1.35-.09 1.99-.27A7.014 7.014 0 0 1 12 19c-3.86 0-7-3.14-7-7c0-2.93 1.81-5.45 4.37-6.49zM12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26a5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z"
                />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5s5-2.24 5-5s-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 0 0-1.41 0a.996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 0 0-1.41 0a.996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0a.996.996 0 0 0 0-1.41l-1.06-1.06zm1.06-10.96a.996.996 0 0 0 0-1.41a.996.996 0 0 0-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36a.996.996 0 0 0 0-1.41a.996.996 0 0 0-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"
                />
              </svg>
            )}
          </div>
        </div>
        <ul className="yw-main-sider-content">
          {vm.menusList.map((menus: Menus) => {
            return (
              <li
                className={classnames(
                  "yw-main-sider-item",
                  menus.id === vm.currentMenus?.id ? "selected" : undefined
                )}
                title={menus.title}
                key={menus.id}
                onClick={() => {
                  vm.currentMenus = menus;
                  if (menus.onPress) {
                    menus.onPress();
                  } else {
                    WKApp.routeLeft.popToRoot();
                    // WKApp.route.push(menus.routePath)
                  }
                }}
              >
                {menus.badge && menus.badge > 0 ? (
                  <div className="yw-main-sider-item-badge">
                    <Badge count={menus.badge} type="danger"></Badge>
                  </div>
                ) : undefined}
                {menus.id === vm.currentMenus?.id
                  ? menus.selectedIcon
                  : menus.icon}
                <span className="yw-main-sider-item-title">{menus.title}</span>
              </li>
            );
          })}
        </ul>
        <div
          className="yw-main-sider-setting-box"
          onClick={() => {
            vm.settingSelected = !vm.settingSelected;
          }}
        >
          {vm.hasNewVersion ? (
            <div className="yw-main-sider-setting-badge">
              <Badge type="danger" dot>
                {" "}
              </Badge>
            </div>
          ) : undefined}
          <div
            className={classnames(
              "yw-main-sider-item",
              vm.settingSelected ? "collapsed" : undefined
            )}
          >
            <svg
              viewBox="0 0 1024 1024"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              p-id="26720"
              width="20"
              height="20"
            >
              <path
                d="M885.196958 871.528145c-14.753141-5.464126-25.134981-8.742602-34.970408-12.56749-30.052695-11.474665-59.012564-24.588568-89.611671-34.970408-8.742602-2.732063-21.310093-1.639238-29.506282 2.732063-21.310093 10.38184-42.073773 22.402918-61.744627 36.063234-6.556952 4.371301-12.021078 14.206728-13.660316 22.402918-6.556952 36.063234-11.474665 72.67288-15.845966 109.282526-2.732063 20.76368-12.56749 30.052695-33.877583 29.506282-62.837452-0.546413-125.674905-0.546413-188.512357 0-20.76368 0-31.691933-8.196189-34.423996-28.959869-4.917714-36.609646-10.928253-72.67288-15.299554-109.282526-1.639238-12.56749-6.010539-20.217267-18.031617-26.227806-20.217267-9.835427-38.248884-23.495743-58.466151-33.33117-7.103364-3.824888-18.031617-5.464126-25.681394-2.732063-35.516821 12.56749-69.940817 26.774219-104.911225 40.434535-25.134981 9.835427-32.238345 7.649777-46.445074-16.392379-31.14552-53.002025-61.744627-106.00405-92.343735-159.006075-14.206728-24.588568-13.660316-30.599107 8.742602-48.084311 29.506282-23.495743 59.558977-45.898661 88.518846-69.940817 5.464126-4.371301 9.289015-14.206728 9.289015-21.310093 1.092825-20.217267-3.278476-41.52736 0-61.198215 3.824888-21.310093-4.917714-32.238345-20.217267-43.71301-27.320632-19.670855-52.455613-41.52736-79.229831-61.198215-15.845966-12.021078-19.670855-24.588568-9.289015-42.073773 33.33117-56.280501 66.115928-113.107414 98.900686-169.934328 9.289015-15.845966 21.310093-19.124442 38.248884-12.56749 36.063234 14.206728 72.126467 28.959869 108.736113 42.073773 7.649777 2.732063 19.670855 1.092825 27.320632-2.732063 20.76368-10.38184 39.341709-24.042156 60.105389-34.423996 10.928253-5.464126 14.753141-12.021078 15.845966-22.94933 4.917714-37.156059 10.928253-74.312118 15.845966-111.468177C386.322226 7.649777 397.796892 0 418.014159 0c62.837452 0.546413 125.674905 0.546413 188.512357 0 19.670855 0 30.599107 8.196189 32.784758 27.867044 4.917714 36.609646 10.928253 72.67288 15.299554 109.282526 1.639238 13.660316 6.556952 21.856505 19.670855 27.867044 19.124442 8.742602 37.156059 19.670855 54.641263 31.691933 11.474665 8.196189 21.310093 8.196189 33.877583 2.732063 33.877583-14.206728 68.301579-26.774219 102.725575-40.980947 19.124442-7.649777 32.238345-3.824888 42.620185 14.753141 31.14552 55.187676 63.930278 109.828939 95.62221 164.470202 12.56749 21.856505 10.928253 28.959869-9.289015 44.805836-28.959869 22.402918-57.919739 45.352248-87.426021 67.755166-9.835427 7.649777-12.56749 14.753141-11.474665 27.320632 2.185651 22.94933-0.546413 46.445074 0.546413 69.394404 0.546413 8.196189 4.371301 18.031617 10.38184 22.94933 28.959869 24.042156 59.012564 46.445074 88.518846 69.394404 20.217267 15.845966 21.310093 22.94933 8.742602 44.805836-32.238345 55.734088-64.47669 110.921764-97.261448 166.10944C901.042924 860.05348 891.753909 865.517606 885.196958 871.528145zM510.357893 692.304803c98.900686 0.546413 180.862581-79.776244 181.408993-177.584105 0.546413-100.539924-79.229831-181.955406-178.67693-182.501819-99.447099-0.546413-181.408993 80.322657-181.408993 179.769755C331.134551 610.342908 412.00362 691.75839 510.357893 692.304803z"
                p-id="26721"
                fill="#ffffff"
              ></path>
            </svg>
            <span className="yw-main-sider-item-title">设置</span>
          </div>
        </div>
        <div className="yw-main-sider-avatar">
          <div
            className="yw-main-sider-avatar-box"
            onClick={() => {
              const uid = WKApp.loginInfo.uid;
              WKApp.apiClient
                .get(`/users/${uid}`)
                .then((data) => {
                  const loginInfo = WKApp.loginInfo;
                  loginInfo.shortNo = data.short_no;
                  loginInfo.name = data.name;
                  loginInfo.sex = data.sex;
                  loginInfo.save();

                  vm.showMeInfo = true;
                })
                .catch((err) => {
                  console.log(err);
                });
            }}
          >
            <img
              alt=""
              src={WKApp.shared.avatarUser(WKApp.loginInfo.uid || "")}
            ></img>
            <span className="yw-main-sider-avatar-name">
              {WKApp.loginInfo.name}
            </span>
          </div>
          <svg
            className="yw-main-sider-avatar-logout"
            focusable="false"
            aria-hidden="true"
            viewBox="0 0 24 24"
            data-testid="LogoutRoundedIcon"
            width="24"
            height="24"
            onClick={() => {
              vm.settingSelected = false;
              WKApp.shared.logout();
            }}
          >
            <path d="M5 5h6c.55 0 1-.45 1-1s-.45-1-1-1H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h6c.55 0 1-.45 1-1s-.45-1-1-1H5z"></path>
            <path d="m20.65 11.65-2.79-2.79c-.32-.32-.86-.1-.86.35V11h-7c-.55 0-1 .45-1 1s.45 1 1 1h7v1.79c0 .45.54.67.85.35l2.79-2.79c.2-.19.2-.51.01-.7"></path>
          </svg>
        </div>
        <ul
          className={classnames(
            "yw-sider-setting-list",
            vm.settingSelected ? "open" : undefined
          )}
        >
          <li
            onClick={() => {
              vm.settingSelected = false;
              if ((window as any).__POWERED_ELECTRON__) {
                (window as any).ipc.send("check-update");
              } else {
                if (vm.hasNewVersion) {
                  vm.showNewVersion = true;
                } else {
                  Toast.success("已经是最新版本");
                }
              }
            }}
          >
            检查版本&nbsp;v{WKApp.config.appVersion}&nbsp;
            {vm.hasNewVersion ? <Badge dot type="danger"></Badge> : undefined}
          </li>
          <li
            onClick={() => {
              vm.settingSelected = false;
              WKApp.shared.notificationIsClose =
                !WKApp.shared.notificationIsClose;
            }}
          >
            {WKApp.shared.notificationIsClose ? "打开" : "关闭"}桌面通知
          </li>
        </ul>

        <Modal
          title="检测到新版本信息"
          visible={vm.showNewVersion}
          footer={null}
          onCancel={() => {
            vm.showNewVersion = false;
          }}
        >
          {vm.lastVersionInfo ? (
            <VersionCheckView lastVersion={vm.lastVersionInfo} />
          ) : undefined}
        </Modal>

        <Modal
          title="检测更新"
          visible={vm.showAppVersion}
          centered
          closeOnEsc={false}
          maskClosable={false}
          bodyStyle={{ overflow: "auto", height: 200 }}
          onCancel={() => {
            vm.showAppVersion = false;
            vm.notifyListener();
          }}
          footer={
            vm.showAppUpdateOperation ? (
              <>
                <Button
                  theme="solid"
                  type="tertiary"
                  onClick={() => {
                    vm.showAppVersion = false;
                    vm.notifyListener();
                  }}
                >
                  取消
                </Button>
                <Button
                  theme="solid"
                  type="primary"
                  onClick={() => {
                    vm.installUpdate();
                  }}
                >
                  更新
                </Button>
              </>
            ) : undefined
          }
        >
          {vm.lastVersionInfo ? (
            <div className="yw-versioncheckview">
              <div className="yw-versioncheckview-content">
                <div className="yw-versioncheckview-updateinfo">
                  <ul>
                    <li>
                      当前版本: {WKApp.config.appVersion} &nbsp;&nbsp;目标版本:{" "}
                      {vm.lastVersionInfo.appVersion}
                    </li>
                    <li>更新内容：</li>
                    <li>
                      <pre>{vm.lastVersionInfo.updateDesc}</pre>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          ) : undefined}
          {vm.showAppUpdate ? (
            <Progress
              percent={vm.appUpdateProgress}
              style={{ height: "8px" }}
              showInfo={true}
              aria-label="disk usage"
            />
          ) : undefined}
        </Modal>

        <Modal
          width={400}
          className="yw-main-sider-modal yw-main-sider-meinfo"
          footer={null}
          closeIcon={<div></div>}
          visible={vm.showMeInfo}
          mask={false}
          onCancel={() => {
            vm.showMeInfo = false;
          }}
        >
          <MeInfo
            onClose={() => {
              vm.showMeInfo = false;
            }}
          ></MeInfo>
        </Modal>
      </div>
    );
  }
}

interface VersionCheckViewProps {
  lastVersion: VersionInfo; // 最新版本
}
class VersionCheckView extends Component<VersionCheckViewProps> {
  render() {
    const { lastVersion } = this.props;
    return (
      <div className="yw-versioncheckview">
        <div className="yw-versioncheckview-content">
          <div className="yw-versioncheckview-updateinfo">
            <ul>
              <li>
                当前版本: {WKApp.config.appVersion} &nbsp;&nbsp;目标版本:{" "}
                {lastVersion.appVersion}
              </li>
              <li>更新内容：</li>
              <li>
                <pre>{lastVersion.updateDesc}</pre>
              </li>
            </ul>
          </div>
          <div className="yw-versioncheckview-tip">
            <div className="yw-versioncheckview-tip-title">更新方法：</div>
            <div className="yw-versioncheckview-tip-content">
              <ul>
                <li>
                  1. Windows系统中的某些浏览器: Ctrl + F5刷新。如Chrome谷
                  歌、Opera欧鹏、FireFox火狐浏览器等。
                </li>
                <li>2. MacOS系统的Safari浏览器: Command + Option + R刷新���</li>
                <li>
                  3. MacOS系统中的某些浏览器: Command + Shift +
                  R刷新。如Chrome谷歌、Opera欧鹏、 FireFox火狐浏览器等 。
                </li>
                <li>
                  {`4.浏览器打开"设置" -> "清理浏览数据" ->勾选"缓存的图片和
文件”(其他不勾选) -> "清理" ->刷新页面。`}
                </li>
                <li>5.若上述方法都不行，请直接清理浏览器的数据或缓存。</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
