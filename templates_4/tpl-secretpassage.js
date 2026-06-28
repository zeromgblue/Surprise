export async function render(container, data, config) {
    container.style.cssText = "max-width:100%;padding:0;height:100vh;background:#050A05;";
    document.body.style.cssText = "margin:0;overflow:hidden;";
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');
    container.innerHTML = `<style>@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;700&display=swap');
    .bookshelf{width:100%;height:100%;background:linear-gradient(180deg,#0a0500 0%,#1a0e00 60%,#0d0800 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;cursor:pointer;}
    .shelf{width:90%;height:auto;display:flex;align-items:flex-end;justify-content:center;gap:4px;margin:6px 0;position:relative;}
    .shelf::after{content:'';position:absolute;bottom:-6px;left:-2%;width:104%;height:12px;background:linear-gradient(180deg,#5c3a10,#3a2008);border-radius:2px;}
    .book{height:var(--bh,80px);width:var(--bw,32px);border-radius:3px 3px 0 0;display:flex;align-items:center;justify-content:center;writing-mode:vertical-rl;font-size:0.55rem;color:rgba(255,255,255,0.5);font-family:'Sarabun',sans-serif;position:relative;cursor:pointer;}
    .glowing-book{box-shadow:0 0 18px 6px #66ff66, 0 0 4px 2px #00ff00 inset;animation:bookpulse 2s ease-in-out infinite;}
    @keyframes bookpulse{0%,100%{box-shadow:0 0 18px 6px #66ff66;} 50%{box-shadow:0 0 30px 12px #00ff66;}}
    .door-wrap{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;perspective:800px;}
    .door-left,.door-right{position:absolute;width:35%;height:85%;background:linear-gradient(180deg,#1a0e04,#0d0700);border:2px solid #3a2008;transform-origin:left center;box-shadow:inset 0 0 30px rgba(0,0,0,0.8);}
    .door-right{transform-origin:right center;left:auto;right:0;}
    .door-left{left:15%;}
    .stone-room{position:absolute;inset:0;background:radial-gradient(ellipse 60% 60% at 50% 50%,#1a1a00,#000);display:none;align-items:center;justify-content:center;flex-direction:column;}
    .wall-msg{font-family:'Sarabun',sans-serif;text-align:center;padding:30px;text-shadow:0 0 20px #aaff44,0 0 40px #66cc00;}
    .hint{position:absolute;bottom:20px;left:50%;transform:translateX(-50%);color:#66cc33;font-size:0.85rem;font-family:'Sarabun',sans-serif;background:rgba(0,0,0,0.6);padding:6px 16px;border-radius:20px;}
    .msg-panel{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;z-index:30;padding:40px;text-align:center;}
    </style>
    <div class="bookshelf" id="shelf-wall">
      <div class="shelf">
        <div class="book" style="--bh:90px;--bw:28px;background:#8B0000;">TOME</div>
        <div class="book" style="--bh:75px;--bw:24px;background:#00468B;">ATLAS</div>
        <div class="book" style="--bh:100px;--bw:30px;background:#4a2c00;">GRIMOIRE</div>
        <div class="book glowing-book" id="magic-book" style="--bh:95px;--bw:26px;background:#1a4a1a;">✦ SECRET ✦</div>
        <div class="book" style="--bh:70px;--bw:22px;background:#4a3000;">LORE</div>
        <div class="book" style="--bh:85px;--bw:28px;background:#3d003d;">SPELLS</div>
        <div class="book" style="--bh:80px;--bw:25px;background:#1a1a4a;">MAPS</div>
      </div>
      <div class="shelf">
        <div class="book" style="--bh:65px;--bw:20px;background:#5c1a00;">VOL.I</div>
        <div class="book" style="--bh:88px;--bw:32px;background:#003322;">MYTHS</div>
        <div class="book" style="--bh:72px;--bw:26px;background:#2a001a;">RUNES</div>
        <div class="book" style="--bh:95px;--bw:30px;background:#1a1a00;">ANCIENT</div>
        <div class="book" style="--bh:78px;--bw:24px;background:#001a33;">STARS</div>
        <div class="book" style="--bh:82px;--bw:28px;background:#330000;">CHAOS</div>
      </div>
      <div class="door-wrap" id="door-wrap">
        <div class="door-left" id="door-left"></div>
        <div class="door-right" id="door-right"></div>
      </div>
      <div class="stone-room" id="stone-room">
        <div class="wall-msg">
          <div style="font-size:3.5rem;color:#aaff44;margin-bottom:16px;">${escapeHtml(data.receiver)}</div>
          <div style="font-size:1.1rem;color:#ccff88;line-height:1.9;max-width:560px;">${escapeHtml(data.message).replace(/\n/g,'<br>')}</div>
          <div style="font-size:1rem;margin-top:22px;color:#88cc44;">— ${escapeHtml(data.sender)} —</div>
        </div>
      </div>
      <div class="hint" id="hint">📚 คลิกที่หนังสือเรืองแสงสีเขียว</div>
      <div class="msg-panel" id="msg">
        <div style="font-size:3rem;color:#66ff88;margin-bottom:20px;">${escapeHtml(data.receiver)}</div>
        <div style="font-size:1.2rem;color:#fff;line-height:1.8;max-width:600px;">${escapeHtml(data.message).replace(/\n/g,'<br>')}</div>
        <div style="font-size:1rem;margin-top:25px;color:#44cc66;">— ${escapeHtml(data.sender)} —</div>
      </div>
    </div>`;
    let clicked = false;
    document.getElementById('magic-book').addEventListener('click', e => { e.stopPropagation(); open(); });
    document.getElementById('shelf-wall').addEventListener('click', open);
    function open() {
        if (clicked) return; clicked = true;
        gsap.to('#hint', {opacity:0, duration:0.3});
        const books = document.querySelectorAll('.book');
        gsap.to(books, {x: i => (i%2===0?-5:5), rotation: i => (i%2===0?-3:3), duration:0.25, stagger:0.05, yoyo:true, repeat:3});
        gsap.to('#door-left', {rotateY:-90, duration:1.4, delay:0.8, ease:'power2.inOut'});
        gsap.to('#door-right', {rotateY:90, duration:1.4, delay:0.8, ease:'power2.inOut', onComplete: showRoom});
    }
    function showRoom() {
        const room = document.getElementById('stone-room');
        room.style.display = 'flex';
        gsap.from(room, {opacity:0, duration:0.8});
        setTimeout(() => gsap.to('#msg', {opacity:1, pointerEvents:'auto', duration:1.5}), 1500);
    }
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector(`script[src="${src}"]`))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
