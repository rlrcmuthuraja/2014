/**
 * @requires refresher.js
 */

E.result = (function () {
    return {

        /**
         * Sets meta data (number of hits) for all categories.
         *
         * @param companyHits required.
         * @param personHits required.
         * @param locationHits required.
         */
        setMeta: function (companyHits, personHits, locationHits) {
            var menu;

            menu = E.elements.content.menu.result;
            menu.companyData.html(E.util.cap(companyHits));
            menu.personData.html(E.util.cap(personHits));
            menu.locationData.html(E.util.cap(locationHits));
        },

        /**
         * Unsets meta data (number of hits) for all categories.
         */
        unsetMeta: function () {
            var menu;

            menu = E.elements.content.menu.result;
            menu.companyData.text('');
            menu.personData.text('');
            menu.locationData.text('');
        },
        /**
         * Sets the active category in the menu.
         *
         * @param category required. Values are as follows:
         * 0 company,
         * 1 person,
         * 2 location
         */
        setCategory: function (category) {
            var result;

            result = E.display.content.menu.result;
            result.unsetCategories();

            switch (category) {
                case 0:
                    result.setCompany();
                    break;
                case 1:
                    result.setPerson();
                    break;
                case 2:
                    result.setLocation();
                    break;
            }

            /**

             Alternative funnier ways of doing it. :)

             Alternative 1 (still sort of readable):
             [result.setCompany,
             result.setPerson,
             result.setLocation][category]();

             Alternative 2 (this is better ;) ):
             result[(['setCompany', 'setPerson', 'setLocation'][category])]();

             Yes, there is a reason why these are uncommented. :)
             */
        },

        /**
         * Sets the links in menu. Categories with 0 hits have disabled links.
         *
         * @param searchWord searchWord or searchLocation is required.
         * @param searchLocation searchWord or searchLocation is required.
         * @param region optional.
         * @param companyHits required.
         * @param personHits required.
         * @param locationHits required.
         */
        setLinks: function (searchWord, searchLocation, region,
                            companyHits, personHits, locationHits) {

            var companyLink,
                personLink,
                locationLink;

            companyLink = '#' + E.makeUrl.companyResult(searchWord,
                searchLocation, region);

            personLink = '#' + E.makeUrl.personResult(searchWord,
                searchLocation, region);

            locationLink = '#' + E.makeUrl.locationResult(searchWord,
                searchLocation, region);

            if (companyHits && E.navigation.getCurrentPage() !== 'companyResult') {
                E.elements.content.menu.result.companyLink.attr('href', companyLink);
                E.elements.content.menu.result.companyLink.removeClass('disabled');
            } else if (parseInt(companyHits) === 0) {
                E.elements.content.menu.result.companyLink.addClass('disabled');
            } else if (parseInt(companyHits) > 0) {
                E.elements.content.menu.result.companyLink.removeClass('disabled');
            }
            if (personHits && E.navigation.getCurrentPage() !== 'personResult') {
                E.elements.content.menu.result.personLink.attr('href', personLink);
                E.elements.content.menu.result.personLink.removeClass('disabled');
            } else if (parseInt(personHits) === 0) {
                E.elements.content.menu.result.personLink.addClass('disabled');
            } else if (parseInt(personHits) > 0) {
                E.elements.content.menu.result.personLink.removeClass('disabled');
            }
            if (locationHits && E.navigation.getCurrentPage() !== 'locationResult') {
                E.elements.content.menu.result.locationLink.attr('href', locationLink);
                E.elements.content.menu.result.locationLink.removeClass('disabled');
            } else if (parseInt(locationHits) === 0) {
                E.elements.content.menu.result.locationLink.addClass('disabled');
            } else if (parseInt(locationHits) > 0) {
                E.elements.content.menu.result.locationLink.removeClass('disabled');
            }

        },

        /**
         * Disables the links for all categories.
         */
        unsetLinks: function () {
            E.elements.content.menu.result.companyLink.removeAttr('href');
            E.elements.content.menu.result.personLink.removeAttr('href');
            E.elements.content.menu.result.locationLink.removeAttr('href');
        },

        /**
         * Populates a result page by querying the API, translate the response
         * and generate html from it.
         *
         * @param transFunc required. function for translating the object
         * returned from the api call and extracted by objFunc.
         * function ([obj]) -> [obj]
         *
         * @param objFunc required. function for extracting the result array
         * from the api response object.
         * function (obj) -> obj
         *
         * @param genFunc required. function for generating html from a single
         * translated api object.
         * function (obj) -> string containing html
         *
         * @param commFunc required. function for querying the API.
         * function (searchWord, searchLocation, region, callback)
         *
         * @param refresherFunc required. function for binding the refresher.
         * function (searchWord, searchLocation, region, from, totalHits)
         *
         * @param searchWord searchWord or searchLocation is required
         * @param searchLocation searchWord or searchLocation is required
         * @param region required.
         * @param extra optional. function to run after population is complete
         * if any hits were found.
         *
         */
        populate: function (transFunc, hitsFun, objFunc, genFunc, commFunc,
                            refresherFunc, searchWord, searchLocation, region, extra) {

            function complete(data) {
                var obj,
                    html,
                    companyHits,
                    personHits,
                    locationHits,
                    hits,
                    pos,
                    zoom,
                    searchArea;

                companyHits = data.company.totalHits;
                personHits = data.person.totalHits;
                locationHits = data.location.totalHits;
                hits = hitsFun(data);
                if (data.company.apiMetaData) {
                    searchArea = data.company.apiMetaData.geoSearchWord;
                } else if (data.person.apiMetaData) {
                    searchArea = data.person.apiMetaData.geoSearchWord;
                } else if (data.location.apiMetaData) {
                    searchArea = data.location.apiMetaData.geoSearchWord;
                }

                E.globals.setGeoSearchWord(searchArea);

                if (data.company.displ && data.company.displ.zoom) {
                    zoom = data.company.displ.zoom;
                } else if (data.person.displ && data.person.displ.zoom) {
                    zoom = data.person.displ.zoom;
                } else if (data.location.displ && data.location.displ.zoom) {
                    zoom = data.location.displ.zoom;
                }

                if (data.location.search) {
                    pos = data.location.search.geo.hits;
                } else {
                    pos = E.constants.numHits;
                }

                E.result.setMeta(companyHits, personHits, locationHits);

                E.result.setLinks(searchWord, searchLocation, region,
                    companyHits, personHits, locationHits);

                obj = transFunc(objFunc(data));

                html = E.generate.summary(searchWord, searchLocation, hits, searchArea);
                html += obj.map(function (o) {
                    return genFunc(o, region);
                }).join('');

                E.loader.hide();
                E.elements.content.list.html(html);
                refresherFunc(searchWord, searchLocation, region,
                    pos, hits, zoom);

                if (hits && extra && typeof extra === "function") {
                    extra(data);
                }
                E.map.setDisplayBoundingBox();
            }

            E.globals.setPrevSearchWord(searchWord);

            if (searchWord || searchLocation) {

                E.elements.content.list.html('');
                E.result.unsetLinks();
                E.display.content.hideRefresher();
                E.loader.show();
                /*  If nearBy === 'true'  we will set current location */
                if (E.geo.hasGeo() === false && E.util.getUrlVars().nearBy === 'true') {
                    E.geo.refresh(
                        function () {
                            searchLocation = E.geo.getLon() + ',' + E.geo.getLat() ;
                            commFunc(searchWord, searchLocation, region, complete);
                            console.log('I am 1st');
                        },
                        function () {
                            searchLocation = E.geo.getLon() + ',' + E.geo.getLat() ;
                            commFunc(searchWord, searchLocation, region, complete);
                            console.log('I am 2nd');
                        }
                    );
                } else {
                    commFunc(searchWord, searchLocation, region, complete);
                }
            } else {
                location.hash = E.page.name.search;
            }
        },
        /**
         * Adds a loader object to o. The purpose of the loader object is to
         * prevent result pages from loading data if they are already loaded
         * with the correct data. This is needed because normally whenever a
         * result page is loaded, it is also populated. When a result page is
         * reached as a result of a search (not bookmarking or through
         * switching category in an existing search) it's data is loaded as a
         * part of the search. Because of that, it's not necessary to load the
         * data again.
         *
         * The loader object has two very simple functions, ignoreLoad and
         * loadData. When a result page is loaded if first calls loadData. If
         * loadData returns false, no extra data is loaded. By calling
         * ignoreLoad, the next call of loadData will return false. Subsequent
         * calls of loadData will return true until another call of ignoreLoad
         * is made. Here's an example to illustrate this:
         *
         * On the search page the user searches for 'kaka'. This results in
         * lots of company hits, so the data from the company search is
         * generated as html on the company result page. Next, ignoreLoad is
         * called and the page is redirected to the company result page.
         *
         * When company result loads, it checks loadData and sees that it
         * should not load any data. The user then clicks the person category
         * (overwriting the company result data) and then clicks back to the
         * company result page. This time, when the loadData is called the page
         * sees that it needs to load data.
         *
         * @param o required. object to add loader object to.
         */
        addLoaderObject: function (o) {
            var hasData;

            o.loadData = function () {
                if (hasData) {
                    hasData = false;
                    return false;
                }
                return true;
            };
            o.ignoreLoad = function () {
                hasData = true;
            };
        },
        /**
         * Returns an object containing searchWord, searchLocation and region
         * taken from the URL.
         * @return {searchWord, searchLocation, region}
         */
        getParams: function () {
            var urlVars,
                param;

            urlVars = E.util.getUrlVars();
            param = {
                searchWord: urlVars.searchWord && urlVars.searchWord.decodeUtf8(),
                searchLocation: urlVars.location && urlVars.location.decodeUtf8(),
                region: urlVars.region || E.locale.region
            };
            return param;

        }
    };
}());
