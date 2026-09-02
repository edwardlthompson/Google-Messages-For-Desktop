import { ipcRenderer } from "electron";

const ID = "gmfd-offline-banner";

export function bindOfflineBanner(): void {
  ipcRenderer.on(
    "show-offline-banner",
    (_e, payload: { message?: string }) => {
      let bar = document.getElementById(ID);
      if (!bar) {
        bar = document.createElement("div");
        bar.id = ID;
        bar.setAttribute("role", "alert");
        Object.assign(bar.style, {
          position: "fixed",
          left: "50%",
          top: "12px",
          transform: "translateX(-50%)",
          zIndex: "2147483646",
          display: "flex",
          gap: "12px",
          alignItems: "center",
          padding: "10px 16px",
          borderRadius: "8px",
          background: "#b3261e",
          color: "#fff",
          fontFamily: "system-ui, Segoe UI, sans-serif",
          fontSize: "14px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
        });
        const msg = document.createElement("span");
        msg.id = `${ID}-msg`;
        const btn = document.createElement("button");
        btn.type = "button";
        btn.textContent = "Reload";
        btn.addEventListener("click", () => ipcRenderer.send("reload-main-window"));
        bar.append(msg, btn);
        (document.body || document.documentElement).appendChild(bar);
      }
      const msg = document.getElementById(`${ID}-msg`);
      if (msg) {
        msg.textContent =
          typeof payload?.message === "string" && payload.message.trim()
            ? payload.message
            : "Can't reach Google Messages. Check your connection.";
      }
    }
  );
  ipcRenderer.on("hide-offline-banner", () => {
    document.getElementById(ID)?.remove();
  });
}
