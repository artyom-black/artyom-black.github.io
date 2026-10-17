/* Tunnel Ride: digging-ground background + drill launch opening with rock chunks and a screen shake.
   Styles are in style.css next to this file. */
(() => {
  Site.register("tunnel-ride", {
    world: () => `<div class="pw tr-world"><div class="tr-dig"></div></div>`,
    opening: (app) => {
      let chunks = "";
      for (let i = 0; i < 14; i++) {
        const an = Math.random() * 6.28, r = 120 + Math.random() * 180;
        chunks += `<i class="tr-ck" style="--s:${8 + Math.random() * 16}px;--dx:${Math.cos(an) * r}px;--dy:${Math.sin(an) * r}px"></i>`;
      }
      return `<div class="tr-drill"><div class="tr-dig"></div><img class="tr-rk" src="${app.url("art/rocket.webp")}" alt="">${chunks}</div>`;
    },
    onOpen: (page) => { if (!Site.reduce) setTimeout(() => page.classList.add("shake"), 380); }
  });
})();
