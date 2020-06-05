
E.nearByStations = (function () {
    var currentPoi;
//    function exitFunc() {
//        E.display.content.menu.showDetails();
//    }

    function bindFunc () {
        E.routeResult.startRouteTimer();
        $('#alternate_public_route_button').on('click', function () {
            event.preventDefault();
            location.hash = $(this).attr('href');
            E.navigation.forcePageChange();
        });
    }

    function unbindFunc () {
        E.routeResult.stopRouteTimer();
        $('#alternate_public_route_button').off('click');
    }

    return {
        populate: function () {
            var pos,
                urlVars,
                maxNo,
                stops,
                html;

            urlVars = E.util.getUrlVars();

            pos = {
                lat: urlVars.lat,
                lon: urlVars.lon
            }

            maxNo = 10;

//            E.navigation.setOnExit(exitFunc);


            function complete(data) {
                stops = E.translate.nearbyStations(data);

                if (stops) {
                    html = E.generate.nearbyStations(stops, pos);
                    E.elements.content.list.html(html);
                }

            }


            E.comm.nearbyStationsSearch(pos, maxNo, E.locale.region, E.constants.api.pubTrans.authKey, complete);
        },

        populateStationDepartures: function () {
            var urlVars,
                date,
                obj,
                routeResult,
                destObj,
                origObj;

            //#publicStation&stopId=52584&direction=27465&stopLat=59.867322&stopLon=10.840073&toName=Bergen&toLat=60.392984&toLon=5.324149&isTrip=1

            urlVars = E.util.getUrlVars();
            date = E.util.formatDateTime((new Date()), null);
            routeResult = E.elements.content.menu.route.result;

            function complete(data) {
                console.log(data);
                obj = E.translate.pubStation(data);

                if (obj && Object.keys(obj).length > 0) {

                    //remove existing list elements for
                    $('li.station_departures', E.elements.list).remove();
                    $('li.station_departures_alternate', E.elements.list).remove();

                    if ((E.geo.hasGeo() || (urlVars.lat && urlVars.lon) ||
                            (urlVars.stopName && urlVars.stopLat && urlVars.stopLon))
                        &&
                        urlVars.stopLat && urlVars.stopLon) {

                        if (urlVars.toName && urlVars.toLat && urlVars.toLon) {
                            destObj = {
                                name: urlVars.toName,
                                lat: urlVars.toLat,
                                lon: urlVars.toLon
                            };

                        } else {
                            destObj = {
                                name: obj.departures[0].stop,
                                lat: urlVars.stopLat,
                                lon: urlVars.stopLon
                            };
                        }

                        if (urlVars.stopName && urlVars.stopLat && urlVars.stopLon) {
                            origObj = {
                                name: urlVars.stopName,
                                lat: urlVars.stopLat,
                                lon: urlVars.stopLon
                            }
                        } else {
                            origObj = {
                                name: E.locale.text.myPosition,
                                lat: E.geo.getLat() || urlVars.lat,
                                lon: E.geo.getLon() || urlVars.lon
                            }
                        }

                        //@TODO: Remove currentPoi
                        //if (currentPoi) {
                        //  E.map.clearPOI(currentPoi);
                        //}

                        E.map.clear();
                        if (urlVars.isTrip) {
                            currentPoi = E.map.addLocationPoi(origObj, E.toggle.up);
                            E.map.setPosition(origObj.lon, origObj.lat);
                        } else {
                            currentPoi = E.map.addLocationPoi(destObj, E.toggle.up);
                            E.map.setPosition(destObj.lon, destObj.lat);
                        }
                        E.display.content.showToggle();
                    }

                    html = E.generate.publicStationDepartures(obj.departures, destObj, origObj, urlVars.isTrip);
                    E.elements.content.list.html(html);

                    bindFunc();
                    E.navigation.setOnExit(unbindFunc);

                    E.display.showStationDepartures();
                    E.display.showResultList();
                } else if (obj && Object.keys(obj).length === 0) {
                    if (urlVars.stopName && urlVars.stopLat && urlVars.stopLon) {
                        origObj = {
                            name: urlVars.stopName,
                            lat: urlVars.stopLat,
                            lon: urlVars.stopLon
                        }
                    } else {
                        origObj = {
                            name: E.locale.text.myPosition,
                            lat: E.geo.getLat() || urlVars.lat,
                            lon: E.geo.getLon() || urlVars.lon
                        }
                    }

                    var html = E.generate.publicStationDepartures(null, null, null, false);
                    E.elements.content.list.html(html);

                    currentPoi = E.map.addLocationPoi(origObj, E.toggle.up);
                    E.map.setPosition(origObj.lon, origObj.lat);
                    E.display.showResultList();
                }
            }



            //publicStationSearch: function (stationId, direction, region, date, time, authKey, path, avoid, success, error) {
            E.comm.publicStationSearch(
                urlVars.stopId,
                urlVars.direction,
                E.locale.region,
                date.substr(0, 10),
                date.substr(11, 5),
                E.constants.api.pubTrans.authKey,
                'departure',
                null,
                complete
            );
        }
    }
}())