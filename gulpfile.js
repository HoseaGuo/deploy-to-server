const { src, dest, parallel, series } = require('gulp')
const uglify = require('gulp-uglify')
const ts = require('gulp-typescript')

var tsProject = ts.createProject({
  declaration: true
});


exports.default = function (cb) {
  let tsResult = src('source/index.ts').pipe(tsProject())

  tsResult.js.pipe(uglify()).pipe(dest('dist/'))
  tsResult.dts.pipe(dest('dist/'))
  
  cb()
}
