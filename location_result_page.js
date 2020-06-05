/**
 * Contains data and functions specific to the location result page.
 *
 * @requires result.js
 */

E.locationResult = {
    /**
     * Populates the result list. This should only be called if the page is
     * loaded directly (i.e. not as a result of a search from the main
     * search page). For more details, see E.result.populate.
     */
    populate: E.result.populate.curry(
        E.translate.locationResult,
        function (data) { return data.location.search.geo.totalHits || 1; },
        function (data) { return data.location.search.geo.features || [data.location.search.geo]; },
        E.generate.locationResult,
        E.comm.locationResult,
        E.refresher.bindLocation
    ),

    /**
     * Moves the map to the specified coordinates, places a location poi and
     * toggles down the page content to show the map.
     *
     * @param lon required.
     * @param lat required.
     */
    showMap: function (lon, lat) {
        E.map.clear();
        E.map.setPosition(lon, lat);
        E.map.addLocationPoi({lon: lon, lat: lat}, E.toggle.up);
        E.toggle.down();
    }
};

E.result.addLoaderObject(E.locationResult);
