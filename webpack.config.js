const path = require('path');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const CopywebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    context: __dirname,
    entry: {},
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
    },
    module: {
        rules: [
            {
                test: /\.ts?$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.s?[ac]ss$/i,
                use: [
                    'style-loader',
                    'css-loader',
                    'sass-loader',
                ],
            }, {
                test: /\.(png|gif|jpg|jpeg|svg|xml)$/,
                use: [ 'url-loader' ]
            },
        ]
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'src/index.html',
            inject: true,
            inline: fs.readFileSync('dist/app.js', 'utf8'),
        }),
        new CopywebpackPlugin({
            patterns: [
                {
                    from: 'src/assets/**/*',
                    to: 'assets/[name][ext]',
                },
                {
                    from: 'src/public/**/*',
                    to: '[name][ext]',
                },
            ],
        }),
    ],
    devServer: {
        contentBase: path.join(__dirname, 'dist')
    }
};
