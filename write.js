/**
 * @requires E.locale (sweden.js, norway.js, denmark.js).
 * @requires Must be included in the head of the page.
 *
 * @param path required. path of the identifier in E.locale.text.
 * @example E.w('week.1'); // writes the content of E.locale.text.week[1] to
 * // the document.
 */

/*global document */

E.w = function (path) {

    document.write(
        path.split('.').reduce(function (o, key) {
            return o[key];
        }, E.locale.text)
    );
};

