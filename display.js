/**
 * Functions for hiding and showing parts of the html document. Used to
 * simulate page changes. Also contains functions for adding and removing
 * classes from objects.
 *
 * @requires E.elements
 * @requires augmentation.js
 */

E.display = (function () {
    // Just some intermediate variables to make the code more readable.
    var header = E.elements.header,
        menu = E.elements.content.menu,
        content = E.elements.content,
        list = E.elements.content.list,
        mainMenu = E.elements.mainMenu.main,
        routeResult = E.elements.content.menu.route.result;


    /**
     * Shows or hides a set of jQuery elements.
     *
     * @param parameters 1 to (last-1) are jQuery elements that are to be
     * shown/hidden
     * @param last parameter is a boolean which indicates whether the objects
     * should be shown or not.
     *
     * @example
     * showElement($('#header'), $('#footer'), false);
     *
     * // This will hide (call jquery.hide) on the elements matching #header
     * and #footer.
     *
     */
    function showElement() {
        var action = arguments[arguments.length - 1] ? 'show' : 'hide',
            i;

        for (i = 0; i < arguments.length - 1; i++) {
            arguments[i][action]();
        }
    }

    /**
     * Adds or removes a class to a set of jquery elements.
     *
     * @param parameters 1 to (last-2) jQuery element to add/remove class from.
     * @param parameter last - 1 name of class to add/remove
     * @param last parameter boolean determining if add or remove is used.
     *
     * @example
     * setClass($('#header'), 'active', true)
     * // This is equivalent to $('#header').addClass('active')
     *
     * setClass($('#header'), 'active', false)
     * // This is equivalent to $('#header').removeClass('active')
     */
    function setClass() {
        var elements,
            clas,
            add,
            i,
            action;

        clas = arguments[arguments.length - 2];
        add = arguments[arguments.length - 1];
        action = add ? 'addClass' : 'removeClass';

        for (i = 0; i < arguments.length - 2; i++) {
            arguments[i][action](clas);
        }
    }


    function hideProximity() {
        showElement(menu.result.proximity, false);
        setClass(menu.result.location, 'last-visible', true);
    }

    /**
     * Shows the proximity button in the menu on the result page, but only if
     * the device geolocation is known. If not, this has the same effect as
     * hiding the proximity button.
     */
    function showProximity() {
        if (E.geo.hasGeo()) {
            showElement(menu.result.proximity, true);
            setClass(menu.result.location, 'last-visible', false);
        } else {
            hideProximity();
        }
    }

    function hideToggle() {
        showElement(content.toggle, false);
    }

    /**
     * Shows the toggle button on the content-part of the page if there is a
     * visible map behind it. If not, this has the same effect as hiding the
     * proximity button.
     */
    function showToggle() {
        if (E.map.hasMap()) {
            showElement(content.toggle, true);
        } else {
            hideToggle();
        }
    }

    function giveSortInfo(sortType) {
    	var html;

    	html = '<li id="sort_info">' + E.locale.text.sorting[sortType] + '</li>';
    	$('li:first', list).after(html);
    	$('#sort_info').fadeOut(1500, function () { $(this).remove();});
    }

    /**
     * Sorts the result list
     */
    function sortResult() {
        var sortType,
            sortDescending,
            curElem,
            sortKey,
            i,
            liArray = $('li.result', list),
            values = [],
            full,
            half,
            stars;

        sortType = arguments[arguments.length - 2];
        sortDescending = arguments[arguments.length - 1];

        // Populate the array
        for (i = 0, l = liArray.length; i < l; i++) {
            curElem = $(liArray[i]);

            if (sortType === 'alpha') {
                sortKey = E.navigation.getCurrentPage() === 'personResult' ? $('p.name', curElem).text().trim() :
                $('p.header', curElem).text().trim();
            } else if (sortType === 'prox') {
                sortKey = E.util.distance.distanceInMeters($('.distance', curElem).text());

                //Elements with no distance should be at the end in original order
                if (sortKey === 0) {
                    sortKey = 999999 + i;
                }
            } else if (sortType === 'rating') {
                stars = $('div.stars.small_stars', curElem);
                full = stars.children('div.full').length;
                half = stars.children('div.half').length / 2;
                sortKey = full + half;
            }
            values.push({'sortKey': sortKey, 'data': curElem.html()});
        }
        values.sort(E.util.sortResults);

        // Sometimes you gotta DESC
        if (sortDescending) {
            values.reverse();
        }

        // Change the list on the page
        for (i = 0, l = values.length; i < l; i++) {
            liArray[i].innerHTML = values[i].data;
        }

        hideResultSettings();
        giveSortInfo(sortType);
    }

    function setExpandLinks(searchWord, searchLocation, region) {
    	var expandSearchLink,
    		expandRegionLink,
    		expandCountryLink,
    		zoom;

    	zoom = E.util.getUrlVars().zoom || E.constants.map.defaultZoom;
    	zoom = zoom > E.constants.map.minZoom ? zoom - 1 : E.constants.map.minZoom;

    	expandSearchLink = '#' + E.makeUrl.expandSearch(searchWord,
                searchLocation, region, zoom);

        expandRegionLink = '#' + E.makeUrl.expandRegion(searchWord,
                searchLocation, region, E.geo.getMunicipality());

        expandCountryLink = '#' + E.makeUrl.expandCountry(searchWord,
                searchLocation, region, E.constants.map.minZoom);

    	E.elements.content.menu.settings.expand.expandLink.attr('href', expandSearchLink);
		setClass(E.elements.content.menu.settings.expand.expandLink, 'disabled', location.hash === expandSearchLink);

    	E.elements.content.menu.settings.expand.regionLink.attr('href', expandRegionLink);
		setClass(E.elements.content.menu.settings.expand.regionLink, 'disabled', location.hash === expandRegionLink);
        showElement(E.elements.content.menu.settings.expand.regionElement,
            E.geo.getMunicipality() &&
            !E.globals.getGeoSearchWord());

        showElement(E.elements.content.menu.settings.expand.expandElement,
            !E.globals.getGeoSearchWord());

    	E.elements.content.menu.settings.expand.countryLink.attr('href', expandCountryLink);
		setClass(E.elements.content.menu.settings.expand.countryLink, 'disabled', location.hash === expandCountryLink);
    }

    /**
     * Show the menu for more search options
     */
    function showResultSettings() {
    	var searchWord;

        searchWord = E.util.getUrlVars().searchWord;
        if (searchWord) {
            searchWord = searchWord.decodeUtf8();
        }


        showElement(menu.settings.settingsMenu, true);
        menu.settings.settingsMenu[0].hidden = false;

    	showElement(E.elements.content.menu.settings.expand.main,
            E.geo.hasGeo() && E.navigation.getCurrentPage() === E.page.name.companyResult);
    	showElement($('div.heading.expand', E.elements.content.menu.settings.settingsMenu),
            E.geo.hasGeo() && E.navigation.getCurrentPage() === E.page.name.companyResult);
    	showElement(E.elements.content.menu.settings.sorting.sortProx, E.geo.hasGeo());

        if (E.navigation.getCurrentPage() === 'companyResult' &&
            E.locale.region !== 'dgs' & E.locale.region !== 'pl') {
        	showElement(E.elements.content.menu.settings.sorting.sortRating, true);
        } else {
        	showElement(E.elements.content.menu.settings.sorting.sortRating, false);
        }

        $( '.searchword', E.elements.content.menu.settings.expand.main).html(searchWord);

        if (E.geo.getReverseGeo() !== undefined) {
        	var expandRegion = $( '.region', E.elements.content.menu.settings.expand.main);
        	$('p.area', expandRegion).html('<span class="searchword">' +
        				searchWord +
        				'</span>' +
        				E.locale.text.searchSummaryIn +
        				E.geo.getMunicipality()
    				);
        	showElement(expandRegion, true);
        }

        setExpandLinks(searchWord, E.geo.getLon() + ',' + E.geo.getLat(), E.locale.region);

        /**
         * Need to perform a search as the summary is part of the result which
         * is fetched after the e.elements is constructed
         */
        $('li.summary>div.icon', list).hide();
    }

    /**
     * Hide the menu for more search options
     */
    function hideResultSettings() {
        showElement(menu.settings.settingsMenu, false);
        menu.settings.settingsMenu[0].hidden = true;

        /**
         * Need to perform a search as the summary is part of the result which
         * is fetched after the e.elements is constructed
         */
        $('li.summary>div.icon', list).show();
    }

    /**
     *
     */
    function toggleMainMenu() {
    	mainMenu.toggle(0, function () {
    		if ($(this).is(":visible")) {
                E.elements.content.background.hide();
    			$('span', E.elements.mainMenu.toggle).text(E.locale.text.close);
                showElement(header.search, true);
    		} else {
    			$('span', E.elements.mainMenu.toggle).text(E.locale.text.menu);
                E.elements.content.background.show();
                if (E.navigation.getCurrentPage() === 'search') {
                    showElement(header.search, false);
                }
    		}
    	});
    }

    /**
     * Hide the entire result list and show public transport list
     */
    function showCarTransport() {
        list.show();
    }

    function showCarTransport() {

    }


    /**
     * Most returned functions simply show or hide a single element on the page
     * but for the more complex ones i will explain a little more.
     */
    return {
    	toggleMainMenu: toggleMainMenu.curry(mainMenu),
        showPageLoader: showElement.curry(E.elements.pageLoader, true),
        hidePageLoader: showElement.curry(E.elements.pageLoader, false),
        /**
         * Changes the class of the page loader to display as the loader from
         * the search page to the result pages.
         */
        pageLoaderSearch: function () {
            setClass(E.elements.pageLoader, 'content', false);
            setClass(E.elements.pageLoader, 'search', true);
        },
        /**
         * Changes the class of the page loader to display as the loader shown
         * when a page is populated.
         */
        pageLoaderContent: function () {
            setClass(E.elements.pageLoader, 'search', false);
            setClass(E.elements.pageLoader, 'content', true);
        },
        header: {
            showHeader: showElement.curry(header.background, header.logo,
                header.search, true),
            hideHeader: showElement.curry(header.background, header.logo,
                header.search, false),
            showBackground: showElement.curry(header.background, true),
            hideBackground: showElement.curry(header.background, false),
            showLogo: showElement.curry(header.logo, true),
            showButton: showElement.curry(header.search, true),
            hideButton: showElement.curry(header.search, false)
        },
        showMainSearch: showElement.curry(E.elements.search.main, true),
        hideMainSearch: showElement.curry(E.elements.search.main, false),
        showSearchField: showElement.curry(E.elements.search.inputSingle, true),
        hideSearchField: showElement.curry(E.elements.search.inputSingle, false),
        showRouteSearch: showElement.curry(E.elements.routeSearch.main, true),
        hideRouteSearch: showElement.curry(E.elements.routeSearch.main, false),
        hideRouteNavigation: showElement.curry(
            E.elements.routeResult.routeNavigation.main,false),
        showRouteNavigation: showElement.curry(
            E.elements.routeResult.routeNavigation.main,true),
        showMapControllers: showElement.curry(E.elements.map.main, true),
        hideMapControllers: showElement.curry(E.elements.map.main, false),
        addMapControllerClass: setClass.curry(E.elements.map.zoomIn,
            E.elements.map.zoomOut, E.elements.map.localise,
            'route_instruction', true),
        removeMapControllerClass: setClass.curry(E.elements.map.zoomIn,
            E.elements.map.zoomOut, E.elements.map.localise,
            'route_instruction', false),
        /**
         * Called when the map gets visible. changes the classes of the
         * backgrounds of the search pages and the header to become
         * transparent. Shows the link to the map page on the search page.
         */
        showMap: function () {
            setClass(E.elements.search.main, E.elements.routeSearch.main,
                E.elements.header.background, 'no_map', false);

            showElement(E.elements.search.showMap, true);
        },
        content: {
            menu: {
                /**
                 * Hides everything in the menu.
                 */
                hideContent: showElement.curry(menu.content, false),
                result: {
                    showMain: showElement.curry(menu.result.main, true),
                    hideMain: showElement.curry(menu.result.main, false),
                    unsetCategories: setClass.curry(menu.result.categories,
                        'selected', false),
                    showProximity: showProximity,
                    hideProximity: hideProximity,
                    setCompany: function () {
                        setClass(menu.result.company, 'selected', true);
                        showProximity();
                    },
                    setPerson: function () {
                        setClass(menu.result.person, 'selected', true);
                        hideProximity();
                    },
                    setLocation: function () {
                        setClass(menu.result.location, 'selected', true);
                        hideProximity();
                    },
                    /**
                     * @param visible, true/false. determines if proximity
                     * class is set or unset.
                     */
                    setProximity: setClass.curry(menu.result.proximity, 'selected')
                },
                resultSettings: {
                    showToggle: showElement.curry(menu.settings.toggle, true),
                    toggleResultSettings: function () {
                        if (menu.settings.settingsMenu[0].hidden) {
                            showResultSettings();
                        } else {
                            hideResultSettings();
                        }
                    },
                    hideResultSettings: hideResultSettings.curry(),
                    sorting: {
                        showMain: showElement.curry(menu.settings.sorting.main, true),
                        hideMain: showElement.curry(menu.settings.sorting.main, false),
                        unsetSorting: setClass.curry(menu.settings.sorting.sortingLink,
                            'selected', false),
                        sortProximity: sortResult.curry('prox', false),
                        sortAlphabetically: sortResult.curry('alpha', false),
                        sortRating: sortResult.curry('rating', true)
                    },
                    expand: {
                        showMain: showElement.curry(menu.settings.expand.main, true),
                        hideMain: showElement.curry(menu.settings.expand.main, false)
                    }
                },
                showDetails: showElement.curry(menu.details, true),
                showBack: showElement.curry(menu.back, true),
                hideDetails: showElement.curry(menu.details, false),
                hideBack: showElement.curry(menu.back, false),
                showNearInfo: showElement.curry(menu.nearbyStationsInfo, true),
                showNearBack: showElement.curry(menu.nearbyStationsBack, true),
                hideNearInfo: showElement.curry(menu.nearbyStationsInfo, false),
                hideNearBack: showElement.curry(menu.nearbyStationsBack, false),
                route: {
                    showBack: showElement.curry(menu.route.back, true),
                    showSelect: showElement.curry(menu.route.select, true),
                    result: {
                        showMain: showElement.curry(menu.route.result.main, true),
                        showAdvanced: showElement.curry(menu.route.result.advanced, true),
                        hideAdvanced: showElement.curry(menu.route.result.advanced, false),
                        hideInfo: showElement.curry(menu.route.result.info, false),
                        showInfo: showElement.curry(menu.route.result.info, true),
                        hidePubRouteInfo: showElement.curry(menu.route.result.pubRouteInfo, false),
                        showPubRouteInfo: showElement.curry(menu.route.result.pubRouteInfo, true),
                        hideAdvPubRoute: showElement.curry(menu.route.result.advPubRoute, false),
                        hideAutosuggest: showElement.curry(menu.route.result.routeAutosuggest, false),
                        toggleAdvPubRoute: function () {
                            if (menu.route.result.advPubRoute.is(':visible')) {
                                menu.route.result.advPubRoute.hide();
                            } else {
                                menu.route.result.advPubRoute.show();
                            }
                        },
                        /**
                         * Toggles between shortest and fastest as the selected
                         * preference for route search.
                         * @param isShortest if true, shortest is selected.
                         */
                        setPref: function (isShortest) {
                            setClass(menu.route.result.shortest, 'selected', isShortest);
                            setClass(menu.route.result.fastest, 'selected', !isShortest);
                        },
                        activateTransTab: function (transport) {
                            setClass(menu.route.result.carTransLabel, 'active', transport === 'car');
                            setClass(menu.route.result.pubTransLabel, 'active', transport === 'public');
                            setClass(menu.route.result.carTransLabel, 'public', transport === 'public');
                            setClass(menu.route.result.pubTransLabel, 'public', transport === 'public');
                            showElement(menu.route.result.pubTransBtnText, transport !== 'public');
                        }
                    }
                },
                showRouteSelect: showElement.curry(menu.route.select, true)
            },
            showMain: showElement.curry(content.main, content.background, true),
            hideMain: showElement.curry(content.main, content.background, false),
            showToggle: showToggle,
            hideToggle: hideToggle,
            toggleUp: function () {
                setClass(content.toggle, 'up', true);
                setClass(content.toggle, 'down', false);
            },
            toggleDown: function () {
                setClass(content.toggle, 'down', true);
                setClass(content.toggle, 'up', false);
            },
            showRefresher: showElement.curry(content.refresher, true),
            hideRefresher: showElement.curry(content.refresher, false),
            showRefresherSpinner: showElement.curry(content.refresherSpinner, true),
            hideRefresherSpinner: showElement.curry(content.refresherSpinner, false)
        },
        selectCategory: function(cat)
        {
            $('.main_category', E.elements.mainMenu.subMenu.categories).hide();
            $('#cat_' + cat).show();
            setClass($('#category_ul'), 'sub_categories', true);
        },
        selectMenu: function (menu) {
            E.elements.mainMenu.subMenu.all.hide();
            E.elements.mainMenu.subMenu[menu].show();
            setClass(E.elements.mainMenu.submenuToggles.all, 'selected', false);
            setClass(E.elements.mainMenu.submenuToggles[menu], 'selected', true);

            switch (menu) {
                case 'categories':
                    $('.subcategory', E.elements.mainMenu.subMenu.categories).hide();
                    $('.main_category', E.elements.mainMenu.subMenu.categories).show();
                    $('.categories .toggle_text', E.elements.mainMenu.main).text('');
                    setClass($('#category_ul'), 'sub_categories', false);
                    break;
                case 'maps':
                    break;
            }

            E.elements.mainMenu.submenuToggles[menu].css('z-index','4');

            $('.toggle_text', E.elements.mainMenu.submenuToggles[menu]).text(
                E.locale.text.subMenus[menu]
            ).animate(
                {'margin-left': '40px'},
                800,
                'swing',
                function () {
                    var that = $(this);
                    setTimeout(function() {
                        that.animate({'margin-left':'0px'}, 500, 'swing', function (){
                            that.text('');
                            E.elements.mainMenu.submenuToggles[menu].css('z-index','');
                        }, 500);
                    });
                }
            );
        },

        setAutoSearchText: function (searchText) {
            E.elements.search.inputSingle.val(searchText);
            E.elements.search.autoComplete.hide();
            E.elements.search.searchHelp.show();
        },

        showPublicRouteDetails: function (idx) {
            if (idx === undefined) {
                idx = E.util.getUrlVars().expandRoute || 0;
            }

            routeResult.advSearchForm.hide();
            routeResult.pubRouteAdvToggle.hide();
            routeResult.tabsField.hide();
            $("li.pub_trip", list).show();
            $('a.toggle_public_route', list).hide();
            $('li.station_departures', list).hide();
            $('li.station_departures_alternate', list).hide();
            $("ul.trip_details_list[data-trip-details!='" + idx + "']", list).hide();
            $("ul[data-trip-details='" + idx + "']", list).show();
        },
        showPublicRouteResults: function () {
            routeResult.advSearchForm.show();
            routeResult.tabsField.show();
            routeResult.pubRouteAdvToggle.show();
            $("li.pub_trip", list).show();
            $("ul.trip_details_list", list).hide();
            $('li.station_departures', list).hide();
            $('li.station_departures_alternate', list).hide();
            $('a.toggle_public_route', list).show();
        },
        showStationDepartures: function () {
            routeResult.pubRouteAdvToggle.hide();
            $("li.pub_trip", list).hide();
            $("li.station_departures").show();
            $("li.station_departures_alternate").show();
        },
        resetRouteChoice: function () {
            routeResult.advSearchForm.show();
            routeResult.tabsField.show();
            routeResult.info.show();
            routeResult.pubRouteInfo.hide();
            routeResult.advPubRoute.hide();
            E.display.hidePubRouteTravel();
            E.display.showResultList();
        },
        hideResultList: showElement.curry(list, false),
        showResultList: showElement.curry(list, true),
        showPubRouteTravel: function () {
            E.elements.pubRouteTravel.main.show();
            E.display.hideResultList();
        },
        hidePubRouteTravel: function () {
            E.elements.pubRouteTravel.main.hide();
            E.display.showResultList();
        }
    };
}());
