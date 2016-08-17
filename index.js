var memeGenerator = require("./meme-gen.js");
var vkToken = require('vk-token');
var credentials = require("./auth.json");
var env = process.env;
var login = env.BOT_LOGIN || credentials.login;
var pass = env.BOT_PASS || credentials.password;
var vk = new(require("vk-io"));

var commands = [];

var botName = "дрюс";

var fs = require("fs");

vkToken.getAccessToken(login, pass, function(error, token) {
    vk.setToken(token);
    vk.longpoll().then(function() {
            console.log('Longpoll ready!');
        })
        .catch(function(error) {
            console.error(error);
        });
});

vk.on('message', function(msg) {
    if (msg.text.toLowerCase().match(botName)) {
        var ready = false;
        for (var i = 0; !ready && i < commands.length ; i += 2) {
            commands[i].split(' ').forEach((item) => {
                if (msg.text.toLowerCase().match(item)) {
                    commands[i + 1](msg);
                    ready = true;
                }
            });
        }
    }
    console.log('Got message:', msg.text);
});

function addCommand(command, callback){
	commands.push(command, callback);
}

try {
    var tempdir = fs.statSync("temp");
    if (!tempdir.isDirectory()) {
        fs.mkdir("temp");
    }
} catch (e) {
    fs.mkdir("temp");
}

//vkBot.authBot();
memeGenerator.init();

addCommand('мем', function(message) {
	var reply = message;
	var msg = message.text;
	var params = msg.split(' ');
	var memeName = params[2];
	var font = params[3];
	var re = /\(([^)]+)\)/g;
	var found = msg.match(re);
	var upper = ""+found[0];
	var lower = ""+found[1];
	memeGenerator.makeMeme(memeName, font, upper.substring(1, upper.length - 1), lower.substring(1, lower.length-1), function(err, image){
		if (err){
			message.send(err);
			return;
		}
		var path = "./temp/"+Date.now()+".png";
		image.write(path, function(err, image){
			if (!err){
				vk.upload.album({
					album_id: 234680370,
					file: path
				}).then((images) => images[0]).then((image) => {
					message.send({attach: 'photo' + image.owner_id + "_" + image.id});
					fs.unlink(path);
				});
			} else {
				vkBot.sendMessage("oshibka", {attachMessage: false}, reply);
				console.log(err);
			}
		});
	});
});

addCommand('рефреш', function (msg){
	memeGenerator.init();
	msg.send("20 sec, pls");			
});

addCommand('список', function (msg){
	var memes = memeGenerator.listMemes().files;
	var listMemes = "Memes: \n";
	for (var i = 0; i < memes.length; i++){
		listMemes = listMemes + "&#8194;&#8194;&#8194;&#8194;" + memes[i] +"\n";
	}

	var fonts = memeGenerator.listFonts().files;
	var listFonts = "Fonts (sizes 8, 16 ... 64): \n";
	for (var i = 0; i < fonts.length; i++){
		listFonts = listFonts + "&#8194;&#8194;&#8194;&#8194;" + fonts[i] +"\n";
	}
	msg.send(listMemes+listFonts);
});
