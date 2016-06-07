module.exports = {
  entry: './lib/di.js',
  output: {
    libraryTarget: 'var',
    library: 'Di',
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
