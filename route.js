/**
 * Functions for route search.
 */

E.route = {
    /**
     * Creates a link from the from-page to the to-page when only the name of
     * the to-destination is know.
     *
     * @param avoid optional.
     * @param prefShortest optional.
     * @param toName required. {lon, lat, name}
     * @param from required. string.
     */
    linkFromTo: function (avoid, prefShortest, toName, from) {
        return E.makeUrl.routeTo(from, toName, avoid, prefShortest);
    },

    /**
     * Creates a link from the from-page to the result-page when the to-
     * destination is known.
     *
     * @param avoid optional.
     * @param prefShortest optional.
     * @param to required {lon, lat, name}
     * @param from required {lon, lat, name}
     * @return the url from the from-page to the result-page.
     */
    linkFromResult: function (avoid, prefShortest, to, from) {
        return E.makeUrl.routeResult(from, to, avoid, prefShortest);
    },

    /**
     * Creates a link from the to-page to the result-page.
     *
     * @param avoid optional.
     * @param prefShortest optional.
     * @param to required {lon, lat, name}
     * @param from required {lon, lat, name}
     * @return the url from the to-page to the result-page.
     */
    linkToResult: function (avoid, prefShortest, to, from) {
        return E.makeUrl.routeResult(from, to, avoid, prefShortest);
    },

    /**
     *
     * Populates a route select page by querying the API, translate the
     * response and generate html from it.
     *
     * @param searchWord required.
     * @param linkFun required. function to create a link from a {lon, lat,
     * name}-object. This function is typically curries with data for the
     * part of the link that is constant for all items on the same page.
     * Here is an example to make this a little more clear:
     *
     * When generating the route-to-page, the from-destination is the same
     * for all items (since the from-destination is already selected by the
     * time you reach the route-to-page). Let's say the from-destination is
     * 'Uppsala'. In that case this function would be a function that
     * creates links from Uppsala to {lon, lat, name}, a sort of
     * specialised createALinkFromUppsalaToDestination-function if you will
     *
     * function (obj} -> string
     *
     * @param fromName required.
     * @param toName required.
     * @param toLocation optional.
     * @param page required. name of the page.
     */
    populate: function (searchWord, linkFun, fromName, toName, toLocation, page) {

        var url;

        function complete(data) {
            var response,
                obj,
                totalHits,
                html,
                backLink;

            response = data.search.geo;

            totalHits = response.totalHits;
            if (totalHits) {

                obj = E.translate.routeSelect(response.features);

                html = obj.map(E.generate.routeSelect.curry(linkFun)).join('');
                E.loader.hide();
                E.elements.content.list.html(html);

                E.refresher.bindRouteSelect(searchWord, E.locale.region,
                    E.constants.numHits, totalHits, linkFun, page);

            } else {

                backLink = '#' + E.page.name.routeSearch +
                    '&fromName=' + fromName +
                    '&toName=' + toName;

                if (toLocation) {
                    backLink += '&toLon=' + toLocation.lon +
                        '&toLat=' + toLocation.lat;
                }

                E.elements.content.menu.route.back.attr('href', backLink);
                E.display.content.menu.route.showBack();

                html = E.generate.routeSelectNoHits(searchWord);
                E.elements.content.list.html(html);
                E.loader.hide();

                E.refresher.unbind();
            }
        }

        url = E.comm.makeLocationUrl(searchWord, null, E.locale.region);
        E.elements.content.list.empty();
        E.loader.show();
        E.comm.queryApiSuper(url, complete);
    },
    pubRouteMissingPos: function (fromName, toName, from, to, avoid, travelTime, travelType) {
        console.log('in missing pos');
        var missingName,
            url;

        missingName = from ? toName : fromName;
        if (from && to) {
            return E.makeUrl.routePubTransResult(from, to, avoid, travelTime, travelType);
        } else {
            function complete(data) {
                var missingObj,
                    response,
                    obj,
                    totalHits;

                response = data.search.geo;
                if (response.type === 'Feature') {
                    response = {
                        totalHits: 1,
                        hits: 1,
                        offset: 0,
                        pageSize: 1,
                        features: [response]
                    }
                }

                totalHits = response.totalHits;
                if (totalHits) {
                    obj = E.translate.routeSelect(response.features);

                    if (obj && obj.length && obj[0].name && obj[0].location.lat && obj[0].location.lon) {
                        missingObj = {
                            name: obj[0].name,
                            lat: obj[0].location.lat,
                            lon: obj[0].location.lon
                        };
                        if (from) {
                            location.hash = E.makeUrl.routePubTransResult(from,
                                missingObj, avoid, travelTime, travelType);
                            E.navigation.forcePageChange();
                        } else if (to) {
                            location.hash = E.makeUrl.routePubTransResult(missingObj,
                                to, avoid, travelTime, travelType);
                            E.navigation.forcePageChange();
                        } else {
                            E.route.pubRouteMissingPos(fromName,
                                toName, from, to, avoid, travelTime, travelType);
                        }

                    } else {
                        location.hash = E.makeUrl.pubRouteNotFound(missingName,
                            from, to, avoid, travelTime, travelType);
                        E.navigation.forcePageChange();
                    }

                } else {
                    location.hash = E.makeUrl.pubRouteNotFound(fromName,
                        toName, from, to, avoid, travelTime, travelType);
                    E.navigation.forcePageChange();
                }
            }

            url = E.comm.makeLocationUrl(missingName, null, E.locale.region);
            E.elements.content.list.empty();
            E.loader.show();
            E.comm.queryApiSuper(url, complete);
        }
    },
    /**
     * Parses the avoid-string into a matching object.
     * @param avoidString optional. comma separated string of values to avoid.
     * @return an object matching avoidString, a falsy value if avoidString is
     * empty.
     * @example parseAvoid('ferry,toll') -> {ferry: true, toll: true}
     */
    parseAvoid: function (avoidString) {
        if (avoidString) {
            return avoidString.split(',').reduce(function (obj, e) {
                obj[e] = true;
                return obj;
            }, {});
        }
    },

    parsePublicAvoid: function (urlVars) {
        if (urlVars && urlVars.avoid) {
            return urlVars.avoid.split(',').reduce(function (obj, e) {
                obj[e] = true;
                return obj;
            }, {});
        }
    },

    searchStation: function (stationId, direction, date, time, avoid, destObject, origObject) {
        if (!date || !time) {
            var now;

            now = new Date();
            date = date ||
                now.getFullYear() + '-' +
                (now.getMonth() + 1) + '-' +
                now.getDate();
            time = time ||
                now.getHours() + ':' +
                now.getMinutes();
        }
        avoid = avoid || null;

        function complete(data) {
            var obj,
                html;

            obj = E.translate.pubStation(data);

            if (obj) {
                //remove existing list elements for
                $('li.station_departures', E.elements.list).remove();
                $('li.station_departures_alternate', E.elements.list).remove();

                if (!origObject) {
                    origObject = obj;
                }

                html = E.generate.publicStationDepartures(obj.departures, destObject, origObject);
                E.elements.content.list.append(html);

                $('#alternate_public_route_button').on('click', function () {
                    event.preventDefault();
                    location.hash = $(this).attr('href');
                    E.navigation.forcePageChange();
                });
                E.routeResult.startRouteTimer();
                E.display.showStationDepartures();
                E.display.showResultList();
            }
        }

        E.comm.publicStationSearch(
            stationId,
            direction,
            E.locale.region,
            date,
            time,
            E.constants.api.pubTrans.authKey,
            E.constants.api.pubTrans.defaultTravelType,
            avoid,
            complete
        );
    }
};
