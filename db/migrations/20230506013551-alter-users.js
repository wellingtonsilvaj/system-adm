'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction( t => {
      return Promise.all([
        queryInterface.addColumn('users', 'recoverPassword', {
          type: Sequelize.DataTypes.STRING,
          after:"password"
        }, {transaction: t})
      ]);
    });
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.removeColumn('users', 'recoverPassword', { transaction: t})
      ]);
    });
  }
};
