var Di = require('../legacy');

describe('Injection', function () {

  it('injects dependencies by function call', function () {
    var mod = Di();
    mod.provide('sprintf', util.format, true);
    assert.ok((typeof mod.sprintf === 'function'));

    mod.provide('util.reader', function (sprintf) {
      return {
        read : function (start, end) { return sprintf('%d-%d', start, end); }
      };
    });
    assert.ok((typeof mod.util.reader === 'object'));
    assert.ok((typeof mod.util.reader.read === 'function'));
    assert.equal(mod.util.reader.read(0,88),'0-88');
  });

  it('injects dependencies by minification-safe syntax', function () {
    var mod = Di();
    mod.provide('sprintf', util.format, true); // _passthru === true
    mod.provide('util.reader', ['sprintf',function (sprintf) {
      return {
        read : function (start, end) { return sprintf('%d-%d', start, end); }
      };
    }]);
    assert.ok((typeof mod.util.reader === 'object'));
    assert.ok((typeof mod.util.reader.read === 'function'));
    assert.equal(mod.util.reader.read(0,88),'0-88');
  });

  it ('allows to inject a function', function (done) {
    var mod = Di();
    mod.provide('twice',function () {
      return function (i) { return i*2; };
    });

    mod.inject(function(twice) {
      assert.equal(this, mod);
      assert.equal(twice(2),4);
      done();
    });
  });

  it ('allows to inject an array', function (done) {
    var mod = Di();
    mod.provide('twice',function () {
      return function (i) { return i*2; };
    });

    mod.provide('ntimes',['twice',function (twice) {
      return function (i, n) { return twice(i) * n * 0.5; };
    }]);

    mod.inject(['twice','ntimes',function(twice, ntimes) {
      assert.equal(twice(2),4);
      assert.equal(ntimes(2,1),2);
      assert.equal(ntimes(2,2),4);
      done();
    }]);
  });

  it ('allows to inject dependencies with different variable names', function (done) {
    var mod = Di();

    var fn = ['util.sprintf', function (sprintf) {
      var val = sprintf('This is %s number %d','test',3);
      assert.equal(val,'This is test number 3');
      done();
    }];

    mod.provide('util.sprintf', util.format, true);
    assert.ok(mod.util);
    assert.ok(mod.util.sprintf);
    mod.inject(fn);
  });

  it ('can inject functions with arguments', function (done) {
    var mod = Di();

    var myFunction = function () {
      for (var i = 1; i < 5; ++i)  assert.equal(arguments[i-1],i);
      done();
    };
    mod.inject(myFunction, 1,2,3,4);
  });

  it ('can inject functions with dependencies and additional arguments', function (done) {
    var mod = Di();
    mod.provide('sprintf', util.format, true);

    var myFunction = function (sprintf) {
      var args = [].slice.apply(arguments).slice(1);
      args.unshift('%d to %d to %d to %d');

      assert.equal(sprintf.apply(sprintf, args), '1 to 2 to 3 to 4');
      done();
    };
    mod.inject(myFunction, 1,2,3,4);
  });

  it ('can inject functions with dependencies and additional arguments (minification-safe syntax)', function (done) {
    var mod = Di();
    mod.provide('sprintf', util.format, true);

    var myFunction = function (sprintf) {
      var args = [].slice.apply(arguments).slice(1);
      args.unshift('%d to %d to %d to %d');

      assert.equal(sprintf.apply(sprintf, args), '1 to 2 to 3 to 4');
      done();
    };
    mod.inject(['sprintf', myFunction], 1,2,3,4);
  });

});
