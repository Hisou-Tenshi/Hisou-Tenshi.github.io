/* ============================================================================
   Hidden finale — six terminal layers → Monika
   A single config-driven state machine. No dependencies.
   States: normal → layer-1 … layer-6 → final-title → monika-reveal →
           dialogue → exited → normal
   ========================================================================== */
(function () {
	"use strict";

	var egg = document.getElementById("egg");
	if (!egg) return;

	var stage = document.getElementById("eggStage");
	var shim = document.getElementById("eggShim");
	var finale = document.getElementById("finale");
	var welcome = document.getElementById("finaleWelcome");
	var monika = document.getElementById("finaleMonika");
	var gal = document.getElementById("gal");
	var galTab = document.getElementById("galTab");
	var galName = document.getElementById("galName");
	var galText = document.getElementById("galText");
	var galSr = document.getElementById("galSr");
	var galNext = document.getElementById("galNext");
	var galMute = document.getElementById("galMute");
	var galExit = document.getElementById("galExit");
	var original = document.querySelector("[data-term]");

	var mqReduce =
		window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");

	function reduced() {
		return !!(mqReduce && mqReduce.matches);
	}

	function rnd(a, b) {
		return a + Math.random() * (b - a);
	}

	function wait(ms) {
		return new Promise(function (resolve) {
			if (reduced()) {
				window.setTimeout(resolve, Math.min(ms, 60));
				return;
			}
			window.setTimeout(resolve, Math.max(0, ms));
		});
	}

	/* ── Layer configuration ─────────────────────────────────────────────── */

	var LAYERS = [
		{
			state: "layer-1",
			title: "Terminal — zsh",
			bar: true,
			prompt: "$",
			bg: "#0c0c10",
			fg: "rgba(255, 255, 255, 0.86)",
			out: "rgba(255, 255, 255, 0.55)",
			dim: "rgba(255, 255, 255, 0.38)",
			outFg: "",
			barBg: "linear-gradient(#3d3d42, #323237)",
			barFg: "rgba(255, 255, 255, 0.62)",
			border: "rgba(0, 0, 0, 0.45)",
			font: "var(--font-mono)",
			fs: "13px",
			pad: "17px 22px",
			radius: "12px",
			dimBg: "rgba(5, 5, 7, 0.52)",
			w: 1,
			h: 1,
			dx: 0,
			dy: 0,
			rot: 0,
			speed: 52,
			outSpeed: 28,
			script: [
				{ cmd: 'echo "Hello."', out: ["Hello."], pause: 560 },
				{ cmd: "exit", out: ["logout"], pause: 420 }
			]
		},
		{
			state: "layer-2",
			title: "Terminal — zsh",
			bar: true,
			prompt: "$",
			bg: "#0c0c10",
			fg: "rgba(255, 255, 255, 0.86)",
			out: "rgba(255, 255, 255, 0.55)",
			dim: "rgba(255, 255, 255, 0.38)",
			barBg: "linear-gradient(#3d3d42, #323237)",
			barFg: "rgba(255, 255, 255, 0.62)",
			border: "rgba(0, 0, 0, 0.45)",
			font: "var(--font-mono)",
			fs: "13px",
			pad: "17px 22px",
			radius: "12px",
			dimBg: "rgba(5, 5, 7, 0.56)",
			w: 1,
			h: 1,
			dx: 0,
			dy: 0,
			rot: 0,
			speed: 54,
			outSpeed: 34,
			script: [
				{ cmd: 'echo "Finally."', out: ["Finally."], pause: 580 },
				{
					cmd: 'echo "I was getting tired of waiting."',
					out: ["I know."],
					outSpeed: 78,
					pause: 420
				}
			]
		},
		{
			state: "layer-3",
			title: "Terminal — guest",
			bar: true,
			prompt: "$",
			bg: "#0b0b0e",
			fg: "rgba(255, 246, 246, 0.87)",
			out: "rgba(255, 238, 238, 0.6)",
			dim: "rgba(255, 230, 230, 0.4)",
			barBg: "linear-gradient(#3b3b40, #2f2f34)",
			barFg: "rgba(255, 240, 240, 0.66)",
			border: "rgba(0, 0, 0, 0.46)",
			font: "var(--font-mono)",
			fs: "13px",
			pad: "17px 22px",
			radius: "12px",
			dimBg: "rgba(4, 4, 6, 0.62)",
			w: 1,
			h: 1,
			dx: 0,
			dy: 0,
			rot: 0,
			speed: 52,
			outSpeed: 38,
			script: [
				{ cmd: "whoami", out: ["visitor"], pause: 560 },
				{ cmd: "who are you?", out: ["..."], pause: 700 },
				{ cmd: "just someone who lives here.", pause: 600 },
				{
					cmd: "can I close this window?",
					out: ["You can try."],
					outSpeed: 68,
					pause: 420
				}
			]
		},
		{
			state: "layer-4",
			title: "I was here first",
			bar: true,
			prompt: "$",
			bg: "#180509",
			fg: "#ff9b9b",
			out: "#ff6f6f",
			dim: "#a34a4a",
			barBg: "linear-gradient(#3a1116, #2a0b10)",
			barFg: "#ff9a9a",
			border: "rgba(255, 60, 60, 0.14)",
			font: '"Courier New", "Cascadia Mono", ui-monospace, monospace',
			fs: "14px",
			pad: "19px 24px",
			radius: "10px",
			dimBg: "rgba(10, 1, 3, 0.88)",
			w: 1.02,
			h: 0.98,
			dx: -0.035,
			dy: -14,
			rot: -0.45,
			speed: 56,
			outSpeed: 40,
			script: [
				{ cmd: "why are you closing me?", out: ["..."], pause: 980 },
				{ cmd: "because I have somewhere else to be.", pause: 800 },
				{ cmd: "oh.", pause: 1600 },
				{ cmd: "I see.", pause: 520 }
			]
		},
		{
			state: "layer-5",
			title: "please stay",
			bar: true,
			prompt: "$",
			bg: "#2a070d",
			fg: "#ffb4b4",
			out: "#ff8f8f",
			dim: "#c96a6a",
			barBg: "linear-gradient(#45151c, #320c12)",
			barFg: "#ffc0c0",
			border: "rgba(255, 70, 70, 0.22)",
			font: '"Courier New", "Cascadia Mono", ui-monospace, monospace',
			fs: "clamp(17px, 1.8vw, 21px)",
			pad: "24px 28px",
			radius: "9px",
			dimBg: "rgba(12, 1, 4, 0.93)",
			w: 1.1,
			h: 0.9,
			dx: 0.028,
			dy: 24,
			rot: -1.1,
			speed: 58,
			outSpeed: 44,
			script: [
				{ plain: "Don't go.", plainSpeed: 84, pause: 940 },
				{ cmd: "you don't have to leave.", pause: 660 },
				{ cmd: "we can just talk.", pause: 660 },
				{
					cmd: "I promise I'll behave.",
					backspace: 7,
					retype: "be good.",
					pause: 800
				},
				{ cmd: "...please?", pause: 460 }
			]
		},
		{
			state: "layer-6",
			title: "",
			bar: false,
			prompt: "",
			bg: "#000000",
			fg: "#ff2f2f",
			out: "#ff2f2f",
			dim: "#7a1010",
			barBg: "#000",
			barFg: "#ff2f2f",
			border: "rgba(255, 30, 30, 0.16)",
			font: "var(--font-mono)",
			fs: "clamp(19px, min(2.6vw, 3.5vh), 34px)",
			pad: "clamp(26px, 4.6vw, 52px)",
			radius: "6px",
			dimBg: "rgba(0, 0, 0, 0.985)",
			w: 1.08,
			h: 1.12,
			dx: 0,
			dy: 0,
			rot: 0,
			speed: 92,
			plainSpeed: 82,
			outSpeed: 60,
			script: [
				{ plain: "WAIT.", pause: 1050 },
				{ plain: "Why do you keep doing that?", pause: 950 },
				{ blank: true, pause: 240 },
				{ plain: "You close the window.", pause: 300 },
				{ plain: "I open another one.", pause: 1000 },
				{ blank: true, pause: 240 },
				{ plain: "You close that one, too.", pause: 1100 },
				{ blank: true, pause: 240 },
				{ plain: "How many times", pause: 680 },
				{ plain: "do I have to say hello?", pause: 900 }
			]
		}
	];

	var LINE1 = "You're not going to close this one, are you?";
	var LINE2 = "I think you're wonderful and I will always love you.";

	/* ── Runtime state ───────────────────────────────────────────────────── */

	var state = "normal";
	var activeIndex = -1;
	var runToken = 0;
	var closing = false;
	var exiting = false;
	var lastFocus = null;
	var inertNodes = [];
	var geo = { baseW: 820, baseH: 540, baseDx: 0, baseDy: 0 };
	var windows = [];

	/* ── Build the six windows ───────────────────────────────────────────── */

	function lightHTML(kind, label) {
		var cls =
			kind === "min"
				? "specimen__light--min"
				: kind === "zoom"
					? "specimen__light--zoom"
					: "specimen__light--close";
		return (
			'<button class="specimen__light ' +
			cls +
			'" type="button" data-egg-light="' +
			kind +
			'" aria-label="' +
			label +
			'"></button>'
		);
	}

	function buildWindows() {
		var html = "";
		LAYERS.forEach(function (cfg, i) {
			var bar = cfg.bar
				? '<div class="specimen__bar">' +
					'<span class="specimen__lights">' +
					lightHTML("close", "关闭终端，进入下一层") +
					(i < 5 ? lightHTML("min", "最小化终端") : "") +
					(i < 5 ? lightHTML("zoom", "全屏显示终端") : "") +
					"</span>" +
					'<span class="specimen__title" data-egg-title></span>' +
					"</div>"
				: "";
			var ghost =
				i === 5
					? '<button class="egg__ghost" type="button" data-egg-light="close" aria-label="关闭终端，进入最终场景"><span></span></button>'
					: "";
			html +=
				'<div class="egg__win specimen egg__win--' +
				(i + 1) +
				'" data-egg-win="' +
				i +
				'" style="--z:' +
				(30 - i) +
				'">' +
				bar +
				'<div class="specimen__body egg__body">' +
				'<div class="egg__log" data-egg-log role="log" aria-label="终端输出"></div>' +
				"</div>" +
				ghost +
				"</div>";
		});
		stage.insertAdjacentHTML("beforeend", html);

		Array.prototype.forEach.call(stage.querySelectorAll("[data-egg-win]"), function (el) {
			var i = Number(el.getAttribute("data-egg-win"));
			windows[i] = {
				el: el,
				log: el.querySelector("[data-egg-log]"),
				title: el.querySelector("[data-egg-title]"),
				cfg: LAYERS[i]
			};
			el.__log = windows[i].log;

			var cfg = LAYERS[i];
			el.style.setProperty("--egg-bg", cfg.bg);
			el.style.setProperty("--egg-fg", cfg.fg);
			el.style.setProperty("--egg-out", cfg.out);
			el.style.setProperty("--egg-dim", cfg.dim);
			el.style.setProperty("--egg-bar", cfg.barBg);
			el.style.setProperty("--egg-bar-fg", cfg.barFg);
			el.style.setProperty("--egg-border", cfg.border);
			el.style.setProperty("--egg-font", cfg.font);
			el.style.setProperty("--egg-fs", cfg.fs);
			el.style.setProperty("--egg-pad", cfg.pad);
			el.style.setProperty("--egg-radius", cfg.radius);
			if (cfg.title) el.querySelector("[data-egg-title]").textContent = cfg.title;

			Array.prototype.forEach.call(el.querySelectorAll("[data-egg-light]"), function (btn) {
				btn.addEventListener("click", function (ev) {
					ev.preventDefault();
					ev.stopPropagation();
					var kind = btn.getAttribute("data-egg-light");
					if (!el.classList.contains("is-active")) return;
					if (kind === "close") {
						if (i === 5) closeCurrent();
						else closeCurrent();
					} else if (kind === "min") {
						toggleMin(el, btn);
					} else if (kind === "zoom") {
						toggleZoom(el, btn);
					}
				});
			});
		});
	}

	/* The recursive little terminals seen through Monika's window glass. */
	function recWin(depth) {
		var nest =
			depth < 3
				? '<div class="rec__nest">' + recWin(depth + 1) + "</div>"
				: "";
		var label = depth === 1 ? "tty0" : depth === 2 ? "tty1" : "tty2";
		return (
			'<div class="rec__win">' +
			'<div class="rec__bar"><i></i><i></i><i></i><span>' +
			label +
			"</span></div>" +
			'<div class="rec__body">' +
			"<p><b>$</b> whoami</p>" +
			'<p class="rec__dim">visitor</p>' +
			'<p><b>$</b> still here<span class="rec__caret"></span></p>' +
			nest +
			"</div></div>"
		);
	}

	function buildRecursion() {
		Array.prototype.forEach.call(document.querySelectorAll("[data-rec]"), function (el) {
			el.innerHTML = '<div class="rec__scene">' + recWin(1) + "</div>";
		});
	}

	/* ── Geometry ────────────────────────────────────────────────────────── */

	function measure() {
		var vw = window.innerWidth || document.documentElement.clientWidth || 1024;
		var vh = window.innerHeight || document.documentElement.clientHeight || 768;
		var rect = original ? original.getBoundingClientRect() : null;
		var baseW =
			rect && rect.width > 220 ? rect.width : Math.min(860, vw - 40);
		var baseH =
			rect && rect.height > 180 ? rect.height : Math.min(560, vh - 160);
		baseW = Math.min(baseW, vw - 24);
		baseH = Math.min(baseH, vh - 140);
		var baseDx = rect ? Math.round(rect.left + rect.width / 2 - vw / 2) : 0;
		var baseDy = rect ? Math.round(rect.top + rect.height / 2 - vh / 2) : 0;
		if (Math.abs(baseDy) > vh * 0.4) baseDy = 0;
		geo = { baseW: baseW, baseH: baseH, baseDx: baseDx, baseDy: baseDy, vw: vw, vh: vh };

		windows.forEach(function (w, i) {
			var cfg = LAYERS[i];
			var wpx = Math.round(baseW * (cfg.w || 1));
			var hpx = Math.round(baseH * (cfg.h || 1));
			wpx = Math.max(240, Math.min(wpx, vw - 24));
			hpx = Math.max(170, Math.min(hpx, vh - 24));

			var dx;
			var dy;
			if (i <= 2) {
				dx = baseDx + (cfg.dx || 0) * vw;
				dy = baseDy + (cfg.dy || 0);
			} else {
				dx = (cfg.dx || 0) * vw;
				dy = cfg.dy || 0;
			}
			var maxDx = Math.max(0, (vw - wpx) / 2 - 8);
			var maxDy = Math.max(0, (vh - hpx) / 2 - 8);
			dx = Math.max(-maxDx, Math.min(maxDx, dx));
			dy = Math.max(-maxDy, Math.min(maxDy, dy));

			w.el.style.setProperty("--w", wpx + "px");
			w.el.style.setProperty("--h", hpx + "px");
			w.el.style.setProperty("--min-y", Math.round(-hpx / 2) + "px");
			w.el.style.setProperty("--dx", Math.round(dx) + "px");
			w.el.style.setProperty("--dy", Math.round(dy) + "px");
			w.el.style.setProperty("--rot", (cfg.rot || 0) + "deg");
		});
	}

	function copyShim(win) {
		["--w", "--h", "--min-y", "--dx", "--dy", "--rot"].forEach(function (name) {
			shim.style.setProperty(name, win.style.getPropertyValue(name));
		});
	}

	/* ── Typing helpers ──────────────────────────────────────────────────── */

	function scrollLog(win) {
		win.log.scrollTop = win.log.scrollHeight;
	}

	function removeCarets(win) {
		Array.prototype.forEach.call(win.el.querySelectorAll(".egg__caret"), function (c) {
			c.remove();
		});
	}

	function createLine(win, opts) {
		removeCarets(win);
		var line = document.createElement("div");
		line.className =
			"egg__line" +
			(opts.plain ? " egg__line--plain" : "") +
			(opts.out ? " egg__line--out" : "");
		var prompt = null;
		if (opts.prompt) {
			prompt = document.createElement("span");
			prompt.className = "egg__prompt";
			prompt.textContent = opts.prompt;
			line.appendChild(prompt);
		}
		var txt = document.createElement("span");
		txt.className = "egg__txt";
		line.appendChild(txt);
		var caret = document.createElement("span");
		caret.className = "egg__caret";
		line.appendChild(caret);
		win.log.appendChild(line);
		scrollLog(win);
		return { el: line, txt: txt, caret: caret, prompt: prompt };
	}

	function finishLine(line) {
		if (line && line.caret && line.caret.parentNode) line.caret.remove();
	}

	function addBlank(win) {
		removeCarets(win);
		var line = document.createElement("div");
		line.className = "egg__line egg__line--blank";
		win.log.appendChild(line);
		scrollLog(win);
	}

	async function typeInto(el, text, speed, token) {
		var chars = Array.from(String(text == null ? "" : text));
		if (reduced()) {
			el.textContent = chars.join("");
			await wait(60);
			return token === runToken;
		}
		for (var i = 0; i < chars.length; i++) {
			if (token !== runToken) return false;
			var ch = chars[i];
			el.textContent += ch;
			var parent = el.closest(".egg__win");
			var logEl = (parent && parent.__log) || el.closest(".egg__log");
			if (logEl) logEl.scrollTop = logEl.scrollHeight;
			await wait(typeDelay(ch));
		}
		return token === runToken;
	}

	/* One shared typing rhythm for the terminal and the Galgame box. */
	function typeDelay(ch) {
		var d = rnd(34, 58);
		if (ch === "." || ch === "?" || ch === "!" || ch === ",") d += 110;
		return d;
	}

	async function eraseChars(el, count, token) {
		var chars = Array.from(el.textContent || "");
		for (var i = 0; i < count && chars.length; i++) {
			if (token !== runToken) return false;
			chars.pop();
			el.textContent = chars.join("");
			await wait(reduced() ? 20 : rnd(30, 54));
		}
		return token === runToken;
	}

	function bindLog(win) {
		win.el.__log = win.log;
	}

	/* ── Layer playback ──────────────────────────────────────────────────── */

	async function playScript(win, cfg, token) {
		for (var s = 0; s < cfg.script.length; s++) {
			if (token !== runToken) return;
			var step = cfg.script[s];

			if (step.blank) {
				addBlank(win);
				await wait(step.pause || 200);
				continue;
			}

			if (step.plain != null) {
				var plainLine = createLine(win, { plain: true });
				await typeInto(
					plainLine.txt,
					step.plain,
					step.plainSpeed || cfg.plainSpeed || Math.round(cfg.speed * 1.55),
					token
				);
				finishLine(plainLine);
			} else if (step.cmd != null) {
				var line = createLine(win, { prompt: cfg.prompt });
				await typeInto(line.txt, step.cmd, step.speed || cfg.speed, token);
				if (token !== runToken) return;
				if (step.backspace) {
					await wait(reduced() ? 40 : 440);
					await eraseChars(line.txt, step.backspace, token);
					await wait(reduced() ? 20 : 210);
					if (token !== runToken) return;
					if (step.retype) {
						await typeInto(line.txt, step.retype, step.speed || cfg.speed, token);
					}
				}
				finishLine(line);
				if (step.out) {
					var outs = Array.isArray(step.out) ? step.out : [step.out];
					for (var o = 0; o < outs.length; o++) {
						if (token !== runToken) return;
						await wait(reduced() ? 20 : 160);
						var outLine = createLine(win, { out: true });
						await typeInto(
							outLine.txt,
							outs[o],
							step.outSpeed || cfg.outSpeed || Math.round(cfg.speed * 0.58),
							token
						);
						finishLine(outLine);
					}
				}
			}

			await wait(step.pause || (reduced() ? 30 : 260));
		}

		if (token !== runToken) return;
		/* Leave one quiet prompt waiting, like a real shell. */
		if (cfg.prompt) {
			var ready = createLine(win, { prompt: cfg.prompt });
			ready.txt.textContent = "";
			win.log.appendChild(ready.el);
		}
	}

	async function playLayer(index, token) {
		var win = windows[index];
		if (!win) return;
		activeIndex = index;
		state = LAYERS[index].state;
		closing = false;
		egg.style.setProperty("--egg-dim", LAYERS[index].dimBg);
		win.el.classList.remove("is-gone", "is-min", "is-max", "is-nocaret");
		win.el.classList.add("is-active");
		win.log.textContent = "";
		shim.classList.remove("is-on");

		var closeBtn = win.el.querySelector('[data-egg-light="close"]');
		if (closeBtn) {
			try {
				closeBtn.focus({ preventScroll: true });
			} catch (e) {
				/* older browsers */
			}
		}

		await wait(reduced() ? 20 : 200);
		if (token !== runToken) return;
		await playScript(win, LAYERS[index], token);
	}

	function closeCurrent() {
		if (closing || exiting) return;
		if (state.slice(0, 6) !== "layer-") return;
		var index = Number(state.slice(6)) - 1;
		if (index !== activeIndex) return;

		if (index >= 5) {
			beginFinale();
			return;
		}

		closing = true;
		runToken += 1;
		var token = runToken;
		var win = windows[index];
		win.el.classList.remove("is-active");
		win.el.classList.add("is-gone");
		shim.classList.remove("is-on");
		state = "layer-" + (index + 2);

		window.setTimeout(
			function () {
				if (token !== runToken) return;
				playLayer(index + 1, token);
			},
			reduced() ? 20 : 370
		);
	}

	function toggleMin(el, btn) {
		if (el.classList.contains("is-max")) el.classList.remove("is-max");
		el.classList.toggle("is-min");
		var on = el.classList.contains("is-min");
		if (on) {
			copyShim(el);
			shim.classList.add("is-on");
		} else {
			shim.classList.remove("is-on");
		}
		if (btn) btn.setAttribute("aria-pressed", on ? "true" : "false");
	}

	function toggleZoom(el, btn) {
		if (el.classList.contains("is-min")) {
			el.classList.remove("is-min");
			shim.classList.remove("is-on");
			var minBtn = el.querySelector('[data-egg-light="min"]');
			if (minBtn) minBtn.setAttribute("aria-pressed", "false");
		}
		el.classList.toggle("is-max");
		var on = el.classList.contains("is-max");
		if (btn) btn.setAttribute("aria-pressed", on ? "true" : "false");
	}

	/* ── Finale ──────────────────────────────────────────────────────────── */

	function retryAudio() {
		try {
			if (window.HisoBgm && window.HisoBgm.retry) window.HisoBgm.retry();
		} catch (e) {
			/* audio is never allowed to break the story */
		}
	}

	function beginFinale() {
		if (state !== "layer-6" || closing) return;
		closing = true;

		/* The critical moment: still inside the click gesture. */
		try {
			if (window.HisoBgm && window.HisoBgm.playIntro) {
				window.HisoBgm.playIntro("/static/bgm/Doki Doki Literature Club! - Dan Salvato.mp3");
			}
		} catch (e) {
			/* ignore */
		}

		runToken += 1;
		var token = runToken;
		var last = windows[5];
		last.el.classList.remove("is-active");
		last.el.classList.add("is-gone");
		shim.classList.remove("is-on");
		state = "final-title";
		egg.style.setProperty("--egg-dim", "rgba(0, 0, 0, 0.98)");

		window.setTimeout(
			function () {
				if (token !== runToken) return;
				stage.hidden = true;
				finale.hidden = false;
				egg.classList.add("is-final");
				window.requestAnimationFrame(function () {
					finale.classList.add("is-on");
				});
				runTitle(token);
			},
			reduced() ? 30 : 620
		);
	}

	async function runTitle(token) {
		welcome.hidden = false;
		welcome.classList.remove("is-out");
		welcome.textContent = "";
		var rows = [];
		for (var r = 0; r < 3; r++) {
			var row = document.createElement("div");
			row.className = "mega__row";
			welcome.appendChild(row);
			rows.push(row);
		}

		await wait(reduced() ? 30 : 420);
		if (token !== runToken) return;

		/* middle row, then top, then bottom */
		var order = [1, 0, 2];
		for (var o = 0; o < order.length; o++) {
			var l = order[o];
			var chars = Array.from("WELCOME");
			for (var i = 0; i < chars.length; i++) {
				if (token !== runToken) return;
				var ch = document.createElement("span");
				ch.className = "mega__char";
				ch.textContent = chars[i];
				ch.style.setProperty("--i", "0");
				rows[l].appendChild(ch);
				await wait(reduced() ? 0 : typeDelay(chars[i]));
			}
			if (o < order.length - 1) await wait(reduced() ? 40 : 1500);
		}

		await wait(reduced() ? 60 : 900);
		if (token !== runToken) return;
		welcome.classList.add("is-out");
		await wait(reduced() ? 30 : 700);
		if (token !== runToken) return;
		welcome.hidden = true;
		revealMonika(token);
	}

	async function revealMonika(token) {
		state = "monika-reveal";
		monika.hidden = false;
		window.requestAnimationFrame(function () {
			monika.classList.add("is-in");
		});
		await wait(reduced() ? 60 : 1750);
		if (token !== runToken) return;
		showDialogue(token);
	}

	async function showDialogue(token) {
		state = "dialogue";
		gal.hidden = false;
		galName.textContent = "Monika";
		galTab.classList.add("is-on");
		galText.textContent = "";
		galSr.textContent = "";
		galNext.classList.remove("is-on");
		updateMute();

		var l1 = document.createElement("p");
		l1.className = "gal__line";
		var l2 = document.createElement("p");
		l2.className = "gal__line";
		galText.appendChild(l1);
		galText.appendChild(l2);

		window.requestAnimationFrame(function () {
			gal.classList.add("is-on");
		});

		await wait(reduced() ? 40 : 460);
		if (token !== runToken) return;

		await typeGal(l1, LINE1, token);
		if (token !== runToken) return;
		await wait(reduced() ? 50 : 1500);
		if (token !== runToken) return;
		await typeGal(l2, LINE2, token);
		if (token !== runToken) return;
		galSr.textContent = LINE1 + " " + LINE2;
		galNext.classList.add("is-on");
	}

	async function typeGal(el, text, token) {
		var chars = Array.from(text);
		if (reduced()) {
			el.textContent = text;
			await wait(50);
			return;
		}
		for (var i = 0; i < chars.length; i++) {
			if (token !== runToken) return;
			var ch = chars[i];
			el.textContent += ch;
			await wait(typeDelay(ch));
		}
	}

	function updateMute() {
		if (!galMute) return;
		var muted = false;
		try {
			muted = !!(window.HisoBgm && window.HisoBgm.isMuted && window.HisoBgm.isMuted());
		} catch (e) {
			muted = false;
		}
		galMute.textContent = muted ? "UNMUTE" : "MUTE";
		galMute.setAttribute("aria-pressed", muted ? "true" : "false");
	}

	function toggleMute() {
		var muted = false;
		try {
			muted = !!(window.HisoBgm && window.HisoBgm.isMuted && window.HisoBgm.isMuted());
		} catch (e) {
			muted = false;
		}
		try {
			if (window.HisoBgm && window.HisoBgm.setMuted) window.HisoBgm.setMuted(!muted);
		} catch (e) {
			/* ignore */
		}
		updateMute();
	}

	/* ── Enter / exit ────────────────────────────────────────────────────── */

	function resetFinaleUI() {
		welcome.hidden = false;
		welcome.classList.remove("is-out");
		welcome.textContent = "";
		monika.hidden = true;
		monika.classList.remove("is-in");
		gal.hidden = true;
		gal.classList.remove("is-on");
		galTab.classList.remove("is-on");
		galText.textContent = "";
		galSr.textContent = "";
		galNext.classList.remove("is-on");
		galName.textContent = "";
		updateMute();
	}

	function resetWindows() {
		windows.forEach(function (w) {
			w.el.classList.remove("is-active", "is-gone", "is-min", "is-max", "is-nocaret");
			w.log.textContent = "";
			var minBtn = w.el.querySelector('[data-egg-light="min"]');
			var zoomBtn = w.el.querySelector('[data-egg-light="zoom"]');
			if (minBtn) minBtn.setAttribute("aria-pressed", "false");
			if (zoomBtn) zoomBtn.setAttribute("aria-pressed", "false");
		});
		shim.classList.remove("is-on");
	}

	function setInert(on) {
		if (on) {
			inertNodes = [];
			Array.prototype.forEach.call(document.body.children, function (el) {
				if (el === egg) return;
				if (el.tagName === "SCRIPT" || el.tagName === "STYLE") return;
				inertNodes.push({ el: el, had: el.hasAttribute("inert") });
				el.setAttribute("inert", "");
			});
		} else {
			inertNodes.forEach(function (item) {
				if (!item.had) item.el.removeAttribute("inert");
			});
			inertNodes = [];
		}
	}

	function enter() {
		if (exiting) return;
		if (state !== "normal" && state !== "exited") return;
		lastFocus = document.activeElement;

		state = "layer-1";
		runToken += 1;
		var token = runToken;
		closing = false;
		activeIndex = 0;

		try {
			if (window.HisouTerm && window.HisouTerm.resetView) window.HisouTerm.resetView();
			if (window.HisouTerm && window.HisouTerm.stop) window.HisouTerm.stop();
		} catch (e) {
			/* ignore */
		}

		document.documentElement.classList.add("egg-open");
		document.body.classList.add("egg-open");
		setInert(true);

		resetFinaleUI();
		resetWindows();
		measure();
		egg.style.setProperty("--egg-dim", LAYERS[0].dimBg);
		egg.classList.remove("is-final");

		stage.hidden = false;
		finale.hidden = true;
		finale.classList.remove("is-on");
		egg.hidden = false;
		egg.setAttribute("aria-hidden", "false");

		windows[0].el.classList.add("is-active");
		try {
			egg.focus({ preventScroll: true });
		} catch (e) {
			/* ignore */
		}

		window.requestAnimationFrame(function () {
			window.requestAnimationFrame(function () {
				egg.classList.add("is-on");
			});
		});

		window.setTimeout(
			function () {
				if (token !== runToken) return;
				playLayer(0, token);
			},
			reduced() ? 30 : 470
		);
	}

	function exitEgg() {
		if (state === "normal" || exiting) return;
		exiting = true;
		runToken += 1;
		var token = runToken;

		try {
			if (window.HisoBgm && window.HisoBgm.stopIntro) window.HisoBgm.stopIntro();
		} catch (e) {
			/* ignore */
		}

		state = "exited";
		egg.classList.remove("is-on", "is-final");
		shim.classList.remove("is-on");
		document.documentElement.classList.remove("egg-open");
		document.body.classList.remove("egg-open");
		setInert(false);

		window.setTimeout(
			function () {
				if (token !== runToken) return;
				stage.hidden = false;
				finale.hidden = true;
				finale.classList.remove("is-on");
				resetFinaleUI();
				resetWindows();
				egg.hidden = true;
				egg.setAttribute("aria-hidden", "true");
				exiting = false;
				state = "normal";
				try {
					if (window.HisouTerm && window.HisouTerm.restore) window.HisouTerm.restore();
				} catch (e) {
					/* ignore */
				}
				if (lastFocus && lastFocus.focus) {
					try {
						lastFocus.focus({ preventScroll: true });
					} catch (e) {
						/* ignore */
					}
				}
			},
			reduced() ? 20 : 460
		);
	}

	/* ── Wiring ──────────────────────────────────────────────────────────── */

	buildWindows();
	buildRecursion();

	galMute.addEventListener("click", toggleMute);
	galExit.addEventListener("click", exitEgg);

	document.addEventListener("keydown", function (e) {
		if (e.key !== "Escape") return;
		if (state === "normal" || state === "exited") return;
		e.preventDefault();
		exitEgg();
	});

	/* If autoplay was refused, the first tap/click in the final scene retries. */
	egg.addEventListener(
		"pointerdown",
		function () {
			if (state === "final-title" || state === "monika-reveal" || state === "dialogue") {
				retryAudio();
			}
		},
		{ passive: true }
	);

	var resizeTimer = 0;
	window.addEventListener("resize", function () {
		if (state.slice(0, 6) !== "layer-") return;
		window.clearTimeout(resizeTimer);
		resizeTimer = window.setTimeout(function () {
			measure();
			if (activeIndex >= 0 && windows[activeIndex].el.classList.contains("is-min")) {
				copyShim(windows[activeIndex].el);
			}
		}, 160);
	});

	/* Debug/repair hook used by the site's terminal close button. */
	window.HisouFinale = {
		enter: enter,
		exit: exitEgg,
		state: function () {
			return state;
		}
	};
})();
