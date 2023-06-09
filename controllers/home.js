// Incluir as bibliotecas
// Gerencia as requisições, rotas e URLs, entre outra funcionalidades
const express = require('express');
// Utilizado para manipular as rotas da aplicação
const router = express.Router();

// Criar a rota da página inicial
router.get('/', (req, res) => {
    res.send("Página inicial!");
});

// Exportar a instrução que está dentro da constante router 
module.exports = router;
