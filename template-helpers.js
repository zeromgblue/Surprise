export function loadScript(src) {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) return resolve();
        const s = document.createElement('script');
        s.src = src;
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
    });
}

export function esc(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

export function prepContainer(container, bg) {
    container.style.maxWidth = '100%';
    container.style.padding = '0';
    container.style.height = '100vh';
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';
    container.style.background = bg;
    document.body.style.margin = '0';
    document.body.style.overflow = 'hidden';
}

export function messageCardHtml(data, config, opts = {}) {
    const from = config.from || '#E6C97A';
    const to = config.to || '#9333EA';
    const title = opts.title || 'ถึง';
    return `
        <div class="msg-card" style="
            background: linear-gradient(160deg, rgba(20,20,20,0.92), rgba(10,10,10,0.96));
            border: 1px solid ${from}44;
            border-radius: 20px; padding: 32px 28px; max-width: 420px; width: 90%;
            text-align: center; box-shadow: 0 24px 60px rgba(0,0,0,0.5);
            opacity: 0; transform: translateY(24px) scale(0.96);
        ">
            <div style="font-size:0.85rem;color:${from};letter-spacing:0.12em;text-transform:uppercase;margin-bottom:8px;">${title}</div>
            <div style="font-size:1.8rem;font-weight:700;margin-bottom:20px;background:linear-gradient(to right,${from},${to});-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;">${esc(data.receiver)}</div>
            <div style="font-size:1.05rem;line-height:1.75;color:rgba(255,255,255,0.88);white-space:pre-wrap;margin-bottom:24px;">${esc(data.message)}</div>
            <div style="font-size:0.9rem;color:rgba(255,255,255,0.45);">— ${esc(data.sender)}</div>
        </div>`;
}
