import React, { Component, HTMLProps } from "react";
import classNames from "classnames";
import "./index.css";
import RouteContext, {
  FinishButtonContext,
  RouteContextConfig,
} from "../../Service/Context";
import { Button } from "@douyinfe/semi-ui";
import WKViewQueueHeader from "../WKViewQueueHeader";
import WKViewQueue, { WKViewQueueContext } from "../WKViewQueue";

export interface RoutePageState {
  pushViewCount: number;
  routePage?: JSX.Element;
  routeConfigs: Array<RouteContextConfig | undefined>;
  finishButtonDisable: boolean;
  finishButtonLoading: boolean;
}

export interface RoutePageProps {
  title?: string;
  onClose?: () => void;
  render: (context: RouteContext<any>) => React.ReactNode;
  type?: "modal" | "setting" | "chat";
}

export default class RoutePage
  extends Component<RoutePageProps, RoutePageState>
  implements RouteContext<any>, FinishButtonContext
{
  private _routeData: any;
  viewQueueContext!: WKViewQueueContext;
  constructor(props: any) {
    super(props);
    this.state = {
      pushViewCount: 0,
      finishButtonDisable: false,
      finishButtonLoading: false,
      routeConfigs: [],
    };
  }
  loading(loading: boolean): void {
    this.setState({
      finishButtonLoading: loading,
    });
  }
  disable(disable: boolean): void {
    this.setState({
      finishButtonDisable: disable,
    });
  }

  push(view: JSX.Element, config?: RouteContextConfig): void {
    if (config && config.onFinishContext) {
      config.onFinishContext(this);
    }
    const { routeConfigs } = this.state;
    routeConfigs.push(config);
    this.setState({
      routeConfigs: routeConfigs,
      pushViewCount: this.state.pushViewCount + 1,
    });
    this.viewQueueContext.push(view);
    // if(config && config.onFinishContext) {
    //     config.onFinishContext(this)
    // }
    // console.log("config----->",config)
    // this.setState({
    //     pushed: true,
    //     routePage: view,
    //     routeConfig: config,
    // })
  }
  popToRoot(): void {
    this.setState({
      routeConfigs: [],
      pushViewCount: 0,
    });
    this.viewQueueContext.popToRoot();
  }
  pop(): void {
    const { pushViewCount, routeConfigs } = this.state;
    routeConfigs.splice(routeConfigs.length - 1, 1);
    this.setState({
      routeConfigs: routeConfigs,
      pushViewCount: pushViewCount - 1,
    });
    this.viewQueueContext.pop();
  }

  routeData(): any {
    return this._routeData;
  }
  setRouteData(data: any): void {
    this._routeData = data;
  }

  componentWillUnmount() {
    this.setState = (state, callback) => {
      return;
    };
  }

  render() {
    const {
      pushViewCount,
      routeConfigs,
      finishButtonDisable,
      finishButtonLoading,
    } = this.state;
    const { title, onClose, type } = this.props;
    let routeConfig: RouteContextConfig | undefined;
    if (routeConfigs.length > 0) {
      routeConfig = routeConfigs[routeConfigs.length - 1];
    }
    return (
      <div className="yw-route">
        <div
          className={classNames("yw-route-header", {
            "yw-route-header--modal": type === "modal",
            "yw-route-header--setting": type === "setting",
            "yw-route-header--chat": type === "chat",
          })}
        >
          <div
            className={classNames(
              "yw-route-header-action",
              pushViewCount > 0
                ? "yw-route-header-action-left"
                : "yw-route-header-action-right"
            )}
            onClick={() => {
              if (pushViewCount > 0) {
                this.pop();
                return;
              }
              if (onClose) {
                onClose();
              }
            }}
          >
            {pushViewCount > 0 ? (
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12.916 4.16668L7.08268 10L12.916 15.8333"
                  stroke="#666666"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12.7993 8.08475C12.9165 7.96754 12.9823 7.80857 12.9823 7.64281C12.9823 7.47705 12.9165 7.31808 12.7993 7.20087C12.682 7.08366 12.5231 7.01781 12.3573 7.01781C12.1916 7.01781 12.0326 7.08366 11.9154 7.20087L10 9.11625L8.08462 7.20087C7.96741 7.08366 7.80844 7.01781 7.64268 7.01781C7.47692 7.01781 7.31795 7.08366 7.20074 7.20087C7.08353 7.31808 7.01768 7.47705 7.01768 7.64281C7.01768 7.80857 7.08353 7.96754 7.20074 8.08475L9.11612 10.0001L7.20074 11.9155C7.08353 12.0327 7.01768 12.1917 7.01768 12.3574C7.01768 12.5232 7.08353 12.6822 7.20074 12.7994C7.31795 12.9166 7.47692 12.9824 7.64268 12.9824C7.80844 12.9824 7.96741 12.9166 8.08462 12.7994L10 10.884L11.9154 12.7994C12.0326 12.9166 12.1916 12.9824 12.3573 12.9824C12.5231 12.9824 12.682 12.9166 12.7993 12.7994C12.9165 12.6822 12.9823 12.5232 12.9823 12.3574C12.9823 12.1917 12.9165 12.0327 12.7993 11.9155L10.8839 10.0001L12.7993 8.08475Z"
                  fill="#333333"
                />
                <path
                  d="M10.0475 1.45874H9.95249C8.12749 1.45874 6.69249 1.45874 5.57374 1.60874C4.42624 1.76249 3.51624 2.08624 2.80124 2.80124C2.08499 3.51624 1.76374 4.42624 1.60874 5.57374C1.45874 6.69249 1.45874 8.12624 1.45874 9.95249V10.0475C1.45874 11.8725 1.45874 13.3075 1.60874 14.4262C1.76249 15.5737 2.08499 16.4837 2.80124 17.1987C3.51624 17.9137 4.42624 18.2362 5.57374 18.3912C6.69249 18.5412 8.12624 18.5412 9.95249 18.5412H10.0475C11.8725 18.5412 13.3075 18.5412 14.4262 18.3912C15.5737 18.2375 16.4837 17.915 17.1987 17.1987C17.9137 16.4837 18.2362 15.5737 18.3912 14.4262C18.5412 13.3075 18.5412 11.8737 18.5412 10.0475V9.95249C18.5412 8.12749 18.5412 6.69249 18.3912 5.57374C18.2375 4.42624 17.915 3.51624 17.1987 2.80124C16.4837 2.08499 15.5737 1.76374 14.4262 1.60874C13.3075 1.45874 11.8737 1.45874 10.0475 1.45874ZM3.68499 3.68374C4.12874 3.23999 4.73124 2.98374 5.73999 2.84749C6.76624 2.70999 8.11624 2.70874 9.99999 2.70874C11.8837 2.70874 13.2337 2.70874 14.26 2.84749C15.2687 2.98374 15.8712 3.23999 16.315 3.68499C16.76 4.12874 17.0162 4.73124 17.1525 5.73999C17.29 6.76624 17.2912 8.11624 17.2912 9.99999C17.2912 11.8837 17.2912 13.2337 17.1525 14.26C17.0162 15.2687 16.76 15.8712 16.315 16.315C15.8712 16.76 15.2687 17.0162 14.26 17.1525C13.2337 17.29 11.8837 17.2912 9.99999 17.2912C8.11624 17.2912 6.76624 17.2912 5.73999 17.1525C4.73124 17.0162 4.12874 16.76 3.68499 16.315C3.23999 15.8712 2.98374 15.2687 2.84749 14.26C2.70999 13.2337 2.70874 11.8837 2.70874 9.99999C2.70874 8.11624 2.70874 6.76624 2.84749 5.73999C2.98374 4.73124 3.23999 4.12874 3.68499 3.68499V3.68374Z"
                  fill="#333333"
                />
              </svg>
            )}
          </div>

          <div
            className={classNames(
              "yw-route-header-title-box",
              pushViewCount > 0 ? "yw-route-header-title-box-open" : undefined
            )}
          >
            <div className="yw-route-header-title">{title}</div>
            <div className="yw-route-header-title-next">
              {routeConfig?.title}
            </div>
          </div>

          <div
            className={classNames(
              "yw-route-header-right-view",
              pushViewCount > 0 ? "yw-route-header-right-view-open" : undefined
            )}
          >
            {routeConfig?.showFinishButton ? (
              <Button
                disabled={finishButtonDisable}
                loading={finishButtonLoading}
                theme="solid"
                type="primary"
                onClick={() => {
                  if (routeConfig?.onFinish) {
                    routeConfig?.onFinish();
                  }
                }}
              >
                完成
              </Button>
            ) : undefined}
          </div>
        </div>

        <div className="yw-route-box">
          <div className="yw-route-content">
            <WKViewQueue
              onContext={(ctx) => {
                this.viewQueueContext = ctx;
              }}
            >
              {this.props.render(this)}
            </WKViewQueue>
          </div>
        </div>
      </div>
    );
  }
}
