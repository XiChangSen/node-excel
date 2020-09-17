const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
    mode: 'development',
    entry: {
        'main': './src/index.js',
        'merge': './src/merge.js',
    },
    output: {
        
    },
    target: 'node',
    externals: {
        './config': 'commonjs2 ./config'
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                { from: 'src/config.js', }
            ]
        })
    ]
}