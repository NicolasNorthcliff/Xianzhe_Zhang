(()=>{
  const canvas=document.getElementById('quizEffects');if(!canvas)return;
  const ctx=canvas.getContext('2d');if(!ctx)return;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  let particles=[],raf=0,start=0,duration=0,mode='';
  function resize(){const d=Math.min(devicePixelRatio||1,2);canvas.width=innerWidth*d;canvas.height=innerHeight*d;ctx.setTransform(d,0,0,d,0,0)}
  window.addEventListener('resize',resize);resize();
  function launch(correct){
    if(reduced.matches)return;
    cancelAnimationFrame(raf);mode=correct?'fireworks':'rain';particles=[];start=performance.now();duration=correct?2800:1700;
    const width=innerWidth,height=innerHeight;
    if(correct){
      const palette=['#e5d7aa','#c8dfcc','#d5b4a3','#b6cadf','#e9e7de'];
      for(let b=0;b<7;b++){const x=width*(.15+.7*Math.random()),y=height*(.13+.52*Math.random());
        for(let i=0;i<48;i++){const a=2*Math.PI*i/48,sp=1.6+Math.random()*4;particles.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:65+Math.random()*30,c:palette[b%palette.length],r:1+Math.random()*2.2});}
      }
    }else{
      for(let i=0;i<110;i++)particles.push({x:Math.random()*width,y:Math.random()*height-height,vx:-.5-Math.random()*.8,vy:2+Math.random()*3,life:150,c:'#aab5bd',r:1+Math.random()*2});
    }
    canvas.classList.add('visible');raf=requestAnimationFrame(frame);
  }
  function frame(now){const width=innerWidth,height=innerHeight;ctx.clearRect(0,0,width,height);const dt=now-start;const alpha=Math.min(1,(duration-dt)/450);
    particles.forEach(p=>{p.x+=p.vx;p.y+=p.vy;if(mode==='fireworks'){p.vy+=.045;p.vx*=.994;p.life-=1;}else{p.life-=.6;}
      if(p.life<0)return;ctx.globalAlpha=Math.max(0,Math.min(1,alpha*(p.life/65)));ctx.fillStyle=p.c;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();});ctx.globalAlpha=1;
    if(dt<duration){raf=requestAnimationFrame(frame);}else{canvas.classList.remove('visible');ctx.clearRect(0,0,width,height);}
  }
  window.addEventListener('quiz:answered',e=>launch(Boolean(e.detail?.correct)));
})();