// Incluir o arquivo com as variáveis de ambiente
require('dotenv').config();

// Incluir as bibliotecas
// Gerencia as requisições, rotas e URLs, entre outra funcionalidades
const express = require('express');
// Handlebars é um processador de templates que gera a página HTML de forma dinamica
const {engine} = require('express-handlebars');
// Incluir o módulo para gerenciar diretórios e caminhos
const path = require("path");
// Criar sessão e armazenar dados no servidor
const session = require('express-session');
// Criar a variável global dentro do flash
const flash = require('connect-flash');
// Middleware para a implementação de autenticação
const passport = require('passport');
// Chamar a função resposável em validar o usuário e senha
require('./helpers/auth')(passport);
// Moment é utilizado para a manipular datas
const moment = require('moment');
// Chamar a função express
const app = express();

// Criar o middleware para ler a entrada de um formulário e a armazenar como um objeto javascript acessível por meio do req.body
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Criar um middleware para manipular sessão
app.use(session({
    secret: process.env.SECRETSESSION,
    resave: false,
    saveUninitialized: true
}));

// Inicializar o passport e a sessão
app.use(passport.initialize());
app.use(passport.session());

// Usar o flash para armazenar mensagens na sessão
app.use(flash());

// Criar o middleware para manipular as mensagens
app.use((req, res, next) => {
    // locals usado para criar variável global "success_msg"
    res.locals.success_msg = req.flash('success_msg');
    // locals usado para criar variável global "warning_msg"
    res.locals.warning_msg = req.flash('warning_msg');
    // locals usado para criar variável global "danger_msg"
    res.locals.danger_msg = req.flash('danger_msg');
    // locals usado para criar variável global "error_msg"
    res.locals.error_msg = req.flash('error');
    // Caso não de erro, continue o processamento, o next é obrigatório no middleware
    next();
});

// Definir qual template será utilizado
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

// Local dos arquivos estáticos
app.use(express.static(path.join(__dirname, "public")));

// Criar um middleware para manipular datas utilizando moment
app.engine('handlebars', engine({
    helpers: {
        formatDate: (date) => {
            return moment(date).format('DD/MM/YYYY');
        },
        formatDateTime: (date) => {
            return moment(date).format('DD/MM/YYYY HH:mm:ss');
        }
    }
}));

// Incluir as CONTROLLERS
const home = require('./controllers/home');
const login = require('./controllers/login');
const newUser = require('./controllers/newUser');
const confEmail = require('./controllers/confEmail');
const recoverPassword = require('./controllers/recoverPassword');
const dashboard = require('./controllers/dashboard');
const users = require('./controllers/users');
const situations = require('./controllers/situations');
const profile = require('./controllers/profile');

// Indicar a rota de acesso
app.use('/', home);
app.use('/login', login);
app.use('/login/logout', login);
app.use('/new-user', newUser);
app.use('/new-user/add-user', newUser);
app.use('/conf-email', confEmail);
app.use('/conf-email/new-conf-email', confEmail);
app.use('/recover-password', recoverPassword);
app.use('/recover-password/update-password', recoverPassword);
app.use('/dashboard', dashboard);

app.use('/users', users);
app.use('/users/add', users);
app.use('/users/edit', users);
app.use('/users/delete', users);
app.use('/users/view', users);
app.use('/users/edit-image', users);
app.use('/users/edit-password', users);

app.use('/situations', situations);
app.use('/situations/view', situations);
app.use('/situations/add', situations);
app.use('/situations/edit', situations);
app.use('/situations/delete', situations);

app.use('/profile', profile);
app.use('/profile/edit', profile);
app.use('/profile/edit-password', profile);
app.use('/profile/edit-image', profile);

// Iniciar o servidor na porta 8080
app.listen(8080, () => {
    console.log("Servidor iniciado na porta 8080: http://localhost:8080");
});