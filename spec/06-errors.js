describe('Errors', function () {

  it ('throws an error when a dependency cannot be resolved', function () {
    var mod = new Di();
    var _testFunction = function () {
      mod.provide('test', function (unknownDependency) {
        throw new Error('unknownDependency resolved');
      });
    };
    assert.throws(_testFunction, 'could not resolve "unknownDependency"');
  })

  it ('throws an error in case of circular dependencies', function () {
    var mod = new Di('test');
    var _testFunction = function () {
      mod.provide('unknownDependency', function () {
        return true;
      });
      mod.provide('test', function (unknownDependency, test) {
        return true;
      });
    };
    assert.throws(_testFunction, 'Circular reference detected: test -> test');
  })

  it ('does not throw an error with correct syntax', function (done) {
    var mod = new Di();
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

})
