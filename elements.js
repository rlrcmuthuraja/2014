/**
 * Object containing all static objects in the html so that searching
 * only has to be done once and changing the markup only means that the
 * jQuery paths has to be updated in one place.
 *
 * @requires jQuery
 */

E.elements = {
    body: $('body'),
    pageLoader: $('#page_loader'),
    mainMenu: {
    	main: $('#main_menu'),
        subMenu: {
            all: $('#sub_menus div.submenu'),
            maps: $('#map_types'),
            categories: $('#categories_list'),
            categoryRoot: $('#categories_toggle .cat_root')
        },
        submenuToggles: {
            all: $('#submenu_toggles .submenu_toggle'),
            maps: $('#submenu_toggles div.submenu_toggle.maps'),
            categories: $('#submenu_toggles div.submenu_toggle.categories')
        },
    	toggle: $('#menu_toggle'),
        mapTypes: {
            main: $('#map_types'),
            vector: $('#street_map'),
            hybrid: $('#hybrid_map'),
            aerial: $('#aerial_map'),
            nautical: $('#nautical_map')
        }
    },
    pageLoaderStatus: $('#page_loader>.status'),
    header: {
        background: $('#header_background'),
        logo: $('#header_logo'),
        search: $('#header_search')
    },
    search: {
        main: $('#search'),
        singleField: $('#search>.search_field_single'),
        inputSingle: $('#search_single'),
        showMap: $('#show_map'),
        clearSearch: $('#clear_search'),
        autoComplete: $('#autocomplete'),
        searchHelp: $('#search_help'),
        slogan: $('#slogan')
    },
    routeSearch: {
        main: $('#route_search'),
        from: $('#route_search_from'),
        to: $('#route_search_to')
    },
    routeResult: {
        routeNavigation: {
            main: $('#route_navigation'),
            content: $('#route_navigation .middle')
        }
    },
    map: {
        copyright: $('#map_copyright'),
        main: $('#map_page'),
        zoomIn: $('#zoom_in'),
        zoomOut: $('#zoom_out'),
        localise: $('#localise')

    },
    pubRouteTravel: {
        main: $('#pub_route_travel'),
        okButton: $('#pub_route_travel .ok'),
    },
    content: {
        menu: {
            /**
             * All objects contained in the menu.
             */
            content: $('#menu>div, #menu>a, #menu>ul'),
            result: {
                main: $('#menu .result'),
                categories: $('#menu>.result>li'),
                company: $('#menu>.result>.company'),
                person: $('#menu>.result>.person'),
                location: $('#menu>.result>.location'),
                proximity: $('#menu>.result>.proximity'),
                companyData: $('#menu>.result>.company .data'),
                personData: $('#menu>.result>.person .data'),
                locationData: $('#menu>.result>.location .data'),
                companyLink: $('#menu>.result>.company>a'),
                personLink: $('#menu>.result>.person>a'),
                locationLink: $('#menu>.result>.location>a'),
                proximityLink: $('#menu>.result>.proximity>a')
            },
            settings: {
                toggle: $('#menu .toggle_settings'),
                settingsMenu: $('#result_settings'),
                sorting: {
                    main: $('#result_settings .sorting'),
                    sortingLink: $('#result_settings>.sorting>a'),
                    sortProx: $('#result_settings ul.sorting li.proximity'),
                    sortAlpha: $('#result_settings ul.sorting li.alphabetical'),
                    sortRating: $('#result_settings ul.sorting li.rating')
                },
                expand: {
                    main: $('#result_settings .expand_search'),
                    expandElement: $('#result_settings li.zoom_level'),
                    expandLink: $('#search_expand_link'),
                    regionLink: $('#region_expand_link'),
                    regionElement: $('#result_settings li.region'),
                    countryLink: $('#country_expand_link')
                }
            },
            details: $('#menu .details'),
            back: $('#back'),
            nearbyStationsBack: $('#nearby_stations_back'),
            nearbyStationsBackText: $('#nearby_stations_back .text'),
            nearbyStationsInfo: $('#menu .nearby_stations_info'),
            route: {
                select: $('#menu>.route_select'),
                back: $('#route_result a.route_back'),
                result: {
                    main: $('#route_result'),
                    from: $('#route_result_from'),
                    to: $('#route_result_to'),
                    routeAutosuggest: $('#route_result .route_autosuggest'),
                    avoidFerry: $('#avoid_ferry'),
                    avoidHighway: $('#avoid_highway'),
                    avoidToll: $('#avoid_toll'),
                    shortest: $('#route_result .shortest'),
                    fastest: $('#route_result .fastest'),
                    info: $('#route_result>.info'),
                    pubRouteInfo: $('#route_result>.pub_route_info'),
                    pubRouteInfoText: $('#route_result .info_text'),
                    pubRouteAdvToggle: $('#route_result .pub_route_setting'),
                    pubRouteAdvToggleText: $('#route_result .pub_route_setting .text'),
                    distance: $('#route_result>.info .distance'),
                    time: $('#route_result>.info .time'),
                    advanced: $('#route_result>.advanced'),
                    location: $('#route_result>.location'),
                    toggleAdvanced: $('#route_toggle'),
                    pubRouteBack: $('#pub_route_back'),
                    carTransLabel: $('#car_trans_label'),
                    pubTransLabel: $('#pub_trans_label'),
                    carTransButton: $('#car_trans_button'),
                    pubTransButton: $('#pub_trans_button'),
                    pubTransBtnText: $('#pub_trans_button .text'),
                    advSearchForm: $('#route_result form.search_field_double'),
                    advPubRoute: $('#pub_route_advanced'),
                    advPubRouteConfirm: $('#pub_route_advanced .confirm_button'),
                    travelTime: $('#travel_time'),
                    travelType: $('#travel_type'),
                    travelTimeContainer: $('#travel_time_container'),
                    travelTypeContainer: $('#travel_type_container'),
                    travelTimeVal: $('#travel_time_val'),
                    travelTypeVal: $('#travel_type_val'),
                    tabsField: $('#route_result div.route_tabs'),
                    pubAvoid: {
                        flight: $('#pub_avoid_flight'),
                        bus: $('#pub_avoid_bus'),
                        train: $('#pub_avoid_train'),
                        tram: $('#pub_avoid_tram'),
                        metro: $('#pub_avoid_metro'),
                        expBoat: $('#pub_avoid_expBoat'),
                        ship: $('#pub_avoid_ship'),
                        ferry: $('#pub_avoid_ferry')
                    }
                }
            }
        },
        main: $('#content'),
        background: $('#content_background'),
        toggle: $('#toggle'),
        list: $('#list'),
        pubTransList: $('#pubtrans_list'),
        companyLocationData: '#list>li.company .location_data',
        refresher: $('#refresher'),
        refresherText: $('#refresher>.text'),
        refresherCounter: $('#refresher>.counter'),
        refresherSpinner: $('#refresher>.spinner'),
        fullSite: $('#full_site'),
        fullDetailSite: $('#full_site_detail')
    },
    roiImage: $('#roi_image')
};
