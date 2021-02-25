'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.strCamel = exports.strStudly = exports.strLcwords = exports.strUcwords = exports.inArray = exports.isFunction = exports.isObject = exports.isNumber = exports.isArray = exports.isString = exports.parseQueryString = exports.buildQueryString = exports.merge = void 0;
const qs_1 = __importDefault(require("qs"));
const merge = (target, source) => {
    if (exports.isObject(source)) {
        if (source.constructor !== Object) {
            target = source;
        }
        else {
            if (!target || !exports.isObject(target)) {
                target = {};
            }
            Object.keys(source).map((k) => {
                if (!target[k]) {
                    target[k] = null;
                }
                target[k] = exports.merge(target[k], source[k]);
            });
        }
    }
    else if (exports.isArray(source)) {
        if (!target || !exports.isArray(target)) {
            target = [];
        }
        target = target.concat(target, source);
    }
    else {
        target = source;
    }
    return target;
};
exports.merge = merge;
const buildQueryString = function (data, options = {}) {
    return qs_1.default.stringify(data, options);
};
exports.buildQueryString = buildQueryString;
const parseQueryString = function (data, options = {}) {
    return qs_1.default.parse(data, options);
};
exports.parseQueryString = parseQueryString;
const isString = function (data) {
    return Object.prototype.toString.call(data) == '[object String]';
};
exports.isString = isString;
const isArray = function (data) {
    return Object.prototype.toString.call(data) == '[object Array]';
};
exports.isArray = isArray;
const isNumber = function (data) {
    return Object.prototype.toString.call(data) == '[object Number]';
};
exports.isNumber = isNumber;
const isObject = function (data) {
    return Object.prototype.toString.call(data) == '[object Object]';
};
exports.isObject = isObject;
const isFunction = function (data) {
    return data && toString.call(data) == '[object Function]' || toString.call(data) == '[object AsyncFunction]';
};
exports.isFunction = isFunction;
const inArray = function (data, arr, strict = false) {
    if (!exports.isArray(arr))
        return strict ? data === arr : data == arr;
    if (exports.isFunction(arr.findIndex)) {
        return arr.findIndex((o) => { return strict ? o === data : o == data; }) > -1;
    }
    else {
        let flag = false;
        for (let i = 0; i < arr.length; i++) {
            if (strict ? data === arr[i] : data == arr[i]) {
                flag = true;
                break;
            }
        }
        return flag;
    }
};
exports.inArray = inArray;
// 将单词首字母转成大写，'hello word' => 'Hello World'
const strUcwords = function (str) {
    return str.replace(/\b[a-z]/gi, function (letter) {
        return letter.toUpperCase();
    });
};
exports.strUcwords = strUcwords;
// 将单词首字母转成小写，'Hello World' => 'hello word'
const strLcwords = function (str) {
    return str.replace(/\b[a-z]/gi, function (letter) {
        return letter.toLowerCase();
    });
};
exports.strLcwords = strLcwords;
// 驼峰（首字母大写），'hello word' => 'HelloWorld'
const strStudly = function (value) {
    return exports.strUcwords(value.replace(/[\-|\_]/gi, ' ')).replace(/\s/gi, '');
};
exports.strStudly = strStudly;
// 驼峰（首字母小写），'hello word' => 'helloWorld'
const strCamel = function (value) {
    return exports.strLcwords(exports.strStudly(value));
};
exports.strCamel = strCamel;
