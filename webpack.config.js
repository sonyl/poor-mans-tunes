/* eslint-env node */
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
        path: path.join(__dirname, 'dist'),
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
                    path.resolve(__dirname, 'src')
                ],
                loader: 'react-hot'
            }, {
                test: /\.jsx?$/,
                include: [
                    path.resolve(__dirname, 'src')
                ],
                loader: 'babel',
                query: {
                    presets: ['react', 'es2015'],
                    plugins: ['transform-object-rest-spread', 'transform-class-properties']
                }
            }, {
                test: /\.scss$/,
                loader: 'style!css!sass?outputStyle=compressed'
            }, {
                test: /\.json$/,
                loader: 'json-loader'
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
        new webpack.NoErrorsPlugin(),
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify(process.env.NODE_ENV)
            }
        })
    ],
    devServer: {
        historyApiFallback: {
            rewrites: [{
                from: /.*\/bootstrap\.min\.css$/,
                to: '/vendor/bootstrap-3.3.7-dist/css/bootstrap.min.css'
            }, {
                from: /.*\/glyphicons-halflings-regular\.woff2$/,
                to: '/vendor/bootstrap-3.3.7-dist/fonts/glyphicons-halflings-regular.woff2'
            }, {
                from: /.*\/bundle\.js$/,
                to: '/bundle.js'
            }, {
                from: /^\/app\/.*$/,
                to: '/index.html'
            }]
        }
    }
};
