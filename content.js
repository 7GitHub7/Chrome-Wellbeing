const host = window.location.hostname.replace("www.", "");
const motivationalText = "Jeżeli my nie robimy nic to gdzieś ktoś cały czas idzie do przodu np.: czyta książki to staje się mądrzejszym człowiekiem, poszerza swoje horyzonty to zyskuje nad nami przewagę. Nie dotyczy to tylko czytania. Załóżmy że ktoś ogląda filmy na yt a ktoś inny hobbystycznie buduje roboty czy programuje i uczy się języka obcego to za kilka lat będzie zarabiał dużo więcej niż my a my będziemy narzekać że nie mamy znajomości lub nie mamy szczęścia."


const selectorMap = {
    "youtube.com": {
        feed: ["#contents", "#shorts-container", "ytd-shorts", "#primary"],
        pathsToBlock: ["/shorts", "/watch", "/"],
        blockRoot: true,
        motivationalText
    },
    "facebook.com": {
        feed: ["div[role='main']", "div[role='feed']"],
        pathsToBlock: ["/"],
        blockRoot: true,
        motivationalText
    },
    "pepper.pl": {
        feed: ["#pageContent", "main"],
        pathsToBlock: ["/"],
        blockRoot: true,
        motivationalText: "Don't buy things you don't need."
    }
};

// --- Helpers ---

function unblockPage() {
    const style = document.getElementById('content-blocker-style');
    if (style) style.remove();

    // Reset CSS display
    const selectors = selectorMap[host]?.feed || [];
    selectors.forEach(sel => {
        document.querySelectorAll(sel).forEach(el => el.style.display = "");
    });

    // Remove banners
    document.querySelectorAll('.motivational-message').forEach(el => el.remove());
}

function injectBlockingCSS() {
    if (document.getElementById('content-blocker-style')) return;
    const style = document.createElement('style');
    style.id = 'content-blocker-style';
    const selectors = selectorMap[host]?.feed || [];
    if (selectors.length > 0) {
        style.textContent = selectors.map(s => `${s} { display: none !important; }`).join('\n');
        (document.head || document.documentElement).appendChild(style);
    }
}

// --- Main Logic ---

// Run immediately
injectBlockingCSS();

function showBlockingMessage(isUnlocking = false) {
    const selectors = selectorMap[host]?.feed || [];
    let text = selectorMap[host]?.motivationalText || "Focus!";

    if (isUnlocking) {
        text = "Unlocking in progress... Wait for the timer in the extension.";
    }

    selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            el.style.display = "none";

            // Check if banner exists
            let messageDiv = el.nextElementSibling;

            if (!messageDiv || !messageDiv.classList.contains('motivational-message')) {
                messageDiv = document.createElement('div');
                messageDiv.className = 'motivational-message';

                messageDiv.style.display = "flex";
                messageDiv.style.flex = "1";

                // High-visibility card design
                messageDiv.innerHTML = `
                    <div style="
                        display: flex;
                        flex:1;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        padding: 40px;
                        text-align: center;
                        color: #ffffff !important;
                        background: linear-gradient(135deg, #2c3e50 0%, #4ca1af 100%);
                        border: 1px solid rgba(255, 255, 255, 0.2);
                        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                        border-radius: 16px;
                        margin: 40px auto;
                        max-width: 600px;
                        width: 90%;
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        z-index: 10000;
                        position: relative;
                        backdrop-filter: blur(10px);
                    ">
                        <h2 id="blocker-message-text" style="
                            margin: 0; 
                            font-size: 24px; 
                            font-weight: 600; 
                            line-height: 1.4;
                            color: #ffffff !important;
                            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
                        ">${text}</h2>
                    </div>
                `;
                el.parentNode.insertBefore(messageDiv, el.nextSibling);
            } else {
                // Update text if banner exists
                const textEl = messageDiv.querySelector('#blocker-message-text');
                if (textEl) textEl.innerText = text;
            }
        });
    });
}

function checkState() {
    const parsedUrl = new URL(window.location.href);
    const path = parsedUrl.pathname;

    chrome.storage.sync.get(["blockedPages", "unlockingState"], (data) => {
        const blockedPages = data.blockedPages || {};
        const unlockingState = data.unlockingState || {};

        // 1. Not Blocked Check
        if (!blockedPages[host]) {
            unblockPage();
            return;
        }

        // 2. Site Config Check
        const siteConfig = selectorMap[host];
        if (!siteConfig) return;

        const { pathsToBlock = [], blockRoot = false } = siteConfig;
        const shouldBlock = (blockRoot && path === "/") || pathsToBlock.some(p => path.startsWith(p));

        if (!shouldBlock) {
            unblockPage();
            return;
        }

        // 3. TIMER LOGIC
        const unlockTime = unlockingState[host];

        if (unlockTime) {
            if (Date.now() > unlockTime) {
                // Timer Finished -> Update storage to unblock permanently
                blockedPages[host] = false;
                delete unlockingState[host];

                chrome.storage.sync.set({ blockedPages, unlockingState }, () => {
                    unblockPage();
                });
                return;
            } else {
                // Timer Running -> Keep blocking, show "Wait" status
                injectBlockingCSS();
                showBlockingMessage(true);
                return;
            }
        }

        // 4. Default Blocked State
        injectBlockingCSS();
        showBlockingMessage(false);
    });
}

// Setup
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

function init() {
    checkState();
    setInterval(checkState, 1000);
    const observer = new MutationObserver(checkState);
    observer.observe(document.body, { childList: true, subtree: true });
}