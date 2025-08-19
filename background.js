const pages = {
    "youtube.com": false,
    "facebook.com": false
};
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({ blockedPages: pages });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("message", message)
    if (message.type === "savePages") {
        chrome.storage.sync.set({ blockedPages: message.blockedPages });
    }

});
