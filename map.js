/**
 * Functions for displaying the map. This includes initialising, setting and
 * getting current map position and drawing pois.
 *
 * Most pois are meant to be removed whenever new pois are to be drawn, however
 * the gps poi will only be removed when the position changes and the poi is
 * redrawn somewhere else. Because of this, all pois except the gps pois is
 * stored in a common array, while the gps poi is stored in its own variable.
 *
 * @requires E.locale (sweden.js, norway.js or denmark.js)
 */

/*global document */
/*global myVR */
/*global window */

E.map = (function () {
    var map,
        renderer,
        overlay,
        previousTime,
        gpsPoi,
        tempPoiList,
        tempPoiPositions,
        hasMap,
        addGpsPoi,
        addFromPoi,
        addToPoi,
        mapVersion,
        currentMapType,
        maxPos,
        minPos,
        converter;

    tempPoiList = [];
    tempPoiPositions = [];
    mapTypes = ['map', 'aerial', 'hybrid', 'nautical'];

    function renderCallback() {
        var currentTime,
            delta;

        currentTime = new Date();
        currentTime -= 0; // force to integer representation.

        delta = (currentTime - previousTime) / 1000;
        previousTime = currentTime;

        map.update(delta);
        map.render();
        overlay.render();
    }

    function getPos() {
        var pos,
            lon,
            lat,
            zoom;

        pos = map.getLongLat();
        lon = pos[0];
        lat = pos[1];
        zoom = map.zoom;

        if (lon && lat && zoom) {
            return {
                lon: lon,
                lat: lat,
                zoom: zoom
            };
        }
    }

    function updateZoomPosition() {
        var pos,
            lod,
            width,
            height;

        pos = getPos();
        lod = map.converter.getLodForZoom(pos.zoom);
        width = map.renderer.canvas.width;
        height = map.renderer.canvas.height;
    }

    function moveFinishedCallback() {
        var pos;

        pos = getPos();

        if (pos) {
            updateZoomPosition();
            if (E.navigation.getCurrentPage() === E.page.name.map) {
                location.hash = E.makeUrl.map(pos.lon, pos.lat, pos.zoom);
            }
        }
    }

    /**
     * Sets the map position, and optionally, the zoom.
     *
     * @param lon required.
     * @param lat required.
     * @param zoom optional.
     */
    function setPosition(lon, lat, zoom) {
        zoom = zoom || (map && map.zoom) || E.constants.map.defaultZoom;

        map.setPosition(Number(lon), Number(lat), zoom, E.constants.map.zoomTime);
        map.requestRender();
    }

    /**
     * Function called when the map is first initialised (gets a position). This
     * is the part of the code that should call functions for changing the page
     * to display the map in the background.
     */
    function getsMap() {
        hasMap = true;
        E.display.showMap();
        switch (E.navigation.getCurrentPage()) {
        case E.page.name.companyDetails:
        case E.page.name.routeResult:
            E.display.content.showToggle();
            break;
        }
    }

    /**
     * Adds a poi on the map with an optional callback function when the poi is
     * clicked.
     *
     * @param image required. image {url, pos}
     * @param isGps required. tells if the poi should be treated as the gps poi
     * or not.
     * @param pos required. {lon, lat} in map coordinates.
     * @param onClick optional. callback when poi is clicked.
     */
    function addPoi(image, isGps, pos, onClick) {
        var style,
            poiHandler;

        if (image.pos === 0) {
            style = {x: 'center', y: 'center'};
        } else if (image.pos === 1) {
            style = {x: 'center', y: 'bottom'};
        }

        poiHandler = map.addPoi(Number(pos.lon), Number(pos.lat), image.url,
            onClick, null, null, style).id;

        if (isGps) {
            gpsPoi = poiHandler;
        } else {
            tempPoiList.push(poiHandler);
            tempPoiPositions.push(pos);
        }

		return poiHandler;
    }

    addGpsPoi = addPoi.curry(E.locale.poiImages.gps, true);
    addFromPoi = addPoi.curry(E.locale.poiImages.from, false);
    addToPoi = addPoi.curry(E.locale.poiImages.to, false);

    function changeMapType(mapType) {
        currentMapType = mapType;
        map.setServerType(mapType);
        E.display.toggleMainMenu();

    }

    function setMaxMinPos(poiPos) {
        if (maxPos === undefined) maxPos = poiPos;
        if (minPos === undefined) minPos = poiPos;

        if (E.util.lesserFloat(maxPos['lon'], poiPos["lon"])) {
            maxPos = {lon: poiPos.lon, lat: maxPos.lat};
        }

        if (E.util.lesserFloat(maxPos['lat'], poiPos['lat'])) {
            maxPos = {lon: maxPos.lon, lat: poiPos.lat};
        }
        if (E.util.greaterFloat(minPos['lon'], poiPos["lon"])) {
            minPos = {lon: poiPos.lon, lat: minPos.lat};
        }
        if (E.util.greaterFloat(minPos['lat'], poiPos['lat'])) {
            minPos = {lon: minPos.lon, lat: poiPos.lat};
        }
    }

    return {
        /**
         * Sets up the map. This includes binding it to a html-element, setting
         * the style of the scale indicator as well as all necessary binding
         * the event handlers and calling general setup functions for the map.
         * For details, consult documentation for myVR maps.
         */
        init: function () {
            //requestMapVersion();
            //hardcoding the map version for now
            mapVersion = '20121204';

            var element,
                scaleIndicator,
                touchElement,
                opt;

            previousTime = new Date();
            previousTime -= 0;

            element = document.getElementById('map');
            renderer = new myVR.mRendererCanvas(element,
                {defaultTile: 'images/default.png'});

            opt = {};
            opt.isRetina = true;
            converter = new myVR.mConverterEniro(opt);

            map = new myVR.mMap({
                useCaching: true,
                cacheSize: 200,
                maxZoom: E.constants.map.maxZoomOut,
                minZoom:E.constants.map.minZoomIn});
            overlay = new myVR.mOverlay(map);

            scaleIndicator = new myVR.mScaleIndicator(overlay,
                map,
                { right: 40, bottom: 60 },
                {lineWidth: 1.0, fillStyle: '#000000',
                    lineCap: 'round', lineJoin: 'round'},
                {font: '11px arial,sans-serif'},
                10,
                64,
                [6, 6, 6, 6]);
            overlay.addOverlayItem(scaleIndicator);

            map.setRenderer(renderer);
            overlay.setRenderer(renderer);

            map.setConverter(converter);

            map.setRenderCallback(renderCallback);
            map.moveFinishedCallback = moveFinishedCallback;

            touchElement = document.getElementById('map_controller');

            map.inputHandler = new myVR.inputHandler(map, touchElement, {enableSafariIosTouchEvents: true});
            map.setLodForZoomSub(0);

            window.onresize = function () {
                map.resize(document.documentElement.clientWidth, document.documentElement.clientHeight);
                map.requestRender();
            };
            window.onresize();

            function withTileVersion(ver) {
                if (ver) {
                    opt.mapVersion = ver;
                    converter = new myVR.mConverterEniro(opt);
                    map.setConverter(converter);
                    map.setLodForZoomSub(0);
                    window.onresize();
                }
            }

            currentMapType = currentMapType || 0;
            E.comm.getMapVersion(mapTypes[currentMapType], withTileVersion);
        },

        /**
         * The first time this function is called is when the map gets visible.
         * When this happens, mapInit will be called after the position is set.
         * Later calls will just set the position. For more details, see
         * private function setPosition.
         */
        setPosition: function (lon, lat, zoom) {
            setPosition(Number(lon), Number(lat), zoom);
            getsMap();
            E.map.setPosition = setPosition;
        },

        /**
         * Zooms in the map.
         */
        zoomIn: function () {
            map.zoomIn(E.constants.map.zoomMultiplier, E.constants.map.zoomTime);
        },

        /**
         * Zooms out the map.
         */
        zoomOut: function () {
            map.zoomOut(E.constants.map.zoomMultiplier, E.constants.map.zoomTime);
        },
        getPos: getPos,
        addStationPoi: addPoi.curry(E.locale.poiImages.location, false),
        addCompanyPoi: addPoi.curry(E.locale.poiImages.company, false),
        addPersonPoi: addPoi.curry(E.locale.poiImages.person, false),
        addLocationPoi: addPoi.curry(E.locale.poiImages.location, false),

        /**
         * If the gps poi is already set, it's moved (deleted and created
         * again). If not, it's created.
         *
         * @param pos required. {lon, lat} position of the gps poi in map
         * coordinates
         */
        setGpsPoi: function (pos) {
            if (gpsPoi) {
                map.removePoi(gpsPoi);
            }
            addGpsPoi(pos);
        },

        /**
         * Removes the gps poi if it exists.
         */
        removeGpsPoi: function () {
            if (gpsPoi) {
                map.removePoi(gpsPoi);
            }
        },

		/**
         * Removes the single Poi.
         */
        removePoi: function (id) {
            map.removePoi(id);
        },


        /**
         * Remove all pois except the gps poi.
         */
        clear: function () {
            while (tempPoiList.length) {
                map.removePoi(tempPoiList.pop());
            }
            tempPoiPositions = [];
            maxPos = minPos = undefined;
            map.removeAllLines();
        },

        /**
         * function to zoom map to fit a max and min position
         * mainly for displaying all POIs in a result list
         */
        setDisplayBoundingBox: function () {
            // @TODO: disable setting bounding box until performance issues are fixed
            return;

            var poisLength,
                offsetDelta,
                deltaX,
                deltaY;

            poisLength = tempPoiPositions.length;
            offsetDelta = 1.01;

            for (var i = 0; i < poisLength; i++) {
                setMaxMinPos(tempPoiPositions[i]);
            }

            if (maxPos && minPos) {
                deltaX = (converter.getPositionFromLongLat(maxPos.lon, maxPos.lat)[0] -
                    converter.getPositionFromLongLat(minPos.lon, minPos.lat)[0]) /
                    (document.documentElement.clientWidth - 90) / 400;
                deltaY = (converter.getPositionFromLongLat(maxPos.lon, maxPos.lat)[1] -
                    converter.getPositionFromLongLat(minPos.lon, minPos.lat)[1]) /
                    (document.documentElement.clientHeight - 90) / 400;
                map.setDisplayBoundingBox(
                    {longitude: (minPos.lon - deltaX), latitude: (minPos.lat - deltaY)},
                    {longitude: (maxPos.lon + deltaX), latitude: (maxPos.lat + deltaY)},
                    2
                );
            }

            tempPoiPositions = [];
        },


        /**
         * Draws the line for a route and the from- and to-poi at the beginning
         * and end of it.
         *
         * @param coords required. non-empty array of {longitude, latitude}
         */
        drawRoute: function (coords) {
            var first,
                last,
                style;

            style = {
                lineWidth: 8,
                strokeStyle: '#0066ff',
                lineCap: 'round',
                lineJoin: 'round'
            };

            first = coords.first();
            first = {
                lon: first.longitude,
                lat: first.latitude
            };

            last = coords.last();
            last = {
                lon: last.longitude,
                lat: last.latitude
            };

            map.addLine(coords, style);
            addFromPoi(first);
            addToPoi(last);
        },

        /**
         * Determines if p1 and p2 are close enough to be considered the same
         * position.
         *
         * @param p1 required.
         * @param p2 required.
         * @return true if p1 and p2 are close enough to be considere the same
         * position, a falsy value otherwise.
         */
        coordsEqual: function (p1, p2) {
            var epsilon = 0.001; // This is a decent epsilon. feel free to tweak.

            return (p1 && p2 && (p1.lon - p2.lon).abs() < epsilon &&
                (p1.lat - p2.lat).abs() < epsilon);
        },
        /**
         * Determines if one z1 and z2 are zoom values that are similar enough
         * so that they can be considered equal.
         * @param z1
         * @param z2
         */
        zoomEqual: function (z1, z2) {
            var epsilon = 0.01;

            return (1 - (z1 / z2)).abs() < epsilon;

        },
        hasMap: function () {
            return hasMap;
        },
        /* serverType 0 : Vector, 1 : Aerial, 2 : Hybrid, 3 : Nautical */
        vectorMap: function () {
            if (E.elements.mainMenu.mapTypes.vector.hasClass('selected') === false) {
                $('a', E.elements.mainMenu.mapTypes.main).removeClass('selected');
                E.elements.mainMenu.mapTypes.vector.addClass('selected');
                changeMapType(0);
            }
        },
        aerialMap: function () {
            if (E.elements.mainMenu.mapTypes.aerial.hasClass('selected') === false) {
                $('a', E.elements.mainMenu.mapTypes.main).removeClass('selected');
                E.elements.mainMenu.mapTypes.aerial.addClass('selected');
                changeMapType(1);
            }
        },
        hybridMap: function () {
            if (E.elements.mainMenu.mapTypes.hybrid.hasClass('selected') === false) {
                $('a', E.elements.mainMenu.mapTypes.main).removeClass('selected');
                E.elements.mainMenu.mapTypes.hybrid.addClass('selected');
                changeMapType(2);
            }
        },
        nauticalMap: function () {
            if (E.elements.mainMenu.mapTypes.nautical.hasClass('selected') === false) {
                $('a', E.elements.mainMenu.mapTypes.main).removeClass('selected');
                E.elements.mainMenu.mapTypes.nautical.addClass('selected');
                changeMapType(3);
            }
        },
        /**
         * If no geo received from client, we set the default locale pos and zoom
         */
        setDefaultCountryPos: function () {
            E.map.setPosition(
                E.constants.map.pos[E.locale.region].lon,
                E.constants.map.pos[E.locale.region].lat,
                E.constants.map.pos[E.locale.region].zoom
            );
        }
    };
}());

