/* I Love Kanji: night background with falling sakura + a pink "bloom" opening with bursting petals.
   Styles are in animation.css next to this file. */
(() => {
  function petals(n) {
    let h = "";
    for (let i = 0; i < n; i++)
      h += `<i style="--x:${Math.random() * 100}%;--t:${7 + Math.random() * 7}s;--dl:${-Math.random() * 12}s;--dx:${Math.random() * 120 - 60}px;scale:${.6 + Math.random() * .7}"></i>`;
    return `<div class="ilk-petals">${h}</div>`;
  }
  Site.register("i-love-kanji", {
    world: () => `<div class="pw ilk-world">${petals(18)}</div>`,
    opening: () => {
      const cols = ["#f6b7c9", "#f9cdd9", "#ee9fb6", "#fde3ea"];
      let pt = "";
      for (let i = 0; i < 34; i++) {
        const an = Math.random() * 6.28, r = 140 + Math.random() * 300;
        pt += `<i class="ilk-pb" style="--i:${i};--s:${10 + Math.random() * 12}px;--c:${cols[i % 4]};--dx:${Math.cos(an) * r}px;--dy:${Math.sin(an) * r + 60}px;--r:${(Math.random() * 720 - 360) | 0}deg"></i>`;
      }
      return `<div class="ilk-bloom"></div>${pt}`;
    }
  });
})();
