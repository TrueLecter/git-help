var WordWrap = require('fontpath-wordwrap');
var GlyphIterator = require('fontpath-glyph-iterator');

exports.createLayout = function(font, fontSize, maxWidth, text){

	console.log("calculating metrics for text to max width: ", maxWidth);

	var iterator = new GlyphIterator(font, fontSize);

	var wrap = new WordWrap();
	wrap.text = text;
	wrap.layout(iterator, maxWidth);

	return {lines : wrap.lines, text : wrap.text, detail: wrap, font: iterator};
}

//console.log(exports.createLayout(require("./fonts/impact/impact.json"), 48, 300, "LOREM IPSUM DOLOR SUT AMET I ZHOPA HUI MOCHA").font);