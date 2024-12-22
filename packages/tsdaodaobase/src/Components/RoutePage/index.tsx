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
    const { title, onClose } = this.props;
    let routeConfig: RouteContextConfig | undefined;
    if (routeConfigs.length > 0) {
      routeConfig = routeConfigs[routeConfigs.length - 1];
    }
    return (
      <div className="yw-route">
        <div className="yw-route-header">
          <div
            className="yw-route-header-close"
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
            <div
              className={classNames(
                "yw-route-header-close-icon",
                pushViewCount > 0 ? "yw-state-back" : undefined
              )}
            ></div>
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
