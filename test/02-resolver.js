'use strict';

describe('Resolver', () => {
  const Resolver = require(basePath('lib', 'resolver'));
  let d = null;

  beforeEach(() => {
    d = new Resolver('test');
  });

  it('initializes, length is zero', () => {
    assert.equal(d.length, 0);
    assert.equal(d.resolved.length, 0);
  });

  it('increases its length', () => {
    d.provide('one', ['two', 'three']);
    assert.equal(d.length, 1);
    d.provide('two', ['four']);
    assert.equal(d.length, 2);
    assert.equal(d.resolved.length, 0);
  });

  it('resolves returns an empty array', () => {
    assert.deepEqual(d.resolve(), []);
    assert.equal(d.resolved.length, 0);
  });

  it('throws an error when a dependency depends on itself', () => {
    d.provide('A', ['A']);
    assert.throws(() => d.resolve());
  });

  it('throws an error when circular dependencies are declared', () => {
    d.provide('A', ['B']);
    d.provide('B', ['A']);
    assert.throws(() => d.resolve());
  });

  it('resolves in correct order', () => {
    d.provide('test', ['one', 'two', 'three']);
    d.provide('two', []);
    d.provide('one', []);
    d.provide('three', []);
    assert.deepEqual(d.resolve(), ['one', 'two', 'three', 'test']);
    assert.equal(d.resolved.length, 4);
  });

  it('provide, byId', () => {
    d.provide('test', [], 'test', 'string');
    d.provide('one', ['test'], 1, 'number');

    let entry = d.byId('test');
    assert.deepEqual(entry, {
      key: 'test',
      params: [],
      payload: 'test',
      type: 'string'
    });
    assert.deepEqual(d.byId('one'), {
      key: 'one',
      params: ['test'],
      payload: 1,
      type: 'number'
    });
    assert.deepEqual(d.resolve(), ['test', 'one']);
  });

  it('put throws an error when a value was not provided', () => {
    assert.throws(() => d.put('test', 'test'));
  });

  it('put', () => {
    d.provide('test', [], { test: false }, 'object');
    d.resolve();
    assert.deepEqual(d.byId('test'), {
      key: 'test',
      params: [],
      payload: { test: false },
      type: 'object'
    });
    d.put('test', { test: true });
    assert.deepEqual(d.byId('test').payload, {
      test: true
    });
  });

  it('does not resolve twice', () => {
    let queue = [];

    d.provide('test0', ['test2'], 'test0');
    d.provide('test1', [], 'test1');
    d.provide('test2', ['test1'], 'test2');
    d.provide('test3', ['test0'], 'test3');

    assert.equal(d.resolved.length, 0);

    queue = d.resolve();
    assert.equal(queue.length, 4);
    assert.equal(d.length, 4);
    assert.equal(d.resolved.length, 4);

    queue = d.resolve();
    assert.equal(queue.length, 0);
    assert.equal(d.length, 4);
    assert.equal(d.resolved.length, 4);

    d.provide('test4', [], 'test4');
    assert.equal(d.length, 5);
    assert.equal(d.resolved.length, 4);

    queue = d.resolve();
    assert.equal(queue.length, 1);
    assert.equal(d.length, 5);
    assert.equal(d.resolved.length, 5);
  });

  it('provideObjectNode', (done) => {
    let object = {
      a: 1,
      b: 2
    };

    Object.defineProperty(object, 'c', {
      get: () => {
        // Multiple calls to done would throw an error
        setTimeout(done);
        return 3;
      }
    });

    d.provideObjectNode('a', ['c'], object);
    d.provideObjectNode('b', [], object);
    d.provideObjectNode('c', [], object);
    let queue = d.resolve();
    assert.deepEqual(queue, 'cab'.split(''));
    assert.equal(d.byId('a').payload, 1);
    assert.equal(d.byId('b').payload, 2);
    assert.equal(d.byId('c').payload, 3);
  });
});
