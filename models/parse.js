var cheerio = require("cheerio");
var request = require("request");
var he = require("he");
var utf8 = require("utf8")

exports.getRandomJoke = function(callback) {

	request("http://online-generators.ru/jokes",function(err, res, page) {
		var $ = cheerio.load(page);
		var text = $("div[class='joke-text']").text();
		callback(text);
	})
}

exports.getJokes = function(callback) {
	request("https://www.anekdot.ru/random/anekdot/",function(err, res, page) {
		var $ = cheerio.load(page);
		var text = [];
	    $("div[class='topicbox']").each(function(idx, e) {
	    	if($(e).children("div[class='text']") != null) {
	    	text.push(he.decode($(e).children("div[class='text']").html()).replace("<br>","\n"));
	 }
	    })
	    callback(text);
	})
}
