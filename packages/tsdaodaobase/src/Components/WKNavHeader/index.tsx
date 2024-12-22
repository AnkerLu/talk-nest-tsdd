import React from "react";
import { Component, ReactNode } from "react";
import "./index.css";

export interface WKNavHeaderProps {
  title: string;
  rightView?: JSX.Element;
}

export default class WKNavMainHeader extends Component<WKNavHeaderProps> {
  render(): ReactNode {
    const { rightView, title } = this.props;
    return (
      <div className="yw-navheader">
        <div className="yw-navheader-content">
          <div className="yw-navheader-content-left">
            <div className="yw-navheader-content-left-title">{title}</div>
          </div>
          <div className="yw-navheader-content-right">{rightView}</div>
        </div>
      </div>
    );
  }
}
