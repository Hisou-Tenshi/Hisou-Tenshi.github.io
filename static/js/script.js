/* ==========================================================================
   script.js — 全人類の緋想天
   Vanilla, dependency-free, deferred work only.
   Nothing here fetches a byte until the visitor asks for it
   (the BGM playlist is loaded on first player interaction).
   ========================================================================== */
(function () {
	'use strict';

	var root = document.documentElement;
	var doc = document;
	var $ = function (s, c) { return (c || doc).querySelector(s); };
	var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };
	var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	/* ---------------------------------------------------------------- cookie */
	function readCookie(name) {
		var m = doc.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
		return m ? decodeURIComponent(m[1]) : null;
	}
	function writeCookie(name, value, days) {
		var d = new Date();
		d.setTime(d.getTime() + (days || 365) * 864e5);
		doc.cookie = name + '=' + encodeURIComponent(value) + ';expires=' + d.toUTCString() + ';path=/;samesite=lax';
	}

	/* ----------------------------------------------------------------- theme */
	var themeBtn = $('#themeBtn');
	var mqDark = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

	function currentTheme() { return root.getAttribute('data-theme') === 'Dark' ? 'Dark' : 'Light'; }
	function paintTheme(mode) {
		root.setAttribute('data-theme', mode);
		if (themeBtn) {
			themeBtn.setAttribute('aria-label', mode === 'Dark' ? '切换到浅色模式' : '切换到深色模式');
			themeBtn.setAttribute('title', mode === 'Dark' ? '浅色模式' : '深色模式');
		}
	}
	if (themeBtn) {
		themeBtn.addEventListener('click', function () {
			var next = currentTheme() === 'Dark' ? 'Light' : 'Dark';
			paintTheme(next);
			writeCookie('themeState', next);
			writeCookie('themeMode', 'manual');
		});
	}
	if (mqDark) {
		var onScheme = function (e) {
			if (readCookie('themeMode') === 'manual') return;
			paintTheme(e.matches ? 'Dark' : 'Light');
		};
		if (mqDark.addEventListener) mqDark.addEventListener('change', onScheme);
		else if (mqDark.addListener) mqDark.addListener(onScheme);
	}
	paintTheme(currentTheme());

	/* ------------------------------------------------------- reveal on scroll */
	(function reveal() {
		var items = $$('[data-rv]');
		if (!items.length) return;
		if (reduceMotion) {
			items.forEach(function (el) { el.classList.add('is-in'); });
			return;
		}
		var pending = items.slice();
		var ticking = false;
		/* Rect-based sweep: deterministic, and immune to the zero-height case
		   that IntersectionObserver can miss on freshly laid-out marquees. */
		function sweep() {
			ticking = false;
			var vh = window.innerHeight || 800;
			var alive = [];
			for (var i = 0; i < pending.length; i++) {
				var el = pending[i];
				if (!el.isConnected) continue;
				var r = el.getBoundingClientRect();
				if (r.top < vh * 0.94) el.classList.add('is-in');
				else alive.push(el);
			}
			pending = alive;
			if (!pending.length) {
				window.removeEventListener('scroll', queue);
				window.removeEventListener('resize', queue);
			}
		}
		function queue() {
			if (ticking) return;
			ticking = true;
			window.requestAnimationFrame(sweep);
		}
		window.addEventListener('scroll', queue, { passive: true });
		window.addEventListener('resize', queue);
		window.addEventListener('load', queue);
		queue();
		setTimeout(queue, 400);
		/* Anything still unrevealed after the page has settled is below the
		   fold on purpose; the scroll handler owns it from here. */
	})();

	/* ------------------------------------------------- idle image loading */
	/* The portrait marquee holds ~2.5x more images than fit on screen at once
	   and moves with a CSS transform, which lazy-loading never re-evaluates.
	   So the first few paint immediately and the rest arrive once the page is
	   idle — after LCP, and free of main-thread contention. */
	(function idleImages() {
		var imgs = $$('img[data-src]');
		if (!imgs.length) return;
		var run = function () {
			imgs.forEach(function (img) {
				if (img.getAttribute('src')) return;
				img.src = img.getAttribute('data-src');
				img.removeAttribute('data-src');
			});
		};
		window.addEventListener('load', function () {
			setTimeout(function () {
				if ('requestIdleCallback' in window) window.requestIdleCallback(run, { timeout: 2500 });
				else run();
			}, 320);
		});
	})();

	/* ------------------------------------------------------------------- nav */
	(function nav() {
		var nav = $('#nav');
		if (!nav) return;
		var burger = $('#burger');
		var ticking = false;
		var onScroll = function () {
			if (ticking) return;
			ticking = true;
			window.requestAnimationFrame(function () {
				nav.classList.toggle('is-scrolled', window.pageYOffset > 10);
				ticking = false;
			});
		};
		window.addEventListener('scroll', onScroll, { passive: true });
		onScroll();

		if (burger) {
			var setOpen = function (open) {
				nav.classList.toggle('is-open', open);
				burger.setAttribute('aria-expanded', open ? 'true' : 'false');
			};
			burger.addEventListener('click', function () {
				setOpen(!nav.classList.contains('is-open'));
			});
			$$('.nav__link', nav).forEach(function (a) {
				a.addEventListener('click', function () { setOpen(false); });
			});
			doc.addEventListener('keydown', function (e) {
				if (e.key === 'Escape') setOpen(false);
			});
			window.addEventListener('resize', function () {
				if (window.innerWidth > 900) setOpen(false);
			});
		}

		/* Mark the active page even if a page forgot to set aria-current. */
		var path = location.pathname.replace(/index\.html$/, '');
		$$('.nav__link', nav).forEach(function (a) {
			var href = a.getAttribute('href') || '';
			if (href === path) a.setAttribute('aria-current', 'page');
		});
	})();

	/* --------------------------------------------------------------- footer */
	(function footer() {
		var meta = $('.foot__meta');
		if (!meta) return;
		var year = new Date().getFullYear();
		meta.textContent = meta.textContent.replace(/©\s*(\d{4})\s*[–-]\s*\d{4}/, '© $1–' + year);
	})();

	/* ------------------------------------------------- document title kaomoji */
	(function titlePairs() {
		var base = doc.title;
		var pairs = (window.SITE_CONTENT && window.SITE_CONTENT.titlePairs) || [];
		if (!pairs.length || reduceMotion) return;
		var pick = pairs[Math.floor(Math.random() * pairs.length)];
		doc.addEventListener('visibilitychange', function () {
			doc.title = doc.hidden ? (pick.away || base) : (pick.back || base);
		});
	})();

	/* ------------------------------------------------------------- lightbox */
	(function lightbox() {
		var tc = $('#tc');
		var img = $('#tcImg');
		if (!tc || !img) return;
		var open = function (src, alt) {
			img.src = src;
			img.alt = alt || '';
			tc.classList.add('is-open');
			img.setAttribute('tabindex', '-1');
			img.focus();
		};
		var close = function () {
			tc.classList.remove('is-open');
			img.removeAttribute('src');
		};
		doc.addEventListener('click', function (e) {
			var item = e.target.closest ? e.target.closest('.strip__item') : null;
			if (item && item.getAttribute('data-full')) {
				e.preventDefault();
				open(item.getAttribute('data-full'), item.getAttribute('data-name'));
				return;
			}
			if (tc.classList.contains('is-open')) close();
		});
		doc.addEventListener('keydown', function (e) {
			if (e.key === 'Escape' && tc.classList.contains('is-open')) close();
		});
	})();

	/* ------------------------------------------------------------------ BGM */
	(function player() {
		var box = $('#player');
		var audio = $('#pAudio');
		var pill = $('#pPill');
		if (!box || !audio || !pill) return;

		var panel = $('#playerPanel');
		var listEl = $('#pList');
		var nowEl = $('#pNow');
		var artistEl = $('#pArtist');
		var curEl = $('#pCur');
		var durEl = $('#pDur');
		var barEl = $('#pBar');
		var fillEl = $('#pFill');
		var playBtn = $('#pPlay');
		var playIcon = $('#pPlayIcon');
		var prevBtn = $('#pPrev');
		var nextBtn = $('#pNext');
		var labelMain = $('#pLabelMain');
		var labelSub = $('#pLabelSub');

		var ICON_PLAY = 'M8 4.8v14.4L19.4 12z';
		var ICON_PAUSE = 'M8.6 5h2.6v14H8.6zM12.8 5h2.6v14h-2.6z';
		var iconPath = playIcon ? playIcon.querySelector('path') : null;
		function setIcon(d) { if (iconPath) iconPath.setAttribute('d', d); }

		var tracks = [];
		var idx = -1;
		var booted = false;
		var booting = false;

		/* The now-playing texts are rendered inside a single <span> so the
		   container can clip + animate them independently of the pill. */
		var nowText = nowEl ? nowEl.querySelector('span') : null;
		var labelText = labelMain ? labelMain.querySelector('span') : null;

		function fmt(sec) {
			if (!isFinite(sec) || sec < 0) sec = 0;
			var m = Math.floor(sec / 60);
			var s = Math.floor(sec % 60);
			return m + ':' + (s < 10 ? '0' : '') + s;
		}
		function absUrl(u) {
			if (!u) return '';
			if (/^(https?:|data:|blob:)/.test(u)) return u;
			return u.charAt(0) === '/' ? u : '/' + u.replace(/^\.\//, '');
		}
		function shuffle(a) {
			for (var i = a.length - 1; i > 0; i--) {
				var j = Math.floor(Math.random() * (i + 1));
				var t = a[i]; a[i] = a[j]; a[j] = t;
			}
			return a;
		}
		/* Playlist names carry their work tags up front:
		     [TH10 风]天狗舞踏会   【Key】[SPRB]Lasting Moment   【日V】iku
		   Only LEADING bracketed groups are tags; anything later stays in the
		   title (so "… (Live ver)" is untouched). */
		function parseName(raw) {
			var s = String(raw || '').trim();
			var tags = [];
			var re = /^(?:\[([^\]]*)\]|【([^】]*)】|\(([^)]*)\)|（([^）]*)）)\s*/;
			var m;
			while ((m = re.exec(s))) {
				var t = (m[1] || m[2] || m[3] || m[4] || '').trim();
				if (t) tags.push(t);
				s = s.slice(m[0].length);
			}
			return { tags: tags, title: s.trim() || String(raw || '').trim() || '未知曲目' };
		}
		/* Street-LED ticker. CSS duplicates the text with ::after and the track
		   slides exactly ONE copy, so the next copy's first glyph re-enters from
		   the right the instant the last one leaves. The only stop is the loop
		   point, i.e. the moment the first glyph is back at its original spot. */
		function marquee(el, textSpan) {
			if (!el || !textSpan || !textSpan.getBoundingClientRect) return;
			el.classList.remove('player__is-marq');
			el.style.removeProperty('--marq-d');
			el.style.removeProperty('--marq-dur');
			textSpan.removeAttribute('data-marq');
			if (reduceMotion || !el.clientWidth) return;
			var copy = Math.ceil(textSpan.getBoundingClientRect().width);
			if (!copy || copy <= el.clientWidth + 6) return;
			textSpan.setAttribute('data-marq', textSpan.textContent);
			el.style.setProperty('--marq-d', copy + 'px');
			el.style.setProperty('--marq-dur', Math.max(8, Math.round(copy / 34)) + 's');
			el.classList.add('player__is-marq');
		}
		function fitMarquees() {
			marquee(nowEl, nowText);
			marquee(labelMain, labelText);
		}
		function renderList() {
			if (!listEl) return;
			listEl.textContent = '';
			if (!tracks.length) {
				var empty = doc.createElement('div');
				empty.className = 'player__empty';
				empty.textContent = '歌单暂时无法载入';
				listEl.appendChild(empty);
				return;
			}
			var frag = doc.createDocumentFragment();
			tracks.forEach(function (t, i) {
				var b = doc.createElement('button');
				b.type = 'button';
				b.className = 'player__item';
				b.addEventListener('click', function () { load(i, true); });
				var n = doc.createElement('i');
				n.textContent = ('0' + (i + 1)).slice(-2);
				var body = doc.createElement('span');
				body.className = 'player__ibody';
				var title = doc.createElement('b');
				title.textContent = t.title;
				var meta = doc.createElement('em');
				meta.textContent = [t.tags.join(' · '), t.artist].filter(Boolean).join(' · ');
				body.appendChild(title);
				body.appendChild(meta);
				b.appendChild(n);
				b.appendChild(body);
				b.setAttribute('data-i', String(i));
				b.setAttribute('title', t.title + (t.artist ? ' — ' + t.artist : ''));
				frag.appendChild(b);
			});
			listEl.appendChild(frag);
		}
		function markList() {
			$$('.player__item', listEl || doc).forEach(function (b) {
				b.classList.toggle('is-on', Number(b.getAttribute('data-i')) === idx);
			});
		}
		function boot() {
			if (booted || booting) return Promise.resolve();
			booting = true;
			return fetch('/static/bgm/playlist.json', { credentials: 'same-origin' })
				.then(function (r) {
					if (!r.ok) throw new Error('playlist ' + r.status);
					return r.json();
				})
				.then(function (data) {
					tracks = (data || []).map(function (t) {
						var parsed = parseName(t.name);
						return {
							title: parsed.title,
							tags: parsed.tags,
							artist: t.artist || '',
							url: absUrl(t.url)
						};
					}).filter(function (t) { return t.url; });
					shuffle(tracks);
					booted = true;
					booting = false;
					renderList();
					if (tracks.length && idx < 0) {
						idx = 0;
						load(0, false);
					}
				})
				.catch(function () {
					booting = false;
					booted = true;
					renderList();
				});
		}
		function load(i, autoplay) {
			if (!tracks.length) return;
			idx = (i + tracks.length) % tracks.length;
			var t = tracks[idx];
			audio.src = t.url;
			var meta = [t.tags.join(' · '), t.artist].filter(Boolean).join(' · ');
			if (nowText) nowText.textContent = t.title;
			else if (nowEl) nowEl.textContent = t.title;
			if (artistEl) artistEl.textContent = meta || '全人類の緋想天 BGM';
			if (labelText) labelText.textContent = t.title;
			else if (labelMain) labelMain.textContent = t.title;
			if (labelSub) labelSub.textContent = t.artist || 'BGM';
			if (curEl) curEl.textContent = '0:00';
			if (durEl) durEl.textContent = '0:00';
			if (fillEl) fillEl.style.width = '0%';
			markList();
			fitMarquees();
			if (autoplay) audio.play().catch(function () {});
		}
		function toggle() {
			if (!booted) {
				boot().then(function () {
					if (audio.getAttribute('src')) audio.play().catch(function () {});
					else if (tracks.length) load(0, true);
				});
				return;
			}
			if (audio.paused) {
				if (!audio.getAttribute('src') && tracks.length) load(0, true);
				else audio.play().catch(function () {});
			} else {
				audio.pause();
			}
		}
		function setOpen(open) {
			box.classList.toggle('is-open', open);
			/* the open panel covers the fixed section rail on the right edge */
			document.body.classList.toggle('has-player-open', open);
			pill.setAttribute('aria-expanded', open ? 'true' : 'false');
			if (open) {
				if (!booted) boot();
				/* the panel had zero width while closed — measure now */
				requestAnimationFrame(fitMarquees);
			}
		}

		pill.addEventListener('click', function () { setOpen(!box.classList.contains('is-open')); });
		playBtn && playBtn.addEventListener('click', toggle);
		prevBtn && prevBtn.addEventListener('click', function () {
			if (!booted) { boot().then(function () { if (tracks.length) load(idx < 0 ? 0 : idx - 1, true); }); return; }
			load(idx < 0 ? 0 : idx - 1, true);
		});
		nextBtn && nextBtn.addEventListener('click', function () {
			if (!booted) { boot().then(function () { if (tracks.length) load(idx + 1, true); }); return; }
			load(idx + 1, true);
		});

		audio.addEventListener('play', function () {
			box.classList.add('is-playing');
			playBtn && playBtn.setAttribute('aria-label', '暂停');
			setIcon(ICON_PAUSE);
			markList();
		});
		audio.addEventListener('pause', function () {
			box.classList.remove('is-playing');
			playBtn && playBtn.setAttribute('aria-label', '播放');
			setIcon(ICON_PLAY);
		});
		audio.addEventListener('loadedmetadata', function () {
			durEl && (durEl.textContent = fmt(audio.duration));
		});
		audio.addEventListener('timeupdate', function () {
			var pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
			fillEl && (fillEl.style.width = pct.toFixed(2) + '%');
			curEl && (curEl.textContent = fmt(audio.currentTime));
			barEl && barEl.setAttribute('aria-valuenow', String(Math.round(pct)));
		});
		audio.addEventListener('ended', function () { load(idx + 1, true); });

		var rsz;
		window.addEventListener('resize', function () {
			clearTimeout(rsz);
			rsz = setTimeout(fitMarquees, 180);
		});
		if (doc.fonts && doc.fonts.ready) {
			doc.fonts.ready.then(function () { setTimeout(fitMarquees, 60); });
		}
		setTimeout(fitMarquees, 300);

		if (barEl) {
			var seek = function (clientX) {
				var r = barEl.getBoundingClientRect();
				var ratio = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
				if (audio.duration) audio.currentTime = ratio * audio.duration;
				fillEl && (fillEl.style.width = (ratio * 100).toFixed(2) + '%');
			};
			var dragging = false;
			barEl.addEventListener('pointerdown', function (e) {
				dragging = true;
				barEl.setPointerCapture && barEl.setPointerCapture(e.pointerId);
				seek(e.clientX);
			});
			barEl.addEventListener('pointermove', function (e) { if (dragging) seek(e.clientX); });
			barEl.addEventListener('pointerup', function () { dragging = false; });
			barEl.addEventListener('pointercancel', function () { dragging = false; });
			barEl.addEventListener('keydown', function (e) {
				if (!audio.duration) return;
				if (e.key === 'ArrowLeft') { audio.currentTime = Math.max(0, audio.currentTime - 5); e.preventDefault(); }
				if (e.key === 'ArrowRight') { audio.currentTime = Math.min(audio.duration, audio.currentTime + 5); e.preventDefault(); }
			});
		}
	})();
})();

/* ── Right-edge section nav (AI-chat locator style) ───────────────────
   Idle: every section is a short dash, the current one is a long dark bar.
   Hover: the dash grows and its title fades in to the left. */
(function () {
	'use strict';
	var nav = document.querySelector('.secnav');
	if (!nav) return;
	var items = Array.prototype.slice.call(nav.querySelectorAll('.secnav__item'));
	if (!items.length) return;
	var targets = items.map(function (it) {
		var id = (it.getAttribute('href') || '').replace(/^#/, '');
		return id ? document.getElementById(id) : null;
	});
	var raf = 0;
	function update() {
		raf = 0;
		var line = (window.innerHeight || 800) * 0.42;
		var active = 0;
		for (var i = 0; i < targets.length; i++) {
			if (targets[i] && targets[i].getBoundingClientRect().top <= line) active = i;
		}
		for (var j = 0; j < items.length; j++) {
			items[j].classList.toggle('is-active', j === active);
		}
	}
	function queue() {
		if (!raf) raf = window.requestAnimationFrame(update);
	}
	window.addEventListener('scroll', queue, { passive: true });
	window.addEventListener('resize', queue);
	update();
})();

/* ── Live data hydration (Bangumi counts + curated repo tiles) ────────
   static/data/{bangumi,repos}.json is refreshed hourly by
   .github/workflows/data.yml. This is pure progressive enhancement: every
   fetch is caught, so a missing or offline JSON leaves the server-rendered
   fallback numbers and tiles exactly as they are. */
(function () {
	'use strict';

	var doc = document;
	var fmtNum = new Intl.NumberFormat('zh-CN');

	function ready(fn) {
		if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', fn, { once: true });
		else fn();
	}

	function getJSON(url) {
		return fetch(url, { credentials: 'same-origin', cache: 'no-cache' }).then(function (r) {
			if (!r.ok) throw new Error(url + ' ' + r.status);
			return r.json();
		});
	}

	function pad2(n) { return (n < 10 ? '0' : '') + n; }

	/* ISO instant -> local "10-31 16:07". No year: the note is about freshness. */
	function stamp(iso) {
		if (!iso) return '';
		var d = new Date(iso);
		if (isNaN(d.getTime())) return '';
		return pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()) + ' ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes());
	}

	function esc(s) {
		return String(s == null ? '' : s)
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#39;');
	}

	/* 16px stroke icons on a 24-unit grid. The inline style is load-bearing:
	   .tile__icon svg sets fill:currentColor for the old filled brand glyphs,
	   which would turn these outline paths into blobs. */
	var ICON_STYLE = 'width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round';
	function icon(paths) {
		return '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false" style="' +
			ICON_STYLE + '">' + paths + '</svg>';
	}
	var ICONS = {
		text: icon('<path d="M5 5h14M5 9.6h9.5M5 14.2h11.5M5 18.8h6.5"/>'),
		sync: icon('<path d="M20 12a8 8 0 0 1-13.7 5.6"/><path d="M4 12a8 8 0 0 1 13.7-5.6"/><path d="M17.5 2.5v4h-4"/><path d="M6.5 21.5v-4h4"/>'),
		mail: icon('<path d="M3.2 6.2h17.6v11.6H3.2z"/><path d="M3.6 7.2 12 13l8.4-5.8"/>'),
		video: icon('<path d="M3.2 6.2h11.4v11.6H3.2z"/><path d="M14.6 10.4 20.8 7.2v9.6l-6.2-3.2z"/>'),
		chat: icon('<path d="M4 4.6h16v10.2h-8.6L6.2 19.4v-4.6H4z"/><path d="M8 9.2h8M8 12h5"/>'),
		grid: icon('<path d="M4 4h6.6v6.6H4zM13.4 4H20v6.6h-6.6zM4 13.4h6.6V20H4zM13.4 13.4H20V20h-6.6z"/>'),
		whale: icon('<path d="M3.4 13.8C3.4 9.9 6.6 7 10.6 7c3.1 0 5.8 1.5 7 3.6c-1.1 2.9-3.8 4.9-7 4.9-3.9 0-7.2-2.7-7.2-6.6z"/><path d="M17.6 10.6l3.2-3.1v6.2z"/><path d="M7 6.9C6.6 5.4 5.8 4.5 4.7 4.7"/><path d="M9.8 11.6h.01"/>'),
		star: icon('<path d="M12 3.4 14.2 8.6 20.1 9.4 15.8 13.3 17.2 19.4 12 16.6 6.8 19.4 8.2 13.3 3.9 9.4 9.8 8.6Z"/>')
	};
	var ARROW = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 12h13M12.5 5.5 19 12l-6.5 6.5"/></svg>';

	/* The reveal-on-scroll sweep keeps a private queue and exposes no rescan,
	   so tiles injected after boot are marked visible here instead. */
	function revealNew(scope) {
		var nodes = Array.prototype.slice.call(scope.querySelectorAll('[data-rv]'));
		if (!nodes.length) return;
		var rescan = window.__revealScan || window.__rescanReveal || window.revealScan;
		if (typeof rescan === 'function') { rescan(); return; }
		var show = function () {
			nodes.forEach(function (el) { el.classList.add('is-in'); });
		};
		if (typeof window.requestAnimationFrame === 'function') {
			window.requestAnimationFrame(function () {
				window.requestAnimationFrame(show);
			});
		} else show();
	}

	function paintStats(data) {
		var stats = data && data.stats;
		if (!stats || typeof stats !== 'object') return;
		Object.keys(stats).forEach(function (key) {
			var n = Number(stats[key]);
			if (!isFinite(n)) return;
			Array.prototype.forEach.call(doc.querySelectorAll('[data-stat="' + key + '"]'), function (el) {
				el.textContent = fmtNum.format(n);
			});
		});
		var note = doc.querySelector('[data-stat-updated]');
		var when = stamp(data.updated);
		/* .stats__note [data-stat-updated]:not(:empty)::before supplies " · " */
		if (note && when) note.textContent = '最近同步 ' + when;
	}

	function paintRepos(data) {
		var box = doc.querySelector('.tiles[data-repos]');
		if (!box) return;
		var items = data && data.items;
		if (!Array.isArray(items) || !items.length) return;
		var html = '';
		items.forEach(function (it, i) {
			if (!it || !it.url) return;
			var delay = (i * 0.04).toFixed(2).replace(/^0/, '');
			html +=
				'<a class="tile" href="' + esc(it.url) + '" target="_blank" rel="noopener noreferrer" data-rv style="--rv-d:' + delay + 's">' +
					'<span class="tile__top">' +
						'<span class="tile__icon">' + (ICONS[it.icon] || ICONS.star) + '</span>' +
						'<span class="tile__title">' + esc(it.name || it.repo) + '</span>' +
					'</span>' +
					'<span class="tile__desc">' + esc(it.desc) + '</span>' +
					'<span class="tile__go">VISIT ' + ARROW + '</span>' +
				'</a>';
		});
		if (!html) return;
		box.innerHTML = html;
		revealNew(box);
	}

	ready(function () {
		/* nothing to hydrate on the document pages */
		if (!doc.querySelector('[data-stat]') && !doc.querySelector('.tiles[data-repos]')) return;
		getJSON('/static/data/bangumi.json').then(paintStats).catch(function () {});
		getJSON('/static/data/repos.json').then(paintRepos).catch(function () {});
	});
})();
