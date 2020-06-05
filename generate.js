/**
 * Functions for generating html from translated API response data.
 */
E.generate = (function () {
    var listItem,
        div,
        p,
        smallStars,
        mediumStars,
        bigStars,
        facebook,
        linkedin,
        twitter,
        skype;

    /**
     * Creates a pair of html tags of type 'tag' with optional attribute and
     * class.
     * @param type required. type of tag.
     * @param attr optional. attr attribute to add to tag.
     * @param content required. content html to insert inside the tag
     * @param clas optional. clas class of the tag
     *
     * @example
     * tag('ul', 'style="color: orange"', '<li>Zebra</li><li>Crocodile</li>', 'animals')
     * // '<ul style="color: orange" class="animals"><li>Zebra</li><li>Crocodile</li></ul>'
     */
    function tag(type, attr, content, clas) {
        var html;

        html = clas ?
            '<' + type + ' class="' + clas + '"' :
            '<' + type;

        html += (attr ? ' ' + attr : '') + '>';

        return html + content + '</' + type + '>';
    }

    /**
     * Creates a pair of <li></li>-tags containing content. If clas is set, the
     * class = clas
     *
     * @param content html to insert inside the tag
     * @param clas class of the tag
     */
    listItem = tag.curry('li', null);

    /**
     * Creates a pair of <div></div>-tags containing content. If clas is set,
     * the class = clas
     * @param content. html to insert inside the tag
     * @param clas. class of the tag
     */
    div = tag.curry('div', null);

    /**
     * Creates a pair of <p></p>-tags containing content. If clas is set, the
     * class = clas
     * @param content html to insert inside the tag
     * @param clas class of the tag
     */
    p = tag.curry('p', null);

    /**
     * Creates a html link tag containing content.
     * @param href of the link
     * @param content inside the link tag
     * @param clas optional class of the tag
     * @param target optional target i.e. _blank, _parent, _self
     */
    function link(href, content, clas, target) {
        var attr;
        attr = 'href="' + href + '"';
        attr += target ? ' target="' + target +'" ': '';
        return tag('a', attr, content, clas);
    }

    /**
     * Creates a pair of <div></div>-tags of class 'category' containing
     * content. If clas is set, category, the class of the div is 'category' +
     * clas.
     * @param content html to insert inside the tag
     * @param clas additional class of the tag
     */
    function category(content, clas) {
        clas = clas
            ? 'category ' + clas
            : 'category';

        return div(content, clas);
    }

    /**
     * Generates a set of 5 stars corresponding to the rating. The rating
     * determines the type of the stars, full, half and empty.
     * The Rules for the Rating star is...
     * 1-1,24 in score = 1 sun/star
     * 1,25 - 1,74 in score = 1,5 suns/stars
     * 1,75 - 2,24 = 2 suns/stars
     * 4,75 - 5 = 5 stars
     * @param clas class of the container object.
     * @param rating (0-5)
     * @return div with class = clas containing 5 star-divs representing the
     * rating.
     */
    function stars(clas, rating) {
        var html,
            remaining,
            fullStars,
            halfStars,
            emptyStars,
            i;


        halfStars=0;
        fullStars = Math.floor(rating);
        remaining = (rating-fullStars).toFixed(2);
        if(remaining>0.24 && remaining<0.75){
            halfStars=1;
        }
        else if(remaining>0.75)
        {
            fullStars=fullStars+1;

        }
        else
        {
            halfStars=0;
        }
        emptyStars = 5 - (fullStars + halfStars);

        html = '';
        for (i = 0; i < fullStars; i++) {
            html += div('', 'full');
        }

        if (halfStars) {
            html += div('', 'half');
        }

        for (i = 0; i < emptyStars; i++) {
            html += div('', 'empty');
        }

        clas = 'stars' + (clas ? ' ' + clas : '');

        return div(html, clas);



    }

    /**
     * Functions for generating stars of class 'small_stars', 'medium_stars'
     * and 'large_stars'. See stars() for more details.
     *
     * @param rating (0-5)
     * @return div with specified class containing 5 star-divs representing the
     * rating.
     */
    smallStars = stars.curry('small_stars');
    mediumStars = stars.curry('medium_stars');
    bigStars = stars.curry('big_stars');

    /**
     * Creates a button linking to target. clas decides the type of button. label
     * is the button text.
     * @param target link of the button
     * @param clas class of the button
     * @param label button text
     *
     */
    function button(href, clas, label, target, font_text) {
        var html;


        html = font_text ? '<div class="'  + clas + '">' : '<div class="image '  + clas + '">' ;
        html += font_text ? font_text:'';
        html += '</div>';

        if (label) {
            html += '<div class="label">' + label + '</div>';
        }

        //return tag('span', null, html, 'button');
        return link(href, html, 'button', target);
    }

    /**
     *  Ctreats the icon on the right side for the detail page.  for example call icon, public transport icon ..ect..
     * @param clas class of the icon
     * @param label icon label
     * @param font_text
     */

    function icon(clas, label, font_text){

        var html;


        html = font_text ? '<div class="'  + clas + '">' : '<div class="image '  + clas + '">' ;
        html += font_text ? font_text:'';
        html += '</div>';

        if (label) {
            html += '<div class="label">' + label + '</div>';
        }

        return tag('span', null, html, 'button');

    }

    function orgIco(headerText, imagePath, label, href, linkClass, target) {
        var html;
        html = headerText ? tag('h3', '', headerText, 'head') : '';
        html += logoImg (imagePath, 'org_icon');
        html += tag('span', null, label, 'text');
        html = link(href, html, linkClass, target);

        return category(html, 'buttons');
    }

    function ealias(href, label, iconClass, iconText, linkClass, ealiasHeading, target, font_text) {
        var html;
        html = icon(iconClass, iconText, font_text);
        html += ealiasHeading ? tag('h3', '', ealiasHeading, 'head') : '';
        html += tag('span', null, label, linkClass);
        return category(link(href, html, 'full', target), 'buttons');
    }

    function ealiasGeneral(buttonClass, buttonText, linkClass, ea) {
        return ealias(ea, ea, buttonClass, buttonText, linkClass);
    }

    /**
     * Creates an email-category. This includes the email link as well as a
     * button of type 'email'.
     * @param mail address to create link for. Contains link and label.
     */
    function email(mail) {
        return ealias('mailto:' + mail.link, mail.label, 'email_button email_link',
            '', 'email_link', E.locale.text.email);
    }

    /** Creates a homepage-category. This includes the homepage link as well as
     * a button of type 'homepage'.
     *
     * @param hpage
     */
    function homepage(hpage) {
        return ealias(hpage.link, hpage.label, 'homepage_button homepage_link',
            '', 'homepage_link', hpage.headerText || E.locale.text.homepage, '_blank');
    }

    function skype(skypeid) {
        return ealias(skypeid.link, skypeid.label, 'skype_button skype_link',
            '', 'homepage_link', skypeid.headerText || E.locale.text.skype, '_blank');
    }
    function facebook(facebookid) {
        return ealias(facebookid.link, facebookid.label, 'facebook_button facebook_link',
            '', 'homepage_link', facebookid.headerText || E.locale.text.facebook, '_blank');
    }
    function twitter(twitterid) {
        return ealias(twitterid.link, twitterid.label, 'twitter_button twitter_link',
            '', 'homepage_link', twitterid.headerText || E.locale.text.twitter, '_blank');
    }
    function linkedin(linkedinid) {
        return ealias(linkedinid.link, linkedinid.label, 'linkedin_button linkedin_link',
            '', 'homepage_link', linkedinid.headerText || E.locale.text.linkedin, '_blank');
    }

    function organizationIcon(icon) {
        return orgIco(icon.headerText, icon.imagePath, icon.label, icon.link, 'org_ico_link', '_blank');
    }

    function pubTransStops(street, location, name) {
        var url;

        url = '#' + E.page.name.nearByStations;
        url += '&name=' + name;
        url += '&lat=' + location.lat;
        url += '&lon=' + location.lon;

        return ealias(url, E.locale.text.nearBy + ' ' + street, 'eniro_font publicTrans_icon',
            '', 'homepage_link', E.locale.text.pubTransStops, '', 'B');


    }


    /**
     * Creates an apropriate label for a phone number. The logic is as follows:
     * If the number has a label, display it. If it has a number and is type
     * 'fax', display the label followed by parenthesis 'fax'. If the number is
     * type 'fax' but lacks a label, use 'fax' as the label. If the number has
     * neither a label or is type 'fax' no label is shown.
     *
     * @param number phone number containing type and label.
     * @example phoneLabel({label: 'Support', type: 'fax'})
     * // <div class="number_label">Support (FAX)</div>
     */
    function phoneLabel(number) {
        var label;

        if (number.label || number.type === 'fax') {
            if (number.label) {
                label = number.label;
                if (number.type === 'fax' && number.label.toLowerCase().trim() !== 'fax') {
                    label += ' (' + E.locale.text.fax + ')';
                }
            } else {
                number.label = E.locale.text.fax;
            }
            return div(label, 'number_label');
        }
        return '';
    }

    /**
     * Generates a phone number for displaying in the details field. A phone
     * number consists of a number link, an optional label and buttons
     * depending on number type: for fax, no buttons, for mobile, a call- and a
     * sms- button, for other numbers a call button.
     *
     * @param number number containing phoneNumber, type and label.
     */
    function phoneNumber(number) {
        var type,
            html,
            target,
            cleanedNumber,
            buttons,
            linkText;

        cleanedNumber = number.number ? E.util.number.clean(number.number) : '';

        type = 'phone_link';
        if (number.type === 'fax') {
            type += ' fax_number';

            buttons = '';
        } else if (number.type === 'mob') {
            type += ' mobile_number';

            target = 'tel:' + cleanedNumber;
            buttons = button(target, 'call_button', '');

            target = 'sms:' + cleanedNumber;
            buttons += button(target, 'sms_button');
        } else {
            target = 'tel:' + cleanedNumber;
            buttons = button(target, 'call_button', '');
        }

        linkText = E.util.number.format(number.number, E.locale.region, number.type) +
            (number.type === 'fax' ? ' - ' + E.locale.text.fax : '');

        html = buttons;
        if (number.type === 'fax') {
            html += div(linkText, type);
        } else {
            html += link('tel:' + cleanedNumber, linkText, type);
        }

        return category(html, 'buttons phone_link');
    }

    /** Creates a deeplink-category. This includes the deeplink as well as
     * a button of type 'deeplink'.
     *
     * @param dlink
     */
    function deeplink(dlink) {
        var html,
            target;

        target = dlink.link;

        html = button(target, 'deeplink_button');
        html += link(target, dlink.label, 'deeplink_link');

        return category(html, 'buttons');
    }

    /**
     * Generates a text from the address to display in the from-field of a
     * route search. The name of the link will be street if it's sent or
     * [lon, lat] if not.
     *
     * @param pos required. long/lat. used if no valid address can be generated
     * @param street optional.
     */
    function routeLinkName(pos, street) {
        return street || '[' + pos.lon + ', ' + pos.lat + ']';
    }

    /**
     * Generates the target part of a link to the route search page.
     *
     * @param pos required. lon/lat
     * @param street optional.
     */
    function routeLinkTarget(pos, street) {
        var currentPos;
        currentPos = E.geo.getPos();
        if (E.geo.hasGeo() && currentPos.lon && currentPos.lat) {
            return '#' + E.page.name.routeResult +
                '&fromName=' + E.locale.text.myPosition.encodeUtf8() +
                '&fromLon=' + currentPos.lon +
                '&fromLat=' + currentPos.lat +
                '&toName=' + routeLinkName(pos, street).encodeUtf8() +
                '&toLon=' + pos.lon +
                '&toLat=' + pos.lat;
        }

        return '#' + E.page.name.routeSearch +
            '&toName=' + routeLinkName(pos, street).encodeUtf8() +
            '&toLon=' + pos.lon +
            '&toLat=' + pos.lat;
    }

    /**
     * Generates the links to the map and the route search.
     *
     * @param pos required. lon/lat
     * @param type required. '\'company\'' or '\'person\''. used for selecting
     * poi to use when shown on map.
     * @param street optional. will be used as name in the route search.
     */
    function mapLinks(pos, type, street) {
        var target,
            icon,
            text,
            html;

        target = routeLinkTarget(pos, street);

        icon = div('', 'icon');
        text = div(E.locale.text.routeDescription, 'text');
        html = link(target, icon + text, 'route_link');

        target = 'javascript:E.details.showMap(' + pos.lon + ',' +
            pos.lat + ', ' + type;

        if (pos.zoomLevel) {
            target += ',' + pos.zoomLevel;
        }

        target += ')';

        text = div(E.locale.text.map, 'text');
        html += link(target, icon + text, 'map_link');

        return category(html, 'map_links buttons');
    }

    /**
     * Generates a single address.
     *
     * @param street optional.
     * @param post optional.
     */
    function detailsAddress(street, post) {
        var html;

        html = '';

        if (street) {
            html += tag('span', null, street, 'streetname');
        }
        if (post) {
            html += tag('span', null, post, 'postarea');
        }
        return html;
    }

    /**
     * Generates an image containing a logo.
     *
     * @param logo required.
     */
    function logoImg(logo, clas) {
        return '<img src="' + logo + '" ' + (clas ? 'class="' + clas + '"' : '') + ' alt="logo" />';
    }

    /**
     * Generates a call-button for the result list. The button will contain a
     * tel-link if numbers contain only a single callable (not fax) number. If
     * numbers contain multiple phone numbers, the button should link to the
     * details page. A link to the details page should be passed by target.
     *
     * @param numbers a non-empty array containing the numbers.
     * @param target of link if numbers contain more than one number. Should be
     * the link to the details page.
     */
    function resultPhoneButton(numbers, target) {
        target = numbers.length > 0 &&
            numbers.first().number &&
            numbers.first().type !== 'fax'
            ? 'tel:' + E.util.number.clean(numbers.first().number)
            : target;

        return button(target, 'call_button phone_link', '');
    }

    /**
     * Generates a block of html containing a mix of text and links.
     *
     * @param arr required. array containing objects of either type: {text}
     * or type: {url: {proto, link, text}}
     */
    function mixedText(arr) {
        return arr.map(function (e) {
            var target;

            if (e.text) {
                return e.text;
            } else if (e.url && e.url.proto && e.url.url_text && e.url.link) {
                target = e.url.proto + '://' + e.url.link;
                return link(target, e.url.url_text);
            }
        }).join(' ');
    }

    /**
     * Creates a free text object containg an optional label and a body.
     *
     * @param f required. freetext object.
     */
    function freeText(f) {
        var html;

        html = '';
        if (f.label) {
            html += div(f.label, 'free_text_header');
        }
        html += div(mixedText(f.mixedText), 'free_text_content');

        return category(html, 'freetext');
    }

    /**
     * Creates a details header for company and person.
     *  Logo image needs to be checked.
     * @param street optional.
     * @param post optional
     * @param name required.
     * @param logo optional.
     * @param region required.
     */
    function detailsHeader(street, post, name, logo, region, addrLoc, homepage) {
        var content;
        content = tag('span', null, name, 'header');
        if (homepage && logo) {
            content +=
                link(
                    homepage[0].link,
                    logoImg(logo.image),
                    'logo_link logo_container',
                    '_blank'
                )
             + detailsAddress(street, post);
        } else if (logo) {
            content += div(
                    logoImg(logo.image),
                    'logo_container'
                ) +
                detailsAddress(street, post);
        } else {
            content += detailsAddress(street, post);
        }

        if (addrLoc && E.geo.hasGeo()) {
            content += distance(addrLoc, E.geo.getPos())
        }

        content = p(content, 'details_header');

        if (addrLoc) {
            content += mapLinks(addrLoc, '\'company\'', street);
        }

        return category(content);
    }

    /**
     * attempts to parse and display opening hours. if the parsing succeeds,
     * the days will be shown in standard format: one line per weekday and the
     * current weekday highlighted. If parsing fails, each element in the
     * dayspans array will be shown on an own line and no highlighting will
     * occur.
     *
     * @param dayspans required. the dayspans object from the openingHours
     * object
     * @param region required.
     */
    function openingHours(dayspans, region) {
        var html,
            day,
            time,
            t,
            today,
            clas,
            hours,
            i,
            j,
            d,
            dayPrinted;

        hours = E.openingHours.parse(dayspans, region);

        if (hours) {
            today = new Date().getDay() - 1;
            html = '';
            for (i = 0; i < hours.length; i++) {
                day = div(E.locale.text.week[i], 'day');
                dayPrinted = false;
                for (j = 0; j < hours[i].length; j++) {
                    if (hours[i][j].open) {
                        d = E.openingHours.toPrintable(hours[i][j]);
                        t = d.from.h + ':' + d.from.m + '-' + d.to.h + ':' + d.to.m;
                    } else {
                        t = E.locale.text.closed;
                    }
                    if (i === today) {
                        clas = 'today dayline';
                    } else {
                        clas = 'dayline';
                    }
                    clas += (j === hours[i].length - 1 ? ' last' : '');
                    time = div(t, 'time');
                    html += (dayPrinted ? div(time, clas) : div(day + time, clas));
                    dayPrinted = true;
                }
            }
        } else {
            html = dayspans.map(function (d) {
                day = div(d.day, 'day');
                time = div(d.startTime1 + '-' + d.endTime1, 'time');
                return div(time + day);
            }).join('');
        }
        html = div(html, 'ot_wrapper');
        return category(html, 'opening_hours');

    }

    /**
     * Contains the header of the review part.
     *
     * @param numRatings required.
     * @param averageRating required.
     */
    function reviewHeader(numRatings, averageRating) {
        var ratingStars,
            ratingLogo;

        ratingStars = mediumStars(averageRating);
        ratings = numRatings + ' ' + E.locale.text.ratings;
        ratingLogo = div('', 'review_icon');

        return div(ratingStars + ratingLogo, 'review_header');
    }

    /**
     * Generates a single review.
     *
     * @param review required.
     */
    function singleReview(review) {
        if (review === undefined) {
            return '';
        }
        var html,
            d,
            response;

        html = '';

        if (review.summary) {
            html += div(review.summary, 'summary');
        }

        if (review.rating) {
            html += smallStars(review.rating);
        }

        d = '';
        if (review.alias) {
            d += div(review.alias, 'alias') + ' ';
        }

        if (review.date) {
            d += div(review.date.day, 'date');
        }

        if (d) {
            html += div(d);
        }

        html += div(review.text, 'text');

        if (review.response) {
            response = div(review.response.text, 'text');

            if (review.response.date) {
                response += div(review.response.date.day, 'date');
            }
            html += div(response, 'response');
        }
        return div(html, 'review');
    }

    /**
     * Generates the enitre review part of the page.
     *
     * @param numRatings required
     * @param averageRating required
     * @param revs required - The reviews
     */
    function reviews(numRatings, averageRating, revs) {
        var html;

        html = reviewHeader(numRatings, averageRating);

        html +=  revs.map(singleReview).join('');

        return category(html, 'reviews');
    }

    /**
     * Generates a single address for a person in the person details page.
     * @param addr required.
     */
    function personAddressSingle(addr) {
        var html,
            addrHtml,
            post;

        addrHtml = '';

        if (addr.street) {
            addrHtml += tag('span',null, addr.street, 'street');
        }

        if (addr.city) {
            post = '';
            if (addr.postCode) {
                post = addr.postCode + ' ';
            }
            post += addr.city;
            addrHtml += tag('span',null, post, 'post');
        }

        if (addr.location && E.geo.hasGeo()) {
            addrHtml += distance(addr.location, E.geo.getPos());
        }

        html = p(addrHtml, 'person_details_address');


        if (addr.location) {
            html += mapLinks(addr.location, '\'person\'', addr.street);
        }

        if (addr.phone && addr.phone.length) {
            addr.phone.map(function (num) {
                html += phoneNumber(num);
            });
        }

        return category(html, 'person_address_multiple');
    }

    /**
     * Generates a single address for a person in the person details page.
     * @param addr required.
     */
    function personAddressMultiple(addr, index) {
        var html;

        html = div(E.locale.text.address + ' ' + (index + 1), 'address_separator');

        html += personAddressSingle(addr);

        return p(html, 'address_multiple');
    }

    /**
     * Returns a string containing the distance between a and b, rounded an
     * in an appropriate unit.
     *
     * @param a required. lon/lat
     * @param b required. lon/lat
     * @example distanceInner({lon: 18, lat: 55}, {lon: 19, lat: 56})
     * // "128 km"
     */
    function distanceInner(a, b) {
        var dst;

        dst = E.util.distance.calculate(a, b);
        dst = E.util.distance.round(dst);

        return dst.dst + ' ' + dst.unit;
    }

    /**
     * Generates a div containing the distance between a and b.
     *
     * @param a required. lon/lat
     * @param b required. lon/lat
     */
    function distance(a, b) {
        return tag('span', null, distanceInner(a, b), 'distance');
    }

    /**
     * Generates a div for holding location data until geolocation can be
     * determined. This div can later be converted to a visible text by
     * E.companyResult.updateDistances.
     *
     * NOTE: This object should be hidden by the css.
     *
     * @param location required.
     */
    function locationData(location) {
        return div(div(location.lon, 'lon') + div(location.lat, 'lat'), 'location_data');

    }

    /**
     * Creates and adds an empty slideshow element. It will be initiated at
     * company details page.
     *
     * @param slideshow required.
     */
    function makeSlideshow(slideshow) {
        var html,
            indicator,
            i;

        html = div('<img class="background" />' +
            '<img class="foreground" />' +
            '<img class="loader" style="display: none">',
            'slideshow_container');

        html += link('javascript:E.companyDetails.slideshow.prev();',
            '', 'prev');
        html += link('javascript:E.companyDetails.slideshow.next();',
            '', 'next');

        indicator = '';
        for (i = 0; i < slideshow.length; i++) {
            indicator += div('');
        }
        html += div(indicator, 'indicator');

        return html;
    }


    function ojOj(data, region) {
        var html,
            url,
            vars,
            search_word,
            subject;

        vars = E.util.getUrlVars();
        search_word = '';
        if (vars && vars.searchWord && vars.searchWord !== '') {
            search_word = vars.searchWord;
        } else if (E.globals.getPrevSearchWord() && E.globals.getPrevSearchWord() !== '') {
            search_word = E.globals.getPrevSearchWord();
        }

        subject = 'Over - HEADING_EXACT%20-%20%22' + search_word + '%22%20-%20' + data.name;

        url = E.globals.getOnlineBaseUrl() +
            '/query?mail_type=reportIrrelevantHit' +
            '&what=mail' +
            '&advert_code=' + vars.eniroId +
            '&search_word=' + search_word +
            '&subject=' + subject +
            '&rand=' + parseInt((new Date()).getTime());

        html = div(link(
                            url,
                            tag('span', null, E.locale.text.ojojText, 'ojoj'),
                            'ojoj',
                            '_blank'
                        ),
                        'category buttons');

        return html;
    }

    /**
     *
     * @param dest
     * @param orig
     */
    function calcDuration(dest, orig) {
       var endDate,
           startDate,
           diff,
           hours,
           minutes;
        //new Date(year, month, day, hours, minutes, seconds, milliseconds)

        endDate = E.util.getDateObj(dest.date, dest.time);
        startDate = E.util.getDateObj(orig.date, orig.time);

        diff = endDate.getTime() - startDate.getTime();
        return diff;
//        hours = Math.floor(diff / 1000 / 60 / 60);
//        diff -= hours * 1000 * 60 * 60;
//        minutes = Math.floor(diff / 1000 / 60);
//
//        return (hours < 9 ? "0" : "") + hours + ":" + (minutes < 9 ? "0" : "") + minutes;
    }

    /**
     *
     * @param leg
     */
    function publicLegNumber(leg) {
        var lineNo,
            i,
            size,
            notes;

        if (leg.Notes && leg.Notes.Note) {
            notes = leg.Notes.Note;
            size = notes.length;
        }
        switch (leg.type) {
            case 'Air':
                if (notes) {
                    for (i = 0; i < size; i++) {
                        if (notes[i].key === 'RZ') {
                            lineNo = notes[i]['$'];
                            lineNo = lineNo.split('#')[1];
                            break;
                        }
                    }
                }
                break;
            default:
                lineNo = leg.local;
                break;
        }

        return lineNo;
    }

    /**
     *
     * @param leg
     */
    function publicLegName(leg) {
        var lineName,
            i,
            size,
            notes;

        if (leg.Notes && leg.Notes.Note) {
            notes = leg.Notes.Note;
            size = notes.length;
        }
        switch (leg.type) {
            case 'Air':
                if (notes) {
                    for (i = 0; i < size; i++) {
                        if (notes[i].key === 'CN') {
                            lineName = notes[i]['$'];
                            break;
                        }
                    }
                }
                break;
            default:
                lineName = leg.direction;
                if (notes) {
                    for (i = 0; i < size; i++) {
                        if (notes[i].key === 'RB') {
                            lineName = notes[i]['$'];
                            break;
                        }
                    }
                }
                break;
        }

        return lineName;
    }

    /**
     *
     * @param trip object containing a public route
     * @return string of html content
     */
    function publicRouteTrip(trip, idx) {
        var main,
            leg,
            duration,
            icons,
            hours,
            minutes,
            details,
            detailsContent,
            i,
            size,
            curDuration,
            legNumber,
            legName,
            day,
            endDate,
            startDate,
            startOrigin,
            endDestination;

        duration = 0;
        walkDuration = 0;
        icons = [];
        details = '';
        detailsContent = '';
        size = trip.LegList.Leg.length;
        endDestination = trip.LegList.Leg[size - 1].Destination;
        startOrigin = trip.LegList.Leg[0].Origin;


        for (i = 0; i < size; i++) {
            leg = trip.LegList.Leg[i];

            // calculate time difference between dest and orig
            curDuration = calcDuration(leg.Destination, leg.Origin);
            if (leg.type === 'WALK') {
                detailsContent = tag('span', '', E.util.getSpecialFont(leg.type), 'eniro_font icon') +
                    div('', 'line') +
                    div(
                        tag(
                            'span',
                            null,
                            E.locale.text.walk + ' ' +
                            E.locale.text.to.toLowerCase() + ' ' +
                            leg.Destination.name,
                            'leg_trans_descr'
                        ) +
                        tag('span', '', 'ca. ' + Math.floor(curDuration / 1000 / 60) + ' min', 'walkduration'),
                        'route_details_text'
                    );
                //navigate to the location in the map
                detailsContent = tag('a',
                    'href="javascript:E.map.setPosition(' + leg.Origin.lon + ',' + leg.Origin.lat + ');E.toggle.down();"',
                    detailsContent,
                    '',
                    null
                );

            } else {
                legNumber = publicLegNumber(leg);
                legName = publicLegName(leg);
                icons.push(
                    tag('span', null, E.util.getSpecialFont(leg.type), 'trans_icon eniro_font') +
                        (leg.local ? tag('span', null, leg.local, 'trans_trans_no') : '')
                );
                detailsContent = tag('span', '', E.util.getSpecialFont(leg.type), 'eniro_font icon') +
                    div('', 'line') +
                    div(
                        div(
                            (legNumber ? tag('span', null, legNumber, 'leg_trans_no') : '') +
                            tag('span', null, legName, 'name'),
                            'row direction'
                        ) +
                        div(
                            tag('span', null, E.locale.text.from + ':', 'label') +
                            tag('span', null, leg.Origin.name.decodeUtf8(), 'leg_name') +
                            tag('span', null, leg.Origin.time, 'leg_trans_time'),
                            'row leg_from'
                        ) +
                        div(
                            tag('span', null, E.locale.text.to + ':', 'label') +
                            tag('span', null, leg.Destination.name.decodeUtf8(), 'leg_name') +
                            tag('span', null, leg.Destination.time, 'leg_trans_time'),
                            'row leg_to'
                        ) +
                        tag('span', null, E.util.writeTime(curDuration, 't'), 'transduration') +
                        tag('span', '', E.util.getSpecialFont('LINK_ICON'), 'link_icon eniro_font'),
                        'route_details_text'
                    );

                //make it a link to alternative departure view
                //publicStation: function (stopId, direction, stopPos, from, toName, endDest) {
                detailsContent = tag('a',
                    'href="' + E.makeUrl.publicStation(leg.Origin.id,
                        leg.Destination.id,
                        leg.Origin,
                        null,
                        leg.Destination.name,
                        endDestination) + '"',
                    detailsContent,
                    'station_details',
                    null
                );
            }

            details += listItem(detailsContent, 'pub_trans_route_details');
        }

        details = listItem(
                tag('span', '', 'A', 'icon') +
                div('', 'line') +
                tag(
                    'span',
                    '',
                    startOrigin.name +
                    ' - ' +
                    startOrigin.time,
                    'text'
                ),
                'start_item'
            ) +
            details +
            listItem(
                tag('span', '', 'B', 'icon') +
                div('', 'line') +
                tag(
                    'span', '',
                    endDestination.name +
                    ' - ' +
                    endDestination.time,
                    'text'
                ),
                'end_item'
            );
        details = tag('ul', 'data-trip-details="' + idx + '"', details, 'trip_details_list');

        main = '';

        startDate = new Date(E.util.getDateObj(startOrigin.date, startOrigin.time));
        endDate = new Date(E.util.getDateObj(endDestination.date, endDestination.time));
        duration = endDate.getTime() - startDate.getTime();
        //more than 1 hour trip, display hours and minutes, otherwise just minutes
        main += tag('span', null, E.util.writeTime(duration, 't'), 'total_duration');

        day = startDate.getDay();

        if (day === 0) {
            day = E.locale.text.week[6].substr(0, 3);
        } else {
            day = E.locale.text.week[day - 1].substr(0, 3);
        }

        //trips starting and ending same date
        if (startOrigin.date === endDestination.date) {
            main += tag(
                'span',
                null,
                day + ' ' +
                startOrigin.time + ' - ' +
                endDestination.time,
                'trip_times'
            );
        } else {
            var nextDay;

            nextDay = endDate.getDay();
            if (nextDay === 0) {
                nextDay = E.locale.text.week[6].substr(0, 3);
            } else {
                nextDay = E.locale.text.week[nextDay - 1].substr(0, 3);
            }
            main += tag(
                'span',
                null,
                day + ' ' +
                startOrigin.time +
                ' - ' +
                nextDay + ' ' +
                endDestination.time,
                'trip_times'
            );
        }

        main += div(icons.join(tag('span', null, '|', 'trans_delimiter')), 'trip_icons');
        main = link(location.href + '&expandRoute=' + idx,
            div(tag('span', null, '#' + (idx + 1), 'trip_no'), 'trip_no_wrapper') +
            div(main, 'trip_text'),
            'toggle_public_route', null);
        main += details;
        return main;
    }

    /**
     *
     * @param departure object with departure data
     * @param idx index of the current departure
     */
    function publicStationDeparture(departure, idx) {
        var main,
            leg,
            duration,
            icons,
            hours,
            minutes,
            datetime,
            departureNo,
            departureName;

        departureNo = publicLegNumber(departure);
        //departureName = publicLegName(departure) || departure.direction;
        departureName = departure.direction;
        datetime = E.util.getDateObj(departure.date, departure.time).getTime();

        main = '';
        if (departureNo) {
            main += tag('span', null, departureNo, 'route_no');
        } else {
            main += tag('span', null, E.util.getSpecialFont(departure.type), 'route_no eniro_font');
        }

        main += div(
            tag('span', null, departureName, 'direction') +
            tag('span', null, E.locale.text.publicTransport[departure.type], 'type'),
            'text'
        );
        main += div(
            tag(
                'span',
                'data-realtime="' + datetime + '"' +
                ' data-time="' + departure.time + '" ', '', 'realtime local'
            ) +
            tag('span', null, 'MIN', 'minute_notation'),
            'realtime_wrapper'
        );
        return main;
    }

    function pubtransAlternateLocation(dest, orig, isTrip) {
        var main,
            urlvars,
            param,
            url,
            toName,
            mapurl,
            map,
            width,
            alternateText;
        main = '';
        url = '#' + E.page.name.pubRouteResult;
        urlvars = E.util.getUrlVars();

        toName = (urlvars.toName).decodeUtf8();
        url += '&toName=' + urlvars.toName;
        url += '&toLat=' + urlvars.toLat;
        url += '&toLon=' + urlvars.toLon;

        url += '&fromName=' + orig.name + '&fromLon='+ orig.lon + "&fromLat=" + orig.lat;

        alternateText = isTrip ? E.locale.text.missedDeparture : E.locale.text.stationRoute;

        main += div(
            tag('span', null, alternateText + ' ' + toName , 'alternate') +
            tag('span', null, 'p', 'link_icon eniro_font'),
            'route_details_text'
        );

        main = tag('a','href="' + url + '" id="alternate_public_route_button"', main, '');

        width = $(window).width()-20;
        if(width>1200){
            width = 1200;
        }

        poiString = isTrip ? orig.lon + "," + orig.lat : dest.lon + "," + dest.lat;

        mapurl = "http://kartor.eniro.se/api/statmap?cc=" + poiString +
                "&zoom=15" +
                "&p=" + poiString +
                 ";mysymbol&mysymbol=http://mobil.gulesider.no/images/poiLocation.png,15,36" +
                 "&iwidth=" + width +
                 "&iheight=100";
        map = '<img src="' + mapurl + '" alt=logo class=depLocation />';

        main += tag('a','href="' + "javascript:E.routeResult.showDeparturePOI( " + poiString + " )" + '" id=""', map, '');

        return main;
    }

    function nearbyStop(stop, localPos) {
        var main,
            distance,
            url,
            urlVars;

        urlVars = E.util.getUrlVars();

        distance = Math.floor(E.util.distance.calculate(
            {
                lat: Number(localPos.lat),
                lon: Number(localPos.lon)
            },
            {
                lat: Number(stop.lat),
                lon: Number(stop.lon)
            }
        )*1000);

        main = "";
        main += tag('span', null, 'B', 'left icon eniro_font');
        main += tag('span', null, stop.name, 'text');

        main += div(
            tag('span', null, distance + "m", 'text') +
                tag('span', null, 'p', 'icon eniro_font'),
            'right'
        );


        url = '#' + E.page.name.publicStation +
            '&stopId=' + stop.id +
            '&toName=' + stop.name +
            '&stopLat=' + stop.lat +
            '&stopLon=' + stop.lon;

        if (urlVars && urlVars.lat & urlVars.lon) {
            url += '&lat=' + localPos.lat +
                '&lon=' + localPos.lon;
        }

        main = link(url, main, 'station_link', null);

        return main;
    }

    return {
        /**
         * Generates a single company result item.
         *
         * @param data required.
         * @param region required.
         */
        companyResult: function (data, region) {

            var rating,
                content,
                mainContent,
                logo,
                main,
                mainClass,
                headerClass,
                target,
                location,
                street,
                city,
                formattedNumber,
                header;

            rating = data.rating && E.locale.region !== 'pl' ? smallStars(data.rating) : '';

            target = '#' + E.makeUrl.companyDetails(data.eniroId, region);

            mainClass = data.phone ? 'details_link' : 'details_link_no_phone';

            headerClass = data.bold ? 'header bold' : 'header';

            header = p(data.name, headerClass);
            mainContent = '';

            if (data.street && data.street.trim() !== '') {
                street = data.street;
                mainContent += p(street.trim() + (data.city || data.postcode ? ',' : ''), 'street');

                if (data.postcode && data.city) {
                    mainContent += p(data.postcode + ' ' + data.city, 'postarea');
                } else if (data.postcode) {
                    mainContent += p(data.postcode, 'postarea');
                } else if (data.city) {
                    mainContent += p(data.city, 'postarea');
                }

            } else if (data.city) {
                city = '';
                if (data.postcode) {
                    city +=  data.postcode + ' ';
                }
                city += data.city;

                mainContent += p(city, 'street');
            }
            if (data.phone && data.phone.first()) {
                formattedNumber = E.util.number.format(data.phone.first().number,
                    E.locale.region,
                    data.phone.first().type)
                mainContent +=  p(formattedNumber, 'phone');
            }

            location = '';

            if (data.location) {
                if (E.geo.hasGeo()) {
                    location = distance(data.location, E.geo.getPos());
                    E.map.addCompanyPoi(data.location, function () {
                        window.location = target;
                        E.map.setPosition(data.location.lon, data.location.lat, 200);
                        E.logging.logPOI(data.eniroId);
                    });
                } else {
                    location = locationData(data.location);

                }
            }

            if (data.logo) {
                content = logoImg(data.logo);
                logo = div(content, 'logo');
                mainContent += location;
                main = div(mainContent, 'main_logo');
                main = link(target, header + logo + main, mainClass);
            } else {
                mainContent += location;
                main = link(target, header + mainContent, mainClass);
            }

            if (data.phone) {
                main += resultPhoneButton(data.phone, target);
            }

            if (data.pack === 'vip' || data.pack === 'gold' || data.pack === 'silver') {
                main += div('', data.pack);
            }
            main += rating;

            return tag('li', 'data-eniroid="' + data.eniroId + '"', main, 'result company');
        },

        /**
         * Generates all info for a company on the company details page.
         *
         * @param data required.
         * @param region required.
         */
        companyDetails: function (data, region) {
            var main;

            main = detailsHeader(data.street, data.post, data.name,
                data.logo, region, data.location, data.homepage);

            if (data.phone) {
                main += data.phone.map(phoneNumber).join('');
            }

            if (data.email) {
                main += data.email.map(email).join('');
            }

            if (data.homepage) {
                main += data.homepage.map(homepage).join('');
            }

            if (data.facebook) {
                main += data.facebook.map(function (url) {
                    return facebook({link: url, label: url});
                }).join('');
            }

            if (data.location && region==='no') {
                main += pubTransStops(data.street, data.location, data.name);
            }

            if (data.organization_icon){
                main += data.organization_icon.map(organizationIcon).join('');
            }

            if (data.deeplinks) {
                main += data.deeplinks.map(deeplink).join('');
            }

            if (data.description) {
                main += freeText(data.description);
            }

            if (data.openingHours) {
                main += openingHours(data.openingHours.date.hours.dayspans,
                    region);
            }

            if (data.slideshow && region !== 'dgs') {
                main += category(makeSlideshow(data.slideshow), 'slideshow');
            }

            /*
             * NOTE: if data reviews exist but rating does not, this should
             * mean there's an error in the API
             */
            if (data.review && data.rating && E.locale.region !== 'pl') {
                main += reviews(data.review.list.length, data.rating,
                    data.review.list);
            }

            if (E.locale.region !== 'pl') {
                main += ojOj(data, region);
            }


            return main;
        },

        /**
         * Generates a single person result item.
         * @param data required.
         * @param region required.
         */
        personResult: function (data, region) {
            var main,
                mainClass,
                addr,
                target,
                button,
                location,
                clas,
                formattedNumber;

            main = p(data.name, 'name bold');

            target = '#' + E.makeUrl.personDetails(data.recordId, region);

            if (data.street && data.street.trim() !== '') {
                main += p(data.street.trim() + (data.city || data.postcode ? ',' : ''), 'street');

                if (data.postcode && data.city) {
                    main += p(data.postcode + ' ' + data.city, 'postarea');
                } else if (data.postcode) {
                    main += p(data.postcode, 'postarea');
                } else if (data.city) {
                    main += p(data.city, 'postarea');
                }

            } else if (data.city && data.postcode) {
                main += p(data.postcode + ' ' + data.city, 'location');
            } else if (data.city) {
                main += p(data.city, 'location');
            }

            if (data.phone) {
                formattedNumber = E.util.number.format(data.phone.first().number,
                    E.locale.region,
                    data.phone.first().type)
                main += p(formattedNumber, 'phone');
                button = resultPhoneButton(data.phone, target);
                clas = 'details_link';
            } else {
                clas = 'details_link_no_phone';
            }

            if (data.location) {
                if (E.geo.hasGeo()) {
                    location = distance(data.location, E.geo.getPos());
                    E.map.addPersonPoi(data.location, function () {
                        window.location = target;
                    });
                } else {
                    location = locationData(data.location);
                }
                main += location;
            }
            main = link(target, main, clas);
            main += button ? button : '';


            return listItem(main, 'result person');
        },

        /**
         * Generates all info for a person on the person details page.
         *
         * @param data required.
         */
        personDetails: function (data) {
            var html,
                header;

            header = p(data.name, 'header person_header_text');
            html = category(header, 'person_header');

            if (data.title) {
                html += p(data.title, 'person_title');
            }

            if (data.addresses) {
                if (data.addresses.length === 1) {
                    html += personAddressSingle(data.addresses[0]);

                } else {
                    html += data.addresses.map(personAddressMultiple).join('');
                }
            }


            if (data.phone) {
                html += data.phone.map(phoneNumber).join('');
            }

            if (data.homepage) {
                html += data.homepage.map(function (url) {
                    return homepage({link: url, label: url});
                }).join('');
            }

            if (E.locale.region === 'no' && data.addresses && data.addresses[0].location) {
                html += pubTransStops(data.addresses[0].street, data.addresses[0].location, data.name);
            }

            if (data.email) {
                html += data.email.map(function (address) {
                    return email({link: address, label: address});
                }).join('');
            }

            if (data.skype) {
                html += data.skype.map(function (url) {
                    return skype({link: url, label: url});
                }).join('');
            }

            if (data.facebook) {
                html += data.facebook.map(function (url) {
                    return facebook({link: url, label: url});
                }).join('');
            }

            if (data.twitter) {
                html += data.twitter.map(function (url) {
                    return twitter({link: url, label: url});
                }).join('');
            }

            if (data.linkedin) {
                html += data.linkedin.map(function (url) {
                    return linkedin({link: url, label: url});
                }).join('');
            }

            return html;
        },

        /**
         * Generates a sinlge location result item.
         *
         * @param data required.
         */
        locationResult: function (data) {
            var html,
                content,
                button,
                target;

            html = '';
            if (data.name) {
                html = p(data.name, 'header bold');
            }

            // postCode is only set if address exist
            if (data.postCode) {
                html += p(data.postCode + ' ' + data.city, 'post')
            } else if (data.city) {
                html += p(data.city, 'post');
            }

            if (data.location) {
                content = div('', 'image');
                content += div(E.locale.text.routeDescription, 'text');
                button = link(routeLinkTarget(data.routePoint || data.location, data.name),
                    content, 'route');

                target = 'javascript:E.locationResult.showMap(' +
                    data.location.lon + ',' + data.location.lat + ')';
                content = link(target, html, 'has_map');
                html = button;
                html += content;
                if (E.geo.hasGeo()) {
                    E.map.addLocationPoi(data.location, function () {
                        window.location = target;
                    });
                }
            }

            return listItem(html, 'result location');
        },

        noHits: function (searchWord, searchLocation) {
            var text,
                t;

            searchWord = searchWord || '';

            if (E.locale.region === 'pl') {
                text = E.locale.text.noHits1;
            } else {
                t = E.locale.text;
                text = t.noHits1 + "'" + searchWord.trim() + "'" + t.noHits2 + t.noHits3;
            }


            return listItem(text, 'no_hits');
        },

        noHits1: function (searchWord) {

            return listItem("hfkjshfsdh", 'result company');
        },

        /**
         * Generates the summary of the search (the first item in the list
         * before the actual result items that displays how many hits a seach
         * gave)
         *
         * @param searchWord. searchWord or searchLocation is required
         * @param searchLocation. searchWord or searchLocation is required
         * @param numHits required.
         */
        summary: function (searchWord, searchLocation, numHits, searchArea) {


           // if(numHits<1){html += E.generate.noHits1(searchWord);}

            var text,
                textNoHits,
                hitsFor,
                html,
                searchWhere;
            html = '';
            if (numHits > 0) {
                hitsFor = (numHits > 1)
                    ? E.locale.text.searchSummaryHitsPlural
                    : E.locale.text.searchSummaryHitsSingular;

                if (searchArea &&
                    parseInt(E.util.getUrlVars().zoom) !== E.constants.map.minZoom) {
                    searchWord = searchWord.replace(searchArea, '');
                    searchLocation = E.locale.text.searchSummaryIn + searchArea;
                } else if (searchLocation) {
                    if (parseInt(E.util.getUrlVars().zoom) === E.constants.map.minZoom ||
                        E.navigation.getCurrentPage() !== 'companyResult') {
                            searchWhere = E.locale.text.inWholeCountry;
                    } else {
                        searchWhere = E.locale.text.nearBy;
                    }

                    searchLocation = E.util.getUrlVars().geoArea !== undefined ?
                        E.locale.text.searchSummaryIn + E.util.getUrlVars().geoArea :
                        searchWhere;
                }

                if (searchWord && searchLocation) {
                    text = p(numHits + ' ' + E.locale.text.hits + ' ' + searchLocation, 'search_text') +
                        p(searchWord, 'search_word');
                } else {
                    text = p(numHits + hitsFor, 'search_text') +
                        p((searchWord || searchLocation), 'search_word');
                }
                text += '<a href="javascript: E.display.content.menu.resultSettings.toggleResultSettings();">' +
                    '<div class="icon"></div></a>';

                html =  listItem(text, 'summary');
            } else {

                if (E.util.number.isNumber(searchWord)) {
                    text = p(E.locale.text.noHits1 + ' "' + searchWord + '" ', 'noHits');
                    textNoHits =  p( E.locale.text.noHits2, 'noHits');
                }
                else {
                    text = p(E.locale.text.noHits4 + ' "' + searchWord + '" ', 'noHits');
                    textNoHits =  p(E.locale.text.noHits3 , 'noHits');
                }
                text += '<a href="javascript: E.display.content.menu.resultSettings.toggleResultSettings();">' +
                    '<div class="icon"></div></a>';
                html =  listItem(text, 'summary');
                html +=  listItem(textNoHits, 'result');

            }


            return html;

        },

        /**
         * Generates a single item for the route from and route to-page. What
         * the list item links to is determined by linkFun
         *
         * @param linkFun required. function to create a link from a {lon, lat,
         * name}-object. This function is typically curries with data for the
         * part of the link that is constant for all items on the same page.
         * Here is an example to make this a little more clear:
         *
         * When generating the route-to-page, the from-destination is the same
         * for all items (since the from-destination is already selected by the
         * time you reach the route-to-page). Let's say the from-destination is
         * 'Uppsala'. In that case this function would be a function that
         * creates links from Uppsala to {lon, lat, name}, a sort of
         * specialised createALinkFromUppsalaToDestination-function if you will
         *
         * function (obj} -> string
         *
         * @param data required.
         */
        routeSelect: function (linkFun, data) {
            var html,
                target,
                linkName,
                linkObj;

            html = '';
            if (data.name) {
                html = p(data.name, 'header bold');
            }

            // postCode is only set if address exist
            if (data.postCode) {
                html += p(data.postCode + ' ' + data.city, 'post');
            } else if (data.city) {
                html += p(data.city, 'post');
            }

            linkName = data.name || data.city;
            linkObj = {
                name: linkName,
                lon: data.location.lon,
                lat: data.location.lat
            };

            target = '#' + linkFun(linkObj);

            html = link(target, html, 'route_loc');

            return listItem(html, 'result location');
        },

        /**
         * Generates a no hits item for the route select pages.
         *
         * @param searchWord required.
         */
        routeSelectNoHits: function (searchWord) {
            var text;

            text = E.locale.text.routeNoHits1 + searchWord;

            return listItem(text, 'no_hits');
        },

        /**
         * Generates a single route instruction.
         * @param instruction
         */
        routeResult: function (instruction, index) {
            var target,
                routeLink,
                numberSpan,
                span;

            target = 'javascript:E.routeResult.showInstruction(' +
                index + ');';

            numberSpan = tag('span', null, index + 1, 'route_instr_no');
            span = tag('span', null, instruction.instruction, 'route_instr_text');
            routeLink = link(target, numberSpan + span);

            return listItem(routeLink, 'route_instruction buttons');
        },
        publicRouteTrips: function (trips) {
            var html,
                size,
                i,
                content;

            html = '';

            for (i = 0, size = trips.length; i < size; i++) {
                content = publicRouteTrip(trips[i], i);
                html += listItem(content, 'pub_trip');
            }

            return html;
        },
        publicStationDepartures: function (departures, destObject, origObject, isTrip) {
            var html,
                size,
                i,
                content;

            html = '';
            content = '';
            if (destObject && origObject) {
                content = pubtransAlternateLocation(destObject, origObject, isTrip);
            }

            html += listItem(content, 'station_departures_alternate');
            if (departures && departures.length) {
                for (i = 0, size = departures.length; i < size; i++) {
                    content = publicStationDeparture(departures[i], i);
                    html += listItem(content, 'station_departures');
                }
            } else {
                html += listItem(E.locale.text.noPublicRoute, 'station_departures');
            }


            return html;
        },

        nearbyStations: function (stops, localPos) {
            var html,
                size,
                i,
                content;

            html = '';
            content = '';

            for (i = 0, size = stops.length; i < size; i++) {
                content = nearbyStop(stops[i], localPos);
                html += listItem(content, 'nearby_station buttons');
            }

            return html;

        },

        geoSuggest: function (suggestions) {
            var html,
                i,
                size,
                content;

            html = '';

            for (i = 0, size = suggestions.length; i < size; i++) {
                content = suggestions[i].sug;
                content = tag('span', null, content, 'text');
                content = link('#', content, 'suggestion');
                html += listItem(content, 'sug');
            }

            return html;
        },
        /**
         * See private function distanceInner
         */
        distanceInner: distanceInner,
        listItem: listItem,
        mediumStars: stars.curry('medium_stars_inverted'),
        smallStars: stars.curry('small_stars_inverted')

    };
}());
