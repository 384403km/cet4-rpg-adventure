// 🎵 Audio system v2 — 6 domains, multiple melodies, chords, bass
(function(){
  var AS = {
    ctx: null, bgGain: null, sfxGain: null,
    playing: false, _timer: null, _bassTimer: null, _initd: false,
    _melIdx: 0, _theme: null,
    
    init: function(){
      if(this._initd) return;
      try {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        var mg = this.ctx.createGain();
        mg.gain.value = 0.2;
        mg.connect(this.ctx.destination);
        this.bgGain = this.ctx.createGain();
        this.bgGain.gain.value = 0.25;
        this.bgGain.connect(mg);
        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.value = 0.4;
        this.sfxGain.connect(mg);
        this._initd = true;
      } catch(e){}
    },
    
    // Play a single note
    note: function(freq, dur, type, delay, vol, dest){
      if(!this.ctx || freq <= 0) return;
      var t = this.ctx.currentTime + (delay||0);
      var o = this.ctx.createOscillator();
      var g = this.ctx.createGain();
      o.type = type||'sine';
      o.frequency.value = freq;
      var v = vol||0.3;
      g.gain.setValueAtTime(0.001, t);
      g.gain.exponentialRampToValueAtTime(v, t+0.02);
      g.gain.exponentialRampToValueAtTime(v*0.7, t+dur*0.5);
      g.gain.exponentialRampToValueAtTime(0.001, t+dur);
      var d = dest||this.sfxGain;
      o.connect(g); g.connect(d);
      o.start(t); o.stop(t+dur);
    },
    
    // Play a chord (multiple notes at once)
    chord: function(notes, dur, type, delay, vol){
      for(var i=0;i<notes.length;i++){
        this.note(notes[i], dur, type, delay, vol, this.bgGain);
      }
    },
    
    sfx: function(type){
      switch(type){
        case 'flip':
          this.note(880,0.05,'sine',0,0.2);
          this.note(1100,0.04,'sine',0.025,0.15);
          break;
        case 'correct':
          this.note(523,0.1,'sine',0,0.2);
          this.note(659,0.1,'sine',0.08,0.2);
          this.note(784,0.15,'sine',0.16,0.25);
          break;
        case 'wrong':
          this.note(300,0.12,'sawtooth',0,0.15);
          this.note(250,0.18,'sawtooth',0.1,0.15);
          break;
        case 'master':
          this.note(587,0.08,'sine',0,0.2);
          this.note(740,0.08,'sine',0.06,0.2);
          this.note(880,0.08,'sine',0.12,0.2);
          this.note(1047,0.25,'sine',0.18,0.25);
          break;
        case 'enter':
          this.note(440,0.06,'triangle',0,0.15);
          this.note(660,0.08,'triangle',0.05,0.15);
          break;
        case 'exit':
          this.note(660,0.06,'triangle',0,0.12);
          this.note(440,0.08,'triangle',0.05,0.12);
          break;
      }
    },
    
    // 🌟 6 domains × multiple melodies
    melodies: {
      // Horn-like, dark, ominous
      df1: {n:[110,110,146,110,110,110,110,146,110,110,110],d:[0.4,0.15,0.4,0.15,0.15,0.15,0.3,0.4,0.15,0.4,0.8],t:'sawtooth'},
      df2: {n:[98,110,130,146,130,110,98,110,130,146,165,146],d:[0.3,0.2,0.2,0.3,0.2,0.2,0.3,0.2,0.2,0.3,0.3,0.6],t:'sawtooth'},
      df3: {n:[55,55,65,73,82,73,65,55],d:[0.6,0.3,0.3,0.5,0.5,0.3,0.3,1.0],t:'square'},
      // Epic, rising fanfare
      fgo1: {n:[392,440,523,659,784,659,523,440],d:[0.3,0.3,0.3,0.3,0.4,0.2,0.2,0.6],t:'sine'},
      fgo2: {n:[523,587,659,784,880,1047,880,784],d:[0.25,0.2,0.25,0.3,0.3,0.45,0.2,0.6],t:'sine'},
      fgo3: {n:[349,392,523,587,659,523,587,659,784,659],d:[0.2,0.2,0.3,0.2,0.3,0.2,0.2,0.2,0.35,0.65],t:'triangle'},
      // Techy, glitchy
      dev1: {n:[220,0,220,0,261,0,220,0,293,0,261,0],d:[0.15,0.08,0.15,0.08,0.15,0.08,0.15,0.08,0.15,0.08,0.15,0.3],t:'square'},
      dev2: {n:[330,0,293,0,261,0,293,0,330,0,349,0],d:[0.12,0.06,0.12,0.06,0.12,0.06,0.12,0.06,0.12,0.06,0.2,0.25],t:'square'},
      dev3: {n:[131,165,196,220,261,220,196,165],d:[0.2,0.15,0.15,0.2,0.3,0.15,0.15,0.5],t:'sawtooth'},
      // Mystical, dreamy
      mys1: {n:[196,261,330,392,330,261,196,330],d:[0.5,0.3,0.3,0.5,0.3,0.3,0.5,0.8],t:'triangle'},
      mys2: {n:[220,261,330,392,440,523,440,392],d:[0.4,0.3,0.3,0.4,0.3,0.5,0.3,0.7],t:'sine'},
      mys3: {n:[147,165,196,220,261,330,392,330,261,220],d:[0.3,0.2,0.25,0.2,0.3,0.25,0.4,0.2,0.25,0.6],t:'triangle'},
      // Sweet, anime
      gl1: {n:[523,659,784,659,784,880,784,659,523],d:[0.3,0.2,0.3,0.2,0.3,0.4,0.2,0.2,0.6],t:'sine'},
      gl2: {n:[1047,784,1047,880,784,659,784,523],d:[0.25,0.15,0.3,0.2,0.2,0.2,0.25,0.55],t:'sine'},
      gl3: {n:[659,784,880,784,659,523,659,784,880,1047],d:[0.2,0.2,0.3,0.15,0.15,0.2,0.2,0.2,0.3,0.5],t:'triangle'},
      // Academic, calm
      bio1: {n:[262,294,330,349,392,349,330,294],d:[0.4,0.3,0.3,0.3,0.5,0.3,0.3,0.6],t:'triangle'},
      bio2: {n:[349,392,440,523,440,392,349,330],d:[0.35,0.25,0.3,0.4,0.3,0.25,0.3,0.55],t:'sine'},
      bio3: {n:[262,330,392,523,392,330,262,294],d:[0.3,0.2,0.25,0.35,0.25,0.2,0.3,0.5],t:'triangle'}
    },
    
    // Bass lines for each theme (low notes, slower)
    bassLines: {
      df: {n:[55,0,55,0,49,0,55,0],d:[0.5,0.3,0.3,0.2,0.4,0.3,0.4,0.6],t:'sawtooth'},
      fgo: {n:[65,73,82,98,82,73,65,55],d:[0.5,0.3,0.3,0.5,0.3,0.3,0.5,0.8],t:'triangle'},
      dev: {n:[55,0,65,0,73,0,65,0],d:[0.3,0.15,0.3,0.15,0.3,0.15,0.3,0.5],t:'square'},
      mys: {n:[49,55,65,73,65,55,49,55],d:[0.6,0.3,0.35,0.5,0.3,0.35,0.6,0.8],t:'triangle'},
      gl: {n:[65,73,82,98,82,73,65,55],d:[0.4,0.25,0.3,0.4,0.25,0.25,0.4,0.6],t:'sine'},
      bio: {n:[65,0,73,0,82,73,0,65],d:[0.4,0.2,0.3,0.2,0.4,0.3,0.2,0.6],t:'triangle'}
    },
    
    // Theme chord progression (plays as sustained harmony)
    chordProg: {
      df: [[55,65,73],[55,65,73],[49,61,73],[55,65,73]],
      fgo: [[65,82,98],[73,98,110],[82,98,110],[65,82,98]],
      dev: [[55,73,82],[55,73,82],[49,65,73],[55,73,82]],
      mys: [[49,61,73],[55,65,82],[49,61,73],[55,65,82]],
      gl: [[65,82,98],[73,98,110],[82,98,110],[73,98,110]],
      bio: [[55,65,82],[49,61,73],[55,65,82],[49,61,73]]
    },
    
    _melList: null,
    _chordIdx: 0,
    
    playBg: function(theme){
      this.stopBg();
      if(!this.ctx || !this.playing) return;
      this._theme = theme;
      
      // Get melodies for this theme (pick a random variant each loop)
      var melKeys = [];
      for(var k in this.melodies){
        if(k.indexOf(theme) === 0) melKeys.push(k);
      }
      
      var self = this;
      var chordDur = 3.2; // chord changes every ~3.2s
      var chordIdx = 0;
      var cp = this.chordProg[theme] || this.chordProg.bio;
      var bl = this.bassLines[theme] || this.bassLines.bio;
      var bIdx = 0;
      
      // Bass loop
      var playBass = function(){
        if(!self.playing || !self.ctx) return;
        var n = bl.n[bIdx];
        var d = bl.d[bIdx];
        if(n > 0){
          self.note(n, d, bl.t, 0, 0.12, self.bgGain);
        }
        bIdx = (bIdx + 1) % bl.n.length;
        self._bassTimer = setTimeout(playBass, (bl.d[bIdx]||0.3)*1000*1.05);
      };
      
      // Chord loop (sustained harmony)
      var playChords = function(){
        if(!self.playing || !self.ctx) return;
        var ch = cp[chordIdx % cp.length];
        self.chord(ch, chordDur*0.9, 'sine', 0, 0.04);
        chordIdx++;
        self._chordTimer = setTimeout(playChords, chordDur*1000);
      };
      
      // Main melody loop
      var melIdx = 0;
      var pickMel = function() {
        // Pick a random melody from the theme
        return melKeys[Math.floor(Math.random() * melKeys.length)];
      };
      var currentMelKey = pickMel();
      
      var playMel = function(){
        if(!self.playing || !self.ctx) {
          self.stopBg();
          return;
        }
        
        // Pick new melody occasionally (every 2-3 loops)
        if(Math.random() < 0.15) currentMelKey = pickMel();
        
        var mel = self.melodies[currentMelKey];
        if(!mel) return;
        
        var freq = mel.n[melIdx];
        var dur = mel.d[melIdx];
        
        if(freq > 0){
          // Lead note
          self.note(freq, dur, mel.t, 0, 0.13, self.bgGain);
          // Subtle harmony a 5th above
          self.note(freq * 1.5, dur, 'sine', 0.01, 0.04, self.bgGain);
        }
        
        melIdx = (melIdx + 1) % mel.n.length;
        var wait = (mel.d[melIdx-1]||0.3) * 1000 * 1.08;
        self._timer = setTimeout(playMel, wait);
      };
      
      playBass();
      playChords();
      playMel();
    },
    
    stopBg: function(){
      if(this._timer) { clearTimeout(this._timer); this._timer = null; }
      if(this._bassTimer) { clearTimeout(this._bassTimer); this._bassTimer = null; }
      if(this._chordTimer) { clearTimeout(this._chordTimer); this._chordTimer = null; }
    },
    
    toggle: function(){
      this.init();
      this.playing = !this.playing;
      var btn = document.getElementById('musicBtn');
      if(typeof currentDeck !== 'undefined' && currentDeck && this.playing) {
        btn.innerHTML = '\uD83C\uDFB5 音乐';
        btn.style.color = 'var(--text)';
        this.playBg(window.VOCAB_DATA[currentDeck].theme);
      } else if(this.playing) {
        btn.innerHTML = '\uD83C\uDFB5 音乐';
        btn.style.color = 'var(--text)';
      } else {
        btn.innerHTML = '\uD83D\uDD07 音乐';
        btn.style.color = 'var(--text2)';
        this.stopBg();
      }
    }
  };
  window.AudioSys = AS;
})();
