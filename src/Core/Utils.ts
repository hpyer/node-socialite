'use strict';

import Qs from 'qs';
import Crypto from 'crypto';

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

/**
 * 生成哈希
 * @param str 原文字符串
 * @param type 哈希方式，可选：sha1、md5等待，默认：sha1
 * @param target 生成的目标类型，可选：latin1、hex、base64，默认：hex
 */
export const generateHash = function (str: Crypto.BinaryLike, type: string = 'sha1', target: Crypto.BinaryToTextEncoding = 'hex'): string {
  return Crypto.createHash(type).update(str).digest(target);
}

/**
 * 生成哈希校验码
 * @param str 原文字符串
 * @param type 加密方式，可选：sha256等待，默认：sha256
 * @param target 生成的目标类型，可选：latin1、hex、base64，默认：hex
 */
export const generateHmac = function (str: Crypto.BinaryLike, key: string, type: string = 'sha256', target: Crypto.BinaryToTextEncoding = 'hex'): string {
  return Crypto.createHmac(type, key).update(str).digest(target);
}

/**
 * 格式化时间
 * @param fmt 日期格式
 * @param timeStr 时间字符串
 * @returns
 */
export const formatTime = function (fmt: string, timeStr: string = null) {
  let date = null;
  if (!timeStr) {
    date = new Date;
  }
  else if (typeof timeStr == 'object') {
    date = timeStr;
  }
  else if (typeof timeStr == 'number' || (typeof timeStr == 'string' && timeStr.match(/^\d*$/))) {
    if ((timeStr + '').length == 10) {
      timeStr += timeStr + '000';
    }
    date = new Date;
    date.setTime(timeStr);
  }
  else {
    date = new Date(timeStr.replace(/\-/g, '/'))
  }

  // 返回时间戳
  if (fmt == 'timestamp' || fmt == 'unix' || fmt == 'u') {
    return date.getTime();
  }

  var o = {
    'YYYY': date.getFullYear(), //年份(4位)
    'YY': date.getFullYear(), //年份(2位)
    'M+': date.getMonth() + 1, //月份
    'd+': date.getDate(), //日
    'h+': date.getHours() % 12 == 0 ? 12 : date.getHours() % 12, //小时
    'H+': date.getHours(), //小时
    'm+': date.getMinutes(), //分
    'i+': date.getMinutes(), //分
    's+': date.getSeconds(), //秒
    'q+': Math.floor((date.getMonth() + 3) / 3), //季度
    'S': date.getMilliseconds() //毫秒
  }
  let res = fmt.match(/(y+)/i);
  if (res) {
    fmt = fmt.replace(res[1], (o['YYYY'] + '').substring(4 - res[1].length))
  }
  for (var k in o) {
    res = fmt.match(new RegExp('(' + k + ')'));
    if (res) {
      fmt = fmt.replace(res[1], (res[1].length == 1) ? o[k] : ('00' + o[k]).substring(('' + o[k]).length))
    }
  }

  return fmt;
};
