'use strict';

describe('Namespace', () => {
  const Namespace = require(basePath('lib', 'namespace'));

  it('initializes', () => {
    let n = new Namespace('test');
    assert.ok(n);
    assert.deepEqual(n.get('test'), {});
    assert.equal(n.id, 'test');
    assert.equal(n._id, 'test');
  });

  it('gets a subpath', () => {
    let n = new Namespace('n');

    n._root.a = {
      string: '1234'
    };

    assert.ok(n);
    assert.deepEqual(n.get('n.a'), n._root.a);
    assert.equal(n.get('n.a.string'), '1234');
  });

  it('sets a subpath', () => {
    let n = new Namespace('n');
    n.set('n.a.string', 1234);
    assert.deepEqual(n._root.a, { string: '1234' });
    assert.equal(n.get('n.a.string'), '1234');
    assert.equal(n._root.a.string, '1234');
    n.set('a.bool', true);
    assert.equal(n._root.a.bool, true);
  });

  it('sets paths using falsy values', () => {
    let n = new Namespace('n');
    n.set('n.0.string', 1234);
    assert.deepEqual(n._root[0], { string: '1234' });
    assert.equal(n.get('n.0.string'), '1234');
    assert.equal(n._root[0].string, '1234');
    n.set('0.bool', true);
    assert.equal(n._root[0].bool, true);
  });

  it('is chainable', () => {
    let n = new Namespace('n');
    let value = n
      .set('n.a.string', 1234)
      .get('n.a.string');
    assert.equal(value, '1234');
  });

  it('does not confuse sub-children with the same name', () => {
    let n = new Namespace('n');
    n.set('n.n.n', 'nn');
    assert.deepEqual(n.get('n'), { n: { n: 'nn' } });
    assert.deepEqual(n.get('n.n.n'), 'nn');
    n.set('n.nn.n', 'nnn');
    assert.deepEqual(n.get('n'), { n: { n: 'nn' }, nn: { n: 'nnn' } });
  });
});
