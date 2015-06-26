describe('Di',function () {

  var Di = require('../');

  it('initializes', function () {
    var d = new Di(null);
  });

  it('provides via callbacks', function (done) {
    var d = new Di('Math');
    d.$provide('PI', function (callback) {
      callback(null, Math.PI);
    });
    d.$provide('2PI', function (PI, callback) {
      callback(null, 2 * PI);
    });
    d.$provide('test', ['PI', '2PI', function (PI, twoPI, callback) {
      callback(null, PI - (twoPI * 0.5));
    }]);
    d.$resolve(function (err) {
      if(err) return done(err);
      assert.equal(d.PI, Math.PI);
      assert.equal(d['2PI'], 2 * Math.PI);
      assert.equal(d.test, 0);
      done();
    });
  });

  it('handles errors', function (done) {
    var d = new Di('Math');
    d.$provide('PI', function (callback) {
      callback(null, Math.PI);
    });
    d.$provide('2PI', function (PI, callback) {
      callback(new Error('Error thrown'));
    });
    d.$provide('test', ['PI', '2PI', function (PI, twoPI, callback) {
      callback(null, PI - (twoPI * 0.5));
    }]);
    d.$resolve(function (err) {
      assert.ok(err);
      assert.equal(err.message, 'Error thrown');
      done();
    });
  });

  it('provides via minify-ready callbacks', function (done) {
    var d = new Di('Math');
    d.$provide('PI', [function (callback) {
      callback(null, Math.PI);
    }]);
    d.$provide('2PI', ['PI',function (PI, callback) {
      callback(null, 2 * PI);
    }]);
    d.$provide('mulPi', ['2PI', function (PI, callback) {
      callback(null, function (val) { return val * PI; });
    }]);
    d.$provide('boolean', true);
    d.$resolve(function (err) {
      if(err) return done(err);
      var result = d.mulPi(0.5);
      assert.equal(result, Math.PI);
      assert.equal(d.boolean, true);
      done();
    });
  });

  it('it should resolve the graph and instantiate all functions once', function (done) {
    var d = new Di('base');
    var log = [];

    // @see https://github.com/angular/angular.js/blob/master/test/auto/injectorSpec.js
    //
    //          s1
    //        /  | \
    //       /  s2  \
    //      /  / | \ \
    //     /s3 < s4 > s5
    //    //
    //   s6

    d.$provide('s1', function(s2, s5, s6, callback) {
      log.push('s1'); setTimeout(callback, 0, null, log.slice());
    });

    d.$provide('s2', function(s3, s4, s5, callback) {
      log.push('s2'); setTimeout(callback, 0, null, log.slice());
    });

    d.$provide('s3', function(s6, callback) {
      log.push('s3'); setTimeout(callback, 0, null, log.slice());
    });

    d.$provide('s4', function(s3, s5, callback) {
      log.push('s4'); setTimeout(callback, 0, null, log.slice());
    });

    d.$provide('s5', function(callback) {
      log.push('s5'); setTimeout(callback, 0, null, log.slice());
    });

    d.$provide('s6', function(callback) {
      log.push('s6'); setTimeout(callback, 0, null, log.slice());
    });

    d.$resolve(function (err) {
      assert.ok(!err);
      assert.deepEqual(log,['s6', 's3', 's5', 's4', 's2', 's1']);
      assert.deepEqual(d.s6, [ 's6' ]);      
      assert.deepEqual(d.s3, [ 's6', 's3' ]);      
      assert.deepEqual(d.s5, [ 's6', 's3', 's5' ]);      
      assert.deepEqual(d.s4, [ 's6', 's3', 's5', 's4' ]);      
      assert.deepEqual(d.s2, [ 's6', 's3', 's5', 's4', 's2' ]);      
      assert.deepEqual(d.s1, [ 's6', 's3', 's5', 's4', 's2', 's1' ]);      
      assert.deepEqual(d.$get('base.s6'), [ 's6' ]);
      assert.deepEqual(d.$get('base.s3'), [ 's6', 's3' ]);
      assert.deepEqual(d.$get('base.s5'), [ 's6', 's3', 's5' ]);
      assert.deepEqual(d.$get('base.s4'), [ 's6', 's3', 's5', 's4' ]);
      assert.deepEqual(d.$get('base.s2'), [ 's6', 's3', 's5', 's4', 's2' ]);
      assert.deepEqual(d.$get('base.s1'), [ 's6', 's3', 's5', 's4', 's2', 's1' ]);      
      assert.deepEqual(d.$get('s6'), [ 's6' ]);
      assert.deepEqual(d.$get('s3'), [ 's6', 's3' ]);
      assert.deepEqual(d.$get('s5'), [ 's6', 's3', 's5' ]);
      assert.deepEqual(d.$get('s4'), [ 's6', 's3', 's5', 's4' ]);
      assert.deepEqual(d.$get('s2'), [ 's6', 's3', 's5', 's4', 's2' ]);
      assert.deepEqual(d.$get('s1'), [ 's6', 's3', 's5', 's4', 's2', 's1' ]);      
      done();
    });
  });

  it('returns an angle', function (done) {
    var d = new Di('Math');
    d.$provide('PI', [function (callback) {
      callback(null, Math.PI);
    }]);
    d.$provide('RAD_TO_DEG', ['PI',function (PI, callback) {
      callback(null, function (val) { return val * (180 / PI); });
    }]);

    d.$resolve(function (err) {
      if(err) return done(err);
      var result = d.RAD_TO_DEG(d.PI);
      assert.equal(result, 180);
      done();
    });
  });

  it('waits a few ms', function (done) {
    var d = new Di('Math');

    var threshold = 5;
    var s = 10;
    var expected = s;

    d.$provide('wait', [function (callback) {      
      callback(null, function (next) {
        var now = +new Date();
        setTimeout(function () {
          next(null, +new Date() - now);
        }, s);
      });
    }]);
    
    d.$resolve(function (err) {
      if(err) return done(err);
      d.wait(function (err, value) {
        assert.ok(Math.abs(expected - value) < threshold, 'Difference : ' + expected + ' vs. ' + value);
        done();
      });
    });
  });

});
