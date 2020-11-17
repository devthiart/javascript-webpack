//webpack.config.js é o configurador do webpack.

//Pega o endereço do arquivo.
const path = require('path');

//Pega o plugin babili que baixamos. O nome deve ser o mesmo do package.json.
const babiliPlugin = require('babili-webpack-plugin');

const extractTextPlugin = require('extract-text-webpack-plugin');
const optimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

//Pego o webpack para usa-lo.
const webpack = require('webpack');

//Plugin responsável por gerar o arquivo html através do meu arquivo main.html, já com todas
// as importações de arquivos necessárias e otimizações.
const HtmlWebpackPlugin = require('html-webpack-plugin');

let plugins = [];

plugins.push(new HtmlWebpackPlugin({
    hash: true, 
    minify: {
        html5: true,
        collapseWhitespace: true,
        removeComments: true,
    },
    filename: 'index.html',
    template: __dirname + '/main.html'
}));

plugins.push(new extractTextPlugin('styles.css'));

//Estou usando o webpack para colocar o plugin jQuery como global, para que todos tenham acesso a ele.
plugins.push(new webpack.ProvidePlugin({
    '$': 'jquery/dist/jquery.js',
    'jQuery': 'jquery/dist/jquery.js'
}));

//Plugin que separa os meus módulos e os módulos de terceiros no bundle.js
plugins.push(new webpack.optimize.CommonsChunkPlugin({
    name: 'vendor',
    filename: 'vendor.bundle.js'
}));

//Endereço da aplicação em dev.
let SERVICE_URL = JSON.stringify('http://localhost:3000');

if(process.env.NODE_ENV == 'production') {
    
    //Trocamos o endereço da app para produção.
    SERVICE_URL = JSON.stringify('http://endereco-da-sua-api');

    //Importa o módulo do webpack q deixa o projeto otimizado.
    plugins.push(new webpack.optimize.ModuleConcatenationPlugin());

    plugins.push(new babiliPlugin());

    plugins.push(new optimizeCSSAssetsPlugin({
        cssProcessor: require('cssnano'),
        cssProcessorOptions: {
            discardComments: {
                removeAll: true
            }
        },
        canPrint: true
    }));
}

//Troca tudo o que for SERVICE_URL para a minha variável SERVICE_URL.
plugins.push(new webpack.DefinePlugin({
    //SERVICE_URL: SERVICE_URL
    //Quando as duas variáveis que eu quero mudar tem o mesmo no,e posso resumir o comando assim:
    SERVICE_URL
}));

module.exports = {
    //Definimos qual vai ser o primeiro módulo a ser iniciado com o sistema, a partir desse arquivo ele vai
    //carregar os outros arquivos que possuem dependência.
    entry: {
        app: './app-src/app.js',
        vendor: ['jquery', 'bootstrap', 'reflect-metadata']
    },
    //Resultado da operação de configuração.
    output: {
        //Nome do arquivo
        filename: 'bundle.js',
        //Diretório. "__dirname" é a variável do node que tem o endereço do programa.
        path: path.resolve(__dirname, 'dist')
        //Cria a pasta dist e insere o bundle.js nela.
        //publicPath: 'dist'
    },
    module: {
        rules: [
            {
                //A regra verifica se o arquivo é um JavaScript.
                //Expressão regular que verifica se o arquivo termina em .js ($ é fim do nome.)
                test: /\.js$/,
                //Exceto os arquivos do node_modules.
                exclude: /node_modules/,
                //Estou pedindo para processar os arquivos .js com o babel loader.
                use: {
                    loader: 'babel-loader'
                }
            },
            {
                test: /\.css$/,
                //Estamos usando no lugar dos plugins 'style-loader' e 'css-loader' o plugin 
                //'extractTextPlugion', e caso ele falhe, usamos o 'style-loader'.
                //loader: 'style-loader!css-loader'
                use: extractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: 'css-loader'
                })
            },
            { 
                test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/, 
                loader: 'url-loader?limit=10000&mimetype=application/font-woff' 
            },
            { 
                test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, 
                loader: 'url-loader?limit=10000&mimetype=application/octet-stream'
            },
            { 
                test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, 
                loader: 'file-loader' 
            },
            { 
                test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, 
                loader: 'url-loader?limit=10000&mimetype=image/svg+xml' 
            }  
        ]
    },
    plugins
}