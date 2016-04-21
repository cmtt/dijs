describe('Legacy method', function () {
  var Di = require('../legacy');

  it('it should resolve the graph and instantiate all functions once', function () {
    var d = new Di(null, true);
    var log = [];

    //          s1
    //        /  | \
    //       /  s2  \
    //      /  / | \ \
    //     /s3 < s4 > s5
    //    //
    //   s6

    // thanks to Angular.JS

    d.provide('s1', function(s2, s5, s6) { log.push('s1'); return {}; });
    d.provide('s2', function(s3, s4, s5) { log.push('s2'); return {}; });
    d.provide('s3', function(s6) { log.push('s3'); return {}; });
    d.provide('s4', function(s3, s5) { log.push('s4'); return {}; });
    d.provide('s5', function() { log.push('s5'); return {}; });
    d.provide('s6', function() { log.push('s6'); return {}; });

    d.$resolve();
    assert.deepEqual(log,['s6', 's3', 's5', 's4', 's2', 's1']);
  });

  it('`this` equals namespace', function () {
    var d = new Di(null, true);
    d.provide('test', function () { return this; });
    var ref = d.$resolve();
    assert.deepEqual(d.$resolve(), d);
  });

});
