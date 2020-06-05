/* Note to developers. This code is not very good looking, but it's code to fix
 * an ugly problem from the start. Hopefully the API will be updated in the
 * future to render this code unnecessary. If you have to work on it before
 * then, I'm sorry for the mess. Never expected anyone else would have to
 * touch this.
 *
 * /Göran
 */

E.openingHours = (function () {

    function clearWhitespaces(w) {
        var re = /\s/g;
        return w.replace(re, '');
    }

    function dayStringToNumeral(day, country) {
        day = day.toLowerCase();

        switch (country) {
            case E.constants.countryCode.se:
                switch (day) {
                case 'måndag':
                case 'mån':
                    return 0;
                case 'tisdag':
                case 'tis':
                    return 1;
                case 'onsdag':
                case 'ons':
                    return 2;
                case 'torsdag':
                case 'tor':
                    return 3;
                case 'fredag':
                case 'fre':
                    return 4;
                case 'lördag':
                case 'lör':
                    return 5;
                case 'söndag':
                case 'sön':
                    return 6;
                }
            break;
            case E.constants.countryCode.no:
            case E.constants.countryCode.dk:
            case E.constants.countryCode.dgs:
                switch (day) {
                case 'mandag':
                case 'man':
                    return 0;
                case 'tirsdag':
                case 'tir':
                    return 1;
                case 'onsdag':
                case 'ons':
                    return 2;
                case 'torsdag':
                case 'tor':
                    return 3;
                case 'fredag':
                case 'fre':
                    return 4;
                case 'lørdag':
                case 'lør':
                    return 5;
                case 'søndag':
                case 'søn':
                    return 6;
                }
            break;
            case E.constants.countryCode.pl:
                switch (day) {
                    case 'Poniedziałek':
                    case 'pon':
                        return 0;
                    case 'Wtorek':
                    case 'wto':
                        return 1;
                    case 'Środa':
                    case 'śro':
                        return 2;
                    case 'Czwartek':
                    case 'czw':
                        return 3;
                    case 'Piątek':
                    case 'pią':
                        return 4;
                    case 'Sobota':
                    case 'sob':
                        return 5;
                    case 'Niedziela':
                    case 'nie':
                        return 6;
                }
            break;
        }

        return -1;
    }

    function isDayspan(ds, country) {
        var word,
            re;

        word = clearWhitespaces(ds.toLowerCase());
        switch (country) {
        case E.constants.countryCode.se:
            re = /^(mån|tis|ons|tor|fre|lör|sön)-(mån|tis|ons|tor|fre|lör|sön)$/;
            break;
        case E.constants.countryCode.no:
        case E.constants.countryCode.dk:
        case E.constants.countryCode.dgs:
            re = /^(man|tir|ons|tor|fre|lør|søn)-(man|tir|ons|tor|fre|lør|søn)$/;
            break;
        case E.constants.countryCode.pl:
            re = /^(pon|wto|śro|czw|pią|sob|nie)-(pon|wto|sro|czw|pią|sob|nie)$/;
            break;
        }
        return re.test(word);
    }

    /* 0 = is not a day
     * 1 = is a day in shortened form (e.g. mån)
     * 2 = is a day with full name (e.g. måndag)
     */
    function isDay(ds, country) {
        var word,
            reShort,
            reLong;

        word = clearWhitespaces(ds.toLowerCase());
        switch (country) {
        case E.constants.countryCode.se:
            reShort = /^(mån|tis|ons|tor|fre|lör|sön)$/;
            reLong = /^(måndag|tisdag|onsdag|torsdag|fredag|lördag|söndag)$/;
            break;
        case E.constants.countryCode.no:
        case E.constants.countryCode.dk:
        case E.constants.countryCode.dgs:
            reShort = /^(man|tir|ons|tor|fre|lør|søn)$/;
            reLong = /^(mandag|tirsdag|onsdag|torsdag|fredag|lørdag|søndag)$/;
            break;
        case E.constants.countryCode.pl:
            reShort = /^(pon|wto|śro|czw|pią|sob|nie)$/;
            reLong = /^(Poniedziałek|Wtorek|Środa|Czwartek|Piątek|Sobota|Niedziela)$/;
            break;
        }

        if (reShort.test(word)) {
            return 1;
        }

        if (reLong.test(word)) {
            return 2;
        }

        return 0;
    }

    function handleDayspan(ds, country) {
        var fromString,
            toString,
            from,
            to;

        fromString = ds.substring(0, 3);
        toString = ds.substring(4, 7);

        from = dayStringToNumeral(fromString, country);
        to = dayStringToNumeral(toString, country);
        return {from: from, to: to};
    }

    function handleOpeningHours(dayspan) {
        var fromHours,
            fromMinutes,
            toHours,
            toMinutes,
            validTime,
            from,
            to,
            i,
            timeArray;

        validTime = /^\d{1,2}(:\d\d)?$/;
        i = 1;
        timeArray = [];

        while (dayspan['startTime' + i]) {
            from = dayspan['startTime' + i];
            to = dayspan['endTime' + i];
            from = from ? clearWhitespaces(from) : '';
            to = to ? clearWhitespaces(to) : '';

            if (validTime.test(from) && validTime.test(to)) {
                fromHours = from.substring(0, from.indexOf(':'));
                fromHours = parseInt(fromHours, 10);

                toHours = to.substring(0, to.indexOf(':'));
                toHours = parseInt(toHours, 10);

                fromMinutes = from.substring(from.indexOf(':') + 1);
                fromMinutes = parseInt(fromMinutes, 10);

                toMinutes = to.substring(to.indexOf(':') + 1);
                toMinutes = parseInt(toMinutes, 10);

                if (from === to) {
                    timeArray.push({from: {h: 0, m: 0}, to: {h: 24, m: 0}, open: true});
                } else {
                    timeArray.push({from: {h: fromHours, m: fromMinutes}, to: {h: toHours, m: toMinutes}, open: true});
                }
            } else {
                timeArray.push({open: false});
            }
            i++;
        }
        return timeArray;
    }

    return {
        parse: function (dayspans, country) {
            var from,
                to,
                time,
                interval,
                i,
                j,
                oHours,
                ds,
                dayNumber,
                hasOpenDay = false;

            oHours = new Array(7);
            for (i = 0; i < dayspans.length; i++) {
                ds = dayspans[i];
                time = handleOpeningHours(ds);

                if (isDayspan(ds.day, country)) {
                    interval = handleDayspan(ds.day, country);
                    from = interval.from;
                    to = interval.to;

                    for (j = from; j <= to; j++) {
                        oHours[j] = time;
                    }
                } else if (isDay(ds.day, country)) {
                    dayNumber = dayStringToNumeral(ds.day, country);
                    oHours[dayNumber] = time;
                }
            }

            // check if all days were successfully parsed
            for (i = 0; i < 7; i++) {
                if (oHours[i] === undefined) {
                    oHours[i] = {open: false};
                } else {
                    hasOpenDay = true;
                }
            }

            return (hasOpenDay) ? oHours : false;
        },

        isOpen: function (openingHours) {
            var date,
                today,
                yesterday,
                currentTime,
                openTime,
                closeTime;

            date = new Date();
            today = date.getDay() - 1;
            yesterday = (today === 0) ? 6 : today - 1;
            currentTime = date.getHours() * 60 + date.getMinutes();


            if (openingHours[today].open) {
                openTime = openingHours[today].from.h * 60 + openingHours[today].from.m;
                closeTime = openingHours[today].to.h * 60 + openingHours[today].to.m;
                if (currentTime >= openTime && currentTime <= closeTime) {
                    return true;
                } else if (openingHours[yesterday].open) {
                    openTime = openingHours[yesterday].from.h * 60 + openingHours[yesterday].from.m;
                    closeTime = openingHours[yesterday].to.h * 60 + openingHours[yesterday].to.m;

                    if (openTime > closeTime) {
                        openTime = 0;
                        return (currentTime >= openTime && currentTime <= closeTime);
                    } else {
                        return false;
                    }
                }
            }

            return false;
        },

        toPrintable: function (t) {
            var r = {from: {h: 0, m: 0}, to: {h: 0, m: 0}};

            r.from.h = (t.from.h < 10)
                ? '0' + t.from.h
                : t.from.h.toString();

            r.from.m = (t.from.m < 10)
                ? '0' + t.from.m
                : t.from.m.toString();

            r.to.h = (t.to.h < 10)
                ? '0' + t.to.h
                : t.to.h.toString();

            r.to.m = (t.to.m < 10)
                ? '0' + t.to.m
                : t.to.m.toString();

            return r;
        }

    };
}());
