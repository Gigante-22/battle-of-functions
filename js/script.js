/* script.js - Lógica do jogo Battle of Functions
   Comentários explicativos incluídos.
*/
(function(){
  // GAME CONFIG
  const MAX_HP = 100;
  const ATTACKS = {
    limite: {name:'Limite', dmg:10},
    derivada: {name:'Derivada', dmg:20},
    integral: {name:'Integral', dmg:30}
  };

  // State
  let mode = 'single'; // 'single' or 'local'
  let currentPlayer = 1; // 1 or 2
  let hp = {1: MAX_HP, 2: MAX_HP};
  let questions = [];
  let currentQuestion = null;
  let awaitingAnswer = false;
  let timerInterval = null;
  let timeRemaining = 0;
  const TIMER_DURATION = 90; // 90 segundos

  // Audio / WebAudio context (synth fallback so game works offline)
  let audioCtx = null;
  function ensureAudio(){
    if(!audioCtx){
      try{ audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
      catch(e){ audioCtx = null; }
    }
  }

  function playBeep(freq=440,duration=0.12, type='sine', gain=0.1){
    ensureAudio(); if(!audioCtx) return;
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.value = gain;
    o.connect(g); g.connect(audioCtx.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
    o.stop(audioCtx.currentTime + duration + 0.02);
  }

  // DOM refs
  const $ = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));

  // init
  function init(){
    // Buttons
    $('#btn-play').addEventListener('click', ()=>{ showScreen('menu-screen'); });
    $('#btn-tutorial').addEventListener('click', ()=>{ alert('Tutorial:\nEscolha um modo e ataque escolhendo Limite/Derivada/Integral. Responda a questão para causar dano. Se errar, o inimigo contra-ataca.'); });
    $('#btn-back').addEventListener('click', ()=>{ showScreen('start-screen'); });
    $('#mode-single').addEventListener('click', ()=>{ mode='single'; highlightMode('mode-single'); });
    $('#mode-local').addEventListener('click', ()=>{ mode='local'; highlightMode('mode-local'); });
    $('#btn-start-game').addEventListener('click', ()=> startGame());
    $('#btn-restart').addEventListener('click', ()=> resetToGame());
    $('#btn-to-menu').addEventListener('click', ()=> location.reload());

    $$('.atk-btn').forEach(b=> b.addEventListener('click', onAttackClick));
    $$('.alt-btn').forEach(b=> b.addEventListener('click', onAnswerClick));
    $('#btn-skip').addEventListener('click', ()=>{ closeQuestion(); switchTurn(); });

    // Load questions JSON (with fallback if fetch blocked on file://)
    fetch('data/perguntas.json').then(r=>r.json()).then(data=>{ questions = data; console.log('Perguntas carregadas',questions.length); }).catch(err=>{
      console.warn('Não foi possível carregar perguntas via fetch (file:// pode bloquear). Usando fallback embutido. Erro:',err);
      // fallback minimal set (shouldn't happen because data/perguntas.json exists)
      questions = [
        {tipo:'derivada',pergunta:"f(x)=x^2, f'(x)=?",alternativas:['2x','x^2','x','1'],correta:'2x'}
      ];
    });

    showScreen('start-screen');
    highlightMode('mode-single');
  }

  function highlightMode(id){
    ['mode-single','mode-local'].forEach(k=> document.getElementById(k).classList.remove('active'));
    document.getElementById(id).classList.add('active');
  }

  function showScreen(id){
    $$('.screen').forEach(s=> s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
  }

  // Start the match
  function startGame(){
    // reset state
    hp = {1:MAX_HP,2:MAX_HP};
    currentPlayer = 1;
    updateHPBars();
    document.getElementById('turn-player').textContent = 'Jogador 1';
    showScreen('game-screen');
    document.getElementById('end-screen').classList.add('hidden');
    document.getElementById('question-panel').classList.add('hidden');
    // begin background ambience
    playAmbientLoop();
  }

  function resetToGame(){
    startGame();
  }

  // Attack button
  function onAttackClick(e){
    if(awaitingAnswer) return;
    const atk = e.currentTarget.dataset.atk;
    // pick question of that type
    const q = pickQuestion(atk);
    if(!q){ alert('Sem perguntas disponíveis para ' + atk); return; }
    currentQuestion = {q, atk, attacker: currentPlayer, defender: currentPlayer===1?2:1};
    showQuestion(q);
    awaitingAnswer = true;
  }

  function pickQuestion(tipo){
    const pool = questions.filter(x=> x.tipo === tipo);
    if(pool.length===0) return null;
    return pool[Math.floor(Math.random()*pool.length)];
  }

  // Show question UI
  function showQuestion(q){
    const panel = document.getElementById('question-panel');
    panel.classList.remove('hidden');
    $('#question-text').textContent = q.pergunta;
    const altBtns = $$('.alt-btn');
    altBtns.forEach((btn,i)=>{
      btn.disabled = false;
      btn.classList.remove('correct','wrong');
      btn.textContent = String.fromCharCode(65+i) + ") " + q.alternativas[i];
    });
    startTimer();
  }

  // Handle answer click
  function onAnswerClick(e){
    if(!awaitingAnswer) return;
    clearTimer(); // Para o timer quando resposta é escolhida
    const choice = parseInt(e.currentTarget.dataset.choice,10);
    const q = currentQuestion.q;
    const selected = q.alternativas[choice];
    const altBtns = $$('.alt-btn');
    altBtns.forEach(b=> b.disabled = true);
    // check correctness
    if(selected === q.correta){
      // correct
      e.currentTarget.classList.add('correct');
      playAttackSound(currentQuestion.atk);
      // apply damage to defender
      setTimeout(()=>{
        const defPos = currentQuestion.defender === 1 ? 150 : 250;
        showAttackEffect(currentQuestion.atk, defPos);
        applyDamage(currentQuestion.defender, ATTACKS[currentQuestion.atk].dmg);
        showAttackAnimation(currentQuestion.attacker, currentQuestion.defender);
        closeQuestion();
        awaitingAnswer = false;
        // check end
        if(!checkEnd()) switchTurn();
      }, 350);
    } else {
      // wrong
      e.currentTarget.classList.add('wrong');
      playErrorSound();
      // defender counter-attacks immediately
      setTimeout(()=>{
        const defPos = currentQuestion.attacker === 1 ? 150 : 250;
        showAttackEffect(currentQuestion.atk, defPos);
        applyDamage(currentQuestion.attacker, ATTACKS[currentQuestion.atk].dmg);
        showCounterAnimation(currentQuestion.defender, currentQuestion.attacker);
        closeQuestion();
        awaitingAnswer = false;
        if(!checkEnd()){
          // if single player and player missed, and it's player's turn earlier? We switch turn normally
          switchTurn();
        }
      }, 350);
    }
  }

  function closeQuestion(){
    document.getElementById('question-panel').classList.add('hidden');
    currentQuestion = null;
    clearTimer();
  }

  // Timer functions
  function startTimer(){
    clearTimer();
    timeRemaining = TIMER_DURATION;
    updateTimerDisplay();
    
    timerInterval = setInterval(()=>{
      timeRemaining--;
      updateTimerDisplay();
      
      // Alerta sonoro em 10s, 5s e 3-1s
      if(timeRemaining === 10 || timeRemaining === 5){
        playBeep(880, 0.1, 'sine', 0.08);
      } else if(timeRemaining <= 3 && timeRemaining > 0){
        playBeep(1200, 0.08, 'sine', 0.06);
      }
      
      // Tempo esgotado
      if(timeRemaining <= 0){
        clearTimer();
        timeoutAnswer();
      }
    }, 1000);
  }

  function updateTimerDisplay(){
    const timerFill = document.getElementById('timer-fill');
    const timerText = document.getElementById('timer-text');
    const percentage = (timeRemaining / TIMER_DURATION) * 100;
    
    timerFill.style.width = percentage + '%';
    timerText.textContent = timeRemaining + 's';
    
    // Mudar cor do timer
    timerFill.classList.remove('warning', 'critical');
    if(timeRemaining <= 3){
      timerFill.classList.add('critical');
    } else if(timeRemaining <= 10){
      timerFill.classList.add('warning');
    }
  }

  function clearTimer(){
    if(timerInterval){
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  function timeoutAnswer(){
    if(!awaitingAnswer || !currentQuestion) return;
    
    // Timeout é tratado como resposta errada
    playErrorSound();
    
    setTimeout(()=>{
      const defPos = currentQuestion.attacker === 1 ? 150 : 250;
      showAttackEffect(currentQuestion.atk, defPos);
      applyDamage(currentQuestion.attacker, ATTACKS[currentQuestion.atk].dmg);
      showCounterAnimation(currentQuestion.defender, currentQuestion.attacker);
      closeQuestion();
      awaitingAnswer = false;
      if(!checkEnd()){
        switchTurn();
      }
    }, 350);
  }

  // Apply damage and update UI
  function applyDamage(playerId, dmg){
    hp[playerId] = Math.max(0, hp[playerId] - dmg);
    updateHPBars();
    // damage flash
    const anim = document.getElementById(playerId===1? 'anim-p1':'anim-p2');
    anim.classList.add('shake');
    setTimeout(()=> anim.classList.remove('shake'),450);
    // flash overlay briefly
    const overlay = document.getElementById('message-overlay');
    overlay.classList.remove('hidden');
    overlay.style.background = 'rgba(0,0,0,.3)';
    setTimeout(()=> overlay.classList.add('hidden'),220);
  }

  function updateHPBars(){
    const w1 = (hp[1]/MAX_HP*100)+'%';
    const w2 = (hp[2]/MAX_HP*100)+'%';
    $('#hp1').style.width = w1; $('#hp2').style.width = w2;
    $('#hp1-text').textContent = `${hp[1]} / ${MAX_HP}`;
    $('#hp2-text').textContent = `${hp[2]} / ${MAX_HP}`;
  }

  // Show attack animation
  function showAttackAnimation(attacker, defender){
    const attackerEl = attacker===1?$('#anim-p1'):$('#anim-p2');
    const defenderEl = defender===1?$('#anim-p1'):$('#anim-p2');
    attackerEl.classList.add('attack-anim');
    setTimeout(()=> attackerEl.classList.remove('attack-anim'),300);
    defenderEl.classList.add('shake');
    defenderEl.classList.add('flash');
    setTimeout(()=> {
      defenderEl.classList.remove('shake');
      defenderEl.classList.remove('flash');
    },300);
  }

  function showCounterAnimation(attacker, defender){
    // attacker counters, defender got hit
    showAttackAnimation(attacker, defender);
  }

  // Show effect based on attack type
  function showAttackEffect(attackType, position){
    const scene = document.querySelector('.scene');
    if(!scene) return;
    const effect = document.createElement('div');
    effect.style.left = position + 'px';
    effect.style.top = '100px';
    
    if(attackType === 'limite') {
      effect.className = 'effect-fogo';
    } else if(attackType === 'derivada') {
      effect.className = 'effect-energia';
    } else if(attackType === 'integral') {
      effect.className = 'effect-raio';
    }
    
    scene.appendChild(effect);
    setTimeout(() => effect.remove(), 600);
  }

  // Turn switching and AI behavior
  function switchTurn(){
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    const turnName = (currentPlayer===1)?'Jogador 1':(mode==='single' ? 'Rival (IA)' : 'Jogador 2');
    document.getElementById('turn-player').textContent = turnName;
    if(mode==='single' && currentPlayer===2){
      // small delay then AI acts
      setTimeout(()=> aiAct(), 900 + Math.random()*900);
    }
  }

  function aiAct(){
    if(hp[1] <=0 || hp[2] <=0) return;
    // AI chooses random attack
    const keys = Object.keys(ATTACKS);
    const atk = keys[Math.floor(Math.random()*keys.length)];
    // simulate hit chance
    const hitChance = 0.75;
    const hit = Math.random() < hitChance;
    if(hit){
      playAttackSound(atk);
      showAttackAnimation(2,1);
      setTimeout(()=>{
        applyDamage(1, ATTACKS[atk].dmg);
        if(!checkEnd()) switchTurn();
      }, 420);
    } else {
      // miss - little sound
      playErrorSound();
      setTimeout(()=> switchTurn(), 420);
    }
  }

  // End check
  function checkEnd(){
    if(hp[1] <=0 || hp[2] <=0){
      const winner = (hp[1] <=0) ? 2 : 1;
      showEndScreen(winner);
      return true;
    }
    return false;
  }

  function showEndScreen(winner){
    const end = $('#end-screen');
    $('#end-title').textContent = (winner===1)? '⚔️ O Rival Foi Derrotado!':'⚔️ Você Foi Derrotado!';
    $('#end-sub').textContent = (winner===1)? 'Vitória brilhante — sua função prevaleceu.':'Derrota — estude mais funções e tente novamente.';
    end.classList.remove('hidden');
    // small final animation
    end.classList.add('glow-red');
    playVictoryTune();
  }

  // Simple audio effects using WebAudio (works offline)
  function playAttackSound(atk){
    // different tones per attack type
    if(atk==='limite') playBeep(860,0.12,'square',0.06);
    else if(atk==='derivada') { playBeep(620,0.18,'sawtooth',0.08); playBeep(900,0.09,'sine',0.04); }
    else if(atk==='integral') { playBeep(420,0.28,'sine',0.12); playBeep(240,0.12,'sine',0.06); }
  }

  function playErrorSound(){ playBeep(180,0.18,'sine',0.12); }

  function playVictoryTune(){ playBeep(880,0.14,'sine',0.08); setTimeout(()=>playBeep(1320,0.18,'sine',0.07),140); }

  // ambient loop: subtle low tone repeated
  let ambientOsc = null;
  function playAmbientLoop(){
    ensureAudio(); if(!audioCtx) return;
    if(ambientOsc) return; // already
    ambientOsc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    ambientOsc.type = 'sine'; ambientOsc.frequency.value = 80;
    g.gain.value = 0.02;
    ambientOsc.connect(g); g.connect(audioCtx.destination);
    ambientOsc.start();
  }

  // Initialize on DOM ready
  document.addEventListener('DOMContentLoaded', init);

})();
