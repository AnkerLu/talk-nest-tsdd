import classNames from "classnames";
import React, { HTMLProps } from "react";
import { Component, ReactNode } from "react";

import "./index.css";
import WKApp from "../../App";

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
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 20 20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M14.5643 1.9014L14.5644 1.90141C15.6903 2.05227 16.464 2.35286 17.0546 2.94447L17.0551 2.94494C17.6458 3.5357 17.9465 4.30988 18.0987 5.43641C18.2484 6.55397 18.25 8.00592 18.25 9.94995V10.0501C18.25 11.9932 18.2484 13.4467 18.0986 14.5643L18.0986 14.5644C17.9477 15.6903 17.6471 16.464 17.0555 17.0546L17.0551 17.0551C16.4643 17.6458 15.6901 17.9465 14.5636 18.0987C13.446 18.2484 11.9941 18.25 10.0501 18.25H9.94995C8.00681 18.25 6.55334 18.2484 5.43568 18.0986L5.43562 18.0986C4.30972 17.9477 3.53598 17.6471 2.9454 17.0555L2.94447 17.0546C2.3532 16.4644 2.05363 15.691 1.90136 14.5639C1.75155 13.4463 1.75 11.9943 1.75 10.0501V9.94995C1.75 8.00681 1.75155 6.55333 1.9014 5.43568L1.90141 5.43562C2.05227 4.30972 2.35286 3.53597 2.94447 2.9454L2.9454 2.94447C3.53565 2.35319 4.30905 2.05362 5.43611 1.90135C6.55371 1.75155 8.00575 1.75 9.94995 1.75H10.0501C11.9932 1.75 13.4467 1.75155 14.5643 1.9014Z"
                                  stroke="#FF7D3B"
                                  stroke-width="1.5"
                                />
                                <path
                                  d="M9.12109 13.5128C9.12109 13.0281 9.51492 12.6343 9.99962 12.6343H10.0075C10.2345 12.6431 10.4492 12.7394 10.6066 12.9031C10.7641 13.0668 10.852 13.285 10.852 13.5121C10.852 13.7393 10.7641 13.9575 10.6066 14.1212C10.4492 14.2849 10.2345 14.3812 10.0075 14.39H9.99962C9.76685 14.39 9.54359 14.2976 9.37887 14.1332C9.21416 13.9687 9.12144 13.7456 9.12109 13.5128ZM9.34106 10.8785C9.34106 11.0532 9.41044 11.2207 9.53395 11.3442C9.65745 11.4677 9.82496 11.5371 9.99962 11.5371C10.1743 11.5371 10.3418 11.4677 10.4653 11.3442C10.5888 11.2207 10.6582 11.0532 10.6582 10.8785V5.60998C10.6582 5.43532 10.5888 5.26781 10.4653 5.14431C10.3418 5.0208 10.1743 4.95142 9.99962 4.95142C9.82496 4.95142 9.65745 5.0208 9.53395 5.14431C9.41044 5.26781 9.34106 5.43532 9.34106 5.60998V10.8785Z"
                                  fill="#FF7D3B"
                                />
                              </svg>
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
