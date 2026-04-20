      // ============================================================
      // STATE
      // ============================================================
      const S = {
        userName: "", userAge: 7, currentScreen: "welcome",
        assessIndex: 0, assessAnswers: [], weaknesses: [],
        lessons: null, allLessons: null, currentChapter: 0, currentCard: 0,
        exIndex: 0, exAnswers: [], chapterProgress: {}, totalStars: 0,
        lastAction: null, lastScreen: "dashboard", ttsSpeaking: false,
        dyslexiaProfile: null, chatHistory: []
      };

      // ============================================================
      // LOCALSTORAGE PERSISTENCE
      // ============================================================
      function saveToLocalStorage() {
        const data = {
          userName: S.userName,
          userAge: S.userAge,
          assessAnswers: S.assessAnswers,
          weaknesses: S.weaknesses,
          lessons: S.lessons,
          allLessons: S.allLessons,
          chapterProgress: S.chapterProgress,
          totalStars: S.totalStars,
          dyslexiaProfile: S.dyslexiaProfile,
          chatHistory: S.chatHistory
        };
        localStorage.setItem('dysko_data', JSON.stringify(data));
        console.log('Saved to localStorage');
      }

      function loadFromLocalStorage() {
        try {
          const saved = localStorage.getItem('dysko_data');
          if (saved) {
            const data = JSON.parse(saved);
            S.userName = data.userName || "";
            S.userAge = data.userAge || 7;
            S.assessAnswers = data.assessAnswers || [];
            S.weaknesses = data.weaknesses || [];
            S.lessons = data.lessons || null;
            S.allLessons = data.allLessons || null;
            S.chapterProgress = data.chapterProgress || {};
            S.totalStars = data.totalStars || 0;
            S.dyslexiaProfile = data.dyslexiaProfile || null;
            S.chatHistory = data.chatHistory || [];
            console.log('Loaded from localStorage');
            return true;
          }
        } catch (e) {
          console.error('Error loading from localStorage:', e);
        }
        return false;
      }

      function clearLocalStorage() {
        localStorage.removeItem('dysko_data');
        console.log('Cleared localStorage');
      }

      // ============================================================
      // ASSESSMENT QUESTIONS
      // ============================================================
      const AQ = [
        { type: "visual", category: "letter_reversal", question: "Which letter looks different from the others?", visual: '<div class="flex gap-4 justify-center text-5xl md:text-6xl font-display my-4"><span class="text-primary">b</span><span class="text-primary">b</span><span class="text-pink border-3 border-pink rounded-xl px-2">d</span><span class="text-primary">b</span><span class="text-primary">b</span></div>', options: ['First "b"', 'The "d"', 'Last "b"', "All look same"], correct: 1 },
          { type: "phonological", category: "rhyme_detection", question: 'Which word sounds like "CAT"?', visual: '<div class="flex gap-3 justify-center my-4 text-4xl"><span>🐕</span><span>🦇</span><span>🐱</span><span>✏️</span></div>', options: ["Dog", "Bat", "Cup", "Pen"], correct: 1 },
          { type: "visual", category: "pattern_recognition", question: "What comes next in this pattern?", visual: '<div class="flex gap-3 justify-center items-center my-4"><span class="w-10 h-10 rounded-full bg-primary inline-block"></span><span class="w-10 h-10 rounded-full bg-secondary inline-block"></span><span class="w-10 h-10 rounded-full bg-primary inline-block"></span><span class="w-10 h-10 rounded-full bg-secondary inline-block"></span><span class="w-10 h-10 rounded-full bg-primary inline-block"></span><span class="w-10 h-10 rounded-full border-4 border-dashed border-muted inline-block"></span></div>', options: ["Red circle", "Blue circle", "Green circle", "Yellow circle"], correct: 1 },
          { type: "spatial", category: "direction_awareness", question: "Which way is this arrow pointing?", visual: '<div class="text-center my-4"><span class="text-7xl text-primary font-black">←</span></div>', options: ["Right", "Left", "Up", "Down"], correct: 1 },
          { type: "auditory", category: "sound_matching", question: 'Which word starts with the "SH" sound?', visual: '<div class="text-center my-4 text-5xl">🤫</div>', options: ["Ship", "Chip", "Sip", "Hip"], correct: 0 },
          { type: "memory", category: "working_memory", question: "Remember: Dog, Cat, Frog. Which one was in the middle?", visual: '<div class="flex gap-6 justify-center my-4 text-5xl"><span>🐶</span><span>🐱</span><span>🐸</span></div>', options: ["Dog", "Cat", "Frog", "I forgot"], correct: 1 },
          { type: "visual", category: "spelling_pattern", question: "Which word is spelled correctly?", visual: '<div class="text-center my-4 text-4xl">🌸</div>', options: ["Beautful", "Beautiful", "Beutiful", "Beatiful"], correct: 1 },
          { type: "sequencing", category: "sequence_order", question: "Wake up → ? → Eat lunch → Sleep. What comes first?", visual: '<div class="flex gap-4 justify-center my-4 text-3xl"><span>😴</span><span class="opacity-40 text-4xl">❓</span><span>🍽️</span><span>💤</span></div>', options: ["Go to school", "Go to bed", "Eat dinner", "Watch TV"], correct: 0 },
          { type: "visual", category: "visual_discrimination", question: "Find the odd one out:", visual: '<div class="flex gap-3 justify-center my-4 text-4xl font-display"><span class="text-primary">A</span><span class="text-primary">A</span><span class="text-primary">A</span><span class="text-pink border-3 border-pink rounded-xl px-1">B</span><span class="text-primary">A</span></div>', options: ["First A", "Second A", "The B", "Last A"], correct: 2 },
          { type: "phonological", category: "syllable_counting", question: 'How many syllables in "EL-E-PHANT"?', visual: '<div class="text-center my-4 text-5xl">🐘</div>', options: ["2 syllables", "3 syllables", "4 syllables", "5 syllables"], correct: 1 },
          { type: "reading", category: "reading_comprehension", question: '"The cat sat on the mat." Where did the cat sit?', visual: '<div class="text-center my-4 text-5xl">🐱</div>', options: ["On the cat", "On the mat", "On the hat", "On the bat"], correct: 1 },
          { type: "visual", category: "mirror_image", question: 'Is this a normal "p" or a flipped one?', visual: '<div class="text-center my-4"><span class="text-8xl font-display text-pink border-4 border-pink rounded-2xl px-4">q</span></div>', options: ['Normal "p"', 'Flipped "p" (it\'s "q")', "Both are same", "Can't tell"], correct: 1 },
      ];

      const CM = {
        letter_reversal: { label: "Letter Recognition", emoji: "🔤", color: "#FF6B35", type: "Visual" },
        rhyme_detection: { label: "Rhyme & Sounds", emoji: "🎵", color: "#2EC4B6", type: "Phonological" },
        pattern_recognition: { label: "Pattern Spotting", emoji: "🧩", color: "#FFD166", type: "Visual" },
        direction_awareness: { label: "Direction Sense", emoji: "🧭", color: "#FF85A1", type: "Spatial" },
        sound_matching: { label: "Sound Matching", emoji: "🔊", color: "#43E97B", type: "Auditory" },
        working_memory: { label: "Memory Skills", emoji: "🧠", color: "#4FACFE", type: "Memory" },
        spelling_pattern: { label: "Spelling Skills", emoji: "✍️", color: "#FA709A", type: "Language" },
        sequence_order: { label: "Ordering Things", emoji: "📋", color: "#F6D365", type: "Sequencing" },
        visual_discrimination: { label: "Spotting Details", emoji: "👁️", color: "#38F9D7", type: "Visual" },
        syllable_counting: { label: "Syllable Clapping", emoji: "👏", color: "#FDA085", type: "Phonological" },
        reading_comprehension: { label: "Reading Skills", emoji: "📖", color: "#FF9A9E", type: "Language" },
        mirror_image: { label: "Mirror Confusion", emoji: "🪞", color: "#FECFEF", type: "Visual" },
      };

      const CG = [ "linear-gradient(135deg,#FF6B35,#FFD166)", "linear-gradient(135deg,#2EC4B6,#A8E6CF)", "linear-gradient(135deg,#FF85A1,#FFD166)", "linear-gradient(135deg,#43E97B,#38F9D7)", "linear-gradient(135deg,#FA709A,#FEE140)", "linear-gradient(135deg,#4FACFE,#00F2FE)", "linear-gradient(135deg,#F6D365,#FDA085)", "linear-gradient(135deg,#FF9A9E,#FECFEF)", "linear-gradient(135deg,#FF6B35,#FF85A1)", "linear-gradient(135deg,#2EC4B6,#FFD166)", "linear-gradient(135deg,#A8E6CF,#43E97B)", "linear-gradient(135deg,#764BA2,#667eea)", "linear-gradient(135deg,#11998e,#38ef7d)", "linear-gradient(135deg,#FC466B,#3F5EFB)", "linear-gradient(135deg,#f093fb,#f5576c)", "linear-gradient(135deg,#4facfe,#00f2fe)", "linear-gradient(135deg,#43e97b,#38f9d7)" ];
      const TG = [ "linear-gradient(145deg,#FF6B35,#FF8F65)", "linear-gradient(145deg,#2EC4B6,#5DD9CE)", "linear-gradient(145deg,#FFD166,#FFE08A)", "linear-gradient(145deg,#FF85A1,#FFA8BA)", "linear-gradient(145deg,#43E97B,#6EF0A0)", "linear-gradient(145deg,#4FACFE,#74C0FF)", "linear-gradient(145deg,#FDA085,#FDBFA8)", "linear-gradient(145deg,#38F9D7,#6AFBE3)" ];

      // ============================================================
      // SCREEN MANAGEMENT
      // ============================================================
      function showScreen(id) {
        document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
        const s = document.getElementById("screen-" + id);
        if (s) { s.classList.add("active"); s.classList.add("screen-enter"); setTimeout(() => s.classList.remove("screen-enter"), 500); }
        
        S.currentScreen = id;
        window.scrollTo(0, 0);
        
        // Render specific screen data
        if (id === 'dashboard') renderDashboard();
        if (id === 'all-lessons') renderAllLessons();
        if (id === 'progress') renderProgress();
        if (id === 'profile') renderProfile();
        if (id === 'parent-report') renderParentReport();
        if (id === 'chatbot') initChat();
      }

      function goBack(t) { stopTTS(); showScreen(t); }
      
      function showToast(m, t = "info") {
        const e = document.getElementById("toast");
        e.textContent = m;
        e.className = "toast show " + (t === "success" ? "bg-green-500 text-white" : t === "error" ? "bg-red-500 text-white" : "bg-white text-brown");
        setTimeout(() => e.classList.remove("show"), 2500);
      }

      // ============================================================
      // SOUNDS
      // ============================================================
      function playSound(t) {
        try {
          const c = new (window.AudioContext || window.webkitAudioContext)();
          if (t === "correct") { [523.25, 659.25, 783.99].forEach((f, i) => { const o = c.createOscillator(), g = c.createGain(); o.connect(g); g.connect(c.destination); o.type = "sine"; o.frequency.value = f; g.gain.value = 0.2; g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.15 * (i + 1) + 0.2); o.start(c.currentTime + 0.15 * i); o.stop(c.currentTime + 0.15 * (i + 1) + 0.2); }); }
          else if (t === "wrong") { const o = c.createOscillator(), g = c.createGain(); o.connect(g); g.connect(c.destination); o.type = "triangle"; o.frequency.value = 200; o.frequency.linearRampToValueAtTime(150, c.currentTime + 0.3); g.gain.value = 0.15; g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.4); o.start(); o.stop(c.currentTime + 0.4); }
          else if (t === "click") { const o = c.createOscillator(), g = c.createGain(); o.connect(g); g.connect(c.destination); o.type = "sine"; o.frequency.value = 800; g.gain.value = 0.1; g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.08); o.start(); o.stop(c.currentTime + 0.08); }
          else if (t === "complete") { [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => { const o = c.createOscillator(), g = c.createGain(); o.connect(g); g.connect(c.destination); o.type = "sine"; o.frequency.value = f; g.gain.value = 0.15; g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.2 * (i + 1) + 0.3); o.start(c.currentTime + 0.2 * i); o.stop(c.currentTime + 0.2 * (i + 1) + 0.3); }); }
        } catch (e) {}
      }
      
      function createConfetti() {
        const c = document.createElement("canvas"); c.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999"; c.width = window.innerWidth; c.height = window.innerHeight; document.body.appendChild(c);
        const x = c.getContext("2d"), cols = ["#FF6B35", "#2EC4B6", "#FFD166", "#FF85A1", "#A8E6CF", "#43E97B"], ps = Array.from({ length: 80 }, () => ({ x: Math.random() * c.width, y: Math.random() * c.height - c.height, w: Math.random() * 10 + 5, h: Math.random() * 6 + 3, color: cols[Math.floor(Math.random() * cols.length)], speed: Math.random() * 4 + 2, angle: Math.random() * Math.PI * 2, spin: (Math.random() - 0.5) * 0.15, drift: (Math.random() - 0.5) * 2 }));
        let f = 0;
        function a() { x.clearRect(0, 0, c.width, c.height); ps.forEach(p => { p.y += p.speed; p.x += p.drift; p.angle += p.spin; x.save(); x.translate(p.x, p.y); x.rotate(p.angle); x.fillStyle = p.color; x.globalAlpha = Math.max(0, 1 - f / 140); x.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); x.restore(); }); f++; if (f < 150) requestAnimationFrame(a); else c.remove(); }
        a();
      }

      // ============================================================
      // TTS
      // ============================================================
      let currentUtterance = null;
      function speak(text) { if (!("speechSynthesis" in window)) return; window.speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); const v = window.speechSynthesis.getVoices(); const fv = v.find(x => x.name.includes("Samantha")) || v.find(x => x.name.includes("Google UK English Female")) || v.find(x => x.lang.startsWith("en")); if (fv) u.voice = fv; u.rate = 0.85; u.pitch = 1.15; u.volume = 1; currentUtterance = u; u.onstart = () => { S.ttsSpeaking = true; updateTTSBtns(true); }; u.onend = () => { S.ttsSpeaking = false; updateTTSBtns(false); }; u.onerror = () => { S.ttsSpeaking = false; updateTTSBtns(false); }; window.speechSynthesis.speak(u); }
      function stopTTS() { if ("speechSynthesis" in window) window.speechSynthesis.cancel(); S.ttsSpeaking = false; updateTTSBtns(false); }
      function updateTTSBtns(s) { document.querySelectorAll(".tts-btn").forEach(b => b.classList.toggle("speaking", s)); }
      function toggleTTS() { if (S.ttsSpeaking) { stopTTS(); return; } const q = AQ[S.assessIndex]; speak(q.question + ". " + q.options.join(". ")); }
      function toggleTTSExercise() { if (S.ttsSpeaking) { stopTTS(); return; } if (!S.lessons || !S.lessons.chapters[S.currentChapter]) return; const ex = S.lessons.chapters[S.currentChapter].exercise[S.exIndex]; speak(ex.question + ". " + (ex.scenario || "") + ". " + ex.options.join(". ")); }
      function speakCurrentCard() { if (S.ttsSpeaking) { stopTTS(); return; } if (!S.lessons || !S.lessons.chapters[S.currentChapter]) return; const c = S.lessons.chapters[S.currentChapter].cards[S.currentCard]; if (c) speak(c.title + ". " + c.content + ". Fun fact: " + c.funFact); }
      if ("speechSynthesis" in window) { speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices(); speechSynthesis.getVoices(); }

      // ============================================================
      // AGE SELECTOR
      // ============================================================
      document.querySelectorAll(".age-btn").forEach(b => { b.addEventListener("click", () => { playSound("click"); document.querySelectorAll(".age-btn").forEach(x => x.classList.remove("selected")); b.classList.add("selected"); S.userAge = parseInt(b.dataset.age); }); });

      // ============================================================
      // START ASSESSMENT
      // ============================================================
      function startAssessment() { const n = document.getElementById("input-name").value.trim(); if (!n) { showToast("Please enter your name first!", "error"); document.getElementById("input-name").focus(); return; } S.userName = n; S.assessIndex = 0; S.assessAnswers = []; playSound("click"); showScreen("assessment"); renderQuestion(); }
      const ENCS = [ { emoji: "🌟", text: "You're doing great!" }, { emoji: "💪", text: "Keep it up, champion!" }, { emoji: "🎉", text: "Awesome work!" }, { emoji: "🦁", text: "The lion is proud of you!" } ];
      function renderQuestion() { const q = AQ[S.assessIndex], t = AQ.length, i = S.assessIndex; document.getElementById("assess-counter").textContent = `${i + 1} of ${t}`; document.getElementById("assess-progress").style.width = `${((i + 1) / t) * 100}%`; document.getElementById("assess-content").innerHTML = `<div class="text-center mb-6"><p class="text-sm font-bold text-muted mb-2 uppercase tracking-wider">${CM[q.category]?.label || "Question"}</p><h2 class="font-display text-xl md:text-2xl text-brown text-responsive leading-snug">${q.question}</h2>${q.visual || ""}</div><div class="space-y-3" id="assess-options">${q.options.map((o, j) => `<button class="option-card btn-press w-full text-left p-4 rounded-2xl bg-white shadow-md font-bold text-brown text-responsive" onclick="answerAssess(${j})" data-index="${j}"><span class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-peach text-primary font-extrabold text-sm mr-3">${String.fromCharCode(65 + j)}</span>${o}</button>`).join("")}</div>`; }
      function answerAssess(idx) { const q = AQ[S.assessIndex], ok = idx === q.correct; S.assessAnswers.push({ questionIndex: S.assessIndex, selected: idx, correct: ok, category: q.category }); const bs = document.querySelectorAll("#assess-options .option-card"); bs.forEach(b => { b.onclick = null; b.style.pointerEvents = "none"; const bi = parseInt(b.dataset.index); if (bi === q.correct) b.classList.add("correct"); if (bi === idx && !ok) b.classList.add("wrong"); }); playSound(ok ? "correct" : "wrong"); if ((S.assessIndex + 1) % 4 === 0 && S.assessIndex < AQ.length - 1) { const e = ENCS[Math.floor(S.assessIndex / 4) % ENCS.length]; document.getElementById("encourage-emoji").textContent = e.emoji; document.getElementById("encourage-text").textContent = e.text; document.getElementById("encourage-overlay").classList.remove("hidden"); return; } setTimeout(nextQ, 800); }
      function closeEncourage() { document.getElementById("encourage-overlay").classList.add("hidden"); setTimeout(nextQ, 200); }
      function nextQ() { S.assessIndex++; if (S.assessIndex >= AQ.length) calcResults(); else renderQuestion(); }

      // ============================================================
      // RESULTS & PROFILE ANALYSIS
      // ============================================================
      function calcResults() {
        const wrong = S.assessAnswers.filter(a => !a.correct);
        const freq = {};
        wrong.forEach(a => { freq[a.category] = (freq[a.category] || 0) + 1; });
        S.weaknesses = Object.entries(freq).sort((a, b) => b[1] - a[1]).map(e => e[0]);
        if (!S.weaknesses.length) S.weaknesses = ["reading_comprehension", "working_memory"];
        
        // Analyze Dyslexia Profile
        const typeScores = { Visual: 0, Phonological: 0, Memory: 0, Spatial: 0, Language: 0 };
        S.assessAnswers.forEach(a => { if (!a.correct) { const cat = CM[a.category]; if (cat && typeScores[cat.type] !== undefined) typeScores[cat.type]++; } });
        const maxType = Object.entries(typeScores).sort((a,b) => b[1] - a[1])[0];
        S.dyslexiaProfile = { primaryType: maxType[1] > 0 ? maxType[0] : "Balanced", scores: typeScores, recommendations: getRecommendations(maxType[0]) };
        
        const score = S.assessAnswers.filter(a => a.correct).length;
        showScreen("results");
        document.getElementById("results-title").textContent = `Great Job, ${S.userName}!`;
        document.getElementById("results-subtitle").textContent = score >= 10 ? "You're a superstar!" : score >= 7 ? "Nice work! Let's explore more!" : "Let's learn together!";
        setTimeout(() => { document.getElementById("score-circle").style.setProperty("--score", (score / 12) * 100); document.getElementById("score-number").textContent = score; }, 300);
        document.getElementById("results-list").innerHTML = S.weaknesses.slice(0, 5).map(c => { const m = CM[c] || { label: c, emoji: "❓", color: "#999" }; return `<div class="flex items-center gap-3 p-2 rounded-xl bg-peach/50"><span class="text-xl">${m.emoji}</span><span class="font-bold text-sm text-brown flex-1">${m.label}</span><span class="text-xs font-bold px-2 py-0.5 rounded-full text-white" style="background:${m.color}">Explore</span></div>`; }).join("");
        createConfetti(); playSound("complete");
      }

      function getRecommendations(type) {
        const recs = {
          "Visual": [ "Use a ruler or finger to track lines while reading.", "Use colored overlays to reduce visual stress.", "Practice with 'find the difference' games.", "Encourage tracing letters in sand or air." ],
          "Phonological": [ "Practice clapping out syllables together.", "Play rhyming games in the car.", "Break words into sounds: 'C-A-T'.", "Read books with rhymes aloud." ],
          "Memory": [ "Use visual schedules for routines.", "Play memory matching games.", "Encourage retelling stories in order.", "Use sticky notes for reminders." ],
          "Spatial": [ "Use the 'L-hand' trick for Left/Right.", "Practice map reading activities.", "Sports and dance help spatial awareness.", "Highlight directional words in text." ],
          "Language": [ "Read together daily, even for 10 mins.", "Discuss the story: Who, What, Where.", "Use visual dictionaries.", "Keep a vocabulary journal with pictures." ],
          "Balanced": [ "Keep up the great work!", "Read fun stories together.", "Play educational word games.", "Maintain a positive learning environment." ]
        };
        return recs[type] || recs["Balanced"];
      }

      // ============================================================
      // LESSON GENERATION
      // ============================================================
      async function generateAndShowLessons() {
        S.lastAction = "generateAndShowLessons";
        showScreen("loading");
        animateLoadingSteps();
        
        // Simulate processing / API
        setTimeout(() => {
            S.lessons = buildFallbackLessons(S.weaknesses); // Personalized
            S.allLessons = buildFallbackLessons([], true); // All content
            saveToLocalStorage();
            renderDashboard();
            showScreen("dashboard");
            createConfetti();
        }, 4000);
      }

      function animateLoadingSteps() { const steps = document.querySelectorAll(".loading-step"); steps.forEach(s => { s.classList.remove("visible"); const d = parseInt(s.dataset.delay); setTimeout(() => s.classList.add("visible"), d); }); }

      // ============================================================
      // CONTENT LIBRARY (Expanded)
      // ============================================================
      function buildFallbackLessons(weaknesses, showAll = false) {
        const n = S.userName;
        const chapters = [];
        const seen = new Set();
        const mapping = {
          letter_reversal: [0, 1], mirror_image: [1, 2], visual_discrimination: [2, 3],
          rhyme_detection: [3, 4], sound_matching: [4, 5], syllable_counting: [5, 6],
          pattern_recognition: [6, 7], direction_awareness: [7, 8], working_memory: [8, 9],
          sequence_order: [9, 10], spelling_pattern: [10, 11], reading_comprehension: [11, 12],
          phoneme_blending: [13], sound_segmentation: [14], sight_words: [15], visualization: [16]
        };

        const indices = [];
        
        if (showAll) {
            // Return all chapters
            for(let i=0; i<17; i++) indices.push(i);
        } else {
            // Return mapped chapters
            for (const w of weaknesses) {
              const cids = mapping[w] || [];
              for (const ci of cids) { if (!seen.has(ci) && indices.length < 5) { seen.add(ci); indices.push(ci); } }
            }
            for (let i = 0; i < 17 && indices.length < 5; i++) { if (!seen.has(i)) { seen.add(i); indices.push(i); } }
        }
        
        indices.sort((a, b) => a - b);
        for (const i of indices) chapters.push(getFallbackChapter(i, n));
        return { chapters };
      }

      function getFallbackChapter(idx, n) {
        const library = [
            // 0-12 existing chapters...
            { title: "The b and d Detective", emoji: "🔍", cards: [ { title: "Meet the Letter Family", content: 'Some letters look like twins! "b" and "d" are twins. They look almost the same. But they are different!', emoji: "👦", funFact: "Did you know? 1 in 5 kids mixes up b and d. You are not alone!" }, { title: "The Belly Trick", content: '"b" has a belly on the LEFT. "d" has a belly on the RIGHT. Touch your belly and check!', emoji: "🫃", funFact: 'Think: "b" = belly on left, "d" = direction right!' }, { title: "The Bat Trick", content: 'Draw a bat. The bat faces LEFT = "b". The bat faces RIGHT = "d". A bat is like the round part of the letter!', emoji: "🦇", funFact: "Bats sleep upside down! They are the only mammals that can fly." }, { title: "Practice Time", content: `Hey ${n}! Look at this: 🅱️ is "b". 🅳 is "d". Can you see the difference? The stick goes different ways!`, emoji: "✏️", funFact: "Your brain gets stronger every time you practice. Like a muscle!" }, { title: "You Are a Detective", content: `Great job ${n}! Now when you see b or d, use your tricks. Belly check or bat check. You got this!`, emoji: "🏆", funFact: "Detectives solve mysteries. You just solved the b and d mystery!" } ], exercise: [ { question: `${n}, which letter is this: a round part on the RIGHT with a stick going up?`, scenario: "Imagine the round part is a belly pointing right.", options: ['It is "b"', 'It is "d"', 'It is "p"', 'It is "q"'], correct: 1, explanation: 'The belly on the right means it is "d"!' }, { question: 'Your friend wrote "dog" but it looks like "bog". What happened?', scenario: "They mixed up b and d at the start of the word.", options: [ "They forgot the word", "They mixed up b and d", "They wrote it right", "They need more sleep" ], correct: 1, explanation: "They swapped b for d. The belly trick would help them!" }, { question: "Which trick helps you tell b and d apart?", scenario: "Think about all the tricks we learned.", options: [ "Count to 10", "The belly or bat trick", "Close your eyes", "Write bigger" ], correct: 1, explanation: "The belly trick and bat trick are made for b and d!" } ] },
            { title: "Mirror Mirror No Tricks", emoji: "🪞", cards: [ { title: "Meet the Mirror Twins", content: '"p" and "q" are mirror twins! If you put "p" in a mirror, it looks like "q". Tricky right?', emoji: "🪞", funFact: "A mirror flips everything! Left becomes right and right becomes left." }, { title: "The Line Trick", content: '"p" has the stick going DOWN from the top LEFT. "q" has the stick going DOWN from the top RIGHT.', emoji: "📏", funFact: "Railroad tracks use mirrors too! They help drivers see around curves." }, { title: "Pig and Queen", content: '"p" is for PIG. Pig starts with p! "q" is for QUEEN. Queen starts with q! Say the word to remember.', emoji: "🐷", funFact: 'A group of pigs is called a "drift"! Funny name right?' }, { title: "The Thumb Trick", content: `${n}, make a thumbs up with each hand. Left thumb = "p" side. Right thumb = "q" side. Try it now!`, emoji: "👍", funFact: "Your thumb is the strongest finger. It has its own special muscle!" }, { title: "Mirror Champion", content: `You learned to beat mirror tricks ${n}! Use pig/queen or the line trick. Mirrors can not fool you anymore!`, emoji: "🏅", funFact: "Champions practice every day. Even 5 minutes counts!" } ], exercise: [ { question: "You see a letter with a round part on the left and stick going down from top right. What is it?", scenario: "Think: round part left, stick top right.", options: ["p", "q", "b", "d"], correct: 1, explanation: 'Round on left + stick from top right = "q"!' }, { question: "Which word pair has mirror twin letters?", scenario: "Look at the first letters of each word.", options: [ "Cat and Dog", "Pig and Queen", "Sun and Moon", "Big and Small" ], correct: 1, explanation: 'Pig starts with "p" and Queen starts with "q" — mirror twins!' }, { question: 'If you hold "p" up to a mirror, what does it look like?', scenario: "Think about what mirrors do to left and right.", options: [ 'Still "p"', 'It looks like "q"', 'It looks like "b"', "It disappears" ], correct: 1, explanation: 'Mirrors flip left and right, so "p" becomes "q"!' } ] },
            { title: "Spot the Difference Hero", emoji: "👁️", cards: [ { title: "Eagle Eyes", content: "Some people have super eyes! They can spot tiny differences. You can train your eyes too. Like a game!", emoji: "🦅", funFact: "Eagles can see a rabbit from 2 miles away. Their eyes are amazing!" }, { title: "Look Slow, Not Fast", content: `${n}, when you look at letters, go SLOW. Look at each part. The stick, the curve, the dots. Speed is not the goal.`, emoji: "🐌", funFact: "Snails can sleep for 3 years! Being slow can be powerful." }, { title: "The Circle Game", content: "Look at these: O O O Q O O. Did you spot the Q? It has a tiny tail! That is visual spotting. You did it!", emoji: "⭕", funFact: "The letter Q always has a tail. Without the tail, it is just an O!" }, { title: "Compare Side by Side", content: 'When letters look similar, put them NEXT to each other. "n" and "h" — one is short, one is tall. Easy to see together!', emoji: "↔️", funFact: "Your brain compares things automatically. But you can help it by going slow!" }, { title: "Detail Detective", content: `${n}, you are now a detail detective! Look slow, compare side by side, check each part. No difference can hide from you!`, emoji: "🔎", funFact: "Real detectives use magnifying glasses. Your eyes are your magnifying glass!" } ], exercise: [ { question: "In this row: A A B A A A — which position is different?", scenario: "Count from left to right starting at 1.", options: [ "Position 2", "Position 3", "Position 4", "Position 5" ], correct: 1, explanation: 'Position 3 has "B" while all others have "A"!' }, { question: 'What is the difference between "n" and "h"?', scenario: "Think about the shape of each letter.", options: [ "Color is different", "One has a tall stick", "They are exactly same", "One has a dot" ], correct: 1, explanation: '"h" has a tall stick going up. "n" is shorter. That is the difference!' }, { question: 'Your teacher writes "rn" but it looks like "m" to you. What should you do?', scenario: "Think about the best way to check.", options: [ "Give up", "Look at each letter slowly and closely", "Guess randomly", "Skip it" ], correct: 1, explanation: 'Look closely! "rn" has two separate bumps. "m" has three bumps connected.' } ] },
            { title: "Rhyme Time Adventure", emoji: "🎵", cards: [ { title: "What is a Rhyme?", content: "A rhyme is when two words sound the same at the END. Cat and HAT rhyme! Sun and FUN rhyme! Easy!", emoji: "🐱", funFact: 'The word "rhyme" comes from an old word that meant "number" or "rhythm"!' }, { title: "The Ending Sound", content: 'To find a rhyme, listen to the LAST sound. "c-at" and "h-at" — both end with "-at"! That means they rhyme.', emoji: "🔚", funFact: "Some languages like Japanese do not have rhyming words at all!" }, { title: "Rhyme or Not?", content: `${n}, does "Dog" rhyme with "Log"? YES! Both end with "-og". Does "Dog" rhyme with "Dig"? NO! Different ending sound.`, emoji: "🐕", funFact: 'Dr. Seuss made up silly rhyming words. "Green Eggs and Ham" is full of rhymes!' }, { title: "Make Up Rhymes", content: 'Can you think of a word that rhymes with "Star"? Car! Bar! Far! See? Once you find one, more come easy!', emoji: "⭐", funFact: "Rappers and poets use rhymes to make their words sound musical!" }, { title: "Rhyme Master", content: `${n}, you are becoming a rhyme master! Listen to ending sounds, try matching them, and make up your own rhymes. It gets easier!`, emoji: "🎤", funFact: "Babies can hear rhyme patterns before they can even talk!" } ], exercise: [ { question: 'Which word rhymes with "Cake"?', scenario: "Listen to the ending sound of each option.", options: ["Cook", "Make", "Cap", "Kick"], correct: 1, explanation: 'Cake and Make both end with "-ake" sound. That is a rhyme!' }, { question: 'Your friend says "Moon" rhymes with "Moon". Is that a rhyme?', scenario: "Think about what makes a rhyme.", options: [ "Yes, same ending", "No, they are the same word", "Yes, all words rhyme", "No, words cannot rhyme" ], correct: 1, explanation: "A rhyme needs TWO DIFFERENT words with the same ending sound!" }, { question: "Which pair does NOT rhyme?", scenario: "Check each pair carefully.", options: [ "Bed / Red", "Sing / Ring", "Book / Tree", "Play / Day" ], correct: 2, explanation: 'Book ends with "-ook" and Tree ends with "-ee". They do not rhyme!' } ] },
            { title: "Sound Detective", emoji: "🔊", cards: [ { title: "First Sound Matters", content: 'Every word starts with a sound. "Cat" starts with "Kuh". "Dog" starts with "Duh". Listen carefully to the FIRST sound.', emoji: "👂", funFact: "There are about 44 different sounds in English. But only 26 letters!" }, { title: "Same Start, Different Word", content: '"Sun" and "Sock" both start with "Sss" sound. "Ball" and "Bat" both start with "Buh" sound. Same start, different words!', emoji: "🧦", funFact: 'The "sh" sound is actually TWO sounds put together: s + h!' }, { title: "The Mouth Trick", content: 'Say "Buh" and "Puh". Your lips do the same thing! But "Buh" uses your voice and "Puh" does not. Try it!', emoji: "👄", funFact: 'When you whisper, you lose all the voiced sounds. "Z" becomes "S" and "V" becomes "F"!' }, { title: `${n}'s Sound Game`, content: `${n}, say "Fffish" slowly. Hear the "Fff"? Now say "Fffrog". Same first sound! You are a sound detective now!`, emoji: "🐟", funFact: 'Dolphins make clicking sounds to "see" underwater using echolocation!' }, { title: "Sound Champion", content: "You learned to match sounds by listening to the FIRST part of words. Use the mouth trick if you get confused. Keep listening!", emoji: "🏅", funFact: "Musicians have the best ears for sounds. They can hear tiny differences!" } ], exercise: [ { question: 'Which word starts with the SAME sound as "Ship"?', scenario: "Say each word out loud and listen to the first sound.", options: ["Chip", "Sip", "Trip", "Dip"], correct: 1, explanation: 'Ship and Sip both start with "Shh" sound. Chip starts with "Ch" which is different!' }, { question: '"Three" and "Tree" — do they start with the same sound?', scenario: "Say both words slowly and compare.", options: [ "Yes, same sound", "No, different sounds", "They are the same word", "Cannot tell" ], correct: 0, explanation: 'Both start with the "Thr" sound! Many people confuse them but they sound the same at the start.' }, { question: 'You hear "Kuh-ah-tuh". Which word is it?', scenario: "Break it into parts and put them together.", options: ["Car", "Cat", "Cot", "Cut"], correct: 1, explanation: "Kuh-ah-tuh = Cat! Breaking sounds into parts helps you figure out words!" } ] },
            { title: "Clap and Count", emoji: "👏", cards: [ { title: "What is a Syllable?", content: 'A syllable is a BEAT in a word. "Cat" has 1 beat. "Ap-ple" has 2 beats. "El-e-phant" has 3 beats. Easy!', emoji: "🥁", funFact: "The longest word in English has 189 syllables! It is a chemical name." }, { title: "The Clap Method", content: 'Say a word and CLAP for each beat. "But-ter-fly" — clap, clap, clap! Three claps = three syllables!', emoji: "🤲", funFact: "In Japanese, every syllable gets exactly the same time. Like a metronome!" }, { title: "Short Words = 1 Beat", content: "Dog, cat, sun, run, big, small — these are all 1 syllable. One clap each. They are short and punchy!", emoji: "💨", funFact: 'All 1-syllable words are called "monosyllabic." That is a 5-syllable word for 1-syllable things!' }, { title: `${n}'s Clap Challenge`, content: `${n}, try this: "Fan-tas-tic" — how many claps? Fan (clap) tas (clap) tic (clap)! Three syllables! You did it!`, emoji: "🌟", funFact: "Children in many countries learn syllables by clapping. It works everywhere!" }, { title: "Syllable Star", content: "Now you can count syllables in any word! Just say it slowly and clap. You are a syllable star!", emoji: "⭐", funFact: "Singers use syllable counting to match words with music notes!" } ], exercise: [ { question: 'How many syllables in "Banana"?', scenario: "Say it slowly and clap for each beat.", options: ["2", "3", "4", "1"], correct: 1, explanation: "Ba-na-na = 3 syllables! Three claps!" }, { question: "Which word has 2 syllables?", scenario: "Clap each word and count.", options: ["Dog", "Happy", "Elephant", "Tree"], correct: 1, explanation: "Hap-py = 2 syllables! Dog and Tree have 1. Elephant has 4." }, { question: 'Your teacher says "Count the syllables in: Computer." What do you answer?', scenario: "Break it into parts slowly.", options: [ "2 syllables", "3 syllables", "4 syllables", "5 syllables" ], correct: 1, explanation: "Com-pu-ter = 3 syllables!" } ] },
            { title: "Pattern Power", emoji: "🧩", cards: [ { title: "What is a Pattern?", content: "A pattern is something that REPEATS. Red Blue Red Blue — see? The same thing keeps happening. Your brain loves patterns!", emoji: "🔴", funFact: "Bees make honeycomb in a hexagon pattern. It is the strongest shape in nature!" }, { title: "Find the Rule", content: 'Every pattern has a RULE. Circle Square Circle Square — the rule is "circle then square" repeating. Find the rule and you find the pattern!', emoji: "📐", funFact: "Snowflakes always have 6 sides. That is a pattern frozen in ice!" }, { title: "Patterns in Letters", content: 'Letters have patterns too! "ight" in: Light, Night, Fight, Right. The "ight" part repeats! Knowing patterns helps you read faster.', emoji: "💡", funFact: 'There are over 200 words that end with "ight" in English!' }, { title: `${n}'s Pattern Mission`, content: `${n}, look at: ABB ABB ABB ___. What comes next? ABB! The group ABB keeps repeating. You found it!`, emoji: "🎯", funFact: "Math is all about finding patterns. When you find patterns, math gets easier!" }, { title: "Pattern Master", content: "Patterns are everywhere — in nature, in words, in numbers. Now you can spot them! Keep looking, they are hiding everywhere!", emoji: "🏅", funFact: "The Fibonacci pattern appears in sunflowers, pinecones, and galaxies!" } ], exercise: [ { question: "What comes next: Star Heart Star Heart Star ___?", scenario: "Look at what keeps repeating.", options: ["Star", "Heart", "Moon", "Diamond"], correct: 1, explanation: "The pattern is Star-Heart repeating. After Star comes Heart!" }, { question: "Which group of words shows a pattern?", scenario: "Look at the ENDING of each word.", options: [ "Cat Dog Bird", "Make Take Wake", "Run Jump Hop", "Big Small Tall" ], correct: 1, explanation: 'Make, Take, Wake all end with "-ake"! That is a word pattern!' }, { question: "The pattern is: 2 4 6 8 ___. What comes next?", scenario: "What is happening between each number?", options: ["9", "10", "12", "14"], correct: 1, explanation: "Each number goes up by 2! 8 + 2 = 10!" } ] },
            { title: "Left or Right Quest", emoji: "🧭", cards: [ { title: "Meet Left and Right", content: "Left is one side. Right is the other side. Your left hand writes. Your right hand... well, it helps! Everyone has both sides!", emoji: "🤚", funFact: "About 90% of people are right-handed. Only 10% are left-handed like some famous artists!" }, { title: "The L Hand Trick", content: 'Hold up both hands. The one that makes an "L" shape is your LEFT hand! The other one is right. Try it now!', emoji: "🤟", funFact: 'The word "left" comes from an old word meaning "weak." But left-handed people are NOT weak!' }, { title: "Directions Are Everywhere", content: "The exit is on the LEFT. The milk is on the RIGHT. Your friend sits to your LEFT. Directions help us find things!", emoji: "🏪", funFact: "GPS satellites use directions to know exactly where you are on Earth!" }, { title: `${n}'s Direction Game`, content: `${n}, point to the door. Is it on your left or right? Now point to a window. Left or right? You are getting better!`, emoji: "🚪", funFact: "Sailors use a compass to know directions. North, South, East, West!" }, { title: "Direction Hero", content: "You know left from right now! Use the L hand trick when confused. Practice with things around you. You are a direction hero!", emoji: "🦸", funFact: "Dolphins always turn left when they sleep. They literally sleep on their left side!" } ], exercise: [ { question: "You are holding a book. The cover is on your right. Which hand is closer to the cover?", scenario: "Think about your hands and which side is right.", options: [ "Left hand", "Right hand", "Both hands", "Cannot tell" ], correct: 1, explanation: "The cover is on the right side, so your right hand is closer!" }, { question: 'The teacher says "Turn left." You were facing the door. Which way do you face now?', scenario: "Imagine turning to your left.", options: [ "Still facing door", "Face the windows", "Face the back wall", "Face the ceiling" ], correct: 1, explanation: "Turning left from the door would make you face a different direction. Think about what is to your left!" }, { question: "Which trick helps you remember left from right?", scenario: "Think about all the tricks we learned.", options: [ "Count your fingers", "The L hand trick", "Close your eyes", "Jump up and down" ], correct: 1, explanation: 'The L hand trick! Hold up both hands and find the one that looks like "L"!' } ] },
            { title: "Memory Superhero Training", emoji: "🧠", cards: [ { title: "What is Working Memory?", content: "Working memory is like a whiteboard in your brain. You write things on it, use them, then erase. Some whiteboards are bigger than others!", emoji: "📋", funFact: "Your working memory can hold about 4-7 things at once. That is normal!" }, { title: "The Chunk Trick", content: 'Instead of remembering "D-O-G-C-A-T", remember "DOG" and "CAT". Group things into chunks. Your brain likes chunks!', emoji: "📦", funFact: "Phone numbers are chunked: 555-123-4567. Three chunks instead of ten numbers!" }, { title: "The Picture Trick", content: 'Turn words into pictures! "Apple Banana Orange" — picture an apple, a banana, and an orange. Pictures are easier to remember!', emoji: "🖼️", funFact: "Your brain remembers pictures 60,000 times faster than words!" }, { title: `${n}'s Memory Mission`, content: `${n}, remember these 3: Red, Blue, Green. Now close your eyes. Say them back. Red, Blue, Green! You did it!`, emoji: "🎨", funFact: "Smells can trigger very strong memories. The smell of cookies might remind you of grandma!" }, { title: "Memory Champion", content: `${n}, your memory is like a muscle. The more you use these tricks, the stronger it gets! Chunk it, picture it, say it. You are a memory champion!`, emoji: "🏆", funFact: "Memory champions can remember 500+ numbers in order. They use tricks just like these!" } ], exercise: [ { question: "Remember: Sun, Moon, Star. Which one was SECOND?", scenario: "Think back to the list: Sun was first...", options: ["Sun", "Moon", "Star", "I forgot"], correct: 1, explanation: "Sun (1st), Moon (2nd), Star (3rd). Moon was second!" }, { question: 'What is the best way to remember "5-2-8-1-9"?', scenario: "Think about the tricks we learned.", options: [ "Say it once fast", "Chunk it: 52-81-9", "Close your eyes", "Give up" ], correct: 1, explanation: "Chunking makes 5 separate numbers into 3 easy chunks! Much simpler!" }, { question: 'You need to remember: "Book, Pencil, Eraser, Ruler." What picture could help?', scenario: "Think about making a picture in your mind.", options: [ "Just a blank page", "A desk with a book, pencil, eraser, and ruler on it", "A number", "A song" ], correct: 1, explanation: "Picture all four items on a desk. One picture is easier than four words!" } ] },
            { title: "First, Then, Last", emoji: "📋", cards: [ { title: "What is a Sequence?", content: "A sequence is putting things in ORDER. First you wake up. Then you brush teeth. Then you eat breakfast. Order matters!", emoji: "1️⃣", funFact: "DNA is a sequence too! It is like a recipe written in code that makes you, you!" }, { title: "Story Sequences", content: "Every story has a sequence: BEGINNING, MIDDLE, END. First something happens, then something else, then it ends. Like a movie!", emoji: "🎬", funFact: "Movies use storyboards — they are sequences of pictures showing the story before filming!" }, { title: "Number Sequences", content: "Numbers have sequences too! 1, 2, 3, 4... Each number is one more than the last. You have been counting in sequence since you were tiny!", emoji: "🔢", funFact: "Fibonacci sequence: each number is the sum of the two before it. 1, 1, 2, 3, 5, 8, 13..." }, { title: `${n}'s Ordering Game`, content: `${n}, put this in order: Plant seed, Flower grows, Water the seed. Answer: Plant seed FIRST, Water it SECOND, Flower grows LAST!`, emoji: "🌻", funFact: "Seeds can wait years before growing. Some seeds from ancient Egypt still grew after 3000 years!" }, { title: "Sequence Star", content: "First, then, last. Beginning, middle, end. You can put anything in order now! Stories, numbers, steps. You are a sequence star!", emoji: "⭐", funFact: "Chefs follow sequences called recipes. One wrong step and the cake fails!" } ], exercise: [ { question: "What is the correct order: Put on shoes, Tie laces, Put on socks?", scenario: "Think about what you actually do each morning.", options: [ "Shoes, Laces, Socks", "Socks, Shoes, Laces", "Socks, Shoes, Tie Laces", "Tie Laces, Socks, Shoes" ], correct: 2, explanation: "Socks first, then shoes, then tie the laces! That is the real order!" }, { question: "In a story, the problem usually happens in which part?", scenario: "Think: Beginning, Middle, or End.", options: ["Beginning", "Middle", "End", "Never"], correct: 1, explanation: "The middle is where the exciting problem happens. Beginning sets it up, end solves it!" }, { question: "The sequence is: 5, 10, 15, 20, ___. What comes next?", scenario: "What is the pattern between numbers?", options: ["21", "22", "25", "30"], correct: 2, explanation: "Each number goes up by 5! 20 + 5 = 25!" } ] },
            { title: "Spelling Magic Tricks", emoji: "✍️", cards: [ { title: "Spelling Has Rules", content: "English spelling looks crazy but it has HIDDEN rules! Once you know the rules, spelling gets way easier. Like magic tricks!", emoji: "🎩", funFact: "English has 1,100 ways to spell 44 sounds. That IS crazy! But patterns help!" }, { title: 'The "Magic E" Rule', content: 'Magic E at the end makes the vowel say its NAME! "Cat" becomes "Cate" (sounds like "Kate"). The E is silent but powerful!', emoji: "✨", funFact: 'Magic E is also called "silent E" or "bossy E" because it bosses the vowel around!' }, { title: "Double Letters", content: "When a word has a short vowel and one consonant after, DOUBLE the consonant before adding -ed or -ing! Run → Running. Stop → Stopped!", emoji: "👟", funFact: 'The word "bookkeeper" is the only English word with three double letters in a row!' }, { title: `${n}'s Spelling Power`, content: `${n}, try this: "Make" + "ing" = ? Drop the e first! "Making"! See? The magic E leaves when -ing comes to visit.`, emoji: "💪", funFact: 'The longest word without a repeating letter is "uncopyrightable" — 15 letters, all different!' }, { title: "Spelling Wizard", content: "You now know Magic E and double letter rules. Two tricks that unlock hundreds of words! Keep practicing and you will be a spelling wizard!", emoji: "🧙", funFact: "Shakespeare invented over 1,700 words! Some were probably spelled wrong at first!" } ], exercise: [ { question: 'Add "ing" to "Bake". What do you get?', scenario: "Remember the Magic E rule.", options: ["Bakeing", "Baking", "Baing", "Bakking"], correct: 1, explanation: "Drop the magic E first! Bake → Bak + ing = Baking!" }, { question: "Which word is spelled correctly?", scenario: "Use the double letter rule.", options: ["Runing", "Stoping", "Running", "Swiming"], correct: 2, explanation: "Run has a short vowel + one consonant, so double it: Running!" }, { question: 'Why does "Kit" become "Kitten" with two T\'s?', scenario: "Think about the double letter rule.", options: [ "Because it looks nice", "Short vowel + one consonant = double it", "Random rule", "Only for cat words" ], correct: 1, explanation: 'Short vowel "i" + one consonant "t" = double the "t" when adding a suffix!' } ] },
            { title: "Reading Detective", emoji: "📖", cards: [ { title: "Reading is Like Detecting", content: "When you read, you are a detective. You look for CLUES in the words to understand the STORY. Every sentence is a clue!", emoji: "🔍", funFact: "The fastest reader in the world can read 25,000 words per minute! That is a whole book in minutes!" }, { title: "Who, What, Where", content: "Every story answers: WHO is it about? WHAT happened? WHERE did it happen? Find these three and you understand the story!", emoji: "❓", funFact: 'Journalists use the "5 Ws": Who, What, Where, When, Why. Five questions to understand anything!' }, { title: "Picture Clues", content: "Pictures in books are not just pretty. They give you CLUES about the story! Look at the picture BEFORE reading. It helps your brain get ready!", emoji: "🖼️", funFact: "Comic books use pictures AND words together. They are great for becoming a better reader!" }, { title: `${n}'s Reading Mission`, content: `${n}, read this: "The red bird sat on a big tree." WHO? Red bird. WHAT? Sat. WHERE? On a big tree. See? You understood it all!`, emoji: "🐦", funFact: "Hummingbirds can fly backwards! No other bird can do that. They are nature's little helicopters!" }, { title: "Reading Champion", content: "You are a reading champion! Remember: Who, What, Where. Use picture clues. Read slowly and find the clues in every sentence!", emoji: "🏅", funFact: "Kids who read for fun become better readers faster than kids who only read for school!" } ], exercise: [ { question: '"Tom has a blue ball. He lost it in the park." WHERE did Tom lose the ball?', scenario: "Use the Who, What, Where method.", options: ["At home", "In the park", "At school", "In his bag"], correct: 1, explanation: 'The story says "in the park"! That is the WHERE answer!' }, { question: '"The cat was hungry. She looked at the fish on the table." What does the cat WANT?', scenario: "Think about what the clues tell you.", options: [ "To sleep", "To eat the fish", "To go outside", "To play" ], correct: 1, explanation: "The cat is hungry AND looking at fish. She wants to eat the fish!" }, { question: "What should you do FIRST when reading a page with a picture?", scenario: "Think about the best reading strategy.", options: [ "Skip the picture", "Look at the picture first for clues", "Close the book", "Read as fast as possible" ], correct: 1, explanation: "Pictures give you clues about the story before you even read the words!" } ] },
            { title: "The Grand Review", emoji: "🎪", cards: [ { title: "All Your Superpowers", content: `${n}, you have learned so many tricks! Letter tricks, sound tricks, memory tricks, reading tricks. You have MANY superpowers now!`, emoji: "🦸", funFact: "Every person learns differently. Your way is unique and that makes it special!" }, { title: "Mix and Match", content: "Sometimes you need MORE than one trick. Reading a hard word? Use sound matching AND spelling rules together! Two tricks are better than one!", emoji: "🔀", funFact: "Swiss army knives have many tools in one. Your brain is like that — many tricks in one place!" }, { title: "When Things Feel Hard", content: `It is OK to feel stuck ${n}. Take a breath. Try a different trick. Ask for help. Being stuck is not failing. It is learning!`, emoji: "🌱", funFact: 'Thomas Edison failed 1,000 times before making the light bulb work. He said "I found 1,000 ways that don\'t work!"' }, { title: "Your Toolkit", content: "Your toolkit has: Belly trick, L hand trick, Clap method, Chunk trick, Picture trick, Who-What-Where, Magic E rule. Use ANY of them anytime!", emoji: "🧰", funFact: "A carpenter needs many tools. A reader needs many tricks. You have a full toolkit now!" }, { title: "Keep Going, Champion", content: `${n}, you are amazing. Every small step counts. Keep practicing, keep using your tricks, and keep believing in yourself. The lion believes in you! 🦁`, emoji: "🏆", funFact: 'The word "amazing" has the word "maze" in it. Life is a maze but you have the map!' } ], exercise: [ { question: 'You see the word "Right" but are not sure if it is "Right" or "Rigth". Which trick helps?', scenario: "Think about all your tricks.", options: [ "Close your eyes", "Use spelling pattern rules to check", "Give up", "Guess randomly" ], correct: 1, explanation: 'Spelling patterns! "ight" is a common pattern: Right, Light, Night, Fight.' }, { question: 'You keep mixing up "was" and "saw". What is the BEST strategy?', scenario: "These are common reversals.", options: [ "Avoid the words", 'Make a picture: "was" has the a first, "saw" has the a in middle', "Write them bigger", "Skip reading sentences with them" ], correct: 1, explanation: 'Picture trick! "was" = w-a-s (a is first). "saw" = s-a-w (a is in middle). Different positions!' }, { question: "A friend is struggling with reading. What should you tell them?", scenario: "Think about what you learned about learning.", options: [ '"Just try harder"', '"Everyone learns differently, let me share some tricks"', '"Reading is easy, why can\'t you do it"', '"Give up"' ], correct: 1, explanation: "Everyone learns differently! Sharing tricks and being kind is the best help!" } ] },
            { title: "Sound Blending Builder", emoji: "🧱", cards: [ { title: "Building with Sounds", content: "Words are built with blocks of sound. If you push the blocks together, you make a word! /c/ /a/ /t/ pushed together says... Cat!", emoji: "🧱", funFact: "This is called Blending. It is how babies learn to say their first words!" }, { title: "The Rollercoaster", content: "Imagine sounds are on a rollercoaster. They start apart, then WHOOSH together! Ssssss-uuuuu-nnnnn. Sun! Say it slow, then fast.", emoji: "🎢", funFact: "Rollercoasters go up to 120 miles per hour! Your brain works even faster when blending." }, { title: "Stretch It Out", content: "Use a rubber band. Stretch the word: ffffff-iiiiii-shhhhh. Now let it snap back! Fish. Stretching helps you hear every sound.", emoji: "🎈", funFact: "Octopuses can stretch their bodies to fit through tiny holes! Be flexible like an octopus with your sounds." }, { title: `${n}'s Building Site`, content: `${n}, listen: /d/ /o/ /g/. Push them together fast. D-d-d-o-o-o-g-g-g. Dog! You built a word!`, emoji: "🏗️", funFact: "The Great Wall of China was built by putting millions of stones together, just like we put sounds together!" }, { title: "Master Builder", content: "You are a master word builder! Hear the sounds, push them together, say the word. Reading is just building sounds!", emoji: "👷", funFact: "Some languages click their tongue for sounds! The Xhosa language has 18 different click sounds." } ], exercise: [ { question: "Listen to these sounds pushed together: /s/ /i/ /t/. What is the word?", scenario: "Say them faster and faster.", options: ["Set", "Sat", "Sit", "Soot"], correct: 2, explanation: "S-i-t blended together makes Sit!" }, { question: "Which word is made by blending /m/ /a/ /p/?", scenario: "Stretch the sounds out and snap them together.", options: ["Map", "Mop", "Mop", "Mole"], correct: 0, explanation: "M-a-p blended together makes Map!" }, { question: "Your friend says /c/ /u/ /p/ separately. How do you help them find the word?", scenario: "Think about the best blending trick.", options: [ "Tell them to guess", "Show them how to stretch and snap the sounds together", "Ask them to shout", "Ignore them" ], correct: 1, explanation: "Stretching the sounds (c-u-p) and snapping them together helps hear the word Cup!" } ] },
            { title: "Sound Chopper", emoji: "🔪", cards: [ { title: "Chopping Words", content: "To spell, you need to chop words into sounds. 'Fish' is not just one sound. It is F - i - sh. Three sound blocks!", emoji: "🔪", funFact: "Chefs chop vegetables to make soup. You chop sounds to make spelling easier!" }, { title: "Robot Talk", content: "Pretend to be a robot! Robots speak in separate beeps. 'B-e-d' (beep-beep-beep). This helps you hear every part.", emoji: "🤖", funFact: "Robots really do talk in beeps and boops! The first robot was built in 1928." }, { title: "Finger Counting", content: "Hold up a finger for each sound you hear. 'Cat' = C (1) a (2) t (3). Three sounds, three fingers!", emoji: "🖐️", funFact: "You have 27 bones in your hand. That is a lot of bones to count sounds with!" }, { title: `${n}'s Sound Salad`, content: `${n}, chop up the word 'Sun'. S-u-n. How many sounds did you find? Three! You made a sound salad!`, emoji: "🥗", funFact: "Salads can have any ingredient. Words can have any sound. Chopping makes it easy!" }, { title: "Chopping Champion", content: "You can chop any word now! Use robot talk or finger counting. Spelling is easy when you chop the word first.", emoji: "🏅", funFact: "The word 'strengths' is the longest word with only one vowel. Imagine chopping that one!" } ], exercise: [ { question: "How many sounds are in the word 'Map'?", scenario: "Use your fingers or robot talk.", options: ["1 sound", "2 sounds", "3 sounds", "4 sounds"], correct: 2, explanation: "M-a-p. Three sounds!" }, { question: "Say 'Shop' like a robot. Which sounds do you hear?", scenario: "Remember some sounds are made of two letters like 'sh'.", options: [ "S-h-o-p (4 sounds)", "Sh-o-p (3 sounds)", "Shop (1 sound)", "S-ho-p (3 sounds)" ], correct: 1, explanation: "Shop has 3 sound blocks: Sh, o, p. 'Sh' is one sound made by two letters!" }, { question: "You want to spell 'Dog'. What is the first step?", scenario: "Think about the chopping strategy.", options: [ "Write any letters", "Chop the word into sounds: D-o-g", "Close your eyes", "Write the last letter first" ], correct: 1, explanation: "Chop it first! D-o-g. Now you know you need D, o, and g." } ] },
            { title: "The Rule Breakers", emoji: "🃏", cards: [ { title: "The Sneaky Words", content: "Some words break the rules! They do not sound like they look. 'Said' sounds like 'sed'. These are Sight Words.", emoji: "🃏", funFact: "Sight words are like outlaws in the Wild West. They do not follow the phonics laws!" }, { title: "Just Look and Know", content: "Because they break rules, you cannot sound them out easily. You have to know them by SIGHT. Take a picture with your eyes!", emoji: "📸", funFact: "Your eyes work like a camera. They snap a photo of the word to store it in your brain." }, { title: "The Word 'The'", content: "This is the King of Sight Words. We see it everywhere! It does not say 'the' (like 'three'). It says 'thuh' or 'thee'.", emoji: "👑", funFact: "The word 'the' is the most used word in the whole English language!" }, { title: `${n}'s Trick Words`, content: `${n}, here is a secret: 'Was' says 'woz'. 'Of' says 'ov'. 'Said' says 'sed'. Catch them breaking the rules!`, emoji: "🕵️", funFact: "About 75% of the words in kids' books are sight words! Knowing them makes reading super fast." }, { title: "Sight Word Hero", content: "You can defeat the rule breakers! Practice looking at them and saying them fast. You are a Sight Word Hero!", emoji: "🦸", funFact: "Some teachers call these 'Heart Words' because you have to know them by heart!" } ], exercise: [ { question: "Which word breaks the rules?", scenario: "Think about which word sounds different than it looks.", options: ["Cat", "Dog", "Said", "Big"], correct: 2, explanation: "Said breaks the rules! It has 'ai' but says 'e'. It's a sight word!" }, { question: "How should you learn a sight word?", scenario: "Think about the best strategy for rule breakers.", options: [ "Sound it out slowly", "Take a picture with your eyes and memorize it", "Skip it", "Change the letters" ], correct: 1, explanation: "Sight words break rules, so memorizing them by sight is best!" }, { question: "Which sentence uses a sight word correctly?", scenario: "Look for the rule breakers.", options: [ "The dog runs.", "I lik pizza.", "She haz a cat.", "We go too skool." ], correct: 0, explanation: "'The' is a sight word here. The other options have spelling mistakes!" } ] },
            { title: "Mind Movies", emoji: "🎬", cards: [ { title: "The Brain Cinema", content: "Did you know you have a movie screen in your brain? When you read, you can play a movie! It makes reading fun and easy.", emoji: "🎬", funFact: "Dreaming is like watching a movie in your sleep. Your brain makes up the whole story!" }, { title: "Paint the Picture", content: "Read a sentence. Now close your eyes. What do you see? If the book says 'A big red dog', see a BIG RED DOG in your mind!", emoji: "🎨", funFact: "Artists use their imagination to paint pictures. Readers use imagination to paint mind pictures!" }, { title: "Add the Details", content: "Good readers add details. Not just 'a dog'. Is it fluffy? Is it running? Is it sunny? Add details to your mind movie!", emoji: "🖼️", funFact: "The human brain processes images 60,000 times faster than text. Pictures help you understand faster!" }, { title: `${n}'s Director Debut`, content: `${n}, you are the movie director! The author writes the script, but YOU make the movie. Make it colorful and exciting!`, emoji: "🎥", funFact: "Movie directors read scripts to make movies. You read books to make mind movies!" }, { title: "Movie Master", content: "If you lose the story, pause your mind movie. What just happened? Rewind and re-read. You are the master of your movie!", emoji: "🍿", funFact: "Some people have aphantasia, which means they cannot see pictures in their mind. Most people can!" } ], exercise: [ { question: '"The giant green frog sat on a lily pad." What do you see in your mind movie?', scenario: "Paint the picture in your head.", options: [ "A small brown dog", "A giant green frog on a leaf", "A blue fish", "A red bird" ], correct: 1, explanation: "The words described a giant green frog and a lily pad! That is what your movie should show." }, { question: "Why is making a mind movie helpful?", scenario: "Think about how it helps you read.", options: [ "It makes reading take longer", "It helps you understand and remember the story", "It makes you sleepy", "It is not helpful" ], correct: 1, explanation: "Mind movies help you remember what happened and make reading feel real!" }, { question: "You are reading but your mind movie stopped. What should you do?", scenario: "Think like a director.", options: [ "Stop reading", "Rewind: re-read the last part to restart the movie", "Skip to the end", "Ask someone else" ], correct: 1, explanation: "Good directors fix the movie! Re-reading helps you get the picture back." } ] }
        ];
        return library[Math.min(idx, library.length - 1)];
      }

      // ============================================================
      // RENDER FUNCTIONS
      // ============================================================
      function renderDashboard() {
        document.getElementById("dash-greeting").textContent = `Hi, ${S.userName}!`;
        document.getElementById("dash-stars").textContent = S.totalStars;
        if (!S.lessons) return;
        
        const decoImgs = [ "https://i.pinimg.com/736x/4c/97/85/4c9785c8971a11edf410cf07c61f2f77.jpg", "https://i.pinimg.com/736x/5e/25/e7/5e25e772aba56e976a49f9df72835db9.jpg", "https://i.pinimg.com/736x/a2/67/d1/a267d1a00480e1c476336279bf1d8ec1.jpg", "https://i.pinimg.com/736x/89/5c/f6/895cf6497d05ca1f730c1c808713978b.jpg", "https://i.pinimg.com/webp70/736x/7c/91/b8/7c91b8ddd4d0c961fa181dc844ae1ceb.webp" ];
        const heights = ["200px", "240px", "180px", "260px", "220px"];
        const c = document.getElementById("dash-chapters");
        c.innerHTML = S.lessons.chapters.map((ch, i) => {
            const g = TG[i % TG.length], p = S.chapterProgress[i], done = p && p.completed, cc = ch.cards.length, h = heights[i % heights.length];
            return `<div class="masonry-item"><div class="chapter-tile rounded-3xl p-5 shadow-lg text-white relative overflow-hidden" style="background:${g};min-height:${h}" onclick="openChapter(${i})"><img src="${decoImgs[i % decoImgs.length]}" class="absolute -bottom-2 -right-2 w-20 h-20 object-contain opacity-30 rotate-12" style="mix-blend-mode: multiply; filter: brightness(1.2) contrast(1.1);" alt="" loading="lazy"><div class="flex items-center justify-between mb-3">${done ? '<span class="bg-white/30 backdrop-blur-sm px-2 py-0.5 rounded-full text-xs font-bold"><i class="fa-solid fa-check mr-1"></i>Done</span>' : `<span class="bg-white/30 backdrop-blur-sm px-2 py-0.5 rounded-full text-xs font-bold">${cc} cards</span>`}${done ? `<span class="text-sm font-bold">${p.score}/${p.total}</span>` : ""}</div><div class="text-5xl mb-2">${ch.emoji || "📚"}</div><h3 class="font-extrabold text-lg leading-snug mb-3">${ch.title}</h3>${done ? `<div class="w-full h-2 bg-white/30 rounded-full overflow-hidden"><div class="h-full bg-white rounded-full" style="width:${Math.round((p.score / p.total) * 100)}%"></div></div>` : ""}<div class="absolute bottom-3 left-5 text-xs font-bold opacity-70"><i class="fa-solid fa-hand-pointer mr-1"></i>Tap to open</div></div></div>`;
        }).join("");
      }

      function renderAllLessons() {
        if (!S.allLessons) S.allLessons = buildFallbackLessons([], true);
        const decoImgs = [ "https://i.pinimg.com/736x/4c/97/85/4c9785c8971a11edf410cf07c61f2f77.jpg", "https://i.pinimg.com/736x/5e/25/e7/5e25e772aba56e976a49f9df72835db9.jpg", "https://i.pinimg.com/736x/a2/67/d1/a267d1a00480e1c476336279bf1d8ec1.jpg", "https://i.pinimg.com/736x/89/5c/f6/895cf6497d05ca1f730c1c808713978b.jpg", "https://i.pinimg.com/webp70/736x/7c/91/b8/7c91b8ddd4d0c961fa181dc844ae1ceb.webp" ];
        const c = document.getElementById("all-chapters");
        c.innerHTML = S.allLessons.chapters.map((ch, i) => {
            const g = CG[i % CG.length];
            return `<div class="masonry-item"><div class="chapter-tile rounded-3xl p-5 shadow-lg text-white relative overflow-hidden" style="background:${g};min-height:200px" onclick="openChapter(${i}, true)"><img src="${decoImgs[i % decoImgs.length]}" class="absolute -bottom-2 -right-2 w-20 h-20 object-contain opacity-30 rotate-12" style="mix-blend-mode: multiply; filter: brightness(1.2) contrast(1.1);" alt="" loading="lazy"><div class="text-5xl mb-2">${ch.emoji || "📚"}</div><h3 class="font-extrabold text-lg leading-snug">${ch.title}</h3></div></div>`;
        }).join("");
      }

      function renderProgress() {
        // Total Stars (just number, not "X Stars")
        document.getElementById("prog-stars").textContent = S.totalStars;
        
        // Completed lessons
        const completed = Object.values(S.chapterProgress).filter(p => p.completed).length;
        document.getElementById("prog-completed").textContent = completed;
        
        // Accuracy
        let totalCorrect = 0, totalQuestions = 0;
        Object.values(S.chapterProgress).forEach(p => { if(p.completed) { totalCorrect += p.score; totalQuestions += p.total; } });
        const acc = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
        document.getElementById("prog-accuracy").textContent = acc + "%";
        
        // Progress bar
        const totalChapters = S.lessons ? S.lessons.chapters.length : (S.allLessons ? S.allLessons.chapters.length : 0);
        const percent = totalChapters > 0 ? Math.round((completed / totalChapters) * 100) : 0;
        document.getElementById("prog-percent").textContent = percent + "%";
        document.getElementById("prog-bar").style.width = percent + "%";
        document.getElementById("prog-done").textContent = completed;
        document.getElementById("prog-total").textContent = totalChapters || "-";
        
        // Streak (placeholder - would track daily activity in real app)
        document.getElementById("prog-streak").textContent = S.streak || 0;
        
        // Activity list
        const activityContainer = document.getElementById("prog-activity");
        const activities = [];
        
        // Build activity list from completed chapters
        Object.entries(S.chapterProgress).forEach(([idx, p]) => {
          if (p.completed && S.lessons) {
            const ch = S.lessons.chapters[idx];
            if (ch) {
              activities.push({
                title: ch.title,
                score: p.score,
                total: p.total,
                emoji: ch.emoji || "📚"
              });
            }
          }
        });
        
        if (activities.length === 0) {
          activityContainer.innerHTML = '<p class="text-sm text-muted text-center py-4">No activity yet. Start learning!</p>';
        } else {
          activityContainer.innerHTML = activities.slice(-5).reverse().map(a => `
            <div class="flex items-center gap-3 p-3 bg-cream rounded-xl">
              <div class="text-2xl">${a.emoji}</div>
              <div class="flex-1">
                <p class="font-bold text-brown text-sm">${a.title}</p>
                <p class="text-xs text-muted">Scored ${a.score}/${a.total}</p>
              </div>
              <span class="text-accent text-lg">⭐</span>
            </div>
          `).join("");
        }
      }

      function renderProfile() {
        document.getElementById("profile-name").textContent = S.userName;
        document.getElementById("profile-age").textContent = `Age: ${S.userAge}`;
        document.getElementById("profile-stars").textContent = S.totalStars;
      }

      function editProfile() {
        document.getElementById("edit-name").value = S.userName;
        const ageBtns = document.querySelectorAll(".edit-age-btn");
        ageBtns.forEach(btn => {
          btn.classList.remove("bg-primary", "text-white");
          btn.classList.add("bg-peach", "text-brown");
          if (parseInt(btn.dataset.age) === S.userAge) {
            btn.classList.remove("bg-peach", "text-brown");
            btn.classList.add("bg-primary", "text-white");
          }
          btn.onclick = () => {
            ageBtns.forEach(b => {
              b.classList.remove("bg-primary", "text-white");
              b.classList.add("bg-peach", "text-brown");
            });
            btn.classList.remove("bg-peach", "text-brown");
            btn.classList.add("bg-primary", "text-white");
          };
        });
        document.getElementById("edit-profile-modal").classList.remove("hidden");
      }

      function closeEditProfile() {
        document.getElementById("edit-profile-modal").classList.add("hidden");
      }

      function saveProfile() {
        const newName = document.getElementById("edit-name").value.trim();
        if (!newName) {
          showToast("Please enter a name!", "error");
          return;
        }
        
        const selectedAgeBtn = document.querySelector(".edit-age-btn.bg-primary");
        if (selectedAgeBtn) {
          S.userAge = parseInt(selectedAgeBtn.dataset.age);
        }
        
        S.userName = newName;
        saveToLocalStorage();
        renderProfile();
        renderDashboard();
        closeEditProfile();
        showToast("Profile updated!", "success");
      }

      function showAchievements() {
        showToast("Achievements coming soon!", "info");
      }

      function showSettings() {
        showToast("Settings coming soon!", "info");
      }

      function resetProgress() {
        if (confirm("Are you sure you want to reset all progress? This cannot be undone.")) {
          S.chapterProgress = {};
          S.totalStars = 0;
          S.streak = 0;
          S.lessons = null;
          S.allLessons = null;
          clearLocalStorage();
          renderProfile();
          renderProgress();
          showToast("Progress reset!", "success");
          showScreen("welcome");
        }
      }

      function renderParentReport() {
        if(!S.dyslexiaProfile) return;
        const p = S.dyslexiaProfile;
        const el = document.getElementById("report-content");
        el.innerHTML = `
          <div class="bg-white rounded-3xl p-6 shadow-lg mb-4">
            <h2 class="font-display text-xl text-brown mb-2">Assessment Report</h2>
            <p class="text-sm text-muted">Child: <span class="font-bold text-brown">${S.userName}</span></p>
            <p class="text-sm text-muted">Age: <span class="font-bold text-brown">${S.userAge}</span></p>
          </div>
          
          <div class="bg-white rounded-3xl p-6 shadow-lg mb-4">
            <h3 class="font-bold text-primary mb-3"><i class="fa-solid fa-brain mr-2"></i>Learning Profile</h3>
            <p class="text-brown text-sm mb-2">Based on the assessment, ${S.userName} shows traits of:</p>
            <div class="bg-peach rounded-xl p-4 text-center">
              <span class="font-display text-2xl text-primary">${p.primaryType} Processing</span>
            </div>
            <div class="mt-4 space-y-2">
              ${Object.entries(p.scores).map(([k, v]) => `
                <div class="flex items-center gap-2">
                  <span class="text-xs font-bold w-24 text-muted">${k}</span>
                  <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div class="h-full bg-secondary" style="width: ${v * 25}%"></div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="bg-white rounded-3xl p-6 shadow-lg mb-4">
            <h3 class="font-bold text-primary mb-3"><i class="fa-solid fa-lightbulb mr-2"></i>Home Activities</h3>
            <ul class="space-y-2">
              ${p.recommendations.map(r => `
                <li class="flex items-start gap-2 text-sm text-brown">
                  <i class="fa-solid fa-check-circle text-secondary mt-1"></i>
                  <span>${r}</span>
                </li>
              `).join('')}
            </ul>
          </div>

          <div class="bg-white rounded-3xl p-6 shadow-lg">
            <h3 class="font-bold text-primary mb-3"><i class="fa-solid fa-heart mr-2"></i>Behavior Tips</h3>
            <p class="text-sm text-brown mb-2">Patience is key. Celebrate small wins. Avoid comparing with siblings. Use positive reinforcement.</p>
            <p class="text-xs text-muted">Disclaimer: This is a screening tool, not a medical diagnosis. Please consult a specialist for clinical diagnosis.</p>
          </div>
        `;
      }

      // ============================================================
      // CHATBOT
      // ============================================================
      function initChat() {
        if(S.chatHistory.length === 0) {
          S.chatHistory.push({ text: `Hi ${S.userName}! I'm Dysko. How are you feeling today?`, type: 'bot' });
        }
        renderChat();
      }

      function renderChat() {
        const el = document.getElementById("chat-messages");
        el.innerHTML = S.chatHistory.map(m => `<div class="chat-bubble ${m.type}">${m.text}</div>`).join('');
        el.scrollTop = el.scrollHeight;
      }

      function sendChat() {
        const input = document.getElementById("chat-input");
        const text = input.value.trim();
        if(!text) return;
        
        S.chatHistory.push({ text, type: 'user' });
        input.value = '';
        renderChat();
        
        setTimeout(() => {
          const response = getBotResponse(text);
          S.chatHistory.push({ text: response, type: 'bot' });
          renderChat();
          speak(response);
        }, 1000);
      }

      function getBotResponse(text) {
        const t = text.toLowerCase();
        if(t.includes('sad') || t.includes('hard') || t.includes('stuck')) return "I'm sorry you feel that way. Remember, even superheroes have tough days. Try one of our fun lessons to feel better!";
        if(t.includes('happy') || t.includes('good') || t.includes('great')) return "That's wonderful to hear! Keep shining bright like a star!";
        if(t.includes('help')) return "I'm here for you! We can learn about letters, sounds, or read stories together. What do you want to do?";
        if(t.includes('hello') || t.includes('hi')) return "Hello there, friend! Ready to learn something cool today?";
        return "That's interesting! Tell me more, or should we practice some reading magic?";
      }

      // ============================================================
      // CHAPTER VIEW
      // ============================================================
      function openChapter(i, isAll = false) {
        stopTTS();
        S.currentChapter = i;
        S.currentCard = 0;
        const source = isAll ? S.allLessons : S.lessons;
        if(!source) return;
        
        const ch = source.chapters[i], el = document.getElementById("chapter-scroll");
        S.lastScreen = isAll ? 'all-lessons' : 'dashboard';
        
        el.innerHTML = ch.cards.map((c, ci) => {
            const g = CG[(i * 6 + ci) % CG.length], last = ci === ch.cards.length - 1;
            return `<div class="chapter-card" style="background:${g}" data-card-index="${ci}"><div class="max-w-md mx-auto w-full text-white"><div class="flex items-center gap-2 mb-6 opacity-80"><span class="text-lg">${ch.emoji || "📚"}</span><span class="text-sm font-bold">${ch.title}</span><span class="ml-auto text-sm font-bold">${ci + 1}/${ch.cards.length}</span></div><div class="text-7xl mb-5 text-center">${c.emoji || "💡"}</div><h2 class="font-display text-2xl md:text-3xl mb-5 leading-snug">${c.title}</h2><div class="bg-white/15 backdrop-blur-sm rounded-2xl p-5 mb-5"><p class="text-lg font-semibold leading-relaxed">${c.content}</p></div><div class="bg-white/20 backdrop-blur-sm rounded-2xl p-4 border-l-4 border-white/50"><p class="text-xs font-bold uppercase tracking-wider opacity-70 mb-1">Did You Know?</p><p class="font-semibold text-sm leading-relaxed">${c.funFact}</p></div>${!last ? '<div class="text-center mt-8 scroll-hint"><i class="fa-solid fa-chevron-up text-2xl opacity-60"></i><p class="text-xs font-bold opacity-50 mt-1">Swipe up for next</p></div>' : `<button onclick="startExercise(${isAll})" class="btn-press w-full mt-8 py-4 rounded-2xl bg-white text-primary font-extrabold text-lg shadow-xl hover:shadow-2xl">Start Quiz! <i class="fa-solid fa-brain ml-2"></i></button>`}</div></div>`;
        }).join("");
        
        const dots = document.getElementById("chapter-dots");
        dots.innerHTML = ch.cards.map((_, di) => `<div class="dot ${di === 0 ? "active" : ""}" data-dot="${di}"></div>`).join("");
        
        const obs = new IntersectionObserver(es => { es.forEach(e => { if (e.isIntersecting) { const ci = parseInt(e.target.dataset.cardIndex); S.currentCard = ci; document.querySelectorAll("#chapter-dots .dot").forEach((d, j) => d.classList.toggle("active", j === ci)); } }); }, { root: el, threshold: 0.5 });
        el.querySelectorAll(".chapter-card").forEach(c => obs.observe(c));
        
        showScreen("chapter");
        el.scrollTop = 0;
      }

      // ============================================================
      // EXERCISE
      // ============================================================
      function startExercise(isAll = false) {
        stopTTS();
        S.exIndex = 0;
        S.exAnswers = [];
        S.currentSource = isAll ? S.allLessons : S.lessons;
        showScreen("exercise");
        renderExercise();
      }
      
      function renderExercise() {
        const ch = S.currentSource.chapters[S.currentChapter], ex = ch.exercise[S.exIndex], t = ch.exercise.length;
        document.getElementById("ex-counter").textContent = `${S.exIndex + 1} of ${t}`;
        document.getElementById("ex-progress").style.width = `${((S.exIndex + 1) / t) * 100}%`;
        document.getElementById("ex-content").innerHTML = `<div class="text-center mb-5"><div class="inline-block px-4 py-1 rounded-full bg-accent/20 text-primary font-bold text-sm mb-3"><i class="fa-solid fa-lightbulb mr-1"></i>Think about it!</div><h2 class="font-display text-xl md:text-2xl text-brown leading-snug">${ex.question}</h2>${ex.scenario ? `<p class="text-muted font-semibold mt-2 text-sm">${ex.scenario}</p>` : ""}</div><div class="space-y-3" id="ex-options">${ex.options.map((o, j) => `<button class="option-card btn-press w-full text-left p-4 rounded-2xl bg-white shadow-md font-bold text-brown" onclick="answerExercise(${j})" data-index="${j}"><span class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-peach text-primary font-extrabold text-sm mr-3">${String.fromCharCode(65 + j)}</span>${o}</button>`).join("")}</div><div id="ex-feedback" class="mt-4 hidden"></div>`;
      }
      
      function answerExercise(idx) {
        const ch = S.currentSource.chapters[S.currentChapter], ex = ch.exercise[S.exIndex], ok = idx === ex.correct;
        S.exAnswers.push({ selected: idx, correct: ok });
        const bs = document.querySelectorAll("#ex-options .option-card");
        bs.forEach((b) => {
          b.onclick = null;
          b.style.pointerEvents = "none";
          const bi = parseInt(b.dataset.index);
          if (bi === ex.correct) b.classList.add("correct");
          if (bi === idx && !ok) b.classList.add("wrong");
        });
        playSound(ok ? "correct" : "wrong");
        const fb = document.getElementById("ex-feedback");
        fb.classList.remove("hidden");
        fb.innerHTML = `<div class="p-4 rounded-2xl ${ok ? "bg-green-50 border-2 border-green-300" : "bg-red-50 border-2 border-red-300"}"><p class="font-bold text-sm ${ok ? "text-green-700" : "text-red-700"}"><i class="fa-solid ${ok ? "fa-circle-check" : "fa-circle-xmark"} mr-1"></i>${ok ? "Correct!" : "Not quite!"} ${ex.explanation}</p></div>`;
        setTimeout(() => {
          S.exIndex++;
          if (S.exIndex >= ch.exercise.length) finishExercise();
          else renderExercise();
        }, 2000);
      }

      function finishExercise() {
        const sc = S.exAnswers.filter((a) => a.correct).length,
          t = S.exAnswers.length,
          stars = sc === t ? 3 : sc >= t * 0.66 ? 2 : sc >= t * 0.33 ? 1 : 0;
        S.chapterProgress[S.currentChapter] = { completed: true, score: sc, total: t };
        S.totalStars += stars * 10;
        showScreen("ex-results");
        document.getElementById("ex-result-emoji").textContent = stars === 3 ? "🏆" : stars === 2 ? "🎉" : stars === 1 ? "👍" : "💪";
        document.getElementById("ex-result-title").textContent = stars === 3 ? "Perfect Score!" : stars === 2 ? "Great Job!" : stars === 1 ? "Good Try!" : "Keep Practicing!";
        document.getElementById("ex-result-subtitle").textContent = `You scored ${sc} out of ${t} in ${S.currentSource.chapters[S.currentChapter].title}`;
        setTimeout(() => {
          document.getElementById("ex-score-circle").style.setProperty("--score", (sc / t) * 100);
          document.getElementById("ex-score-number").textContent = sc;
          document.getElementById("ex-score-total").textContent = "/ " + t;
        }, 300);
        document.getElementById("ex-stars-earned").innerHTML = Array.from({ length: 3 }, (_, i) => `<span class="text-4xl ${i < stars ? "star-collect" : "opacity-20"}" style="animation-delay:${i * 0.2}s">⭐</span>`).join("");
        document.getElementById("ex-next-btn-text").textContent = S.currentChapter < S.currentSource.chapters.length - 1 ? "Next Chapter" : "Back to Home";
        if (stars >= 2) { createConfetti(); playSound("complete"); } else playSound("correct");
        saveToLocalStorage();
      }

      function nextChapterOrDash() {
        if (S.currentChapter < S.currentSource.chapters.length - 1) {
          openChapter(S.currentChapter + 1, S.currentSource === S.allLessons);
        } else {
          renderDashboard();
          showScreen("dashboard");
        }
      }

      // ============================================================
      // INIT
      // ============================================================
      // Load saved data from localStorage
      const hasSavedData = loadFromLocalStorage();
      if (hasSavedData && S.lessons) {
        // Auto-redirect to dashboard if user has completed assessment
        S.currentScreen = "dashboard";
        renderDashboard();
        renderAllLessons();
        showScreen("dashboard");
      }

      document.getElementById("input-name").addEventListener("keydown", (e) => {
        if (e.key === "Enter") startAssessment();
      });
      setTimeout(() => document.getElementById("input-name")?.focus(), 600);
