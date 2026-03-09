document.addEventListener('DOMContentLoaded', () => {
    const weekendCheckbox = document.getElementById('weekendMode');

    // Load setting
    chrome.storage.sync.get(['allowWeekends'], (result) => {
        weekendCheckbox.checked = result.allowWeekends || false;
    });

    // Save setting
    weekendCheckbox.addEventListener('change', () => {
        chrome.storage.sync.set({ allowWeekends: weekendCheckbox.checked });
    });
});