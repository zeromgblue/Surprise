export async function render(container, data, config) {
    container.style.cssText = "max-width:100%;padding:0;height:100vh;background:#0a0a0a;";
    document.body.style.cssText = "margin:0;overflow:hidden;";
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital@1&family=Sarabun:wght@300;700&display=swap');
        .piano-scene{position:relative;width:100vw;height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:hidden;background:radial-gradient(ellipse at 50% 80%,#1a0a00,#0a0a0a);}
        .title-hint{font-family:'Playfair Display',serif;font-size:1.4rem;color:#D4AF37;margin-bottom:30px;letter-spacing:2px;animation:fadeGlow 2s infinite;}
        @keyframes fadeGlow{0%,100%{text-shadow:0 0 10px #D4AF37}50%{text-shadow:0 0 30px #D4AF37}}
        .keys-row{display:flex;gap:4px;position:relative;z-index:10;}
        .key{width:54px;height:160px;background:linear-gradient(180deg,#F5F5DC,#E8E0C8);border-radius:0 0 8px 8px;cursor:pointer;border:2px solid #c0a060;box-shadow:0 4px 10px rgba(0,0,0,0.8),inset 0 -5px 10px rgba(0,0,0,0.2);transition:transform 0.08s,background 0.2s;position:relative;display:flex;align-items:flex-end;justify-content:center;padding-bottom:10px;}
        .key:active,.key.pressed{transform:translateY(6px);background:#FFD700;box-shadow:0 0 20px #FFD700,0 0 40px rgba(255,215,0,0.4);}
        .key-label{font-size:0.7rem;color:#333;font-weight:600;}
        .note-pop{position:absolute;font-size:2rem;color:#FFD700;text-shadow:0 0 20px #FFD700;pointer-events:none;z-index:50;top:-40px;}
        .msg-overlay{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;z-index:30;background:rgba(0,0,0,0.8);padding:40px;}
        .m-to{font-family:'Playfair Display',serif;font-size:3.5rem;color:#D4AF37;margin-bottom:20px;font-style:italic;}
        .m-body{font-family:'Sarabun',sans-serif;font-size:1.3rem;color:#F5F5DC;line-height:1.8;max-width:600px;text-align:center;}
        .m-from{font-family:'Playfair Display',serif;font-size:1.2rem;color:#D4AF37;margin-top:30px;font-style:italic;}
        .note-stream{position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;overflow:hidden;}
    </style>
    <div class="piano-scene" id="scene">
        <div class="note-stream" id="noteStream"></div>
        <div class="title-hint" id="hint">กดทั้ง 7 โน้ต เพื่อเปิดข้อความ</div>
        <div class="keys-row" id="keysRow">
            <div class="key" data-note="C" data-idx="0"><div class="key-label">C</div></div>
            <div class="key" data-note="D" data-idx="1"><div class="key-label">D</div></div>
            <div class="key" data-note="E" data-idx="2"><div class="key-label">E</div></div>
            <div class="key" data-note="F" data-idx="3"><div class="key-label">F</div></div>
            <div class="key" data-note="G" data-idx="4"><div class="key-label">G</div></div>
            <div class="key" data-note="A" data-idx="5"><div class="key-label">A</div></div>
            <div class="key" data-note="B" data-idx="6"><div class="key-label">B</div></div>
        </div>
        <div class="msg-overlay" id="msg">
            <div class="m-to">${escapeHtml(data.receiver)}</div>
            <div class="m-body">${escapeHtml(data.message).replace(/\n/g,'<br>')}</div>
            <div class="m-from">♪ จาก ${escapeHtml(data.sender)} ♪</div>
        </div>
    </div>`;

    const pressed = new Set();
    const noteStream = document.getElementById('noteStream');
    const msg = document.getElementById('msg');
    const hint = document.getElementById('hint');
    const notes = ['♩','♪','♫','♬','𝅘𝅥𝅮','𝅗𝅥','𝅝'];

    document.querySelectorAll('.key').forEach(key => {
        key.addEventListener('click', () => {
            if (pressed.has(key.dataset.idx)) return;
            pressed.add(key.dataset.idx);
            key.classList.add('pressed');
            spawnNote(key);
            if (pressed.size >= 7) {
                setTimeout(() => {
                    hint.style.display = 'none';
                    gsap.to(msg, { opacity: 1, pointerEvents: 'auto', duration: 1.5, ease: 'power2.out' });
                    for (let i = 0; i < 20; i++) spawnFloatingNote();
                }, 300);
            }
        });
    });

    function spawnNote(key) {
        const rect = key.getBoundingClientRect();
        const el = document.createElement('div');
        el.className = 'note-pop';
        el.textContent = notes[Math.floor(Math.random() * notes.length)];
        el.style.left = (rect.left + rect.width / 2) + 'px';
        el.style.top = rect.top + 'px';
        noteStream.appendChild(el);
        gsap.fromTo(el, { opacity: 1, y: 0 }, { opacity: 0, y: -80, duration: 1, ease: 'power2.out', onComplete: () => el.remove() });
    }

    function spawnFloatingNote() {
        const el = document.createElement('div');
        el.style.cssText = `position:absolute;font-size:${1.5 + Math.random() * 2}rem;color:#D4AF37;opacity:0;left:${Math.random() * 100}%;top:${80 + Math.random() * 20}%;pointer-events:none;`;
        el.textContent = notes[Math.floor(Math.random() * notes.length)];
        noteStream.appendChild(el);
        gsap.to(el, { y: -(200 + Math.random() * 400), opacity: 0.8, duration: 2 + Math.random() * 2, delay: Math.random() * 2, repeat: -1, yoyo: false, ease: 'power1.out', onRepeat: () => { el.style.left = Math.random() * 100 + '%'; } });
    }
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector(`script[src="${src}"]`))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
