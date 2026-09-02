/* global window, document */
(function () {
  const api = window.gmfdOnboarding;
  const statusEl = document.getElementById("status");
  const progressEl = document.getElementById("progress");
  const continueBtn = document.getElementById("continue");
  const modeHint = document.getElementById("mode-hint");
  const schemes = ["sms", "smsto", "tel", "callto", "im", "mms"];

  function setStatus(text) {
    if (statusEl) statusEl.textContent = text || "";
  }

  async function refreshChecklist() {
    if (!api?.checkDefaults) return;
    try {
      const { status, allSet, mode } = await api.checkDefaults();
      if (modeHint) {
        modeHint.textContent =
          mode === "userchoice"
            ? "Windows: green when UserChoice points at Google Messages."
            : "macOS/Linux: green after you click each sample (then set the default in System Settings if asked).";
      }
      let done = 0;
      for (const scheme of schemes) {
        const row = document.querySelector(`[data-scheme="${scheme}"]`);
        const ok = !!(status && status[scheme]);
        if (ok) done += 1;
        if (row) row.classList.toggle("done", ok);
      }
      if (progressEl) {
        progressEl.textContent = allSet
          ? "All defaults ready — continue to sign in."
          : `${done} of ${schemes.length} ready. Open each remaining sample and choose Google Messages.`;
        progressEl.classList.toggle("all-set", allSet);
      }
      if (continueBtn) {
        continueBtn.disabled = !allSet;
      }
    } catch (_) {
      setStatus("Could not read defaults yet.");
    }
  }

  document.querySelectorAll("[data-open]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const scheme = btn.getAttribute("data-open");
      if (!scheme) return;
      api?.openProtocol(scheme);
      setStatus(`Opened ${scheme}: — pick Google Messages if asked (no text is sent).`);
      window.setTimeout(refreshChecklist, 2800);
      window.setTimeout(refreshChecklist, 5000);
    });
  });

  document.getElementById("refresh")?.addEventListener("click", () => {
    void refreshChecklist();
    setStatus("Checklist refreshed.");
  });
  document.getElementById("open-settings")?.addEventListener("click", () => {
    api?.openDefaultAppsSettings();
  });
  document.getElementById("open-search")?.addEventListener("click", () => {
    api?.openSettingsSearch();
  });
  document.getElementById("minimize")?.addEventListener("click", () => {
    api?.minimize();
  });
  document.getElementById("continue")?.addEventListener("click", () => {
    api?.complete();
  });
  document.getElementById("skip")?.addEventListener("click", () => {
    api?.skip();
  });

  api?.onRefreshDefaults?.(() => void refreshChecklist());
  void refreshChecklist();
  const firstOpen = document.querySelector("[data-open]");
  if (firstOpen instanceof HTMLButtonElement) firstOpen.focus();
  window.setInterval(refreshChecklist, 2000);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") void refreshChecklist();
  });
})();
