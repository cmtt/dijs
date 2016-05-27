'use strict';

const Di = require(basePath('lib', 'di'));
const SyncMethod = require(basePath('methods', 'sync'));

describe('SyncMethod', () => {
  it('initializes', () => {
    let d = new Di(SyncMethod, null);
    d.$resolve();
  });

  it('passthrough using defaultFunction', () => {
    let d = new Di(SyncMethod, null);
    d.$provide('PI', Math.PI, true);
    d.$resolve();
    assert.equal(d.$get('PI'), Math.PI);
  });

  it('provides', () => {
    let d = new Di(SyncMethod, 'Math');
    d.$provide('PI', Math.PI);
    d.$provide('2PI', 2 * Math.PI);
    d.$provide('test', ['PI', '2PI', (PI, twoPI) => PI - (twoPI * 0.5)]);
    d.$resolve();
    assert.equal(d.PI, Math.PI);
    assert.equal(d['2PI'], 2 * Math.PI);
    assert.equal(d.test, 0);
  });

  it('provides via minification-ready syntax', () => {
    let d = new Di(SyncMethod, 'Math');
    d.$provide('PI', [() => Math.PI]);
    d.$provide('2PI', ['PI', (PI) => 2 * PI]);
    d.$provide('mulPi', ['2PI', (PI) => (val) => val * PI]);
    d.$provide('boolean', true);
    d.$resolve();
    let result = d.mulPi(0.5);
    assert.equal(result, Math.PI);
    assert.equal(d.boolean, true);
  });

  it('it should resolve the graph and instantiate all functions once', () => {
    let d = new Di(SyncMethod, 'base');
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
      return log.slice();
    });
    d.$provide('s2', (s3, s4, s5) => {
      log.push('s2');
      return log.slice();
    });
    d.$provide('s3', (s6) => {
      log.push('s3');
      return log.slice();
    });
    d.$provide('s4', (s3, s5) => {
      log.push('s4');
      return log.slice();
    });
    d.$provide('s5', () => {
      log.push('s5');
      return log.slice();
    });
    d.$provide('s6', () => {
      log.push('s6');
      return log.slice();
    });

    d.$resolve();
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
  });

  it('returns an angle', () => {
    let d = new Di(SyncMethod, 'Math');
    d.$provide('PI', [() => {
      return Math.PI;
    }]);
    d.$provide('RAD_TO_DEG', ['PI', (PI, callback) => {
      return (val) => val * (180 / PI);
    }]);

    d.$resolve();
    let result = d.RAD_TO_DEG(d.PI);
    assert.equal(result, 180);
  });

  it('`this` equals namespace', () => {
    let d = new Di(SyncMethod, null);
    d.$provide('test', function () {
      return this;
    });
    d.$resolve();
    assert.deepEqual(d.test, d._namespace);
  });

  it('$inject', () => {
    let d = new Di(SyncMethod);
    d.$provide('PI', Math.PI);
    d.$resolve();
    let order = d.$inject((PI) => PI * 2);
    assert.equal(order, Math.PI * 2);
  });
});
