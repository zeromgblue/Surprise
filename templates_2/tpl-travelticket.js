import { loadScript, esc, prepContainer, messageCardHtml } from '../template-helpers.js';

export async function render(container, data, config) {
    prepContainer(container, config.bg || '#140D0B');
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    const from = config.from || '#F4A261';

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500&display=swap');
            .ticket-scene { position:relative;width:100vw;height:100vh;display:flex;align-items:center;justify-content:center; }
            .ticket {
                width:320px;background:#fff;border-radius:12px;cursor:pointer;overflow:hidden;
                box-shadow:0 20px 50px rgba(0,0,0,0.5);font-family:'JetBrains Mono',monospace;
                position:relative;
            }
            .ticket-head { background:linear-gradient(135deg,${from},${config.to||'#E76F51'});padding:20px;color:#fff; }
            .ticket-body { padding:20px;color:#333;font-size:0.85rem;line-height:1.8; }
            .barcode { height:40px;background:repeating-linear-gradient(90deg,#000 0,#000 2px,transparent 2px,transparent 6px);margin-top:12px;opacity:0.7; }
            .scan-line { position:absolute;left:0;right:0;height:3px;background:#0f0;box-shadow:0 0 10px #0f0;opacity:0;top:0; }
            .hint { position:absolute;bottom:12vh;color:rgba(255,255,255,0.5);font-size:0.9rem; }
        </style>
        <div class="ticket-scene">
            <div class="ticket" id="ticket">
                <div class="scan-line" id="scan"></div>
                <div class="ticket-head">
                    <div style="font-size:0.7rem;opacity:0.8;">BOARDING PASS</div>
                    <div style="font-size:1.4rem;font-weight:700;margin-top:4px;">✈️ SURPRISE AIR</div>
                </div>
                <div class="ticket-body">
                    <div>PASSENGER: ${esc(data.receiver)}</div>
                    <div>FROM: ${esc(data.sender)}</div>
                    <div>STATUS: <span id="status">SCAN TO BOARD</span></div>
                    <div class="barcode"></div>
                </div>
            </div>
            <div class="hint">แตะตั๋วเพื่อสแกน</div>
        </div>
        <div id="card-slot" style="position:fixed;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;z-index:10;"></div>
    `;

    document.getElementById('ticket').addEventListener('click', () => {
        gsap.to('#scan', { opacity: 1, top: '100%', duration: 1.2, ease: 'none' });
        document.getElementById('status').textContent = 'APPROVED ✓';
        setTimeout(() => {
            gsap.to('#ticket', { scale: 0, opacity: 0, duration: 0.5 });
            const slot = document.getElementById('card-slot');
            slot.style.pointerEvents = 'auto';
            slot.innerHTML = messageCardHtml(data, config, { title: '✈️ Bon Voyage' });
            gsap.fromTo(slot.querySelector('.msg-card'), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7 });
        }, 1300);
    });
}
