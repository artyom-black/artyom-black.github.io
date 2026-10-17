/* Tintora Sort: page background + "paint bands" opening animation.
   Styles are in style.css next to this file. */
(() => {
  const PAL = ["#bf0606", "#2b8a08", "#cc0cc2", "#f77205", "#e8d610", "#1696db", "#ffffff"];
  Site.register("tintora-sort", {
    timing: { fly: 1000, reveal: 950 },
    world: () => `<div class="pw tns-world"></div>`,
    opening: () => `<div class="tns-bands">${[5, 2, 4, 1, 3, 0, 5]
      .map((c, i) => `<i style="--i:${i};background:${PAL[c]}"></i>`).join("")}</div>`
  });
})();
