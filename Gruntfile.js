var path = require('path')
  , PUBLIC_PATH = path.join(__dirname,'build')
  , LIB_PATH = path.join(PUBLIC_PATH, 'lib');

module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.initConfig({
    jshint : {
      files: ['Gruntfile.js', 'lib/**/*.js'],
      options: {
        laxcomma : true,
        globals: {
          console: true,
          module: true,
          global: true,
          transporter : true
        }
      }
    },
    watch : {
      files : ['spec/**/*.js','lib/**/*.js'],
      tasks : ['default'],
      options : {
        interrupt : true,
        atBegin : true
      }
    },
    mochaTest : {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['contrib/test-helper.js','spec/**/*.js']
      }
    }
  });

  grunt.registerTask('mocha', ['mochaTest']);
  grunt.registerTask('default', ['jshint', 'mocha']);
};
