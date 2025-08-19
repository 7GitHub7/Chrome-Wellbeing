const pages = ["youtube.com", "facebook.com"]

chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    const tab = tabs[0];
    const host = new URL(tab.url).hostname.replace("www.", "");
    console.log("host", host)

    chrome.storage.sync.get(["blockedPages"], ({ blockedPages }) => {
        console.log(blockedPages);
        if (!blockedPages) return;

        Object.keys(blockedPages).forEach(page => {
            console.log(blockedPages[page])
            const label = document.createElement("label");
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = blockedPages[page]
            checkbox.id = page;
            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(" " + page));
            sectionsContainer.appendChild(label);
        });
    });

    saveBtn.addEventListener("click", () => {
        const newRules = {};
        pages.forEach(page => {
            const checkbox = document.getElementById(page);
            newRules[page] = checkbox.checked;
        });
        chrome.runtime.sendMessage({ type: "savePages", blockedPages: newRules });
    });
});
