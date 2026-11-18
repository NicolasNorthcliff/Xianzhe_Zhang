(()=>{
  const form=document.getElementById('quizForm');if(!form)return;
  const result=document.getElementById('quizResult');
  const label=document.getElementById('quizResultLabel');
  const status=document.getElementById('quizStatus');
  const totals=document.getElementById('quizTotals');
  const bars=document.getElementById('quizBars');
  const total=document.getElementById('quizVoteTotal');
  const note=document.getElementById('quizStatNote');
  const choices=[...form.querySelectorAll('input[type=radio]')];
  const submit=form.querySelector('button[type=submit]');
  const reset=document.getElementById('quizReset');
  const api=(window.POLL_API_URL||'').trim().replace(/\/$/,'');
  const storage='xianzhe-two-truths-v1';
  const names=['Pro gamer','Boston Marathon','Lakers fan'];
  let prior=null;
  try{prior=JSON.parse(localStorage.getItem(storage)||'null')}catch{}
  let recorded=!!(prior&&Number.isInteger(prior.choice)&&prior.choice>=0&&prior.choice<=2);

  function showAnswer(chosen,animate=false){
    const correct=chosen===2;
    label.textContent=correct?'Correct — you spotted the lie.':'Not quite — the third statement is the lie.';
    result.hidden=false;
    choices.forEach((c,i)=>{
      c.disabled=true;
      const row=c.closest('.quiz-choice');
      row.classList.toggle('is-correct',i===2);
      row.classList.toggle('is-wrong',i===chosen&&i!==2);
      row.classList.toggle('is-picked',i===chosen);
    });
    submit.disabled=true;
    submit.textContent='Answer revealed';
    reset.hidden=false;
    if(animate)window.dispatchEvent(new CustomEvent('quiz:answered',{detail:{correct}}));
  }
  function showTotals(data){
    if(!data||!Array.isArray(data.counts)||data.counts.length!==3)return;
    const n=data.counts.map(x=>Math.max(0,Math.trunc(Number(x)||0)));
    const sum=n.reduce((a,b)=>a+b,0);total.textContent=`· ${sum} votes`;
    bars.replaceChildren();
    n.forEach((v,i)=>{
      const row=document.createElement('div');row.className='quiz-bar-row';
      const line=document.createElement('div');line.className='quiz-bar-head';
      const title=document.createElement('span');title.textContent=names[i];
      const percent=document.createElement('span');percent.textContent=sum?`${Math.round(v/sum*100)}% · ${v}`:`0% · ${v}`;
      line.append(title,percent);
      const track=document.createElement('div');track.className='quiz-bar-track';
      const fill=document.createElement('div');fill.className='quiz-bar-fill';fill.style.width=`${sum?100*v/sum:0}%`;
      track.append(fill);row.append(line,track);bars.append(row);
    });
    totals.hidden=false;note.textContent='';
  }
  function resetQuiz(){
    form.reset();
    choices.forEach(c=>{c.disabled=false;c.closest('.quiz-choice').classList.remove('is-correct','is-wrong','is-picked')});
    submit.disabled=false;submit.textContent='Reveal the answer ↗';
    result.hidden=true;reset.hidden=true;status.textContent='';note.textContent='';
  }
  reset?.addEventListener('click',resetQuiz);
  if(recorded){
    choices[prior.choice].checked=true;showAnswer(prior.choice,false);
  }
  if(api)fetch(api,{mode:'cors'}).then(r=>r.ok?r.json():Promise.reject()).then(showTotals).catch(()=>{});
  form.addEventListener('submit',async e=>{
    e.preventDefault();const selected=choices.find(c=>c.checked);if(!selected)return;
    const choice=Number(selected.value);
    showAnswer(choice,true);
    // Reset is for replay only; it does not issue a second counted vote from this browser.
    if(recorded||!api)return;
    let voteId;
    try{voteId=crypto.randomUUID()}catch{voteId=String(Date.now())+'-'+Math.random().toString(36).slice(2)}
    try{localStorage.setItem(storage,JSON.stringify({choice,voteId}))}catch{}
    recorded=true;
    try{
      const r=await fetch(api,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({choice,voteId})});
      if(!r.ok)throw Error('Unavailable');showTotals(await r.json());
    }catch{status.textContent='';}
  });
})();
