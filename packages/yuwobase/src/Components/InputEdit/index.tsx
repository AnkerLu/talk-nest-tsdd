import { TextArea } from "@douyinfe/semi-ui";
import React from "react";
import { Component } from "react";
import "./index.css";

export interface InputEditProps {
  title?: string;
  onChange?: (value: string, exceeded?: boolean) => void;
  defaultValue?: string;
  placeholder?: string;
  maxCount?: number;
  allowWrap?: boolean;
}

export class InputEdit extends Component<InputEditProps> {
  render() {
    const { title, onChange, defaultValue, placeholder, maxCount, allowWrap } =
      this.props;

    return (
      <div className="yw-inputedit">
        {/* {title && <div className="yw-inputedit-title">{title}</div>} */}
        <TextArea
          defaultValue={defaultValue}
          onChange={(value) => {
            let exceeded = false;
            if (maxCount && value.length > maxCount) {
              exceeded = true;
            }
            if (onChange) {
              onChange(value, exceeded);
            }
          }}
          autosize
          rows={2}
          showClear
          maxCount={maxCount}
          onKeyDown={(e) => {
            if (!allowWrap) {
              if (e.keyCode != 13) return;
              e.preventDefault();
            }
          }}
          placeholder={placeholder}
        />
      </div>
    );
  }
}
