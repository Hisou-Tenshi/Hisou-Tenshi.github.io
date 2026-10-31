/*!
 * vault.js — client-side unlock for /about-us/ and /download/
 *
 * 1) Page vault: fetches a pre-built payload (vault.json) and decrypts it with a
 *    password the visitor types. PBKDF2-SHA256 (210k) -> AES-256-GCM.
 * 2) File vault: the original per-file scheme used by /download/ (SHA-256 of
 *    password + SITE_SALT -> AES-CBC-256, IV and integrity hash served as
 *    sibling files, payload = [2-byte BE name length][name][bytes]).
 *
 * No password, key or plaintext is ever stored. Nothing is fetched until the
 * visitor actually submits.
 */
(function () {
	'use strict';

	var b64 = function (s) {
		var bin = atob(s);
		var out = new Uint8Array(bin.length);
		for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
		return out;
	};
	var encoder = new TextEncoder();
	var SITE_SALT = 'Yk9x#mP2$L8n&vR4@jW7';

	function say(el, text, kind) {
		if (!el) return;
		/* keep whatever the element's own base class is (vault__msg / file__msg) */
		var base = el.getAttribute('data-base-class');
		if (base === null) {
			base = (el.className || '').replace(/\s*is-[a-z]+/gi, '').trim();
			el.setAttribute('data-base-class', base);
		}
		el.className = base + (kind ? ' ' + kind : '');
		el.textContent = text || '';
	}

	/* ------------------------------------------------------------------ */
	/* 1. page vault                                                       */
	/* ------------------------------------------------------------------ */

	var payloads = {};

	function fetchPayload(src) {
		if (payloads[src]) return payloads[src];
		payloads[src] = fetch(src, { credentials: 'same-origin' }).then(function (r) {
			if (!r.ok) throw new Error('http ' + r.status);
			return r.json();
		});
		payloads[src].catch(function () {
			payloads[src] = null;
		});
		return payloads[src];
	}

	function deriveKey(password, payload) {
		return crypto.subtle
			.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveKey'])
			.then(function (base) {
				return crypto.subtle.deriveKey(
					{
						name: 'PBKDF2',
						salt: b64(payload.salt),
						iterations: payload.kdf.iter,
						hash: payload.kdf.hash,
					},
					base,
					{ name: 'AES-GCM', length: 256 },
					false,
					['decrypt']
				);
			});
	}

	function openVault(box, html) {
		var out = box.querySelector('[data-vault-out]');
		var gate = box.querySelector('.vault__gate');
		out.innerHTML = html;
		box.classList.add('is-open');
		if (gate) gate.setAttribute('aria-hidden', 'true');
		var first = out.querySelector('h2, h3, p');
		if (first) {
			first.setAttribute('tabindex', '-1');
			first.focus({ preventScroll: true });
		}
		var top = box.getBoundingClientRect().top;
		if (top < 0 || top > window.innerHeight * 0.5) {
			box.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	}

	function lockVault(box) {
		var out = box.querySelector('[data-vault-out]');
		var gate = box.querySelector('.vault__gate');
		var input = box.querySelector('[data-vault-input]');
		var msg = box.querySelector('[data-vault-msg]');
		out.innerHTML = '';
		box.classList.remove('is-open');
		if (gate) gate.removeAttribute('aria-hidden');
		if (input) input.value = '';
		say(msg, '');
		if (input) input.focus({ preventScroll: true });
	}

	function submitVault(box) {
		var src = box.getAttribute('data-vault-src');
		var input = box.querySelector('[data-vault-input]');
		var msg = box.querySelector('[data-vault-msg]');
		var btn = box.querySelector('[data-vault-submit]');
		var password = (input.value || '').trim();
		if (!password) {
			say(msg, '请先输入密码', 'is-error');
			input.focus();
			return;
		}
		say(msg, '正在解密…', 'is-busy');
		if (btn) btn.disabled = true;
		fetchPayload(src)
			.then(function (payload) {
				return deriveKey(password, payload).then(function (key) {
					return crypto.subtle.decrypt(
						{ name: 'AES-GCM', iv: b64(payload.iv) },
						key,
						b64(payload.ct)
					);
				});
			})
			.then(function (plain) {
				openVault(box, new TextDecoder().decode(plain));
				say(msg, '');
			})
			.catch(function (err) {
				var net = err && /http|Failed to fetch|NetworkError/i.test(String(err && err.message));
				say(msg, net ? '无法载入加密内容，请稍后重试' : '密码不正确', 'is-error');
				input.select();
			})
			.then(function () {
				if (btn) btn.disabled = false;
			});
	}

	function initVaults() {
		var boxes = document.querySelectorAll('[data-vault]');
		if (!boxes.length) return;
		/* Delegated: the unlocked payload is injected later, so anything may
		   appear inside a vault after load. */
		document.addEventListener('submit', function (e) {
			var form = e.target.closest && e.target.closest('.vault__form');
			if (!form) return;
			var box = form.closest('[data-vault]');
			if (!box) return;
			e.preventDefault();
			submitVault(box);
		});
		document.addEventListener('click', function (e) {
			var relock = e.target.closest && e.target.closest('[data-vault-relock]');
			if (!relock) return;
			var box = relock.closest('[data-vault]');
			if (!box) return;
			e.preventDefault();
			lockVault(box);
		});
	}

	/* ------------------------------------------------------------------ */
	/* 2. file vault (download page)                                       */
	/* ------------------------------------------------------------------ */

	function hex(buf) {
		return Array.prototype.map
			.call(new Uint8Array(buf), function (b) {
				return ('00' + b.toString(16)).slice(-2);
			})
			.join('');
	}

	function siblings(path) {
		var name = path.split('/').pop();
		var dir = path.slice(0, path.length - name.length);
		return { iv: dir + 'keys/' + name + '.iv', hash: dir + 'hash/' + name + '.hash' };
	}

	function fileKey(password) {
		return crypto.subtle
			.digest('SHA-256', encoder.encode(password + SITE_SALT))
			.then(function (digest) {
				return crypto.subtle.importKey(
					'raw',
					digest.slice(0, 32),
					{ name: 'AES-CBC' },
					false,
					['decrypt']
				);
			});
	}

	function getBuf(url) {
		return fetch(url, { credentials: 'same-origin' }).then(function (r) {
			if (!r.ok) throw new Error('载入 ' + url.split('/').pop() + ' 失败');
			return r.arrayBuffer();
		});
	}

	function unlockFile(row, password) {
		var path = row.getAttribute('data-path');
		var note = row.querySelector('.file__msg');
		var out = row.querySelector('.file__out');
		var btn = row.querySelector('.file__form button');
		var pair = siblings(path);
		say(note, '正在校验…', 'is-busy');
		if (btn) btn.disabled = true;
		out.innerHTML = '';
		Promise.all([getBuf(path), getBuf(pair.iv), getBuf(pair.hash)])
			.then(function (res) {
				var data = res[0];
				var iv = res[1];
				var hashText = new TextDecoder().decode(res[2]).trim();
				return crypto.subtle.digest('SHA-256', data).then(function (digest) {
					var expected = (hashText.split('|')[1] || '').toLowerCase();
					if (expected && hex(digest) !== expected) {
						throw new Error('文件完整性校验失败，可能已损坏');
					}
					return fileKey(password).then(function (key) {
						return crypto.subtle.decrypt({ name: 'AES-CBC', iv: iv }, key, data);
					});
				});
			})
			.then(function (plain) {
				var view = new DataView(plain);
				var nameLen = view.getUint16(0, false);
				/* A wrong password yields garbage; the 2-byte length prefix is the
				   cheapest sanity check, so bail out before decoding anything. */
				if (nameLen < 1 || nameLen > 255) throw new Error('密码不正确');
				var name;
				try {
					name = new TextDecoder('utf-8', { fatal: true }).decode(plain.slice(2, 2 + nameLen));
				} catch (e) {
					throw new Error('密码不正确');
				}
				if (/[\u0000-\u001f]/.test(name)) throw new Error('密码不正确');
				var body = plain.slice(2 + nameLen);
				var url = URL.createObjectURL(new Blob([body]));
				out.innerHTML = '';
				var link = document.createElement('a');
				link.className = 'dl';
				link.href = url;
				link.download = name;
				link.textContent = '↓ ' + name;
				out.appendChild(link);
				say(note, '校验通过 · ' + (body.byteLength / 1024).toFixed(0) + ' KB', '');
			})
			.catch(function (err) {
				var text = String((err && err.message) || err || '');
				/* keep the two known, useful failures; anything else is a bad password */
				if (!/载入|完整性|密码/.test(text)) text = '密码不正确';
				say(note, text.slice(0, 120), 'is-error');
			})
			.then(function () {
				if (btn) btn.disabled = false;
			});
	}

	function initFiles() {
		document.addEventListener('click', function (e) {
			var open = e.target.closest && e.target.closest('[data-file-open]');
			if (!open) return;
			e.preventDefault();
			var row = open.closest('.file');
			if (!row) return;
			var on = row.classList.toggle('is-open');
			open.setAttribute('aria-expanded', on ? 'true' : 'false');
			if (on) {
				var input = row.querySelector('.file__input');
				if (input) input.focus();
			}
		});
		/* Delegate submit as well — the file list only exists after unlocking. */
		document.addEventListener('submit', function (e) {
			var form = e.target.closest && e.target.closest('.file__form');
			if (!form) return;
			e.preventDefault();
			var row = form.closest('.file');
			if (!row) return;
			var input = form.querySelector('.file__input');
			var password = (input.value || '').trim();
			if (!password) {
				say(row.querySelector('.file__msg'), '请输入密码', 'is-error');
				input.focus();
				return;
			}
			unlockFile(row, password);
		});
	}

	function init() {
		initVaults();
		initFiles();
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();
