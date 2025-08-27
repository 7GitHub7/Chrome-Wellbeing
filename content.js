document.addEventListener("DOMContentLoaded", () => {
    const host = window.location.hostname.replace("www.", "");

    const selectorMap = {
        "youtube.com": {
            feed: ["#contents", "#shorts-container", "ytd-shorts"],  
            pathsToBlock: ["/shorts", "/watch"],
            blockRoot: true  
        },
        "facebook.com": {
            feed: ["div[role='main']"],
            pathsToBlock: [], 
            blockRoot: true  
        }
    };

    function removeSections() {
        const selectors = selectorMap[host]?.feed || [];
        selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => el.style.display = "none");
        });
    }

    function onUrlChange() {
        const parsedUrl = new URL(window.location.href);
        const path = parsedUrl.pathname;

        chrome.storage.sync.get(["blockedPages"], ({ blockedPages }) => {
            if (!blockedPages?.[host]) return;

            const siteConfig = selectorMap[host];
            if (!siteConfig) return;

            const { pathsToBlock = [], blockRoot = false } = siteConfig;

            const shouldBlock =
                (blockRoot && path === "/") ||
                pathsToBlock.includes(path);

            if (shouldBlock) {
                removeSections();
            }
        });
    }

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
});
