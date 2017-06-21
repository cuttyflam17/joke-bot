"use stricts";
var express = require('express');
var db = require("../data/db.js");
var sms = require("../models/sms.js");
var newChat = require("../models/newchat.js");
var parse = require("../models/parse.js");
var async = require('async');
var router = express.Router();
var token = '';
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post("/", function(req, res, next) {
  token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6NjM4ODMwNDI3LCJwaG9uZSI6IjEyMzQ1NjYiLCJwYXNzd29yZCI6IiQyYSQxMCRmR3hYOWIxckttcDU3MFA0NTlFOXN1TXA5Tkl0dExHSFNpZFJQaUQ0eURXREUvSnFrcFBGZSIsImlzQm90Ijp0cnVlLCJjb3VudHJ5Ijp0cnVlLCJpYXQiOjE0ODk2NjI3MDJ9.Q7wm4abkxlZjSV7isEDgZCqjzqnbiFbC4y8ikkF0VUs';
  eventControl(req, res, token);
})

router.post('/kz', function(req, res, next) {
  token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6MjUwMTQ4MDczLCJwaG9uZSI6IjU0NDA0IiwicGFzc3dvcmQiOiIkMmEkMTAkQzN3alFsUnIxYVBOaWRMWElUVEk4T2hjTnI1TTJuOVpRcmdtZndINmN2SnVhLnA2bVNNOGkiLCJpc0JvdCI6dHJ1ZSwiY291bnRyeSI6dHJ1ZSwiaWF0IjoxNDk4MDI3Njc3fQ.ZrBcJyPkMo9AKwAY7cIMR0XETlQ7wFUli1QiW0d8zKs';
  eventControl(req, res, token);
})

var eventControl = function(req, res, token) {
  var ip = req.connection.remoteAddress;
    var event = req.body.event;
    var commandMessage = function(user) {
      return " Введите нужную цифру:\n1⃣Получить случайный анекдот.\n2⃣Получить 10 случайных анекдотов.\n3⃣"+(user.state ? "Отключить" : "Включить")+" ежедневную рассылку.";
    }
    if(event == "user/unfollow") {
      let userId = req.body.data.id;
      db.destroy({where:{userId: userId, ip: ip}}).then(function(err) {
        console.log("db destroyed");
      });
    }
    if(event == "user/follow") {
      let userId = req.body.data.id;
      db.create({userId: userId, ip: ip}).then(function(user) {
        console.log("user follows");
        newChat(userId, ip, function(err, res, body) {
          let chatId = body.data.id;
          let message = "Здравствуйте!Я буду присылать вам самые свежие анекдоты." + commandMessage(user);
          sms(message, chatId, ip, token);
        })
      });
    }
    if(event == "message/new") {
      var userId = req.body.data.sender_id;
      db.find({where: {userId: userId, ip: ip}})
      .then(function(user) {
        var errMessage = "Некорректный ввод." + commandMessage(user);
        var content = req.body.data.content;
        var chatId = req.body.data.chat_id;
        if(req.body.data.type != 'text/plain') {
          console.log(errMessage);
          sms(errMessage, chatId, ip, token);
          return;
        }
        
        if(content == "1") {
         parse.getRandomJoke(function(result) {
          console.log(result);
          sms(result, chatId, ip, token, function() {
             setTimeout(function() {
                sms("Хотите ли еще получить свежий анекдот?"+commandMessage(user), chatId, ip, token);
              }, 1000);
          });
         })
        }
        else if(content == "2") {
          parse.getJokes(function(result) {
            sms(result, chatId, ip, function() {
              setTimeout(function() {
                sms("Хотите ли еще получить свежий анекдот?"+commandMessage(user), chatId, ip, token);
              }, 1000);
            })
          })
        }
        else if(content == "3") {
          db.find({where: {userId: userId, ip: ip}})
          .then(function(user) {
            if(user.state) {
              db.update({state: false}, {where: {userId: userId, ip: ip}}).then(function(user) {
                let message = "Вы отключили ежедневную рассылку."+commandMessage(user);
                sms(message, chatId, ip, token);    
              })
            } else {
              db.update({state: true}, {where: {userId: userId, ip: ip}}).then(function(user) {
                let message = "Вы включили ежедневную рассылку."+commandMessage(user);
                sms(message, chatId, ip, token);
              })
            }
          })
        }
        else {
          console.log(errMessage);
          sms(errMessage, chatId, ip, token);
        }
     })
    }
  res.end();
}
module.exports = router;
