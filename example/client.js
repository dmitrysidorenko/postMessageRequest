/**
 * Created with JetBrains WebStorm.
 * User: Dmytriy.Sidorenko
 * Date: 23.08.12
 * Time: 13:13
 * To change this template use File | Settings | File Templates.
 */
$(function(){
	"use strict";

	var pmr = new PMRClient({
		origin:"*",
		servicePageUrl : "file:///C:/Users/Sidorenko/Documents/GitHub/postMessageRequest/example/servise.html",
		callback : callback
	});

	function callback(){
		console.log("callback is invoked");

		pmr.request({
			url:"",
			type:"",
			contentType:"text/html",
			data:{},
			success:function(data, status, statusText){
				console.log("success: ", data, status, textStatus);
			},
			error:function(error, status, statusText){
				console.log("error: ", error, status, textStatus);
			}
		});
	}
});