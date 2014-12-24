(function($) {
    if (!$.fn.licoMsgbox) {
        var msgboxs = [];

        var licoMsgbox = function() {

            return {
                version : '0.0.1',
                defaults : {
                    content : '',
                    title : '提示',
                    icon : 'default' //error
                    //YES : 'Yes',
                    //NO : 'No',
                    //OK : 'OK',
                    //CANCEL : 'Cancal'
                },

                createOverlay : function(options) {
                    var width = Math.max($(window).width(), $("body").width());
                    var height = Math.max($(window).height(), $("body").height());

                    $('<div/>').css({
                        "width" : width + "px",
                        "height" : height + "px"
                    }).addClass('msgbox msgbox-overlay msgbox-overlay-' + options.icon + ' msgbox-' + options.timestamp).hide().appendTo('body');
                },
                showOverlay : function(options) {
                    $('.msgbox.msgbox-overlay.msgbox-' + options.timestamp).fadeIn();
                },
                deleteOverlay : function(options) {
                    $('.msgbox.msgbox-overlay.msgbox-' + options.timestamp).fadeOut(function() {
                        $(this).remove();
                    });
                },
                createBox : function(options) {
                    var icon = options.icon;
                    var content = options.content;
                    var title = options.title;
                    var yesBtn = options.YES;
                    var noBtn = options.NO;
                    var okBtn = options.OK;
                    var cancelBtn = options.CANCEL;
                    var btns = options.buttons;

                    var $box = $('<div/>').addClass('msgbox msgbox-box msgbox-box-' + icon + ' msgbox-' + options.timestamp).hide().appendTo('body');

                    $('<h3 class="msgbox-box-title"/>').html(title).appendTo($box);
                    
                    $('<p class="msgbox-box-validate msgbox-box-validate-' + icon + '"/>').appendTo($box);

                    $('<p class="msgbox-box-content msgbox-box-content-' + icon + '"/>').html(content).appendTo($box);

                    if(options.html){
                    	$box.append('<p>'+options.html+'</p>');
                    }
                    
                    if (btns && btns.length > 0) {
                        $.each(btns, function(i, o, bs) {
                            $('<button class="' + (o.cls || "button-info") + '" value=' + o.value + '/>').html(o.text).appendTo($box);
                        });
                    }

                    if (cancelBtn) {
                        $('<button class="button-cancel" value=0/>').html(cancelBtn).appendTo($box);
                    }

                    if (noBtn) {
                        $('<button class="button-no" value=0/>').html(noBtn).appendTo($box);
                    }

                    if (okBtn) {
                        $('<button class="button-ok" value=1/>').html(okBtn).appendTo($box);
                    }

                    if (yesBtn) {
                        $('<button class="button-yes" value=1/>').html(yesBtn).appendTo($box);
                    }

                    $('.msgbox.msgbox-box.msgbox-' + options.timestamp + ' button').on('keydown', function(e) {
                        if (e.which === 9) {//Tab key
                            e.preventDefault();
                            var next = $(this).next('.' + icon + '-button');
                            if (next.length > 0) {
                                next.focus();
                            } else {
                                $('.' + icon + '-button').first().focus();
                            }
                        }
                    });
                },
                showBox : function(options) {
                    $('.msgbox.msgbox-box.msgbox-' + options.timestamp).fadeIn(function() {
                        $(this).children('button').eq(1).focus();
                    });
                },

                deleteBox : function(options) {
                    $('.msgbox.msgbox-box.msgbox-' + options.timestamp).fadeOut(function() {
                        $(this).remove();
                    });
                },

                attachHandlers : function(options) {
                    var icon = options.icon, scope = this;
                    $('.msgbox.msgbox-' + options.timestamp + ' button').on('click', function() {
                    	
                    	var value =  $(this).val(), msgbox = $('.msgbox.msgbox-' + options.timestamp);
                    	
                    	if (options.validate){
                    		var result = options.validate.call(options, value, msgbox);
                    		
                    		if(!result.success){
                    			msgbox.find('.msgbox-box-validate').html(result.msg);
                    			return;
                    		}
                    	}
                    	
                        scope.deleteOverlay(options);
                        scope.deleteBox(options);
                        
                        if (options.handler) {
                            options.handler.call(options, value, msgbox);
                        }
                        //Call the handler function. the TRUE parameter indicates that the user pressed the YES button
                    });
                },

                show : function(options) {
                    options.timestamp = (new Date().getTime() + Math.random()).toString(16).replace(/[.]/g,"");
                    msgboxs.push(options);
                    this.createOverlay(options);
                    this.showOverlay(options);
                    this.createBox(options);
                    this.showBox(options);
                    this.attachHandlers(options);
                }
            };
        }();

        (function() {
            $(document).on('keydown.confirmon.close', function(e) {
                if (msgboxs.length > 0) {
                    if (e.which === 27) {//Esc key
                        var options = msgboxs.pop();
                        licoMsgbox.deleteOverlay(options);
                        licoMsgbox.deleteBox(options);
                        if (options.handler) {
                            options.handler.call(options, false);
                        }
                    }
                }
                //$(document).off('keydown.confirmon.close');
            });
        })();

        $.fn.licoMsgbox = function(opts) {
            var opts = $.extend({}, licoMsgbox.defaults, opts || {});
            return (function() {
                licoMsgbox.show.apply(licoMsgbox, arguments);
            })(opts);
        };

        $.licoMsgbox = $.fn.licoMsgbox;
    }
})(jQuery);
