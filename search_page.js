/**
 * Functions connected to the search page. This includes clearing search
 * fields and initiating the searches using 1 or 2 search fields.
 *
 */
E.searchPage = (function () {
    var searching;

    /**
     * Performs a search from the search page. This includes searching
     * @param searchWord
     * @param searchLocation
     */
    function search(searchWord, searchLocation) {
        var region;

        function searchComplete(data) {
            E.searchPage.setSearchingState(false);
            E.loader.hide();
            E.elements.search.autoComplete.hide();
            E.searchLogic.determineType(data);
            E.elements.search.inputSingle.blur();
        }

            if (searchWord != '' && (!searching && (searchWord || searchLocation))) {
            searching = true;
            region = E.locale.region;

            if (E.util.number.isNumber(searchWord)) {
                searchWord = E.util.number.clean(searchWord);
                if (E.util.number.hasPrefix(searchWord)) {
                    region = E.util.number.getRegion(searchWord);
                }
            }

            E.loader.show();
            E.comm.search(searchWord, searchLocation, region, searchComplete);
        }

    }

    function suggestionSearch(searchWord) {
        var region;

        function suggestionSearchComplete(data) {
            E.elements.search.autoComplete.html('');

            //a failsafe for when the API is down
            if (data.autoCompleteSearchData === null) {
                return;
            }

            var html = '';
            data.autoCompleteSearchData.items.map(function (d) {
                html += '<li><a href="javascript: E.display.setAutoSearchText(\'' + d.itemFull + '\')">' + d.itemShort + '</a></li>';
            });

            E.elements.search.autoComplete.html(html);

            if (E.elements.search.inputSingle.val().length > 1) {
                E.elements.search.autoComplete.show();
                E.elements.search.searchHelp.hide();
            } else {
                E.elements.search.searchHelp.show();
            }
        }

        region = E.locale.region;
        E.comm.autoCompleteSearch(searchWord, region, suggestionSearchComplete);

    }


    function setBogusPosition() {
        var urlVars,
            lon,
            lat;

        urlVars = E.util.getUrlVars();
        if (urlVars.lon && urlVars.lat) {
            lon = parseFloat(urlVars.lon, 10);
            lat = parseFloat(urlVars.lat, 10);
            E.geo.setBogusPos(lon, lat);
        }
    }

    function categorySearch(searchWord, searchLocation, region, relevance) {
        var region;

        function searchComplete(data) {
            E.searchPage.setSearchingState(false);
            E.display.toggleMainMenu();
            E.loader.hide();
            E.searchLogic.determineType(data);
        }

        if (!searching) {
            E.map.clear();
            searching = true;
            region = E.locale.region;

            E.loader.show();
            E.comm.categorySearch(searchWord, searchLocation, region, relevance, searchComplete, function(){});
        }

        if (E.toggle.isUp() !== true) {
            E.toggle.up();
        }
    }

    /**
     *
     * @param state boolean
     */
    function setSearchingState(state) {
        state = state || false;
        searching = state;
    }

    return {
        /**
         * Initiates and clears the search page.
         */
        init: function () {
            var prevSearch;
            searching = false;

            prevSearch = E.globals.getPrevSearchWord();
            if (prevSearch) {
                E.elements.search.inputSingle.val(prevSearch);
                E.elements.search.clearSearch.show();
            } else {
                E.elements.search.inputSingle.val('');
                E.elements.search.clearSearch.hide();
            }

            //show search help text on focus and click
            E.elements.search.inputSingle.bind('click focus', function () {
                E.elements.search.slogan.fadeOut(500, function () {
                    E.elements.search.searchHelp.fadeIn(500);
                });
            });

            setBogusPosition();
        },
        /**
         * Performs a search from a page having one search field. Called as
         * action for the form.
         */
        searchSingle: function () {
            var searchWord,
                searchLocation;
            E.map.clear();
            E.elements.search.autoComplete.hide();
            searchWord = E.elements.search.inputSingle.val().trim();
            searchLocation = E.geo.hasGeo() ? E.geo.getLon() + ',' + E.geo.getLat()  : false;
            search(searchWord, searchLocation);

        },

        clearSearch: function () {
            E.elements.search.inputSingle.val('');
            E.elements.search.clearSearch.hide();
            E.elements.search.autoComplete.hide();
        },

        textSuggestion:function(){
            var searchWord;
            searchWord = E.elements.search.inputSingle.val().trim();
            suggestionSearch(searchWord);
        },

        categorySearch: categorySearch.curry(),

        setSearchingState: setSearchingState.curry()
    };
}());
