describe('Dependency injection', function () {

  var di = Di();

  it('returns an object', function () {
    assert.ok(_.isObject(di));
  });

});
