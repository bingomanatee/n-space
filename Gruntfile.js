module.exports = function (grunt) {

  var files = [
    'src/FamousEventEmitter.js',
    'src/index.js',
    'src/Register.js',
    'src/World.js',
    'src/Member.js',
    'src/WanderBot.js'
  ];

  grunt.initConfig({
    concat: {
      base: {
        files: {
          'build/n-space.js': files
        }
      },
      into_test_site: {
        files: {
          'test_site/n-space.js': 'n-space.js'
        }
      }
    },
    jshint: {
      beforeconcat: files,
      afterconcat: ['build/n-space.js']
    },
    umd: {
      all: {
        src: 'build/n-space.js',
        dest: 'n-space.js', // optional, if missing the src will be used
        objectToExport: 'NSPACE', // optional, internal object that will be exported
        amdModuleId: 'NSPACE', // optional, if missing the AMD module will be anonymous
        globalAlias: 'NSPACE', // optional, changes the name of the global variable

        deps: { // optional
          'default': ['_', 'Fools'],
          cjs: ['lodash', 'fools']
        }
      }
    }

  });
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-umd');
  grunt.loadNpmTasks('grunt-contrib-jshint');

// the default task can be run just by typing "grunt" on the command line
  grunt.registerTask('default', ['jshint:beforeconcat', 'concat:base', 'jshint:afterconcat', 'umd:all', 'concat:into_test_site']);
};