import { feedbackCopy, type FeedbackKind } from "./feedbackCopy.ts";

export function feedbackPanelHtml(kind: FeedbackKind): string {
  const copy = JSON.stringify(feedbackCopy);
  const kindJson = JSON.stringify(kind === "feature" ? "feature" : "bug");
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <title></title>
  <style>
    body { font: 14px sans-serif; margin: 16px; color: #111; background: #fff; }
    label, h1 { display: block; margin: 0 0 8px; }
    textarea, pre { width: 100%; box-sizing: border-box; min-height: 88px; }
    pre { white-space: pre-wrap; background: #f4f4f4; padding: 8px; min-height: 72px; }
    .row { margin-top: 12px; display: flex; gap: 8px; flex-wrap: wrap; }
    button:disabled { opacity: 0.5; }
    #reason { color: #444; min-height: 1.2em; }
  </style>
</head>
<body>
  <h1 id="title"></h1>
  <label for="desc" id="descLabel"></label>
  <textarea id="desc" rows="6"></textarea>
  <label id="previewLabel"></label>
  <pre id="preview" role="region" aria-live="polite"></pre>
  <p id="reason"></p>
  <div class="row">
    <button type="button" id="copy"></button>
    <button type="button" id="open"></button>
    <button type="button" id="discard"></button>
  </div>
  <script>
    const COPY = ${copy};
    const kind = ${kindJson};
    document.title = COPY[kind === "bug" ? "feedback.bug" : "feedback.feature"];
    document.getElementById("title").textContent = document.title;
    document.getElementById("descLabel").textContent = COPY["feedback.description"];
    document.getElementById("previewLabel").textContent = COPY["feedback.preview"];
    document.getElementById("copy").textContent = COPY["feedback.copy"];
    document.getElementById("open").textContent = COPY["feedback.open_github"];
    document.getElementById("discard").textContent = COPY["feedback.discard"];
    const desc = document.getElementById("desc");
    const preview = document.getElementById("preview");
    const openBtn = document.getElementById("open");
    const reason = document.getElementById("reason");
    function refresh() {
      preview.textContent = desc.value;
      const online = navigator.onLine;
      const can = Boolean(desc.value.trim());
      openBtn.disabled = !can || !online;
      reason.textContent = !can ? COPY["feedback.github.need_text"] : (!online ? COPY["feedback.github.offline"] : "");
    }
    desc.addEventListener("input", refresh);
    document.getElementById("copy").addEventListener("click", () => {
      window.gmfdFeedback.copy(kind, desc.value);
    });
    openBtn.addEventListener("click", () => {
      window.gmfdFeedback.open(kind, desc.value);
    });
    document.getElementById("discard").addEventListener("click", () => {
      desc.value = "";
      refresh();
      window.gmfdFeedback.discard();
    });
    refresh();
  </script>
</body>
</html>`;
}
