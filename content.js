// Remove the DOMContentLoaded listener since we're running earlier
const host = window.location.hostname.replace("www.", "");

const selectorMap = {
    "youtube.com": {
        feed: ["#contents", "#shorts-container", "ytd-shorts"],
        pathsToBlock: ["/shorts", "/watch"],
        blockRoot: true,
        motivationalText: "📚 Time to focus on what matters! Take a break from endless scrolling."

    },
    "facebook.com": {
        feed: ["div[role='main']"],
        pathsToBlock: [],
        blockRoot: true,
        motivationalText: "📚 Time to focus on what matters! Take a break from endless scrolling."
    },
    "pepper.pl": {
        feed: ["#pageContent", "#footer"],
        pathsToBlock: [],
        blockRoot: true,
        motivationalText: "📚 Time to focus on what matters! Take a break from endless scrolling."
    }
};

// Inject blocking CSS immediately
function injectBlockingCSS() {
    const style = document.createElement('style');
    style.id = 'content-blocker-style';

    const selectors = selectorMap[host]?.feed || [];
    if (selectors.length > 0) {
        style.textContent = selectors.map(s => `${s} { display: none !important; }`).join('\n');
        (document.head || document.documentElement).appendChild(style);
    }
}

// Run immediately
injectBlockingCSS();

// Rest of your code with settings check
// Update the removeSections function
function removeSections() {
    const selectors = selectorMap[host]?.feed || [];
    const motivationalText = selectorMap[host]?.motivationalText || "Stay focused! 💪";

    selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            el.style.display = "none";

            // Check if we already added the message
            if (!el.nextElementSibling?.classList.contains('motivational-message')) {
                const messageDiv = document.createElement('div');
                messageDiv.className = 'motivational-message';
                messageDiv.innerHTML = `
                    <div style="
                        padding: 40px;
                        text-align: center;
                        font-size: 24px;
                        color: #555;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        border-radius: 12px;
                        margin: 20px;
                        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    ">
                        ${motivationalText}
                    </div>
                `;
                el.parentNode.insertBefore(messageDiv, el.nextSibling);
            }
        });
    });
}
function onUrlChange() {
    const parsedUrl = new URL(window.location.href);
    const path = parsedUrl.pathname;

    chrome.storage.sync.get(["blockedPages"], ({ blockedPages }) => {
        if (!blockedPages?.[host]) {
            // Remove the blocking CSS if user disabled blocking
            const style = document.getElementById('content-blocker-style');
            if (style) style.remove();
            return;
        }

        const siteConfig = selectorMap[host];
        if (!siteConfig) return;

        const { pathsToBlock = [], blockRoot = false } = siteConfig;

        const shouldBlock =
            (blockRoot && path === "/") ||
            pathsToBlock.includes(path);

        if (shouldBlock) {
            injectBlockingCSS();
            removeSections();
        } else {
            const style = document.getElementById('content-blocker-style');
            if (style) style.remove();
        }
    });
}

// Wait for DOM before setting up observers
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupObservers);
} else {
    setupObservers();
}

function setupObservers() {
    onUrlChange();

    const observer = new MutationObserver(() => {
        onUrlChange();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    const origPushState = history.pushState;
    history.pushState = function (...args) {
        origPushState.apply(this, args);
        onUrlChange();
    };

    const origReplaceState = history.replaceState;
    history.replaceState = function (...args) {
        origReplaceState.apply(this, args);
        onUrlChange();
    };

    window.addEventListener("popstate", onUrlChange);
}