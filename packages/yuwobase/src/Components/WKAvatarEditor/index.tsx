import React from "react";
import { Component } from "react";
import AvatarEditor from "react-avatar-editor";

const YWAvatarEditor = AvatarEditor as any;

interface WKAvatarEditorProps {
  file: any;
}

export class WKAvatarEditor extends Component<WKAvatarEditorProps> {
  editor?: AvatarEditor | null;

  getImageScaledToCanvas(): HTMLCanvasElement | undefined {
    return this.editor?.getImageScaledToCanvas();
  }

  render(): React.ReactNode {
    const { file } = this.props;
    return (
      <YWAvatarEditor
        ref={(rf: any) => {
          this.editor = rf;
        }}
        image={file}
        width={262}
        height={262}
        border={70}
        color={[255, 255, 255, 0.6]} // RGBA
        borderRadius={280}
        scale={1.2}
        rotate={0}
      />
    );
  }
}
