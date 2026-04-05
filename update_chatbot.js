const fs = require('fs');
const path = require('path');

function processFile(filepath) {
    let content = fs.readFileSync(filepath, 'utf-8');
    
    if (!content.includes("<!-- Chatbot UI -->")) {
        return;
    }

    const regexOldLogic = /\/\/ Bot reply\s+setTimeout\(\(\) => \{\s+const botMsg = document\.createElement\('div'\);\s+botMsg\.className = 'chatbot-message bot';\s+botMsg\.textContent = "Thanks for reaching out! A representative will connect with you shortly\. If you need immediate assistance, please call \+1 9542341937\.";\s+messagesEl\.appendChild\(botMsg\);\s+messagesEl\.scrollTop = messagesEl\.scrollHeight;\s+\}, 800\);/g;

    const newLogic = `// Trigger SMS
        setTimeout(() => {
            const botMsg = document.createElement('div');
            botMsg.className = 'chatbot-message bot';
            botMsg.textContent = "Connecting you to our team via text message...";
            messagesEl.appendChild(botMsg);
            messagesEl.scrollTop = messagesEl.scrollHeight;
            
            // Open SMS application
            window.location.href = "sms:+19542341937?body=" + encodeURIComponent(text);
        }, 500);`;

    if (regexOldLogic.test(content)) {
        content = content.replace(regexOldLogic, newLogic);
        fs.writeFileSync(filepath, content, 'utf-8');
    }
}

function processDirectory(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath);
        } else if (file.endsWith('.html')) {
            processFile(fullPath);
        }
    });
}

const folder = process.cwd();
processDirectory(folder);
console.log('Updated Chatbot successfully!');
