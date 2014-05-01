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

  it ('throws an error when attempting to inject with unknown dependencies', function () {
    var mod = Di();
    var _testFunction = function () {
      mod.inject(function (unknownDependency) {
        return true;
      });
    };
    assert.throws(_testFunction, 'Not found: test');
  })

  it ('does not throw an error when attempting to run with unknown dependencies', function () {
    var mod = Di();
    mod.provide('sprintf', util.format, true)
    var _testFunction1 = function () {
      mod.run(function (unknownDependency) {
        assert.equal(arguments[0],1);
        assert.equal(arguments[1],2);
        assert.equal(arguments[2],3);
        assert.equal(arguments[3],4);
        return true;
      }, 1,2,3,4);
    };
    var _testFunction2 = function () {
      mod.run(function (sprintf) {
        // provide arguments to run () by removing the first argument (sprintf)
        var args = Array.prototype.slice.apply(arguments).slice(1);
        assert.equal(args[0],1);
        assert.equal(args[1],2);
        assert.equal(args[2],3);
        assert.equal(args[3],4);
        assert.equal(sprintf('%d Numbers', args.length),'4 Numbers');
        return true;
      }, 1,2,3,4);
    };

    assert.doesNotThrow(_testFunction1);
    assert.doesNotThrow(_testFunction2);
  })


})
