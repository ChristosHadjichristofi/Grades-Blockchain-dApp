const Sequelize = require('sequelize');
require('dotenv').config();

sequelize = new Sequelize(process.env.DB, process.env.DB_USER, process.env.DB_PASS, {
    dialect: 'mysql',
    host: process.env.DB_HOST,
    port: process.env.DB_PORT
});

sequelize.authenticate()
.then(() => {
    console.log("Success connecting to database!");    
})
.catch(err => {
    console.error("Unable to connect to the database", err);
})

module.exports = sequelize;