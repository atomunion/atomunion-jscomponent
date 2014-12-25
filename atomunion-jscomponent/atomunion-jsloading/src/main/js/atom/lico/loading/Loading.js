(function($) {
    if (!$.fn.licoLoading) {
        var licoLoading = function() {
            return {
                version : '0.0.2',
                defaults : {
                	container : 'body'
                },
                _resizeShadow : function(s) {
                    var size = this._getContainerSize();;
                    
                    s.css({
                        "width" : size.width + "px",
                        "height" : size.height + "px"
                    });
                },
                _toggleShadow : function(w,flag) {
                	var container = this.options.container;
                	var hidden = w.is(":hidden");
                	
                	if(hidden && (flag === true || flag == null)){
                		 this._resizeShadow(w);
                         w.show();
                         $(container).children().not(".loading,script,style,link").addClass("loading-blur");
                	}else if(!hidden && (flag === false || flag == null)){
                		 w.hide();
                         $(container).children().not(".loading,script,style,link").removeClass("loading-blur");
                	}
                    
                    return w;
                },
                _getContainerSize : function(){
                	var container = this.options.container;
                	var width = 0, height = 0;
                	
                	if(container[0] == $("body")[0]){
                		width = Math.max($(window).width(), $("body").width());
                        height = Math.max($(window).height(), $("body").height());
                	}else{
                		width = $(container).width();
                		height = $(container).height();
                	}
                	
                	return {
                		width : width,
                		height : height
                	};
                },
                _resizeLoading : function(w) {
                	//解决padding，margin问题
                },
                _clearLoading: function(w){
                	 var v = w.find('.title');
                     v.empty();
                     v = w.find('.desc');
                     v.empty();
                },
                _initLoading: function(w){
                	var attrs = this.options;
                	 var v = w.find('.title');
                     v.html(attrs.title);
                     v = w.find('.desc');
                     v.html(attrs.desc);
                },
                _toggleLoading : function(flag) {
                    var container = this.options.container;
                    
                    var w = $(container).children(".loading");
                    if (w.length > 0) {
                    	var hidden = w.is(":hidden");
                    	
                    	if(hidden && (flag === true || flag == null)){
                    		this._resizeLoading(w);
                            this._clearLoading(w);
                            this._initLoading(w);
                            this._toggleShadow(w.find(".shadow"),true);
                            w.show();
                    	}else if(!hidden && (flag === false || flag == null)){
                    		this._toggleShadow(w.find(".shadow"),false);
                            w.hide();
                    	}
                    } else {
                        w = $("<div class='loading' style='display:none'></div>");
                        var c = $("<div class='shadow' style='display:none'></div>");
                        var v = $('<div class="content">' +
									'<div class="logo"></div>' +
									'<div class="title"></div>' +
									'<div class="desc"></div>' +
								'</div>');
                        
                        w.append(c);
                        w.append(v);
                        w.appendTo(container);
                        this._toggleLoading(true);
                    }
                    return this;
                },
                hide: function(){
                	this._toggleLoading(false);
                },
                show:function(opts){
                	this.options = $.extend({}, this.options, opts || {});
                	this._toggleLoading(true);
                }
            };
        }();
        $.fn.licoLoading = function(opts) {
        	
        	if(this == $){
        		opts = $.extend({}, licoLoading.defaults, opts || {});
        	}else{
        		opts = $.extend({}, licoLoading.defaults, {container:this,title:this.attr("data-title"),desc:this.attr("data-desc")},opts || {});
        	}
        	
            licoLoading.options = opts;
            return (function() {
                return licoLoading._toggleLoading.call(licoLoading,true);
            })(opts);
        };

        $.licoLoading = $.fn.licoLoading;
    }
})(jQuery);
