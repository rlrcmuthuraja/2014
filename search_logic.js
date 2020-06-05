/**
 * Handle the result from a fake super search. This is where the result of a
 * super search is sent. The function determines what should be shown for the
 * given search result. If there is more than one hit, a result page should be
 * shown. What result page is selected like this: if there are any company
 * hits, company result is shown, else if there are person hits the person
 * result is shown otherwise the location result is shown. If there is just a
 * single hit, the company details or person details page is loaded with that
 * hit. If the hit is a location hit, it's shown on the location result page,
 * as there is no location details page.
 *
 * When a result page is loaded, the following happens:
 *
 * The data for the page is taken from the 'data' variable and translated using
 * the appropriate translation function.
 *
 * HTML is generated from the translated data using the appropriate generation
 * function.
 *
 * The generated HTML is set as the content of the main list.
 *
 * The data loading of the corresponding page is blocked using ignoreLoad. For
 * details on this, se definition of ignoreLoad.
 *
 * The refresher is bound to the result. See the refresher for more details.
 *
 * The page changes to the correct result page.
 *
 */
E.searchLogic = {
    determineType: function (data) {
        var searchWord,
            searchLocation,
            region,
            companyHits,
            personHits,
            locationHits,
            totalHits,
            eid,
            pid,
            adverts,
            records,
            locations,
            html,
            hash,
            zoom,
            searchWhere;

        searchWord = '';
        searchLocation = '';
        region = '';

        if (data.query) {
            searchWord = data.query.searchWord;
            searchLocation = data.query.searchLocation;
            region = data.query.region;
        } else if (data.apiMetaData) {
            searchWord = data.apiMetaData.searchWord;
            searchLocation = data.apiMetaData.geoSearchWord;
            region = E.locale.region;
        }

        if (data.superSearchData  === null) {
            location.hash = E.makeUrl.noHits(searchWord, searchLocation, region);
            return;
        }

        E.globals.setPrevSearchWord(searchWord);

        companyHits = data.superSearchData.search.yp && data.superSearchData.search.yp.totalHits ?
            data.superSearchData.search.yp.totalHits :
            data.superSearchData.apiMetaData.numberOfYellowHits || 0;
        personHits = data.superSearchData.search.wp && data.superSearchData.search.wp.totalHits ?
            data.superSearchData.search.wp.totalHits :
            data.superSearchData.apiMetaData.numberOfWhiteHits || 0;
        locationHits = data.superSearchData.search.geo && data.superSearchData.search.geo.totalHits ?
            data.superSearchData.search.geo.totalHits || 1 :
            data.superSearchData.apiMetaData.numberOfGeoHits || 0;

        totalHits = 0;
        if (data.superSearchData.apiMetaData.preferredIndex) {
            totalHits = data.superSearchData.search[data.superSearchData.apiMetaData.preferredIndex].totalHits;

            // A hack for the inconsistent way result hits are returned for geo
            if (data.superSearchData.apiMetaData.preferredIndex === 'geo' &&
                data.superSearchData.search.geo.totalHits === undefined) {
                totalHits = 1;
            }
        } else if (data.superSearchData.apiMetaData.totalHits) {
            totalHits = data.superSearchData.apiMetaData.totalHits;
        }

        E.result.setMeta(companyHits, personHits, locationHits);
        E.result.unsetLinks();
        E.result.setLinks(searchWord, searchLocation, region,
            companyHits, personHits, locationHits);

        E.globals.setGeoSearchWord(data.superSearchData.apiMetaData.geoSearchWord);

        if (data.superSearchData.search.yp &&
            data.superSearchData.apiMetaData.preferredIndex === 'yp') {
            searchWhere = parseInt(E.util.getUrlVars().zoom) === E.constants.map.minZoom ?
                E.locale.text.inWholeCountry : E.locale.text.near;
            hash = E.makeUrl.companyResult(searchWord, searchLocation, region, data.superSearchData.displ.zoom);
            adverts = E.translate.companyResult(data.superSearchData.search.yp.features);

            html = E.generate.summary(searchWord,
                searchLocation,
                data.superSearchData.search.yp.totalHits,
                data.superSearchData.apiMetaData.geoSearchWord || searchWhere
                );
            html += adverts.map(function (advert) {
                return E.generate.companyResult(advert, region);
            }).join('');

            E.elements.content.list.html(html);

            E.companyResult.ignoreLoad();
            E.logging.trigger(E.page.name.companyResult,
                data.superSearchData.search.yp,
                false,
                data.superSearchData.apiMetaData.searchWord,
                data.superSearchData.apiMetaData.geoSearchWord || E.geo.getMunicipality() || searchLocation);

            E.refresher.bindCompany(searchWord, searchLocation, region,
                data.superSearchData.search.yp.hits || 1,
                data.superSearchData.search.yp.totalHits,
                data.superSearchData.displ.zoom);
            if (data.superSearchData.search.yp.features && data.superSearchData.search.yp.features.length) {
                data.superSearchData.search.yp.features.map(function (item) {
                    E.logging.bindResultLogging(item.id);
                });
            }
        } else if (data.superSearchData.search.wp &&
            data.superSearchData.apiMetaData.preferredIndex === 'wp') {
            hash = E.makeUrl.personResult(searchWord, searchLocation, region, data.superSearchData.displ.zoom);
            records = E.translate.personResult(data.superSearchData.search.wp.features);

            html = E.generate.summary(searchWord,
                searchLocation,
                data.superSearchData.search.wp.totalHits,
                data.superSearchData.apiMetaData.geoSearchWord);
            html += records.map(function (record) {
                return E.generate.personResult(record, region);
            }).join('');

            E.elements.content.list.html(html);

            E.personResult.ignoreLoad();

            E.refresher.bindPerson(searchWord, searchLocation, region,
                data.superSearchData.search.wp.hits || 1,
                data.superSearchData.search.wp.totalHits);
        } else if (data.superSearchData.search.geo &&
            data.superSearchData.apiMetaData.preferredIndex === 'geo') {

            hash = E.makeUrl.locationResult(searchWord, searchLocation, region, data.superSearchData.displ.zoom);

            //the XI API will return a single geo hit directly under geo and not in features array
            locations = E.translate.locationResult(data.superSearchData.search.geo.features ||
                [data.superSearchData.search.geo]
                );

            html = E.generate.summary(searchWord,
                searchLocation,
                data.superSearchData.search.geo.totalHits || 1,
                data.superSearchData.apiMetaData.geoSearchWord);
            html += locations.map(function (location) {
                return E.generate.locationResult(location, region);
            }).join('');

            E.elements.content.list.html(html);

            E.locationResult.ignoreLoad();

            E.refresher.bindLocation(searchWord, searchLocation, region,
                data.superSearchData.search.geo.hits || 1,
                data.superSearchData.search.geo.totalHits || 1);

        } else {

            hash = E.makeUrl.noHits(searchWord, searchLocation, region);
        }
        location.hash = hash;
        E.map.setDisplayBoundingBox();
    }
};
