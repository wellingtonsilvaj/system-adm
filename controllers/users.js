// Incluir as bibliotecas
// Gerencia as requisições, rotas e URLs, entre outra funcionalidades
const express = require('express');
// Utilizado para manipular as rotas da aplicação
const router = express.Router();
// Arquivo com a funcionalidade para verificar se o usuário está logado
const { eAdmin } = require("../helpers/eAdmin");
// Incluir o arquivo que possui a conexão com banco de dados
const db = require('./../db/models');
// Criptografar senha
const bcrypt = require('bcryptjs');
// Validar input do formulário
const yup = require('yup');
// Operador do sequelize
const {Op} = require("sequelize");
//Incluir o arquivo com a função upload
const upload = require('../helpers/uploadImgUser');
//Permite interagir com o sistema de arquivos
const fs = require('fs');

// Criar a rota do listar usuários, usar a função eAdmin com middleware para verificar se o usuário está logado
router.get('/', eAdmin, async (req, res) => {
    // Receber o número da página, quando não é enviado o número da página é atribuido página 1
    const { page = 1 } = req.query;
    // Limite de registros em cada página
    const limit = 40;
    // Variável com o número da última página
    var lastPage = 1;

    // Contar a quantidade de registro no banco de dados
    const countUser = await db.users.count();

    // Acessa o IF quando encontrar registro no banco de dados
    if (countUser !== 0) {
        // Calcular a última página
        lastPage = Math.ceil(countUser / limit);
    } else {
        // Pausar o processamento, carregar a view, carregar o layout main, indicar qual item de menu deve ficar ativo, enviar mensagem de erro
        return res.render("admin/users/list", { layout: 'main', profile: req.user.dataValues, sidebarUsers: true, danger_msg: 'Erro: Nenhum usuário encontrado!' });
    }

    // Recuperar todos os usuário do banco de dados
    await db.users.findAll({
        // Indicar quais colunas recuperar
        attributes: ['id', 'name', 'email'],
        // Ordenar os registros pela coluna id na forma decrescente
        order: [['id', 'DESC']],
        // Calcular a partir de qual registro deve retornar e o limite de registros
        // console.log((page * limit) - limit); // 2 * 4 = 8 //page 1: 1,2,3,4 - page 2: 5,6,7,8
        offset: Number((page * limit) - limit),
        limit: limit
    }).then((users) => {
        // Acessa o IF quando retornar registro do banco de dados
        // 3 + 1 > 4
        // console.log(((Number(page) + Number(1)) > Number(lastPage)) ? false : Number(page) + Number(1));
        // 3 - 1 
        //console.log(((Number(page) - Number(1)) >= 1 ) ? Number(page) - Number(1) : false);
        if (users.length !== 0) {
            // Criar objeto com as informações para paginação
            var pagination = {
                // Caminho
                path: '/users',
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
            res.render("admin/users/list", { layout: 'main' , profile: req.user.dataValues, sidebarUsers: true, users: users.map(id => id.toJSON()), pagination });
        } else {
            // Pausar o processamento, carregar a view, carregar o layout main, indicar qual item de menu deve ficar ativo, enviar mensagem de erro
            res.render("admin/users/list", { layout: 'main', profile: req.user.dataValues, sidebarUsers: true, danger_msg: 'Erro: Nenhum usuário encontrado!' });
        }

    }).catch(() => {
        // Pausar o processamento, carregar a view, carregar o layout main, indicar qual item de menu deve ficar ativo, enviar mensagem de erro
        res.render("admin/users/list", { layout: 'main', profile: req.user.dataValues, sidebarUsers: true, danger_msg: 'Erro: Nenhum usuário encontrado!' });
    })
});

// Criar a rota para página visualizar os detalhes do registro
router.get('/view/:id',eAdmin, async (req, res) => {

    // Receber o id enviado na URL
    const { id } = req.params;

    // Recuperar o registro do banco de dados
    const user = await db.users.findOne({
        // Indicar quais colunas recuperar
        attributes: ['id', 'name', 'email', 'image', 'situationId', 'createdAt', 'updatedAt'],
        // Acrescentado condição para indicar qual registro deve ser retornado do banco de dados
        where: {
            id
        },
        // Buscar dados na tabela secundária
        include: [{
            model: db.situations,
            attributes: ['nameSituation']
        }]
    });

    // Acessa o IF se encontrar o registro no banco de dados
    if (user) {
        res.render("admin/users/view", { layout: 'main', profile: req.user.dataValues, sidebarUsers: true, user });
    } else {
        // Criar a mensagem de erro
        req.flash("danger_msg", "Erro: Usuário não encontrado!");
        // Redirecionar o usuário
        res.redirect('/users');
    }
});

// Criar a rota para página com formulário cadastrar usuário
router.get('/add',eAdmin, async (req, res) => {

    // Enviar dados para o formulário
    var dataForm = [];

    // Recuperar as situações do banco de dados
    const situations = await db.situations.findAll({
        // Indicar quais colunas recuperar
        attributes: ['id', 'nameSituation'],

        // Ordenar os registros pela coluna nameSituation na forma crescente
        order: [['nameSituation', 'ASC']]
    });

    // Acessa o IF quando encontrar situações no banco de dados e atribui para variável enviar dados para o formulário
    if(situations){
        dataForm['situations'] = situations;
    }

    // Pausar o processamento, carregar a view, carregar o layout main, indicar qual item de menu deve ficar ativo
    res.render('admin/users/add', { layout: 'main', profile: req.user.dataValues, data: dataForm, sidebarUsers: true });

});

// Criar a rota para receber os dados do formulário cadastrar usuário
router.post('/add', eAdmin, async (req, res) => {

    // Receber os dados do formulário
    var data = req.body;

    // Início enviar dados para o formulário
    // Enviar dados para o formulário
    var dataForm = req.body;
    var password = dataForm['password'];

    // Recuperar as situações do banco de dados
    const situations = await db.situations.findAll({
        // Indicar quais colunas recuperar
        attributes: ['id', 'nameSituation'],

        // Ordenar os registros pela coluna nameSituation na forma crescente
        order: [['nameSituation', 'ASC']]
    });

    // Acessa o IF quando encontrar situações no banco de dados e atribui para variável enviar dados para o formulário
    if(situations){
        dataForm['situations'] = situations;
    }

    // Recuperar a situação do banco de dados
    const situation = await db.situations.findOne({
        // Indicar quais colunas recuperar
        attributes: ['id', 'nameSituation'],

        // Acrescentado condição para indicar qual registro deve ser retornado do banco de dados
        where: {
            id: data.situationId
        },

        // Ordenar os registros pela coluna nameSituation na forma crescente
        order: [['nameSituation', 'ASC']]
    });

    // Acessa o IF quando encontrar a situação selecionada pelo usuário no formulário no banco de dados e atribui para variável enviar dados para o formulário
    if(situation){
        dataForm['situation'] = situation;
    }
    // Fim enviar dados para o formulário

    // Validar os campos utilizando o yup
    const schema = yup.object().shape({
        situationId: yup.string("Erro: Necessário preencher o campo situação!")
            .required("Erro: Necessário preencher o campo situação!"),
        password: yup.string("Erro: Necessário preencher o campo senha!")
            .required("Erro: Necessário preencher o campo senha!")
            .min(6, "Erro: A senha deve ter no mínimo 6 caracteres!"),
        email: yup.string("Erro: Necessário preencher o campo e-mail!")
            .required("Erro: Necessário preencher o campo e-mail!")
            .email("Erro: Necessário preencher e-mail válido!"),
        name: yup.string("Erro: Necessário preencher o campo nome!")
            .required("Erro: Necessário preencher o campo nome!")
    });

    // Verificar se todos os campos passaram pela validação
    try {
        await schema.validate(data);
    } catch (error) {
        // Pausar o processamento e carregar a view enviando os dados que o usuário havia preenchido no formulário
        return res.render("admin/users/add", { layout: 'main', profile: req.user.dataValues, sidebarUsers: true, data: dataForm, danger_msg: error.errors });
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
        return res.render("admin/users/add", { layout: 'main', profile: req.user.dataValues, sidebarUsers: true, data: dataForm, danger_msg: "Erro: Este e-mail já está cadastrado!" });
    }

    //Criptografar a senha
    data.password = await bcrypt.hash(data.password, 8);

    // Cadastrar no banco de dados
    db.users.create(data).then((dataUser) => {
        
        // Criar a mensagem de usuário cadastrado com sucesso
        req.flash("success_msg", "Usuário cadastrado com sucesso.!");
        // Redirecionar o usuário após cadastrar 
        //res.redirect('/users?page=1');

        // Redirecionar o usuário após cadastrar para a página visualizar
        res.redirect('/users/view/' + dataUser.id);

    }).catch(() => {
        // Pausar o processamento e carregar a view enviando os dados que o usuário havia preenchido no formulário
        dataForm['password'] = password;
        return res.render("admin/users/add", { layout: 'main', profile: req.user.dataValues, sidebarUsers: true, data: dataForm, danger_msg: "Erro: Usuário não cadastrado com sucesso!" });
    });

});

router.get('/edit/:id',eAdmin, async (req, res) => {

    //Receber o id enviado na URL
    const { id } = req.params;

    //Recuperar o registro do BD
   const user = await db.users.findOne({
        //Indicar quais colunas recuperar
        attributes: ['id', 'name', 'email', 'situationId'],
        //Condição para indicar qual coluna retornar do BD
        where:{
            id
        },
        //Buscar dados na tabela secundária
        include:[{
            model: db.situations,
            attributes: ['id', 'nameSituation']
        }]
    });
    //Acessa o IF se encontrar o registro no BD
    if (user) {

        var dataForm = user.dataValues;
        //Recuperar as situações do BD
        const situations = await db.situations.findAll({
            attributes: ['id', 'nameSituation'],
            order:[['nameSituation', 'ASC']]
        });
        //Acessa o if quando encontrar situações no BD e atribui para varíavel enviar dados para o formulario
        if(situations){
            dataForm['situations'] = situations;
        }
        res.render('admin/users/edit', {layout: 'main', profile: req.user.dataValues, data: dataForm, sidebarUsers: true})
    } else {
        //Criar a mensagem de erro
        req.flash("danger_msg", "Erro: usuário não encontrado");
        res.redirect('/users?page=1');
    }
});

router.post('/edit', eAdmin, async (req, res) => {
    //Receber os dados do formulário
    var data = req.body;

    // Início enviar dados para o formulário
    // Enviar dados para o formulário
    var dataForm = req.body;
    
    // Recuperar as situações do banco de dados
    const situations = await db.situations.findAll({
        // Indicar quais colunas recuperar
        attributes: ['id', 'nameSituation'],

        // Ordenar os registros pela coluna nameSituation na forma crescente
        order: [['nameSituation', 'ASC']]
    });

    // Acessa o IF quando encontrar situações no banco de dados e atribui para variável enviar dados para o formulário
    if(situations){
        dataForm['situations'] = situations;
    }
    
    // Recuperar a situação do banco de dados
    const situation = await db.situations.findOne({
        // Indicar quais colunas recuperar
        attributes: ['id', 'nameSituation'],

        // Acrescentado condição para indicar qual registro deve ser retornado do banco de dados
        where: {
            id: data.situationId
        },

        // Ordenar os registros pela coluna nameSituation na forma crescente
        order: [['nameSituation', 'ASC']]
    });
    
    // Acessa o IF quando encontrar a situação selecionada pelo usuário no formulário no banco de dados e atribui para variável enviar dados para o formulário
    if(situation){
        dataForm['situation'] = situation;
    }
    // Fim enviar dados para o formulário
     // Validar os campos utilizando o yup
     const schema = yup.object().shape({
      id: yup.string("Erro: Preenchimento incorreto do formulário entre em contado com a administração !")
        .required("Erro: Preenchimento incorreto do formulário entre em contado com a administração !"),
        situationId: yup.string("Erro: Necessário preencher o campo situação!")
            .required("Erro: Necessário preencher o campo situação!"),
        email: yup.string("Erro: Necessário preencher o campo e-mail!")
            .required("Erro: Necessário preencher o campo e-mail!")
            .email("Erro: Necessário preencher e-mail válido!"),
        name: yup.string("Erro: Necessário preencher o campo nome!")
            .required("Erro: Necessário preencher o campo nome!")
    });

    // Verificar se todos os campos passaram pela validação
    try {
        await schema.validate(data);
    } catch (error) {
        // Pausar o processamento e carregar a view enviando os dados que o usuário havia preenchido no formulário
        return res.render("admin/users/edit", { layout: 'main', profile: req.user.dataValues, sidebarUsers: true, data: dataForm, danger_msg: error.errors });
    }
    // Recuperar o registro do banco de dados
    const user = await db.users.findOne({
        // Indicar quais colunas recuperar
        attributes: ['id', 'email'],
        // Acrescentado condição para indicar qual registro deve ser retornado do banco de dados
        where: {
            email: data.email,
            id:{
                // operador de negação para ignorar o registro do usuário que está sendo editado
                [Op.ne]: data.id
            }
        }
    });

    // Acessa o IF se encontrar o registro no banco de dados
    if (user) {
        // Pausar o processamento e carregar a view enviando os dados que o usuário havia preenchido no formulário
        return res.render("admin/users/edit", { layout: 'main', profile: req.user.dataValues, sidebarUsers: true, data: dataForm, danger_msg: "Erro: Este e-mail já está cadastrado!" });
    }
    
    //Editar no BD
    db.users.update(data, { where: {id: data.id} }).then(() => {
        req.flash("success_msg", "Usuario cadastrado com sucesso!");
        res.redirect('/users/view/' + data.id);
    }).catch(() => {
        
    res.render('admin/users/edit', {layout: 'main', profile: req.user.dataValues, data: dataForm, sidebarUsers: true})
    })


});

//Criar rota para pagina com formulário editar senha
router.get('/edit-password/:id', eAdmin, async (req, res) => {

    //Receber id enviado na URL
    const {id} = req.params;
    //Recuperar registro no BD
    const user = await db.users.findOne({
        //indicar quais registros recuperar
        attributes:['id'],

        where:{
        id
        },
    });
    //Acessa o IF se encontrar o registro no BD
    if(user) {
        var dataForm = user.dataValues;
           // Pausar o processamento, carregar a view, carregar o layout main, indicar qual item de menu deve ficar ativo
           res.render('admin/users/edit-password', { layout: 'main', profile: req.user.dataValues, data: dataForm, sidebarUsers: true });
    }else{

        req.flash("danger_msg", "Erro: Usuário não encontrado!");
        res.redirect('/users?page=1');
    }
});

//Criar rota para receber os dados do formulário editar senha
router.post('/edit-password', eAdmin, async (req, res) => {
    //Receber dados do formulário
    var data = req.body;
    
    //enviar dados para o formulário
    var dataForm = req.body;
    var password = data['password'];

    //Valida os campos utilizados
    const schema = yup.object().shape({
        id: yup.string("Erro: Preenchimento incorreto do formulario!")
        .required("Erro: Preenchimento incorreto do formulario!"),
        password: yup.string("Erro: Necessário preencher o campo senha!")
        .required("Erro: Necessário preencher o campo senha!")
        .min(6, "Erro: A senha deve ter no mínimo 6 caracteres!")
    });

    // Verificar se todos os campos passaram pela validação
    try {
        await schema.validate(data);
    } catch (error) {
        // Pausar o processamento e carregar a view enviando os dados que o usuário havia preenchido no formulário
        dataForm['password'] = password;
        return res.render("admin/users/edit-password", { layout: 'main', profile: req.user.dataValues, sidebarUsers: true, data: dataForm, danger_msg: error.errors });
    }
    //Criptografar a senha
    
    //Editar senha no BD
    //Criptografar a senha
   data.password= await bcrypt.hash(data.password, 8);

    // Editar o registro no banco de dados
   db.users.update ( data, {where: { id: data.id }}).then(() => {
        // Criar a mensagem de sucesso
        req.flash('success_msg', "Senha editada com sucesso!");
        // Redirecionar o usuário
        res.redirect('/users/view/' + data.id);
    }).catch(() => {
        // Pausar o processamento e carregar a view enviando os dados que o usuário havia preenchido no formulário
        res.render('admin/users/edit-password', {layout: 'main', profile: req.user.dataValues, data: dataForm, sidebarUsers: true, danger_msg:"Senha não editada com sucesso!"});
    });

});
//Criar a rota para pagina com formulário editar imagem
router.get('/edit-image/:id', eAdmin, async(req, res) => {
    //Receber o ID enviado na URL
    const {id} = req.params;

    //Recuperar o registro do BD
    const user = await db.users.findOne({
        //Indicar quais colunas recuperar
        attributes:['id', ['image','imageOld']],
        where:{
            id
        }
    });
    //Acessa o if se encontrar o registro no BD
    if(user){
        //Enviar dados para o formulário
        var dataForm = user.dataValues;

        res.render('admin/users/edit-image', {layout: 'main', profile: req.user.dataValues, profile: req.user.dataValues, data: dataForm, sidebarUsers:true});
    }else{
        req.flash("danger_msg", "Erro: Usuário não encontrado!");
        res.redirect('/users?page=1');
    }
    console.log(user);
    
});

router.post('/edit-image', eAdmin, upload.single('image'), async (req, res) =>{
    //Receber dados do formulario
    var data = req.body;
   //Enviar dados para o formulario
   var dataForm = req.body;

//Acessa o if quando a extensão da imagem é valida
if (!req.file){
   return res.render('admin/users/edit-image', {layout: 'main', profile: req.user.dataValues , profile: req.user.dataValues, data: dataForm, sidebarUsers: true, danger_msg:"Erro: Selecione uma imagem válida!"});
}
  
    //Recuperar o registro do BD
    const user = await db.users.findOne({
        //indicar quais colunas recuperar
        attributes:['id', 'image'],
        //acresentar condição para indicar qual registro deve ser retornado do BD
        where:{
            id: data.id

        }
    });

    // Verificar se o usuário tem imagem salva no banco de dados
    if (user.dataValues.image) {
        // Criar o caminho da imagem que o ussuário tem no banco de dados
        var imgOld = "./public/images/users/" + user.dataValues.image;

        // fs.access usado para testar as permissões do arquivo
        fs.access(imgOld, (err) => {
            // Acessa o IF quando não tiver nenhum erro
            if (!err) {
                // Apagar a imagem antiga
                fs.unlink(imgOld, () => { })
            }
        });
    }
    
        //Editar no BD
        db.users.update({ image: req.file.filename}, {where: {id: data.id}
    }).then(() =>{

        req.flash("success_msg", "Imagem editada com sucesso!");
        res.redirect('/users/view/' + data.id)

   }).catch(() => {
        res.render('admin/users/edit-image', {layout: 'main', profile: req.user.dataValues, data:dataForm, sidebarUsers: true, danger_msg:"Erro Imagem não editada com sucesso"});
   });
});


router.get('/delete/:id', async (req, res) => {
    //Recuperar o registro do BD
    const user = await db.users.findOne({
        //indicar quais colunas recuperar
        attributes:['id', 'image'],
        //acresentar condição para indicar qual registro deve ser retornado do BD
        where:{
            id: req.params.id

        }
    });
    // Verificar se o usuário tem imagem salva no banco de dados
    if (user.dataValues.image) {
        // Criar o caminho da imagem que o usuário tem no banco de dados
        var imgOld = "./public/images/users/" + user.dataValues.image;

        // fs.access usado para testar as permissões do arquivo
        fs.access(imgOld, (err) => {
            // Acessa o IF quando não tiver nenhum erro
            if (!err) {
                // Apagar a imagem antiga
                fs.unlink(imgOld, () => { })
            }
        });
    }
    
    //Apagar usuário no BD utilizando a MODELS users
    db.users.destroy({
        where: {
        id: req.params.id
        }
    }).then(() => {
        req.flash("success_msg", "Usuário apagado com sucesso!");
        res.redirect('/users?page=1');
    }).catch(() => {
        req.flash("danger_msg", "Usuário não apagado com sucesso!");
        res.redirect('/users/view/' + req.params.id);
    })
});


// Exportar a instrução que está dentro da constante router 
module.exports = router;
