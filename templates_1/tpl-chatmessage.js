export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "flex-end"; // align to bottom for keyboard
    container.style.justifyContent = "center";
    container.style.background = "#F0F2F5"; // Messenger bg color
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    const bubbleColor = config.from || '#0084FF'; // Messenger Blue

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500&display=swap');
            
            .chat-container {
                width: 100%; max-width: 500px; height: 100vh;
                display: flex; flex-direction: column; background: #fff;
                box-shadow: 0 0 20px rgba(0,0,0,0.1); position: relative;
            }

            .chat-header {
                height: 60px; background: #fff; border-bottom: 1px solid #ddd;
                display: flex; align-items: center; padding: 0 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                z-index: 10;
            }
            .avatar { width: 40px; height: 40px; border-radius: 50%; background: #ddd; display:flex; align-items:center; justify-content:center; font-size: 1.2rem; margin-right: 15px; overflow: hidden;}
            .user-info { display: flex; flex-direction: column; }
            .user-name { font-family: 'Sarabun', sans-serif; font-size: 1rem; font-weight: 500; color: #111; }
            .user-status { font-family: 'Sarabun', sans-serif; font-size: 0.75rem; color: #888; }
            .status-dot { display:inline-block; width:8px; height:8px; background:#31A24C; border-radius:50%; margin-right:5px;}

            .chat-body {
                flex-grow: 1; padding: 20px; overflow-y: auto;
                display: flex; flex-direction: column; justify-content: flex-end;
            }

            .bubble {
                max-width: 75%; padding: 12px 16px; border-radius: 20px;
                font-family: 'Sarabun', sans-serif; font-size: 1rem; line-height: 1.4;
                margin-bottom: 15px; opacity: 0; transform: translateY(20px);
                position: relative; word-wrap: break-word;
            }
            .bubble.receiver {
                align-self: flex-start; background: #E4E6EB; color: #000;
                border-bottom-left-radius: 5px;
            }
            .bubble.sender {
                align-self: flex-end; background: ${bubbleColor}; color: #fff;
                border-bottom-right-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }

            .typing-indicator {
                display: none; align-self: flex-start;
                background: #E4E6EB; padding: 12px 18px; border-radius: 20px; border-bottom-left-radius: 5px;
                margin-bottom: 15px; align-items: center; gap: 4px;
            }
            .dot { width: 6px; height: 6px; background: #888; border-radius: 50%; animation: type 1.4s infinite ease-in-out both; }
            .dot:nth-child(1) { animation-delay: -0.32s; }
            .dot:nth-child(2) { animation-delay: -0.16s; }
            @keyframes type { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }

            .chat-input-area {
                padding: 15px; border-top: 1px solid #ddd; background: #fff;
                display: flex; align-items: center; gap: 10px;
            }
            .fake-input { 
                flex-grow: 1; background: #F0F2F5; border-radius: 20px; padding: 10px 15px;
                color: #888; font-family: 'Sarabun', sans-serif; font-size: 0.95rem;
                display:flex; align-items:center; cursor: pointer;
            }
            .send-btn { color: ${bubbleColor}; font-weight: bold; font-family: sans-serif; font-size: 1.2rem; display:none; }

            /* Interactive overlay to start */
            .start-overlay { position: absolute; inset:0; z-index: 50; display:flex; align-items:center; justify-content:center; background: rgba(255,255,255,0.8); cursor: pointer; }
            .start-btn { background: ${bubbleColor}; color: white; border:none; padding: 12px 25px; border-radius: 20px; font-family: sans-serif; font-weight: bold; box-shadow: 0 4px 10px rgba(0,0,0,0.2); pointer-events:none;}
        </style>

        <div class="chat-container">
            <div class="start-overlay" id="overlay">
                <div class="start-btn">แตะเพื่อเปิด CHAT</div>
            </div>

            <div class="chat-header">
                <div class="avatar">👤</div>
                <div class="user-info">
                    <div class="user-name">${escapeHtml(data.sender)}</div>
                    <div class="user-status"><span class="status-dot"></span>Active now</div>
                </div>
            </div>

            <div class="chat-body" id="chat">
                <div class="bubble receiver" id="b1">Hey! I have something to tell you.</div>
                <div class="typing-indicator" id="typing">
                    <div class="dot"></div><div class="dot"></div><div class="dot"></div>
                </div>
            </div>

            <div class="chat-input-area">
                <div class="fake-input">Typing a message...</div>
                <div class="send-btn" id="send-btn">➤</div>
            </div>
        </div>
    `;

    const overlay = document.getElementById('overlay');
    const chat = document.getElementById('chat');
    const typing = document.getElementById('typing');
    let sequenceStarted = false;

    // Split the user's message into plausible chunks if it's long
    const rawMsg = data.message;
    // Simple split by newline, or artificially by length if no newlines
    let msgChunks = rawMsg.split('\n').filter(m => m.trim() !== '');
    if(msgChunks.length === 1 && rawMsg.length > 50) {
        // split approx in half
        const mid = Math.floor(rawMsg.length / 2);
        const breakNode = rawMsg.indexOf(' ', mid);
        if(breakNode !== -1) {
            msgChunks = [rawMsg.substring(0, breakNode), rawMsg.substring(breakNode)];
        }
    }

    overlay.addEventListener('click', () => {
        if(sequenceStarted) return;
        sequenceStarted = true;
        
        gsap.to(overlay, { opacity: 0, duration: 0.3, onComplete: () => overlay.remove() });

        const tl = gsap.timeline();
        
        // 1. First fake message from sender
        tl.to('#b1', { opacity: 1, y: 0, duration: 0.5, ease: "back.out(1)" })
          .call(() => typing.style.display = 'flex')
          .to({}, { duration: 1.5 }); // wait

        // 2. Reveal user chunks
        msgChunks.forEach((chunk, index) => {
            tl.call(() => {
                typing.style.display = 'none';
                addBubble(chunk, 'sender');
                // show typing again if not last
                if(index < msgChunks.length - 1) {
                    typing.style.display = 'flex';
                    chat.appendChild(typing); // move to bottom
                } else {
                    // end sequence, maybe add receiver reaction
                    setTimeout(() => addBubble(`✨ That's so sweet! Thank you! ✨`, 'receiver'), 1500);
                }
            })
            .to({}, { duration: 1.2 }); // pause between chunks
        });
    });

    function addBubble(text, type) {
        const b = document.createElement('div');
        b.className = `bubble ${type}`;
        b.innerHTML = escapeHtml(text).replace(/\n/g, '<br>');
        chat.appendChild(b);
        // Animate in
        gsap.fromถึง(b, { opacity: 0, y: 30, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "back.out(1)" });
        // Scroll to bottom
        chat.scrollถึงp = chat.scrollHeight;
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
