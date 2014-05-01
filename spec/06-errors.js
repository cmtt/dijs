describe('Errors', function () {

  it ('throws an error when a dependency cannot be resolved', function () {
    var mod = Di();
    var _testFunction = function () {
      mod.provide('test', function (unknownDependency) {
        throw new Error('unknownDependency resolved');
      });
    };
    assert.throws(_testFunction, 'Not found: "unknownDependency"');
  })

  it ('throws an error in case of circular dependencies', function () {
    var mod = Di('test');
    var _testFunction = function () {
      mod.provide('unknownDependency', function () {
        return true;
      });
      mod.provide('test', function (unknownDependency, test) {
        return true;
      });
    };
    assert.throws(_testFunction, 'Circular: test -> test');
  })

  it ('does not throw an error with correct syntax', function (done) {
    var mod = Di();
    var _testFunction = function () {
      mod.provide('test',[function (unknownDependency) {
        return 'ok';
      }]);
    };
    _testFunction();
    var unknownDependency = mod.get('test');
    assert.equal(unknownDependency,'ok');
    done()
  })

  it ('does not throw an error when a function is declared in one line', function () {
    var mod = Di();
    mod.provide('fn',function () { return function () {}; });
    mod.provide('fn2',function (fn) { return fn });
  })

})
