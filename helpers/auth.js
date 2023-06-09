// Validar o usuário e a senha com dados locais
const localStrategy = require('passport-local').Strategy;
// Criptografar senha
const bcryptjs = require('bcryptjs');
// Incluir o arquivo que possui a conexão com banco de dados
const db = require('./../db/models');

// Criar a função para validar o login e a senha e exportar para utilizar em outras partes do projeto
module.exports = function (passport) {
    passport.use(new localStrategy({
        // Receber os dados dos campos
        usernameField: 'email',
        passwordField: 'password'
    }, async (email, password, done) => {
        // Recuperar as informações do usuário do banco de dados
        await db.users.findOne({
            // Indicar quais colunas recuperar
            attributes: ['id', 'password', 'situationId'],
            // Acrescentado condição para indicar qual registro deve ser retornado do banco de dados
            where: {
                email
            }
        }).then(async (user) => {
            // Acessa o IF quando não encontrar o usuário no banco de dados
            if (!user) {
                return done(null, false, { message: "Erro: E-mail ou senha incorreta!" });
            }

            // Comparar a senha do formulário com a senha salva no banco de dados
            bcryptjs.compare(password, user.password, (erro, correct) => {

                // Acessa o IF quando a senha estiver correta e a situação diferente de 1 "ativo"
                if((correct) && (user.dataValues.situationId != 1)){
                    return done(null, false, { message: "Erro: Necessário confirmar o e-mail, solicite novo link <a href='/conf-email'>clique aqui</a>!" });
                } else if(correct){ // Acessa o ELSE IF quando a senha está correta
                    return done(null, user);
                }else{ // Acessa o ELSE quando a senha está incorreta
                    return done(null, false, { message: "Erro: E-mail ou senha incorreta!" })
                }
            });            
        });

        // Salvar os dados do usuário na sessão
        passport.serializeUser((user, done) => {
            done(null, user.id);
        });

        passport.deserializeUser(async (id, done) => {
            const user = await db.users.findByPk(id, {attributes: ['id', 'name', 'email', 'image']});
            done(null, user);
        });
    }));
}