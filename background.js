const pages = {
    "youtube.com": false,
    "facebook.com": false
};
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({ blockedPages: pages });
});
