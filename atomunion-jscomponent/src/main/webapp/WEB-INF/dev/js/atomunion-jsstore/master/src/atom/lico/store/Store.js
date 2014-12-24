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
						alert('Request error ! Error message:' + textStatus);
						throw error;
					},
					statusCode : {
						404 : function() {
							alert('Page not found.');
						},
						500 : function() {
							alert('There is a error on server.');
						}
					}
				},
				request : function(opts) {
					if (opts.local) {
						var data = opts.data;
						data || (data = {
							success : false
						});
						if (data.success != false) {
							data.success = true;
						}
						this.getData(opts);
					} else if (!opts.url) {
						alert('Please tell me you URL first!');
						return;
					} else {
						opts.success = function(message) {
							if (typeof message !== "string" || !message) {
								opts.data = message;
							} else {
								opts.data = $.parseJSON(message);
							}
							this.getData(opts);
						};
						$.ajax(opts);
					}
				},
				getData : function(opts) {
					var result = opts.data;
					if (result.success) {
						(opts.getData || $.fn.licoStore.getData).call(
								$.fn.licoStore, result);
					} else {
						alert('success:' + result.success + '\nmessage:'
								+ result.msg);
					}
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
			alert(data);
		};

		$.licoStore = $.fn.licoStore;
	}
})(jQuery);
