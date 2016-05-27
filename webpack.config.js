// https://github.com/webpack/docs/wiki/configuration
module.exports = {
  entry: './lib/di.js',
  output: {
    filename: 'dist/di.js'
  },
  node: {
    console: false,
    browser: false,
    global: false,
    process: false,
    Buffer: false,
    __filename: false,
    __dirname: false,
    setImmediate: false
  }
};
