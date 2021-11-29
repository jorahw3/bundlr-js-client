const path = require('path');
 const NodePolyfillPlugin = require("node-polyfill-webpack-plugin")


 module.exports = {
  mode: 'development',
   entry: {
     sample: './docs/index.js',
   },
   plugins: [
    new NodePolyfillPlugin(),
   ],
   output: {
     filename: '[name].bundle.js',
     path: path.resolve(__dirname, 'docs/js'),
     clean: true,
   },
   resolve: {
       fallback:{
           fs: false,
       }
   }
 };
