var config = require('../config.js');
var request=require("request");

module.exports=function(message, chatId, ip, token, callback){
	var data={
	url: config.url + '/chats/' + chatId + "/write",
	method:"POST",
	headers:{
		'X-Namba-Auth-Token': token
	},
	body:{
		"type":"text/plain",
		"content":message
	},
	json: true
	}
	request(data,callback);
};