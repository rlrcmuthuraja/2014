/**
 * Globals for tracking on and off settings of the session
 */

E.globals = (function () {
    var geoSearchWord,
        previousSearchWord,
        onlineBaseUrl;

    function getGeoSearchWord() {
        return this.geoSearchWord;
    }

    function setGeoSearchWord(s) {
        this.geoSearchWord = s;
    }

    function getPrevSearchWord() {
        return this.previousSearchWord;
    }

    function setPrevSearchWord(w) {
        this.previousSearchWord = w;
    }

    return {
        getGeoSearchWord: getGeoSearchWord.curry(),
        setGeoSearchWord: setGeoSearchWord.curry(),

        getPrevSearchWord: getPrevSearchWord.curry(),
        setPrevSearchWord: setPrevSearchWord.curry(),

        getOnlineBaseUrl: function () {
            if (onlineBaseUrl === undefined) {
                onlineBaseUrl = 'http://' + ['www'].concat(document.location.host.split('.').slice(1)).join('.');
            }
            return onlineBaseUrl;
        }

    }
}());