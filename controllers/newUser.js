// Incluir as bibliotecas
// Gerencia as requisições, rotas e URLs, entre outra funcionalidades
const express = require('express');
// Utilizado para manipular as rotas da aplicação
const router = express.Router();
// Incluir o arquivo que possui a conexão com banco de dados
const db = require('../db/models');
// Criptografar senha
const bcrypt = require('bcryptjs');
// Validar input do formulário
const yup = require('yup');
// Enviar e-mail
const nodemailer = require('nodemailer');

// Criar a rota para página com formulário cadastrar usuário
router.get('/', (req, res) => {
    res.render("admin/login/add-user", { layout: 'login' });
});

// Criar a rota para receber os dados do formulário cadastrar usuário
router.post('/add-user', async (req, res) => {

    // Receber os dados do formulário
    var data = req.body;

    // Validar os campos utilizando o yup
    const schema = yup.object().shape({
        password: yup.string("Erro: Necessário preencher o campo senha!")
            .required("Erro: Necessário preencher o campo senha!")
            .min(6, "Erro: A senha deve ter no mínimo 6 caracteres!"),
        email: yup.string("Erro: Necessário preencher o campo e-mail!")
            .required("Erro: Necessário preencher o campo e-mail!")
            .email("Erro: Necessário preencher o campo e-mail!"),
        name: yup.string("Erro: Necessário preencher o campo nome!")
            .required("Erro: Necessário preencher o campo nome!")
    });

    // Verificar se todos os campos passaram pela validação
    try {
        await schema.validate(data);
    } catch (error) {
        // Pausar o processamento e carregar a view enviando os dados que o usuário havia preenchido no formulário
        return res.render("admin/login/add-user", { layout: 'login.handlebars', data, danger_msg: error.errors });
    }

    // Recuperar o registro do banco de dados
    const user = await db.users.findOne({
        // Indicar quais colunas recuperar
        attributes: ['id', 'email'],
        // Acrescentado condição para indicar qual registro deve ser retornado do banco de dados
        where: {
            email: data.email
        }
    });

    // Acessa o IF se encontrar o registro no banco de dados
    if (user) {
        // Pausar o processamento e carregar a view enviando os dados que o usuário havia preenchido no formulário
        return res.render("admin/login/add-user", { layout: 'login.handlebars', data, danger_msg: "Erro: Este e-mail já está cadastrado!" });
    }

    //Criptografar a senha
    data.password = await bcrypt.hash(data.password, 8);

    // Gerar a chave para confirmar e-mail
    data.confEmail = (await bcrypt.hash(data.password, 8)).replace(/\./g, "").replace(/\//g, "");

    // Cadastrar no banco de dados
    db.users.create(data).then(() => {

        // Criar a variável com as credenciais do servidor para enviar e-mail
        var transport = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // Criar a variável com o conteúdo do e-mail
        var message_content = {
            from: process.env.EMAIL_PASS, // Rementent
            to: data.email, // E-mail do destinatário
            subject: "Confirma sua conta", // Título do e-mail
            text: "Prezado(a) " + data.name + "\n\nAgradecemos a sua solicitação de cadastro em nosso site!\n\nPara que possamos liberar o seu cadastro em nosso sistema, solicitamos a confirmação do e-mail clicanco no link abaixo: " + process.env.URL_ADM + "/conf-email/conf-email/" + data.confEmail + " \n\nEsta mensagem foi enviada a você pela empresa " + process.env.NAME_EMP + " .<br>Você está recebendo porque está cadastrado no banco de dados da empresa " + process.env.NAME_EMP + ". Nenhum e-mail enviado pela empresa " + process.env.NAME_EMP + " tem arquivos anexados ou solicita o preenchimento de senhas e informações cadastrais.\n\n", // Conteúdo do e-mail somente texto
            html: "Prezado(a) " + data.name + "<br><br>Agradecemos a sua solicitação de cadastro em nosso site!<br><br>Para que possamos liberar o seu cadastro em nosso sistema, solicitamos a confirmação do e-mail clicanco no link abaixo: <a href='" + process.env.URL_ADM + "/conf-email/conf-email/" + data.confEmail + "'>" + process.env.URL_ADM + "/conf-email/conf-email/" + data.confEmail + "</a> <br><br>Esta mensagem foi enviada a você pela empresa " + process.env.NAME_EMP + ".<br>Você está recebendo porque está cadastrado no banco de dados da empresa " + process.env.NAME_EMP + ". Nenhum e-mail enviado pela empresa " + process.env.NAME_EMP + " tem arquivos anexados ou solicita o preenchimento de senhas e informações cadastrais.<br><br>", // Conteúdo do e-mail com HTML
        }

        // Enviar e-mail
        transport.sendMail(message_content, function (err) {
            if (err) {
                // Criar a mensagem de usuário cadastrado com sucesso, mas e-mail não enviado
                req.flash("warning_msg", "Usuário cadastrado com sucesso. Mas, e-mail de confirmação não enviado, entre em contato com e-mail " + process.env.EMAIL_ADM + " .");
                // Redirecionar o usuário após cadastrar com sucesso
                res.redirect('/login');
            } else {
                // Criar a mensagem de usuário cadastrado com sucesso, e-mail enviado
                req.flash("success_msg", "Usuário cadastrado com sucesso. Acesse a sua caixa de e-mail para confimar o e-mail!");
                // Redirecionar o usuário após cadastrar com sucesso
                res.redirect('/login');
            }
        });
    }).catch(() => {
        // Pausar o processamento e carregar a view enviando os dados que o usuário havia preenchido no formulário
        return res.render("admin/login/add-user", { layout: 'login.handlebars', data: req.body, danger_msg: "Erro: Usuário não cadastrado com sucesso!" });
    });
});



// Exportar a instrução que está dentro da constante router 
module.exports = router;
