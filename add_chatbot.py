import os
import re

CHATBOT_HTML = """
<!-- Chatbot UI -->
<div id="custom-chatbot">
    <div id="chatbot-window" class="chatbot-hidden">
        <div class="chatbot-header">
            <span>Customer Support</span>
            <button id="chatbot-close">&times;</button>
        </div>
        <div id="chatbot-messages">
            <div class="chatbot-message bot">Hello! How can we help you today?</div>
        </div>
        <div class="chatbot-input-area">
            <input type="text" id="chatbot-input" placeholder="Type a message...">
            <button id="chatbot-send">Send</button>
        </div>
    </div>
    <button id="chatbot-trigger">
        <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="28" height="28">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
    </button>
</div>
<style>
/* Chatbot CSS */
#custom-chatbot { position: fixed; bottom: 30px; right: 30px; z-index: 9999; font-family: 'Inter', sans-serif; }
#chatbot-trigger { background: #111; color: #fff; border: none; border-radius: 50%; width: 65px; height: 65px; cursor: pointer; box-shadow: 0 5px 15px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; transition: transform 0.3s ease; }
#chatbot-trigger:hover { transform: scale(1.08); background: #333; }
#chatbot-window { width: 340px; height: 450px; background: #fff; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); display: flex; flex-direction: column; overflow: hidden; transition: opacity 0.3s ease, transform 0.3s ease; transform-origin: bottom right; }
.chatbot-hidden { opacity: 0; transform: scale(0.8); pointer-events: none; position: absolute; bottom: 85px; right: 0; }
.chatbot-visible { opacity: 1; transform: scale(1); pointer-events: auto; position: absolute; bottom: 85px; right: 0; }
.chatbot-header { background: #111; color: #fff; padding: 18px; display: flex; justify-content: space-between; align-items: center; font-weight: 600; font-size: 16px; }
#chatbot-close { background: none; border: none; color: #fff; font-size: 24px; cursor: pointer; padding: 0; line-height: 1; }
#chatbot-messages { flex: 1; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; background: #fafafa; }
.chatbot-message { padding: 12px 16px; border-radius: 12px; max-width: 85%; font-size: 14px; line-height: 1.5; }
.chatbot-message.bot { background: #eaeaea; align-self: flex-start; color: #333; border-bottom-left-radius: 4px; }
.chatbot-message.user { background: #111; color: #fff; align-self: flex-end; border-bottom-right-radius: 4px; }
.chatbot-input-area { display: flex; border-top: 1px solid #eee; padding: 15px; background: #fff; align-items: center; }
#chatbot-input { flex: 1; border: 1px solid #ddd; padding: 12px; border-radius: 8px; outline: none; font-size: 14px; transition: border-color 0.2s; }
#chatbot-input:focus { border-color: #111; }
#chatbot-send { background: #111; color: #fff; border: none; padding: 10px 18px; margin-left: 10px; border-radius: 8px; cursor: pointer; font-weight: 600; transition: background 0.2s; }
#chatbot-send:hover { background: #333; }
</style>
<script>
document.addEventListener('DOMContentLoaded', function() {
    const trigger = document.getElementById('chatbot-trigger');
    const windowEl = document.getElementById('chatbot-window');
    const closeBtn = document.getElementById('chatbot-close');
    const sendBtn = document.getElementById('chatbot-send');
    const inputEl = document.getElementById('chatbot-input');
    const messagesEl = document.getElementById('chatbot-messages');

    trigger.addEventListener('click', () => {
        windowEl.classList.toggle('chatbot-hidden');
        windowEl.classList.toggle('chatbot-visible');
    });

    closeBtn.addEventListener('click', () => {
        windowEl.classList.add('chatbot-hidden');
        windowEl.classList.remove('chatbot-visible');
    });

    function sendMessage() {
        const text = inputEl.value.trim();
        if (!text) return;

        // User message
        const userMsg = document.createElement('div');
        userMsg.className = 'chatbot-message user';
        userMsg.textContent = text;
        messagesEl.appendChild(userMsg);
        inputEl.value = '';
        messagesEl.scrollTop = messagesEl.scrollHeight;

        // Bot reply
        setTimeout(() => {
            const botMsg = document.createElement('div');
            botMsg.className = 'chatbot-message bot';
            botMsg.textContent = "Thanks for reaching out! A representative will connect with you shortly. If you need immediate assistance, please call +1 9542341937.";
            messagesEl.appendChild(botMsg);
            messagesEl.scrollTop = messagesEl.scrollHeight;
        }, 800);
    }

    sendBtn.addEventListener('click', sendMessage);
    inputEl.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
    
    // Attach to existing buttons
    const quoteBtns = document.querySelectorAll('.open-chatbot-btn');
    quoteBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            windowEl.classList.remove('chatbot-hidden');
            windowEl.classList.add('chatbot-visible');
        });
    });
});
</script>
"""

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if "<!-- Chatbot UI -->" in content:
        return # already added
    
    # Replaces:
    # <a href="https://wa.me/19542341937" target="_blank" class="btn btn-primary">Request a Quote</a>
    # With:
    # <button class="btn btn-primary open-chatbot-btn">Request a Quote</button>
    content = re.sub(
        r'<a href="https://wa.me/19542341937" target="_blank" class="(.*?)">(.*?)</a>',
        r'<button class="\1 open-chatbot-btn">\2</button>',
        content
    )

    if '</body>' in content:
        content = content.replace('</body>', CHATBOT_HTML + '\n</body>')
    else:
        content += CHATBOT_HTML
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

folder = r"c:\Users\franc\.gemini\antigravity\playground\fiery-exoplanet"
for root, _, files in os.walk(folder):
    for filename in files:
        if filename.endswith(".html"):
            process_file(os.path.join(root, filename))

print("Injected Chatbot successfully!")
