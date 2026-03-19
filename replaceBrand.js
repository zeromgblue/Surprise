const fs = require('fs');
const path = require('path');
const dir = __dirname;

const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(f => {
    let content = fs.readFileSync(path.join(dir, f), 'utf8');
    let orig = content;
    
    // Replace specific branding text
    content = content.replace(/Surprise Me/g, 'Zprise');
    content = content.replace(/SURPRISE ME/g, 'ZPRISE');
    content = content.replace(/SurpriseMe/g, 'Zprise');
    content = content.replace(/\| Surprise/g, '| Zprise');
    content = content.replace(/>Surprise</g, '>Zprise<');
    content = content.replace(/Surprise Platform/g, 'Zprise Platform');
    
    if (content !== orig) {
        fs.writeFileSync(path.join(dir, f), content, 'utf8');
        console.log(`Updated ${f}`);
    }
});
