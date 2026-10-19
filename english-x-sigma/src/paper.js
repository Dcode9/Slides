/* ======================================================================
   PAPER — scissor-cut geometry. The first half is a straight port of the
   reference diorama's helpers; the second half is the new vocabulary for
   Goa and Sikkim (palms, churches, gompas, flags, dancers, a red panda).
   Everything returns SVG path data or small SVG markup strings; colours
   come from the .c-* paper-stock classes so day/night keeps working.
   ====================================================================== */
const PAPER = (() => {
  'use strict';
  function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
  let R = mulberry32(1847);
  const setSeed = s => { R = mulberry32(s); };
  const rr = (a,b) => a + (b-a)*R();
  const q = n => Math.round(n*10)/10;
  const clamp = (v,a,b) => v<a?a:v>b?b:v;
  const lerp = (a,b,t) => a+(b-a)*t;
  const smooth = t => { t = clamp(t,0,1); return t*t*(3-2*t); };

  /* ---------- paper geometry (reference) ----------
     Path data is emitted as one absolute M followed by *relative* implicit
     linetos ("M10 20 4-1 4-1"), which is ~45% shorter than the equivalent
     absolute "L" list while describing exactly the same outline.  Deltas are
     rounded against the running (rounded) position, so rounding never drifts
     along a long ridge.                                              */
  const nf = v => { const r = Math.round(v*10)/10; return r === 0 ? '0' : String(r); };
  function emit(pts, close){
    if(!pts || !pts.length) return '';
    let s = '', px = 0, py = 0;
    for(let i=0;i<pts.length;i++){
      const rx = Math.round(pts[i][0]*10)/10, ry = Math.round(pts[i][1]*10)/10;
      if(i === 0){ s = 'M' + nf(rx) + ' ' + nf(ry); px = rx; py = ry; continue; }
      const dx = Math.round((rx-px)*10)/10, dy = Math.round((ry-py)*10)/10;
      px += dx; py += dy;
      const sx = nf(dx), sy = nf(dy);
      // a leading '-' is its own separator; anything else needs a space so that
      // "1.2" followed by "4.4" can never fuse into "1.24.4".
      s += (i === 1 ? 'l' : '') + (sx.charAt(0) === '-' ? '' : ' ') + sx + (sy.charAt(0) === '-' ? '' : ' ') + sy;
    }
    return close ? s + 'Z' : s;
  }
  function area(p){let a=0;for(let i=0;i<p.length;i++){const u=p[i],v=p[(i+1)%p.length];a+=u[0]*v[1]-v[0]*u[1];}return a;}
  function orient(p){return area(p)<0?p.slice().reverse():p;}
  function trace(p,j,step){
    const pts=[];const n=p.length;
    for(let i=0;i<n;i++){
      const a=p[i],b=p[(i+1)%n],dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy)||1;
      // Very long edges (the deckle frame is ~5000px) get proportionally wider
      // samples: the tear is a low-frequency wobble, so 7000px needs ~300
      // samples, not 1000.  Short edges keep the original sampling, which also
      // keeps the generated artwork identical.
      let k=Math.max(1,Math.round(L/step));
      if(L>1500) k=Math.min(k,Math.max(2,Math.round(L/24)));
      const nx=-dy/L,ny=dx/L;
      for(let t=0;t<k;t++){
        let x=a[0]+dx*t/k,y=a[1]+dy*t/k;
        if(t>0){const o=(R()-.5)*2*j;x+=nx*o;y+=ny*o;}
        pts.push([x,y]);
      }
    }
    return emit(pts,true);
  }
  const cut  = (p,j=.7,step=7) => trace(orient(p),j,step);
  const hole = (p,j=.7,step=7) => trace(orient(p).slice().reverse(),j,step);
  function poly(p){return emit(orient(p),true);}
  function circ(cx,cy,r,n){const p=[];n=n||Math.max(8,Math.round(r*1.4));for(let i=0;i<n;i++){const a=i/n*Math.PI*2;p.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r]);}return p;}
  function ell(cx,cy,rx,ry,n){const p=[];n=n||Math.max(10,Math.round((rx+ry)*.8));for(let i=0;i<n;i++){const a=i/n*Math.PI*2;p.push([cx+Math.cos(a)*rx,cy+Math.sin(a)*ry]);}return p;}
  const rect = (x,y,w,h) => [[x,y],[x+w,y],[x+w,y+h],[x,y+h]];
  function wave(base,amps,lens){const ph=amps.map(()=>R()*Math.PI*2);return x=>{let y=base;for(let i=0;i<amps.length;i++)y+=amps[i]*Math.sin(x/lens[i]*Math.PI*2+ph[i]);return y;};}
  // a ridge polygon between x0 and x1 whose top edge follows fn
  function ridge(fn,bottom,x0,x1,step=9,j=.9){const p=[];for(let x=x0;x<=x1+step;x+=step)p.push([x,fn(x)+(R()-.5)*2*j]);p.push([x1+step,bottom],[x0,bottom]);return poly(p);}

  function pine(cx,by,h,w){
    const n=h>420?9:h>160?7:h>70?5:h>32?4:3;
    const trunkH=h*.09,crown=h-trunkH,tip=by-h,st=crown/(n+.45);
    const j=Math.max(.45,h/520),step=Math.max(5,h/70),lean=(R()-.5)*w*.12;
    let d='';
    for(let i=0;i<n;i++){
      const top=tip+i*st,bot=tip+(i+1.45)*st,k=(i+1)/n;
      const base=w*.5*(.26+.74*Math.pow(k,.9));
      const hr=base*(1+(R()-.5)*.16),hl=base*(1+(R()-.5)*.16),droop=st*.14;
      const cx0=cx+lean*(1-k);
      d+=cut([[cx0,top],[cx+hr,bot+(R()-.5)*droop],[cx+hr*.5,bot-st*.28],[cx,bot-st*.18],[cx-hl*.5,bot-st*.28],[cx-hl,bot+(R()-.5)*droop]],j,step);
    }
    const tw=Math.max(1.4,w*.055);
    d+=cut([[cx-tw,by+4],[cx-tw*.75,by-trunkH-st*.6],[cx+tw*.75,by-trunkH-st*.6],[cx+tw,by+4]],.3,8);
    return d;
  }
  function blade(bx,by,h,lean,wb){
    const L=[],Rt=[];
    for(let i=0;i<=4;i++){const t=i/4,x=bx+lean*t*t,y=by-h*t,hw=wb*.5*(1-t)*(1-t*.15);L.push([x-hw,y]);if(i<4)Rt.push([x+hw,y]);}
    return poly(L.concat(Rt.reverse()));
  }
  function mushroom(cx,by,s){
    const tilt=(R()-.5)*s*.3,capY=by-s*.86,rx=s*(.46+R()*.16),ry=s*(.34+R()*.12);
    const stem=cut([[cx-s*.17,by+2],[cx-s*.11+tilt*.6,capY+s*.05],[cx+s*.11+tilt*.6,capY+s*.05],[cx+s*.19,by+2]],.35,4);
    const cp=[];
    for(let i=0;i<=14;i++){const a=Math.PI+i/14*Math.PI;cp.push([cx+tilt+Math.cos(a)*rx,capY+Math.sin(a)*ry]);}
    cp.push([cx+tilt+rx*.7,capY+ry*.2],[cx+tilt,capY+ry*.28],[cx+tilt-rx*.7,capY+ry*.2]);
    const cap=cut(cp,.4,4);
    let dots='';const nd=2+Math.floor(R()*3);
    for(let i=0;i<nd;i++){const a=Math.PI*(1.15+R()*.7),rr2=R()*.55+.25;dots+=cut(circ(cx+tilt+Math.cos(a)*rx*rr2,capY+Math.sin(a)*ry*rr2*.9,s*(.05+R()*.05),7),.2,3);}
    return {stem,cap,dots};
  }
  function fern(bx,by,len,dir){
    let d='';const tipX=bx+dir*len*.62,tipY=by-len*.86,cx=bx+dir*len*.02,cy=by-len*.78;
    const P=t=>[(1-t)*(1-t)*bx+2*(1-t)*t*cx+t*t*tipX,(1-t)*(1-t)*by+2*(1-t)*t*cy+t*t*tipY];
    const sp=[],sp2=[];
    for(let i=0;i<=7;i++){const t=i/7,[x,y]=P(t),w=1.8*(1-t)+.4;sp.push([x-w,y]);sp2.push([x+w,y]);}
    d+=poly(sp.concat(sp2.reverse()));
    for(let t=.1;t<.97;t+=.095){
      const [x,y]=P(t),[x2,y2]=P(Math.min(1,t+.01)),ta=Math.atan2(y2-y,x2-x),L=len*.26*(1-t*.78);
      for(const side of [-1,1]){
        const a=ta+side*1.05,ex=x+Math.cos(a)*L,ey=y+Math.sin(a)*L,mx=x+Math.cos(a)*L*.5,my=y+Math.sin(a)*L*.5,wd=L*.2;
        d+=cut([[x,y],[mx+Math.cos(a+Math.PI/2)*wd,my+Math.sin(a+Math.PI/2)*wd],[ex,ey],[mx-Math.cos(a+Math.PI/2)*wd,my-Math.sin(a+Math.PI/2)*wd]],.25,4);
      }
    }
    return d;
  }
  function foxglove(bx,by,h,lean,side){
    let stalk='',bells='',inner='';
    const P=t=>[bx+lean*t*t,by-h*t];
    const L=[],Rt=[];
    for(let i=0;i<=8;i++){const t=i/8,[x,y]=P(t),w=2.2*(1-t)+.7;L.push([x-w,y]);Rt.push([x+w,y]);}
    stalk=poly(L.concat(Rt.reverse()));
    for(const sd of [-1,1]){const ll=h*.28;stalk+=cut([[bx,by],[bx+sd*ll*.35,by-ll*.5],[bx+sd*ll*.9,by-ll*.62],[bx+sd*ll*.55,by-ll*.18]],.5,6);}
    for(let t=.36;t<.97;t+=.048){
      const [x,y]=P(t),s=h*.075*(1-(t-.36)*1.05),sd=side*((Math.round(t*100)%3===0)?-1:1);
      if(t>.86){bells+=cut(circ(x+sd*s*.35,y+s*.2,s*.42,7),.2,3);continue;}
      bells+=cut([[x,y-s*.15],[x+sd*s*.55,y+s*.05],[x+sd*s*1.05,y+s*1.05],[x+sd*s*.78,y+s*1.28],[x+sd*s*.38,y+s*1.14],[x+sd*s*.12,y+s*.5]],.25,3);
      inner+=cut(circ(x+sd*s*.66,y+s*1.02,s*.13,6),.1,3);
    }
    return {stalk,bells,inner};
  }
  // rhododendron spike (Sikkim's state tree): same stalk, round flower clusters instead of bells
  function rhodoSpike(bx,by,h,lean,side){
    let stalk='',bells='',inner='';
    const P=t=>[bx+lean*t*t,by-h*t];
    const L=[],Rt=[];
    for(let i=0;i<=8;i++){const t=i/8,[x,y]=P(t),w=2.4*(1-t)+.8;L.push([x-w,y]);Rt.push([x+w,y]);}
    stalk=poly(L.concat(Rt.reverse()));
    for(let t=.2;t<.8;t+=.14){const [x,y]=P(t),ll=h*.2*(1-t*.5);for(const sd of [-1,1])stalk+=cut([[x,y],[x+sd*ll*.4,y-ll*.3],[x+sd*ll,y-ll*.1],[x+sd*ll*.5,y+ll*.12]],.4,5);}
    for(let t=.56;t<1.0;t+=.11){
      const [x,y]=P(t),s=h*.085*(1-(t-.56)*.9),sd=side*((Math.round(t*100)%2===0)?-1:1);
      const cx=x+sd*s*.9,cy=y;
      for(let k=0;k<5;k++){const a=k/5*Math.PI*2+t*7;bells+=cut(circ(cx+Math.cos(a)*s*.5,cy+Math.sin(a)*s*.42,s*.36,7),.2,3);}
      inner+=cut(circ(cx,cy,s*.2,6),.1,3);
    }
    return {stalk,bells,inner};
  }

  /* ---------- new flora ---------- */
  // coconut palm: curved trunk, radiating notched fronds, three nuts
  function palm(cx,by,h,lean,nF){
    nF=nF||7;const top=[cx+lean,by-h];
    const tw=Math.max(1.6,h*.035);
    const trunk=[];const T=10;
    for(let i=0;i<=T;i++){const t=i/T,x=cx+lean*t*t,y=by-h*t,w=tw*(1.25-t*.5);trunk.push([x-w,y]);}
    for(let i=T;i>=0;i--){const t=i/T,x=cx+lean*t*t,y=by-h*t,w=tw*(1.25-t*.5);trunk.push([x+w,y]);}
    let d=cut(trunk,.35,8);
    for(let i=0;i<nF;i++){
      const a=-Math.PI*.95+i/(nF-1)*Math.PI*.9+(R()-.5)*.18,len=h*(.38+R()*.14),droop=.9+R()*.5;
      // only small palms (a few pixels on screen) can afford a coarse frond:
      // a 800px- tall giant needs every one of its 8 sample points
      const pts=[];const S=h<150?6:8;
      // frond centre line: starts along angle a, droops with t
      const px=t=>top[0]+Math.cos(a)*len*t+ (Math.cos(a)>0?1:-1)*0, py=t=>top[1]+Math.sin(a)*len*t+droop*len*t*t*.55;
      const L=[],Rt=[];
      for(let k=0;k<=S;k++){const t=k/S,w=h*.028*(1-t)*(t<.1?t*10:1)+.6;const x=px(t),y=py(t);
        const x2=px(Math.min(1,t+.02)),y2=py(Math.min(1,t+.02)),ta=Math.atan2(y2-y,x2-x),nx=-Math.sin(ta),ny=Math.cos(ta);
        L.push([x+nx*w*2.2,y+ny*w*2.2]);Rt.push([x-nx*w*2.2,y-ny*w*2.2]);}
      d+=cut(L.concat(Rt.reverse()),Math.max(1.2,h*.02),h<150?Math.max(5.5,h*.042):Math.max(4,h*.03));
    }
    const nutR=h*.028;
    for(let k=0;k<3;k++)d+=cut(circ(top[0]+(k-1)*h*.03,top[1]+h*.03,nutR,nutR>12?8:6),.2,3);
    return d;
  }
  // round broadleaf tree (mango / cashew / jackfruit)
  function roundTree(cx,by,h,w){
    let d=cut([[cx-w*.05,by+3],[cx-w*.035,by-h*.38],[cx+w*.035,by-h*.38],[cx+w*.05,by+3]],.3,6);
    const lobes=[[0,-.68,.48],[-.3,-.52,.36],[.3,-.5,.38],[-.16,-.78,.3],[.18,-.8,.3],[0,-.45,.4]];
    for(const [lx,ly,lr] of lobes){const r=lr*w*.62;d+=cut(circ(cx+lx*w,by+ly*h,r,r>60?14:r>18?12:8),Math.max(.6,h*.012),7);}
    return d;
  }
  // rhododendron bush: dark leaves and a cluster of red-orange blooms
  function rhodoBush(cx,by,s){
    let leaf='',bloom='',dot='';
    for(let i=0;i<6;i++){const a=Math.PI*1.05+i/5*Math.PI*.9,L=s*(.55+R()*.3);leaf+=cut([[cx,by],[cx+Math.cos(a-.25)*L*.5,by+Math.sin(a-.25)*L*.5],[cx+Math.cos(a)*L,by+Math.sin(a)*L],[cx+Math.cos(a+.25)*L*.5,by+Math.sin(a+.25)*L*.5]],.3,4);}
    const nb=3+Math.floor(R()*3);
    for(let i=0;i<nb;i++){const bx=cx+(R()-.5)*s*.9,byy=by-s*(.45+R()*.4),r=s*(.12+R()*.08);for(let k=0;k<5;k++){const a=k/5*Math.PI*2;bloom+=cut(circ(bx+Math.cos(a)*r*.9,byy+Math.sin(a)*r*.8,r*.62,7),.15,3);}dot+=cut(circ(bx,byy,r*.3,6),.1,3);}
    return {leaf,bloom,dot};
  }

  /* ---------- buildings (local units: width ~100, base at y=0) ---------- */
  const P = (cls,d) => d?`<path class="${cls}" d="${d}"/>`:'';
  const G = (x,y,s,inner,extra='') => `<g transform="translate(${q(x)} ${q(y)}) scale(${q(s)})"${extra}>${inner}</g>`;

  function church(){
    let wall='',roof='',dark='',win='';
    // nave facade with a curved baroque gable
    wall+=cut([[-34,0],[34,0],[34,-50],[31,-58],[22,-64],[12,-70],[4,-75],[-4,-75],[-12,-70],[-22,-64],[-31,-58],[-34,-50]],.5,5);
    // side aisle to the right
    wall+=cut([[34,0],[62,0],[62,-36],[34,-44]],.4,6);
    roof+=cut([[34,-46],[64,-36],[64,-32],[34,-42]],.3,6);
    // bell tower
    wall+=cut([[-56,0],[-30,0],[-30,-86],[-56,-86]],.4,6);
    roof+=cut([[-59,-86],[-27,-86],[-43,-104]],.3,5);
    dark+=poly([[-44,-104],[-42,-104],[-42,-118],[-44,-118]])+poly([[-48,-114],[-38,-114],[-38,-112],[-48,-112]]);
    // cornices
    roof+=poly([[-34,-50],[34,-50],[34,-47],[-34,-47]])+poly([[-57,-62],[-29,-62],[-29,-59],[-57,-59]]);
    // door and windows
    dark+=cut([[-8,0],[8,0],[8,-18],[0,-25],[-8,-18]],.3,4);
    win+=cut([[-24,-26],[-16,-26],[-16,-36],[-20,-40],[-24,-36]],.2,3)+cut([[16,-26],[24,-26],[24,-36],[20,-40],[16,-36]],.2,3);
    win+=cut(circ(0,-58,5,12),.2,3)+cut([[-47,-66],[-39,-66],[-39,-76],[-43,-80],[-47,-76]],.2,3)+cut([[-47,-30],[-39,-30],[-39,-40],[-43,-44],[-47,-40]],.2,3);
    return P('c-wall',wall)+P('c-cap',roof)+P('c-foxd',dark)+P('c-win',win);
  }
  function house(yellow){
    let wall='',roof='',dark='',win='',col='';
    wall+=cut([[-40,0],[40,0],[40,-40],[-40,-40]],.4,6);
    roof+=cut([[-47,-40],[47,-40],[32,-60],[-32,-60]],.4,6);
    // balcão: low wall, columns, little tiled porch roof
    col+=cut([[-15,0],[15,0],[15,-11],[-15,-11]],.3,5)+poly([[-15,-40],[-11,-40],[-11,-11],[-15,-11]])+poly([[11,-40],[15,-40],[15,-11],[11,-11]]);
    roof+=cut([[-20,-40],[20,-40],[15,-47],[-15,-47]],.3,5);
    dark+=cut([[-6,-11],[6,-11],[6,-32],[-6,-32]],.2,4);
    win+=cut(rect(-32,-32,11,13),.2,3)+cut(rect(21,-32,11,13),.2,3);
    col+=poly(rect(-34,-33,2,15))+poly(rect(-19,-33,2,15))+poly(rect(19,-33,2,15))+poly(rect(34,-33,2,15));
    return P(yellow?'c-yellow':'c-wall',wall)+P('c-cap',roof)+P('c-wall',col)+P('c-win',win)+P('c-foxd',dark);
  }
  function gompa(){
    let wall='',band='',roof='',win='',dark='',gold='';
    wall+=cut([[-55,0],[55,0],[50,-46],[-50,-46]],.4,6);
    band+=cut([[-52,-46],[52,-46],[52,-53],[-52,-53]],.3,6);
    roof+=cut([[-64,-53],[64,-53],[58,-61],[-58,-61]],.3,6)+cut([[-64,-53],[-70,-61],[-60,-58]],.2,4)+cut([[64,-53],[70,-61],[60,-58]],.2,4);
    wall+=cut([[-34,-61],[34,-61],[31,-84],[-31,-84]],.4,6);
    band+=cut([[-33,-84],[33,-84],[33,-90],[-33,-90]],.3,5);
    roof+=cut([[-44,-90],[44,-90],[36,-99],[-36,-99]],.3,5)+cut([[-44,-90],[-50,-98],[-40,-95]],.2,4)+cut([[44,-90],[50,-98],[40,-95]],.2,4);
    gold+=cut([[-4,-99],[4,-99],[3,-108],[-3,-108]],.2,3)+cut(circ(0,-111,4,10),.2,3)+cut([[-60,-61],[-56,-61],[-58,-70]],.1,3)+cut([[56,-61],[60,-61],[58,-70]],.1,3);
    for(const wx of [-30,0,30]){dark+=cut([[wx-9,-16],[wx+9,-16],[wx+8,-34],[wx-8,-34]],.2,4);win+=cut(rect(wx-6,-32,12,14),.2,3);}
    for(const wx of [-14,14]){dark+=cut([[wx-7,-66],[wx+7,-66],[wx+6,-80],[wx-6,-80]],.2,4);win+=cut(rect(wx-4.5,-78,9,10),.2,3);}
    band+=cut([[-10,0],[10,0],[10,-22],[-10,-22]],.2,4);dark+=cut([[-7,0],[7,0],[7,-20],[-7,-20]],.2,4);
    return P('c-wall',wall)+P('c-cap',band)+P('c-gold',roof)+P('c-foxd',dark)+P('c-win',win)+P('c-gold',gold);
  }
  function chorten(){
    let wall='',gold='',dark='';
    wall+=cut([[-20,0],[20,0],[20,-8],[-20,-8]],.3,5)+cut([[-16,-8],[16,-8],[16,-15],[-16,-15]],.3,5)+cut([[-12,-15],[12,-15],[12,-21],[-12,-21]],.3,4);
    wall+=cut(circ(0,-33,13,18),.4,4);
    dark+=cut([[-5,-45],[5,-45],[5,-52],[-5,-52]],.2,3);
    gold+=cut([[-6,-52],[6,-52],[0,-76]],.3,4)+cut(circ(0,-78,2.8,8),.1,3);
    for(let i=1;i<6;i++){const y=-52-i*4,w=6*(1-i/6.2);dark+=poly([[-w,y],[w,y],[w,y-.9],[-w,y-.9]]);}
    return P('c-wall',wall)+P('c-foxd',dark)+P('c-gold',gold);
  }
  function hut(){ // Lepcha bamboo house on stilts
    let wall='',roof='',dark='';
    dark+=poly(rect(-30,-14,3,14))+poly(rect(27,-14,3,14))+poly(rect(-2,-14,3,14));
    wall+=cut([[-34,-14],[34,-14],[34,-44],[-34,-44]],.4,5);
    roof+=cut([[-42,-44],[42,-44],[0,-72]],.5,5);
    dark+=cut(rect(-8,-14,14,20),.2,4);
    return P('c-wood',dark)+P('c-yellow',wall)+P('c-foxd',roof);
  }
  function boat(){
    let hull='',dark='',man='';
    hull+=cut([[-46,-10],[46,-10],[52,-22],[48,-8],[36,0],[-34,0],[-50,-8],[-54,-20]],.4,5);
    dark+=poly([[-40,-10],[40,-10],[38,-7],[-38,-7]]);
    man+=cut(circ(6,-26,5,10),.2,3)+cut([[-1,-21],[13,-21],[16,-10],[-4,-10]],.3,4)+poly([[14,-18],[30,-30],[31,-28],[16,-16]]);
    return P('c-wood',hull)+P('c-foxd',dark)+P('c-foxd',man);
  }
  // string of prayer flags between (x0,y0) and (x1,y1); sag in px; flags hang below the line
  function flagLine(x0,y0,x1,y1,sag,n,fs){
    const cls=['c-blue','c-wall','c-cap','c-moss','c-yellow'];const out={line:'',b:'',w:'',r:'',g:'',y:''};const key=['b','w','r','g','y'];
    const pt=t=>[x0+(x1-x0)*t,y0+(y1-y0)*t+sag*4*t*(1-t)];
    const L=[],Rt=[];for(let i=0;i<=14;i++){const [x,y]=pt(i/14);L.push([x,y-.5]);Rt.push([x,y+.5]);}
    out.line=poly(L.concat(Rt.reverse()));
    for(let i=0;i<n;i++){const t=(i+.5)/n,[x,y]=pt(t),w=fs*.78,h=fs,sk=(R()-.5)*fs*.25;
      out[key[i%5]]+=cut([[x-w/2,y],[x+w/2,y],[x+w/2+sk,y+h],[x-w/2+sk,y+h]],.2,3);}
    return out;
  }
  function flagsSvg(fl){return P('c-foxd',fl.line)+P('c-blue',fl.b)+P('c-wall',fl.w)+P('c-cap',fl.r)+P('c-moss',fl.g)+P('c-yellow',fl.y);}

  /* ---------- figures (feet at y=0, facing right, ~100 units tall) ---------- */
  function panda(){
    let s='';
    // far legs
    s+=P('c-foxd',poly([[-22,-24],[-13,-24],[-14,-1],[-23,-1]])+poly([[12,-24],[20,-24],[20,-1],[11,-1]]));
    // tail: rust and buff rings along a curve
    const tc=[[-40,-30,9],[-51,-30,9.5],[-62,-33,9.5],[-71,-40,9],[-77,-49,8.5],[-80,-59,7.5]];
    let tail='';tc.forEach(([x,y,r],i)=>{tail+=`<path class="${i%2?'c-foxc':'c-fox'}" d="${cut(circ(x,y,r,14),.4,3)}"/>`;});
    s+=`<g class="panda-tail">${tail}<animateTransform attributeName="transform" type="rotate" values="0 -32 -32;-6 -32 -32;0 -32 -32;4 -32 -32;0 -32 -32" dur="3.1s" repeatCount="indefinite"/></g>`;
    // body and belly
    s+=P('c-fox',cut(ell(-2,-37,32,18,22),.5,4));
    s+=P('c-foxd',cut(ell(-2,-23,24,7,16),.3,4));
    // near legs
    s+=P('c-foxd',poly([[-30,-24],[-20,-24],[-22,0],[-32,0]])+poly([[4,-24],[14,-24],[16,0],[5,0]]));
    // head, ears
    s+=P('c-fox',cut([[20,-57],[15,-74],[30,-63]],.3,3)+cut([[36,-63],[44,-76],[47,-58]],.3,3));
    s+=P('c-foxc',poly([[21,-60],[18,-70],[28,-63]])+poly([[38,-63],[43,-72],[45,-60]]));
    s+=P('c-fox',cut(circ(32,-50,16,20),.4,3));
    // face mask
    s+=P('c-foxc',cut(circ(27,-45,7.5,12),.3,3)+cut(circ(40,-45,7.5,12),.3,3)+cut(ell(42,-43,8,6,12),.3,3)+cut(circ(27,-57,3,8),.2,3)+cut(circ(38,-58,3,8),.2,3));
    s+=P('c-fox',poly([[27.5,-51],[30.5,-51],[29.5,-41],[26.5,-42]])+poly([[36.5,-51],[39.5,-51],[40.5,-42],[37.5,-41]]));
    s+=`<g class="panda-eyes"><path class="c-foxd" d="${circPath(29.5,-53,2.2)}${circPath(38.5,-53.5,2.2)}"/><animateTransform attributeName="transform" type="scale" values="1 1;1 1;1 .1;1 1" keyTimes="0;.9;.95;1" dur="4.6s" repeatCount="indefinite" additive="sum"/></g>`;
    s+=P('c-foxd',cut(circ(49,-44,2.8,8),.1,2));
    return s;
  }
  function circPath(cx,cy,r){return poly(circ(cx,cy,r,12));}
  function pader(){
    let s='';
    s+=P('c-skin',poly([[-9,-26],[-3,-26],[-2,0],[-10,0]])+poly([[3,-26],[9,-26],[11,0],[3,0]]));
    s+=P('c-foxd',poly(rect(-12,-3,12,3))+poly(rect(2,-3,12,3)));
    s+=P('c-foxc',cut([[-15,-74],[15,-74],[21,-26],[-21,-26]],.5,5));
    s+=P('c-wood',poly(rect(-17,-52,34,3)));
    // right arm holding the bamboo staff, left arm balancing the basket
    s+=P('c-foxc',cut([[12,-74],[20,-74],[26,-54],[18,-52]],.3,4)+cut([[-14,-74],[-8,-74],[-16,-90],[-22,-88]],.3,4));
    s+=P('c-skin',cut([[18,-54],[26,-54],[30,-40],[24,-39]],.2,4)+cut(circ(28,-39,3.5,8),.2,2)+cut([[-22,-88],[-16,-90],[-14,-100],[-20,-100]],.2,4));
    s+=P('c-wood',cut([[29.5,2],[33,2],[31,-98],[28,-98]],.2,8));
    for(const y of [-92,-85,-78])s+=P('c-bell2',cut(circ(30.5,y,4,10),.2,2)+hole(circ(30.5,y,1.6,8),.1,2));
    s+=P('c-skin',cut(circ(0,-85,9,14),.3,3));
    s+=P('c-foxd',cut(ell(0,-90,9,4.5,12),.3,3));
    // basket of bread
    s+=P('c-ground',cut([[-25,-100],[25,-100],[21,-110],[-21,-110]],.4,4)+cut(ell(0,-100,25,4,16),.3,3));
    s+=P('c-bell2',cut(circ(-9,-112,4.5,9),.2,2)+cut(circ(1,-114,4.5,9),.2,2)+cut(circ(11,-112,4.5,9),.2,2));
    s+=P('c-foxc',cut([[-20,-110],[20,-110],[14,-118],[-14,-118]],.6,4));
    return s;
  }
  function woman(skirt,blouse,pose){ // pose: 'up' | 'side'
    let s='';
    s+=P('c-skin',poly([[-6,-4],[-1,-4],[0,0],[-7,0]])+poly([[1,-4],[6,-4],[7,0],[0,0]]));
    s+=P(skirt,cut([[-10,-50],[10,-50],[18,-1],[-18,-1]],.5,5));
    s+=P(blouse,cut([[-9,-72],[9,-72],[10,-50],[-10,-50]],.4,4));
    s+=P(skirt,cut([[-8,-70],[1,-70],[11,-50],[1,-50]],.3,4));
    if(pose==='up'){
      s+=P('c-skin',cut([[-9,-70],[-4,-68],[-16,-94],[-20,-91]],.2,4)+cut([[4,-68],[9,-70],[20,-91],[16,-94]],.2,4)+cut(circ(-18,-94,3.2,8),.2,2)+cut(circ(18,-94,3.2,8),.2,2));
    }else{
      s+=P('c-skin',cut([[-9,-70],[-4,-68],[-24,-60],[-26,-64]],.2,4)+cut([[4,-68],[9,-70],[26,-64],[24,-60]],.2,4)+cut(circ(-26,-62,3.2,8),.2,2)+cut(circ(26,-62,3.2,8),.2,2));
    }
    s+=P('c-skin',cut(circ(0,-82,8,12),.3,3));
    s+=P('c-foxd',cut(ell(0,-87,8.5,5,12),.3,3)+cut(circ(-8,-83,3.6,8),.2,2));
    s+=P('c-bell2',circPath(0,-86,1.4));
    return s;
  }
  const GT = (tf,inner) => `<g transform="${tf}">${inner}</g>`;
  function fugdiPair(){
    return GT('translate(-26 0)',woman('c-cap','c-bell2','up'))+GT('translate(26 0) scale(-1 1)',woman('c-moss','c-bell2','up'));
  }
  function ghodeModni(){
    let s='';
    s+=P('c-foxd',poly([[-10,-10],[-4,-10],[-3,0],[-11,0]])+poly([[2,-10],[8,-10],[9,0],[1,0]]));
    s+=P('c-bell2',cut([[-24,-32],[24,-32],[25,-10],[-25,-10]],.9,5));
    s+=P('c-cap',poly([[-24,-14],[24,-14],[24,-10],[-24,-10]]));
    s+=P('c-foxd',cut([[-26,-46],[-35,-40],[-37,-30],[-30,-33]],.4,4));
    s+=P('c-foxc',cut(ell(0,-40,27,11,20),.4,4)+cut([[20,-44],[30,-62],[42,-60],[45,-52],[32,-44]],.4,4)+cut([[36,-62],[38,-68],[41,-61]],.2,3));
    s+=P('c-foxd',cut([[27,-60],[31,-64],[36,-63],[33,-57]],.2,3)+circPath(40,-57,1.4));
    s+=P('c-cap',cut([[-16,-47],[10,-47],[12,-33],[-18,-33]],.3,4));
    s+=P('c-bell2',poly([[-17,-36],[11,-36],[11,-33],[-17,-33]]));
    s+=P('c-cap',cut([[-8,-72],[8,-72],[10,-47],[-10,-47]],.3,4));
    s+=P('c-bell2',poly([[-9,-70],[-3,-72],[7,-48],[1,-48]]));
    s+=P('c-cap',cut([[8,-70],[14,-72],[22,-86],[16,-88]],.2,4)+cut([[-8,-70],[-14,-70],[-18,-58],[-12,-56]],.2,4));
    s+=P('c-skin',cut(circ(19,-88,3.2,8),.2,2)+cut(circ(-16,-56,3,8),.2,2));
    s+=P('c-pebble',cut([[18,-89],[23,-89],[31,-114],[27,-115]],.2,5));
    s+=P('c-wood',poly([[16,-91],[25,-91],[25,-88],[16,-88]]));
    s+=P('c-skin',cut(circ(0,-82,8,12),.3,3));
    s+=P('c-bell2',cut(ell(0,-89,11,7,14),.4,3));
    s+=P('c-cap',poly([[-11,-88],[11,-88],[11,-85],[-11,-85]]));
    return s;
  }
  function mandoCouple(){
    let s='';
    // woman (left), facing right
    let w='';
    w+=P('c-teal',cut([[-10,-56],[10,-56],[25,0],[-25,0]],.5,5));
    w+=P('c-foxc',cut([[-25,0],[25,0],[24,-5],[-24,-5]],.4,4));
    w+=P('c-teal',cut([[-9,-76],[9,-76],[10,-56],[-10,-56]],.3,4));
    w+=P('c-foxc',cut([[-9,-76],[9,-76],[4,-66],[-4,-66]],.2,3));
    w+=P('c-teal',cut([[9,-74],[14,-70],[24,-84],[20,-88]],.2,4)+cut([[-9,-74],[-14,-70],[-18,-56],[-13,-54]],.2,4));
    w+=P('c-skin',cut(circ(22,-87,3,8),.2,2)+cut(circ(-15,-54,3,8),.2,2));
    w+=P('c-foxc',cut([[22,-88],[18,-104],[36,-100],[42,-90]],.3,3));
    w+=P('c-skin',cut(circ(0,-85,8,12),.3,3));
    w+=P('c-foxd',cut(ell(0,-90,8.5,5,12),.3,3)+cut(circ(-7,-86,3.6,8),.2,2));
    w+=P('c-bell2',circPath(7,-82,1.3)+circPath(-7,-82,1.3));
    // man (right), facing left
    let m='';
    m+=P('c-foxd',poly([[-8,-50],[8,-50],[9,0],[-9,0]])+cut([[-11,-78],[11,-78],[13,-40],[-13,-40]],.3,4));
    m+=P('c-foxc',poly([[-3,-78],[3,-78],[3,-52],[-3,-52]]));
    m+=P('c-cap',poly([[-3,-76],[3,-76],[3,-72],[-3,-72]]));
    m+=P('c-foxd',cut([[-11,-74],[-5,-70],[-24,-62],[-27,-67]],.2,4)+cut([[11,-74],[5,-70],[9,-50],[14,-52]],.2,4));
    m+=P('c-skin',cut(circ(-27,-65,3,8),.2,2)+cut(circ(12,-50,3,8),.2,2));
    m+=P('c-foxc',cut([[-29,-66],[-25,-60],[-35,-54],[-39,-58]],.2,3));
    m+=P('c-skin',cut(circ(0,-87,8,12),.3,3));
    m+=P('c-foxd',cut(ell(0,-92,8.5,4.5,12),.3,3));
    return G(-28,0,1,w)+G(30,0,1,m);
  }
  function snowLion(){
    let s='';
    s+=P('c-foxc',poly([[-50,-36],[-40,-36],[-38,0],[-52,0]])+poly([[-30,-36],[-20,-36],[-18,0],[-32,0]])+poly([[18,-36],[28,-36],[30,0],[16,0]])+poly([[36,-36],[46,-36],[50,0],[34,0]]));
    s+=P('c-foxd',poly(rect(-53,-5,16,5))+poly(rect(-33,-5,16,5))+poly(rect(15,-5,16,5))+poly(rect(33,-5,18,5)));
    // tail
    s+=P('c-foxc',cut([[-58,-64],[-74,-70],[-84,-86],[-78,-98],[-70,-90],[-70,-76],[-58,-70]],.6,4));
    s+=P('c-river',cut(circ(-80,-99,8,10),.6,3));
    // body with shaggy edge
    s+=P('c-foxc',cut(ell(-2,-58,60,27,30),1.4,5));
    // turquoise mane along the back
    const back=[];for(let i=0;i<=16;i++){const t=i/16,x=-56+t*96,y=-58-Math.sin(t*Math.PI)*27-(i%2?9:3);back.push([x,y]);}
    for(let i=16;i>=0;i--){const t=i/16,x=-56+t*96,y=-58-Math.sin(t*Math.PI)*27+6;back.push([x,y]);}
    s+=P('c-river',cut(back,.8,4));
    // head with mane ring
    s+=P('c-river',cut(circ(62,-84,38,26),3,5));
    s+=P('c-foxc',cut(circ(62,-84,27,22),.6,4));
    s+=P('c-river',cut([[48,-104],[52,-118],[60,-106]],.3,3)+cut([[66,-108],[74,-120],[78,-104]],.3,3));
    s+=P('c-foxd',cut([[72,-72],[92,-74],[90,-62],[70,-64]],.3,3));
    s+=P('c-cap',cut([[76,-68],[88,-68],[86,-59],[78,-59]],.2,3));
    s+=P('c-foxc',poly([[73,-71],[77,-71],[76,-67],[73,-67]])+poly([[84,-72],[88,-72],[88,-68],[85,-68]]));
    s+=P('c-foxd',cut(circ(72,-92,5.5,10),.2,2)+cut(circ(56,-94,4.5,10),.2,2)+cut(ell(88,-80,6,4,10),.2,2));
    s+=P('c-foxc',circPath(73.5,-93.5,1.8)+circPath(57.5,-95.5,1.5));
    s+=P('c-bell2',cut(circ(62,-104,4.5,8),.2,2)+circPath(40,-80,2)+circPath(0,-88,2.2)+circPath(-30,-84,2)+circPath(-50,-72,1.8));
    return s;
  }
  function chaamDancer(){
    let s='';
    s+=P('c-foxd',cut([[-14,-8],[-2,-8],[0,0],[-16,0]],.2,4)+cut([[4,-8],[16,-8],[18,0],[2,0]],.2,4));
    s+=P('c-cap',cut([[-14,-80],[14,-80],[31,-8],[-31,-8]],.5,5));
    s+=P('c-bell2',cut([[-31,-8],[31,-8],[30,-16],[-30,-16]],.3,4)+cut([[-7,-60],[7,-60],[9,-18],[-9,-18]],.3,4));
    s+=P('c-foxd',poly([[-7,-60],[-5,-60],[-7,-18],[-9,-18]])+poly([[5,-60],[7,-60],[9,-18],[7,-18]]));
    s+=P('c-cap',cut([[-14,-76],[-8,-80],[-34,-98],[-40,-88]],.3,4)+cut([[8,-80],[14,-76],[40,-88],[34,-98]],.3,4));
    s+=P('c-bell2',cut([[-40,-88],[-34,-98],[-47,-105],[-51,-92]],.3,3)+cut([[34,-98],[40,-88],[51,-92],[47,-105]],.3,3));
    s+=P('c-skin',cut(circ(-50,-99,3,8),.2,2)+cut(circ(50,-99,3,8),.2,2));
    // ritual bell and dorje
    s+=P('c-gold',cut([[-54,-100],[-46,-100],[-47,-108],[-53,-108]],.2,3)+poly([[-51,-108],[-49,-108],[-49,-114],[-51,-114]])+poly([[44,-100],[56,-100],[56,-98],[44,-98]])+circPath(44,-99,2)+circPath(56,-99,2));
    // mask
    s+=P('c-foxd',cut(circ(0,-96,17,18),.3,3));
    s+=P('c-bell2',cut(circ(0,-96,15,18),.3,3));
    s+=P('c-foxd',circPath(-5.5,-98,2.6)+circPath(5.5,-98,2.6)+circPath(0,-104,1.6)+cut([[-6,-90],[6,-90],[4,-86],[-4,-86]],.2,3));
    s+=P('c-foxc',circPath(-14,-108,4.2)+circPath(-7.5,-114,4.2)+circPath(0,-116.5,4.2)+circPath(7.5,-114,4.2)+circPath(14,-108,4.2));
    s+=P('c-cap',circPath(-14,-108,1.3)+circPath(-7.5,-114,1.3)+circPath(0,-116.5,1.3)+circPath(7.5,-114,1.3)+circPath(14,-108,1.3));
    return s;
  }
  function maruni(){
    let s='';
    s+=P('c-foxc',cut([[-10,-92],[10,-92],[17,-54],[-17,-54]],.4,4));
    s+=P('c-skin',poly([[-6,-4],[-1,-4],[0,0],[-7,0]])+poly([[1,-4],[6,-4],[7,0],[0,0]]));
    s+=P('c-cap',cut([[-12,-54],[12,-54],[31,0],[-31,0]],.5,5));
    s+=P('c-bell2',cut([[-31,0],[31,0],[30,-6],[-30,-6]],.3,4)+poly([[-4,-54],[-2,-54],[-12,-6],[-14,-6]])+poly([[2,-54],[4,-54],[14,-6],[12,-6]])+poly([[-11,-54],[-9,-54],[-26,-6],[-28,-6]])+poly([[9,-54],[11,-54],[28,-6],[26,-6]]));
    s+=P('c-bell2',cut([[-9,-74],[9,-74],[11,-54],[-11,-54]],.3,4));
    s+=P('c-cap',cut([[-8,-72],[1,-72],[6,-56],[-2,-56]],.2,3));
    s+=P('c-skin',cut([[9,-72],[14,-70],[24,-84],[20,-88]],.2,4)+cut([[20,-88],[24,-84],[14,-97],[10,-94]],.2,4)+cut(circ(10,-97,3,8),.2,2));
    s+=P('c-skin',cut([[-9,-72],[-14,-70],[-29,-78],[-27,-83]],.2,4)+cut(circ(-29,-81,3,8),.2,2));
    s+=P('c-skin',cut(circ(0,-84,8,12),.3,3));
    s+=P('c-foxd',cut(ell(0,-89,8.5,5,12),.3,3));
    s+=P('c-bell2',cut([[-9,-91],[9,-91],[6,-97],[-6,-97]],.2,3)+circPath(0,-86,1.4)+circPath(8,-81,1.8)+circPath(-8,-81,1.8)+circPath(24,-86,1.6)+circPath(-29,-78,1.6));
    return s;
  }
  function drummer(){
    let s='';
    s+=P('c-foxd',poly(rect(-11,-3,10,3))+poly(rect(2,-3,10,3)));
    s+=P('c-foxc',poly([[-8,-46],[8,-46],[9,0],[-9,0]])+cut([[-11,-78],[11,-78],[13,-44],[-13,-44]],.3,4));
    s+=P('c-teal',cut([[-10,-78],[-3,-78],[-3,-54],[-11,-54]],.2,3)+cut([[3,-78],[10,-78],[11,-54],[3,-54]],.2,3));
    s+=P('c-cap',cut([[-13,-50],[13,-50],[13,-44],[-13,-44]],.2,4));
    // damphu held out in the left hand, right hand striking
    s+=P('c-foxc',cut([[-11,-74],[-6,-70],[-20,-60],[-24,-66]],.2,4));
    s+=P('c-ground',cut(circ(-25,-64,11,16),.3,3));
    s+=P('c-foxc',cut(circ(-25,-64,8.5,14),.2,3));
    s+=P('c-foxd',circPath(-25,-64,1.3)+circPath(-25,-53,1)+circPath(-25,-75,1)+circPath(-36,-64,1)+circPath(-14,-64,1));
    s+=P('c-foxc',cut([[11,-74],[6,-70],[-10,-58],[-6,-54]],.2,4));
    s+=P('c-skin',cut(circ(-9,-57,3,8),.2,2)+cut(circ(-23,-66,2.6,8),.2,2));
    s+=P('c-skin',cut(circ(0,-88,8,12),.3,3));
    s+=P('c-bell2',cut([[-8,-94],[8,-94],[7,-105],[-5,-105]],.2,3));
    s+=P('c-cap',circPath(-2,-100,1.2)+circPath(3,-98,1.2)+circPath(1,-103,1));
    return s;
  }
  function lepchaPair(){ // sowing and reaping: Zo-Mal-Lok
    let a='',b='';
    a+=P('c-skin',poly([[-6,-4],[-1,-4],[0,0],[-7,0]])+poly([[1,-4],[6,-4],[7,0],[0,0]]));
    a+=P('c-blue',cut([[-10,-50],[10,-50],[16,-1],[-16,-1]],.4,5));
    a+=P('c-foxc',cut([[-9,-72],[9,-72],[10,-50],[-10,-50]],.3,4));
    a+=P('c-cap',cut([[-9,-72],[0,-72],[9,-50],[0,-50]],.2,3));
    a+=P('c-skin',cut([[9,-70],[14,-68],[28,-50],[24,-46]],.2,4)+cut([[-9,-70],[-14,-68],[-24,-48],[-20,-44]],.2,4));
    a+=P('c-skin',cut(circ(0,-82,8,12),.3,3));a+=P('c-foxd',cut(ell(0,-87,8.5,5,12),.3,3));
    a+=P('c-bell2',cut([[-7,-93],[7,-93],[4,-98],[-4,-98]],.2,3));
    // a bundle of paddy
    for(let i=0;i<7;i++){const x=26+(R()-.5)*8,ang=-1.2-(i/7)*.7;a+=P('c-bell2',cut([[x,-48],[x+Math.cos(ang)*18,-48+Math.sin(ang)*18],[x+Math.cos(ang)*16+2,-48+Math.sin(ang)*16]],.2,3));}
    b+=P('c-foxd',poly(rect(-11,-3,10,3))+poly(rect(2,-3,10,3)));
    b+=P('c-foxc',poly([[-8,-46],[8,-46],[9,0],[-9,0]])+cut([[-11,-78],[11,-78],[13,-44],[-13,-44]],.3,4));
    b+=P('c-blue',cut([[-13,-78],[-3,-78],[-3,-44],[-13,-44]],.2,3));
    b+=P('c-cap',cut([[-13,-50],[13,-50],[13,-44],[-13,-44]],.2,4));
    b+=P('c-skin',cut([[11,-74],[6,-70],[24,-86],[27,-82]],.2,4)+cut([[-11,-74],[-6,-70],[-14,-56],[-19,-58]],.2,4));
    b+=P('c-skin',cut(circ(0,-88,8,12),.3,3));b+=P('c-foxd',cut(ell(0,-93,8.5,4.5,12),.3,3));
    b+=P('c-wood',cut([[24,-84],[27,-84],[27,-108],[24,-108]],.1,5));b+=P('c-pebble',cut([[18,-108],[32,-108],[26,-114],[20,-112]],.2,3));
    return G(-30,0,1,a)+G(30,0,1,b);
  }
  function yak(){
    let s='';
    s+=P('c-foxd',poly([[-36,-28],[-26,-28],[-28,0],[-39,0]])+poly([[-16,-28],[-6,-28],[-8,0],[-18,0]])+poly([[12,-28],[22,-28],[22,0],[11,0]])+poly([[30,-28],[40,-28],[42,0],[31,0]]));
    s+=P('c-foxd',cut([[-48,-46],[-59,-40],[-62,-24],[-53,-26],[-50,-36]],.8,4));
    const body=ell(0,-44,50,23,30).map(([x,y])=>y>-40?[x,y+(R()*6)]:[x,y]);
    s+=P('c-foxd',cut(body,2.2,6));
    s+=P('c-cap',cut([[-22,-62],[14,-62],[16,-46],[-24,-46]],.3,4));
    s+=P('c-bell2',poly([[-24,-49],[16,-49],[16,-46],[-24,-46]])+poly([[-22,-62],[14,-62],[14,-59],[-22,-59]]));
    s+=P('c-foxd',cut([[38,-56],[62,-58],[68,-46],[60,-34],[44,-36]],.6,4));
    s+=P('c-pebble',cut([[44,-57],[40,-72],[47,-75],[51,-59]],.3,3)+cut([[57,-58],[65,-72],[71,-67],[61,-57]],.3,3)+circPath(66,-37,2.2));
    s+=P('c-foxc',circPath(57,-50,1.8));
    return s;
  }
  function tiatrCurtain(){ // small stage with a red curtain: tiatr
    let s='';
    s+=P('c-wood',cut([[-50,0],[50,0],[50,-8],[-50,-8]],.3,5));
    s+=P('c-foxd',cut([[-54,-8],[54,-8],[54,-78],[-54,-78]],.3,6));
    s+=P('c-cap',cut([[-52,-78],[-20,-78],[-30,-50],[-24,-30],[-36,-10],[-52,-10]],.6,5)+cut([[20,-78],[52,-78],[52,-10],[36,-10],[24,-30],[30,-50]],.6,5)+cut([[-54,-78],[54,-78],[54,-70],[-54,-70]],.4,5));
    s+=P('c-bell2',poly([[-54,-72],[54,-72],[54,-70],[-54,-70]])+cut([[-30,-50],[-22,-48],[-24,-44],[-32,-46]],.2,3)+cut([[30,-50],[22,-48],[24,-44],[32,-46]],.2,3));
    return s;
  }

  /* ---------- props ---------- */
  function ghumot(){return P('c-cap',cut(ell(0,-15,15,13,18),.4,3)+cut([[-18,-20],[-14,-20],[-13,-10],[-17,-10]],.2,3))+P('c-foxc',cut(ell(12,-15,4.5,9.5,12),.2,3))+P('c-foxd',poly([[-19,-15],[-13,-15],[-13,-13],[-19,-13]]));}
  function violin(){return P('c-wood',cut(ell(0,-12,9,11,14),.3,3)+cut(ell(0,-30,7.5,9,14),.3,3)+cut([[-9,-20],[9,-20],[7,-24],[-7,-24]],.2,3))+P('c-foxd',poly([[-1.2,-38],[1.2,-38],[1.2,-58],[-1.2,-58]])+circPath(0,-60,2.6)+poly([[-4,-10],[-2.5,-10],[-2.5,-20],[-4,-20]])+poly([[2.5,-10],[4,-10],[4,-20],[2.5,-20]]))+P('c-wood',poly([[14,0],[16,0],[-12,-50],[-14,-49]]));}
  function breadBasket(){let s=P('c-ground',cut([[-22,0],[22,0],[18,-14],[-18,-14]],.4,4));for(const [x,y,r] of [[-10,-16,6],[2,-18,6.5],[13,-16,6]]){s+=P('c-bell2',cut(circ(x,y,r,12),.3,2));s+=P('c-wood',poly([[x-3,y-1],[x+3,y-1],[x+3,y],[x-3,y]]));}return s;}
  function foodGoa(){
    let s='';
    s+=P('c-wood',cut([[-70,0],[70,0],[68,-6],[-68,-6]],.3,6)+poly(rect(-60,-6,0,0)));
    // fish curry bowl
    s+=P('c-teal',cut([[-54,-6],[-26,-6],[-30,-22],[-50,-22]],.3,4));s+=P('c-cap',cut(ell(-40,-22,12,3,12),.2,3));s+=P('c-pebble',cut([[-46,-23],[-36,-23],[-32,-26],[-36,-20],[-46,-20]],.2,3));
    // poee
    s+=P('c-bell2',cut(circ(-10,-13,8,12),.3,2)+cut(circ(2,-14,8,12),.3,2));s+=P('c-wood',poly([[-14,-14],[-6,-14],[-6,-13],[-14,-13]])+poly([[-2,-15],[6,-15],[6,-14],[-2,-14]]));
    // bebinca
    for(let i=0;i<7;i++)s+=P(i%2?'c-cap':'c-bell2',cut([[16,-6-i*3],[40,-6-i*3],[38,-9-i*3],[18,-9-i*3]],.15,3));
    // feni bottle and coconut
    s+=P('c-river',cut([[48,-6],[62,-6],[62,-30],[58,-34],[58,-44],[52,-44],[52,-34],[48,-30]],.3,3));s+=P('c-wood',poly([[52,-44],[58,-44],[58,-48],[52,-48]]));
    s+=P('c-foxd',cut(circ(70,-14,9,12),.6,3));s+=P('c-foxc',circPath(72,-16,2.5));
    return s;
  }
  function foodSikkim(){
    let s='';
    s+=P('c-wood',cut([[-74,0],[74,0],[72,-6],[-72,-6]],.3,6));
    // momo steamer
    s+=P('c-ground',cut([[-64,-6],[-30,-6],[-30,-22],[-64,-22]],.3,4));s+=P('c-wood',poly([[-64,-14],[-30,-14],[-30,-12],[-64,-12]]));
    for(const x of [-58,-47,-36])s+=P('c-foxc',cut([[x-5,-22],[x+5,-22],[x+3,-29],[x-3,-29]],.3,2));
    s+=P('c-smoke',cut(circ(-50,-36,4,8),.3,2)+cut(circ(-44,-40,3,8),.3,2));
    // thukpa bowl
    s+=P('c-teal',cut([[-24,-6],[2,-6],[-1,-20],[-21,-20]],.3,4));s+=P('c-bell2',cut(ell(-11,-20,11,3,12),.2,3));s+=P('c-wood',poly([[-6,-20],[-4,-20],[6,-36],[4,-36]])+poly([[-9,-20],[-7,-20],[2,-37],[0,-37]]));
    // sel roti rings
    for(const [x,y] of [[14,-12],[26,-14],[20,-21]])s+=P('c-cap',cut(circ(x,y,7,12),.3,2)+hole(circ(x,y,2.6,8),.1,2));
    // tongba with straw
    s+=P('c-ground',cut([[40,-6],[56,-6],[55,-32],[41,-32]],.3,3));s+=P('c-wood',poly([[40,-14],[56,-14],[56,-12],[40,-12]])+poly([[40,-26],[56,-26],[56,-24],[40,-24]]));s+=P('c-foxc',poly([[50,-32],[52,-32],[58,-50],[56,-50]]));
    // butter lamps
    for(const x of [66,76]){s+=P('c-bell2',cut([[x-4,-6],[x+4,-6],[x+3,-12],[x-3,-12]],.2,3));s+=P('c-lamp',cut([[x-1.6,-12],[x+1.6,-12],[x,-18]],.1,2));}
    return s;
  }
  function butterLamp(){return P('c-bell2',cut([[-6,0],[6,0],[4,-9],[-4,-9]],.2,3)+cut([[-4,-9],[4,-9],[5,-12],[-5,-12]],.2,3))+`<circle class="lampglow" cx="0" cy="-16" r="26" fill="url(#winGlowGrad)"/>`+P('c-lamp',cut([[-2.4,-12],[2.4,-12],[0,-21]],.1,2));}
  function prayerWheel(){return P('c-wood',poly([[-1.5,0],[1.5,0],[1.5,-30],[-1.5,-30]]))+P('c-gold',cut([[-9,-18],[9,-18],[9,-34],[-9,-34]],.3,3))+P('c-cap',poly([[-9,-27],[9,-27],[9,-24],[-9,-24]]))+P('c-wood',poly([[-2,-34],[2,-34],[2,-38],[-2,-38]]));}
  function conch(){return P('c-pebble',cut([[-10,0],[8,0],[12,-6],[6,-12],[-4,-11],[-12,-5]],.3,3))+P('c-cap',cut(circ(2,-6,2.4,8),.1,2));}
  function coconutNut(){return P('c-wood',cut(ell(-9,-7,8,7,12),.4,3)+cut(ell(8,-6,7.5,6.5,12),.4,3))+P('c-foxd',circPath(-11,-9,1.2)+circPath(-7.5,-10,1.2)+circPath(-9.5,-6,1.2))+P('c-wall',cut(ell(1,-3,6.5,3.4,12),.2,2))+P('c-river',cut(ell(1,-3,3.8,1.9,10),.1,2));}
  function lampDiya(){return P('c-cap',cut([[-6,0],[6,0],[4,-5],[-4,-5]],.2,3))+P('c-lamp',cut([[-2,-5],[2,-5],[0,-12]],.1,2));}
  function carnivalMask(){return P('c-bell2',cut([[-22,-8],[22,-8],[24,-20],[12,-30],[-12,-30],[-24,-20]],.4,3))+P('c-foxd',cut(ell(-9,-19,5,3.5,10),.1,2)+cut(ell(9,-19,5,3.5,10),.1,2))+P('c-cap',cut([[-6,-30],[6,-30],[2,-44],[-2,-44]],.2,3)+circPath(-18,-30,3)+circPath(18,-30,3))+P('c-river',circPath(-24,-34,3)+circPath(24,-34,3));}

  // getR/setR let callers sandbox the random stream: a tile of artwork can be
  // regenerated later without disturbing the sequence the other sheets rely on.
  const getR=()=>R, setR=f=>{R=f;};
  return {setSeed,getR,setR,R:()=>R(),rr,q,clamp,lerp,smooth,cut,hole,poly,circ,ell,rect,wave,ridge,pine,blade,mushroom,fern,foxglove,rhodoSpike,palm,roundTree,rhodoBush,
    P,G,church,house,gompa,chorten,hut,boat,flagLine,flagsSvg,panda,pader,woman,fugdiPair,ghodeModni,mandoCouple,snowLion,chaamDancer,maruni,drummer,lepchaPair,yak,tiatrCurtain,
    ghumot,violin,breadBasket,foodGoa,foodSikkim,butterLamp,prayerWheel,conch,coconutNut,lampDiya,carnivalMask};
})();
