(function($) {
    if (!$.fn.licoDialog) {
        var licoDialog = function() {
            return {
                version : '0.0.1',
                defaults : {

                },

                _createContentInDialog : function(parentNode, legendName) {
                    //TODO  去掉fieldset，实现自定义样式，包含上下标题
                    if (legendName) {
                        var fieldset = $("<fieldset></fieldset>");

                        $(parentNode).append(fieldset);
                        var legend = $("<legend>" + legendName + "</legend>");
                        fieldset.append(legend);

                        return fieldset;

                    } else {
                        var content = $("<div></div>");
                        $(parentNode).append(content);
                        return content;
                    }
                },
                _createDomInContent : function(filedset, vr, ats) {
                    try {

                        if (vr == "br") {
                            filedset.append("<br/>");
                        }

                        if (!vr.tag) {
                            vr.tag = {
                                name : "div",
                                attrs : {
                                    css : 'layoutContainer'
                                }
                            };
                        }

                        var inputFlag = vr.tag.name == 'input', hiddenFlag = inputFlag && vr.tag.attrs && vr.tag.attrs.type == "hidden", submitFlag = inputFlag && vr.tag.attrs && vr.tag.attrs.type == "submit", normalInput = inputFlag && !hiddenFlag && !submitFlag;

                        var scope = this;
                        var _container = null;
                        if (normalInput) {
                            var tip = (vr.tip) ? vr.tip : "";
                            var label = (vr.label) ? vr.label : "";
                            var result = '<label><div>' + label + ':<span>' + tip + '</span></div><div class="inputContainer"/></label>';
                            _container = $(result);
                            filedset.append(_container);
                            if (!vr.tag.attrs.css) {
                                vr.tag.attrs.css = 'text-input';
                            }
                        } else {
                            if (submitFlag)
                                if (!vr.tag.attrs.css) {
                                    vr.tag.attrs.css = 'submit';
                                }
                            _container = filedset;
                        }

                        var tagName = vr.tag.name || "div";

                        var input = '<' + tagName;
                        var attrs = vr.tag.attrs;
                        if (attrs) {
                            $.each(attrs, function(i, n) {

                                if (i == "legend" && tagName == 'fieldset') {
                                    return true;
                                }

                                if (i == 'text') {
                                    return true;
                                }

                                if (i == 'validateName' || i == 'css') {
                                    i = 'class';
                                }
                                if (i == 'class' && input.indexOf('class="') != -1)
                                    input = input.replace(/class="+/gi, 'class="' + n + ' ');
                                else
                                    input += ' ' + i + '=' + '"' + ((n) ? n : '') + '"';
                            });
                        }
                        input += ' >' + (attrs.text || '') + '</' + tagName + '>';
                        var _input = $(input);

                        if (tagName == 'fieldset' && attrs.legend) {
                            _input.append('<legend>' + attrs.legend + '</legend>');
                        }

                        if (hiddenFlag) {
                            _container.append(_input);
                            return;
                        } else if (normalInput) {
                            _container = _container.find(".inputContainer");
                        }
                        _container.append(_input);

                        var listeners = vr.listeners;
                        if (listeners) {
                            $.each(listeners, function(i, n) {
                                if (i == 'load') {
                                    if (listeners['reset']) {
                                        listeners['reset'].apply(_input, [(_input.length > 0) ? _input[0] : _input], vr.tag.attrs, scope, window);
                                    }
                                    n.apply(_input, [(_input.length > 0) ? _input[0] : _input], vr.tag.attrs, scope, window);
                                } else if (i != 'reset') {
                                    _input.bind(i, function() {
                                        n.apply(this, [this, vr.tag.attrs, scope, window]);
                                    });
                                }
                            });
                        } else {
                            if (normalInput) {
                                _input.bind('blur', function() {
                                    scope._validateContent(this);
                                });
                            }
                        }

                        if (vr.items) {
                            var layout = vr.layout || {};

                            switch(layout.name) {
                                case"column":
                                    var table = $("<table width='100%' border='0'  class='" + (layout.class || "") + "' style='" + (layout.style || "") + "' cellpadding='" + (layout.cellpadding || 0) + "' cellspacing='" + (layout.cellspacing || 0) + "'/>");

                                    _input.append(table);

                                    var columnWidth = 0, tr = null, td = null, columns = 0, skip = 0;
                                    $.each(vr.items, function(i, n) {
                                        if ((n.tag && n.tag.attrs && n.tag.attrs.type == "hidden")) {
                                            td = _input;
                                            skip++;
                                        } else {
                                            if (columnWidth >= 1) {
                                                columnWidth = 0;
                                                columns = columns ? columns : i;
                                                tr = null;
                                            }
                                            if (!tr) {
                                                tr = $("<tr/>");
                                                table.append(tr);
                                            }

                                            var w = n.columnWidth;
                                            td = $("<td/>");

                                            if (w) {
                                                td.attr({
                                                    width : w * 100 + '%'
                                                });
                                                columnWidth += w;
                                            } else {
                                                columnWidth = !columns || (i - skip + 1) % columns == 0 ? 1 : 0;
                                            }
                                            tr.append(td);
                                        }
                                        scope._createDomInContent(td, n, ats);
                                    });
                                    break;
                                default:
                                    $.each(vr.items, function(i, n) {
                                        scope._createDomInContent(_input, n, ats);
                                    });
                            }

                        }
                        var proxy = vr.proxy;
                        if (proxy) {
                            if (vr.autoLoad) {
                                var read = proxy.read;
                                var config = $.extend({
                                    self : _input
                                }, read, true);

                                this._loadData(config);
                            }
                        }

                        var buttons = vr.buttons;
                        if (buttons) {
                            for (var b in buttons) {
                                var button = null, method = null;
                                switch(buttons[b]) {
                                    case 'update':
                                        button = '<input type="button" value="UPDATE" class="button-input btn-update"/>';
                                        method = "POST";
                                        break;
                                    case 'read':
                                        button = '<input type="button" value="READ" class="button-input btn-read"/>';
                                        method = "GET";
                                        break;
                                    case 'destory':
                                        button = '<input type="button" value="DESTORY" class="button-input btn-destory"/>';
                                        method = "DELETE";
                                        break;
                                    case 'create':
                                    default:
                                        button = '<input type="button" value="CREATE" class="button-input btn-create"/>';
                                        method = "PUT";
                                        break;
                                }
                                if (b) {

                                    var _button = $(button);
                                    _input.append("<br/>").append(_button);
                                    if (proxy) {
                                        var p = proxy[buttons[b]];
                                        _button.bind("click", function() {
                                            var data = $.extend({}, scope.getValues(_input), p.data);
                                            $.ajax({
                                                async : true,
                                                type : "POST",
                                                url : p.url,
                                                contentType : 'application/json;charset=utf-8',
                                                data : JSON.stringify(data),
                                                dataType : "json",
                                                success : function(msg) {
                                                    if (msg.success) {
                                                        scope._toggleDialog(ats);
                                                    }
                                                }
                                            });

                                        });

                                    }
                                }
                            }
                        }

                    } catch (e) {
                        //
                    }
                },

                getValues : function(dom) {
                    var values = {};
                    if (dom) {
                        $.each(dom.find("input,select"), function(i, n) {
                            if (n.type != 'button') {
                                if (n.id || n.name) {
                                    var value = null;
                                    try {
                                        switch($(n).attr("xtype")) {
                                            case "number":
                                                value = new Number($(n).val());
                                                break;
                                            default:
                                                value = $(n).val();
                                                break;
                                        }
                                    } catch(e) {
                                    }
                                    values[n.id || n.name] = value;
                                }
                            }
                        });
                    }
                    return values;
                },
                //TODO 整合下面的select选项
                _loadData : function(config) {
                    var scope = this;
                    var setValues = function(data) {
                        if (data.success) {
                            var d = (config.root) ? data[config.root] : data;
                            var self = $(config.self);
                            for (var i in d) {
                                if (i != 'success') {
                                    var id = (config.mapping && config.mapping[i]) ? config.mapping[i] : i;
                                    scope._setDomValue(self.find("#" + id), id, d[i]);
                                }
                            }
                        }
                    };
                    var scope = this;
                    if (config.local) {
                        setValues(config.data);
                    } else if (config.url) {
                        $.ajax({
                            type : "GET",
                            crossDomain : true,
                            url : config.url,
                            data : config.data,
                            dataType : "jsonp",
                            success : function(msg) {
                                setValues(msg);
                                if (config.callback) {
                                    config.callback.call(config.scope || scope, config.args, msg);
                                }
                            }
                        });
                    }
                },

                _setDomValue : function(_input, id, value) {
                    try {
                        if (_input.is("select") || (id && ( _input = $("#" + id)).is("select"))) {
                            $.each(_input.children(), function(i, n) {
                                var nd = $(n);
                                if (nd.val() == value) {
                                    nd.attr("selected", "selected");
                                    // return false;
                                } else {
                                    nd.removeAttr("selected");
                                }
                            });
                        } else {
                            value = (value) ? value : '';
                            _input.val(value);
                        }
                    } catch (e) {
                        //
                    }
                },

                _compileRegExp : function(pattern, attributes) {
                    return eval('/' + pattern + '/' + attributes);
                },

                _getElementValue : function(_se, vd) {
                    var result = '';
                    var vs = vd.tag.attrs.vs;
                    if (_se && vs != undefined && vs != null) {
                        var vsarray = vs.split(' ');
                        for (var index in vsarray) {
                            var str = vsarray[index];

                            if (str == 'style') {
                                result = _se.getAttribute(str);
                                (result && result != '') || (( result = _se.$[str]) && ( result = ( result instanceof CSSStyleDeclaration) ? result.cssText : result));
                                (result && result != '') || ( result = vd.tag.attrs.value);
                            } else if (str.indexOf('.') == -1) {
                                result = _se.getAttribute(str);
                                (result && result != '') || ( result = _se.$[str]);
                                (result && result != '') || ( result = vd.tag.attrs.value);
                            } else if (str.indexOf('style.') == 0) {
                                result = _se.$.style[str.split('.')[1]];
                                (result && result != '') || ( result = vd.tag.attrs.value);
                            } else if (str.indexOf('event.') == 0) {
                                var en = str.split('.')[1];
                                var ena = (en.indexOf('on') == 0) ? en : 'on' + en;

                                result = _se.getAttribute(ena);
                                (result && result != '') || ( result = _se.getAttribute('data-cke-pa-' + ena));
                                // result = (result) ? result : _se.$[ena];
                                // result = (result) ? result : _se.$[ena];
                                (result && result != '') || ( result = vd.tag.attrs.value);
                                result && result.indexOf('(') == 0 && result.indexOf(')(this)') != -1 && ( result = result.substring(1, result.length - 7));
                            }
                            if (result && result != '') {
                                break;
                            }
                        }
                    }
                    var unit = vd.tag.attrs.unit;
                    if (unit && unit != '' && result && result != '') {
                        result = result.replace(this._compileRegExp('([0-9]+)\\s*(' + unit + ')\\s*;*\\s*$', 'gim'), '$1');
                    }

                    return (result) ? result : '';
                    // result.replace(/px\b/g,'')
                },

                _setElementValue : function(_se, vd, flag) {
                    var vs = (vd.vs || ( flag ? '' : $(vd).attr('vs')));
                    var unit = (vd.unit || ( flag ? '' : $(vd).attr('unit')));
                    if (_se && vs != undefined && vs != null) {
                        var value = (vd.value || ( flag ? '' : $(vd).val()));
                        (unit && value && value != '') && ( value = value + unit);
                        var vsarray = vs.split(' ');
                        for (var index in vsarray) {
                            var str = vsarray[index];
                            if (str.indexOf('.') == -1) {
                                _se.setAttribute(str, value);
                                _se.$[str] = value;
                            } else if (str.indexOf('style.') == 0) {
                                _se.$.style[str.split('.')[1]] = value;
                            } else if (vs.indexOf('event.') == 0) {
                                // eval('('+vd.value+')')
                                // $(_se.$).unbind(vs.split('.')[1])
                                // .bind(vs.split('.')[1],function(){alert(this)});
                                var en = str.split('.')[1];
                                var ena = (en.indexOf('on') == 0) ? en : 'on' + en;
                                _se.setAttribute(ena, '(' + value + ')(this)');
                                // _se.$[ena] = vd.value;
                            }
                        }
                    }
                },
                _loadOptionsOfSelection : function(config) {

                    var appendOption = function(selection, data) {
                        selection.empty();
                        (data) && ($.each(data, function(i, n) {
                                selection.append("<option value=\"" + ((!n && n != '') ? n : (n.value || n.name || n)) + "\">" + (!n && n != '' ? i : (n.name || (isNaN(i) ? i : n))) + "</option>");
                            }));
                    };
                    var selectOption = function(porperties, selection, attrs) {
                        attrs && (attrs.value != null) && (porperties._setDomValue(selection, attrs.id, attrs.value));
                    };
                    var scope = this;
                    if (config.local) {
                        appendOption(scope, config.data);
                        selectOption(config.args[0], scope, config.args[1]);
                    } else if (config.url) {
                        $.ajax({
                            type : "GET",
                            url : config.url,
                            data : config.data,
                            dataType : "json",
                            success : function(msg) {
                                if (msg) {
                                    appendOption(scope, msg);
                                    selectOption(config.args[0], scope, config.args[1]);
                                }
                                if (config.callback) {
                                    config.callback.call(config.scope || scope, config.args, msg);
                                }
                            }
                        });
                    }
                },
                _validateContent : function(vd) {
                    // 验证数据格式
                    try {
                        var form = $(vd).parents("form");
                        var isError = form.validationEngine('validate');
                        // if (isError != undefined && isError != null &&
                        // isError ==
                        // false) {
                        form.submit();
                        // }
                    } catch (e) {
                        //
                    }
                },
                _initDomInDialog : function(v, attrs) {
                    if (attrs.html) {
                        v.append($(attrs.html));
                        return;
                    }
                    if (attrs.items && attrs.items.length > 0) {
                        var _fieldset = this._createContentInDialog(v, attrs.title);

                        var desc = {};
                        $.extend(true, desc, attrs);
                        this._createDomInContent(_fieldset, desc, attrs);
                        return;
                    }
                },
                _resizeShadow : function(s) {
                    var width = Math.max($(window).width(), $("body").width());
                    var height = Math.max($(window).height(), $("body").height());

                    var w = s.width(), h = s.height();
                    if (w < width) {
                        s.css({
                            "width" : width + "px"
                        });
                    }
                    if (h < height) {
                        s.css({
                            "height" : height + "px"
                        });
                    }
                },
                _toggleShadow : function() {
                    var w = $("#dialog-shadow");
                    if (w.hasClass("dialogshadow")) {
                        if (w.is(":hidden")) {
                            this._resizeShadow(w);
                            w.show();
                            $("body").children().not(".dialogshadow,.dialogpanel,script,style,link").addClass("blur");
                        } else {
                            w.hide();
                            $("body").children().not(".dialogshadow,.dialogpanel,script,style,link").removeClass("blur");
                        }
                    } else {
                        w = $("<div id='dialog-shadow' class='dialogshadow' style='z-index : 1000;'></div>");
                        w.appendTo("body");

                        this._resizeShadow(w);
                        w.fadeTo(0, 0.49);
                        $("body").children().not(".dialogshadow,.dialogpanel,script,style,link").addClass("blur");
                    }
                    return w;
                },
                _resizeDialog : function(w, attrs) {
                    var padding = 15;

                    var bodywidth = $(window).width();
                    var bodyheight = $(window).height();
                    if (!attrs.width) {
                        attrs.width = bodywidth * 0.8;
                    }

                    if (!attrs.height) {
                        attrs.height = bodyheight * 0.6;
                    }
                    var marginleft = bodywidth - attrs.width - 2 * padding;
                    var margintop = bodyheight - attrs.height - 2 * padding;

                    w.css({
                        "width" : (attrs.width + 2 * padding) + "px",
                        "height" : (attrs.height + 2 * padding) + "px",
                        left : marginleft / 2 + "px",
                        top : margintop / 2 + "px"
                    });

                    var c = w.find(".dialogclose"), v = w.find(".dialogview");
                    c.css({
                        right : "0px",
                        top : "0px",
                        width : "30px",
                        height : "30px"
                    });
                    v.css({
                        "width" : attrs.width + "px",
                        "height" : attrs.height + "px",
                        left : padding + "px",
                        top : padding + "px"
                    });
                },
                _toggleDialog : function(attrs) {
                    var level = 1, scope = this;
                    if (!attrs.model) {
                        this._toggleShadow();
                    }
                    var w = $("#window-" + level);
                    if (w.hasClass("dialogpanel")) {
                        if (w.is(":hidden")) {
                            this._resizeDialog(w, attrs);
                            // 更改dialog内容
                            var v = w.find('.dialogview');
                            v.empty();
                            this._initDomInDialog(v, attrs);
                            w.show();
                        } else {
                            w.hide();
                        }
                    } else {
                        w = $("<div id='window-" + level + "' class='dialogpanel' style='z-index : " + (1000 + level * 10) + ";'></div>");
                        var c = $("<div class='dialogclose' style='z-index : " + (1000 + level * 10 + 9) + ";'></div>");
                        var v = $("<div class='dialogview' style='z-index : " + (1000 + level * 10 + 1) + ";'></div>");
                        this._initDomInDialog(v, attrs);
                        w.append(c);
                        w.append(v);
                        w.appendTo("body");

                        this._resizeDialog(w, attrs);

                        c.click(function() {
                            scope._toggleDialog(attrs);
                        });
                    }
                    return w;
                }
            };
        }();
        $.fn.licoDialog = function(opts) {
            var opts = $.extend({}, licoDialog.defaults, opts || {});
            return (function() {
                licoDialog._toggleDialog.apply(licoDialog, arguments);
            })(opts);
        };

        $.licoDialog = $.fn.licoDialog;
    }
})(jQuery);
