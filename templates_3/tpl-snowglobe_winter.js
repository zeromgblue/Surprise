/**
 * Snow Globe Template
 * A 3D glass sphere with a snow effect and an internal scene
 */
export async function render(container, data, tpl) {
    const style = document.createElement('style');
    style.textContent = `
        .snowglobe-scene {
            width: 100%; height: 100vh;
            background: linear-gradient(to bottom, #7DD3FC, #BAE6FD);
            display: flex; align-items: center; justify-content: center;
            perspective: 1500px; overflow: hidden; font-family: 'Outfit', sans-serif;
        }

        .globe-container {
            position: relative; width: 340px; height: 340px;
            transform-style: preserve-3d; transition: all 1.5s ease;
            cursor: pointer;
        }

        .globe-sphere {
            position: absolute; width: 340px; height: 340px;
            background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4), rgba(255,255,255,0.05) 50%, rgba(0,0,0,0.1) 100%);
            border-radius: 50%; border: 2px solid rgba(255,255,255,0.2);
            box-shadow: inset 0 0 50px rgba(255,255,255,0.3), 0 30px 60px rgba(0,0,0,0.2);
            backdrop-filter: blur(2px); overflow: hidden; z-index: 5;
        }

        .internal-scene {
            position: absolute; inset: 0;
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            text-align: center; color: #1e3a8a; padding: 40px;
            z-index: 2; transform: translateZ(-20px);
        }

        .snow-particle {
            position: absolute; width: 6px; height: 6px;
            background: white; border-radius: 50%;
            pointer-events: none; opacity: 0.8;
            z-index: 4;
        }

        .globe-base {
            position: absolute; bottom: -30px; left: 50%;
            width: 240px; height: 80px; background: #e2e8f0;
            transform: translateX(-50%) rotateX(70deg);
            border-radius: 50%; border-bottom: 10px solid #cbd5e1;
            box-shadow: 0 40px 100px rgba(0,0,0,0.1);
        }

        .globe-container.shaking {
            animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }

        @keyframes shake {
            10%, 90% { transform: rotateY(10deg); }
            20%, 80% { transform: rotateY(-10deg); }
            30%, 50%, 70% { transform: rotateY(15deg) translateY(-20px); }
            40%, 60% { transform: rotateY(-15deg) translateY(20px); }
        }

        .message-snow {
            opacity: 0; transform: scale(0.5);
            transition: all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            margin-top: 15px; font-size: 1rem; line-height: 1.5; font-weight: 600;
        }

        .globe-container.reveal .message-snow {
            opacity: 1; transform: scale(1);
        }
    `;
    document.head.appendChild(style);

    const scene = document.createElement('div');
    scene.className = 'snowglobe-scene';
    scene.innerHTML = `
        <div class="globe-container" id="globe">
            <div class="globe-sphere" id="inner-globe"></div>
            <div class="internal-scene">
                <div style="font-size:0.7rem; font-weight:800; opacity:0.6; letter-spacing:2px; margin-bottom:5px;">FOR ${data.receiver.toUpperCase()}</div>
                <div style="font-size:1.8rem; font-weight:900; margin-bottom:15px; line-height:1.2;">❄️ ${tpl.nameTh}</div>
                <div class="message-snow" id="msg-body">${data.message}</div>
                <div style="font-size:0.8rem; font-weight:700; margin-top:20px; opacity:0.8;">— ${data.sender}</div>
            </div>
            <div class="globe-base"></div>
        </div>
        <div style="position:absolute; bottom:50px; color:white; font-size:0.9rem; text-transform:uppercase; letter-spacing:2px; animation:pulse 2s infinite;">คลิกเพื่อเขย่าลูกแก้ว</div>
    `;
    container.appendChild(scene);

    const globe = document.getElementById('globe');
    const inner = document.getElementById('inner-globe');
    const snowflakes = [];
    const count = 50;

    for (let i = 0; i < count; i++) {
        const snowflake = document.createElement('div');
        snowflake.className = 'snow-particle';
        snowflake.style.left = Math.random() * 100 + '%';
        snowflake.style.top = Math.random() * 100 + '%';
        snowflake.style.transform = `scale(${Math.random()})`;
        inner.appendChild(snowflake);
        snowflakes.push({
            el: snowflake,
            x: Math.random() * 340,
            y: Math.random() * 340,
            vx: (Math.random() - 0.5) * 2,
            vy: Math.random() * 1 + 0.5
        });
    }

    function moveSnow() {
        snowflakes.forEach(s => {
            s.y += s.vy;
            s.x += s.vx;
            if (s.y > 340) { s.y = -10; s.x = Math.random() * 340; }
            if (s.x > 340) s.x = 0;
            if (s.x < 0) s.x = 340;
            s.el.style.transform = `translate(${s.x}px, ${s.y}px)`;
        });
        requestAnimationFrame(moveSnow);
    }
    moveSnow();

    globe.addEventListener('click', () => {
        globe.classList.add('shaking');
        snowflakes.forEach(s => {
            s.vx = (Math.random() - 0.5) * 15;
            s.vy = (Math.random() - 0.5) * 15;
        });

        setTimeout(() => {
            globe.classList.remove('shaking');
            globe.classList.add('reveal');
            snowflakes.forEach(s => {
                s.vx = (Math.random() - 0.5) * 2;
                s.vy = Math.random() * 2 + 1;
            });
        }, 800);
    });
}
