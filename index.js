var memeGenerator = require("./meme-gen.js");
var uploader = require("./uploader.js");
var vkWrap = require('./vkBot.js');
var credentials = require("./auth.json");
var env = process.env;
var login = BOT_LOGIN || credentials.login;
var pass = BOT_PASS || credentials.password;

var vkBot = new vkWrap(login, pass);
var fs = require("fs");

try {
	var tempdir = fs.statSync("temp");
	if (!tempdir.isDirectory()){
		fs.mkdir("temp");
	}
} catch (e){
	fs.mkdir("temp");
}

vkBot.authBot();
memeGenerator.init();

vkBot.addCommand('мем', () => {
	var reply = vkBot.bodyMsg;
	var msg = vkBot.bodyMsg.body;
	var params = msg.split(' ');
	var memeName = params[2];
	var font = params[3];
	var re = /\(([^)]+)\)/g;
	var found = msg.match(re);
	var upper = ""+found[0];
	var lower = ""+found[1];
	memeGenerator.makeMeme(memeName, font, upper.substring(1, upper.length - 1), lower.substring(1, lower.length-1), function(err, image){
		if (err){
			vkBot.sendMessage(err, {attachMessage: false});
			return;
		}
		var path = "./temp/"+Date.now()+".png";
		image.write(path, function(err, image){
			if (!err){
				//vkBot.sendMessage("YAY! " + path, {attachMessage: false});
				uploader.upload(path, vkBot.token, function (err, response){
					if (err){
						vkBot.sendMessage("oshibka", {attachMessage: false});
						vkBot.sendMessage(err, {attachMessage: false});
						console.log(err);
						return;
					}
					console.log("Sending message for ", reply);
					vkBot.sendMessage("", {attachMessage: false, attach:{photo: "photo" + response.response[0].owner_id + "_" + response.response[0].id}}, reply);
					fs.unlink(path);
				});
			} else {
				vkBot.sendMessage("oshibka", {attachMessage: false});
				console.log(err);
			}
		});
	});
	//console.log("msg", vkBot.bodyMsg);
});

vkBot.addCommand('рефреш', () => {
	memeGenerator.init();
	vkBot.sendMessage("20 sec, pls", {attachMessage: false});			
});