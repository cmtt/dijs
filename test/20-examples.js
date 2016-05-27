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
      console.log(`PI equals Math.PI`, d.PI === Math.PI);
      console.log(`2PI equals 2*PI`, d['2PI'] === 2 * Math.PI);
      console.log(`zero equals 0`, d.$get('Math.zero') === 0);
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
});
