(function () {
  "use strict";

  var VERSION = "2026-06-19.9";
  var currentScript = document.currentScript && document.currentScript.src ? document.currentScript.src : "";
  var CSS_URL = currentScript.indexOf("03030-b-skin-overlay.js") !== -1
    ? currentScript.replace(/03030-b-skin-overlay\.js(?:\?.*)?$/, "03030-b-skin-service.css?v=" + VERSION)
    : "https://cdn.jsdelivr.net/gh/bojagihv-ai/03030-overlay-assets@main/03030-b-skin-service.css?v=" + VERSION;

  if (window.__B24_03030_OVERLAY_VERSION__ === VERSION) return;
  window.__B24_03030_OVERLAY_VERSION__ = VERSION;

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
    } else {
      callback();
    }
  }

  function normalizedPath() {
    return window.location.pathname
      .replace(/^\/shop\d+/, "")
      .replace(/^\/skin-skin2/, "")
      .replace(/\/+$/, "") || "/";
  }

  function isReviewSkin() {
    return window.location.pathname.indexOf("/skin-skin2") !== -1 || window.__B24_03030_FORCE_OVERLAY__ === true;
  }

  function injectCss() {
    if (document.querySelector('link[data-b24-overlay-css="03030"]')) return;
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = CSS_URL;
    link.setAttribute("data-b24-overlay-css", "03030");
    document.head.appendChild(link);
  }

  function firstExisting(selectors) {
    for (var i = 0; i < selectors.length; i += 1) {
      var node = document.querySelector(selectors[i]);
      if (node) return node;
    }
    return null;
  }

  function buildHero(config) {
    var hero = document.createElement("div");
    hero.className = "b24-flow-hero";

    var copy = document.createElement("div");
    var eyebrow = document.createElement("span");
    eyebrow.textContent = config.eyebrow;
    var title = document.createElement("h1");
    title.textContent = config.title;
    var body = document.createElement("p");
    body.textContent = config.body;
    copy.appendChild(eyebrow);
    copy.appendChild(title);
    copy.appendChild(body);

    var facts = document.createElement("ul");
    config.facts.forEach(function (item) {
      var li = document.createElement("li");
      li.textContent = item;
      facts.appendChild(li);
    });

    hero.appendChild(copy);
    hero.appendChild(facts);
    return hero;
  }

  function closestContent(node) {
    return node && (node.closest("#contents") || node.parentElement);
  }

  function collectPageNodes(container, firstTarget, extraSelectors) {
    var nodes = [];
    [":scope > .path", ":scope > .titleArea"].forEach(function (selector) {
      var found = container.querySelector(selector);
      if (found && found.parentElement === container) nodes.push(found);
    });

    if (firstTarget && nodes.indexOf(firstTarget) === -1) nodes.push(firstTarget);

    extraSelectors.forEach(function (selector) {
      Array.prototype.forEach.call(container.querySelectorAll(selector), function (node) {
        if (node.parentElement === container && nodes.indexOf(node) === -1) nodes.push(node);
      });
    });

    return nodes;
  }

  function wrap(config) {
    if (document.querySelector(".b24-flow-page[data-b24-overlay-page=\"" + config.marker + "\"]")) return;

    var firstTarget = firstExisting(config.targetSelectors);
    if (!firstTarget) return;

    var container = closestContent(firstTarget);
    if (!container) return;

    var nodes = collectPageNodes(container, firstTarget, config.extraSelectors || []);
    if (!nodes.length) return;

    var section = document.createElement("section");
    section.className = config.className;
    section.setAttribute("data-b24-overlay-page", config.marker);

    var panel = document.createElement("div");
    panel.className = "b24-flow-panel";

    container.insertBefore(section, nodes[0]);
    section.appendChild(buildHero(config));
    section.appendChild(panel);
    nodes.forEach(function (node) {
      panel.appendChild(node);
    });

    document.body.classList.add("b24-overlay-active", "b24-overlay-" + config.marker);
  }

  function normalizeProductListActions() {
    if (!document.querySelector(".b24-list-page")) return;
    Array.prototype.forEach.call(document.querySelectorAll("img.option_preview"), function (image) {
      if (image.getAttribute("data-b24-normalized") === "true") return;
      var anchor = image.closest("a");
      if (!anchor) return;
      var text = document.createElement("span");
      text.className = "b24-list-action-text";
      text.textContent = "옵션";
      anchor.className = (anchor.className ? anchor.className + " " : "") + "b24-list-action b24-list-action-option";
      anchor.setAttribute("aria-label", image.getAttribute("alt") || "옵션 미리보기");
      anchor.insertBefore(text, image);
      image.setAttribute("data-b24-normalized", "true");
      image.className += " b24-source-action-hidden";
      image.style.display = "none";
    });
    Array.prototype.forEach.call(document.querySelectorAll("img.ec-admin-icon.cart"), function (image) {
      if (image.getAttribute("data-b24-normalized") === "true") return;
      var button = document.createElement("button");
      button.type = "button";
      button.className = "b24-list-action b24-list-action-cart";
      button.textContent = "장바구니";
      var onclick = image.getAttribute("onclick");
      if (onclick) button.setAttribute("onclick", onclick);
      button.setAttribute("aria-label", image.getAttribute("alt") || "장바구니 담기");
      image.setAttribute("data-b24-normalized", "true");
      image.className += " b24-source-action-hidden";
      image.parentNode.insertBefore(button, image);
      image.style.display = "none";
    });
  }

  function installProductListActionObserver() {
    normalizeProductListActions();
    [250, 750, 1500, 3000].forEach(function (delay) {
      window.setTimeout(normalizeProductListActions, delay);
    });
    if (!document.body || !window.MutationObserver) return;
    var observer = new MutationObserver(function () {
      normalizeProductListActions();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function cleanText(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function findDetailProductName() {
    var rows = document.querySelectorAll(".b24-purchase-panel tr, .infoArea tr");
    for (var i = 0; i < rows.length; i += 1) {
      var row = rows[i];
      var label = cleanText((row.querySelector("th") || {}).textContent);
      if (label.indexOf("상품명") === -1) continue;
      var value = cleanText((row.querySelector("td") || {}).textContent);
      if (value) return value;
    }
    return cleanText((document.querySelector(".b24-purchase-panel h3, .infoArea h3") || {}).textContent);
  }

  function findDetailCategoryName() {
    var items = Array.prototype.slice.call(document.querySelectorAll(".b24-detail-page .path li, .path li, .path strong"));
    var names = items
      .map(function (item) { return cleanText(item.textContent).replace(/^>+/, "").trim(); })
      .filter(function (item) { return item && item !== "홈"; });
    return names[names.length - 1] || "";
  }

  function enhanceProductDetailTopline() {
    var topline = document.querySelector(".b24-detail-page .b24-detail-topline, .b24-detail-topline");
    if (!topline || topline.getAttribute("data-b24-detail-enhanced") === "true") return;
    var strong = topline.querySelector("strong");
    if (!strong) return;
    var productName = findDetailProductName();
    if (!productName) return;
    var categoryName = findDetailCategoryName();
    var context = document.createElement("span");
    context.className = "b24-detail-context";
    context.textContent = (categoryName ? categoryName + " | " : "") + "옵션, 수량, 배송 전 확인";
    strong.textContent = productName;
    topline.appendChild(context);
    topline.setAttribute("data-b24-detail-enhanced", "true");
  }

  var configs = [
    {
      marker: "cart",
      match: "/order/basket.html",
      className: "b24-flow-page b24-cart-page",
      eyebrow: "주문 준비",
      title: "장바구니",
      body: "담아둔 보자기와 패키지 구성을 한 화면에서 확인하고 주문으로 이어집니다.",
      facts: ["선택 상품 주문", "수량 및 옵션 확인", "회원 혜택 자동 반영"],
      targetSelectors: ['[module="Order_BasketPackage"]', ".xans-order-basketpackage"],
      extraSelectors: [".xans-order-totalorder", ".xans-order-basketguide", ".xans-myshop-wishlist"]
    },
    {
      marker: "login",
      match: "/member/login.html",
      className: "b24-flow-page b24-login-page",
      eyebrow: "회원 서비스",
      title: "로그인",
      body: "주문 조회와 회원 혜택 확인까지 편안하게 이어지는 계정 화면입니다.",
      facts: ["회원 로그인", "비회원 주문 조회", "회원가입 연결"],
      targetSelectors: ['[module="member_login"]', ".xans-member-login", "#member_form_2718391529"],
      extraSelectors: ['[module="MyShop_OrderHistoryNologin"]', ".xans-myshop-orderhistorynologin"]
    },
    {
      marker: "board",
      match: "/board/free/list.html",
      className: "b24-flow-page b24-board-page",
      eyebrow: "고객 안내",
      title: "게시판",
      body: "공지와 문의 글을 차분하게 훑어보고 필요한 글을 빠르게 찾을 수 있게 정리했습니다.",
      facts: ["공지 확인", "게시글 검색", "글쓰기 연결"],
      targetSelectors: ['[module="Board_ListPackage_1002"]', ".xans-board-listpackage-1002", ".xans-board-listpackage"],
      extraSelectors: []
    }
  ];

  ready(function () {
    if (!isReviewSkin()) return;
    injectCss();
    installProductListActionObserver();
    enhanceProductDetailTopline();

    var path = normalizedPath();
    var config = configs.find(function (item) {
      return path === item.match || path.indexOf(item.match) !== -1;
    });
    if (!config) return;
    wrap(config);
  });
})();
