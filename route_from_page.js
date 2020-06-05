E.routeFrom = {
    /**
     * Fetches variables from the url, queries the API with them. The API
     * response is translated and from the translation html is generated.
     * Binds the refresher to this page.
     *
     * The tricky part of this code is the link-function so I will discuss it a
     * little more. When ending up on the route-from-page, there are two
     * possibilities, either the destination is known or it is not.
     *
     * If it's not known the links in the result link should take us to the
     * route-to-page so that we can select a destination. This is done by
     * making the link-function a function that creates a link to the
     * route-to-page having the {lon, lat, name} of each item as from-variables
     * and having to-name as to-variables.
     *
     * If it's known, the links should take us directly to the
     * route-result-page. This is done by making the link-function a function
     * that creates a link to the route-result-page having the {lon, lat, name}
     * of each item as from-variables and the {lon, lat, name} of the as the
     * to-variables.
     *
     * By from- and to-variables i refer to the fromLon, fromLat etc in url of
     * the target page (route-to or route-result)
     *
     * See E.route.populate for more info on this.
     */
    populate: function () {
        var urlVars,
            fromName,
            to,
            toName,
            avoid,
            prefShortest,
            linkFun,
            url;

        urlVars = E.util.getUrlVars();
        fromName = urlVars.fromName;
        toName = urlVars.toName;
        prefShortest = urlVars.pref && urlVars.pref === 'shortest';
        avoid = E.route.parseAvoid(urlVars.avoid);

        if (fromName && toName) {
            fromName = fromName.decodeUtf8();
            toName = toName.decodeUtf8();

            if (urlVars.toLon && urlVars.toLat) {
                to = {
                    name: toName,
                    lon: urlVars.toLon,
                    lat: urlVars.toLat
                };

                linkFun = E.route.linkFromResult.curry(avoid, prefShortest, to);
            } else {
                linkFun = E.route.linkFromTo.curry(avoid, prefShortest, toName);
            }

            E.elements.content.menu.route.select.html(
                E.locale.text.from + ': ' + fromName
            );

            E.route.populate(fromName, linkFun, fromName, toName, to,
                E.page.name.routeFrom);
        } else {
            location.hash = E.page.name.search;
        }
    }
};
