/**
 * Functions for showing specific pages. Showing a page includes hiding all
 * other pages and showing the elements of the specific page. It also calls the
 * function for loading the data of the specific page.
 *
 * Each public function corresponds directly to a page.
 */

E.page = (function () {

    /**
     * Shows the parts of the page shared by the main and route search.
     */
    function search() {
        E.display.content.hideMain();
        E.display.hideRouteNavigation();
        E.display.hideMainSearch();
        E.display.hideRouteSearch();
        E.display.header.hideButton();
        E.display.header.hideHeader();
        E.display.header.showLogo();
        E.display.content.hideToggle();
        E.display.hidePageLoader();
        E.display.hideMapControllers();
    }

    /**
     * Shows the parts of the page where all results are shown.
     */
    function content() {
        E.display.hideRouteNavigation();
        E.display.hideMainSearch();
        E.display.hideRouteSearch();
        E.display.header.showHeader();
        E.display.content.showMain();
        E.display.content.showToggle();
        E.toggle.up();
        E.display.content.menu.hideContent();
        E.display.hideMapControllers();
        E.loader.setContent();
    }

    /**
     * Shows the parts of the page shared by the result pages.
     *
     */
    function result() {
        content();
        E.display.content.menu.result.showMain();
        E.display.content.menu.resultSettings.showToggle();
        E.display.content.menu.resultSettings.hideResultSettings();
        E.display.content.menu.resultSettings.sorting.showMain();
    }

    /**
     * Shows the parts of the page shared by the details pages.
     */
    function details() {
        content();
        //E.elements.content.fullDetailSite.show();
        E.display.content.menu.resultSettings.hideResultSettings();
        E.elements.content.list.empty();
        E.display.content.menu.showBack();
        E.refresher.unbind();
    }

    /**
     * Shows the parts of the page shared by the route from and route to pages.
     */
    function routeSelect() {
        E.display.content.menu.resultSettings.hideResultSettings();
        E.display.content.menu.result.hideMain();
        E.elements.content.list.empty();
        E.refresher.unbind();
        content();
    }

    /**
     * Shows the parts of the page for public transport result
     */
    function pubRouteSelect() {
        E.display.content.menu.resultSettings.hideResultSettings();
        E.display.content.menu.result.hideMain();
        E.elements.content.list.hide();
        E.elements.content.pubTransList.show();
        E.refresher.unbind();
        content();
    }

    /*
    * Shows the nearby stations
    */

    function nearByStations(){
        E.elements.content.menu.nearbyStationsBackText.html(
            E.util.getUrlVars().name.decodeUtf8().shorten('12')
        );
        E.elements.content.menu.nearbyStationsInfo.html(
            E.locale.text.stations
        );

        content();
        E.nearByStations.populate();
        E.elements.content.list.show();
        E.display.content.menu.hideBack();
        E.display.content.menu.hideDetails();
        E.display.content.menu.showNearBack();
        E.display.content.menu.showNearInfo();
        E.refresher.unbind();

    }

    function publicStation () {
        var urlVars;

        urlVars = E.util.getUrlVars();

        E.elements.content.menu.nearbyStationsBackText.html(
            (urlVars.isTrip ? E.locale.text.yourTrip : E.locale.text.pubTransStops)
        );
        E.elements.content.menu.nearbyStationsInfo.html(
            (urlVars.isTrip && urlVars.nextName ?
                E.locale.text.otherDepTo + urlVars.nextName: E.locale.text.departures).decodeUtf8()
        );
        E.geo.request();
        content();
        E.nearByStations.populateStationDepartures();
        E.display.content.menu.showNearBack();
        E.display.content.menu.showNearInfo();
        E.refresher.unbind();
    }

    /**
     * Shows the parts of the page shared by the info pages. The info pages are
     * the legal pages and the site information as well as the menu for these
     * pages.
     */
    function info() {
        E.elements.content.list.empty();
        content();
        E.refresher.unbind();
        E.display.content.menu.showBack();
        E.display.content.menu.result.hideMain();
    }

    function setRouteButtonLinks() {
        E.elements.content.menu.route.result.pubTransButton.attr('href',
            location.href.replace(
                E.page.name.routeResult,
                E.page.name.pubRouteResult
            ).replace(/&expandRoute=(\d+)/g, '')
        );
        E.elements.content.menu.route.result.carTransButton.attr('href',
            location.href.replace(
                E.page.name.pubRouteResult,
                E.page.name.routeResult
            ).replace(/&expandRoute=(\d+)/g, '')
        );
    }

    return {
        mainSearch: function () {
            //E.elements.content.fullSite.show();
            search();
            E.searchPage.init();
            E.loader.setSearch();
            E.display.showMainSearch();
        },
        routeSearch: function () {
            search();
            E.display.showRouteSearch();
            E.routeSearch.init();
        },
        companyResult: function () {
            var param;

            result();


            param = E.result.getParams();

            if (E.companyResult.loadData()) {
                E.companyResult.populate(param.searchWord,
                    param.searchLocation, param.region);
            }

            E.result.setCategory(0);
            E.display.content.menu.result.setProximity(false);
            E.elements.content.menu.result.proximityLink.attr('href',
                'javascript:E.companyResult.proximity();');
            E.navigation.setOnExit(E.logging.unbindResultLogging);

        },
        personResult: function () {
            var param;

            result();

            param = E.result.getParams();

            if (E.personResult.loadData()) {
                E.personResult.populate(param.searchWord,
                    param.searchLocation, param.region);
            }

            E.result.setCategory(1);
        },
        locationResult: function () {
            var param;

            result();

            param = E.result.getParams();

            if (E.locationResult.loadData()) {
                E.locationResult.populate(param.searchWord,
                    param.searchLocation, param.region);
            }

            E.result.setCategory(2);
        },
        companyDetails: function () {
            var eniroId,
                region,
                urlVars;

            details();
            E.display.content.menu.showDetails();

            urlVars = E.util.getUrlVars();
            eniroId = urlVars.eniroId;
            region = urlVars.region || E.locale.region;

            E.companyDetails.populate(eniroId, region);
        },
        personDetails: function () {
            var recordId,
                region,
                urlVars;

            details();

            urlVars = E.util.getUrlVars();
            recordId = urlVars.recordId;
            region = urlVars.region || E.locale.region;

            E.personDetails.populate(recordId, region);
        },
        noHits: function () {
            var param,
                html;

            content();
            E.display.content.menu.resultSettings.hideResultSettings();
            E.display.content.menu.hideContent();
            E.display.content.menu.showBack();

            param = E.result.getParams();
            html = E.generate.noHits(param.searchWord, param.searchLocation);

            E.refresher.unbind();
            E.elements.content.list.html(html);
        },
        routeFrom: function () {
            routeSelect();
            E.display.content.menu.route.showSelect();
            E.routeFrom.populate();
        },
        routeTo: function () {
            routeSelect();
            E.display.content.menu.route.showSelect();
            E.routeTo.populate();
        },
        routeResult: function () {
            routeSelect();
            if (E.locale.region === 'no') {
                E.display.resetRouteChoice();
                E.elements.content.menu.route.result.tabsField.show();
            }
            E.display.content.menu.route.result.hideAutosuggest();
            E.display.content.menu.route.result.hideAdvanced();
            E.display.content.menu.route.result.showMain();
            E.display.content.menu.route.result.activateTransTab('car');
            setRouteButtonLinks();
            E.map.clear();
            E.routeResult.populate();
        },
        pubRouteResult: function () {
            var urlVars;

            urlVars = E.util.getUrlVars();
            if (urlVars.station || urlVars.expandRoute) {
                E.elements.content.menu.route.result.advSearchForm.hide();
            } else {
                E.elements.content.menu.route.result.tabsField.show();
            }
            routeSelect();
            E.display.content.menu.route.result.hideAutosuggest();
            E.display.content.menu.route.result.hideAdvanced();
            E.display.content.menu.route.result.showMain();
            E.display.content.menu.route.result.hideInfo();
            E.display.content.menu.route.result.showPubRouteInfo();
            E.display.content.menu.route.result.activateTransTab('public');
            //setRouteButtonLinks();

//            E.map.clear();
            E.routeResult.populatePublicRoute();
        },
        infoMenu: function () {
            info();
            E.info.loadMenu();
        },
        infoPage: function () {
            info();
            E.info.init();
        },

        nearByStations: function(){
            nearByStations();
        },
        publicStation: function(){
            publicStation();
        },

        mapPage: function () {
            E.display.hideRouteNavigation();
            E.display.hideMainSearch();
            E.display.hideRouteSearch();
            E.display.header.hideBackground();
            E.display.header.showLogo();
            E.display.header.showButton();
            E.display.content.hideMain();
            E.display.content.hideToggle();
            E.display.hidePageLoader();
            E.display.showMapControllers();
            E.mapPage.init();

        },


        name: {
            search: 'search',
            result: 'result',
            companyResult: 'companyResult',
            companyProximityResult: 'companyProximityResult',
            personResult: 'personResult',
            locationResult: 'locationResult',
            noHits: 'noHits',
            companyDetails: 'companyDetails',
            personDetails: 'personDetails',
            routeSearch: 'routeSearch',
            routeFrom: 'routeFrom',
            routeTo: 'routeTo',
            routeResult: 'routeResult',
            pubRouteResult: 'pubRouteResult',
            infoMenu: 'infoMenu',
            infoPage: 'infoPage',
            map: 'map',
            nearByStations: 'nearByStations',
            publicStation: 'publicStation'
        },
        /**
         * The logging object parameters.
         * These properties must exist as properties in above name object
         */
        logging: {
            no: {
                search: 'gulesider/',
                result: '',
                companyResult: 'gulesider/show_yellow_result_list',
                companyProximityResult: 'gulesider/show_yellow_result_list',
                personResult: 'gulesider/Person_Hitlist',
                locationResult: 'gulesider/show_map_result_list',
                noHits: '',
                companyDetails: 'gulesider/show_yellow_infopage',
                personDetails: 'gulesider/Person_Info',
                routeSearch: 'gulesider/Route_Plan_Search_Page',
                routeFrom: 'gulesider/Route_Plan_Choice_List',
                routeTo: 'gulesider/Route_Plan_Choice_List',
                routeResult: 'gulesider/Route_Plan_Page',
                infoMenu: 'gulesider/Help_Page',
                infoPage: 'gulesider/Help_Page',
                map: 'gulesider/show_map_infopage'
            },
            se: {
                search: 'Frontpage',
                result: '',
                companyResult: 'Company_Hitlist',
                companyProximityResult: 'Company_Hitlist',
                personResult: 'Person_Hitlist',
                locationResult: 'Map_Hitlist',
                noHits: '',
                companyDetails: 'Company_Info',
                personDetails: 'Person_Info',
                routeSearch: 'Route_Plan_Search_Page',
                routeFrom: 'Route_Plan_Choice_List',
                routeTo: 'Route_Plan_Choice_List',
                routeResult: 'Route_Plan_Page',
                infoMenu: 'Legal',
                infoPage: 'Legal',
                map: 'Map_Page'
            },
            dk: {
                search: 'nS1LmP8yW.Ey94z4L3HmoJbfXmcUua83KxW2RVvRK73.g7',
                result: '',
                companyResult: '0sVAfaNpRy.NY6rtwVyd7ZQbjzMGusMS9em.pSTQiCf.B7',
                companyProximityResult: '0sVAfaNpRy.NY6rtwVyd7ZQbjzMGusMS9em.pSTQiCf.B7',
                personResult: 'cntAfcMmRyCz7qrtuQYVDoYgzSWpbdtWsNWDzqbts4v.x7',
                locationResult: 'cntAe8MmR_lTuAE.YPqxSoYgj1OpbcMisLW.gybA4AT.47',
                noHits: '',
                companyDetails: 'cntK4cMms1VTUgENYYwqYIaA7_apXYM8EFm.Bc_pENT.Z7',
                personDetails: 'zCrqHvxPo2ZnD4dDXLm9coaAzdupXduK2soNlXwoXib.y7',
                routeSearch: 'cnrqH8Mmo2aziCcXAaGtI4Yg78apbYMssNW.pP_kuJr.J7',
                routeFrom: 'oqWbGzNvCH3OG6dFjofzgJZDDkGpXY8UsC9GnTb8Dzn.G7',
                routeTo: 'oqWbGzNvCH3OG6dFjofzgJZDDkGpXY8UsC9GnTb8Dzn.G7',
                routeResult: 'zCtAevxPR_lhiAG9c7yxO4YgzUWpbdtmsH_Ds._li1v.Q7',
                infoMenu: 'nAs1v4xUnU_i0v4ayMHnqaPerfcGus7G9TlGPd0Uhwf.B7',
                infoPage: 'nAs1v4xUnU_i0v4ayMHnqaPerfcGus7G9TlGPd0Uhwf.B7',
                map: 'zCtKfvxPs53HnCeHtDMVHYaA71ypXYNQeme.pSvQu.T.H7'
            },
            dgs: {
                search: 'zZo1vy8r_bfCdNUPfVAbqZRproD6vQN_S4XbNKKYUJf.37',
                result: '',
                companyResult: '.XqQy67D46sIQkFxtoHJhresfXTYM__ygU35B9FRZvL.97',
                companyProximityResult: '',
                personResult: 'B9A6rydNr4x9vYg0_Y_th8VHHWw17y_CxrLpw3bej4v.u7',
                locationResult: 'B9Ca0SdNv4sXVGK6cKQyk8VHP4M17wcPxpMyfk8SwQL.N7',
                noHits: '',
                companyDetails: 'B9CazydNv8PdrcHFCYhCS8Wn33k1r0bekKuso.w4PCb.t7',
                personDetails: 'p8aQyzcd46utEkEv0TPBl7buP4LYFwcPS1QyflarQe3.S7',
                routeSearch: '.Ro6r69Dr4yitIfyLZGteLdM33jYc0begP4iOtGhuc7.T7',
                routeFrom: 'p8Ywqzcd03OtDAF6UUtxu7eOfXTYV__y62.5iYXgvzf.o7',
                routeTo: 'p8Ywqzcd03OtDAF6UUtxu7eOfXTYV__y62.5iYXgvzf.o7',
                routeResult: '.XqQza7D43Ki5KF8rXxR9bes33jYM0beISGsoAD2vBD.I7',
                infoMenu: 'p8aazzcdv8RHX4iEyLkVqbbuHWvYFy_C67pfXIaxPHz.p7',
                infoPage: 'p8aazzcdv8RHX4iEyLkVqbbuHWvYFy_C67pfXIaxPHz.p7',
                map: 'B9AwqydN03N3WQF6AOV5MsVHP4M17wcPMIIy.Cy2Qen.U7'
            },
            pl: {
                search: 'd1NFLUsDYTlDM5PK2Nu.AJR7fX.uLW7e9_nDK685HXb.Y7',
                result: 'd1NFLUsDYTlDM5PK2Nu.AJR7fX.uLW7e9_nDK685HXb.Y7',
                companyResult: 'd1NFLUsDYTlDM5PK2Nu.AJR7fX.uLW7e9_nDK685HXb.Y7',
                companyProximityResult: 'd1NFLUsDYTlDM5PK2Nu.AJR7fX.uLW7e9_nDK685HXb.Y7',
                personResult: 'd1NFLUsDYTlDM5PK2Nu.AJR7fX.uLW7e9_nDK685HXb.Y7',
                locationResult: 'd1NFLUsDYTlDM5PK2Nu.AJR7fX.uLW7e9_nDK685HXb.Y7',
                noHits: 'd1NFLUsDYTlDM5PK2Nu.AJR7fX.uLW7e9_nDK685HXb.Y7',
                companyDetails: 'd1NFLUsDYTlDM5PK2Nu.AJR7fX.uLW7e9_nDK685HXb.Y7',
                personDetails: 'd1NFLUsDYTlDM5PK2Nu.AJR7fX.uLW7e9_nDK685HXb.Y7',
                routeSearch: 'd1NFLUsDYTlDM5PK2Nu.AJR7fX.uLW7e9_nDK685HXb.Y7',
                routeFrom: 'd1NFLUsDYTlDM5PK2Nu.AJR7fX.uLW7e9_nDK685HXb.Y7',
                routeTo: 'd1NFLUsDYTlDM5PK2Nu.AJR7fX.uLW7e9_nDK685HXb.Y7',
                routeResult: 'd1NFLUsDYTlDM5PK2Nu.AJR7fX.uLW7e9_nDK685HXb.Y7',
                infoMenu: 'd1NFLUsDYTlDM5PK2Nu.AJR7fX.uLW7e9_nDK685HXb.Y7',
                infoPage: 'd1NFLUsDYTlDM5PK2Nu.AJR7fX.uLW7e9_nDK685HXb.Y7',
                map: 'd1NFLUsDYTlDM5PK2Nu.AJR7fX.uLW7e9_nDK685HXb.Y7'
            }
        }
    };
}());
