var request = require("request");
var fs = require("fs");

exports.upload = function(path, token, callback){
	console.log(token);
	request.post(
	{
		url:'https://api.vk.com/method/photos.getUploadServer', 
		form: {
			album_id: "234680370",
			access_token: token,
			v: "5.53"
		}	
	}, function(err,httpResponse,body){ 
		if (err){
			callback(err);
			return;
		}
		var resp = JSON.parse(body).response.upload_url;
		console.log("Got upload server: " + resp);
		var formData = {
			file1: fs.createReadStream(path)
		};
		request.post({url:resp, formData: formData}, function optionalCallback(err, httpResponse, body) {
			if (err){
				callback(err);
				return;
			}
			console.log("Got info for upload");
			var response = JSON.parse(body);
			request.post(
			{
				url:'https://api.vk.com/method/photos.save', 
				form: {
					//group_id: '27839812',
					server: response.server,
					aid: response.aid,
					hash: response.hash,
					photos_list: response.photos_list,
					access_token: token,
					album_id: "234680370",
					v: "5.53"
				}	
			}, function(err,httpResponse,body){ 
				if (err){
					callback(err);
					return;
				}
				console.log("Uploaded!");
				callback(null, JSON.parse(body));
			});
		});
	})
}