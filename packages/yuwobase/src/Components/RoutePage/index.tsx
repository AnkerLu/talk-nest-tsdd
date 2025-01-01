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
import SVGIcon from "../SVGIcon";

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
  private routeRef: React.RefObject<HTMLDivElement>;
  viewQueueContext!: WKViewQueueContext;
  constructor(props: RoutePageProps) {
    super(props);
    this.routeRef = React.createRef();
    this.state = {
      pushViewCount: 0,
      routeConfigs: [],
      finishButtonDisable: false,
      finishButtonLoading: false,
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

  // componentDidMount() {
  //   document.addEventListener("mousedown", this.handleClickOutside);
  // }

  // componentWillUnmount() {
  //   document.removeEventListener("mousedown", this.handleClickOutside);
  // }

  handleClickOutside = (event: MouseEvent) => {
    const routeElement = document.querySelector(".yw-route");
    if (routeElement?.contains(event.target as Node)) {
      return;
    }

    // 关闭时，先关闭视图
    if (this.props.onClose) {
      this.props.onClose();
    }

    // 延迟 500ms 后，再回到根视图
    const timer = setTimeout(() => {
      this.popToRoot();
      clearTimeout(timer);
    }, 500);
  };

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
      <div ref={this.routeRef} className="yw-route">
        <div
          className={classNames("yw-route-header", {
            "yw-route-header--modal": type === "modal",
            "yw-route-header--setting": type === "setting",
            "yw-route-header--chat": type === "chat",
          })}
        >
          <div className="yw-route-header-left">
            {pushViewCount > 0 ? (
              <SVGIcon name="arrow-left" onClick={() => this.pop()} />
            ) : null}

            <div className="yw-route-header-title">
              <span className="yw-route-header-title-text">
                {pushViewCount > 0 ? routeConfig?.title : title}
              </span>
            </div>
          </div>

          <div className="yw-route-header-right">
            {pushViewCount === 0 && onClose ? (
              <SVGIcon name="close" onClick={onClose} />
            ) : null}

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
            ) : null}
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
