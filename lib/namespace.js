'use strict';

const RGX_DELIMITER = /(\w+)\.?/ig;

class Namespace {

  /**
   * @param {string} id
   */

  constructor (id) {
    this._root = {};
    this.id = id;
  }

  get id () {
    return this._id;
  }

  set id (id) {
    this._id = id;
  }

  /**
   * @method get
   * @param {string} p
   */

  get (key) {
    let match = null;
    let ref = this._root;
    let refKey = '';
    let index = -1;
    while ((match = RGX_DELIMITER.exec(key))) {
      ++index;
      refKey = match[1];
      if (refKey === this._id && index === 0) {
        continue;
      }
      ref = ref[refKey];
    }
    return ref;
  }

  /**
   * @method get
   * @param {string} p
   * @param {*} value
   */

  set (key, value) {
    let match = null;
    let ref = this._root;
    let lastRef = this._root;
    let refKey = '';
    let index = -1;
    while ((match = RGX_DELIMITER.exec(key))) {
      ++index;
      refKey = match[1];
      if (refKey === this._id && index === 0) {
        continue;
      }
      ref[refKey] = ref[refKey] || {};
      lastRef = ref;
      ref = ref[refKey];
    }

    lastRef[refKey] = value;
    return this;
  }
}

module.exports = Namespace;
