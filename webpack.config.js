/* eslint-env node */
const webpack = require('webpack');
const path = require('path');
const VersionFile = require('webpack-version-file');
const versionTemplate = '/* eslint max-len: 0 */ \n'
        + 'export const version = '
        + '{name: \'<%= name %>\', version: \'<%= version %>\', buildDate: \'<%= buildDate %>\', env: \'<%= env %>\'};';

const server = 'http://localhost:9001';

var entry;

if(process.env.NODE_ENV === 'production'){

    entry = [
        'whatwg-fetch',
        './src',
        'bootstrap-webpack!./bootstrap.config.js'
    ];

} else {

    entry = [
        'webpack-dev-server/client?http://127.0.0.1:9000/',
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
        filename: 'bundle.js',
        publicPath: '/'
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
                use: [{
                    loader: 'react-hot-loader'
                }, {
                    loader: 'babel-loader',
                    options: {
                        presets: ['react', 'es2015'],
                        plugins: ['transform-object-rest-spread', 'transform-class-properties']
                    }
                }]
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

    plugins: [
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify(process.env.NODE_ENV)
            }
        }),
        new webpack.HotModuleReplacementPlugin(),
        new VersionFile({
            output: path.join(__dirname, 'src', 'version.js'),
            data: {
                env: process.env.NODE_ENV || 'development'
            },
            templateString: versionTemplate

        })
    ],

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
        proxy: [{
            context: ['/audio/**', '/img/**', '/lyrics/**', '/api/**'],
            target: server,
            logLevel: 'debug'
        }]
    }
};