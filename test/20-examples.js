'use strict';

describe('Examples', () => {
  const Di = require(basePath('lib', 'di'));
  const CallbackMethod = require(basePath('methods', 'callback'));

  it('initial example', (done) => {
    // Initialize a new dijs instance. By default, this will use "CallbackMethod",
    // thus the $provide and $resolve methods have callbacks.

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
        throw err;
      }
      console.log('PI equals Math.PI', d.PI === Math.PI);
      console.log('2PI equals 2*PI', d['2PI'] === 2 * Math.PI);
      console.log('zero equals 0', d.$get('Math.zero') === 0);
      done();
    });
  });

  it('disabling variable assignation', (done) => {
    let d = new Di(CallbackMethod, 'Math', { assign: false });
    d.$provide('PI', Math.PI);
    d.$provide('2PI', (PI, callback) => callback(null, 2 * PI));
    d.$resolve((err) => {
      assert.equal(d.PI, void 0);
      assert.equal(d['2PI'], void 0);
      assert.equal(d.$get('PI'), Math.PI);
      assert.equal(d.$get('2PI'), Math.PI * 2);
      done(err);
    });
  });

  it('annotates a class', (done) => {
    class TestClass {
      constructor (PI, RAD_TO_DEG) {
        this.PI = PI;
        this.RAD_TO_DEG = RAD_TO_DEG;
      }

      deg (value) {
        return value * this.RAD_TO_DEG;
      }
    }

    let instance = new Di(null)
    .$provideValue('PI', Math.PI)
    .$provide('RAD_TO_DEG', (PI, callback) => callback(null, (180 / PI)))
    .$resolve((err) => {
      if (err) {
        done(err);
      }
      let AnnotatedTestClass = instance.$annotate(TestClass);
      let a = new AnnotatedTestClass();
      assert.equal(a.deg(Math.PI), 180);
      done();
    });
  });

  it('annotates a class using static $inject', (done) => {
    class TestClass {
      constructor (queue, max, min) {
        this.queue = queue;
        this.max = max;
        this.min = min;
      }

      get average () {
        return (this.max(this.queue) + this.min(this.queue)) / 2;
      }

      static get $inject () {
        return ['queue', 'max', 'min'];
      }
    }

    let d = new Di(CallbackMethod);
    d.$provideValue('queue', [0, 1, 2, 3], true);
    d.$provideValue('max', Function.prototype.apply.bind(Math.max, null));
    d.$provideValue('min', Function.prototype.apply.bind(Math.min, null));

    d.$resolve((err) => {
      if (err) {
        throw err;
      }
      let AnnotatedTestClass = d.$annotate(TestClass);
      let t = new AnnotatedTestClass();
      assert.ok(t instanceof AnnotatedTestClass);
      assert.ok(t instanceof TestClass);
      assert.equal(t.average, 1.5);
      done();
    });
  });

  it('annotates a function, additional arguments', (done) => {
    let d = new Di(CallbackMethod);
    d.$provideValue('queue', [0, 1, 2, 3, 4], true);
    d.$resolve((err) => {
      let fn = d.$annotate(function (queue) {
        let args = [].slice.apply(arguments).slice(1);
        return queue.concat(args);
      });
      if (err) {
        throw err;
      }
      assert.deepEqual(fn(5), [0, 1, 2, 3, 4, 5]);
      done();
    });
  });
});
