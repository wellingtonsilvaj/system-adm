//Normalizar o cod, ajuda a evitar gambiarras
'use strict';

//criptografar senha
const bcrypt = require('bcryptjs');

//Seeders para cadastrar registros na tabela 'users'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, ) {
    return queryInterface.bulkInsert('users',[{

      name: 'Wellington',
      email: 'wellington@wellington.com.br',
      situationId: 1,
      password: await bcrypt.hash('123457',8),
      createdAt: new Date(),
      updatedAt: new Date()
  },
{
  name: 'Jeane',
  email: 'jeane@jeane.com.br',
  situationId: 2,
  password: await bcrypt.hash('123456',8),
  createdAt: new Date(),
  updatedAt: new Date()
},
{
  name: 'dayane',
  email: 'dayane@dayane.com.br',
  situationId: 1,
  password: await bcrypt.hash('123457',8),
  createdAt: new Date(),
  updatedAt: new Date()
},
{
  name: 'manuel',
  email: 'manuel@manuel.com.br',
  situationId: 1,
  password: await bcrypt.hash('123457',8),
  createdAt: new Date(),
  updatedAt: new Date()
},
{
  name: 'jayene',
  email: 'jayene@jayane.com.br',
  situationId: 1,
  password: await bcrypt.hash('123457',8),
  createdAt: new Date(),
  updatedAt: new Date()
},
{
  name: 'Francisco',
  email: 'francisco@francisco.com.br',
  situationId: 1,
  password: await bcrypt.hash('123457',8),
  createdAt: new Date(),
  updatedAt: new Date()
},
{
  name: 'mathias',
  email: 'mathias@mathias.com.br',
  situationId: 1,
  password: await bcrypt.hash('123457',8),
  createdAt: new Date(),
  updatedAt: new Date()
},
{
  name: 'Genivaldo',
  email: 'genivaldo@genivaldo.com.br',
  situationId: 1,
  password: await bcrypt.hash('123457',8),
  createdAt: new Date(),
  updatedAt: new Date()
},
{
  name: 'heneias',
  email: 'heneias@heneias.com.br',
  situationId: 1,
  password: await bcrypt.hash('123457',8),
  createdAt: new Date(),
  updatedAt: new Date()
},
{
  name: 'Roberta',
  email: 'roberta@roberta.com.br',
  situationId: 1,
  password: await bcrypt.hash('123457',8),
  createdAt: new Date(),
  updatedAt: new Date()
}
]);
},

  async down () {

  }
};
