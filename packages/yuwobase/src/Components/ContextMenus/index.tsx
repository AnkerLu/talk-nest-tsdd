import classNames from "classnames";
import React, { HTMLProps } from "react";
import { Component, ReactNode } from "react";

import "./index.css";
import WKApp from "../../App";
import SVGIcon from "../SVGIcon";

export interface ContextMenusProps {
  onContext: (context: ContextMenusContext) => void;
  menus?: ContextMenusData[];
}

export interface ContextMenusState {
  contextOrigin: number;
  showContextMenus: boolean;
}

export interface ContextMenusContext {
  show(event: React.MouseEvent<Element, MouseEvent>): void;
  hide(): void;
  isShow(): boolean;
}

export class ContextMenusData {
  title!: string;
  onClick?: () => void;
  isDangerous?: boolean;
}

export default class ContextMenus
  extends Component<ContextMenusProps, ContextMenusState>
  implements ContextMenusContext
{
  _gHandleClick!: () => void;
  constructor(props: any) {
    super(props);
    this.state = {
      contextOrigin: 0,
      showContextMenus: false,
    };
    this._gHandleClick = this._handleClick.bind(this);
  }
  isShow(): boolean {
    return this.state.showContextMenus;
  }
  _handleClick() {
    this.hide();
  }
  _handleScroll() {
    this.hide();
  }
  hide(): void {
    this.setState({
      showContextMenus: false,
    });
  }
  show(event: React.MouseEvent<Element, MouseEvent>): void {
    event.preventDefault();
    if (!this.contextMenusRef) {
      return;
    }
    const clickX = event.clientX;
    const clickY = event.clientY;
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;
    const rootW = this.contextMenusRef.offsetWidth || 0;
    const rootH = this.contextMenusRef.offsetHeight || 0;

    const showBottom = screenH - clickY <= rootH;
    const showLeft = screenW - clickX <= rootW;

    if (showLeft) {
      this.contextMenusRef.style.left = `${clickX - rootW}px`;
    } else {
      this.contextMenusRef.style.left = `${clickX + 5}px`;
    }

    if (showBottom) {
      this.contextMenusRef.style.top = `${clickY - rootH}px`;
      this.setState({
        contextOrigin: rootH,
        showContextMenus: true,
      });
    } else {
      this.contextMenusRef.style.top = `${clickY}px`;
      this.setState({
        contextOrigin: 0,
        showContextMenus: true,
      });
    }
  }

  contextMenusRef!: HTMLDivElement | null;

  componentDidMount() {
    const { onContext } = this.props;
    if (onContext) {
      onContext(this);
    }
  }

  componentWillUnmount() {}

  render(): ReactNode {
    const { showContextMenus, contextOrigin } = this.state;
    const { menus } = this.props;
    return (
      <>
        <div
          className={classNames(
            "yw-contextmenus",
            showContextMenus && "yw-contextmenus-open"
          )}
          ref={(ref) => {
            this.contextMenusRef = ref;
          }}
          style={{ transformOrigin: `-3px ${contextOrigin}px` }}
        >
          <ul>
            {menus &&
              menus.map((m, i) => {
                return (
                  <li
                    key={i}
                    onClick={() => {
                      if (m.isDangerous) {
                        WKApp.shared.baseContext.showAlert({
                          title: (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                              }}
                            >
                              <SVGIcon name="warning" />
                              确认{m.title}？
                            </div>
                          ),
                          content: getConfirmContent(m.title),
                          onOk: () => {
                            this.hide();
                            m.onClick?.();
                          },
                        });
                      } else {
                        this.hide();
                        m.onClick?.();
                      }
                    }}
                  >
                    {m.title}
                  </li>
                );
              })}
          </ul>
        </div>
        <div
          className="yw-contextmenus-mask"
          style={{ visibility: showContextMenus ? "visible" : "hidden" }}
          onClick={() => {
            this._handleClick();
          }}
        ></div>
      </>
    );
  }
}

const getConfirmContent = (title: string) => {
  switch (title) {
    case "删除":
      return "删除后将无法恢复，确定要删除吗？";
    case "撤回":
      return "确定要撤回这条消息吗？";
    case "退出群聊":
      return "退出后不会接收此群的消息，确定要退出吗？";
    case "解散群聊":
      return "解散后，所有成员将被移出群聊，且不会再收到此群的消息，确定解散吗？";
    case "清空聊天记录":
      return "清空后，将无法恢复，确定要清空吗？";
    case "关闭窗口并清空聊天记录":
      return "关闭窗口并清空聊天记录，确定要关闭吗？";
    default:
      return `确定要${title}吗？`;
  }
};
