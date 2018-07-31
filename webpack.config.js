module.exports = {
  mode: 'production',
  entry: ['./src/issuemd.js'],
  output: {
    path: __dirname,
    filename: 'issuemd.min.js',
    libraryTarget: 'umd',
    library: 'issuemd',
    globalObject: 'this',
    umdNamedDefine: true
  },
  plugins: []
}
