const multer = require('multer');

//o módulo path permite interagir com o sistema de arquivos
const path = require('path');

//realizar o upload do usuário
module.exports = (multer({
    //diskStorage permite manipular locar para salvar a imagem
    storage: multer.diskStorage({
        //local para salvar a imagem
        destination: (req, file, cb) => {
            cb(null, './public/images/users');
        },
        filename:function (req, file, cb){
           // console.log(Date.now().toString() + req.user.dataValues.id + path.extname(file.originalname));
        cb(null, Date.now().toString() + req.user.dataValues.id + path.extname(file.originalname));
}
}),
    //validar a extensão do arquivo
    fileFilter:(req, file, cb) => {
        //verificar se a extensão da imagem enviada pelo usuario está no array de extensões
        const extensaoImg =['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp' ].find
        (FormatoAceito => FormatoAceito == file.mimetype);

        //Retornar true quando a extensão da imagem é válida
        if(extensaoImg){
            return cb(null, true);
        }
        return cb(null, false);
    }
}));