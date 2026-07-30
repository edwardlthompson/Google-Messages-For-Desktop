import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("gmfdOnboarding", {
  openDefaultAppsSettings: (): void => {
    ipcRenderer.send("gmfd-onboarding-open-settings");
  },
  openSettingsSearch: (): void => {
    ipcRenderer.send("gmfd-onboarding-open-search");
  },
  minimize: (): void => {
    ipcRenderer.send("gmfd-onboarding-minimize");
  },
  openProtocol: (scheme: string): void => {
    ipcRenderer.send("gmfd-onboarding-open-protocol", scheme);
  },
  checkDefaults: (): Promise<{
    status: Record<string, boolean>;
    allSet: boolean;
    sampleNumber: string;
    mode?: string;
    platform?: string;
  }> => ipcRenderer.invoke("gmfd-onboarding-check-defaults"),
  onRefreshDefaults: (cb: () => void): void => {
    ipcRenderer.on("gmfd-onboarding-refresh-defaults", () => cb());
  },
  complete: (): void => {
    ipcRenderer.send("gmfd-onboarding-complete");
  },
  skip: (): void => {
    ipcRenderer.send("gmfd-onboarding-skip");
  },
  dismissSignIn: (): void => {
    ipcRenderer.send("gmfd-signin-dismiss");
  },
  verifyProtocol: (): void => {
    ipcRenderer.send("gmfd-signin-verify-protocol");
  },
  onSignInStatus: (cb: (signedIn: boolean) => void): void => {
    ipcRenderer.on("gmfd-signin-status", (_e, signedIn: boolean) => cb(signedIn));
  },
  openDonate: (): void => {
    ipcRenderer.send("gmfd-open-donate");
  },
});
