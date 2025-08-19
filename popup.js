chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    const tab = tabs[0];
    const host = new URL(tab.url).hostname.replace("www.", "");
    console.log("host", host)


    const sectionOptions = {
        "youtube.com": ["feed"],
        "facebook.com": ["feed"]
    };

    if (!sectionOptions[host]) {
        sectionsContainer.textContent = "Brak gotowych sekcji dla tej strony.";
        return;
    }

    chrome.storage.sync.get(["sectionRules"], ({ sectionRules }) => {
        const hostRules = sectionRules[host] || {};
        sectionOptions[host].forEach(section => {
            const label = document.createElement("label");
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = hostRules[section] || false;
            checkbox.id = section;
            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(" " + section));
            sectionsContainer.appendChild(label);
        });
    });

    saveBtn.addEventListener("click", () => {
        console.log("saved")
        const newRules = {};
        sectionOptions[host].forEach(section => {
            const checkbox = document.getElementById(section);
            newRules[section] = checkbox.checked;
        });
        chrome.runtime.sendMessage({ type: "saveRules", host, rules: newRules });
    });
});
