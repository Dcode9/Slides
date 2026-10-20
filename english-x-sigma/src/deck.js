/* ======================================================================
   DECK — camera, parallax, paper labels, the red panda, night, controls.
   ====================================================================== */
(() => {
  'use strict';
  // a pristine copy of this page, captured before any DOM is generated (used by "Save copy with poster")
  const PRISTINE='<!doctype html>\n'+document.documentElement.outerHTML;
  const $ = id => document.getElementById(id);
  const {W,H,M,N,U,LAYERS,ux} = WORLD;
  const S = Math.min(W,H)*.042;
  const depthF=d=>Math.pow(d/8,1.15)*S;
  const q = n => Math.round(n*10)/10, clamp=(v,a,b)=>v<a?a:v>b?b:v, rr=(a,b)=>a+(b-a)*Math.random();
  const body=document.body, stage=$('stage'), vp=$('vp');
  const reduceMQ=matchMedia('(prefers-reduced-motion: reduce)'); let reduce=reduceMQ.matches;
  reduceMQ.addEventListener&&reduceMQ.addEventListener('change',e=>{reduce=e.matches;});

  /* ---------- quality tiers ----------
     "full" is the deck exactly as designed.  "lite" trades only the most
     expensive pixels — per-layer gaussian drop shadows, the grain on thin
     blades, the blur on falling leaves, half the particles, the idle camera
     drift — for a deck that is still unmistakably the same paper diorama on a
     device that cannot afford all those blurs.  It switches itself on when the
     device advertises that it is weak, or when the first second of the deck
     genuinely runs below ~38 fps.  It never switches back, so it can't flicker. */
  const perf={lite:false,checked:false,frames:0,slow:0};
  function setLite(on){
    if(perf.lite===on)return;
    perf.lite=on;body.classList.toggle('lite',on);
  }
  (function detect(){
    // ?lite / #lite forces the tier (handy for judging it on a fast machine or
    // for a projector laptop that is slow only on battery); ?full forces the
    // design as drawn.
    if(/[?&]lite\b/.test(location.search)||/#lite\b/.test(location.hash))return setLite(true);
    if(/[?&]full\b/.test(location.search))return;
    const c=navigator.connection||{};
    if(c.saveData)return setLite(true);
    if((navigator.deviceMemory||8)<=2)return setLite(true);
    if((navigator.hardwareConcurrency||8)<=2)return setLite(true);
  })();
  function noteFrame(dt){
    if(perf.checked)return;
    perf.frames++;
    if(perf.frames>20){                             // ignore the warm-up frames
      if(dt>0.034)perf.slow++;                      // slower than ~29fps
      if(perf.frames===140){
        perf.checked=true;
        // a few hiccups are normal; a machine whose first two seconds are a
        // fifth slow frames needs the cheaper tier
        if(perf.slow>24)setLite(true);
      }
    }
  }
  const live=$('live'); const say=s=>{live.textContent=s;};
  const ROMAN=n=>{const v=[[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']];let s='';for(const [a,b] of v)while(n>=a){s+=b;n-=a;}return s;};

  /* ---------- scale the 1920×1080 box to the window ---------- */
  let vpRect=null, vpSc=1;
  function fit(){const sc=Math.min(innerWidth/W,innerHeight/H);vp.style.transform=`translate(${q((innerWidth-W*sc)/2)}px,${q((innerHeight-H*sc)/2)}px) scale(${sc.toFixed(4)})`;vpSc=sc;vpRect=vp.getBoundingClientRect();}
  addEventListener('resize',fit);fit();

  /* ---------- paper grain, made once from noise (as in the reference) ---------- */
  function makeGrain(){
    const c=document.createElement('canvas');c.width=c.height=160;const g=c.getContext('2d'),id=g.createImageData(160,160),d=id.data;
    for(let i=0;i<d.length;i+=4){const n=Math.random();if(n<.5){d[i]=74;d[i+1]=52;d[i+2]=30;d[i+3]=(.5-n)*46;}else{d[i]=255;d[i+1]=251;d[i+2]=240;d[i+3]=(n-.5)*40;}}
    g.putImageData(id,0,0);
    for(let k=0;k<90;k++){g.strokeStyle=k%3?'rgba(255,252,242,.2)':'rgba(96,66,36,.13)';g.lineWidth=.6;g.beginPath();const x=Math.random()*160,y=Math.random()*160,a=Math.random()*6.28,l=4+Math.random()*14;g.moveTo(x,y);g.quadraticCurveTo(x+Math.cos(a+.6)*l*.5,y+Math.sin(a+.6)*l*.5,x+Math.cos(a)*l,y+Math.sin(a)*l);g.stroke();}
    return c.toDataURL();
  }
  try{$('grainImg').setAttribute('href',makeGrain());}catch(e){}

  /* ---------- the nine sheets ----------
     Each sheet is generated as one long strip, but it is split on the \u0001
     tile marks into W-wide pieces.  Only the pieces in and around the camera
     are ever put in the document: a phone that shows plate V has ~4 tiles per
     sheet mounted instead of all 99, so the DOM stays small, the style tree
     stays small, and navigation never pays for art that is 10 m off-screen.  */
  const art=WORLD.build(1847);
  const layersHost=$('layers'), layerEls=[];      // {el,f,depth,tiles}
  const order=[['L1',3],['L2',3],['L3',4],['L4',4],['L5',5],['L6',6],['L7',6]];
  const SVGNS='http://www.w3.org/2000/svg';
  function splitArt(s){
    const parts=s.split('\u0001'), head=parts.shift();
    const tail=(parts.length&&parts[parts.length-1].indexOf('<g class="tile"')!==0)?parts.pop():'';
    const tiles=[];
    for(const p of parts){
      const m=p.match(/^<g class="tile" data-j="(\d+)">/);
      if(!m)continue;
      // inner = everything between the opening tag and the tile's own closing </g>
      tiles.push({j:+m[1],inner:p.slice(p.indexOf('>')+1,-4)});
    }
    return {head,tail,tiles};
  }
  function addLayer(key,sh,i,host){
    const L=LAYERS[key],lw=WORLD.widthOf(L.f)+2*M,lh=H+2*M,spec=splitArt(art[key]);
    const el=document.createElement('div');el.className='layer cut place';el.id=key;el.dataset.depth=L.depth;
    el.style.cssText=`--i:${i};--sh:${sh};left:${-M}px;top:${-M}px;width:${lw}px;height:${lh}px`;
    el.innerHTML=`<svg width="${lw}" height="${lh}" viewBox="${-M} ${-M} ${lw} ${lh}" focusable="false" aria-hidden="true">${spec.head}<g class="tiles"></g>${spec.tail}</svg>`;
    host.appendChild(el);
    const hostG=el.querySelector('g.tiles');
    const tiles=spec.tiles.map(t=>{
      const g=document.createElementNS(SVGNS,'g');g.setAttribute('class','tile');g.setAttribute('data-j',t.j);
      hostG.appendChild(g);
      return {j:t.j,el:g,key,inner:t.inner,on:false};
    });
    const rec={el,key,f:L.f,depth:L.depth,df:depthF(L.depth),tiles};
    layerEls.push(rec);return rec;
  }
  order.forEach(([k,sh],i)=>addLayer(k,sh,i,layersHost));
  const fliesC=document.createElement('canvas');fliesC.className='layer';fliesC.id='flies';fliesC.dataset.depth='7.4';fliesC.style.cssText=`left:${-M}px;top:${-M}px`;layersHost.appendChild(fliesC);
  const leavesEl=document.createElement('div');leavesEl.className='layer';leavesEl.id='leaves';leavesEl.dataset.depth='7.7';layersHost.appendChild(leavesEl);
  addLayer('L8',7,7,layersHost);
  // the content sheet rides with the floor
  const content=$('content');layersHost.appendChild(content);
  const vig=document.createElement('div');vig.className='vignette';layersHost.appendChild(vig);
  // the frame: fixed, with a gentle parallax of its own
  const L9=document.createElement('div');L9.className='layer cut';L9.id='L9';L9.dataset.depth='2.2';L9.style.cssText=`--i:8;--sh:9;left:${-M}px;top:${-M}px`;
  L9.innerHTML=`<svg width="${W+2*M}" height="${H+2*M}" viewBox="${-M} ${-M} ${W+2*M} ${H+2*M}" focusable="false" aria-hidden="true">${art.L9}</svg>`;layersHost.appendChild(L9);
  const pandaBtn=document.createElement('button');pandaBtn.type='button';pandaBtn.className='panda-btn';pandaBtn.setAttribute('aria-label','The red panda. Press to make it hop');$('L7').appendChild(pandaBtn);
  const f7=depthF(7), fh=depthF(.4), fFlies=depthF(7.4), fLeaves=depthF(7.7), f9=depthF(2.2);

  /* ---------- hanging things: sun, moon, clouds, stars on threads ---------- */
  const F=PAPER;
  function buildHangers(){
    F.setSeed(77);const R=()=>F.R();const {cut,circ}=F;
    const hang=$('hangs'),fh=.03,m=Math.min(W,H);hang.style.cssText=`left:0;top:${-M}px;width:${WORLD.widthOf(fh)}px;height:${H+M}px`;
    const items=[];
    const sunD=clamp(m*.16,78,168);
    let rays=[];for(let i=0;i<44;i++){const a=i/44*Math.PI*2,r=i%2?47:58;rays.push([Math.cos(a)*r,Math.sin(a)*r]);}
    const sunSvg=`<svg viewBox="-62 -62 124 124" width="${q(sunD)}" height="${q(sunD)}"><path fill="#c8642d" d="${cut(rays,.5,5)}"/><path fill="#d9a45b" d="${cut(circ(0,0,42,40),.5,5)}"/><path fill="#e6b772" d="${cut(circ(-4,-5,29,30),.4,5)}"/><path fill="url(#grainPat)" d="${cut(circ(0,0,42,40),.1,50)}"/></svg>`;
    const moonD=sunD*.86;
    const moonSvg=`<span class="halo"></span><svg viewBox="-50 -50 100 100" width="${q(moonD)}" height="${q(moonD)}" style="position:relative"><path fill="#f5ecd6" d="${cut(circ(0,0,44,44),.5,5)}"/><path fill="#e3d4b3" d="${cut(circ(-14,-10,9,14),.4,3)}${cut(circ(12,8,6,10),.3,3)}${cut(circ(-6,18,5,9),.3,3)}${cut(circ(18,-16,4,8),.3,3)}"/><path fill="url(#grainPat)" d="${cut(circ(0,0,44,40),.1,50)}"/></svg>`;
    const cloudShape=(sc)=>{let d='';for(const [cx,cy,r] of [[-30,4,17],[-9,-9,24],[16,-5,20],[35,6,13]])d+=cut(circ(cx*sc,cy*sc,r*sc,22),.5,5);d+=cut([[-46*sc,20*sc],[-46*sc,6*sc],[48*sc,6*sc],[48*sc,20*sc]],.5,6);return d;};
    const starPts=(r1,r2)=>{const p=[];for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?r2:r1;p.push([Math.cos(a)*r,Math.sin(a)*r]);}return p;};
    // the sun and moon stay with the viewer; clouds and stars are spread along the strip
    const sunX=W*.7,sunY=H*.2;
    items.push({cls:'day',x:sunX,y:sunY,h:sunD,html:sunSvg,delay:.1});
    items.push({cls:'nite',x:sunX-m*.02,y:sunY-m*.02,h:moonD,html:moonSvg,delay:.55});
    const clouds=[[.44,.12,1],[.575,.305,.62],[1.0,.16,.8],[1.25,.3,.6],[1.42,.1,.9]];
    const span=WORLD.widthOf(fh)/W; // ≈1.51 slide widths of hang-strip
    clouds.forEach(([cx,cy,sc],i)=>{if(cx>span)return;const cw=m*.19*sc;items.push({cls:'day',x:W*cx,y:H*cy,h:cw*.5,html:`<svg viewBox="-52 -36 104 60" width="${q(cw)}" height="${q(cw*.58)}"><path fill="#fbf6ea" d="${cloudShape(1)}"/><path fill="rgba(217,164,91,.16)" d="${cut([[-46,20],[-46,13],[48,13],[48,20]],.4,6)}"/></svg>`,delay:.2+i*.12});});
    const stars=[[.36,.1],[.5,.26],[.58,.08],[.84,.36],[.93,.12],[.3,.3],[.76,.06],[1.1,.2],[1.3,.1],[1.45,.3]];
    stars.forEach(([sx,sy],i)=>{if(sx>span)return;const ss=m*F.rr(.024,.036);items.push({cls:'nite',x:W*sx,y:H*sy,h:ss,html:`<svg viewBox="-12 -12 24 24" width="${q(ss)}" height="${q(ss)}"><path fill="#e8b865" d="${cut(starPts(11,4.6),.2,3)}"/></svg>`,delay:.7+i*.08});});
    hang.innerHTML=items.map(it=>{const len=it.y+M,up=len+it.h*1.6+40;
      return `<div class="hang ${it.cls}" style="left:${q(it.x)}px;--len:${q(len)}px;--up:${q(up)};--hd:${it.delay}s"><div class="swing" style="--sd:${(4+R()*3).toFixed(2)}s;--sdl:-${(R()*4).toFixed(2)}s"><span class="string"></span><div class="obj">${it.html}</div></div></div>`;}).join('');
  }
  let pinsBuilt=false;
  function buildPins(){
    if(pinsBuilt)return;pinsBuilt=true;
    const pins=$('pins');pins.setAttribute('viewBox',`0 0 ${W} ${H}`);F.setSeed(5);const R=()=>F.R();
    let s='';const n=Math.round(W*H/9000);
    const twMax=perf.lite?16:40;let tw=0;
    for(let i=0;i<n;i++){const x=R()*W,y=Math.pow(R(),1.4)*H*.5,r=F.rr(.5,1.5);const on=R()<.35&&tw<twMax;if(on)tw++;s+=`<circle${on?' class="tw"':''} style="animation-delay:-${(R()*3).toFixed(2)}s" cx="${q(x)}" cy="${q(y)}" r="${q(r)}"/>`;}
    pins.innerHTML=s;
  }
  buildHangers();

  /* ---------- the paper labels ---------- */
  const grainSvg=cls=>`<svg class="${cls}" aria-hidden="true" focusable="false"><rect width="100%" height="100%" fill="url(#grainPat)"/></svg>`;
  function tornClip(seed,n,jx,jy){ // an irregular, hand-cut rectangle in % coordinates
    F.setSeed(seed);const R=()=>F.R();const pts=[];
    const side=(x0,y0,x1,y1,nx,ny)=>{for(let i=0;i<n;i++){const t=i/n;pts.push([x0+(x1-x0)*t+nx*(R()-.5)*jx,y0+(y1-y0)*t+ny*(R()-.5)*jy]);}};
    side(0,0,100,0,0,1);side(100,0,100,100,1,0);side(100,100,0,100,0,1);side(0,100,0,0,1,0);
    return 'polygon('+pts.map(p=>`${clamp(p[0],0,100).toFixed(2)}% ${clamp(p[1],0,100).toFixed(2)}%`).join(',')+')';
  }
  const slots=[];
  function buildContent(){
    let html='';
    SLIDES.forEach((sl,k)=>{
      let inner='';
      (sl.items||[]).forEach((it,i)=>{
        if(it.type==='tag'){
          inner+=`<div class="tag-wrap${it.physics?' phys':' swingy'}" style="left:${it.x}px;top:0;width:${it.w}px;--sd:${(4.5+(i*1.3)%3).toFixed(1)}s;--sdl:-${(i*1.7)%4}s"><div class="anim drop" style="--i:${i}"><span class="tag-string" style="--len:${it.len||54}px"></span><div class="tag${it.small?' small':''}" style="--tw:${it.w}px">${grainSvg('tag-grain')}<span class="tag-knot"></span><span class="tag-hole"></span>${it.html}</div></div></div>`;
        }else if(it.type==='card'){
          const jx=Math.min(1.1,700/it.w), c1=tornClip(100+k*10+i,9,jx,1.0), c2=tornClip(200+k*10+i,7,jx*.6,.6);
          inner+=`<div class="card-pos" style="left:${it.x}px;top:${it.y}px;width:${it.w}px;transform:rotate(${it.rot||0}deg)"><div class="card-wrap anim${it.pin?' pinned':''}" style="--i:${i}"><div class="card${it.cls?' '+it.cls:''}" style="--clip:${c1};--clip2:${c2}">${grainSvg('card-grain')}${it.html}</div></div></div>`;
        }else if(it.type==='note'){
          inner+=`<div class="scene-note anim" style="left:${it.x}px;top:${it.y}px;--i:${i}">${it.html}</div>`;
        }else if(it.type==='poster'){
          const c1=tornClip(300+k,9,.9,.8);
          inner+=`<div class="poster-pos" style="left:${it.x}px;top:${it.y}px;width:${it.w}px;height:${it.h}px"><div class="poster-wrap anim" style="--i:${i}"><div class="poster" style="--clip:${c1};width:${it.w}px;height:${it.h}px">${grainSvg('card-grain')}<div class="ph" id="posterPh" role="button" tabindex="0" aria-label="Group poster. Click to choose an image file."><img id="posterImg" alt="Group poster promoting the folk dance of Sikkim"><div class="ph-text"><b>Group poster</b>Promoting the folk dance of Sikkim<br><span class="small">Save your Photoshop export as <b style="display:inline;font-size:inherit">poster.jpg</b> beside this file — or click here to choose it.</span></div><span class="corner tl" style="left:14px;top:14px"></span><span class="corner tr" style="right:14px;top:14px"></span><span class="corner br" style="right:14px;bottom:14px"></span><span class="corner bl" style="left:14px;bottom:14px"></span></div></div></div></div>`;
        }
      });
      html+=`<div class="slot" id="slot${k}" style="left:${k*W}px" data-k="${k}">${inner}</div>`;
    });
    content.innerHTML=html;
    for(let k=0;k<N;k++){const s=$('slot'+k);slots.push(s);s.querySelectorAll('li,.row,.mini,.tl>div').forEach((el,j)=>el.style.setProperty('--j',j));}
  }
  buildContent();
  const physTags=Array.from(content.querySelectorAll('.tag-wrap.phys')).map(el=>({el,a:-2.5,v:0}));

  /* ---------- the poster: the one photograph in the box ---------- */
  (function posterInit(){
    const ph=$('posterPh'),img=$('posterImg'),embed=$('embed');if(!ph)return;
    let dataUrl='';
    const show=src=>{img.src=src;ph.classList.add('has');};
    const tryLoad=(list)=>{if(!list.length)return;const src=list[0];const t=new Image();t.onload=()=>show(src);t.onerror=()=>tryLoad(list.slice(1));t.src=src;};
    if(typeof POSTER_SRC==='string'&&POSTER_SRC)show(POSTER_SRC);
    else{
      // The poster is a 350 KB photograph on a plate that is 13 plates away:
      // don't spend a slow connection's bandwidth on it until it is wanted.
      let asked=false;
      const ask=()=>{if(asked)return;asked=true;tryLoad(['poster.jpg','poster.png','poster.jpeg','poster.webp']);};
      (window.requestIdleCallback||(f=>setTimeout(f,4000)))(ask,{timeout:6000});
      document.addEventListener('deck:poster',ask,{once:true});
    }
    const input=document.createElement('input');input.type='file';input.accept='image/*';input.style.display='none';document.body.appendChild(input);
    input.addEventListener('change',()=>{const f=input.files&&input.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{dataUrl=r.result;show(dataUrl);embed.hidden=false;say('Poster loaded. Use "Save copy with poster" to keep it inside the file.');};r.readAsDataURL(f);});
    const open=e=>{e.stopPropagation();input.click();};
    ph.addEventListener('click',open);ph.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')open(e);});
    embed.addEventListener('click',e=>{
      e.stopPropagation();if(!dataUrl)return;
      const marker='const POSTER_SRC = '+"''"+';';
      const out=PRISTINE.replace(marker,'const POSTER_SRC = '+"'"+dataUrl+"'"+';');
      const blob=new Blob([out],{type:'text/html;charset=utf-8'}),a=document.createElement('a');
      a.href=URL.createObjectURL(blob);a.download='Glimpses_of_India_X_Sigma_with_poster.html';document.body.appendChild(a);a.click();
      setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},3000);
    });
  })();

  /* ---------- camera ---------- */
  let cur=0, cam=0, tween=null, manual=false;
  const hashK=()=>{const m=location.hash.match(/\d+/);return m?clamp(parseInt(m[0],10)-1,0,N-1):0;};
  const dflt=k=>SLIDES[k].mode==='night';
  function updatePosterTabindex(){const ph=$('posterPh');if(!ph)return;const slot=ph.closest('.slot');const sk=slot?+slot.dataset.k:-1;ph.tabIndex=(sk===cur)?0:-1;}
  const lockScroll=()=>{
    if(window.scrollX||window.scrollY)window.scrollTo(0,0);
    if(stage.scrollLeft||stage.scrollTop){stage.scrollLeft=0;stage.scrollTop=0;}
    if(vp.scrollLeft||vp.scrollTop){vp.scrollLeft=0;vp.scrollTop=0;}
  };
  window.addEventListener('scroll',lockScroll,{passive:true});
  stage.addEventListener('scroll',lockScroll,{passive:true});
  vp.addEventListener('scroll',lockScroll,{passive:true});
  function updateCounter(){$('counter').innerHTML=`Plate <b>${ROMAN(cur+1)}</b> <span style="opacity:.55">/ ${ROMAN(N)}</span>`;$('prev').disabled=cur===0;$('next').disabled=cur===N-1;}
  /* ---------- background fill ----------
     Tiles are drawn on demand.  While the deck is idle we quietly draw the
     ones the talk is likely to need next, nearest plate first, a few
     milliseconds at a time — so walking forward never has to wait for paper. */
  const tileIndex={};
  for(const L of layerEls){const m=tileIndex[L.key]=tileIndex[L.key]||{};for(const t of L.tiles)m[t.j]=t;}
  const idle=window.requestIdleCallback
    ? (f)=>window.requestIdleCallback(f,{timeout:1500})
    : (f)=>setTimeout(()=>f({timeRemaining:()=>8}),60);
  let prefetchQ=[],prefetching=false;
  function pumpPrefetch(){
    if(prefetching||!prefetchQ.length)return;
    prefetching=true;
    const step=(deadline)=>{
      const left=deadline&&deadline.timeRemaining?()=>deadline.timeRemaining():()=>0;
      let n=0;
      while(prefetchQ.length&&n<3&&(n===0||left()>5)){
        const t=prefetchQ.shift();
        if(!t.inner)t.inner=WORLD.fill(t.key,t.j)||'';
        n++;
      }
      prefetching=false;
      if(prefetchQ.length)idle(step);
    };
    idle(step);
  }
  function drainPrefetch(n){
    while(n-->0&&prefetchQ.length){
      const t=prefetchQ.shift();
      if(!t.inner)t.inner=WORLD.fill(t.key,t.j)||'';
    }
  }
  function schedulePrefetch(centre){
    const seen=new Set();prefetchQ=[];
    // lite devices only look one plate ahead: enough, and it keeps the fan quiet
    const reach=perf.lite?1:N;
    const at=centre==null?cur:centre;
    const order=[];
    for(let d=0;d<reach;d++){
      if(d===0)order.push(at);
      else{order.push(at-d,at+d);}
    }
    for(const k of order){
      if(k<0||k>=N)continue;
      for(const key in tileIndex){
        const f=LAYERS[key].f;
        const j0=Math.max(0,Math.floor((k*W*f+M)/W)-1),j1=Math.floor(((k+1)*W*f+M)/W);
        for(let j=j0;j<=j1;j++){
          const t=tileIndex[key][j];
          if(t&&!t.inner&&!seen.has(key+':'+j)){seen.add(key+':'+j);prefetchQ.push(t);}
        }
      }
    }
    pumpPrefetch();
  }

  /* ---------- tile window ----------
     A tile is *mounted* (its art injected) only while it is in, or just
     outside, the camera window — or on the plate we are walking to.  Anything
     else has zero nodes in the document, which is what keeps this deck usable
     on a low-end machine: no memory for path data that cannot be seen and no
     style recalculation over it when day turns to night.                  */
  const MARGIN=.34;            // slide-widths of art kept just outside the frame
  let lastTileCam=-999;
  function mountTile(t,on,onlyIfReady){
    if(on===t.on)return;
    if(on){
      // tiles are drawn the first time they are needed; after that the markup
      // is kept so walking back and forth stays instant
      if(!t.inner){
        if(onlyIfReady)return;                 // will be mounted on a later frame
        t.inner=WORLD.fill(t.key,t.j)||'';
      }
      t.el.innerHTML=t.inner;
    }else t.el.textContent='';
    t.on=on;
  }
  function applyTiles(){
    const a=cam-MARGIN,b=cam+1+MARGIN;              // what the camera window shows
    const c=cur-.18,d=cur+1.18;                     // the plate on stage
    const e=tween?tween.to-.18:0,f=tween?tween.to+1.18:-1;   // the plate we walk to
    for(const L of layerEls){
      if(!L.tiles.length)continue;
      const j0=Math.max(0,Math.floor((a*W*L.f+M)/W)-1),j1=Math.min(L.tiles.length-1,Math.floor((b*W*L.f+M)/W));
      const k0=Math.max(0,Math.floor((c*W*L.f+M)/W)-1),k1=Math.min(L.tiles.length-1,Math.floor((d*W*L.f+M)/W));
      const n0=Math.max(0,Math.floor((e*W*L.f+M)/W)-1),n1=Math.min(L.tiles.length-1,Math.floor((f*W*L.f+M)/W));
      for(const t of L.tiles){
        if(t.j>=j0&&t.j<=j1)mountTile(t,true,false);
        else if((t.j>=k0&&t.j<=k1)||(t.j>=n0&&t.j<=n1))mountTile(t,true,true);
        else mountTile(t,false);
      }
    }
  }
  const MAX_HOP_SPEED=440; // max horizontal speed (px/sec) to keep movement grounded & weighted
  const MIN_HOP_DUR=0.66;  // minimum time per hop (s) for clear squash, parabolic float, and landing
  const MAX_HOP_DUR=0.80;  // maximum time per hop (s) to prevent zero-gravity float
  function goTo(k,instant){
    k=clamp(k,0,N-1);if(k===cur&&!instant&&tween===null)return;
    if(SLIDES[k]&&/poster/.test(SLIDES[k].id||''))document.dispatchEvent(new Event('deck:poster'));
    const prev=cur;cur=k;
    if(dflt(prev)!==dflt(k)||instant){manual=false;setNight(dflt(k),true);}
    if(location.hash!=='#'+(k+1)){try{history.replaceState(null,'',(location.pathname||'')+'#'+(k+1));}catch(e){}}
    updateCounter();
    updatePosterTabindex();
    const d=Math.abs(k-cam);
    if(instant||reduce||d===0){
      slots.forEach((s,i)=>{
        if(i===prev&&i!==k){s.classList.remove('on');s.classList.add('off');setTimeout(()=>s.classList.remove('off'),1000);}
        if(i===k){s.classList.add('on');s.removeAttribute('inert');s.removeAttribute('aria-hidden');}
        else{s.setAttribute('inert','');s.setAttribute('aria-hidden','true');}
      });
      cam=k;tween=null;applyTiles();schedulePrefetch(k);applyCamera(true);pandaTo(k,true);
    }
    else{
      // Switching transition time decreased by 30% (* 0.70) while the panda keeps its natural hop speed
      const baseCamDur=clamp(2.4+0.6*d,2.6,4.5);
      const camDur=baseCamDur*0.70;
      slots.forEach((s,i)=>{
        if(i===prev&&i!==k){s.classList.remove('on');s.classList.add('off');setTimeout(()=>s.classList.remove('off'),Math.max(1000,Math.round(camDur*1000)));}
        if(i!==k&&i!==prev){s.setAttribute('inert','');s.setAttribute('aria-hidden','true');}
      });
      tween={from:cam,to:k,t:0,dur:camDur,shown:false};
      applyTiles();schedulePrefetch(k);
      pandaTo(k,false);
    }
    say('Plate '+(k+1)+' of '+N+': '+(SLIDES[k].title||SLIDES[k].id));
  }
  function stepCamera(dt){
    if(!tween)return;
    const tw=tween;tw.t+=dt/tw.dur;const t=Math.min(1,tw.t),e=t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
    cam=tw.from+(tw.to-tw.from)*e;
    if(!tw.shown&&t>.5){
      tw.shown=true;
      slots[tw.to].classList.add('on');
      slots[tw.to].removeAttribute('inert');
      slots[tw.to].removeAttribute('aria-hidden');
    }
    if(t>=1){
      cam=tw.to;tween=null;applyTiles();
      slots.forEach((s,i)=>{if(i!==cur){s.setAttribute('inert','');s.setAttribute('aria-hidden','true');}});
      updatePosterTabindex();
    }
  }

  /* ---------- parallax (mouse) + camera, applied to every sheet ---------- */
  let px=0,py=0,tx=0,ty=0,lastInput=-1e9,drag=null,lastCam=-999,lastPx=-999,lastPy=-999;
  const hangEl=$('hangs');
  function applyCamera(force){
    if(!force&&Math.abs(cam-lastCam)<1e-3&&Math.abs(px-lastPx)<1e-3&&Math.abs(py-lastPy)<1e-3)return;
    lastCam=cam;lastPx=px;lastPy=py;
    for(const L of layerEls){L.el.style.transform=`translate3d(${q(-cam*W*L.f-px*L.df)}px,${q(-py*L.df*.55)}px,0)`;}
    content.style.transform=`translate3d(${q(-cam*W-px*f7)}px,${q(-py*f7*.55)}px,0)`;
    hangEl.style.transform=`translate3d(${q(-cam*W*.03-px*fh)}px,${q(-py*fh*.55)}px,0)`;
    fliesC.style.transform=`translate3d(${q(-px*fFlies)}px,${q(-py*fFlies*.55)}px,0)`;
    leavesEl.style.transform=`translate3d(${q(-px*fLeaves)}px,${q(-py*fLeaves*.55)}px,0)`;
    L9.style.transform=`translate3d(${q(-px*f9)}px,${q(-py*f9*.55)}px,0)`;
  }
  function stepParallax(dt,t){
    if(!reduce&&performance.now()-lastInput>3500&&!drag){tx=Math.sin(t*.19)*.42;ty=Math.sin(t*.13+1)*.18;}
    const k=1-Math.exp(-dt*(reduce?9:3.4));px+=(tx-px)*k;py+=(ty-py)*k;
  }

  /* ---------- the red panda ---------- */
  const panda={x:0,y:0,s:1.08,dir:1,sx:1,sy:1,hops:[],hop:null,el:$('pandaG')};
  const groundAt=u=>WORLD.groundAt(u);
  function renderPanda(lift){
    const g=panda.el;if(!g)return;
    const sx=panda.sx*panda.s*panda.dir,sy=panda.sy*panda.s;
    g.setAttribute('transform',`translate(${q(panda.x)} ${q(panda.y-lift)}) scale(${sx.toFixed(3)} ${sy.toFixed(3)})`);
    const bw=120*panda.s,bh=86*panda.s;
    pandaBtn.style.width=q(bw)+'px';pandaBtn.style.height=q(bh)+'px';
    pandaBtn.style.transform=`translate(${q(panda.x+M-bw/2)}px,${q(panda.y-lift+M-bh)}px)`;
  }
  function queueHops(x1){
    const x0=panda.hop?panda.hop.x1:panda.x;
    const dist=Math.abs(x1-x0);
    if(dist<6)return;
    const n=clamp(Math.round(dist/320),1,7);
    const hopDist=dist/n;
    const hopDur=clamp(Math.max(MIN_HOP_DUR,hopDist/MAX_HOP_SPEED),MIN_HOP_DUR,MAX_HOP_DUR);
    panda.hops=[];let curX=x0;
    for(let i=0;i<n;i++){
      const xx=x0+(x1-x0)*(i+1)/n;
      const stepDist=Math.abs(xx-curX);
      const hgt=clamp(stepDist*0.28,48,115);
      panda.hops.push({x0:curX,x1:xx,dur:hopDur,hgt});
      curX=xx;
    }
    panda.dir=x1>x0?1:-1;
  }
  function pandaTo(k,instant){
    const x1=ux(k,SLIDES[k].panda==null?.5:SLIDES[k].panda,1);
    const curX=panda.hop?panda.hop.x1:panda.x;
    if(instant||reduce||Math.abs(x1-curX)>W*2.5){
      panda.hops=[];panda.hop=null;panda.sx=panda.sy=1;panda.x=x1;panda.y=groundAt(x1);panda.dir=1;renderPanda(0);return;
    }
    queueHops(x1);
  }
  function hopLocal(){
    if(panda.hop||panda.hops.length)return;
    const base=cur*W,minX=base+W*.1,maxX=base+W*.9;let tx2;
    for(let k=0;k<12;k++){tx2=minX+Math.random()*(maxX-minX);if(Math.abs(tx2-panda.x)>W*.12&&Math.abs(tx2-panda.x)<W*.45)break;}
    queueHops(tx2);
    say('The red panda hops '+(panda.dir>0?'to the right':'to the left')+'.');
  }
  const puffs=[];
  (function makePuffs(){const g=$('puffs');if(!g)return;let s='';for(let i=0;i<7;i++)s+=`<path class="puff" d="${F.cut(F.circ(0,0,4,8),.3,2)}" style="opacity:0"/>`;g.innerHTML=s;})();
  function landPuff(){const els=$('puffs')?$('puffs').children:[];for(let i=0;i<els.length;i++){const a=Math.PI+(i/(els.length-1))*Math.PI;puffs[i]={el:els[i],x:panda.x,y:panda.y-2,vx:Math.cos(a)*rr(40,90)*panda.s,vy:Math.sin(a)*rr(30,70)*panda.s,r:Math.random()*6,t:0};}}
  function stepPanda(dt){
    if(!panda.hop&&panda.hops.length){panda.hop=Object.assign({t:0},panda.hops.shift());}
    if(panda.hop){
      const h=panda.hop;h.t+=dt/h.dur;const t=Math.min(1,h.t);let lift=0;
      if(t<.16){const u=t/.16;panda.sy=1-.2*Math.sin(u*Math.PI/2);panda.sx=1+.12*Math.sin(u*Math.PI/2);}
      else if(t<.86){const u=(t-.16)/.7,e=u<.5?2*u*u:1-Math.pow(-2*u+2,2)/2;panda.x=h.x0+(h.x1-h.x0)*e;panda.y=groundAt(panda.x);lift=Math.sin(u*Math.PI)*h.hgt;panda.sy=1+.14*Math.cos(u*Math.PI);panda.sx=1-.08*Math.cos(u*Math.PI);}
      else{const u=(t-.86)/.14;if(!h.landed){h.landed=true;panda.x=h.x1;panda.y=groundAt(panda.x);if(!panda.hops.length)landPuff();}panda.sy=1-.18*Math.sin(u*Math.PI);panda.sx=1+.1*Math.sin(u*Math.PI);}
      renderPanda(lift);
      if(t>=1){
        panda.hop=null;panda.sx=panda.sy=1;renderPanda(0);
        if(!panda.hops.length&&!tween){applyTiles();}
      }
    }
    for(const p of puffs){if(!p||p.t>=1)continue;p.t+=dt*1.8;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=160*dt;p.r+=dt*8;
      p.el.setAttribute('transform',`translate(${q(p.x)} ${q(p.y)}) rotate(${q(p.r*40)}) scale(${(panda.s*1.4).toFixed(2)})`);p.el.style.opacity=(1-p.t).toFixed(2);}
  }

  /* ---------- paper leaves (viewport) ---------- */
  const leafShapes=['M0 -9C5 -6 6 1 0 9C-6 1 -5 -6 0 -9Z','M0 -9L2.5 -4L6.5 -5L4.5 0L7 3L2 3.5L0 9L-2 3.5L-7 3L-4.5 0L-6.5 -5L-2.5 -4Z','M0 -9C3 -7 4.5 -3 3.5 0C5 2 4 6 0 9C-4 6 -5 2 -3.5 0C-4.5 -3 -3 -7 0 -9Z'];
  const leafCls=['lf-a','lf-b','lf-c','lf-a','lf-b'];const leaves=[];
  function makeLeaves(){
    const n=perf.lite?10:16;let html='';
    for(let i=0;i<n;i++){html+=`<div class="leaf"><svg viewBox="-10 -10 20 20" width="20" height="20"><path class="${leafCls[i%5]}" d="${leafShapes[i%3]}"/><path class="lf-v" d="M0 -7V8"/></svg></div>`;}
    leavesEl.innerHTML=html;
    Array.from(leavesEl.children).forEach((el,i)=>leaves.push({el,on:false,x:0,y:0,vx:0,vy:0,rot:0,vr:0,ph:Math.random()*6,sz:1,ambient:i<6}));
    leaves.forEach(l=>{if(l.ambient)spawnLeaf(l,Math.random()*W,Math.random()*H*.9);else l.el.style.opacity='0';});
  }
  function spawnLeaf(l,x,y,burst){l.on=true;l.x=x;l.y=y;l.vx=burst?rr(-80,80):rr(8,26);l.vy=burst?rr(-70,-20):rr(18,34);l.rot=Math.random()*360;l.vr=rr(-90,90);l.sz=rr(.8,1.5)*clamp(U/9,.7,1.4);l.el.style.opacity='1';}
  function stepLeaves(dt,t){
    for(const l of leaves){if(!l.on)continue;const slow=reduce?.35:1;
      l.vy+=(30-l.vy)*dt*1.4;l.vx+=(14-l.vx)*dt*.8;l.x+=(l.vx+Math.sin(t*1.3+l.ph)*34)*dt*slow;l.y+=l.vy*dt*slow;l.rot+=l.vr*dt*slow;
      const flip=Math.sin(t*2.1+l.ph)*62;
      l.el.style.transform=`translate3d(${q(l.x)}px,${q(l.y)}px,0) rotate(${q(l.rot)}deg) rotateY(${q(flip)}deg) scale(${l.sz.toFixed(2)})`;
      if(l.y>H+30||l.x>W+40){if(l.ambient)spawnLeaf(l,rr(-.1,.9)*W,-30);else{l.on=false;l.el.style.opacity='0';}}}
  }
  function leafBurst(cx,cy){let n=0;for(const l of leaves){if(!l.on&&!l.ambient){spawnLeaf(l,cx,cy,true);if(++n>=4)break;}}}

  /* ---------- fireflies (and day-time pollen) ---------- */
  const fx=fliesC.getContext('2d');let dpr=1,flies=[],nightAmt=0,sprite=null;
  // The glow layer is drawn at half resolution: fireflies and pollen are soft
  // round lights, so upscaling 2x is invisible — and it is 4x less canvas to
  // clear and upload on every frame, which is exactly what low-end GPUs hate.
  const FLY_DPR=.5;
  function sizeFlies(){
    dpr=FLY_DPR;const cw=Math.round((W+2*M)*dpr),ch=Math.round((H+2*M)*dpr);
    fliesC.width=cw;fliesC.height=ch;fliesC.style.width=(W+2*M)+'px';fliesC.style.height=(H+2*M)+'px';
    flies=[];const nf=perf.lite?22:38;
    for(let i=0;i<nf;i++)flies.push({x:Math.random()*W,y:H*(.45+Math.random()*.5),a:Math.random()*6.28,sp:rr(12,26),ph:Math.random()*6.28,bl:rr(.6,1.4),z:rr(.6,1.2)});
    sprite=document.createElement('canvas');sprite.width=sprite.height=64;const g=sprite.getContext('2d'),gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,250,200,1)');gr.addColorStop(.14,'rgba(246,236,130,.95)');gr.addColorStop(.4,'rgba(214,230,110,.28)');gr.addColorStop(1,'rgba(200,220,100,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);
  }
  let ptr={x:-9999,y:-9999,t:0};
  function stepFlies(dt,t){
    const na=nightAmt;
    if(na<.02&&!flies.length)return;
    fx.setTransform(dpr,0,0,dpr,M*dpr,M*dpr);fx.clearRect(-M,-M,W+2*M,H+2*M);
    for(const f of flies){
      f.a+=(Math.sin(t*.7+f.ph)*1.6)*dt;let vx=Math.cos(f.a)*f.sp,vy=Math.sin(f.a)*f.sp*.6;
      if(na>.5&&performance.now()-ptr.t<2500){const dx=ptr.x-f.x,dy=ptr.y-f.y,d=Math.hypot(dx,dy);if(d<W*.3&&d>20){vx+=dx/d*22;vy+=dy/d*22;}}
      const sp=reduce?.4:1;f.x+=vx*dt*sp;f.y+=vy*dt*sp;
      if(f.x<-20)f.x=W+20;if(f.x>W+20)f.x=-20;if(f.y<H*.42)f.a=Math.PI/2;if(f.y>H*.97)f.a=-Math.PI/2;
      if(na>.02){const b=Math.max(0,Math.sin(t*f.bl*2+f.ph))*.8+.2,s=(10+b*12)*f.z*clamp(U/10,.7,1.3);fx.globalAlpha=na*b;fx.drawImage(sprite,f.x-s,f.y-s,s*2,s*2);}
    }
    if(na<.98){
      fx.globalAlpha=(1-na)*.55;fx.fillStyle='#fff8e6';fx.beginPath();
      for(const f of flies){fx.moveTo(f.x+1.3*f.z,f.y);fx.arc(f.x,f.y,1.3*f.z,0,6.283);}
      fx.fill();
    }
    fx.globalAlpha=1;
  }

  /* ---------- hanging tags: damped pendulums ---------- */
  function stepTags(dt,t){
    for(const tg of physTags){
      if(!tg.el.closest('.slot.on'))continue;
      const rest=-2.2+(reduce?0:Math.sin(t*.6)*.6);tg.v+=(-(tg.a-rest)*26-tg.v*2.6)*dt;tg.a+=tg.v*dt;tg.a=clamp(tg.a,-16,16);tg.el.style.transform=`rotate(${tg.a.toFixed(2)}deg)`;
    }
  }
  const kickTags=v=>{for(const tg of physTags)tg.v+=v;};

  /* ---------- the frame loop ---------- */
  let raf=0,last=performance.now(),clock=0,flyAcc=0;
  function frame(now){
    raf=requestAnimationFrame(frame);
    const dt=Math.min(.05,(now-last)/1000);last=now;clock+=dt;
    noteFrame(dt);
    const target=body.classList.contains('night')?1:0;nightAmt+=(target-nightAmt)*(1-Math.exp(-dt*1.6));
    stepCamera(dt);
    if(tween&&prefetchQ.length){drainPrefetch(1);lastTileCam=-999;}
    if(Math.abs(cam-lastTileCam)>0.035){lastTileCam=cam;applyTiles();}
    stepParallax(dt,clock);applyCamera();stepTags(dt,clock);stepLeaves(dt,clock);stepPanda(dt);
    // the glow layer runs at 30fps in lite mode (motion is identical, it is just
    // sampled less often; the *cost* is what halves)
    flyAcc+=dt;
    if(!perf.lite||flyAcc>=1/30){stepFlies(flyAcc,clock);flyAcc=0;}
  }
  function start(){if(!raf){last=performance.now();raf=requestAnimationFrame(frame);}}
  function stop(){cancelAnimationFrame(raf);raf=0;}
  document.addEventListener('visibilitychange',()=>document.hidden?stop():start());

  /* ---------- input ---------- */
  const toStage=e=>{const r=vpRect||vp.getBoundingClientRect(),sc=vpSc||r.width/W;return {x:(e.clientX-r.left)/sc,y:(e.clientY-r.top)/sc};};
  let lastPX=null,lastPT=0,swipe=null;
  stage.addEventListener('pointermove',e=>{
    const now=performance.now();
    if(e.pointerType==='mouse'&&!drag){tx=clamp((e.clientX/innerWidth-.5)*2,-1,1);ty=clamp((e.clientY/innerHeight-.5)*2,-1,1);}
    if(lastPX!==null){const v=(e.clientX-lastPX)/Math.max(8,now-lastPT);kickTags(-v*9);}
    lastPX=e.clientX;lastPT=now;lastInput=now;
    const p=toStage(e);ptr.x=p.x+px*fFlies;ptr.y=p.y+py*fFlies*.55;ptr.t=now;
  });
  stage.addEventListener('pointerdown',e=>{lastInput=performance.now();swipe={x:e.clientX,y:e.clientY,t:performance.now(),type:e.pointerType};});
  stage.addEventListener('pointerup',e=>{
    if(!swipe)return;const dx=e.clientX-swipe.x,dy=e.clientY-swipe.y,dtm=performance.now()-swipe.t;swipe=null;
    if(Math.abs(dx)>70&&Math.abs(dx)>Math.abs(dy)*1.4&&dtm<900){goTo(cur+(dx<0?1:-1));hideHint();}
  });
  stage.addEventListener('pointerleave',()=>{lastPX=null;swipe=null;});
  stage.addEventListener('click',e=>{
    if(e.target.closest('button,.ph,a'))return;
    const p=toStage(e);leafBurst(p.x+px*fLeaves,p.y+py*fLeaves*.55);kickTags((Math.random()-.5)*30);hideHint();
  });
  pandaBtn.addEventListener('click',e=>{e.stopPropagation();hopLocal();hideHint();});

  const toggle=$('toggle'),toggleLabel=$('toggleLabel');
  function setNight(on,auto){
    if(on)buildPins();                       // the stars are drawn on first need
    body.classList.toggle('night',on);toggle.setAttribute('aria-pressed',String(on));toggleLabel.textContent=on?'Night':'Day';
    const meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.setAttribute('content',on?'#161a45':'#f3e8d2');
    if(!auto){manual=true;say(on?'Night falls on the diorama: windows light up and fireflies come out.':'Morning returns.');}
  }
  toggle.addEventListener('click',()=>{setNight(!body.classList.contains('night'));kickTags(18);});
  $('prev').addEventListener('click',()=>{goTo(cur-1);hideHint();});
  $('next').addEventListener('click',()=>{goTo(cur+1);hideHint();});
  $('full').addEventListener('click',()=>{const d=document;if(d.fullscreenElement)d.exitFullscreen&&d.exitFullscreen();else d.documentElement.requestFullscreen&&d.documentElement.requestFullscreen();});

  addEventListener('keydown',e=>{
    if(e.target.closest&&e.target.closest('button,input')&&(e.key===' '||e.key==='Enter'))return;
    const k=e.key;lastInput=performance.now();
    if(k==='ArrowRight'||k==='PageDown'||k===' '||k==='Enter')goTo(cur+1);
    else if(k==='ArrowLeft'||k==='PageUp'||k==='Backspace')goTo(cur-1);
    else if(k==='Home')goTo(0);else if(k==='End')goTo(N-1);
    else if(k==='n'||k==='N'){setNight(!body.classList.contains('night'));kickTags(18);}
    else if(k==='f'||k==='F'){$('full').click();}
    else if(k==='p'||k==='P'){hopLocal();}
    else if(k==='ArrowUp'){ty=clamp(ty-.25,-1,1);}else if(k==='ArrowDown'){ty=clamp(ty+.25,-1,1);}
    else return;
    e.preventDefault();hideHint();
  });
  addEventListener('hashchange',()=>{const k=hashK();if(k!==cur)goTo(k);});

  const hint=$('hint');let hintTimer=0;
  function hideHint(){clearTimeout(hintTimer);hintTimer=setTimeout(()=>hint.classList.add('gone'),2600);}
  if(matchMedia('(hover: none)').matches)$('hintText').innerHTML='Swipe to walk through the plates · <b>tap the red panda</b> · tap for leaves';

  /* ---------- go ---------- */
  makeLeaves();sizeFlies();
  idle(()=>buildPins());                       // stars only matter at night
  schedulePrefetch();                           // draw the neighbours while idle
  const k0=hashK();cur=k0;cam=k0;applyTiles();
  slots.forEach((s,i)=>{if(i===k0){s.removeAttribute('inert');s.removeAttribute('aria-hidden');}else{s.setAttribute('inert','');s.setAttribute('aria-hidden','true');}});
  updatePosterTabindex();
  if(dflt(k0)){buildPins();body.classList.add('night');nightAmt=1;toggle.setAttribute('aria-pressed','true');toggleLabel.textContent='Night';}
  updateCounter();pandaTo(k0,true);applyCamera();
  setTimeout(()=>slots[k0].classList.add('on'),reduce?0:650);
  if(location.hash!=='#'+(k0+1)){try{history.replaceState(null,'',(location.pathname||'')+'#'+(k0+1));}catch(e){}}
  start();
  window.DECK={goTo,setNight,get cur(){return cur;},get cam(){return cam;},get lite(){return perf.lite;},
    stats(){let total=0,mounted=0,drawn=0;for(const L of layerEls)for(const t of L.tiles){total++;if(t.on)mounted++;if(t.inner)drawn++;}
      return {tiles:total,mounted,drawn,elements:document.getElementsByTagName('*').length};},hop:hopLocal,setCam(x){tween=null;cam=x;applyTiles();applyCamera();}};
})();
