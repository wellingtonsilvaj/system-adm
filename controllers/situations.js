// Incluir as bibliotecas
// Gerencia as requisições, rotas e URLs, entre outra funcionalidades
const express = require('express');
// Utilizado para manipular as rotas da aplicação
const router = express.Router();
// Validar input do formulário
const yup = require('yup');
// Arquivo com a funcionalidade para verificar se o usuário está logado
const { eAdmin } = require("../helpers/eAdmin");
// Incluir o arquivo que possui a conexão com banco de dados
const db = require('../db/models');
// Operador do sequelize
const {Op} = require("sequelize");

// Criar a rota do listar situação, usar a função eAdmin com middleware para verificar se o usuário está logado
router.get('/', eAdmin, async (req, res) => {
    // Receber o número da página, quando não é enviado o número da página é atribuido página 1
    const { page = 1 } = req.query;
    // Limite de registros em cada página
    const limit = 40;
    // Variável com o número da última página
    var lastPage = 1;

    // Contar a quantidade de registro no banco de dados
    const countSituation = await db.situations.count();

    // Acessa o IF quando encontrar registro no banco de dados
    if (countSituation !== 0) {
        // Calcular a última página
        lastPage = Math.ceil(countSituation / limit);
    } else {
        // Pausar o processamento, carregar a view, carregar o layout main, indicar qual item de menu deve ficar ativo, enviar mensagem de erro
        return res.render("admin/situations/list", { layout: 'main', profile: req.user.dataValues, sidebarSituations: true, danger_msg: 'Erro: Nenhum usuário encontrado!' });
    }

    // Recuperar todas as situações do banco de dados
    await db.situations.findAll({
        // Indicar quais colunas recuperar
        attributes: ['id', 'nameSituation'],
        // Ordenar os registros pela coluna id na forma decrescente
        order: [['id', 'DESC']],
        // Calcular a partir de qual registro deve retornar e o limite de registros
        offset: Number((page * limit) - limit),
        limit: limit
    }).then((situations) => {
        // Acessa o IF quando retornar registro do banco de dados
        if (situations.length !== 0) {
            // Criar objeto com as informações para paginação
            var pagination = {
                // Caminho
                path: '/situations',
                // Página atual
                page,
                // URL da página anterior
                prev_page_url: ((Number(page) - Number(1)) >= 1) ? Number(page) - Number(1) : false,
                // URL da próxima página
                next_page_url: ((Number(page) + Number(1)) > Number(lastPage)) ? false : Number(page) + Number(1),
                // última página
                lastPage
            }
            // Pausar o processamento, carregar a view, carregar o layout main, indicar qual item de menu deve ficar ativo, enviar os registros retornado do banco de dados 
            res.render("admin/situations/list", { layout: 'main' , profile: req.user.dataValues, sidebarSituations: true, situations: situations.map(id => id.toJSON()), pagination });
        } else {
            // Pausar o processamento, carregar a view, carregar o layout main, indicar qual item de menu deve ficar ativo, enviar mensagem de erro
            res.render("admin/situations/list", { layout: 'main' , profile: req.user.dataValues, sidebarSituations: true, danger_msg: 'Erro: Nenhuma situação encontrada!' });
        }

    }).catch(() => {
        // Pausar o processamento, carregar a view, carregar o layout main, indicar qual item de menu deve ficar ativo, enviar mensagem de erro
        res.render("admin/situations/list", { layout: 'main' , profile: req.user.dataValues, sidebarSituations: true, danger_msg: 'Erro: Nenhuma situação encontrada!' });
    })
});

// Criar a rota para página visualizar os detalhes do registro
router.get('/view/:id', eAdmin, async (req, res) => {

    // Receber o id enviado na URL
    const { id } = req.params;

    // Recuperar o registro do banco de dados
    const situation = await db.situations.findOne({
        // Indicar quais colunas recuperar
        attributes: ['id', 'nameSituation', 'createdAt', 'updatedAt'],
        // Acrescentado condição para indicar qual registro deve ser retornado do banco de dados
        where: {
            id
        }
    });

    // Acessa o IF se encontrar o registro no banco de dados
    if (situation) {
        res.render("admin/situations/view", { layout: 'main' , profile: req.user.dataValues, sidebarSituations: true, situation });
    } else {
        // Criar a mensagem de erro
        req.flash("danger_msg", "Erro: Situação não encontrada!");
        // Redirecionar o usuário
        res.redirect('/situations');
    }
});

// Criar rota para cadastrar situações

router.get('/add', eAdmin, (req, res) => {

    res.render('admin/situations/add', {layout: 'main' , profile: req.user.dataValues, sidebarSituations: true})
});

router.post('/add', eAdmin, async (req, res) => {

// Receber os dados do formulário
    var data = req.body;

    const schema = yup.object().shape({
        nameSituation: yup.string("Erro: Necessário preencher o campo nome situação!")
        .required("Erro: Necessário preencher o campo nome situação!")
        .min(4, "Erro: Deve ter no mínimo 4 caracteres!"),
});

 // Verificar se todos os campos passaram pela validação
 try {
    await schema.validate(data);
} catch (error) {
    // Pausar o processamento e carregar a view enviando os dados que o usuário havia preenchido no formulário
    return res.render("admin/situations/add", { layout: 'main' , profile: req.user.dataValues, data, sidebarSituations: true, danger_msg: error.errors });
}
 // Recuperar o registro do banco de dados
 const user = await db.situations.findOne({
    // Indicar quais colunas recuperar
    attributes: ['id', 'nameSituation'],
    // Acrescentado condição para indicar qual registro deve ser retornado do banco de dados
    where: {
        nameSituation: data.nameSituation
    }
});

// Acessa o IF se encontrar o registro no banco de dados
if (user) {
    // Pausar o processamento e carregar a view enviando os dados que o usuário havia preenchido no formulário
    return res.render("admin/situations/add", { layout: 'main' , profile: req.user.dataValues, data, sidebarSituations: true, danger_msg: "Erro: Situação já cadastrada!" });
}
  // Cadastrar no banco de dados
  db.situations.create(data).then(() => {
        // Criar a mensagem de usuário cadastrado com sucesso
        req.flash("success_msg", "Situação cadastrada com sucesso! ");
        // Redirecionar o usuário após cadastrar 
        //res.redirect('/users?page=1');
        res.redirect('/situations?page=1');

       }).catch(() => {
        // Pausar o processamento e carregar a view enviando os dados que o usuário havia preenchido no formulário
        return res.render("admin/situations/add", { layout: 'login.handlebars', data: req.body, danger_msg: "Erro: Situação não cadastrado com sucesso!" });
    });
});
//Rota para criar pagina edita situações
router.get('/edit/:id', eAdmin, async (req, res) => {

    const { id } = req.params;
    
    //Recuperar as situações do BD
    const situation = await db.situations.findOne({

        attributes: ['id', 'nameSituation'],

        where:{
            id
        }
    });
    //Acessa o if se encontrar o registro no BD
    if(situation){
        //enviar dados para o formulário
        var dataForm = situation.dataValues;
        res.render('admin/situations/edit', {layout: 'main' , profile: req.user.dataValues, data: dataForm, sidebarSituations: true});
    }else{
        req.flash("danger_msg", "Erro: Situação não encontrada")
        res.redirect('/situations?page=1')
    }
    
});
// Criar rota para receber os dados do formulário editar usuário
router.post('/edit', eAdmin, async (req, res) =>{
    // Receber os dados do formulário
    var data = req.body;

   const schema = yup.object().shape({
        nameSituation: yup.string("Erro: Necessário preencher o campo nome situação!")
        .required("Erro: Necessário preencher o campo nome situação!")
        .min(4, "Erro: Deve ter no mínimo 4 caracteres!"),
});

 // Verificar se todos os campos passaram pela validação
 try {
    await schema.validate(data);
} catch (error) {
    // Pausar o processamento e carregar a view enviando os dados que o usuário havia preenchido no formulário
    return res.render("admin/situations/edit", { layout: 'main' , profile: req.user.dataValues, data, sidebarSituations: true, danger_msg: error.errors });
}

 // Recuperar o registro do banco de dados
 const user = await db.situations.findOne({
    // Indicar quais colunas recuperar
    attributes: ['id', 'nameSituation'],
    // Acrescentado condição para indicar qual registro deve ser retornado do banco de dados
    where: {
        nameSituation: data.nameSituation,
        id:{
           // operador de negação para ignorar o registro do usuário que está sendo editado 
            [Op.ne]: data.id
        }
    }
});

// Acessa o IF se encontrar o registro no banco de dados
if (user) {
    // Pausar o processamento e carregar a view enviando os dados que o usuário havia preenchido no formulário
    return res.render("admin/situations/edit", { layout: 'main' , profile: req.user.dataValues, data, sidebarSituations: true, danger_msg: "Erro: Situação já cadastrada!" });
}
// Editar no BD
db.situations.update(data, { where: {id: data.id}}).then(() => {
    req.flash("success_msg", "Situação editada com sucesso!");
    res.redirect('/situations/view/' + data.id);
}).catch(() => {

  res.render('admin/situations/edit', {layout: 'main' , profile: req.user.dataValues, data: req.body, sidebarSituations: true});
});

});
//Criar rota para apagar Situações no BD
router.get('/delete/:id', async (req, res) => {
    //recuperar o regitro do BD para verificar se a situação está sendo utilizada
    const user = await db.users.findOne({
        //Indicar quais colunas recuperar
        attributes:['id'],
        //Acrescentar condição para indicar qual resgistro deve ser retornado do BD
        where:{
            situationId: req.params.id
        }
    });

    //Acessa o if se encontar registro no BD
    if(user){
        req.flash("danger_msg", "A situação não pode ser apagada, há usuário utilizando essa situação!");
        return res.redirect('/situations/view/' + req.params.id)
    }
    
    //Apagar model no BD 
    db.situations.destroy({
        where:{
            id: req.params.id
        }
    }).then(() => {
        req.flash("success_msg", "Situação apagada com sucesso!");
       res.redirect('/situations?page=1')
    }).catch(() => {
        req.flash("danger_msg", "Situação não apagada com sucesso!");
        //res.redirect('/situations?page=1');
        res.redirect('/situations/view/' + req.params.id);
    });
});

// Exportar a instrução que está dentro da constante router 
module.exports = router;
