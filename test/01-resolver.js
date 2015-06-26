describe('Resolver', function () {

  var Resolver = require('../lib/resolver');

  it('initializes', function () {
    var d = new Resolver('test');
    assert.equal(d.length, 0);
  });

  it('resolves in a correct order with functions', function () {
    var d = new Resolver('test');
    d.provide('one', ['two', 'three']);
    assert.equal(d.length, 1);
    d.provide('two', ['four']);
    var order = d.resolve();
    assert.deepEqual(order, ['four', 'two','three', 'one']);
  });

  it('resolves in a correct order with functions', function () {
    var d = new Resolver('test');
    d.provide('test', ['one', 'two', 'three']);
    d.provide('two', []);
    d.provide('one', []);
    d.provide('three', []);

    var order = d.resolve();
    assert.deepEqual(order, ['one', 'two', 'three', 'test']);
  });

});
