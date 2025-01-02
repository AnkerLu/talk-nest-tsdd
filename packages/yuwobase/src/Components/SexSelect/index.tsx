import React from "react";
import { Component } from "react";
import { IconCheckboxTick } from "@douyinfe/semi-icons";
import "./index.css";
import SVGIcon from "../SVGIcon";

export enum Sex {
  Female,
  Male,
}

export interface SexSelectProps {
  sex: Sex;
  onSelect?: (sex: Sex) => void;
}

export interface SexSelectState {
  currentSex: Sex;
}

export class SexSelect extends Component<SexSelectProps, SexSelectState> {
  render() {
    const { onSelect, sex } = this.props;
    return (
      <div className="yw-sex-select">
        <div
          className="yw-sex-select-item"
          onClick={() => {
            if (onSelect) {
              onSelect(Sex.Male);
            }
          }}
        >
          <div className="yw-sex-select-item sex">男</div>
          <div
            style={{ visibility: `${sex == Sex.Male ? "unset" : "hidden"}` }}
          >
            <SVGIcon name="sure" size={16} />
          </div>
        </div>
        <div
          className="yw-sex-select-item"
          onClick={() => {
            if (onSelect) {
              onSelect(Sex.Female);
            }
          }}
        >
          <div className="yw-sex-select-item sex">女</div>
          <div
            style={{ visibility: `${sex == Sex.Female ? "unset" : "hidden"}` }}
          >
            <SVGIcon name="sure" size={16} />
          </div>
        </div>
      </div>
    );
  }
}
