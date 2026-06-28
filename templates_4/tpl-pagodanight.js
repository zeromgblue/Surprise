export async function render(container, data, config) {
    container.style.cssText = "max-width:100%;padding:0;height:100vh;background:#020008;";
    document.body.style.cssText = "margin:0;overflow:hidden;";
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    const r = escapeHtml(data.receiver), m = escapeHtml(data.message), s = escapeHtml(data.sender);

    // 5-tier pagoda lanterns
    const lanterns = Array.from({length:5},(_,tier)=>
        Array.from({length:tier+2},(__,li)=>`<div class="lantern" id="lantern_${tier}_${li}" style="left:${(li/(tier+1))*100}%;top:${20+tier*15}%;"></div>`).join('')
    ).join('');

    container.innerHTML = `
    <style>
        .scene{width:100%;height:100vh;position:relative;overflow:hidden;cursor:pointer;font-family:'Georgia',serif;}
        .night-sky{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 0%,#0A0020 0%,#020008 60%,#010004 100%);}
        .moon{position:absolute;right:15%;top:8%;width:70px;height:70px;background:radial-gradient(circle at 40% 40%,#FFFBE0,#E8D080);border-radius:50%;box-shadow:0 0 30px rgba(230,200,80,0.5);}
        .star-field{position:absolute;inset:0;pointer-events:none;}
        .star{position:absolute;background:#E0D0FF;border-radius:50%;animation:stTwink 3s ease-in-out infinite;}
        @keyframes stTwink{0%,100%{opacity:0.2;}50%{opacity:0.9;}}
        .pagoda{position:absolute;left:20%;bottom:15%;width:200px;}
        .pagoda svg{overflow:visible;}
        .lantern{position:absolute;width:12px;height:16px;background:#1A0800;border-radius:3px 3px 5px 5px;transition:background 0.3s;pointer-events:none;}
        .lantern.lit{background:radial-gradient(ellipse,#FFDD00,#FF8800);box-shadow:0 0 12px #FFB800,0 0 25px rgba(255,150,0,0.5);}
        .banner-container{position:absolute;right:8%;top:5%;width:160px;opacity:0;}
        .banner-rod{width:100%;height:6px;background:linear-gradient(to right,#8B4513,#C67840,#8B4513);border-radius:3px;margin-bottom:0;}
        .banner-cloth{background:linear-gradient(to bottom,#8B0000,#CC1100);padding:20px 16px;clip-path:polygon(0 0,100% 0,100% 95%,50% 100%,0 95%);text-align:center;}
        .banner-r{font-size:1.1em;color:#FFD700;letter-spacing:2px;margin-bottom:8px;}
        .banner-b{font-size:0.7em;color:#FFE0A0;line-height:1.6;margin-bottom:8px;}
        .banner-s{font-size:0.65em;color:#FF8800;letter-spacing:2px;}
        .click-hint{position:absolute;bottom:5%;left:50%;transform:translateX(-50%);color:rgba(200,150,255,0.7);font-size:13px;letter-spacing:4px;animation:pgpulse 2s ease-in-out infinite;z-index:10;}
        @keyframes pgpulse{0%,100%{opacity:0.4;}50%{opacity:1;}}
        .ground{position:absolute;bottom:0;left:0;right:0;height:15vh;background:linear-gradient(to top,#020004,#050010);}
        .full-msg{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;padding:40px;background:rgba(2,0,8,0.92);}
        .full-msg-r{font-size:3em;color:#FFD700;text-shadow:0 0 20px #FF8800;margin-bottom:20px;letter-spacing:5px;}
        .full-msg-b{font-size:1.1em;color:#E0C0FF;max-width:580px;text-align:center;line-height:1.9;margin-bottom:28px;}
        .full-msg-s{font-size:1em;color:#C060FF;letter-spacing:4px;}
    </style>
    <div class="scene" id="pagodaScene">
        <div class="night-sky"></div>
        <div class="moon"></div>
        <div class="star-field" id="starField"></div>

        <div class="pagoda">
            <svg width="200" height="380" viewBox="0 0 200 380">
                <!-- Tier 5 (top) -->
                <polygon points="100,10 80,30 120,30" fill="#2A1A3A" stroke="#4A2A5A" stroke-width="1"/>
                <rect x="78" y="28" width="44" height="25" fill="#2A1A3A" stroke="#4A2A5A" stroke-width="1"/>
                <path d="M68 53 Q100 45 132 53" stroke="#4A2A5A" stroke-width="2" fill="none"/>
                <!-- Tier 4 -->
                <polygon points="100,60 65,80 135,80" fill="#2A1A3A" stroke="#4A2A5A" stroke-width="1"/>
                <rect x="62" y="78" width="76" height="30" fill="#2A1A3A" stroke="#4A2A5A" stroke-width="1"/>
                <path d="M50 108 Q100 98 150 108" stroke="#4A2A5A" stroke-width="2" fill="none"/>
                <!-- Tier 3 -->
                <polygon points="100,115 50,140 150,140" fill="#2A1A3A" stroke="#4A2A5A" stroke-width="1"/>
                <rect x="46" y="138" width="108" height="35" fill="#2A1A3A" stroke="#4A2A5A" stroke-width="1"/>
                <path d="M32 173 Q100 160 168 173" stroke="#4A2A5A" stroke-width="2" fill="none"/>
                <!-- Tier 2 -->
                <polygon points="100,180 30,210 170,210" fill="#2A1A3A" stroke="#4A2A5A" stroke-width="1"/>
                <rect x="26" y="208" width="148" height="40" fill="#2A1A3A" stroke="#4A2A5A" stroke-width="1"/>
                <path d="M12 248 Q100 233 188 248" stroke="#4A2A5A" stroke-width="2" fill="none"/>
                <!-- Tier 1 (base) -->
                <polygon points="100,255 8,290 192,290" fill="#2A1A3A" stroke="#4A2A5A" stroke-width="1"/>
                <rect x="5" y="288" width="190" height="50" fill="#2A1A3A" stroke="#4A2A5A" stroke-width="1"/>
                <!-- Door -->
                <rect x="85" y="308" width="30" height="30" rx="15" ry="5" fill="#1A0A2A"/>
                <!-- Steps -->
                <rect x="40" y="338" width="120" height="8" rx="2" fill="#1A0A2A" stroke="#3A2A4A" stroke-width="1"/>
                <rect x="25" y="346" width="150" height="8" rx="2" fill="#1A0A2A" stroke="#3A2A4A" stroke-width="1"/>
            </svg>
        </div>

        <!-- Lantern dots overlaid on pagoda tiers -->
        <div id="lanternLayer" style="position:absolute;inset:0;pointer-events:none;">
            ${[
                {x:'24%',y:'61%'},{x:'31%',y:'61%'},
                {x:'20%',y:'53%'},{x:'28%',y:'53%'},{x:'36%',y:'53%'},
                {x:'17%',y:'44%'},{x:'24%',y:'44%'},{x:'31%',y:'44%'},{x:'38%',y:'44%'},
                {x:'14%',y:'34%'},{x:'20%',y:'34%'},{x:'27%',y:'34%'},{x:'34%',y:'34%'},{x:'41%',y:'34%'},
                {x:'11%',y:'22%'},{x:'17%',y:'22%'},{x:'24%',y:'22%'},{x:'31%',y:'22%'},{x:'37%',y:'22%'},{x:'43%',y:'22%'}
            ].map((pos,i)=>`<div class="lantern" id="lnt${i}" style="left:${pos.x};top:${pos.y};"></div>`).join('')}
        </div>

        <div class="banner-container" id="bannerContainer">
            <div class="banner-rod"></div>
            <div class="banner-cloth">
                <div class="banner-r">${r}</div>
                <div class="banner-b">${m}</div>
                <div class="banner-s">— ${s} —</div>
            </div>
        </div>

        <div class="ground"></div>
        <div class="click-hint" id="clickHint">✦ Click to Light the Lanterns ✦</div>
        <div class="full-msg" id="fullMsg">
            <div class="full-msg-r">${r}</div>
            <div class="full-msg-b">${m}</div>
            <div class="full-msg-s">— ${s} —</div>
        </div>
    </div>`;

    // Stars
    const sf=document.getElementById('starField');
    for(let i=0;i<80;i++){
        const d=document.createElement('div');d.className='star';
        const sz=0.5+Math.random()*2;
        d.style.cssText=`width:${sz}px;height:${sz}px;left:${Math.random()*100}%;top:${Math.random()*100}%;animation-delay:${Math.random()*3}s;`;
        sf.appendChild(d);
    }

    let clicked=false;
    document.getElementById('pagodaScene').addEventListener('click',()=>{
        if(clicked) return; clicked=true;
        document.getElementById('clickHint').style.display='none';
        const tl=gsap.timeline();
        // Light lanterns bottom-to-top staggered
        for(let i=19;i>=0;i--){
            tl.add(()=>document.getElementById(`lnt${i}`).classList.add('lit'),`+=${0.08}`);
        }
        // Banner unrolls from right
        tl.to('#bannerContainer',{opacity:1,duration:0.5},'+=0.5');
        tl.from('#bannerContainer .banner-cloth',{scaleY:0,duration:1,ease:'power2.out',transformOrigin:'top center'});
        tl.to('#fullMsg',{opacity:1,duration:1.2},'-=0.3');
    });
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector(`script[src="${src}"]`))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
