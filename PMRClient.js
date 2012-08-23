/**
 * Created with JetBrains WebStorm.
 * User: Dmytriy.Sidorenko
 * Date: 23.08.12
 * Time: 11:24
 * To change this template use File | Settings | File Templates.
 */
(function (global, $, json) {
	"use strict";
	global.PMRClient = function (options) {
		var defaults = {
			container:document.body
		};
		var opts = $.extend(defaults, options);

		var pub = {
			request:function (opt) {
				var def = {
					type:'POST',
					contentType:"application/json"
				};
				var o = $.extend(def, opt);
				doRequest(o);
			}
		};
		var state = {
			isReady:false
		};
		var res = {
			iFrame:null,
			startInitMessage:"iFRAME_PART_HAS_BEEN_STARTED"
		};

		function init() {
			$(window).bindPostMessage(startRequestHandler);
			res.iFrame = $("<iframe/>").css({position:'absolute', top:0, left:0, display:'none', visibility:'hidden', width:0, height:0})
				.attr('src', opts['servicePageUrl'] + "#origin=" + window.location.href)
				.appendTo($(opts['container']).eq(0))[0];
		}

		function startRequestHandler(e) {
			if (e && e.origin == opts['origin'] && e.data == res.startInitMessage) {
				state.isReady = true;
				$(window).unbindPostMessage(startRequestHandler);
				($.isFunction(opts['callback']) ? opts['callback'] : $.noop)();
			}
		}

		function doRequest(opt) {
			if (res.iFrame && res.iFrame.contentWindow) {
				var requestObj = {
					url:opt['url'],
					type:opt['type'],
					contentType:opt['contentType'],
					originName : opt['originName'],
					data:opt['data'],
					token:Math.random().toString(36).substring(2)
				};
				var handler = function (e) {
					if (e && e.origin == opts['origin'] && e.data) {
						var parsed = null;
						try {
							parsed = json.parse(e.data);
						} catch (error) {
							//todo: handle error
							return;
						}
						if (parsed.token == requestObj.token) {
							if (parsed.error) {
								/*
								 * error format: error, status(500, 404 etc), textStatus
								 * */
								($.isFunction(opts['error']) ? opts['error'] : $.noop).call(parsed.error, parsed.error, parsed.status, parsed.statusText);
							} else {
								/*
								 * success format: data, status(200 etc), textStatus
								 * */
								($.isFunction(opts['success']) ? opts['success'] : $.noop).call(parsed.data || {}, parsed.data, parsed.status, parsed.statusText);
							}
							$(window).unbindPostMessage(handler);
						}
					}
				};
				$(window).bindPostMessage(handler);
				var requestStr = json.stringify(requestObj);
				res.iFrame.contentWindow.postMessage(requestStr, opts['origin']);
			}
		}

		init();

		return pub;
	}
}(window, jQuery, JSON));