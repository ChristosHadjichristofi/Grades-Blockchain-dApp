var DataTypes = require("sequelize").DataTypes;
var _courses = require("./courses");
var _permissions = require("./permissions");
var _users = require("./users");

function initModels(sequelize) {
  var courses = _courses(sequelize, DataTypes);
  var permissions = _permissions(sequelize, DataTypes);
  var users = _users(sequelize, DataTypes);

  courses.belongsTo(users, { foreignKey: "users_id"});
  users.hasMany(courses, { foreignKey: "users_id"});
  permissions.belongsTo(users, { foreignKey: "users_id"});
  users.hasOne(permissions, { foreignKey: "users_id"});

  return {
    courses,
    permissions,
    users,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
