module.exports = {
  productName: "YuWo",
  appId: "com.talknest.macapp",
  directories: {
    output: "dist-ele",
    buildResources: "resources"
  },
  files: [
    "resources/**/*",
    "out-election/**/*",
    "build/**/*",
    "package.json"
  ],
  // Windows 配置
  win: {
    icon: "resources/icons/icon.ico",
    target: [
      {
        target: "nsis",
        arch: ["x64"]
      }
    ],
    artifactName: "${productName}-Setup-${version}.${ext}",
    signAndEditExecutable: false,
    verifyUpdateCodeSignature: false
  },
  // Mac 配置
  mac: {
    icon: "resources/icons/icon.icns",
    target: [
      {
        target: "dmg",
        arch: ["x64", "arm64"]
      }
    ],
    artifactName: "${productName}-${version}-${os}.${ext}",
    hardenedRuntime: true,
    gatekeeperAssess: false,
    entitlements: "resources/mac/entitlements.mac.plist",
    entitlementsInherit: "resources/mac/entitlements.mac.plist"
  },
  // 确保构建前的准备工作
  beforeBuild: async (context) => {
    console.log('Build context:', context);
    // 可以在这里添加构建前的检查
  },
  afterSign: async (context) => {
    console.log('Sign context:', context);
    // 可以在这里添加签名后的检查
  }
};
