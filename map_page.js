E.mapPage = (function () {
    var requestingGps;

    return {
        /**
         * Loads the map at locations specified at url parameters if the url
         * parameters are set. if not, the url parameters are set to the
         * current map position. if neither of these are the case, there is
         * nothing to show on the map page so the page is redirected to the
         * search page.
         */
        init: function () {
            var urlVars,
                lon,
                lat,
                zoom,
                mapPos;

            urlVars = E.util.getUrlVars();
            lon = parseFloat(urlVars.lon, 10);
            lat = parseFloat(urlVars.lat, 10);
            zoom = parseFloat(urlVars.zoom, 10);

            mapPos = E.map.getPos();

            if (lon && lat && zoom) {
                E.map.setPosition(lon, lat, zoom);
            } else if (mapPos) {
                location.hash = E.makeUrl.map(mapPos.lon, mapPos.lat, mapPos.zoom);
            } else {
                location.hash = E.page.name.search;
            }
        },
        /**
         * Renews the geolocation. This function blocks itself so that only one
         * request happens at a time. When the new geolocation is found, the
         * gps poi is placed and the map is centered around it.
         */
        localise: function () {
            function getsGeo(lon, lat) {
                E.map.setPosition(lon, lat, 5);
                E.map.setGpsPoi({lon: lon, lat: lat});
                requestingGps = false;
            }

            if (!requestingGps) {

                requestingGps = true;
                E.map.removeGpsPoi();

                E.geo.refresh(getsGeo);
            }
        }
    };
}());
