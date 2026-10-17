/* This app's own opening animation and page background.
   The website runs this file when someone opens the app.
   If you delete this file (and style.css), the app still works with a default animation.

   RULES
   1. Change "my-new-app" below to this app's folder name.
   2. Every rule in style.css must start with [data-app="my-new-app"].
   3. Give keyframes a unique prefix, like @keyframes mna-fall.

   You get:
     app          everything from info.json, plus app.url("art/x.webp") for files in this folder
     Site.reduce  true when the visitor prefers less motion
*/
(() => {
  Site.register("my-new-app", {
    // How long the icon flies to its spot, and when the text appears (milliseconds). Optional.
    timing: { fly: 780, reveal: 700 },

    // Background of the app page. Return HTML. Optional.
    world: (app) => `<div class="pw mna-world"></div>`,

    // The opening animation, played once when the app opens. Return HTML. Optional.
    opening: (app) => `<div class="mna-burst"></div>`,

    // Extra effects after opening, e.g. page.classList.add("shake"). Optional.
    onOpen: (page, app) => {}
  });
})();
