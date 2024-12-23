import { Channel, ChannelTypePerson, WKSDK } from "wukongimjssdk";

export const generateFallbackAvatar = (
  nameOrChannel: string | Channel,
  size: number = 40
) => {
  let name = "";

  if (typeof nameOrChannel === "string") {
    name = nameOrChannel;
  } else {
    // 如果传入的是Channel对象
    const channelInfo =
      WKSDK.shared().channelManager.getChannelInfo(nameOrChannel);
    name = channelInfo?.orgData?.displayName || channelInfo?.title || "";
  }

  if (!name) return "";

  // 检查是否为emoji
  const emojiRegex = /\p{Extended_Pictographic}/u;
  let initial = "";

  if (emojiRegex.test(name)) {
    initial = name[0]; // 如果是emoji，直接使用第一个字符
  } else {
    initial = name.charAt(0).toUpperCase(); // 其他情况取首字符并转大写
  }

  const canvas = document.createElement("canvas");
  const scale = 2;
  canvas.width = size * scale;
  canvas.height = size * scale;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    ctx.scale(scale, scale);
    ctx.fillStyle = "#2B69DA";
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = "#fff";
    ctx.font = `bold ${
      size / 2
    }px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.fillText(initial, size / 2, size / 2);
  }

  return canvas.toDataURL("image/png", 1.0);
};
