describe('Di.run', function () {

  it ('can run functions with arguments and get its return value (never lazy)', function (done) {
    var mod = new Di(null, true);
    var myFunction =  function (twice) {
      return function (a) {
        return twice(a) * 2;
      };
    };
    mod.provide('myFunction',myFunction);
    mod.provide('twice',function () {
      return function (i) { return i*2; };
    });

    mod.resolve();
    setTimeout(function () {
      var val = mod.run(function (myFunction, a) {
        assert.ok(_.isFunction(arguments[0]));
        assert.ok(_.isNumber(arguments[1]));
        return myFunction(a);
      },20);
      assert.equal(val, 80);
      done();
    },100);
  })
})
