(function () {
  "use strict";

  var VERSION = "2026-06-26.4";
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

  function ensureResponsiveViewport() {
    var meta = document.querySelector('meta[name="viewport"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "viewport";
      document.head.appendChild(meta);
    }
    var content = meta.getAttribute("content") || "";
    if (content.indexOf("width=device-width") === -1) {
      meta.setAttribute("content", "width=device-width, initial-scale=1");
    }
  }

  function tagCompactViewport() {
    var widths = [
      window.innerWidth,
      window.outerWidth,
      window.screen && window.screen.width,
      window.visualViewport && window.visualViewport.width
    ].filter(function (value) {
      return typeof value === "number" && value > 0;
    });
    var compact = widths.some(function (value) { return value <= 640; });
    if (compact) {
      var compactWidth = Math.max(320, Math.floor(Math.min.apply(Math, widths)));
      document.body.classList.add("b24-compact-viewport");
      document.body.style.setProperty("--b24-compact-width", compactWidth + "px");
    }
  }

  function firstExisting(selectors) {
    for (var i = 0; i < selectors.length; i += 1) {
      var node = document.querySelector(selectors[i]);
      if (node) return node;
    }
    return null;
  }

  function addClass(node, className) {
    if (node && !node.classList.contains(className)) node.classList.add(className);
  }

  function createText(tagName, className, text) {
    var node = document.createElement(tagName);
    if (className) node.className = className;
    node.textContent = text;
    return node;
  }

  function mainContent() {
    return firstExisting(["#contents", "#container", "#wrap", "body"]);
  }

  function findUsableImage() {
    var images = document.querySelectorAll(".prdList img, .xans-product-listmain img, .keyImg img, #contents img, #header img");
    for (var i = 0; i < images.length; i += 1) {
      var image = images[i];
      var src = image.currentSrc || image.src || image.getAttribute("ec-data-src") || image.getAttribute("data-src");
      if (!src || src.indexOf("blank") !== -1) continue;
      return src;
    }
    return "https://03030.co.kr/web/upload/category/logo/57d2d7bcd5bff2b1423a31cdad1c9ffb_5_top.jpg";
  }

  function isHomePath(path) {
    return path === "/" || path === "/index.html";
  }

  function isListPath(path) {
    return path.indexOf("/product/list.html") !== -1;
  }

  function isDetailPath(path) {
    return path.indexOf("/product/detail.html") !== -1;
  }

  function ensureHomeHero(path) {
    if (!isHomePath(path) || document.querySelector(".b24-hero")) return;
    var container = mainContent();
    if (!container) return;

    var hero = document.createElement("section");
    hero.className = "b24-hero";
    hero.setAttribute("data-b24-overlay-page", "home");

    var copy = document.createElement("div");
    copy.className = "b24-hero-copy";
    copy.appendChild(createText("span", "b24-eyebrow", "03030 전통 포장"));
    copy.appendChild(createText("h2", "", "보자기와 포장재를 더 고급스럽게 고르는 화면"));
    copy.appendChild(createText("p", "", "기존 상품과 메뉴 구성은 그대로 두고, 첫 화면의 인상과 구매 흐름만 차분한 프리미엄 톤으로 정리했습니다."));

    var actions = document.createElement("div");
    actions.className = "b24-hero-actions";
    actions.appendChild(createText("a", "b24-primary-link", "추천 상품 보기"));
    actions.lastChild.setAttribute("href", "/product/list.html?cate_no=4");
    actions.appendChild(createText("a", "b24-secondary-link", "문의 게시판"));
    actions.lastChild.setAttribute("href", "/board/free/list.html?board_no=6");
    copy.appendChild(actions);

    var visual = document.createElement("div");
    visual.className = "b24-hero-visual";
    var image = document.createElement("img");
    image.src = findUsableImage();
    image.alt = "03030 보자기 대표 상품";
    visual.appendChild(image);

    hero.appendChild(copy);
    hero.appendChild(visual);
    container.insertBefore(hero, container.firstChild);
    document.body.classList.add("b24-overlay-active", "b24-overlay-home");
  }

  function ensureListPage(path) {
    if (!isListPath(path)) return;
    var listRoot = firstExisting([".xans-product-normalpackage", ".xans-product-listnormal", ".ec-base-product", ".prdList"]);
    var container = closestContent(listRoot) || mainContent();
    if (!container) return;

    addClass(container, "b24-list-page");
    document.body.classList.add("b24-overlay-active", "b24-overlay-list");

    normalizeProductListActions();
  }

  function findDetailAnchor() {
    return firstExisting([".detailArea", ".xans-product-detail", ".xans-product-detaildesign", ".infoArea"]);
  }

  function ensureDetailPage(path) {
    if (!isDetailPath(path)) return;
    var anchor = findDetailAnchor();
    var container = closestContent(anchor) || mainContent();
    if (!container) return;

    addClass(container, "b24-detail-page");
    document.body.classList.add("b24-overlay-active", "b24-overlay-detail");

    var detailShell = firstExisting([".detailArea", ".xans-product-detail"]);
    if (detailShell) addClass(detailShell, "b24-detail-shell");

    var purchasePanel = firstExisting([".infoArea", ".xans-product-detaildesign", ".xans-product-option", ".detailArea"]);
    if (purchasePanel) addClass(purchasePanel, "b24-purchase-panel");

    if (!document.querySelector(".b24-detail-topline")) {
      var topline = document.createElement("div");
      topline.className = "b24-detail-topline";
      topline.appendChild(createText("span", "b24-badge", "상세 보기"));
      topline.appendChild(createText("strong", "", findDetailProductName() || cleanText(document.title) || "상품 상세"));
      container.insertBefore(topline, detailShell || anchor || container.firstChild);
    }

    enhanceProductDetailTopline();
  }

  function applyLiveRootTransforms(path) {
    ensureHomeHero(path);
    ensureListPage(path);
    ensureDetailPage(path);
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

  function tagServicePath(path) {
    if (path === "/order/orderform.html" || path.indexOf("/order/orderform.html") !== -1) {
      document.body.classList.add("b24-overlay-active", "b24-overlay-orderform");
    }
    if (path === "/myshop/index.html" || path.indexOf("/myshop/index.html") !== -1) {
      document.body.classList.add("b24-overlay-active", "b24-overlay-myshop");
    }
    if (path === "/myshop/order/list.html" || path.indexOf("/myshop/order/list.html") !== -1) {
      document.body.classList.add("b24-overlay-active", "b24-overlay-order-history");
    }
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
      match: "/board/",
      className: "b24-flow-page b24-board-page",
      eyebrow: "고객 안내",
      title: "게시판",
      body: "공지와 문의 글을 차분하게 훑어보고 필요한 글을 빠르게 찾을 수 있게 정리했습니다.",
      facts: ["공지 확인", "게시글 검색", "글쓰기 연결"],
      targetSelectors: ['[module^="Board_ListPackage"]', ".xans-board-listpackage-1002", ".xans-board-listpackage"],
      extraSelectors: []
    },
    {
      marker: "myshop",
      match: "/myshop/index.html",
      className: "b24-flow-page b24-myshop-page",
      eyebrow: "회원 쇼핑",
      title: "마이쇼핑",
      body: "주문내역, 적립금, 관심상품, 문의 관리까지 재구매에 필요한 메뉴를 한 화면에서 찾게 정리했습니다.",
      facts: ["주문내역 조회", "관심상품 확인", "문의/배송 주소 관리"],
      targetSelectors: ['[module="myshop_benefit"]', ".xans-myshop-benefit", '[module="myshop_bankbook"]', ".xans-myshop-bankbook", "#myshopMain", '[module="myshop_main"]', ".xans-myshop-main"],
      extraSelectors: ['[module="myshop_bankbook"]', ".xans-myshop-bankbook", "#myshopMain", '[module="myshop_main"]', ".xans-myshop-main", '[module="Myshop_InquiryDash"]']
    },
    {
      marker: "order-history",
      match: "/myshop/order/list.html",
      className: "b24-flow-page b24-order-history-page",
      eyebrow: "주문 관리",
      title: "주문조회",
      body: "배송 상태와 구매 내역을 날짜, 주문번호, 상품 기준으로 빠르게 훑을 수 있게 정리했습니다.",
      facts: ["주문 상태 확인", "기간 검색", "배송/취소 내역 확인"],
      targetSelectors: ['[module="MyShop_OrderHistoryHead"]', ".xans-myshop-orderhistoryhead", '[module="MyShop_OrderHistoryList"]', ".xans-myshop-orderhistorylist", ".orderListArea", ".titleArea"],
      extraSelectors: ['[module="MyShop_OrderHistoryTab"]', ".xans-myshop-orderhistorytab", '[module="MyShop_OrderHistoryHead"]', ".xans-myshop-orderhistoryhead", '[module="MyShop_OrderHistoryList"]', ".xans-myshop-orderhistorylist", ".orderListArea", ".ec-base-paginate", ".paginate"]
    },
    {
      marker: "compare",
      match: "/product/compare.html",
      className: "b24-flow-page b24-compare-page",
      eyebrow: "상품 비교",
      title: "상품 비교하기",
      body: "선택한 보자기와 포장 상품의 이미지, 가격, 옵션을 한 화면에서 비교합니다.",
      facts: ["상품 정보 비교", "옵션 및 수량 확인", "장바구니/구매 연결"],
      targetSelectors: [".xans-product-listcompare", '[module="Product_ListCompare"]'],
      extraSelectors: [".btnArea"]
    }
  ];

  function findFlowConfig(path) {
    return configs.find(function (item) {
      return path === item.match || path.indexOf(item.match) !== -1;
    });
  }

  function applyFlowPageOverlay(config) {
    if (!config) return;
    ensureResponsiveViewport();
    tagCompactViewport();
    tagServicePath(normalizedPath());
    wrap(config);
    installMobileServiceHeader();
  }

  function installFlowPageObserver(config) {
    if (!config || !document.body || !window.MutationObserver) return;
    var scheduled = false;
    function scheduleApply() {
      if (scheduled) return;
      scheduled = true;
      window.setTimeout(function () {
        scheduled = false;
        if (!isReviewSkin()) return;
        applyFlowPageOverlay(config);
      }, 120);
    }
    [250, 750, 1500, 3000].forEach(function (delay) {
      window.setTimeout(scheduleApply, delay);
    });
    var observer = new MutationObserver(scheduleApply);
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function installMobileServiceHeader() {
    if (!document.body.classList.contains("b24-compact-viewport")) return;
    if (document.querySelector(".b24-mobile-service-header")) return;

    var sourceHeader = document.querySelector("#header");
    if (!sourceHeader || !sourceHeader.parentNode) return;

    var bar = document.createElement("div");
    bar.className = "b24-mobile-service-header";

    var logoLink = document.createElement("a");
    logoLink.className = "b24-mobile-service-logo";
    logoLink.href = "/index.html";
    var logoImage = sourceHeader.querySelector(".xans-layout-logotop img, img[alt*='보자기천국']");
    if (logoImage) {
      var clone = logoImage.cloneNode(true);
      clone.removeAttribute("width");
      clone.removeAttribute("height");
      logoLink.appendChild(clone);
    } else {
      logoLink.textContent = "보자기천국";
    }

    var nav = document.createElement("nav");
    nav.className = "b24-mobile-service-nav";
    nav.setAttribute("aria-label", "주요 상품분류");
    Array.prototype.slice.call(sourceHeader.querySelectorAll(".xans-layout-category a[href]"), 0, 10).forEach(function (anchor) {
      var item = document.createElement("a");
      item.href = anchor.getAttribute("href") || "#";
      var image = anchor.querySelector("img");
      var label = cleanText(anchor.textContent) || cleanText(image && image.getAttribute("alt"));
      label = label.replace(/[▶▷>]+/g, "").replace(/\*/g, "").trim();
      item.textContent = label || "상품";
      nav.appendChild(item);
    });

    bar.appendChild(logoLink);
    if (nav.children.length) bar.appendChild(nav);
    sourceHeader.parentNode.insertBefore(bar, sourceHeader);
    document.body.classList.add("b24-mobile-service-header-on");
  }

  ready(function () {
    if (!isReviewSkin()) return;
    ensureResponsiveViewport();
    tagCompactViewport();
    injectCss();
    installProductListActionObserver();

    var path = normalizedPath();
    applyLiveRootTransforms(path);
    enhanceProductDetailTopline();
    tagServicePath(path);
    var config = findFlowConfig(path);
    if (!config) return;
    applyFlowPageOverlay(config);
    installFlowPageObserver(config);
  });
})();
