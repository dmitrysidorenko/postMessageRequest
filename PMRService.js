/**
 * Created with JetBrains WebStorm.
 * User: Dmytriy.Sidorenko
 * Date: 23.08.12
 * Time: 12:32
 * To change this template use File | Settings | File Templates.
 */
(function (global, $, json) {
	"use strict";
	global.PMRService = function (options) {
		var defaults = {
		};
		var opts = $.extend(defaults, options);

		var pub = {
			start:function () {
				$(window).bindPostMessage(requestHandler);
				sendInitMessage();
			},
			stop:function () {
				$(window).unbindPostMessage(requestHandler);
			}
		};

		var res = {
			origin:"*",
			startInitMessage:"iFRAME_PART_HAS_BEEN_STARTED"
		};

		function init() {
			var hash = getLocationHash();
			res.origin = hash['origin'] || "*";
		}

		function getLocationHash() {
			var hash = window.location.hash;
			var hashObj = {};
			var arr = hash.substr(1).split("&");
			for (var i = 0, l = arr.length; i < l; i++) {
				var a = arr[i].split("=");
				hashObj[a[0]] = a[1];
			}
			return hashObj;
		}

		function requestHandler(e) {
			if (e && e.origin && e.data) {
				var parsed;
				try {
					parsed = json.parse(e.data);
				} catch (e) {
					//todo: handle error
					return;
				}

				var token = parsed['token'];

				var headers = {};
				if(parsed['originName']){
					headers[parsed['originName']] = e.origin;
				}
				$.ajax({
					url:parsed['url'],
					headers:headers,
					type:parsed['type'] || 'POST',
					contentType:parsed['contentType'],
					data:parsed['data'],
					success:function (data, textStatus, jqXHR) {
						successHandler(data, textStatus, jqXHR, token);
					},
					error:function (jqXHR, textStatus, errorThrown) {
						errorHandler(jqXHR, textStatus, errorThrown, token);
					}
				});
			}
		}

		function successHandler(data, textStatus, jqXHR, token) {
			var responseObj = wrapResponse(data, jqXHR.status, textStatus, token, false);
			var str = json.stringify(responseObj);
			window.parent.postMessage(str, res.origin);
		}

		function errorHandler(jqXHR, textStatus, errorThrown, token) {
			var responseObj = wrapResponse("error", jqXHR.status, textStatus, token, true);
			var str = json.stringify(responseObj);
			window.parent.postMessage(str, res.origin);
		}

		function wrapResponse(data, status, textStatus,token, isError){
			var responseObj = {
				status:status,
				textStatus:textStatus,
				token:token
			};
			responseObj[isError ? 'error' : 'data'] = data;
			return responseObj;
		}

		function sendInitMessage() {
			window.parent.postMessage(res.startInitMessage, res.origin);
		}

		init();

		return pub;
	}

}(window, jQuery, JSON));