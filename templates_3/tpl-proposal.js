export async function render(container, data, config) {
    // 1. Reset container
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#000";
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    // 2. Load heavy libraries (GSAP & Three.js & Confetti)
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js');
    await loadScript('https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js');

    // 3. Inject HTML Structure
    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;800&family=Great+Vibes&display=swap');
            
            #canvas-container { position: fixed; inset: 0; z-index: 1; pointer-events: none; }
            
            .cinematic-ui {
                position: relative; z-index: 10; text-align: center; color: white;
                width: 100%; height: 100vh; display: flex; flex-direction: column;
                align-items: center; justify-content: center;
                font-family: 'Cinzel', serif;
            }

            /* Intro State */
            .intro-gate {
                position: absolute; inset: 0; display: flex; flex-direction: column;
                align-items: center; justify-content: center; background: #000; z-index: 20;
                transition: opacity 1s ease;
            }
            .glowing-ring {
                width: 120px; height: 120px; border-radius: 50%;
                border: 2px solid rgba(255, 215, 0, 0.3);
                display: flex; align-items: center; justify-content: center;
                box-shadow: 0 0 50px rgba(255, 215, 0, 0.2), inset 0 0 50px rgba(255, 215, 0, 0.2);
                animation: pulseRing 3s ease-in-out infinite;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            .glowing-ring:hover { transform: scale(1.1); box-shadow: 0 0 80px rgba(255, 215, 0, 0.5), inset 0 0 80px rgba(255, 215, 0, 0.5); }
            @keyframes pulseRing {
                0%, 100% { transform: scale(1); border-color: rgba(255,215,0,0.3); }
                50% { transform: scale(1.05); border-color: rgba(255,215,0,0.8); }
            }
            .gate-text { margin-top: 30px; font-size: 1.2rem; letter-spacing: 4px; color: rgba(255,255,255,0.6); text-transform: uppercase; animation: fadeText 2s infinite; }
            @keyframes fadeText { 0%,100%{opacity:0.4;} 50%{opacity:1;} }

            /* Main Content State */
            .main-content { opacity: 0; pointer-events: none; display: flex; flex-direction: column; align-items: center; }
            
            .to-text { font-family: 'Cinzel', serif; font-size: 1.5rem; letter-spacing: 5px; color: #D4AF37; margin-bottom: 40px; text-transform: uppercase; }
            
            .message-text {
                font-family: 'Great Vibes', cursive; font-size: 3.5rem; line-height: 1.4;
                max-width: 800px; margin-bottom: 50px; text-shadow: 0 0 20px rgba(255, 51, 102, 0.5);
                background: linear-gradient(to right, #ffffff, #ffd700);
                -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
                padding: 0 20px;
            }

            .from-text { font-family: 'Cinzel', serif; font-size: 1.2rem; letter-spacing: 3px; color: rgba(255,255,255,0.5); margin-bottom: 60px; }

            .action-btn {
                background: transparent; border: 1px solid #D4AF37; color: #D4AF37;
                padding: 15px 50px; font-family: 'Cinzel', serif; font-size: 1.2rem; letter-spacing: 3px;
                border-radius: 50px; cursor: pointer; text-transform: uppercase;
                transition: all 0.4s ease; position: relative; overflow: hidden;
            }
            .action-btn::before {
                content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%;
                background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.4), transparent);
                transition: left 0.5s ease;
            }
            .action-btn:hover { background: rgba(212, 175, 55, 0.1); box-shadow: 0 0 30px rgba(212, 175, 55, 0.4); text-shadow: 0 0 10px #D4AF37; }
            .action-btn:hover::before { left: 100%; }
            .action-btn.clicked { background: #D4AF37; color: #000; box-shadow: 0 0 50px #D4AF37; }

            .flash-overlay { position: fixed; inset: 0; background: white; z-index: 100; opacity: 0; pointer-events: none; }
        </style>

        <div id="canvas-container"></div>
        <div class="flash-overlay" id="flash"></div>

        <div class="cinematic-ui">
            <div class="intro-gate" id="gate">
                <div class="glowing-ring" id="start-btn">
                    <span class="material-symbols-rounded" style="color:#D4AF37; font-size:3rem;">diamond</span>
                </div>
                <div class="gate-text">ถึงuch to Open</div>
            </div>

            <div class="main-content" id="content">
                <div class="to-text" id="el-to">Dear ${escapeHtml(data.receiver)}</div>
                <div class="message-text" id="el-msg">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
                <div class="from-text" id="el-from">Yours forever, ${escapeHtml(data.sender)}</div>
                
                <button class="action-btn" id="btn-yes">YES, I WILL</button>
            </div>
        </div>
    `;

    // 4. Setup Three.js Warp Speed Universe
    const canvasContainer = document.getElementById('canvas-container');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = 1;
    camera.rotation.x = Math.PI / 2;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    canvasContainer.appendChild(renderer.domElement);

    const starGeo = new THREE.BufferGeometry();
    const starCount = 6000;
    const posArray = new Float32Array(starCount * 3);
    for(let i=0; i < starCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 600;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    // Custom shader material for glowing stars
    const starMat = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.7,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });

    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // Nebula / Clouds
    const cloudGeo = new THREE.PlaneGeometry(500, 500);
    const cloudLoader = new THREE.TextureLoader();
    const clouds = [];
    cloudLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/sprites/smoke.png', function(texture) {
        const cloudMat = new THREE.MeshLambertMaterial({
            color: 0xcc33ff, map: texture, transparent: true, opacity: 0.05, blending: THREE.AdditiveBlending
        });
        for(let p=0; p<30; p++) {
            const staticCloud = new THREE.Mesh(cloudGeo, cloudMat);
            staticCloud.position.set( Math.random()*800 - 400, 500, Math.random()*500 - 450 );
            staticCloud.rotation.z = Math.random()*360;
            staticCloud.material.opacity = 0.05;
            scene.add(staticCloud);
            clouds.push(staticCloud);
        }
    });

    const ambient = new THREE.AmbientLight(0x555555);
    scene.add(ambient);
    const directionalLight = new THREE.DirectionalLight(0xffeedd);
    directionalLight.position.set(0,0,1);
    scene.add(directionalLight);

    let warpSpeed = 0;
    let isWarping = false;
    let animationFrameId;

    function animateStars() {
        const positions = starGeo.attributes.position.array;
        for(let i=1; i<starCount*3; i+=3) {
            positions[i] -= (0.2 + warpSpeed);
            if(positions[i] < -300) { positions[i] = 300; }
        }
        starGeo.attributes.position.needsUpdate = true;
        stars.rotation.y += 0.001;

        clouds.forEach(c => { c.rotation.z -= 0.001; });

        renderer.render(scene, camera);
        animationFrameId = requestAnimationFrame(animateStars);
    }
    animateStars();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // 5. Interaction & GSAP Timelines
    const startBtn = document.getElementById('start-btn');
    startBtn.addEventListener('click', () => {
        // Flash Screen
        gsap.to('#flash', { opacity: 1, duration: 0.1, yoyo: true, repeat: 1 });
        
        // Hide Gate
        document.getElementById('gate').style.opacity = '0';
        setTimeout(() => document.getElementById('gate').style.display = 'none', 1000);

        // Engage Warp Drive
        isWarping = true;
        gsap.to(starMat, { size: 4, duration: 2, ease: "power2.in" });
        gsap.to(() => warpSpeed, {
            duration: 2,
            ease: "power2.inOut",
            onUpdate: function() { warpSpeed = this.targets()[0]; },
            onComplete: () => {
                // Drop out of warp into romantic slow motion
                gsap.to(() => warpSpeed, {
                    duration: 3, ease: "power3.out",
                    onUpdate: function() { warpSpeed = this.targets()[0]; },
                    onComplete: () => { warpSpeed = 0.1; }
                });
                gsap.to(starMat, { size: 1.2, duration: 3, ease: "power3.out" });

                // Change star and cloud colors to gold/pink
                gsap.to(starMat.color, { r: 1, g: 0.85, b: 0.5, duration: 2 });
                stars.material.opacity = 0.6;
                clouds.forEach(c => { gsap.to(c.material.color, { r: 1, g: 0.2, b: 0.5, duration: 3 }); c.material.opacity = 0.1; });

                // Reveal Content Cinematic Sequence
                document.getElementById('content').style.pointerEvents = 'auto';
                
                const tl = gsap.timeline();
                tl.to('#content', { opacity: 1, duration: 1 })
                  .fromถึง('#el-to', { y: 50, opacity: 0, scale: 0.9 }, { y: 0, opacity: 1, scale: 1, duration: 1.5, ease: 'power3.out' })
                  .fromถึง('#el-msg', { y: 50, opacity: 0, scale: 0.95 }, { y: 0, opacity: 1, scale: 1, duration: 2, ease: 'power2.out' }, '-=0.5')
                  .fromถึง('#el-from', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1.5, ease: 'power3.out' }, '-=1')
                  .fromถึง('#btn-yes', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'back.out(1.5)' }, '-=0.5');
            }
        });
        warpSpeed = 15; // Set targets[0] initial value workaround
        const obj = { val: 0 };
        gsap.to(obj, {
            val: 20, duration: 2.5, ease: "power2.in",
            onUpdate: () => { warpSpeed = obj.val; }
        });
    });

    // 6. Action Button Response
    document.getElementById('btn-yes').addEventListener('click', function() {
        if(this.classList.contains('clicked')) return;
        this.classList.add('clicked');
        this.innerHTML = "I LOVE YOU";
        
        // Massive Celebration
        fireworks();
        
        // Camera flies forward
        gsap.to(camera.position, { z: -500, duration: 5, ease: "power2.in" });
        gsap.to('#content', { scale: 1.1, opacity: 0.9, duration: 2, ease: "power2.out" });
    });
}

function fireworks() {
    var duration = 5 * 1000;
    var animationEnd = Date.now() + duration;
    var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

    function randomInRange(min, max) { return Math.random() * (max - min) + min; }

    var interval = setInterval(function() {
        var timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) { return clearInterval(interval); }
        var particleCount = 50 * (timeLeft / duration);
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }, colors: ['#D4AF37','#FF3366','#FFFFFF'] }));
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }, colors: ['#D4AF37','#FF3366','#FFFFFF'] }));
    }, 250);
}

function escapeHtml(str) {
    if(!str) return '';
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}

function loadScript(src) {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) return resolve();
        const s = document.createElement('script');
        s.src = src;
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
    });
}
