(function($) {
	if (!$.fn.licoStore) {
		var licoStore = function() {
			return {
				version : '0.0.1',
				defaults : {
					type : "GET",
					url : null,
					data : null,
					local : false,
					async : true,
					dataType : 'json',
					timeout : 30000,
					headers : {},
					ifModified : false,
					contentType : 'application/x-www-form-urlencoded; charset=UTF-8',// 'application/json',
					error : function(xhr, textStatus, error) {
						console.log('Request error ! Error message:' + textStatus);
						//throw error;
					},
					statusCode : {
						404 : function() {
							console.log('Page not found.');
						},
						500 : function() {
							console.log('There is a error on server.');
						}
					}
				},
				request : function(opts) {
                    var data = null;
					if (opts.local) {
						data = opts.data || {
							success : false
						};
						data.success = !!data.success;
                        opts.data = data;
						this.getData(data,opts);
					} else if (!opts.url) {
						console.log('Please tell me you URL first!');
						return;
					} else {
						opts.success = function(message) {
							if (typeof message !== "string" || !message) {
								data = message;
							} else {
								data = $.parseJSON(message);
							}
                            opts.data = data;
							this.getData(data,opts);
						};
						$.ajax(opts);
					}
				},
				getData : function(data,opts) {
                    (opts.getData || $.fn.licoStore.getData).call(
								$.fn.licoStore, data);
				},
				reload : function(opts) {
					this.request(opts);
				}
			};
		}();
		$.fn.licoStore = function(opts) {
			var opts = $.extend({}, licoStore.defaults, opts || {});
			return (function() {
				licoStore.request.apply(licoStore, arguments);
			})(opts);
		};

		$.fn.licoStore.getData = function(data) {
			console.log(data);
		};

		$.licoStore = $.fn.licoStore;
	}
})(jQuery);
