module.exports = function (grunt) {
    var vendorLibs = [
        "jquery",
        "bootstrap",
        "vis",
        "alertifyjs",
        "lodash",
        "handlebars",
        "flot"
    ];
    
    grunt.initConfig({
        connect: {
            server: {
              options: {
                port: 80,
                hostname: 'localhost'
              }
            }
        },
        concat_css: {
            options: {
              // Task-specific options go here. 
            },
            vendor: {
                src: [
                    "node_modules/bootstrap/dist/css/bootstrap.min.css",
                    "node_modules/alertifyjs/build/css/alertify.min.css",
                    "node_modules/alertifyjs/build/css/themes/bootstrap.min.css",
                    "node_modules/vis/dist/vis.min.css"
                ],
                dest: "dist/vendor.css"
            },
            app: {
                src: [
                    "css/index.css"
                ],
                dest: "dist/app.css"
            }
        },
        browserify: {
            app: {
                options: {
                    transform: [
                        ["babelify", {
                            loose: "all"
                        }]
                    ],
                    browserifyOptions: {
                        debug: true
                    },
                    debug: true,
                    external: vendorLibs
                },
                files: {
                    "./dist/app.js": ["./src/main.js"]
                }                
            },
            experiment: {
                options: {
                    transform: [
                        ["babelify", {
                            loose: "all"
                        }]
                    ],
                    browserifyOptions: {
                        debug: true
                    },
                    debug: true,
                    external: vendorLibs
                },
                files: {
                    "./dist/experiment.js": ["./src/experiment.js"]
                }
            },
            vendor: {
                // External modules that don't need to be constantly re-compiled
                src: ['.'],
                dest: 'dist/vendor.js',
                options: {
                  debug: false,
                  alias: vendorLibs,
                  external: null  // Reset this here because it's not needed
                }
              }
        },
        copy: {
            vendor: {
                expand: true,
                cwd: './node_modules/vis/dist/',
                src: ['img/**'],
                dest: 'dist/'
            }
        },
        watch: {
            scripts: {
                files: ["./src/*.js"],
                tasks: ["browserify:app", "browserify:experiment"]
            },
            html: {
                files: ["*.html"]
            },
            css: {
                files: ["css/*.css"],
                tasks: ["concat_css:app"]
            },
            options: {
                livereload: true
            }         
        },
        execute: {
            experiment: {
                src: ['./dist/experiment.js']
            }
        }
    });

    grunt.loadNpmTasks("grunt-browserify");
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-concat-css');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-execute');

    grunt.registerTask("default", [
        "concat_css:app",
        "browserify:app",
        "browserify:experiment",
        "connect",
        "watch"]);

    grunt.registerTask("css", ["concat_css"]);
    grunt.registerTask("build", ["concat_css", "browserify", "copy"]);
    grunt.registerTask("experiment", ["browserify:experiment", "execute:experiment"]);
};