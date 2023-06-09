//Normatizar o cód, ajuda a evitar gabiarras
'use strict';
//Incluir bibliotecas
//sequelize é utilizado para gerenciar bd
const {Model} = require('sequelize');
//Exportar a instrução que está dentro da função
module.exports = (sequelize, DataTypes) => {
  class situations extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      situations.hasMany(models.users, { foreignKey: 'situationId'});
    }
  }
  situations.init({
    nameSituation: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'situations',
  });
  return situations;
};