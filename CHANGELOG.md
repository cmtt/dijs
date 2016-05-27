# Changelog

0.2.0 -

  - ES2015 rewrite
  - support for parsing ES2015 functions using a fork of [node-introspect](https://github.com/orzarchi/node-introspect)
  - adding "Method" to constructor
  - adding "assign" option in order to disable variable assignation to the Di
    instance
  - deprecating the legacy API in favor of SyncMethod
  - deprecating Promise adapter in favor of ES2015 Promises
  - removing Build system in favor of Makefile
  - $inject

0.1.1 - 04/21/2016

  - harmonizing behaviour of "this" across all adapters in order to access the
    namespace from each DI definition
  - Updating all dependencies

0.1.0 - 06/26/2015

  - split dijs into different modules
  - dijs is now asynchronous with callbacks by default
  - new Promise method, using arbitrary implementations
  - updated documentation, additional unit tests

0.0.2 - 05/01/2014

 - updated documentation
 - more strict syntax
 - fixing an error when a function is provided in one line
 - tests updated
 - updated usage examples

0.0.1 - 04/04/2014

Initial release.
