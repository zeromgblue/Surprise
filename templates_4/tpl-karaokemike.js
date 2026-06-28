export async function render(container, data, config) {
    container.style.cssText = "max-width:100%;padding:0;height:100vh;background:#07000F;";
    document.body.style.cssText = "margin:0;overflow:hidden;";
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Kanit:wght@700;900&family=Sarabun:wght@300;400&display=swap');
        .karaoke-scene{position:relative;width:100vw;height:100vh;overflow:hidden;background:radial-gradient(ellipse at 50% 0%,#1a0030,#07000F);display:flex;flex-direction:column;align-items:center;justify-content:center;}
        .spotlight{position:absolute;top:-200px;left:50%;transform:translateX(-50%);width:400px;height:800px;background:conic-gradient(from 180deg,transparent 140deg,rgba(244,37,133,0.2) 180deg,transparent 220deg);pointer-events:none;animation:swayLight 4s ease-in-out infinite;}
        @keyframes swayLight{0%,100%{transform:translateX(-50%) rotate(-10deg)}50%{transform:translateX(-50%) rotate(10deg)}}
        .mike{width:60px;height:110px;background:radial-gradient(ellipse at 40% 30%,#555,#222);border-radius:30px 30px 10px 10px;cursor:pointer;margin:0 auto;position:relative;box-shadow:0 0 30px rgba(244,37,133,0.5),0 10px 30px rgba(0,0,0,0.8);z-index:10;transition:transform 0.1s;}
        .mike:active{transform:scale(0.95);}
        .mike-head{width:60px;height:60px;background:radial-gradient(ellipse,#888,#333);border-radius:50%;position:absolute;top:-10px;box-shadow:0 0 20px rgba(244,37,133,0.4);}
        .mike-mesh{width:56px;height:56px;position:absolute;top:-8px;left:2px;border-radius:50%;border:1px solid rgba(255,255,255,0.1);background:repeating-linear-gradient(30deg,transparent,transparent 3px,rgba(255,255,255,0.05) 3px,rgba(255,255,255,0.05) 6px);}
        .hint-txt{font-family:'Kanit',sans-serif;color:#F72585;font-size:1.1rem;margin-top:25px;animation:pulse 1.5s infinite;letter-spacing:2px;}
        @keyframes pulse{0%,100%{opacity:0.4;text-shadow:none}50%{opacity:1;text-shadow:0 0 20px #F72585}}
        .lyric-box{position:absolute;bottom:15%;width:90%;max-width:700px;text-align:center;pointer-events:none;}
        .lyric-line{font-family:'Kanit',sans-serif;font-size:1.5rem;color:#fff;text-shadow:0 2px 8px rgba(0,0,0,0.8);line-height:2;opacity:0;}
        .lyric-line span{border-bottom:3px solid transparent;padding-bottom:2px;transition:border-color 0.3s;}
        .lyric-line span.lit{border-bottom-color:#F72585;color:#F72585;text-shadow:0 0 20px #F72585;}
        .msg-card{position:absolute;top:10%;width:85%;max-width:700px;background:rgba(0,0,0,0.85);border:1px solid rgba(247,37,133,0.3);border-radius:16px;padding:30px;text-align:center;opacity:0;pointer-events:none;z-index:30;}
        .m-to{font-family:'Kanit',sans-serif;font-size:2.5rem;font-weight:900;color:#F72585;text-shadow:0 0 20px #F72585;}
        .m-from{font-family:'Kanit',sans-serif;font-size:1rem;color:#4CC9F0;margin-top:20px;letter-spacing:3px;}
        .music-bar{display:flex;gap:3px;align-items:flex-end;height:40px;margin:20px auto;}
        .bar{width:4px;background:#F72585;border-radius:2px;animation:barDance 0.5s ease-in-out infinite;}
        @keyframes barDance{0%,100%{height:4px}50%{height:30px}}
    </style>
    <div class="karaoke-scene" id="scene">
        <div class="spotlight"></div>
        <div class="mike" id="mike">
            <div class="mike-head">
                <div class="mike-mesh"></div>
            </div>
        </div>
        <div class="hint-txt" id="hint">🎤 แตะไมค์เพื่อร้องเพลง</div>
        <div class="lyric-box" id="lyricBox">
            <div class="lyric-line" id="lyric1">${buildLyric(data.receiver)}</div>
            <div class="lyric-line" id="lyric2">${buildLyricBody(data.message)}</div>
            <div class="lyric-line" id="lyric3">จาก <span>${escapeHtml(data.sender)}</span></div>
        </div>
        <div class="msg-card" id="msgCard">
            <div class="m-to">🎤 ${escapeHtml(data.receiver)}</div>
            <div class="music-bar" id="musicBar"></div>
            <div style="font-family:Sarabun,sans-serif;font-size:1.1rem;color:#e0e0e0;line-height:1.7;">${escapeHtml(data.message).replace(/\n/g,'<br>')}</div>
            <div class="m-from">♪ จาก ${escapeHtml(data.sender)} ♪</div>
        </div>
    </div>`;

    // Build music bars
    const musicBar = document.getElementById('musicBar');
    for (let i = 0; i < 20; i++) {
        const b = document.createElement('div');
        b.className = 'bar';
        b.style.animationDelay = (i * 0.05) + 's';
        b.style.animationDuration = (0.3 + Math.random() * 0.4) + 's';
        musicBar.appendChild(b);
    }

    const mike = document.getElementById('mike');
    const hint = document.getElementById('hint');
    const lyricBox = document.getElementById('lyricBox');
    const msgCard = document.getElementById('msgCard');
    let started = false;

    mike.addEventListener('click', () => {
        if (started) return;
        started = true;
        hint.style.display = 'none';
        gsap.to(mike, { y: -30, scale: 0.8, duration: 0.5, ease: 'power2.in' });

        // Show lyrics line by line
        gsap.to('#lyric1', { opacity: 1, y: -10, duration: 0.8, delay: 0.3 });
        gsap.to('#lyric2', { opacity: 1, y: -10, duration: 0.8, delay: 1.5 });
        gsap.to('#lyric3', { opacity: 1, y: -10, duration: 0.8, delay: 2.8 });

        // After lyrics, show full card
        setTimeout(() => {
            gsap.to(lyricBox, { opacity: 0, duration: 0.5 });
            gsap.to(mike, { opacity: 0, duration: 0.5 });
            gsap.to(msgCard, { opacity: 1, pointerEvents: 'auto', duration: 1, delay: 0.3, ease: 'power2.out' });
        }, 4500);
    });
}
function buildLyric(name) { return `<span class="lit">🎵 ${escapeHtml(name)} 🎵</span>`; }
function buildLyricBody(msg) { const words = (msg || '').split(' ').slice(0, 8); return words.map(w=>`<span>${escapeHtml(w)}</span>`).join(' ') + '...'; }
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector(`script[src="${src}"]`))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
