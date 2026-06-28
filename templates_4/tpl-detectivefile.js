export async function render(container, data, config) {
    container.style.cssText = "max-width:100%;padding:0;height:100vh;background:#0A0800;";
    document.body.style.cssText = "margin:0;overflow:hidden;";
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');
    container.innerHTML = `<style>@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;700&display=swap');
    .cork{width:100%;height:100%;background:repeating-linear-gradient(45deg,#3d2b0a,#3d2b0a 2px,#4a3412 2px,#4a3412 12px);position:relative;overflow:hidden;}
    .photo{position:absolute;background:#e8e0cc;border:8px solid #fff;box-shadow:4px 4px 12px rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;font-size:2rem;}
    .sticky{position:absolute;padding:10px;font-size:0.75rem;font-family:cursive;line-height:1.5;box-shadow:2px 2px 8px rgba(0,0,0,0.4);}
    .pin{position:absolute;width:14px;height:14px;border-radius:50%;background:radial-gradient(circle,#ff5555,#990000);box-shadow:0 2px 8px rgba(200,0,0,0.6);z-index:5;}
    .envelope{position:absolute;bottom:24px;right:24px;width:84px;height:58px;background:linear-gradient(135deg,#cc2200,#991100);cursor:pointer;display:flex;align-items:center;justify-content:center;border-radius:6px;box-shadow:0 4px 20px rgba(200,0,0,0.6);font-size:2.2rem;transition:transform 0.2s;}
    .envelope:hover{transform:scale(1.08);}
    .hint{position:absolute;top:12px;left:50%;transform:translateX(-50%);color:#cc9933;font-size:0.85rem;font-family:'Sarabun',sans-serif;background:rgba(0,0,0,0.6);padding:6px 16px;border-radius:20px;white-space:nowrap;}
    .paper{position:absolute;bottom:90px;right:24px;width:290px;background:#f5f0e0;padding:22px;border-radius:4px;font-family:cursive;font-size:0.85rem;line-height:1.7;color:#1a0800;box-shadow:0 10px 40px rgba(0,0,0,0.9);transform-origin:bottom center;transform:scaleY(0);display:none;}
    .fp-bg{position:absolute;inset:0;background:radial-gradient(ellipse 70% 90% at 80% 20%,rgba(80,40,0,0.2),transparent);pointer-events:none;}
    .msg-panel{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;z-index:30;padding:40px;text-align:center;background:rgba(10,8,0,0.92);}
    </style>
    <div class="cork" id="cork">
      <div class="photo" style="width:130px;height:95px;top:14%;left:12%;transform:rotate(-6deg);">🔍</div>
      <div class="photo" style="width:105px;height:80px;top:28%;left:42%;transform:rotate(4deg);">📋</div>
      <div class="photo" style="width:90px;height:110px;top:10%;left:62%;transform:rotate(-2deg);">🖊️</div>
      <div class="sticky" style="width:140px;top:52%;left:16%;background:#ffe566;transform:rotate(-4deg);">CASE FILE #7734<br>⚠️ CLASSIFIED</div>
      <div class="sticky" style="width:115px;top:18%;left:58%;background:#ffe566;transform:rotate(6deg);">SUSPECT:<br>Unknown</div>
      <div class="sticky" style="width:120px;top:60%;left:55%;background:#ffccaa;transform:rotate(-2deg);">Evidence A-7<br>Cross-reference</div>
      <div class="pin" style="top:13%;left:11%;"></div>
      <div class="pin" style="top:27%;left:41%;"></div>
      <div class="pin" style="top:9%;left:61%;"></div>
      <div class="pin" style="top:51%;left:15%;"></div>
      <svg style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none;opacity:0.5;" id="strings">
        <line x1="12%" y1="13%" x2="42%" y2="28%" stroke="#cc3333" stroke-width="1.5"/>
        <line x1="42%" y1="28%" x2="62%" y2="10%" stroke="#cc3333" stroke-width="1.5"/>
        <line x1="16%" y1="52%" x2="42%" y2="28%" stroke="#cc3333" stroke-width="1.5"/>
      </svg>
      <div class="envelope" id="env">✉️</div>
      <div class="hint" id="hint">🔎 คลิกที่ซองสีแดงมุมขวาล่าง</div>
      <div class="paper" id="paper">
        <div class="fp-bg"></div>
        <div style="text-align:center;font-size:1rem;font-weight:bold;margin-bottom:12px;color:#8B0000;letter-spacing:2px;">— CONFIDENTIAL —</div>
        <div id="typed" style="min-height:90px;white-space:pre-line;"></div>
      </div>
      <div class="msg-panel" id="msg">
        <div style="font-size:3rem;color:#cc9933;margin-bottom:20px;">${escapeHtml(data.receiver)}</div>
        <div style="font-size:1.2rem;color:#fff;line-height:1.8;max-width:600px;">${escapeHtml(data.message).replace(/\n/g,'<br>')}</div>
        <div style="font-size:1rem;margin-top:25px;color:#cc6600;">— ${escapeHtml(data.sender)} —</div>
      </div>
    </div>`;
    let clicked = false;
    document.getElementById('env').addEventListener('click', () => {
        if (clicked) return; clicked = true;
        gsap.to('#hint', {opacity:0, duration:0.4});
        gsap.to('#env', {rotation:15, scale:1.3, duration:0.3, yoyo:true, repeat:1});
        const paper = document.getElementById('paper');
        paper.style.display = 'block';
        gsap.to(paper, {scaleY:1, duration:0.6, ease:'back.out(1.7)', delay:0.4, onComplete: typeMessage});
    });
    function typeMessage() {
        const el = document.getElementById('typed');
        const fullText = `To: ${data.receiver}\n\n${data.message}\n\n— ${data.sender}`;
        let i = 0;
        const interval = setInterval(() => {
            el.textContent = fullText.substring(0, i++);
            if (i > fullText.length) {
                clearInterval(interval);
                setTimeout(() => gsap.to('#msg', {opacity:1, pointerEvents:'auto', duration:1.5}), 1200);
            }
        }, 32);
    }
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector(`script[src="${src}"]`))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
