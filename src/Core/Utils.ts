'use strict';

import Qs from 'qs';

export const merge = (target: any, source: any): any => {
  if (isObject(source)) {
    if (source.constructor !== Object) {
      target = source;
    }
    else {
      if (!target || !isObject(target)) {
        target = {};
      }
      Object.keys(source).map((k) => {
        if (!target[k]) {
          target[k] = null;
        }
        target[k] = merge(target[k], source[k]);
      });
    }
  }
  else if (isArray(source)) {
    if (!target || !isArray(target)) {
      target = [];
    }
    target = target.concat(target, source);
  }
  else {
    target = source;
  }
  return target;
}

export const buildQueryString = function (data: object, options: object = {}): string
{
  return Qs.stringify(data, options);
};

export const parseQueryString = function (data: string, options: object = {}): object
{
  return Qs.parse(data, options);
};

export const isString = function (data: any): boolean
{
  return Object.prototype.toString.call(data) == '[object String]';
};
export const isArray = function (data: any): boolean
{
  return Object.prototype.toString.call(data) == '[object Array]';
};
export const isNumber = function (data: any): boolean
{
  return Object.prototype.toString.call(data) == '[object Number]';
};
export const isObject = function (data: any): boolean
{
  return Object.prototype.toString.call(data) == '[object Object]';
};
export const isFunction = function (data: any): boolean
{
  return data && toString.call(data) == '[object Function]' || toString.call(data) == '[object AsyncFunction]';
};

export const inArray = function (data: any, arr: any, strict: boolean = false): boolean
{
  if (!isArray(arr)) return strict ? data === arr : data == arr;
  if (isFunction(arr.findIndex)) {
    return arr.findIndex((o) => { return strict ? o === data : o == data }) > -1;
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

// 将单词首字母转成大写，'hello word' => 'Hello World'
export const strUcwords = function (str: string): string
{
  return str.replace(/\b[a-z]/gi, function (letter) {
    return letter.toUpperCase();
  });
};

// 将单词首字母转成小写，'Hello World' => 'hello word'
export const strLcwords = function (str: string): string
{
  return str.replace(/\b[a-z]/gi, function (letter) {
    return letter.toLowerCase();
  });
};

// 驼峰（首字母大写），'hello word' => 'HelloWorld'
export const strStudly = function (value: string): string
{
  return strUcwords(value.replace(/[\-|\_]/gi, ' ')).replace(/\s/gi, '');
};

// 驼峰（首字母小写），'hello word' => 'helloWorld'
export const strCamel = function (value: string): string
{
  return strLcwords(strStudly(value));
};
