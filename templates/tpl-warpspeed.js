/**
 * Warp Speed Template
 * A futuristic 3D starfield effect with zooming text
 */
export async function render(container, data, tpl) {
    const style = document.createElement('style');
    style.textContent = `
        .warpspeed-container {
            position: relative;
            width: 100%;
            height: 100vh;
            background: #000;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Outfit', sans-serif;
            color: white;
        }

        #starfield {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
        }

        .warp-content {
            position: relative;
            z-index: 2;
            text-align: center;
            perspective: 1000px;
            animation: zoomIn 2s cubic-bezier(0.19, 1, 0.22, 1) forwards;
        }

        @keyframes zoomIn {
            0% { transform: translateZ(-1000px); opacity: 0; }
            100% { transform: translateZ(0); opacity: 1; }
        }

        .warp-title {
            font-size: 3.5rem;
            font-weight: 900;
            margin-bottom: 30px;
            text-shadow: 0 0 20px ${tpl.from}, 0 0 40px ${tpl.to};
            background: linear-gradient(to bottom, #fff, ${tpl.from});
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            transform: rotateX(10deg);
        }

        .warp-message {
            font-size: 1.2rem;
            line-height: 1.8;
            max-width: 500px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            padding: 25px;
            border-radius: 20px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 20px 50px rgba(0,0,0,0.5);
            transform: rotateX(-5deg);
        }

        .warp-sender {
            margin-top: 30px;
            font-weight: 700;
            font-size: 1rem;
            color: ${tpl.from};
            text-transform: uppercase;
            letter-spacing: 2px;
        }

        .btn-interact {
            margin-top: 40px;
            background: white;
            color: black;
            padding: 12px 30px;
            border-radius: 30px;
            font-weight: 800;
            border: none;
            cursor: pointer;
            box-shadow: 0 10px 30px rgba(255, 255, 255, 0.3);
            transition: all 0.3s ease;
        }

        .btn-interact:hover {
            transform: scale(1.1);
            box-shadow: 0 15px 40px rgba(255, 255, 255, 0.5);
        }
    `;
    document.head.appendChild(style);

    const canvas = document.createElement('canvas');
    canvas.id = 'starfield';
    container.appendChild(canvas);

    const content = document.createElement('div');
    content.className = 'warpspeed-container';
    content.innerHTML = `
        <div class="warp-content">
            <div style="font-size:0.8rem; opacity:0.6; margin-bottom:10px; letter-spacing:3px;">FOR ${data.receiver.toUpperCase()}</div>
            <div class="warp-title">${tpl.nameTh}</div>
            <div class="warp-message">${data.message}</div>
            <div class="warp-sender">— จาก ${data.sender} —</div>
        </div>
    `;
    container.appendChild(content);

    // Starfield Logic
    const ctx = canvas.getContext('2d');
    let w, h;
    const stars = [];
    const count = 400;

    function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < count; i++) {
        stars.push({
            x: Math.random() * w - w/2,
            y: Math.random() * h - h/2,
            z: Math.random() * w,
            o: '0.' + Math.floor(Math.random() * 99) + 1
        });
    }

    function animate() {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, w, h);
        
        ctx.translate(w/2, h/2);
        
        for (let i = 0; i < count; i++) {
            const s = stars[i];
            const x = s.x / (s.z / w);
            const y = s.y / (s.z / w);
            const size = (1 - s.z / w) * 3;
            
            ctx.beginPath();
            ctx.fillStyle = `white`;
            ctx.globalAlpha = s.o;
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
            
            s.z -= 5;
            if (s.z <= 0) s.z = w;
        }
        
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        requestAnimationFrame(animate);
    }
    animate();
}
