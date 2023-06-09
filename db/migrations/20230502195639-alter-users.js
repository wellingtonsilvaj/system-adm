'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
  return queryInterface.sequelize.transaction( t => {
    return Promise.all([
      queryInterface.addColumn('users', 'situationId', {
        type: Sequelize.DataTypes.INTEGER,
        defaultValue:2,
        after:"image",
        references: {model: 'situations', key: 'id'}
      }, {transaction: t})
    ]);
  });
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.removeColumn('users', 'situationId', { transaction: t})
      ]);
    });
  }
};
