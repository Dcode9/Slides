/* ======================================================================
   WORLD — nine sheets of paper, each a long continuous strip.  Sheet i
   scrolls at LAYERS[i].f × the camera speed, so a slide change is a real
   camera pan through a single diorama: there are no seams to hide.
   Biomes: forest (plate I) → Goa (II–VIII) → Sikkim (IX–XIV) → forest at
   night (XV–XVIII).  Transitions between biomes are ramped so far sheets
   change slowly and the foreground changes exactly at a slide boundary.
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
  function tileOpen(j){return `<g class="tile" data-j="${j}">`;}
  function tiled(f,fn){ // call fn(j,u0,u1) for consecutive W-wide tiles across the layer
    let s='';const n=Math.ceil((widthOf(f)+2*M)/W)+1;
    for(let j=0;j<n;j++){const u0=j*W-M,u1=u0+W;s+=tileOpen(j)+fn(j,u0,u1)+'</g>';}
    return s;
  }
  const winGlow=(x,y,r)=>`<circle class="winglow" cx="${q(x)}" cy="${q(y)}" r="${q(r)}" fill="url(#winGlowGrad)"/>`;

  /* ---------- sheet 1 — far hills, rising into the Himalaya ---------- */
  function buildL1(){
    const f=LAYERS.L1.f,x1=widthOf(f)+M;
    const far=wave(H*.395,[H*.034,H*.016,H*.007],[W*1.15,W*.43,W*.16]);
    const env=u=>F.smooth((u-1.15*W)/(.3*W))*(1-F.smooth((u-2.5*W)/(.4*W)));
    const peaks=[];let u=1.1*W;
    while(u<2.95*W){const w=W*rr(.05,.11),h=H*rr(.1,.27);peaks.push({c:u+w*.5,w,h});u+=w*rr(.9,1.4);}
    // the tallest peak: Khangchendzonga, centred on plate IX–X
    peaks.push({c:1.78*W,w:W*.13,h:H*.33});peaks.push({c:1.7*W,w:W*.07,h:H*.24});peaks.push({c:1.87*W,w:W*.08,h:H*.26});
    const prof=u=>{let y=0;for(const p of peaks){const d=Math.abs(u-p.c);if(d<p.w)y=Math.max(y,p.h*(1-d/p.w));}return y;};
    const fn=u=>far(u)-env(u)*prof(u);
    const d1=ridge(fn,H+M,-M,x1,8,.9);
    let snow='';
    for(const p of peaks){
      const e=env(p.c);if(e<.25||p.c<1.5*W)continue;
      const top=[],bot=[];const a=p.c-p.w*.42,b=p.c+p.w*.42,n=14;
      for(let i=0;i<=n;i++){const x=a+(b-a)*i/n;top.push([x,fn(x)+(R()-.5)*1.4]);}
      for(let i=n;i>=0;i--){const x=a+(b-a)*i/n,t=1-Math.abs((x-p.c)/(p.w*.42));bot.push([x,fn(x)+p.h*e*(.14+.24*t)+(i%2?6:-4)+(R()-.5)*4]);}
      snow+=poly(top.concat(bot));
    }
    return `<path class="c-far" d="${d1}"/><path class="c-snow" d="${snow}"/><path class="grain" d="${d1}"/>`;
  }

  /* ---------- sheet 2 — rolling hill with tiny trees and far buildings ---------- */
  function buildL2(){
    const f=LAYERS.L2.f,x1=widthOf(f)+M;
    const hill=wave(H*.47,[H*.036,H*.014,H*.006],[W*.9,W*.34,W*.13]);
    let d2=ridge(hill,H+M,-M,x1,9,.9);
    const phs=R()*6;
    const perTile={};
    const addPt=(x,key,val)=>{const j=Math.floor((x+M)/W);perTile[j]=perTile[j]||{trees:'',roofs:'',wins:'',glows:'',bld:''};perTile[j][key]+=val;};
    for(let x=-M;x<x1;x+=rr(5,15)){
      if(Math.sin(x/W*8.5+phs)+Math.sin(x/W*21+phs*2)*.5>.35){
        const h=rr(2.1,4.2)*U,b=pick(x,f);
        if(b==='goa'){if(R()<.7)addPt(x,'trees',F.palm(x,hill(x)+3,h*1.1,rr(-.3,.3)*h,5));else addPt(x,'trees',F.roundTree(x,hill(x)+3,h*.8,h*.9));}
        else addPt(x,'trees',pine(x,hill(x)+3,h,h*.55));
      }
    }
    for(const h of heroes('L2')){
      const cx=h.u;
      if(h.fig==='cottage'){
        const s=Math.max(12,U*2.3),by=hill(cx)+s*.25;
        d2+=cut([[cx-s*.52,by],[cx-s*.52,by-s*.62],[cx+s*.52,by-s*.62],[cx+s*.52,by]],.4,5);
        d2+=cut([[cx+s*.2,by-s*.8],[cx+s*.2,by-s*1.12],[cx+s*.36,by-s*1.12],[cx+s*.36,by-s*.7]],.3,4);
        addPt(cx,'roofs',cut([[cx-s*.66,by-s*.54],[cx,by-s*1.08],[cx+s*.66,by-s*.54]],.4,4));
        let wins='';
        for(const wx of [-.26,.18]){wins+=poly([[cx+wx*s,by-s*.42],[cx+(wx+.15)*s,by-s*.42],[cx+(wx+.15)*s,by-s*.24],[cx+wx*s,by-s*.24]]);}
        addPt(cx,'wins',wins);
        addPt(cx,'glows',winGlow(cx,by-s*.35,s*1.5));
      }else{
        const s=h.s||.6,by=hill(cx)+4;
        const fig=F[h.fig]?F[h.fig](h.fig==='house'):'';
        addPt(cx,'bld',G(cx,by,s,fig));
        addPt(cx,'glows',winGlow(cx,by-30*s,70*s));
      }
    }
    const tiles=tiled(f,(j)=>{
      const t=perTile[j];if(!t)return '';
      let s='';
      if(t.trees)s+=`<path class="c-hill" d="${t.trees}"/><path class="grain" d="${t.trees}"/>`;
      if(t.roofs)s+=`<path class="c-roof" d="${t.roofs}"/><path class="grain" d="${t.roofs}"/>`;
      if(t.glows)s+=t.glows;
      if(t.wins)s+=`<path class="c-win" d="${t.wins}"/>`;
      if(t.bld)s+=t.bld;
      return s;
    });
    return `<path class="c-hill" d="${d2}"/><path class="grain" d="${d2}"/>${tiles}`;
  }

  /* ---------- sheet 3 — the sage tree ridge: pines, palms, broadleaf ---------- */
  function buildL3(){
    const f=LAYERS.L3.f,x1=widthOf(f)+M;
    const rg=wave(H*.545,[H*.014,H*.007],[W*.7,W*.23]);
    const d3=ridge(rg,H+M,-M,x1,9,.9);
    let x=-M;const perTile={};
    while(x<x1){
      const b=pick(x,f);let w;
      if(b==='goa'){
        if(R()<.62){const h=rr(4,8.2)*U;w=h*.9;perTile[Math.floor((x+M)/W)]=(perTile[Math.floor((x+M)/W)]||'')+F.palm(x,rg(x)+4,h,rr(-.25,.25)*h,rr(5,7)|0);x+=w*rr(.3,.55);}
        else{const h=rr(3,5.2)*U;w=h*1.15;perTile[Math.floor((x+M)/W)]=(perTile[Math.floor((x+M)/W)]||'')+F.roundTree(x,rg(x)+4,h,w);x+=w*rr(.5,.8);}
      }else{
        const h=rr(3.6,7.8)*U;w=h*rr(.46,.58);
        let t;
        if(b==='sikkim'&&R()<.18){t=F.roundTree(x,rg(x)+4,h*.7,w*1.6);}else t=pine(x,rg(x)+4,h,w);
        perTile[Math.floor((x+M)/W)]=(perTile[Math.floor((x+M)/W)]||'')+t;x+=w*rr(.42,.8);
      }
    }
    const tiles=tiled(f,(j)=>`<path class="c-ridge" d="${perTile[j]||''}"/>`);
    return `<path class="c-ridge" d="${d3}"/>${tiles}<path class="grain" d="${d3}"/>`;
  }

  /* ---------- sheet 4 — meadow, the long river and its branches ---------- */
  let riverY=()=>H*.7;
  function buildL4(){
    const f=LAYERS.L4.f,x1=widthOf(f)+M;
    const md=wave(H*.6,[H*.008,H*.004],[W*.8,W*.25]);
    const d4=ridge(md,H+M,-M,x1,10,.6);
    const p1=R()*6,p2=R()*6,p3=R()*6;
    const yc=u=>H*.705+H*.026*Math.sin(u/(.9*W)*Math.PI*2+p1)+H*.011*Math.sin(u/(.31*W)*Math.PI*2+p2);
    const hw=u=>H*.011+H*.036*biome(u,f).goa+H*.004*Math.sin(u/(.5*W)*Math.PI*2+p3);
    riverY=yc;
    const T=[],B=[];
    for(let u=-M;u<=x1;u+=10){T.push([u,yc(u)-hw(u)+(R()-.5)*1.6]);B.push([u,yc(u)+hw(u)+(R()-.5)*1.6]);}
    let dr=poly(T.concat(B.reverse()));
    const perTile={};
    const addPt=(x,key,val)=>{const j=Math.floor((x+M)/W);perTile[j]=perTile[j]||{dr:'',rip:'',gl:'',bld:''};perTile[j][key]+=val;};
    // forward branches: one per plate, exactly like the reference river
    for(let k=0;k<N;k++){
      const uc=ux(k,.52,f),yTop=yc(uc),yBot=H*.86,n=40,amp=W*.12,ph=R()*.7-.2,cl=[],Lb=[],Rb=[];
      for(let i=0;i<=n;i++){
        const t=i/n,y=yTop+(yBot-yTop)*Math.pow(t,1.3);
        const x=uc+amp*Math.sin(t*Math.PI*1.9+ph)*Math.pow(t,.65)+W*.03*Math.sin(t*9+ph);
        const w=W*.012+W*.25*Math.pow(t,1.75);
        cl.push([x,y,w]);Lb.push([x-w/2+(R()-.5)*1.4,y]);Rb.push([x+w/2+(R()-.5)*1.4,y]);
      }
      Lb.push([cl[n][0]-cl[n][2]/2,H+M],[cl[n][0]+cl[n][2]/2,H+M]);
      addPt(uc,'dr',poly(Lb.concat(Rb.reverse())));
      for(let i=0;i<22;i++){const kk=Math.floor(rr(.18,1)*n),[x,y,w]=cl[kk],cx=x+(R()-.5)*w*.55,len=w*rr(.12,.32),th=Math.max(1,w*.022);addPt(cx,'rip',poly([[cx-len/2,y],[cx,y-th],[cx+len/2,y],[cx,y+th*.6]]));}
      for(let i=0;i<16;i++){const kk=Math.floor(rr(.1,.95)*n),[x,y,w]=cl[kk],cx=x+(R()-.5)*w*.35,len=Math.max(3,w*rr(.05,.14)),th=Math.max(.8,w*.012);addPt(cx,'gl',`<path class="glint" style="animation-delay:${(R()*3).toFixed(2)}s" d="${poly([[cx-len/2,y],[cx,y-th],[cx+len/2,y],[cx,y+th]])}"/>`);}
      // ripples on the long river across this plate
      for(let i=0;i<10;i++){const u=ux(k,R(),f),y=yc(u)+(R()-.5)*hw(u)*1.2,len=rr(10,30),th=1.2;addPt(u,'rip',poly([[u-len/2,y],[u,y-th],[u+len/2,y],[u,y+th*.6]]));}
    }
    for(const h of heroes('L4')){const s=h.s||1;addPt(h.u,'bld',G(h.u,yc(h.u)+hw(h.u)*.2,s,F.boat()));}
    const tiles=tiled(f,(j)=>{
      const t=perTile[j];if(!t)return '';
      let s='';
      if(t.dr)s+=`<path class="c-river" d="${t.dr}"/>`;
      if(t.rip)s+=`<path class="c-ripple" d="${t.rip}"/>`;
      if(t.gl)s+=t.gl;
      if(t.bld)s+=t.bld;
      return s;
    });
    return `<path class="c-meadow" d="${d4}"/><path class="c-river" d="${dr}"/><path class="grain" d="${d4}"/>${tiles}`;
  }

  /* ---------- sheet 5 — moss banks with an opening on every plate ---------- */
  let bank5=()=>H;
  function buildL5(){
    const f=LAYERS.L5.f,x1=widthOf(f)+M,y5=H*.675;
    const w5=wave(0,[H*.012,H*.006],[W*.5,W*.17]);
    const centers=[];for(let k=0;k<=N;k++)centers.push(ux(k,.5,f));
    const near=u=>{let d=1e9;for(const c of centers)d=Math.min(d,Math.abs(u-c));return d;};
    const yb=u=>{const d=near(u),s=clamp(1-(d-.09*W)/(.16*W),0,1);return y5+w5(u)+Math.pow(s,3)*(H+M-y5)*1.02;};
    bank5=yb;
    const pts=[];for(let u=-M;u<=x1;u+=9)pts.push([u,Math.min(H+M,yb(u))+(R()-.5)*1.6]);pts.push([x1,H+M],[-M,H+M]);
    const d5=poly(pts);
    const perTile={};const add=(x,t)=>{const j=Math.floor((x+M)/W);perTile[j]=(perTile[j]||'')+t;};
    let x=-M;
    while(x<x1){
      const y=yb(x);const d=near(x),fromEdge=clamp(1-(d-.1*W)/(.25*W),0,1);
      const b=pick(x,f);let w;
      if(y<H*.95){
        if(b==='goa'){const h=rr(H*.16,H*.3)*(1-fromEdge*.45);w=Math.min(h*.9,W*.14);if(R()<.7)add(x,F.palm(x,y+5,h,rr(-.3,.3)*h*.6,rr(5,8)|0));else add(x,F.roundTree(x,y+5,h*.7,w));x+=w*rr(.28,.5);}
        else{const h=rr(H*.2,H*.36)*(1-fromEdge*.5);w=Math.min(h*.44,W*.14);add(x,pine(x,y+5,h,w));x+=w*rr(.4,.7);}
      }else x+=rr(20,60);
    }
    // Sikkim: prayer-flag strings on the banks between the trees
    const heroTile={};
    for(const h of heroes('L5')){
      const u=h.u,y=yb(u)+6,j=Math.floor((u+M)/W);
      heroTile[j]=heroTile[j]||{svg:'',glows:''};
      if(h.fig==='flags'){const fl=F.flagLine(u-95,y-150,u+125,y-125,28,12,15);heroTile[j].svg+=P('c-wood',poly([[u-97,y+2],[u-93,y+2],[u-94,y-150],[u-96,y-150]])+poly([[u+123,y+2],[u+127,y+2],[u+126,y-125],[u+124,y-125]]))+F.flagsSvg(fl);}
      else if(h.fig==='palmTall'){add(u,F.palm(u,y,H*.34,rr(-.2,.2)*H*.1,8));}
      else if(F[h.fig]){const s=h.s||1.6;heroTile[j].svg+=G(u,y,s,F[h.fig](h.fig==='house'));if(h.fig!=='hut')heroTile[j].glows+=winGlow(u,y-28*s,80*s);}
    }
    const tiles=tiled(f,(j)=>{
      let s=`<path class="c-moss" d="${perTile[j]||''}"/>`;
      const ht=heroTile[j];
      if(ht){if(ht.svg)s+=ht.svg;if(ht.glows)s+=ht.glows;}
      return s;
    });
    return `<path class="c-moss" d="${d5}"/>${tiles}<path class="grain" d="${d5}"/>`;
  }

  /* ---------- sheet 6 — the tall teal giants that frame every plate ---------- */
  function buildL6(){
    const f=LAYERS.L6.f;const y6=H*.82;
    let tiles='';
    for(let k=0;k<N;k++){
      const b=biome(ux(k,.5,f),f);const goa=b.goa>.5;
      let d6='';
      const giants=[[.015,1.02,1],[.098,.7,1],[.975,.96,-1],[.9,.64,-1]];
      for(const [gx,gh,side] of giants){
        const x=ux(k,gx,f),h=H*gh;
        if(goa){d6+=F.palm(x,y6+8,h*.86,side*h*.14,8);}
        else{const w=Math.min(h*.4,W*.2);d6+=pine(x,y6+8,h,w);}
      }
      tiles+=tileOpen(k)+`<path class="c-teal" d="${d6}"/><path class="grain" d="${d6}"/>`+'</g>';
    }
    return tiles;
  }

  /* ---------- sheet 7 — the ochre forest floor: props, figures, the red panda ---------- */
  let groundAt=()=>H*.785;
  function buildL7(){
    const f=LAYERS.L7.f,x1=widthOf(f)+M;
    const g7w=wave(H*.785,[H*.011,H*.006],[W*.95,W*.3]);
    const burrows=heroes('L7').filter(h=>h.fig==='burrow').map(h=>h.u);
    const burR=W*.1;
    const g7=u=>{let y=g7w(u);for(const b of burrows)y-=H*.04*Math.exp(-Math.pow((u-b)/burR,2));return y;};
    groundAt=g7;
    const d7=ridge(g7,H+M,-M,x1,8,.7);
    const hs=heroes('L7');
    const occupied=(u,r)=>hs.some(h=>h.fig!=='burrow'&&h.fig!=='mushrooms'&&Math.abs(h.u-u)<r);
    let burrow='',stems='',caps='',dots='',bld='';
    const per={};const add=(x,key,t)=>{const j=Math.floor((x+M)/W);per[j]=per[j]||{tuft:'',fall1:'',fall2:'',pebble:'',fern:'',rleaf:'',rbloom:'',rdot:'',shell:''};per[j][key]+=t;};
    // tufts
    for(let x=-M;x<x1;x+=rr(18,60)){const y=g7(x)+2,n=3+Math.floor(R()*3);let t='';for(let k=0;k<n;k++)t+=blade(x+k*2.2,y+2,rr(.9,2.1)*U,rr(-.6,.6)*U,rr(2,3.4));add(x,'tuft',t);}
    // per plate: ferns, pebbles, fallen leaves, low tufts, biome extras
    for(let k=0;k<N;k++){
      const b=biome(ux(k,.5,f),f);
      for(const [ff,sz,dr2] of [[.03,13,1],[.33,9,-1],[.47,7,1],[.72,10,1],[.96,12,-1]]){
        const x=ux(k,ff,f);if(occupied(x,150))continue;
        const scale=b.goa>.5?.8:1;
        add(x,'fern',F.fern(x,g7(x)+4,sz*U*scale,dr2)+F.fern(x+U*.8,g7(x)+4,sz*U*.7*scale,-dr2));
      }
      for(let i=0;i<9;i++){const x=ux(k,rr(.05,.95),f),y=g7(x)+rr(.6,3.5)*U,r=rr(.3,.75)*U;add(x,'pebble',cut(circ(x,y,r,9).map(([a,bb])=>[a,y+(bb-y)*.6]),.25,3));}
      const nFall=Math.round(W/48);
      for(let i=0;i<nFall;i++){
        const x=ux(k,rr(-.02,1.02),f),top=g7(x)+U*2.2,y=top+Math.pow(R(),1.3)*(H*.965-top),sz=rr(.45,.9)*U,a=R()*Math.PI,ca=Math.cos(a),sa=Math.sin(a);
        const lp=[[-1,0],[-.3,-.42],[.35,-.36],[1,0],[.3,.4],[-.35,.36]].map(([uu,v])=>[x+(uu*ca-v*sa*.8)*sz,y+(uu*sa+v*ca*.8)*sz*.62]);
        if(b.goa>.5&&R()<.35){add(x,'shell',cut(circ(x,y,sz*.55,8).map(([a2,b2])=>[a2,y+(b2-y)*.7]),.2,3));}
        else if(R()<.6)add(x,'fall1',cut(lp,.2,3));else add(x,'fall2',cut(lp,.2,3));
      }
      for(let i=0;i<Math.round(W/90);i++){const x=ux(k,R(),f),y=g7(x)+rr(.24,.8)*(H*.95-g7(x));let t='';for(let kk=0;kk<3;kk++)t+=blade(x+kk*2.4,y,rr(.6,1.4)*U,rr(-.5,.5)*U,rr(2,3));add(x,'tuft',t);}
      if(b.sikkim>.5){for(let i=0;i<3;i++){const x=ux(k,rr(.02,.98),f);if(occupied(x,170))continue;const rb=F.rhodoBush(x,g7(x)+rr(1,3)*U,rr(26,46));add(x,'rleaf',rb.leaf);add(x,'rbloom',rb.bloom);add(x,'rdot',rb.dot);}}
    }
    // heroes
    for(const h of hs){
      const x=h.u,y=g7(x);
      if(h.fig==='burrow'){
        const bw=Math.max(18,W*.042),bh=bw*.72,by0=g7(x)+bh*1.25;
        const arch=[[x-bw/2,by0]];for(let i=0;i<=12;i++){const a=Math.PI+i/12*Math.PI;arch.push([x+Math.cos(a)*bw/2,by0-bh*.35+Math.sin(a)*bh*.9]);}arch.push([x+bw/2,by0]);
        burrow+=cut(arch,.6,5);
      }else if(h.fig==='mushrooms'){
        const n=h.n||3;
        for(let k=0;k<n;k++){const mx=x+(k-(n-1)/2)*U*rr(1.4,2.6),s=U*rr(1.1,3.1)*(k===Math.floor(n/2)?1.25:1);const m=F.mushroom(mx,g7(mx)+s*.18,s);stems+=m.stem;caps+=m.cap;dots+=m.dots;}
      }else if(h.fig==='rhodo'){
        const rb=F.rhodoBush(x,y+6,54*(h.s||1));add(x,'rleaf',rb.leaf);add(x,'rbloom',rb.bloom);add(x,'rdot',rb.dot);
      }else if(h.fig==='boatBeach'){
        bld+=G(x,y+6,h.s||1.4,F.boat());
      }else if(F[h.fig]){
        bld+=G(x,y+3,h.s||2,F[h.fig]());
      }
    }
    const tiles=tiled(f,(j)=>{const t=per[j];if(!t)return '';return `<path class="c-fall1" d="${t.fall1}"/><path class="c-fall2" d="${t.fall2}"/><path class="c-pebble" d="${t.shell}"/><path class="c-tuft" d="${t.tuft}"/><path class="c-pebble" d="${t.pebble}"/><path class="c-fern" d="${t.fern}${t.rleaf}"/><path class="c-bell" d="${t.rbloom}"/><path class="c-bell2" d="${t.rdot}"/>`;});
    return `<path class="c-ground" d="${d7}"/>${tiles}<path class="c-burrow" d="${burrow}"/><path class="c-stem" d="${stems}"/><path class="c-cap" d="${caps}"/><path class="grain" d="${d7}${stems}${caps}"/><path class="c-dot glowdots" d="${dots}"/>${bld}<g id="puffs"></g><g id="pandaG">${F.panda()}</g>`;
  }

  /* ---------- sheet 8 — foreground grasses and tall flower spikes ---------- */
  function buildL8(){
    const f=LAYERS.L8.f,x1=widthOf(f)+M;
    const g8=wave(H*.945,[H*.008,H*.005],[W*.6,W*.2]);
    const d8=ridge(g8,H+M,-M,x1,9,.8);
    const centers=[];for(let k=0;k<N;k++)centers.push(ux(k,.5,f));
    const per={};const add=(x,key,t)=>{const j=Math.floor((x+M)/W);per[j]=per[j]||{fg:'',fg2:'',stalk:'',bell:'',inner:''};per[j][key]+=t;};
    for(let x=-M;x<x1;x+=rr(3.5,9)){
      let d=1e9;for(const c of centers)d=Math.min(d,Math.abs(x-c));
      const s=d/(W/2),hm=H*(.018+.23*Math.pow(clamp(s,0,1.2),2.4)),h=hm*rr(.35,1),lean=rr(-.38,.38)*h,wb=rr(4,9)*(U/11+.4);
      const b=blade(x,g8(x)+6,h,lean,wb);
      if(R()<.3)add(x,'fg2',b);else add(x,'fg',b);
    }
    for(let k=0;k<N;k++){
      const bm=biome(ux(k,.5,f),f);
      for(const [fx,fh,fl,sd] of [[.065,.4,.05,1],[.115,.29,-.03,1],[.925,.36,-.04,-1],[.885,.24,.03,-1]]){
        const x=ux(k,fx,f);const fn=bm.sikkim>.5?F.rhodoSpike:F.foxglove;
        const fg=fn(x,g8(x)+4,H*fh,W*fl,sd);add(x,'stalk',fg.stalk);add(x,'bell',fg.bells);add(x,'inner',fg.inner);
      }
    }
    const tiles=tiled(f,(j)=>{const t=per[j];if(!t)return '';return `<path class="c-fg2" d="${t.fg2}"/><path class="c-fg" d="${t.fg}${t.stalk}"/><path class="c-bell" d="${t.bell}"/><path class="c-bell2" d="${t.inner}"/><path class="grain" d="${t.fg}${t.fg2}${t.stalk}${t.bell}"/>`;});
    return `<path class="c-fg" d="${d8}"/>${tiles}<path class="grain" d="${d8}"/>`;
  }

  /* ---------- sheet 9 — the box: deckle-edged cream mat in a dark board frame ---------- */
  function buildFrame(){
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
    F.setSeed(seed||1847);
    return {L1:buildL1(),L2:buildL2(),L3:buildL3(),L4:buildL4(),L5:buildL5(),L6:buildL6(),L7:buildL7(),L8:buildL8(),L9:buildFrame()};
  }
  return {W,H,M,N,U,LAYERS,widthOf,ux,build,groundAt:u=>groundAt(u),biome};
})();
