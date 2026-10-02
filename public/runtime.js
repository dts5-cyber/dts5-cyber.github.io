const config=JSON.parse(document.getElementById('page-data').textContent);
let instance, queued=false, values;
const nodes=new Map([...document.querySelectorAll('[data-bind]')].map(n=>[Number(n.dataset.bind),n]));
function value(key,paths){const parts=key.trim().split('.');const full=paths[parts[0]]?[...paths[parts[0]],...parts.slice(1)]:parts;return full.reduce((v,k)=>v?.[k],values);}
function interpolate(template,paths){return template.replace(/{{\s*([^{}]+)\s*}}/g,(_,k)=>String(value(k,paths)??''));}
function update(){queued=false;values=instance.renderVals();for(const b of config.bindings){const n=nodes.get(b.id);if(!n)continue;if(b.kind==='event')continue;if(b.kind==='if'){n.hidden=!value(b.template.match(/{{\s*(.*?)\s*}}/)[1],b.paths);}else if(b.kind==='text'){const t=interpolate(b.template,b.paths);if(n.textContent!==t)n.textContent=t;}else{const t=interpolate(b.template,b.paths);if(b.attr==='href'&&t==='#'){n.removeAttribute('href');n.setAttribute('aria-disabled','true');n.classList.add('placeholder-link');}else if(n.getAttribute(b.attr)!==t)n.setAttribute(b.attr,t);}}}
class PageLogic{constructor(props){this.props=props;}setState(patch){if(patch.sent){patch={...patch,sent:false};document.querySelector('.form-demo')?.scrollIntoView({block:'center',behavior:'smooth'});}Object.assign(this.state,patch);if(!queued){queued=true;requestAnimationFrame(update);}}}
globalThis.PageLogic=PageLogic;
const {default:Component}=await import(`/${config.name.toLowerCase()}.js`);
instance=new Component(config.props);update();
for(const b of config.bindings.filter(b=>b.kind==='event')){nodes.get(b.id)?.addEventListener(b.event,event=>{if(b.event==='submit')event.preventDefault();const f=value(b.template.match(/{{\s*(.*?)\s*}}/)[1],b.paths);if(typeof f==='function')f(event);});}
instance.componentDidMount();
window.addEventListener('pagehide',()=>instance.componentWillUnmount?.());
