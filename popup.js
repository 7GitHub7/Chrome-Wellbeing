const pages = ["youtube.com", "facebook.com"];

chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    const tab = tabs[0];
    const host = new URL(tab.url).hostname.replace("www.", "");
    console.log("host", host);

    chrome.storage.sync.get(["blockedPages"], ({ blockedPages }) => {
        blockedPages = blockedPages || {};

        pages.forEach(page => {
            const label = document.createElement("label");
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = blockedPages[page] || false; 
            checkbox.id = page;

            checkbox.addEventListener("change", () => {
                blockedPages[page] = checkbox.checked;
                chrome.storage.sync.set({ blockedPages });
            });

            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(" " + page));
            sectionsContainer.appendChild(label);
        });
    });
});
