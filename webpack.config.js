const webpack = require('webpack');
const path = require('path');

module.exports = {
    devtool: 'inline-source-map',
    entry: [
        'webpack-dev-server/client?http://127.0.0.1:8080/',
        'webpack/hot/only-dev-server',
        'whatwg-fetch',
        './src'
    ],
    output: {
        path: path.join(__dirname, 'public'),
        filename: 'bundle.js'
    },
    resolve: {
        modulesDirectories: ['node_modules', 'src'],
        extensions: ['', '.scss', '.css', '.js', '.json']
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                include: [
                    path.resolve(__dirname, "src"),
                ],
                loader: 'react-hot'
            },
            {
                test: /\.jsx?$/,
                include: [
                    path.resolve(__dirname, "src"),
                ],
                loader: 'babel',
                query: {
                    presets: ['react', 'es2015'],
                    plugins: ['transform-object-rest-spread']
                }
            },
            {
                test: /\.scss$/,
                loader: 'style!css!sass?outputStyle=compressed'
            },
            {
                test: /\.json$/,
                loader: "json-loader"
            }
        ]
    },
    sassLoader: {
        includePaths: [
            './node_modules'
        ]
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin()
    ]
};
