export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#000"; 
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    // Load Three.js & GSAP
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js');
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Montserrat:wght@300;600&display=swap');
            
            #canvas-container { position: absolute; inset: 0; z-index: 1; }
            
            .overlay-ui { position: absolute; inset: 0; z-index: 10; display: flex; flex-direction: column; align-items: center; justify-content: center; pointer-events: none;}
            
            .warp-btn {
                padding: 15px 40px; background: transparent; border: 2px solid #00E8FC; color: #00E8FC;
                font-family: 'Montserrat', sans-serif; font-weight: 600; font-size: 1.2rem;
                letter-spacing: 5px; cursor: pointer; border-radius: 50px;
                box-shadow: 0 0 20px rgba(0,232,252,0.3), inset 0 0 20px rgba(0,232,252,0.3);
                transition: all 0.3s; pointer-events: auto; text-transform: uppercase;
            }
            .warp-btn:hover { background: rgba(0, 232, 252, 0.2); box-shadow: 0 0 40px rgba(0,232,252,0.6), inset 0 0 40px rgba(0,232,252,0.6); }

            .msg-panel {
                position: absolute; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(10px);
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                opacity: 0; z-index: 20; text-align: center; pointer-events: none;
            }

            .title-ring {
                width: 150px; height: 150px; border-radius: 50%;
                border: 2px solid #D4AF37; display: flex; align-items: center; justify-content: center;
                box-shadow: 0 0 50px rgba(212, 175, 55, 0.5), inset 0 0 30px rgba(212, 175, 55, 0.5);
                margin-bottom: 30px;
                animation: pulseRing 2s infinite alternate;
            }
            @keyframes pulseRing { 0% { box-shadow: 0 0 20px rgba(212, 175, 55, 0.2); } 100% { box-shadow: 0 0 60px rgba(212, 175, 55, 0.8), inset 0 0 40px rgba(212, 175, 55, 0.8); } }

            .t-head { font-family: 'Cinzel', serif; font-size: 3.5rem; color: #D4AF37; text-shadow: 0 5px 15px rgba(0,0,0,0.8); margin-bottom: 15px;}
            .t-body { font-family: 'Montserrat', sans-serif; font-size: 1.2rem; color: #fff; line-height: 1.8; max-width:80%; opacity: 0; transform: translateY(30px);}
            .t-sender { font-family: 'Montserrat', sans-serif; font-weight: 300; font-size: 1rem; color: #aaa; margin-top: 30px; opacity: 0; }
        </style>

        <div id="canvas-container"></div>
        
        <div class="overlay-ui" id="ui">
            <button class="warp-btn" id="warpBtn">INITIATE WARP</button>
        </div>

        <div class="msg-panel" id="msgPanel">
            <!-- Emulate a ring 3D or flat via CSS -->
            <div class="title-ring" id="ring">
                <span style="font-size: 4rem;">💍</span>
            </div>
            <div class="t-head" id="t-head">${escapeHtml(data.receiver)}</div>
            <div class="t-body" id="t-body">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
            <div class="t-sender" id="t-sender">— ${escapeHtml(data.sender)}</div>
        </div>
    `;

    // ===== THREE.JS WARP EFFECT =====
    const canvasContainer = document.getElementById('canvas-container');
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.001);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = 1;
    camera.rotation.x = Math.PI / 2;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    canvasContainer.appendChild(renderer.domElement);

    // Stars
    const starGeo = new THREE.Geometry();
    for (let i = 0; i < 6000; i++) {
        let star = new THREE.Vector3(
            Math.random() * 600 - 300,
            Math.random() * 600 - 300,
            Math.random() * 600 - 300
        );
        star.velocity = 0;
        star.acceleration = 0.02;
        starGeo.vertices.push(star);
    }
    
    // Create a circular texture for stars
    const canvas = document.createElement('canvas');
    canvas.width = 16; canvas.height = 16;
    const context = canvas.getContext('2d');
    const gradient = context.createRadialGradient(8, 8, 0, 8, 8, 8);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 16, 16);
    const sprite = new THREE.Texture(canvas);
    sprite.needsUpdate = true;

    let starMaterial = new THREE.PointsMaterial({
        color: 0xaaaaaa,
        size: 0.7,
        map: sprite,
        transparent: true,
        blending: THREE.AdditiveBlending
    });

    const stars = new THREE.Points(starGeo, starMaterial);
    scene.add(stars);

    let warping = false;

    function animate() {
        requestAnimationFrame(animate);
        
        starGeo.vertices.forEach(p => {
            p.velocity += p.acceleration;
            p.y -= p.velocity;
            
            if (p.y < -200) {
                p.y = 200;
                p.velocity = 0;
            }
        });
        starGeo.verticesNeedUpdate = true;
        
        // Gentle rotation before warp
        if(!warping) {
            stars.rotation.y += 0.002;
        }

        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // ===== GSAP INTERACTIONS =====
    const warpBtn = document.getElementById('warpBtn');
    const ui = document.getElementById('ui');
    const msgPanel = document.getElementById('msgPanel');

    warpBtn.addEventListener('click', () => {
        warping = true;
        warpBtn.style.pointerEvents = 'none';

        // Fade out button
        gsap.to(warpBtn, { opacity: 0, scale: 0.5, duration: 0.5 });
        
        // Accelerate stars
        gsap.to(starGeo.vertices, {
            acceleration: "+=0.5", // massive accel
            duration: 3, ease: "power2.in"
        });

        // Stretch stars into lines (by changing camera rotation trick or geometry scale)
        gsap.to(camera.position, { z: -100, duration: 3, Math: "power2.in" });

        setTimeout(() => {
            // Flash bang
            const flash = document.createElement('div');
            flash.style.position = 'absolute'; flash.style.inset = 0; flash.style.background = '#fff'; flash.style.zIndex = 15; flash.style.opacity = 0;
            container.appendChild(flash);

            gsap.to(flash, { opacity: 1, duration: 0.2, onComplete: () => {
                // Background turns to deep romantic galaxy
                renderer.domElement.style.opacity = 0.5; // dim the stars
                msgPanel.style.opacity = 1;
                
                // Animate text in
                const tl = gsap.timeline();
                tl.fromถึง('#t-head', { scale: 3, opacity: 0 }, { scale: 1, opacity: 1, duration: 1, ease: "power3.out" })
                  .to('#t-body', { opacity: 1, y: 0, duration: 1, ease: "power2.out" }, "-=0.5")
                  .to('#t-sender', { opacity: 1, duration: 1 }, "-=0.5");

                // Fade out flash
                gsap.to(flash, { opacity: 0, duration: 2, onComplete: ()=>flash.remove() });
                
                // Slow down stars to serene drift
                starGeo.vertices.forEach(p => { p.acceleration = 0.005; p.velocity = Math.random()*0.5; });
                camera.position.z = 1; // reset camera
            }})
        }, 3000);
    });
}

function escapeHtml(str) {
    if(!str) return '';
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}

function loadScript(src) {
    return new Promise((resolve, reject) => {
        // If Three.js and we don't have it natively, let it load
        if (src.includes('three.min.js') && window.THREE) return resolve();
        if (src.includes('gsap.min.js') && window.gsap) return resolve();
        
        if (document.querySelector(`script[src="${src}"]`)) {
            // Script tag exists, might be loading. wait briefly or just assume it resolves if window.var is there
            setTimeout(resolve, 500); 
            return;
        }
        const s = document.createElement('script');
        s.src = src;
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
    });
}
