chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({ sectionRules: {} });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "saveRules") {
        chrome.storage.sync.get(["sectionRules"], ({ sectionRules }) => {
            sectionRules[message.host] = message.rules;
            chrome.storage.sync.set({ sectionRules });
        });
    }
});
