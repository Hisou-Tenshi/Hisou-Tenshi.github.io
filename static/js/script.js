console.log('%cCopyright © 2022-2026 GitHub@HisouTenshi',
    'background-color: #ff00ff; color: white; font-size: 24px; font-weight: bold; padding: 10px;'
);
console.log('%c   /\\_/\\', 'color: #8B4513; font-size: 20px;');
console.log('%c  ( o.o )', 'color: #8B4513; font-size: 20px;');
console.log(' %c  > ^ <', 'color: #8B4513; font-size: 20px;');
console.log('  %c /  ~ \\', 'color: #8B4513; font-size: 20px;');
console.log('  %c/______\\', 'color: #8B4513; font-size: 20px;');

document.addEventListener('contextmenu', function (event) {
    event.preventDefault();
});

function handlePress(event) {
    this.classList.add('pressed');
}

function handleRelease(event) {
    this.classList.remove('pressed');
}

function handleCancel(event) {
    this.classList.remove('pressed');
}

var buttons = document.querySelectorAll('.projectItem');
buttons.forEach(function (button) {
    button.addEventListener('mousedown', handlePress);
    button.addEventListener('mouseup', handleRelease);
    button.addEventListener('mouseleave', handleCancel);
    button.addEventListener('touchstart', handlePress);
    button.addEventListener('touchend', handleRelease);
    button.addEventListener('touchcancel', handleCancel);
});

function toggleClass(selector, className) {
    var elements = document.querySelectorAll(selector);
    elements.forEach(function (element) {
        element.classList.toggle(className);
    });
}

function pop(imageURL) {
    var tcMainElement = document.querySelector(".tc-img");
    if (imageURL) {
        tcMainElement.src = imageURL;
    }
    toggleClass(".tc-main", "active");
    toggleClass(".tc", "active");
}

var tc = document.getElementsByClassName('tc');
var tc_main = document.getElementsByClassName('tc-main');
if (tc.length > 0) {
    tc[0].addEventListener('click', function (event) {
        pop();
    });
}
if (tc_main.length > 0) {
    tc_main[0].addEventListener('click', function (event) {
        event.stopPropagation();
    });
}

function setCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + value + expires + "; path=/";
}

function getCookie(name) {
    var nameEQ = name + "=";
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        while (cookie.charAt(0) == ' ') {
            cookie = cookie.substring(1, cookie.length);
        }
        if (cookie.indexOf(nameEQ) == 0) {
            return cookie.substring(nameEQ.length, cookie.length);
        }
    }
    return null;
}

var themeState = getCookie("themeState") || "Light";
var themeMode = getCookie("themeMode") || "auto";

function getSystemTheme() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? "Dark" : "Light";
}

function changeTheme(theme, shouldPersist) {
    var html = document.querySelector('html');
    var tanChiShe = document.getElementById("tanChiShe");
    var basePath = getBasePath();
    if (tanChiShe) {
        tanChiShe.src = basePath + "static/svg/snake-" + theme + ".svg";
    }
    if (html) {
        html.dataset.theme = theme;
    }
    if (shouldPersist) {
        setCookie("themeState", theme, 365);
    }
    themeState = theme;
}

function syncThemeSwitchState() {
    var Checkbox = document.getElementById('myonoffswitch');
    if (!Checkbox) {
        return;
    }
    if (themeState == "Dark") {
        Checkbox.checked = false;
    } else {
        Checkbox.checked = true;
    }
}

function initThemeSwitch() {
    var Checkbox = document.getElementById('myonoffswitch');
    if (Checkbox) {
        if (Checkbox.dataset.themeSwitchBound === '1') {
            syncThemeSwitchState();
            return;
        }
        Checkbox.dataset.themeSwitchBound = '1';
        Checkbox.addEventListener('change', function () {
            themeMode = "manual";
            setCookie("themeMode", themeMode, 365);
            if (themeState == "Dark") {
                changeTheme("Light", true);
            } else {
                changeTheme("Dark", true);
            }
            syncThemeSwitchState();
        });

        syncThemeSwitchState();
    }
}

document.addEventListener('DOMContentLoaded', function () {

    if (!getCookie("themeMode")) {
        setCookie("themeMode", themeMode, 365);
    }
    if (themeMode === "auto") {
        changeTheme(getSystemTheme(), false);
    } else {
        changeTheme(themeState, true);
    }
    initThemeSwitch();
    initSiteBackground();

    if (window.matchMedia) {
        var media = window.matchMedia('(prefers-color-scheme: dark)');
        var handleSystemThemeChange = function (event) {
            if (themeMode !== "auto") {
                return;
            }
            changeTheme(event.matches ? "Dark" : "Light", false);
            syncThemeSwitchState();
        };
        if (typeof media.addEventListener === 'function') {
            media.addEventListener('change', handleSystemThemeChange);
        } else if (typeof media.addListener === 'function') {
            media.addListener(handleSystemThemeChange);
        }
    }



    var loadingCenter = document.getElementById('marisa-loading-center');
    if (loadingCenter && loadingCenter.childElementCount === 0) {
        loadingCenter.innerHTML = ''
            + '<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">'
            + '  <path d="M 200 50 A 150 150 0 0 1 200 350 A 75 75 0 0 1 200 200 A 75 75 0 0 0 200 50 Z" fill="#E31E24"/>'
            + '  <circle cx="200" cy="275" r="20" fill="#FFFFFF"/>'
            + '</svg>'
            + '<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">'
            + '  <path d="M 200 50 A 75 75 0 0 1 200 200 A 75 75 0 0 0 200 350 A 150 150 0 0 1 200 50 Z" fill="#FFFFFF"/>'
            + '  <circle cx="200" cy="125" r="20" fill="#E31E24"/>'
            + '</svg>';
    }

    var fpsElement = document.createElement('div');
    fpsElement.id = 'fps';
    fpsElement.style.zIndex = '10000';
    fpsElement.style.position = 'fixed';
    fpsElement.style.left = '0';
    document.body.insertBefore(fpsElement, document.body.firstChild);

    var showFPS = (function () {
        var requestAnimationFrame = window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (callback) {
                window.setTimeout(callback, 1000 / 60);
            };

        var fps = 0,
            last = Date.now(),
            offset, step, appendFps;

        step = function () {
            offset = Date.now() - last;
            fps += 1;

            if (offset >= 1000) {
                last += offset;
                appendFps(fps);
                fps = 0;
            }

            requestAnimationFrame(step);
        };

        appendFps = function (fpsValue) {
            fpsElement.textContent = 'FPS: ' + fpsValue;
        };

        step();
    })();

    //pop('./static/img/tz.jpg')

});

 var pageLoading = document.querySelector("#marisa-loading");
var mainContent = document.querySelector(".marisa-main");
var navbar = document.querySelector(".marisa-navbar");
 
if (pageLoading) {
    var rippleIntervalId;
    var presetRipples = document.querySelectorAll('#marisa-loading-wrapper .loading-ripple');
    presetRipples.forEach(function (node) {
        if (node && node.parentNode) {
            node.parentNode.removeChild(node);
        }
    });
    function spawnRipple() {
        var wrapper = document.getElementById('marisa-loading-wrapper');
        var center = document.getElementById('marisa-loading-center');
        if (!wrapper) return;
        var ripple = document.createElement('div');
        ripple.className = 'loading-ripple';
        ripple.style.animation = 'ripple-anim 3s linear forwards';
        ripple.style.animationPlayState = 'running';
        if (center) {
            wrapper.insertBefore(ripple, center);
        } else {
            wrapper.appendChild(ripple);
        }
        setTimeout(function () {
            if (ripple && ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 3200);
    }

    setTimeout(function () {
        spawnRipple();
        rippleIntervalId = setInterval(spawnRipple, 1000);
    }, 300);

    var nonHomeSlugs = ['about-us','contact-us','tools','privacy-policy','terms-and-conditions','download'];
    var isHome = !nonHomeSlugs.some(function (slug) {
        return window.location.pathname.indexOf('/' + slug + '/') !== -1;
    }) && (window.location.pathname === '/' || window.location.pathname.indexOf('/index.html') !== -1 || /\/(?:KirisameMarisa-DAZE|Hisou-Tenshi)\.github\.io\/?$/.test(window.location.pathname));
    var minDurationMs = isHome ? 3000 : 1000;
    var minLoadingPromise = new Promise(function(resolve) {
        setTimeout(resolve, minDurationMs);
    });
 
    var windowLoadPromise = new Promise(function(resolve) {
        if (document.readyState === 'complete') {
            resolve();
        } else {
            window.addEventListener('load', resolve);
        }
    });
 
    Promise.all([minLoadingPromise, windowLoadPromise]).then(function() {
        if (rippleIntervalId) {
            clearInterval(rippleIntervalId);
        }
        pageLoading.classList.add('center-open');
        var centerNode = document.getElementById('marisa-loading-center');
        var svgs = centerNode ? centerNode.querySelectorAll('svg') : [];
        function startFinish() {
            pageLoading.classList.add('loading-finish');
            if (mainContent) mainContent.style.opacity = '1';
            if (navbar) navbar.style.opacity = '1';
            setTimeout(function () {
                pageLoading.style.display = 'none';
            }, 1100);
        }
        if (svgs && svgs.length > 0) {
            var remaining = svgs.length;
            svgs.forEach(function (svg) {
                svg.addEventListener('animationend', function () {
                    remaining--;
                    if (remaining === 0) {
                        startFinish();
                    }
                }, { once: true });
            });
        } else {
            startFinish();
        }
    });
} else {
    if (mainContent) mainContent.style.opacity = '1';
    if (navbar) navbar.style.opacity = '1';
}

var originalTitle = document.title;
var currentTitlePair = null;
var titleRecoveryTimer = null;

function getSiteContent() {
    return window.SITE_CONTENT || {};
}

function applyPageContentOverrides() {
    if (window.__sitePageOverridesApplied) return;
    window.__sitePageOverridesApplied = true;
    var pageId = window.SITE_PAGE;
    if (!pageId) return;
    var page = (getSiteContent().pages || {})[pageId];
    if (!page) return;
    var keys = ['sidebarOverrides', 'navbarOverrides', 'rightHeaderOverrides', 'footerOverrides'];
    keys.forEach(function (key) {
        if (!page[key]) return;
        window[key] = Object.assign({}, page[key], window[key] || {});
    });
}

applyPageContentOverrides();

function getTitlePairs() {
    var pairs = getSiteContent().titlePairs;
    return (pairs && pairs.length) ? pairs : [{ away: originalTitle, back: originalTitle }];
}

function pickTitlePair() {
    var pairs = getTitlePairs();
    var i = Math.floor(Math.random() * pairs.length);
    return pairs[i];
}
document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
        if (titleRecoveryTimer) {
            clearTimeout(titleRecoveryTimer);
            titleRecoveryTimer = null;
        }
        currentTitlePair = pickTitlePair();
        document.title = currentTitlePair.away;
    } else {
        var backTitle = currentTitlePair ? currentTitlePair.back : originalTitle;
        document.title = backTitle;
        titleRecoveryTimer = setTimeout(function () {
            document.title = originalTitle;
            titleRecoveryTimer = null;
            currentTitlePair = null;
        }, 3000);
    }
});

function updateCopyrightYear() {
    function applyYear(year) {
        var footers = document.querySelectorAll('footer');
        footers.forEach(function (footer) {
            var html = footer.innerHTML;
            var yearStr = String(year);
            html = html.replace(/(Copyright[^\\d]*?\\s*\\d{4})-(\\d{4})/i, function (match, startPart, endYear) {
                return startPart + '-' + yearStr;
            });
            footer.innerHTML = html;
        });
    }
    fetch('https://worldtimeapi.org/api/ip').then(function (resp) {
        return resp.json();
    }).then(function (data) {
        var dateStr = data && data.datetime;
        var y = dateStr ? new Date(dateStr).getFullYear() : new Date().getFullYear();
        applyYear(y);
    }).catch(function () {
        applyYear(new Date().getFullYear());
    });
}
document.addEventListener('DOMContentLoaded', function () {
    updateCopyrightYear();
});

function getSidebarDefaults() {
    var basePath = getBasePath();
    var c = getSiteContent().sidebar || {};
    var rh = getSiteContent().rightHeader || {};
    return {
        showLogo: (c.showLogo !== undefined) ? c.showLogo : true,
        logoBgUrl: basePath + (c.logoBgUrl || rh.logoBgUrl || 'static/img/head.PNG'),
        logoFrameUrl: basePath + (c.logoFrameUrl || rh.logoFrameUrl || 'static/img/logokuang2.png'),
        addressLines: c.addressLines || [],
        titles: c.titles || {},
        personalTags: c.personalTags || [],
        acgnTags: c.acgnTags || [],
        xpTags: c.xpTags || [],
        updates: c.updates || []
    };
}

function renderSidebarLogo(left, data) {
    var existing = left.querySelector(':scope > .logo');
    if (!data.showLogo) {
        if (existing && existing.parentNode) existing.parentNode.removeChild(existing);
        return;
    }
    var logo = existing;
    if (!logo) {
        logo = document.createElement('div');
        logo.className = 'logo';
        var scroll = left.querySelector('.marisa-left-scroll');
        if (scroll) {
            left.insertBefore(logo, scroll);
        } else {
            left.insertBefore(logo, left.firstChild);
        }
    }
    logo.style.backgroundImage = 'url(' + data.logoBgUrl + ')';
    var frame = logo.querySelector('img');
    if (!frame) {
        frame = document.createElement('img');
        frame.style.cssText = 'position: absolute;top:-35%;left:-30%;width: 155%; aspect-ratio: 1/1;';
        logo.appendChild(frame);
    }
    frame.src = data.logoFrameUrl;
}

function renderSidebar() {
    var left = document.querySelector('.marisa-left');
    if (!left) return;
    // Prefer (or create) the scroll container so long sidebar content never spills past the footer.
    var container = left.querySelector('.marisa-left-scroll');
    if (!container) {
        container = document.createElement('div');
        container.className = 'marisa-left-scroll';
        left.appendChild(container);
    }
    var defaults = getSidebarDefaults();
    var overrides = window.sidebarOverrides || {};
    var data = {
        showLogo: (overrides.showLogo !== undefined) ? overrides.showLogo : defaults.showLogo,
        logoBgUrl: overrides.logoBgUrl || defaults.logoBgUrl,
        logoFrameUrl: overrides.logoFrameUrl || defaults.logoFrameUrl,
        addressLines: overrides.addressLines || defaults.addressLines,
        titles: Object.assign({}, defaults.titles, overrides.titles || {}),
        personalTags: overrides.personalTags || defaults.personalTags,
        acgnTags: overrides.acgnTags || defaults.acgnTags,
        xpTags: overrides.xpTags || defaults.xpTags,
        updates: overrides.updates || defaults.updates
    };
    renderSidebarLogo(left, data);
    // Clear previously rendered blocks (in case of re-render).
    // We only remove inside the scroll container so we don't touch the fixed logo block in `.marisa-left`.
    container.querySelectorAll('.left-div.left-des, .left-div.left-tag, .left-div.left-time').forEach(function (el) {
        if (el && el.parentNode) el.parentNode.removeChild(el);
    });
    var leftDes = document.createElement('div');
    leftDes.className = 'left-div left-des';
    var addrIcon1 = '<svg class="icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"><path d="M512 249.976471c-99.388235 0-180.705882 81.317647-180.705882 180.705882s81.317647 180.705882 180.705882 180.705882 180.705882-81.317647 180.705882-180.705882-81.317647-180.705882-180.705882-180.705882z m0 301.17647c-66.258824 0-120.470588-54.211765-120.470588-120.470588s54.211765-120.470588 120.470588-120.470588 120.470588 54.211765 120.470588 120.470588-54.211765 120.470588-120.470588 120.470588z"></path><path d="M512 39.152941c-216.847059 0-391.529412 174.682353-391.529412 391.529412 0 349.364706 391.529412 572.235294 391.529412 572.235294s391.529412-222.870588 391.529412-572.235294c0-216.847059-174.682353-391.529412-391.529412-391.529412z m0 891.482353C424.658824 873.411765 180.705882 686.682353 180.705882 430.682353c0-183.717647 147.576471-331.294118 331.294118-331.294118s331.294118 147.576471 331.294118 331.294118c0 256-243.952941 442.729412-331.294118 499.952941z"></path></svg>';
    var addrIcon2 = '<svg class="icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"><path d="M729.6 234.666667H294.4V157.866667a51.2 51.2 0 0 1 51.2-51.2h332.8a51.2 51.2 0 0 1 51.2 51.2v76.8z m179.2 51.2a51.2 51.2 0 0 1 51.2 51.2v512a51.2 51.2 0 0 1-51.2 51.2H115.2a51.2 51.2 0 0 1-51.2-51.2v-512a51.2 51.2 0 0 1 51.2-51.2h793.557333z m-768 172.032c0 16.384 13.312 29.696 29.696 29.696h683.008a29.696 29.696 0 1 0 0-59.392H170.410667a29.696 29.696 0 0 0-29.696 29.696z m252.416 118.784c0 16.384 13.312 29.696 29.696 29.696h178.176a29.696 29.696 0 1 0 0-59.392H422.912a29.738667 29.738667 0 0 0-29.696 29.696z"></path></svg>';
    var item1 = document.createElement('div');
    item1.className = 'left-des-item';
    item1.innerHTML = addrIcon1 + data.addressLines[0];
    var item2 = document.createElement('div');
    item2.className = 'left-des-item';
    item2.innerHTML = addrIcon2 + data.addressLines[1];
    leftDes.appendChild(item1);
    leftDes.appendChild(item2);
    container.appendChild(leftDes);
    function makeTagSection(title, tags) {
        var wrap = document.createElement('div');
        wrap.className = 'left-div left-tag';
        var header = document.createElement('div');
        header.className = 'left-des-item';
        var tagIcon = '<svg class="icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"><path d="M483.2 790.3L861.4 412c1.7-1.7 2.5-4 2.3-6.3l-25.5-301.4c-0.7-7.8-6.8-13.9-14.6-14.6L522.2 64.3c-2.3-0.2-4.7 0.6-6.3 2.3L137.7 444.8c-3.1 3.1-3.1 8.2 0 11.3l334.2 334.2c3.1 3.2 8.2 3.2 11.3 0z m62.6-651.7l224.6 19 19 224.6L477.5 694 233.9 450.5l311.9-311.9z" fill="#ffffff"></path><path d="M605.958852 324.826232a48 48 0 1 0 67.881066-67.883435 48 48 0 1 0-67.881066 67.883435Z" fill="#ffffff"></path><path d="M889.7 539.8l-39.6-39.5c-3.1-3.1-8.2-3.1-11.3 0l-362 361.3-237.6-237c-3.1-3.1-8.2-3.1-11.3 0l-39.6 39.5c-3.1 3.1-3.1 8.2 0 11.3l243.2 242.8 39.6 39.5c3.1 3.1 8.2 3.1 11.3 0l407.3-406.6c3.1-3.1 3.1-8.2 0-11.3z" fill="#ffffff"></path></svg>';
        header.innerHTML = tagIcon + title;
        wrap.appendChild(header);
        tags.forEach(function (t) {
            var d = document.createElement('div');
            d.className = 'left-tag-item';
            d.textContent = t;
            wrap.appendChild(d);
        });
        return wrap;
    }
    container.appendChild(makeTagSection(data.titles.personal, data.personalTags));
    container.appendChild(makeTagSection(data.titles.acgn, data.acgnTags));
    container.appendChild(makeTagSection(data.titles.xp, data.xpTags));
    var leftTime = document.createElement('div');
    leftTime.className = 'left-div left-time';
    var ul = document.createElement('ul');
    ul.id = 'line';
    data.updates.forEach(function (u) {
        var li = document.createElement('li');
        var focus = document.createElement('div');
        focus.className = 'focus';
        var div1 = document.createElement('div');
        div1.textContent = u.title;
        var div2 = document.createElement('div');
        div2.textContent = u.date;
        li.appendChild(focus);
        li.appendChild(div1);
        li.appendChild(div2);
        ul.appendChild(li);
    });
    leftTime.appendChild(ul);
    container.appendChild(leftTime);
}
document.addEventListener('DOMContentLoaded', function () {
    renderSidebar();
});

function getBasePath() {
    var slugs = ['about-us', 'contact-us', 'tools', 'privacy-policy', 'terms-and-conditions', 'download'];
    var isSub = slugs.some(function (slug) {
        return window.location.pathname.indexOf('/' + slug + '/') !== -1;
    }) || !(/\/$|\/index\.html$|\/(?:KirisameMarisa-DAZE|Hisou-Tenshi)\.github\.io\/?$/.test(window.location.pathname));
    return isSub ? '../' : './';
}

/* Site background: exact basename match; extension jpg/png case-insensitive */
var SITE_BG_EXTS = ['PNG', 'png', 'jpg', 'JPG', 'jpeg', 'JPEG'];
var siteBgCache = Object.create(null);
var siteBgPending = Object.create(null);
var siteBgResolveToken = 0;
var siteBgApplyTimer = null;

function getStaticImgDir() {
    return getBasePath() + 'static/img/';
}

/* Paths consumed via var(--main_bg_color) in static/css/*.css must use ../img/ (sheet-relative). */
function toCssBgUrl(stem, ext) {
    return 'url(../img/' + stem + '.' + ext + ')';
}

function probeExactImageUrl(dirUrl, stem, onDone) {
    var cacheKey = dirUrl + '\0' + stem;
    if (Object.prototype.hasOwnProperty.call(siteBgCache, cacheKey)) {
        onDone(siteBgCache[cacheKey]);
        return;
    }
    if (siteBgPending[cacheKey]) {
        siteBgPending[cacheKey].push(onDone);
        return;
    }
    siteBgPending[cacheKey] = [onDone];
    var i = 0;
    function finish(result) {
        siteBgCache[cacheKey] = result;
        var waiters = siteBgPending[cacheKey] || [];
        delete siteBgPending[cacheKey];
        waiters.forEach(function (cb) { cb(result); });
    }
    function next() {
        if (i >= SITE_BG_EXTS.length) {
            finish(null);
            return;
        }
        var ext = SITE_BG_EXTS[i++];
        var probeUrl = dirUrl + stem + '.' + ext;
        var img = new Image();
        img.onload = function () {
            finish({ probeUrl: probeUrl, cssValue: toCssBgUrl(stem, ext) });
        };
        img.onerror = next;
        img.src = probeUrl;
    }
    next();
}

function getSiteBackgroundStem(theme, isMobile) {
    if (isMobile) return 'mobile-bg';
    if (theme === 'Dark') return 'background_dark';
    return 'background';
}

function applySiteBackground(done) {
    var dirUrl = getStaticImgDir();
    var theme = (document.documentElement.getAttribute('data-theme') || themeState || 'Light');
    var isMobile = window.matchMedia && window.matchMedia('(max-width: 800px)').matches;
    var stem = getSiteBackgroundStem(theme, isMobile);
    var token = ++siteBgResolveToken;
    probeExactImageUrl(dirUrl, stem, function (result) {
        if (token !== siteBgResolveToken) return;
        if (result && result.cssValue) {
            document.documentElement.style.setProperty('--main_bg_color', result.cssValue);
        } else {
            /* Image missing/failed: solid black instead of a broken url() */
            document.documentElement.style.setProperty('--main_bg_color', '#000');
        }
        if (typeof done === 'function') done(result || null);
        if (typeof window.__onSiteBackgroundApplied === 'function') {
            window.__onSiteBackgroundApplied(result || null);
        }
    });
}

function scheduleSiteBackground() {
    clearTimeout(siteBgApplyTimer);
    siteBgApplyTimer = setTimeout(function () {
        siteBgApplyTimer = null;
        applySiteBackground();
    }, 0);
}

function initSiteBackground() {
    scheduleSiteBackground();
    if (window.matchMedia) {
        var mq = window.matchMedia('(max-width: 800px)');
        var onViewportChange = function () { scheduleSiteBackground(); };
        if (typeof mq.addEventListener === 'function') {
            mq.addEventListener('change', onViewportChange);
        } else if (typeof mq.addListener === 'function') {
            mq.addListener(onViewportChange);
        }
    }
    if (!window.__siteBgThemeObserver) {
        window.__siteBgThemeObserver = new MutationObserver(function (mutations) {
            for (var i = 0; i < mutations.length; i++) {
                if (mutations[i].attributeName === 'data-theme') {
                    scheduleSiteBackground();
                    break;
                }
            }
        });
        window.__siteBgThemeObserver.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
        });
    }
}

function getNavbarDefaults() {
    var basePath = getBasePath();
    var c = getSiteContent().navbar || {};
    return {
        logoSrc: basePath + (c.logoSrc || 'static/img/title.png'),
        logoHref: c.logoHref || '',
        logoText: c.logoText || '',
        links: c.links || []
    };
}

function renderNavbar() {
    var container = document.querySelector('.marisa-navbar');
    if (!container) return;
    var defaults = getNavbarDefaults();
    var overrides = window.navbarOverrides || {};
    var data = {
        logoSrc: overrides.logoSrc || defaults.logoSrc,
        logoHref: overrides.logoHref || defaults.logoHref,
        logoText: overrides.logoText || defaults.logoText,
        links: overrides.links || defaults.links
    };
    container.innerHTML = '';
    var navbarContainer = document.createElement('div');
    navbarContainer.className = 'navbar-container';
    var navbarLogo = document.createElement('div');
    navbarLogo.className = 'navbar-logo';
    var logoImg = document.createElement('img');
    logoImg.src = data.logoSrc;
    logoImg.alt = 'Logo';
    var logoAnchor = document.createElement('a');
    logoAnchor.href = data.logoHref;
    var logoSpan = document.createElement('span');
    logoSpan.textContent = data.logoText;
    logoAnchor.appendChild(logoSpan);
    navbarLogo.appendChild(logoImg);
    navbarLogo.appendChild(logoAnchor);
    var navbarLinks = document.createElement('div');
    navbarLinks.className = 'navbar-links';
    data.links.forEach(function (l) {
        var a = document.createElement('a');
        a.href = l.href;
        a.className = 'navbar-link';
        a.textContent = l.text;
        navbarLinks.appendChild(a);
    });
    var navbarToggle = document.createElement('div');
    navbarToggle.className = 'navbar-toggle';
    var toggleSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    toggleSvg.setAttribute('class', 'icon');
    toggleSvg.setAttribute('viewBox', '0 0 1024 1024');
    toggleSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    var togglePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    togglePath.setAttribute('d', 'M128 256h768v86H128v-86zm0 298v-84h768v84H128zm0 256v-86h768v86H128z');
    toggleSvg.appendChild(togglePath);
    navbarToggle.appendChild(toggleSvg);
    navbarContainer.appendChild(navbarLogo);
    navbarContainer.appendChild(navbarLinks);
    navbarContainer.appendChild(navbarToggle);
    container.appendChild(navbarContainer);
    navbarToggle.addEventListener('click', function () {
        navbarLinks.classList.toggle('active');
    });
}
document.addEventListener('DOMContentLoaded', function () {
    renderNavbar();
});

/* 标签云布局算法优化版 */
function initWordCloud() {
    const containers = document.querySelectorAll('.left-tag');
    
    containers.forEach(container => {
        // 标记已初始化，防止重复，但允许Resize时强制刷新
        if (container.dataset.cloud === 'on' && !window.isResizing) return;
        container.dataset.cloud = 'on';

        let items = Array.from(container.querySelectorAll('.left-tag-item'));
        if (items.length === 0) return;

        // --- 配置参数 ---
        const config = {
            maxFontSize: 32,
            minFontSize: 12,
            padding: 8,         // 增加间距
            maxItems: 60,       // 限制数量优化性能
            spiralStep: 5,      // 螺旋步长
            angleStep: 0.2      // 角度步长 (更精细)
        };

        // --- 1. 预处理与测量 (减少回流) ---
        
        // 限制标签数量
        if (items.length > config.maxItems) {
            items.slice(config.maxItems).forEach(el => el.style.display = 'none');
            items = items.slice(0, config.maxItems);
        } else {
            items.forEach(el => el.style.display = '');
        }

        // 批量设置样式并测量
        const measuredItems = items.map((item, index) => {
            // 样式计算
            const ratio = index / items.length;
            const fontSize = Math.max(config.minFontSize, config.maxFontSize - (config.maxFontSize - config.minFontSize) * ratio);
            const opacity = Math.max(0.6, 1 - ratio * 0.4);
            const fontWeight = index === 0 ? 900 : (index < 5 ? 700 : 400);

            // 应用样式
            item.style.fontSize = fontSize + 'px';
            item.style.fontWeight = fontWeight;
            item.style.opacity = opacity;
            item.style.position = 'absolute';
            item.style.transition = 'transform 0.3s ease, opacity 0.3s ease'; // 优化交互动画

            // 交互事件 (鼠标靠近高亮)
            item.onmouseenter = () => {
                items.forEach(el => {
                    if (el === item) {
                        el.style.opacity = '1';
                        el.style.zIndex = '100';
                        el.style.transform = 'scale(1.2)';
                    } else {
                        el.style.opacity = '0.3';
                    }
                });
            };
            item.onmouseleave = () => {
                items.forEach((el, idx) => {
                    const r = idx / items.length;
                    el.style.opacity = Math.max(0.6, 1 - r * 0.4);
                    el.style.zIndex = '';
                    el.style.transform = '';
                });
            };

            return {
                element: item,
                width: item.offsetWidth,
                height: item.offsetHeight,
                area: item.offsetWidth * item.offsetHeight
            };
        });

        // 按面积大小排序，优先放置大标签
        measuredItems.sort((a, b) => b.area - a.area);

        // --- 2. 空间分区 (加速碰撞检测) ---
        const gridSize = 60; // 网格大小
        const grid = {}; 

        function addToGrid(rect) {
            const startX = Math.floor(rect.left / gridSize);
            const endX = Math.floor(rect.right / gridSize);
            const startY = Math.floor(rect.top / gridSize);
            const endY = Math.floor(rect.bottom / gridSize);

            for (let x = startX; x <= endX; x++) {
                for (let y = startY; y <= endY; y++) {
                    const key = `${x},${y}`;
                    if (!grid[key]) grid[key] = [];
                    grid[key].push(rect);
                }
            }
        }

        function checkCollision(rect) {
            const startX = Math.floor(rect.left / gridSize);
            const endX = Math.floor(rect.right / gridSize);
            const startY = Math.floor(rect.top / gridSize);
            const endY = Math.floor(rect.bottom / gridSize);

            for (let x = startX; x <= endX; x++) {
                for (let y = startY; y <= endY; y++) {
                    const key = `${x},${y}`;
                    if (grid[key]) {
                        for (const other of grid[key]) {
                            // 严格碰撞检测 (包含padding)
                            if (!(rect.right < other.left || 
                                  rect.left > other.right || 
                                  rect.bottom < other.top || 
                                  rect.top > other.bottom)) {
                                return true;
                            }
                        }
                    }
                }
            }
            return false;
        }

        // --- 3. 布局计算 ---
        const containerWidth = container.offsetWidth;
        // 初始中心点
        const centerX = containerWidth / 2;
        const centerY = 170; // 预设一个起始高度中心，随内容扩展

        let minTop = centerY;
        let maxBottom = centerY;

        measuredItems.forEach(item => {
            // 包含padding的尺寸
            const w = item.width + config.padding;
            const h = item.height + config.padding;
            
            let angle = 0;
            let radius = 0;
            let x = 0;
            let y = 0;
            let found = false;
            // 限制尝试次数，防止死循环
            let maxIter = 1000; 

            while(maxIter-- > 0) {
                // 螺旋公式
                x = centerX + radius * Math.cos(angle) - w / 2;
                y = centerY + radius * Math.sin(angle) - h / 2;

                const rect = {
                    left: x,
                    top: y,
                    right: x + w,
                    bottom: y + h
                };

                // 边界检查 (增加垂直方向限制)
                if (rect.left < 0 || rect.right > containerWidth || rect.top < 25 || rect.bottom > config.maxContainerHeight) {
                    // 超出边界，继续寻找
                } else {
                    if (!checkCollision(rect)) {
                        // 找到位置
                        found = true;
                        
                        // 记录实际位置 (去掉padding偏移，居中放置)
                        item.element.style.left = (x + config.padding / 2) + 'px';
                        item.element.style.top = (y + config.padding / 2) + 'px';
                        
                        addToGrid(rect);
                        
                        // 更新整体边界
                        if (rect.top < minTop) minTop = rect.top;
                        if (rect.bottom > maxBottom) maxBottom = rect.bottom;
                        break;
                    }
                }

                // 步长递增
                angle += config.angleStep;
                radius += config.spiralStep * config.angleStep / (2 * Math.PI);
            }

            if (!found) {
                // 降级处理：隐藏
                item.element.style.opacity = '0';
                item.element.style.pointerEvents = 'none';
            }
        });

        // --- 4. 调整容器高度 ---
        // 确保容器足够高以容纳所有内容
        const finalHeight = Math.max(300, maxBottom + 50);
        container.style.height = finalHeight + 'px';
    });
}

document.addEventListener('DOMContentLoaded', function () {
    
    // 渲染公共组件
    renderRightHeader();
    renderFooter();

    // 延迟执行确保字体加载和样式应用
    setTimeout(initWordCloud, 100);
});

// 窗口大小改变时重排
let resizeTimer;
window.addEventListener('resize', () => {
    window.isResizing = true;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        document.querySelectorAll('.left-tag').forEach(c => c.dataset.cloud = ''); // 重置标记
        initWordCloud();
        window.isResizing = false;
    }, 300);
});

function getRightHeaderDefaults() {
    var basePath = getBasePath();
    var c = getSiteContent().rightHeader || {};
    return {
        logoBgUrl: basePath + (c.logoBgUrl || 'static/img/head.PNG'),
        logoFrameUrl: basePath + (c.logoFrameUrl || 'static/img/logokuang2.png'),
        welcomeHtml: c.welcomeHtml || '',
        desc1Html: c.desc1Html || '',
        desc2Html: c.desc2Html || '',
        showSnake: (c.showSnake !== undefined) ? c.showSnake : false,
        icons: c.icons || []
    };
}

function renderRightHeader() {
    var container = document.querySelector('.marisa-right header');
    if (!container) return;
    
    // Allow overrides
    var defaults = getRightHeaderDefaults();
    var overrides = window.rightHeaderOverrides || {};
    var data = {
        logoBgUrl: overrides.logoBgUrl || defaults.logoBgUrl,
        logoFrameUrl: overrides.logoFrameUrl || defaults.logoFrameUrl,
        welcomeHtml: overrides.welcomeHtml || defaults.welcomeHtml,
        desc1Html: overrides.desc1Html || defaults.desc1Html,
        desc2Html: overrides.desc2Html || defaults.desc2Html,
        showSnake: (overrides.showSnake !== undefined) ? overrides.showSnake : defaults.showSnake,
        icons: overrides.icons || defaults.icons
    };

    container.innerHTML = '';
    
    // Logo
    var logoDiv = document.createElement('div');
    logoDiv.className = 'index-logo';
    logoDiv.style.backgroundImage = 'url(' + data.logoBgUrl + ')';
    var logoImg = document.createElement('img');
    logoImg.style.cssText = 'position: absolute;top:-35%;left:-30%;width: 155%; aspect-ratio: 1/1;';
    logoImg.src = data.logoFrameUrl;
    logoDiv.appendChild(logoImg);
    container.appendChild(logoDiv);
    
    // Welcome
    var welcomeDiv = document.createElement('div');
    welcomeDiv.className = 'welcome';
    welcomeDiv.innerHTML = data.welcomeHtml;
    container.appendChild(welcomeDiv);
    
    // Description 1
    var desc1Div = document.createElement('div');
    desc1Div.className = 'description';
    desc1Div.innerHTML = data.desc1Html;
    container.appendChild(desc1Div);
    
    // Description 2
    var desc2Div = document.createElement('div');
    desc2Div.className = 'description';
    desc2Div.innerHTML = data.desc2Html;
    container.appendChild(desc2Div);
    
    // Icon Container
    var iconContainer = document.createElement('div');
    iconContainer.className = 'iconContainer';
    
    data.icons.forEach(function(icon) {
        var a = document.createElement('a');
        a.className = 'iconItem';
        if (icon.target) a.target = icon.target;
        if (icon.onclick) a.setAttribute('onclick', icon.onclick);
        a.href = icon.href;
        
        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'icon');
        svg.setAttribute('viewBox', icon.viewBox);
        svg.setAttribute('width', '20');
        svg.setAttribute('height', '20');
        
        var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', icon.path);
        
        svg.appendChild(path);
        a.appendChild(svg);
        
        var tip = document.createElement('div');
        tip.className = 'iconTip';
        tip.textContent = icon.tip;
        a.appendChild(tip);
        
        iconContainer.appendChild(a);
    });
    
    // Switch
    var switchLink = document.createElement('a');
    switchLink.className = 'switch';
    switchLink.href = 'javascript:void(0)';
    var switchHtml = '<div class="onoffswitch">' +
        '<input type="checkbox" name="onoffswitch" class="onoffswitch-checkbox" id="myonoffswitch" checked>' +
        '<label class="onoffswitch-label" for="myonoffswitch">' +
        '<span class="onoffswitch-inner"></span>' +
        '<span class="onoffswitch-switch"></span>' +
        '</label></div>';
    switchLink.innerHTML = switchHtml;
    iconContainer.appendChild(switchLink);
    
    container.appendChild(iconContainer);

    // Snake
    if (data.showSnake) {
        var snakeDiv = document.createElement('div');
        snakeDiv.className = 'tanChiShe';
        var snakeImg = document.createElement('img');
        snakeImg.id = 'tanChiShe';
        snakeImg.src = getBasePath() + 'static/svg/snake-' + themeState + '.svg';
        snakeImg.alt = '';
        snakeDiv.appendChild(snakeImg);
        container.appendChild(snakeDiv);
    }

    initThemeSwitch();
}

function getFooterDefaults() {
    var c = getSiteContent().footer || {};
    return {
        startYear: c.startYear || 2022,
        author: c.author || '',
        authorUrl: c.authorUrl || '',
        rights: c.rights || ''
    };
}

function renderFooter() {
    var footer = document.querySelector('footer');
    if (!footer) return;
    
    var defaults = getFooterDefaults();
    var overrides = window.footerOverrides || {};
    var data = {
        startYear: overrides.startYear || defaults.startYear,
        author: overrides.author || defaults.author,
        authorUrl: overrides.authorUrl || defaults.authorUrl,
        rights: overrides.rights || defaults.rights
    };
    
    var currentYear = new Date().getFullYear();
    var yearStr = data.startYear + '-' + currentYear;
    
    footer.innerHTML = 'Copyright © ' + yearStr + ' <a href="' + data.authorUrl + '">' + data.author + '.</a><br>' + data.rights;
}

/* ═══════════════════════════════════════════
   Dynamic Liquid Glass
   JS only writes CSS variables / data attrs
   ═══════════════════════════════════════════ */
(function initDynamicGlass() {
    var root = document.documentElement;
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var scrollQueued = false;
    var lumaQueued = false;
    var lastScrollFlag = null;
    var lastDenseFlag = null;
    var lastLuma = -1;
    var scrollIdleTimer = null;

    function setVar(name, value) {
        root.style.setProperty(name, value);
    }

    function setFlag(attr, on) {
        if (on) root.setAttribute(attr, '1');
        else root.removeAttribute(attr);
    }

    function onScroll() {
        if (scrollQueued) return;
        scrollQueued = true;
        requestAnimationFrame(function () {
            scrollQueued = false;
            var y = window.scrollY || document.documentElement.scrollTop || 0;
            var scrolled = y > 12;
            if (scrolled !== lastScrollFlag) {
                lastScrollFlag = scrolled;
                setFlag('data-glass-scroll', scrolled);
            }
            clearTimeout(scrollIdleTimer);
            if (scrolled && !reduceMotion) {
                scrollIdleTimer = setTimeout(function () {
                    if ((window.scrollY || 0) <= 12) {
                        lastScrollFlag = false;
                        setFlag('data-glass-scroll', false);
                    }
                }, 900);
            }
        });
    }

    function sampleBackgroundLuma() {
        if (lumaQueued) return;
        lumaQueued = true;
        requestAnimationFrame(function () {
            lumaQueued = false;
            var theme = root.getAttribute('data-theme') || 'Light';
            var estimated = theme === 'Dark' ? 0.28 : 0.58;

            try {
                var probe = document.createElement('canvas');
                probe.width = 8;
                probe.height = 8;
                var ctx = probe.getContext('2d', { willReadFrequently: true });
                if (ctx) {
                    var bgImg = getComputedStyle(root, '::before').backgroundImage;
                    if (!bgImg || bgImg === 'none') {
                        bgImg = getComputedStyle(root).getPropertyValue('--main_bg_color');
                    }
                    var urlMatch = String(bgImg).match(/url\(["']?([^"')]+)["']?\)/);
                    if (urlMatch) {
                        var img = new Image();
                        img.crossOrigin = 'anonymous';
                        img.onload = function () {
                            try {
                                ctx.drawImage(img, 0, 0, 8, 8);
                                var data = ctx.getImageData(0, 0, 8, 8).data;
                                var sum = 0;
                                var rSum = 0;
                                var gSum = 0;
                                var bSum = 0;
                                var count = 0;
                                for (var i = 0; i < data.length; i += 4) {
                                    rSum += data[i];
                                    gSum += data[i + 1];
                                    bSum += data[i + 2];
                                    sum += (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255;
                                    count++;
                                }
                                applyGlassEnv(sum / count, rSum / count, gSum / count, bSum / count);
                            } catch (e) {
                                applyGlassEnv(estimated);
                            }
                        };
                        img.onerror = function () { applyGlassEnv(estimated); };
                        img.src = urlMatch[1];
                        return;
                    }
                }
            } catch (e) { /* ignore */ }

            applyGlassEnv(estimated);
        });
    }

    function boostTint(r, g, b, dark, luma) {
        // Push sample toward vivid chroma; avoid muddy gray midtones
        var max = Math.max(r, g, b);
        var min = Math.min(r, g, b);
        var mid = (r + g + b) / 3;
        if (max - min < 18) {
            if (dark) return { r: 110, g: 80, b: 230 };
            return { r: 90, g: 165, b: 230 };
        }
        var satBoost = dark ? 1.55 : 1.45;
        // Bright backgrounds: less lift, slightly darker channels so white text stays readable
        var lift = dark ? 28 : (luma > 0.62 ? 8 : 28);
        var ceil = luma > 0.68 ? 210 : 255;
        function channel(v) {
            var pushed = mid + (v - mid) * satBoost + lift * 0.35;
            if (luma > 0.62) pushed *= 0.88;
            return Math.max(40, Math.min(ceil, Math.round(pushed)));
        }
        return { r: channel(r), g: channel(g), b: channel(b) };
    }

    function applyGlassEnv(luma, r, g, b) {
        if (Math.abs(luma - lastLuma) < 0.02 && r == null) return;
        lastLuma = luma;
        setVar('--glass-luma', luma.toFixed(3));

        var theme = root.getAttribute('data-theme') || 'Light';
        var dark = theme === 'Dark';
        var tint;
        if (r != null && g != null && b != null) {
            tint = boostTint(r, g, b, dark, luma);
        } else if (dark) {
            tint = { r: 95, g: 70, b: 210 };
        } else {
            tint = luma > 0.65 ? { r: 70, g: 140, b: 210 } : { r: 120, g: 200, b: 255 };
        }
        setVar('--glass-tint-r', String(tint.r));
        setVar('--glass-tint-g', String(tint.g));
        setVar('--glass-tint-b', String(tint.b));

        var dense = luma < 0.38 || luma > 0.78;
        if (dense !== lastDenseFlag) {
            lastDenseFlag = dense;
            setFlag('data-glass-dense', dense);
        }

        // Whiteness cap: as background gets brighter, cut white overlay and deepen tint
        var bright = luma >= 0.58;
        setFlag('data-glass-bright', bright);

        var whiteMax = dark ? 0.22 : 0.28;
        var whiteTop;
        var whiteHover;
        var tintAlpha;
        var fillAlpha;
        var deepAlpha;

        if (luma >= 0.78) {
            whiteTop = 0.08;
            whiteHover = 0.12;
            tintAlpha = dark ? 0.62 : 0.64;
            fillAlpha = dark ? 0.52 : 0.54;
            deepAlpha = dark ? 0.72 : 0.74;
        } else if (luma >= 0.65) {
            whiteTop = 0.12;
            whiteHover = 0.16;
            tintAlpha = dark ? 0.56 : 0.58;
            fillAlpha = dark ? 0.46 : 0.48;
            deepAlpha = dark ? 0.66 : 0.68;
        } else if (luma >= 0.58) {
            whiteTop = 0.18;
            whiteHover = 0.22;
            tintAlpha = dark ? 0.50 : 0.50;
            fillAlpha = dark ? 0.40 : 0.40;
            deepAlpha = dark ? 0.60 : 0.58;
        } else {
            whiteTop = dark ? 0.18 : 0.26;
            whiteHover = dark ? 0.24 : 0.32;
            tintAlpha = dark ? 0.48 : 0.42;
            fillAlpha = dark ? 0.38 : 0.32;
            deepAlpha = dark ? 0.58 : 0.52;
        }

        whiteTop = Math.min(whiteTop, whiteMax);
        whiteHover = Math.min(whiteHover, whiteMax + 0.04);

        setVar('--glass-white-top', whiteTop.toFixed(3));
        setVar('--glass-white-hover', whiteHover.toFixed(3));
        setVar('--glass-tint-alpha', tintAlpha.toFixed(3));
        setVar('--glass-tint-mid-alpha', (tintAlpha * 0.72).toFixed(3));
        setVar('--glass-tint-deep-alpha', deepAlpha.toFixed(3));
        setVar('--glass-fill-alpha', fillAlpha.toFixed(3));
        setVar('--glass-fill-hover-alpha', (fillAlpha + 0.06).toFixed(3));
        setVar('--glass-brightness', luma >= 0.65 ? '1.0' : (dark ? '1.06' : '1.08'));

        // Always pure white body text (emphasis colors stay in CSS)
        setVar('--glass-text', '#ffffff');
        setVar('--glass-text-muted', '#ffffff');
        setVar('--main_text_color', '#ffffff');
        setVar('--item_left_title_color', '#ffffff');
        setVar('--item_left_text_color', '#ffffff');
        setVar('--footer_text_color', '#ffffff');
        setVar('--fill', '#ffffff');
        setVar('--glass-text-shadow', bright || dark
            ? '0 1px 3px rgba(0, 20, 50, 0.65), 0 0 1px rgba(0, 10, 30, 0.4)'
            : '0 1px 2px rgba(0, 20, 50, 0.45)');
        setVar('--glass-opacity-base', dense || bright ? '0.64' : (dark ? '0.50' : '0.48'));
    }

    function onThemeChange() {
        lastLuma = -1;
        sampleBackgroundLuma();
    }

    window.__onSiteBackgroundApplied = function () {
        lastLuma = -1;
        sampleBackgroundLuma();
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', function () {
        sampleBackgroundLuma();
    }, { passive: true });

    var observer = new MutationObserver(function (mutations) {
        for (var i = 0; i < mutations.length; i++) {
            if (mutations[i].attributeName === 'data-theme') {
                onThemeChange();
                break;
            }
        }
    });
    observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            onScroll();
            sampleBackgroundLuma();
        });
    } else {
        onScroll();
        sampleBackgroundLuma();
    }
})();

/* ---- Panel PDF export (section text → canvas → PDF, no html2canvas) ---- */
(function () {
    var JSPDF_CDN = 'https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js';
    var loadPromise = null;

    function loadJsPdf() {
        if (window.jspdf && window.jspdf.jsPDF) return Promise.resolve(window.jspdf.jsPDF);
        if (window.jsPDF) return Promise.resolve(window.jsPDF);
        if (loadPromise) return loadPromise;
        loadPromise = new Promise(function (resolve, reject) {
            var script = document.createElement('script');
            script.src = JSPDF_CDN;
            script.async = true;
            script.onload = function () {
                var Ctor = (window.jspdf && window.jspdf.jsPDF) || window.jsPDF;
                if (Ctor) resolve(Ctor);
                else reject(new Error('jsPDF unavailable'));
            };
            script.onerror = function () {
                loadPromise = null;
                reject(new Error('Failed to load jsPDF'));
            };
            document.head.appendChild(script);
        });
        return loadPromise;
    }

    function sanitizeFilename(name) {
        return String(name || 'document')
            .replace(/[\\/:*?"<>|]+/g, '_')
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 80) || 'document';
    }

    function normalizeText(text) {
        return String(text || '')
            .replace(/\u00a0/g, ' ')
            .replace(/[ \t]+\n/g, '\n')
            .replace(/\n[ \t]+/g, '\n')
            .replace(/[ \t]{2,}/g, ' ')
            .trim();
    }

    function collectBlocks(panel) {
        var blocks = [];

        function push(type, text, opts) {
            text = normalizeText(text);
            if (!text) return;
            blocks.push(Object.assign({ type: type, text: text }, opts || {}));
        }

        var header = panel.querySelector(':scope > .header');
        if (header) {
            var h1 = header.querySelector('h1');
            if (h1) push('h1', h1.textContent);
            var address = header.querySelector('address');
            if (address) {
                var addrLines = (address.innerText || address.textContent || '').split(/\n+/);
                addrLines.forEach(function (line) { push('meta', line, { align: 'center' }); });
            }
            blocks.push({ type: 'rule' });
        }

        var sections = panel.querySelectorAll(':scope > section');
        if (!sections.length) {
            // Fallback: whole panel text
            var clone = panel.cloneNode(true);
            var btn = clone.querySelector('.print-button');
            if (btn && btn.parentNode) btn.parentNode.removeChild(btn);
            push('p', clone.innerText || clone.textContent);
            return blocks;
        }

        Array.prototype.forEach.call(sections, function (section) {
            var title = section.querySelector(':scope > .section-title');
            if (title) push('h2', title.textContent);

            Array.prototype.forEach.call(section.children, function (child) {
                if (child.classList && child.classList.contains('section-title')) return;

                if (child.classList && child.classList.contains('experience-item')) {
                    var expTitle = child.querySelector('.experience-title');
                    var expSub = child.querySelector('.experience-subtitle');
                    var expDur = child.querySelector('.experience-duration');
                    if (expTitle) push('h3', expTitle.textContent);
                    if (expSub) push('meta', expSub.textContent);
                    if (expDur) push('meta', expDur.textContent);

                    // Walk direct content: text nodes + nested lists/paragraphs
                    Array.prototype.forEach.call(child.childNodes, function (node) {
                        if (node.nodeType === 3) {
                            push('p', node.textContent);
                            return;
                        }
                        if (node.nodeType !== 1) return;
                        var tag = node.tagName;
                        if (node.classList && (
                            node.classList.contains('experience-header') ||
                            node.classList.contains('experience-title') ||
                            node.classList.contains('experience-subtitle') ||
                            node.classList.contains('experience-duration')
                        )) return;
                        if (tag === 'UL' || tag === 'OL') {
                            Array.prototype.forEach.call(node.querySelectorAll(':scope > li'), function (li) {
                                push('li', li.innerText || li.textContent);
                            });
                            return;
                        }
                        if (tag === 'BR') return;
                        push('p', node.innerText || node.textContent);
                    });
                    return;
                }

                if (child.tagName === 'UL' || child.tagName === 'OL') {
                    Array.prototype.forEach.call(child.querySelectorAll(':scope > li'), function (li) {
                        push('li', li.innerText || li.textContent);
                    });
                    return;
                }

                push('p', child.innerText || child.textContent);
            });
        });

        return blocks;
    }

    function wrapLine(ctx, text, maxWidth) {
        var chars = Array.from(String(text || ''));
        if (!chars.length) return [''];
        var lines = [];
        var current = '';
        for (var i = 0; i < chars.length; i++) {
            var ch = chars[i];
            if (ch === '\n') {
                lines.push(current);
                current = '';
                continue;
            }
            var trial = current + ch;
            if (ctx.measureText(trial).width > maxWidth && current) {
                lines.push(current);
                current = ch;
            } else {
                current = trial;
            }
        }
        if (current) lines.push(current);
        return lines.length ? lines : [''];
    }

    function styleFor(type, ctx, opts) {
        opts = opts || {};
        if (type === 'h1') {
            ctx.font = '700 28px "Segoe UI","PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif';
            return { size: 28, gap: 14, align: 'center', color: '#111111' };
        }
        if (type === 'h2') {
            ctx.font = '700 18px "Segoe UI","PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif';
            return { size: 18, gap: 12, align: 'left', color: '#111111', rule: true };
        }
        if (type === 'h3') {
            ctx.font = '700 14px "Segoe UI","PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif';
            return { size: 14, gap: 8, align: 'left', color: '#111111' };
        }
        if (type === 'meta') {
            ctx.font = '400 12px "Segoe UI","PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif';
            return {
                size: 12,
                gap: 6,
                align: opts.align || 'left',
                color: '#444444'
            };
        }
        if (type === 'li') {
            ctx.font = '400 13px "Segoe UI","PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif';
            return { size: 13, gap: 8, align: 'left', color: '#222222', bullet: true };
        }
        ctx.font = '400 13px "Segoe UI","PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif';
        return { size: 13, gap: 10, align: 'left', color: '#222222' };
    }

    function renderBlocksToCanvases(blocks) {
        // A4 at ~2x CSS px
        var pageW = 1190;
        var pageH = 1684;
        var marginX = 72;
        var marginY = 72;
        var contentW = pageW - marginX * 2;
        var lineGap = 1.45;

        var pages = [];
        var canvas = null;
        var ctx = null;
        var y = 0;

        function newPage() {
            canvas = document.createElement('canvas');
            canvas.width = pageW;
            canvas.height = pageH;
            ctx = canvas.getContext('2d');
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, pageW, pageH);
            ctx.textBaseline = 'top';
            y = marginY;
            pages.push(canvas);
        }

        function ensureSpace(need) {
            if (!canvas || y + need > pageH - marginY) newPage();
        }

        function drawRule() {
            ensureSpace(18);
            ctx.strokeStyle = '#222222';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(marginX, y + 6);
            ctx.lineTo(pageW - marginX, y + 6);
            ctx.stroke();
            y += 18;
        }

        newPage();

        blocks.forEach(function (block) {
            if (block.type === 'rule') {
                drawRule();
                return;
            }

            var style = styleFor(block.type, ctx, block);
            var prefix = style.bullet ? '•  ' : '';
            var text = prefix + block.text.replace(/\s*\n\s*/g, ' ');
            var lines = wrapLine(ctx, text, contentW);
            var lineH = style.size * lineGap;

            lines.forEach(function (line, idx) {
                ensureSpace(lineH + (idx === lines.length - 1 ? style.gap : 0));
                styleFor(block.type, ctx, block);
                ctx.fillStyle = style.color;
                var x = marginX;
                if (style.align === 'center') {
                    x = Math.max(marginX, (pageW - ctx.measureText(line).width) / 2);
                }
                ctx.fillText(line, x, y);
                y += lineH;
            });

            if (style.rule) {
                ctx.strokeStyle = '#333333';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(marginX, y);
                ctx.lineTo(pageW - marginX, y);
                ctx.stroke();
                y += 8;
            }
            y += style.gap;
        });

        return pages;
    }

    function restoreButton(btn, html) {
        btn.disabled = false;
        btn.removeAttribute('aria-busy');
        btn.innerHTML = html;
    }

    window.exportPanelPdf = function (btn) {
        if (!btn || typeof btn.closest !== 'function') return;
        var panel = btn.closest('.left-div.left-des');
        if (!panel) return;

        var titleEl = panel.querySelector('.header h1');
        var pageTitle = document.querySelector('content > .title');
        var rawName = (titleEl && titleEl.textContent) ||
            (pageTitle && pageTitle.textContent) ||
            document.title ||
            'document';
        var filename = sanitizeFilename(rawName) + '.pdf';
        var originalHtml = btn.innerHTML;

        btn.disabled = true;
        btn.setAttribute('aria-busy', 'true');
        btn.innerHTML = 'Generating…';

        loadJsPdf()
            .then(function (JsPDF) {
                var blocks = collectBlocks(panel);
                if (!blocks.length) throw new Error('panel content empty');

                var pages = renderBlocksToCanvases(blocks);
                var pdf = new JsPDF({ unit: 'pt', format: 'a4', orientation: 'portrait' });
                var pdfW = pdf.internal.pageSize.getWidth();
                var pdfH = pdf.internal.pageSize.getHeight();

                pages.forEach(function (pageCanvas, index) {
                    if (index > 0) pdf.addPage();
                    var img = pageCanvas.toDataURL('image/jpeg', 0.95);
                    pdf.addImage(img, 'JPEG', 0, 0, pdfW, pdfH);
                });

                pdf.save(filename);
            })
            .catch(function (err) {
                console.error('[exportPanelPdf]', err);
                alert('PDF 生成失败，请稍后重试。');
            })
            .then(function () {
                restoreButton(btn, originalHtml);
            });
    };
})();

