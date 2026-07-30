/* global window, document */
(function () {
  const api = window.gmfdOnboarding;
  const status = document.getElementById("status");
  const verifyBtn = document.getElementById("verify");
  const step3 = document.getElementById("step3");

  api?.onSignInStatus?.((signedIn) => {
    if (signedIn) {
      if (status) {
        status.textContent =
          "Signed in detected — verify below, or this window closes automatically.";
        status.classList.add("ready");
      }
      if (verifyBtn) verifyBtn.disabled = false;
      if (step3) step3.classList.add("active");
    } else {
      if (status) {
        status.textContent = "Waiting for sign-in / phone link…";
        status.classList.remove("ready");
      }
      if (verifyBtn) verifyBtn.disabled = true;
    }
  });

  document.getElementById("verify")?.addEventListener("click", () => {
    api?.verifyProtocol?.();
  });
  document.getElementById("dismiss")?.addEventListener("click", () => {
    api?.dismissSignIn?.();
  });
  document.getElementById("donate")?.addEventListener("click", () => {
    api?.openDonate?.();
  });
})();
