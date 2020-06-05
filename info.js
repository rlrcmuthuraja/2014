/**
 * Functions for showing info pages (legal, cookies, etc). The info pages works
 * like this:
 *
 * All individual pages are located in a directory called 'info'. Inside info
 * there is a file called menu.html. menu.html contains a list of links. Each
 * link points to the info with a url-parameter 'page'. The value of page
 * matches the name of a html-file inside the 'info' directory. Here's an
 * example:
 *
 * <li class="info_menu"><a href="#infoPage&page=zebra">Zebra</a></li>
 * this is a link to the file 'info/zebra.html'
 *
 * Since the page menu.html contains all links to the other pages, adapting for
 * different countries is pretty easy, just write a separate menu.html and swap
 * the contents of the 'info' directory.
 */

E.info = (function () {
    /**
     * Loads a HTML page from url, puts it in a list item of class 'info_page'
     * then puts the li inside the result list. Used for loading the info pages
     * and the menu. If the loaded html page is already a list, no li surrounds
     * the loaded content.
     *
     * @param url required. this has to be a valid url, no error handling exist
     * for this
     * @param isList optional. if set, html is not inserted in a list item.
     */
    function loadHtml(url, isList) {
        function complete(html) {
            if (!isList) {
                html = E.generate.listItem(html, 'info_page');
            }

            E.elements.content.list.html(html);
        }

        E.comm.loadHtml(url, complete);
    }

    /**
     * Given a name N, the html page located in 'info/N.html' is loaded by
     * loadHtml.
     *
     * @param name required. name of page.
     * @param isList optional.
     */
    function loadPage(name, isList) {
        var url;
        if (name === 'disclaimer') {
             url = 'static/ios/disclaimer/' +
                 E.locale.policyPage +
                 '/disclaimer_' +
                 E.locale.region + '.html';
        } else {
            url = 'info/' + name + '.html';
        }



        loadHtml(url, isList);
    }

    return {
        /**
         * Loads the menu page.
         */
		 
        loadMenu: loadPage.curry(E.locale.menuFile, true),

        /**
         * Init function for info pages (not info menu).
         */
        init: function () {
            var page;

            page = E.util.getUrlVars().page;

            loadPage(page);
        }
    };
}());
