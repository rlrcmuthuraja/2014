/*
 * Functions for translating API response to a data format that's easier to
 * handle. This is called before the html is generated.
 *
 * In an ideal world, this function would not be necessary, but as the API
 * gives data in a kind of funky format, translating it first probably
 * saves some time and effort in generating html from API responses.
 */


E.translate = (function () {
    /**
     * class value for easy access in map functions
     */
    var compName;

    /**
     * converts oldnumber to standard format.
     *
     *
     * @param oldNumber required.
     * @param label optional. if label is set, it will override the existing
     *        label as the label of the new number.
     * @return oldNumber translated to the following format:
     * {
     *   number: required.
     *   type: required. will be 'mob', 'fax' or 'std'. if the number has
     *     another or no label, the label will be set to 'std'.
     *   label: optional
     * }
     * if the parsing fails, undefined is returned.
     */
    function getPhoneNumber(oldNumber) {
        var newNumber,
            phoneNumber;
        phoneNumber = oldNumber.phoneNumber ? oldNumber.phoneNumber : oldNumber.number;

        if (phoneNumber) {
            newNumber = {
                number: phoneNumber,
                type: 'std'
            };

            if (oldNumber.label && oldNumber.type.toLowerCase() === 'custom' &&
                (oldNumber.label.substr(0, 3).toLowerCase() === 'mob' ||
                    oldNumber.label.substr(0, 3).toLowerCase() === 'fax')) {
                newNumber.type = oldNumber.label.substr(0, 3).toLowerCase();
            } else if (oldNumber.type === 'mob' || oldNumber.type === 'fax') {
                newNumber.type = oldNumber.type;
            } else {
                newNumber.type = 'std';
            }

            if (oldNumber.label) {
                newNumber.label = oldNumber.label;
            }
            return newNumber;
        }
    }

    /**
     * Creates a label to use for phone numbers connected to addresses.
     * @param addr required.
     * @return a label if addr contains enough information to create a
     * meaningful one. The label generation works as follows: If a street
     * exists, this will be used as the label. If not zipCode + postArea will
     * be used if they exist. If not, no label will be created and undefined
     * will be returned.
     */
    function makeLabel(addr) {
        var label;

        if (addr.streetName) {
            label = addr.streetName;

            if (addr.streetNumber) {
                label += ' ' + addr.streetNumber;
            }
        } else if (addr.zipCode && addr.postArea) {
            label = addr.zipCode + ' ' + addr.postArea.capitalise();
        }
        return label;
    }

    /**
     * Converts a single advert from advert array from company search basic
     * @param advert required.
     * @return an object containing the necessary information from advert.
     * the object will look like this:
     * optional values only set if they exist.
     * {
     *   pack: vip/gold/silver/bronze. optional
     *
     *   logo: file. optional. this is the mobile_logo, or if mobile logo
     *      doesn't exist and the customer is vip/gold, logo, if it exist.
     *
     *   bold: optional. this is set if style == bold or the customer has a
     *      vip, gold, silver or bronze package.
     *
     *   rating: optional.
     *
     *   eniroId: required.
     *
     *   phoneNumbers: optional. only sent if phoneNumbers array contains
     *      anything
     *
     *   name: required.
     *
     *   street: optional.
     *
     *   city: optional.
     *
     *   location: optional. {
     *     lon: required.
     *     lat: required.
     *   }
     * }
     */
    function companyResultSingle(advert) {
        var address,
            obj;
        obj = {};

        if (advert.grade) {
            obj.pack = advert.grade.toLowerCase();
        }

        if (advert && advert.links) {
            advert.links.map(function(link) {
                if ((obj.pack === 'vip' || obj.pack === 'gold') &&
                    (
                        link.type.toLowerCase() === 'mobile_logo' ||
                            link.type.toLowerCase() === 'logo'
                        )
                    ) {
                    obj.logo = link.href;
                }
            });
        }
//

        if (advert.mobileStyle ||
            obj.pack === 'vip' ||
            obj.pack === 'gold' ||
            obj.pack === 'silver' ||
            obj.pack === 'bronze') {
            obj.bold = true;
        }

        if (obj.pack === 'vip' ||
                obj.pack === 'gold' ||
                obj.pack === 'silver' ||
                obj.pack === 'bronze') {
            obj.webToMobile = true;
        }

        obj.rating = advert.averageRating || 0;

        if (advert.ratingUrl) {
            obj.ratingUrl = advert.ratingUrl;
        }

        obj.eniroId = advert.id;

        if (advert.phoneNumbersExtended && advert.phoneNumbersExtended.length) {
            obj.phone = advert.phoneNumbersExtended.map(getPhoneNumber).removeUndefined();
        }

        obj.name = advert.companyName;

        address = advert.addresses.first();
        if (address) {

            if (address.label) {
                obj.street = address.label;
            }

            if (address.postcode) {
                obj.postcode = address.postcode;
            }

            if (address.area) {
                obj.city = address.area.capitalise();
            }
        }

        if (advert.geometry && advert.geometry.coordinates &&
            advert.geometry.coordinates.length &&
            advert.geometry.coordinates[0] &&
            advert.geometry.coordinates[1]) {

            obj.location = {
                lon: advert.geometry.coordinates[0],
                lat: advert.geometry.coordinates[1]
            };
        }

        return obj;
    }



    /**
     * translates rev if rev is a valid review. if not, a falsy value is
     * returned. the translated review looks like this:
     *
     * {
     *   alias: optional
     *   rating: optional
     *   summary: optional
     *   text: required
     *   date: optional
     *   response: optional {
     *     text: required
     *     date: optional. {
     *       day: required.
     *       time: required.
     *     }
     *     channel: optional
     *   }
     *
     * }
     *
     * @param rev
     */
    function tranlateReview(rev) {
        var obj,
            response,
            day,
            time;

        if (rev.review) {
            obj = {};

            if (rev.alias) {
                obj.alias = rev.alias;
            }

            if (rev.rating) {
                obj.rating = rev.rating;
            }

            if (rev.reviewSummary) {
                obj.summary = rev.reviewSummary;
            }

            obj.text = rev.review;

            if (rev.time) {
                day = rev.time.substring(0, rev.time.indexOf('T'));
                time = rev.time.substring(rev.time.indexOf('T') + 1);
                obj.date = {
                    day: day,
                    time: time
                };
            }

            response = rev.companyResponse;
            if (response && response.text) {
                obj.response = {
                    text:  E.locale.text.answerFrom +
                        ' ' + compName + ":<br/>" +
                        response.text
                };
                if (response.channel) {
                    obj.response.channel = response.channel;
                }

                if (response.date) {
                    day = response.date.substring(0, response.date.indexOf('T'));
                    time = response.date.substring(response.date.indexOf('T') + 1);
                    obj.response.date = {
                        day: day,
                        time: time
                    };
                }
            }
            return obj;
        }
    }


    /**
     * Converts a single record from the record array from person search basic
     * @param record required.
     * @return an object containing the necessary information from record.
     * the object will look like this:
     * optional values only set if they exist.
     * {
     *   recordId: required
     *
     *   name: required
     *
     *   NOTE: street and city are taken from the first address in the
     *   addresses array. this is considered the primary address.
     *
     *   street: optional. this is the street name + street number if both
     *     exist, or street name if street number does not exist.
     *
     *   city: optional.
     *
     *   phone: optional. these are the numbers from both the phone numbers
     *     array and numbers connected to addresses. duplicates removed. the
     *     first of these numbers is considered the primary number. each number
     *     looks like this:
     *     {
     *       number: required.
     *       type: required. allowed types are 'mob', 'fax', 'std'. if a number
     *         has another type, the type is set to 'std'.
     *     }
     *   }
     */
    function personResultSingle(record) {
        var obj,
            addr;

        if (record.name) {

            obj = {};

            obj.recordId = record.recordId;

            obj.name = record.name;

            addr = record.addresses;
            if (addr && addr.length) {
                addr = addr.first();

                if (addr.label) {
                    obj.street = addr.label;
                }

                if (addr.area && addr.postcode) {
                    obj.city = addr.postcode + ' ' + addr.area.capitalise();
                } else if (addr.postcode) {
                	obj.city = addr.postcode;
	            } else if (addr.area) {
	            	obj.city = addr.area.capitalise();
	            }

                if (addr.geometry && addr.geometry.coordinates && addr.geometry.coordinates.length) {
                	obj.location = {
                        lon: addr.geometry.coordinates[0],
                        lat: addr.geometry.coordinates[1]
                    };
                }
            }


            if (record.phoneNumbersExtended && record.phoneNumbersExtended.length) {
                obj.phone = record.phoneNumbersExtended.map(getPhoneNumber).removeUndefined();
            }

            addr = record.addresses;
            if (addr && addr.length) {
                addr.map(function (a) {

                    if (a.phoneNumbersExtended && a.phoneNumbersExtended.length) {
                        obj.phone = obj.phone || [];

                        obj.phone = obj.phone.concat(
                            a.phoneNumbersExtended.map(getPhoneNumber).removeUndefined()
                        );
                    }
                });
            }
            return obj;
        }
    }

    /**
     * Converts a single location from the location API.
     * @param location required.
     * @return an object containing the necessary information from location.
     * the object will look like this:
     *
     * name, city or
     * {
     *   name: optional. name or city is required. this is the road name and if
     *     set, the house number.
     *
     *   city: optional. name or city is required. this is the post area, or if
     *     the post area is not set, the municipality.
     *
     *   postCode: optional. only set if post area exist.
     *
     *   location: optional. {
     *     lon: required.
     *     lat: required.
     *   }
     *
     * }
     */
    function locationResultSingle(location) {
        var obj;
        if (location.address && (location.address.label || location.address.area || location.address.municipality)) {

            obj = {};

            if (location.address.label) {
                obj.name = location.address.label;
            }

            if (location.address.area) {
                obj.city = location.address.area.capitalise();

                if (location.address.postcode) {
                    obj.postCode = location.address.postcode;
                }
            } else if (location.address.municipality) {
                obj.city = location.address.municipality.capitalise();
            }

            if (location.geometry &&
                    location.geometry.coordinates[0] && location.geometry.coordinates[1]) {
                if (location.geometry.type === 'MultiLineString') {
                    obj.location = {
                        lon: location.geometry.coordinates[0][0][0],
                        lat: location.geometry.coordinates[0][0][1]
                    };
                } else {
                    obj.location = {
                        lon: location.geometry.coordinates[0],
                        lat: location.geometry.coordinates[1]
                    };
                }

            }

            if (location.routePoint && location.routePoint.coordinates) {
                obj.routePoint = {
                    lon: location.routePoint.coordinates[0],
                    lat: location.routePoint.coordinates[1]
                }
            }

            return obj;
        }
    }

    /**
     * Works exactly like locationResultSingle, only that locations without a
     * coordinate are ignored.
     */
    function routeSelectSingle(location) {
        if (location.geometry &&
                location.geometry.coordinates[0] &&
                location.geometry.coordinates[1]) {

            return locationResultSingle(location);
        }
    }

    return {
        /**
         * Converts all adverts in the array as described in
         * companyResultSingle.
         *
         * @param adverts required. original advert array from the company
         * basic response.
         * @return adverts with each advert translated by compayResultSingle
         */
        companyResult: function (adverts) {
            return adverts.map(companyResultSingle);
        },

        /**
         * Translates a single advert from the company info page and review
         * page into a format that will be used to create the compay details
         * view.
         *
         * @param data response from the company infopage full and company
         * review api.
         * @return an object containing everything that should be displayed in
         * the details page for a company. The object will look like this:
         * optional values only set if they exist.
         * {
         *   eniroId: required.
         *
         *   name: required.
         *
         *   text: optional. taken from companyText.
         *
         *   street: optional.
         *
         *   post: optional. this is the post number and city. if either one is
         *      missing, the other one is used alone.
         *
         *   postBox: optional.
         *
         *   co: optional. care of
         *
         *   placeName: optional. (denmark only)
         *
         *   houseName: optional. (denmark only)
         *
         *   location: optional. {
         *     lon: required
         *     lat: required
         *     zoomLevel: optional
         *   } only created if hasMap is true
         *
         *   phone: optional. [{
         *     type: required. if type is not valid, type will be set to
         *       'std'. valid types are 'std', 'mob', 'fax'
         *     number: required.
         *     label: optional.
         *   }]. a number is only added if show is set to true.
         *
         *   rating: optional.
         *
         *   reviews: optional. {
         *     link: optional.
         *     list: required. see translateReview for details
         *   }
         *
         *
         *   PRODUCTS. all products are optional.
         *   description: {
         *     label: optional
         *     mixedText: required [{}]
         *   }
         *
         *   email: [{
         *     label: required
         *     link: required
         *   }]
         *
         *   homepage: [{
         *     label: required
         *     link: required
         *   }]
         *
         *   logo: {
         *     id: required
         *     extension: required
         *     dirPath: required
         *   } this will contain the mobile_logo product if it exist. if it
         *     doesn't exist and the customer has both the gold package and the
         *     standard logo, the standard logo will be used.
         *
         *   openingHours: as in API docs.
         *
         *   deeplinks: [{
         *     label: required
         *     link: required
         *   }]
         *
         *   freeText: [{
         *     type: required. name of the free text product (free_text_600, etc)
         *     label: required.
         *     mixedText: required.
         *   }]
         *
         * }
         */

        /*  Add company name in reviews  Test*/




        companyDetails: function (data) {
            var obj,
                advert,
                products,
                review,
                address,
                pack,
                logo,
                mobileLogo;

            advert = data.info.advert;
            products = data.info.products;
            review = data.review;
            obj = {};
            compName = advert.companyInfo.companyName;

            obj.eniroId = advert.identifiers.eniroId;

            obj.name = advert.companyInfo.companyName;

            if (advert.companyInfo.companyText) {
                obj.text = advert.companyInfo.companyText;
            }

            address = advert.address;
            if (address) {
                if (address.streetName) {
                    obj.street = address.streetName;
                }

                if (address.postCode && address.postArea) {
                    obj.post = address.postCode + ' ' + address.postArea.capitalise();
                } else if (address.postCode) {
                    obj.post = address.postCode;
                } else if (address.postArea) {
                    obj.post = address.postArea.capitalise();
                }

                if (address.postBox) {
                    obj.postBox = address.postBox;
                }

                if (address.coName) {
                    obj.co = address.coName;
                }

                if (address.placeName) {
                    obj.placeName = address.placeName;
                }

                if (address.houseName) {
                    obj.houseName = address.houseName;
                }
            }

            if (advert.location &&
                    advert.location.coordinates &&
                    advert.location.coordinates.length &&
                    advert.location.coordinates[0].longitude &&
                    advert.location.coordinates[0].latitude) {

                obj.location = {
                    lon: advert.location.coordinates[0].longitude,
                    lat: advert.location.coordinates[0].latitude
                };

                if (advert.location.locationLevel) {
                    obj.location.zoomLevel = advert.location.locationLevel;
                }
            }

            if (advert.phoneNumbers) {
                obj.phone = [];
                obj.phone = advert.phoneNumbers.map(getPhoneNumber).removeUndefined();
                obj.phone = E.util.number.removeDuplicate(obj.phone);
            }

            if (advert.rating && advert.rating.averageRating &&
                    advert.rating.ratingVisible !== 'false') {
                obj.rating = advert.rating.averageRating;
            }


            if (products) {

                products.map(function (p) {
                    if (p.type) {
                        p.type.toLowerCase();
                    }

                    if (p.name === 'mobile_package' && (p.type === 'gold' ||
                            p.type === 'silver' || p.type === 'bronze' ||
                            p.type === 'vip')) {

                        pack = p.type;
                    }
                });

                products.map(function (p) {
                    var name,
                        pa;

                    pa = p.productAttribute;
                    name = p.name;

                    if (pa && name) {

                        switch (name) {
                            case 'company_description':

                                if (pa.mixedText) {
                                    obj.description = {
                                        mixedText: pa.mixedText
                                    };

                                    if (pa.label) {
                                        obj.description.label = pa.label;
                                    }
                                }
                                break;

                            case 'email':

                                if (pa.label && pa.email && pa.email.link) {
                                    obj.email = obj.email || [];

                                    obj.email.push({
                                        label: pa.label,
                                        link: pa.email.link
                                    });
                                }
                                break;

                            case 'homepage':

                                if (pa.label && pa.url && pa.url.proto && pa.url.link) {
                                    obj.homepage = obj.homepage || [];

                                    obj.homepage.push({
                                        label: pa.label,
                                        link: pa.url.proto + '://' + pa.url.link
                                    });
                                }
                                break;
                            case 'logo':

                                if (pa.file && pa.file.image) {
                                    logo = pa.file;
                                }
                                break;

                            case 'organization_icon':

                               if (pa.linkText &&
                                   pa.file &&
                                   pa.file.dirPath &&
                                   pa.file.id &&
                                   pa.file.extension) {
                                   obj.organization_icon = obj.organization_icon || [];
                                    if(E.locale.region === 'dk') {
                                        obj.organization_icon.push({
                                            headerText: E.locale.text.orgIcon,
                                            label: pa.linkText,
                                            imagePath:E.constants.api.image[E.locale.region].url +
                                                pa.file.dirPath +
                                                pa.file.id +'.' +
                                                pa.file.extension,
                                            link: pa.file.url.proto + "://" + pa.file.url.link
                                        });
                                    }
                               }
                                break;

                            case 'mobile_logo':

                                if (pa.file && pa.file.image) {

                                    mobileLogo = pa.file;
                                }
                                break;

                            case 'opening_hours':

                                if (pa.date && pa.date.hours && pa.date.hours.dayspans &&
                                        pa.date.hours.dayspans.length) {

                                    obj.openingHours = pa;
                                }
                                break;

                            case 'deeplink_mobile':
                                //Poland has deeplinks only for vip and gold
                                if (pa.label && pa.url && pa.url.proto && pa.url.link &&
                                    (E.locale.region !== 'pl' ||
                                        (E.locale.region === 'pl' && (pack === 'vip' || pack === 'gold')))) {

                                    obj.deeplinks = obj.deeplinks || [];

                                    obj.deeplinks.push({
                                        label: pa.label,
                                        link: pa.url.proto + '://' + pa.url.link
                                    });

                                }
                                break;

                            case 'mobile_slideshow':

                                if (pa.mobileSlideshow && pa.mobileSlideshow.length) {
                                    obj.slideshow = pa.mobileSlideshow;
                                }
                                break;
                            case 'extra_image':
                                obj.slideshow = obj.slideshow || [];

                                obj.slideshow.push({
                                    img: pa.file.image,
                                    label: pa.file.label || ''
                                });
                                break;
                            case 'facebook_link':
                                obj.facebook = obj.facebook || [];
                                obj.facebook.push(pa.url.proto + '://' + pa.url.link);
                                break;

                        }
                    }
                });
            }

            if (mobileLogo) {
                obj.logo = mobileLogo;
            } else if ((pack === 'gold' || pack === 'vip') && logo) {
                obj.logo = logo;
            }

            if (review && review.reviews && review.reviews.length) {
                obj.review = {
                    list: review.reviews.map(tranlateReview).removeUndefined()
                };

                if (review.link) {
                    obj.review.link = review.link;
                }
            }

            return obj;
        },

        /**
         * Converts all records in the array as described in
         * personResultSingle.
         *
         * @return records with each record translated by personResultSingle
         */
        personResult: function (records) {
            return records.map(personResultSingle).removeUndefined();
        },

        /**
         * Converts a single record from person search basic
         *
         * NOTE: this behaves pretty much like the person result single, but
         * for the future it's possible that they will be fetched from separate
         * APIs as the person basic is too bloated for it's purpose.
         *
         * @param record required. a single record from the company basic API.
         * @return an object containing the necessary information from record.
         * the objec will look like this:
         * optional values only set if they exist.
         * {
         *   recordId: required
         *
         *   name: required.
         *
         *   addresses: optional. [{
         *     street: either street or city is required. this is the street
         *       name + street number if both exist, or street name if street
         *       number does not exist.
         *
         *     city: either street or city is required.
         *
         *     postCode: optional.
         *
         *     location: optional. {
         *       lon: required.
         *       lat: required.
         *     },
         *     phone: optional. [{
         *       number: required.
         *       type: required. allowed types are 'mob', 'fax', 'std'. if a
         *         number has another type, the type is set to 'std'
         *       label: optional.
         *     }]
         *   }]
         *
         *   phone: optional. [{
         *       number: required.
         *       type: required. allowed types are 'mob', 'fax', 'std'. if a
         *         number has another type, the type is set to 'std'.
         *       label: optional.
         *     }]
         *   }
         *
         *   email: optional. []
         *
         *   homepage: optional. []
         *
         *   linkedin: optional. []
         *
         *   twitter: optional. []
         *
         *   flickr: optional. []
         *
         *   skype: optional. []
         *
         *   facebook: optional []
         *
         * }
         */

        personDetails: function (record) {
            var obj,
                addr,
                ealias,
                tmp;

            if (record.personInfo && record.record_id &&
                    (record.personInfo.firstName || record.personInfo.lastName)) {

                obj = {};

                obj.recordId = record.record_id;

                if (record.personInfo.firstName && record.personInfo.lastName) {
                    obj.name = record.personInfo.firstName + ' ' +
                        record.personInfo.lastName;
                } else {
                    obj.name = record.personInfo.firstName || record.personInfo.lastName;
                }

                if (record.personInfo.title) {
                    obj.title = record.personInfo.title;
                }

                addr = record.addresses;
                if (addr && addr.length) {
                    addr.map(function (a) {
                        var o;
                        if (a.streetName || a.postArea) {
                            obj.addresses = obj.addresses || [];
                            o = {};

                            if (a.streetName) {
                                o.street = a.streetName;

                                if (a.streetNumber) {
                                    o.street += ' ' + a.streetNumber;
                                }
                            }

                            if (a.zipCode && a.postArea) {
                                o.city = a.zipCode + ' ' + a.postArea.capitalise();
                            } else if (a.zipCode) {
                                o.city = a.zipCode;
                            } else if (a.postArea) {
                                o.city = a.postArea.capitalise();
                            }

                            if (a.coordinates && a.coordinates.longitude &&
                                    a.coordinates.latitude) {

                                o.location = {
                                    lon: a.coordinates.longitude,
                                    lat: a.coordinates.latitude
                                };
                            }

                            if (a.phoneNumbers && a.phoneNumbers.length) {
                                tmp = a.phoneNumbers.map(getPhoneNumber).removeUndefined();
                                if (tmp && tmp.length) {
                                    o.phone = tmp;
                                }
                            }

                            obj.addresses.push(o);
                        }
                    });
                }

                if (obj.addresses && obj.addresses[0].location) {
                    obj.primaryLocation = obj.addresses[0].location;
                }

                if (record.phoneNumbers && record.phoneNumbers.length) {
                    tmp = record.phoneNumbers.map(getPhoneNumber).removeUndefined();
                    if (tmp && tmp.length) {
                        obj.phone = tmp;
                    }
                }

                ealias = record.ealiases;
                if (ealias && ealias.length) {
                    ealias.map(function (ea) {

                        if (ea.type === 'email' ||
                                ea.type === 'homepage' ||
                                ea.type === 'linkedin' ||
                                ea.type === 'twitter' ||
                                ea.type === 'flickr' ||
                                ea.type === 'skype' ||
                                ea.type === 'facebook') {

                            obj[ea.type] = obj[ea.type] || [];
                            obj[ea.type].push((ea.type === 'homepage' && ea.data.substr(0, 4) !== 'http' ? 'http://' + ea.data : ea.data));
                        }

                    });
                }

                return obj;
            }

        },
        locationResult: function (data) {
            return data.map(locationResultSingle).removeUndefined();
        },
        routeSelect: function (data) {
            return data.map(routeSelectSingle).removeUndefined();
        },
        /**
         * Translates the response from the route API.
         *
         * @param data required.
         * @return an object containing the necessary data from data or a
         * falsy value if data could not be parsed.
         *
         * Instructions or coordinates that does not fulfill the requirements
         * are ignored. {lon, lat} means that both long and lat are required.
         *
         * the converted object looks like this:
         * {
         *   bbox: required. {
         *     topLeft: {lon, lat},
         *     bottomRight: {lon, lat}
         *   }
         *
         *   coordinates: required. used for drawing the route. [
         *      {lon, lat}
         *   ]
         *
         *   instructions: required. used for the printed instructions. [
         *     {
         *       instruction: required. text instruction. for the last element,
         *       this will be E.locale.text.routeLast if no value is set.
         *       location: required. {lon, lat}
         *     }
         *   ]
         *
         *   len: required. total length of route in meters
         *
         *   duration: required. total duration of route in seconds
         * }
         */
        route: function (data) {
            var obj,
                instructions,
                rGeo;

            obj = {};

            if (data['route-instructions'] && data['route-instructions'].length &&
                    data['route-instructions'][0].features &&
                    data['route-instructions'][0].features.length) {

                instructions = data['route-instructions'][0].features;

                obj.instructions = instructions.map(function (instr, i) {
                    var o;

                    if (instr.geometry && instr.geometry.coordinates &&
                            instr.geometry.coordinates.length >= 2) {

                        o = {
                            location: {
                                lon: instr.geometry.coordinates[0],
                                lat: instr.geometry.coordinates[1]
                            }
                        };

                        if (instr.properties && instr.properties.instruction) {
                            o.instruction = instr.properties.instruction;
                        } else if (i === instructions.length - 1) {
                            o.instruction = E.util.getUrlVars().toName.decodeUtf8();
                        }
                        return o;
                    }
                }).removeUndefined();
            }

            rGeo = data['route-geometries'];
            if (rGeo &&
                    rGeo.bbox &&
                    rGeo.bbox.length >= 4 &&
                    rGeo.features &&
                    rGeo.features.length &&
                    rGeo.features[0].geometry &&
                    rGeo.features[0].geometry.coordinates &&
                    rGeo.features[0].geometry.coordinates.length &&
                    rGeo.features[0].geometry.coordinates[0].length) {

                obj.bbox = {
                    topLeft: {
                        lon: rGeo.bbox[0],
                        lat: rGeo.bbox[1]
                    },
                    bottomRight: {
                        lon: rGeo.bbox[2],
                        lat: rGeo.bbox[3]
                    }
                };

                obj.coordinates =
                    rGeo.features[0].geometry.coordinates[0].map(function (c) {
                        if (c.length >= 2) {
                            return {
                                longitude: c[0],
                                latitude: c[1]
                            };
                        }
                    }).removeUndefined();
            }

            if (data['total-duration']) {
                obj.duration = data['total-duration'];
            }

            if (data['total-length']) {
                obj.len = data['total-length'];
            }

            if (obj.instructions && obj.bbox && obj.coordinates &&
                    obj.duration && obj.len) {

                return obj;
            }
        },

        pubTransTrip: function (data) {
            var obj;

            obj = {};
            if (data.TripList && data.TripList.Trip) {
                obj.trips = data.TripList.Trip;
            }
            return obj;
        },

        pubStation: function (data) {
            var obj;

            obj = {};
            if (data.DepartureBoard && data.DepartureBoard.Departure) {
                obj.departures = data.DepartureBoard.Departure;
            }
            return obj;
        },

        nearbyStations: function (data) {
            var obj;

            obj = {};
            if (data.LocationList && data.LocationList.StopLocation) {
                obj = data.LocationList.StopLocation;
            }
            return obj;
        },

        geoSuggest: function (data) {
            var obj;

            obj = {}
            if (data &&
                data.search &&
                data.search.geoSuggestResponse &&
                data.search.geoSuggestResponse.items &&
                data.search.geoSuggestResponse.items.length) {
                obj.items = data.search.geoSuggestResponse.items;
            }
            return obj;
        }
    };
}());
