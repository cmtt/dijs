describe('Namespace', function () {
  it ('Creates a namespace with helper functions', function () {
    var mod = Di();
    _.each(['get','resolve', 'provide','inject','run'], function (key) {
      assert.ok(_.isFunction(mod[key],'Di has function ' + key));
    });
  });

  it('provides numbers, strings and objects as members of a module as hash, get()s them', function () {
    var mod = Di();

    mod.provide('PI', Math.PI);
    assert.equal(mod.PI, Math.PI);
    assert.equal(mod.get('PI'), Math.PI);

    mod.provide('str', 'str');
    assert.equal(mod.str, 'str');
    assert.equal(mod.get('str'), 'str');

    mod.provide('obj', { one : 1 });
    assert.deepEqual(mod.obj, { one : 1 });
    assert.deepEqual(mod.get('obj'), { one : 1 });
  });


  it ('passes anything else through', function () {
    var mod = Di();
    mod.provide('fn', function () { return 'I am a function'; }, true);
    assert.ok(_.isFunction(mod.fn));
    assert.equal(mod.fn(),'I am a function');

    mod.provide('Numbers', [1,2,3,4], true);
    assert.deepEqual(mod.Numbers, [1,2,3,4]);

    mod.provide('String', 'String', true);
    assert.deepEqual(mod.String, 'String');

    mod.provide('nll', null, true);
    assert.deepEqual(mod.nll, null);

    mod.provide('bool', true, true);
    assert.equal(mod.bool, true);

    mod.provide('date', new Date(), true);
    assert.ok(_.isDate(mod.date));

    mod.provide('rgx', /RG(.*)/, true);
    assert.ok(_.isRegExp(mod.rgx));

    mod.provide('undefined', undefined, true);
    assert.ok(_.isUndefined(mod.undefined));

  });


  it ('allows chaining', function () {
    var mod = Di();
    var chained = mod
      .provide('PI', Math.PI)
      .provide('str','str')
      .provide('obj', { one : 1 });

    assert.deepEqual(chained, mod);

    var pi2 = Di()
      .provide('PI', Math.PI)
      .get('PI') * 2;

    assert.equal(pi2, Math.PI*2);
  });


  it('creates a nested namespace', function () {
    var mod = Di('NS');
    mod.provide('util.string.format', util.format, true);
    mod.provide('util.string.inspect', util.inspect, true);
    mod.provide('util.math.PI', Math.PI);

    assert.ok(_.isObject(mod.util));
    assert.ok(_.isObject(mod.util.string));

    assert.equal(mod.get('NS'), mod);

    assert.deepEqual(mod.util.string.format, util.format);
    assert.deepEqual(mod.get('util.string.format'), util.format);
    assert.deepEqual(mod.get('NS.util.string.format'), util.format);

    assert.deepEqual(mod.util.string.inspect, util.inspect);
    assert.deepEqual(mod.get('util.string.inspect'), util.inspect);
    assert.deepEqual(mod.get('NS.util.string.inspect'), util.inspect);

    assert.equal(mod.util.math.PI, Math.PI);
    assert.equal(mod.get('util.math.PI'), Math.PI);
    assert.equal(mod.get('NS.util.math.PI'), Math.PI);



  });

});
