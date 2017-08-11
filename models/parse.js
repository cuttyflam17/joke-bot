var cheerio = require("cheerio");
var request = require("request");
var he = require("he");
var utf8 = require("utf8")
exports.getRandomJoke = function(callback) {

  request({method: 'GET', url: "http://online-generators.ru/jokes", headers: {cookie: 'beget=begetok'}},function(err, res, page) {
    var $ = cheerio.load(page);
    var text = $("div[class='joke-text']").text();
    callback(text);
  })
}

exports.getJokes = function(callback) {
  request("https://www.anekdot.ru/random/anekdot/", function(err, res, page) {
    var $ = cheerio.load(page);
    var text = '';
    $("div[class='topicbox']").each(function(idx, e) {
      if(idx === 10) {
        return false;
      }
      if($(e).children("div[class='text']").html() != null) {
      text = text + he.decode($(e).children("div[class='text']").html()).split("<br>").join("\n")+"\n\n";
      }
    })
    callback(text.trim());
  })
}