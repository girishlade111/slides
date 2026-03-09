import type { SlideData } from '@/data/slides';

export interface HTMLExportOptions {
  includeNavigation: boolean;
  autoAdvance: boolean;
  autoAdvanceInterval: number;
  presentationName: string;
}

function bgCSS(bg?: SlideData['background']): string {
  if (!bg) return 'background:#ffffff;';
  if (bg.type === 'color') return `background:${bg.color || '#ffffff'};`;
  if (bg.type === 'gradient' && bg.gradient) {
    const stops = bg.gradient.stops.map(s => `${s.color} ${s.position}%`).join(',');
    return `background:linear-gradient(${bg.gradient.angle}deg,${stops});`;
  }
  return 'background:#ffffff;';
}

function escapeHTML(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function exportToHTML(slides: SlideData[], options: HTMLExportOptions): void {
  const { includeNavigation, autoAdvance, autoAdvanceInterval, presentationName } = options;

  const slidesJSON = JSON.stringify(
    slides.map((s) => ({
      id: s.id,
      bg: bgCSS(s.background),
      objects: s.objects.map((o) => ({
        type: o.type,
        text: o.text,
        x: o.x,
        y: o.y,
        w: o.width,
        h: o.height,
        fontSize: o.fontSize || 24,
        fontFamily: o.fontFamily || 'sans-serif',
        color: o.color || '#000000',
        fontWeight: o.fontWeight || 'normal',
        fontStyle: o.fontStyle || 'normal',
        textDecoration: o.textDecoration || 'none',
        align: o.align || 'left',
        shapeType: o.shapeType,
        fill: o.fill,
        stroke: o.stroke,
        strokeWidth: o.strokeWidth,
        src: o.src,
        rotation: o.rotation || 0,
      })),
    }))
  );

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${escapeHTML(presentationName)}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#000;overflow:hidden;font-family:sans-serif}
#stage{width:100vw;height:100vh;display:flex;align-items:center;justify-content:center}
.slide{width:960px;height:540px;position:relative;overflow:hidden;border-radius:4px}
.obj{position:absolute;white-space:pre-wrap;word-wrap:break-word}
.nav{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);display:flex;gap:12px;z-index:10}
.nav button{padding:8px 20px;background:rgba(255,255,255,.15);color:#fff;border:1px solid rgba(255,255,255,.25);border-radius:6px;cursor:pointer;font-size:14px;backdrop-filter:blur(8px)}
.nav button:hover{background:rgba(255,255,255,.25)}
.counter{position:fixed;bottom:24px;right:24px;color:rgba(255,255,255,.5);font-size:13px;z-index:10}
@media(min-width:1200px){.slide{width:1280px;height:720px}}
@media(min-width:1920px){.slide{width:1920px;height:1080px}}
</style>
</head>
<body>
<div id="stage"><div class="slide" id="slideEl"></div></div>
${includeNavigation ? '<div class="nav"><button onclick="go(-1)">◀ Previous</button><button onclick="go(1)">Next ▶</button></div>' : ''}
<div class="counter" id="counter"></div>
<script>
var slides=${slidesJSON};
var idx=0;
var SW=960,SH=540;
function scaleSlide(){
  var el=document.getElementById('slideEl');
  var vw=window.innerWidth,vh=window.innerHeight;
  var s=Math.min(vw/SW,vh/SH);
  el.style.transform='scale('+s+')';
  el.style.transformOrigin='center center';
  el.style.width=SW+'px';el.style.height=SH+'px';
}
function render(){
  var s=slides[idx],el=document.getElementById('slideEl');
  el.setAttribute('style',s.bg+'position:relative;overflow:hidden;');
  scaleSlide();
  var html='';
  s.objects.forEach(function(o){
    var style='position:absolute;left:'+o.x+'px;top:'+o.y+'px;width:'+o.w+'px;height:'+o.h+'px;';
    if(o.rotation)style+='transform:rotate('+o.rotation+'deg);';
    if(o.type==='shape'){
      style+='background:'+(o.fill||'#60A5FA')+';';
      if(o.stroke)style+='border:'+((o.strokeWidth||2))+'px solid '+o.stroke+';';
      if(o.shapeType==='circle')style+='border-radius:50%;';
      html+='<div style="'+style+'"></div>';
    }else if(o.type==='image'&&o.src){
      html+='<img src="'+o.src+'" style="'+style+'object-fit:contain;" />';
    }else{
      style+='font-size:'+o.fontSize+'px;font-family:'+o.fontFamily+';color:'+o.color+';';
      style+='font-weight:'+o.fontWeight+';font-style:'+o.fontStyle+';text-decoration:'+o.textDecoration+';text-align:'+o.align+';';
      html+='<div class="obj" style="'+style+'">'+o.text.replace(/</g,'&lt;')+'</div>';
    }
  });
  el.innerHTML=html;
  document.getElementById('counter').textContent=(idx+1)+' / '+slides.length;
}
function go(d){idx=Math.max(0,Math.min(slides.length-1,idx+d));render();}
document.addEventListener('keydown',function(e){
  if(e.key==='ArrowRight'||e.key===' ')go(1);
  if(e.key==='ArrowLeft')go(-1);
  if(e.key==='Escape'&&document.fullscreenElement)document.exitFullscreen();
  if(e.key==='f')document.documentElement.requestFullscreen();
});
window.addEventListener('resize',scaleSlide);
render();
${autoAdvance ? `setInterval(function(){go(1);},${autoAdvanceInterval * 1000});` : ''}
</script>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${presentationName}.html`;
  a.click();
  URL.revokeObjectURL(url);
}
