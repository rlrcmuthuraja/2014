/**
 *
 * This displays cookie info on all pages as required by the EU unless the user
 * has already accepted the information, in which case we will store a cookie
 * to avoid displaying this information until cookie is deleted or expired.
 */

E.cookie = (function () {
    function bindEvents() {
        $('#cookie_info .accept_button').on('click', function (event) {
            event.preventDefault();
            E.util.setCookie('cookies_accepted', 'Cookies has been accepted for this site', 180);
            hide();
            $('#cookie_info').remove();
        });
    }

    function hide() {
        E.elements.search.main.removeClass('cookie_info_active');
        E.elements.routeSearch.main.removeClass('cookie_info_active');
        E.elements.header.background.removeClass('cookie_info_active');
        E.elements.content.main.removeClass('cookie_info_active');
        E.elements.header.background.removeClass('cookie_info_active');
        E.elements.header.search.removeClass('cookie_info_active');
    }

    function show() {
        E.elements.search.main.addClass('cookie_info_active');
        E.elements.routeSearch.main.addClass('cookie_info_active');
        E.elements.header.background.addClass('cookie_info_active');
        E.elements.content.main.addClass('cookie_info_active');
        E.elements.header.background.addClass('cookie_info_active');
        E.elements.header.search.addClass('cookie_info_active');
    }

    return {
        init: function () {
            var cookie;

            cookie = E.util.getCookie('cookies_accepted');

            if (E.locale.region !== 'pl' || cookie) {
                return false;
            }

            $('body').prepend(
                '<div id="cookie_info">' +
                    '<p>' + E.locale.text.cookieInfo + '</p>' +
                    '<a class="accept_button" href="#"><span>' + E.locale.text.accept + '</span></a>' +
                '</div>'
            );
            show();
            bindEvents();
        }

    };
}());
