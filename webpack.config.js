const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssNano = require('cssnano');
const autoprefixer = require('autoprefixer');
const postcssSortMediaQueries = require('postcss-sort-media-queries');

const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  entry: {
    bundle: [
      path.resolve(__dirname, 'src', 'js', 'main.js'),
      path.resolve(__dirname, 'src', 'scss', 'main.scss')
    ]
  },
  output: {
    path: path.resolve(__dirname),
    filename: 'assets/[name].js',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.s?css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: isProduction
                  ? [autoprefixer(), CssNano(), postcssSortMediaQueries()]
                  : [autoprefixer(), postcssSortMediaQueries()],
              },
            },
          },
          'sass-loader',
        ]
      }
    ]
  },
  resolve: {
    extensions: ['*', '.js', '.jsx', 'json'],
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@shopify-directory": path.resolve(__dirname),
    }
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'assets/[name].css',
    }),
  ],
  devtool: isProduction ? false : 'source-map',
  mode: isProduction ? 'production' : 'development',
  watchOptions: {
    ignored: /node_modules/,
  }
}