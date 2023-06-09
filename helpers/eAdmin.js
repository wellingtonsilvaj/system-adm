// Validar se o usuário está logado
module.exports = {
    eAdmin: function (req, res, next) {
        // Acessa o IF quando o usuário está logado e continua o processamento
        if (req.isAuthenticated()) {
            return next();
        } else { // Acessa o ELSE quando o usuário não está logado e redireciona para página de login
            req.flash("danger_msg", "Erro: Necessário realizar o login para acessar a página solicitada!");
            res.redirect('/login');
        }
    }
}