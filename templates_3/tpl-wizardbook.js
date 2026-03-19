export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#070211"; // Deep magical purple
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Uncial+Antiqua&family=Eagle+Lake&display=swap');
            
            .magic-scene {
                position: relative; width: 100vw; height: 100vh;
                display: flex; align-items: center; justify-content: center;
                perspective: 1200px; overflow: hidden;
            }

            /* Mystic aura background */
            .aura {
                position: absolute; inset:0;
                background: radial-gradient(circle at center, rgba(100,65,165,0.3) 0%, transparent 70%);
                animation: pulseAura 4s infinite alternate; pointer-events: none;
            }
            @keyframes pulseAura { 0% {transform:scale(0.8); opacity:0.5;} 100%{transform:scale(1.2); opacity:1;} }

            /* Default closed book */
            .book-container {
                position: relative; width: 300px; height: 400px;
                transform-style: preserve-3d; transition: transform 0.5s; cursor:pointer;
                z-index: 10;
            }
            .book-container:hover { transform: rotateY(10deg) rotateX(10deg); }

            .book-cover {
                position: absolute; width: 100%; height: 100%;
                background: url('https://www.transparenttextures.com/patterns/leather.png'), linear-gradient(#2A0845, #110022);
                border: 4px solid #6441A5; border-radius: 5px 20px 20px 5px;
                box-shadow: inset 10px 0 20px rgba(0,0,0,0.8), 20px 20px 30px rgba(0,0,0,0.5);
                display:flex; align-items:center; justify-content:center; flex-direction:column;
                transform-origin: left center; z-index: 3;
            }

            .book-decor {
                width: 150px; height: 150px; border: 2px solid #D4AF37; border-radius: 50%;
                display:flex; align-items:center; justify-content:center;
                box-shadow: 0 0 15px #D4AF37;
            }
            .book-decor .material-symbols-rounded { font-size: 80px; color: #D4AF37; text-shadow: 0 0 10px #D4AF37; }

            .book-title {
                margin-top: 30px; font-family: 'Uncial Antiqua', cursive; color: #D4AF37;
                font-size: 1.5rem; text-shadow: 2px 2px 4px #000; letter-spacing: 2px;
            }

            /* Pages inside */
            .book-page {
                position: absolute; width: 100%; height: 100%;
                background: url('https://www.transparenttextures.com/patterns/old-wall.png'), #F8E8C1;
                border-radius: 5px 20px 20px 5px; box-shadow: inset -10px 0 20px rgba(0,0,0,0.2);
                transform-origin: left center; z-index: 1; padding: 40px; box-sizing: border-box;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                opacity: 0; pointer-events:none;
            }
            
            .m-head { font-family: 'Uncial Antiqua', cursive; font-size: 2rem; color: #2A0845; margin-bottom: 20px; text-shadow: 1px 1px 0px rgba(255,255,255,0.8); }
            .m-body { font-family: 'Eagle Lake', cursive; font-size: 1.2rem; color: #4A2311; line-height: 1.8; text-align:center;}

            /* Floating runes */
            .rune { position: absolute; font-family: 'Uncial Antiqua'; font-size: 1.5rem; color: #6441A5; text-shadow: 0 0 10px #B100E8; opacity:0; pointer-events:none; z-index:20; }
        </style>

        <div class="magic-scene">
            <div class="aura"></div>
            
            <div class="book-container" id="book">
                <div class="book-cover" id="cover">
                    <div class="book-decor"><span class="material-symbols-rounded">auto_fix_high</span></div>
                    <div class="book-title">Grimoire</div>
                </div>
                
                <div class="book-page" id="page">
                    <div class="m-head">${escapeHtml(data.receiver)}</div>
                    <div class="m-body">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
                    <div class="m-body" style="font-size:0.9rem; color:#885544; margin-top:30px;">~ Incantation by: ${escapeHtml(data.sender)} ~</div>
                </div>
            </div>
        </div>
    `;

    const book = document.getElementById('book');
    const cover = document.getElementById('cover');
    const page = document.getElementById('page');
    let opened = false;

    // Hover floating
    gsap.to(book, { y: -10, duration: 2, yoyo: true, repeat: -1, ease: 'sine.inOut' });

    book.addEventListener('click', () => {
        if(opened) return;
        opened = true;
        
        gsap.killTweensOf(book);
        
        const tl = gsap.timeline();

        // 1. Zoom into book
        tl.to(book, { scale: 1.2, duration: 1, ease: "power2.out" })
          
        // 2. Open cover like a 3d door
          .to(cover, { rotationY: -110, duration: 1.5, ease: "power3.inOut" }, "-=0.2")
          
        // 3. Make pages visible beneath cover
          .to(page, { opacity: 1, duration: 0.1 }, "-=1.4")
          
        // 4. Release magic runes flying out of the book
          .call(() => {
              const chars = "ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛋᛏᛒᛖᛗᛚᛜᛞᛟ";
              for(let i=0; i<30; i++) {
                  let r = document.createElement('div');
                  r.className = 'rune';
                  r.innerText = chars.charAt(Math.floor(Math.random()*chars.length));
                  document.querySelector('.magic-scene').appendChild(r);
                  
                  gsap.fromถึง(r, 
                      { x: 0, y: 0, scale: 0.5, opacity: 1 },
                      { 
                          x: (Math.random()-0.5)*800, 
                          y: (Math.random()-0.5)*800 - 200, 
                          scale: Math.random()*2+1, 
                          opacity: 0, 
                          rotation: Math.random()*360,
                          duration: Math.random()*2 + 1.5, 
                          ease: "power2.out" 
                      }
                  );
              }
          })
          
        // 5. Bright flash on the page content to reveal
          .fromถึง(page, { filter: "brightness(3)" }, { filter: "brightness(1)", duration: 1 });
    });
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
