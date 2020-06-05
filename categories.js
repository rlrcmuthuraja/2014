/**
 * Initialize categories from json object / array
 */
E.categories = (function () {
    var catObject;

    /**
     * Populate the dom with category links
     */
    function poulateCats(cats) {
        var html,
            href,
            rel;
        if (cats && cats.CATEGORIES) {

            //cache the category object
            catObject = cats;

            html = '';
            html += '<ul id="category_ul">';
            for (var i = 0, len = cats.CATEGORIES.length; i < len; i++) {
                href = 'javascript: E.categories.showCategory(' + i + ');';
                rel = cats.CATEGORIES[i].name;
                html += '<li class="main_category">';
                html += '<a href="' + href + '" rel="' + rel + '">';
                html += '<div class="cat_icon ' + cats.CATEGORIES[i].iconname + '"></div>';
                html += '<span class="cat_label">' + rel + '</span>';
                html += '</a>';
                html += '</li>';

                //create subcategory lists for each category
                html += '<ul class="subcategory" id="cat_' + i + '">';
                for (var j = 0, len_subs = cats.CATEGORIES[i].subcategories.length; j < len_subs; j++) {
                    href = 'javascript: E.categories.gotoSub(' + i + ', ' + j + ');';
                    rel = cats.CATEGORIES[i].subcategories[j].name;
                    html += '<li>';
                    html += '<a href="' + href + '" rel="' + rel + '">';
                    html += rel;
                    html += '</a>';
                    html += '</li>';
                }
                html += '</ul>';
            }
            html += '</ul>';
            E.elements.mainMenu.subMenu.categories.html(html);
        }
    }

    /**
     * Query categories array
     */
    function requestCategories () {
        E.comm.queryCategories(poulateCats);
    }

    return {
        init: function () {
            requestCategories();
        },

        showCategory: function (cat) {
            $('.toggle_text', E.elements.mainMenu.submenuToggles.categories).text(
                catObject.CATEGORIES[cat].name
            ).animate(
                {'margin-left' : '40px'},
                800,
                'swing',
                function () {
                }
            );
            E.display.selectCategory(cat);
        },

        gotoSub: function (cat, subCat) {
            var location;
            if (E.geo.hasGeo()) {
                location = E.geo.getLon() + ',' + E.geo.getLat();
            }

            E.searchPage.categorySearch(
                catObject.CATEGORIES[cat].subcategories[subCat].keyword,
                location,
                null,
                catObject.CATEGORIES[cat].subcategories[subCat].relevance
            );
        }
    }
}());