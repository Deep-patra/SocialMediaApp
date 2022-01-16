let gulp=require('gulp'),
    browserify=require('browserify'),
    source=require('vinyl-source-stream'),
    buffer=require('vinyl-buffer'),
    babelify=require('babelify'),
    uglify=require('gulp-uglify');
    
gulp.task('js',function(){
  return browserify('./app.js')
  .transform(babelify,{presets:['@babel/preset-env',['@babel/preset-react',{"runtime":"automatic"}]],
    plugins:['@babel/plugin-proposal-class-properties']
  })
  .bundle()
  .on('error',function(){
    console.log('error has occured');
  })
  .pipe(source('bundle.js'))
  .pipe(buffer())
  .pipe(uglify())
  .pipe(gulp.dest('static/js'));
});