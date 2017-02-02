/* eslint-env node */
const webpack = require('webpack');
const path = require('path');

var entry;
const plugins = [
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.DefinePlugin({
        'process.env': {
            'NODE_ENV': JSON.stringify(process.env.NODE_ENV)
        }
    })
];

if(process.env.NODE_ENV === 'production'){

    entry = [
        'whatwg-fetch',
        './src',
        'bootstrap-webpack!./bootstrap.config.js'
    ];

} else {

    plugins.push(new webpack.HotModuleReplacementPlugin());

    entry = [
        'webpack-dev-server/client?http://127.0.0.1:8080/',
        'webpack/hot/only-dev-server',
        'whatwg-fetch',
        'bootstrap-webpack!./bootstrap.config.js',
        './src'
    ];
}


module.exports = {
    devtool: 'inline-source-map',

    entry,

    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'bundle.js'
    },

    resolve: {
        modules: [
            path.join(__dirname, 'src'),
            'node_modules'
        ],
        extensions: ['.scss', '.css', '.js', '.json']
    },

    module: {
        rules: [
            {
                test: /\.jsx?$/,
                include: [
                    path.resolve(__dirname, 'src')
                ],
                loader: 'react-hot-loader'
            },
            {
                test: /\.jsx?$/,
                include: [
                    path.resolve(__dirname, 'src')
                ],
                use: [
                    {
                        loader: 'babel-loader', options: {
                            presets: ['react', 'es2015'],
                            plugins: ['transform-object-rest-spread', 'transform-class-properties']
                        }
                    }
                ]
            },
            {
                test: /\.less$/,
                use: [
                    'style-loader',
                    { loader: 'css-loader', options: { importLoaders: 1 } },
                    { loader: 'less-loader', options: { strictMath: true, noIeCompat: true } }
                ]
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            { test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,  loader: 'url-loader?limit=20000&mimetype=application/font-woff' },
            { test: /\.ttf$/,    loader: 'file-loader' },
            { test: /\.eot$/,    loader: 'file-loader' },
            { test: /\.svg$/,    loader: 'file-loader' }
        ]
    },

    plugins,

    devServer: {
        historyApiFallback: {
            rewrites: [{
                from: /.*\/bundle\.js$/,
                to: '/bundle.js'
            }, {
                from: /^\/app\/.*$/,
                to: '/index.html'
            }]
        },
        proxy: {
            '/mp3': {
                target: 'http://www.home',
                logLevel: 'debug'
            }
        }
    }
};