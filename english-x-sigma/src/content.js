/* ======================================================================
   CONTENT — everything a student may want to edit lives here.
   DATA: class, group, members.  SLIDES: text, card positions, and the
   paper-cut figures placed in the world for each slide.
   Positions are in the 1920×1080 logical canvas (x,y = top-left of a card).
   Scene entries: {L:'L7', a:0.72, fig:'pader', s:2.6}  → layer, horizontal
   position as a fraction of the slide width, figure name, scale.
   ====================================================================== */
/* The group poster. Leave empty to load poster.webp / poster.jpg from beside this file,
   or use the "Save copy with poster" button after choosing the image to embed it here. */
const POSTER_SRC = '';

const DATA = {
  klass: 'X', division: 'Sigma', group: '3', year: '2026–27',
  members: [
    {name:'Dhairya Shah',    roll:'__', task:'Group Leader · Compiles & designs diorama · Presenter: The Team & Historical Evolution of Goa', lead:true},
    {name:'Sarthak Kulkarni',roll:'__', task:'Research: Goa · Presenter: A Baker from Goa, Dances of the Soil & Goan Culture & Cuisine'},
    {name:'Advay Dabade',    roll:'__', task:'Research: Goa & Comparative Study · Presenter: Introduction to Goa & Dances of the Salon'},
    {name:'Dhruv Kumbhar',   roll:'__', task:'Research: Sikkim · Presenter: Introduction to Sikkim, Monastic Chaams & Historical Evolution of Sikkim'},
    {name:'Aditya Jagdale',  roll:'__', task:'Poster Artwork & References · Presenter: Dances of the Valleys & Sikkimese Culture & Cuisine'},
  ],
  outcomes: [
    {name:'Dhairya Shah',    text:'Learnt to turn research into a visual story, and saw how Goa\u2019s mandos actually record history \u2014 the events of 1854 and 1880 live on as songs.'},
    {name:'Sarthak Kulkarni',text:'Read \u201cA Baker from Goa\u201d as a cultural document: the pader\u2019s bread, the kabai and the village festivals still explain Goa today.'},
    {name:'Advay Dabade',    text:'Compared two very different states and found their common threads: rice, harvest, faith, masks and a home-made bread.'},
    {name:'Dhruv Kumbhar',   text:'Discovered that Sikkim\u2019s Chaams are prayer in motion, and how Lepcha, Bhutia and Nepali communities share one guardian mountain.'},
    {name:'Aditya Jagdale',  text:'Learnt design thinking and visual composition \u2014 colour harmony, traditional attire and landscape balance \u2014 while creating a poster that respects a living tradition.'},
  ],
};

const SLIDES = [
/* 0 ─ Title */
{ id:'title', panda:.46, items:[
  {type:'tag', x:150, y:0, w:560, len:62, physics:true, html:`
    <p class="kicker">Class ${DATA.klass} ${DATA.division} · English MAT · AIL Project</p>
    <h1>Glimpses of <em>India</em></h1>
    <span class="rule"></span>
    <p class="sub">Unit 5 · <b>A Baker from Goa</b> — and our paired state, Sikkim. A paper-cut journey from the Konkan coast to the Himalaya.</p>`},
  {type:'tag', x:1430, y:0, w:330, len:150, small:true, html:`
    <p class="kicker">Group ${DATA.group} · ${DATA.year}</p>
    <h1 style="font-size:40px">Goa <em style="font-size:.9em">& Sikkim</em></h1>
    <span class="rule"></span>
    <p class="sub">Folk dance · culture · food · a comparative study</p>`},
  {type:'note', x:640, y:912, html:`Eighteen plates, nine sheets of paper, one slow river — <b>walk right to begin →</b>`},
 ],
 scene:{ L2:[{a:.2,fig:'cottage'},{a:.8,fig:'cottage'}], L7:[{a:.25,fig:'burrow'},{a:.1,fig:'mushrooms',n:4},{a:.6,fig:'mushrooms',n:3},{a:.87,fig:'mushrooms',n:5},{a:.38,fig:'mushrooms',n:2}] } },

/* 1 ─ Chosen sub-unit */
{ id:'baker', panda:.57, items:[
  {type:'card', x:120, y:96, w:900, rot:-.5, pin:true, html:`
    <div class="speaker-tag">Presenter: Sarthak Kulkarni</div>
    <h2>A Baker from <em class="in">Goa</em></h2>
    <ul>
      <li>Goa\u2019s elders still speak nostalgically of the Portuguese days and the famous loaves of bread. The Portuguese have gone, but the baker — the <b>pader</b> — has survived.</li>
      <li>Mornings began with the <b>jingling thud of his bamboo staff</b>: children ran for <b>bread-bangles</b> (<i>kankonn</i>), the elders for loaves.</li>
      <li>He wore the <b>kabai</b>, a knee-length frock; later, trousers shorter than full-length pants — anyone dressed so was called a pader.</li>
      <li>Bread is woven into Goan life: <b>bol</b> at weddings, sandwiches for a daughter\u2019s engagement, <b>cakes and bolinhas</b> at Christmas.</li>
      <li>Baking kept the family well: the plump, \u201cjackfruit-like\u201d physique was proof that <b>the baker never starved</b>. Monthly accounts were pencilled on the wall.</li>
    </ul>`},
  {type:'note', x:1250, y:905, html:`The <b>pader</b> on his morning round — basket of poee, bamboo staff, bread-bangles`},
 ],
 scene:{ L7:[{a:.74,fig:'pader',s:2.7},{a:.62,fig:'breadBasket',s:1.6},{a:.9,fig:'coconutNut',s:1.6}], L5:[{a:.89,fig:'house',s:1.7}], L2:[{a:.6,fig:'house',s:.6}] } },

/* 2 ─ Group */
{ id:'group', panda:.86, items:[
  {type:'card', x:330, y:96, w:1260, rot:.4, pin:true, html:`
    <div class="speaker-tag">Presenter: Dhairya Shah</div>
    <h2>Class ${DATA.klass} ${DATA.division} · <em class="in">Group ${DATA.group}</em></h2>
    <table class="roster"><thead><tr><th>Member</th><th>Roll no.</th><th>Responsibility & Presentation Slides</th></tr></thead><tbody>
    ${DATA.members.map((m,i)=>`<tr class="row" style="--j:${i}"><td class="n">${m.name}${m.lead?'<span class="badge">Leader</span>':''}</td><td class="r">${m.roll}</td><td>${m.task}</td></tr>`).join('')}
    </tbody></table>
    <p class="note">The group poster was illustrated by Aditya Jagdale; presentation slides are shared across all members.</p>`},
 ],
 scene:{ L7:[{a:.06,fig:'conch',s:1.4},{a:.14,fig:'coconutNut',s:1.5}], L5:[{a:.1,fig:'palmTall'}], L4:[{a:.3,fig:'boat',s:.9}] } },

/* 3 ─ Introduction to Goa */
{ id:'goa', panda:.3, items:[
  {type:'card', x:880, y:84, w:920, rot:.5, pin:true, html:`
    <div class="speaker-tag">Presenter: Advay Dabade</div>
    <h2>Goa — <em class="in">Pearl of the Orient</em></h2>
    <ul>
      <li>India\u2019s <b>smallest state</b> (3,702 km²); capital <b>Panaji</b>; language <b>Konkani</b>, with Marathi and Portuguese still heard.</li>
      <li>Portuguese rule from <b>1510</b> to Liberation on <b>19 December 1961</b>; full statehood on 30 May 1987.</li>
      <li>The <b>Mandovi</b> and <b>Zuari</b> rivers, the Western Ghats to the east, 100 km of beaches to the west.</li>
      <li>Old Goa\u2019s churches — including the <b>Basilica of Bom Jesus</b> with the relics of St Francis Xavier — are a UNESCO World Heritage Site.</li>
      <li>Two faiths, one culture: Shigmo and Carnival, poee and pao, the <i>susegad</i> way of life.</li>
      <li>State symbols: gaur · flame-throated bulbul · red jasmine (frangipani) · matti tree.</li>
    </ul>`},
  {type:'note', x:130, y:905, html:`Whitewashed church, red-tiled <b>balcão</b> houses and a fishing canoe on the Mandovi`},
 ],
 scene:{ L5:[{a:.1,fig:'church',s:1.9},{a:.28,fig:'house',s:1.4}], L4:[{a:.42,fig:'boat',s:1.0}], L7:[{a:.1,fig:'boatBeach',s:1.5},{a:.26,fig:'conch',s:1.3},{a:.34,fig:'coconutNut',s:1.5},{a:.17,fig:'conch',s:1.1}], L2:[{a:.25,fig:'church',s:.65}] } },

/* 4 ─ Folk dances of Goa I */
{ id:'goadance1', panda:.64, items:[
  {type:'card', x:120, y:70, w:1000, rot:-.4, pin:true, html:`
    <div class="speaker-tag">Presenter: Sarthak Kulkarni</div>
    <h2>Dances of the <em class="in">soil</em></h2>
    <ul>
      <li><b>Fugdi</b> — women whirl in circles with no instruments: clapping and the breathy \u201cfu\u201d sound give the dance its name; Ganesh Chaturthi and <i>vrata</i> days.</li>
      <li><b>Dhalo</b> — slow women\u2019s dance of the Pausha month (Dec–Jan): two rows of up to twelve dancers face each other on moonlit nights.</li>
      <li><b>Ghode Modni</b> — the \u201chorse dance\u201d: warriors with dummy horses and swords recall the Rane fighters of Sattari and Bicholim, to dhol and tasha.</li>
      <li><b>Goff</b> — Shigmo dance of Canacona: dancers braid coloured cords around a pole and unbraid them without a single knot.</li>
      <li><b>Divlyam Nach</b> (lamp dance) — brass lamps balanced on the head to ghumot, samel and cymbals.</li>
      <li><b>Mussol Khel</b> — Chandor\u2019s pestle dance, performed by Christians of Kshatriya descent for a Hindu king\u2019s victory.</li>
      <li><b>Kunbi dance</b> — Goa\u2019s earliest settlers, in the red-checked Kunbi sari; <b>Perni Jagor</b> and <b>Dashavatar</b> — Goa\u2019s oldest mask theatre.</li>
    </ul>
    <p class="note">Also danced: Talgadi, Romat, Tonyamel, Veerabhadra, Dhangar and Morulo.</p>`},
  {type:'note', x:1270, y:905, html:`<b>Fugdi</b> whirl and a <b>Ghode Modni</b> horse-warrior at Shigmo`},
 ],
 scene:{ L7:[{a:.72,fig:'fugdiPair',s:2.5},{a:.9,fig:'ghodeModni',s:2.5},{a:.6,fig:'lampDiya',s:1.6}], L5:[{a:.9,fig:'palmTall'}] } },

/* 5 ─ Folk dances of Goa II */
{ id:'goadance2', panda:.44, items:[
  {type:'card', x:830, y:70, w:970, rot:.4, pin:true, html:`
    <div class="speaker-tag">Presenter: Advay Dabade</div>
    <h2>Dances of the <em class="in">salon</em></h2>
    <ul>
      <li><b>Mando</b> — slow, graceful song-dance in Konkani from Salcete\u2019s Catholic villages (Raia, Loutolim, Curtorim), from about <b>1840</b>; couples with fans and handkerchiefs, flowing into the brisker <b>Dulpod</b>.</li>
      <li><b>Dekhni</b> — \u201cbewitching beauty\u201d: a semi-classical dance of a temple dancer, Indian melody with Western harmony; <i>Hanv Saiba Poltoddi Vetam</i> (Carlos Eugenio Ferreira, 1895).</li>
      <li><b>Corridinho</b> — a Portuguese folk dance of six couples in a circle, quick and cheerful, at weddings and feasts.</li>
      <li><b>Carnival</b> (Intruz) — King Momo\u2019s parades, floats and street dances before Lent.</li>
      <li><b>Tiatr</b> — Konkani musical theatre, first staged in Bombay on <b>17 April 1892</b> by Lucasinho Ribeiro (<i>Italian Bhurgo</i>).</li>
      <li>Instruments: <b>ghumot</b> (clay-pot drum, Goa\u2019s heritage instrument since 2019), samel, kansalem, violin, guitar, mandolin.</li>
    </ul>`},
  {type:'note', x:120, y:905, html:`A <b>Mando</b> couple — fan, handkerchief and a velvet gown — with ghumot and violin`},
 ],
 scene:{ L7:[{a:.2,fig:'mandoCouple',s:2.5},{a:.37,fig:'ghumot',s:1.8},{a:.33,fig:'violin',s:1.6},{a:.06,fig:'carnivalMask',s:1.4}], L5:[{a:.12,fig:'house',s:1.8}] } },

/* 6 ─ Goan culture & cuisine */
{ id:'goaculture', panda:.66, items:[
  {type:'card', x:120, y:84, w:1080, rot:-.3, pin:true, html:`
    <div class="speaker-tag">Presenter: Sarthak Kulkarni</div>
    <h2>Festivals, <em class="in">food</em> and the Goan way</h2>
    <div class="cols3 small" style="margin-top:14px">
      <div><p class="cap">Festivals</p><ul>
        <li><b>Shigmo</b> — spring harvest parades, March</li><li><b>Carnival</b> — three days before Lent</li><li><b>Ganesh Chaturthi</b> — <i>Chavath</i>, with fugdi</li><li><b>São João</b> — 24 June, leaping into wells</li><li><b>Bonderam</b> — Divar island flag festival</li><li><b>Feast of St Francis Xavier</b> — 3 Dec</li></ul></div>
      <div><p class="cap">Food</p><ul>
        <li><b>Fish-curry-rice</b>, the daily meal</li><li><b>Poee & pao</b> — the pader\u2019s breads</li><li><b>Vindaloo, xacuti, sorpotel</b>, prawn balchão</li><li><b>Bebinca</b> — 7 to 16 layers; dodol; sannas</li><li><b>Sol kadhi</b> — kokum and coconut</li><li><b>Feni</b> — cashew or coconut, with urrak</li></ul></div>
      <div><p class="cap">Living</p><ul>
        <li><b>Konkani</b> song, mando and tiatr</li><li><b>Balcão</b> houses, azulejo tiles, Fontainhas</li><li><b>Kunbi sari</b> and the pano bhaju</li><li>Churches, temples and <b>tulsi vrindavans</b></li><li>Coconut, cashew and the Mandovi</li><li><b>Susegad</b> — contented, unhurried</li></ul></div>
    </div>`},
  {type:'note', x:1300, y:905, html:`Fish curry, poee, bebinca, feni and a coconut — a Goan table`},
 ],
 scene:{ L7:[{a:.78,fig:'foodGoa',s:1.9},{a:.93,fig:'coconutNut',s:1.5},{a:.6,fig:'conch',s:1.2}], L5:[{a:.88,fig:'church',s:1.6}], L2:[{a:.86,fig:'house',s:.55}] } },

/* 7 ─ Historical evolution: Goa */
{ id:'goahistory', panda:.72, items:[
  {type:'card', x:120, y:66, w:1150, rot:.3, pin:true, html:`
    <div class="speaker-tag">Presenter: Dhairya Shah</div>
    <h2>How Goa\u2019s dances <em class="in">evolved</em></h2>
    <div class="tl small" style="margin-top:10px">
      <div class="yr">Before 1510</div><div>Kunbi and Gawda tribal dances; temple traditions that seed the Dekhni; <b>Perni Jagor</b> mask theatre; Shigmo harvest processions with Ghode Modni and Goff.</div>
      <div class="yr">1510–1700s</div><div>Portuguese rule: church music, violin and guitar arrive; <b>Carnival</b> and <b>Corridinho</b> enter Catholic Goa; Mussol Khel survives conversion.</div>
      <div class="yr">c. 1840–1900</div><div>The <b>Mando</b> is born in Salcete salons — composers Arnaldo de Menezes (1863–1917), Torquato de Figueiredo, Gizelino Rebelo, Ligorio Costa.</div>
      <div class="yr">1892 · 1895</div><div>Lucasinho Ribeiro stages <i>Italian Bhurgo</i> — <b>Tiatr</b> begins; Carlos Eugenio Ferreira\u2019s <i>Hanv Saiba</i> becomes the Dekhni anthem.</div>
      <div class="yr">1961–1970</div><div>Liberation (19 Dec 1961); the first <b>Mando Festival</b> (Clube Nacional, 1965) takes the dance from drawing rooms to the public stage; <b>Kala Academy</b> founded (1970).</div>
      <div class="yr">Today</div><div>Shigmotsav and Carnival parades, Lokotsav, village <i>zatras</i>; the ghumot declared Goa\u2019s heritage instrument (2019).</div>
    </div>
    <p class="note" style="margin-top:12px"><b>Major exponents:</b> Arnaldo de Menezes, \u201cking of the mando\u201d · Lorna Cordeiro & Chris Perry (Konkani song) · Lucasinho Ribeiro & João Agostinho Fernandes (tiatr) · folk scholars Vinayak Khedekar & Pandurang Phaldesai · Kala Academy Goa.</p>`},
  {type:'note', x:1360, y:905, html:`Ghumot, samel and violin — and a <b>tiatr</b> stage`},
 ],
 scene:{ L7:[{a:.78,fig:'tiatrCurtain',s:1.9},{a:.9,fig:'ghumot',s:1.7},{a:.94,fig:'violin',s:1.5}] } },

/* 8 ─ Introduction to Sikkim */
{ id:'sikkim', panda:.4, items:[
  {type:'card', x:900, y:70, w:900, rot:-.4, pin:true, html:`
    <div class="speaker-tag">Presenter: Dhruv Kumbhar</div>
    <h2>Sikkim — the <em class="in">hidden valley</em></h2>
    <ul>
      <li>India\u2019s <b>22nd state</b> (16 May 1975); capital <b>Gangtok</b>; the second-smallest and least populous state.</li>
      <li>Home of <b>Khangchendzonga</b> (8,586 m), the world\u2019s third-highest peak and Sikkim\u2019s guardian deity; its national park is a UNESCO World Heritage Site (2016).</li>
      <li>Three communities — <b>Lepcha</b> (the first settlers), <b>Bhutia</b> (from Tibet, 13th–17th c.) and <b>Nepali</b> (since the 19th c.).</li>
      <li>Languages: Nepali, Bhutia, Lepcha, Limbu and English; Buddhism and Hinduism side by side.</li>
      <li>Monasteries of <b>Rumtek, Pemayangtse</b> (1705), Tashiding and Enchey; the Teesta and Rangit rivers.</li>
      <li>The world\u2019s first fully <b>organic state</b> (2016); India\u2019s largest cardamom grower; one tea garden, Temi.</li>
      <li>State symbols: <b>red panda</b> · blood pheasant · noble orchid · rhododendron.</li>
    </ul>`},
  {type:'note', x:130, y:905, html:`A gompa under the snows, prayer flags, a yak and rhododendron — and our guide, the <b>red panda</b>`},
 ],
 scene:{ L5:[{a:.23,fig:'gompa',s:1.9},{a:.33,fig:'flags'}], L7:[{a:.3,fig:'yak',s:2.2},{a:.47,fig:'chorten',s:1.5},{a:.06,fig:'rhodo',s:1},{a:.2,fig:'rhodo',s:.8}], L2:[{a:.3,fig:'gompa',s:.6}] } },

/* 9 ─ Folk dances of Sikkim I */
{ id:'sikdance1', panda:.6, items:[
  {type:'card', x:120, y:64, w:1000, rot:.4, pin:true, html:`
    <div class="speaker-tag">Presenter: Dhruv Kumbhar</div>
    <h2>Masks of the <em class="in">monastery</em></h2>
    <ul>
      <li><b>Singhi Chham</b> — the Snow Lion dance: two dancers inside a white, turquoise-maned lion honour Khangchendzonga; introduced by the 3rd Chogyal, <b>Chakdor Namgyal</b> (18th c.).</li>
      <li><b>Pang Toed Chaam</b> — warrior dance of <b>Pang Lhabsol</b> (15th day of the 7th Tibetan month) at Tsuklakhang, Gangtok; masked warriors salute the mountain god — choreographed, legend says, after the Chogyal\u2019s vision.</li>
      <li><b>Kagyed Chaam</b> — lamas\u2019 masked dance on the 28th–29th day of the 10th Tibetan month, before Losoong, burning away evil for the new year; Phodong, Tsuklakhang, Rumtek.</li>
      <li><b>Rumtek Chaam</b> & <b>Enchey Chaam</b> — Mahakala dance (10th day of the 5th month) and the Pang Lhabsol dances at Enchey.</li>
      <li><b>Yak Chham</b> — herders\u2019 tribute to the yak; two dancers inside a shaggy costume.</li>
      <li><b>Tashi Sabdo</b> welcomes guests with khada scarves; <b>Denzong Neh-Na</b> praises the hidden valley; <b>Lu Khangthamo</b> gives thanks at Losoong; <b>Be Yu Mista</b> and <b>Gha To Kito</b> sing of Sikkim\u2019s youth and beauty.</li>
    </ul>`},
  {type:'note', x:1250, y:905, html:`<b>Singhi Chham</b>, the snow lion, and a <b>Kagyed</b> dancer in a skull-crowned mask`},
 ],
 scene:{ L7:[{a:.72,fig:'snowLion',s:2.2},{a:.92,fig:'chaamDancer',s:2.4},{a:.6,fig:'butterLamp',s:1.8}], L5:[{a:.8,fig:'gompa',s:1.7},{a:.66,fig:'flags'}] } },

/* 10 ─ Folk dances of Sikkim II */
{ id:'sikdance2', panda:.5, items:[
  {type:'card', x:860, y:64, w:940, rot:-.4, pin:true, html:`
    <div class="speaker-tag">Presenter: Aditya Jagdale</div>
    <h2>Dances of the <em class="in">valleys</em></h2>
    <div class="cols small" style="margin-top:12px">
      <div><p class="cap">Lepcha</p><ul>
        <li><b>Zo-Mal-Lok</b> — sowing, reaping and harvesting paddy; men and women together with drum, flute and cymbal.</li>
        <li><b>Chu Faat</b> — worship of Khangchendzonga and its four peaks on the 15th day of the 7th Buddhist month, with butter lamps and bamboo leaves.</li>
        <li><b>Tendong Lho Rum Faat</b> — thanks to Tendong Hill, which saved the Lepchas from the great flood (8 August).</li>
        <li><b>Kinchum-Chu-Bomsa</b> — the beauty of Sikkim; <b>Mun</b> and <b>Bongthing</b> rituals.</li></ul></div>
      <div><p class="cap">Nepali</p><ul>
        <li><b>Maruni</b> — the oldest Nepali dance: Tihar and weddings, men in women\u2019s dress, the clown <i>Dhatu Waray</i>, the nine-piece <b>Naumati Baja</b>.</li>
        <li><b>Tamang Selo</b> — the Tamang <b>damphu</b> drum and <i>Hwai</i> songs; pioneered on record by Hira Devi Waiba.</li>
        <li><b>Chutkey</b>, lively and young; <b>Sorathi</b>, the tale of King Jaisingh; <b>Dhaan Naach</b> and <b>Chyabrung</b> of the Limbus.</li>
        <li><b>Sakela</b> (Chandi Naach) of the Rais; <b>Khukuri Naach</b>; <b>Sebru</b> of the Sherpas; <b>Ghatu</b> of the Gurungs.</li></ul></div>
    </div>`},
  {type:'note', x:120, y:905, html:`<b>Maruni</b> dancer, a <b>damphu</b> drummer and the Lepcha <b>Zo-Mal-Lok</b> harvest`},
 ],
 scene:{ L7:[{a:.24,fig:'maruni',s:2.5},{a:.38,fig:'drummer',s:2.4},{a:.15,fig:'lepchaPair',s:2.0},{a:.6,fig:'rhodo',s:.9}], L5:[{a:.34,fig:'flags'},{a:.26,fig:'hut',s:1.6}] } },

/* 11 ─ Sikkimese culture & cuisine */
{ id:'sikculture', panda:.66, items:[
  {type:'card', x:120, y:84, w:1120, rot:.3, pin:true, html:`
    <div class="speaker-tag">Presenter: Aditya Jagdale</div>
    <h2>Festivals, <em class="in">food</em> and mountain life</h2>
    <div class="cols3 small" style="margin-top:14px">
      <div><p class="cap">Festivals</p><ul>
        <li><b>Losar</b> — Tibetan New Year, February</li><li><b>Losoong / Namsoong</b> — harvest new year, with Kagyed</li><li><b>Saga Dawa</b> — Buddha\u2019s birth, enlightenment, nirvana</li><li><b>Pang Lhabsol</b> — the mountain\u2019s own festival</li><li><b>Bumchu</b> at Tashiding; <b>Dasain</b> & <b>Tihar</b></li><li>Maghe Sankranti, Sonam Lochar, Tendong Lho Rum Faat</li></ul></div>
      <div><p class="cap">Food</p><ul>
        <li><b>Momo</b> and <b>thukpa</b>, gya thuk</li><li><b>Phagshapa</b> — pork with radish and chillies</li><li><b>Gundruk & sinki</b> — fermented greens and radish</li><li><b>Kinema</b> (fermented soybean), <b>chhurpi</b> cheese</li><li><b>Sel roti</b> — ring-shaped rice bread of Tihar</li><li><b>Chhang / tongba</b> millet brew; Temi tea</li></ul></div>
      <div><p class="cap">Living</p><ul>
        <li><b>Bakhu</b> with honju and pangden (Bhutia)</li><li><b>Dumvum</b>, thokro-dum and the thyaktuk cap (Lepcha)</li><li><b>Daura-suruwal</b>, gunyu-cholo, dhaka topi (Nepali)</li><li>Thangka painting, <b>choktse</b> tables, dragon carpets</li><li>Prayer flags, chortens, <i>mani</i> walls</li><li>Damphu, madal, chyabrung, flute and long horns</li></ul></div>
    </div>`},
  {type:'note', x:1310, y:905, html:`Momos in a bamboo steamer, thukpa, sel roti, tongba and butter lamps`},
 ],
 scene:{ L7:[{a:.78,fig:'foodSikkim',s:1.9},{a:.94,fig:'rhodo',s:.9},{a:.62,fig:'prayerWheel',s:1.7}], L5:[{a:.8,fig:'gompa',s:1.6},{a:.66,fig:'flags'}] } },

/* 12 ─ Historical evolution: Sikkim */
{ id:'sikhistory', panda:.62, items:[
  {type:'card', x:120, y:60, w:1170, rot:-.3, pin:true, html:`
    <div class="speaker-tag">Presenter: Dhruv Kumbhar</div>
    <h2>How Sikkim\u2019s dances <em class="in">evolved</em></h2>
    <div class="tl small" style="margin-top:10px">
      <div class="yr">Earliest</div><div>Lepcha nature worship — <b>Mun</b> priestesses and <b>Bongthing</b> shamans; dances to the mountain, the hill and the paddy: Chu Faat, Tendong Lho Rum Faat, Zo-Mal-Lok.</div>
      <div class="yr">13th–15th c.</div><div>Bhutia migration from Tibet; the <b>blood-brotherhood</b> of Lepchas and Bhutias sworn at Kabi Longchok, with Khangchendzonga as witness.</div>
      <div class="yr">1642 · 1705</div><div>Phuntsog Namgyal crowned first <b>Chogyal</b> at Yuksom by three lamas; Buddhist <b>Chaam</b> masked dances arrive with the monasteries — Pemayangtse (1705).</div>
      <div class="yr">1700–1717</div><div>The 3rd Chogyal <b>Chakdor Namgyal</b> institutes <b>Pang Lhabsol</b> and its Pang Toed warrior dance; <b>Singhi Chham</b> follows in the 18th century.</div>
      <div class="yr">19th c.</div><div>Nepali settlers bring <b>Maruni, Tamang Selo, Sorathi, Sakela</b> and Chutkey; the Naumati Baja enters village life.</div>
      <div class="yr">1975 → today</div><div>Statehood; Cultural Affairs & Heritage Department troupes; Namsoong and Losar in Gangtok; Pang Lhabsol a public holiday; folk dances at the Red Panda Winter Carnival.</div>
    </div>
    <p class="note" style="margin-top:12px"><b>Major exponents:</b> Sonam Tshering Lepcha (Padma Shri 2007 — 400 songs, 102 folk dances, reviver of Lepcha culture) · Hira Devi Waiba (1940–2011, first recorded Tamang Selo, <i>Chura ta Hoina Astura</i>) · the lamas of Tsuklakhang, Rumtek, Enchey and Pemayangtse, keepers of the Chaams.</p>`},
  {type:'note', x:1370, y:905, html:`Chorten, prayer wheels and a Lepcha <b>hut</b>`},
 ],
 scene:{ L7:[{a:.84,fig:'chorten',s:1.9},{a:.7,fig:'prayerWheel',s:1.8},{a:.74,fig:'prayerWheel',s:1.8},{a:.54,fig:'rhodo',s:.8}], L5:[{a:.78,fig:'hut',s:1.7},{a:.66,fig:'flags'}] } },

/* 13 ─ Poster */
{ id:'poster', panda:.78, items:[
  {type:'card', x:100, y:120, w:540, rot:-.6, pin:true, html:`
    <h2>Promoting the folk dance of <em>Sikkim</em></h2>
    <span class="rule left"></span>
    <p style="margin-top:14px;line-height:1.55">Handmade poster artwork illustrated by <b>Aditya Jagdale</b> (Group 3), inviting everyone to celebrate Sikkim\u2019s living folk dance traditions.</p>
    <p style="margin-top:12px;line-height:1.55">Depicting dancers in authentic traditional dress performing before Mount Kanchenjunga, fluttering Buddhist prayer flags (<i>lungta</i>), valley huts, and a golden monastery chorten.</p>`},
  {type:'poster', x:680, y:70, w:1140, h:840},
 ],
 scene:{ L7:[{a:.34,fig:'butterLamp',s:1.8},{a:.84,fig:'butterLamp',s:1.8},{a:.28,fig:'rhodo',s:.8}], L5:[{a:.34,fig:'flags'},{a:.22,fig:'hut',s:1.6},{a:.66,fig:'flags'}] } },

/* 14 ─ Comparative study */
{ id:'compare', panda:.2, items:[
  {type:'card', x:120, y:56, w:1680, rot:.2, pin:true, html:`
    <h2 style="font-size:40px">Goa and Sikkim, <em class="in">side by side</em></h2>
    <table class="cmp" style="margin-top:8px"><thead><tr><th></th><th>Goa <em>· coast</em></th><th>Sikkim <em>· mountain</em></th><th class="th">What we noticed</th></tr></thead><tbody>
      <tr class="row" style="--j:0"><td>Dance</td><td>Circle dances of women (Fugdi, Dhalo); warrior and harvest dances (Ghode Modni, Goff); Indo-Portuguese Mando, Dekhni, Corridinho. Ghumot, samel, violin.</td><td>Masked monastic Chaams (Singhi, Pang Toed, Kagyed); Lepcha harvest dances (Zo-Mal-Lok, Chu Faat); Nepali Maruni, Tamang Selo, Sakela. Damphu, madal, cymbals, long horns.</td><td class="th">Both grow out of harvest and worship. Goa\u2019s Perni Jagor and Carnival masks meet Sikkim\u2019s Chaam masks; Ghode Modni and Pang Toed are both warrior dances with a legend behind them.</td></tr>
      <tr class="row" style="--j:1"><td>Culture</td><td>Hindu–Catholic blend; Konkani; balcão houses and azulejos; Shigmo and Carnival in the same spring; <i>susegad</i>.</td><td>Buddhist–Hindu–animist blend; Lepcha, Bhutia and Nepali; monasteries, chortens and prayer flags; Losar, Dasain and Pang Lhabsol; reverence for the mountain.</td><td class="th">Layered faiths living together; two calendars of festivals; nature at the centre — the sea and coconut in Goa, the peak and rhododendron in Sikkim.</td></tr>
      <tr class="row" style="--j:2"><td>Food</td><td>Rice and fish curry; coconut, kokum, vinegar and chillies — vindaloo, xacuti, bebinca; <b>poee</b> bread; <b>feni</b>.</td><td>Rice and millet; fermented gundruk, kinema and chhurpi; momo and thukpa; <b>sel roti</b>; <b>chhang</b> and tongba.</td><td class="th">Rice is the staple in both; each has a signature bread (poee / sel roti) and a home-brewed drink (feni / chhang); both preserve food cleverly — pickling by the sea, fermenting in the cold.</td></tr>
    </tbody></table>`},
 ],
 scene:{ L7:[{a:.04,fig:'conch',s:1.2},{a:.96,fig:'rhodo',s:.9}], L5:[{a:.22,fig:'church',s:1.5},{a:.78,fig:'gompa',s:1.5},{a:.66,fig:'flags'}], L2:[{a:.15,fig:'church',s:.55},{a:.85,fig:'gompa',s:.55}] } },

/* 15 ─ Learning outcomes */
{ id:'outcomes', mode:'night', panda:.2, items:[
  {type:'card', x:150, y:70, w:1620, rot:-.2, pin:true, html:`
    <h2 style="font-size:40px">What each of us <em class="in">took home</em></h2>
    <div class="grid5" style="margin-top:14px">
      ${DATA.outcomes.map((o,i)=>`<div class="mini" style="--j:${i};--mclip:${['polygon(1% 3%,99% 0,100% 97%,2% 100%)','polygon(0 0,98% 2%,100% 100%,1% 98%)','polygon(2% 0,100% 3%,98% 100%,0 97%)','polygon(0 2%,99% 0,100% 98%,1% 100%)','polygon(1% 0,100% 1%,99% 99%,0 100%)'][i]}"><p class="who">${o.name}<span>Member ${i+1}</span></p>${o.text}</div>`).join('')}
      <div class="mini" style="--j:5;--mclip:polygon(0 1%,99% 0,100% 99%,1% 100%)"><p class="who">Together<span>Group</span></p>Research, writing, design and speaking were shared; we peer-assessed each other\u2019s part, and learnt to disagree politely and finish on time.</div>
    </div>`},
 ],
 scene:{ L2:[{a:.3,fig:'cottage'},{a:.78,fig:'cottage'}], L7:[{a:.08,fig:'mushrooms',n:4},{a:.9,fig:'mushrooms',n:3}] } },

/* 16 ─ Reflective summary & conclusion */
{ id:'reflection', mode:'night', panda:.22, items:[
  {type:'card', x:330, y:80, w:1260, rot:.3, pin:true, html:`
    <h2>What the journey <em class="in">taught us</em></h2>
    <ul>
      <li>A chapter about a village baker opened into a whole culture: <b>bread, dance and festival are how a community remembers itself</b> — in Goa through the pader and the mando, in Sikkim through the Chaam and the sel roti.</li>
      <li>Two states that could not look more different share the same roots — <b>harvest, faith and the land</b> — which is why <i>Ek Bharat Shreshtha Bharat</i> pairings make sense: difference on the surface, kinship underneath.</li>
      <li>Folk dances are living history books: the Ghode Modni and the Pang Toed Chaam both keep a <b>warrior\u2019s story</b> alive; both states also keep <b>mask traditions</b> that are centuries old.</li>
      <li>We learnt to <b>research responsibly</b> — checking dates, names and spellings, and citing where we read them — and to turn that research into a design others can enjoy.</li>
      <li>Collaboration meant dividing work by strength, giving honest peer feedback, and <b>speaking for at least a minute each</b> with confidence about our part.</li>
      <li>Above all, we learnt <b>respect</b>: for the baker\u2019s craft, the lama\u2019s dance and the many Indias that fit inside one classroom.</li>
    </ul>`},
 ],
 scene:{ L7:[{a:.9,fig:'mushrooms',n:3},{a:.3,fig:'mushrooms',n:2}] } },

/* 17 ─ References & thank you */
{ id:'thanks', mode:'night', panda:.68, items:[
  {type:'card', x:80, y:50, w:1000, rot:-.4, pin:true, cls:'sources-card', html:`
    <h3>Sources & References</h3>
    <ul class="small">
      <li>Rodrigues, Lucio. \u201cA Baker from Goa\u201d, <i>First Flight</i> (Class X), NCERT.</li>
      <li>Directorate of Art & Culture / Goa Tourism — folk dances of Goa; <i>Gomantak Times</i>, \u201cPopular folk dances of Goa\u201d (2024).</li>
      <li>Monteiro, K., \u201cMando festival: preserving the cultural heritage of Goa\u201d, <i>The Goan</i> (2021); Tiatr Academy of Goa, \u201cHistory of Tiatr\u201d.</li>
      <li>Gangtok District, Government of Sikkim — \u201cCulture, music and folk dances\u201d; Sikkim Tourism, festivals of Sikkim.</li>
      <li><i>India Today NE</i> — \u201cSikkim marks Pang Lhabsol\u201d (2025); \u201cFolk artiste Sonam Tshering Lepcha passes away\u201d (2020).</li>
      <li><i>Travel + Leisure Asia</i> — \u201cPang Lhabsol festival in Sikkim\u201d (2022); Vajiram & Ravi, \u201cFolk dances of Sikkim\u201d.</li>
      <li>Wikipedia — <i>Sikkim</i>; <i>Music of Sikkim</i>; <i>Goa</i>; Hira Devi Waiba.</li>
    </ul>
    <p class="note">Artwork: hand-coded paper-cut SVG, after \u201cFoxglove Hollow\u201d, a paper diorama. Handmade poster by Aditya Jagdale.</p>`},
  {type:'tag', x:650, y:0, w:620, len:130, physics:true, cls:'thanks-tag', html:`
    <h1 style="font-size:74px;line-height:.95">Thank <em>you</em></h1>
    <span class="rule" style="margin:16px auto;width:60px"></span>
    <p class="sub" style="font-size:20px;max-width:32ch;margin:16px auto 0;line-height:1.45">Dev borem korum · Thuche · \u0927\u0928\u094d\u092f\u0935\u093e\u0926<br>Class ${DATA.klass} ${DATA.division} · Group ${DATA.group}</p>
    <div style="margin-top:30px">
      <button type="button" class="sources-btn" id="sourcesToggleBtn" aria-expanded="false">
        <span class="sources-btn-label">Sources & References</span>
        <span class="sources-btn-icon">↓</span>
      </button>
    </div>`},
 ],
 scene:{ L2:[{a:.25,fig:'cottage'},{a:.7,fig:'cottage'}], L7:[{a:.8,fig:'burrow'},{a:.5,fig:'mushrooms',n:3},{a:.12,fig:'mushrooms',n:4}] } },
];
