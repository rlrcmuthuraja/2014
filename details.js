E.details = {
    /**
     * Populates a details page, and if the person/company has a location, also
     * moves the map.
     *
     * @param commFunc required. Function for querying the API.
     * @param translateFunc required. Function for translating the API response
     * @param generateFunc required. Function for generating html from the
     * translated API response.
     * @param region required.
     * @param id required. eniroId/recordId
     * @param additional optional. function to call to carry out additional
     * steps at the end of the functon. this function is sent the translated
     * api object. (the company and person details page generation is almost
     * identical, but this allows for small differences between them).
     */
    populate: function (commFunc, translateFunc, generateFunc, id, region, additional) {

        function complete(data) {
            var obj,
                html,
                loc;

            obj = translateFunc(data);
            E.navigation.setOnlineUrlDetail(obj);

            loc = obj.location;

            html = generateFunc(obj, region);
            E.loader.hide();
            E.elements.content.list.html(html);

            if (additional && typeof additional === 'function') {
                additional(obj, data);
            }
        }

        if (id) {
            E.loader.show();
            commFunc(id, region, complete);
        } else {
            location.hash = E.page.name.search;
        }
    },
    /**
     * Shows a clickable poi on the map at the specified coordinates. The
     * appearance of the map depends on type. The map is moved and zoomed if
     * needed.
     * @param lon required.
     * @param lat
     * @param type
     * @param zoom
     */
    showMap: function (lon, lat, type, zoom) {
        var pos,
            mapPos;

        E.map.clear();

        pos = {
            lon: lon,
            lat: lat
        };

        mapPos = E.map.getPos();
        zoom = zoom || /*E.map.getZoom() || */ E.constants.map.defaultZoom;

        if (!E.map.coordsEqual(pos, mapPos) ||
                !E.map.zoomEqual(zoom, mapPos.zoom)) {
            E.map.setPosition(lon, lat, zoom);
        }

        if (type === 'company') {
            E.map.addCompanyPoi(pos, function () {
                E.toggle.up();
                E.logging.logPOI(E.util.getUrlVars().eniroId);
            });
        } else if (type === 'person') {
            E.map.addPersonPoi(pos, E.toggle.up);
        }
        E.toggle.down();
    }

};
