describe('Namespace', function () {
  var Namespace = require('../lib/namespace');
  it ('initializes', function () {
    var n = new Namespace('test');
    assert.ok(n);
    assert.ok(n.$get('test'));
  });

  it ('gets a subpath', function () {
    var n = new Namespace('n');
    n.a = {
      string : '1234'
    };

    assert.ok(n);
    assert.deepEqual(n.$get('n.a'), n.a);
    assert.equal(n.$get('n.a.string'), '1234');
  });

  it ('sets a subpath', function () {
    var n = new Namespace('n');
    n.$set('n.a.string', 1234);
    assert.deepEqual(n.a, { string : '1234'});
    assert.equal(n.$get('n.a.string'), '1234');
    assert.equal(n.a.string, '1234');
    n.$set('a.bool', true);
    assert.equal(n.a.bool, true);
  });

  it ('is chainable', function () {
    var n = new Namespace('n');
    var value = n
    .$set('n.a.string', 1234)
    .$get('n.a.string');
    assert.equal(value, '1234');
  });  
});
