/**
 * Contains data and functions specific to the person result page.
 *
 * @requires result.js
 */

E.personResult = {
    /**
     * See result.js
     */
    populate: E.result.populate.curry(
        E.translate.personResult,
        function (data) { return data.person.search.wp.totalHits; },
        function (data) { return data.person.search.wp.features; },
        E.generate.personResult,
        E.comm.personResult,
        E.refresher.bindPerson
    )
};

E.result.addLoaderObject(E.personResult);
