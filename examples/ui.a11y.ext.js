/**
 * @author trixta 
 */
(function($, window){
	try {
		if(!window.console){
			window.console = {};
		}
		if(!console.log){
			console.log = $.noop;
		}
	} catch(e){}
	if(!window.html5){
		window.html5 = {};
	}
	html5.shivMethods = false;
	if(document.execCommand){
		try{
			document.execCommand('BackgroundImageCache', false, true);
		} catch(e){}
	}
	$.isLoaded = false;
	$(window).one('load', function() { $.isLoaded = true; });
	$.beget = function(p, cfg){
		var F = function() {};
		F.prototype = p;
		var o = new F();
		if(o.create && o.create.apply){
			o.create.call(o, cfg || {});
		}
		return o;
	};
	
	$.event.customEvent.remove = true;
	
	if(!window.jspackager){
		jspackager = {querys: {}};
	}
	
	$.each({Max: 1, Min: -1}, function(name, factor){
		var cssname = name.toLowerCase();
		$['is'+ name + 'Width'] = function(num, device){
			device = (device && !jspackager.querys.devmobile && !jspackager.querys.devview) ? 'device-' : '';
			if(Modernizr.mediaqueries){
				return Modernizr.mq('all and ('+cssname+'-'+device+'width: '+ num +'px)');
			} else {
				return (device) ? screen.width * factor < num * factor : $(window).width() * factor < num * factor;
			}
		};
	});
	
	
	Modernizr.addTest('mobile', function(){
		if( jspackager.querys.devmobile || $.isMaxWidth(480, true)){
			return true;
		}
		return Modernizr.touch && ((/mobi/i.test(navigator.userAgent) && $.isMaxWidth(1300, true)) || $.isMaxWidth(1030, true));
	});
	
	Modernizr.addTest('advancedcssanimation', function(){
		return Modernizr.cssanimations && Modernizr.cubicbezierrange && Modernizr.csstransforms3d && Modernizr.csstransitions;
	});
	
	$.Aperto = {
		/*-
		 * getRandom
		 [ function ($.Aperto) ]
		 * gets a random number in the given range
		 > Parameter
		 - min (number) the lower bound
		 - max (number) the upper bound
		 = (number) a random number inside the range
		 -*/
		getRandom: function( min, max ) {
			if( min > max ) {
				return( -1 );
			}
			if( min == max ) {
				return min ;
			}
		 
			return( min + parseInt( Math.random() * ( max-min+1 ), 10 ) );
		},
		randomSort: function() {return 0.5 - Math.random();},
		numsort: function (a, b) {
			return a - b;
		},
		throttle: function(fn, delay, obj){
			var timer;
			obj = obj || window;
			delay = delay || 0;
			var fn2 = function(){
				var args = arguments;
				clearTimeout(timer);
				timer = setTimeout(function(){
					fn.apply(obj, args);
				}, delay);
			};
			fn2.originalFn = fn;
			return fn2;
		},
		windowSizes: {
			xSmall: 800,
			small: 1024,
			big: 1280
		}
	};
	$.Aperto.smallSize = screen.width < 600;
	if($.Aperto.smallSize){
		$('html').addClass('small-size');
	}
	var lastWindowClass;
	var windowSizes = $.Aperto.windowSizes;
	var setWindowSize = function(){
		var width = $(window).width();
		var addClass;
		
		if(width < windowSizes.xSmall){
			addClass = 'smaller-than-'+windowSizes.xSmall +' smaller-than-'+windowSizes.small;
		} else if(width < windowSizes.small){
			addClass = 'smaller-than-'+windowSizes.small;
		} else if(width > windowSizes.big){
			addClass = 'greater-than-'+windowSizes.big;
		}
		if(addClass != lastWindowClass){
			if(lastWindowClass){
				$('html').removeClass(lastWindowClass);
			}
			if(addClass){
				$('html').addClass(addClass);
			}
			lastWindowClass = addClass;
		}
	};
	$(window).bind('resize orientationchange', $.Aperto.throttle(setWindowSize, 25));
	$(setWindowSize);
	try {
		setWindowSize();
	} catch(e){}
	
	var atom 	= ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'p', 'li', 'dt', 'dd', 'blockquote', 'address', 'th', 'td', 'dfn'],
		exp 	= $.expr.filters
	;
	
	exp.focusPoint = function(elem){
		var name = elem.nodeName.toLowerCase();
		return (
				//state check
				( !elem.disabled && elem.type !== 'hidden' && elem.getAttribute('role') !== 'presentation' && elem.getAttribute('aria-disabled') !== 'true') &&
				//style check
				(elem.offsetWidth > 0 && elem.offsetHeight > 0 && $.curCSS(elem, 'visibility') !== 'hidden') &&
				//element check
				( $.inArray(name, atom) !== -1 )
		);
	};
	
	exp.focusAble = function(i, elem){
		return ( $.attr(elem, 'tabindex') !== undefined );
	};
	
	
	$.fn.firstExpOf = function(sel){
		if(!this[0]){
			return this.pushStack([]);
		}
		var elems 	= $('*', this[0]),
			len 	= elems.length,
			ret		= []
		;
		for(var i = 0; i < len; i++){
			if(exp[sel](elems[i], i)){
				ret = [elems[i]];
				break;
			}
		}
		return this.pushStack(ret);
	};
	
	var currentLoc = location.href.split('#')[0];
	$.fn.getHrefHash = function(sel){
		var ret = '';
		if(this[0]){
			ret = this[0].hash || this[0].href.replace(currentLoc, '');
		}
		return ret;
	};
	
	$('html').addClass('js-on');
	
	var body, bodyStyle;
	
	$.SCROLLBARWIDTH = 15;
	$.SCROLLROOT = document.documentElement;
	
	function setConstants(){
		body = $(document.body);
		bodyStyle = body[0].style;
		
		var testElem 		= $('<div style="position: absolute; visibility: hidden; width: 80px; overflow: scroll;height: 80px;"><div style="width: 99px; height: 99px;" /></div>')
								.appendTo('body');
		$.SCROLLBARWIDTH = testElem.innerWidth() - $('div', testElem).css('width', 'auto').innerWidth();
		$.SCROLLROOT = $($.browser.webkit || document.compatMode == 'BackCompat' ?
				document.body : 
				document.documentElement);
		testElem.remove();
		testElem = null;
		body.removeClass('js-off');
	}
	
	if(!document.body || !document.body.style){
		$(setConstants);
	} else {
		setConstants();
	}
	
	$.each(['outerHeight', 'outerWidth', 'height', 'width', 'innerHeight', 'innerWidth'], function(i, name){
		$.fn[name +'s'] = function(arg){
			if( (name === 'height' || name === 'width') && arg !== undefined ){
				return $.fn[name].apply(this, arguments);
			}
			var ret = 0;
			this.each(function(){
				ret += $(this)[name](arg);
			});
			return ret;
		};
	});
	
	if($.Widget && $.Widget.prototype){
		var setOptions = $.Widget.prototype._setOption;
		var destroy = $.Widget.prototype.destroy;
		$.extend($.Widget.prototype, {
			_optionFns: {},
			_getMarkupOptions: function(){
				var cfg =  this.element.data(this.widgetName+'CFG');
				if(cfg){
					$.extend(true, this.options, cfg);
				} 
			},
			_callOptionFns: function(callFns){
				var i;
				
				if(!callFns){
					for(i in this._optionFns){
						if(this.options[i] !== undefined){
							this._setOption(i, this.options[i]);
						}
					}
				} else {
					for(i = 0; i < callFns.length; i++){
						if (this.options[i] !== undefined) {
							this._setOption(callFns[i], this.options[callFns[i]]);
						}
					}
				}
			},
			_setOption: function(key, prop){
				if(this._optionFns[key]){
					this[this._optionFns[key]](prop);
				}
				return setOptions.apply(this, arguments);
			},
			_domPub: function(type, event, data){
				var prop;
				var extraData = this._getBasicEventData();
				if(arguments.length < 2){
					data = event;
					event = $.Event('unknown');
				}
				if(!event){
					event = $.Event('unknown');
				}
				if(!data){
					data = extraData;
				} else {
					for(prop in extraData){
						if( !(prop in data) ){
							data[prop] = extraData[prop];
						}
					}
				}
				return this._trigger(type, event, data);
			},
			_basicEventData: function(){
				return {};
			},
			_getBasicEventData: function(){
				return $.extend({
					instance: this,
					options: this.options,
					element: this.element
				}, this._basicEventData());
			},
			_timerNames: {},
			clearAllTimer: function(){
				for(var timer in this._timerNames){
					if(this[timer]){
						clearInterval(this[timer]);
					}
				}
			},
			destroy: function(){
				this.clearAllTimer();
				return destroy.apply(this, arguments);
			}
		});
		
		$.each(['Timeout', 'Interval'], function(i, type){
			var set = 'set'+type;
			var clear = 'clear'+type;
			$.Widget.prototype[set] = function(name, fn, delay){
				name = '_timer'+ name;
				this._timerNames[name] = true;
				var proxyName;
				if(this[name]){
					clearInterval(this[name]);
				}
				if(typeof fn == 'string'){
					proxyName = '_proxied_'+fn;
					if(!this[proxyName]){
						this[proxyName] = $.proxy(this, fn);
					}
					fn = this[proxyName];
				} else {
					fn =  $.proxy(fn, this);
				}
				
				this[name] = window[set](fn, delay);
			};
			$.Widget.prototype[clear] = function(name){
				name = '_timer'+ name;
				if(this[name]){
					clearInterval(this[name]);
				}
				delete this._timerNames[name];
			};
		});
		
		$.fn.requiresData = function(name){
			if( this[0] ){
				var data = $.data(this[0], name);
				if(data === undefined){
					console.log("can not find "+ name +"-data on: ", this);
				}
				return data;
			}
			console.log("can not find element for requested data "+ name +" jquery object: ", this);
		};
		
		
		var oldBridge = $.widget.bridge;
		
		$.widget.bridge = function(name, obj){
			var pro = obj.prototype;
			var evtPrefix = pro.widgetEventPrefix;
			if(evtPrefix && pro.customEvents){
				evtPrefix = evtPrefix.toLowerCase();
				$.each(pro.customEvents, function(i, evt){
					$.event.customEvent[evtPrefix + evt] = true;
				});
			}
			return oldBridge.apply(this, arguments);
		};
	}
})(jQuery, this);


(function($){
	var allowFocus 	= true;
	var windowTimer;
	function stopFocus(){
		allowFocus = false;
		setTimeout(function(){
			allowFocus = true;
		}, 1);
	}
	
	function testDomTarget(e){
		var oE 	= e.originalEvent;
		
		if(e.target === document || e.target === window || $.nodeName(e.target, 'body') || $.nodeName(e.target, 'html') || $.attr(e.target, 'tabindex') === undefined ){
			stopFocus();
			return false;
		}
		
		return true;
	}
	$(window).bind('focus', function(){
		clearTimeout(windowTimer);
	});
	
	$.each(['focusin', 'focusout'], function(i, eType){
		var $evt = $.event;
		var tType = 'dom'+ eType;
		$evt.customEvent[tType] = true;
		
		$evt.special[tType] = {
			setup: function(){
				$(this)
					.bind(eType, $evt.special[tType].handler);
					
                return true;
            },
			teardown: function(){
                $(this).unbind(eType, $evt.special[tType].handler);
                return true;
            },
            handler: function(e){
				
				if(testDomTarget(e)){
					if(eType == 'focusin'){
						var that = this;
						windowTimer = setTimeout(function(){
							e = $.extend({}, e, {type: tType});
							$evt.handle.call(that, e);
						}, 1);
					} else {
						e = $.extend({}, e, {type: tType});
						return $evt.handle.call(this, e);
					}
	                
				}
				return undefined;
            }
		};
		
	});
	
	/*
	 * timer
	 */

	var clearInterval 	= window.clearInterval,
		setInterval 	= window.setInterval,
		setTimeout 		= window.setTimeout
	;
	$.createTimer = function(obj){
		
		function clear(name){
			if(obj[name] !== undefined){
				clearInterval(obj[name]);
			}
		}
		
		return {
			setInterval: function(name, fn, delay){
				clear(name); 
				obj[name] = setInterval(function(){fn.call(obj);}, delay);
			},
			setDelay: function(name, fn, delay){
				clear(name);
				obj[name] = setTimeout(function(){fn.call(obj);}, delay);
			},
			clear: clear
		};
	};
})(jQuery);
(function($){
	
	var version = parseInt($.browser.version, 10);
	
	$.support.waiAria = (!$.browser.msie || version > 7);
	$.notIE6 = (!$.browser.msie || version > 6);
	$.browser.lteIE6 = ($.browser.msie && version < 7);
	$.browser.lteIE7 = ($.browser.msie && version < 8);
	$.browser.lteIE8 = ($.browser.msie && version < 9);
	
	$.browser.gteIE6 = ($.browser.msie && version >= 6);
	$.browser.gteIE7 = ($.browser.msie && version >= 7);
	$.browser.gteIE8 = ($.browser.msie && version >= 8);
	
	var offsetBaseCSS 	= 'position: absolute; width: 1px; height: 1px; overflow: hidden;margin: 0; padding: 0;top: 0;',
		offsetDir 		= ($('html').attr('dir') === 'rtl' && !$.browser.opera) ? (($.browser.lteIE7) ? 'top: -99999em' : 'right: -99999em;') : 'left: -99999em;',
		offsetCSS 		= offsetBaseCSS+offsetDir
	;
	
	if($.fx.interval < 16){
		$.fx.interval = 17;
		if($.browser.lteIE8 || $.browser.mozilla && version < 2){
			$.fx.interval = 25;
		}
		$(function(){
			try{
				if($.fx.interval < 26 && $(window).width() < 490 && $(window).height() < 490){
					$.fx.interval = 33;
				}
			} catch(e){}
		});
	}
	
	
	/*
	 * HCM-Detection
	 */
	$.ui.userMode = (function(){
		var userBg, 
			elemTimer, 
			testDiv;
		
		function testBg(_force){
			if(_force !== true && console.firebug && console.info){return;}
			if(!testDiv || !testDiv[0]){
				testDiv = $('<div style="'+ offsetCSS +'" />').appendTo('body');
				if(!testDiv[0]){return false;}
			}
			var black = $.curCSS( testDiv.css({backgroundColor: '#000000'})[0], 'backgroundColor', true),
				white = $.curCSS( testDiv.css({backgroundColor: '#ffffff'})[0], 'backgroundColor', true),
				newBgStatus = (black === white || white === 'transparent')
			;
			
			if(newBgStatus != userBg){
				userBg = newBgStatus;
				clearInterval(elemTimer);
				elemTimer = setTimeout(function(){
					$.event.trigger({type: 'usermode', disabled: !userBg, enabled: userBg});
				}, 1);
				
			}
			return userBg;
		}
		
		setInterval(testBg, 3000);
				
		$.event.special.usermode = {
			add: function(handler){
				
				var elem =  this;
				elemTimer = setTimeout(function(){
					$(elem).triggerHandler({type: 'usermode', disabled: !userBg, enabled: userBg});
					elem = null;
				}, 0);
				//always trigger
				testBg(true);
				return handler;
			},
			setup: $.noop,
			teardown: $.noop,
			handler: $.noop
		};
		
		return {
			get: testBg
		};
		
	})();
	
	$.fn.userMode = function(fn){
		
		return this[(fn) ? 'bind' : 'trigger']('usermode', fn);
	};
	$.event.customEvent.usermode = true;
	$(function(){
		$('html').userMode(function(e){
			$(this)[e.enabled ? 'addClass' : 'removeClass']('hcm');
		});
	});
	
	(function($){
		
		function handleAriaClick(e){
			var preventClick = $.data(e.target, 'preventSecondClick');
			if(!preventClick && (!e.keyCode || e.keyCode === 13 || ( e.keyCode === 32 && $.attr(e.target, 'role') === 'button' ) )){
				if(e.type != 'click'){
					$.data(e.target, 'preventSecondClick', true); 
				}
				setTimeout(function(){
					$.removeData(e.target, 'preventSecondClick');
				}, 1);
				return $.event.special.ariaclick.handler.apply(this, arguments);
			} else if(preventClick && e.type == 'click'){
				e.preventDefault();
				return false;
			}
			return undefined;
		}
		$.event.special.ariaclick = {
			setup: function(){
				$(this).bind('click keypress', handleAriaClick);
	            return true;
	        },
			teardown: function(){
	            $(this).unbind('click keypress', handleAriaClick);
	            return true;
	        },
	        handler: function(e){
	            e.type = 'ariaclick';
	            return $.event.handle.apply(this, arguments);
	        }
		};
	})(jQuery);
	
	
	/* EM-Change */
	$.bodyDefaultFontsize = 10;
	$.testEm = (function(){
		var body,
			timer,
			evt = {
					type: 'emchange',
					emPx: 0,
					oldEmPx: 0
			},
			intervalDelay = 1000,
			html = $(document.documentElement)
		;
				
		var test = function(){
			var oldEmPx = evt.emPx;
			evt.emPx = parseInt($.curCSS(body, 'fontSize', true), 10);
			if(evt.emPx !== oldEmPx){
				evt.oldEmPx = oldEmPx;
				$.event.trigger(evt);
			}
			return evt;
		};
		
		test.changeInterval = function(interval){
			intervalDelay = interval;
			if(body){
				clearInterval(timer);
				timer = setInterval(test, interval);
			}
		};
		
		var addEmClass = function(e){
			var dif 	= e.emPx - $.bodyDefaultFontsize,
				prefix	= (dif > 0) ? 'em-increased-' : 'em-decreased-',
				newCl 	= []
			;

			dif = Math.abs(dif) + 1;
			while (dif-- > 1) {
				newCl.push(prefix + dif);
			}
			html[0].className = $.grep(html[0].className.split(' '), function(n){
				return (n.indexOf('em-increased-') !== 0 && n.indexOf('em-decreased-') !== 0);
			}).concat(newCl).join(' ');
		};
			
		$.event.customEvent.emchange = true;
		var init = function(){
			body = document.body;
			
			html.bind('emchange', addEmClass);
			test();
			test.changeInterval(intervalDelay);
		};
		
		if(document.body){
			init();
		} else {
			$(init);
		}
		return test;
	})();
		
	(function($){
		var allowFocus 		= true,
			currentFocus 	= document,
			supActiveElem 	= ('activeElement' in document),
			// Jaws 8/9 needs at least 54ms
			minFocusTimer 	= 70,
			keyFocusTimer,
			focusTimer
		;
		
		function stopKeyFocus(e){
			allowFocus = false;
			clearTimeout(keyFocusTimer);
			setTimeout(function(){
				allowFocus = true;
				clearTimeout(keyFocusTimer);
			}, 55);
		}
		
		
		function addFocus(e){
			var jElm = $(e.target).addClass('a11y-focus');
			
			currentFocus = e.target;
			if(!supActiveElem){
				document.activeElement = e.target;
			}
			clearTimeout(keyFocusTimer);
			keyFocusTimer = setTimeout(function(){
				if(allowFocus){
					jElm.addClass('a11y-focus-key').trigger('keyfocus');
				}
			}, 0);
			
		}
		
		$(document)
			.bind('mousedown click', stopKeyFocus)
			.bind('domfocusin', addFocus)
			.bind('focusout', function(e){
				clearTimeout(keyFocusTimer);
				$(e.target)
					.removeClass('a11y-focus-key a11y-focus-widget a11y-focus')
				;
			})
		;
		
		
		function addTabindex(jElm){
			var tabindex = jElm.attr('tabindex');
			if(!(tabindex || tabindex === 0)){
				jElm.css({outline: 'none'}).attr({tabindex: '-1'});
				if( !$.support.waiAria && jElm[0] ){
					jElm[0].hideFocus = true;
				}
			}
			return jElm;
		}
		
		$.fn.setFocus = function(opts){
			if(!this[0]){return this;}
			opts = $.extend({}, $.fn.setFocus.defaults, opts);
			var elem 			= this[0],
				jElm 			= $(elem),
				focusFn 		= function(){
								try{
									stopKeyFocus();
									elem.focus();
									jElm.addClass('a11y-focus-widget');
								} catch(e){}
							},
				fxParent
			;
			
			
			if(opts.addTabindex){
				addTabindex(jElm);
			}
			
			
			if( !opts.fast ){
				
				clearTimeout(focusTimer);
				
				//falsy focus bounce in ie / no scrollIntoView in ff workaround
				fxParent = jElm.closest(':animated', opts.context);
				if( fxParent[0] ){
					fxParent.queue(function(){
						var time = 9;
						focusTimer = setTimeout( focusFn, time );
						setTimeout(function(){
							fxParent.dequeue();
						}, time + 16);
					});
				} else {
					focusTimer = setTimeout( focusFn, minFocusTimer );//min 54
				}
			} else {
				focusFn();
			}
			return this;
		};
		
		$.fn.setFocus.defaults = {
			addTabindex: true,
			fast: false,
			context: false
		};
			
	})(jQuery);
	
	/* hide/show */
	
	$.fn.ariaHide = function(){
		$.fn.hide.apply(this, arguments);
		return this.attr({'aria-hidden': 'true'});
	};
	
	$.fn.ariaShow = function(){
		$.fn.show.apply(this, arguments);
		return this.attr({'aria-hidden': 'false'});
	};
	
	
	/*
	 * SR-Update
	 */
	$.ui.SR = (function(){
		var alertBox, boxTimer, statusBox, statusTimer;
		
		return {
			update: $.noop,
			alert: ($.support.waiAria) ? 
				function (notice){
						$.ui.SR.init();
						clearTimeout(boxTimer);
						alertBox.ariaHide().html(notice).find('*').attr({
							role: 'presentation'
						}).end().ariaShow();
						
						boxTimer = setTimeout(function(){
							alertBox.ariaHide().empty();
						}, 999);
				} : 
				$.noop
			,
			giveStatus: ($.support.waiAria) ? 
				function (text){
					$.ui.SR.init();
					text = $('<div>'+ text +'</div>')
							.find('*')
							.attr({role: 'presentation'})
						.end();
					statusBox.html(text);
					clearTimeout(statusTimer);
					statusTimer = setTimeout(function(){
						statusBox.empty();
					}, 999);
				} : 
				$.noop
			,
			init: function (){
				if(alertBox && statusBox){return;}
				alertBox = $('<div class="a11y-hidden" role="alert" style="'+ offsetCSS +'" />').ariaHide().appendTo('body');
				statusBox = $('<div class="a11y-hidden" style="'+ offsetCSS +'"><div aria-live="polite" relevant="additions text" /> </div>');
				if($.support.waiAria){
					$(function(){
						alertBox.appendTo('body');
						statusBox = statusBox.appendTo('body').find('div');
					});
				}
			}
		};
	})();
	
	
	/*
	 * getID-Exts
	 */
	
	if(!$.fn.getID){
		var uId = new Date().getTime();
		$.fn.getID = function(setAll){
			
			function setID(){
				var id 		= this.getAttribute('id');
				if(!id){
					id = 'ID-' + (uId++);
					this.setAttribute('id', id);
				}
				return id;
			}
			if(this[0]){
				if(setAll){
					this.each(setID);
				}
				return setID.call(this[0]);
			}
			return undefined;
		};
	}
	
	$.each({
		labelWith: 'aria-labelledby',
		describeWith: 'aria-describedby',
		ownsThis: 'aria-owns',
		controlsThis: 'aria-controls',
		activateThis: 'aria-activedescendant'
	}, function(name, prop){
		$.fn[name] = function(elem){
			return this.attr(prop, $(elem).getID() || '');
		};
	});

	/*
	*  enterLeave
	*  hover = focusblur
	*/
	var inReg 	= /focusin|focus$|mouseenter|mouseover/,
		inID 	= 0
	;	
	$.fn.enterLeave = function(enter, out, opts){
		opts = $.extend({}, $.fn.enterLeave.defaults, opts);
		inID++;
		var dataID = 'enterLeaveData-'+inID;
		var eventTypes 	= 'mouseenter mouseleave focusin focusout';
		
		if(opts.useEventTypes === 'mouse'){
			eventTypes = 'mouseenter mouseleave';
		} else if(opts.useEventTypes === 'focus'){
			eventTypes = 'focusin focusout';
		}
		var handler = function handler(e){
			var fn,
				inOutData = $.data(this, dataID) || $.data(this, dataID, {inEvents: 0, events: {enter: enter, leave: out}}),
				params,
				elem = this,
				evt
			;
			if(inReg.test(e.type)){
				fn = enter;
				params =  [1, 'in', true];
				//webkit autoblur prevention 
				if(opts.useWebkitAutoBlur){
					inOutData.autoBlur = true; 
					setTimeout(function(){
						inOutData.autoBlur = false;
					}, 0);
				}
			} else {
				fn = out;
				params = [-1, 'out', false];
				if(inOutData.autoBlur){
					return;
				}
			}
			
			clearTimeout(inOutData.inOutTimer);
			inOutData.inEvents = Math.max(inOutData.inEvents + params[0], 0);
			inOutData.inOutTimer = setTimeout(function(){
				if(params[2] != inOutData.inOutState && 
						(params[2] || !opts.bothOut || !inOutData.inEvents) && (opts.useEventTypes != 'focus' || $.contains(elem, document.activeElement) == params[2])){
					
					inOutData.inOutState = params[2];
					evt = $.Event(params[1]);
					evt.originalEvent = e;
					$.extend(evt, {target: e.target, currentTarget: e.currentTarget});
					fn.call(elem, evt);
				}
			}, /focus/.test(e.type) ? opts.keyDelay : opts.mouseDelay);
		};
		return this[opts.bindStyle](eventTypes, handler);
	};
	
	$.fn.enterLeave.defaults = {
		mouseDelay: 0,
		keyDelay: 1,
		bothOut: false,
		useEventTypes: 'both', // both || mouse || focus
		useWebkitAutoBlur: false,
		bindStyle: 'bind' //live
	};
	
	$.fn.inOut = $.fn.enterLeave;
	
	$.fn.slideParentDown = function(opts){
		opts = $.extend({}, $.fn.slideParentDown.defaults, opts);
		var fn = opts.complete;
		
		return this.each(function(){
			
			var jElm 		= $(this),
				parent		= jElm.parent().css({height: ''}),
				outerHeight
			;
			jElm.css((opts.hideStyle === 'visibility') ? {visibility: ''} : {display: 'block'});
			outerHeight = parent.height();
						
			parent
				.css({overflow: 'hidden', height: '0px'})
				.animate(
					{
						height: outerHeight
					}, 
					$.extend({}, opts, {complete: function(){
						parent.css({height: ''});
						jElm.css((opts.hideStyle === 'visibility') ? {visibility: ''} : {display: 'block'});
						fn.apply(this, arguments);
						parent = jElm = null;
					}})
				)
			;
			
			
		});
	};
	$.fn.slideParentDown.defaults = {
		duration: 400,
		complete: $.noop,
		hideStyle: 'display'
	};
		
	$.fn.slideParentUp = function(opts){
		opts = $.extend({}, $.fn.slideParentUp.defaults, opts);
		var fn = opts.complete;
		return this.each(function(){
			var jElm 		= $(this),
				parent		= jElm.parent().css({overflow: 'hidden'}),
				cssProp 	= {height: '0px'}
			;
			if($.browser.mozilla && opts.flickrFix){
				cssProp.flickrFix = Math.random() * 2;
			}
			parent
				.animate(cssProp, $.extend({}, opts, {
					complete: function(){
						if(opts.hideStyle === 'visibility'){
							jElm.css({visibility: 'hidden'});
						} else {
							jElm.css({display: 'none'});
							parent.css({height: '', overflow: '', display: ''});
						}
						fn.apply(this, arguments);
						parent = jElm = null;
					}
				}));
		});
	};
	$.fn.slideParentUp.defaults = {
		duration: 400,
		hideStyle: 'display',
		complete: $.noop,
		flickrFix: false
	};
	
	$.fn.fadeInTo = function(){
		var args = arguments;
		return this.each(function(){
			var jElm = $(this);
			
			if(jElm.css('display') === 'none'){
				jElm.css({opacity: '0'}).show();
			}
			$.fn.fadeTo.apply(jElm, args);
		});
	};
	
	var protocol = location.protocol;
	$.form2AjaxOpts = function(form, opts){
		form = $(form);
		opts = opts || {};
		var ret = {
			url: form[0].action,
			type: form[0].method || 'GET'
		};
		ret.url = ret.url.replace('http:', protocol);
		if(opts.data){
			if(typeof opts.data == 'string'){
				ret.data = form.serialize()+'&'+ opts.data;
			} else if($.isArray(opts.data)){
				ret.data = $.merge(form.serializeArray(), opts.data);
			} else if('name' in opts.data && 'value' in opts.data){
				ret.data = form.serializeArray().push(opts.data);
			} else {
				ret.data = form.serializeArray();
				$.each(opts.data, function(name, value){
					ret.data.push({name: name, value: value});
				});
			}
		} else {
			ret.data = form.serializeArray();
		}
		delete opts.data;
		return $.extend(ret, opts);
	};
	
})(jQuery);