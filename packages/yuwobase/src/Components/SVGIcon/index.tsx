import React from "react";
import classNames from "classnames";
import "./index.css";

export interface SVGIconProps {
  name?: string;
  size?: number | string;
  width?: number | string;
  height?: number | string;
  color?: string;
  hoverColor?: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  disabled?: boolean;
  children?: React.ReactNode;
}

const SVGIcon: React.FC<SVGIconProps> = ({
  name,
  size = 20,
  width,
  height,
  color,
  hoverColor,
  className,
  style,
  onClick,
  disabled = false,
  children,
}) => {
  const [svgContent, setSvgContent] = React.useState<string>("");

  React.useEffect(() => {
    if (name) {
      import(`../../assets/svg/${name}.svg`)
        .then((module) => {
          setSvgContent(module.default);
        })
        .catch((err) => {
          console.warn(`Failed to load SVG: ${name}`, err);
        });
    }
  }, [name]);

  const classes = classNames("yw-svg-icon", className, {
    "yw-svg-icon-disabled": disabled,
    "yw-svg-icon-clickable": onClick && !disabled,
  });

  const styles: React.CSSProperties & { [key: string]: string | number } = {
    width: width || (typeof size === "number" ? `${size}px` : size),
    height: height || (typeof size === "number" ? `${size}px` : size),
    "--svg-color": color || "currentColor",
    "--svg-hover-color": hoverColor || color || "currentColor",
    ...style,
  };

  return (
    <div
      className={classes}
      style={styles}
      onClick={!disabled ? onClick : undefined}
    >
      {name && !children ? (
        <img src={svgContent} className="yw-svg-icon-img" alt={name} />
      ) : (
        children
      )}
    </div>
  );
};

export default SVGIcon;
