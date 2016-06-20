'use strict';

const Di = require(basePath('lib', 'di'));
const CallbackMethod = require(basePath('methods', 'callback'));

describe('CallbackMethod', () => {
  it('initializes', (done) => {
    let d = new Di(CallbackMethod, null);
    d.$resolve(done);
  });

  it('initializes by default with CallbackMethod', (done) => {
    let d = new Di();
    d.$provide('PI', Math.PI);
    d.$resolve((err) => {
      if (err) {
        return done(err);
      }
      assert.equal(d.PI, Math.PI);
      done();
    });
  });

  it('passthrough using defaultFunction', (done) => {
    let d = new Di(CallbackMethod, null);
    d.$provide('PI', Math.PI, true);
    d.$resolve((err) => {
      if (err) {
        return done(err);
      }
      assert.equal(d.$get('PI'), Math.PI);
      done();
    });
  });

  it('$provideValue using defaultFunction', (done) => {
    let d = new Di(CallbackMethod, null);
    d.$provideValue('PI', Math.PI);
    d.$resolve((err) => {
      if (err) {
        return done(err);
      }
      assert.equal(d.$get('PI'), Math.PI);
      done();
    });
  });

  it('throws an error when no callback was provided', () => {
    assert.throws(() => {
      let d = new Di(CallbackMethod, null);
      d.$resolve();
    });
  });

  it('error when declaring unknwon dependencies', (done) => {
    let d = new Di(CallbackMethod, null);
    d.$provide('2PI', (PI, callback) => {
      callback(null);
    });
    d.$resolve((err) => {
      assert.ok(err);
      done();
    });
  });

  it('provides via callbacks', (done) => {
    let d = new Di(CallbackMethod, 'Math');
    d.$provide('PI', (callback) => {
      callback(null, Math.PI);
    });
    d.$provide('2PI', (PI, callback) => {
      callback(null, 2 * PI);
    });
    d.$provide('test', ['PI', '2PI', (PI, twoPI, callback) => {
      callback(null, PI - (twoPI * 0.5));
    }]);
    d.$resolve((err) => {
      if (err) {
        return done(err);
      }

      assert.equal(d.PI, Math.PI);
      assert.equal(d['2PI'], 2 * Math.PI);
      assert.equal(d.test, 0);
      done();
    });
  });

  it('handles errors', (done) => {
    let d = new Di(CallbackMethod, 'Math');
    d.$provide('PI', (callback) => {
      callback(null, Math.PI);
    });
    d.$provide('2PI', (PI, callback) => {
      callback(new Error('Error thrown'));
    });
    d.$provide('test', ['PI', '2PI', (PI, twoPI, callback) => {
      callback(null, PI - (twoPI * 0.5));
    }]);
    d.$resolve((err) => {
      assert.ok(err);
      assert.equal(err.message, 'Error thrown');
      done();
    });
  });

  it('provides via minification-ready syntax', (done) => {
    let d = new Di(CallbackMethod, 'Math');
    d.$provide('PI', [(callback) => {
      callback(null, Math.PI);
    }]);
    d.$provide('2PI', ['PI', (PI, callback) => {
      callback(null, 2 * PI);
    }]);
    d.$provide('mulPi', ['2PI', (PI, callback) => {
      callback(null, (val) => val * PI);
    }]);
    d.$provide('boolean', true);
    d.$resolve((err) => {
      if (err) {
        return done(err);
      }

      let result = d.mulPi(0.5);
      assert.equal(result, Math.PI);
      assert.equal(d.boolean, true);
      done();
    });
  });

  it('it should resolve the graph and instantiate all functions once', (done) => {
    let d = new Di(CallbackMethod, 'base');
    let log = [];

    // @see https://github.com/angular/angular.js/blob/master/test/auto/injectorSpec.js
    //
    //          s1
    //        /  | \
    //       /  s2  \
    //      /  / | \ \
    //     /s3 < s4 > s5
    //    //
    //   s6

    d.$provide('s1', (s2, s5, s6, callback) => {
      log.push('s1');
      setTimeout(callback, 0, null, log.slice());
    });

    d.$provide('s2', (s3, s4, s5, callback) => {
      log.push('s2');
      setTimeout(callback, 0, null, log.slice());
    });

    d.$provide('s3', (s6, callback) => {
      log.push('s3');
      setTimeout(callback, 0, null, log.slice());
    });

    d.$provide('s4', (s3, s5, callback) => {
      log.push('s4');
      setTimeout(callback, 0, null, log.slice());
    });

    d.$provide('s5', (callback) => {
      log.push('s5');
      setTimeout(callback, 0, null, log.slice());
    });

    d.$provide('s6', (callback) => {
      log.push('s6');
      setTimeout(callback, 0, null, log.slice());
    });

    d.$resolve((err) => {
      if (err) {
        return done(err);
      }

      assert.deepEqual(log, ['s6', 's3', 's5', 's4', 's2', 's1']);
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

  it('returns an angle', (done) => {
    let d = new Di(CallbackMethod, 'Math');
    d.$provide('PI', [(callback) => {
      callback(null, Math.PI);
    }]);
    d.$provide('RAD_TO_DEG', ['PI', (PI, callback) => {
      callback(null, (val) => val * (180 / PI));
    }]);

    d.$resolve((err) => {
      if (err) {
        return done(err);
      }

      let result = d.RAD_TO_DEG(d.PI);
      assert.equal(result, 180);
      done();
    });
  });

  it('waits a few ms', (done) => {
    let d = new Di(CallbackMethod, 'Math');

    let threshold = 5;
    let s = 10;
    let expected = s;

    d.$provide('wait', [(callback) => {
      callback(null, (next) => {
        let now = +new Date();
        setTimeout(() => {
          next(null, +new Date() - now);
        }, s);
      });
    }]);

    d.$resolve((err) => {
      if (err) {
        return done(err);
      }
      d.wait((err, value) => {
        if (err) {
          return done(err);
        }
        assert.ok(Math.abs(expected - value) < threshold, 'Difference : ' + expected + ' vs. ' + value);
        done();
      });
    });
  });

  it('`this` equals namespace', (done) => {
    let d = new Di(CallbackMethod, null);
    d.$provide('test', function (callback) {
      callback(null, this);
    });
    d.$resolve((err) => {
      if (err) {
        return done(err);
      }
      assert.deepEqual(d.test, d._namespace);
      done();
    });
  });

  it('$inject', (done) => {
    let d = new Di(CallbackMethod);
    d.$provide('PI', Math.PI);
    d.$resolve((err) => {
      if (err) {
        return done(err);
      }
      let order = d.$inject((PI) => PI * 2);
      assert.equal(order, Math.PI * 2);
      done();
    });
  });

  it('$annotate', (done) => {
    let d = new Di(CallbackMethod);
    d.$provide('PI', Promise.resolve(Math.PI));
    d.$provideValue('RAD_TO_DEG', (180 / Math.PI));
    d.$resolve((err) => {
      if (err) {
        return done(err);
      }
      class TestClass {
        constructor (PI, RAD_TO_DEG) {
          this.PI = PI;
          this.RAD_TO_DEG = RAD_TO_DEG;
        }

        deg (value) {
          return value * this.RAD_TO_DEG;
        }
      }
      let AnnotatedTestClass = d.$annotate(TestClass);
      let a = new AnnotatedTestClass();
      assert.equal(a.deg(Math.PI), 180);
      done();
    });
  });
});
