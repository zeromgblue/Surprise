export async function render(container, data, config) {
    container.style.cssText = "max-width:100%;padding:0;height:100vh;background:#0A0510;";
    document.body.style.cssText = "margin:0;overflow:hidden;";
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');
    container.innerHTML = `<style>@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;700&display=swap');
    .scene{width:100%;height:100%;display:flex;align-items:center;justify-content:center;position:relative;background:radial-gradient(ellipse at 50% 80%,#1a0a20,#0a0510);}
    .table-surface{position:absolute;bottom:0;width:100%;height:35%;background:linear-gradient(180deg,#2a1a0a,#1a0e04);box-shadow:inset 0 10px 30px rgba(0,0,0,0.8);}
    .diary{width:min(320px,80vw);height:min(420px,65vh);position:relative;cursor:pointer;perspective:800px;}
    .cover{width:100%;height:100%;background:linear-gradient(135deg,#4a1a00,#2a0e00);border-radius:4px 12px 12px 4px;box-shadow:0 20px 60px rgba(0,0,0,0.9),-5px 0 20px rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;flex-direction:column;gap:12px;border-left:12px solid #2a0800;position:relative;overflow:hidden;}
    .cover::before{content:'';position:absolute;inset:8px;border:2px solid rgba(180,100,20,0.3);border-radius:3px;}
    .cover-title{font-family:cursive;font-size:1.4rem;color:#cc8833;text-shadow:0 0 10px rgba(200,100,0,0.5);}
    .cover-ornament{font-size:2.5rem;animation:flutter 3s ease-in-out infinite;}
    @keyframes flutter{0%,100%{transform:rotate(-2deg);}50%{transform:rotate(2deg);}}
    .book-open{display:none;width:100%;height:100%;transform-style:preserve-3d;flex-direction:row;}
    .page{width:50%;height:100%;background:linear-gradient(180deg,#f5e8d0,#ede0c0);padding:20px 16px;font-family:cursive;font-size:0.78rem;color:#2a1a00;line-height:1.8;border-left:1px solid rgba(0,0,0,0.1);}
    .page.right{border-left:1px solid #c8a870;border-right:none;border-radius:0 8px 8px 0;}
    .date-stamp{font-size:0.65rem;color:#8B4513;margin-bottom:10px;font-weight:bold;letter-spacing:1px;}
    .page-lines{background:repeating-linear-gradient(180deg,transparent,transparent 27px,rgba(0,0,0,0.08) 27px,rgba(0,0,0,0.08) 28px);height:100%;position:absolute;inset:0;pointer-events:none;}
    .hint{position:absolute;bottom:20px;left:50%;transform:translateX(-50%);color:#cc8833;font-size:0.85rem;font-family:'Sarabun',sans-serif;background:rgba(0,0,0,0.6);padding:6px 16px;border-radius:20px;white-space:nowrap;}
    .msg-panel{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;z-index:30;padding:40px;text-align:center;}
    </style>
    <div class="scene" id="scene">
      <div class="table-surface"></div>
      <div class="diary" id="diary">
        <div class="cover" id="cover">
          <div class="cover-ornament">📖</div>
          <div class="cover-title">My Secret Diary</div>
          <div style="font-size:0.7rem;color:#aa6622;font-family:cursive;">✦ Personal & Confidential ✦</div>
        </div>
        <div class="book-open" id="book-open">
          <div class="page left" style="position:relative;">
            <div class="page-lines"></div>
            <div class="date-stamp">DATE: [REDACTED]</div>
            <div id="left-text" style="position:relative;z-index:1;"></div>
          </div>
          <div class="page right" style="position:relative;">
            <div class="page-lines"></div>
            <div class="date-stamp">★ SPECIAL ENTRY ★</div>
            <div id="right-text" style="position:relative;z-index:1;"></div>
          </div>
        </div>
      </div>
      <div class="hint" id="hint">📖 คลิกที่สมุดบันทึกเพื่อเปิด</div>
      <div class="msg-panel" id="msg">
        <div style="font-size:3rem;color:#cc8833;margin-bottom:20px;">${escapeHtml(data.receiver)}</div>
        <div style="font-size:1.2rem;color:#fff;line-height:1.8;max-width:600px;">${escapeHtml(data.message).replace(/\n/g,'<br>')}</div>
        <div style="font-size:1rem;margin-top:25px;color:#aa6622;">— ${escapeHtml(data.sender)} —</div>
      </div>
    </div>`;
    let clicked = false;
    document.getElementById('diary').addEventListener('click', () => {
        if (clicked) return; clicked = true;
        gsap.to('#hint', {opacity:0, duration:0.3});
        gsap.to('#cover', {rotationY:-180, transformOrigin:'left center', duration:1.2, ease:'power2.inOut', onComplete: showPages});
    });
    function showPages() {
        const cover = document.getElementById('cover');
        cover.style.display = 'none';
        const book = document.getElementById('book-open');
        book.style.display = 'flex';
        gsap.from(book, {opacity:0, scale:0.95, duration:0.6});
        const leftEl = document.getElementById('left-text');
        const rightEl = document.getElementById('right-text');
        const leftText = `Dear Diary,\n\nToday I write with a full heart about someone very special...`;
        const rightText = `${data.receiver},\n\n${data.message}\n\n— ${data.sender}`;
        typeIn(leftEl, leftText, () => typeIn(rightEl, rightText, () => {
            setTimeout(() => gsap.to('#msg', {opacity:1, pointerEvents:'auto', duration:1.5}), 800);
        }));
    }
    function typeIn(el, text, cb) {
        let i = 0;
        const iv = setInterval(() => {
            el.textContent = text.substring(0, i++);
            if (i > text.length) { clearInterval(iv); cb && setTimeout(cb, 300); }
        }, 30);
    }
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector(`script[src="${src}"]`))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
