export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#4FD1C5"; // Teal
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&display=swap');
            
            .memory-scene {
                position: relative; width: 100vw; height: 100vh;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                overflow: hidden; background: repeating-radial-gradient(circle at center, #38B2AC 0, #38B2AC 20px, #4FD1C5 20px, #4FD1C5 40px);
            }

            .cards-grid {
                display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;
                z-index: 10; perspective: 800px;
            }

            .card {
                width: 120px; height: 160px; position: relative;
                transform-style: preserve-3d; transition: transform 0.6s; cursor: pointer;
            }
            .card.flipped { transform: rotateY(180deg); }

            .card-face {
                position: absolute; width: 100%; height: 100%;
                backface-visibility: hidden; border-radius: 12px;
                display: flex; align-items: center; justify-content: center;
                box-shadow: 0 10px 20px rgba(0,0,0,0.2); border: 4px solid #FFF; box-sizing: border-box;
            }

            .card-back {
                background: linear-gradient(135deg, #F6AD55, #ED8936);
                font-family: 'Fredoka One', cursive; color: #FFF; font-size: 3rem;
            }

            .card-front {
                background: #FFF; transform: rotateY(180deg);
                font-size: 4rem;
            }

            .hint { position: absolute; top: 10vh; color: #FFF; font-family: 'Fredoka One', cursive; font-size: 2rem; text-shadow: 0 5px 0 #2C7A7B; z-index: 20; letter-spacing: 2px; }

            /* Message Area */
            .prize-msg {
                position: absolute; inset: 0; z-index: 60; padding: 40px; text-align: center;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                opacity: 0; pointer-events: none;
                background: rgba(255,255,255,0.95);
            }

            .m-head { font-family: 'Fredoka One', cursive; font-size: 3rem; color: #D53F8C; margin-bottom: 20px;}
            .m-body { font-family: 'Fredoka One', cursive; font-size: 1.5rem; color: #4A5568; line-height: 1.6; }
            
        </style>

        <div class="memory-scene">
            <div class="hint" id="hint">จับคู่ไพ่!</div>

            <div class="cards-grid" id="grid">
                <div class="card" data-val="1">
                    <div class="card-face card-back">?</div>
                    <div class="card-face card-front">💖</div>
                </div>
                <div class="card" data-val="2">
                    <div class="card-face card-back">?</div>
                    <div class="card-face card-front">🎁</div>
                </div>
                <div class="card" data-val="2">
                    <div class="card-face card-back">?</div>
                    <div class="card-face card-front">🎁</div>
                </div>
                <div class="card" data-val="1">
                    <div class="card-face card-back">?</div>
                    <div class="card-face card-front">💖</div>
                </div>
            </div>

            <div class="prize-msg" id="msg">
                <div class="m-head">${escapeHtml(data.receiver)}</div>
                <div class="m-body">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
                <div class="m-body" style="font-size:1rem; margin-top:40px; color:#A0AEC0;">ความทรงจำกับ: ${escapeHtml(data.sender)}</div>
            </div>
        </div>
    `;

    // Shuffle cards physically
    const grid = document.getElementById('grid');
    for (let i = grid.children.length; i >= 0; i--) {
        grid.appendChild(grid.children[Math.random() * i | 0]);
    }

    const cards = document.querySelectorAll('.card');
    const msg = document.getElementById('msg');
    
    let hasFlippedCard = false;
    let lockBoard = false;
    let firstCard, secondCard;
    let matches = 0;

    function flipCard() {
        if (lockBoard) return;
        if (this === firstCard) return;

        this.classList.add('flipped');

        if (!hasFlippedCard) {
            hasFlippedCard = true;
            firstCard = this;
            return;
        }

        secondCard = this;
        checkForMatch();
    }

    function checkForMatch() {
        let isMatch = firstCard.dataset.val === secondCard.dataset.val;

        if(isMatch) {
            disableCards();
            matches++;
            if(matches === 2) {
                setTimeout(winGame, 800);
            }
        } else {
            unflipCards();
        }
    }

    function disableCards() {
        firstCard.removeEventListener('click', flipCard);
        secondCard.removeEventListener('click', flipCard);
        
        // Pop effect
        gsap.to([firstCard, secondCard], { scale: 1.1, duration: 0.2, yoyo: true, repeat: 1 });

        resetBoard();
    }

    function unflipCards() {
        lockBoard = true;
        setTimeout(() => {
            firstCard.classList.remove('flipped');
            secondCard.classList.remove('flipped');
            resetBoard();
        }, 800);
    }

    function resetBoard() {
        [hasFlippedCard, lockBoard] = [false, false];
        [firstCard, secondCard] = [null, null];
    }

    cards.forEach(card => card.addEventListener('click', flipCard));

    function winGame() {
        gsap.to('.cards-grid', { scale: 0, opacity: 0, duration: 0.5, ease: "back.in(1)" });
        gsap.to(msg, { opacity: 1, pointerEvents:'auto', duration: 1, ease:"bounce.out", delay: 0.5 });
    }
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
