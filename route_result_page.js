E.routeResult = (function () {
    var urlFrom,
        urlTo,
        urlShortest,
        urlAvoid,
        urlTime,
        shortest,
		poiID,
        routeInstructions,
        collapse,
        expand,
        currentInstruction,
        timerInterval,
        pubRouteAvoid,
        routeDate,
        routeResult,
        travelAdv2Initialized,
        pubRouteEventsBinded;

    pubRouteAvoid = {};

    /**
     * Sets preferece (shortest/fastest) for the advanced. route search.
     * @param isSet required. true = shortest, false = fastest.
     */
    function setShortest(isSet) {
        E.display.content.menu.route.result.setPref(isSet);
        shortest = isSet;
    }


    /**
     *  to show the instruction and POi in the Map
     * @param index
     */

    function showInstruction(index) {
        var txt,
            loc;

        if (index >= 0 && index < routeInstructions.length) {
            txt = routeInstructions[index].instruction;
            E.elements.routeResult.routeNavigation.content.html(txt);
            currentInstruction = index;

            if (poiID !== undefined) {
                E.map.removePoi(poiID);
            }

            loc = routeInstructions[index].location;

            poiID = E.map.addLocationPoi(loc);

            E.map.setPosition(loc.lon, loc.lat);
            E.display.addMapControllerClass();

        }
    }

    function setPublicRouteAvoid (transport) {
        pubRouteAvoid = pubRouteAvoid || {};
        if (pubRouteAvoid[transport]) {
            delete pubRouteAvoid[transport];
        } else {
            pubRouteAvoid[transport] = true;
        }
    }

    /**
     * Sets the state of the more/ok button and the visibility of the advanced
     * search parameters.
     *
     * @param text required. the text on the button.
     * @param url required. the url of the button.
     * @param dispFun required. function to call when showing/hiding the
     * advanced parameters.
     */
    function setState(text, url, dispFun) {
        var button;

        button = E.elements.content.menu.route.result.toggleAdvanced;

        button.text(text);
        button.attr('href', url);

        dispFun();
    }

    /**
     * Sets the advanced search to collapsed state.
     */
    collapse = setState.curry(E.locale.text.more,
        'javascript:E.routeResult.showAdvanced()',
        E.display.content.menu.route.result.hideAdvanced);

    /**
     * Sets the advanced search to the expanded state.
     */
    expand = setState.curry(E.locale.text.ok,
        'javascript:E.routeResult.search();',
        E.display.content.menu.route.result.showAdvanced);

    /**
     * Loads the information in the menu of the route result page. This means
     * displaying the destination and time for the route.
     *
     * @param len required. length of route, in meters.
     * @param duration required. duration of route, in seconds.
     */
    function initInfo(len, duration) {
        var hours,
            minutes,
            seconds,
            totalSeconds,
            time,
            distance,
            distanceString;

        totalSeconds = duration;

        hours = (totalSeconds / 3600).toInt();
        totalSeconds -= hours * 3600;
        minutes = (totalSeconds / 60).toInt();
        totalSeconds -= minutes * 60;
        seconds = totalSeconds % 60;

        if (hours) {
            time = hours + ' ' + E.locale.text.hours;
            if (hours <= 4) {
                time += ' ' + minutes + ' ' + E.locale.text.minutes;
            }
        } else if (minutes) {
            time = minutes + ' ' + E.locale.text.minutes;
            if (minutes < 10) {
                time += ' ' + seconds + ' ' + E.locale.text.seconds;
            }
        } else {
            time = seconds + ' ' + E.locale.text.seconds;
        }

        E.elements.content.menu.route.result.time.text(time);

        distance = E.util.distance.round(len / 1000);
        distanceString = distance.dst + ' ' + distance.unit;

        E.elements.content.menu.route.result.distance.text(distanceString);
    }

    function initPubTransInfo(noOfTrips) {
        E.elements.content.menu.route.result.pubRouteAdvToggleText.text(
            E.locale.text.pubRouteOpts
        );


        E.elements.content.menu.route.result.pubRouteInfoText.text(
            Number(noOfTrips) +
                E.locale.text.pubRouteAlternatives
        );

        E.elements.content.menu.route.result.pubRouteAdvToggle.off('click');
        E.elements.content.menu.route.result.pubRouteAdvToggle.on('click', function (event) {
            event.preventDefault();
            E.display.content.menu.route.result.toggleAdvPubRoute();
        });

        E.elements.content.menu.route.result.advPubRouteConfirm.off('click');
        E.elements.content.menu.route.result.advPubRouteConfirm.on('click', function (event) {
            event.preventDefault();
            E.routeResult.searchPubTrans();
        });
    }

    /**
     * Fills the advanced search fields with the current options.
     *
     * @param from required. {lon, lat, name}.
     * @param to required. {lon, lat, name}.
     * @param avoid required. object generated by E.route.parseAvoid
     * @param prefShortest optional. true/false. false is used if no value is
     * sent.
     */
    function initAdvanced(from, to, avoid, prefShortest) {
        var routeRes;
        E.elements.content.menu.route.result.from.keypress(function (ev) {
            if (ev.keyCode === 13) {
                E.elements.content.menu.route.result.from.blur();
                E.routeResult.search();
            }
        });
        E.elements.content.menu.route.result.to.keypress(function (ev) {
            if (ev.keyCode === 13) {
                E.elements.content.menu.route.result.to.blur();
                E.routeResult.search();
            }
        });
        routeRes = E.elements.content.menu.route.result;

        urlFrom = from;
        urlTo = to;
        routeRes.from.val(from.name);
        routeRes.to.val(to.name);

        urlAvoid = {
            ferry: avoid && avoid[E.constants.routeAvoidFerry] ? true : false,
            toll: avoid && avoid[E.constants.routeAvoidToll] ? true : false,
            highway: avoid && avoid[E.constants.routeAvoidHighway] ? true : false
        };

        routeRes.avoidFerry.attr('checked', urlAvoid.ferry);
        routeRes.avoidToll.attr('checked', urlAvoid.toll);
        routeRes.avoidHighway.attr('checked', urlAvoid.highway);

        urlShortest = prefShortest;
        setShortest(prefShortest);
    }

    function routeChange(ev) {
        var elem,
            next;

        elem = $(this);
        if (ev.keyCode === 13) {
            E.elements.content.menu.route.result[elem.attr('name')].blur();
            E.routeResult.searchPubTrans();
        } else {
            if (elem.val() !== '' && elem.val().length > 1) {
                function suggestionsComplete(data) {
                    var obj,
                        html;

                    obj = E.translate.geoSuggest(data);

                    if (obj && obj.items) {
                        next = elem.next();
                        html = E.generate.geoSuggest(obj.items);

                        next.html(html);
                        next.show();

                        $('a.suggestion', routeResult.routeAutosuggest).on('click', function (event) {
                            event.preventDefault();
                            elem.val($(this).children('span').text());
                            next.hide();
                            $('a.suggestion', routeResult.routeAutosuggest).off('click');
                        });
                    }
                }
                $('a.suggestion', routeResult.routeAutosuggest).off('click');
                E.comm.geoSuggest(elem.val(), null, suggestionsComplete);
            }
        }
    }

    /**
     * Fills the advanced search fields with the current options.
     *
     * @param from required. {lon, lat, name}.
     * @param to required. {lon, lat, name}.
     * @param avoid required. object generated by E.route.parsePublicAvoid
     * sent.
     */
    function initPubTransAdvanced(from, to, avoid, travelTime) {
        var routeRes;
        E.elements.content.menu.route.result.from.on('keypress', routeChange);
        E.elements.content.menu.route.result.to.on('keypress', routeChange);
        routeRes = E.elements.content.menu.route.result;

        urlFrom = from;
        urlTo = to;
        urlTime = travelTime;
        routeRes.from.val(from.name);
        routeRes.to.val(to.name);
        urlAvoid = {};
        if (avoid) {
            for (a in avoid) {
                urlAvoid[a] = true;
                routeRes.pubAvoid[a].addClass('selected');
            }
        }

        pubRouteAvoid = pubRouteAvoid || {};
    }
    /**
     * Checks if a string matches either the original from- or to-name from the
     * URL. If this is the case, it means that the coordinates from the URL can
     * be re-used. If they don't match, a falsy value is returned.
     *
     * @param str required.
     * @return the values matching str from the original URL string. if no
     * values match, a falsy value is returned.
     */
    function getData(str) {
        var obj;

        if (str === urlFrom.name) {
            obj = urlFrom;
        } else if (str === urlTo.name) {
            obj = urlTo;
        }
        return obj;
    }

    function startRouteTimer() {
        var elems,
            now,
            currentElem,
            diff,
            next;

        routeResult = routeResult || E.elements.content.menu.route.result;
        stopRouteTimer();
        elems = $('span.realtime');

        function updateElemsRealtime() {
            now = new Date();
            elems.each(function () {
                currentElem = $(this);
                if (currentElem.data('realtime')) {
                    diff = currentElem.data('realtime') - now.getTime();

                    if (currentElem.attr('id') === routeResult.travelTimeContainer.attr('id')) {
                        diff =  -diff;
                        if (diff > 0 && diff < 60000) {
                            currentElem.text(E.locale.text.now);
                        } else {
                            currentElem.text(E.util.writeAbreviateWeekTime(currentElem.data('realtime'), now));
                        }

                    } else if (currentElem.hasClass('local') && diff > 0) {
                        next = currentElem.next('.minute_notation');

                        if (diff < 60000 && next) {
                            currentElem.text(E.locale.text.now);
                            $(next).hide();
                        } else if (diff < 600000 && next) {
                            currentElem.text(E.util.writeLocalTime(diff, currentElem.data('time')));
                            $(next).show();
                        } else if (next) {
                            currentElem.text(E.util.writeLocalTime(diff, currentElem.data('time')));
                            $(next).hide();
                        }
                    } else if (currentElem.hasClass('local') && diff < 0) {
                        currentElem.parents('li.station_departures').slideUp('slow', function () {
                            $(this).remove();
                        });
                    } else {
                        currentElem.text(E.util.writeTime(diff, 't'));
                    }
                }
            });
        }
        updateElemsRealtime();
        timerInterval = setInterval(updateElemsRealtime, 60000);
    }

    function stopRouteTimer() {
        if (timerInterval !== null) {
            window.clearInterval(timerInterval);
        }
    }

    function avoidButtonClickFunc (event) {
        event.preventDefault();
        var elem = $(this);
        setPublicRouteAvoid(elem.data('avoid'));
        elem.toggleClass('selected');
    }

    function drawPublicRoute(legs) {
        var coords = [],
            lat,
            lon,
            i,
            length;

        E.map.clear();

        length = legs.length
        for (i = 0; i < length; i++) {
            lat = Number((legs[i].Origin.lat));
            lon = Number((legs[i].Origin.lon));
            coords.push({
                    longitude: lon,
                    latitude: lat
            });
            E.map.addStationPoi({lat: lat, lon: lon}, function () {
                E.toggle.up();
            });
        }

        //Add final destination
        lat = Number((legs[length - 1].Destination.lat));
        lon = Number((legs[length - 1].Destination.lon));
        coords.push({
            longitude: lon,
            latitude: lat
        });
        E.map.addStationPoi({lat: lat, lon: lon}, function () {
            E.toggle.up();
        });



        E.map.drawRoute(coords);
        first = coords.first();
        E.map.setPosition(first.longitude, first.latitude);
        E.display.content.showToggle();
    }

    function updatePubTravel() {
        var arrive,
            travelTime,
            urlVars,
            url;

        urlVars = E.util.getUrlVars();
        if (routeResult.travelType.val() === 'arrival') {
            arrive = true;
            urlVars['travelType'] = 'arrival';
        } else {
            urlVars['travelType'] = 'departure';
        }
        travelTime = routeResult.travelTimeVal.val();
        travelTime = E.util.getDateObj(travelTime.substr(0, 10), travelTime.substr(11, 5));

        if (isNaN(travelTime)) {
            travelTime = new Date();
        }

        routeResult.travelTimeContainer.data('realtime', travelTime.getTime());
        urlVars['travelTime'] = (E.util.formatDateTime(travelTime, ' ')).encodeUtf8();

        url = E.page.name.pubRouteResult;
        for (i in urlVars) {
            url += '&' + i + '=' + urlVars[i];
        }
        location.hash = url;
    }

    function setPubRouteDateAndType() {
        routeResult.travelTypeVal.val(routeResult.travelType.val());
        routeResult.travelTypeContainer.text(
            E.locale.text[routeResult.travelType.val()]
        );
        routeResult.travelTimeVal.val(routeResult.travelTime.val().replace('T', ' '));
        updatePubTravel();
        E.display.hidePubRouteTravel();
    }

    function initTravelAdv2() {
        routeResult.travelTimeContainer.on('click', E.display.showPubRouteTravel);
        routeResult.travelTypeContainer.on('click', E.display.showPubRouteTravel);
        E.elements.pubRouteTravel.okButton.on('click', setPubRouteDateAndType);

        travelAdv2Initialized = true;
    }

    function pubRouteOnExitFunc() {
        E.elements.header.search.off('click');
        E.display.content.menu.route.result.hideAutosuggest();
        E.display.resetRouteChoice();
        $('a.avoid_button',
            routeResult.advPubRoute
        ).off('click');
        $('a.toggle_public_route', E.elements.list).off('click');
        E.elements.content.menu.route.back.off('click');
        $('a.station_details', E.elements.list).off('click');
        routeResult.travelTimeContainer.off('change');
        routeResult.travelTypeContainer.off('change');
        stopRouteTimer();
    }

    function initTravelTime(urlVars) {
        var travelTime,
            opt,
            formattedDatetime,
            now;

        routeResult = routeResult || E.elements.content.menu.route.result;
        now = new Date();

        if (urlVars.travelTime) {
            travelTime = urlVars.travelTime.decodeUtf8();
            travelTime = E.util.getDateObj(travelTime.substr(0, 10), travelTime.substr(11, 5));
        } else {
            travelTime = new Date();
        }

        //set data-attribute for realtime updating with timer
        routeResult.travelTimeContainer.attr('data-realtime', travelTime.getTime());

        formattedDatetime = E.util.formatDateTime(travelTime, 'T');

        //set input values to have correct time
        routeResult.travelTimeVal.val(formattedDatetime.replace('T', ' '));

        opt = {};
        opt.datetime = {
            preset : 'datetime',
            stepMinute: 5,
            //dateFormat: 'dd/mm/yy',
            dateOrder: 'ddmmy',
            monthNames: ['Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Desember'],
            monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Des'],
            dayNames: ['Søn', 'Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør'],
            dayNamesShort: ['Søn', 'Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør'],
            monthText: 'Måned',
            dayText: 'Dag',
            yearText: 'År',
            hourText: 'Timer',
            minuteText: 'Minutter',
            secText: 'Sekunder',
            nowText: 'Nå',
            showNow: true,
            startYear: now.getFullYear() - 1,
            endYear: now.getFullYear() + 1,
            timeWheels: 'HHii',
            timeFormat: 'HH:ii'
        };
        routeResult.travelTime.val(formattedDatetime).scroller('destroy').scroller(
            $.extend(opt['datetime'],
            { theme: 'iOS', mode: 'scroller', display: 'inline', lang: 'en' })
        );

        return formattedDatetime;
    }

    function setPubTransMenu(from, to, urlVars) {
        routeResult = routeResult || E.elements.content.menu.route.result;
        initTravelTime(urlVars);
        pubRouteAvoid = E.route.parsePublicAvoid(urlVars);
        initPubTransAdvanced(from, to, pubRouteAvoid);
        initPubTransInfo(0);
        if (urlVars.travelType && urlVars.travelType === 'arrival') {
            routeResult.travelTypeVal.val('arrival');
            routeResult.travelTypeContainer.text(E.locale.text.arrival);
        } else {
            routeResult.travelTypeVal.val('departure');
            routeResult.travelTypeContainer.text(E.locale.text.departure);
        }
        E.elements.content.list.html(E.locale.text.noPublicRoute);
        startRouteTimer();

//        E.display.showPublicRouteResults();
        E.routeResult.bindPubRouteEvents();
        E.routeResult.setPubRouteExitFunc();
        E.display.hidePageLoader();
    }

    return {
        /**
         * Calls the route api with the parameters from the url and populates
         * the page with the result. Populating the page means filling in info
         * in the menu, populating the list, drawing the route in on the map
         * and initiating the advanced search options.
         */
        populate: function () {
            var urlVars,
                from,
                to,
                avoid,
                prefShortest;

            function complete(data) {
                var obj,
                    html,
                    first;

                obj = E.translate.route(data);

                if (obj) {
                    initInfo(obj.len, obj.duration);

                    html = obj.instructions.map(E.generate.routeResult).join('');
                    E.loader.hide();
                    E.elements.content.list.html(html);

                    E.map.drawRoute(obj.coordinates);
                    first = obj.coordinates.first();
                    E.map.setPosition(first.longitude, first.latitude);
                    routeInstructions = obj.instructions;
                    E.elements.header.search.on('click', function (event) {
                        event.preventDefault();
                        E.routeResult.search();
                    });

                    E.navigation.setOnExit(function () {
                        E.elements.header.search.off('click');
                        E.display.removeMapControllerClass();
                    });
                }
            }

            urlVars = E.util.getUrlVars();
            if (urlVars.fromLon && urlVars.fromLat && urlVars.fromName &&
                    urlVars.toLon && urlVars.toLat && urlVars.toName) {

                from = {
                    name: urlVars.fromName.decodeUtf8(),
                    lon: urlVars.fromLon,
                    lat: urlVars.fromLat
                };

                to = {
                    name: urlVars.toName.decodeUtf8(),
                    lon: urlVars.toLon,
                    lat: urlVars.toLat
                };

                avoid = E.route.parseAvoid(urlVars.avoid);

                if (urlVars.pref === 'shortest') {
                    prefShortest = true;
                }

                initAdvanced(from, to, avoid, prefShortest);
                collapse();

                E.loader.show();
                E.comm.routeSearch(from, to, prefShortest, avoid, complete);

            } else {
                location.hash = E.page.name.search;
            }

        },
        /**
         * Calls the public route api with the parameters from the url and populates
         * the page with the result. Populating the page means filling in info
         * in the menu, populating the public transport list, drawing the route in on the map
         * and initiating the advanced search options.
         */
        populatePublicRoute: function () {
            var urlVars,
                from,
                to,
                arrive,
                formattedDatetime,
                date,
                time;

            urlVars = E.util.getUrlVars();
            routeResult = E.elements.content.menu.route.result;

            if (!travelAdv2Initialized) {
                initTravelAdv2();
            }

            function complete(data) {
                var obj,
                    html;

                obj = E.translate.pubTransTrip(data);

                if (obj && obj.trips) {
                    initPubTransInfo(obj.trips.length);
                    html = E.generate.publicRouteTrips(obj.trips);

                    E.loader.hide();
                    E.elements.content.list.html(html);
                    E.routeResult.bindPubRouteEvents(obj);
                    E.routeResult.setPubRouteExitFunc();

                    if (urlVars.expandRoute) {
                        startRouteTimer();
                        drawPublicRoute(obj.trips[urlVars.expandRoute].LegList.Leg);
                        E.display.showPublicRouteDetails(urlVars.expandRoute);
                    } else {
                        startRouteTimer();
                        E.display.showPublicRouteResults();
                    }

                } else if (data && data.TripList && data.TripList.errorCode) {
                    startRouteTimer();
                    E.elements.content.list.html(E.locale.text.noPublicRoute);
                    E.display.hidePageLoader();
                }
            }

            if (urlVars.fromLon && urlVars.fromLat && urlVars.fromName &&
                    urlVars.toLon && urlVars.toLat && urlVars.toName) {

                from = {
                    name: urlVars.fromName.decodeUtf8(),
                    lon: urlVars.fromLon,
                    lat: urlVars.fromLat
                };

                to = {
                    name: urlVars.toName.decodeUtf8(),
                    lon: urlVars.toLon,
                    lat: urlVars.toLat
                };

                pubRouteAvoid = E.route.parsePublicAvoid(urlVars);
                initPubTransAdvanced(from, to, pubRouteAvoid);

                E.loader.show();
                formattedDatetime = initTravelTime(urlVars);

                date = formattedDatetime.substr(0, 10);
                time = formattedDatetime.substr(11, 5);

                if (urlVars.travelType && urlVars.travelType === 'arrival') {
                    arrive = true;
                    routeResult.travelTypeVal.val('arrival');
                    routeResult.travelTypeContainer.text(E.locale.text.arrival);
                } else {
                    routeResult.travelTypeContainer.text(E.locale.text.departure);
                    arrive = false;
                }

                E.comm.publicTransSearch(
                    from,
                    to,
                    E.locale.region,
                    date,
                    time,
                    E.constants.api.pubTrans.authKey,
                    null,
                    pubRouteAvoid,
                    arrive,
                    complete
                );

            } else if (urlVars.fromLon && urlVars.fromLat && urlVars.fromName) {

                from = {
                    name: urlVars.fromName.decodeUtf8(),
                    lon: urlVars.fromLon,
                    lat: urlVars.fromLat
                };

                to = {};

                if (urlVars.toName) {
                    to = {
                        name: urlVars.toName
                    };
                }

                setPubTransMenu(from, to, urlVars);
            } else if (urlVars.toLon && urlVars.toLat && urlVars.toName) {
                to = {
                    name: urlVars.toName.decodeUtf8(),
                    lon: urlVars.toLon,
                    lat: urlVars.toLat
                }

                from = {};
                if (urlVars.fromName) {
                    from = {
                        name: urlVars.fromName
                    }
                }
                setPubTransMenu(from, to, urlVars);
            } else {

                from = {};
                to = {};

                if (urlVars.fromName) {
                    from.name = urlVars.fromName;
                }

                if (urlVars.toName) {
                    to.name = urlVars.toName;
                }

                setPubTransMenu(from, to, urlVars);
            }

        },

        bindPubRouteEvents: function(obj) {
            pubRouteEventsBinded = true;
            E.elements.header.search.on('click', function (event) {
                event.preventDefault();
                urlVars = E.util.getUrlVars();

                if (urlVars && urlVars.fromName && urlVars.toName &&
                    (
                        urlVars.fromName.decodeUtf8() !== routeResult.from.val() ||
                        urlVars.toName.decodeUtf8() !== routeResult.to.val()
                    )) {
                    routeResult.from.blur();
                    routeResult.to.blur();
                    E.routeResult.searchPubTrans();
                } else {
                    E.routeResult.searchPubTrans();
                }
            });

            routeResult.pubRouteBack.on('click', function (event) {
                event.preventDefault();
                history.back();
            });

            routeResult.travelTimeVal.on('change', updatePubTravel);
            routeResult.travelTypeVal.on('change', updatePubTravel);

            $('.avoid_button',
                routeResult.advPubRoute
            ).on('click', avoidButtonClickFunc);
        },
        unbindPubRouteEvents: function() {
            pubRouteOnExitFunc();
            pubRouteEventsBinded = false;
        },
        pubRouteEventsBinded: function() {
            return pubRouteEventsBinded;
        },
        setPubRouteExitFunc: function () {
            E.navigation.setOnExit(pubRouteOnExitFunc);
        },
        /**
         * Swaps the to and from values in the advanced options.
         */
        swap: function () {
            var temp,
                res;

            res = E.elements.content.menu.route.result;

            temp = res.from.val();
            res.from.val(res.to.val());
            res.to.val(temp);

            if (E.navigation.getCurrentPage() === E.page.name.pubRouteResult) {
                E.routeResult.searchPubTrans();
            } else {
                E.routeResult.search();
            }
        },
        setShortest: setShortest,

        /**
         * Performs a search using the advanced search parameters. This works
         * similarly to a regular search from the route search page. If no
         * change is made, no new search is carried out.
         */
        search: function () {
            var fromName,
                toName,
                from,
                to,
                avoid,
                avoidFerry,
                avoidToll,
                avoidHighway,
                hash,
                button,
                force;

            collapse();

            routeResult = E.elements.content.menu.route.result;
            fromName = routeResult.from.val();
            toName = routeResult.to.val();
            avoidFerry = routeResult.avoidFerry.attr('checked') !== undefined;
            avoidToll = routeResult.avoidToll.attr('checked') !== undefined;
            avoidHighway = routeResult.avoidHighway.attr('checked') !== undefined;


            // If from- and to- locations are set and a change is made.
            if (!fromName.empty() && !toName.empty() &&
                    (fromName !== urlFrom.name || toName !== urlTo.name ||
                    avoidToll !== urlAvoid.toll ||
                    avoidFerry !== urlAvoid.ferry ||
                    avoidHighway !== urlAvoid.highway ||
                    urlShortest !== shortest)) {

                from = getData(fromName);
                to = getData(toName);

                if (from && to) {
                    hash = E.makeUrl.routeResult(from, to);
                    force = true;
                } else if (from) {
                    hash = E.makeUrl.routeTo(from, toName);
                } else if (to) {
                    hash = E.makeUrl.routeFrom(fromName, null, to);
                } else {
                    hash = E.makeUrl.routeFrom(fromName, toName);
                }

                if (avoidFerry || avoidHighway || avoidToll) {
                    avoid = {
                        ferry: avoidFerry,
                        toll: avoidToll,
                        highway: avoidHighway
                    };
                }

                hash += E.makeUrl.routeAdvanced(avoid, shortest);
                location.hash = hash;
                if (force) {
                    E.navigation.forcePageChange();
                }
            } else {
                E.navigation.showSearchPage();
            }

        },

        searchPubTrans: function () {
            var fromName,
                toName,
                from,
                to,
                travelTime;

            E.display.content.menu.route.result.hideAdvPubRoute();

            routeResult = E.elements.content.menu.route.result;
            fromName = routeResult.from.val();
            toName = routeResult.to.val();

            // If from- and to- locations are set and a change is made.
            if (!fromName.empty() && !toName.empty() &&
                    (
                        fromName !== urlFrom.name.decodeUtf8() ||
                        toName !== urlTo.name.decodeUtf8() ||
                        JSON.stringify(pubRouteAvoid) !== JSON.stringify(urlAvoid)
                    )
                ) {

                urlVars = E.util.getUrlVars();
                from = getData(fromName);
                to = getData(toName);

                travelTime = routeResult.travelTimeVal.val();

                if (from && to) {
                    location.hash = E.makeUrl.routePubTransResult(from,
                        to, pubRouteAvoid, travelTime, urlVars.travelType);
                } else {
                    E.route.pubRouteMissingPos(fromName, toName, from, to, pubRouteAvoid, travelTime, urlVars.travelType);
                }

            } else {
                location.hash = E.page.name.search;
            }

        },
        /**
         * Shows the advanced search options.
         */
        showAdvanced: function () {
            expand();
        }, /**
         * toggle the map and add the Poi
         */

        showInstruction: function (index) {
            E.toggle.down();
            E.display.content.hideToggle();
            E.display.showRouteNavigation();
            showInstruction(index);

        },
        temp: showInstruction,

        prevInstruction: function () {

            showInstruction(currentInstruction - 1);

        },

        nextInstruction: function () {

            showInstruction(currentInstruction + 1);

        },

        showMap: function (lon, lat) {

            E.map.clear();
            E.map.setPosition(lon, lat);
            E.map.addLocationPoi({lon: lon, lat: lat}, E.toggle.up);
            E.toggle.down();
        },

        toggleUp: function () {
            E.toggle.up();
            E.display.content.showToggle();
            E.display.hideRouteNavigation();
            E.display.removeMapControllerClass();

        },
        showDeparturePOI: function (lon,lat) {

            lon = Number(lon);
            lat = Number(lat);
            E.map.setPosition(lon, lat, 1);
            E.toggle.down();
        },

        startRouteTimer: startRouteTimer.curry(),
        stopRouteTimer: stopRouteTimer.curry()

    };




}());
