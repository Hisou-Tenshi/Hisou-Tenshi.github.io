/* The supplied Lily ANI theme, with its original timing and cursor hotspots. */
(function () {
 'use strict';
 var fine = matchMedia('(hover: hover) and (pointer: fine)');
 var reduced = matchMedia('(prefers-reduced-motion: reduce)');
 var root = document.documentElement, cursor = null, catalog = null;
 var pending = null, loaded = Object.create(null), loading = Object.create(null);
 var x = 0, y = 0, inside = false, frame = 0, kind = '', requested = '', scale = 1;

 function hide() {
  inside = false;
  root.classList.remove('lily-cursor-on');
  if (cursor) cursor.hidden = true;
 }

 function ensureCatalog() {
  if (pending) return pending;
  pending = fetch('/static/data/lily-cursors.json', {credentials: 'same-origin', cache: 'no-cache'})
   .then(function (r) { if (!r.ok) throw new Error('Cursor catalog unavailable'); return r.json(); })
   .then(function (data) { scale = data.displayScale || 1; catalog = data.states; return catalog; })
   .catch(function () { pending = null; return null; });
  return pending;
 }

 function loadSprite(name) {
  if (loaded[name]) return Promise.resolve(true);
  if (loading[name]) return loading[name];
  loading[name] = new Promise(function (resolve) {
   var image = new Image();
   image.onload = function () { loaded[name] = true; resolve(true); };
   image.onerror = function () { delete loading[name]; resolve(false); };
   image.src = catalog[name].sprite;
  });
  return loading[name];
 }

 function paint() {
  frame = 0;
  if (!inside || !fine.matches || reduced.matches || !catalog) return;
  var target = document.elementFromPoint(x, y);
  if (!target) { hide(); return; }
  var next = getComputedStyle(target).getPropertyValue('--lily-cursor').trim() || 'normal';
  if (target.tagName === 'TEXTAREA') {
   var bounds = target.getBoundingClientRect();
   if (getComputedStyle(target).resize !== 'none' && x > bounds.right - 16 && y > bounds.bottom - 16) next = 'nwse-resize';
  }
  if (!catalog[next]) next = 'normal';
  requested = next;
  if (!loaded[next]) {
   // Native themed PNG cursors remain active until this state's strip loads.
   root.classList.remove('lily-cursor-on');
   if (cursor) cursor.hidden = true;
   loadSprite(next).then(function (ok) { if (ok && requested === next) schedule(); });
   return;
  }
  var clip = catalog[next];
  if (!cursor) {
   cursor = document.createElement('div');
   cursor.className = 'lily-cursor';
   cursor.setAttribute('aria-hidden', 'true');
   document.body.appendChild(cursor);
  }
  if (kind !== next) {
   kind = next;
   cursor.dataset.state = next;
   cursor.style.width = clip.width + 'px';
   cursor.style.height = clip.height + 'px';
   cursor.style.backgroundImage = 'url("' + clip.sprite + '")';
   cursor.style.setProperty('--lily-strip-end', -(clip.width * clip.frames) + 'px');
   cursor.style.animation = 'lily-cursor-frames ' + clip.durationMs + 'ms steps(' + clip.frames + ') infinite';
  }
  cursor.style.transform = 'translate3d(' + (x - clip.hotspotX * scale) + 'px,' + (y - clip.hotspotY * scale) + 'px,0) scale(' + scale + ')';
  cursor.hidden = false;
  root.classList.add('lily-cursor-on');
 }

 function schedule() { if (!frame) frame = requestAnimationFrame(paint); }
 document.addEventListener('pointermove', function (event) {
  if (event.pointerType !== 'mouse' || !fine.matches || reduced.matches) return;
  x = event.clientX; y = event.clientY; inside = true;
  if (catalog) schedule();
  else ensureCatalog().then(function (data) { if (data) schedule(); });
 }, {passive: true});
 document.addEventListener('pointerout', function (event) { if (!event.relatedTarget) hide(); }, {passive: true});
 document.addEventListener('keydown', function (event) { if (event.key === 'Tab') hide(); });
 document.addEventListener('visibilitychange', function () { if (document.hidden) hide(); });
 addEventListener('blur', hide);
 addEventListener('scroll', function () { if (inside) schedule(); }, {passive: true, capture: true});
 fine.addEventListener('change', hide);
 reduced.addEventListener('change', hide);
})();
