import fs from 'node:fs';
import vm from 'node:vm';
import {parseHTML} from 'linkedom';
const routes={Main:'/',Etalon:'/solutions/etalon',Quality:'/solutions/quality',Supply:'/solutions/supply'};
const titles={Main:'РТ-Техприёмка — решения для промышленности',Etalon:'Эталон — датчики и оборудование',Quality:'Кволити+ — сертификация, экология и обучение',Supply:'РТ-Техпоставка — снабжение предприятий'};
const esc=s=>String(s??'').replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
for(const name of Object.keys(routes)){
 let source=fs.readFileSync(`source/dc-local/${name}.dc.html`,'utf8').replaceAll('../../assets/','/assets/');
 for(const [n,r] of Object.entries(routes)) source=source.replaceAll(`${n}.dc.html`,r);
 source=source.replaceAll('70 лет экспертизы','Почти 70 лет экспертизы');
 const {document}=parseHTML(source);const script=document.querySelector('script[data-dc-script]');
 const props=Object.fromEntries(Object.entries(JSON.parse(script.getAttribute('data-props')||'{}')).filter(([k,v])=>v.default!==undefined).map(([k,v])=>[k,v.default]));
 let logic=script.textContent.replaceAll('if (v && v.duration)', 'if (v && v.duration && !window.matchMedia("(prefers-reduced-motion: reduce)").matches)');
 const context={DCLogic:class{constructor(props){this.props=props;}setState(s){Object.assign(this.state,s);}},window:{innerHeight:900,innerWidth:1440,scrollY:0},document:{getElementById:()=>null,querySelectorAll:()=>[]},console};
 vm.createContext(context);vm.runInContext(logic+';globalThis.Page=Component',context);const page=new context.Page(props);const vals=page.renderVals();
 const css=document.querySelector('style').textContent;const root=document.querySelector('x-dc');root.querySelector('helmet')?.remove();root.querySelector('script')?.remove();
 const staticFlags=/^(is[A-Z]|hc[A-Z]|cta[A-Z]|ab(Split|Reel|Scene|Bento|Tiles|Chain|Photo|List)|sv(Head|Rows|Tabs|Acc|Cols|Stack)|imp[A-E]|why[A-Z]|verb[A-Z])/;
 for(const el of [...root.querySelectorAll('sc-if')]){const k=el.getAttribute('value')?.match(/^{{\s*(\w+)\s*}}$/)?.[1];if(k&&staticFlags.test(k)){if(!vals[k])el.remove();else el.replaceWith(...el.childNodes);}}
 let id=0;const bindings=[];
 const get=(key,scope)=>{const parts=key.trim().split('.');let v=scope[parts[0]]??vals[parts[0]];for(const p of parts.slice(1))v=v?.[p];return v;};
 const replace=(s,scope)=>s.replace(/{{\s*([^{}]+)\s*}}/g,(_,key)=>{const v=get(key,scope);return typeof v==='function'?'':String(v??'');});
 function walk(node,scope={},paths={}){
  if(node.nodeType===3){if(node.textContent.includes('{{')){const span=document.createElement('span');span.setAttribute('data-bind',String(++id));bindings.push({id,kind:'text',template:node.textContent,paths});span.textContent=replace(node.textContent,scope);node.replaceWith(span);}return;}
  if(node.nodeType!==1)return;
  if(node.localName==='sc-for'){const expr=node.getAttribute('list').match(/{{\s*(.*?)\s*}}/)[1];const alias=node.getAttribute('as');const list=get(expr,scope)||[];const original=[...node.childNodes];node.replaceChildren();list.forEach((item,index)=>{const path=expr.split('.');const full=paths[path[0]]?[...paths[path[0]],...path.slice(1),index]:[...path,index];original.forEach(child=>{const clone=child.cloneNode(true);node.append(clone);walk(clone,{...scope,[alias]:item},{...paths,[alias]:full});});});node.removeAttribute('list');return;}
  if(node.localName==='sc-if'){const template=node.getAttribute('value');node.setAttribute('data-bind',String(++id));bindings.push({id,kind:'if',template,paths});node.hidden=!get(template.match(/{{\s*(.*?)\s*}}/)[1],scope);node.removeAttribute('value');}
  for(const attr of [...node.attributes]){if(attr.name.startsWith('hint-')){node.removeAttribute(attr.name);continue;}if(attr.value.includes('{{')){let bid=node.getAttribute('data-bind');if(!bid){bid=String(++id);node.setAttribute('data-bind',bid);}const event=attr.name.toLowerCase().startsWith('on')?attr.name.slice(2).toLowerCase():null;bindings.push({id:Number(bid),kind:event?'event':'attr',attr:attr.name,event,template:attr.value,paths});if(event)node.removeAttribute(attr.name);else node.setAttribute(attr.name,replace(attr.value,scope));}}
  if(node.localName==='a'&&node.getAttribute('href')==='#'){node.removeAttribute('href');node.setAttribute('aria-disabled','true');node.setAttribute('title','Раздел пока не подготовлен');node.classList.add('placeholder-link');}
  if(node.localName==='header'){const logo=node.querySelector('a');if(logo){logo.setAttribute('href','/');logo.removeAttribute('aria-disabled');logo.classList.remove('placeholder-link');}}
  if(node.localName==='img'&&!node.hasAttribute('alt'))node.setAttribute('alt','Иллюстрация (ИИ)');
  if(['svcStack','abSceneSec','whyKinPin','impPin'].includes(node.id))node.classList.add('mobile-flow');
  if(node.getAttribute('style')?.includes('min-width: 1024px'))node.setAttribute('style',node.getAttribute('style').replace('min-width: 1024px;',''));
  [...node.childNodes].forEach(child=>walk(child,scope,paths));
 }
 [...root.childNodes].forEach(n=>walk(n));
 for(const form of root.querySelectorAll('form')){const note=document.createElement('p');note.className='form-demo';note.textContent='Демонстрационная форма: заявки не отправляются. Приём заявок ещё не подключён.';form.prepend(note);}
 const header=root.querySelector('header')?.outerHTML||'';const footer=root.querySelector('footer')?.outerHTML||'';root.querySelector('header')?.remove();root.querySelector('footer')?.remove();fs.writeFileSync(`src/generated/${name}.json`,JSON.stringify({html:root.innerHTML,header,footer,css,bindings,props}));
 fs.writeFileSync(`public/${name.toLowerCase()}.js`,logic.replace('extends DCLogic','extends PageLogic')+`\nexport default Component;\n`);
 const file=name==='Main'?'src/pages/index.astro':`src/pages/solutions/${name.toLowerCase()}.astro`;
 const prefix=name==='Main'?'../':'../../';
 fs.writeFileSync(file,`---\nimport Page from '${prefix}components/Page.astro';\nimport data from '${prefix}generated/${name}.json';\n---\n<Page data={data} title=${JSON.stringify(titles[name])} name=${JSON.stringify(name)} />\n`);
 console.log(`${routes[name]}: ${bindings.length} reactive bindings; approved defaults`,props);
}
