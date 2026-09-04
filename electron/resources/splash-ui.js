(function () {
  const q = new URLSearchParams(window.location.search);
  const heading = q.get("heading");
  const lede = q.get("lede");
  const heroUrl = q.get("hero");
  const logoUrl = q.get("logo");
  const labelApp = q.get("labelApp");
  const labelAppDone = q.get("labelAppDone");
  const labelMsg = q.get("labelMsg");
  const labelMsgDone = q.get("labelMsgDone");
  const hintText = q.get("hint");

  const headingEl = document.getElementById("heading");
  const ledeEl = document.getElementById("lede");
  const hero = document.getElementById("hero");
  const heroFallback = document.getElementById("heroFallback");
  const logoFallback = document.getElementById("logoFallback");
  const barFill = document.getElementById("barFill");
  const stepApp = document.getElementById("stepApp");
  const stepMsg = document.getElementById("stepMsg");
  const markApp = document.getElementById("markApp");
  const markMsg = document.getElementById("markMsg");
  const labelAppEl = document.getElementById("labelApp");
  const labelMsgEl = document.getElementById("labelMsg");
  const hintEl = document.getElementById("hint");

  if (heading && headingEl) headingEl.textContent = heading;
  if (lede && ledeEl) ledeEl.textContent = lede;
  if (labelApp && labelAppEl) labelAppEl.textContent = labelApp;
  if (labelMsg && labelMsgEl) labelMsgEl.textContent = labelMsg;
  if (hintText && hintEl) hintEl.textContent = hintText;
  if (logoUrl && logoFallback) logoFallback.src = logoUrl;

  function showFallback() {
    if (hero) hero.style.display = "none";
    if (heroFallback) heroFallback.classList.add("show");
  }

  if (hero) {
    hero.addEventListener("error", showFallback);
    function assignHero() {
      if (heroUrl) {
        hero.src = heroUrl;
      } else {
        hero.src = "splash-hero.jpg";
      }
    }
    // Let the stage bar paint before decoding the JPEG.
    if (typeof requestAnimationFrame === "function") {
      requestAnimationFrame(function () {
        requestAnimationFrame(assignHero);
      });
    } else {
      setTimeout(assignHero, 0);
    }
  }

  var current = "app_loading";

  function applyStage(stage) {
    current = stage;
    var appDone = stage === "app_ready" || stage === "messages_loading" || stage === "messages_ready";
    var msgActive = stage === "messages_loading";
    var msgDone = stage === "messages_ready";

    if (stepApp) {
      stepApp.classList.toggle("done", appDone);
      stepApp.classList.toggle("active", stage === "app_loading");
    }
    if (stepMsg) {
      stepMsg.classList.toggle("done", msgDone);
      stepMsg.classList.toggle("active", msgActive);
    }
    if (markApp) markApp.textContent = appDone ? "✅" : "○";
    if (markMsg) markMsg.textContent = msgDone ? "✅" : msgActive ? "…" : "○";
    if (labelAppEl && labelAppDone && appDone) labelAppEl.textContent = labelAppDone;
    if (labelAppEl && labelApp && !appDone) labelAppEl.textContent = labelApp;
    if (labelMsgEl && labelMsgDone && msgDone) labelMsgEl.textContent = labelMsgDone;
    if (labelMsgEl && labelMsg && !msgDone) labelMsgEl.textContent = labelMsg;

    if (barFill) {
      var width = "15%";
      if (stage === "app_ready") width = "45%";
      if (stage === "messages_loading") width = "70%";
      if (stage === "messages_ready") width = "100%";
      barFill.style.width = width;
      barFill.classList.toggle("indeterminate", stage === "messages_loading");
      if (stage !== "messages_loading") barFill.style.transform = "";
    }

    if (ledeEl && stage === "messages_loading" && labelMsg) {
      ledeEl.textContent = labelMsg;
    }
    if (ledeEl && stage === "messages_ready" && labelMsgDone) {
      ledeEl.textContent = labelMsgDone;
      ledeEl.classList.remove("pulse");
    }
  }

  window.setSplashStage = function setSplashStage(stage) {
    if (
      stage !== "app_loading" &&
      stage !== "app_ready" &&
      stage !== "messages_loading" &&
      stage !== "messages_ready"
    ) {
      return current;
    }
    var order = {
      app_loading: 0,
      app_ready: 1,
      messages_loading: 2,
      messages_ready: 3,
    };
    if (order[stage] < order[current]) return current;
    applyStage(stage);
    return current;
  };

  applyStage("app_loading");
})();
