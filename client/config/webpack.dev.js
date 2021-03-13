/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const process = require('process');
require('dotenv').config();
const mode = process.env.NODE_ENV;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const webpack = require('webpack');
const PreactRefreshPlugin = require('@prefresh/webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { cwd } = require('process');

console.log(mode);
const curProcess = cwd();

module.exports = {
	entry: path.resolve(curProcess, 'src'),
	output: {
		path: path.resolve(curProcess, './dist'),
		publicPath: '/',
		filename: 'public/js/bundle.js',
	},
	devtool: 'source-map',
	devServer: {
		contentBase: path.resolve(curProcess, 'src/assets'),
		contentBasePublicPath: '/',
		historyApiFallback: true,
		hot: true,
		compress: true,
		writeToDisk: true,
	},
	mode: 'development',
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				include: /src/,
				exclude: [/node_modules/, /cypress/],
				use: [
					{
						loader: 'babel-loader',
						options: {
							presets: [
								'@babel/preset-env',
								'@babel/preset-react',
								'@emotion/babel-preset-css-prop',
							],
							plugins: [
								'@babel/plugin-transform-runtime',
								'@prefresh/babel-plugin',
								'istanbul',
							],
							compact: false,
							cacheDirectory: true,
							cacheCompression: false,
							sourceMaps: true,
							inputSourceMap: true,
						},
					},
					{
						loader: 'ts-loader',
						options: {
							compilerOptions: {
								target: 'esnext',
								module: 'esnext',
								react: 'preserve',
								lib: ['dom', 'dom.iterable', 'esnext'],
							},
						},
					},
				],
			},
			{
				test: /\.jsx?$/,
				exclude: [/node_modules/, /cypress/],
				include: /src/,
				use: [
					{
						loader: 'babel-loader',
						options: {
							presets: [
								'@babel/preset-env',
								'@babel/react',
								'@emotion/babel-preset-css-prop',
							],
							plugins: [
								'@babel/plugin-transform-runtime',
								'@prefresh/babel-plugin',
								'istanbul',
							],
							compact: true,
							cacheDirectory: true,
							cacheCompression: true,
							sourceMaps: true,
							inputSourceMap: true,
						},
					},
				],
			},
			{
				test: /\.css?$/,
				use: ['style-loader', 'css-loader'],
			},
			{
				// eslint-disable-next-line security/detect-unsafe-regex
				test: /\.(woff(2)?|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
				type: 'asset/resource',
				generator: {
					filename: 'public/fonts/[name].[ext]',
				},
			},
			{
				test: /\.(jpg|jpeg|png|webp)?$/,
				type: 'asset',
				generator: { filename: 'public/images/[name].[ext]' },
			},
			{
				test: /\.gif?$/,
				type: 'asset',
				generator: { filename: 'public/gif/[name].[ext]' },
			},
			{
				test: /\.m4v?$/,
				type: 'asset',
				generator: { filename: 'public/video/[name].[ext]' },
			},
			{
				test: /\.pdf$/,
				type: 'asset',
				generator: { filename: 'public/pdf/[name].[ext]' },
			},
			{
				test: /\.svg$/,
				use: [
					'babel-loader',
					{
						loader: 'react-svg-loader',
						options: {
							svgo: {
								plugins: [{ removeDimensions: true, removeViewBox: false }],
								floatPrecision: 2,
							},
						},
					},
				],
			},
		],
	},
	resolve: {
		alias: {
			react: 'preact/compat',
			'react-dom/test-utils': 'preact/test-utils',
			'react-dom': 'preact/compat',
			//	'react-hot-loader': 'preact/hot-loader',
			icons: path.resolve(curProcess, './src/assets/icons'),
			assets: path.resolve(curProcess, './src/assets'),
			pictures: path.resolve(curProcess, './src/static/Pictures'),
		},
		modules: ['src', 'node_modules'],
		extensions: ['.ts', '.tsx', '.js', '.jsx'],
	},
	plugins: [
		new webpack.HotModuleReplacementPlugin(),
		new PreactRefreshPlugin(),
		new ESLintPlugin(),
		new HtmlWebpackPlugin({
			template: path.resolve(curProcess, 'src/index.html'),
			filename: 'index.html',
		}),
		new webpack.DefinePlugin({
			BACKEND_SERVER_URL: JSON.stringify('http://localhost:5050'),
		}),
		new CleanWebpackPlugin(),
	],
};
