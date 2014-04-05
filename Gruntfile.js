var path = require('path')
  , PUBLIC_PATH = path.join(__dirname,'build')
  , LIB_PATH = path.join(PUBLIC_PATH, 'lib');

module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-closure-compiler');
  grunt.initConfig({
    'jshint' : {
      files: ['Gruntfile.js', 'lib/**/*.js'],
      options: {
        laxcomma : true
      }
    },
    'watch' : {
      files : ['spec/**/*.js','lib/**/*.js'],
      tasks : ['default'],
      options : {
        interrupt : true,
        atBegin : true
      }
    },
    'mochaTest' : {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['contrib/test-helper.js','spec/**/*.js']
      }
    },
    'closure-compiler': {
      di: {
        js: 'lib/di.js',
        jsOutputFile: 'build/di.min.js',
        maxBuffer: 500,
        options: {
          compilation_level: 'ADVANCED_OPTIMIZATIONS',
          language_in: 'ECMASCRIPT5_STRICT',
          externs: 'contrib/di-externs.js'
        }
      }
    }
  });

  grunt.registerTask('mocha', ['mochaTest']);
  grunt.registerTask('minify', ['closure-compiler']);
  grunt.registerTask('default', ['jshint', 'mocha']);
};
