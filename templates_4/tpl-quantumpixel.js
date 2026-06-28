export async function render(container, data, config) {
    container.style.cssText = "max-width:100%;padding:0;height:100vh;background:#020008;";
    document.body.style.cssText = "margin:0;overflow:hidden;";
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    const r = escapeHtml(data.receiver), m = escapeHtml(data.message), s = escapeHtml(data.sender);

    container.innerHTML = `
    <style>
        .scene{width:100%;height:100vh;position:relative;overflow:hidden;cursor:pointer;font-family:'Courier New',monospace;}
        canvas{position:absolute;inset:0;display:block;}
        .click-hint{position:absolute;bottom:6%;left:50%;transform:translateX(-50%);color:rgba(200,100,255,0.8);font-size:13px;letter-spacing:4px;animation:qppulse 1.5s ease-in-out infinite;pointer-events:none;z-index:5;}
        @keyframes qppulse{0%,100%{opacity:0.3;}50%{opacity:1;}}
        .message-panel{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;padding:40px;z-index:10;}
        .msg-receiver{font-size:3em;color:#CC88FF;text-shadow:0 0 20px #8800FF;margin-bottom:20px;letter-spacing:5px;}
        .msg-body{font-size:1.1em;color:#E0C0FF;max-width:580px;text-align:center;line-height:1.9;margin-bottom:28px;}
        .msg-sender{font-size:1em;color:#AA44FF;letter-spacing:4px;}
    </style>
    <div class="scene" id="qpScene">
        <canvas id="qpCanvas"></canvas>
        <div class="click-hint" id="clickHint">◈ CLICK TO COLLAPSE THE QUANTUM STATE ◈</div>
        <div class="message-panel" id="msgPanel">
            <div class="msg-receiver">${r}</div>
            <div class="msg-body">${m}</div>
            <div class="msg-sender">— ${s} —</div>
        </div>
    </div>`;

    const canvas=document.getElementById('qpCanvas');
    const ctx=canvas.getContext('2d');
    canvas.width=window.innerWidth;
    canvas.height=window.innerHeight;

    const PIXEL_SIZE=4;
    const cols=Math.ceil(canvas.width/PIXEL_SIZE);
    const rows=Math.ceil(canvas.height/PIXEL_SIZE);
    const pixels=new Uint8ClampedArray(cols*rows*3);
    let phase='noise'; // noise | scrambling | clearing
    let progress=0;
    let animFrame;
    const colors=[[255,0,255],[0,255,255],[255,255,0],[255,0,128],[0,255,128],[128,0,255],[255,128,0]];

    function randomPixel(){
        const c=colors[Math.floor(Math.random()*colors.length)];
        return c;
    }

    for(let i=0;i<pixels.length;i+=3){
        const c=randomPixel();
        pixels[i]=c[0];pixels[i+1]=c[1];pixels[i+2]=c[2];
    }

    function draw(){
        const imgData=ctx.createImageData(canvas.width,canvas.height);
        for(let row=0;row<rows;row++){
            for(let col=0;col<cols;col++){
                const pidx=(row*cols+col)*3;
                const r2=pixels[pidx],g2=pixels[pidx+1],b2=pixels[pidx+2];
                for(let py=0;py<PIXEL_SIZE;py++){
                    for(let px=0;px<PIXEL_SIZE;px++){
                        const x=col*PIXEL_SIZE+px, y=row*PIXEL_SIZE+py;
                        if(x>=canvas.width||y>=canvas.height) continue;
                        const idx=(y*canvas.width+x)*4;
                        imgData.data[idx]=r2;imgData.data[idx+1]=g2;imgData.data[idx+2]=b2;imgData.data[idx+3]=255;
                    }
                }
            }
        }
        ctx.putImageData(imgData,0,0);
    }

    function animateNoise(){
        if(phase==='noise'){
            // Scramble a fraction of pixels
            const count=Math.floor(cols*rows*0.3);
            for(let i=0;i<count;i++){
                const idx=Math.floor(Math.random()*cols*rows)*3;
                const c=randomPixel();
                pixels[idx]=c[0];pixels[idx+1]=c[1];pixels[idx+2]=c[2];
            }
            draw();
            animFrame=requestAnimationFrame(animateNoise);
        } else if(phase==='scrambling'){
            // Scramble ALL pixels fast
            for(let i=0;i<pixels.length;i+=3){
                const c=randomPixel();
                pixels[i]=c[0];pixels[i+1]=c[1];pixels[i+2]=c[2];
            }
            draw();
            progress++;
            if(progress>40){
                phase='clearing';
                progress=0;
            }
            animFrame=requestAnimationFrame(animateNoise);
        } else if(phase==='clearing'){
            // Converge to black
            const clearFrac=Math.min(progress/60,1);
            const count=Math.floor(cols*rows*(1-clearFrac));
            for(let i=0;i<count*3;i+=3){
                const idx=Math.floor(Math.random()*cols*rows)*3;
                const c=randomPixel();
                pixels[idx]=Math.floor(c[0]*(1-clearFrac));
                pixels[idx+1]=Math.floor(c[1]*(1-clearFrac));
                pixels[idx+2]=Math.floor(c[2]*(1-clearFrac));
            }
            // Black out increasing portion
            const blackCount=Math.floor(cols*rows*clearFrac);
            for(let i=0;i<blackCount;i++){
                const idx=Math.floor(Math.random()*cols*rows)*3;
                pixels[idx]=2;pixels[idx+1]=0;pixels[idx+2]=8;
            }
            draw();
            progress++;
            if(progress>70){
                cancelAnimationFrame(animFrame);
                // Clear canvas to bg color
                ctx.fillStyle='#020008';
                ctx.fillRect(0,0,canvas.width,canvas.height);
                gsap.to('#msgPanel',{opacity:1,duration:1.2});
                return;
            }
            animFrame=requestAnimationFrame(animateNoise);
        }
    }
    animateNoise();

    let clicked=false;
    document.getElementById('qpScene').addEventListener('click',()=>{
        if(clicked) return; clicked=true;
        document.getElementById('clickHint').style.display='none';
        phase='scrambling';
    });
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector(`script[src="${src}"]`))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
