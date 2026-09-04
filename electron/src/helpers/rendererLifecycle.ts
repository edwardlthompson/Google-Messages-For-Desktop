import type { WebContents } from "electron";

function sendDebuggerCommand(
  wc: WebContents,
  method: string,
  params: Record<string, unknown> = {}
): Promise<unknown> {
  return Promise.race([
    wc.debugger.sendCommand(method, params),
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`debugger timeout: ${method}`)), 3_000);
    }),
  ]);
}

/** Navigate with CDP lifecycle activation (mirrors manual CDP fix for about:blank). */
export async function navigateMessagesWithLifecycle(
  wc: WebContents,
  url: string
): Promise<boolean> {
  if (wc.isDestroyed()) return false;
  try {
    if (!wc.debugger.isAttached()) {
      wc.debugger.attach("1.3");
    }
    await sendDebuggerCommand(wc, "Page.enable");
    await sendDebuggerCommand(wc, "Page.setWebLifecycleState", {
      state: "active",
    });
    await sendDebuggerCommand(wc, "Page.navigate", { url });
    return true;
  } catch (err) {
    console.warn("navigateMessagesWithLifecycle failed", err);
    return false;
  } finally {
    try {
      if (wc.debugger.isAttached()) wc.debugger.detach();
    } catch {
      /* already detached */
    }
  }
}
