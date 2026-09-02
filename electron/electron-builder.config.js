module.exports = {
  appId: "com.edwardlthompson.google-messages",
  artifactName: "Google.Messages-v${version}-${os}-${arch}.${ext}",
  productName: "Google Messages",
  copyright:
    "Copyright Google Messages For Desktop contributors; based on OrangeDrangon/android-messages-desktop (MIT)",
  files: ["app/**/*", "resources/**/*"],
  directories: {
    buildResources: "resources",
    output: "dist",
  },
  publish: null,
  linux: {
    target: ["AppImage", "deb", "zip"],
    executableName: "GoogleMessages",
    category: "Network",
    mimeTypes: [
      "x-scheme-handler/sms",
      "x-scheme-handler/smsto",
      "x-scheme-handler/tel",
      "x-scheme-handler/callto",
      "x-scheme-handler/im",
      "x-scheme-handler/mms",
    ],
    desktop: {
      entry: {
        Name: "Google Messages",
        Comment: "Google Messages for web with sms/tel/im protocol handlers",
        Categories: "Network;InstantMessaging;",
        StartupWMClass: "Google Messages",
        MimeType:
          "x-scheme-handler/sms;x-scheme-handler/smsto;x-scheme-handler/tel;x-scheme-handler/callto;x-scheme-handler/im;x-scheme-handler/mms;",
      },
    },
  },
  win: {
    target: ["nsis", "portable", "zip"],
    executableName: "GoogleMessages",
  },
  mac: {
    identity: process.env.CSC_LINK ? undefined : null,
    category: "public.app-category.social-networking",
    target: [
      { target: "dmg", arch: ["universal"] },
      { target: "zip", arch: ["universal"] },
    ],
    extendInfo: {
      CFBundleURLTypes: [
        {
          CFBundleURLName: "SMS",
          CFBundleURLSchemes: ["sms", "smsto"],
        },
        {
          CFBundleURLName: "Telephone",
          CFBundleURLSchemes: ["tel", "callto"],
        },
        {
          CFBundleURLName: "Instant Message",
          CFBundleURLSchemes: ["im", "mms"],
        },
      ],
    },
  },
  portable: {
    artifactName: "Google.Messages-v${version}-${os}-${arch}.portable.${ext}",
  },
  nsis: {
    allowToChangeInstallationDirectory: true,
    oneClick: false,
    shortcutName: "Google Messages",
  },
};
