import openAboutWindow from "about-window";
import { app, MenuItemConstructorOptions } from "electron";
import path from "path";
import { RESOURCES_PATH } from "../../helpers/constants";

const productName = "Google Messages For Desktop";
const localeStyle =
  "-webkit-app-region: no-drag; position: absolute; left: 0.5em; bottom: 0.5em; font-size: 12px; color: #999";
const disclaimerText =
  "<br><br>Not affiliated with Google in any way.<br>Android is a trademark of Google LLC.";
const creditText =
  "<br><br>Electron shell based on <a href=\"https://github.com/OrangeDrangon/android-messages-desktop\">OrangeDrangon/android-messages-desktop</a> (MIT).<br>This app adds <code>sms:</code>/<code>tel:</code>/<code>smsto:</code>/<code>callto:</code>/<code>im:</code> protocol handlers that start a new text.";
const donateText =
  '<br><br>Support development: <a href="https://venmo.com/code?user_id=1857304970395648420">Donate on Venmo</a>';
const licenseText = `<br><br>${productName} is released under the MIT License.`;

let languageCode = "";
let descriptionWithLocale = "";
app.on("ready", () => {
  languageCode = app.getLocale();
  descriptionWithLocale = `Messages for web, as a desktop app. <a href="https://github.com/edwardlthompson/Google-Messages-For-Desktop">Github Repo</a><span style="${localeStyle}">${languageCode}</span>`;
});

export const aboutMenuItem: MenuItemConstructorOptions = {
  label: `About ${productName}`,
  click: () => {
    openAboutWindow({
      icon_path: path.resolve(RESOURCES_PATH, "icons", "512x512.png"),
      copyright: `<div style="text-align: center">Copyright Google Messages For Desktop contributors${disclaimerText}${creditText}${donateText}${licenseText}</div>`,
      product_name: productName,
      description: descriptionWithLocale,
      open_devtools: false,
      use_inner_html: true,
      win_options: {
        height: 620,
        resizable: false,
        minimizable: false,
        maximizable: false,
        show: false,
      },
    });
  },
};
