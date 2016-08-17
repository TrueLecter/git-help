var Jimp = require("jimp");
var createLayout = require('./wordwrap.js').createLayout;
var loadFont = require('load-bmfont');
var fs = require("fs");
var fonts = {}, memes = {};

function log(o){
	console.log(o);
}

function getJimpCallback(font, size){
	return function(err, fontr){
		if (err){
			font[size].success = false;
		}
		font[size].jimp = fontr;
	}
}

function getMemeCallback(memeName){
	return function(){
			var items = memes[memeName].images;
			return "memes/" + memeName + "/" + items[Math.floor(Math.random() * items.length)];
		};
}

function createFonts(dir){
	var font = new Object();
	var fontInfo = require(dir+"/font.json");
	
	font.name = fontInfo.name;
	font.fontpath = require(dir + "/" + font.name + ".json");

	font.sizes = [];

	for (var i = 0; i < fontInfo.sizes.length; i++){
		var size = fontInfo.sizes[i].size;
		font.sizes.push(size);
		font[size] = {};
		font[size].success = true;
		font[size].jimp = null;
		font[size].size = size;
		Jimp.loadFont(dir+"/"+fontInfo.sizes[i].filename, getJimpCallback(font, size));
	}

	font.getFontForSize = function(size){
		if (!size){
			size = 40;	
		}
		var i = font.sizes.length - 1;
		while (font.sizes[i] > size){
			i--;
		}
		return font[font.sizes[i]];
	}

	return font;
}

function listFonts(){
	var files = fs.readdirSync("fonts");
	fonts.files = files;
	for (var i = 0; i < fonts.files.length; i++){
		var fname = "fonts/" + fonts.files[i];
		var fstats = fs.statSync(fname);
		if (fstats.isDirectory()){
			fonts[fonts.files[i]] = createFonts("./" + fname);
		}
	}
}

function listMemes(){
	var files = fs.readdirSync("memes");
	memes.files = files;
	for (var i = 0; i < memes.files.length; i++){
		var dname = "memes/" + memes.files[i];
		var memeName = memes.files[i]; 
		memes[memeName] = {};
		memes[memeName].images = fs.readdirSync(dname);
		memes[memeName].getRandomImage = getMemeCallback(memeName);
	}
}

function calculateTextMetrics(font, text, maxWidth, maxHeight){
	var layout = createLayout(font.fontpath, font.size, maxWidth, text);
	return layout;
}

function drawText(image, font, metricsInfoFont, text, isUp){
	text = (text + "").toUpperCase(); 
	console.log("calculating metrics");
	var layout = calculateTextMetrics(metricsInfoFont, text, image.bitmap.width);
	// console.log("calculating line height");
	// var etalonMetrics = calculateTextMetrics(metricsInfoFont, "A");
	var offset = metricsInfoFont.size / 4;
	var height = (metricsInfoFont.size + offset) * layout.lines.length;

	//console.log("metrics: ", layout);
	console.log("offset: ", offset);
	console.log("height: ", height);
	
	for (var i = 0; i < layout.lines.length; i++){
		var line = layout.lines[i];
		var y = 0;
		if (isUp){
			y = (i * metricsInfoFont.size) - offset ;
		} else {
			y = (image.bitmap.height - height + i * (metricsInfoFont.size + offset) - image.bitmap.height / 50);
			console.log("down y: ", y);
		}
		image.print(font, (image.bitmap.width - line.width) / 2, y, text.substring(line.start, line.end));
	}

	//image.print(font, (image.bitmap.width - metrics.width) / 2, isUp ? -etalonMetrics.height / 4 : (image.bitmap.height - metrics.height - image.bitmap.height / 50), text);
}

function makeMeme(memeName, fontName, upperText, lowerText, callback){
	var meme = memes[memeName];
	if (!meme){
		callback("no such meme: " + memeName+"\n" + JSON.stringify(memes));
		return;
	}
	var fontInfo = fontName.split(":");
	var fontQ = fonts[fontInfo[0]];

	if (!fontQ){
		callback("no such font: " + fontInfo[0]);
		return
	}

	//console.log(fontQ);

	var size = fontInfo[1] || 64;
	var font = fontQ.getFontForSize(parseInt(size));
	
	var image = meme.getRandomImage();
	
	Jimp.read(image, function (err, image) {
		if (err){
		   	callback(err);
			return;
		}

		if (!font.jimp){
			callback("Font is not ready yet");
			return
		}

		if (!font.success){
			callback("Font is broken!");
			return
		}

		if (image.bitmap.width > 600){
			console.log("triggered (w)");
			if (image.bitmap.width / 600 > image.bitmap.height / 900){
				console.log("\ttriggered w>h");
				image = image.resize(600, Jimp.AUTO);
			} else {
				console.log("\ttriggered h>w");
				image = image.resize(Jimp.AUTO, 900);	
			}
		} else if (image.bitmap.height > 900){
			console.log("triggered (h)");
			if (image.bitmap.width / 600 > image.bitmap.height / 900){
				console.log("\ttriggered w>h");
				image = image.resize(600, Jimp.AUTO);
			} else {
				console.log("\ttriggered h>w");
				image = image.resize(Jimp.AUTO, 900);	
			}
		}	

		drawText(image, font.jimp, {fontpath: fontQ.fontpath, size: font.size}, upperText, true);
		drawText(image, font.jimp, {fontpath: fontQ.fontpath, size: font.size}, lowerText, false);

		callback(null, image);
	});
	
	
}

exports.makeMeme = makeMeme;
exports.init = function(){
	listFonts();
	listMemes();
}

exports.listMemes = function(){
	return memes;
}

exports.listFonts = function(){
	return fonts;
}

//console.log(createFonts("./fonts/impact/"));
// exports.init();

// setInterval(function(){
// 	makeMeme("doge", "impact:64", "Andrei lorem ipsum dolor sit amet", "idi nahui", function (err, image){
// 		if (!err){
// 			image.write("./test.jpg", function(err){
// 				if (!err){
// 					console.log("YAY!")
// 				} else {
// 					console.log(err);
// 				}
// 			});
// 		} else {
// 			console.log(err);
// 		}
// 	});
// }, 10000);