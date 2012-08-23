/**
 * Created with JetBrains WebStorm.
 * User: Dmytriy.Sidorenko
 * Date: 23.08.12
 * Time: 12:42
 * To change this template use File | Settings | File Templates.
 */
(function ($, json) {
	"use strict";

	$.fn.bindPostMessage = function (handler) {
		if (typeof window.addEventListener != 'undefined') {
			window.addEventListener('message', handler, false);
		} else if (typeof window.attachEvent != 'undefined') {
			window.attachEvent('onmessage', handler);
		}
	};

	$.fn.unbindPostMessage = function (handler) {
		if (window.removeEventListener) {
			// W3C DOM Level 2 Events - used by Mozilla, Opera and Safari
			window.removeEventListener("message", handler, false);
		}
		else {
			// MS implementation - used by Internet Explorer
			window.detachEvent("onmessage", handler);
		}
	};

}(jQuery, JSON));