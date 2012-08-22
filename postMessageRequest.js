/**
 * Created with JetBrains WebStorm.
 * Author: Dmitry Sidorenko
 * Date: 8/22/12
 * Time: 10:30 PM
 */
(function($){
    $.postMessageRequest = function (options){
        var defaults = {
            container: document.body
        };
        var opts = $.extend(defaults, options);
        var pub = {
            request : function(opt){
                if(validateOpt(opt)){
                    doRequest(opt);
                }
            }
        };

        var res = {
            iFrame : null,
            startMessage : "postMessageRequestIsStarted",
            isReady : false
        };

        init();

        function init(){
            bindPostMess(initMessageHandler);
            res.iFrame = $("<iframe/>").attr('frameborder', '0')
                .css({position:'absolute', left:0, top:0, display:'none', visibility:'hidden'})
                .attr('src', opts['src'] + "#origin=" + window.location.origin)
                .appendTo(opts['container'])[0];
        }

        function initMessageHandler(e){
            if(e && e.origin === opts['origin'] && e.data === res.startMessage){
                res.isReady = true;
                unbindPostMess(initMessageHandler);
                //ready callback
                opts['callback'] && $.isFunction(opts['callback']) ? opts['callback']() : $.noop();
            }
        }

        function bindPostMess(handler){
            if(window.addEventListener){
                window.addEventListener('message', handler, false);
            }else{
                window.attachEvent('onmessage', handler);
            }
        }
        function unbindPostMess(handler){
            if(window.removeEventListener){
                window.removeEventListener('message', handler, false);
            }else{
                window.detachEvent('onmessage', handler);
            }
        }

        function validateOpt(opt){
            if(!opt || !opt.url || typeof opt.url != 'string'){
                return false;
            }
            if(opt.url.search(opts['origin']) != 0){
                return false;
            }
            if(opt.success && !$.isFunction(opt.success)){
                return false;
            }
            if(opt.error && !$.isFunction(opt.error)){
                return false;
            }
            return true;
        }

        function doRequest(opt){
            var reqObj = {
                url : opt['url'],
                type : opt['type'],
                data : opt['data'],
                token : Math.random().toString(36).substring(2)
            };

            opt['success'] = $.isFunction(opt['success']) ? opt['success'] : $.noop;
            opt['error'] = $.isFunction(opt['error']) ? opt['error'] : $.noop;

            if(JSON && JSON.stringify){
                var handler = function(e){
                    if(e && e.origin == opts['origin'] && e.data){
                        var parsed = null;
                        try{
                            parsed = JSON.parse(e.data);
                        }catch(e){
                            //todo: handle exception
                            return;
                        }
                        if(parsed.token === reqObj.token){
                            unbindPostMess(handler);
                            if(parsed.data){
                                opt.success.call(parsed, parsed.data, parsed.status, parsed.statusText);
                            }else{
                                opt.error.call(parsed, parsed.status, parsed.statusText);
                            }
                        }
                    }
                };
                bindPostMess(handler);
                res.iFrame.contentWindow.postMessage(JSON.stringify(reqObj), opts['origin']);
            }
        }

        return pub;
    }
})(jQuery);