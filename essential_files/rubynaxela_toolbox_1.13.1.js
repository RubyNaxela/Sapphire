// Enums
const RTEnums = {
    SHORT_PL: "short_pl", FULL_PL: "full_pl"
}

// Macros processor
const processStaticMacro = (key, value) => {
    document.body.innerHTML = document.body.innerHTML
        .replace(new RegExp(`<!--rn:${key}-->`, "g"), value);
}

// Shorthand selectors
const selectElement = obj => document.querySelector(obj);
const selectElements = obj => document.querySelectorAll(obj);
const forAllElements = (selector, consumer) => selectElements(selector).forEach(consumer);

// Attributes functions
const getMetaData = metaName => selectElement(`meta[name='${metaName}']`).getAttribute("content");
const addClass = (node, className) => $(node).addClass(className);
const removeClass = (node, className) => $(node).removeClass(className);
const containsClass = (node, className) => $(node).hasClass(className);
const applyAttributeToElements = (selector, attributeKey, attributeValue) =>
    forAllElements(selector, element => element.setAttribute(attributeKey, attributeValue));
const addClickListenerToElements = (selector, action) =>
    forAllElements(selector, element => element.addEventListener("click", action));
const addChangeListenerToElements = (selector, action) =>
    forAllElements(selector, element => element.addEventListener("change", action));

// Shorthand element constructor
const constructElement = (type, ...content) => {
    const attributes = content[0],
        element = document.createElement(type);
    for (const attr in attributes) element.setAttribute(attr.replace(/\_/g, "-"), attributes[attr]);
    for (var i = 1; i < content.length; i++) {
        const child = content[i];
        if (typeof child == "string") element.insertAdjacentHTML('beforeend', child);
        else if (typeof child == "object") element.appendChild(child);
    }
    return element;
}

// Node replacer
const replaceNode = (oldNode, newNode) => {
    oldNode.parentNode.insertBefore(newNode, oldNode);
    oldNode.parentNode.removeChild(oldNode);
}

// Node remover
const removeNode = node => node.parentNode.removeChild(node);

// Opens file download dialog prompting to download given string as file with given name
const downloadFile = (content, name) => {
    const virtual_anchor = constructElement("a", {
        href: "data:text/json;charset=utf-8," + encodeURIComponent(content),
        download: name, style: "display: none", target: "_blank"
    })
    document.body.appendChild(virtual_anchor);
    virtual_anchor.click();
    document.body.removeChild(virtual_anchor);
}

// Executes given function displaying eventual error messages in alerts
const showErrorsAsAlert = func => {
    try {
        func();
    } catch (e) {
        alert(e.message);
        throw e;
    }
}

// CSS units calculating functions
const rem = _rem => _rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
const vh = _vh => 0.01 * _vh * $(window).height();
const vw = _vw => 0.01 * _vw * $(window).width();

// Checks if value is defined as non-null
const _ = (value) => value != null && value != undefined;
// Checks if value is defined as non-null, non-zero and isn't an empty string or object
const __ = (value) => value != null && value != undefined
    && value != 0 && value != '' && (typeof value != "object" ? true : !jQuery.isEmptyObject(value));
// Checks if value is positive
const _P = (value) => value > 0

// Greatest common divisor
const gcd = (a, b) => (b == 0) ? a : gcd(b, a % b);

// Simple rounding with Number.EPSILON added to nearest integer 
const simpleRound = number => Math.round(Number.EPSILON + number);

// An object that provides some data formatting functions
const Format = {
    /**
     * @param {Number} value Defines the numeric value to format.
     * @param {Object} format Format object.
     * @param {Number} format.round Rounds with precission of (-n)th power of 10.
     * @param {Number} format.floor Rounds down with precission of (-n)th power of 10.
     * @param {Number} format.ceil Rounds up with precission of (-n)th power of 10.
     * @param {Number} format.leadingZeros Fills the number with zeros at the beginning.
     * @param {Number} format.trailingZeros Fills the number with zeros at the end.
     * @param {String} format.prefix Adds a prefix before the number.
     * @param {String} format.suffix Adds a suffix after the number.
     * @param {String[]} format.wrapNegative Wraps number with a delimiter of first two values if it's negative.
     * @param {String[]} format.wrapPositive Wraps number with a delimiter of first two values if it's positive.
     * @param {Boolean} format.showSign true: always shows sign; false: never shows sign; undefined: shows only "-".
     * @returns {String} Formatted number.
     * @example Format.number({value: 6.58, floor: 2, trailingZeros: 2, prefix: "£"})
     */
    number: (value, format) => {
        if (!_(format))
            throw new Error("No format options provided");

        var result = `${value}`;

        if ((_(format.round) && _(format.floor))
            || (_(format.round) && _(format.ceil))
            || (_(format.floor) && _(format.ceil)))
            throw new Error("Only one rounding function can be used at once (round, floor or ceil)");
        if (_(format.round))
            result = `${Math.round((value + Number.EPSILON)
                * Math.pow(10, format.round)) / Math.pow(10, format.round)}`;
        else if (_(format.floor))
            result = `${Math.floor((value + Number.EPSILON)
                * Math.pow(10, format.floor)) / Math.pow(10, format.floor)}`;
        else if (_(format.ceil))
            result = `${Math.ceil((value + Number.EPSILON)
                * Math.pow(10, format.ceil)) / Math.pow(10, format.ceil)}`;


        if (_(format.leadingZeros) && _P(format.leadingZeros))
            result = "0".repeat(Math.max(0, format.leadingZeros - (result.includes(".") ?
                result.split(".")[0].length : result.length))) + result;
        if (_(format.trailingZeros) && _P(format.trailingZeros))
            result += result.includes(".") ?
                "0".repeat(Math.max(0, format.trailingZeros - result.split(".")[1].length))
                : `.${"0".repeat(format.trailingZeros)}`;

        if (_(format.prefix)) result = format.prefix + result;
        if (_(format.suffix)) result += format.suffix;

        if (_(format.showSign)) {
            if (format.showSign && value > 0) result = "+" + result;
            if (!format.showSign && value < 0) result = result.replace("-", "");
        }

        if (_(format.wrapNegative))
            if (value < 0)
                result = format.wrapNegative[0] + result + format.wrapNegative[1];
        if (_(format.wrapPositive))
            if (value > 0)
                result = format.wrapPositive[0] + result + format.wrapPositive[1];

        return result;
    },

    /**
     * @param {String} value Defines the date to format. Must be written as yyyy/mm/dd.
     * @param {Object} format Format object.
     * @param {Object} format.format Date format notation.
     */
    date: (value, format) => {
        if (!value.match(/[0-9]{4}\/[0-9]{2}\/[0-9]{2}/))
            throw new Error("Date must be written as yyyy/mm/dd");
        if (!_(format))
            throw new Error("No format options provided");

        const year = value.split("/")[0], month = value.split("/")[1], day = value.split("/")[2];
        var result;

        if (!_(format.format))
            throw new Error("No date format provided");
        result = format.format
            .replace("yyyy", year)
            .replace("mm", month)
            .replace("dd", day)
            .replace("yy", `${day.split("")[2]}${day.split("")[3]}`)
            .replace("m", Number.parseInt(month))
            .replace("d", Number.parseInt(day));


        if (format.format.includes("MM")) {
            if (!_(format.month))
                throw new Error("MM indicates month in words, but no month format provided");
            switch (format.month) {
                case RTEnums.FULL_PL:
                    result = result.replace("MM", ["?",
                        "stycznia", "lutego", "marca", "kwietnia", "maja", "czerwca",
                        "lipca", "sierpnia", "września", "października", "listopada", "grudnia"]
                    [Number.parseInt(month)]); break;
                case RTEnums.SHORT_PL:
                    result = result.replace("MM", ["?",
                        "sty.", "lut.", "mar.", "kwi.", "maj.", "cze.",
                        "lip.", "sie.", "wrz.", "paź.", "lis.", "gru."]
                    [Number.parseInt(month)]); break;
                default: throw new Error("Invalid month format");
            }
            return result;
        }
    }
};
Object.freeze(Format);

// Color prototype
class Color {
    constructor(...colorData) {
        if (colorData.length == 1 && typeof colorData[0] == "string") {
            if (colorData[0].match(/^rgb\((\s*[0-9]{1,3}\s*,){2}\s*[0-9]{1,3}\s*\)$/)) {
                const components = colorData[0].replace("rgb(", "").replace(")", "").split(",");
                this.r = parseInt(components[0]);
                this.g = parseInt(components[1]);
                this.b = parseInt(components[2]);
                this.a = 255;
            } else if (colorData[0].match(/^rgba\((\s*[0-9]{1,3}\s*,){3}\s*[0-9]{1,3}\s*\)$/)) {
                const components = colorData[0].replace("rgba(", "").replace(")", "").split(",");
                this.r = parseInt(components[0]);
                this.g = parseInt(components[1]);
                this.b = parseInt(components[2]);
                this.a = parseInt(components[3]);
            } else if (colorData[0].match(/^#?[0-f0-F]{3}$/)) {
                const components = colorData[0].replace("#", "").split("");
                this.r = parseInt(components[0].repeat(2), 16);
                this.g = parseInt(components[1].repeat(2), 16);
                this.b = parseInt(components[2].repeat(2), 16);
                this.a = 255;
            } else if (colorData[0].match(/^#?([0-f0-F]{3}){2}$/)) {
                const components_raw = colorData[0].replace("#", "").split(""),
                    components = [
                        components_raw[0] + components_raw[1],
                        components_raw[2] + components_raw[3],
                        components_raw[4] + components_raw[5]];
                this.r = parseInt(components[0], 16);
                this.g = parseInt(components[1], 16);
                this.b = parseInt(components[2], 16);
                this.a = 255;
            } else if (colorData[0].match(/^#?[0-f0-F]{4}$/)) {
                const components = colorData[0].replace("#", "").split("");
                this.r = parseInt(components[0].repeat(2), 16);
                this.g = parseInt(components[1].repeat(2), 16);
                this.b = parseInt(components[2].repeat(2), 16);
                this.a = parseInt(components[3].repeat(2), 16);
            } else if (colorData[0].match(/^#?([0-f0-F]{4}){2}$/)) {
                const components_raw = colorData[0].replace("#", "").split(""),
                    components = [
                        components_raw[0] + components_raw[1],
                        components_raw[2] + components_raw[3],
                        components_raw[4] + components_raw[5],
                        components_raw[6] + components_raw[7]];
                this.r = parseInt(components[0], 16);
                this.g = parseInt(components[1], 16);
                this.b = parseInt(components[2], 16);
                this.a = parseInt(components[3], 16);
            } else {
                throw new Error('Invalid color data; color must be given in one of those notations: '
                    + 'r,g,b | r,g,b,a | "rgb(r,g,b)" | "rgba(r,g,b,a)" | '
                    + '"rgb" | "rgba" | "#rgb" | "#rgba" | "#rrggbb" | "#rrggbbaa"');
            }
        } else if (colorData.length == 3) {
            this.r = colorData[0];
            this.g = colorData[1];
            this.b = colorData[2];
            this.a = 255;
        } else if (colorData.length == 4) {
            this.r = colorData[0];
            this.g = colorData[1];
            this.b = colorData[2];
            this.a = colorData[3];
        } else {
            throw new Error('Invalid color data; color must be given in one of those notations: '
                + 'r,g,b | r,g,b,a | "rgb(r,g,b)" | "rgba(r,g,b,a)" | '
                + '"rgb" | "rgba" | "#rgb" | "#rgba" | "#rrggbb" | "#rrggbbaa"');
        }
    }

    lightness = (amount) => {
        const level = 0.01 * amount;
        if (amount > 0) return new Color(
            this.r + level * (255 - this.r),
            this.g + level * (255 - this.g),
            this.b + level * (255 - this.b),
            this.a);
        else if (amount < 0) return new Color(
            this.r + level * this.r,
            this.g + level * this.g,
            this.b + level * this.b,
            this.a);
        else return this;
    }

    opacity = (amount) => {
        const level = 0.01 * amount;
        if (amount > 0) return new Color(this.r, this.g, this.b, this.a + level * (255 - this.a));
        else if (amount < 0) return new Color(this.r, this.g, this.b, this.a + level * this.a);
        else return this;
    }

    get rgbaNotation() {
        return `rgb(${simpleRound(this.r)}, ${simpleRound(this.g)}, ${simpleRound(this.b)}, ${simpleRound(this.a)})`;
    }

    get hexNotation() {
        return `#${simpleRound(this.r).toString(16)}`
            + `${simpleRound(this.g).toString(16)}`
            + `${simpleRound(this.b).toString(16)}`
            + `${simpleRound(this.a).toString(16)}`
    }
}