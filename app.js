import { createSculpture } from './sculpture.js';
import { createBoardShowcase } from './showcase.js';

const $=selector=>document.querySelector(selector);
const media=matchMedia('(prefers-reduced-motion: reduce)');
let manualPreference=null;
try{const stored=localStorage.getItem('portfolio-motion');if(stored!==null)manualPreference=stored==='reduced';}catch{}
let reduced=manualPreference??media.matches;
const toggle=$('.motion-toggle'),scene=$('.scene'),story=$('.story'),header=$('.header');
const frames=[...document.querySelectorAll('.story-frame')];
const boardShowcase=createBoardShowcase($('#agent-board-showcase'),()=>reduced);
const names=['A curiosidade','A construção','O uso real'];
const formNames=['CONECTADA','EM TRANSFORMAÇÃO','ABERTA'];
let sculpture=null;
try{sculpture=createSculpture($('#sculpture'));}catch{document.body.classList.add('no-webgl');}
const bounds={storyTop:0,storyHeight:1,heroHeight:0};
let targetX=0,targetY=0,pointerX=0,pointerY=0,scrollProgress=0,sceneVisible=true,raf=0,step=-1;
function measure(){bounds.storyTop=story.offsetTop;bounds.storyHeight=Math.max(1,story.offsetHeight-innerHeight);bounds.heroHeight=$('.hero').offsetHeight;sculpture?.resize();boardShowcase.refresh();updateScroll();}
function updateScroll(){
  const scroll=scrollY;
  const pageHeight=document.documentElement.scrollHeight-innerHeight;
  $('.scroll-progress').style.transform=`scaleX(${pageHeight>0?scroll/pageHeight:0})`;
  header.classList.toggle('scrolled',scroll>40);
  scrollProgress=Math.max(0,Math.min(1,(scroll-bounds.storyTop)/bounds.storyHeight));
  const next=Math.min(2,Math.floor(scrollProgress*3));
  if(next!==step){step=next;frames.forEach((frame,i)=>frame.classList.toggle('active',i===next));$('.chapter-current').textContent=names[next];$('.story-counter').innerHTML=`0${next+1} <span>/ 03</span>`;$('#form-label').textContent=formNames[next];}
  $('.story-track i').style.transform=`scaleX(${scrollProgress})`;
  const fade=reduced?.32:Math.max(0,Math.min(1,(bounds.storyTop+bounds.storyHeight+innerHeight-scroll)/(innerHeight*.8)));
  scene.style.opacity=String(fade);
  sceneVisible=fade>0&&scroll<bounds.storyTop+bounds.storyHeight+innerHeight;
  if(reduced)sculpture?.draw({reduced:true});else startAnimation();
}
function animate(time){
  raf=0;if(document.hidden||reduced||!sceneVisible)return;
  pointerX+=(targetX-pointerX)*.035;pointerY+=(targetY-pointerY)*.035;
  const transition=Math.max(0,Math.min(1,(scrollY-bounds.heroHeight*.55)/(bounds.heroHeight*.45)));
  sculpture?.draw({time:time/1000,progress:transition*.015+scrollProgress*.985,intro:transition,pointerX,pointerY});
  raf=requestAnimationFrame(animate);
}
function startAnimation(){if(sculpture&&!raf&&!reduced&&sceneVisible&&!document.hidden)raf=requestAnimationFrame(animate);}
function applyMotion(){
  document.body.classList.toggle('reduced-motion',reduced);
  toggle.setAttribute('aria-pressed',String(reduced));toggle.setAttribute('aria-label',reduced?'Ativar movimento':'Reduzir movimento');
  $('.motion-label').textContent=reduced?'Motion off':'Motion on';$('.motion-icon').textContent=reduced?'▷':'Ⅱ';
  if(reduced){cancelAnimationFrame(raf);raf=0;}
  measure();
}
toggle.addEventListener('click',()=>{reduced=!reduced;manualPreference=reduced;try{localStorage.setItem('portfolio-motion',reduced?'reduced':'full');}catch{}applyMotion();});
media.addEventListener('change',()=>{if(manualPreference===null){reduced=media.matches;applyMotion();}});
addEventListener('scroll',updateScroll,{passive:true});
addEventListener('resize',measure,{passive:true});
addEventListener('pointermove',event=>{if(event.pointerType==='mouse'&&!reduced){targetX=event.clientX/innerWidth*2-1;targetY=event.clientY/innerHeight*2-1;}},{passive:true});
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;}else startAnimation();});
$('#sculpture').addEventListener('webglcontextlost',event=>{event.preventDefault();document.body.classList.add('no-webgl');cancelAnimationFrame(raf);raf=0;sculpture=null;});
// Content is visible without JS. Only enable entrance effects after observing succeeds.
if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('in-view');observer.unobserve(entry.target);}}),{threshold:.08});document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));document.body.classList.add('js-ready');}
function setTime(){try{$('#local-time').textContent=new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Sao_Paulo',hour:'2-digit',minute:'2-digit'}).format(new Date())+' / UTC −03';}catch{}}
setTime();setInterval(setTime,60000);
const projects={
  board:{
    title:'agent-board',category:'Agentes de IA / Ferramentas',
    intro:'O contexto de um projeto precisa durar mais do que uma conversa. O agent-board é um quadro Kanban que pessoas e agentes de IA leem e atualizam, com histórico de quem fez cada mudança.',
    summary:'Um Kanban compartilhado por pessoas e agentes de IA. Interface, MCP, API REST e CLI acessam o mesmo estado, com autoria e histórico para cada alteração.',
    repo:'https://github.com/Slayer1Dev/agent-board',
    stack:['TypeScript','Node.js','React','SQLite','MCP'],
    flow:['Pessoas & agentes','MCP · REST · CLI','Núcleo comum','SQLite'],
    blocks:[
      ['O ponto de partida','Quando várias sessões de IA trabalham nos mesmos projetos, cada uma pode começar sem saber o que aconteceu antes. A lista de tarefas, os responsáveis e os motivos das decisões precisam existir fora da conversa.'],
      ['A construção','O quadro combina uma interface no navegador com um servidor MCP, uma API REST e uma CLI. As três formas de acesso compartilham um núcleo comum, enquanto o banco SQLite mantém tarefas, comentários e histórico.'],
      ['Estado com autoria','Cada mudança registra o autor. Abrir um card permite acompanhar quem fez o quê, e os comentários preservam o motivo de uma decisão. Busca, filtros, tags e projetos ajudam a reencontrar o contexto.'],
      ['As decisões','Hospedagem própria e um banco em arquivo único mantêm a operação pequena e sob controle. Arquivamento reversível, desfazer e controle de concorrência ajudam a evitar perda de informação ou sobrescrita entre sessões.'],
      ['Além do Kanban','Múltiplos quadros, lembretes e tarefas recorrentes ampliam o uso diário. A interface tem três temas e suporte a português e inglês. O objetivo continua sendo o mesmo: um estado comum para pessoas e agentes.']
    ]
  },
  safe:{
    title:'Arquivo Seguro',category:'Navegador / Segurança',
    intro:'Um arquivo chamado Boleto.pdf.js pode parecer um documento sem ser um PDF. O Arquivo Seguro torna esse tipo de disfarce visível e explica o sinal encontrado para apoiar a decisão de quem está baixando.',
    summary:'Extensão para Chrome, Edge e Brave que aponta nomes e extensões disfarçadas em downloads e controles de anexos. A análise acontece no navegador, sem enviar dados.',
    repo:'https://github.com/Slayer1Dev/arquivo-seguro',
    stack:['JavaScript','Manifest V3','Downloads API','Storage local'],
    flow:['Download / anexo','Nome + metadados','Regras locais','Aviso + decisão'],
    blocks:[
      ['O ponto de partida','Extensões duplas, separadores e caracteres de direção podem fazer um script ou executável se apresentar como documento. O nome precisa ser interpretado pelo tipo final, e não apenas pela aparência.'],
      ['Duas verificações','O monitor de downloads avalia nomes e metadados informados pelo navegador. Nas páginas, a extensão examina controles visíveis de anexos ou downloads que declaram um nome de arquivo; texto corrido não é tratado como anexo.'],
      ['Decisão informada','Os alertas mostram o nome, os motivos e o estado observado do download. A extensão tenta uma pausa preventiva quando possível e oferece ações explícitas. Downloads pendentes podem ser reencontrados no popup.'],
      ['Privacidade por desenho','A análise e as decisões ficam no navegador. A extensão não lê o conteúdo dos arquivos nem o texto das mensagens e não envia dados. A ampliação da leitura de controles de download para outros sites exige permissão adicional.'],
      ['Limites claros','O projeto aponta sinais no nome; não detecta malware e não substitui um antivírus. Um download pequeno pode terminar antes da pausa. Nesse caso, o aviso informa o estado real, sem afirmar que bloqueou o arquivo.']
    ]
  },
  skills:{
    title:'claude-skills',category:'IA / Conhecimento aplicado',
    intro:'Aprender uma vez deveria ajudar nas próximas sessões. Esta coleção transforma problemas encontrados no uso de IA em instruções específicas, reutilizáveis e carregadas quando a tarefa exige.',
    summary:'Uma coleção de skills para Claude Code: delegação entre IAs, segurança de aplicações com LLM, filas de trabalho e verificação dos resultados. Aprendizado operacional que vira instrução.',
    repo:'https://github.com/Slayer1Dev/claude-skills',
    stack:['Markdown','Claude Code','Orquestração','Verificação'],
    flow:['Uso real','Aprendizado','SKILL.md','Uso sob demanda'],
    blocks:[
      ['O ponto de partida','Erros de invocação, saídas de ferramentas e resultados não verificados geram armadilhas que se repetem entre sessões. Guardar apenas o caminho feliz não transmite o que foi aprendido.'],
      ['Conhecimento sob demanda','Cada skill reúne uma descrição da situação em que deve ser usada e instruções em um arquivo SKILL.md. A coleção mantém os procedimentos específicos perto dos problemas que eles resolvem.'],
      ['Orquestração','As skills incluem delegação entre IAs e filas de tarefas baseadas em arquivos, com sandbox, versionamento em Git e revisão humana antes de aplicar mudanças.'],
      ['Segurança e evidência','Outras instruções tratam de injeção de prompt, vazamento de contexto e abuso de ferramentas. A verificação pede provas medidas, como contraste, overflow, alvos de toque e comportamento de endpoints.'],
      ['A escolha editorial','Documentar a armadilha, explicar quando uma regra se aplica e cortar instruções genéricas. O valor está em levar experiência concreta para a próxima execução.']
    ]
  }
};
function renderStack(container,tags){container.replaceChildren(...tags.map(tag=>{const span=document.createElement('span');span.textContent=tag;return span;}));}
// Summaries stay outside the modal so the work can be understood at a glance.
document.querySelectorAll('.project[data-project]').forEach(button=>{
  const project=projects[button.dataset.project];
  button.setAttribute('aria-label',`Explorar ${project.title}`);
  const summary=document.createElement('p');summary.className='project-summary';summary.textContent=project.summary;
  const tags=document.createElement('div');tags.className='stack project-stack';renderStack(tags,project.stack);
  button.append(summary,tags);
});
const dialog=$('#project-dialog');let opener=null;
document.querySelectorAll('[data-project]').forEach(button=>button.addEventListener('click',()=>{
  const project=projects[button.dataset.project];opener=button;
  $('#dialog-title').textContent=project.title;$('#dialog-category').textContent=project.category;$('#dialog-intro').textContent=project.intro;$('#dialog-repo').href=project.repo;
  $('#dialog-readme').href=project.repo+'/blob/main/README.md';
  renderStack($('#dialog-stack'),project.stack);
  $('#dialog-flow').replaceChildren(...project.flow.map((label,i)=>{const node=document.createElement('div');node.className='flow-node';const order=document.createElement('small');order.textContent=`0${i+1}`;const text=document.createElement('span');text.textContent=label;node.append(order,text);return node;}));
  const content=$('#dialog-content');content.replaceChildren();
  project.blocks.forEach(([heading,copy])=>{const block=document.createElement('div');block.className='detail-block';const h=document.createElement('h3');h.textContent=heading;const p=document.createElement('p');p.textContent=copy;block.append(h,p);content.append(block);});
  dialog.showModal();dialog.scrollTop=0;document.body.classList.add('modal-open');$('.dialog-close').focus();
}));
$('.dialog-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();});
dialog.addEventListener('close',()=>{document.body.classList.remove('modal-open');opener?.focus({preventScroll:true});});
applyMotion();
document.fonts.ready.then(measure);
