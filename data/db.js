var Sequelize = require("sequelize");
var sequelize = new Sequelize("botdb", "root", "root", {
	host: "localhost",
	dialect: "postgres"
});

var user = sequelize.define("user", {
	id: {
		type: Sequelize.INTEGER,
		autoIncrement: true,
		primaryKey: true
	},
	userId: Sequelize.INTEGER,
	ip: Sequelize.STRING,
	state: {
		type: Sequelize.BOOLEAN,
	    defaultValue: true
	},
	token: Sequelize.STRING
})

user.sync().then(function() {});



module.exports = user;
