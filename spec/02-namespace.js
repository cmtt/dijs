describe('Namespace', function () {
  it ('Creates a namespace with helper functions', function () {
    var mod = new Di();
    _.each(['get','resolve', 'provide','inject','run'], function (key) {
      assert.ok(_.isFunction(mod[key],'Di has function ' + key));
    })
  })


})
