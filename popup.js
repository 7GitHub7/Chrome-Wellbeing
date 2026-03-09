const pages = ["youtube.com", "facebook.com", "pepper.pl"];

function render() {
    chrome.storage.sync.get(["blockedPages", "unlockingState"], (data) => {
        const blockedPages = data.blockedPages || {};
        const unlockingState = data.unlockingState || {}; // Format: { "youtube.com": timestamp }
        const container = document.getElementById("sectionsContainer");
        container.innerHTML = "";

        pages.forEach(page => {
            const item = document.createElement("div");
            item.className = "page-item";

            // 1. Label
            const nameSpan = document.createElement("span");
            nameSpan.className = "page-name";
            nameSpan.innerText = page;
            item.appendChild(nameSpan);

            // 2. Control (Checkbox or Timer)
            const unlockTime = unlockingState[page];
            const isBlocked = blockedPages[page];

            if (unlockTime && unlockTime > Date.now()) {
                // CASE A: Unlocking in progress (Timer)
                const timeLeft = Math.ceil((unlockTime - Date.now()) / 1000);

                const badge = document.createElement("span");
                badge.className = "timer-badge";
                badge.innerText = `${timeLeft}s`;
                badge.title = "Click to cancel";

                // Allow cancelling the timer
                badge.addEventListener("click", () => {
                    delete unlockingState[page];
                    chrome.storage.sync.set({ unlockingState }, render);
                });

                item.appendChild(badge);

            } else {
                // CASE B: Standard Checkbox
                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.checked = isBlocked;

                checkbox.addEventListener("change", () => {
                    if (!checkbox.checked) {
                        // User wants to UNBLOCK -> Start Timer
                        // Reset checkbox visually until timer is done (handled by re-render)
                        checkbox.checked = true;

                        // Set unlock time 60 seconds from now
                        unlockingState[page] = Date.now() + 60000;
                        chrome.storage.sync.set({ unlockingState }, render);
                    } else {
                        // User wants to BLOCK -> Immediate
                        blockedPages[page] = true;
                        // Remove any pending unlock
                        if (unlockingState[page]) delete unlockingState[page];
                        chrome.storage.sync.set({ blockedPages, unlockingState }, render);
                    }
                });

                item.appendChild(checkbox);
            }

            container.appendChild(item);
        });
    });
}

// Update timer every second while popup is open
setInterval(render, 1000);

// Initial render
document.addEventListener('DOMContentLoaded', render);