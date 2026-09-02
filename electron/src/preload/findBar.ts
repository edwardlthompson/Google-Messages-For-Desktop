import { ipcRenderer } from "electron";

const BAR_ID = "gmfd-find-bar";
const MAX_QUERY = 200;

function barHtml(): string {
  return `<input id="gmfd-find-input" type="search" maxlength="${MAX_QUERY}" aria-label="Find in page" placeholder="Find in page" />
<button type="button" id="gmfd-find-prev" aria-label="Previous">Prev</button>
<button type="button" id="gmfd-find-next" aria-label="Next">Next</button>
<span id="gmfd-find-count" aria-live="polite"></span>
<button type="button" id="gmfd-find-close" aria-label="Close find">×</button>`;
}

function sendFind(forward: boolean): void {
  const input = document.getElementById("gmfd-find-input") as HTMLInputElement | null;
  const query = (input?.value ?? "").slice(0, MAX_QUERY);
  if (!query) {
    ipcRenderer.send("stop-find-in-page");
    return;
  }
  ipcRenderer.send("find-in-page", query, { forward, findNext: true });
}

export function closeFindBar(): void {
  document.getElementById(BAR_ID)?.remove();
  ipcRenderer.send("stop-find-in-page");
}

export function openFindBar(): void {
  let bar = document.getElementById(BAR_ID);
  if (!bar) {
    bar = document.createElement("div");
    bar.id = BAR_ID;
    bar.setAttribute("role", "search");
    Object.assign(bar.style, {
      position: "fixed",
      top: "8px",
      right: "12px",
      zIndex: "2147483646",
      display: "flex",
      gap: "6px",
      alignItems: "center",
      padding: "6px 8px",
      borderRadius: "8px",
      background: "#202124",
      color: "#fff",
      fontFamily: "system-ui, Segoe UI, sans-serif",
      fontSize: "13px",
      boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
    });
    bar.innerHTML = barHtml();
    (document.body || document.documentElement).appendChild(bar);
    bar.querySelector("#gmfd-find-next")?.addEventListener("click", () => sendFind(true));
    bar.querySelector("#gmfd-find-prev")?.addEventListener("click", () => sendFind(false));
    bar.querySelector("#gmfd-find-close")?.addEventListener("click", () => closeFindBar());
    const input = bar.querySelector("#gmfd-find-input") as HTMLInputElement;
    input?.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter") sendFind(!ev.shiftKey);
      if (ev.key === "Escape") closeFindBar();
    });
  }
  const input = document.getElementById("gmfd-find-input") as HTMLInputElement | null;
  input?.focus();
  input?.select();
}

export function bindFindBarIpc(): void {
  ipcRenderer.on("open-find-bar", () => openFindBar());
  ipcRenderer.on("found-in-page", (_e, result: { activeMatchOrdinal?: number; matches?: number }) => {
    const el = document.getElementById("gmfd-find-count");
    if (!el) return;
    const n = result?.matches ?? 0;
    const i = result?.activeMatchOrdinal ?? 0;
    el.textContent = n > 0 ? `${i}/${n}` : "";
  });
}
