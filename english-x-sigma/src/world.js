/* ======================================================================
   WORLD — nine sheets of paper, each a long continuous strip.  Sheet i
   scrolls at LAYERS[i].f × the camera speed, so a slide change is a real
   camera pan through a single diorama: there are no seams to hide.
   Biomes: forest (plate I) → Goa (II–VIII) → Sikkim (IX–XIV) → forest at
   night (XV–XVIII).  Transitions between biomes are ramped so far sheets
   change slowly and the foreground changes exactly at a slide boundary.

   Each sheet is generated one W-wide tile at a time.  A tile is a pure
   function of (seed, sheet, index), so the deck can build only the tiles
   that are actually on screen — the whole 42,000px strip is never parsed
   on a phone.
   ====================================================================== */
const WORLD = (() => {
  'use strict';
  const F = PAPER;
  const W = 1920, H = 1080, M = 80;
  const N = SLIDES.length;
  const U = Math.sqrt(W*H)/100;                  // the reference unit (14.4px)
  const LAYERS = {
    L1:{f:.12,sh:3,depth:1}, L2:{f:.22,sh:3,depth:2}, L3:{f:.34,sh:4,depth:3}, L4:{f:.48,sh:4,depth:4},
    L5:{f:.64,sh:5,depth:5}, L6:{f:1.0,sh:6,depth:6}, L7:{f:1.0,sh:6,depth:7}, L8:{f:1.22,sh:7,depth:8},
  };
  const widthOf = f => W + (N-1)*W*f;
  const ux = (k,a,f) => a*W + k*W*f;             // layer x for slide k at screen fraction a
  const { rr, q, clamp, cut, hole, poly, circ, ell, rect, wave, ridge, pine, blade, P, G } = F;
  const R = () => F.R();

  let SEED = 1847;
  const seedLayer = n => { F.setSeed((SEED ^ Math.imul(n, 0x9e3779b9)) >>> 0); };
  const seedTile = (layer,j) => {
    let h = (SEED ^ Math.imul(layer, 0x9e3779b9) ^ Math.imul(j+1, 0x85ebca6b)) >>> 0;
    h ^= h >>> 16; h = Math.imul(h, 0x7feb352d);
    h ^= h >>> 15; h = Math.imul(h, 0x846ca68b);
    h ^= h >>> 16; F.setSeed(h >>> 0);
  };
  // a layer is an ordered list of lazily generated tiles
  const makeLayer = (f,fn) => ({
    n: Math.ceil((widthOf(f)+2*M)/W)+1,
    make(j){ const u0=j*W-M; return fn(j,u0,u0+W); },
  });
  // slide indices whose W-wide band can reach this tile
  const slidesNear = (u0,u1,f,pad=W) => {
    const lo = Math.max(0, Math.floor((u0-pad)/(W*f))-1);
    const hi = Math.min(N-1, Math.ceil((u1+pad)/(W*f))+1);
    return [lo,hi];
  };

  /* ---------- biomes ---------- */
  function edge(u,kb,f){const c=kb*W*f+W*(f>=1?1.15:.95),hw=W*(f>=1?.15:.18);return F.smooth((u-c+hw)/(2*hw));}
  function biome(u,f){const g1=edge(u,0,f),g2=edge(u,7,f),g3=edge(u,13,f);return {goa:g1-g2,sikkim:g2-g3,forest:1-g1+g3};}
  function pick(u,f){const b=biome(u,f),r=R();return r<b.goa?'goa':(r<b.goa+b.sikkim?'sikkim':'forest');}

  /* ---------- scene bookkeeping ---------- */
  function heroes(layer){
    const out=[];const f=LAYERS[layer].f;
    SLIDES.forEach((sl,k)=>{const list=(sl.scene||{})[layer]||[];for(const h of list)out.push(Object.assign({k,u:ux(k,h.a,f)},h));});
    return out;
  }
  const winGlow=(x,y,r)=>`<circle class="winglow" cx="${q(x)}" cy="${q(y)}" r="${q(r)}" fill="url(#winGlowGrad)"/>`;
  const jitter=(x,j)=>{if(j<=0)return 0;const h=Math.sin(x*127.1+311.7)*43758.5453123;return((h-Math.floor(h))-.5)*2*j;};
  function ridgeChunk(fn,bottom,x0,x1,step=8,j=.9,overlap=2){
    const p=[];const right=x1+overlap;
    for(let x=x0;x<=right;x+=step)p.push([x,fn(x)+jitter(x,j)]);
    if(p[p.length-1][0]<right)p.push([right,fn(right)+jitter(right,j)]);
    p.push([right,bottom],[x0,bottom]);
    return poly(p);
  }
  function riverChunk(yc,hw,x0,x1,step=10,overlap=2){
    const T=[],B=[];const right=x1+overlap;
    for(let u=x0;u<=right;u+=step){const jit=jitter(u*1.5,.8);T.push([u,yc(u)-hw(u)+jit]);B.push([u,yc(u)+hw(u)+jit]);}
    if(T[T.length-1][0]<right){const jit=jitter(right*1.5,.8);T.push([right,yc(right)-hw(right)+jit]);B.push([right,yc(right)+hw(right)+jit]);}
    return poly(T.concat(B.reverse()));
  }

  /* ---------- sheet 1 — far hills, rising into the Himalaya ---------- */
  function buildL1(){
    seedLayer(1);
    const f=LAYERS.L1.f;
    const far=wave(H*.395,[H*.034,H*.016,H*.007],[W*1.15,W*.43,W*.16]);
    const env=u=>F.smooth((u-1.15*W)/(.3*W))*(1-F.smooth((u-2.5*W)/(.4*W)));
    const peaks=[];let u=1.1*W;
    while(u<2.95*W){const w=W*rr(.05,.11),h=H*rr(.1,.27);peaks.push({c:u+w*.5,w,h});u+=w*rr(.9,1.4);}
    peaks.push({c:1.78*W,w:W*.13,h:H*.33});peaks.push({c:1.7*W,w:W*.07,h:H*.24});peaks.push({c:1.87*W,w:W*.08,h:H*.26});
    const prof=u=>{let y=0;for(const p of peaks){const d=Math.abs(u-p.c);if(d<p.w)y=Math.max(y,p.h*(1-d/p.w));}return y;};
    const fn=u=>far(u)-env(u)*prof(u);
    const snowy=[];
    for(const p of peaks){
      const e=env(p.c);if(e<.25||p.c<1.5*W)continue;
      snowy.push({p,e,tile:Math.floor((p.c+M)/W)});
    }
    return makeLayer(f,(j,u0,u1)=>{
      seedTile(1,j);
      const d1=ridgeChunk(fn,H+M,u0,u1,8,.9,2);
      const g1=ridgeChunk(fn,H+M,u0,u1,8,.9,0);
      let sn='';
      for(const {p,e,tile} of snowy){
        if(tile!==j)continue;
        const top=[],bot=[];const a=p.c-p.w*.42,b=p.c+p.w*.42,n=14;
        for(let i=0;i<=n;i++){const x=a+(b-a)*i/n;top.push([x,fn(x)+(R()-.5)*1.4]);}
        for(let i=n;i>=0;i--){const x=a+(b-a)*i/n,t=1-Math.abs((x-p.c)/(p.w*.42));bot.push([x,fn(x)+p.h*e*(.14+.24*t)+(i%2?6:-4)+(R()-.5)*4]);}
        sn+=poly(top.concat(bot));
      }
      return `<path class="c-far" d="${d1}"/><path class="c-snow" d="${sn}"/><path class="grain" d="${g1}"/>`;
    });
  }

  /* ---------- sheet 2 — rolling hill with tiny trees and far buildings ---------- */
  function buildL2(){
    seedLayer(2);
    const f=LAYERS.L2.f;
    const hill=wave(H*.47,[H*.036,H*.014,H*.006],[W*.9,W*.34,W*.13]);
    const phs=R()*6;
    const hs=heroes('L2');
    return makeLayer(f,(j,u0,u1)=>{
      seedTile(2,j);
      const t={trees:'',roofs:'',wins:'',glows:'',bld:'',cuts:''};
      for(let x=u0;x<u1;x+=rr(5,15)){
        if(Math.sin(x/W*8.5+phs)+Math.sin(x/W*21+phs*2)*.5>.35){
          const h=rr(2.1,4.2)*U,b=pick(x,f);
          if(b==='goa'){if(R()<.7)t.trees+=F.palm(x,hill(x)+3,h*1.1,rr(-.3,.3)*h,5);else t.trees+=F.roundTree(x,hill(x)+3,h*.8,h*.9);}
          else t.trees+=pine(x,hill(x)+3,h,h*.55);
        }
      }
      for(const h of hs){
        if(h.u<u0||h.u>=u1)continue;
        const cx=h.u;
        if(h.fig==='cottage'){
          const s=Math.max(12,U*2.3),by=hill(cx)+s*.25;
          t.cuts+=cut([[cx-s*.52,by],[cx-s*.52,by-s*.62],[cx+s*.52,by-s*.62],[cx+s*.52,by]],.4,5);
          t.cuts+=cut([[cx+s*.2,by-s*.8],[cx+s*.2,by-s*1.12],[cx+s*.36,by-s*1.12],[cx+s*.36,by-s*.7]],.3,4);
          t.roofs+=cut([[cx-s*.66,by-s*.54],[cx,by-s*1.08],[cx+s*.66,by-s*.54]],.4,4);
          for(const wx of [-.26,.18]){t.wins+=poly([[cx+wx*s,by-s*.42],[cx+(wx+.15)*s,by-s*.42],[cx+(wx+.15)*s,by-s*.24],[cx+wx*s,by-s*.24]]);}
          t.glows+=winGlow(cx,by-s*.35,s*1.5);
        }else{
          const s=h.s||.6,by=hill(cx)+4;
          const fig=F[h.fig]?F[h.fig](h.fig==='house'):'';
          t.bld+=G(cx,by,s,fig);
          t.glows+=winGlow(cx,by-30*s,70*s);
        }
      }
      const d2=ridgeChunk(hill,H+M,u0,u1,8,.9,2);
      const g2=ridgeChunk(hill,H+M,u0,u1,8,.9,0);
      let s=`<path class="c-hill" d="${d2}${t.cuts}"/><path class="grain" d="${g2}"/>`;
      if(t.trees)s+=`<path class="c-hill" d="${t.trees}"/><path class="grain" d="${t.trees}"/>`;
      if(t.roofs)s+=`<path class="c-roof" d="${t.roofs}"/><path class="grain" d="${t.roofs}"/>`;
      if(t.glows)s+=t.glows;
      if(t.wins)s+=`<path class="c-win" d="${t.wins}"/>`;
      if(t.bld)s+=t.bld;
      return s;
    });
  }

  /* ---------- sheet 3 — the sage tree ridge: pines, palms, broadleaf ---------- */
  function buildL3(){
    seedLayer(3);
    const f=LAYERS.L3.f;
    const rg=wave(H*.545,[H*.014,H*.007],[W*.7,W*.23]);
    return makeLayer(f,(j,u0,u1)=>{
      seedTile(3,j);
      let trees='';let x=u0;
      while(x<u1){
        const b=pick(x,f);let w;
        if(b==='goa'){
          if(R()<.62){const h=rr(4,8.2)*U;w=h*.9;trees+=F.palm(x,rg(x)+4,h,rr(-.25,.25)*h,rr(5,7)|0);x+=w*rr(.3,.55);}
          else{const h=rr(3,5.2)*U;w=h*1.15;trees+=F.roundTree(x,rg(x)+4,h,w);x+=w*rr(.5,.8);}
        }else{
          const h=rr(3.6,7.8)*U;w=h*rr(.46,.58);
          if(b==='sikkim'&&R()<.18)trees+=F.roundTree(x,rg(x)+4,h*.7,w*1.6);else trees+=pine(x,rg(x)+4,h,w);
          x+=w*rr(.42,.8);
        }
      }
      const d3=ridgeChunk(rg,H+M,u0,u1,8,.9,2);
      const g3=ridgeChunk(rg,H+M,u0,u1,8,.9,0);
      return `<path class="c-ridge" d="${d3}${trees}"/><path class="grain" d="${g3}${trees}"/>`;
    });
  }

  /* ---------- sheet 4 — meadow, the long river and its branches ---------- */
  let riverY=()=>H*.7;
  function buildL4(){
    seedLayer(4);
    const f=LAYERS.L4.f;
    const md=wave(H*.6,[H*.008,H*.004],[W*.8,W*.25]);
    const p1=R()*6,p2=R()*6,p3=R()*6;
    const yc=u=>H*.705+H*.026*Math.sin(u/(.9*W)*Math.PI*2+p1)+H*.011*Math.sin(u/(.31*W)*Math.PI*2+p2);
    const hw=u=>H*.011+H*.036*biome(u,f).goa+H*.004*Math.sin(u/(.5*W)*Math.PI*2+p3);
    riverY=yc;
    const hs=heroes('L4');
    return makeLayer(f,(j,u0,u1)=>{
      seedTile(4,j);
      const t={dr:'',rip:'',gl:'',bld:''};
      for(let k=0;k<N;k++){
        const uc=ux(k,.52,f);
        if(uc<u0||uc>=u1)continue;
        const yTop=yc(uc),yBot=H*.86,n=40,amp=W*.12,ph=R()*.7-.2,cl=[],Lb=[],Rb=[];
        for(let i=0;i<=n;i++){
          const tt=i/n,y=yTop+(yBot-yTop)*Math.pow(tt,1.3);
          const x=uc+amp*Math.sin(tt*Math.PI*1.9+ph)*Math.pow(tt,.65)+W*.03*Math.sin(tt*9+ph);
          const w=W*.012+W*.25*Math.pow(tt,1.75);
          cl.push([x,y,w]);Lb.push([x-w/2+(R()-.5)*1.4,y]);Rb.push([x+w/2+(R()-.5)*1.4,y]);
        }
        Lb.push([cl[n][0]-cl[n][2]/2,H+M],[cl[n][0]+cl[n][2]/2,H+M]);
        t.dr+=poly(Lb.concat(Rb.reverse()));
        for(let i=0;i<22;i++){const kk=Math.floor(rr(.18,1)*n),[x,y,w]=cl[kk],cx=x+(R()-.5)*w*.55,len=w*rr(.12,.32),th=Math.max(1,w*.022);t.rip+=poly([[cx-len/2,y],[cx,y-th],[cx+len/2,y],[cx,y+th*.6]]);}
        for(let i=0;i<16;i++){const kk=Math.floor(rr(.1,.95)*n),[x,y,w]=cl[kk],cx=x+(R()-.5)*w*.35,len=Math.max(3,w*rr(.05,.14)),th=Math.max(.8,w*.012);t.gl+=`<path class="glint" style="animation-delay:${(R()*3).toFixed(2)}s" d="${poly([[cx-len/2,y],[cx,y-th],[cx+len/2,y],[cx,y+th]])}"/>`;}
      }
      // ripples on the long river across this tile
      for(let k=0;k<N;k++){
        for(let i=0;i<10;i++){
          const u=ux(k,R(),f);
          if(u<u0||u>=u1)continue;
          const y=yc(u)+(R()-.5)*hw(u)*1.2,len=rr(10,30),th=1.2;
          t.rip+=poly([[u-len/2,y],[u,y-th],[u+len/2,y],[u,y+th*.6]]);
        }
      }
      for(const h of hs){if(h.u>=u0&&h.u<u1){const s=h.s||1;t.bld+=G(h.u,yc(h.u)+hw(h.u)*.2,s,F.boat());}}
      const d4=ridgeChunk(md,H+M,u0,u1,8,.6,2);
      const g4=ridgeChunk(md,H+M,u0,u1,8,.6,0);
      const dr=riverChunk(yc,hw,u0,u1,10,2);
      let s=`<path class="c-meadow" d="${d4}"/><path class="c-river" d="${dr}${t.dr}"/><path class="grain" d="${g4}"/>`;
      if(t.rip)s+=`<path class="c-ripple" d="${t.rip}"/>`;
      if(t.gl)s+=t.gl;
      if(t.bld)s+=t.bld;
      return s;
    });
  }

  /* ---------- sheet 5 — moss banks with an opening on every plate ---------- */
  let bank5=()=>H;
  function buildL5(){
    seedLayer(5);
    const f=LAYERS.L5.f,y5=H*.675;
    const w5=wave(0,[H*.012,H*.006],[W*.5,W*.17]);
    const centers=[];for(let k=0;k<=N;k++)centers.push(ux(k,.5,f));
    const near=u=>{let d=1e9;for(const c of centers)d=Math.min(d,Math.abs(u-c));return d;};
    const yb=u=>{const d=near(u),s=clamp(1-(d-.09*W)/(.16*W),0,1);return y5+w5(u)+Math.pow(s,3)*(H+M-y5)*1.02;};
    bank5=yb;
    const hs=heroes('L5');
    return makeLayer(f,(j,u0,u1)=>{
      seedTile(5,j);
      let trees='',svg='',glows='';
      for(let x=u0;x<u1;){
        const y=yb(x);const d=near(x),fromEdge=clamp(1-(d-.1*W)/(.25*W),0,1);
        const b=pick(x,f);let w;
        if(y<H*.95){
          if(b==='goa'){const h=rr(H*.16,H*.3)*(1-fromEdge*.45);w=Math.min(h*.9,W*.14);if(R()<.7)trees+=F.palm(x,y+5,h,rr(-.3,.3)*h*.6,rr(5,8)|0);else trees+=F.roundTree(x,y+5,h*.7,w);x+=w*rr(.28,.5);}
          else{const h=rr(H*.2,H*.36)*(1-fromEdge*.5);w=Math.min(h*.44,W*.14);trees+=pine(x,y+5,h,w);x+=w*rr(.4,.7);}
        }else x+=rr(20,60);
      }
      for(const h of hs){
        if(h.u<u0||h.u>=u1)continue;
        const u=h.u,y=yb(u)+6;
        if(h.fig==='flags'){const fl=F.flagLine(u-95,y-150,u+125,y-125,28,12,15);svg+=P('c-wood',poly([[u-97,y+2],[u-93,y+2],[u-94,y-150],[u-96,y-150]])+poly([[u+123,y+2],[u+127,y+2],[u+126,y-125],[u+124,y-125]]))+F.flagsSvg(fl);}
        else if(h.fig==='palmTall'){trees+=F.palm(u,y,H*.34,rr(-.2,.2)*H*.1,8);}
        else if(F[h.fig]){const s=h.s||1.6;svg+=G(u,y,s,F[h.fig](h.fig==='house'));if(h.fig!=='hut')glows+=winGlow(u,y-28*s,80*s);}
      }
      const d5=ridgeChunk(u=>Math.min(H+M,yb(u)),H+M,u0,u1,8,.8,2);
      const g5=ridgeChunk(u=>Math.min(H+M,yb(u)),H+M,u0,u1,8,.8,0);
      let s=`<path class="c-moss" d="${d5}${trees}"/>`;
      if(svg)s+=svg;
      if(glows)s+=glows;
      s+=`<path class="grain" d="${g5}"/>`;
      return s;
    });
  }

  /* ---------- sheet 6 — the tall teal giants that frame every plate ---------- */
  function buildL6(){
    seedLayer(6);
    const f=LAYERS.L6.f;const y6=H*.82;
    return {
      n:N,
      make(k){
        seedTile(6,k);
        const b=biome(ux(k,.5,f),f);const goa=b.goa>.5;
        let d6='';
        const giants=[[.015,1.02,1],[.098,.7,1],[.975,.96,-1],[.9,.64,-1]];
        for(const [gx,gh,side] of giants){
          const x=ux(k,gx,f),h=H*gh;
          if(goa){d6+=F.palm(x,y6+8,h*.86,side*h*.14,8);}
          else{const w=Math.min(h*.4,W*.2);d6+=pine(x,y6+8,h,w);}
        }
        return `<path class="c-teal" d="${d6}"/><path class="grain" d="${d6}"/>`;
      }
    };
  }

  /* ---------- sheet 7 — the ochre forest floor: props, figures, the red panda ---------- */
  let groundAt=()=>H*.785;
  function buildL7(){
    seedLayer(7);
    const f=LAYERS.L7.f;
    const g7w=wave(H*.785,[H*.011,H*.006],[W*.95,W*.3]);
    const hs=heroes('L7');
    const burrows=hs.filter(h=>h.fig==='burrow').map(h=>h.u);
    const burR=W*.1;
    const g7=u=>{let y=g7w(u);for(const b of burrows)y-=H*.04*Math.exp(-Math.pow((u-b)/burR,2));return y;};
    groundAt=g7;
    const occupied=(u,r)=>hs.some(h=>h.fig!=='burrow'&&h.fig!=='mushrooms'&&Math.abs(h.u-u)<r);
    return makeLayer(f,(j,u0,u1)=>{
      seedTile(7,j);
      const per={tuft:'',fall1:'',fall2:'',pebble:'',fern:'',rleaf:'',rbloom:'',rdot:'',shell:'',burrow:'',stems:'',caps:'',dots:'',bld:''};
      // tufts
      for(let x=u0;x<u1;x+=rr(18,60)){const y=g7(x)+2,n=3+Math.floor(R()*3);for(let k=0;k<n;k++)per.tuft+=blade(x+k*2.2,y+2,rr(.9,2.1)*U,rr(-.6,.6)*U,rr(2,3.4));}
      // per plate: ferns, pebbles, fallen leaves, low tufts, biome extras
      const [k0,k1]=slidesNear(u0,u1,f,W);
      for(let k=k0;k<=k1;k++){
        const b=biome(ux(k,.5,f),f);
        for(const [ff,sz,dr2] of [[.03,13,1],[.33,9,-1],[.47,7,1],[.72,10,1],[.96,12,-1]]){
          const x=ux(k,ff,f);if(x<u0||x>=u1)continue;
          if(occupied(x,150))continue;
          const scale=b.goa>.5?.8:1;
          per.fern+=F.fern(x,g7(x)+4,sz*U*scale,dr2)+F.fern(x+U*.8,g7(x)+4,sz*U*.7*scale,-dr2);
        }
        for(let i=0;i<9;i++){const x=ux(k,rr(.05,.95),f);if(x<u0||x>=u1)continue;const y=g7(x)+rr(.6,3.5)*U,r=rr(.3,.75)*U;per.pebble+=cut(circ(x,y,r,9).map(([a,bb])=>[a,y+(bb-y)*.6]),.25,3);}
        const nFall=Math.round(W/48);
        for(let i=0;i<nFall;i++){
          const x=ux(k,rr(-.02,1.02),f);if(x<u0||x>=u1)continue;
          const top=g7(x)+U*2.2,y=top+Math.pow(R(),1.3)*(H*.965-top),sz=rr(.45,.9)*U,a=R()*Math.PI,ca=Math.cos(a),sa=Math.sin(a);
          const lp=[[-1,0],[-.3,-.42],[.35,-.36],[1,0],[.3,.4],[-.35,.36]].map(([uu,v])=>[x+(uu*ca-v*sa*.8)*sz,y+(uu*sa+v*ca*.8)*sz*.62]);
          if(b.goa>.5&&R()<.35){per.shell+=cut(circ(x,y,sz*.55,8).map(([a2,b2])=>[a2,y+(b2-y)*.7]),.2,3);}
          else if(R()<.6)per.fall1+=cut(lp,.2,3);else per.fall2+=cut(lp,.2,3);
        }
        for(let i=0;i<Math.round(W/90);i++){const x=ux(k,R(),f);if(x<u0||x>=u1)continue;const y=g7(x)+rr(.24,.8)*(H*.95-g7(x));for(let kk=0;kk<3;kk++)per.tuft+=blade(x+kk*2.4,y,rr(.6,1.4)*U,rr(-.5,.5)*U,rr(2,3));}
        if(b.sikkim>.5){for(let i=0;i<3;i++){const x=ux(k,rr(.02,.98),f);if(x<u0||x>=u1)continue;if(occupied(x,170))continue;const rb=F.rhodoBush(x,g7(x)+rr(1,3)*U,rr(26,46));per.rleaf+=rb.leaf;per.rbloom+=rb.bloom;per.rdot+=rb.dot;}}
      }
      // heroes
      for(const h of hs){
        if(h.u<u0||h.u>=u1)continue;
        const x=h.u,y=g7(x);
        if(h.fig==='burrow'){
          const bw=Math.max(18,W*.042),bh=bw*.72,by0=g7(x)+bh*1.25;
          const arch=[[x-bw/2,by0]];for(let i=0;i<=12;i++){const a=Math.PI+i/12*Math.PI;arch.push([x+Math.cos(a)*bw/2,by0-bh*.35+Math.sin(a)*bh*.9]);}arch.push([x+bw/2,by0]);
          per.burrow+=cut(arch,.6,5);
        }else if(h.fig==='mushrooms'){
          const n=h.n||3;
          for(let k=0;k<n;k++){const mx=x+(k-(n-1)/2)*U*rr(1.4,2.6),s=U*rr(1.1,3.1)*(k===Math.floor(n/2)?1.25:1);const m=F.mushroom(mx,g7(mx)+s*.18,s);per.stems+=m.stem;per.caps+=m.cap;per.dots+=m.dots;}
        }else if(h.fig==='rhodo'){
          const rb=F.rhodoBush(x,y+6,54*(h.s||1));per.rleaf+=rb.leaf;per.rbloom+=rb.bloom;per.rdot+=rb.dot;
        }else if(h.fig==='boatBeach'){
          per.bld+=G(x,y+6,h.s||1.4,F.boat());
        }else if(F[h.fig]){
          per.bld+=G(x,y+3,h.s||2,F[h.fig]());
        }
      }
      const d7=ridgeChunk(g7,H+M,u0,u1,8,.7,2);
      const g7_grain=ridgeChunk(g7,H+M,u0,u1,8,.7,0);
      let s=`<path class="c-ground" d="${d7}"/>`;
      if(per.fall1)s+=`<path class="c-fall1" d="${per.fall1}"/>`;
      if(per.fall2)s+=`<path class="c-fall2" d="${per.fall2}"/>`;
      if(per.shell)s+=`<path class="c-pebble" d="${per.shell}"/>`;
      if(per.tuft)s+=`<path class="c-tuft" d="${per.tuft}"/>`;
      if(per.pebble)s+=`<path class="c-pebble" d="${per.pebble}"/>`;
      if(per.fern||per.rleaf)s+=`<path class="c-fern" d="${per.fern}${per.rleaf}"/>`;
      if(per.rbloom)s+=`<path class="c-bell" d="${per.rbloom}"/>`;
      if(per.rdot)s+=`<path class="c-bell2" d="${per.rdot}"/>`;
      if(per.burrow)s+=`<path class="c-burrow" d="${per.burrow}"/>`;
      if(per.stems)s+=`<path class="c-stem" d="${per.stems}"/>`;
      if(per.caps)s+=`<path class="c-cap" d="${per.caps}"/>`;
      s+=`<path class="grain" d="${g7_grain}${per.stems}${per.caps}"/>`;
      if(per.dots)s+=`<path class="c-dot glowdots" d="${per.dots}"/>`;
      if(per.bld)s+=per.bld;
      return s;
    });
  }

  /* ---------- sheet 8 — foreground grasses and tall flower spikes ---------- */
  function buildL8(){
    seedLayer(8);
    const f=LAYERS.L8.f;
    const g8=wave(H*.945,[H*.008,H*.005],[W*.6,W*.2]);
    const centers=[];for(let k=0;k<N;k++)centers.push(ux(k,.5,f));
    return makeLayer(f,(j,u0,u1)=>{
      seedTile(8,j);
      let fg='',fg2='',stalk='',bell='',inner='';
      for(let x=u0;x<u1;x+=rr(3.5,9)){
        let d=1e9;for(const c of centers)d=Math.min(d,Math.abs(x-c));
        const s=d/(W/2),hm=H*(.018+.23*Math.pow(clamp(s,0,1.2),2.4)),h=hm*rr(.35,1),lean=rr(-.38,.38)*h,wb=rr(4,9)*(U/11+.4);
        const b=blade(x,g8(x)+6,h,lean,wb);
        if(R()<.3)fg2+=b;else fg+=b;
      }
      const [k0,k1]=slidesNear(u0,u1,f,W);
      for(let k=k0;k<=k1;k++){
        const bm=biome(ux(k,.5,f),f);
        for(const [fx,fh,fl,sd] of [[.065,.4,.05,1],[.115,.29,-.03,1],[.925,.36,-.04,-1],[.885,.24,.03,-1]]){
          const x=ux(k,fx,f);if(x<u0||x>=u1)continue;
          const fn=bm.sikkim>.5?F.rhodoSpike:F.foxglove;
          const fgx=fn(x,g8(x)+4,H*fh,W*fl,sd);stalk+=fgx.stalk;bell+=fgx.bells;inner+=fgx.inner;
        }
      }
      const d8=ridgeChunk(g8,H+M,u0,u1,8,.8,2);
      const g8_grain=ridgeChunk(g8,H+M,u0,u1,8,.8,0);
      let s=`<path class="c-fg" d="${d8}${fg}${stalk}"/>`;
      if(fg2)s+=`<path class="c-fg2" d="${fg2}"/>`;
      if(bell)s+=`<path class="c-bell" d="${bell}"/>`;
      if(inner)s+=`<path class="c-bell2" d="${inner}"/>`;
      s+=`<path class="grain" d="${g8_grain}${fg}${fg2}${stalk}${bell}"/>`;
      return s;
    });
  }

  /* ---------- sheet 9 — the box: deckle-edged cream mat in a dark board frame ---------- */
  function buildFrame(){
    seedLayer(9);
    const e=Math.max(10,Math.min(W,H)*.024),rad=e*3;
    const outer=[[-M-4,-M-4],[W+M+4,-M-4],[W+M+4,H+M+4],[-M-4,H+M+4]];
    const rrect=(ins,wob)=>{const p=[],x0=ins,y0=ins,xx1=W-ins,y1=H-ins,r=rad;
      const seg=(ax,ay,bx,by)=>{const L=Math.hypot(bx-ax,by-ay),k=Math.max(1,Math.round(L/11));for(let t=0;t<k;t++){const u=t/k;p.push([ax+(bx-ax)*u+(R()-.5)*wob,ay+(by-ay)*u+(R()-.5)*wob]);}};
      const arc=(cx,cy,a0)=>{for(let i=0;i<6;i++){const a=a0+i/6*Math.PI/2;p.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r]);}};
      seg(x0+r,y0,xx1-r,y0);arc(xx1-r,y0+r,-Math.PI/2);seg(xx1,y0+r,xx1,y1-r);arc(xx1-r,y1-r,0);seg(xx1-r,y1,x0+r,y1);arc(x0+r,y1-r,Math.PI/2);seg(x0,y1-r,x0,y0+r);arc(x0+r,y0+r,Math.PI);
      return p;};
    const mat=cut(outer,0,4000)+hole(rrect(e,2.4),.5,6);
    const frame=cut(outer,0,4000)+hole(rrect(e*.55,1.2),.3,8);
    return `<path class="c-mat" d="${mat}"/><path class="c-frame" d="${frame}"/><path class="grain" d="${frame}"/>`;
  }

  function build(seed){
    SEED = (seed||1847)>>>0;
    F.setSeed(SEED);
    return {
      L1:buildL1(), L2:buildL2(), L3:buildL3(), L4:buildL4(),
      L5:buildL5(), L6:buildL6(), L7:buildL7(), L8:buildL8(), L9:buildFrame(),
    };
  }
  return {W,H,M,N,U,LAYERS,widthOf,ux,build,groundAt:u=>groundAt(u),biome};
})();
