const { Sequelize} = require('sequelize');

const sequelize = new Sequelize('expressDataSet', 'username', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
  });

try {
    sequelize.authenticate();
   console.log('Connection has been established successfully.');
 } catch (error) {
   console.error('Unable to connect to the database:', error);
 }

 module.exports = sequelize;