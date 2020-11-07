const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

//create a unique UUID to cache bust files
// http://www.ietf.org/rfc/rfc4122.txt
let s = [];
const hexDigits = "0123456789abcdef";
for (let i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
}
s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
s[19] = hexDigits.substr(s[19] & 0x3 | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
s[8] = s[13] = s[18] = s[23] = "-";

module.exports = {
    devtool: 'inline-source-map',
    devServer: {
        contentBase: './dist',
    },
    entry: {
      index: './src/index.ts'
    },
    plugins: [
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin({
          filename: '[name].css',
          chunkFilename: '[id].css'
        }),
        new HtmlWebpackPlugin({
            template: 'index.html',
            filename: "index.html",
            chunks:['index']
        }),
        new CopyWebpackPlugin({
            patterns: [{ 
                from: 'i18n/', to: 'locales/[folder]/[name].[ext]'
            }]
        })
    ],
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.s[ac]ss$/i,
                use: [
                  MiniCssExtractPlugin.loader,
                  'css-loader',
                  'resolve-url-loader',
                  {
                    loader: 'sass-loader',
                    options: {
                        sourceMap: true
                    }
                }]
            },
            {
              test: /\.(png|svg|jpg|gif)$/,
              use: [
                'file-loader',
              ],
            },
        ],
    },
    resolve: {
        extensions: [ '.tsx', '.ts', '.js', '.css' ],
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
};