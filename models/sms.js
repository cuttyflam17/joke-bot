var config = require('../config.js');
var request=require("request");

module.exports=function(message, chatId, ip, token, callback) {
	var typingData = function(type) {
		return {
			url: config.url + '/chats/' + chatId + type,
			method: 'GET',
			headers:{
				'X-Namba-Auth-Token': token
			},
		}
	}
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

	request(typingData('/typing'), function() {
		request(data, function() {
			request(typingData('/stoptyping'), callback);
		});
	})
};234
 664