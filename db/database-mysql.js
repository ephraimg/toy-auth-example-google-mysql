const Promise = require('bluebird');
const mysql = require('mysql');
const Sequelize = require('sequelize');
const authConfig = require('../auth-config.js');

const database = 'TOY_AUTH_EXAMPLES';

const connection = mysql.createConnection({
  user: authConfig.MYSQL_USER,
  password: authConfig.MYSQL_PASSWORD
});

const sql = Promise.promisifyAll(connection);

sql.connectAsync()
  .then(() => console.log(`Connected to mySQL`))
  .then(() => sql.queryAsync(`CREATE DATABASE ${database}`))
  .catch(err => {}) // ignore error caused when db already exists
  .then(() => sql.queryAsync(`USE ${database}`))
  .then(() => console.log(`Using new database ${database}`));



