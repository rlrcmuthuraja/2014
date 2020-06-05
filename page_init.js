/**
 * All code that should be run when initialising the page. This includes
 * initialising the navigation, the map and setting the number of search
 * fields, making the page visible (it's hidden during loading) and requesting
 * geo location.
 *
 * This should be called after the page and the rest of the js is loaded.
 *
 * NOTE: the body of the page is hidden until most of the page is loaded. This
 * is because the page looks meaningless before parts of it are hidden. The map
 * however must be loaded after the page is shown again as its initialisation
 * depends on the size of the map container (which is 0 when the page is
 * hidden).
 *
 * @requires loaded after page and the js.
 */
E.redirect.init();
E.display.hidePageLoader();
E.smartBanner.init();
E.cookie.init();
$('body').show();
E.map.init();
E.navigation.init();
E.geo.request(E.map.setDefaultCountryPos);
E.categories.init();
