
var port = 3300;

process.chdir(__dirname + '/../');

var configure = require('mtf.devtools/webpack-configure');
var config = configure('dev', {
    entry: 'dev/index',
    html: 'dev/index.html',
});
config.module.noParse.push(/tinymce\.min$/);
var devServer = require('mtf.devtools/dev-server');
var server = devServer(config);

server.localAt(port, [
]);
