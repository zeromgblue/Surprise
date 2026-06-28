export async function render(container, data, config) {
    container.style.cssText = "max-width:100%;padding:0;height:100vh;background:#1A1A1A;";
    document.body.style.cssText = "margin:0;overflow:hidden;";
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
    <style>
        @import url('https://fonts.googleapis.com/css2?family=VT323&family=Sarabun:wght@300;400;700&display=swap');
        .tape-scene{position:relative;width:100vw;height:100vh;background:#1A1A1A;display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:hidden;}
        .cassette{width:280px;height:180px;background:#2d2d2d;border-radius:16px;border:3px solid #4ECDC4;box-shadow:0 0 30px rgba(78,205,196,0.3),inset 0 0 20px rgba(0,0,0,0.5);position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;z-index:10;}
        .cassette-label{width:80%;height:60%;background:#FF6B6B;border-radius:8px;display:flex;align-items:center;justify-content:center;margin-bottom:10px;}
        .label-text{font-family:'VT323',monospace;font-size:1.5rem;color:#fff;letter-spacing:2px;}
        .cassette-reels{display:flex;gap:40px;position:absolute;bottom:15px;}
        .reel{width:40px;height:40px;border:3px solid #555;border-radius:50%;background:#333;position:relative;}
        .reel::after{content:'';position:absolute;inset:6px;border:2px solid #4ECDC4;border-radius:50%;border-top-color:transparent;}
        .reel-spin{animation:spin 0.3s linear infinite;}
        @keyframes spin{to{transform:rotate(360deg)}}
        .tape-ribbon{position:absolute;width:100%;height:6px;background:#1A1A1A;top:50%;transform:translateY(-50%);display:flex;align-items:center;justify-content:center;}
        .tape-line{height:4px;width:0;background:linear-gradient(90deg,#4ECDC4,#FF6B6B);border-radius:2px;transition:width 0.5s;}
        .btn-row{display:flex;gap:12px;margin-top:30px;}
        .tape-btn{padding:12px 24px;border:2px solid #4ECDC4;background:transparent;color:#4ECDC4;font-family:'VT323',monospace;font-size:1.2rem;border-radius:8px;cursor:pointer;letter-spacing:2px;transition:all 0.2s;}
        .tape-btn:hover{background:#4ECDC4;color:#1A1A1A;}
        .hint-txt{font-family:'VT323',monospace;color:#FF6B6B;font-size:1.2rem;margin-top:20px;animation:blink 1s infinite;letter-spacing:3px;}
        @keyframes blink{0%,100%{opacity:0.3}50%{opacity:1}}
        .msg-overlay{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;z-index:30;background:#1A1A1A;padding:40px;text-align:center;}
        .m-to{font-family:'VT323',monospace;font-size:4rem;color:#4ECDC4;letter-spacing:4px;text-shadow:0 0 20px #4ECDC4;}
        .m-body{font-family:'Sarabun',sans-serif;font-size:1.2rem;color:#f0f0f0;line-height:1.7;max-width:580px;margin-top:20px;}
        .m-from{font-family:'VT323',monospace;font-size:1.5rem;color:#FF6B6B;margin-top:25px;letter-spacing:3px;}
        .tape-text{position:absolute;top:-30px;font-family:'VT323',monospace;font-size:0.9rem;color:#4ECDC4;width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
    </style>
    <div class="tape-scene" id="scene">
        <div class="cassette" id="cass">
            <div class="cassette-label"><div class="label-text">SIDE A — FOR YOU ♥</div></div>
            <div class="cassette-reels">
                <div class="reel" id="reel1"></div>
                <div class="reel" id="reel2"></div>
            </div>
            <div class="tape-text" id="tapeText">⏪ REWINDING...</div>
        </div>
        <div class="btn-row">
            <button class="tape-btn" id="rewindBtn">⏪ REWIND</button>
            <button class="tape-btn" id="playBtn" style="display:none">▶ PLAY</button>
        </div>
        <div class="hint-txt" id="hint">กด ⏪ REWIND เพื่อม้วนเทป</div>
        <div class="msg-overlay" id="msg">
            <div class="m-to">${escapeHtml(data.receiver)}</div>
            <div class="m-body">${escapeHtml(data.message).replace(/\n/g,'<br>')}</div>
            <div class="m-from">📼 จาก ${escapeHtml(data.sender)}</div>
        </div>
    </div>`;

    const rewindBtn = document.getElementById('rewindBtn');
    const playBtn = document.getElementById('playBtn');
    const reel1 = document.getElementById('reel1');
    const reel2 = document.getElementById('reel2');
    const hint = document.getElementById('hint');
    const msg = document.getElementById('msg');
    const tapeText = document.getElementById('tapeText');
    let rewound = false;

    rewindBtn.addEventListener('click', () => {
        if (rewound) return;
        rewound = true;
        hint.style.display = 'none';
        reel1.classList.add('reel-spin');
        reel2.classList.add('reel-spin');
        tapeText.textContent = '⏪ REWINDING...';
        gsap.to(tapeText, { x: -20, duration: 0.1, yoyo: true, repeat: 20, ease: 'none' });

        setTimeout(() => {
            reel1.classList.remove('reel-spin');
            reel2.classList.remove('reel-spin');
            tapeText.textContent = '✓ READY TO PLAY';
            rewindBtn.style.display = 'none';
            playBtn.style.display = 'block';
        }, 2000);
    });

    playBtn.addEventListener('click', () => {
        reel1.classList.add('reel-spin');
        reel2.classList.add('reel-spin');
        reel1.style.animationDuration = '1s';
        reel2.style.animationDuration = '1s';
        setTimeout(() => {
            gsap.to('#cass', { y: -200, opacity: 0, duration: 0.8, ease: 'power2.in' });
            gsap.to('.btn-row', { y: 100, opacity: 0, duration: 0.5 });
            gsap.to(msg, { opacity: 1, pointerEvents: 'auto', duration: 1.5, delay: 0.8, ease: 'power2.out' });
        }, 1000);
    });
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector(`script[src="${src}"]`))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
