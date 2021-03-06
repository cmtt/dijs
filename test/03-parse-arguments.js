'use strict';

describe('parseArguments', () => {
  const parseArguments = require(basePath('lib', 'parse-arguments'));

  // Some of these tests have been derived from
  // https://github.com/tunnckocore/parse-function

  const TESTS = require(basePath('contrib', 'tests'));

  it('parses a function', () => {
    let fn = function (a, b) {};
    let params = ['a', 'b'];
    let result = parseArguments(fn);
    assert.deepEqual(result, { fn, params });
  });

  it('parses an arrow function', () => {
    let fn = (a, b) => {};
    let params = ['a', 'b'];
    let result = parseArguments(fn);
    assert.deepEqual(result, { fn, params });
  });

  it('parses an array', () => {
    let fn = function (a, b) {};
    let params = ['a', 'b'];
    let arr = params.concat([fn]);
    let result = parseArguments(arr);
    assert.deepEqual(result, { fn, params });
  });

  it('should work for ES2015 class methods - parse method from instance', () => {
    class EqualityChecker {
      isEqual (a, b) { /* istanbul ignore next */ return a === b; }
    }

    let checker = new EqualityChecker();
    let actual = parseArguments(checker.isEqual);
    assert.deepEqual(actual.params, ['a', 'b']);
  });

  it('should work for ES2015 class methods - parse method from prototype', () => {
    class Baz {
      qux (x, y) { /* istanbul ignore next */ return x + y; }
    }

    let actual = parseArguments(Baz.prototype.qux);
    assert.deepEqual(actual.params, ['x', 'y']);
  });

  it('should parse correctly ES2015 method in `function-less` notation', () => {
    let obj = {
      foobar (abc, def) { /* istanbul ignore next */ return abc * def; }
    };

    let actual = parseArguments(obj.foobar);
    assert.deepEqual(actual.params, ['abc', 'def']);
  });

  it('parses functions with "$inject" property', () => {
    function TestFunction () {
      return arguments[0] * 2;
    }

    TestFunction.$inject = ['PI'];
    let actual = parseArguments(TestFunction);
    assert.deepEqual(actual.params, ['PI']);
  });

  it('parses E2015 classes with "$inject" static property', () => {
    class TestClass {
      static get $inject () {
        return ['PI'];
      }
    }

    let actual = parseArguments(TestClass);
    assert.deepEqual(actual.params, ['PI']);
  });

  TESTS.forEach((test) => {
    it(`${test.fn}`, () => {
      let params = parseArguments(test.fn);
      assert.deepEqual(params.params, test.params);
    });
  });
});
