'use strict';

const Di = require(basePath('lib', 'di'));
const PromiseMethod = require(basePath('methods', 'promise'));

describe('PromiseMethod', () => {
  it('initializes', (done) => {
    let d = new Di(PromiseMethod, null);
    d.$resolve().then(done, done);
  });

  it('provides', (done) => {
    let d = new Di(PromiseMethod, 'Math');
    d.$provide('PI', Promise.resolve(Math.PI));
    d.$provide('2PI', (PI) => Promise.resolve(2 * Math.PI));
    d.$provide('test', ['PI', '2PI', (PI, twoPI) => {
      return Promise.resolve(PI - (twoPI * 0.5));
    }]);
    d.$resolve().then(() => {
      assert.equal(d.PI, Math.PI);
      assert.equal(d['2PI'], 2 * Math.PI);
      assert.equal(d.test, 0);
      done();
    }, done);
  });

  it('provides via minification-ready syntax', (done) => {
    let d = new Di(PromiseMethod, 'Math');
    d.$provide('PI', [() => {
      return Promise.resolve(Math.PI);
    }]);
    d.$provide('2PI', ['PI', (PI) => {
      return Promise.resolve(2 * PI);
    }]);
    d.$provide('mulPi', ['2PI', (PI) => {
      return Promise.resolve((val) => val * PI);
    }]);
    d.$provide('boolean', Promise.resolve(true));
    d.$resolve().then(() => {
      let result = d.mulPi(0.5);
      assert.equal(result, Math.PI);
      assert.equal(d.boolean, true);
      done();
    }, done);
  });

  it('it should resolve the graph and instantiate all functions once', (done) => {
    let d = new Di(PromiseMethod, 'base');
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

    d.$provide('s1', (s2, s5, s6) => {
      log.push('s1');
      return Promise.resolve(log.slice());
    });
    d.$provide('s2', (s3, s4, s5) => {
      log.push('s2');
      return Promise.resolve(log.slice());
    });
    d.$provide('s3', (s6) => {
      log.push('s3');
      return Promise.resolve(log.slice());
    });
    d.$provide('s4', (s3, s5) => {
      log.push('s4');
      return Promise.resolve(log.slice());
    });
    d.$provide('s5', () => {
      log.push('s5');
      return Promise.resolve(log.slice());
    });
    d.$provide('s6', () => {
      log.push('s6');
      return Promise.resolve(log.slice());
    });

    d.$resolve().then(() => {
      assert.deepEqual(log, ['s6', 's3', 's5', 's4', 's2', 's1']);
      assert.deepEqual(d._namespace._root.s6, [ 's6' ]);
      assert.deepEqual(d._namespace._root.s3, [ 's6', 's3' ]);
      assert.deepEqual(d._namespace._root.s5, [ 's6', 's3', 's5' ]);
      assert.deepEqual(d._namespace._root.s4, [ 's6', 's3', 's5', 's4' ]);
      assert.deepEqual(d._namespace._root.s2, [ 's6', 's3', 's5', 's4', 's2' ]);
      assert.deepEqual(d._namespace._root.s1, [ 's6', 's3', 's5', 's4', 's2', 's1' ]);
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
    }, done);
  });

  it('returns an angle', (done) => {
    let d = new Di(PromiseMethod, 'Math');
    d.$provide('PI', Promise.resolve(Math.PI));
    d.$provide('RAD_TO_DEG', ['PI', (PI, callback) => {
      return Promise.resolve((val) => val * (180 / PI));
    }]);

    d.$resolve().then(() => {
      let result = d.RAD_TO_DEG(d.PI);
      assert.equal(result, 180);
      done();
    }, done);
  });

  it('`this` equals namespace', (done) => {
    let d = new Di(PromiseMethod, null);
    d.$provide('test', function () {
      return Promise.resolve(this);
    });
    d.$resolve().then(() => {
      assert.deepEqual(d.test, d._namespace);
      done();
    }, done);
  });

  it('$inject', () => {
    let d = new Di(PromiseMethod);
    d.$provide('PI', Promise.resolve(Math.PI));
    d.$resolve().then(() => {
      let order = d.$inject((PI) => PI * 2);
      assert.equal(order, Math.PI * 2);
    });
  });
});
