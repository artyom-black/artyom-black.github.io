/* Shared website code. You should not need to edit this file to add an app.
   It reads apps.json (the list of app folders), then each folder's assets/info.json,
   and builds the cards. When an app is opened it loads that folder's
   assets/animation.css and assets/animation.js. If those are missing or broken,
   a default animation is used instead, so one app can never break the site. */
(() => {
// Website root, so links work from the homepage and from /app-name/ (and on a custom domain).
const ROOT=new URL(".",document.baseURI);
const U=p=>new URL(p,ROOT).href; // absolute address of a file in this repo
document.body.insertAdjacentHTML("afterbegin",`<canvas id="sparks" aria-hidden="true"></canvas>
<div id="flash"></div>
<header class="top"><a href="${ROOT.href}" aria-label="Artyom Black home"><img src="${U("assets/mark.png")}" alt="Artyom Black"></a></header>
<main>
  <section class="head"><h1 id="title"><span>Games</span></h1><p id="count"></p></section>
  <section class="shelf" aria-label="Titles"><div class="track" id="track"></div><div class="dots" id="dots"></div></section>
  <footer class="ft">
    <img src="${U("assets/logo-horizontal.png")}" alt="Artyom Black">
    <nav><a href="https://play.google.com/store/apps/developer?id=artyom+black" target="_blank" rel="noopener">Google Play</a></nav>
    <span>© ${new Date().getFullYear()} Artyom Black</span>
  </footer>
</main>
<nav class="tabbar" id="tabbar" aria-label="Category"><span class="tp"></span><button data-k="Game" class="on" id="tabGames">Games</button><button data-k="App" id="tabApps">Apps</button></nav>
<section id="page" hidden aria-modal="true" role="dialog"></section>
<div id="intro"><div class="ib"><img src="${U("assets/logo-vertical.png")}" alt=""><i class="sheen"></i></div></div>`);
const SITE_TITLE=document.title;
const slugFromPath=()=>decodeURIComponent(location.pathname.slice(ROOT.pathname.length)).split("/")[0];
const ARROW='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
const BACK='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>';
const PLAY='<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 2.8v18.4c0 .4.4.6.7.4l15.6-9.2c.3-.2.3-.6 0-.8L4.7 2.4c-.3-.2-.7 0-.7.4z"/></svg>';
const $=s=>document.querySelector(s);
const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

/* ---------- app animation modules ---------- */
const modules={},loading={};
// Each app's assets/animation.js calls Site.register("folder-name", {...}).
window.Site={reduce,register(slug,mod){modules[slug]=mod||{};}};
function addTag(tag,attrs){return new Promise(res=>{const el=document.createElement(tag);Object.assign(el,attrs);el.onload=()=>res(true);el.onerror=()=>{el.remove();res(false);};document.head.appendChild(el);});}
function loadModule(a){
  if(!loading[a.id]){
    const work=Promise.all([
      addTag("link",{rel:"stylesheet",href:a.base+"animation.css"}),
      addTag("script",{src:a.base+"animation.js",async:true})
    ]).then(()=>modules[a.id]||null);
    const timeout=new Promise(r=>setTimeout(()=>r(modules[a.id]||null),2500));
    loading[a.id]=Promise.race([work,timeout]);
  }
  return loading[a.id];
}
function safe(fn,fallback){try{const v=fn();return v==null?fallback:v;}catch(e){console.warn("App animation error:",e);return fallback;}}

/* ---------- reading apps.json and each info.json ---------- */
const abs=(base,p)=>!p?"":/^(https?:|mailto:|\/|#)/.test(p)?p:base+p;
async function loadApps(){
  let slugs=[];
  try{slugs=await (await fetch(U("apps.json"),{cache:"no-cache"})).json();}catch(e){console.error("Could not read apps.json",e);return [];}
  const got=await Promise.all(slugs.map(async slug=>{
    const folder=U(slug.replace(/\/?$/,"/")),base=folder+"assets/";
    try{
      const r=await fetch(base+"info.json",{cache:"no-cache"});if(!r.ok)throw new Error(r.status);
      const i=await r.json();if(!i.name)throw new Error("info.json has no name");
      return {...i,id:slug.replace(/\/$/,""),base,kind:i.kind==="App"?"App":"Game",
        icon:abs(base,i.icon||"icon.webp"),poster:abs(base,i.poster||"poster.jpg"),video:abs(base,i.video),
        // Real pages: /app-name/privacy-policy/ and /app-name/terms-of-service/. Set "privacy"/"terms" to false to hide a link.
        privacy:i.privacy===false?"":i.privacy?abs(folder,i.privacy):folder+"privacy-policy/",
        terms:i.terms===false?"":i.terms?abs(folder,i.terms):folder+"terms-of-service/",
        gallery:i.gallery&&{...i.gallery,items:(i.gallery.items||[]).map(g=>({...g,image:abs(base,g.image)}))},
        url:p=>abs(base,p)};
    }catch(e){console.warn(`Skipping "${slug}": could not read ${base}info.json`,e);return null;}
  }));
  return got.filter(Boolean);
}

let APPS=[];
const track=$("#track"),dots=$("#dots"),tabbar=$("#tabbar"),tp=tabbar.querySelector(".tp");
let list=[],active=0;
const plural=(n,w)=>`${n} ${w}${n===1?"":"s"} on Google Play`;

/* ---------- shelf ---------- */
function render(kind,anim){
  list=APPS.filter(a=>a.kind===kind);
  const h=$("#title");h.innerHTML=`<span>${kind==="Game"?"Games":"Apps"}</span>`;h.classList.remove("swap");void h.offsetWidth;if(anim)h.classList.add("swap");
  $("#count").textContent=plural(list.length,kind==="Game"?"game":"app");
  track.innerHTML=list.map((a,i)=>`<button class="card enter" data-id="${esc(a.id)}" style="--i:${Math.min(i,8)}" aria-label="Open ${esc(a.name)}">
    <img class="poster" src="${esc(a.poster)}" alt="" ${i>2?'loading="lazy"':""}>
    ${a.video?`<video muted loop playsinline preload="${i===0?"auto":"none"}" poster="${esc(a.poster)}" src="${esc(a.video)}"></video>`:""}
    <span class="grad"></span>
    ${a.comingSoon?`<span class="chip soon">Coming soon</span>`:""}
    <span class="meta"><img class="ic" src="${esc(a.icon)}" alt="" ${i>2?'loading="lazy"':""}><span class="tx"><b>${esc(a.name)}</b><small>${esc(a.comingSoon?a.genre+" · Coming soon":(a.subtitle||a.genre))}</small></span><span class="go">${ARROW}</span></span>
  </button>`).join("");
  dots.innerHTML=list.length>1?list.map(()=>"<i></i>").join(""):"";
  track.scrollLeft=0;active=-1;requestAnimationFrame(flow);
}
const playV=c=>{const v=c&&c.querySelector("video");if(v){const p=v.play();p&&p.catch(()=>{});}};
const pauseV=c=>{const v=c&&c.querySelector("video");if(v)v.pause();};
const appOf=c=>c&&APPS.find(a=>a.id===c.dataset.id);
const wide=matchMedia("(min-width:900px)");
function flow(){
  const cards=[...track.children],mid=innerWidth/2;let best=0,bd=1e9;
  if(wide.matches){cards.forEach(c=>{c.style.transform="";c.style.opacity="";const r=c.getBoundingClientRect();(r.right>0&&r.left<innerWidth)?playV(c):pauseV(c);});active=-2;return;}
  cards.forEach((c,i)=>{const r=c.getBoundingClientRect(),d=(r.left+r.width/2-mid)/r.width,ad=Math.min(Math.abs(d),1.2);
    if(Math.abs(d)<bd){bd=Math.abs(d);best=i;}
    if(!reduce)c.style.transform=`rotateY(${Math.max(-1,Math.min(1,d))*-9}deg) scale(${1-ad*.09})`;
    c.style.opacity=String(1-Math.min(ad,1)*.4);});
  if(best!==active){active=best;cards.forEach((c,i)=>i===active?playV(c):pauseV(c));
    dots.querySelectorAll("i").forEach((d,i)=>d.classList.toggle("on",i===active));
    const a=appOf(cards[active]);if(a)loadModule(a);} // get its animation ready before the tap
}
let fq=0;track.addEventListener("scroll",()=>{if(!fq)fq=requestAnimationFrame(()=>{fq=0;flow();});},{passive:true});
addEventListener("resize",()=>{flow();placePill(tabbar.querySelector(".on"));});
track.addEventListener("pointerover",e=>{const a=appOf(e.target.closest(".card"));if(a)loadModule(a);});
track.addEventListener("click",e=>{const c=e.target.closest(".card");if(!c)return;
  const i=[...track.children].indexOf(c);
  const r=c.getBoundingClientRect(),fully=r.left>=0&&r.right<=innerWidth;
  if(i!==active&&!fully){c.scrollIntoView({behavior:reduce?"auto":"smooth",inline:"center",block:"nearest"});return;}
  openApp(c.dataset.id,c);});
function placePill(b){if(!b)return;tp.style.width=b.offsetWidth+"px";tp.style.transform=`translateX(${b.offsetLeft-5}px)`;}
tabbar.querySelectorAll("button").forEach(b=>b.onclick=()=>{if(b.classList.contains("on"))return;
  tabbar.querySelectorAll("button").forEach(x=>x.classList.toggle("on",x===b));placePill(b);render(b.dataset.k,true);bolt();
  scrollTo({top:0,behavior:reduce?"auto":"smooth"});});
document.addEventListener("visibilitychange",()=>{const c=track.children[active];if(!c)return;if(document.hidden)pauseV(c);else if($("#page").hidden)playV(c);});

/* ---------- sparks + lightning ---------- */
const cv=$("#sparks"),cx=cv.getContext("2d"),fl=$("#flash");
let W=0,H=0,P=[],bolts=[],ptr={x:-999,y:-999},last=0,next=6000,dpr=1;
function size(){dpr=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;cv.width=W*dpr;cv.height=H*dpr;cx.setTransform(dpr,0,0,dpr,0,0);
  const n=Math.min(150,Math.round(W*H/8000));while(P.length<n)P.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.25,vy:(Math.random()-.5)*.25});P.length=n;}
size();addEventListener("resize",size);
const setPtr=e=>{ptr.x=e.clientX;ptr.y=e.clientY;};
addEventListener("pointermove",setPtr,{passive:true});addEventListener("pointerdown",setPtr,{passive:true});
addEventListener("pointerup",e=>{if(e.pointerType!=="mouse")setTimeout(()=>{ptr.x=ptr.y=-999;},600);},{passive:true});
function bolt(){if(reduce)return;const pts=[];let x=W*(.2+Math.random()*.6),y=0;pts.push([x,y]);while(y<H){y+=16+Math.random()*28;x+=(Math.random()-.5)*55;pts.push([x,y]);}
  const s=pts[Math.floor(pts.length*.35)],br=[[s[0],s[1]]];let bx=s[0],by=s[1];for(let i=0;i<6;i++){by+=18+Math.random()*24;bx+=(Math.random()>.5?1:-1)*(8+Math.random()*28);br.push([bx,by]);}
  bolts.push({pts,br,life:1});fl.classList.remove("go");void fl.offsetWidth;fl.classList.add("go");}
function line(pts,w,a){cx.beginPath();pts.forEach(([x,y],i)=>i?cx.lineTo(x,y):cx.moveTo(x,y));cx.lineWidth=w;cx.strokeStyle=`rgba(255,255,255,${a})`;cx.stroke();}
function loop(now){
  if($("#page").hidden&&!document.hidden){
    cx.clearRect(0,0,W,H);
    for(const p of P){const dx=p.x-ptr.x,dy=p.y-ptr.y,d=Math.hypot(dx,dy)||1;if(d<110){p.vx+=dx/d*.06;p.vy+=dy/d*.06;}
      p.vx*=.985;p.vy*=.985;p.vx+=(Math.random()-.5)*.02;p.vy+=(Math.random()-.5)*.02;p.x=(p.x+p.vx+W)%W;p.y=(p.y+p.vy+H)%H;}
    for(let i=0;i<P.length;i++){const a=P[i],dm=Math.hypot(a.x-ptr.x,a.y-ptr.y);cx.fillStyle=`rgba(255,255,255,${dm<140?.95:.38})`;cx.fillRect(a.x,a.y,1.5,1.5);
      for(let j=i+1;j<P.length;j++){const b=P[j],dx=a.x-b.x;if(dx>70||dx<-70)continue;const d=Math.hypot(dx,a.y-b.y);if(d<70){const near=Math.min(dm,Math.hypot(b.x-ptr.x,b.y-ptr.y))<150;
        cx.strokeStyle=`rgba(255,255,255,${(1-d/70)*(near?.45:.07)})`;cx.lineWidth=.6;cx.beginPath();cx.moveTo(a.x,a.y);cx.lineTo(b.x,b.y);cx.stroke();}}}
    if(!reduce&&now-last>next){bolt();last=now;next=9000+Math.random()*7000;}
    cx.save();cx.shadowColor="rgba(255,255,255,.9)";cx.shadowBlur=16;bolts=bolts.filter(b=>{line(b.pts,2,b.life);line(b.br,1.1,b.life*.8);b.life-=.035;return b.life>0;});cx.restore();
  }
  requestAnimationFrame(loop);}
requestAnimationFrame(loop);

/* ---------- app page ---------- */
const page=$("#page");let cur=null,srcCard=null,busy=false,pushed=false;
const defaultWorld=a=>`<div class="pw pw-default" style="--accent:${esc(a.color||"#ffffff")};--poster:url('${esc(a.poster)}')"></div>`;
const defaultOpening=a=>`<div class="dflt" style="--accent:${esc(a.color||"#ffffff")}"></div>`;
function extra(a){
  let h="",d=7;
  if(a.facts&&a.facts.length)h+=`<div class="blk rv" style="--d:${d++}"><h3>${esc(a.factsTitle||"How it plays")}</h3><ul class="facts">${a.facts.map(f=>`<li>${esc(f)}</li>`).join("")}</ul></div>`;
  if(a.chips&&a.chips.length)h+=`<div class="blk rv" style="--d:${d++}"><h3>${esc(a.chipsTitle||"Inside")}</h3><div class="chips">${a.chips.map(c=>`<span>${esc(c)}</span>`).join("")}</div></div>`;
  if(a.gallery&&a.gallery.items.length)h+=`<div class="blk rv" style="--d:${d++}"><h3>${esc(a.gallery.title||"Gallery")}</h3><div class="gallery">${a.gallery.items.map((g,i)=>`<figure style="--i:${i}"><img src="${esc(g.image)}" alt="" loading="lazy">${esc(g.name||"")}</figure>`).join("")}</div></div>`;
  return h;
}
async function openApp(id,card){
  if(busy)return;busy=true;const a=APPS.find(x=>x.id===id);if(!a){busy=false;return;}
  const mod=await loadModule(a)||{};
  cur=a;srcCard=card;
  const from=card.querySelector(".ic");pauseV(card);const cvid=card.querySelector("video");
  const t0=mod.timing||{};const flyMs=reduce?1:(t0.fly||780),revealMs=reduce?0:(t0.reveal||700);
  page.className="";page.dataset.app=a.id;page.hidden=false;document.body.style.overflow="hidden";
  page.innerHTML=`${safe(()=>mod.world&&mod.world(a),defaultWorld(a))}<div class="pshade"></div><div class="trans">${safe(()=>mod.opening&&mod.opening(a),defaultOpening(a))}</div>
   <div class="psc"><div class="pin">
    <div class="ptop"><button class="back" aria-label="Back">${BACK}</button><span class="grab"></span><span class="sp"></span></div>
    <img class="picon" src="${esc(a.icon)}" alt="">
    <div class="phead"><p class="lbl rv" style="--d:0">${esc(a.kind)} · ${esc(a.genre)}</p><h2 class="rv" style="--d:1">${esc(a.name)}</h2>${a.subtitle?`<p class="sub rv" style="--d:2">${esc(a.subtitle)}</p>`:""}
     ${a.line?`<p class="line rv" style="--d:3">${esc(a.line)}</p>`:""}
     ${a.comingSoon||!a.googlePlay?`<span class="cta soon rv" style="--d:4">Coming soon to Google Play</span>`:`<a class="cta rv" style="--d:4" href="${esc(a.googlePlay)}" target="_blank" rel="noopener">${PLAY}Get it on Google Play</a>`}</div>
    <div class="blk rv" style="--d:5"><h3>${a.kind==="Game"?"Gameplay":"Inside the app"}</h3><div class="device">${a.video?`<video muted loop playsinline autoplay preload="auto" poster="${esc(a.poster)}" src="${esc(a.video)}"></video>`:`<img src="${esc(a.poster)}" alt="">`}</div></div>
    ${extra(a)}
    ${a.privacy||a.terms?`<div class="legal rv" style="--d:10">${a.privacy?`<a href="${esc(a.privacy)}">Privacy policy</a>`:""}${a.terms?`<a href="${esc(a.terms)}">Terms of service</a>`:""}</div>`:""}
    <div class="pft">© ${new Date().getFullYear()} Artyom Black</div>
   </div></div>`;
  const pv=page.querySelector(".device video");if(pv){try{pv.currentTime=cvid?cvid.currentTime:0;}catch(e){}pv.play().catch(()=>{});}
  const s=from.getBoundingClientRect(),di=page.querySelector(".picon"),t=di.getBoundingClientRect();
  const tl=page.querySelector(".trans");tl.style.setProperty("--cx",(s.left+s.width/2)+"px");tl.style.setProperty("--cy",(s.top+s.height/2)+"px");
  di.style.visibility="hidden";from.style.visibility="hidden";
  const fly=document.createElement("img");fly.src=a.icon;fly.className="fly";document.body.appendChild(fly);
  const R=r=>({left:r.left+"px",top:r.top+"px",width:r.width+"px",height:r.height+"px"});
  Object.assign(fly.style,R(s));void page.offsetWidth;page.classList.add("opening");
  safe(()=>{mod.onOpen&&mod.onOpen(page,a);},null);
  fly.animate([R(s),{...R(t),offset:.6},R(t)],{duration:flyMs,easing:"cubic-bezier(.7,0,.2,1)",fill:"forwards"}).onfinish=()=>{di.style.visibility="";fly.remove();busy=false;};
  setTimeout(()=>page.classList.add("on-rv"),revealMs);
  page.querySelector(".back").onclick=()=>closeApp();
  swipeClose(page.querySelector(".psc"));
  document.title=`${a.name} · ${SITE_TITLE}`;
  if(slugFromPath()!==id){try{history.pushState({app:id},"",new URL(id+"/",ROOT).href);pushed=true;}catch(e){pushed=false;}}
}
function closeApp(fromPop){
  if(busy||page.hidden)return;busy=true;
  document.title=SITE_TITLE;
  if(!fromPop){if(pushed){pushed=false;try{history.back();}catch(e){}}else{try{history.replaceState(null,"",ROOT.href);}catch(e){}}}
  const di=page.querySelector(".picon"),t=di.getBoundingClientRect(),from=srcCard.querySelector(".ic"),s=from.getBoundingClientRect();
  const R=r=>({left:r.left+"px",top:r.top+"px",width:r.width+"px",height:r.height+"px"});
  const fly=document.createElement("img");fly.src=cur.icon;fly.className="fly";document.body.appendChild(fly);Object.assign(fly.style,R(t));di.style.visibility="hidden";
  page.style.transform="";page.classList.add("closing");
  fly.animate([R(t),R(s)],{duration:reduce?1:520,easing:"cubic-bezier(.7,0,.2,1)",fill:"forwards"}).onfinish=()=>{
    from.style.visibility="";fly.remove();page.hidden=true;page.className="";page.innerHTML="";delete page.dataset.app;document.body.style.overflow="";busy=false;
    playV(srcCard);};
}
addEventListener("popstate",()=>{
  const slug=slugFromPath();
  if(!page.hidden&&slug!==cur?.id){pushed=false;closeApp(true);}
  else if(page.hidden&&slug){const a=APPS.find(x=>x.id===slug);if(a)openFromLink(a,false);}
});
// Opens an app straight from a link (/app-name/ or an old /#name link).
function openFromLink(a,first){
  const b=tabbar.querySelector(`[data-k="${a.kind}"]`);
  if(!b.classList.contains("on")){tabbar.querySelectorAll("button").forEach(x=>x.classList.toggle("on",x===b));placePill(b);render(a.kind,false);}
  loadModule(a);
  setTimeout(()=>{const c=track.querySelector(`[data-id="${a.id}"]`);if(!c)return;
    c.scrollIntoView({behavior:"auto",inline:"center",block:"nearest"});flow();
    pushed=false;openApp(a.id,c);},first?250:60);
}
addEventListener("keydown",e=>{if(e.key==="Escape")closeApp();});
function swipeClose(sc){let y0=null,dy=0;
  sc.addEventListener("touchstart",e=>{if(sc.scrollTop<=0){y0=e.touches[0].clientY;dy=0;}},{passive:true});
  sc.addEventListener("touchmove",e=>{if(y0==null)return;dy=e.touches[0].clientY-y0;if(dy>0){page.style.transform=`translateY(${dy*.5}px) scale(${1-Math.min(dy,300)/3000})`;page.style.borderRadius="28px";}},{passive:true});
  sc.addEventListener("touchend",()=>{if(y0==null)return;y0=null;if(dy>110)closeApp();else{page.style.transition="transform .3s";page.style.transform="";setTimeout(()=>page.style.transition="",300);}});}

/* ---------- start ---------- */
function intro(){const el=$("#intro");if(reduce){el.classList.add("done");return;}el.classList.add("run");setTimeout(bolt,1750);setTimeout(()=>el.classList.add("done"),2500);}
// Extra help for visitors inside TikTok's built-in browser.
addTag("script",{src:U("assets/in-app.js"),async:true});
const landing=slugFromPath()||decodeURIComponent(location.hash.slice(1));
if(landing){$("#intro").classList.add("done");}else intro();
loadApps().then(apps=>{
  APPS=apps;
  // Hide a tab (Games or Apps) when it has nothing in it.
  ["Game","App"].forEach(k=>{const b=tabbar.querySelector(`[data-k="${k}"]`);b.hidden=!APPS.some(a=>a.kind===k);});
  const first=tabbar.querySelector("button:not([hidden])")||tabbar.querySelector("button");
  tabbar.querySelectorAll("button").forEach(x=>x.classList.toggle("on",x===first));
  tabbar.hidden=tabbar.querySelectorAll("button:not([hidden])").length<2;
  render(first.dataset.k,false);requestAnimationFrame(()=>placePill(first));
  // artyomblack.com/tunnel-ride/ opens that app directly. Old links like /#tunnel still work.
  if(landing){const a=APPS.find(x=>x.id===landing||(x.oldIds||[]).includes(landing));
    if(a){if(location.hash){try{history.replaceState(null,"",new URL(a.id+"/",ROOT).href);}catch(e){}}openFromLink(a,true);}
    else{$("#intro").classList.remove("done");intro();}}
});
})();
