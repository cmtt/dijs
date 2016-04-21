describe('Promises', function () {

  testAdapter('q',function qAdapter() {
    var q = require('q');
    return {
      defer : q.defer
    };
  });

  testAdapter('bluebird', function qAdapter() {
    var bluebird = require('bluebird');
    return {
      defer : bluebird.defer
    };
  });

  function testAdapter(id, fn) {

    var Promise = fn();

    ['resolve', 'reject'].forEach(function (fnId) {
      Promise[fnId] = function (arg) {
        var defer = Promise.defer();
        defer[fnId](arg);
        return defer.promise;
      };
    });

    var Di = require('../promise');

    var defaultOptions = {
      adapter : fn
    };

    describe('PromiseAdapter: ' + id, function () {

      it('initializes', function(done) {
        var d = Di('name', defaultOptions);
        var o = Promise.defer();
        d.$provide('well',o.promise);
        d.$resolve().then(function () {
          assert.equal(d.well, 'value');
          done();
        });
        o.resolve('value');
      });

      it('handles errors', function(done) {
        var options = Object.create(defaultOptions);
        options.lazy = true;
        var d = Di('name', options);
        var o = Promise.defer();
        d.$provide('well',o.promise);
        d.$provide('well2',['well',function (well) {
          assert.equal(d.well, 'value');
          return Promise.reject(new Error('Rejecting promise'));
        }]);
        d.$resolve().then(function () {
          throw new Error('unexpected successfull resolve()');
        }, function (err) {
          assert.ok(err instanceof Error);
          assert.equal(err.message, 'Rejecting promise');
          done();
        });
        o.resolve('value');
      });

      it('allows to inject a function', function(done) {
        var options = Object.create(defaultOptions);
        options.lazy = true;

        var d = Di('name', options);
        var o = Promise.defer();
        d.$provide('well',o.promise);
        d.$provide('well2',['well',function (well) {
          assert.equal(well,'value');
          return  '3';
        }]);
        d.$resolve().then(function () {
          assert.equal(d.well, 'value');
          assert.equal(d.well2, '3');
          done();
        });
        o.resolve('value');
      });

      it('`this` equals namespace', function (done) {
        var options = Object.create(defaultOptions);
        options.lazy = true;

        var d = Di('name', options);
        var o = Promise.defer();
        d.$provide('test',function () { return this; });
        d.$resolve().then(function () {
          assert.deepEqual(d.$get('test'), d);
          done();
        });
      });


    });

  }


});
