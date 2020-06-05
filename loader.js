/**
 * The loader is the spinner shown when data is loading, either while
 * performing a search or when populating a page.
 *
 * Right now all it does is show and hide the loader, but this would be an
 * ideal place to put a "search is taking longer than expected"-message by
 * extending show and hide.
 */

E.loader = {
    /**
     * Shows the loader. This is called whenever the loader is shown so this
     * would be a good place to place a timer to execute code when the loading
     * takes too long.
     */
    show: function () {
        E.display.showPageLoader();
    },
    /**
     * Hides the loader.
     */
    hide: function () {
        E.display.hidePageLoader();
    },
    /**
     * Sets the loader class to look like the content-loader (the loader when
     * pages are populated).
     */
    setContent: function () {
        E.elements.pageLoaderStatus.html('');
        E.display.pageLoaderContent();
    },
    /**
     * Sets the loader class to look like the search-loader (the loader when
     * performing a search from the search page.)
     */
    setSearch: function () {
        E.elements.pageLoaderStatus.html('');
        E.display.pageLoaderSearch();
    },
    /**
     * Sets the loader text.
     * @param text
     */
    setText: function (text) {
        E.elements.pageLoaderStatus.html(text);
    }
};
