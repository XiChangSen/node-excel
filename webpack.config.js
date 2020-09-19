const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
    mode: 'development',
    entry: {
        'main_v2': './src/mainV2.js',
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