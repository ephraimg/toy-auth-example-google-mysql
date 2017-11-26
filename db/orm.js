require('./database-mysql.js');
const authConfig = require('../auth-config.js');
const Sequelize = require('sequelize');

const database = 'TOY_AUTH_EXAMPLES';

// connect sequelize to the database
let db = new Sequelize(database,
  authConfig.MYSQL_USER,
  authConfig.MYSQL_PASSWORD,
  {
    host: 'localhost',
    dialect: 'mysql'
  }
); 

// then check if the connection is working
db.authenticate()
  .then(() => console.log(`Sequelize: Connected to ${database}`))
  .catch(err => console.error(`Sequelize: Failed to connect to ${database}:`, err));


const Users = db.define('Users', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: Sequelize.STRING,
  email: Sequelize.STRING,
  about_me: Sequelize.TEXT, // eslint-disable-line camelcase
  pic: Sequelize.STRING,
  // below fields for auth
  google_name: Sequelize.STRING, // eslint-disable-line camelcase
  google_id: { // eslint-disable-line camelcase
    type: Sequelize.STRING,
    unique: true
  }, 
  google_avatar: Sequelize.STRING // eslint-disable-line camelcase
});

Users.sync();




// const findGoogleUser = function(googleId) {
//   // return db.queryAsync(`SELECT * FROM users WHERE googleId = ?`, googleId);
//   return Users.findOne({google_id: googleId})
// }

// const saveGoogleUser = function(googleProfile, callback) {
//   return db.queryAsync(
//     `INSERT INTO users SET googleId = ?, username = ?, googleAvatar = ?`,
//     [googleProfile.id, googleProfile.name.givenName, googleProfile.photos[0].value]
//   ) 
//   .then(success => {
//     return findGoogleUser(googleProfile.id);    
//   })
//   .catch(err => console.log('Error saving user: ', err));
// };


const saveGoogleUser = function(googleProfile) {
  return Users.create({
    google_id: googleProfile.id,
    google_name: googleProfile.name.givenName,
    google_avatar: googleProfile.photos[0].value
  })
  .catch(err => console.log('Error saving user: ', err));
};

module.exports.Users = Users;
module.exports.saveGoogleUser = saveGoogleUser;