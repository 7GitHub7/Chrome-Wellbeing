document.addEventListener("DOMContentLoaded", () => {
    const host = window.location.hostname.replace("www.", "");

    const selectorMap = {
        "youtube.com": {
            feed: "#contents",
        },
        "facebook.com": {
            feed: "div[role='main']",
        }
    };

    function removeSections() {
        const selector = selectorMap[host]?.feed;
        if (!selector) return;

        const elements = document.querySelectorAll(selector);
        elements.forEach(el => el.style.display = "none");
    }

    // Pobranie ustawień z storage i natychmiastowe usunięcie sekcji
    chrome.storage.sync.get(["blockedPages"], ({ blockedPages }) => {
        if (blockedPages?.[host]) {
            removeSections();
        }
    });

    // MutationObserver do dynamicznie ładowanych elementów
    const observer = new MutationObserver(() => {
        chrome.storage.sync.get(["blockedPages"], ({ blockedPages }) => {
            if (blockedPages?.[host]) {
                removeSections();
            }
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    console.log("Content script Wellbeing Blocker działa na:", host);
});
