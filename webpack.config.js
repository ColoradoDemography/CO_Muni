var path = require('path');
var webpack = require('webpack');

webpack.optimize.UglifyJsPlugin({ output: {comments: false} });

module.exports = {
    entry:  {
      app: './src/common/js/app.js',
      vendor: ['./src/lib/js/easy-button.js','./src/lib/js/jQDateRangeSlider-min.js','./src/lib/js/Leaflet.Modal.js','./src/lib/js/L.D3SvgOverlay.min.js','./src/lib/js/typeahead.jquery.js','babel-polyfill']
    },
    output: {
        path:     'dest',
      publicPath: 'dest',
        filename: 'app.min.js',
    },
    externals: {
        "leaflet": "L",
        "d3": "d3",
        "jquery": "jQuery"
    },
    module: {
    preLoaders: [
       {
         test: /\.js$/, 
         include: path.join(__dirname, './src/common/js'),
         loader: 'eslint', 
         exclude: /node_modules/ 
       }
      
        ],
    loaders: [
      {
        test: /\.js$/,
        include: path.join(__dirname, './src/common/js'),
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ["es2015"],  
        }
      },
      { test: /\.png$/, loader: "url-loader?limit=100000" },
    ]
  },
  plugins: [
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        }),
    new webpack.optimize.CommonsChunkPlugin(/* chunkName= */"vendor", /* filename= */"vendor.bundle.js")
    ],
  
eslint: {  
    configFile: 'eslintrc'
}

};


// webpack-dev-server --host 0.0.0.0 --port 8080 --watch --inline --content-base /home/nitrous/public_html/CO_Grants/
// http://red-meteor-147235.nitrousapp.com:8080/webpack-dev-server/

