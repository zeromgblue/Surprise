export async function render(container, data, config) {
    container.style.cssText = "max-width:100%;padding:0;height:100vh;background:#000508;";
    document.body.style.cssText = "margin:0;overflow:hidden;";
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');
    container.innerHTML = `<style>@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;700&display=swap');
    .scene{width:100%;height:100%;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;}
    .mirror-frame{width:min(420px,88vw);height:min(580px,80vh);border:18px solid #2a2020;border-radius:50%/30%;position:relative;overflow:hidden;box-shadow:0 0 60px rgba(0,180,220,0.15),0 0 120px rgba(0,80,100,0.1),inset 0 0 40px rgba(0,0,0,0.9);}
    .mirror-surface{width:100%;height:100%;background:linear-gradient(135deg,rgba(0,20,30,0.97),rgba(0,10,20,0.99));position:relative;overflow:hidden;}
    .fog{position:absolute;inset:0;background:radial-gradient(ellipse 80% 60% at 50% 40%,rgba(200,220,230,0.08),transparent);animation:fogdrift 8s ease-in-out infinite;}
    @keyframes fogdrift{0%,100%{transform:scale(1) translateX(0);}50%{transform:scale(1.05) translateX(-3%);}}
    .fog2{position:absolute;inset:0;background:radial-gradient(ellipse 60% 40% at 60% 60%,rgba(180,200,210,0.06),transparent);animation:fogdrift 11s ease-in-out infinite reverse;}
    .condensation{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;}
    svg.writing{overflow:visible;}
    .breath-glow{position:absolute;inset:0;border-radius:50%/30%;box-shadow:inset 0 0 30px rgba(100,200,255,0.1);animation:breathe 3s ease-in-out infinite;opacity:0;}
    @keyframes breathe{0%,100%{box-shadow:inset 0 0 20px rgba(100,200,255,0.08);}50%{box-shadow:inset 0 0 50px rgba(100,200,255,0.2);}}
    .hint{position:absolute;bottom:20px;left:50%;transform:translateX(-50%);color:#88ccdd;font-size:0.85rem;font-family:'Sarabun',sans-serif;background:rgba(0,0,0,0.6);padding:6px 16px;border-radius:20px;}
    .msg-panel{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;z-index:30;padding:40px;text-align:center;}
    </style>
    <div class="scene" id="scene">
      <div class="mirror-frame">
        <div class="mirror-surface">
          <div class="fog"></div>
          <div class="fog2"></div>
          <div class="condensation" id="condensation">
            <svg id="writingsvg" width="320" height="340" viewBox="0 0 320 340" class="writing">
              <defs>
                <filter id="fog-filter"><feGaussianBlur stdDeviation="1.5"/></filter>
              </defs>
            </svg>
          </div>
          <div class="breath-glow" id="breathglow"></div>
        </div>
      </div>
      <div class="hint" id="hint">🪞 กระจกเต็มไปด้วยไอหมอก... รอดูสิ่งที่ถูกเขียน</div>
      <div class="msg-panel" id="msg">
        <div style="font-size:3rem;color:#88ddff;margin-bottom:20px;">${escapeHtml(data.receiver)}</div>
        <div style="font-size:1.2rem;color:#fff;line-height:1.8;max-width:600px;">${escapeHtml(data.message).replace(/\n/g,'<br>')}</div>
        <div style="font-size:1rem;margin-top:25px;color:#66bbcc;">— ${escapeHtml(data.sender)} —</div>
      </div>
    </div>`;
    const svg = document.getElementById('writingsvg');
    const name = data.receiver || '?';
    const lines = [name, '...', data.message || ''];
    let charIndex = 0;
    const allChars = lines.join('\n');
    let x = 20, y = 80, lineChars = 0;
    const maxPerLine = 18;
    function drawNextChar() {
        if (charIndex >= allChars.length) {
            gsap.to('#breathglow', {opacity:1, duration:1.5});
            setTimeout(() => gsap.to('#msg', {opacity:1, pointerEvents:'auto', duration:1.5}), 2000);
            return;
        }
        const ch = allChars[charIndex++];
        if (ch === '\n' || lineChars >= maxPerLine) { y += 44; x = 20; lineChars = 0; if(ch==='\n'){drawNextChar();return;} }
        const t = document.createElementNS('http://www.w3.org/2000/svg','text');
        t.setAttribute('x', x);
        t.setAttribute('y', y);
        t.setAttribute('fill', 'rgba(160,220,255,0.0)');
        t.setAttribute('font-size', '26');
        t.setAttribute('font-family', 'Sarabun, cursive');
        t.setAttribute('filter', 'url(#fog-filter)');
        t.textContent = ch;
        svg.appendChild(t);
        gsap.to(t, {attr:{fill:'rgba(160,220,255,0.75)'}, duration:0.5});
        x += 18; lineChars++;
        setTimeout(drawNextChar, 90);
    }
    setTimeout(() => { gsap.to('#hint',{opacity:0,duration:0.5}); drawNextChar(); }, 1000);
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector(`script[src="${src}"]`))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
