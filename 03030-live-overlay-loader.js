(function () {
  "use strict";

  var VERSION = "2026-06-24.8";
  var currentScript = document.currentScript && document.currentScript.src ? document.currentScript.src : "";
  var source = currentScript.indexOf("03030-live-overlay-loader.js") !== -1
    ? currentScript.replace(/03030-live-overlay-loader\.js(?:\?.*)?$/, "03030-b-skin-overlay.js?v=" + VERSION)
    : "https://cdn.jsdelivr.net/gh/bojagihv-ai/03030-overlay-assets@main/03030-b-skin-overlay.js?v=" + VERSION;

  if (window.__B24_03030_LIVE_OVERLAY_LOADER__ === VERSION) return;
  window.__B24_03030_LIVE_OVERLAY_LOADER__ = VERSION;
  window.__B24_03030_FORCE_OVERLAY__ = true;

  var script = document.createElement("script");
  script.src = source;
  script.async = false;
  script.setAttribute("data-b24-live-overlay-loader", "03030");
  document.head.appendChild(script);
})();
