/* Helps visitors who open the site inside TikTok, Instagram or Facebook (their built-in browsers).
   - A small "Better in Chrome" bar at the top. Closing it with × hides it for good.
   - On Android, the "Get it on Google Play" button first tries to open the Play Store app.
     If that doesn't work, a panel offers to continue in Chrome.
   Everyone else (normal browsers, desktop) sees no change. Loaded by assets/app.js. */
(() => {
  const ua = navigator.userAgent || "";
  const APPS = [["TikTok", /musical_ly|BytedanceWebview|TikTok|trill_/i], ["Instagram", /Instagram/i], ["Facebook", /FBAN|FBAV|FB_IAB/i]];
  const hit = APPS.find(([, re]) => re.test(ua));
  if (!hit) return;
  const host = hit[0];
  const android = /Android/i.test(ua);
  const ios = /iPhone|iPad|iPod/i.test(ua);
  const KEY = "ab-inapp-bar-closed";
  const store = { get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } },
                  set() { try { localStorage.setItem(KEY, "1"); } catch (e) {} } };

  // intent:// link that opens a web address in Chrome (Android). Falls back to the address itself.
  const inChrome = url => {
    const u = new URL(url, location.href);
    return `intent://${u.host}${u.pathname}${u.search}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(u.href)};end`;
  };
  const CHROME = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.5"/><path d="M12 8.5h8.2M8.9 13.8 4.8 6.6M15 13.9l-4.2 7"/></svg>';
  const X = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';

  /* ---------- top bar ---------- */
  if ((android || ios) && !store.get()) {
    const bar = document.createElement("div");
    bar.className = "inapp-bar";
    bar.innerHTML = android
      ? `${CHROME}<span>Better in Chrome</span><a class="inapp-open" href="${inChrome(location.href)}">Open</a><button class="inapp-x" aria-label="Close">${X}</button>`
      : `${CHROME}<span>Tap ⋯ and choose <b>Open in browser</b></span><button class="inapp-x" aria-label="Close">${X}</button>`;
    // Keep the Open link pointing at the page the visitor is on now (apps change the address).
    const open = bar.querySelector(".inapp-open");
    if (open) open.addEventListener("click", () => { open.href = inChrome(location.href); });
    bar.querySelector(".inapp-x").onclick = () => { store.set(); bar.remove(); };
    document.body.prepend(bar);
  }

  /* ---------- install button (Android only: iPhones can't install Android apps) ---------- */
  if (!android) return;
  let sheet = null;
  function showSheet(playUrl) {
    if (sheet) sheet.remove();
    sheet = document.createElement("div");
    sheet.className = "inapp-sheet";
    sheet.innerHTML = `<div class="inapp-panel" role="dialog" aria-modal="true" aria-labelledby="inapp-t">
      <i class="inapp-grab"></i>
      <b id="inapp-t">Install from Google Play</b>
      <p>${host} can't open the Play Store. Continue in Chrome.</p>
      <a class="inapp-go" href="${inChrome(playUrl)}">${CHROME}Open in Chrome</a>
      <button class="inapp-later">Not now</button></div>`;
    const close = () => { sheet.classList.remove("on"); setTimeout(() => { sheet && sheet.remove(); sheet = null; }, 300); };
    sheet.querySelector(".inapp-later").onclick = close;
    sheet.addEventListener("click", e => { if (e.target === sheet) close(); });
    document.body.appendChild(sheet);
    requestAnimationFrame(() => sheet.classList.add("on"));
  }
  document.addEventListener("click", e => {
    const a = e.target.closest('a[href*="play.google.com/store/apps/details"]');
    if (!a) return;
    const id = new URL(a.href).searchParams.get("id");
    if (!id) return;
    e.preventDefault();
    // Try to open the Play Store app directly. If the page is still showing a moment later, it didn't work.
    let left = false;
    const gone = () => { if (document.hidden) left = true; };
    document.addEventListener("visibilitychange", gone);
    addEventListener("blur", () => { left = true; }, { once: true });
    location.href = `intent://details?id=${encodeURIComponent(id)}#Intent;scheme=market;package=com.android.vending;end`;
    setTimeout(() => {
      document.removeEventListener("visibilitychange", gone);
      if (!left && !document.hidden) showSheet(a.href);
    }, 1200);
  }, true);
})();
