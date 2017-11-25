const Promise = require('bluebird');
const mysql = require('mysql');
const authConfig = require('../auth-config.js');
const database = 'TOY_AUTH_EXAMPLES';

const connection = mysql.createConnection({
  user: authConfig.MYSQL_USER,
  password: authConfig.MYSQL_PASSWORD
});

const db = Promise.promisifyAll(connection);

connection.connectAsync()
  .then(() => console.log(`Connected to mySQL`))
  .then(() => db.queryAsync(`DROP DATABASE IF EXISTS ${database}`))
  .then(() => db.queryAsync(`CREATE DATABASE ${database}`))
  .then(() => db.queryAsync(`USE ${database}`))
  .then(() => console.log(`Using new database ${database}`))
  .then(() => { return db.queryAsync(`
    CREATE TABLE IF NOT EXISTS users (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) NULL UNIQUE DEFAULT NULL,
      googleId VARCHAR(255) NULL UNIQUE DEFAULT NULL,
      googleAvatar VARCHAR(255) NULL UNIQUE DEFAULT NULL
    );`);
  });

const findGoogleUser = function(googleId) {
  return db.queryAsync(`SELECT * FROM users WHERE googleId = ?`, googleId);
}

const saveGoogleUser = function(googleProfile, callback) {
  return db.queryAsync(
    `INSERT INTO users SET googleId = ?, username = ?, googleAvatar = ?`,
    [googleProfile.id, googleProfile.name.givenName, googleProfile.photos[0].value]
  ) 
  .then(success => {
    return findGoogleUser(googleProfile.id);    
  })
  .catch(err => console.log('Error saving user: ', err));
};

module.exports.findGoogleUser = findGoogleUser;
module.exports.saveGoogleUser = saveGoogleUser;

