process.chdir(__dirname + '/../');
let OUTPUT_PATH = 'dev/publish/';

let gulpDeps = require('mtf.devtools/gulp-deps');
let babelConfig = require('mtf.devtools/babel-config');
let sassImporter = require('mtf.devtools/node-sass-importer');
let postcssConfig = require('mtf.devtools/postcss-config');

let { gulp, babel, filelog, gulpif, postcss, replace, rename, sass } = gulpDeps;

gulp.task('default', () => {
  gulp
    .src(['**/*', '!node_modules/**', `!${OUTPUT_PATH}**`], { nodir: true })
    .pipe(filelog())

    .pipe(gulpif(/\.jsx?$/, babel(babelConfig)))
    .pipe(gulpif(/\.jsx?$/, replace(/require\(['"](.*)\.s[ac]ss['"]\);/, `require('$1\.css');`)))
    .pipe(gulpif(/\.jsx$/, rename(path => path.extname = '.js')))

    .pipe(gulpif(/\.(sass|scss)$/, sass({ importer: sassImporter })))
    .pipe(gulpif(/\.css$/, postcss(postcssConfig)))

    .pipe(gulpif(/^dev\/publish-package\.json$/, rename('package.json')))

    .pipe(gulpif(/\.jsx?$/, replace('mtf.block', `@mtfe/block`)))
    .pipe(gulpif(/\.jsx?$/, replace('mtf.utils', `@mtfe/block-utils`)))
    .pipe(gulpif(/\.jsx?$/, replace('mtf.block-plug', `@mtfe/block-plug`)))

    .pipe(gulp.dest(OUTPUT_PATH))
  ;
});

gulp.start('default');
