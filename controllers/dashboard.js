// Incluir as bibliotecas
// Gerencia as requisições, rotas e URLs, entre outra funcionalidades
const express = require('express');
// Utilizado para manipular as rotas da aplicação
const router = express.Router();
// Arquivo com a funcionalidade para verificar se o usuário está logado
const { eAdmin } = require("../helpers/eAdmin");
// Incluir o arquivo que possui a conexão com banco de dados
const db = require('./../db/models');

// Criar a rota do dashboar, usar a função eAdmin com middleware para verificar se o usuário está logado
router.get('/', eAdmin, async (req, res) => {
    
    //Contar a quantidade de registro do BD
    const countUser = await db.users.count();

    //Criar a variável para receber os dados
    var data = {countUser}

    res.render("admin/dashboard/dashboard", { layout: 'main' , profile: req.user.dataValues, data, sidebarDashboard: true });
});

// Exportar a instrução que está dentro da constante router 
module.exports = router;
