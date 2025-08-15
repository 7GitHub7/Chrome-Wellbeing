(function () {
    const SHORTS_SELECTORS = [
        "grid-shelf-view-model",
        "ytd-rich-shelf-renderer"
    ];

    function redirectIfShorts() {
        if (location.pathname.startsWith("/shorts/")) {
            const id = location.pathname.split("/")[2];
            if (id) location.replace("/watch?v=" + id);
        }
    }

    function hideShorts() {
        document.querySelectorAll(SHORTS_SELECTORS.join(","))
            .forEach(el => el.remove());
    }

    new MutationObserver(hideShorts)
        .observe(document, { childList: true, subtree: true });

    redirectIfShorts();
    hideShorts();
})();
