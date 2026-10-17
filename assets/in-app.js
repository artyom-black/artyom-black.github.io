/* Helps visitors who open the site inside TikTok's built-in browser.
   TikTok blocks links that jump to Chrome or the Play Store ("action can't be completed"),
   so instead of jumping we show people how to use TikTok's own ⋯ → "Open in browser" menu.
   (Instagram and Facebook open Play Store links fine on their own, so they're left alone.)
   - A small bar at the top. Closing it with × hides it for good.
   - On Android, tapping "Get it on Google Play" shows a short panel with the same tip.
   Everyone else (normal browsers, desktop) sees no change. Loaded by assets/app.js. */
(() => {
  const ua = navigator.userAgent || "";
  const APPS = [["TikTok", /musical_ly|BytedanceWebview|TikTok|trill_/i]];
  const hit = APPS.find(([, re]) => re.test(ua));
  if (!hit) return;
  const host = hit[0];
  const android = /Android/i.test(ua);
  const ios = /iPhone|iPad|iPod/i.test(ua);
  if (!android && !ios) return;
  const KEY = "ab-inapp-bar-closed";
  const store = { get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } },
                  set() { try { localStorage.setItem(KEY, "1"); } catch (e) {} } };
  const browser = android ? "Chrome" : "Safari";
  const DOTS = '<span class="inapp-dots" aria-label="the ⋯ menu">⋯</span>';
  const ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8"/></svg>';
  const X = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';

  /* ---------- top bar ---------- */
  if (!store.get()) {
    const bar = document.createElement("div");
    bar.className = "inapp-bar";
    bar.innerHTML = `<span>Better in ${browser}: tap ${DOTS} at the top right, then <b>Open in browser</b></span>${ARROW}<button class="inapp-x" aria-label="Close">${X}</button>`;
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
      <p>${host} can't open the Play Store. Tap ${DOTS} at the top right and choose <b>Open in browser</b>, then tap install again.</p>
      <button class="inapp-go">Got it</button>
      <div class="inapp-row"><button class="inapp-copy">Copy link</button><a class="inapp-here" href="${playUrl}">Continue here anyway</a></div></div>`;
    const close = () => { sheet.classList.remove("on"); setTimeout(() => { sheet && sheet.remove(); sheet = null; }, 300); };
    sheet.querySelector(".inapp-go").onclick = close;
    sheet.querySelector(".inapp-here").addEventListener("click", () => setTimeout(close, 50));
    const copy = sheet.querySelector(".inapp-copy");
    copy.onclick = async () => {
      const url = location.href;
      try { await navigator.clipboard.writeText(url); }
      catch (e) { const t = document.createElement("textarea"); t.value = url; document.body.appendChild(t); t.select(); try { document.execCommand("copy"); } catch (e2) {} t.remove(); }
      copy.textContent = "Link copied";
    };
    sheet.addEventListener("click", e => { if (e.target === sheet) close(); });
    document.body.appendChild(sheet);
    requestAnimationFrame(() => sheet.classList.add("on"));
  }
  document.addEventListener("click", e => {
    const a = e.target.closest('a[href*="play.google.com/store/apps/details"]');
    if (!a || a.classList.contains("inapp-here")) return;
    e.preventDefault();
    showSheet(a.href);
  }, true);
})();
