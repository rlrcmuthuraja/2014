/**
 * The refresher is the object responsible for loading more data when the ser
 * scrolls to the bottom of the page. It's bound to one page at a time.
 */

/*global window */
/*global document */

E.refresher = (function () {
    var pos,
        totalHits,
        searchWord,
        searchLocation,
        region,
        urlFunction,
        translateFunction,
        generateFunction,
        objFunction,
        done,
        lock,
        page,
        extra,
        apiZoom;

    /**
     * Function to call when all data is fetched. It disables the refresher
     * and hides it.
     */
    function allDataFetched() {
        done = true;
        E.display.content.hideRefresher();
        $(window).unbind('scroll');
    }

    /**
     * Set the text of the refresher to indicate that more hits can be fetched.
     *
     * @example text is set to "fetch next 5"
     *
     */
    function nextText() {
        var left;

        left = E.util.min(E.constants.numRefreshHits, totalHits - pos + 1);

        E.elements.content.refresherText.html('<a href="javascript: E.refresher.getNext();"><p>' +
        										E.locale.text.getNext + ' ' + left + '</p></a>');
        E.display.content.hideRefresherSpinner();
    }

    /**
     * this function is called whenever the refresher element is shown. if
     * the result set contains more data, the API is called and the list is
     * appended. while the API is called, the function blocks itself until
     * the call is complete. when all data is fetched, allDataFetched is
     * called to disable the function and hide the refresher element.
     *
     */
    function getNext() {
        var url;

        function complete(data) {

            var obj,
                html,
                scrollTop;

            if (pos >= totalHits) {
                allDataFetched();
            } else {
                nextText();
            }

            obj = translateFunction(objFunction(data));
            html = obj.map(generateFunction).join('');
            E.elements.content.list.append(html);
            lock = false;
            if (extra && typeof extra === 'function') {
                extra(data);
            }
            scrollTop = $(window).scrollTop();
            $(window).scrollTop(scrollTop - 1);
            E.map.setDisplayBoundingBox();
        }

        if (!done && !lock) {
            url = urlFunction(searchWord, searchLocation, region, pos,
                E.constants.numRefreshHits, apiZoom);

            pos += E.constants.numRefreshHits;

            E.elements.content.refresherText.text(E.locale.text.fetching + '...');
            E.display.content.showRefresherSpinner();
            lock = true;
            E.comm.queryApiSuper(url, complete);

        }
    }

    /**
     * Function that is run every time the scroll event is triggered.
     * Calls get next if at end of page and the current page is the
     * page that the refresher is working on.
     */
    function scrollFunction() {
        var docHeight,
            scrollBottom;

        if (page === E.navigation.getCurrentPage() && E.elements.mainMenu.main.is(":visible") !== true) {
            docHeight = Math.max(
                Math.max(document.body.scrollHeight, document.documentElement.scrollHeight),
                Math.max(document.body.offsetHeight, document.documentElement.offsetHeight),
                Math.max(document.body.clientHeight, document.documentElement.clientHeight)
            );
            scrollBottom = $(window).height() + $(window).scrollTop();

            // If 170 pixels above end of page as the viewport
            if (scrollBottom > docHeight - 170 &&
                E.elements.content.list.is(":visible") === true) {
                getNext();
            }
        }
    }

    /**
     * Binds the refresher to a page and a result set.
     *
     * @param urlFunc required. function for generating url for the api.
     * function (searchWord, searchLocation, region, from, numHits) -> string
     *
     * @param translateFunc required. function for translating the object
     * returned from the api call and extracted by objFunc.
     * function ([obj]) -> [obj]
     *
     * @param generateFunc required. function for generating a single result
     * item.
     * function (obj) -> string containing html
     *
     * @param objFunc function for extracting the result array from the api
     * response object.
     * function (obj) -> obj
     *
     * @param sWord sWord or sLocation is required.
     * @param sLocation sWord or sLocation is required
     * @param reg required. region
     * @param from required. index of first result in the result set that was
     * not a part of the original response.
     *
     * @param totHits required. total number of hits in the result set.
     * @param pge required. name of the page that the refresher works on.
     * @param xtra optional. function that's called whenever data is refreshed.
     * this function is sent the data and the page.
     */
    function bind(urlFunc, translateFunc, generateFunc,
                  objFunc, sWord, sLocation, reg, from, totHits, pge, xtra, zoom) {

        var windowEvents;

        urlFunction = urlFunc;
        translateFunction = translateFunc;
        generateFunction = generateFunc;
        objFunction = objFunc;

        apiZoom = zoom;

        searchWord = sWord;
        searchLocation = sLocation;
        region = reg;
        pos = from;
        totalHits = totHits;

        page = pge;

        extra = xtra;

        done = false;
        lock = false;

        if (pos === undefined || pos >= totalHits) {
            allDataFetched();
        } else {
            E.display.content.showRefresher();
            nextText();

            windowEvents = $(window).data('events');
            if (windowEvents && windowEvents.length) {
                $(window).unbind('scroll');
            }

            $(window).bind('scroll', scrollFunction);
        }
    }

    return {
        /**
         * Binds the refresher to the company result page.
         *
         * For more details, see private function bind.
         */
        bindCompany: function (sWord, sLocation, reg, from, totHits, apiZm) {

            function generateFunc(adverts) {
                return E.generate.companyResult(adverts, reg);
            }

            function objFunc(data) {
                return data.search.yp.features;
            }

            function extra(data) {
                E.logging.trigger(E.page.name.companyResult,
                    data.search.yp,
                    true,
                    data.apiMetaData.searchWord,
                    data.apiMetaData.geoSearchWord || E.geo.getMunicipality() || sLocation);

                if (data.search.yp.features && data.search.yp.features.length) {
                    data.search.yp.features.map(function (item) {
                        E.logging.bindResultLogging(item.id);
                    });
                }
            }

            bind(E.comm.makeCompanyUrl, E.translate.companyResult, generateFunc,
                objFunc, sWord, sLocation, reg, from, totHits,
                E.page.name.companyResult, extra, apiZm);

        },

        /**
         * Binds the refresher to the proximity set on the company result page.
         *
         * For more details, see private function bind.
         */
        bindCompanyProximity: function (sWord, sLocation, loc, reg, from, totHits) {

            function urlFunc(sw, sl, r, f, nh) {
                return E.comm.makeCompanyProximityUrl(sw, sl, loc, r, f, nh);
            }

            function generateFunc(adverts) {
                return E.generate.companyResult(adverts, reg);
            }

            function objFunc(data) {
                return data.adverts;
            }

            function extra(data) {
                E.logging.trigger(E.page.name.companyProximityResult, data, true,
                    sWord, sLocation);
            }

            bind(urlFunc, E.translate.companyResult, generateFunc, objFunc, sWord,
                searchLocation, reg, from + 1, totHits, E.page.name.companyResult,
                extra);
        },

        /**
         * Binds the refresher to the person result page.
         *
         * For more details, see private function bind.
         */
        bindPerson: function (sWord, sLocation, reg, from, totHits) {

            function generateFunc(records) {
                return E.generate.personResult(records, region);
            }

            function objFunc(data) {
                return data.search.wp.features;
            }

            bind(E.comm.makePersonUrl, E.translate.personResult, generateFunc,
                objFunc, sWord, sLocation, reg, from + 1, totHits,
                E.page.name.personResult);
        },

        /**
         * Binds the refresher to the location result page.
         *
         * For more details, see private function bind.
         */
        bindLocation: function (sWord, sLocation, reg, from, totHits) {

            function objFunc(data) {
                return data.search.geo.features || [data.search.geo];
            }

            bind(E.comm.makeLocationUrl, E.translate.locationResult,
                E.generate.locationResult, objFunc, sWord, sLocation,
                reg, from, totHits, E.page.name.locationResult);
        },

        /**
         * Binds the refresher to a route select page.
         *
         * @param page name of route page to bind to.
         *
         * For more details, see private function bind.
         */
        bindRouteSelect: function (sWord, reg, from, totHits, linkFun, page) {

            function urlFunc(sw, sl, r, f, nh) {
                return E.comm.makeLocationUrl(sw, null, reg, f, nh);
            }

            var generateFunc = E.generate.routeSelect.curry(linkFun);

            function objFunc(data) {
                return data.search.geo.features;
            }

            bind(urlFunc, E.translate.routeSelect, generateFunc, objFunc,
                sWord, null, reg, from, totHits, page);

        },

        /**
         * unbinds the scroll event and hides the refresher.
         */
        unbind: function () {
            E.display.content.hideRefresher();
            $(window).unbind('scroll');
        },

        /**
         * See private function getNext
         */
        getNext: getNext
    };
}());
