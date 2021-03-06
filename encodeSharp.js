var postcss = require('postcss');
var encodeSharpPlugin = require('./lib/encodeSharpPostCSSPlugin');

module.exports = function(content) {
  this.cacheable && this.cacheable();
  var done = this.async();

  postcss([ encodeSharpPlugin() ])
    .process(content)
    .then(function (result) {
      done(null, result.css);
    })
    .catch(done);
};