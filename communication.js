/**
 * Functions for calling the different APIs. This includes aggregate functions
 * when multiple APIs have to be called as one call.
 *
 * @requires E.constants
 * @requires jquery.jsonp
 */

/*global E */
/*global $ */

E.comm = (function () {
    var  onlineBaseUrl;

    /**
     * Function that's called if no other error function is supplied to
     * queryAPI. Just prints the text status of the error message to the
     * console.
     *
     */
    function defaultCommError(xOptions, textStatus) {
        console.log(textStatus);
    }

    /**
     * Basic wrapper function for jquery ajax function.
     * @param url required. url of the API
     * @param success required. function that's called if the API responds with
     * success.
     * @param error optional. function that's called if the API responds with
     * failure. If omitted, defaultCommError is used.
     * @return the query-object.
     */
    function queryApi(url, success, error) {
        url += '&callback=?';
        error = error || defaultCommError;
        return $.jsonp({
            cache: false,
            url: url,
            success: success,
            error: error
        });
    }

    /**
     * Loads a html object from the specified url.
     *
     * @param url required.
     * @param complete required. callback on completion.
     */
    function loadHtml(url, complete) {
        $.ajax({
            url: url,
            success: complete,
            dataType: 'html'
        });
    }

    /**
     * Creates an URL used for querying the company basic API.
     *
     * @param searchWord one of searchWord and searchLocation is required.
     * @param searchLocation one of searchWord and searchLocation is required
     * @param region required - the country code i.e dk, se or no
     * @param from optional. offset in the result list.
     * @param numHits optional. number of hits to fetch.
     * @return an url for querying the company API with the specified
     * parameters.
     */
    function makeCompanyUrl(searchWord, searchLocation, region, from, numHits, zoom) {
        var zoom,
            geoArea;
        from = from || E.constants.api.company.start;
        zoom = zoom || E.util.getUrlVars().zoom || E.constants.map.defaultZoom;
        geoArea = E.util.getUrlVars().geoArea;
        geoArea = geoArea && geoArea !== '' ? geoArea : undefined;

        return makeSuperSearchUrl(
            searchWord,
            region,
            from,
            "yp",
            searchLocation,
            zoom,
            geoArea,
            E.constants.api.relevanceString
        );
    }

    /**
     * Creates an URL for querying the company proximity basic API. Max
     * distance for proximity search will be fetched from
     * E.constants.proximityMaxDistance.
     *
     * @param searchWord either searchWord or searchLocation is required
     * @param searchLocation either searchWord or searchLocation is
     * required.
     * @param location required. location object {lon, lat}.
     * @param region required.
     * @param from optional.
     * @param numHits optional.
     * @return an url for querying the company proximity API with the
     * specified paramaeters.
     */
    function makeCompanyProximityUrl(searchWord, searchLocation, location,
                                     region, from, numHits, relevance) {

        var to,
            url;

        relevance = relevance || E.constants.api.relevanceString;
        from = from || E.constants.api.companyProximity.start;
        to = parseInt(from, 10) + parseInt((numHits || E.constants.numHits), 10) - 1;

        url = makeSuperSearchUrl(searchWord, region, from, 'yp', searchLocation, E.constants.map.defaultZoom, null, null, relevance);

        return url;
    }

    /**
     * Creates an URL used for querying the person API.
     *
     * @param searchWord one of searchWord, searchLocation or recordId
     *        is required.
     * @param searchLocation one of searchWord, searchLocation or
     *        recordId is required.
     * @param recordId one of searchWord, searchLocation or recordId is
     *        required.
     * @param region required. database to search in.
     * @param from optional. offset in the result list.
     * @param numHits optional. number of hits to fetch.
     * @return an url for querying the person API with the specified
     * parameters.
     */
    function makePersonUrl(searchWord, searchLocation, region, from, numHits, zoom, relevance) {
        var zoom,
            geoArea;
        zoom = zoom || E.util.getUrlVars().zoom || E.constants.map.defaultZoom;
        geoArea = E.util.getUrlVars().geoArea;
        geoArea = geoArea && geoArea !== '' ? geoArea : undefined;
        relevance = relevance || E.constants.api.relevanceString;

        return makeSuperSearchUrl(searchWord, region, from, 'wp', searchLocation, zoom, geoArea, relevance);
    }

    /**
     * Creates an URL used for querying the person API.
     *
     * @param searchWord one of searchWord, searchLocation or recordId
     *        is required.
     * @param searchLocation one of searchWord, searchLocation or
     *        recordId is required.
     * @param recordId one of searchWord, searchLocation or recordId is
     *        required.
     * @param region required. database to search in.
     * @param from optional. offset in the result list.
     * @param numHits optional. number of hits to fetch.
     * @return an url for querying the person API with the specified
     * parameters.
     */
    function makePersonDetailUrl(searchWord, searchLocation, recordId, region, from, numHits) {
        var to,
            url;

        from = from || E.constants.api.person.start;
        to = parseInt(from, 10) + parseInt((numHits || E.constants.numHits), 10) - 1;

        url = E.constants.api.person.url +
            'profile=' + E.constants.api.user +
            '&key=' + E.constants.api.key +
            '&version=' + E.constants.api.person.version +
            '&from_list=' + from +
            '&to_list=' + to +
            '&country=' + region;

        if (searchWord) {
            url += '&search_word=' + searchWord.encodeUtf8();
        }

        if (searchLocation) {
            url += '&geo_area=' + searchLocation.encodeUtf8();
        }

        if (recordId) {
            url += '&ps_id=' + recordId;
        }

        return url;
    }

    /**
     *
     * Creates an URL used for querying the location API. As the location API
     * does not support location, searchWord and searchLocation are simply
     * combined into the search word.
     *
     * @param searchWord one of searchWord and searchLocation is required.
     * @param searchLocation one of searchWord and searchLocation is required
     * @param region required. database to search in.
     * @param from optional. offset in the result list.
     * @param numHits optional. number of hits to fetch.
     * @return an url for querying the location API with the specified
     * parameters.
     */
    function makeLocationUrl(searchWord, searchLocation, region, from, numHits, zoom, relevance) {
        var zoom,
            geoArea;
        zoom = zoom || E.util.getUrlVars().zoom || E.constants.map.defaultZoom;
        geoArea = E.util.getUrlVars().geoArea;
        geoArea = geoArea && geoArea !== '' ? geoArea : undefined;

        if (region === E.constants.countryCode.dk) {
            region = 'dk';
        }

        from = from || E.constants.api.location.start;
        numHits = numHits || E.constants.numHits;
        relevance = relevance || E.constants.api.relevanceString;

        return makeSuperSearchUrl(searchWord, region, from, 'geo', searchLocation, zoom, geoArea, relevance) +
            '&disableRankLogic=' + E.constants.api.superSearch.disableRankLogic;
    }

    /**
     * Creates a URL for querying the infoPage API
     *
     * @param eniroId required
     * @param region required
     * @return an url for querying the infoPage API with the specified
     * parameters
     */
    function makeInfoUrl(eniroId, region) {
        return (region === 'pl' ? E.constants.api.info.plUrl : E.constants.api.info.url) +
            'profile=' + E.constants.api.user +
            '&key=' + E.constants.api.key +
            '&version=' + E.constants.api.info.version +
            '&country=' + region +
            '&eniro_id=' + eniroId;
    }

    /**
     * Creates a URL for querying the review API
     *
     * @param eniroId required
     * @param region required
     * @return an url for querying the review API with the specified
     * parameters
     */
    function makeReviewUrl(eniroId) {
        return (E.locale.region === 'pl' ? E.constants.api.review.plUrl : E.constants.api.review.url) +
            'profile=' + E.constants.api.user +
            '&key=' + E.constants.api.key +
            '&version=' + E.constants.api.review.version +
            '&country=' + E.locale.langCode +
            '&eniro_id=' + eniroId;
    }

    /**
     * Creates a URL for querying the route API.
     *
     * @param from required. location object {lon, lat} containing the
     * coordinates of the from-destination.
     * @param to required. location object {lon, lat} containing the
     * coordinates of the to-destination.
     * @param avoid optional. object containing features to avoid, example:
     * {ferry: true, toll: true, highway: false}
     * @param prefShortest optional. if set, the rout search will go for
     * shortest route, rather than default (fastest).
     * @return an url for querying the route API with the specified parameters.
     */
    function makeRouteUrl(from, to, avoid, prefShortest) {
        var url;

        url = E.constants.api.route.url + 'waypoints=' +
            from.lon + ',' + from.lat + ';' +
            to.lon + ',' + to.lat +
            '&geo=true&res=40&contentType=JSON&instr=true' +
            '&lang=' + E.locale.langCode;

        if (avoid) {
            if (avoid[E.constants.routeAvoidToll]) {
                url += '&avoid=tollway';
            }
            if (avoid[E.constants.routeAvoidHighway]) {
                url += '&avoid=highway';
            }
            if (avoid[E.constants.routeAvoidFerry]) {
                url += '&avoid=ferry';
            }
        }

        if (prefShortest) {
            url += '&pref=shortest';
        }

        return url;
    }

    /** Create the url for  public transport
     *
     * @param from will have lat,lan,name(address)
     * @param to will have lat,lan,name(address)
     */
    function publicTransportUrl(from, to, region, date, time, authKey, routePath, avoid, arrive) {
        var url,
            path;

        path = routePath || E.constants.api.pubTrans.defaultPath;

        url = E.constants.api.pubTrans.baseUrl +
            E.constants.api.pubTrans.paths[path] +
            'originCoordLat=' + from.lat + '&' +
            'originCoordLong=' + from.lon + '&' +
            'originCoordName=' + from.name.encodeUtf8() + '&' +
            'destCoordLat=' + to.lat + '&' +
            'destCoordLong=' + to.lon + '&' +
            'destCoordName=' + to.name.encodeUtf8() + '&' +
            'date=' + date + '&' +
            'time=' + time + '&' +
            'authKey=' + authKey + '&' +
            'format=json' + '&' +
            'lang=' + region;

        if (avoid) {
            for (a in avoid) {
                url += '&use' + a.capitalise() + '=0';
            }
        }

        if (arrive) {
            url += '&searchForArrival=1';
        }

        return url;
    }

    /**
     *
     * @param location
     * @param maxNo - maximum number of stations
     * @return {url string}
     */

    function nearbyStationsUrl(pos, maxNo, region, authKey) {
        var url,
            path;

        url = E.constants.api.pubTrans.baseUrl +
            E.constants.api.pubTrans.paths['nearByStops'] +
            '&originCoordLong=' + pos.lon +
            '&originCoordLat=' + pos.lat +
            '&maxNo=' + maxNo +
            '&authKey=' + authKey +
            '&format=json' +
            '&lang=' + region;
        return url;
    }

    /**
     *
     * @param station
     * @param region
     * @param date
     * @param time
     * @param authKey
     * @param path
     * @param success
     * @param error
     * @return {String}
     */
    function publicStationUrl(stationId, direction, region, date, time, authKey, stationPath, avoid) {
        var url,
            path;

        path = stationPath || E.constants.api.pubTrans.defaultTravelType;
        // NOT WORKING:
        //http://hafas.websrv05.reiseinfo.no/bin/dev/nri/rest.exe/vs_nordeca/v1.0/departureBoard?id=50037&&jsonpCallback=?
        //http://hafas.websrv05.reiseinfo.no/bin/dev/nri/rest.exe/vs_nordeca/v1.0/departureBoard?id=50037&

        //http://hafas.websrv05.reiseinfo.no/bin/dev/nri/rest.exe/v1.0/vs_nordeca/departureBoard?id=50037&date=2013-2-7&time=8:6&authKey=nor-1d4-7vr-h3a&encoding=utf-8&format=json&lang=no&jsonpCallback=_jqjsp&_1362640009277=
        url = E.constants.api.pubTrans.baseUrl +
            E.constants.api.pubTrans.paths[path] +
            'id=' + stationId +
            '&date=' + date +
            '&time=' + time + '&' +
            '&authKey=' + authKey +
            '&format=json' +
            '&lang=' + region;

        if (direction) {
            url += '&direction=' + direction;
        }

        if (avoid) {
            for (var i = 0, size = avoid.length; i < size; i++) {
                url += '&' + avoid[i] + '=0';
            }
        }

        return url;
    }

    /**
     * Creates an URL for querying the map API to get copyright information for
     * the maps.
     *
     * @param lon required.
     * @param lat required.
     * @param lod required.
     * @param width required.
     * @param height required.
     * @param region required.
     * @return an url for querying the map API with the specified parameters.
     */
    function makeCopyrightUrl(lon, lat, lod, width, height, region) {
        if (region === 'krak') {
            region = 'dk';
        }

        return E.constants.api.copyright.url +
            'profile=' + E.constants.api.user +
            '&key=' + E.constants.api.key +
            '&version=' + E.constants.api.copyright.version +
            '&country=' + region +
            '&index=ypgeo&phase=first&adjPx=0,0,0,0&pageSize=1' +
            '&center=' + lon + ',' + lat +
            '&viewPx=' + width + ',' + height +
            '&zoom=' + lod;
    }

    /**
     * Making supersearch url
     *
     * @param: searchWord
     * @param: region - country code: se, no, dk
     * @param: offset - Start index
     * @param: location - 'long' and 'lat'
     * @param: zoom - zoom level of the map ; ex: 8
     * @return Supersearch Url
     */
    function makeSuperSearchUrl(searchWord, region,  offset, indexes, location, zoom, geoArea, relevance) {
        var url,
            referer;

        referer = E.navigation.getReferer();

        if (E.util.number.isNumber(searchWord)) {
            searchWord = E.util.number.clean(searchWord);
            if (E.util.number.hasPrefix(searchWord)) {
                searchWord = E.util.number.standardisePrefix(searchWord);
            }
        }

        if (region === 'pl') {
            url = E.constants.api.superSearch.plUrl;
        } else {
            url = E.constants.api.superSearch.url;
        }

        url += 'profile=' + E.constants.api.superSearch.profile +
            '&rsid=' + E.locale.rsid +
            '&vid=' + E.logging.getVid() +
            '&key=' + E.constants.api.superSearch.key +
            '&version=' + E.constants.api.superSearch.version +
            '&phase=' + E.constants.api.superSearch.phase +
            '&adjPx=' + E.constants.api.superSearch.djPx +
            '&pageSize=' + E.constants.api.superSearch.pageSize +
            '&viewPx=' + E.constants.api.superSearch.viewPx +
            '&q=' + searchWord.encodeUtf8() +
            '&index=' + indexes +
            '&country=' + region;
        if (offset) {
            url += '&offset=' + offset;
        }
        if (location) {
            url += '&center=' + location;
        }
        if (relevance) {
            url += '&relevance=' + relevance;
        }
        if (geoArea) {
            url += '&geo_area=' + geoArea;
        } else {
            url += '&zoom=' + zoom;
            if (!offset &&
                indexes !== 'geo' &&
                indexes !== 'wp' &&
                parseInt(zoom) !== E.constants.map.minZoom) {
                url += '&autoExpand=true';
            }
        }

        if (referer) {
            url += '&r=' + referer;
        }

        if (window && window.location && window.location.href) {
            //we need the send the current url for sitecatalyst tracking
            url += '&g=' + window.location.href.encodeUtf8();
        }
        return url;

    }

    /**
     * This function is creating the URL for auto complete
     * @param searchWord
     * @param region
     * @return {String}
     */

    function makeAutoCompleteUrl(searchWord, region){
        var url;

        if (region === 'pl') {
            url = E.constants.api.autoComplete.plUrl;
        } else {
            url = E.constants.api.autoComplete.url;
        }
        url += 'version=' + E.constants.api.autoComplete.version +
            '&key=' + E.constants.api.superSearch.key +
            '&profile=' + E.constants.api.superSearch.profile +
            '&search_word=' + searchWord.encodeUtf8() +
            '&type=' +  E.constants.api.autoComplete.type +
            '&suggest_length=' +  E.constants.api.autoComplete.suggest_length +
            '&count=' +  E.constants.api.autoComplete.count +
            '&country=' + region;
        return url;
    }

    function makeReverseGeoUrl(location, distance, type, hits, region) {
        var url;

        if (region === 'pl') {
            url = E.constants.api.reverseGeo.plUrl;
        } else {
            url = E.constants.api.reverseGeo.url;
        }

        url += 'p=' + location +
            '&distance=' + distance +
            '&type=' + type +
            '&hits=' + hits +
            '&contentType=' + E.constants.api.reverseGeo.contentType +
            '&country=' + region;
        return url;
    }

    /**
     * Request the Super search Api and get the data
     *
     * @param url
     * @param success
     * @param error
     */
    function queryApiSuper(url, success, error) {
        $.ajax({
            url: url,
            dataType: 'json',
            success: success,
            error: error
        });
    }


    /**
     * Perform Super Search: Performs query for company, person and location
     * @note: index is sent as empty in initial search as the preference will be handled in backend
     *
     * @param category required. 0 = company, 1 = person, 2 = location
     * @param searchWord. searchWord or searchLocation is required.
     * @param searchLocation. searchWord or searchLocation is required.
     * @param region required. database to search in.
     * @param success callback function when all APIs have responded.
     */
    function searchResult(category, searchWord, searchLocation, region, success) {
        var result,
            superSearchUrl,
            index,
            zoom,
            geoArea,
            relevance;

        result = {};

        if (category === 0) {
            index = '';
            relevance = E.constants.api.relevanceString;
        } else if (category === 1) {
            index = "yp";
            relevance = E.constants.api.relevanceString;
        } else if (category === 2) {
            index = "wp";
        } else if (category === 3) {
            index = "geo";
        }

        relevance = relevance || E.constants.api.relevanceString;

        zoom = E.util.getUrlVars().zoom || E.constants.map.defaultZoom;
        geoArea = E.util.getUrlVars().geoArea;
        geoArea = geoArea && geoArea !== '' ? geoArea : undefined;

        superSearchUrl = makeSuperSearchUrl(searchWord, region, 0, index, searchLocation, zoom, geoArea, relevance);

        function superSearching(data) {
            if (index === "yp" || (index === '' && data.apiMetaData.preferredIndex === 'yp')) {
                result.company = data;
            } else if (index === "wp" || (index === '' && data.apiMetaData.preferredIndex === 'wp')) {
                result.person = data;
            } else if (index === "geo" || (index === '' && data.apiMetaData.preferredIndex === 'geo')) {
                result.location = data;
            }

            if (!result.company) {
                result.company = {};
            }
            if (!result.person) {
                result.person = {};
            }
            if (!result.location) {
                result.location = {};
            }

            result.company.totalHits = data.search.yp && data.search.yp.totalHits ?
                data.search.yp.totalHits : data.apiMetaData.numberOfYellowHits || 0;
            result.person.totalHits = data.search.wp && data.search.wp.totalHits ?
                data.search.wp.totalHits : data.apiMetaData.numberOfWhiteHits || 0;
            result.location.totalHits = data.search.geo && data.search.geo.totalHits ?
                data.search.geo.totalHits : data.apiMetaData.numberOfGeoHits || 0;

            result.totalHits = result.company.totalHits + result.person.totalHits + result.location.totalHits;

            complete();
        }

        function complete() {
            success(result);
        }

        queryApiSuper(superSearchUrl, superSearching, defaultCommError);
    }

    return {
        /**
         * Performs a search on the company, person and location API .This
         * emulates the behaviour of a super-search on all APIs, that is, the
         * success function is called if and when all 3 APIs responds. This
         * means that the search either fails or passes as a whole. If for
         * example the company and person search would succeed but the location
         * search would fail, the search as a whole would fail. The reason for
         * this is that this function is a temporary fix until we get the super
         * search functionality.
         *
         * @param searchWord either searchWord or searchLocation is required
         * @param searchLocation either searchWord or searchLocation is
         * required
         * @param region reqired
         * @param success required. callback function when all APIs have
         * responded with success  this function is sent an object containing
         * the query (searchWord, searchLocation, region) as well as the data
         * for all 3 searches.
         * @param error optional.
         *
         * @return function to abort the api call. This is used if the search
         * takes too long time to give the user the ability to abort the call.
         *
         * */
        search: function (searchWord, searchLocation, region, success, error, relevance) {

            var response,
                request,
                superSearchUrl;

            relevance = relevance || E.constants.api.relevanceString;
            superSearchUrl = makeSuperSearchUrl(searchWord, region, 0, '', searchLocation, E.constants.map.defaultZoom, null, relevance);

            response = {};
            response.query = {
                searchWord: searchWord,
                searchLocation: searchLocation,
                region: region
            };

            function complete() {
                success(response);

            }
            request = queryApiSuper(superSearchUrl, function (data) {
                response.superSearchData = data;
                complete();
            }, error);

        },

        superResult: searchResult.curry(0),
        companyResult: searchResult.curry(1),
        personResult: searchResult.curry(2),
        locationResult: searchResult.curry(3),

        makeSuperSearchUrl: makeSuperSearchUrl,
        makeCompanyUrl: makeCompanyUrl,
        makeCompanyProximityUrl: makeCompanyProximityUrl,
        makePersonUrl: makePersonUrl,
        makeLocationUrl: makeLocationUrl,
        makeReverseGeoUrl: makeReverseGeoUrl,
        queryReverseGeo: queryApi,
        queryStatistics: queryApi,
        queryApiSuper: queryApiSuper,

        /**
         * Performing the Auto complete search for the text box in home page
         * @param searchWord
         * @param region
         * @param success
         * @param error
         */
        autoCompleteSearch: function (searchWord, region, success, error) {
            var Url,
                response,
                request,
                queryFunction;

            queryFunction = region === 'pl' ? queryApiSuper : queryApi;
            Url = makeAutoCompleteUrl(searchWord, region);
            response = {};
            response.query = {
                searchWord: searchWord,
                region: region
            };

            function complete() {
                success(response);

            }
            request = queryFunction(Url, function (data) {
                response.autoCompleteSearchData = data;
                complete();
            }, error);
        },

        /**
         * Performs a search against the infopage and review APIs.
         *
         * @param eniroId required
         * @param region required
         * @param success required. function called when both APIs have
         * responded with success.
         * @param error optional. generic error function defined in queryApi is
         * used if omitted.
         *
         */
        companyDetails: function (eniroId, region, success, error) {
            var infoUrl,
                reviewUrl,
                status,
                response,
                queryFunction;

            infoUrl = makeInfoUrl(eniroId, region);
            reviewUrl = makeReviewUrl(eniroId);

            status = {};
            response = {};

            function complete() {
                if (status.info &&
                    (status.review || region === 'pl' || region === 'dgs')) {
                    success(response);
                }
            }

            if (region === 'pl') {
                queryFunction = queryApiSuper;
            } else {
                queryFunction = queryApi;
            }

            queryFunction(infoUrl, function (data) {
                response.info = data;
                status.info = true;
                complete();
            }, error);

            if (region !== 'pl' && region !== 'dgs') {
                queryFunction(reviewUrl, function (data) {
                    if (data.adverts && data.adverts[0] && data.adverts[0].reviewData) {
                        response.review = data.adverts[0].reviewData;
                    }
                    status.review = true;
                    complete();
                }, error);
            }
        },

        /**
         * Performs a search against the person result API.
         *
         * @param recordId required.
         * @param region required.
         * @param success required. function called when the api has responded
         * with a valid response.
         * @param error optional. function that's called if the API call fails.
         */
        personDetails: function (recordId, region, success, error) {
            var url;

            url = makePersonDetailUrl(null, null, recordId, region);

            function complete(data) {
                if (data.records && data.records.length) {
                    success(data.records[0]);
                }
            }

            queryApi(url, complete, error);
        },

        /**
         * Performs a search against the company proximity search. This fetches
         * no meta-data (number of hits) as a proximity search can only be made
         * once a regular company search is already made.
         *
         * @param searchWord at least one of searchWord and searchLocation is
         * required.
         * @param searchLocation at least one of searchWord and searchLocation
         * is required.
         * @param location required. {lon, lat}
         * @param region required.
         * @param success required. callback when the api responds with success
         * @param error optional. callback when the api call fails.
         */
        companyProximity: function (searchWord, searchLocation, location,
                                    region, success, error) {

            var url;

            url = makeCompanyProximityUrl(searchWord, searchLocation,
                location, region);

            queryApi(url, success, error);
        },

        /**
         * Performs a search against the route API.
         *
         * @param from required. location object {lon, lat} containing the
         * coordinates of the from-destination.
         * @param to required. location object {lon, lat} containing the
         * coordinates of the to-destination.
         * @param prefShortest optional. if set, the rout search will go for
         * shortest route, rather than default (fastest).
         * @param avoid optional. object containing features to avoid, example:
         * {ferry: true, toll: true, highway: false}
         * @param success required. callback when the api responds with
         * success.
         * @error error optional. callback when the api call fails.
         */
        routeSearch: function (from, to, prefShortest, avoid, success, error) {
            var url;

            url = makeRouteUrl(from, to, avoid, prefShortest);

            queryApi(url, success, error);
        },
        loadHtml: loadHtml,

        /**
         *
         * @param from object with name, lat and long coordinates
         * @param to object with name, lat and long coordinates
         * @param region string 'no'
         * @param date string year-month-day
         * @param time string hours:minutes
         * @param authKey string unique API key
         * @param path string which API path to call
         * @param success function to call if successful API request
         */
        publicTransSearch: function (from, to, region, date, time, authKey, path, avoid, arrive, success, error) {

            var url;

            error = error || defaultCommError;
            url = publicTransportUrl(from, to, region, date, time, authKey, path, avoid, arrive);
            url += '&jsonpCallback=?';

            function completePubTrans(data) {
                //reverse triplist array in case we use arrival as we want to display
                //latest possible arrival first
                if (arrive && data && data.TripList && data.TripList.Trip) {
                    data.TripList.Trip = data.TripList.Trip.reverse();
                }
                success(data);
            }

            $.jsonp({
                cache: false,
                url: url,
                success: completePubTrans,
                error: error,
                contentType: 'application/x-www-form-urlencoded;charset=ISO-8859-1'
            });
        },

        publicStationSearch: function (stationId, direction, region, date, time, authKey, path, avoid, success, error) {
            var url;

            error = error || defaultCommError;
            url = publicStationUrl(stationId, direction, region, date, time, authKey, path, avoid, success, error);
            url += '&jsonpCallback=?';

            function completePubStation(data) {
                success(data);
            }

            $.jsonp({
                cache: false,
                url: url,
                success: completePubStation,
                error: error
            });
        },

        /**
         *
         * @param pos required
         * @param maxNo required
         */

        nearbyStationsSearch: function (pos, maxNo, region, authKey, success, error) {
            var url;

            error = error || defaultCommError;
            url = nearbyStationsUrl(pos, maxNo, region, authKey, success, error);
            url += '&jsonpCallback=?';

            function completeNearbyStations(data) {
                success(data);
            }

            $.jsonp({
                cache: false,
                url: url,
                success: completeNearbyStations,
                error: error
            });
        },



        /**
         * Performs a search against the map API to get copyright information
         * for the part of the map visible on the screen.
         *
         * The map information is returned as a (possibly empty) array of
         * names. These are the names of the copyright owners and should be
         * displayed on the map.
         *
         * @param lon required.
         * @param lat required.
         * @param lod required. level of details for the map.
         * @param width required. width of screen
         * @param height required. width of screen.
         * @param callback
         */
        queryCopyright: function (lon, lat, lod, width, height, callback) {
            var url;

            url = makeCopyrightUrl(lon, lat, lod, width, height, E.locale.region);

            function complete(data) {
                var arr,
                    d;

                if (data && data.maptypes) {
                    d = data.maptypes.map;
                    arr = (d && d.map(function (o) {
                        if (o.text) {
                            return o.text;
                        }
                    }).removeUndefined()) || [];

                    callback(arr);
                }
            }

            //queryApiSuper(url, complete);
        },

        getOnlineBaseUrl: function () {
            if (E.navigation.getCurrentPage() === E.page.name.companyDetails) {
                return 'http://' +
                    [E.locale.urlParts.companyProfileSubhost].concat(document.location.host.split('.').slice(1)).join('.');
            } else if (E.navigation.getCurrentPage() === E.page.name.personDetails) {
                return 'http://' +
                    [E.locale.urlParts.personProfileSubhost].concat(document.location.host.split('.').slice(1)).join('.');
            }

            return 'http://' +
                ['www'].concat(document.location.host.split('.').slice(1)).join('.');
        },

        goToFullWebsite: function () {
            location.href = this.getOnlineBaseUrl() + E.navigation.getOnlineUrlPath();
        },

        getMapVersion: function (mapType, callback, error) {
            queryApi(E.constants.api.mapVersion.url + 'type=' + mapType +'&contentType=json', callback, error);
        },

        queryCategories: function (callback) {
            $.get('categories/cat_' + E.locale.region + '.json', callback);
        },

        categorySearch: function(searchWord, searchLocation, region, relevance, success, error) {
            var response,
                request,
                superSearchUrl;

            superSearchUrl = makeSuperSearchUrl(searchWord, region, 0, '', searchLocation, E.constants.map.defaultZoom, null, relevance);

            response = {};
            response.query = {
                searchWord: searchWord,
                searchLocation: searchLocation,
                region: region
            };

            function complete() {
                success(response);

            }
            request = queryApiSuper(superSearchUrl, function (data) {
                response.superSearchData = data;
                complete();
            }, error);
        },

        geoSuggest: function (name, hits, success, error) {
            var url;

            hits = hits || E.constants.api.route.noSuggestions;
            error = error || defaultCommError();

            function complete(data) {
                success(data);
            }

            if (name && success) {
                url = E.constants.api.route.suggestUrl +
                    '&country=' + E.locale.region +
                    '&name=' + name +
                    '&type=any' +
                    '&contentType=json' +
                    '&hits=' + hits;

                queryApi(url, complete, error);
            }
        }
    };
}());
