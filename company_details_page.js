/**
 * Contains data and functions specific to the company details page.
 *
 */

E.companyDetails = (function () {

    /**
     * Generates the menu part of the company details page (show rating stars).
     * Also calls the logging.
     *
     * @param obj required. translated api response object.
     */
    function menu(obj) {
        var stars;

        if (obj.rating) {
            stars = E.generate.smallStars(obj.rating);
            E.elements.content.menu.details.html(stars);
        }
    }

    function slideshow(obj) {
        if (obj.slideshow && E.locale.region !== 'dgs') {
            E.companyDetails.slideshow.set(obj.slideshow);
        }
    }

    function extra(obj, data) {
        menu(obj);
        slideshow(obj);

        E.logging.trigger(E.page.name.companyDetails, obj, undefined, undefined, undefined, data);
        E.logging.bindDetailsLogging(obj.eniroId);
        E.navigation.setOnExit(E.logging.unbindDetailsLogging);
    }
    return {
        /**
         * Calls the company details API and fills the page with the response.
         *
         * @param eniroId required.
         * @param region required.
         */
        populate: function (eniroId, region) {
            E.elements.content.menu.details.html('');

            E.details.populate(E.comm.companyDetails,
                E.translate.companyDetails, E.generate.companyDetails,
                eniroId, region, extra);
        }
    };
}());


E.companyDetails.slideshow = (function () {
    var prevElement,
        nextElement,
        containerElement,
        indicatorElements,
        backgroundElement,
        foregroundElement,
        loaderElement,
        images,
        currentImage,
        numImages,
        isFocused,
        containerHeight,
        currentFile,
        prevFile;

    function centerImage(imgElem) {
        var width,
            height;

        width = imgElem.width();
        height = imgElem.height();

        imgElem.css('margin-left', (-width / 2) + 'px');
        imgElem.css('margin-top', (-height / 2) + 'px');
    }

    function setVisibility(index) {
        if (index === 0) {
            prevElement.hide();
        } else {
            prevElement.show();
        }

        if (index === numImages - 1) {
            nextElement.hide();
        } else {
            nextElement.show();
        }
    }

    function setImage(index) {

        function afterLoad(successfull) {
            loaderElement.unbind('load');
            loaderElement.unbind('error');
            if (successfull) {
                if (prevFile) {
                    backgroundElement.attr('src', prevFile);
                    foregroundElement.attr('src', currentFile);
                    centerImage(backgroundElement);
                    centerImage(foregroundElement);
                    backgroundElement.show();
                    foregroundElement.hide();
                    backgroundElement.fadeOut(E.constants.slideTime);
                    foregroundElement.fadeIn(E.constants.slideTime);
                } else {
                    foregroundElement.attr('src', currentFile);
                    centerImage(foregroundElement);
                    foregroundElement.fadeIn(E.constants.slideTime);
                }
                prevFile = currentFile;

            } else {
                foregroundElement.fadeOut(E.constants.slideTime);
                backgroundElement.fadeOut(E.constants.slideTime);
                prevFile = undefined;
            }
        }

        if (index >= 0 && index < numImages) {
            currentImage = index;
            currentFile = images[index].img;

            if (currentFile !== prevFile) {
                loaderElement.attr('src', currentFile).
                    load(afterLoad.curry(true)).
                    error(afterLoad.curry(false));
            }

            indicatorElements.removeClass('selected');
            $(indicatorElements[index]).addClass('selected');
            setVisibility(index);
        }
    }

    function prev() {
        setImage(currentImage - 1);
    }

    function next() {
        setImage(currentImage + 1);
    }

    function focus() {
        //if (!isFocused) {
            // TODO: expand image
        //} else {
            // TODO: collapse image.
        //}
        isFocused = !isFocused;
    }

    return {
        set: function (slideshow) {
            var swipeHandler,
                containerWidth;

            prevElement = $('.slideshow .prev');
            nextElement = $('.slideshow .next');
            indicatorElements = $('.slideshow .indicator>div');
            containerElement = $('.slideshow_container');
            backgroundElement = $('.slideshow_container .background');
            foregroundElement = $('.slideshow_container .foreground');
            loaderElement = $('.slideshow_container .loader');

            containerWidth = containerElement.width();
            containerHeight =
                E.util.min(containerWidth * E.constants.slideAspectRatio,
                    E.constants.maxSlideHeight);
            containerElement.css('height', containerHeight);
            containerElement.css('line-height', containerHeight + 'px');

            swipeHandler = jester(containerElement[0], {preventDefault: true});
            swipeHandler.swipe(function (notUsed, direction) {
                if (direction === 'left') {
                    next();
                }
                if (direction === 'right') {
                    prev();
                }
            });
            swipeHandler.tap(focus);
            images = slideshow;
            numImages = slideshow.length;
            currentImage = 0;

            setImage(0);
            setVisibility(0);
        },
        prev: prev,
        next: next
    };
}());
