describe('Injection', function () {

  it ('allows to inject a function', function (done) {
    var mod = new Di();
    mod.provide('twice',function () {
      return function (i) { return i*2; };
    });

    mod.inject(function(twice) {
      assert.equal(this, mod);
      assert.equal(twice(2),4);
      done()
    });
  })

  it ('allows to inject an array', function (done) {
    var mod = new Di();
    mod.provide('twice',function () {
      return function (i) { return i*2; };
    });

    mod.provide('ntimes',['twice',function (twice) {
      return function (i, n) { return twice(i) * n * 0.5; };
    }]);

    mod.inject(['twice','ntimes',function(twice, ntimes) {
      assert.equal(twice(2),4);
      assert.equal(ntimes(2,1),2);
      assert.equal(ntimes(2,2),4);
      done()
    }]);
  });


  it ('allows to inject items with different names (arrays)', function (done) {
    var mod = new Di();

    var fn = ['util.sprintf', function (sprintf) {
      var val = sprintf('This is %s number %d','test',3);
      assert.equal(val,'This is test number 3');
      done();
    }];

    mod.provide('util.sprintf', util.format, true);
    assert.ok(mod.util);
    assert.ok(mod.util.sprintf);
    mod.inject(fn);
  });


  it ('can inject functions with arguments', function (done) {
    var mod = new Di();
    var myFunction =  function () {
      for (var i = 1; i < 5; ++i)  assert.equal(arguments[i-1],i);
       done();
    };
    mod.inject(myFunction, 1,2,3,4);
  })

  it ('can inject functions with arguments in a lazy way', function (done) {
    var mod = new Di(null, true);
    var myFunction =  function () {
      for (var i = 1; i < 5; ++i)  assert.equal(arguments[i-1],i);
       done();
    };
    mod.inject(myFunction, 1,2,3,4);
    setTimeout(function () {
      mod.resolve();
    },10)
  })



})
