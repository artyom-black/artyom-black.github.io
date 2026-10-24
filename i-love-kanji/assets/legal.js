/* I Love Kanji legal pages: section menu, mobile drawer and the support chat.
   Page URLs stay the same (../privacy-policy/ and ../terms-of-service/). */
(() => {
  const doc = document.body.dataset.doc; // "privacy" or "terms"

  /* Old links that point to the other document by hash still work. */
  function otherDoc() {
    if (doc === "privacy" && location.hash === "#terms-of-service") { location.replace("../terms-of-service/"); return true; }
    if (doc === "terms" && location.hash === "#privacy-policy") { location.replace("../privacy-policy/"); return true; }
    return false;
  }
  if (otherDoc()) return;
  window.addEventListener("hashchange", otherDoc);

  /* ---------- mobile drawer ---------- */
  const side = document.getElementById("side");
  const scrim = document.getElementById("scrim");
  const menuBtn = document.getElementById("menuBtn");
  const mobile = window.matchMedia("(max-width: 900px)");
  function setDrawer(open) {
    side.classList.toggle("open", open);
    scrim.classList.toggle("on", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("drawer-open", open);
    if (open) { const a = side.querySelector(".toc a.on") || side.querySelector(".toc a"); a && a.focus({ preventScroll: true }); }
  }
  menuBtn.addEventListener("click", () => setDrawer(!side.classList.contains("open")));
  scrim.addEventListener("click", () => setDrawer(false));
  side.addEventListener("click", e => { if (e.target.closest(".toc a") && mobile.matches) setDrawer(false); });

  /* ---------- highlight the section being read ---------- */
  const links = [...document.querySelectorAll(".toc a")];
  const heads = links.map(a => document.getElementById(a.hash.slice(1))).filter(Boolean);
  function mark(id) {
    links.forEach(a => {
      const on = a.hash === "#" + id;
      a.classList.toggle("on", on);
      if (on) { a.setAttribute("aria-current", "location"); if (!mobile.matches) a.scrollIntoView({ block: "nearest" }); }
      else a.removeAttribute("aria-current");
    });
  }
  function current() {
    const line = mobile.matches ? 140 : 120;
    let id = heads[0] && heads[0].id;
    for (const h of heads) { if (h.getBoundingClientRect().top - line <= 0) id = h.id; else break; }
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) id = heads[heads.length - 1].id;
    return id;
  }
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => { mark(current()); ticking = false; });
  }, { passive: true });
  links.forEach(a => a.addEventListener("click", () => mark(a.hash.slice(1))));
  if (heads.length) { mark(current()); window.addEventListener("load", () => mark(current())); }

  /* ---------- support chat ---------- */
  const fab = document.getElementById("chatFab");
  const panel = document.getElementById("chat");
  const closeBtn = document.getElementById("chatClose");
  const log = document.getElementById("chatLog");
  const form = document.getElementById("chatForm");
  const email = document.getElementById("chatEmail");
  const text = document.getElementById("chatText");
  const send = document.getElementById("chatSend");
  const honey = document.getElementById("chatHp");
  const pageName = doc === "terms" ? "Terms of Service" : "Privacy Policy";

  function openChat() {
    panel.classList.add("open");
    panel.setAttribute("aria-hidden", "false");
    fab.setAttribute("aria-expanded", "true");
    setTimeout(() => (email.value ? text : email).focus(), 60);
  }
  function closeChat() {
    panel.classList.remove("open");
    panel.setAttribute("aria-hidden", "true");
    fab.setAttribute("aria-expanded", "false");
    fab.focus();
  }
  fab.addEventListener("click", () => panel.classList.contains("open") ? closeChat() : openChat());
  closeBtn.addEventListener("click", closeChat);
  document.querySelectorAll("[data-open-chat]").forEach(b => b.addEventListener("click", openChat));
  document.addEventListener("keydown", e => {
    if (e.key !== "Escape") return;
    if (panel.classList.contains("open")) closeChat();
    else if (side.classList.contains("open")) { setDrawer(false); menuBtn.focus(); }
  });

  function bubble(kind, content) {
    const el = document.createElement("div");
    el.className = "msg " + kind;
    if (content instanceof Node) el.appendChild(content); else el.textContent = content;
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
    return el;
  }
  function grow() { text.style.height = "auto"; text.style.height = Math.min(text.scrollHeight, 140) + "px"; }
  text.addEventListener("input", grow);
  text.addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey && !e.isComposing && window.matchMedia("(pointer: fine)").matches) {
      e.preventDefault(); form.requestSubmit();
    }
  });

  form.addEventListener("submit", async e => {
    e.preventDefault();
    const address = email.value.trim();
    const message = text.value.trim();
    if (!message) { text.focus(); return; }
    if (!address || !email.checkValidity()) {
      bubble("err", "Add your email address above so we can write back to you.");
      email.focus();
      return;
    }
    bubble("me", message);
    text.value = ""; grow();
    if (honey.value.trim() !== "") { bubble("them", "Thanks! Your message is on its way."); return; }

    const dots = document.createElement("span");
    dots.className = "typing"; dots.setAttribute("aria-label", "Sending");
    dots.innerHTML = "<i></i><i></i><i></i>";
    const wait = bubble("them", dots);
    send.disabled = true;
    try {
      const res = await fetch("https://formsubmit.co/ajax/support.artyomblack@gmail.com", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          email: address, _replyto: address, _subject: "I Love Kanji Support",
          page: pageName, message: message, _template: "table", _captcha: "false"
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === "false" || data.success === false) throw new Error(data.message || "Send failed");
      wait.remove();
      bubble("them", "Got it, thanks! We'll reply to " + address + " as soon as we can.");
    } catch (err) {
      console.error(err);
      wait.remove();
      bubble("err", "That message didn't send. Check your connection and try again, or email support.artyomblack@gmail.com.");
      text.value = message; grow();
    } finally {
      send.disabled = false;
    }
  });
})();
