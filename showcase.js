// Illustrative choreography: no connections to live accounts or private data.
export function createBoardShowcase(root,isReduced){
  const q=s=>root.querySelector(s),all=s=>[...root.querySelectorAll(s)];
  const nodes=all('.agent-node'),paths=all('.demo-connections path'),columns=all('.demo-column');
  const controls=all('[data-demo-step]'),previews=all('.universe-board'),terminals=all('.session-terminal');
  const wires=all('.network-live'),packets=all('.network-packet');
  const board=q('.demo-board'),task=q('.demo-task'),gallery=q('.board-universe'),network=q('.connection-theatre');
  const captions=[
    ['VÁRIOS PROJETOS.','CADA UM, UM QUADRO.','Operação, ferramentas, produto. Projetos separados, cada um com suas tarefas e seu contexto.'],
    ['ESCOLHA UM QUADRO.','ENTRE NA HISTÓRIA.','O foco agora é Ferramentas. As próximas sessões vão trabalhar neste mesmo projeto.'],
    ['TRÊS SESSÕES.','TRÊS PORTAS DE ENTRADA.','MCP, CLI e API REST. Diferentes formas de acessar o mesmo estado do agent-board.'],
    ['CONECTOU. LEU.','PODE CONTINUAR.','Cada sessão recebe as tarefas, os comentários e o histórico do quadro selecionado.'],
    ['CODEX ESCREVE.','O QUADRO REGISTRA.','Uma tarefa nasce em A fazer. A autoria acompanha o registro, junto do contexto do projeto.'],
    ['CLAUDE CONTINUA.','SEM RECOMEÇAR.','Outra sessão encontra a tarefa e acrescenta um comentário. O contexto permanece no quadro.'],
    ['A TAREFA AVANÇA.','TODOS ACOMPANHAM.','Codex move para Em andamento. As outras sessões podem consultar o estado atualizado.'],
    ['CONCLUÍDO.','COM HISTÓRIA.','Claude conclui a tarefa. O trabalho termina; a autoria e os comentários continuam registrados.']
  ];
  const boundaries=[.12,.24,.37,.5,.61,.71,.85],stops=[.055,.19,.32,.445,.575,.675,.8,.975];
  const clamp=x=>Math.max(0,Math.min(1,x)),between=(p,a,b)=>clamp((p-a)/(b-a)),ease=x=>x*x*(3-2*x);
  let top=0,range=1,manual=null,lastStep=-1,pending=0,progress=0,visible=false,flowFrame=0;
  function put(el,text){if(el.textContent!==text)el.textContent=text;}
  function layer(el,opacity){el.style.opacity=String(opacity);el.style.visibility=opacity>.001?'visible':'hidden';}
  function render(p){
    progress=p;const step=boundaries.filter(b=>p>=b).length;root.dataset.phase=String(step);
    if(step!==lastStep){lastStep=step;put(q('.demo-title-top'),captions[step][0]);put(q('.demo-title-bottom'),captions[step][1]);put(q('.demo-description'),captions[step][2]);controls.forEach((c,i)=>c.setAttribute('aria-pressed',String(i===step)));}
    const select=ease(between(p,.12,.225)),galleryExit=ease(between(p,.225,.27));layer(gallery,1-galleryExit);
    const mobile=innerWidth<=600;
    previews.forEach((preview,i)=>{const side=i-1,arrival=ease(between(p,.005+i*.015,.065+i*.015)),x=side*(mobile?42:66)*(1-select)+side*select*130,y=(1-arrival)*65+Math.abs(side)*(mobile?18:25)-select*Math.abs(side)*30;preview.style.transform=`translate(-50%,-50%) translate3d(${x}%,${y}px,${i===1?select*80:0}px) rotateY(${side*-14*(1-select)}deg) rotateZ(${side*7*(1-select)}deg) scale(${(i===1?.94:.8)+select*(i===1?.11:-.18)})`;preview.style.opacity=String(arrival*(i===1?1:1-select));preview.classList.toggle('selected',i===1&&p>.13);});
    layer(q('.universe-selection'),between(p,.14,.18)*(1-galleryExit));
    const networkEnter=ease(between(p,.235,.28)),networkExit=ease(between(p,.47,.515));layer(network,networkEnter*(1-networkExit));network.style.transform=`translateY(${(1-networkEnter)*45-networkExit*35}px) scale(${.94+networkEnter*.06-networkExit*.05})`;
    network.dataset.active=String(p<.37?Math.min(2,Math.floor(between(p,.25,.37)*3)):p<.43?0:p<.455?1:2);
    terminals.forEach((terminal,i)=>{
      const arrival=ease(between(p,.245+i*.025,.28+i*.025)),connection=between(p,.29+i*.025,.345+i*.025),receipt=between(p,.38+i*.025,.415+i*.025),command=['conectar via MCP','conectar via CLI','conectar via API REST'][i];
      terminal.style.setProperty('--terminal-entry',arrival);terminal.classList.toggle('linked',connection===1);terminal.classList.toggle('received',receipt===1);
      put(terminal.querySelector('.terminal-command'),command.slice(0,Math.round(command.length*arrival)));put(terminal.querySelector('.terminal-reply'),receipt===1?'✓ contexto recebido':connection===1?'✓ conexão estabelecida':'Aguardando conexão…');put(terminal.querySelector('.terminal-status'),receipt===1?'PRONTO PARA CONTINUAR':connection===1?'CONECTADO':'SESSÃO INDEPENDENTE');terminal.querySelector('.terminal-context').style.opacity=String(receipt);wires[i].style.strokeDasharray=connection===1?'none':'1';wires[i].style.strokeDashoffset=String(1-connection);wires[i].style.opacity=String(arrival);
    });
    q('.network-spine').style.strokeDashoffset=String(1-between(p,.355,.395));q('.context-hub').classList.toggle('online',p>.35);q('.shared-context').classList.toggle('received',p>.405);
    put(q('.context-receipt'),p>.465?'✓ 3 sessões consultaram o mesmo contexto':p>.405?'✓ tarefas · comentários · autoria':'Solicitando contexto do quadro…');put(q('.network-legend-text'),p>.37?'Contexto retornando para cada sessão.':'Solicitações chegando ao quadro Ferramentas.');
    const boardEntry=ease(between(p,.485,.535));layer(q('.demo-agents'),boardEntry);layer(q('.demo-connections'),boardEntry);layer(q('.demo-window'),boardEntry);q('.demo-ghost').style.display='none';
    const column=ease(between(p,.715,.785))+ease(between(p,.86,.94)),first=columns[0],second=columns[1],width=first.clientWidth-20,taskX=first.offsetLeft+10+(second.offsetLeft-first.offsetLeft)*column;
    task.style.width=width+'px';task.style.transform=`translate3d(${taskX}px,${Math.sin(column*Math.PI)*-22}px,0) rotate(${Math.sin(column*Math.PI)*-3}deg)`;task.style.opacity=String(between(p,.515,.54));task.classList.toggle('completed',p>=.94);
    const windowWidth=q('.demo-window').clientWidth,pan=windowWidth<610?(windowWidth-width)/2-taskX-q('.demo-columns').offsetLeft:0;
    board.style.opacity='1';board.style.transform=`perspective(1200px) translate3d(${pan+(1-boardEntry)*40}px,${(1-boardEntry)*45}px,0) rotateX(${(1-boardEntry)*8}deg) rotateZ(${(1-boardEntry)*2}deg) scale(${.94+boardEntry*.06})`;
    nodes.forEach((node,i)=>{node.classList.add('connected');const writing=step===4&&i===0||step===5&&i===1;node.classList.toggle('writing',writing);put(node.querySelector('.agent-status'),writing?'Escrevendo…':p>.94?'Conclusão registrada':p>.785?'Estado atualizado':'Contexto recebido');paths[i].style.strokeDasharray='none';paths[i].style.strokeDashoffset='0';paths[i].style.opacity='1';});
    const title='Organizar contexto do projeto';put(q('.demo-task-title'),title.slice(0,Math.max(1,Math.round(title.length*between(p,.52,.595)))));
    const comment='Contexto revisado. Próxima sessão pode continuar.';put(q('.demo-comment p'),comment.slice(0,Math.round(comment.length*between(p,.62,.69))));q('.demo-comment').style.opacity=String(between(p,.615,.64));q('.demo-cursor').style.opacity=p>=.94?'0':'1';put(q('.demo-cursor b'),step===5||p>.85?'claude':'codex');put(q('.demo-task-author'),p>=.94?'✓ Claude':'↗ Codex');
    const state=p>=.94?'Concluído':p>=.785?'Em andamento':'A fazer';put(q('.demo-task-state'),state);put(q('[data-count="todo"]'),p>=.535&&p<.785?'1':'0');put(q('[data-count="doing"]'),p>=.785&&p<.94?'1':'0');put(q('[data-count="done"]'),p>=.94?'1':'0');
    const event=step<4?'Três sessões · um quadro selecionado':step===4?'codex · criou uma tarefa em A fazer':step===5?'claude · leu o contexto e comentou':p<.785?'codex · movendo para Em andamento':p<.85?'codex · moveu para Em andamento':p<.94?'claude · movendo para Concluído':'claude · moveu para Concluído';put(q('.demo-event'),event);put(q('.demo-mobile-event'),event);put(q('.demo-mobile-state'),`0${step+1} / 08 · ${step<4?'Projetos → sessões → contexto':`Tarefa ${state.toLowerCase()} · histórico com autoria`}`);root.style.setProperty('--demo-progress',p);syncFlow();
  }
  // Packets follow the actual wire geometry. Stop when offscreen, hidden or motion is reduced.
  function flow(time){flowFrame=0;if(!visible||isReduced()||document.hidden||progress<.29||progress>.49)return;const returning=progress>.38;packets.forEach((packet,i)=>{const path=wires[i],fraction=(time/1900+i*.31)%1,t=returning?1-fraction:fraction,pt=path.getPointAtLength(path.getTotalLength()*t);packet.setAttribute('cx',pt.x);packet.setAttribute('cy',pt.y);packet.style.opacity=progress>.29+i*.025?'1':'0';});const back=q('.network-return'),spine=q('.network-spine'),t=(time/1400)%1,pt=spine.getPointAtLength(spine.getTotalLength()*(returning?1-t:t));back.setAttribute('cx',pt.x);back.setAttribute('cy',pt.y);back.style.opacity=progress>.355?'1':'0';flowFrame=requestAnimationFrame(flow);}
  function syncFlow(){const running=visible&&!isReduced()&&!document.hidden&&progress>=.29&&progress<=.49;root.classList.toggle('flow-running',running);if(running&&!flowFrame)flowFrame=requestAnimationFrame(flow);if(!running){cancelAnimationFrame(flowFrame);flowFrame=0;packets.forEach(p=>p.style.opacity='0');q('.network-return').style.opacity='0';}}
  function update(){pending=0;render(isReduced()?(manual??.975):clamp((scrollY-top)/range));}
  function queue(){if(!pending)pending=requestAnimationFrame(update);}
  function refresh(){top=root.getBoundingClientRect().top+scrollY;range=Math.max(1,root.offsetHeight-innerHeight);update();}
  controls.forEach((c,i)=>c.addEventListener('click',()=>{if(isReduced()){manual=stops[i];render(manual);}else scrollTo({top:top+range*stops[i],behavior:'smooth'});}));
  new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;syncFlow();}).observe(root);addEventListener('scroll',queue,{passive:true});addEventListener('resize',refresh,{passive:true});document.addEventListener('visibilitychange',syncFlow);refresh();return {refresh};
}
