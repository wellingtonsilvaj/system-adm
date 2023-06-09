// Incluir as bibliotecas
// Gerencia as requisições, rotas e URLs, entre outra funcionalidades
const express = require('express');
// Utilizado para manipular as rotas da aplicação
const router = express.Router();
// Middleware para a implementação de autenticação
const passport = require('passport');

// Criar a rota da página com formulário de login
router.get('/', (req, res) => {
    res.render("admin/login/login", { layout: 'login' });
});

// Criar a rota para receber os dados do formulário de login e validar login
router.post('/', (req, res, next) => {
    // Utilizar o usuário e a senha para validar o login
    passport.authenticate("local", {
        // Redirecionar o usuário quando o login e senha estiver correto
        successRedirect: "/dashboard",
        // Redirecionar o usuário quando o login e senha estiver incorreto
        failureRedirect: "/login",
        // Receber as mensagens de erro
        failureFlash: true
    })(req, res, next);
});

// Rota para sair do sistema administrativo
router.get('/logout', (req, res) => {
    // Remover os dados do usuário da sessão
    req.logout(req.user, () => {
        // Criar a mensagem de sucesso
        req.flash("success_msg", "Deslogado com sucesso!");
        // Redirecionar o usuário
        res.redirect('/login');
    });
});

// Exportar a instrução que está dentro da constante router 
module.exports = router;
