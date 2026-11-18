/* Lucifer.net — escaparate. Los productos vienen de productos.json (se editan en /admin con Decap CMS). */
(function(){
const PROFILE="https://www.vinted.es/member/69403560-lucymarblan";
let state={items:[]};
let cat="all", sort="new", dir=1, size="";
const $=id=>document.getElementById(id);
const el=(tag,cls,txt)=>{const e=document.createElement(tag); if(cls) e.className=cls; if(txt!=null) e.textContent=txt; return e;};
const num=v=>{const n=parseFloat(String(v??"").replace(",",".")); return isFinite(n)?n:0;};
const eur=n=>num(n).toLocaleString("es-ES",{minimumFractionDigits:2,maximumFractionDigits:2})+" €";
const prot=n=>Math.round((num(n)*1.05+0.70)*100)/100;
const imgsOf=it=>(Array.isArray(it.imgs)?it.imgs:[]).map(x=>typeof x==="string"?x:(x&&(x.img||x.src))||"").filter(Boolean);
const tagsOf=it=>Array.isArray(it.tags)?it.tags:[];
const isHand=it=>tagsOf(it).includes("Hecho a mano 🪡")||/hecho a mano|handmade/i.test(it.brand||"");

function gallery(it,big){
  const pics=imgsOf(it);
  const wrap=el("div","phwrap"), gal=el("div","gal");
  pics.forEach((src,k)=>{const im=el("img"); im.src=src; im.alt=it.title+(pics.length>1?" (foto "+(k+1)+")":""); if(!big){im.loading="lazy"; im.onclick=()=>openDetail(it);} gal.appendChild(im);});
  wrap.appendChild(gal);
  if(pics.length>1){
    const go=k=>{ k=(k+pics.length)%pics.length; gal.scrollTo({left:k*gal.clientWidth,behavior:"smooth"}); };
    const cur=()=>Math.round(gal.scrollLeft/gal.clientWidth);
    const d=el("div","dots");
    pics.forEach((_,k)=>{const i=el("i",k?"":"on"); i.title="Foto "+(k+1); i.onclick=e=>{e.stopPropagation(); go(k);}; d.appendChild(i);});
    gal.addEventListener("scroll",()=>{const k=cur(); [...d.children].forEach((x,j)=>x.className=j===k?"on":"");},{passive:true});
    const prev=el("button","nav prev","‹"), next=el("button","nav next","›");
    prev.type=next.type="button"; prev.setAttribute("aria-label","Foto anterior"); next.setAttribute("aria-label","Foto siguiente");
    prev.onclick=e=>{e.stopPropagation(); go(cur()-1);}; next.onclick=e=>{e.stopPropagation(); go(cur()+1);};
    wrap.append(d,prev,next);
    if(big) wrap.tabIndex=-1, wrap.onkeydown=e=>{ if(e.key==="ArrowLeft") go(cur()-1); if(e.key==="ArrowRight") go(cur()+1); };
  }
  return wrap;
}
function priceBlock(it){
  const box=el("div"); const p=el("div","prices");
  p.appendChild(el("span","price",eur(it.price)));
  if(num(it.was)>num(it.price)) p.appendChild(el("span","was",eur(it.was)));
  box.append(p, el("div","prot",eur(prot(it.price))+" con protección"));
  return box;
}
function buyBox(it,compact){
  const two=compact&&it.depop; const w=el("div",two?"buys two":"buys");
  const v=el("a","btn",compact?(two?"Vinted ♡":"Comprar en Vinted ♡"):"Comprar en Vinted ♡");
  if(compact) v.classList.add("one");
  v.href=it.url||PROFILE; v.target="_blank"; v.rel="noopener"; w.appendChild(v);
  if(it.depop){const d=el("a","btn ghost",two?"Depop ✧":"Comprar en Depop ✧"); d.href=it.depop; d.target="_blank"; d.rel="noopener"; w.appendChild(d);}
  return w;
}

function render(){
  const avail=state.items.filter(i=>!i.sold);
  const sizes=[...new Set(avail.map(i=>(i.size||"").trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"es"));
  if(size&&!sizes.includes(size)) size="";
  const sel=$("sizeSel"); sel.textContent=""; sel.appendChild(new Option("Todas las tallas",""));
  sizes.forEach(s=>sel.appendChild(new Option(s,s))); sel.value=size; sel.hidden=sizes.length<2&&!size;

  let list=avail.filter(it=>cat==="all"||(cat==="hand"?isHand(it):(it.cat||"Ropa")===cat)).filter(it=>!size||(it.size||"").trim()===size);
  if(sort==="price") list=list.slice().sort((a,b)=>dir*(num(a.price)-num(b.price)));
  $("count").textContent=avail.length+(avail.length===1?" prenda":" prendas");
  const g=$("grid"); g.textContent="";
  $("empty").hidden=list.length>0;
  $("empty").textContent=avail.length?"Nada por aquí con ese filtro ✧ Prueba con otro.":"Todavía no hay prendas a la vista ✧ Vuelve pronto.";
  for(const it of list){
    const c=el("article","card");
    c.appendChild(gallery(it,false));
    const tg=tagsOf(it); if(tg.length) c.appendChild(el("span","stk",tg[0]));
    const bd=el("div","body");
    const op=el("button","open"); op.type="button"; op.onclick=()=>openDetail(it);
    op.append(el("p","t",it.title), el("div","meta",[it.size,it.condition].filter(Boolean).join(" · ")));
    bd.append(op, priceBlock(it), buyBox(it,true));
    c.appendChild(bd); g.appendChild(c);
  }
  const sold=state.items.filter(i=>i.sold);
  $("soldSec").hidden=!sold.length;
  const sg=$("soldGrid"); sg.textContent="";
  for(const it of sold){
    const b=el("button"); b.type="button"; b.setAttribute("aria-label",it.title+", vendido");
    const im=el("img"); im.src=imgsOf(it)[0]||""; im.alt=""; im.loading="lazy";
    b.append(im, el("span",null,"vendido")); b.onclick=()=>openDetail(it); sg.appendChild(b);
  }
}

document.querySelectorAll("[data-cat]").forEach(b=>b.onclick=()=>{cat=b.dataset.cat; document.querySelectorAll("[data-cat]").forEach(x=>x.setAttribute("aria-pressed",x===b)); render();});
document.querySelectorAll("[data-sort]").forEach(b=>b.onclick=()=>{
  if(b.dataset.sort==="price") dir=sort==="price"?-dir:1;
  sort=b.dataset.sort;
  $("sortBtn").textContent=dir>0?"Precio ↑":"Precio ↓";
  $("sortBtn").title=dir>0?"De más barato a más caro":"De más caro a más barato";
  document.querySelectorAll("[data-sort]").forEach(x=>x.setAttribute("aria-pressed",x===b)); render();});
$("sizeSel").onchange=e=>{size=e.target.value; render();};

const dlg=$("dlg");
function openDetail(it){
  const sh=$("sheet"); sh.textContent="";
  const x=el("button","x","✕"); x.type="button"; x.setAttribute("aria-label","Cerrar"); x.onclick=closeDetail;
  sh.append(x, gallery(it,true));
  const b=el("div","sbody");
  const tg=tagsOf(it).slice(); if(it.sold) tg.unshift("Vendido ♡");
  if(tg.length){const t=el("div","tags"); tg.forEach(s=>t.appendChild(el("span",null,s))); b.appendChild(t);}
  b.appendChild(el("h2",null,it.title));
  b.appendChild(priceBlock(it));
  if(it.desc) b.appendChild(el("p","desc",it.desc));
  const dl=el("dl");
  [["Talla",it.size],["Estado",it.condition],["Marca",it.brand],["Tipo",it.cat],["Medidas",it.meas]].forEach(([k,v])=>{if(v) dl.append(el("dt",null,k),el("dd",null,v));});
  b.appendChild(dl);
  if(!it.sold) b.appendChild(buyBox(it,false));
  sh.appendChild(b);
  try{dlg.showModal();}catch(_){dlg.setAttribute("open","");}
  sh.scrollTop=0;
  const pw=sh.querySelector(".phwrap"); if(pw&&pw.tabIndex===-1) pw.focus({preventScroll:true});
}
function closeDetail(){ if(dlg.open) dlg.close(); }
dlg.addEventListener("click",e=>{ if(e.target===dlg) closeDetail(); });

$("empty").hidden=false; $("empty").textContent="Cargando el armario…";
fetch("/productos.json",{cache:"no-cache"})
  .then(r=>{ if(!r.ok) throw new Error(r.status); return r.json(); })
  .then(d=>{ state={items:Array.isArray(d&&d.items)?d.items:[]}; render(); })
  .catch(()=>{ $("empty").hidden=false; $("empty").textContent="No se ha podido cargar el armario. Recarga la página en un momento."; });
})();
