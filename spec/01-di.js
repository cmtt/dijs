describe('Dependency injection', function () {

  var reader = [function () {
    return {
      read : function (start, end) {
        return [start,'-', end].join('');
      }
    }
  }];


  it('provides arrays', function () {
    var mod = new Di();
    mod.provide('util.reader', reader);
    assert.ok(_.isObject(mod.util.reader));
    assert.ok(_.isFunction(mod.util.reader.read));
  })

  it ('provides functions', function (done) {
    var mod = new Di();
    mod.provide('utilReader', reader);
    assert.ok(_.isFunction(mod.utilReader.read));

    mod.provide('read', function (utilReader) {
      return function () {
        var val = utilReader.read(0,1);
        assert.equal(val, '0-1');
        done()
      }
    });

    var read = mod.get('read');
    assert.ok(_.isFunction(read));
    read();
  })

  it('allows providing constants and objects, chaining with passthru', function () {
    var mod = new Di();
    var pi2 = (mod.provide('PI',Math.PI).get('PI')) * 2;
    assert.equal(pi2, Math.PI*2);
    var pi3 = (mod.provide('PI3',Math.PI*3, true).get('PI3'));
    assert.equal(pi3, Math.PI*3);
  })

  it ('provides objects as members of the module', function () {
    var mod = new Di('namespace');
    mod.provide('PI2',Math.PI*2)
    assert.equal(mod.PI2, Math.PI*2);
    assert.equal(mod.get('PI2'), Math.PI*2);
    assert.equal(mod.get('namespace.PI2'), Math.PI*2);
  })

  it ('allows to pass an array and every other object thru', function () {
    var mod = new Di();
    mod.provide('Numbers', [1,2,3,4], true);
    assert.deepEqual(mod.Numbers, [1,2,3,4]);
    mod.provide('String', 'String', true);
    assert.deepEqual(mod.String, 'String');
    mod.provide('nll', null, true);
    assert.deepEqual(mod.nll, null);
  });



})
