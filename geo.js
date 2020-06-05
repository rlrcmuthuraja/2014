/**
 * Contains functions and data for the geolocation of the device.
 *
 * @requires augmentation.js
 * @requires before requesting the geo position, the map should be loaded.
 *
 */

E.geo = (function () {
    var location,
        lon,
        lat,
        hasBogusPos,
        geoArea;

    /**
     * Returns a location object {lon, lat} if the geolocation is known or a
     * falsy value if not.
     */
    function getPos() {
        if (lon && lat) {
            return {
                lon: lon,
                lat: lat
            };
        }
    }

    /**
     * This function is run when the geolocation becomes know. As pages using
     * geolocation checks for it when they generate their data this is for
     * updating pages that are already generated. This is what it does:
     *
     * Search page: map is loaded with current pos in background.
     * Company result page: update distances for results that have a location.
     *
     * Adds a poi to the map. NOTE: this can be done even if the map is not yet
     * visible.
     *
     */
    function getsGeo() {
        var currentPage;
        E.map.setGpsPoi({lon: lon, lat: lat});

        currentPage = E.navigation.getCurrentPage();

        if (E.map.hasMap() !== true &&
            (currentPage === E.page.name.search ||
                currentPage === E.page.name.companyResult ||
                currentPage === E.page.name.companyDetails ||
                currentPage === E.page.name.personResult ||
                currentPage === E.page.name.companyDetails ||
                currentPage === E.page.name.locationResult)) {
            E.map.setPosition(lon, lat);
            if (currentPage !== E.page.name.search) {
                E.display.content.showToggle();
            }
        }
        if (currentPage === E.page.name.companyResult) {
            E.companyResult.updateDistances(getPos());
            E.display.content.menu.result.showProximity();
        }
        if (currentPage === E.page.name.routeSearch) {
            E.routeSearch.getsGeo();
        }
    }

    /**
     * Requests access to the device geolocation and updates lon/lat. If and
     * when the location is shared, lon/lat are updated and callback is run
     *
     * @param callback required.
     */
    function requestGeo(callback, errorCallback) {
        function complete(pos) {
            lon = pos.coords.longitude;
            lat = pos.coords.latitude;

            requestReverseGeo(lon + ',' + lat, E.constants.api.reverseGeo.distance);
            if (E.util.inArray(E.navigation.getCurrentPage(),
                [
                    E.page.name.companyResult,
                    E.page.name.personResult,
                    E.page.name.locationResult
                ]
            )) {
                E.map.setDisplayBoundingBox();
            }

            callback(lon, lat);
        }

        navigator.geolocation.getCurrentPosition(complete, errorCallback,
            {enableHighAccuracy: true});
    }

    function getReverseGeo() {
        return E.geo.geoArea;
    }

    function requestReverseGeo(location, distance) {
        var reverseGeoUrl;

        function reverseGeoSuccess(response) {
            E.geo.geoArea = response;
        }

        function reverseGeoError(err) {
            console.log(err);
        }

        if (location) {
            distance = distance || E.constants.api.reverseGeo.distance;
            reverseGeoUrl = E.comm.makeReverseGeoUrl(location, distance,
                E.constants.api.reverseGeo.type,
                E.constants.api.reverseGeo.hits,
                E.locale.langCode);
            E.comm.queryReverseGeo(reverseGeoUrl, reverseGeoSuccess, reverseGeoError);
        }
        return geoArea;
    }

    return {
        /**
         * @return true iff geolocation is available.
         */
        hasGeo: function () {
            return (lon && lat) !== undefined;
        },

        /**
         * Function for making the initial request of the device geolocation.
         *
         * @requires the page must be loaded when this is called, so this
         * should be called in page_init.js
         */
        request: requestGeo.curry(getsGeo),

        /**
         * See private function getPos for documentation.
         */
        getPos: getPos,
        /**
         * @return the longitude of the device, or a falsy value if not
         * available.
         */
        getLon: function () {
            return lon;
        },

        /**
         * @return the latitude of the device, or a falsy value if not
         * available.
         */
        getLat: function () {
            return lat;
        },

        setBogusPos: function (longitude, latitude) {
            hasBogusPos = true;
            lon = longitude;
            lat = latitude;

            function noop() {}

            getsGeo();
            E.geo.request = noop;
            E.geo.refresh = noop;
            E.mapPage.localise = noop;
        },

        /**
         * Should be used when refreshing existing geolocation. For the
         * initial request, request() should be used.
         *
         * For details see private function requestGeo
         */
        refresh: requestGeo,

        /**
         * Returns a json object with location details from a longlat string
         */
        getReverseGeo: getReverseGeo.curry(),

        getMunicipality: function () {
            var reverseGeo = getReverseGeo(),
                geoCodingResponse;
            if (reverseGeo && reverseGeo.search.geocodingResponse.locations) {
                geoCodingResponse = reverseGeo.search.geocodingResponse.locations.first();
                return (E.locale.region === 'pl' ? geoCodingResponse.city : geoCodingResponse.municipality) || '';
            }
            return undefined;
        }
    };
}());
