const path = require('path');
 const HtmlWebpackPlugin = require('html-webpack-plugin');
 const NodePolyfillPlugin = require("node-polyfill-webpack-plugin")


 module.exports = {
  mode: 'development',
   entry: {
     sample: './sample/index.js',
   },
   plugins: [
    new NodePolyfillPlugin(),
     new HtmlWebpackPlugin({
      title: 'Development',
     }),
   ],
   output: {
     filename: '[name].bundle.js',
     path: path.resolve(__dirname, 'dist'),
     clean: true,
   },
   resolve: {
       fallback:{
           fs: false,
       }
   }
 };
