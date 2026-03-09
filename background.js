const pages = {
    "youtube.com": true,
    "facebook.com": true,
    "pepper.pl": true
};

chrome.runtime.onInstalled.addListener(() => {
    // Initialize defaults
    chrome.storage.sync.set({
        blockedPages: pages,
        allowWeekends: false
    });
});