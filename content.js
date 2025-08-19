document.addEventListener("DOMContentLoaded", () => {
    const host = window.location.hostname.replace("www.", "");

    const selectorMap = {
        "youtube.com": {
            feed: "#contents",
            sidebar: "#secondary",
            shorts: "ytd-rich-shelf-renderer"
        }
    };

    function removeSections(rules) {
        if (!rules) return;
        Object.keys(rules).forEach(section => {
            if (rules[section]) {
                const selector = selectorMap[host]?.[section];
                if (selector) {
                    document.querySelectorAll(selector).forEach(el => {
                        console.log(`Usuwam sekcję: ${section}`);
                        el.remove();
                    });
                }
            }
        });
    }

    // Pobranie ustawień z storage i natychmiastowe usunięcie sekcji
    chrome.storage.sync.get(["sectionRules"], ({ sectionRules }) => {
        const rules = sectionRules[host];
        removeSections(rules);
    });

    // MutationObserver do dynamicznie ładowanych elementów
    const observer = new MutationObserver(() => {
        chrome.storage.sync.get(["sectionRules"], ({ sectionRules }) => {
            const rules = sectionRules[host];
            removeSections(rules);
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    console.log("Content script Wellbeing Blocker działa na:", host);
});
