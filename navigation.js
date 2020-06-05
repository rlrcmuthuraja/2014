/**
 * handling of the page changes caused by changes to location.hash.
 *
 * @requires E.page
 */

E.navigation = (function () {
    var currentPage,
        currentHash,
        onExit,
        onlineUrlPath,
        onlineEniroName,
        onlineEniroId,
        referer,
        canonicalElement;

    /**
     *
     * @return referer variable which could be string or undefined
     */
    function getReferer() {
        return referer;
    }

    /**
     * @return the page-part of the url. Anything in the hash located between
     * '#' and the first '&'.
     *
     * @example
     * // location.hash == ...index.html#search&search_word=getbröl
     * getPage()
     * // returns 'search'
     */
    function getPage() {
        var end = location.hash.indexOf('&') !== -1
            ? location.hash.indexOf('&')
            : undefined;
        return location.hash.slice(1, end);
    }

    /**
     * Function emulating the behaviour of onhashchange for mobiles lacking the
     * onhashchange object. Must be called on a rapid timeout for desired
     * effect.
     */
    function hashCheck(callback) {
        var hash = location.hash;
        if (hash !== currentHash) {
            currentHash = hash;
            callback();
        }
    }

    /**
     * Called to determine what page is to be displayed depending on the page
     * in location.hash.
     *
     * @param force optional. if set, a page change will be triggered even if
     * on current page. currently used to trigger a page change for the
     * route result page when making an advanced search that takes you directly
     * to the route result page.
     */
    function determinePage(force) {
        var page,
            pn,
            p,
            expandSearch,
            resultPages,
            canonical,
            urlVars;

        //hide the link to the full site for search and detail pages
        //E.elements.content.fullDetailSite.hide();
        //E.elements.content.fullSite.hide();

        //hide person filter for polish app
        if (E.locale.region === 'pl') {
            E.elements.content.menu.result.person.hide();
        }

        page = getPage();
        pn = E.page.name;
        p = E.page;
        urlVars = E.util.getUrlVars();
        expandSearch = urlVars.expandSearch === '1' && location.hash !== currentHash;
        resultPages = [pn.companyResult, pn.personResult, pn.locationResult];

        // clear the map for pois if we go to a new result page
        if (page !== currentPage &&
            E.util.inArray(page, resultPages) &&
            E.util.inArray(currentPage, resultPages)
            ) {
            E.map.clear();
        }

        if (page === pn.pubRouteResult && location.hash !== currentHash) {
            if (E.routeResult.pubRouteEventsBinded()) {
                E.routeResult.unbindPubRouteEvents();
            }
            force = true;
        }

        if (page !== currentPage || force || expandSearch ||
            (location.hash !== currentHash && E.util.inArray(page, [pn.companyDetails, pn.personDetails]))) {
            currentPage = page;
            canonical = document.location.protocol + '//' + document.location.host + '/';

            if (onExit && typeof onExit === 'function') {
                onExit();
                onExit = undefined;
            }

            switch (page) {
            case pn.search:
                p.mainSearch();
                break;
            case pn.routeSearch:
                p.routeSearch();
                setCanonicalMetaTag(canonical);
                break;
            case pn.result:
                p.result();
                E.elements.body.scrollTop(1);
                break;
            case pn.companyResult:
                p.companyResult();
                E.elements.body.scrollTop(1);
                canonical += 'companyResult.jsp?search_word=' + urlVars.searchWord + '&offset=0&index=ypwpgeo';
                setCanonicalMetaTag(canonical);
                break;
            case pn.personResult:
                p.personResult();
                E.elements.body.scrollTop(1);
                canonical += 'personResult.jsp?search_word=' + urlVars.searchWord + '&offset=0';
                setCanonicalMetaTag(canonical);
                break;
            case pn.locationResult:
                p.locationResult();
                E.elements.body.scrollTop(1);
                canonical += 'placeResult.jsp?search_word=' + urlVars.searchWord + '&offset=0';
                setCanonicalMetaTag(canonical);
                break;
            case pn.companyDetails:
                p.companyDetails();
                canonical += 'companyDetail.jsp?search_word=' +
                    urlVars.searchWord +
                    '&offset=0&eniroID=' +
                    urlVars.eniroId;
                setCanonicalMetaTag(canonical);
                break;
            case pn.personDetails:
                p.personDetails();
                canonical += 'personDetail.jsp?search_word=' +
                    urlVars.searchWord +
                    '&offset=0&personID=' +
                    urlVars.eniroId +
                    '&country=' + E.locale.region;
                setCanonicalMetaTag(canonical);
                break;
            case pn.noHits:
                p.noHits();
                break;
            case pn.routeFrom:
                p.routeFrom();
                break;
            case pn.routeTo:
                p.routeTo();
                break;
            case pn.routeResult:
                p.routeResult();
                canonical += 'routeInterface.jsp?txtBoxFromAddress=' + urlVars.fromName +
                    '&txtBoxToAddress=' + urlVars.toName +
                    '&AddressTo=' + urlVars.toName +
                    '&toLongitude=' + urlVars.toLan +
                    '&offset=0&toLatitude=' + urlVars.toLat +
                    '&routeFromListFlag=false' +
                    '&routeFromListFlag=false' +
                    '&category=places' +
                    '&personID=null' +
                    (urlVars.searchWord ? '&searchWord=' + urlVars.searchWord : '') +
                    '&eniroID=null';
                setCanonicalMetaTag(canonical);
                break;
            case pn.pubRouteResult:
                p.pubRouteResult();
                break;
            case pn.nearByStations:
                p.nearByStations();
                break;
            case pn.publicStation:
                p.publicStation();
                break;
            case pn.infoMenu:
                p.infoMenu();
                break;
            case pn.infoPage:
                p.infoPage();
                break;
            case pn.map:
                p.mapPage();
                break;
            default:
                location.hash = pn.search;
            }
            if (page !== pn.companyResult && page !== pn.companyDetails) {
                E.logging.trigger(page);
            }
        }
    }

    function setCanonicalMetaTag(url) {
        if (E.locale.region !== 'pl') {
            return;
        }

        if (!canonicalElement) {
            var elem;
            elem = document.createElement('link');
            elem.setAttribute('rel', 'canonical');
            elem.setAttribute('id', 'canonical');
            elem.setAttribute('href', url);
            document.getElementsByTagName('head')[0].appendChild(elem);
            canonicalElement = $('#canonical');
        } else {
            canonicalElement.attr('href', url);
        }
    }

    return {
        /**
         * Initialises the function for detecting page changes by changes to
         * location.hash. Should be called after page is loaded.
         */
        init: function () {
            var urlVars;

            urlVars = E.util.getUrlVars();
            if (urlVars.referer) {
                referer = urlVars.referer;
            } else if (document.referrer) {
                referer = document.referrer;
            }

            currentHash = location.hash;

            if ('onhashchange' in window) {
                window.onhashchange = function () {
                    determinePage();
                };
            } else {
                window.setInterval(hashCheck.curry(determinePage), 100);
            }
            determinePage();

        },
        /**
         * @return the name of the current page.
         */
        getCurrentPage: function () {
            return currentPage;
        },

        forcePageChange: function () {
            determinePage(true);
        },

        /**
         * Sets a function that is called once on the next page change.
         * Typically used as a function to call when leaving a page.
         *
         * @param fun required. function called at next page change.
         */
        setOnExit: function (fun) {
            onExit = fun;
        },

        /**
         *
         */
        showSearchPage: function () {
            if (E.elements.mainMenu.main.is(":visible")) {
                E.display.toggleMainMenu();
            }
            window.location = '#search';
        },

        getOnlineUrlPath: function () {
            var vars;

            onlineUrlPath = '/';
            vars = E.util.getUrlVars();

            switch (this.getCurrentPage()) {
                /*
                case E.page.name.companyResult:
                    onlineUrlPath += E.locale.urlParts.find + ':' +
                        vars.searchWord;
                    break;
                case E.page.name.personResult:
                    onlineUrlPath += E.locale.urlParts.result + '/' +
                        vars.searchWord;
                    break;
                */
                case E.page.name.personDetails:
                    onlineUrlPath += E.locale.urlParts.personProfile + '/' +
                        onlineEniroName.replace(/ /g, '+').replace(/\//g, '').toLowerCase() + '/' +
                        onlineEniroId.toLowerCase() +
                        '?search_word=' + vars.searchWord;
                    break;
                case E.page.name.companyDetails:
                    onlineUrlPath += E.locale.urlParts.companyProfile + '/' +
                        onlineEniroName.replace(/ /g, '-').replace(/\//g, '').toLowerCase() + ':' +
                        onlineEniroId.toLowerCase() +
                        '?search_word=' + vars.searchWord.replace(/ /g, '+');
                    break;
                default:
                    onlineUrlPath += '';
                    break;
            }
            return onlineUrlPath;
        },

        /**
         * Set the result hit name and id
         * for urls to full website
         * @param obj
         */
        setOnlineUrlDetail: function(obj) {
            onlineEniroName = obj.name;
            onlineEniroId = obj.eniroId || obj.recordId;
        },

        /**
         * Return the local referer variable
         */
        getReferer: getReferer
    };
}());
