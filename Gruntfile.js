module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    copy: {
      main: {
        cwd: 'src/',
        src: [
          'dojoConfig.js', 'index.html'
        ],
        dest: 'dist/',
        expand: true
      },
      release: {
        cwd: 'dist/',
        src: [
          'dojoConfig.js', 'index.html', 'styles/main.css'
        ],
        dest: 'release/',
        expand: true
      }
    },
    uglify: {
      release: {
        files: [{
            expand: true,
            cwd: 'dist/app',
            src: '**/*.js',
            dest: 'release/app'
        }]
      }
    },
    sass: {
      dist: {
        files: {
          'dist/styles/main.css': 'src/styles/main.scss'
        }
      }
    },
    ts: {
      options: {
        target: 'es5',
        module: 'amd',
        sourceMap: true,
        noImplicitAny: false,
        fast: 'never'
      },
      default: {
        src: ['src/app/*.ts', 'src/app/**/*.ts', 'src/app/**/**/*.ts'],
        outDir: 'dist/app'
      },
    },
    //elm-make Main.elm --output=main.html
    run: {
      elm: {
        cmd: 'elm-make',
        args: [
          'src/app/PortalItems.elm',
          '--output=dist/app/PortalItems.js'
        ]
      }
    },
    watch: {
      scripts: {
        files: ['src/app/*.ts', 'dojoConfig.js', 'index.html'],
        tasks: ['ts'],
        options: {
          spawn: false,
        }
      },
      styles: {
        files: ['src/styles/*.scss'],
        tasks: ['sass'],
        options: {
          spawn: false,
        }
      },
      elm: {
        files: ['src/app/PortalItems.elm'],
        tasks: ['run:elm'],
        options: {
          spawn: false,
        }
      },
      files: {
        files: ['dojoConfig.js', 'index.html'],
        tasks: ['copy:main'],
        options: {
          spawn: false,
        }
      }
    }
  });

  grunt.registerTask('default', ['copy:main', 'ts', 'run:elm', 'sass']);
  grunt.registerTask('build', ['default', 'uglify', 'copy:release']);
}
