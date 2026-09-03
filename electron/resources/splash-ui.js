(function () {
  const q = new URLSearchParams(window.location.search);
  const heading = q.get("heading");
  const lede = q.get("lede");
  const headingEl = document.getElementById("heading");
  const ledeEl = document.getElementById("lede");
  if (heading && headingEl) headingEl.textContent = heading;
  if (lede && ledeEl) ledeEl.textContent = lede;
})();
