/**
 *
 */

E.util = {};
/**
 * Extracts the query parameters from the hash.
 */
E.util.getUrlVars = function () {
    if (parseInt(location.hash.indexOf('&'), 10) !== -1) {
        var vars = {},
            pair,
            hashes = location.hash.slice(location.hash.indexOf('&') + 1).split('&');

        hashes.map(function (nameValue) {
            pair = nameValue.split('=');
            vars[pair[0]] = pair[1];
        });

        return vars;
    } else {
        return {};
    }
};

E.util.number = function () {
    var prefixes,
        regions,
        invalidPrefixes,
        prefixStrings;

    prefixes = [/^0045/, /^0046/, /^0047/, /^\+45/, /^\+46/, /^\+47/];
    invalidPrefixes = [/^00450/, /^00460/, /^00470/, /^\+450/, /^\+460/, /^\+470/];
    prefixStrings = ['0045', '0046', '0047', '+45', '+46', '+47'];
    regions = {};

    regions['0045'] = 'krak';
    regions['0046'] = 'se';
    regions['0047'] = 'no';

    function clean (number) {
        if (!number) {
            return '';
        }
        return number.replace(/[\s\-]/g, '');
    }

    /**
     * Sets the number prefix to standard form ('00' instead of '+'). This
     * is currently required by the API to search for a number.
     *
     * @param number to standardise prefix for.
     * @precondition number contains only a starting '+' (optional) and
     * numbers. This is ensured by running clean on the number.
     */
    function standardisePrefix (number) {
        if (!number) {
            return '';
        }
        for (i = 0; i < invalidPrefixes.length; i++) {
            if (number.match(invalidPrefixes[i])) {
                number = number.replace(invalidPrefixes[i], prefixStrings[i]);
            }
        }
        return number.replace(/^\+/, '00');
    }

    return {
        /**
         * removes all spaces and dashes from a number.
         *
         * @param number the number to clean.
         * @returns number withouth spaces or dashes.
         */
        clean: clean,

        /**
         * Basic check to see if a string is a phone number or not. Phone
         * numbers as defined here means starting with an optional '+' followed
         * by digitts. Dashes and spaces are ignored.
         *
         * @param number the string to examine.
         * @return true if the string can be interpreted as a phone number,
         * false if not.
         */
        isNumber: function(number) {
            if (!number) {
                return false;
            }
            number = clean(number);
            return number.match(/^[\+\d]\d*$/) !== null;
        },

        /**
         * Determines if a number has a prefix or not.
         *
         * @param number the number to check for prefix
         * @precondition number contains only a starting '+' (optional) and
         * numbers. This is ensured by running clean on the number.
         * @return true if the number has a prefix, false if not.
         */
        hasPrefix: function(number) {
            if (!number) {
                return false;
            }
            var i;

            number = clean(number);

            for (i = 0; i < prefixes.length; i++) {
                if (number.match(prefixes[i])) {
                    return true;
                }
            }
            return false;
        },

        standardisePrefix: standardisePrefix,

        /**
         * Gets the country code matching the prefix of the number.
         *
         * @param number phone number to determine region for.
         * @precondition number contains only numbers and starts with a valid
         * prefix. This is ensured by running clean, hasPrefix and
         * standardisePrefix.
         * @return the region matching the prefix of the number
         */
        getRegion: function(number) {
            var prefix,
                num;

            num = standardisePrefix(number);
            prefix = num.substr(0, 4);
            return regions[prefix];
        },

        /**
         * Removes removes duplicates from an array of phone numbers. The order
         * of the array is preserved and only duplicates without a label are
         * removed.
         * @param numberArray
         * @return numberArray with no duplicate numbers without labels.
         */
        removeDuplicate: function (numberArray) {
            var rev;

            function removeLeftToRight(arr) {
                var found = {};

                return arr.map(function (num) {
                    var ret;

                    if (!found[num.number] || num.label) {
                        ret = num;
                    }

                    found[num.number] = true;
                    return ret;
                }).removeUndefined();
            }

            rev = removeLeftToRight(numberArray).reverse();
            return removeLeftToRight(rev).reverse();
        },

        /**
         * Formats the number according to country and phone number type
         * Denmark:             35 85 39 88
         * Denmark Mobile:      50 52 38 60
         * Norway               22 77 10 00
         * Norway premium       820 40 123
         *      premiums start with 8XX
         * Norway 5-digit       09999
         * Norway 4-digit       1880
         * Norway               22 77 10 00
         * Norway Mobile        957 30 187
         * Sweden:              08-333 22 44
         * Sweden Mobile        070 777 11 22
         */
        format: function (number, region, type) {
            if (region === 'se') return number;
            number = clean(number);

            if (region === 'dk' || region === 'dgs') {
                number = number.substring(0, 2) + ' ' +
                    number.substring(2, 4) + ' ' +
                    number.substring(4, 6) + ' ' +
                    number.substring(6);
            } else if (region === 'no') {
                if (type === 'mob') {
                    number = number.substring(0, 3) + ' ' +
                        number.substring(3, 5) + ' ' +
                        number.substring(5);
                } else if (number.match(/^8/ !== null) && number.length === 8) {
                    number = number.substring(0, 3) + ' ' +
                        number.substring(3, 5) + ' ' +
                        number.substring(5);
                } else if (number.length === 8) {
                    number = number.substring(0, 2) + ' ' +
                        number.substring(2, 4) + ' ' +
                        number.substring(4, 6) + ' ' +
                        number.substring(6);
                } else {
                    //return numbers as is for 5- and 4-digit numbers
                    number = number;
                }
            }

            return number;
        }
    }
}();

E.util.distance = {
    /**
     * Calculates the distance between a and b
     * @param a required. {lon, lat}
     * @param b required. {lon, lat}
     * @return the distance between a and b in kilometers.
     */
    calculate: function(a, b) {
        var lat1,
            lat2,
            lon1,
            lon2,
            R,
            dLat,
            dLon,
            a,
            c;

        lat1 = a.lat;
        lat2 = b.lat;
        lon1 = a.lon;
        lon2 = b.lon;

        R = 6371; // km
        dLat = (lat2-lat1).toRad();
        dLon = (lon2-lon1).toRad();
        lat1 = lat1.toRad();
        lat2 = lat2.toRad();

        a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
        c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    },


    /**
     * Rounds a number for displaying. This includes setting the correct unit
     * (meters or kilometers) and rounding to a display friendly value.
     *
     * @param dst required. distance in kilometers.
     * @return an object containing the rounded distance. the object contains
     * {dst, unit} where dst is the distance in unit.
     *
     */
    round: function (dst) {
        var len,
            unit;

        if (dst >= 1) {
            /* Trim length of distance string. */
            if (dst >= 100) {
                len = dst.toFixed(0);
            } else {
                len = dst.toFixed(1);
            }
            unit = E.locale.text.kilometers;
        } else {
            len = (dst * 1000).toFixed(0);
            unit = E.locale.text.meters;
        }


        return {
            dst: len,
            unit: unit
        };
    },

    /**
     * Translate distance string to meter number
     */
    distanceInMeters: function (dst) {
        var value;
        if (dst.match(/km/g)) {
           return (dst.replace(/[^\d.]+/,'') * 1000).toInt();
        } else if (dst.match(/m/g)) {
            return (dst.replace(/[^\d.]+/,'') * 1).toInt();
        } else {
            return 0;
        }
    }
};


/**
 * @return the lowest of a and b.
 */
E.util.min = function (a, b) {
    return a < b ? a : b;
};

/**
 * @return the highest of a and b.
 */
E.util.max = function (a, b) {
    return a > b ? a : b;
};

/**
 * @return boolean of float value 1 being greater than float value 2.
 */
E.util.greaterFloat = function (a, b) {
    var p = 1000000000000;
    return Math.round(parseFloat(a)*p)/p > Math.round(parseFloat(b)*p)/p;
};

/**
 * @return boolean of float value 1 being less than float value 2.
 */
E.util.lesserFloat = function (a, b) {
    var p = 1000000000000;
    return Math.round(parseFloat(a)*p)/p < Math.round(parseFloat(b)*p)/p;
};

/**
 * Caps a number for displaying in the result menu. Numbers bigger than 99 are
 * showns as "99+".
 *
 * @param num required.
 * @return the number, as a string if it's <= 99, "99+" otherwise.
 */
E.util.cap = function (num) {
    return num > 99 ? 99 + '<sup>+</sup>' : num.toString();
}

/**
 * Usa this to sort array of objects containing two properties in each object
 * sortKey which should be a string and data which could be anything.
 *
 * @param a object with two properties: sortKey and data
 * @param b object with two properties: sortKey and data
 * @return {Number} for sorting comparison
 */
E.util.sortResults = function (a, b) {
    if (a.sortKey < b.sortKey)
        return -1;
    if (a.sortKey > b.sortKey)
        return 1;
    return 0;
}

/**
 * A function for setting cookie
 * @param c_name the cookie name
 * @param value the content of the cookie
 * @param exdays number of days cookie is valid
 */
E.util.setCookie = function (c_name, value, exdays) {
    var exdate,
        host,
        topDomain,
        c_value;

    host = document.location.host.split('.');
    topDomain = '.' + host[host.length - 2] + '.' + host[host.length - 1];
    exdate = new Date();
    exdate.setDate(exdate.getDate() + exdays);
    c_value = escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());

    if (topDomain) {
        c_value += ";domain=" + topDomain;
    }
    document.cookie = c_name + "=" + c_value;
}

/**
 * A function for retrieving cookie content by name
 * @param c_name The name of the cookie
 * @return {*}
 */
E.util.getCookie = function (c_name) {
    var i,
        x,
        y,
        ARRcookies = document.cookie.split(";");
    for (i=0; i<ARRcookies.length; i++)
    {
        x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
        y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
        x=x.replace(/^\s+|\s+$/g,"");
        if (x == c_name)
        {
            return unescape(y);
        }
    }
}

/**
 *
 * @param needle the value to test is occuring in array
 * @param haystack the array of possible matching values
 * @return {Boolean}
 */
E.util.inArray = function (needle, haystack) {
    var length = haystack.length;
    for(var i = 0; i < length; i++) {
        if(haystack[i] === needle) return true;
    }
    return false;
}

E.util.getSpecialFont = function (font_constant) {
    var charCodes = {
        'WALK': 'C',
        'Buss': 'H',
        'Train': '(',
        'U': '?',
        'Tram': '(',
        'Air': 'D',
        'LINK_ICON': 'p',
        'Ship': 'G',
        'Ferry': 'G'
    };

    if (charCodes[font_constant] === undefined) {
        return '';
    }

    return charCodes[font_constant];
}

/**
 *
 * @param date string in format YYYY-mm-dd
 * @param time string in format hh:mm
 */
E.util.getDateObj = function (date, time) {
    return new Date(
        date.substr(0, 4),
        (parseInt(date.substr(5, 2)) - 1),
        date.substr(8, 2),
        time.substr(0, 2),
        time.substr(3, 2)
    )
}

E.util.writeAbreviateWeekTime = function (ms, now) {
    var date,
        hours,
        mins,
        day,
        idx;

    date = new Date(ms);
    mins = '' + date.getMinutes();
    hours = '' + date.getHours();

    if (now.getFullYear() + now.getMonth() + now.getDate() ===
        date.getFullYear() + date.getMonth() + date.getDate()) {
        day = E.locale.text.today;
    } else {
        idx = date.getDay() - 1;
        if (idx === -1) {
            idx = E.locale.text.week.length - 1;
        }
        day = E.locale.text.week[idx].substr(0,3);
    }
    return day + ' ' +
        (hours.length === 1 ? '0' + hours : hours) +
        ':' +
        (mins.length === 1 ? '0' + mins : mins);
}

E.util.writeTime = function (diff, hourNotation, minuteNotation, delimiterNotation) {
    var hours,
        minutes;

    hourNotation = hourNotation || 'h';
    minuteNotation = minuteNotation || 'min';
    delimiterNotation = delimiterNotation || ' - ';

    if (diff > 3600000 ) {
        hours = Math.floor(diff / 1000 / 60 / 60);
        diff -= hours * 1000 * 60 * 60;
        minutes = Math.floor(diff / 1000 / 60);
        return hours + hourNotation + delimiterNotation + minutes + minuteNotation;
    } else {
        return Math.floor(diff / 1000 / 60) + minuteNotation;
    }
}

E.util.writeLocalTime = function (diff, originalTime) {
    if (diff > 600000 ) {
        return originalTime;
    } else {
        return Math.floor(diff / 1000 / 60);
    }
}

/**
 *
 * @param dateObject
 * @param del
 * @return {String} "YYYY-MM-DD" + DELIMITER + "hh:ss"
 */
E.util.formatDateTime = function (dateObject, del) {
    var month,
        day,
        hours,
        mins;

    month = '' + (dateObject.getMonth() + 1);
    day = '' + dateObject.getDate();
    hours = '' + dateObject.getHours();
    mins = '' + dateObject.getMinutes();

    return dateObject.getFullYear() + '-' +
        (month.length === 1 ? '0' + month : month) + '-' +
        (day.length === 1 ? '0' + day : day) +
        (del || ' ') +
        (hours.length === 1 ? '0' + hours : hours)+ ':' +
        (mins.length === 1 ? '0' + mins : mins);
}
