import { Badge } from "@douyinfe/semi-ui";
import React from "react";
import { Component, ReactNode } from "react";
import "./index.css";

export interface IconListItemProps {
  icon: string;
  title: string;
  backgroudColor?: string;
  onClick?: () => void;
  badge?: number;
}

export default class IconListItem extends Component<IconListItemProps> {
  render(): ReactNode {
    const { icon, title, backgroudColor, onClick, badge } = this.props;
    return (
      <div className="yw-iconlistitem" onClick={onClick}>
        <div className="yw-iconlistitem-content">
          <div className="yw-iconlistitem-content-icon">
            <img src={icon}></img>
          </div>
          <div className="yw-iconlistitem-content-title">{title}</div>
          {badge && badge > 0 ? (
            <div className="yw-iconlistitem-content-badge">
              <Badge count={badge} type="danger"></Badge>
            </div>
          ) : undefined}
        </div>
      </div>
    );
  }
}
