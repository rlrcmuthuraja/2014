

E.redirect = (function () {
    return {
        init: function () {
            var url,
                baseurl;

                baseurl = 'http://' + document.location.hostname;
                url = baseurl + '/ishighend';
                //url = baseurl + ':8080/ishighend';

            console.log(url)

            queryUserAgentFinder(url, function (data) {
                complete(data);
            }, defaultCommError);


          function queryUserAgentFinder(url, success, error) {
              url += '?callback=?';
              $.jsonp({
                  cache: false,
                  url: url,
                  success: success,
                  error: error
              });
            }

            function complete(data) {

                if (data.isHighEnd !== 'true') {
                    switch(E.navigation.getCurrentPage())
                    {
                   case 'companyResult':
                         window.location = baseurl+'/companyResult.jsp?' +
                                          'search_word='+ E.util.getUrlVars().searchWord +
                                          '&offset=0';
                         break;
                   case 'companyDetails':
                         window.location = baseurl+'/companyDetail.jsp?' +
                                           'search_word='+ E.util.getUrlVars().searchWord +
                                           '&offset=0&eniroID=' + E.util.getUrlVars().eniroId;
                         break;
                   case 'personResult':
                        window.location = baseurl+'/personResult.jsp?' +
                                          'search_word='+ E.util.getUrlVars().searchWord +
                                          '&offset=0';
                        break;
                   case 'personDetails':
                        window.location = baseurl+'/personDetail.jsp?' +
                                          'search_word='+ E.util.getUrlVars().searchWord +
                                          '&offset=0&personID=' + E.util.getUrlVars().recordId;
                        break;
                   case 'locationResult':
                        window.location = baseurl+'/placeResult.jsp?' +
                                          'search_word='+ E.util.getUrlVars().searchWord +
                                          '&offset=0';
                        break;
                   case 'routeResult':
                        window.location = baseurl + '/routeResult.jsp?' +
                                         'directRoute=yes&Tolongitude='+ E.util.getUrlVars().toLon +
                                         '&Tolatitude='+ E.util.getUrlVars().toLat +
                                         '&FromLongitude=' + E.util.getUrlVars().fromLon +
                                         '&FromLatitude=' + E.util.getUrlVars().fromLat +
                                         '&AddressTo=' + E.util.getUrlVars().toName +
                                         '&AddressFrom=' + E.util.getUrlVars().fromName ;

                         break;
                   default:
                        window.location = baseurl;
                    }
                }
            }

            function defaultCommError(xOptions, textStatus) {
                console.log("Error:"+textStatus);
            }

        }
    };
}());
