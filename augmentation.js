/**
 * File containing basic augmentations to javascript. Required by most other
 * files, directly or indirectly.
 *
 */

/**
 * Adds map method to arrays if it doesn't exist. Created by Mozilla foundation
 *
 * @example [1, 2, 3].map(function (x) { return x * x; })
 * // [1, 4, 9]
 */
if (!Array.prototype.map) {
    Array.prototype.map = function (fun) {
        var len = this.length,
            res,
            thisp,
            i;

        if (typeof fun !== "function") {
            throw new TypeError();
        }


        res = new Array(len);
        thisp = arguments[1];
        for (i = 0; i < len; i++)
        {
            if (i in this)
                res[i] = fun.call(thisp, this[i], i, this);
        }

        return res;
    };
}

/**
 * Adds a reduce method to arrays if it doesn't exist. Created by Mozilla
 * foundation.
 *
 * @example [1, 2, 3].reduce(function (prev, curr) {return prev + curr}, 10);
 * // 16 (10 + 1 + 2 + 3)
 */
if (!Array.prototype.reduce) {
    Array.prototype.reduce = function reduce(accumulator){
        if (this === null || this === undefined) {
            throw new TypeError("Object is null or undefined");
        }
        var i = 0, l = this.length || 0, curr;

        if (typeof accumulator !== "function") { // ES5 : "If IsCallable(callbackfn) is false, throw a TypeError exception."
            throw new TypeError("First argument is not callable");
        }

        if (arguments.length < 2) {
            if (l === 0) {
                throw new TypeError("Array length is 0 and no second argument");
            }
            curr = this[0];
            i = 1; // start accumulating at the second element
        }
        else {
            curr = arguments[1];
        }

        while (i < l) {
            if(i in this) curr = accumulator.call(undefined, curr, this[i], i, this);
            ++i;
        }

        return curr;
    };
}

/**
 * Adds a method to the calling object. Created by Douglas Crockford.
 *
 * @param name the name of the new method
 * @param func function implementing the new method
 *
 * Example:
 * Number.method('double', function () { return this * 2; });
 * (2).double() // 4
 */
Function.prototype.method = function (name, func) {
    this.prototype[name] = func;
    return this;
};

/**
 * Adds currying to functions. Created by Douglas Crockford.
 *
 * @example
 * function add(a, b) {
 *     return a + b;
 * }
 * var add5 = add.curry(5);
 * typeof add5 // function
 * add5(3) // 8
 *
 * @example
 * function concat(a, b, c, d) {
 *     return a.toString() + b.toString() + c.toString() + d.toString();
 * }
 * var iCanHas = concat.curry('I ', 'can ', 'has ');
 * typeof iCanHas // function
 * iCanHas('cheezeburger?'); // 'I can has cheezeburger?'
 */
Function.method('curry', function () {
    var slice = Array.prototype.slice,
        args = slice.apply(arguments),
        that = this;

    return function () {
        return that.apply(null, args.concat(slice.apply(arguments)));
    };
});

/**
 * Adds a first-method to arrays.
 *
 * @returns the first element of the array
 * @example [1, 2, 3].first(); // 1
 */
Array.method('first', function () {
    return this[0];
});

/**
 * Adds a last-method to arrays.
 *
 * @returns the last element of the array
 * @example [1, 2, 3].last(); // 3
 */
Array.method('last', function () {
    return this[this.length - 1];
});

Array.method('removeUndefined', function () {
    var i;
    for (i = 0; i < this.length; i++) {
        if (this[i] === undefined) {
            this.splice(i, 1);
        }
    }
    return this;
});

/**
 * Adds a empty-method to strings. Empty in this context means containing
 * nothing but 0 or more whitespace.
 *
 * @returns true if the string is empty, false if not.
 * @example "   ".empty() // true
 * @example "zebra".empty() // false
 */
String.method('empty', function () {
    return this.match(/^\s*$/) !== null;
});

/**
 * Adds a trim-method to strings. Removes whitespaces at beginning and end of
 * strings.
 *
 * @returns the string without whitespaces at the beginning or the end.
 * @exampel "   can't touch this   ".trim() // "can't touch this"
 */
String.method('trim', function () {
    return this.replace(/^\s+|\s+$/g, '');
});

/**
 * Adds method for encoding string to UTF-8.
 *
 * @returns the string encoded as UTF-8
 * @example "blöt räv".encodeUtf8() // "bl%C3%B6t%20r%C3%A4v"
 */
String.method('encodeUtf8', function () {
    return encodeURIComponent(this);
});

/**
 * Adds method to decoding string from UTF-8.
 *
 * @returns the string decoded from UTF-8
 * @example "bl%C3%B6t%20r%C3%A4v".decodeUtf8() // "blöt räv"
 */
String.method('decodeUtf8', function () {
    return decodeURIComponent(this);
});

/**
 * Adds method to capitalise a string.
 * @return the string capitalised
 * @example
 * "CAPS LOCK IS LIKE CRUISE CONTROL FOR COOL".capitalise()
 * // "Caps lock is like cruise control for cool"
 */
String.method('capitalise', function () {
    return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase();
});

/**
 * Adds a method to pad a string with a padstring
 * @return the string padded with given padstring
 * @example
 * "6".lpad("0", 5); //result "00006"
 * "16".lpad("0", 5); //result "00016"
 */
String.method('lpad', function (padString, length) {
    var str = this;
    while (str.length < length)
        str = padString + str;
    return str;
});

String.method('shorten', function (length, end) {
    var str = this;
    end = end || '...';
    if (str && str.length > length) {
        str = str.substr(0, length) + end;
    }
    return str;
});

/**
 * Adds a method for getting the absolute value of a number.
 *
 * @return the absolute value of the number.
 * @example
 * (3).abs() // 3
 * (-3).abs() // 3
 */
Number.method('abs', function () {
    return (((this - 0) >= 0) ? this : -this) - 0;
});

/**
 * Adds method to convert an angle in degrees to radians.
 * @return the angle that the number represents in degrees, converted to
 * radians.
 * @example
 * (180).toRad(); // 3.1415926535
 *
 */
Number.method('toRad', function () {
    return this * Math.PI / 180;
});


/**
 * Adds method to extract the integer part of a number (rounding down)
 * @retun the integer part of the number.
 * @example
 * var sortOfPi = (3.14159265).toInt() // 3
 */
Number.method('toInt', function () {
    return Math[this > 0 ? 'floor' : 'ceil'](this);
});

/**
 * Sorts an array numerically instead of in dictionary order
 * I.e. array(50, 2, 10, 11, 400) will be returned
 * as array(2, 10, 11, 50, 400) instead of
 *    array(10, 11, 2, 400, 50) as normal sort will give
 * @retun the sorted array.
 * @example
 * var arr = [50, 2, 10, 11, 400];
 * arr.sortNumeric() //2, 10, 11, 50, 400
 */
Array.method('sortNumeric', function () {
    return this.sort(function(a, b) {return a - b;});
});
