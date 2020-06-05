/**
 * Contains data and functions specific to the company result page.
 *
 * @requires result.js
 */

E.companyResult = (function () {

    /**
     * Updates the location part of a result from being a hidden data-holder
     * to being a visible object containing distance information.
     *
     * @param div required. jquery div object containing lon/lat info of a
     * single result.
     * @param location required. lon/lat of the device.
     */
    function updateDistance(div, location) {
        var lon,
            lat,
            divLocation,
            text;

        lon = parseFloat(div.children('.lon').html());
        lat = parseFloat(div.children('.lat').html());

        divLocation = {
            lon: lon,
            lat: lat
        };

        text = E.generate.distanceInner(divLocation, location);

        div.removeClass('location_data').addClass('distance');
        div.html(text);

    }

    return {
        /**
         * Populates the result list. This should only be called if the page is
         * loaded directly (i.e. not as a result of a search from the main
         * search page). For more details, see E.result.populate.
         */
        populate: function (searchWord, searchLocation, region) {


            E.result.populate(
                E.translate.companyResult,
                function (data) { return data.company.search.yp.totalHits; },
                function (data) { return data.company.search.yp.features; },
                E.generate.companyResult,
                E.comm.companyResult,
                E.refresher.bindCompany,
                searchWord,
                searchLocation,
                region,
                function (d) {
                    E.logging.trigger(E.page.name.companyResult,
                        d.company.search.yp,
                        false,
                        d.company.apiMetaData.searchWord || searchWord,
                        d.company.apiMetaData.geoSearchWord || E.geo.getMunicipality() || searchLocation);
                    if (d.company.search.yp.features && d.company.search.yp.features.length) {
                        d.company.search.yp.features.map(function (item) {
                            E.logging.bindResultLogging(item.id);
                        });
                    }
                }
            );
        },

        /**
         * Performs a proximity result using the parameters found in the hash.
         * Requires that a regular search has already been done, since it does
         * not load number of hits.
         */
        proximity: function () {
            var urlVars,
                searchWord,
                searchLocation,
                region,
                location;

            urlVars = E.util.getUrlVars();
            searchWord = urlVars.searchWord;
            searchLocation = urlVars.searchLocation;
            region = urlVars.region || E.locale.region;
            location = E.geo.getPos();

            E.refresher.unbind();

            function complete(data) {
                var obj,
                    html,
                    numHits;

                numHits = data.totalHits;
                obj = E.translate.companyResult(data.adverts);
                html = E.generate.summary(searchWord, searchLocation, numHits);
                html += obj.map(function (d) {
                    return E.generate.companyResult(d, region);
                }).join('');

                E.loader.hide();
                E.elements.content.list.html(html);
                E.refresher.bindCompanyProximity(searchWord, searchLocation,
                    location, region, E.constants.numHits, numHits);

                E.logging.trigger(E.page.name.companyProximityResult, data.company,
                    false, searchWord, searchLocation);
            }

            E.display.content.menu.result.setProximity(true);
            E.elements.content.menu.result.proximityLink.attr('href',
                'javascript:E.companyResult.normal();');
            E.elements.content.list.html('');

            E.loader.show();
            E.comm.companyProximity(urlVars.searchWord, urlVars.searchLocation,
                location, region, complete);
        },

        /** This function is meant to be called if the page gains access to the
         * device geolocation after the list is generated to update the
         * distances of the existing results.
         *
         * @param location required. lon/lat of the device.
         */
        updateDistances: function (location) {
            $.each($(E.elements.content.companyLocationData), function () {
                updateDistance($(this), location);
            });
        },

        /**
         * Loads normal data into the page. Called when toggling proximity
         * search off.
         */
        normal: function () {
            E.page.companyResult();
        }
    };
}());

E.result.addLoaderObject(E.companyResult);
