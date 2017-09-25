const path = require('path');
const webpack = require('webpack');
const {AureliaPlugin} = require('aurelia-webpack-plugin');
const bundleOutputDir = './src/main/resources/webroot/dist';
const VertxPlugin = require('webpack-vertx-plugin');

module.exports = (env) => {
  const isDevBuild = !(env && env.prod);
  return [{
    stats: {modules: false},
    entry: {'app': 'aurelia-bootstrapper'},
    resolve: {
      extensions: ['.js'],
      modules: ['src/main/js', 'node_modules'],
    },
    output: {
      path: path.resolve(bundleOutputDir),
      publicPath: 'dist/',
      filename: '[name].js'
    },
    module: {
      rules: [
        {test: /\.js$/i, include: /src\/.+\/js/, use: 'babel-loader'},
        {test: /\.html$/i, use: 'html-loader'},
        {test: /\.css$/i, use: isDevBuild ? 'css-loader' : 'css-loader?minimize'},
        {test: /\.(png|jpg|jpeg|gif|svg)$/, use: 'url-loader?limit=25000'}
      ]
    },
    plugins: [
      new webpack.DefinePlugin({IS_DEV_BUILD: JSON.stringify(isDevBuild)}),
      new webpack.DllReferencePlugin({
        context: __dirname,
        manifest: require('./src/main/resources/webroot/dist/vendor-manifest.json')
      }),
      new AureliaPlugin({aureliaApp: 'boot'})
    ].concat(isDevBuild ? [
      new webpack.SourceMapDevToolPlugin({
        filename: '[file].map', // Remove this line if you prefer inline source maps
        moduleFilenameTemplate: path.relative(bundleOutputDir, '[resourcePath]')  // Point sourcemap entries to the original file locations on disk
      }),
      new VertxPlugin()
    ] : [
      new webpack.optimize.UglifyJsPlugin(),
      new VertxPlugin()
    ])
  }];
};
