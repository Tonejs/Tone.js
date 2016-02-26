(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var manager = require('./lib/core/manager');
var domUtils = require('./lib/utils/dom');
var drawingUtils = require('./lib/utils/drawing');
var mathUtils = require('./lib/utils/math');
var extend = require('extend');
var WebFont = require('webfontloader');

/************************************************
*  INSTANTIATE NX MANAGER AND CREATE ELEMENTS   *
************************************************/

window.nx = new manager();
window.nx.onload = function() {};
window.nx = extend(window.nx,domUtils)
window.nx = extend(window.nx,drawingUtils)
window.nx = extend(window.nx,mathUtils)

/* this onload function turns canvases into nexus elements,
 * using the canvas's id as its var name */

window.onload = function() {
  try {
    WebFont.load({
      google: {
        families: ['Open Sans']
      }
    });
  } catch(e) {
    console.log("font not loaded")
  }

  nx.addStylesheet();

  // get all canvases on the page and add them to the manager
  var allcanvi = document.getElementsByTagName("canvas");
  for (i=0;i<allcanvi.length;i++) nx.transform(allcanvi[i]);

  if (nx.isTouchDevice) {
    document.addEventListener("touchmove", nx.blockMove, true);
    document.addEventListener("touchstart", nx.blockMove, true);
  }
  
  nx.onload();

  nx.startPulse();
  
};
},{"./lib/core/manager":2,"./lib/utils/dom":4,"./lib/utils/drawing":5,"./lib/utils/math":6,"extend":52,"webfontloader":53}],2:[function(require,module,exports){

/** 
  @title NexusUI API
  @overview NexusUI is a JavaScript toolkit for easily creating musical interfaces in web browsers. Interfaces are rendered on HTML5 canvases and are ideal for web audio projects, mobile apps, or for sending OSC to external audio applications like Max.
  @author Ben Taylor, Jesse Allison, Yemin Oh, Sébastien Piquemal
  @copyright &copy; 2011-2014
  @license MIT
 */ 
 

var timingUtils = require('../utils/timing');
var drawingUtils = require('../utils/drawing');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var transmit = require('../utils/transmit');
//var WAAClock = require('waaclock');


var manager = module.exports = function() {

/** 

  @class nx
  @description Central nexusUI manager with shared utility functions for all nexusUI objects
  
*/

  EventEmitter.apply(this)

  /**@property {object} widgets Contains all interface widgets (e.g. nx.widgets.dial1, nx.widgets.toggle1) */
  this.widgets = new Object();

  this.elemTypeArr = new Array();
  this.aniItems = new Array();
  /*  @property {boolean} showLabels Whether or not to draw an automatic text label on each interface component. */
  this.showLabels = false;
  this.starttime = new Date().getTime();
  if (transmit) {
    /**  
    @method sendsTo 
    @param {string or function} [destination] Protocol for transmitting data from interfaces (i.e. "js", "ajax", "ios", "max", or "node"). Also accepts custom functions.
    ```js
    nx.sendsTo("ajax")

    // or

    nx.sendsTo(function(data) {
         //define a custom transmission function
    })
    ```
    */
    this.sendsTo = transmit.setGlobalTransmit;
    /**  
    @method setAjaxPath 
    @param {string} [path] If sending via AJAX, define the path to ajax destination
    */
    this.setAjaxPath = transmit.setAjaxPath;
    /**  @property {string} destination NexusUI's transmission protocol (i.e. "js" or "ajax"). Defaults to "js". We recommend setting this property using nx.sendsTo() which ensures that all widgets receive this setting. */
    this.destination = "js";
    /**  @property {string} ajaxPath If sending via AJAX, the destination path. Defaults to "lib/nexusOSCRelay.php". We recommend setting this property using nx.setAjaxPath() which ensures that all widgets receive this setting. */
    this.ajaxPath = "lib/nexusOSCRelay.php";
  }

  /** @property {boolean} isTouchDevice Returns true if page is loaded on a touch device. */
  this.isTouchDevice = ('ontouchstart' in document.documentElement)? true:false;
  this.metas = document.getElementsByTagName('meta');

  /**  @property {boolean} globalWidgets Whether or not to instantiate a global variable for each widget (i.e. button1). Defaults to true. Designers of other softwares who wish to keep nexusUI entirely encapsulated in the nx object may set this property to false. In that case, all widgets are accessible in nx.widgets */
  this.globalWidgets = true;

  this.font = "'open sans'";
  this.fontSize = 14;
  this.fontWeight = "normal";

  this.context = new(window.AudioContext || window.webkitAudioContext)()
 
  this.sys = navigator.userAgent.toLowerCase();
  this.isAndroid = this.sys.indexOf("android") > -1;
  this.isMobile = this.sys.indexOf("mobile") > -1;

  /**  @property {integer} throttlePeriod Throttle time in ms (for nx.throttle). */
  this.throttlePeriod = 20;


  /* extra colors */

  this.colors.borderhl = drawingUtils.shadeBlendConvert(-0.5,this.colors.border); // colors.border + [20% Darker] => colors.darkborder 
  this.colors.accenthl = drawingUtils.shadeBlendConvert(0.15,this.colors.accent);    

}

util.inherits(manager, EventEmitter)


/** 
  @method add 
  Adds a NexusUI element to the webpage. This will create an HTML5 canvas and draw the interface on it.
  @param {string} [type] NexusUI widget type (i.e. "dial").
  @param {object} [settings] (Optional.) Extra settings for the new widget. This settings object may have any of the following properties: x (integer in px), y, w (width), h (height), name (widget's OSC name and canvas ID), parent (the ID of the element you wish to add the canvas into). If no settings are provided, the element will be at default size and appended to the body of the HTML document.
  */
manager.prototype.add = function(type, args) {
  //args may have optional properties: x, y, w, h, name, parent

  if(type) {
      var canv = document.createElement("canvas");
      canv.setAttribute('nx', type);
      if (args) {
        if (args.x || args.y) {
           canv.style.position = "absolute";
        }
        if (args.x) {
           canv.style.left = args.x + "px";
        }
        if (args.y) {
           canv.style.top = args.y + "px";
        }
        if (args.w) {
           canv.style.width = args.w;
           if (typeof args.w != "string")
             canv.width = args.w;
        }
        if (args.h) {
           canv.style.height = args.h;
           if (typeof args.h != "string")
             canv.height = args.h;
        }
        if (args.parent) {
          var parent;
          if (typeof args.parent === "string") {
            parent = document.getElementById(args.parent);
          } else if (args.parent instanceof HTMLElement){
            parent = args.parent;
          } else if (args.parent instanceof jQuery){
            parent = args.parent[0];            
          }
        }
        if (args.name) {
           canv.id = args.name
        }
      }
      if (!parent) {
        var parent = document.body
      }
      parent.appendChild(canv);
      return this.transform(canv);
  }
}

/** @method transform 
Transform an existing canvas into a NexusUI widget.
@param {string} [canvasID] The ID of the canvas to be transformed.
@param {string} [type] (Optional.) Specify which type of widget the canvas will become. If no type is given, the canvas must have an nx attribute with a valid widget type.
*/
manager.prototype.transform = function(canvas, type) {
  for (var key in nx.widgets) {
    if (nx.widgets[key].canvasID == canvas.id) {
      return;
    }
  }
  if (type) {
    var nxType = type;
  } else {
    var nxType = canvas.getAttribute("nx");
  }

  if (!nxType) {
    return;
  }
  var elemCount = 0;
  var newObj;

  /* find out how many of the same elem type have come before
    i.e. nx.elemTypeArr will look like [ dial, dial, toggle, toggle ]
    allowing you to count how many dials already exist on the page
    and give your new dial the appropriate index and id: dial3 */

  for (j=0;j<this.elemTypeArr.length;j++) {
    if (this.elemTypeArr[j] === nxType) {
      elemCount++;
    }
  }

  // add your new nexus element type to the element list
  this.elemTypeArr.push(nxType);

  // check to see if it has a pre-given ID
  // and use that as its id if so
  if (!canvas.id) {
    var idNum = elemCount + 1;
    canvas.id = nxType + idNum;
  }

  if(nxType) {
    try {
      var newObj = new (require('../widgets')[nxType])(canvas.id);
    } catch (err) {
      console.log("creation of " + nxType + " failed");
      return;
    }
  }

  newObj.type = nxType;

  this.widgets[newObj.canvasID] = newObj;
  if (this.globalWidgets) {
    window[newObj.canvasID] = this.widgets[newObj.canvasID]
  }

  newObj.init();
  return newObj;
}

/** @method transmit 
The "output" instructions for sending a widget's data to another application or to a JS callback. Inherited by each widget and executed when each widget is interacted with or its value changes. Set using nx.sendsTo() to ensure that all widgets inherit the new function correctly.
@param {object} [data] The data to be transmitted. Each property of the object will become its own OSC message. (This works with objects nested to up to 2 levels).
*/

manager.prototype.transmit = function(data, passive) {
  //console.log(passive + " manager.transmit")
    this.makeOSC(this.emit, data, passive);
    this.emit('*',data, passive);
} 

/** 
  @method colorize
  @param {string} [aspect] Which part of ui to change, i.e. "accent" "fill", "border"
  @param {string} [color] Hex or rgb color code
  Change the color of all nexus objects, by aspect ([fill, accent, border, accentborder]
  
  ```js
  nx.colorize("#00ff00") // changes the accent color by default
  nx.colorize("border", "#000000") // changes the border color
  ```

**/
manager.prototype.colorize = function(aspect, newCol) {
  
  if (!newCol) {
    // just sending in a color value colorizes the accent
    newCol = aspect;
    aspect = "accent";
  }
  
  this.colors[aspect] = newCol;

  this.colors.borderhl = drawingUtils.shadeBlendConvert(0.1,this.colors.border,this.colors.black); // colors.border + [20% Darker] => colors.darkborder 
  this.colors.accenthl = drawingUtils.shadeBlendConvert(0.3,this.colors.accent);  
  
  for (var key in this.widgets) {
    this.widgets[key].colors[aspect] = newCol;
    this.widgets[key].colors["borderhl"] = this.colors.borderhl;
    this.widgets[key].colors["accenthl"] = this.colors.accenthl;

    this.widgets[key].draw();
  }

}
  

/** @method setThrottlePeriod 
Set throttle time of nx.throttle, which controls rapid network transmissions of widget data.
@param {integer} [throttle time] Throttle time in milliseconds. 
*/
manager.prototype.setThrottlePeriod = function(newThrottle) {
  this.throttlePeriod = newThrottle;
  for (var key in this.widgets) {
    this.widgets[key].throttlePeriod = this.throttlePeriod;
  }
}



  /*  
   *    GUI
   */

/**  @property {object} colors The interface's color settings. Set with nx.colorize(). */
manager.prototype.colors = { 
  "accent": "#ff5500", 
  "fill": "#eeeeee", 
  "border": "#e3e3e3",
  "mid": "#1af",
  "black": "#000000",
  "white": "#FFFFFF"
};

/**  @method startPulse 
  Start an animation interval for animated widgets (calls nx.pulse() every 30 ms). Executed by default when NexusUI loads.
*/
manager.prototype.startPulse = function() {
  this.pulseInt = setInterval("nx.pulse()", 30);
}

/**  @method stopPulse 
  Stop the animation pulse interval.
*/
manager.prototype.stopPulse = function() {
  clearInterval(this.pulseInt);
}

/**  @method pulse 
  Animation pulse which executes all functions stored in the nx.aniItems array.
*/
manager.prototype.pulse = function() {
  for (var i=0;i<this.aniItems.length;i++) {
    this.aniItems[i]();
  }
} 

manager.prototype.addAni = function(fn) {

}

manager.prototype.removeAni = function(fn) {
  this.aniItems.splice(this.aniItems.indexOf(fn));
}
  
manager.prototype.addStylesheet = function() {
  var htmlstr = '<style>'
    + 'select {'
    + 'width: 150px;'
    + 'padding: 5px 5px;'
    + 'font-size: 16px;'
    + 'color:#666666;'
    + 'border: solid 2px #e4e4e4;'
    + 'border-radius: 0;'
    + '-webkit-appearance: none;'
    //+ 'border: 0;'
    + 'outline: none;'
   // + 'cursor:pointer;'
    + 'background-color:#EEE;'
    + 'font-family:"open sans";'
    + '}'
    + ''
    + 'input[type=text]::-moz-selection { background: transparent; }'
    + 'input[type=text]::selection { background: transparent; }'   
    + 'input[type=text]::-webkit-selection { background: transparent; }' 
    + ''
    + 'canvas { '
   // + 'cursor:pointer;'
    + 'border-radius:0px;'
    + 'moz-border-radius:0px;'
    + 'webkit-border-radius:0px;'
    + 'box-sizing:border-box;'
    + '-moz-box-sizing:border-box;'
    + '-webkit-box-sizing:border-box;'
    + '}'
    + ''
    + 'input[type=text] { '
   // + 'cursor:pointer;'
    + 'border-radius:5px;'
    + 'moz-border-radius:5px;'
    + 'webkit-border-radius:5px;'
    + 'box-sizing:border-box;'
    + '-moz-box-sizing:border-box;'
    + '-webkit-box-sizing:border-box;'
    + '}'
    + '</style>';

  document.head.innerHTML = document.head.innerHTML + htmlstr
}

/**  @method setViewport
    Set mobile viewport scale (similar to a zoom)
    @param {integer} [scale] Zoom ratio (i.e. 0.5, 1, 2) */
manager.prototype.setViewport = function(scale) {
  for (i=0; i<this.metas.length; i++) {
    if (this.metas[i].name == "viewport") {
      this.metas[i].content = "minimum-scale="+scale+", maximum-scale="+scale;
    }
  }
}

/*  @method setLabels
    Tell all widgets whether or not draw text labels on widgets
    @param {boolean} [on/off] true to add labels, false to remove labels
 */
manager.prototype.setLabels = function(onoff) {
  if (onoff=="on") {
    this.showLabels = true;
  } else {
    this.showLabels = false;
  }
  for (var key in this.widgets) {
    this.widgets[key].draw()
  }
}

manager.prototype.setProp = function(prop,val) {
  if (prop && val) {
    nx[prop] = val;
    for (var key in this.widgets) {
      this.widgets[key][prop] = val;
      this.widgets[key].draw()
    } 
  }
}

manager.prototype.blockMove = function(e) {
  if (e.target.attributes["nx"]) {
     e.preventDefault();
     if (this.isAndroid) {
       e.stopPropagation ? e.stopPropagation() : false;
     }
  }
}

manager.prototype.calculateDigits = function(value) {
  var nondecimals = this.max ? Math.floor(this.max).toString().length : 1
  if (nondecimals < this.maxdigits) {
    var decimals = 3-nondecimals
  } else {
    var decimals = 0
  }
  var valdigits = nondecimals + decimals
  return {
    wholes: nondecimals,
    decimals: decimals,
    total: nondecimals + decimals, 
  }
}

manager.prototype.themes = {
  "light": {
    "fill": "#DDDDDD",
    "border": "#DADADA",
    "black": "#000000",
    "white": "#FFFFFF",
    "body": "#F3F3F3"
  },
  "dark": {
    "fill": "#222",
    "border": "#292929",
    "black": "#FFFFFF",
    "white": "#000000",
    "body": "#111"
  },
  "red": "#f24",
  "orange": "#f50",
  "yellow": "#ec1",
  "green": "#1c9",
  "blue": "#09d",
  "purple": "#40a",
}

manager.prototype.skin = function(name) {

  var names = name.split("-")

  nx.colorize("fill", nx.themes[names[0]].fill)
  nx.colorize("border", nx.themes[names[0]].border)
  nx.colorize("black", nx.themes[names[0]].black)
  nx.colorize("white", nx.themes[names[0]].white)

  nx.colorize("accent", nx.themes[names[1]])

  document.body.style.backgroundColor = nx.themes[names[0]].body
}


manager.prototype.labelSize = function(size) {
  for (var key in this.widgets) {
    var widget = this.widgets[key]
     
    if (widget.label) {
      var newheight = widget.GUI.h + size
      widget.labelSize = size
      if (["select","number","text"].indexOf(widget.type)<0) {
        widget.resize(false,newheight)
      }
    }
  }
  var textLabels = document.querySelectorAll(".nxlabel");
  console.log(textLabels)
 
  for (var i = 0; i < textLabels.length; i++) {
      console.log(textLabels[i])
      textLabels[i].style.fontSize = size/2.8+"px"
      console.log(textLabels[i].style.fontSize)
  }
}




},{"../utils/drawing":5,"../utils/timing":7,"../utils/transmit":8,"../widgets":18,"events":47,"util":51}],3:[function(require,module,exports){
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var domUtils = require('../utils/dom');
var drawingUtils = require('../utils/drawing');
var timingUtils = require('../utils/timing');
var transmit = require('../utils/transmit');



var widget = module.exports = function (target) {
  EventEmitter.apply(this)
  this.preClick = this.preClick.bind(this)
  this.preMove = this.preMove.bind(this)
  this.preRelease = this.preRelease.bind(this)
  this.preTouch = this.preTouch.bind(this)
  this.preTouchMove = this.preTouchMove.bind(this)
  this.preTouchRelease = this.preTouchRelease.bind(this)

/** 

  @class widget
  All NexusUI interface widgets inherit from the widget class. The properties and methods of the widget class are usable by any NexusUI interface.
  
*/

  /**  @property {string} canvasID ID attribute of the interface's HTML5 canvas */
  this.canvasID = target;
  /**  @property {string} oscPath OSC prefix for this interface. By default this is populated using the canvas ID (i.e. an ID of dial1 has OSC path /dial1) */
  this.oscPath = "/"+target;
  if (!document.getElementById(target)) {
    var newcanv = document.createElement("canvas")
    newcanv.id = target;
    document.body.appendChild(newcanv)
  }
  /**
   * @property {string} type The type of NexusUI widget (i.e. "dial", "toggle", "slider"). Set automatically at creation.
   */
  this.type = undefined;
  /**  @property {DOM element} canvas The widget's HTML5 canvas */
  this.canvas = document.getElementById(target);
  /**  @property {HTML5 drawing context} context The canvas's drawing context */
  this.context = this.canvas.getContext("2d");

  this.checkPercentage();
  this.canvas.className = this.canvas.className ? this.canvas.className += " nx" : "nx"

  this.canvas.height = window.getComputedStyle(document.getElementById(target), null).getPropertyValue("height").replace("px","");
  this.canvas.width = window.getComputedStyle(document.getElementById(target), null).getPropertyValue("width").replace("px","");
  /**  @property {integer} height The widget canvas's computed height in pixels */
  this.height = parseInt(window.getComputedStyle(document.getElementById(target), null).getPropertyValue("height").replace("px",""));
  /**  @property {integer} width The widget canvas's computed width in pixels */
  this.width = parseInt(window.getComputedStyle(document.getElementById(target), null).getPropertyValue("width").replace("px",""));
  if (!this.defaultSize) {
    /**  @property {object} defaultSize The widget's default size if not defined with HTML/CSS style. (Has properties 'width' and 'height', both in pixels) */
    this.defaultSize = { width: 100, height: 100 };
  }
  
  /**  @property {boolean} label Whether or not to draw a text label this widget.   */
  this.label = false
  this.labelSize = 30
  this.labelAlign = "center"
  this.labelFont = "'Open Sans'"

  if (this.canvas.getAttribute("label")!=null) {
    this.label = this.canvas.getAttribute("label")
    this.origDefaultHeight = this.defaultSize.height
  }
  if (this.label) {
    this.defaultSize.height += this.labelSize
  }

  if (this.width==300 && this.height==150) {
    this.canvas.width = this.defaultSize.width*2;
    this.canvas.height = this.defaultSize.height*2;
    this.width = this.defaultSize.width;
    this.height = this.defaultSize.height;
  } else {
  	var proxyw = this.width;
  	var proxyh = this.height;
  	this.canvas.width = proxyw*2;
    this.canvas.height = proxyh*2;
    this.width = proxyw;
    this.height = proxyh;
  }
  this.canvas.style.width = this.canvas.width/2+"px";
  this.canvas.style.height = this.canvas.height/2+"px";
  this.context.scale(2,2)


  this.makeRoomForLabel()

  /**  @property {object} offset The widget's computed offset from the top left of the document. (Has properties 'top' and 'left', both in pixels) */
  this.offset = domUtils.findPosition(this.canvas);
  /**  @property {object} center The center of the widget's canvas. A 100x100 widget would have a center at 50x50. (Has properties 'x' and 'y', both in pixels) */
  this.center = {
    x: this.GUI.w/2,
    y: this.GUI.h/2
  };
  //drawing
  /**  @property {integer} lineWidth The default line width for drawing (default is 2 pixels). In many widgets, this is overwritten to suite the widget. However it does dictate the border width on most widgets. */
  this.lineWidth = 2;
  this.context.lineWidth = this.lineWidth;
  /**  @property {object} colors A widget's individual color scheme. Inherited from nx.colors. (Has properties "accent", "fill", "border", "black", and "white") */
  this.colors = new Object();
  // define colors individually so they are not pointers to nx.colors
  // this way each object can have its own color scheme
  for (var key in nx.colors) {
    this.colors[key] = nx.colors[key]
  }
  /*this.colors.accent = nx.colors.accent;
  this.colors.fill = nx.colors.fill;
  this.colors.border = nx.colors.border;
  this.colors.accentborder = nx.colors.accentborder;
  this.colors.black = nx.colors.black;
  this.colors.white = nx.colors.white; 
  this.colors.highlight = nx.colors.highlight; */
  //interaction
  /**  @property {object} clickPos The most recent mouse/touch position when interating with a widget. (Has properties x and y) */
  this.clickPos = {x: 0, y: 0};
  /**  @property {array} clickPos.touches If multitouch, an array of touch positions  */
  this.clickPos.touches = new Array();
  /**  @property {boolean} clicked Whether or not the widget is currently clicked  */
  this.clicked = false;
  this.value = 0;
    /**
      @property {object} val An object containing the core interactive values of the widget, which are also the widget's data output. 
    */
  this.val = new Object();
  this.pval = new Object();
  this.nodePos = new Array();
  /**  @property {object} deltaMove Difference between the current touch/mouse position and the previous touch/mouse position, in pixels.   */
  this.deltaMove = new Object();
  this.throttlePeriod = nx.throttlePeriod;
  this.throttle = timingUtils.throttle;
  this.hasMoved = false;
  //recording
  /**  @property {boolean} isRecording Whether or not this widget's output is being recorded to a "remix" widget */
  this.isRecording = false;
  this.tapeNum = 0;
  this.recorder = null;
  //transmission
  if (transmit) {
    /**  @method sendsTo
    Set the transmission protocol for this widget individually 
    @param {string or function} [destination] Protocol for transmitting data from this widget (i.e. "js", "ajax", "ios", "max", or "node"). Also accepts custom functions.
    ```js
    dial1.sendsTo("ajax")

    // or

    dial1.sendsTo(function(data) {
         //define a custom transmission function
    })
    ```  
    */
    this.sendsTo = transmit.setWidgetTransmit;
    this.destination = "js";
  }
  this.events = new Object();

  // Setup interaction
  if (nx.isTouchDevice) {
    this.canvas.ontouchstart = this.preTouch;
    this.canvas.ontouchmove = this.preTouchMove;
    this.canvas.ontouchend = this.preTouchRelease;
  } else {
    this.canvas.addEventListener('mousedown', this.preClick, false);
  }

  this.fontSize = nx.fontSize;
  this.fontWeight = nx.fontWeight;
  this.font = nx.font;

  this.clickCB = false;
  this.releaseCB = false;

  this.actuated = true;



}
util.inherits(widget, EventEmitter)

/**  @method transmit
    The "output" instructions for sending the widget's data to another application or to a JS callback. Inherited from nx.transmit and executed when each widget is interacted with or during animation. Set using .sendsTo() to use our built-in transmission defintions.
    @param {object} [data] The data to be transmitted. Each property of the object will become its own OSC message if sending via "ajax" or "max7" protocols. (This works with objects nested to up to 2 levels).
*/
widget.prototype.transmit = nx.transmit;

/**  @method makeOSC
    Loops through an object (i.e. a widget's data), creates OSC path/value pairs, and executes a callback function with these two arguments.
    @param {function} [callback] A function defining the action to be taken with each OSC path/value pair. This function should have two parameters, path (string) and data (type depends on widget data type).
    @param {object} [data] The data as an object, to be broken into individual OSC messages.
*/
widget.prototype.makeOSC = function(action, data) {
    this.action = action;
    if ((typeof data == "object") && (data !== null)) {
      for (var key in data) {
        if ((typeof data[key] == "object") && (data[key] !== null)) {
          for (var key2 in data[key]) {
              this.action(key+"/"+key2, data[key][key2])
          }
        } else {
            this.action(key, data[key])
        }
      }
    } else if (typeof data == "number" || typeof data == "string") {
        this.action('value', data)
    }
}

// getoffset is useful as an API for others
// otherwise they would have to write
// dial1.offset = utils.findPosition()
// now it is simply:
// dial1.getOffset()

/**  @method getOffset
    Recalculate the computed offset of the widget's canvas and store it in widget.offset. This is useful if a widget has been moved after being created.
    */
widget.prototype.getOffset = function() {
  this.offset = domUtils.findPosition(this.canvas)
}

widget.prototype.preClick = function(e) {
  this.actuated = true;
  this.offset = domUtils.findPosition(this.canvas)
  this.clickPos = domUtils.getCursorPosition(e, this.offset);
  // need something like:
  // if (this.clickPos.y < this.GUI.h) { 
  document.addEventListener("mousemove", this.preMove, false);
  document.addEventListener("mouseup", this.preRelease, false);
  this.clicked = true;
  this.deltaMove.x = 0;
  this.deltaMove.y = 0;
  this.hasMoved = false;
  this.clickCB ? this.clickCB() : null;
  this.click(e);
  document.body.style.userSelect = "none";
  document.body.style.mozUserSelect = "none";
  document.body.style.webkitUserSelect = "none";
  document.body.style.cursor = "none"
}

widget.prototype.preMove = function(e) {
  this.actuated = true;
  var newClickPos = domUtils.getCursorPosition(e, this.offset);
  this.deltaMove.y = newClickPos.y - this.clickPos.y;
  this.deltaMove.x = newClickPos.x - this.clickPos.x;
  this.clickPos = newClickPos;
  this.hasMoved = true;
  this.move(e);
}

widget.prototype.preRelease = function(e) {
  this.actuated = true;
  document.removeEventListener("mousemove", this.preMove, false);
  document.removeEventListener("mouseup", this.preRelease, false);
  this.clicked = false;
  this.releaseCB ? this.releaseCB() : null;
  this.release();
  document.body.style.userSelect = "text";
  document.body.style.mozUserSelect = "text";
  document.body.style.webkitUserSelect = "text";
  document.body.style.cursor = "pointer"
}

widget.prototype.preTouch = function(e) {
  this.actuated = true;
  this.clickPos = domUtils.getTouchPosition(e, this.offset);
  this.clicked = true;
  this.deltaMove.x = 0;
  this.deltaMove.y = 0;
  this.hasMoved = false;
  this.touch(e);
}

widget.prototype.preTouchMove = function(e) {
  if (this.clicked) {
    this.actuated = true;
    var newClickPos = domUtils.getTouchPosition(e, this.offset);
    this.deltaMove.y = newClickPos.y - this.clickPos.y;
    this.deltaMove.x = newClickPos.x - this.clickPos.x;
    this.clickPos = newClickPos;
    this.hasMoved = true;
    this.touchMove(e);
  }
}

widget.prototype.preTouchRelease = function(e) {
  this.actuated = true;
  if (e.targetTouches.length>=1) {
    var newClickPos = domUtils.getTouchPosition(e, this.offset);
    this.clickPos = newClickPos;
  } else {
    this.clicked = false;
  }
  this.touchRelease();
}


/**  @method init
     Initialize or re-initialize the widget. Defined separately within each widget.
    */

/**  @method draw
    Draw the widget onto the canvas.
    */
widget.prototype.draw = function() {
}


/**  @method click
    Executes when the widget is clicked on
    */
widget.prototype.click = function() {
}


/**  @method move
    Executes on drag (mouse moves while clicked).
    */
widget.prototype.move = function() {
}


/**  @method release
    Executes when the mouse releases after having clicked on the widget.
    */
widget.prototype.release = function() {
}

/**  @method touch
    Executes when the widget is touched on a touch device.
    */
widget.prototype.touch = function() {
  this.click();
}

/**  @method touchMove
    Executes on drag (touch then move) on a touch device
    */
widget.prototype.touchMove = function() {
  this.move();
}

/**  @method touchRelease
    Executes when the touch releases after having touched the widget.
    */
widget.prototype.touchRelease = function() {
  this.release();
}

widget.prototype.adjustSizeIfDefault = function() {
  if (this.width==300 && this.height==150) {
    this.canvas.width = this.defaultSize.width;
    this.canvas.height = this.defaultSize.height;
    this.width = this.defaultSize.width;
    this.height = this.defaultSize.height;
  }
}

widget.prototype.makeRoundedBG = function() {
  this.bgLeft = this.lineWidth;
  this.bgRight = this.width - this.lineWidth;
  this.bgTop = this.lineWidth;
  this.bgBottom = this.height - this.lineWidth;
  this.bgHeight = this.bgBottom - this.lineWidth;
  this.bgWidth = this.bgRight - this.lineWidth; 
  
  drawingUtils.makeRoundRect(this.context, this.bgLeft, this.bgTop, this.bgWidth, this.bgHeight);
}

/**  @method erase
    Erase the widget's canvas.
    */
widget.prototype.erase = function() {
  this.context.clearRect(0,0,this.width,this.height);
}

widget.prototype.hideCursor = function() {
  this.canvas.style.cursor = "none";
}

widget.prototype.showCursor = function() {
  this.canvas.style.cursor = "auto";
}

// allow us to get the constructor function name programatically
//i.e. if element is a dial, this function will return "dial"
//deprecated
widget.prototype.getName = function() {
  return "deprecated -- use widget.type instead"
}

/** @method set
Manually set a widget's value (that is, set any properties of a widget's .val). See widget.val or the .val property of individual widgets for more info. 
@param {object} [data] Parameter/value pairs in object notation.
@param {boolean} [transmit] (optional) Whether or not to transmit new value after being set.
Sets the value of an object. 

```js
  position1.set({
  &nbsp;  x: 100,
  &nbsp;  y: 250
  })
```

An optional second argument decides whether the object then transmits its new value.
```js
  button1.set({
  &nbsp;  press: 100
  }, true)
```
*/
widget.prototype.set = function(data, transmit) {

  this.actuated = false;

  if (typeof this.val == "object" && this.val !== "null") {
    if (typeof data == "object" && data !== "null") {
      for (var key in data) {
        this.val[key] = data[key];
      }
    }
  } else if (typeof this.val == "string" || typeof this.val == "number") {
    if (typeof data == "object" && data !== "null") {
      this.val = data["value"];
      this.draw();
    } else if (typeof data == "string" || typeof data == "number") {
      this.val = data;
    }
  }
  this.draw();

  if (transmit) {
    this.transmit(this.val,true)
  }
}

/**  @method destroy
    Remove the widget object, canvas, and all related event listeners from the document.
    */
widget.prototype.destroy = function() {
  var type = nx.elemTypeArr.indexOf(this.getName())
  nx.elemTypeArr.splice(type,1)

  this.canvas.ontouchmove = null;
  this.canvas.ontouchend = null;
  this.canvas.onclick = null;
  this.canvas.onmousemove = null;
  this.canvas.onmouseoff = null;
  document.removeEventListener("mousemove", this.preMove, false);
  document.removeEventListener("mouseup", this.preRelease, false);

  var elemToKill = document.getElementById(this.canvasID)
  if (elemToKill) {
    elemToKill.parentNode.removeChild(elemToKill);
  }

  this.customDestroy();

  var id = this.canvasID
  delete nx.widgets[id];
  delete window[id];

}

widget.prototype.customDestroy = function() {

}

widget.prototype.wrapText = function(text, x, y, maxWidth, lineHeight) {
  if (text) {
    var words = text.split(' ');
    var line = '';

    for(var n = 0; n < words.length; n++) {
      var testLine = line + words[n] + ' ';
      var metrics = this.context.measureText(testLine);
      var testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        this.context.fillText(line, x, y);
        line = words[n] + ' ';
        y += lineHeight;
      }
      else {
        line = testLine;
      }
    }
    this.context.fillText(line, x, y);
  }
}

widget.prototype.drawLabel = function() {
  if (this.label) {
    with(this.context) {
      fillStyle = this.colors.black;
      textAlign = "center"
      textBaseline = "middle";
      font = (this.labelSize/2.8) + "px "+this.labelFont+" normal"
      fillText(this.label,this.width/2,this.labelY);
    }
  }
}

/**  @method saveCanv
     Download the widget's current graphical state as an image (png).
    */
widget.prototype.saveCanv = function() {
  var data = this.canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
  window.location.href = data
}

widget.prototype.setFont = function() {
  with (this.context) {
      textAlign = "center";
      font = this.fontWeight+" "+this.fontSize+"px "+this.font;
      fillStyle = this.colors.black;
      globalAlpha = 1;
  }
}


/* Percentage width support */


widget.prototype.checkPercentage = function() {
  var wstr = this.canvas.style.width;
  var hstr = this.canvas.style.height;
  if (wstr.indexOf("%") >= 0 || hstr.indexOf("%") >= 0) {
    this.percent = {
      w: (wstr.indexOf("%") >= 0) ? wstr.replace("%","") : false,
      h: (hstr.indexOf("%") >= 0) ? hstr.replace("%","") : false
    }
    this.stretch();
  }
}

widget.prototype.stretch = function() {
  window.addEventListener("resize", function(e) {
    if (this.percent.w) {
      var newWidth = window.getComputedStyle(this.canvas.parentNode, null).getPropertyValue("width").replace("px","");
      newWidth *= this.percent.w/100
    } else {
      var newWidth = false;
    }
    if (this.percent.h) {
      var newHeight = window.getComputedStyle(this.canvas.parentNode, null).getPropertyValue("height").replace("px","");
      newHeight *= this.percent.h/100 
    } else {
      var newHeight = false;
    }
    this.resize(newWidth,newHeight);
  }.bind(this))
}

widget.prototype.resize = function(w,h) {

  this.canvas.width = w ? w*2 : this.canvas.width;
  this.canvas.height = h ? h*2 : this.canvas.height;
  this.width =  w ? w : this.width;
  this.height = h ? h : this.height;
  this.canvas.style.width = this.width+"px";
  this.canvas.style.height = this.height+"px";
  this.context.scale(2,2)

  this.center = {
    x: this.GUI.w/2,
    y: this.GUI.h/2
  };

  this.makeRoomForLabel()

  this.init();
  this.draw();
  
}

widget.prototype.normalize = function(value) {
  return nx.scale(value,this.min,this.max,0,1)
}
widget.prototype.rangify = function(value) {
  return nx.scale(value,0,1,this.min,this.max)
}


widget.prototype.makeRoomForLabel = function() {
  this.GUI = {
    w: this.width,
    h: this.label ? this.height - this.labelSize : this.height
  }
  this.labelY = this.height - this.labelSize/2;
  // must add the above code to widget.resize
}
},{"../utils/dom":4,"../utils/drawing":5,"../utils/timing":7,"../utils/transmit":8,"events":47,"util":51}],4:[function(require,module,exports){

/** @class utils 
  Shared utility functions. These functions are exposed as methods of nx in NexusUI projects, i.e. .mtof() here can be accessed in your project with nx.mtof().
*/


/** @method findPosition 
    Returns the offset of an HTML element. Returns an object with 'top' and 'left' properties.
    @param {DOM element} [element] 
    ```js
    var button1Offset = nx.findPosition(button1.canvas)
    ```
*/
exports.findPosition = function(element) {
  var body = document.body,
      win = document.defaultView,
      docElem = document.documentElement,
      box = document.createElement('div');
  box.style.paddingLeft = box.style.width = "1px";
  body.appendChild(box);
  var isBoxModel = box.offsetWidth == 2;
  body.removeChild(box);
  box = element.getBoundingClientRect();
  var clientTop  = docElem.clientTop  || body.clientTop  || 0,
      clientLeft = docElem.clientLeft || body.clientLeft || 0,
      scrollTop  = win.pageYOffset || isBoxModel && docElem.scrollTop  || body.scrollTop,
      scrollLeft = win.pageXOffset || isBoxModel && docElem.scrollLeft || body.scrollLeft;
  return {
    top : box.top  + scrollTop  - clientTop,
    left: box.left + scrollLeft - clientLeft
  };
}

exports.getCursorPosition = function(e, canvas_offset) {
  var x;
  var y;
  if (e.pageX != undefined && e.pageY != undefined) {
    x = e.pageX;
    y = e.pageY;
  } else {
    x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
    y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
  }
  x -= canvas_offset.left;
  y -= canvas_offset.top;
  var click_position = {x: x, y: y};
  click_position.touches = [ {x: x, y: y } ];
  return click_position;
}

exports.getTouchPosition = function(e, canvas_offset) {
  var x;
  var y;
  x = e.targetTouches[0].pageX;
  y = e.targetTouches[0].pageY;
  x -= canvas_offset.left;
    y -= canvas_offset.top;
  var click_position = {x: x, y: y};

  click_position.touches = new Array();
  for (var i=0;i<e.targetTouches.length;i++) {
     click_position.touches.push({
      x: e.targetTouches[i].pageX - canvas_offset.left,
      y: e.targetTouches[i].pageY - canvas_offset.top
    });
  }
  click_position.changed = new Array();
  for (var i=0;i<e.changedTouches.length;i++) {
     click_position.changed.push({
      x: e.changedTouches[i].pageX - canvas_offset.left,
      y: e.changedTouches[i].pageY - canvas_offset.top
    });
  }
  return click_position;
}
},{}],5:[function(require,module,exports){
var math = require('./math')

/** @method randomColor
    Returns a random color string in rgb format
*/
exports.randomColor = function() {
  return "rgb(" + math.random(250) + "," + math.random(250) + "," + math.random(250) + ")";
}

/** @method hexToRgb
    Converts a hex color code to rgb format
    @param {color code} [hex] Input color code in hex format
    @param {float} [alpha] Color alpha level
*/
exports.hexToRgb = function(hex, a) {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function(m, r, g, b) {
      return r + r + g + g + b + b;
  });

  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!a) {
    a = 0.5;
  }
  
  var r = parseInt(result[1], 16);
  var g = parseInt(result[2], 16);
  var b = parseInt(result[3], 16);

  return "rgba(" + r + "," + g + "," + b + "," + a + ")";
}

exports.isInside = function(clickedNode,currObject) {
  if (clickedNode.x > currObject.x && clickedNode.x < (currObject.x+currObject.w) && clickedNode.y > currObject.y && clickedNode.y < (currObject.y+currObject.h)) {
    return true;
  } else {
    return false; 
  }
}

exports.makeRoundRect = function(ctx,xpos,ypos,wid,hgt,depth) {
  var x1 = xpos;
  var y1 = ypos;
  var x2 = wid+x1;
  var y2 = hgt+y1;
  if (!depth) {
    depth = 2;
  }
  
  ctx.beginPath();
  ctx.moveTo(x1+depth, y1); //TOP LEFT
  ctx.lineTo(x2-depth, y1); //TOP RIGHT
  ctx.quadraticCurveTo(x2, y1, x2, y1+depth);
  ctx.lineTo(x2, y2-depth); //BOTTOM RIGHT
  ctx.quadraticCurveTo(x2, y2, x2-depth, y2);
  ctx.lineTo(x1+depth, y2); //BOTTOM LEFT
  ctx.quadraticCurveTo(x1, y2, x1, y2-depth);
  ctx.lineTo(x1, y1+depth); //TOP LEFT
  ctx.quadraticCurveTo(x1, y1, x1+depth, y1);
  ctx.closePath();
}

exports.text = function(context, text, position) {
  if (!position) {
    position = [10 , 10];
  }
  with(context) {
    beginPath();
    font = "bold 12px sans-serif";
    fillText(text,position[0],position[1]);
    closePath();
  }
}

exports.shadeBlendConvert = function(p, from, to) {
    if(typeof(p)!="number"||p<-1||p>1||typeof(from)!="string"||(from[0]!='r'&&from[0]!='#')||(typeof(to)!="string"&&typeof(to)!="undefined"))return null; //ErrorCheck
    this.sbcRip=function(d){
        var l=d.length,RGB=new Object();
        if(l>9){
            d=d.split(",");
            if(d.length<3||d.length>4)return null;//ErrorCheck
            RGB[0]=i(d[0].slice(4)),RGB[1]=i(d[1]),RGB[2]=i(d[2]),RGB[3]=d[3]?parseFloat(d[3]):-1;
        }else{
            switch(l){case 8:case 6:case 3:case 2:case 1:return null;} //ErrorCheck
            if(l<6)d="#"+d[1]+d[1]+d[2]+d[2]+d[3]+d[3]+(l>4?d[4]+""+d[4]:""); //3 digit
            d=i(d.slice(1),16),RGB[0]=d>>16&255,RGB[1]=d>>8&255,RGB[2]=d&255,RGB[3]=l==9||l==5?r(((d>>24&255)/255)*10000)/10000:-1;
        }
        return RGB;}
    var i=parseInt,r=Math.round,h=from.length>9,h=typeof(to)=="string"?to.length>9?true:to=="c"?!h:false:h,b=p<0,p=b?p*-1:p,to=to&&to!="c"?to:b?"#000000":"#FFFFFF",f=this.sbcRip(from),t=this.sbcRip(to);
    if(!f||!t)return null; //ErrorCheck
    if(h)return "rgb("+r((t[0]-f[0])*p+f[0])+","+r((t[1]-f[1])*p+f[1])+","+r((t[2]-f[2])*p+f[2])+(f[3]<0&&t[3]<0?")":","+(f[3]>-1&&t[3]>-1?r(((t[3]-f[3])*p+f[3])*10000)/10000:t[3]<0?f[3]:t[3])+")");
    else return "#"+(0x100000000+(f[3]>-1&&t[3]>-1?r(((t[3]-f[3])*p+f[3])*255):t[3]>-1?r(t[3]*255):f[3]>-1?r(f[3]*255):255)*0x1000000+r((t[0]-f[0])*p+f[0])*0x10000+r((t[1]-f[1])*p+f[1])*0x100+r((t[2]-f[2])*p+f[2])).toString(16).slice(f[3]>-1||t[3]>-1?1:3);
}
},{"./math":6}],6:[function(require,module,exports){


/** @method toPolar 
    Receives cartesian coordinates and returns polar coordinates as an object with 'radius' and 'angle' properties.
    @param {float} [x] 
    @param {float} [y] 
    ```js
    var ImOnACircle = nx.toPolar({ x: 20, y: 50 }})
    ```
*/
exports.toPolar = function(x,y) {
  var r = Math.sqrt(x*x + y*y);

  var theta = Math.atan2(y,x);
  if (theta < 0.) {
    theta = theta + (2 * Math.PI);
  }
  return {radius: r, angle: theta};
}

/** @method toCartesian 
    Receives polar coordinates and returns cartesian coordinates as an object with 'x' and 'y' properties.
    @param {float} [radius] 
    @param {float} [angle] 
*/
exports.toCartesian = function(radius, angle){
  var cos = Math.cos(angle);
  var sin = Math.sin(angle);
  return {x: radius*cos, y: radius*sin*-1};
}


/** @method clip 
    Limits a number to within low and high values.
    @param {float} [input value] 
    @param {float} [low limit] 
    @param {float} [high limit] 
    ```js
    nx.clip(5,0,10) // returns 5
    nx.clip(15,0,10) // returns 10
    nx.clip(-1,0,10) // returns 0
    ```
*/
exports.clip = function(value, low, high) {
  return Math.min(high, Math.max(low, value));
}

/** @method prune 
    Limits a float to within a certain number of decimal places
    @param {float} [input value] 
    @param {integer} [max decimal places] 
    ```js
    nx.prine(1.2345, 3) // returns 1.234
    nx.prune(1.2345, 1) // returns 1.2
    ```
*/

exports.prune = function(data, scale) {
  if (typeof data === "number") {
    data = parseFloat(data.toFixed(scale));
  } else if (data instanceof Array) {
    for (var i=0;i<data.length;i++) {
      if (typeof data[i]=="number") {
        data[i] = parseFloat(data[i].toFixed(scale));
      }
    }
  }
  return data;
}


/** @method scale 
    Scales an input number to a new range of numbers
    @param {float} [input value] 
    @param {float} [low1]  input range (low)
    @param {float} [high1] input range (high)
    @param {float} [low2] output range (low)
    @param {float} [high2] output range (high)
    ```js
    nx.scale(5,0,10,0,100) // returns 50
    nx.scale(5,0,10,1,2) // returns 1.5
    ```
*/
exports.scale = function(inNum, inMin, inMax, outMin, outMax) {
  return (((inNum - inMin) * (outMax - outMin)) / (inMax - inMin)) + outMin;  
}

/** @method invert 
    Equivalent to nx.scale(input,0,1,1,0). Inverts a normalized (0-1) number. 
    @param {float} [input value]  
    ```js
    nx.invert(0.25) // returns 0.75
    nx.invert(0) // returns 1
    ```
*/
exports.invert = function (inNum) {
  return exports.scale(inNum, 1, 0, 0, 1);
}

exports.bounce = function(posIn, borderMin, borderMax, delta) {
  if (posIn > borderMin && posIn < borderMax) {
    return delta;
  } else if (posIn <= borderMin) {
    return Math.abs(delta); 
  } else if (posIn >= borderMax) {
    return Math.abs(delta) * (-1);
  }
}


/** @method mtof 
    MIDI to frequency conversion. Returns frequency in Hz.
    @param {float} [MIDI] MIDI value to convert
    ```js
    nx.mtof(69) // returns 440
    ```
*/
exports.mtof = function(midi) {
  return Math.pow(2, ((midi-69)/12)) * 440;
}


/** @method random 
    Returns a random integer between 0 a given scale parameter.
    @param {float} [scale] Upper limit of random range.
    ```js
    nx.random(10) // returns a random number from 0 to 9.
    ```
*/
exports.random = function(scale) {
  return Math.floor(Math.random() * scale);
}


exports.interp = function(loc,min,max) {
  return loc * (max - min) + min;  
}

exports.lphistory = {}


exports.lp = function(tag,value,limit) {

  if (!this.lphistory[tag]) {
    this.lphistory[tag] = []
  }

  var total = 0;

  this.lphistory[tag].push(value)

  if (this.lphistory[tag].length>limit) {
    this.lphistory[tag].splice(0,1)
  }

  for (var i=0;i<this.lphistory[tag].length;i++) {
    total += this.lphistory[tag][i]
  }

  var newvalue = total / this.lphistory[tag].length;

  return newvalue;
}


exports.lp2 = function(value,limit) {

  var total = 0;
  for (var i=0;i<this.lphistory.length;i++) {
    total += this.lphistory[i]
  }
  total += value;

  var newvalue = total / ( this.lphistory.length + 1 )

  this.lphistory.push(newvalue)

  if (this.lphistory.length>limit) {
    this.lphistory.splice(0,1)
  }

  return newvalue;
}


exports.lp3 = function(value,pvalue,limit) {

  var total = value + pvalue * limit;
  newvalue = total / (limit + 1)

  return newvalue;
}
},{}],7:[function(require,module,exports){


exports.throttle = function(func, wait) {
  var timeout;
  return function() {
    var context = this, args = arguments;
    if (!timeout) {
      // the first time the event fires, we setup a timer, which 
      // is used as a guard to block subsequent calls; once the 
      // timer's handler fires, we reset it and create a new one
      timeout = setTimeout(function() {
        timeout = null;
        try {
          func.apply(context, args);
        } catch (err) {
          console.log(err);
        }
      }, wait);
    }
  }
}
},{}],8:[function(require,module,exports){
exports.defineTransmit = function(protocol) {
  
  var newTransmit;

  if (typeof(protocol)=="function") {
    return protocol;
  } else {
    switch (protocol) {
      case 'js':
        newTransmit = function(data,passive) {
          this.makeOSC(this.emit, data, passive);
          this.emit('*',data, passive);
        }
        return newTransmit
      
      case 'ajax':
        newTransmit = function(data) {
          this.makeOSC(exports.ajaxTransmit, data);
        }
        return newTransmit
      
      case 'node':
        newTransmit = function(data) {
          this.makeOSC(exports.nodeTransmit, data);
        }
        return newTransmit
      
      case 'ios':
        newTransmit = function(data) {
          
        }
        return newTransmit
      
      case 'max':
        newTransmit = function(data) {
          this.makeOSC(exports.maxTransmit, data);
        }
        return newTransmit

      case 'wc':
        newTransmit = function(data, passive) {
          this.emit('internal',data, passive);
        }
        return newTransmit
    }
  }
}

exports.setGlobalTransmit = function(protocol) {
  var newTransmit = exports.defineTransmit(protocol)
  this.transmit = newTransmit
  this.destination = protocol
  for (var key in nx.widgets) {
    this.widgets[key].transmit = newTransmit;
    this.widgets[key].destination = protocol;
  }
}

exports.setWidgetTransmit = function(protocol) {
  var newTransmit = exports.defineTransmit(protocol)
  this.transmit = newTransmit
  this.destination = protocol
}


exports.ajaxTransmit = function(subPath, data) {

    var oscPath = subPath=='value' ? this.oscPath : this.oscPath+"/"+subPath;
     
    xmlhttp=new XMLHttpRequest();
    xmlhttp.open("POST",nx.ajaxPath,true);
    xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xmlhttp.send('oscName='+oscPath+'&data='+data);

}

exports.setAjaxPath = function(path) {
  this.ajaxPath = path;
}

exports.nodeTransmit = function(subPath, data) {
   
    var msg = {
      oscName: subPath=='value' ? this.oscPath : this.oscPath+"/"+subPath,
      value: data
    }
    socket.emit('nx', msg)

}

exports.maxTransmit = function (subPath, data) {
    var oscPath = subPath=='value' ? this.oscPath : this.oscPath+"/"+subPath;
    window.max.outlet(oscPath + " " + data);
}
},{}],9:[function(require,module,exports){
var util = require('util');
var widget = require('../core/widget');

/** 
	@class banner      
	"Powered by NexusUI" tag with a link to our website. Use it if you want to share the positive vibes of NexusUI. Thanks for using!
	```html
	<canvas nx="banner"></canvas>
	```
	<canvas nx="banner" style="margin-left:25px"></canvas>
*/

var banner = module.exports = function (target) {
	this.defaultSize = { width: 100, height: 40 };
	widget.call(this, target);
	
	//unique attributes
	/** @property {string} message1 The first line of text on the banner. */
	this.message1 = "Powered By";
	/** @property {string} message2 The second line of text on the banner. */
	this.message2 = "NexusUI";
	/** @property {string} link The URL the banner will link to. */
	this.link = "http://www.nexusosc.com";
	/** @property {boolean} isLink Whether or not the banner is a hyperlink. Defaults to true. */
	this.isLink = true;
}
util.inherits(banner, widget);

banner.prototype.init = function() {
	this.draw();
}

banner.prototype.draw = function() {
	with (this.context) {

		globalAlpha = 0.1;
		fillStyle = this.colors.accent;
		beginPath();
			moveTo(0,10);
			lineTo(10,this.GUI.h/2+5);
			lineTo(0,this.GUI.h);
			lineTo(30,this.GUI.h);
			lineTo(30,10);
			fill();
			moveTo(this.GUI.w-30,10);
			lineTo(this.GUI.w-30,this.GUI.h);
			lineTo(this.GUI.w,this.GUI.h);
			lineTo(this.GUI.w-10,this.GUI.h/2+5);
			lineTo(this.GUI.w,10);
			fill();
		closePath();
		globalAlpha = 1;

		fillStyle = this.colors.accent;
		fillRect(15,0,this.GUI.w-30,this.GUI.h-10);
		
		fillStyle = this.colors.white;
		font = this.fontWeight + " " +this.GUI.h/5+"px "+this.font;
		textAlign = "center";
		fillText(this.message1, this.GUI.w/2, this.GUI.h/3.3);
		fillText(this.message2, this.GUI.w/2, (this.GUI.h/3.3)*2);

		fillStyle = this.colors.black;
		beginPath();
			moveTo(15,this.GUI.h-10);
			lineTo(30,this.GUI.h);
			lineTo(30,this.GUI.h-10);
			lineTo(15,this.GUI.h-10);
			fill();
			moveTo(this.GUI.w-15,this.GUI.h-10);
			lineTo(this.GUI.w-30,this.GUI.h);
			lineTo(this.GUI.w-30,this.GUI.h-10);
			lineTo(this.GUI.w-15,this.GUI.h-10);
			fill();
		closePath();
	
	}
}

banner.prototype.click = function() {
	if (this.isLink) {
		window.location = this.link;
	}
}
},{"../core/widget":3,"util":51}],10:[function(require,module,exports){
var util = require('util');
var widget = require('../core/widget');
var drawing = require('../utils/drawing');

var button = module.exports = function(target) {

/** 
	
	@public
	@class button 

	Touch button with three modes of interaction ("toggle", "impulse", and "aftertouch").
	```html
	<canvas nx="button"></canvas>
	```
	<canvas nx="button" style="margin-left:25px"></canvas>
*/

	this.defaultSize = { width: 50, height: 50 };
	widget.call(this, target);

	/** 
		@property {object}  val  Main value set and output, with sub-properties:
		| &nbsp; | data
		| --- | ---
		| *press* | 0 (clicked) or 1 (unclicked)
		| *x* | 0-1 float of x-position of click ("aftertouch" mode only)
		| *y* | 0-1 float of y-position of click ("aftertouch" mode only) 
		
		When the widget is interacted with, val is sent as the output data for the widget.
		```js 
		button1.on('*', function(data) {
			// some code using data.press, data.x, and data.y
		});
		```
		Or, if NexusUI is outputting OSC (e.g. if nx.sendsTo("ajax")), val will be broken into OSC messages: 
		```html 
		/button1/press 1
		/button1/x 37
		/button1/y 126
		```
		*/
	this.val = {
		press: 0
	}
	
	/** @property {string}  mode  Interaction mode. Options:
	<b>impulse</b> &nbsp; 1 on click <br>
	<b>toggle</b> &nbsp;  1 on click, 0 on release<br>
	<b>aftertouch</b> &nbsp; 1, x, y on click; x, y on move; 0, x, y on release _(default)_ <br> 
	```js 
	button1.mode = "aftertouch" 
	```
	*/
	this.mode = "aftertouch";

	this.lockResize = true;

	this.image = null;
	this.imageHover = null;
	this.imageTouch = null;

	this.subval = new Object();

	this.init();

}
util.inherits(button, widget);

button.prototype.init = function() {
	this.center = {
		x: this.GUI.w/2,
		y: this.GUI.h/2
	}
	this.strokeWidth = this.GUI.w/20;
	this.radius = (Math.min(this.center.x, this.center.y))
	this.draw();
}

button.prototype.draw = function() {

	this.erase();
	
	with (this.context) {
		
		if (this.image !== null) {
			// Image Button
			if (!this.val.press) {
				// Draw Image if not touched
				drawImage(this.image, 0, 0);
			} else {
				if (!this.imageTouch) {

					drawImage(this.image, 0, 0);

					// No touch image, apply highlighting
					globalAlpha = 0.5;
					fillStyle = this.colors.accent;
					fillRect (0, 0, this.GUI.w, this.GUI.h);
					globalAlpha = 1;
					
				} else {
					// Draw Touch Image
					drawImage(this.imageTouch, 0, 0);
				}
			}
			
		} else {
	
			// Regular Button
			
			if (!this.val.press) {
				fillStyle = this.colors.fill
				strokeStyle = this.colors.border
			//	var strokealpha = 1
			} else if (this.val.press) {
				fillStyle = this.colors.accent;
			//	strokeStyle = this.colors.accentborder || "#fff"
				strokeStyle = this.colors.accenthl
			//	var strokealpha = 0.2
			}

			lineWidth = this.strokeWidth;

			beginPath();
				arc(this.center.x, this.center.y, this.radius, 0, Math.PI*2, true);
				fill()
			closePath()

			beginPath();
				arc(this.center.x, this.center.y, this.radius-lineWidth/2, 0, Math.PI*2, true);
			//	globalAlpha = strokealpha
				stroke()
				globalAlpha = 1
			closePath()

			if (this.val.press && this.mode=="aftertouch") {

				var x = nx.clip(this.clickPos.x,this.GUI.w*.2,this.GUI.w/1.3)
				var y = nx.clip(this.clickPos.y,this.GUI.h*.2,this.GUI.h/1.3)

				var gradient = this.context.createRadialGradient(x,y,this.GUI.w/6,this.center.x,this.center.y,this.radius*1.3);
				gradient.addColorStop(0,this.colors.accent);
				gradient.addColorStop(1,"white");

				strokeStyle = gradient;
				lineWidth = this.GUI.w/20;

				beginPath()
					arc(this.center.x, this.center.y, this.radius-this.GUI.w/40, 0, Math.PI*2, true);
					stroke()
				closePath()

			}
		}

		this.drawLabel();
		
	}
}

button.prototype.click = function(e) {
	if (drawing.isInside(this.clickPos,{x: this.center.x-this.radius, y:this.center.y-this.radius, w:this.radius*2, h:this.radius*2})) {
		this.val["press"] = 1;
		if (this.mode=="aftertouch") {
			this.val["x"] = this.clickPos.x;
			this.val["y"] = this.clickPos.y;
		}
		this.transmit(this.val);
		this.draw();
	}
}

button.prototype.move = function () {
	// use to track movement on the button
	if (this.mode=="aftertouch") {
		this.val["x"] = this.clickPos.x;
		this.val["y"] = this.clickPos.y;
		this.subval["x"] = this.clickPos.x;
		this.subval["y"] = this.clickPos.y;
		this.transmit(this.subval);
		this.draw();
	}
}

button.prototype.release = function() {
	this.val["press"] = 0;
	if (this.mode=="toggle" || this.mode=="aftertouch") { 
		this.transmit(this.val);
	}
	this.draw();
}


/** @method setImage 
	Turns the button into an image button with custom image. Sets the default (unclicked) button image.
	@param {string} [src] Image source */
button.prototype.setImage = function(image) {
	this.image = new Image();
	this.image.onload = function() { this.draw() }
	this.image.src = image;
}

button.prototype.setHoverImage = function(image) {
	this.imageHover = new Image();
	this.imageHover.onload = function() { this.draw() }
	this.imageHover.src = image;
}

/** @method setTouchImage 
	Sets the image that will show when the button is clicked.
	@param {string} [src] Image source */
button.prototype.setTouchImage = function(image) {
	this.imageTouch = new Image();
	this.imageTouch.onload = this.draw();
	this.imageTouch.src = image;
}
},{"../core/widget":3,"../utils/drawing":5,"util":51}],11:[function(require,module,exports){
var util = require('util');
var widget = require('../core/widget');

/** 
	@class colors      
	Color picker that outputs RBG values
	```html
	<canvas nx="colors"></canvas>
	```
	<canvas nx="colors" style="margin-left:25px"></canvas>
*/
				
var colors = module.exports = function (target) {
	
	this.defaultSize = { width: 100, height: 100 };	
	widget.call(this, target);

	this.init();
	
}
util.inherits(colors, widget);

colors.prototype.init = function() {

	/* new tactic */

	this.gradient1 = this.context.createLinearGradient(0,0,this.GUI.w,0)
 	this.gradient1.addColorStop(0, '#F00'); 
 	this.gradient1.addColorStop(0.17, '#FF0'); 
 	this.gradient1.addColorStop(0.34, '#0F0'); 
 	this.gradient1.addColorStop(0.51, '#0FF'); 
 	this.gradient1.addColorStop(0.68, '#00F'); 
 	this.gradient1.addColorStop(0.85, '#F0F'); 
 	this.gradient1.addColorStop(1, '#F00'); 

	this.gradient2 = this.context.createLinearGradient(0,0,0,this.GUI.h)
 	this.gradient2.addColorStop(0, 'rgba(0,0,0,255)'); 
 	this.gradient2.addColorStop(0.49, 'rgba(0,0,0,0)'); 
 	this.gradient2.addColorStop(0.51, 'rgba(255,255,255,0)'); 
 	this.gradient2.addColorStop(0.95, 'rgba(255,255,255,255)'); 

	this.draw();
}

colors.prototype.draw = function() {
	this.erase();

	with(this.context) {
		fillStyle = this.gradient1;
		fillRect(0,0,this.GUI.w,this.GUI.h)
		fillStyle = this.gradient2;
		fillRect(0,0,this.GUI.w,this.GUI.h)
	}

	this.drawLabel();
}

colors.prototype.drawColor = function() {
	with(this.context) {
		fillStyle = "rgb("+this.val.r+","+this.val.g+","+this.val.b+")"
		fillRect(0,this.GUI.h * 0.95,this.GUI.w,this.GUI.h* 0.05)

	}
}

colors.prototype.click = function(e) {
	if (this.clickPos.x > 0 && this.clickPos.y > 0 && this.clickPos.x < this.GUI.w && this.clickPos.y < this.GUI.h) {
		var imgData = this.context.getImageData(this.clickPos.x*2,this.clickPos.y*2,1,1);
	} else {
		return;
	}
	

	/** @property {object}  val  RGB color value at mouse position. <br> This is also the widget's data output (See <a href="#nexusui-api-widget-widgetval">widget.val</a>). <br> Properties:
	| &nbsp; | data
	| --- | ---
	| *r* | red value 0-256
	| *g* | green value 0-256
	| *b* | blue value 0-256 
	```js 
	colors1.on('*', function(data) {
		// some code using data.r, data.g, and data.b
	}
	```
	*/

	this.val = {
		r: imgData.data[0], 
		g: imgData.data[1], 
		b: imgData.data[2]
	}
	this.transmit(this.val);
	this.drawColor();
}


colors.prototype.move = function(e) {
	this.click(e);
}
},{"../core/widget":3,"util":51}],12:[function(require,module,exports){
var util = require('util');
var widget = require('../core/widget');

/** 
	@class comment      
	Text comment
	```html
	<canvas nx="comment"></canvas>
	```
	<canvas nx="comment" style="margin-left:25px"></canvas>
*/

var comment = module.exports = function (target) {
	
	this.defaultSize = { width: 100, height: 20 };
	widget.call(this, target);

	/** @property {object}  val   
		| &nbsp; | data
		| --- | ---
		| *text* | text of comment area (as string)
		```js 
		comment1.val.text = "This is my comment"
		comment1.draw()
		```
	*/
	
	this.val = {
		text: "comment"
	}
	this.sizeSet = false;

	this.init();
}
util.inherits(comment, widget);

/** @method setSize
	Set the font size of the comment text
	@param {integer} [size] Text size in pixels
*/
comment.prototype.setSize = function(size) {
	this.size = size;
	this.sizeSet = true;
	this.draw();
}

comment.prototype.init = function() {
	this.draw();
}

comment.prototype.draw = function() {
	if (!this.sizeSet) {
		this.size = Math.sqrt((this.GUI.w * this.GUI.h) / (this.val.text.length*2));
	}

	this.erase();
	with (this.context) {
		
		fillStyle = this.colors.fill;
		fillRect(0,0,this.GUI.w,this.GUI.h);
		
		fillStyle = this.colors.black;
		textAlign = "left";
		font = this.size+"px 'Open Sans'";
	}
	this.wrapText(this.val.text, 6, 3+this.size, this.GUI.w-6, this.size);
}
},{"../core/widget":3,"util":51}],13:[function(require,module,exports){
var math = require('../utils/math')
var util = require('util');
var widget = require('../core/widget');

/** 
	@class crossfade      
	Crossfade for panning or mixing
	```html
	<canvas nx="crossfade"></canvas>
	```
	<canvas nx="crossfade" style="margin-left:25px"></canvas>
*/

var crossfade = module.exports = function (target) {
	this.defaultSize = { width: 100, height: 30 };
	widget.call(this, target);

	/** @property {object}  val   
		| &nbsp; | data
		| --- | ---
		| *value* | Crossfade value (float -1 to 1)
	*/
	this.val = {
		R: 0.75,
		L: 0.75
	}

	this.location = 0.5

	this.init();
}
util.inherits(crossfade, widget);

crossfade.prototype.init = function() {
	this.draw();
}

crossfade.prototype.draw = function() {
	
	this.erase();

	this.location = Math.pow(this.val.R,2)
		
	with (this.context) {

		fillStyle = this.colors.fill;
		fillRect(0,0,this.GUI.w,this.GUI.h);

		var y1 = 0;
		var y2 = this.GUI.h;
		var x1 = this.location*this.GUI.w;
		//var x2 = this.GUI.w/5;
		//
		fillStyle = this.colors.accent;
		fillRect(x1,y1,this.GUI.w-x1,y2);

		textBaseline="middle"
		font = this.GUI.h/3 + "px 'Open Sans'"

		fillStyle = this.colors.accent;
		textAlign="right"
		fillText(this.val.R.toFixed(2), x1-2, this.GUI.h/4)

		fillStyle = this.colors.fill;
		textAlign="left"
		fillText(this.val.L.toFixed(2), x1+2, this.GUI.h* 0.75)


	}

	this.drawLabel()
	
}

crossfade.prototype.click = function() {
	this.move();
}

crossfade.prototype.move = function() {
	var R = math.clip(this.clickPos.x/this.GUI.w,0,1)
	var L = 1 - R
	this.location = R
	this.val.R = math.prune(Math.sqrt(R),3)
	this.val.L = math.prune(Math.sqrt(L),3)
	this.draw();
	this.transmit(this.val);
}
},{"../core/widget":3,"../utils/math":6,"util":51}],14:[function(require,module,exports){
var math = require('../utils/math');
var util = require('util');
var widget = require('../core/widget');

/** 
	@class dial      
	Circular dial
	```html
	<canvas nx="dial"></canvas>
	```
	<canvas nx="dial" style="margin-left:25px"></canvas>
*/

var dial = module.exports = function(target) {
	
	this.defaultSize = { width: 100, height: 100 };
	widget.call(this, target);
	
	//define unique attributes
	this.circleSize;
	this.handleLength;

	/** @property {object}  val
	    | &nbsp; | data
		| --- | ---
		| *value* | Current value of dial as float 0-1
	*/
	this.val = {
		value: 0
	}
	/** @property {float}  responsivity    How much the dial increments on drag. Default: 0.004<br>
	*/
	this.responsivity = 0.004;
	
	this.aniStart = 0;
	this.aniStop = 1;
	this.aniMove = 0.01;

	this.lockResize = true;

  if (this.canvas.getAttribute("min")!=null) {
    this.min = parseFloat(this.canvas.getAttribute("min"));
  } else {
  	this.min = 0
  }
  if (this.canvas.getAttribute("max")!=null) {
    this.max = parseFloat(this.canvas.getAttribute("max"));
  } else {
  	this.max = 1
  }
  if (this.canvas.getAttribute("step")!=null) {
    this.step = parseFloat(this.canvas.getAttribute("step"));
  } else {
  	this.step = 0.001
  }

	this.maxdigits = 3
	this.calculateDigits = nx.calculateDigits

	this.init();
	
}

util.inherits(dial, widget);

dial.prototype.init = function() {

	this.circleSize = (Math.min(this.center.x, this.center.y));
	this.handleLength = this.circleSize;
	this.mindim = Math.min(this.GUI.w,this.GUI.h)
	
	if (this.mindim<101 || this.mindim<101) {
		this.accentWidth = this.lineWidth * 1;
	} else {
		this.accentWidth = this.lineWidth * 2;
	}
	
	this.draw();

}

dial.prototype.draw = function() {

	var normalval = this.normalize(this.val.value)

	//var dial_angle = (((1.0 - this.val.value) * 2 * Math.PI) + (1.5 * Math.PI));
	var dial_position = (normalval + 0.25) * 2 * Math.PI
	//var point = math.toCartesian(this.handleLength, dial_angle);

	this.erase();
	
	with (this.context) {
		
		lineCap = 'butt';
		beginPath();
			lineWidth = this.circleSize/2;
			arc(this.center.x, this.center.y, this.circleSize-lineWidth/2, Math.PI * 0, Math.PI * 2, false);
			strokeStyle = this.colors.fill;
			stroke();
		closePath(); 

		//draw round accent
		lineCap = 'butt';
		beginPath();
			lineWidth = this.circleSize/2;
			arc(this.center.x, this.center.y, this.circleSize-lineWidth/2, Math.PI * 0.5, dial_position, false);
			strokeStyle = this.colors.accent;
			stroke();
		closePath(); 

		clearRect(this.center.x-this.GUI.w/40,this.center.y,this.GUI.w/20,this.GUI.h/2)

		if (normalval > 0) {
			beginPath();
			lineWidth = 1.5;
			moveTo(this.center.x-this.GUI.w/40,this.center.y+this.circleSize/2) //this.radius-this.circleSize/4
			lineTo(this.center.x-this.GUI.w/40,this.center.y+this.circleSize) //this.radius+this.circleSize/4
			strokeStyle = this.colors.accent
			stroke();
			closePath();
		}

    //figure out text size
    //
    //
    //
    this.val.value = math.prune(this.rangify(normalval),3)
		

		//var valdigits = this.max ? Math.floor(this.max).toString().length : 1
		//valdigits += this.step ? this.step < 1 ? 1 : 2 : 2
		this.digits = this.calculateDigits()

		valtextsize = (this.mindim / this.digits.total) * 0.55

		if (valtextsize > 7) {

	    var valtext = this.val.value.toFixed(this.digits.decimals)

			fillStyle = this.colors.borderhl
	    textAlign = "center"
	    textBaseline = "middle"
	    font = valtextsize+"px 'Open Sans'"
	    fillText(valtext,this.GUI.w/2,this.GUI.h/2);

	  }

	}

	this.drawLabel();
}


dial.prototype.click = function(e) {
	this.val.value = math.prune(this.val.value, 4)
	this.transmit(this.val);
	this.draw();
	this.aniStart = this.val.value;
}


dial.prototype.move = function() {	
	var normalval = this.normalize(this.val.value)
	normalval = math.clip((normalval - (this.deltaMove.y * this.responsivity)), 0, 1);
	this.val.value = math.prune(this.rangify(normalval), 4)
	this.transmit(this.val);
	
	this.draw();
}


dial.prototype.release = function() {
	this.aniStop = this.val.value;
}

/** @method animate 
	Animates the dial
	@param {string} [type] Type of animation. Currently accepts "bounce" (bounces between mousedown and mouserelease points) or "none" */
dial.prototype.animate = function(aniType) {
	
	switch (aniType) {
		case "bounce":
			nx.aniItems.push(this.aniBounce.bind(this));
			break;
		case "none":
			nx.aniItems.splice(nx.aniItems.indexOf(this.aniBounce));
			break;
	}
	
}

dial.prototype.aniBounce = function() {
	if (!this.clicked) {
		this.val.value += this.aniMove;
		if (this.aniStop < this.aniStart) {
			this.stopPlaceholder = this.aniStop;
			this.aniStop = this.aniStart;
			this.aniStart = this.stopPlaceholder;
		}
		this.aniMove = math.bounce(this.val.value, this.aniStart, this.aniStop, this.aniMove);	
		this.draw();
		this.val.value = math.prune(this.val.value, 4)
		this.transmit(this.val);
	}
}


},{"../core/widget":3,"../utils/math":6,"util":51}],15:[function(require,module,exports){
var startTime = 0;

var math = require('../utils/math')
var util = require('util');
var widget = require('../core/widget');

/** 
	@class envelope      
	Multi-point line ramp generator
	```html
	<canvas nx="envelope"></canvas>
	```
	<canvas nx="envelope" style="margin-left:25px"></canvas>
*/

var envelope = module.exports = function (target) {
	this.defaultSize = { width: 200, height: 100 };
	widget.call(this, target);
	
	this.nodeSize = 1;
	/** @property {boolean} active Whether or not the envelope is currently animating. */
	this.active = false;
	/** @property {integer} duration The envelope's duration in ms. */
	this.duration = 1000; // 1000 ms
	/** @property {boolean} looping Whether or not the envelope loops. */
	this.looping = false


	this.scanIndex = 0

	//define unique attributes
	
	/** @property {object}  val   
		| &nbsp; | data
		| --- | ---
		| *amp* | amplitude at current point of ramp (float 0-1)
		| *index* | current progress through ramp (float 0-1)
		| *points* | array containing x/y coordinates of each node.
	*/

	this.val = {
		index: 0,
		amp: 0,
		points: [
			{
				x: 0.1,
				y: 0.4
			},
			{
				x: 0.35,
				y: 0.6
			},
			{
				x: 0.65,
				y: 0.2
			},
			{
				x: 0.9,
				y: 0.4
			}
		]
	}

	// Index of which node was clicked
	this.selectedNode = null;

	nx.aniItems.push(this.pulse.bind(this));

	this.init();
}

util.inherits(envelope, widget);

envelope.prototype.init = function() {
	this.mindim = this.GUI.w < this.GUI.h ? this.GUI.w : this.GUI.h;
	this.draw();
}

envelope.prototype.draw = function() {
	this.erase();
	with (this.context) {
		fillStyle = this.colors.fill;
		fillRect(0,0,this.GUI.w,this.GUI.h);
		fillStyle = this.colors.accent;
		var centerx = this.mindim/10
		var centery = this.GUI.h-this.mindim/10
		beginPath()
			moveTo(centerx,centery)
			arc(centerx,centery,this.mindim/10,Math.PI*1.5,Math.PI*2*this.val.index+Math.PI*1.5,false);
			fill()
		closePath()

		// draw all the points
		var drawingX = [];
		var drawingY = [];

		for (var i = 0; i < this.val.points.length; i++) {
			drawingX[i] = this.val.points[i].x * this.GUI.w;
			drawingY[i] = (1 - this.val.points[i].y) * this.GUI.h;

			//stay within right/left bounds
			if (drawingX[i]<(this.bgLeft+this.nodeSize)) {
				drawingX[i] = this.bgLeft + this.nodeSize;
			} else if (drawingX[i]>(this.bgRight-this.nodeSize)) {
				drawingX[i] = this.bgRight - this.nodeSize;
			}
			//stay within top/bottom bounds
			if (drawingY[i]<(this.bgTop+this.nodeSize)) {
				drawingY[i] = this.bgTop + this.nodeSize;
			} else if (drawingY[i]>(this.bgBottom-this.nodeSize)) {
				drawingY[i] = this.bgBottom - this.nodeSize;
			}
		}

		// draw rectangles
		for (var j = 0; j < drawingX.length; j++) {
			var size = this.mindim/35 + 2;
			beginPath()
			arc(drawingX[j],drawingY[j],size,0,Math.PI*2,false);
			fillStyle = this.colors.accent
			fill()
			closePath()
		}


		// draw shape
		beginPath();
			strokeStyle = this.colors.accent;
			moveTo(-5,this.GUI.h);
			lineTo(-5,(1-this.val.points[0].y)*this.GUI.h);

			// draw each line
			for (var j = 0; j < drawingX.length; j++) {
				lineTo(drawingX[j],drawingY[j]);
			}

			lineTo(this.GUI.w+5,(1-this.val.points[this.val.points.length-1].y)*this.GUI.h);
			lineTo(this.GUI.w+5,this.GUI.h);
			stroke();
			globalAlpha = 0.2;
			fillStyle = this.colors.accent;
			fill();
			globalAlpha = 1
		closePath();
	


	}
	
	this.drawLabel();
}

envelope.prototype.scaleNode = function(nodeIndex) {
	var i = nodeIndex;
	var prevX = 0;
	var nextX = this.GUI.w;
	
	var actualX = this.val.points[i].x;
	var actualY = (this.GUI.h - this.val.points[i].y);
	var clippedX = math.clip(actualX/this.GUI.w, 0, 1);
	var clippedY = math.clip(actualY/this.GUI.h, 0, 1);

	this.val.points[i].x = math.prune(clippedX, 3);
	this.val.points[i].y = math.prune(clippedY, 3);

	// find x value of nodes to the right and left
	if (i > 0) {
		prevX = this.val.points[i-1].x;
	}
	if (this.val.points.length > i+1) {
		nextX = this.val.points[i+1].x;
	}

	if (this.val.points[i].x < prevX) {
		this.val.points.splice(i-1, 0, this.val.points.splice(i, 1)[0])
		i = i-1;
		this.selectedNode = i;
	}

	if (this.val.points[i].x > nextX) {
		this.val.points.splice(i+1, 0, this.val.points.splice(i, 1)[0])
		i = i+1;
		this.selectedNode = i;
	}

}

envelope.prototype.click = function() {

	// find nearest node and set this.selectedNode (index)
	this.selectedNode = this.findNearestNode(this.clickPos.x/this.GUI.w, this.clickPos.y/this.GUI.h, this.val.points);

	this.transmit(this.val);
	this.draw();
}

envelope.prototype.move = function() {
	if (this.clicked) {
		this.val.points[this.selectedNode].x = this.clickPos.x;
		this.val.points[this.selectedNode].y = this.clickPos.y;
		this.scaleNode(this.selectedNode);
		this.transmit(this.val);
		this.draw();
	}
}

envelope.prototype.release = function() {

	if (!this.hasMoved) {
		this.val.points.splice(this.selectedNode,1)
	}

	this.draw();

	// reset the this.selectedNode
	this.selectedNode = null;
}

// update index and amp
envelope.prototype.pulse = function() {
	if (this.active) {

		// calculate index based on audio context
		var percentDone = (nx.context.currentTime - startTime) / (this.duration/1000);
		if (percentDone >= 1) {
			if (this.looping) {
				percentDone -= 1;
				startTime += this.duration/1000;
				this.val.index = 0
				this.scanIndex = 0
			} else {
				this.stop();
			}
			
		}
		this.val.index = percentDone;
	
		if (this.val.index > this.val.points[this.val.points.length-1].x) {
			this.val.amp = this.val.points[this.val.points.length-1].y
		} else if (this.val.index < this.val.points[0].x) {
			this.val.amp = this.val.points[0].y
		} else {				
			this.scanIndex = 0;
			while (this.val.index > this.val.points[this.scanIndex].x) {
				this.scanIndex++;
			}

			var nextPX = this.val.points[this.scanIndex].x;
			var prevPX = this.val.points[this.scanIndex-1].x;
			var nextPY = this.val.points[this.scanIndex].y;
			var prevPY = this.val.points[this.scanIndex-1].y;
		
			this.val.amp = math.interp((this.val.index-prevPX)/(nextPX - prevPX),prevPY,nextPY);

		}
	
		this.transmit(this.val);
		this.draw();
	}
}

/** @method start
	Start ramp from beginning. If set to loop, will loop the ramp until stopped. */
envelope.prototype.start = function() {
	this.active = true;
	this.val.index = 0;
	
	// set startTime
	startTime = nx.context.currentTime;
}

/** @method stop
	Stop the ramp and set progress to 0. */
envelope.prototype.stop = function() {
	this.active = false;
	this.val.index = 0;
	this.draw();
}

envelope.prototype.findNearestNode = function(x, y, nodes) {
	var nearestIndex = null;
	var nearestDist = 1000;
	var before = false;
	y = 1 - y;
	for (var i = 0; i<nodes.length; i++) {
		var distance = Math.sqrt(  Math.pow( (nodes[i].x - x), 2), Math.pow((nodes[i].y - (-y)), 2) );

		if (distance < nearestDist) {
			nearestDist = distance;
			nearestIndex = i;
			before = x > nodes[i].x
		}
	}

	if (nearestDist>.1) {
		if (before) { nearestIndex++ }
		this.val.points.splice(nearestIndex,0,{
			x: this.clickPos.x/this.GUI.w,
			y: (this.GUI.h-this.clickPos.y)/this.GUI.h
		})
		//nearestIndex++;
	}

	return nearestIndex;
}
},{"../core/widget":3,"../utils/math":6,"util":51}],16:[function(require,module,exports){
var math = require('../utils/math')
var util = require('util');
var widget = require('../core/widget');

/** 
	@class ghost (alpha) 
	Interface gesture capture / playback (in development)    
	
	```html
	<canvas nx="ghost"></canvas>
	```
	<canvas nx="ghost" style="margin-left:25px"></canvas>
*/

var ghost = module.exports = function(target) {
	
	this.defaultSize = { width: 100, height: 50 };
	widget.call(this, target);
	
	//define unique attributes
	this.recording = false;
	this.playing = false;
	this.maxLength = 2000;
	this.components = new Array();
	this.buffer = new Array();
	//this.moment is for the record head
	this.moment = 0;
	//this.needle is for the playback head
	this.needle = 0;
	this.val = new Object();
	this.rate = 1;
	this.start = 0;
	this.end = 1;
	this.size = 0;
	this.looping = true;
	this.boundLog = this.log.bind(this)
	this.direction = 1;
	//settings
	this.noise = 0;
	this.loopstart = 0;
	this.loopend = 0;
	this.mode = "linear";   // linear,bounce,random,wander,pattern/dream
	//init
	this.init();

	this.boundAdv = this.advance.bind(this);
	nx.aniItems.push(this.boundAdv)

}

util.inherits(ghost, widget);


ghost.prototype.init = function() {
	this.draw();
}

ghost.prototype.watch = function() {
}
	
	//sets a new component to be recorded
ghost.prototype.connect = function(target) {
	var compIndex = this.components.length;
	this.components.push(target);
	target.tapeNum = compIndex;
	target.isRecording = true;
	target.recorder = this;
	this.buffer[compIndex] = new Object();
	for (var key in target.val) {
		this.buffer[compIndex][key] = new Array();
	}
	
}
	
	//the actual recording function
ghost.prototype.write = function(index, val) {
	if (this.moment>=this.maxLength) {
		this.stop();
	}
	for (var key in val) {
		if (this.buffer[index][key]) {
			// if an array or object, must make a copy, otherwise it is a reference to the original and will not record properly
			if (typeof val[key] == "object") {
				if (Array.isArray(val[key])) {
				//	this.buffer[index][key][this.moment] = val[key].slice()
				//	above line should work, but is still only a reference, not a copy
					this.buffer[index][key][this.moment] = JSON.parse(JSON.stringify(val[key]))
				} else {
					this.buffer[index][key][this.moment] = {}
					for (var subkey in val[key]) {
						this.buffer[index][key][this.moment][subkey] = val[key][subkey]
					}
				}
			} else {
				this.buffer[index][key][this.moment] = val[key];
			}
		}
	}
	this.draw();
}
	

ghost.prototype.draw = function() {

	with (this.context) {
		fillStyle = this.colors.fill;
		fillRect(0,0,this.GUI.w,this.GUI.h)
	}

	var quad = this.GUI.w/4;
	var quad2 = this.GUI.w-quad;
	
	if (!this.recording) {
		with (this.context) {
			fillStyle = "#e33";
			beginPath()
			arc(quad,this.GUI.h/2,quad*0.8,0,Math.PI*2)
			fill()
			closePath();
			textAlign = "center"
			textBaseline = "middle"
			font = "normal "+this.GUI.h/6+"px courier"
			fillStyle = this.colors.fill
			fillText("rec",quad,this.GUI.h/2)
		}
	} else {
		with (this.context) {
			fillStyle = "#e33";
			fillRect(quad*0.4,quad*0.4,quad*1.2,quad*1.2)
		}
	}
	
	if (!this.playing) {
		with (this.context) {
			fillStyle = this.colors.border
			beginPath()
			arc(quad2,this.GUI.h/2,quad*0.8,0,Math.PI*2)
			fill()
			closePath()
			textAlign = "center"
			textBaseline = "middle"
			font = "normal "+this.GUI.h/6+"px courier"
			fillStyle = this.colors.fill
			fillText("play",quad2,this.GUI.h/2)
		}
	} else {
		with (this.context) {
			strokeStyle = this.colors.border
			lineWidth = this.GUI.w/30
			beginPath()
			arc(quad2,this.GUI.h/2,quad*0.8,0,Math.PI*2)
			stroke()
			closePath()
			var sec = ~~(this.needle/30)
			textAlign = "center"
			textBaseline = "middle"
			font = "normal "+this.GUI.h/3+"px courier"
			fillStyle = this.colors.border
			fillText(sec,quad2,this.GUI.h/2+2)
		}
	}
}

ghost.prototype.record = function() {
	if (!this.playing) {
		this.components = new Array();
		for (var key in nx.widgets) {
			this.connect(nx.widgets[key]);
		}
	}
	this.moment = 0;
	nx.aniItems.push(this.boundLog)
	this.recording = true;
}

ghost.prototype.log = function() {
	for (var i=0;i<this.components.length;i++) {
		var sender = this.components[i];
		this.write(this.components[i].tapeNum,this.components[i].val);
	}
	this.moment++;
}

ghost.prototype.stop = function() {
	nx.removeAni(this.boundLog);
	this.size = this.moment;
	this.recording = false;

/*	for ()
	for (var j=0;j<this.buffer[sender.tapeNum][key].length;j++) {
		if (this.buffer[sender.tapeNum][key][j] != this.buffer[sender.tapeNum][key][0]) {
			changed = true;
			console.log(key + " changes")
			break;
		}
	} */

	this.draw();
}


ghost.prototype.scan = function(x) {

	this.pneedle = this.needle - this.direction
	if (this.pneedle <= 0) {
		this.pneedle = this.size-1
	} else if (this.pneedle >= this.size-1) {
		this.pneedle = 0
	}


	// loop through the widgets that were recorded
	for (var i=0;i<this.components.length;i++) {
		//sender is the current widget we're looking at
		var sender = this.components[i];
		//loop through the widget's gesture buffer
		for (var key in this.buffer[sender.tapeNum]) {
			if (this.buffer[sender.tapeNum][key]) {

				//create a new val object
				var val = new Object();
				//make sure we're not looking out of bounds of the buffer
				var max = this.buffer[sender.tapeNum][key][~~this.needle+1] ? this.buffer[sender.tapeNum][key][~~this.needle+1] : this.buffer[sender.tapeNum][key][~~this.needle]

			//	var changed = false;

				//is this value the first
		/*		if (this.buffer[sender.tapeNum][key][~~this.needle-this.direction] == undefined) {
			
					for (var j=0;j<this.buffer[sender.tapeNum][key].length;j++) {
						if (this.buffer[sender.tapeNum][key][j] != this.buffer[sender.tapeNum][key][0]) {
							changed = true;
							break;
						}
					}
				} else if (this.buffer[sender.tapeNum][key][~~this.needle] != this.buffer[sender.tapeNum][key][~~this.needle-this.direction]) {
					changed = true;
				} */



				if (this.buffer[sender.tapeNum][key][~~this.needle] != this.buffer[sender.tapeNum][key][~~this.pneedle]) {
	
					// if it's a number, interpolate
					if (typeof this.buffer[sender.tapeNum][key][~~this.needle] == "number") {
						// create the value pair
						val[key] = nx.interp(this.needle - ~~this.needle, this.buffer[sender.tapeNum][key][~~this.needle], max)
						val[key] += Math.random() * this.noise - this.noise/2;
						val[key] = nx.clip(val[key],0,1)
						//set the widget with the value from the buffer
						sender.set(val, true)
					} else {
						// otherwise, transfer the closest val as is
						val[key] = this.buffer[sender.tapeNum][key][~~this.needle]
						sender.set(val, true)
						
					}

					
				}
			}
		}
	}
}



//this.moment is for the record head
//this.needle is for the playback head

ghost.prototype.play = function(rate,start,end) {
	rate ? this.rate = rate : false;
	if (start || this.start) {
		//this.needle = this.moment-1;
		this.start = start ? start : this.start;
		this.needle = this.start
	} else {
		this.needle = this.moment-1;
		this.start = 0;
	} 
	if (this.mode=="linear") {
		this.direction = 1;
	}
	end ? this.end = end : this.end = 1
	this.playing = true;
}

ghost.prototype.pause = function() {
	this.playing = false;
}

ghost.prototype.loop = function() {
	
}

ghost.prototype.advance = function() {
	if (this.playing) {
		if (this.mode == "linear" || this.mode == "bounce") {
			this.needle += this.rate*this.direction;
		} else if (this.mode=="random") {
			this.needle = nx.random((this.end-this.start)*this.size)+this.start*this.size;
		} else if (this.mode=="wander") {
			var dir = 3
			this.needle > this.size*0.75 ? dir-- : null;
			this.needle < this.size*0.25 ? dir++ : null;
			this.needle += this.rate*this.direction * (nx.random(dir)-1);
		}

		if (this.needle/this.size < this.end && this.needle/this.size >= this.start) {
			this.scan();
		} else if (this.looping) {
			if (this.mode=="linear") {
				this.needle = this.start*this.size;
			} else {
				this.direction = this.direction * -1
			}
		} else {
			this.playing = false;
		}
		this.draw();
	}
}
	

ghost.prototype.click = function(e) {
	if (this.clickPos.x<this.GUI.w/2) {
		if (this.recording) {
			this.stop()
		} else {
			this.pause()
			this.record()
		}
	} else {
		if (this.playing) {
			this.pause();
		} else {
			this.play();
		}
		this.draw();
	}
}
},{"../core/widget":3,"../utils/math":6,"util":51}],17:[function(require,module,exports){
var math = require('../utils/math')
var util = require('util');
var widget = require('../core/widget');

/** 
	@class ghostlist (alpha) 
	Interface gesture capture / playback (in development)    
	
	```html
	<canvas nx="ghostlist"></canvas>
	```
	<canvas nx="ghostlist" style="margin-left:25px"></canvas>
*/

var ghostlist = module.exports = function(target) {
	
	this.defaultSize = { width: 100, height: 50 };
	widget.call(this, target);
	
	//define unique attributes
	this.recording = false;
	this.playing = false;
	this.maxLength = 2000;
	this.components = new Array();
	//the recording buffer
	this.buffer = new Array();
	//the playback info
	this.playbuffer = []
	this.playIndex = 0
	this.playbufferSize = 0
	//this.moment is for the record head
	this.moment = 0;
	//this.needle is for the playback head
	this.needle = 0;
	this.val = new Object();
	this.rate = 1;
	this.start = 0;
	this.end = 1;
	this.size = 0;
	this.looping = true;
	this.boundLog = this.log.bind(this)
	this.direction = 1;
	//settings
	this.noise = 0;
	this.loopstart = 0;
	this.loopend = 0;
	this.mode = "linear";   // linear,bounce,random,wander,pattern/dream
	//init
	this.init();

	this.boundAdv = this.advance.bind(this);
	nx.aniItems.push(this.boundAdv)

}

util.inherits(ghostlist, widget);


ghostlist.prototype.init = function() {
	this.draw();
}

ghostlist.prototype.watch = function() {
}
	
	//sets a new component to be recorded
ghostlist.prototype.connect = function(target) {
	var compIndex = this.components.length;
	this.components.push(target);
	target.tapeNum = compIndex;
	target.isRecording = true;
	target.recorder = this;
	this.buffer[compIndex] = new Object();
	for (var key in target.val) {
		this.buffer[compIndex][key] = new Array();
	}
	
}
	
	//the actual recording function
ghostlist.prototype.write = function(index, val) {
	if (this.moment>=this.maxLength) {
		this.stop();
	}
	for (var key in val) {
		if (this.buffer[index][key]) {
			/*if (!this.actuated) {
				//if ignored because widget currently being set with .set
				this.buffer[index][key][this.moment] = {}
					for (var subkey in val[key]) {
						this.buffer[index][key][this.moment][subkey] = val[key][subkey]
					}

			} else { */
				// if an array or object, must make a copy, otherwise it is a reference to the original and will not record properly
				if (typeof val[key] == "object") {
					if (Array.isArray(val[key])) {
					//	this.buffer[index][key][this.moment] = val[key].slice()
					//	above line should work, but is still only a reference, not a copy
						if (this.components[index].actuated) {
							this.buffer[index][key][this.moment] = JSON.parse(JSON.stringify(val[key]))
						} else {
							this.buffer[index][key][this.moment] = false;
						}
					} else {
						this.buffer[index][key][this.moment] = {}
						for (var subkey in val[key]) {
							if (this.components[index].actuated) {
								this.buffer[index][key][this.moment][subkey] = val[key][subkey]
							} else {
								this.buffer[index][key][this.moment][subkey] = false;
							}
						}
					}
				} else {
					
					if (this.components[index].actuated) {
						this.buffer[index][key][this.moment] = val[key];
					} else {
						this.buffer[index][key][this.moment] = false;
					}
				}
		//	}
		}
	}
	this.draw();
}
	

ghostlist.prototype.draw = function() {

	with (this.context) {
		fillStyle = this.colors.fill;
		fillRect(0,0,this.GUI.w,this.GUI.h)
	}

	var quad = this.GUI.w/4;
	var quad2 = this.GUI.w-quad;
	
	if (!this.recording) {
		with (this.context) {
			fillStyle = "#e33";
			beginPath()
			arc(quad,this.GUI.h/2,quad*0.8,0,Math.PI*2)
			fill()
			closePath();
			textAlign = "center"
			textBaseline = "middle"
			font = "normal "+this.GUI.h/6+"px courier"
			fillStyle = this.colors.fill
			fillText("rec",quad,this.GUI.h/2)
		}
	} else {
		with (this.context) {
			fillStyle = "#e33";
			fillRect(quad*0.4,quad*0.4,quad*1.2,quad*1.2)
		}
	}
	
	if (!this.playing) {
		with (this.context) {
			fillStyle = this.colors.border
			beginPath()
			arc(quad2,this.GUI.h/2,quad*0.8,0,Math.PI*2)
			fill()
			closePath()
			textAlign = "center"
			textBaseline = "middle"
			font = "normal "+this.GUI.h/6+"px courier"
			fillStyle = this.colors.fill
			fillText("play",quad2,this.GUI.h/2)
		}
	} else {
		with (this.context) {
			strokeStyle = this.colors.border
			lineWidth = this.GUI.w/30
			beginPath()
			arc(quad2,this.GUI.h/2,quad*0.8,0,Math.PI*2)
			stroke()
			closePath()
			var sec = ~~(this.needle/30)
			textAlign = "center"
			textBaseline = "middle"
			font = "normal "+this.GUI.h/3+"px courier"
			fillStyle = this.colors.border
			fillText(sec,quad2,this.GUI.h/2+2)
		}
	}
}

ghostlist.prototype.record = function() {
//	if (!this.playing) {
		this.components = new Array();
		for (var key in nx.widgets) {
			this.connect(nx.widgets[key]);
		}
//	}
	this.moment = 0;
	nx.aniItems.push(this.boundLog)
	this.recording = true;
}

ghostlist.prototype.log = function() {
	for (var i=0;i<this.components.length;i++) {
		var sender = this.components[i];
		var val = {}
		if (!sender.clicked) {
			for (var key in sender.val) {
				val[key] = false
			}
		} else {
			val = sender.val
			if (!jest.nexttitle) {
				jest.nexttitle = sender.canvasID
			}
		}
		this.write(this.components[i].tapeNum,val);
	}
	this.moment++;
}

ghostlist.prototype.stop = function() {
	nx.removeAni(this.boundLog);
	this.size = this.moment;
	this.recording = false;
	this.draw();
}


ghostlist.prototype.scan = function(x) {

	// loop through the widgets that were recorded
	for (var i=0;i<this.components.length;i++) {
		//sender is the current widget we're looking at
		var sender = this.components[i];
		//loop through the widget's recorded val keys
		for (var key in this.playbuffer[sender.tapeNum]) {

			//console.log(this.playbuffer[sender.tapeNum][key])
			//
			//playbuffer is the whole buffer
			//sender.tapeNum is the nx.widget index & this.component index
			//[key] is the val property that was recorded, i.e. x and y for 
			//so this returns an array for each val property. that array contains n moments of recorded data

			if (this.playbuffer[sender.tapeNum][key]) {

				//create a new val object
				var val = new Object();
				//make sure we're not looking out of bounds of the buffer
				var max = this.playbuffer[sender.tapeNum][key][~~this.needle+1] ? this.playbuffer[sender.tapeNum][key][~~this.needle+1] : this.playbuffer[sender.tapeNum][key][~~this.needle]
				//console.log("1")
				if (this.playbuffer[sender.tapeNum][key][~~this.needle-this.direction] != undefined && this.playbuffer[sender.tapeNum][key][~~this.needle] !== this.playbuffer[sender.tapeNum][key][~~this.needle-this.direction]) {
					// if it's a number, interpolate
					if (typeof this.playbuffer[sender.tapeNum][key][~~this.needle] == "number") {
						// create the value pair
						val[key] = nx.interp(this.needle - ~~this.needle, this.playbuffer[sender.tapeNum][key][~~this.needle], max)
						val[key] += Math.random() * this.noise - this.noise/2;
						val[key] = nx.clip(val[key],0,1)
						//set the widget with the value from the buffer
						//console.log(val)
						sender.set(val, true);
					} else {
						// otherwise, transfer the closest val as is
						val[key] = this.playbuffer[sender.tapeNum][key][~~this.needle]
						
						if (val[key] || val[key]===0) {
							//console.log(val)
							sender.set(val, true)
						}
						
					}
				}
			}
		}
	}
}



//this.moment is for the record head
//this.needle is for the playback head

ghostlist.prototype.play = function(rate,start,end) {
	rate ? this.rate = rate : false;
	if (start) {
		this.needle = this.moment-1;
		this.start = start;
	} else {
		this.needle = this.moment-1;
		this.start = 0;
	} 
	if (this.mode=="linear") {
		this.direction = 1;
	}
	end ? this.end = end : this.end = 1
	this.playing = true;
}

ghostlist.prototype.pause = function() {
	this.playing = false;
}

ghostlist.prototype.loop = function() {
	
}

ghostlist.prototype.advance = function() {
	if (this.playing) {
		if (this.mode == "linear" || this.mode == "bounce") {
			this.needle += this.rate*this.direction;
		} else if (this.mode=="random") {
			this.needle = nx.random((this.end-this.start)*this.playbufferSize)+this.start*this.playbufferSize;
		} else if (this.mode=="wander") {
			var dir = 3
			this.needle > this.playbufferSize*0.75 ? dir-- : null;
			this.needle < this.playbufferSize*0.25 ? dir++ : null;
			this.needle += this.rate*this.direction * (nx.random(dir)-1);
		}

		if (this.needle/this.playbufferSize < this.end && this.needle/this.playbufferSize > this.start) {
			this.scan();
		} else if (this.looping) {
			if (this.mode=="linear") {
			//	this.needle = this.start*this.playbufferSize + 1;
				this.needle = 0;
				this.next = this.jest.next()
				this.playbuffer = this.next.buffer
				this.playbufferSize = this.next.len
			} else {
				this.direction = this.direction * -1
			}
		} else {
			this.playing = false;
		}
		this.draw();
		this.jest.drawvis(this.needle/this.playbufferSize)
	}
}
	

ghostlist.prototype.click = function(e) {
	if (this.clickPos.x<this.GUI.w/2) {
		if (this.recording) {
			this.stop()
		} else {
			this.record()
		}
	} else {
		if (this.playing) {
			this.pause();
		} else {
			this.play();
		}
		this.draw();
	}
}
},{"../core/widget":3,"../utils/math":6,"util":51}],18:[function(require,module,exports){
module.exports = {
  banner: require('./banner'),
  button: require('./button'),
  colors: require('./colors'),
  comment: require('./comment'),
  crossfade: require('./crossfade'),
  dial: require('./dial'),
  envelope: require('./envelope'),
  ghost: require('./ghost'),
  ghostlist: require('./ghostlist'),
  joints: require('./joints'),
  keyboard: require('./keyboard'),
  matrix: require('./matrix'),
  message: require('./message'),
  meter: require('./meter'),
  metro: require('./metro'),
  metroball: require('./metroball'),
  motion: require('./motion'),
  mouse: require('./mouse'),
  multislider: require('./multislider'),
  multitouch: require('./multitouch'),
  number: require('./number'),
  panel: require('./panel'),
  position: require('./position'),
  range: require('./range'),
  select: require('./select'),
  slider: require('./slider'),
  string: require('./string'),
  tabs: require('./tabs'),
  text: require('./text'),
  tilt: require('./tilt'),
  toggle: require('./toggle'),
  trace: require('./trace'),
  typewriter: require('./typewriter'),
  vinyl: require('./vinyl'),
  waveform: require('./waveform'),
  wavegrain: require('./wavegrain'),
  windows: require('./windows')
}
},{"./banner":9,"./button":10,"./colors":11,"./comment":12,"./crossfade":13,"./dial":14,"./envelope":15,"./ghost":16,"./ghostlist":17,"./joints":19,"./keyboard":20,"./matrix":21,"./message":22,"./meter":23,"./metro":24,"./metroball":25,"./motion":26,"./mouse":27,"./multislider":28,"./multitouch":29,"./number":30,"./panel":31,"./position":32,"./range":33,"./select":34,"./slider":35,"./string":36,"./tabs":37,"./text":38,"./tilt":39,"./toggle":40,"./trace":41,"./typewriter":42,"./vinyl":43,"./waveform":44,"./wavegrain":45,"./windows":46}],19:[function(require,module,exports){
var math = require('../utils/math')
var util = require('util');
var widget = require('../core/widget');

/** 
	@class joints      
	2D slider with connections to several points; a proximity-based multislider.
	```html
	<canvas nx="joints"></canvas>
	```
	<canvas nx="joints" style="margin-left:25px"></canvas>
*/

var joints = module.exports = function (target) {
	this.defaultSize = { width: 150, height: 150 };
	widget.call(this, target);
	
	/* @property {integer} nodeSize The size of the proximity points in pixels */
	this.nodeSize = this.GUI.w/14; 
	this.values = [0,0];

	/** @property {object}  val  
		| &nbsp; | data
		| --- | ---
		| *x* | x position of touch/mouse
		| *y* | y position of touch/mouse
		| *node0* | nearness to first node if within range (float 0-1)
		| *node1* | nearness to second node if within range (float 0-1)
		| *node2* | nearness to third node if within range (float 0-1)
		| etc... | &nbsp;
		
	*/
	this.val = {
		x: 0.35,
		y: 0.35,
		node1: 0
	}
	/** @property {array} joints An array of objects with x and y properties detailing coordinates of each proximity node. Coordinates are 0-1 floats which are decimal fractions of the width and height.
	```js
		// The widget will now have 2 proximity points instead of 8
		joints1.joints = [
		&nbsp; { x: 0.5 , y: 0.2 },
		&nbsp; { x: 0.5 , y: 0.7 }
		]
	```
	 */
	this.joints = [
		{ x: .1, y: .2 },
	    { x: .2, y: .1 },
	    { x: .3, y: .7 },
	    { x: .4, y: .4 },
	    { x: .5, y: .9 },
	    { x: .6, y: .15 },
	    { x: .7, y: .3 },
	    { x: .8, y: .8 },
	]
	this.threshold = this.GUI.w / 3;
}
util.inherits(joints, widget);

joints.prototype.init = function() {
  this.nodeSize = this.GUI.w/14;
  this.threshold = this.GUI.w/3;
  this.draw();
}

joints.prototype.draw = function() {
	this.erase();

	this.drawingX = this.val.x * this.GUI.w;
	this.drawingY = this.val.y * this.GUI.h;

	with (this.context) {
		fillStyle = this.colors.fill;
		fillRect(0,0,this.GUI.w,this.GUI.h);
		if (this.val.x != null) {
			this.drawNode();
		}
		else {
			fillStyle = this.colors.border;
			font = "14px courier";
			fillText(this.default_text, 10, 20);
		}	
		fillStyle = this.colors.accent;
		strokeStyle = this.colors.border;
		for (var i in this.joints) {
			beginPath();
				arc(this.joints[i].x*this.GUI.w, this.joints[i].y*this.GUI.h, this.nodeSize/2, 0, Math.PI*2, true);					
				fill();
			closePath();
			var cnctX = Math.abs(this.joints[i].x*this.GUI.w-this.drawingX);
			var cnctY = Math.abs(this.joints[i].y*this.GUI.h-this.drawingY);
			var strength = cnctX + cnctY;
			if (strength < this.threshold) {
				beginPath();
					moveTo(this.joints[i].x*this.GUI.w, this.joints[i].y*this.GUI.h);
					lineTo(this.drawingX,this.drawingY);
					strokeStyle = this.colors.accent;
					lineWidth = math.scale( strength, 0, this.threshold, this.nodeSize/2, 5 );
					stroke();
				closePath();
				var scaledstrength = math.scale( strength, 0, this.threshold, 1, 0 );
				this.val["node"+i] = scaledstrength;
			}
		}
	}
	
	this.drawLabel();
}

joints.prototype.drawNode = function() {
	//stay within right/left bounds
	if (this.drawingX<(this.nodeSize)) {
		this.drawingX = this.nodeSize;
	} else if (this.drawingX>(this.GUI.w-this.nodeSize)) {
		this.drawingX = this.GUI.w - this.nodeSize;
	}
	//stay within top/bottom bounds
	if (this.drawingY < this.nodeSize) {
		this.drawingY = this.nodeSize;
	} else if (this.drawingY>(this.GUI.h-this.nodeSize)) {
		this.drawingY = this.GUI.h - this.nodeSize;
	}

	with (this.context) {
		globalAlpha=1;
		beginPath();
			fillStyle = this.colors.accent;
			strokeStyle = this.colors.border;
			lineWidth = this.lineWidth;
			arc(this.drawingX, this.drawingY, this.nodeSize, 0, Math.PI*2, true);					
			fill();
		closePath();
	}
}

joints.prototype.click = function() {
	this.val = new Object();
	this.val.x = this.clickPos.x/this.GUI.w;
	this.val.y = this.clickPos.y/this.GUI.h;
	this.draw();
	this.transmit(this.val);
	this.connections = new Array();
    
}

joints.prototype.move = function() {
	this.val = new Object();
	if (this.clicked) {
		this.val.x = this.clickPos.x/this.GUI.w;
		this.val.y = this.clickPos.y/this.GUI.h;
		this.draw();
		this.transmit(this.val);
		this.connections = new Array();
	}
}


joints.prototype.release = function() {
		this.anix = this.deltaMove.x/this.GUI.w;
		this.aniy = (this.deltaMove.y)/this.GUI.h;
	
}

/** @method animate
	Add simple physics to the widget
	@param {string} [type] Currently accepts "bounce" or "none".
*/

joints.prototype.animate = function(aniType) {
	
	switch (aniType) {
		case "bounce":
			nx.aniItems.push(this.aniBounce.bind(this));
			break;
		case "none":
			nx.aniItems.splice(nx.aniItems.indexOf(this.aniBounce));
			break;
	}
	
}

joints.prototype.anix = 0;
joints.prototype.aniy = 0;

joints.prototype.aniBounce = function() {
	if (!this.clicked && this.val.x) {
		this.val.x += (this.anix);
		this.val.y += (this.aniy);
		this.anix = math.bounce(this.val.x, 0.1, 0.9, this.anix);
		this.aniy = math.bounce(this.val.y, 0.1, 0.9, this.aniy);
		this.draw();
		this.transmit(this.val);
	}
}

},{"../core/widget":3,"../utils/math":6,"util":51}],20:[function(require,module,exports){
var util = require('util');
var widget = require('../core/widget');
var drawing = require('../utils/drawing');
var math = require('../utils/math');

/** 
	@class keyboard      
	Piano keyboard which outputs MIDI
	```html
	<canvas nx="keyboard"></canvas>
	```
	<canvas nx="keyboard" style="margin-left:25px"></canvas>
*/

var keyboard = module.exports = function (target) {

	this.defaultSize = { width: 300, height: 75 };
	widget.call(this, target);

	/** @property {integer} octaves  Number of octaves on the keyboard 
		```js
			//This key pattern would put a black key between every white key
			keyboard1.octaves = 1
			keyboard1.init()
		```

	*/
	
	this.octaves = 3;

	this.white = {
		width:0,
		height:0
	}
	this.black = {
		width:0,
		height:0
	}
	this.wkeys = new Array();
	this.bkeys = new Array();

	/** @property {array} keypattern Array of 'w' and 'b' denoting the pattern of white and black keys. This can be customized! The pattern can be any number of keys, however each black key must be surrounded by two white keys.
	```js
		//This key pattern would put a black key between every white key
		keyboard1.keypattern = ['w','b','w','b','w','b','w','b','w','b','w','b']
		keyboard1.init()

		//This key pattern uses only white keys
		keyboard2.keypattern = ['w','w','w','w','w','w','w','w','w','w','w','w']
		keyboard2.init()
	```


	 */
	this.keypattern = ['w','b','w','b','w','w','b','w','b','w','b','w']
	this.keys = new Array();
	/** @property {integer} midibase The MIDI note value of the lowest note on the keyboard. Defaults to 48. */
	this.midibase = 48;
	this.lineWidth = 1;

	//to enable multitouch
	this.fingers = [
		{ 
			key: -1,
			pkey: -1

		}
	]
	this.multitouch = false; // will auto switch to true if experiences 2 simultaneous touches
	this.oneleft = false;

	/** @property {string} mode Play mode. Currently accepts "button" (default) or "sustain" in which each key acts as a toggle. */	
	this.mode = "button" // modes: "button", "sustain" and, possibly in future, "aftertouch"

	// for each key: x, y, w, h, color, on, note

	/** @property {object}  val   Core interactive values and data output
		| &nbsp; | data
		| --- | ---
		| *on* | 0 if noteon, 1 if noteoff
		| *note* | MIDI value of key pressed
		| *midi* | paired MIDI message as a string - example "20 0" - This is to allow for simultaneous arrival of the MIDI pair if sent as an OSC message. 
	*/
	this.val = {
		on: 0,
		note: 0,
		midi: "0 0"
	};

	this.init();
	
}
util.inherits(keyboard, widget);

keyboard.prototype.init = function() {

	//recap from header
	this.white = {
		width:0,
		height:0
	}
	this.black = {
		width:0,
		height:0
	}
	this.wkeys = new Array();
	this.bkeys = new Array();

	/** @property {array} keys Array of key objects. This may be of use in combination with the keyboard.toggle method. */
	this.keys = new Array();

	//new stuff
	this.white.num = 0;
	for (var i=0;i<this.keypattern.length;i++) {
		this.keypattern[i]=='w' ? this.white.num++ : null;
	}
	this.white.num *= this.octaves;

	this.white.width = this.GUI.w/this.white.num
	this.white.height = this.GUI.h

	this.black.width = this.white.width*0.6
	this.black.height = this.GUI.h*0.6

	for (var i=0;i<this.keypattern.length*this.octaves;i++) {
		this.keys[i] = {
			note: i+this.midibase,
			on: false
		}
		switch (this.keypattern[i%this.keypattern.length]) {
			case 'w':
				this.keys[i].x =  this.wkeys.length*this.white.width,
				this.keys[i].y = 0,
				this.keys[i].w = this.white.width,
				this.keys[i].h = this.white.height,
				this.keys[i].type = 'w';
				this.keys[i].index = i;
				this.wkeys.push(this.keys[i]);

				break;
			case 'b':
				this.keys[i].x = this.wkeys.length*this.white.width - this.black.width/2,
				this.keys[i].y = 0,
				this.keys[i].w = this.black.width,
				this.keys[i].h = this.black.height,
				this.keys[i].type = 'b';
				this.keys[i].index = i;
				this.bkeys.push(this.keys[i]);
				break;
		}
	}


	this.draw();
}

keyboard.prototype.draw = function() {

	with (this.context) {
		strokeStyle = this.colors.borderhl;
		lineWidth = 1;
			
		for (var i in this.wkeys) {
			fillStyle = this.wkeys[i].on ? this.colors.borderhl : this.colors.fill
			strokeRect(this.wkeys[i].x,0,this.white.width,this.white.height);
			fillRect(this.wkeys[i].x,0,this.white.width,this.white.height);
		}
		for (var i in this.bkeys) {
			fillStyle = this.bkeys[i].on ? this.colors.borderhl : this.colors.black
			fillRect(this.bkeys[i].x,0,this.black.width,this.black.height);
		}
		//strokeRect(0,0,this.GUI.w,this.GUI.h);
	}
	this.drawLabel();
}

/** @method toggle
	Manually toggle a key on or off, and transmit the new state.
	@param {object} [key]  A key object (from the .keys array) to be turned on or off
	@param {boolean} [on/off]  (Optional) Whether the key should be turned on (true) or off (false). If this parameter is left out, the key will switch to its opposite state.
	```js
	// Turns the first key on
	keyboard1.toggle( keyboard1.keys[0], true );
	```
*/
keyboard.prototype.toggle = function(key, data) {
	if (this.mode=="button") {
		if (key) {
			if (data) {
				key.on = data;
			} else {
				key.on = !key.on;
			}

			var on = key.on ? 1 : 0;
			var amp = math.invert(this.clickPos.y/this.GUI.h) * 128;
			amp = math.prune(math.clip(amp,5,128),0);

			this.val = { 
				on: on*amp,
				note: key.note,
				midi: key.note + " " + on
			};
			this.transmit(this.val);
			this.draw();
		}
	} else if (this.mode=="sustain") {
		if (key) {
			if (data) {
				key.on = data;
			} else {
				key.on = !key.on;
			}

			var on = key.on ? 1 : 0;
			var amp = math.invert(this.clickPos.y/this.GUI.h) * 128;
			amp = math.prune(math.clip(amp,5,128),0);

			this.val = { 
				on: on*amp,
				note: key.note,
				midi: key.note + " " + on
			};
			this.transmit(this.val);
			this.draw();
		}

	}

}

keyboard.prototype.whichKey = function (x, y){

	for (var i in this.bkeys) {
		if (drawing.isInside({"x":x,"y":y}, this.bkeys[i])) {
			return this.bkeys[i]
		}
	}

	var keyx = ~~(x/this.white.width);
	if (keyx>=this.wkeys.length) { keyx = this.wkeys.length-1 }
	if (keyx<0) { keyx = 0 }
	return this.wkeys[keyx];
}

keyboard.prototype.click = function(e) {

	if (this.clickPos.touches.length>1 || this.multitouch) {
		this.multitouch = true;
		if (this.clickPos.touches.length>=2 && this.oneleft) {
			this.oneleft = false;
		}
		this.keysinuse = new Array();
		for (var j=0;j<this.clickPos.touches.length;j++) {
			this.fingers[j] = {
				key: this.whichKey(this.clickPos.touches[j].x, this.clickPos.touches[j].y)
			}
			if (!this.fingers[j].key.on) {
				this.toggle(this.fingers[j].key, true)
			}
			this.keysinuse.push(this.fingers[j].key.index)
		}
		for (var j=0;j<this.keys.length;j++) {
			if (this.keys[j].on  && this.keysinuse.indexOf(this.keys[j].index)<0) {
				this.toggle(this.keys[j], false);
			}
		}
	} else {
		this.fingers[0].pkey = this.fingers[0].key;
		this.fingers[0].key = this.whichKey(this.clickPos.x, this.clickPos.y);
		this.toggle(this.fingers[0].key)
	}

}

keyboard.prototype.move = function(e) {
	if (this.clickPos.touches.length>1 || this.multitouch) {
		this.keysinuse = new Array();
		for (var j=0;j<this.clickPos.touches.length;j++) {
			this.fingers[j] = {
				key: this.whichKey(this.clickPos.touches[j].x, this.clickPos.touches[j].y)
			}
			if (!this.fingers[j].key.on) {
				this.toggle(this.fingers[j].key, true)
			}
			this.keysinuse.push(this.fingers[j].key.index)
		}
		for (var j=0;j<this.keys.length;j++) {
			if (this.keys[j].on  && this.keysinuse.indexOf(this.keys[j].index)<0) {
				this.toggle(this.keys[j], false);
			}
		}
	} else {
		this.fingers[0].pkey = this.fingers[0].key;
		this.fingers[0].key = this.whichKey(this.clickPos.x, this.clickPos.y);
		if (this.fingers[0].key && this.fingers[0].key.index != this.fingers[0].pkey.index) {
			this.toggle(this.fingers[0].pkey, false);
			this.toggle(this.fingers[0].key, true);
		}
	}
}

keyboard.prototype.release = function(e) {
	if (this.clickPos.touches.length>1 || this.multitouch) {
		this.keysinuse = new Array();
		for (var j=0;j<this.clickPos.touches.length;j++) { 
			if (this.oneleft && this.clickPos.touches.length==1) {
				break;
			}
			this.fingers[j] = {
				key: this.whichKey(this.clickPos.touches[j].x, this.clickPos.touches[j].y)
			}
			this.keysinuse.push(this.fingers[j].key.index)
		}
		for (var j=0;j<this.keys.length;j++) {
			if (this.keys[j].on  && this.keysinuse.indexOf(this.keys[j].index)<0) {
				this.toggle(this.keys[j], false);
			}
		}
		if (this.clickPos.touches.length==1) { this.oneleft = true }
	} else {
		if (this.mode=="button") {
			this.toggle(this.fingers[0].key, false);
		}
	}
}








},{"../core/widget":3,"../utils/drawing":5,"../utils/math":6,"util":51}],21:[function(require,module,exports){
var math = require('../utils/math');
var drawing = require('../utils/drawing');
var util = require('util');
var widget = require('../core/widget');

/** 
	@class matrix      
	Matrix of toggles, with sequencer functionality.
	```html
	<canvas nx="matrix"></canvas>
	```
	<canvas nx="matrix" style="margin-left:25px"></canvas>
*/


var matrix = module.exports = function (target) {
	this.defaultSize = { width: 100, height: 100 };
	widget.call(this, target);
	

	/** @property {integer}  row   Number of rows in the matrix
	```js
		matrix1.row = 2;
		matrix1.init()
	```
	*/
	this.row = 4;

	/** @property {integer}  col   Number of columns in the matrix
	```js
		matrix1.col = 10;
		matrix1.init()
	```
	*/
	this.col = 4;
	
	this.cellHgt;
	this.cellWid;

	/** @property {array}  matrix   Nested array of matrix values. Cells can be manually altered using .matrix (see code), however this will *not* cause the new value to be transmit. See .setCell() to set/transmit cell values.
	```js
		//Turn on the cell at row 1 column 2
		matrix1.matrix[1][2] = 1
		matrix1.draw()


		//Turn off the cell at row 3 column 0
		matrix1.matrix[3][0] = 0
		matrix1.draw()
	```
	*/
	this.matrix;

	/** @property {object}  val   Core values and data output
		| &nbsp; | data
		| --- | ---
		| *row* | Current row being changed
		| *col* | Current column being changed
		| *level* | Whether cell is on or off (0 or 1)
		| *list * | Array of values in highlighted column (if sequencing)
	*/
	this.val = {
		row: 0,
		col: 0,
		level: 0,
		list: new Array()
	}

	//for mouse logic
	this.cur;
	this.prev;

	/** @property {boolean}  erasing   Whether or not mouse clicks will erase cells. Set to true automatically if you click on an "on" cell. */
	this.erasing = false;

	/** @property {integer}  place   When sequencing, the current column. */
	this.place = null;

	this.starttime;
	this.lastbeat;
	this.thisframe = 0;
	this.lastframe = 0;
	this.context.lineWidth = 1;

	this.sequencing = false;

	/** @property {integer}  cellBuffer  How much padding between matrix cells, in pixels */
	this.cellBuffer = 4;
	
	/** @property {string}  sequenceMode  Sequence pattern (currently accepts "linear" which is default, or "random") */
	this.sequenceMode = "linear"; // "linear" or "random". future options would be "wander" (drunk) or "markov"

	/** @property {integer}  bpm   Beats per minute (if sequencing)
	```js
		matrix1.bpm = 120;
	```
	*/
	this.bpm = 120;
	this.pbpm = this.bpm

	this.starttime = nx.starttime;

	this.init();
	
}
util.inherits(matrix, widget);



matrix.prototype.init = function() {


	this.pmatrix = this.matrix ? this.matrix : false;

	this.matrix = null;
	// generate 2D matrix array
	this.matrix = new Array(this.col)
	for (var i=0;i<this.col;i++) {
		this.matrix[i] = new Array(this.row)
		for (var j=0;j<this.row;j++) {
			this.matrix[i][j] = this.pmatrix ? this.pmatrix[i] ? this.pmatrix[i][j] : 0 : 0; // set value of each matrix cell
		}
	}

	this.draw();

  	this.life = this.unboundlife.bind(this)
	
}

matrix.prototype.draw = function() {

	this.erase();

	this.cellWid = this.GUI.w/this.col;
	this.cellHgt = this.GUI.h/this.row;

	with (this.context) {
		strokeStyle = this.colors.fill
		//lineWidth = 0
		//strokeRect(0,0,this.GUI.w,this.GUI.h)
	}

	for (var i=0;i<this.row;i++){
		for (var j=0;j<this.col;j++) {
			var st_x = j*this.cellWid // starting point(left)
			j==0 ? st_x += 0 : null;
			var st_y = i*this.cellHgt; // starting point(top)
			i==0 ? st_y += 0 : null;
			var boxwid = this.cellWid;
			var boxhgt = this.cellHgt;

			
			with (this.context) {
				strokeStyle = this.colors.border;
				lineWidth = this.cellBuffer;
				if (this.matrix[j][i] > 0) {
					fillStyle = this.colors.accent;
				} else {
					fillStyle = this.colors.fill;
				}
				fillRect(st_x+this.cellBuffer/2, st_y+this.cellBuffer/2, boxwid-this.cellBuffer, boxhgt-this.cellBuffer);
			
				// sequencer highlight
				if (this.place == j) {
					globalAlpha = 0.4;
					fillStyle = this.colors.border;
					fillRect(st_x, st_y, boxwid, boxhgt);
					globalAlpha = 1;
				}

			}
		} 
	}

	this.drawLabel();
}



matrix.prototype.click = function(e) {

	this.cur = {
		col: ~~(this.clickPos.x/this.cellWid),
		row: ~~(this.clickPos.y/this.cellHgt)
	}

	if (this.matrix[this.cur.col][this.cur.row]) {
		this.matrix[this.cur.col][this.cur.row] = 0;
		this.erasing = true;
	} else {
		this.matrix[this.cur.col][this.cur.row] = 1;
		this.erasing = false;
	}

	this.cur.value = this.matrix[this.cur.col][this.cur.row]
	this.prev = this.cur;

//	var data = this.matrix[this.cur.col];
//	data = data.join();
//	data = data.replace(/\,/g," ");

	this.val = {
		row: this.cur.row,
		col: this.cur.col,
		level: this.cur.value
	}

	this.transmit(this.val);
	this.draw();
}

matrix.prototype.move = function(e) {
	if (this.clicked) {
		
		this.cur = {
			col: ~~(this.clickPos.x/this.cellWid),
			row: ~~(this.clickPos.y/this.cellHgt)
		}

		if (this.cur.row < this.row && this.cur.col < this.col && this.cur.row >= 0 && this.cur.col >=0) {
			if (this.cur.col!=this.prev.col || this.cur.row != this.prev.row) {
				if (this.erasing) {
					this.matrix[this.cur.col][this.cur.row] = 0;
				} else {
					this.matrix[this.cur.col][this.cur.row] = 1;
				}

				this.cur.value = this.matrix[this.cur.col][this.cur.row]
				this.prev = this.cur;

				this.val = {
					row: this.cur.row,
					col: this.cur.col,
					level: this.cur.value
				}

				this.transmit(this.val);
				this.draw();
			}
		}

	}
}


/** @method setCell
Manually set an individual cell on/off and transmit the new value.
@param {integer} [col] The column of the cell to be turned on/off
@param {integer} [row] The row of the cell to be turned on/off
@param {boolean} [on/off] Whether the cell should be turned on/off

```js
	// Turns cell on at column 1 row 3
	matrix1.setCell(1,3,true);
```
*/
matrix.prototype.setCell = function(col,row,on) {

	var value = on ? 1 : 0;
	this.matrix[col][row] = value

	this.val = {
		row: row,
		col: col,
		level: value
	}

	this.transmit(this.val);
	this.draw();

}

/** @method sequence
@param {float} [bpm] Beats per minute of the pulse
Turns the matrix into a sequencer.

```js
	matrix1.sequence(240);
```
*/
matrix.prototype.sequence = function(bpm) {

	if (bpm) {
		this.bpm = bpm;
	}	
	this.sequencing = true;
	requestAnimationFrame(this.seqStep.bind(this));

}

matrix.prototype.setBPM = function(bpm) {
	this.bpm = bpm
	//console.log(bpm)
	//nx.interval.bpm(this.pulse,bpm)
}

/** @method stop
Stops the matrix sequencer.

```js
	matrix1.stop();
```
*/
matrix.prototype.stop = function() {
	this.sequencing = false;
}

matrix.prototype.seqStep = function() {

	if (this.bpm == 0) { this.bpm = 1 }

	//current time
	var now = new Date().getTime();

	//delta time since start
	var dt = now - this.starttime;

	if (this.bpm != this.pbpm) {

		//frame + decimal since last beat, in old bpm
		var timeP = (dt/(60000/this.pbpm))

		// scale to new bpm
		dt = timeP * (60000/this.bpm)

		//adjust the starttime reference point
		this.starttime = now - dt

		//calculate new frame #
		this.thisframe = ~~(dt/(60000/this.bpm));

	} else {

	    //this.thisframe is a constantly ascending integer counter
	    //to compare with this.lastframe to determine when to increment this.place
	    //this.thisframe IS NOT the current column.
	    //the current column is this.place, which is set conditionally below.
		this.thisframe = ~~(dt/(60000/this.bpm));

	}

	this.pbpm = this.bpm;

    if (this.thisframe != this.lastframe) {

		this.lastbeat = now;

		if (this.sequenceMode=="linear") {
			this.place++;
		} else if (this.sequenceMode=="random") {
			this.place = math.random(this.col);
		}
		if (this.place>=this.col) {
			this.place = 0;
		}

		if (this.place==null) {
			this.place = 0;
		}

		this.jumpToCol(this.place);

    }

	this.lastframe = this.thisframe;
    if (this.sequencing) {
		requestAnimationFrame(this.seqStep.bind(this));
	}  
}

/** @method jumpToCol
Jump to a certain column of the matrix, highlight it, and output its values as an array. Column numbers start at 0.

```js
	matrix1.jumpToCol(1);
```
*/

matrix.prototype.jumpToCol = function(place) {
		this.place = place
		this.val = {
			list: this.matrix[this.place]
		}
		this.transmit(this.val);
		this.draw();
}


matrix.prototype.customDestroy = function() {
	this.stop();
}

matrix.prototype.unboundlife = function() {
  if (!this.clicked) {
  this.newmatrix = []
  for (var i=0;i<this.col;i++) {
    this.newmatrix[i] = []
    for (var j=0;j<this.row;j++) {
      var total = 0
      if (i-1 >= 0) {
        total += this.matrix[i-1][j-1] ? this.matrix[i-1][j-1] : 0
        total += this.matrix[i-1][j] ? this.matrix[i-1][j] : 0
        total += this.matrix[i-1][j+1] ? this.matrix[i-1][j+1] : 0
      }
      total += this.matrix[i][j-1] ? this.matrix[i][j-1] : 0
      total += this.matrix[i][j+1] ? this.matrix[i][j+1] : 0
      if (i+1 < this.col) {
        total += this.matrix[i+1][j-1] ? this.matrix[i+1][j-1] : 0
        total += this.matrix[i+1][j] ? this.matrix[i+1][j] : 0
        total += this.matrix[i+1][j+1] ? this.matrix[i+1][j+1] : 0
      }

      if (this.matrix[i][j]) {
        if (total < 2) {
          this.newmatrix[i][j] = 0
        } else if (total ==2 || total == 3) {
          this.newmatrix[i][j] = 1
        } else if (total > 3) {
          this.newmatrix[i][j] = 0
        }
      } else if (!this.matrix[i][j] && total == 3) {
        this.newmatrix[i][j] = 1
      } else {
        this.newmatrix[i][j] = this.matrix[i][j]
      }
    }
  }
  this.matrix = this.newmatrix
  }
  this.transmit({ grid: this.matrix})
  this.draw()
}

/** @method life
Alters the matrix according to Conway's Game of Life. Matrix.life() constitutes one tick through the game. To simulate the game, you might use setInterval.

```js
  //one tick
  matrix1.life();

  //repeated ticks at 80ms
  setInterval(matrix1.life,80)
```
*/
matrix.prototype.life = function() { 
  return false;
}

},{"../core/widget":3,"../utils/drawing":5,"../utils/math":6,"util":51}],22:[function(require,module,exports){
var util = require('util');
var widget = require('../core/widget');

/** 
	@class message      
	Send a string of text.
	```html
	<canvas nx="message"></canvas>
	```
	<canvas nx="message" style="margin-left:25px"></canvas>
*/

var message = module.exports = function (target) {
	
	this.defaultSize = { width: 100, height: 30 };
	widget.call(this, target);
	

	/** @property {object}  val   
		| &nbsp; | data
		| --- | ---
		| *value* | Text of message, as string
	*/

	this.val = {
		value: "send a message"
	}

	/** @property {integer} size Text size in px */
	this.size = 14;
	
}
util.inherits(message, widget);

message.prototype.init = function() {
	if (this.canvas.getAttribute("label")) {
		this.val.value = this.canvas.getAttribute("label");
	}
	//this.size = Math.sqrt((this.GUI.w * this.GUI.h) / (this.val.message.length));
	this.draw();
}

message.prototype.draw = function() {
	this.erase();
	with (this.context) {
		if (this.clicked) {
			fillStyle = this.colors.border;
		} else {
			fillStyle = this.colors.fill;
		}
		fillRect(0,0,this.GUI.w,this.GUI.h)
		
		if (this.clicked) {
			fillStyle = this.colors.black;
		} else {
			fillStyle = this.colors.black;
		}
		textAlign = "left";
		font = this.size+"px "+nx.font;
	}
	this.wrapText(this.val.value, 5, 1+this.size, this.GUI.w-6, this.size);
}

message.prototype.click = function(e) {
	this.draw();
	this.transmit(this.val);
}

message.prototype.release = function(e) {
	this.draw();
}
},{"../core/widget":3,"util":51}],23:[function(require,module,exports){
var util = require('util');
var drawing = require('../utils/drawing');
var widget = require('../core/widget');

/** 
    
    @public
    @class meter 

    Decibel level meter.

    ```html
    <canvas nx="meter"></canvas>
    ```
    <canvas nx="meter" style="margin-left:25px"></canvas>
*/

var meter = module.exports = function(target) {

    // to update, eventually (note to self)
    // possibly a less-frequent animation request, to lighten the graphics load
    // option for stereo meter? i.e. optional third .setup(ctx,s1,s2) argument

    this.defaultSize = { width: 20, height: 50 };
    widget.call(this, target);

    this.val = {
        level: 0
    }
    this.dataArray;
    this.bars = 8;

    this.init();

}
util.inherits(meter, widget);


meter.prototype.init = function(){
   this.bar = {
        x: 0,
        y: 0,
        w: this.GUI.w,
        h: this.GUI.h/this.bars
    }
    with (this.context) {
        fillStyle = this.colors.fill;
        fillRect(0,0,this.GUI.w, this.GUI.h);
    }
}



/** @method setup  
    Connect the meter to an audio source and start the meter's graphics.
    @param {audio context} [context] The audio context hosting the source node
    @param {audio node} [source] The audio source node to analyze
    */
meter.prototype.setup = function(actx,source){
    this.actx = actx;   
    this.source = source;

    this.analyser = this.actx.createAnalyser();
    this.analyser.smoothingTimeConstant = 0.85;
    this.analyser.fftsize = 1024;
    this.bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(this.bufferLength);
    this.source.connect(this.analyser);
    
    this.draw();
}

meter.prototype.draw = function(){
    
    if(this.dataArray) {
        this.analyser.getByteTimeDomainData(this.dataArray);

        var max = Math.max.apply(null, this.dataArray);
        var min = Math.min.apply(null, this.dataArray);
        var amp = max - min;
        amp /= 240

        //converts amps to db
        var db = 20 * (Math.log(amp) / Math.log(10))

        with (this.context){
            fillStyle = this.colors.fill;
            fillRect(0,0,this.GUI.w, this.GUI.h);

            //scales: -40 to +10 db range => a number of bars
            var dboffset = Math.floor((db + 40) / (50/this.bars) );
           
            for (var i = 0; i<this.bars; i++) {

                // 0+ db is red
                if(i >= this.bars*.8) {
                    fillStyle = 'rgb(255,0,0)';

                // -5 to 0 db is yellow
                } else if (i < this.bars*.8 && i >= this.bars*.69) {
                    fillStyle = 'rgb(255,255,0)';

                // -40 to -5 db is green
                } else if (i < this.bars*.69) {
                    fillStyle = 'rgb(0,255,0)';
                }

                // draw bar
                if (i<dboffset)
                    fillRect(1,this.GUI.h-this.bar.h*i,this.GUI.w-2,this.bar.h-2);

            }
        }
    }

    setTimeout(function() {
        window.requestAnimationFrame(this.draw.bind(this));
    }.bind(this), 80)
    
}
    
    
},{"../core/widget":3,"../utils/drawing":5,"util":51}],24:[function(require,module,exports){
var math = require('../utils/math')
var util = require('util');
var widget = require('../core/widget');

/** 
	@class metro      
	Bouncing ball metronome
	```html
	<canvas nx="metro"></canvas>
	```
	<canvas nx="metro" style="margin-left:25px"></canvas>
*/

var metro = module.exports = function (target) {
	this.defaultSize = { width: 100, height: 20 };
	widget.call(this, target);

	//define unique attributes
	
	/** @property {object}  val   
		| &nbsp; | data
		| --- | ---
		| *beat* | Which side the ball is bouncing on (0 if left, 1 if right)
	*/
	this.val = {
		beat: 0
	}

	this.x = 10;
	this.y = 10;
	this.loc = 10;
	this.nodeSize = 10;
	/** @property {float} speed Speed of the ball (default 1) */
	this.speed = 1;
	this.direction = 1;
	/** @property {string} orientation Orientation of metro. Default is "horizontal". */
	this.orientation = "horizontal"
	this.boundary = this.GUI.w

	nx.aniItems.push(this.advance.bind(this));
	this.active = true;
	
	this.init();
}
util.inherits(metro, widget);

metro.prototype.init = function() {
	this.nodeSize = Math.min(this.GUI.w,this.GUI.h)/2;
	if (this.GUI.w<this.GUI.h) {
		this.orientation = "vertical"
		this.boundary = this.GUI.h
	} else {
		this.orientation = "horizontal"
		this.boundary = this.GUI.w
	}
	this.x = this.nodeSize;
	this.y = this.nodeSize;
	this.loc = this.nodeSize;

	this.draw();

}

metro.prototype.draw = function() {
	this.erase()
	with (this.context) {
		fillStyle = this.colors.fill;
		fillRect(0,0,this.GUI.w,this.GUI.h); 

		beginPath();
		fillStyle = this.colors.accent;
		arc(this.x, this.y, this.nodeSize, 0, Math.PI*2, true);					
		fill();
		closePath();
	}
	
	this.drawLabel();
}

metro.prototype.click = function() {
}

metro.prototype.move = function() {
	if (this.clicked) {
		this.speed -= (this.deltaMove.y / 50);
	}
}

metro.prototype.release = function() {
}

metro.prototype.advance = function() {
	if (this.speed>=0) {
		this.loc += this.speed * this.direction;
	} else {
		this.loc += this.speed * this.direction;
	}
	if (this.loc-this.nodeSize<0 || this.loc+this.nodeSize>this.boundary) {
		this.val.beat = math.scale(this.direction,-1,1,0,1)
		this.transmit(this.val);
		this.direction *= -1
	}
	if (this.orientation == "vertical") {
		this.y = this.loc
	} else {
		this.x = this.loc
	}
	this.draw();
}

metro.prototype.customDestroy = function() {
	nx.removeAni(this.advance.bind(this))
}
},{"../core/widget":3,"../utils/math":6,"util":51}],25:[function(require,module,exports){
var math = require('../utils/math');
var drawing = require('../utils/drawing');
var util = require('util');
var widget = require('../core/widget');

/** 
	@class metroball
	Bouncy-balls for rhythms
	```html
	<canvas nx="metroball"></canvas>
	```
	<!-- <canvas nx="metroball" style="margin-left:25px"></canvas> -->
*/


var metroball = module.exports = function (target) {
	this.defaultSize = { width: 300, height: 200 };
	widget.call(this, target);
	
	
	//define unique attributes
	this.CurrentBalls = new Array();
	this.ballpos = new Object();
	this.clickField = null;
	this.globalMetro;
	this.tempo = 1;
	this.tempoMarker = 150;
	this.quantize = false;
	this.tiltLR;
	this.tiltFB;
	this.z;

	/** @property {object}  val   
		| &nbsp; | data
		| --- | ---
		| *x* | x position of the bouncing ball
		| *side* | 0 or 1 int (which side is hit)
		| *ball* | Which ball is doing the bouncing
		| *all* | All three values together in a string
	*/
	this.val = {
		x: false,
		side: false,
		ball: false,
		all: false
	}

	nx.aniItems.push(this.metro.bind(this));

	this.init();
}
util.inherits(metroball, widget);

metroball.prototype.init = function() {
	//this.metro();
	this.draw()
}

metroball.prototype.metro = function() {
	with (this.context) {
		clearRect(0,0, this.GUI.w, this.GUI.h);
	}
	this.drawSpaces();
	this.drawBalls();
	this.drawLabel();
}

metroball.prototype.drawSpaces = function() {
	
	with (this.context) {

		fillStyle = this.colors.fill;
		fillRect(0,0,this.GUI.w,this.GUI.h)
		
		fillStyle=this.colors.border;
		fillRect(0,0,this.GUI.w,this.GUI.h/4)

		font="normal "+this.GUI.h/8+"px "+nx.font;
		textAlign = "center";
		textBaseline = "middle"
		fillText("add",this.GUI.w/2,this.GUI.h/1.66)


		fillStyle = this.colors.fill;
		fillText("delete",this.GUI.w/2,this.GUI.h/8)
		
	}
}

metroball.prototype.drawBalls = function() {
	with (this.context) {
		for (var i=0;i<this.CurrentBalls.length;i++) {
			this.CurrentBalls[i].move();
			this.CurrentBalls[i].draw();
		}
	}
}

metroball.prototype.click = function(e) {
	
	this.ballpos = this.clickPos;

	if (this.clickPos.y < this.GUI.h/4) {
		this.deleteMB(this.ballpos);
	} else {
		this.addNewMB(this.ballpos);
	}
	

}

metroball.prototype.move = function(e) {
	this.ballpos = this.clickPos;
	
	if (this.clickPos.y < this.GUI.h/4) {
		this.deleteMB(this.ballpos);
	} else {
		this.addNewMB(this.ballpos);
	}
}

metroball.prototype.release = function(e) {
	this.clickField = null;
}


metroball.prototype.deleteMB = function(ballpos) {
	//delete in reverse order
	for (var i=this.CurrentBalls.length-1;i>=0;i--) {
		if (Math.abs(this.CurrentBalls[i].xpos-ballpos.x)<10) {
			this.CurrentBalls[i].kill();
		}
	}
	
	//reset CurrentBalls
	for (var i=0;i<this.CurrentBalls.length;i++) {
		this.CurrentBalls[i].thisIndex=i;
	}
}

	
metroball.prototype.addNewMB = function(ballpos) {
	var nextIndex = this.CurrentBalls.length;
	this.CurrentBalls[nextIndex] = new this.Ball(nextIndex, ballpos.x, ballpos.y, this);
}


metroball.prototype.toggleQuantization = function() {
	if (!this.quantize) {
		this.quantize = true;
	} else {
		this.quantize = false;
	}
}

/* Tilt */

metroball.prototype.tilt = function(direction) {
	
	var scaledX = math.prune(this.tiltLR/90,3);
	var scaledY = math.prune(this.tiltFB/90,3);
	var scaledZ = math.prune(this.z,3);
	tilt = scaledX * 10;
	this.tempo = Math.pow(scaledY+1,3);
}


metroball.prototype.Ball = function(thisIndex, thisX, thisY, parent) {

	
	this.thisIndex = thisIndex;
	this.color = parent.colors.accent;
	this.space = {
		ypos1: 0,
		ypos2: parent.height,
		xpos1: 0,
		xpos2: parent.width,
		hgt: parent.height,
		wid: parent.width
	}
	this.xpos = thisX;
	this.ypos = thisY;
	this.size = 10;
	this.direction = 1;
	this.speed = (parent.height-this.ypos)/20;
	this.speedQ = 5;
	
	if (this.quantize) {
		this.ypos = parent.height-13;
	}
	
	this.move = function() {
		if (!this.quantize) {
			this.ypos = this.ypos + (this.speed * this.direction * parent.tempo);
		} else {
			this.ypos = this.ypos + (this.speedQ * this.direction * parent.tempo);	
		}
		
		if (this.ypos>(parent.height-this.size-2) || this.ypos<(this.size+2) ) {
			this.bounce();
		}
		
		if (this.ypos<this.space.ypos+this.size) {
			this.ypos=this.space.ypos+this.size+5;
		} else if (this.ypos>this.space.ypos+this.space.hgt-this.size) {
			this.ypos=this.space.ypos+this.space.hgt-this.size-5;
		}
		
		
		if (this.xpos<this.space.xpos) {
			this.xpos = this.space.xpos2;	
		} else if (this.xpos>this.space.xpos2) {
			this.xpos = this.space.xpos;	
		}
		
	}
	
	this.bounce = function() {
		var dirMsg = this.direction/2+1;
		this.bounceside = (this.direction+1)/2;
		this.direction = this.direction * (-1);
		var xMsg = math.prune(this.xpos/this.space.wid, 3);
		this.val = {
			x: xMsg,
			side: this.bounceside,
			ball: this.thisIndex,
			all: xMsg + " " + this.bounceside + " " + this.thisIndex
		}
		parent.transmit(this.val);
	}
	
	this.kill = function() {
		parent.CurrentBalls.splice(this.thisIndex,1);
	}
	
	this.draw = function() {
		
		with (parent.context) {
			beginPath();
			fillStyle = this.color;
			if (this.direction==1) {
				this.radius = this.size * (Math.abs((this.ypos-this.space.ypos-this.space.hgt/2)/(this.space.hgt-this.space.ypos)*2));
				this.radius = this.radius/2 + this.size/2;
				
				this.radius = this.size;
				
				this.radius = this.speed;
				
				this.radius = Math.abs(15-this.speed);
				
			} else {
				this.radius = this.size * Math.abs(2-(Math.abs((this.ypos-this.space.ypos-this.space.hgt/2)/(this.space.hgt-this.space.ypos)*2)));
				this.radius = this.radius/2 + this.size/2;
				
				this.radius = this.size;
				
				this.radius = Math.abs(15-this.speed);
			}
			arc(this.xpos, this.ypos, this.radius, 0, Math.PI*2, true);
			fill();
		}	
	}	
}
},{"../core/widget":3,"../utils/drawing":5,"../utils/math":6,"util":51}],26:[function(require,module,exports){
var math = require('../utils/math')
var util = require('util');
var widget = require('../core/widget');

/** 
	@class motion      
	Mobile motion sensor. Does not work on all devices! <br> **Notes:** Clicking on this widget toggles it inactive or active. <br>
	We recommend not calling .init() on this object after the original initialization, because it will add additional redundant motion listeners to your document.
	```html
	<canvas nx="motion"></canvas>
	```
	<canvas nx="motion" style="margin-left:25px"></canvas>
*/

var motion = module.exports = function (target) {
	this.defaultSize = { width: 75, height: 75 };
	widget.call(this, target);
	
	this.motionLR;
	this.motionFB;
	this.z;
	/** @property {boolean} active Whether or not the motion widget is on (animating and transmitting data). */
	this.active = true;

	this.px = 0;
	this.py = 0;
	this.pz = 0;

	/** @property {object}  val  Object containing the core interactive aspects of the widget, which are also its data output. Has the following properties: 
		| &nbsp; | data
		| --- | ---
		| *x* | X-axis motion if supported (-1 to 1)
		| *y* | Y-axis motion if supported (-1 to 1)
		| *z* | Z-axis motion if supported (-1 to 1 or 0 to 360 depending on device)
	*/
	this.val = {
		x: 0,
		y: 0,
		z: 0
	}

	/** @property {string}  text   Text shown on motion object
	*/
	
	this.text = "Motion";
	this.init();

	this.boundMotion = this.motionlistener.bind(this)

	if (window.DeviceMotionEvent) {
		window.addEventListener('devicemotion', this.boundMotion, false);
	} else {
		with (this.context) {
			fillText("incompatible",0,0)
			this.active = false;
		}
	}
	
}
util.inherits(motion, widget);

motion.prototype.deviceMotionHandler = function() {
	
	this.val = {
		x: math.prune(this.motionLR/10,4),
		y: math.prune(this.motionFB/10,4),
		z: math.prune(this.z/10,4)
	}

	this.transmit(this.val);
	
}

motion.prototype.motionlistener = function(e) {
	var data = e.acceleration
	
	if (this.active) {


		this.motionLR = nx.lp(this.canvasID+"motionx",data.x,20)
		this.motionFB = nx.lp(this.canvasID+"motiony",data.y,20)
		this.z = nx.lp(this.canvasID+"motionz",data.z,20)
    	this.deviceMotionHandler()

   		this.draw();

		if (data.x===null || data.x===undefined) {
			this.erase()
			with (this.context) {
				fillStyle = this.colors.fill
				fillRect(0,0,this.GUI.w,this.GUI.h)
				fillStyle = this.colors.black
				font="12px courier";
				textAlign = "center"
				fillText("no data",this.GUI.w/2,this.GUI.h/2)	
			}
			this.active = false;
		}
 	}
}

motion.prototype.init = function() {
	this.draw()
}

motion.prototype.draw = function() {
	
	this.erase()

	with (this.context) {
	    fillStyle = this.colors.fill;
	    fillRect(0,0,this.GUI.w,this.GUI.h);
	    fillStyle = this.colors.accent;
	    var eighth = Math.PI/4
	    if (this.motionFB<0) {
			beginPath()
				moveTo(this.GUI.w/2,this.GUI.h/2)
				arc(this.GUI.w/2,this.GUI.h/2,this.GUI.w/2,eighth*5,eighth*7,false)
				globalAlpha = Math.pow(this.motionFB, 2)
				fill()
			closePath()
	    } else {
			beginPath()
				moveTo(this.GUI.w/2,this.GUI.h/2)
				arc(this.GUI.w/2,this.GUI.h/2,this.GUI.w/2,eighth*1,eighth*3,false)
				globalAlpha = Math.pow(this.motionFB, 2)
				fill()
			closePath()
	    }
	    if (this.motionLR<0) {
			beginPath()
				moveTo(this.GUI.w/2,this.GUI.h/2)
				arc(this.GUI.w/2,this.GUI.h/2,this.GUI.w/2,eighth*7,eighth*1,false)
				globalAlpha = Math.pow(this.motionLR, 2)
				fill()
			closePath()
	    } else {
			beginPath()
				moveTo(this.GUI.w/2,this.GUI.h/2)
				arc(this.GUI.w/2,this.GUI.h/2,this.GUI.w/2,eighth*3,eighth*5,false)
				globalAlpha = Math.pow(this.motionLR, 2)
				fill()
			closePath()
	    }
		beginPath()
			moveTo(this.GUI.w/2,this.GUI.h/2)
			arc(this.GUI.w/2,this.GUI.h/2,this.GUI.w/6,0,Math.PI*2,false)
			globalAlpha = Math.pow(this.z, 2)
			fill()
		closePath()
		globalAlpha = 1
	}
	this.drawLabel();
}

motion.prototype.click = function() {
	this.active = !this.active;
	this.draw()
}

motion.prototype.customDestroy = function() {
	this.active = false;
	window.removeEventListener("devicemotion",this.motionlistener,false);
}
},{"../core/widget":3,"../utils/math":6,"util":51}],27:[function(require,module,exports){
var util = require('util');
var widget = require('../core/widget');
var math = require('../utils/math');

/** 
	@class mouse      
	Mouse tracker, relative to web browser window.
	```html
	<canvas nx="mouse"></canvas>
	```
	<canvas nx="mouse" style="margin-left:25px"></canvas>
*/

var mouse = module.exports = function (target) {
	
	this.defaultSize = { width: 98, height: 100 };
	widget.call(this, target);

	/** @property {object}  val   
		| &nbsp; | data
		| --- | ---
		| *x* | x value of mouse relative to browser
		| *y* | y value of mouse relative to browser
		| *deltax* | x change in mouse from last position
		| *deltay* | y change in mouse from last position
	*/
	this.val = {
		x: 0,
		y: 0,
		deltax: 0, 
		deltay: 0
	}
	this.inside = new Object();
	this.boundmove = this.preMove.bind(this)
	this.mousing = window.addEventListener("mousemove", this.boundmove, false);
	
	this.init();
}
util.inherits(mouse, widget);

mouse.prototype.init = function() {
	
	this.inside.height = this.GUI.h;
	this.inside.width = this.GUI.w;
	this.inside.left = 0;
	this.inside.top = 0;
	this.inside.quarterwid = (this.inside.width)/4;
	 
	this.draw();
}

mouse.prototype.draw = function() {
	this.erase();

	with (this.context) {
		fillStyle = this.colors.fill;
		fillRect(0,0,this.GUI.w,this.GUI.h); 

		var scaledx = -(this.val.x) * this.GUI.h;
		var scaledy = -(this.val.y) * this.GUI.h;
		var scaleddx = -(this.val.deltax) * this.GUI.h - this.GUI.h/2;
		var scaleddy = -(this.val.deltay) * this.GUI.h - this.GUI.h/2;

		fillStyle = this.colors.accent;
		fillRect(this.inside.left, this.inside.height, this.inside.quarterwid, scaledx);
		fillRect(this.inside.quarterwid, this.inside.height, this.inside.quarterwid, scaledy);
		fillRect(this.inside.quarterwid*2, this.inside.height, this.inside.quarterwid, scaleddx);
		fillRect(this.inside.quarterwid*3, this.inside.height, this.inside.quarterwid, scaleddy);

		globalAlpha = 1;
		fillStyle = this.colors.fill;
		textAlign = "center";
		font = this.GUI.w/7+"px "+this.font;
/*  fillText("x", this.inside.quarterwid*0 + this.inside.quarterwid/2, this.GUI.h-7);
		fillText("y", this.inside.quarterwid*1 + this.inside.quarterwid/2, this.GUI.h-7);
		fillText("dx", this.inside.quarterwid*2 + this.inside.quarterwid/2, this.GUI.h-7);
		fillText("dy", this.inside.quarterwid*3 + this.inside.quarterwid/2, this.GUI.h-7);
*/
		globalAlpha = 1;
	}
	
	this.drawLabel();
}

mouse.prototype.move = function(e) {
	this.val = {
		deltax: e.clientX/window.innerWidth - this.val.x,
		deltay: math.invert(e.clientY/window.innerHeight) - this.val.y,
		x: e.clientX/window.innerWidth,
		y: math.invert(e.clientY/window.innerHeight)
	}
	this.draw();
	this.transmit(this.val);

}

mouse.prototype.customDestroy = function() {
	window.removeEventListener("mousemove",  this.boundmove, false);
}
},{"../core/widget":3,"../utils/math":6,"util":51}],28:[function(require,module,exports){
var math = require('../utils/math')
var util = require('util');
var widget = require('../core/widget');

/** 
	@class multislider      
	Multiple vertical sliders in one interface.
	```html
	<canvas nx="multislider"></canvas>
	```
	<canvas nx="multislider" style="margin-left:25px"></canvas>
*/
var multislider = module.exports = function (target) {
	
	this.defaultSize = { width: 100, height: 75 };
	widget.call(this, target);
	
	/** @property {integer} sliders Number of sliders in the multislider. (Must call .init() after changing this setting, or set with .setNumberOfSliders) */
	this.sliders = 15;

	/** @property {array}  val   Array of slider values. <br> **Note:** This widget's output is not .val! Transmitted output is:	

		| &nbsp; | data
		| --- | ---
		| *(slider index)* | value of currently changed slider
		| list | all multislider values as list. (if the interface sends to js or node, this list will be an array. if sending to ajax, max7, etc, the list will be a string of space-separated values)

	*/
	
	this.sliderClicked = 0;
	this.oldSliderToMove;
	this.init();
}
util.inherits(multislider, widget);

multislider.prototype.init = function() {
	this.val = new Array();
	for (var i=0;i<this.sliders;i++) {
		this.val[i] = 0.7;
	}
	this.realSpace = { x: this.GUI.w, y: this.GUI.h }
	this.sliderWidth = this.realSpace.x/this.sliders;
	this.draw();
}

multislider.prototype.draw = function() {
	this.erase();
	with (this.context) {
		fillStyle = this.colors.fill;
		fillRect(0,0,this.GUI.w,this.GUI.h);
		
		strokeStyle = this.colors.accent;
		fillStyle = this.colors.accent;
		lineWidth = 5;
    	
		for(var i=0; i<this.sliders; i++) {
			beginPath();
			moveTo(i*this.sliderWidth, this.GUI.h-this.val[i]*this.GUI.h);
			lineTo(i*this.sliderWidth + this.sliderWidth, this.GUI.h-this.val[i]*this.GUI.h);
			stroke();
			lineTo(i*this.sliderWidth + this.sliderWidth, this.GUI.h);
			lineTo(i*this.sliderWidth,  this.GUI.h);
			globalAlpha = 0.3 - (i%3)*0.1;
			fill();
			closePath(); 
			globalAlpha = 1;
		//	var separation = i==this.sliders-1 ? 0 : 1;
		//	fillRect(i*this.sliderWidth, this.GUI.h-this.val[i]*this.GUI.h, this.sliderWidth-separation, this.val[i]*this.GUI.h)
		}
	}
	this.drawLabel();
}

multislider.prototype.click = function() {
	this.oldSliderToMove = false;
	this.move(true);
}

multislider.prototype.move = function(firstclick) {
	if (this.clicked) {


		if (this.clickPos.touches.length>1) {

			for (var i=0;i<this.clickPos.touches.length;i++) {
				var sliderToMove = Math.floor(this.clickPos.touches[i].x / this.sliderWidth);
				sliderToMove = math.clip(sliderToMove,0,this.sliders-1);
				this.val[sliderToMove] = math.clip(math.invert((this.clickPos.touches[i].y / this.GUI.h)),0,1);
			}

		} else {

			var sliderToMove = Math.floor(this.clickPos.x / this.sliderWidth);
			sliderToMove = math.clip(sliderToMove,0,this.sliders-1);
			this.val[sliderToMove] = math.clip(math.invert(this.clickPos.y / this.GUI.h),0,1);

			if (this.oldSliderToMove && this.oldSliderToMove > sliderToMove + 1) {
				var missed = this.oldSliderToMove - sliderToMove - 1;
				for (var i=1;i<=missed;i++) {
					this.val[sliderToMove+i] = this.val[sliderToMove] + (this.val[this.oldSliderToMove] - this.val[sliderToMove]) * ((i/(missed+1)));
				}
			} else if (this.oldSliderToMove && sliderToMove > this.oldSliderToMove + 1) {
				var missed = sliderToMove - this.oldSliderToMove - 1;
				for (var i=1;i<=missed;i++) {
					this.val[this.oldSliderToMove+i] = this.val[this.oldSliderToMove] + (this.val[sliderToMove] - this.val[this.oldSliderToMove]) * ((i/(missed+1)));
				}
			}
		
		}
		this.draw();
	}
	var msg = new Object()
	msg[sliderToMove] = this.val[sliderToMove]
	if (this.destination=="js" || this.destination=="node") {
		msg["list"] = this.val;
	} else {
		msg["list"] = new String();
		for (var key in this.val) { msg["list"] += this.val[key] + " " }
	}
	this.transmit(msg);
	this.oldSliderToMove = sliderToMove;
	
}

/** @method setNumberOfSliders
@param {integer} [num] New number of sliders in the multislider */
multislider.prototype.setNumberOfSliders = function(numOfSliders) {
	this.sliders = numOfSliders;
	this.val = new Array();
	for (var i=0;i<this.sliders;i++) {
		this.val.push(0.7);
	}
	this.sliderWidth = this.realSpace.x/this.sliders;
	this.init();
}

/** @method setSliderValue
Sets a slider to new value and transmits.
@param {integer} [slider] Slider to set (slider index starts at 0)
@param {integer} [value] New slider value */
multislider.prototype.setSliderValue = function(slider,value) {
	this.val[slider] = value;
	this.draw();
	var msg = new Object();
	msg[slider] = this.val[slider]
	if (this.destination=="js" || this.destination=="node") {
		msg["list"] = this.val;
	} else {
		msg["list"] = new String();
		for (var key in this.val) { msg["list"] += this.val[key] + " " }
	}
	this.transmit(msg);
}

},{"../core/widget":3,"../utils/math":6,"util":51}],29:[function(require,module,exports){
var math = require('../utils/math');
var drawing = require('../utils/drawing');
var util = require('util');
var widget = require('../core/widget');

/** 
	@class multitouch      
	Multitouch 2d-slider with up to 5 points of touch.
	```html
	<canvas nx="multitouch"></canvas>
	```
	<canvas nx="multitouch" style="margin-left:25px"></canvas>
*/

var multitouch = module.exports = function (target) {
	
	this.defaultSize = { width: 200, height: 200 };
	widget.call(this, target);
	
	//unique attributes
	this.nodeSize = this.GUI.w/10;

	/** @property {object}  val   
		| &nbsp; | data
		| --- | ---
		| *touch1.x* | x position of first touch
		| *touch1.y* | y position of first touch
		| *touch2.x* | x position of second touch (if 2 touches)
		| *touch2.y* | y position of second touch (if 2 touches)
		| *etc* | &nbsp;
	*/
	this.val = {
		touch1: {
			x: 0,
			y: 0
		}
	}
	
	this.nodes = new Array();
	
	/** @property {string}  text  Text that will show when object is static */
	this.text = "multitouch";

	this.rainbow = ["#00f", "#04f", "#08F", "0AF", "0FF"];
	
	/** @property {string}  mode   "normal" or "matrix" mode. "matrix" mode has a GUI of discrete touch areas.
	*/
	this.mode = "normal";

	/** @property {integer}  rows   How many rows in the matrix (matrix mode only)
	*/
	this.rows = 10;

	/** @property {integer}  cols   How many rows in the matrix (matrix mode only)
	*/
	this.cols = 10;

	/** @property {array}  matrixLabels  An array of strings that can provide text labels on cells of the matrix. If shorter than the matrix cells, the array will repeat.
	```
		this.mode = "matrix"
		this.matrixLabels = [ "A", "A#", "B", "C" ]
		this.init();
	```
	*/
	this.matrixLabels = false;

	this.init();
}
util.inherits(multitouch, widget);

multitouch.prototype.init = function() {
	this.nodeSize = this.GUI.w/10;
	this.draw();
}

multitouch.prototype.draw = function() {
	this.erase();
	with (this.context) {
		fillStyle = this.colors.fill;
		fillRect(0,0,this.GUI.w,this.GUI.h);

		var count = 0;

		if (this.mode == "matrix") {
			for (var j=0;j<this.rows;j++) {
				for (var i=0;i<this.cols;i++) {
					with (this.context) {
						beginPath();
							fillStyle = this.colors.accent;
							strokeStyle = this.colors.border;
							lineWidth = 1;
							var circx = i*this.GUI.w/this.cols + (this.GUI.w/this.cols)/2;
							var circy = j*this.GUI.h/this.rows + (this.GUI.h/this.rows)/2;
							arc(circx, circy, (this.GUI.h/this.rows)/2, 0, Math.PI*2, true);					
							stroke();
							fillStyle = this.colors.border;
							textAlign = "center";
							textBaseline = "middle";
							if (this.matrixLabels) {
								fillText(this.matrixLabels[count%this.matrixLabels.length], circx, circy);
								count++
							} 
							var thisarea = {
								x: i*this.GUI.w/this.cols,
								y: j*this.GUI.h/this.rows,
								w: this.GUI.w/this.cols,
								h: this.GUI.h/this.rows
							}
							if (this.clickPos.touches.length>=1) {
								for (var k=0;k<this.clickPos.touches.length;k++) {
									if (drawing.isInside(this.clickPos.touches[k],thisarea)) {
										globalAlpha=0.5;
										fillStyle = this.colors.accent;
										fill();
										globalAlpha=0.3;
										fillStyle = this.rainbow[k];
										fill();
										globalAlpha=1;
									}
								}
							}
						closePath();
					}
				}
			}
		} else {
			if (this.clickPos.touches.length>=1) {
				for (var i=0;i<this.clickPos.touches.length;i++) {
					
					with (this.context) {
						globalAlpha=0.5;
						beginPath();
						fillStyle = this.colors.accent;
						strokeStyle = this.colors.border;
						lineWidth = this.lineWidth;
						arc(this.clickPos.touches[i].x, this.clickPos.touches[i].y, this.nodeSize, 0, Math.PI*2, true);					
						fill();
						//	stroke();
						closePath();
						globalAlpha=0.3;
						beginPath();
						fillStyle = this.rainbow[i];
						strokeStyle = this.colors.border;
						lineWidth = this.lineWidth;
						arc(this.clickPos.touches[i].x, this.clickPos.touches[i].y, this.nodeSize, 0, Math.PI*2, true);					
						fill();
						//	stroke();
						closePath(); 
						globalAlpha=1;
					}
				}
				clearRect(0,this.GUI.h,this.GUI.w,this.height - this.GUI.h)
			}
			else {
				this.setFont()
				fillStyle = this.colors.border;
				fillText(this.text, this.GUI.w/2, this.GUI.h/2);
				globalAlpha = 1;
			}
		}
	}
	this.drawLabel();
}

multitouch.prototype.click = function() {
	this.draw();
	this.sendit();
}

multitouch.prototype.move = function() {
	if (this.clicked) {
		this.draw();
		this.sendit();
	}
}

multitouch.prototype.release = function() {

	if(!this.clicked) {
		this.clickPos.touches = new Array();
		for (var i=0;i<5;i++) {
			this.val["touch"+i] = {
				x: 0,
				y: 0
			}
		}
		this.transmit(this.val);
	}
	
	this.draw();
	this.sendit();
	
}

multitouch.prototype.sendit = function() {
	this.val = new Object();
	for (var i=0;i<this.clickPos.touches.length;i++) {
		this.val["touch"+i] = {
			x: this.clickPos.touches[i].x/this.canvas.width,
			y: math.invert(this.clickPos.touches[i].y/this.canvas.height)
		}
	}
	this.transmit(this.val);
}
},{"../core/widget":3,"../utils/drawing":5,"../utils/math":6,"util":51}],30:[function(require,module,exports){
var math = require('../utils/math')
var util = require('util');
var widget = require('../core/widget');

/** 
	@class number      
	Number box
	```html
	<canvas nx="number"></canvas>
	```
	<canvas nx="number" style="margin-left:25px"></canvas>
*/

var number = module.exports = function (target) {
	this.defaultSize = { width: 50, height: 20 };
	widget.call(this, target);
	
	/** @property {object}  val    
		| &nbsp; | data
		| --- | ---
		| *value* | Number value
		
		```js
			// Sets number1.val.value to 20
			number1.set({
			&nbsp; value: 20
			})
		```
	*/
	this.val = {
		value: 0
	}

	/** @property {float}  min   The minimum number allowed. Default is -20000.

		```js
		    // only allow positive numbers
			number1.min = 0;
		```
	*/
	this.min = -20000

	/** @property {float}  max   The maximum number allowed. Default is 20000.

		```js
		    // only allow negative numbers
			number1.max = 0;
		```
	*/
	this.max = 20000

	/** @property {float}  step   The increment. Default is 1.

		```js
		    // count by 10s
			number1.step = 10;
		```
	*/
	this.step = 1


	/** @property {float}  rate   Sensitivity of dragging. Default is .25

		```js
		    // For fine tuning 
			number1.rate = .001;
		```
	*/
	this.rate = .25

	/** @property {integer}  decimalPlaces   How many decimal places on the number. This applies to both the output and the interface text. Default is 2. To achieve an int (non-float), set decimalPlaces to 0.

		```js
			// For an int counter
			number1.decimalPlaces = 0;
		```
	*/ 
	this.decimalPlaces = 3;
	this.lostdata = 0;
	this.actual = 0;

	// SWAP
	// 
	this.canvas.ontouchstart = null;
	this.canvas.ontouchmove = null;
	this.canvas.ontouchend = null;

	var htmlstr = '<input type="text" nx="number" id="'+this.canvasID+'" style="height:'+this.GUI.h+'px;width:'+this.GUI.w+'px;font-size:'+this.GUI.h/2+'px;"></input><canvas height="1px" width="1px" style="display:none"></canvas>'                   
	var canv = this.canvas
	var cstyle = this.canvas.style
	var parent = canv.parentNode
	var newdiv = document.createElement("span")
	newdiv.innerHTML = htmlstr
	newdiv.className = "nx"
	parent.replaceChild(newdiv,canv)

	this.el = document.getElementById(this.canvasID)
	for (var prop in cstyle) {
			if (prop != "height" && prop != "width") {
    		this.el.style[prop] = cstyle[prop]
 			}
  }

  if (this.label) {
	  var labeldiv = document.createElement("div")
	  labeldiv.innerHTML = this.label
	  labeldiv.style.fontSize = this.labelSize/2.8+"px"
	  labeldiv.style.fontFamily = this.labelFont
	  labeldiv.style.textAlign = this.labelAlign
	  labeldiv.style.lineHeight = this.labelSize+"px"
	  labeldiv.style.width = this.GUI.w+"px"
	  labeldiv.style.color = nx.colors.black
	  labeldiv.className = "nxlabel"
	  newdiv.appendChild(labeldiv)
  }

	this.canvas = document.getElementById(this.canvasID);
	this.canvas.style.height = this.GUI.h + "px"
	this.canvas.style.fontSize = this.GUI.h * .6 + "px"
	this.canvas.style.textAlign = "left"
	this.canvas.style.backgroundColor = this.colors.fill
	this.canvas.style.highlight = this.colors.fill
	this.canvas.style.border = "none"
	this.canvas.style.outline = "none"
	this.canvas.style.padding = "4px 10px"
	this.canvas.style.cursor = "pointer"
	this.canvas.style.display = "block"
	this.canvas.className = ""

	this.canvas.addEventListener("blur", function () {
	  //this.canvas.style.border = "none";

	  this.canvas.style.backgroundColor = this.colors.fill;
	  this.canvas.style.color = this.colors.black;
	  if (this.canvas.value != this.val.value) {
	  	this.actual = parseFloat(this.canvas.value)
	  	this.actual = math.clip(this.actual,this.min,this.max)
		this.actual = math.prune(this.actual,this.decimalPlaces);
	  	this.set({"value": this.actual}, true)
	  }
	}.bind(this));

	this.canvas.addEventListener("keydown", function (e) {
	  if (e.which < 48 || e.which > 57) {
	  	if (e.which != 189 && e.which != 190 && e.which != 8) {
	  		e.preventDefault();
	  	}
	  }
	  if (e.which==13) {
	  /*	this.actual = parseFloat(this.canvas.value)
	  	this.actual = math.clip(this.actual,this.min,this.max)
		this.actual = math.prune(this.actual,this.decimalPlaces);
	  	this.set({"value": this.actual}, true) */
	  	//this.canvas.style.outline = "none";
	  	this.canvas.blur()
	  }
	}.bind(this));

	
  // Setup interaction
  if (nx.isTouchDevice) {
    this.canvas.ontouchstart = this.preTouch;
    this.canvas.ontouchmove = this.preTouchMove;
    this.canvas.ontouchend = this.preTouchRelease;
  } else {
    this.canvas.addEventListener('mousedown', this.preClick, false);
  }


  this.canvas.style.userSelect = "none !important";
  this.canvas.style.mozUserSelect = "none !important";
  this.canvas.style.webkitUserSelect = "none !important";






	this.init();
}
util.inherits(number, widget);

number.prototype.init = function() {


  this.draw();
}

number.prototype.draw = function() {

	this.canvas.value = this.val.value;

}


number.prototype.click = function(e) {
	this.canvas.readOnly = true
	this.actual = this.val.value
}

number.prototype.move = function(e) {
	if (this.clicked) {
	  	this.canvas.style.border = "none";

		this.actual -= (this.deltaMove.y*(this.rate*this.step));
		this.actual = math.clip(this.actual,this.min,this.max)
		this.val.value = Math.floor(this.actual / this.step) * this.step;
		this.val.value = math.prune(this.val.value,this.decimalPlaces);
		this.draw();
		this.transmit(this.val);
	}
}


number.prototype.release = function(e) {
	if (!this.hasMoved && this.canvas.readOnly) {
		this.canvas.readOnly = false;
		this.canvas.focus()
		this.canvas.setSelectionRange(0, this.canvas.value.length)
		this.canvas.style.backgroundColor = this.colors.accent;
		this.canvas.style.color = this.colors.fill;
	}
}

},{"../core/widget":3,"../utils/math":6,"util":51}],31:[function(require,module,exports){
var util = require('util');
var widget = require('../core/widget');

// panel for max duplication -- maybe this object is unnecessary.

var panel = module.exports = function (target) {
	this.defaultSize = { width: 100, height: 100 };
	widget.call(this, target);
}
util.inherits(panel, widget);

panel.prototype.init = function() {
	this.draw();
}

panel.prototype.draw = function() {
	this.erase();
	this.makeRoundedBG();
	with (this.context) {
		fillStyle = this.colors.border;
		lineWidth = this.lineWidth;
		fill();
	}
}
},{"../core/widget":3,"util":51}],32:[function(require,module,exports){
var math = require('../utils/math')
var util = require('util');
var widget = require('../core/widget');

/** 
	@class position      
	Two-dimensional touch slider.
	```html
	<canvas nx="position"></canvas>
	```
	<canvas nx="position" style="margin-left:25px"></canvas>
*/

var position = module.exports = function (target) {

	// define a default size
	this.defaultSize = { width: 150, height: 100 };

	widget.call(this, target);
	
	/** @property {integer} nodeSize Size of touch node graphic. */
	this.nodeSize = 15;

	/** @property {object}  val   val is an object containing the main interactive / actionable aspects of the widget.
		| &nbsp; | data
		| --- | ---
		| *x* | x position of slider (float 0-1)
		| *y* | y position of slider (float 0-1)
	*/
	this.val = {
		x: 0.5,
		y: 0.5
	}
	
	this.init();
}

// inherit the widget object template
util.inherits(position, widget);

// .init() is called automatically when the widget is created on a webpage.
position.prototype.init = function() {
	this.nodeSize = Math.min(this.GUI.h,this.GUI.w)/10;
	this.nodeSize = Math.max(this.nodeSize,10)
	this.actualWid = this.GUI.w - this.nodeSize*2;
	this.actualHgt = this.GUI.h - this.nodeSize*2;
	this.draw();
}

// .draw() should be used for any graphics activity
position.prototype.draw = function() {
	this.erase();
	with (this.context) {

		// use this.colors.fill for the widget background color (default: very light gray)
		// use this.colors.border for any extra structural needs (default: light gray)
		// use this.colors.accent for important or highlighted parts (default: a bright color)
		fillStyle = this.colors.fill;
		fillRect(0,0,this.GUI.w,this.GUI.h);

		var drawingX = this.val.x * this.actualWid + this.nodeSize
		var drawingY = math.invert(this.val.y) * this.actualHgt + this.nodeSize

		//stay within right/left bounds
		if (drawingX<(this.nodeSize)) {
			drawingX = this.nodeSize;
		} else if (drawingX>(this.GUI.w-this.nodeSize)) {
			drawingX = this.GUI.w - this.nodeSize;
		}
		//stay within top/bottom bounds
		if (drawingY<(this.nodeSize)) {
			drawingY = this.nodeSize;
		} else if (drawingY>(this.GUI.h-this.nodeSize)) {
			drawingY = this.GUI.h - this.nodeSize;
		}
	
		with (this.context) {

			// draw the touch point
			beginPath();
			fillStyle = this.colors.accent;
			arc(drawingX, drawingY, this.nodeSize, 0, Math.PI*2, true);					
			fill();
			closePath();

			if (this.clicked) {
				// draw the emphasis circle
				beginPath();
				fillStyle = this.colors.accent;
				arc(drawingX, drawingY, this.nodeSize*2, 0, Math.PI*2, true);					
				fill();
				closePath();clearRect(0,this.GUI.h,this.GUI.w,this.height - this.GUI.h)
			}
		}
	}
	
	this.drawLabel();
}

// .click() will be fired when the interface is interacted with
// this.clicked is automatically set to true
// this.clickPos is already and object with x and y properties detailing click point.
position.prototype.click = function() {
	this.val.x = this.clickPos.x;
	this.val.y = this.clickPos.y;
	this.scaleNode();
	this.val["state"] = "click"
	this.transmit(this.val);
	this.draw();
}

// .move() will be fired when the interface is moved over after being clicked
// this.clickPos is already and object with x and y properties detailing click point.
position.prototype.move = function() {
	this.val.x = this.clickPos.x;
	this.val.y = this.clickPos.y;
	this.scaleNode();
	this.val["state"] = "move"
	this.transmit(this.val);
	this.draw();
}

// .release() will be fired on mouse up (unclick)
position.prototype.release = function() {
	this.val.x = this.clickPos.x;
	this.val.y = this.clickPos.y;
	this.scaleNode();
	this.val["state"] = "release"
	this.transmit(this.val);
	this.draw();
}

/* TOUCH SPECIFIC EVENTS
 currently, ontouch, ontouchmove, and ontouchrelease automatically execute .click, .move, and .release
 so you only need to write one function for these events, and they will be touch compatible by default
 however if you would like to create a touch-specific event you may define the following functions.
 in these functions, .clickPos and .clicked will refer to your touch interactions.

position.prototype.touch = function() {

}

position.prototype.touchmove = function() {
	
}

position.prototype.touchrelease = function() {
	
}




*/



/* 
 extra functions pertaining only to this widget 
*/

position.prototype.scaleNode = function() {
	var actualX = this.val.x - this.nodeSize;
	var actualY = this.val.y - this.nodeSize;
	var clippedX = math.clip(actualX/this.actualWid, 0, 1);
	var clippedY = math.clip(actualY/this.actualHgt, 0, 1);
	this.val.x = math.prune(clippedX, 3)
	this.val.y = math.prune(clippedY, 3)
	this.val.y = math.invert(this.val.y);
}

/** @method animate
	Adds animation to the widget.
	@param {string} [type] Type of animation. Currently accepts "none" or "bounce", in which case the touch node can be tossed and bounces.
*/
position.prototype.animate = function(aniType) {
	
	switch (aniType) {
		case "bounce":
			nx.aniItems.push(this.aniBounce.bind(this));
			break;
		case "none":
			nx.aniItems.splice(nx.aniItems.indexOf(this.aniBounce));
			break;
	}
	
}

position.prototype.aniBounce = function() {
	if (!this.clicked && this.val.x) {
		this.val.x += (this.deltaMove.x/2)/this.GUI.w;
		this.val.y -= (this.deltaMove.y/2)/this.GUI.h;
		this.val["state"] = "animated";
		if (math.bounce(this.val.x, 0, 1, this.deltaMove.x) != this.deltaMove.x) {
			this.deltaMove.x = math.bounce(this.val.x, 0, 1, this.deltaMove.x);
			this.val["state"] = "bounce";
		}
		if (this.val.y >= 1 || this.val.y <= 0) {
			this.deltaMove.y = math.bounce(this.val.y, 0, 1, this.deltaMove.y) * -1;
			this.val["state"] = "bounce";
		}
		this.transmit(this.val);
		this.draw();
	}
}

position.prototype.customDestroy = function() {
	nx.removeAni(this.aniBounce);
}
},{"../core/widget":3,"../utils/math":6,"util":51}],33:[function(require,module,exports){
var util = require('util');
var widget = require('../core/widget');
var math = require('../utils/math')

/** 
	@class range      
	Range slider
	```html
	<canvas nx="range"></canvas>
	```
	<canvas nx="range" style="margin-left:25px"></canvas>
*/

var range = module.exports = function (target) {
	this.defaultSize = { width: 110, height: 35 };
	widget.call(this, target);

	/** @property {object}  val  Object containing core interactive aspects of widget, which are also its data output. Has the following properties: 
		| &nbsp; | data
		| --- | ---
		| *start* | Range start value (float 0-1)
		| *stop* | Range end value (float 0-1)
		| *size* | Distance between ends (float 0-1)
	*/
	this.val = {
		start: 0.3,
		stop: 0.7,
		size: 0.4
	}


	// handling horiz possibility
	/** @property {boolean}  hslider  Whether or not the slider is a horizontal slider. Default is false, but set automatically to true if the slider is wider than it is tall. */  
	this.hslider = false;
	this.handle;
	this.relhandle;
	this.cap;
	this.firsttouch = "start";

	/** @property {string}  mode  Mode of interaction. "edge" mode lets you drag each edge of the range individually. "area" mode (default) lets you drag the range as a whole (with parallel mouse movement) or scale the range as a whole (with transverse mouse movement) */
	this.mode = "area" // modes: "edge", "area"
	this.touchdown = new Object();
	this.init();
}
util.inherits(range, widget);

range.prototype.init = function() {

	//decide if hslider or vslider
	if (this.GUI.h>=this.GUI.w) {
		this.hslider = false;
	} else {
		this.hslider = true;
	}

	if (this.canvas.getAttribute("label")!=null) {
		this.label = this.canvas.getAttribute("label");
	}

	this.draw();
}

range.prototype.draw = function() {
	this.erase();
		
	with (this.context) {
		fillStyle = this.colors.fill;
		fillRect(0,0,this.GUI.w,this.GUI.h);
	
		if (!this.hslider) {

			var x1 = 0;
			var y1 = this.GUI.h-this.val.stop*this.GUI.h;
			var x2 = this.GUI.w;
			var y2 = this.GUI.h-this.val.start*this.GUI.h;

			fillStyle = this.colors.accent;
			fillRect(x1,y1,x2-x1,y2-y1);

		} else {

			var x1 = this.val.start*this.GUI.w;
			var y1 = 0;
			var x2 = this.val.stop*this.GUI.w;
			var y2 = this.GUI.h;
		   
			fillStyle = this.colors.accent;
			fillRect(x1,y1,x2-x1,y2-y1);
		}
	}
	this.drawLabel();
}

range.prototype.click = function() {
	if (this.mode=="edge") {
		if (this.hslider) {
			if (Math.abs(this.clickPos.x-this.val.start*this.GUI.w) < Math.abs(this.clickPos.x-this.val.stop*this.GUI.w)) {
				this.firsttouch = "start"
			} else {
				this.firsttouch = "stop"
			}
		} else {
			if (Math.abs(Math.abs(this.clickPos.y-this.GUI.h)-this.val.start*this.GUI.h) < Math.abs(Math.abs(this.clickPos.y-this.GUI.h)-this.val.stop*this.GUI.h)) {
				this.firsttouch = "start"
			} else {
				this.firsttouch = "stop"
			}
		}
	} else if (this.mode=="area") {
		this.touchdown = {
			x: this.clickPos.x,
			y: this.clickPos.y
		}
		this.startval = new Object();
		this.startval.size = this.val.stop - this.val.start;
		this.startval.loc = this.val.start + this.startval.size/2;
	}
	this.move();
}

range.prototype.move = function() {

	if (this.mode=="edge") {
		if (this.hslider) {
			if (this.firsttouch=="start") {
				this.val.start = this.clickPos.x/this.GUI.w;
				if (this.clickPos.touches.length>1) {
					this.val.stop = this.clickPos.touches[1].x/this.GUI.w;
				}
			} else {
				this.val.stop = this.clickPos.x/this.GUI.w;
				if (this.clickPos.touches.length>1) {
					this.val.start = this.clickPos.touches[1].x/this.GUI.w;
				}
			}
		} else {
			if (this.firsttouch=="start") {
				this.val.start = math.invert(this.clickPos.y/this.GUI.h);
				if (this.clickPos.touches.length>1) {
					this.val.stop = math.invert(this.clickPos.touches[1].y/this.GUI.h);
				}
			} else {
				this.val.stop = math.invert(this.clickPos.y/this.GUI.h);
				if (this.clickPos.touches.length>1) {
					this.val.start = math.invert(this.clickPos.touches[1].y/this.GUI.h);
				}
			}
		}

		if (this.val.stop < this.val.start) {
			this.tempstart = this.val.start;
			this.val.start = this.val.stop;
			this.val.stop = this.tempstart;
			if (this.firsttouch=="start") {
				this.firsttouch = "stop";
			} else {
				this.firsttouch = "start";
			}
		} 
		this.val = {
			start: math.clip(this.val.start, 0, 1),
			stop: math.clip(this.val.stop, 0, 1),
		} 
		this.val['size'] = math.prune(math.clip(Math.abs(this.val.stop - this.val.start), 0, 1), 3)
	
		this.draw();

		this.transmit(this.val);

	} else if (this.mode=="area") {

		if (this.hslider) {
			var moveloc = this.clickPos.x/this.GUI.w;
			var movesize = (this.touchdown.y - this.clickPos.y)/this.GUI.h;
		} else {
			var moveloc = nx.invert(this.clickPos.y/this.GUI.h);
			var movesize = (this.touchdown.x - this.clickPos.x)/this.GUI.w;
		//	moveloc *= -1;
			movesize *= -1;
		}
		movesize /= 3;
		var size = this.startval.size + movesize;
		size = math.clip(size,0.001,1);

		this.val = {
			start: moveloc - size/2,
			stop: moveloc + size/2
		}

		this.val.start = math.clip(this.val.start,0,1);
		this.val.stop = math.clip(this.val.stop,0,1);

		this.draw();

		this.transmit(this.val);

	}
}
},{"../core/widget":3,"../utils/math":6,"util":51}],34:[function(require,module,exports){
var util = require('util');
var widget = require('../core/widget');

/** 
	@class select    
	HTML-style option selector. Outputs the chosen text string. <br> **Note:** Currently the canvas is actaully replaced by an HTML select object. Any inline style on your canvas may be lost in this transformation. To style the resultant select element, we recommend creating CSS styles for the select object using its ID or the select tag.
	```html
	<canvas nx="select" choices="sine,saw,square"></canvas>
	```
	<canvas nx="select" choices="sine,saw,square"></canvas>
*/

var select = module.exports = function (target) {
	this.defaultSize = { width: 200, height: 30 };
	widget.call(this, target);
	
	/** @property {array} choices Desired choices, as an array of strings. Can be initialized with a "choices" HTML attribute of comma-separated text (see example above). 
	```js
	select1.choices = ["PartA", "PartB", "GoNuts"]
	select1.init()
	```
	*/
	this.choices = [ ];

	/** @property {object}  val   
		| &nbsp; | data
		| --- | ---
		| *value* | Text string of option chosen
	*/
	this.val = new Object();

	
	this.canvas.ontouchstart = null;
	this.canvas.ontouchmove = null;
	this.canvas.ontouchend = null;
	
	if (this.canvas.getAttribute("choices")) {
		this.choices = this.canvas.getAttribute("choices");
		this.choices = this.choices.split(",");
	}
	var htmlstr = '<select id="'+this.canvasID+'" class="nx" nx="select" style="height:'+this.GUI.h+'px;width:'+this.GUI.w+'px;" onchange="'+this.canvasID+'.change(this)"></select><canvas height="1px" width="1px" style="display:none"></canvas>'                   
	var canv = this.canvas
	var cstyle = this.canvas.style
	var parent = canv.parentNode;
	var newdiv = document.createElement("span");
	newdiv.innerHTML = htmlstr;
	newdiv.className = "nx"
	parent.replaceChild(newdiv,canv)
	this.sel = document.getElementById(this.canvasID)
	//this.sel.style.float = "left"
	//this.sel.style.display = "block"
	for (var prop in cstyle)
    	this.sel.style[prop] = cstyle[prop];

	this.canvas = document.getElementById(this.canvasID);

    this.canvas.style.backgroundColor = this.colors.fill;
    this.canvas.style.border = "solid 2px "+this.colors.border;
    this.canvas.style.color = this.colors.black;
    this.canvas.style.fontSize = Math.round(this.GUI.h/2.3) + "px"
	
    this.canvas.className = ""

	var optlength = this.canvas.options.length;
	for (i = 0; i < optlength; i++) {
	  this.canvas.options[i] = null;
	}

	for (var i=0;i<this.choices.length;i++) {
		var option=document.createElement("option");
		option.text = this.choices[i];
		option.value = this.choices[i];
		this.canvas.add(option,null);
	}

}
util.inherits(select, widget);

select.prototype.init = function() {

    this.canvas.style.backgroundColor = this.colors.fill;
    this.canvas.style.border = "solid 2px "+this.colors.border;
    this.canvas.style.color = this.colors.black;

    console.log(this.colors.border)

    var optlength = this.canvas.options.length;
	for (i = 0; i < optlength; i++) {
	  this.canvas.options[i] = null;
	}
	
	for (var i=0;i<this.choices.length;i++) {
		var option=document.createElement("option");
		option.text = this.choices[i];
		option.value = this.choices[i];
		this.canvas.add(option,null);
	}
}

// should have a modified "set" function
select.prototype.change = function(thisselect) {
	this.val.text = thisselect.value;
	this.transmit(this.val);
}

select.prototype.draw = function() {

    this.canvas.style.backgroundColor = this.colors.fill;
    this.canvas.style.color = this.colors.black;
    this.canvas.style.border = "solid 2px "+this.colors.border;

}
},{"../core/widget":3,"util":51}],35:[function(require,module,exports){
var math = require('../utils/math')
var util = require('util');
var widget = require('../core/widget');

/** 
	@class slider      
	Slider (vertical or horizontal)
	```html
	<canvas nx="slider"></canvas>
	```
	<canvas nx="slider" style="margin-left:25px"></canvas>
*/

var slider = module.exports = function (target) {
	this.defaultSize = { width: 35, height: 110 };
	widget.call(this, target);

  if (this.canvas.getAttribute("min")!=null) {
    this.min = parseFloat(this.canvas.getAttribute("min"));
  } else {
  	this.min = 0
  }
  if (this.canvas.getAttribute("max")!=null) {
    this.max = parseFloat(this.canvas.getAttribute("max"));
  } else {
  	this.max = 1
  }
  if (this.canvas.getAttribute("step")!=null) {
    this.step = parseFloat(this.canvas.getAttribute("step"));
  } else {
  	this.step = 0.001
  }

	/** @property {object}  val   
		| &nbsp; | data
		| --- | ---
		| *value* | Slider value (float 0-1)
	*/
	this.val.value = nx.scale(0.7,0,1,this.min,this.max)
	

	/** @property {string}  mode   Set "absolute" or "relative" mode. In absolute mode, slider will jump to click/touch position. In relative mode, it will not.
	```js
	nx.onload = function() {
	&nbsp; // Slider will not jump to touch position.
	&nbsp; slider1.mode = "relative" 
	}
	```
	*/
	this.mode = "absolute";

	/** @property {boolean}  hslider   Whether or not the slider should be horizontal. This is set to true automatically if the canvas is wider than it is tall. To override the default decision, set this property to true to create a horizontal slider, or false to create a vertical slider.
	
	```js
	nx.onload = function() {
	&nbsp; //forces horizontal slider 
	&nbsp; slider1.hslider = true
	&nbsp; slider1.draw();
	&nbsp; //forces vertical slider 
	&nbsp; slider2.hslider = false
	&nbsp; slider2.draw();
	}
	```
	*/
	this.hslider = false;
	this.handle;
	this.relhandle;
	this.cap;

	this.maxdigits = 3

	this.calculateDigits = nx.calculateDigits;

	this.init();
}
util.inherits(slider, widget);

slider.prototype.init = function() {

	//decide if hslider or vslider
	if (this.GUI.h>=this.GUI.w) {
		this.hslider = false;
	} else {
		this.hslider = true;
	}


	this.draw();
}


slider.prototype.draw = function() {

	var normalval = this.normalize(this.val.value)

	//figure out text size
	this.digits = this.calculateDigits()

	this.erase();
		
	with (this.context) {
		fillStyle = this.colors.fill;
		fillRect(0,0,this.GUI.w,this.GUI.h);
	
		if (!this.hslider) {

			var x1 = 0;
			var y1 = this.GUI.h-normalval*this.GUI.h;
			var x2 = this.GUI.w;
			var y2 = this.GUI.h;
		
			fillStyle = this.colors.accent;
			fillRect(x1,y1,x2-x1,y2-y1);
			
			//text
			var valtextsize = (this.GUI.w / this.digits.total) * 1.2
			if (valtextsize > 6) {

				// figure out val text location
		    if (y1 < this.GUI.h - valtextsize/2-5) {
					fillStyle = this.colors.white
		    	var texty = this.GUI.h-valtextsize/2-5
		    } else {
					fillStyle = this.colors.accent
		    	var texty = y1 - valtextsize/2-5
		    }
		    var textx = this.GUI.w/2
		    var valtextAlign = "center"
		    var valtextBaseline = "middle"
			}

		} else {

			var x1 = 0;
			var y1 = 0;
			var x2 = normalval*this.GUI.w;
			var y2 = this.GUI.h;
		
			fillStyle = this.colors.accent
			fillRect(x1,y1,x2-x1,y2-y1)

			//text
			var valtextsize = this.GUI.h/2
			if (valtextsize > 6) {

				// figure out val text location
		    if (x2 > this.digits.total*valtextsize/2) {
					fillStyle = this.colors.white
		    	var textx = 5
		    } else {
					fillStyle = this.colors.accent
		    	var textx = x2 + 5
		    }
		    var texty = this.GUI.h/2
		    var valtextAlign = "left"
		    var valtextBaseline = "middle"
			}

		}


    var valtext = this.val.value.toFixed(this.digits.decimals)
    textBaseline = valtextBaseline
		textAlign = valtextAlign
    font = valtextsize+"px 'Open Sans'"
    fillText(valtext,textx,texty);


		if (this.label) {
			this.drawLabel()
		}
	}
}

slider.prototype.click = function() {
	this.move();
}

slider.prototype.move = function() {

	var normalval = this.normalize(this.val.value)

	if (this.hslider) {
		this.handle = this.clickPos.x;
		this.relhandle = this.deltaMove.x;
		this.cap = this.GUI.w;
	} else {
		this.handle = this.clickPos.y;
		this.relhandle = this.deltaMove.y*-1;
		this.cap = this.GUI.h
	}

	if (this.mode=="absolute") {
		if (this.clicked) {
			if (!this.hslider) {
				normalval = Math.abs((math.clip(this.clickPos.y/this.GUI.h, 0, 1) - 1));
			} else {	
				normalval = math.clip(this.clickPos.x/this.GUI.w, 0, 1);
			}
			this.draw();
		}
	} else if (this.mode=="relative") {
		if (this.clicked) {
			if (!this.hslider) {
				normalval = math.clip(normalval + ((this.deltaMove.y*-1)/this.GUI.h),0,1);
			} else {
				normalval = math.clip(normalval + ((this.deltaMove.x)/this.GUI.w),0,1);
			}
			this.draw();
		}
	}

	this.val.value = math.prune(this.rangify(normalval),3)
	this.transmit(this.val);
}
},{"../core/widget":3,"../utils/math":6,"util":51}],36:[function(require,module,exports){
var util = require('util');
var widget = require('../core/widget');

/** 
	@class string      
	Animated model of a plucked string interface.
	```html
	<canvas nx="string"></canvas>
	```
	<canvas nx="string" style="margin-left:25px"></canvas>
*/

var string = module.exports = function (target) {
	this.defaultSize = { width: 150, height: 75 };
	widget.call(this, target);
	
	/** @property {object}  val  Object containing the core interactive aspects of the widget, which are also its data output. Has the following properties: 
		| &nbsp; | data
		| --- | ---
		| *string* | Index of the string that is plucked (starts at 0)
		| *x* | Where on the string the pluck occured (float 0-1);
	*/
	this.val = {
		string: 0,
		x: 0
	}
	/** @property {integer}  numberOfStrings How many strings in the widget. We recommend setting this property with .setStrings() */
	this.numberOfStrings = 10;
	this.strings = new Array();
	this.abovestring = new Array();
	/** @property {integer}  friction  How quickly the string slows down */
	this.friction = 1;
	
	var stringdiv;

	this.init();

	nx.aniItems.push(this.draw.bind(this));
}
util.inherits(string, widget);

string.prototype.init = function() {
	stringdiv = this.GUI.h/(this.numberOfStrings + 1);
	for (var i=0;i<this.numberOfStrings;i++) {
		this.strings[i] = {
			x1: this.lineWidth,
			y1: stringdiv*(1+i),
			x2: this.GUI.w - this.lineWidth,
			y2: stringdiv*(i+1),
			held: false, // whether or not it's gripped
			vibrating: false, // whether or not its vibrating
			force: 0, // amount of force of pull on string
			maxstretch: 0, // vibration cap (in Y domain)
			stretch: 0, // current point vibrating in y domain
			direction: 0, // which direction it's vibrating
			above: false // is mouse above or below string
		};
	}
	this.draw();
}

string.prototype.pulse = function() {
	this.draw();
}

/* @method setStrings Sets how many strings are in the widget.
	```js
	string1.setStrings(20);
	``` 
	*/
string.prototype.setStrings = function(val) {
	this.numberOfStrings = val;
	this.strings = new Array();
	this.init();
}

string.prototype.draw = function() {
	this.erase();
	with (this.context) {
		strokeStyle = this.colors.border;
		fillStyle = this.colors.fill;
		lineWidth = this.lineWidth;
	//	stroke();
		fillRect(0,0,this.GUI.w,this.GUI.h);
		strokeStyle = this.colors.accent;

		for (var i = 0;i<this.strings.length;i++) {

			var st = this.strings[i];

			if (st.vibrating) {
				if (st.maxstretch < 0) {
					st.vibrating = false;
					st.held = false;
				}
				st.stretch = st.stretch + st.direction;
				
				if (Math.abs(st.stretch) > st.maxstretch) {
					//st.direction *= (-0.99);
					st.direction *= -1;
					st.stretch = st.stretch + st.direction;
					st.maxstretch = st.maxstretch - this.friction;

					st.direction = (st.direction / Math.abs(st.direction)) * (st.maxstretch/1)
				}

				beginPath();
				moveTo(st.x1, st.y1);
				quadraticCurveTo(this.GUI.w/2, st.y1+st.stretch, st.x2, st.y2);
				stroke();
				closePath();
				st.on = true;


			} else if (st.held) {
					//will draw rounded
					//if mouse is higher than string and gripup
					//or if mouse is 
					//	if (this.clickPos.y-st.y1<0 && st.gripup || this.clickPos.y-st.y1>0 && !st.gripup) {
					beginPath();
					moveTo(st.x1, st.y1);
					quadraticCurveTo(this.clickPos.x, this.clickPos.y, st.x2, st.y2);
					stroke();
					closePath();
					st.on = true;	
					/*	} else {
					beginPath();
					moveTo(st.x1, st.y1);
					lineTo(st.x2, st.y2);
					stroke();
					closePath();
				} */
			} else {
				beginPath();
				moveTo(st.x1, st.y1);
				lineTo(st.x2, st.y2);
				stroke();
				closePath();
				if (st.on) {
					st.on = false;
				}
			}
		}
	}
	this.drawLabel();
}

string.prototype.click = function() {
	for (var i = 0;i<this.numberOfStrings;i++) {
		this.strings[i].above = (this.clickPos.y<this.strings[i].y1);
	}
	this.draw();
}

string.prototype.move = function() {
	if (this.clicked) {
		for (var i = 0;i<this.strings.length;i++) {

			//if crosses string
			if (this.strings[i].above != (this.clickPos.y<this.strings[i].y1) ) {
				this.strings[i].held = true;
				this.strings[i].above ^= true;
			}

			if (this.strings[i].held && Math.abs(this.clickPos.y - this.strings[i].y1) > this.GUI.h/(this.strings.length*3)) {

				this.pluck(i)
				
			}
		}
	}
}

string.prototype.release = function() {
	for (var i = 0;i<this.strings.length;i++) {
		if (this.strings[i].held) {
			this.pluck(i);
		}
	}	
}

string.prototype.pluck = function(which) {
	var i = which;
	this.val = {
		string: i,
		x: this.clickPos.x/this.GUI.w
	}
	this.transmit(this.val);
	this.strings[i].held = false;
	this.strings[i].force = this.clickPos.y - this.strings[i].y1;
	this.strings[i].maxstretch = Math.abs(this.clickPos.y - this.strings[i].y1);
	this.strings[i].stretch = this.clickPos.y - this.strings[i].y1;
	this.strings[i].vibrating = true;
	this.strings[i].direction = (this.clickPos.y - this.strings[i].y1)/Math.abs(this.clickPos.y - this.strings[i].y1) * ((this.clickPos.y - this.strings[i].y1)/-1.2);
}

string.prototype.customDestroy = function() {
	nx.removeAni(this.draw.bind(this));
}
},{"../core/widget":3,"util":51}],37:[function(require,module,exports){
var math = require('../utils/math')
var util = require('util');
var widget = require('../core/widget');

/** 
	@class tabs   
	
	```html
	<canvas nx="tabs"></canvas>
	```
	<canvas nx="tabs" style="margin-left:25px"></canvas>
*/

var tabs = module.exports = function(target) {
	
	this.defaultSize = { width: 150, height: 50 };
	widget.call(this, target);
	
	//define unique attributes
	this.choice = 0;
	this.val = {
		index: 0,
		text: ""
	}
	this.tabwid = 0;
	this.options = ["one", "two", "three"]
	//init
	this.init();

}

util.inherits(tabs, widget);


tabs.prototype.init = function() {
	this.draw();
}


tabs.prototype.draw = function() {

	with (this.context) {
		fillStyle = this.colors.fill;
		fillRect(0,0,this.GUI.w,this.GUI.h)

		textAlign = "center"
		textBaseline = "middle"
		font = "normal "+this.GUI.h/5+"px courier"
	}

	this.tabwid = this.GUI.w/this.options.length

	for (var i=0;i<this.options.length;i++) {
		if (i==this.choice) {
			var tabcol = this.colors.accent;
			var textcol = this.colors.white;
		} else {
			var tabcol = this.colors.fill;
			var textcol = this.colors.black;
			globalAlpha = 0.7;
		}
		with (this.context) {
			fillStyle=tabcol;
			fillRect(this.tabwid*i,0,this.tabwid,this.GUI.h)
			if (i!=this.options.length-1) {
				beginPath();
				moveTo(this.tabwid*(i+1),0)
				lineTo(this.tabwid*(i+1),this.GUI.h)
				lineWidth = 1;
				strokeStyle = this.colors.border
				stroke()
				closePath()
			}
			fillStyle=textcol;
			font = this.fontSize+"px "+this.font;
			fillText(this.options[i],this.tabwid*i+this.tabwid/2,this.GUI.h/2)
		}
		
	}
}


tabs.prototype.click = function() {
	this.choice = ~~(this.clickPos.x / this.tabwid);
	this.val = {
		index: this.choice,
		text: this.options[this.choice]
	}
	this.transmit(this.val)
	this.draw();
}
},{"../core/widget":3,"../utils/math":6,"util":51}],38:[function(require,module,exports){
var util = require('util');
var widget = require('../core/widget');

/** 
	@class text    
	Text editor. Outputs the typed text string when Enter is pressed. <br> **Note:** Currently the canvas is actaully replaced by an HTML textarea object. Any inline style on your canvas may be lost in this transformation. To style the resultant textarea element, we recommend creating CSS styles for the textarea element using its ID or the textarea tag.
	```html
	<canvas nx="text"></canvas>
	```
	<canvas nx="text"></canvas>
*/

var text = module.exports = function (target) {
	this.defaultSize = { width: 200, height: 100 };
	widget.call(this, target);

	/** @property {object}  val   
		| &nbsp; | data
		| --- | ---
		| *text* | Text string
	*/
	this.val = {
		text: ""
	}

	var htmlstr = '<textarea id="'+this.canvasID+'" style="height:'+this.GUI.h+'px;width:'+this.GUI.w+'px;" onkeydown="'+this.canvasID+'.change(event,this)"></textarea><canvas height="1px" width="1px" style="display:none"></canvas>'                   
	var canv = this.canvas
	var cstyle = this.canvas.style
	var parent = canv.parentNode;
	var newdiv = document.createElement("span");
	newdiv.innerHTML = htmlstr;
	newdiv.className = "nx"
	parent.replaceChild(newdiv,canv)
	this.el = document.getElementById(this.canvasID)

	for (var prop in cstyle)
    	this.el.style[prop] = cstyle[prop];

	this.el.style.display = "block"
	this.el.style.backgroundColor = this.colors.fill
	this.el.style.border = "none"
	this.el.style.color = this.colors.black
	this.el.style.outline = "none"
	this.el.style.resize = "none"
	this.el.style.boxSizing = "border-box"
	this.el.style.padding = "5px"
	this.el.style.fontFamily = nx.font
	this.el.style.fontSize = "16px"
	this.el.className = ""


	this.canvas = document.getElementById(this.canvasID);


}
util.inherits(text, widget);

text.prototype.init = function() {
	
	this.canvas.ontouchstart = null;
	this.canvas.ontouchmove = null;
	this.canvas.ontouchend = null;

    this.canvas.style.backgroundColor = this.colors.fill;
    this.canvas.style.color = this.colors.black;
	
}

// should have a modified "set" function
text.prototype.change = function(e,el) {
	this.val.text = el.value
	if (e.which=="13") {
		this.transmit(this.val)
		this.val.text = ""
		this.draw()
		e.preventDefault()
	}
}

text.prototype.draw = function() {
	// needed especially for ghost
	this.el.value = this.val.text 
	
    this.canvas.style.backgroundColor = this.colors.fill;
    this.canvas.style.color = this.colors.black;
}
},{"../core/widget":3,"util":51}],39:[function(require,module,exports){
var math = require('../utils/math')
var util = require('util');
var widget = require('../core/widget');

/** 
	@class tilt      
	Mobile and Mac/Chrome-compatible tilt sensor. May not work on all devices! <br> **Notes:** Clicking on this widget toggles it inactive or active. <br>
	We recommend not calling .init() on this object after the original initialization, because it will add additional redundant tilt listeners to your document.
	```html
	<canvas nx="tilt"></canvas>
	```
	<canvas nx="tilt" style="margin-left:25px"></canvas>
*/

var tilt = module.exports = function (target) {
	this.defaultSize = { width: 50, height: 50 };
	widget.call(this, target);
	
	this.tiltLR;
	this.tiltFB;
	this.z;
	/** @property {boolean} active Whether or not the tilt widget is on (animating and transmitting data). */
	this.active = true;

	/** @property {object}  val  Object containing the core interactive aspects of the widget, which are also its data output. Has the following properties: 
		| &nbsp; | data
		| --- | ---
		| *x* | X-axis rotation if supported (-1 to 1)
		| *y* | Y-axis rotation if supported (-1 to 1)
		| *z* | Z-axis rotation if supported (-1 to 1 or possibly 0 to 360 depending on device)
	*/
	this.val = {
		x: 0,
		y: 0,
		z: 0
	}

	/** @property {string}  text   Text shown on tilt object
	*/
	
	this.text = "TILT";
	this.init();

	this.boundChromeTilt = this.chromeTilt.bind(this)
	this.boundMozTilt = this.mozTilt.bind(this)

	if (window.DeviceOrientationEvent) {
		window.addEventListener('deviceorientation', this.boundChromeTilt, false);
	} else if (window.OrientationEvent) {
	  	window.addEventListener('MozOrientation', this.boundMozTilt, false);
	} else {
	  	console.log("Not supported on your device or browser.")
	}
	
}
util.inherits(tilt, widget);

tilt.prototype.deviceOrientationHandler = function() {
	
	this.val = {
		x: math.prune(this.tiltLR/90,3),
		y: math.prune(this.tiltFB/90,3),
		z: math.prune(this.z,3)
	}

	if (this.active) {
		this.transmit(this.val);
	}
	
}

tilt.prototype.chromeTilt = function(eventData) {
    this.tiltLR = eventData.gamma;
		this.tiltFB = eventData.beta;
		this.z = eventData.alpha
    this.deviceOrientationHandler();
    this.draw();
}

tilt.prototype.mozTilt = function(eventData) {
    this.tiltLR = eventData.x * 90;
    // y is the front-to-back tilt from -1 to +1, so we need to convert to degrees
    // We also need to invert the value so tilting the device towards us (forward) 
    // results in a positive value. 
    this.tiltFB = eventData.y * -90;
    this.z = eventData.z;
    this.deviceOrientationHandler();
    this.draw();
}

tilt.prototype.init = function() {
	this.draw();
}

tilt.prototype.draw = function() {
	
	this.erase();

	with (this.context) {
		fillStyle = this.colors.fill;
	    fillRect(0,0,this.GUI.w,this.GUI.h);

		save(); 
		translate(this.GUI.w/2,this.GUI.h/2)
		rotate(-this.val.x*Math.PI/2);
		translate(-this.GUI.w/2,-this.GUI.h/2)
	    globalAlpha = 0.4;

	    if (this.active) {
	    	fillStyle = this.colors.accent;
	    } else {
	    	fillStyle = this.colors.border;
	    }

		fillRect(-this.GUI.w,this.GUI.h*(this.val.y/2)+this.GUI.h/2,this.GUI.w*3,this.GUI.h*2)
		font = "bold "+this.GUI.h/5+"px "+this.font;
		textAlign = "center";
		textBaseline = "middle";
		fillText(this.text, this.GUI.w/2, this.GUI.h*(this.val.y/2)+this.GUI.h/2-this.GUI.h/15);
		globalAlpha = 1;
		restore();

		clearRect(0,this.GUI.h,this.GUI.w,this.height - this.GUI.h)
	}
	this.drawLabel();
}

tilt.prototype.click = function() {
	this.active = !this.active;
}

tilt.prototype.customDestroy = function() {
	this.active = false;
	window.removeEventListener("deviceorientation",this.boundChromeTilt,false);
	window.removeEventListener("mozOrientation",this.boundMozTilt,false);
}
},{"../core/widget":3,"../utils/math":6,"util":51}],40:[function(require,module,exports){
var drawing = require('../utils/drawing');
var util = require('util');
var widget = require('../core/widget');

/** 
	@class toggle      
	On/off toggle
	```html
	<canvas nx="toggle"></canvas>
	```
	<canvas nx="toggle" style="margin-left:25px"></canvas>
*/

var toggle = module.exports = function (target) {
	this.defaultSize = { width: 50, height: 50 };
	widget.call(this, target);

	/** @property {object}  val  Object containing the core interactive aspects of the widget, which are also its data output. Has the following properties: 
		| &nbsp; | data
		| --- | ---
		| *value*| 1 if on, 0 if off
	*/
	this.val = {
		value: 0
	}
	this.init();
}
util.inherits(toggle, widget);

toggle.prototype.init = function() {
	this.draw();
}

toggle.prototype.draw = function() {
	
	this.erase()

	with (this.context) {
		if (this.val.value) {
			fillStyle = this.colors.accent;
		//	strokeStyle = this.colors.white;
		//	strokeAlpha = 0.3
			strokeStyle = this.colors.accenthl;
			strokeAlpha = 1
		} else {
			fillStyle = this.colors.fill;
			strokeStyle = this.colors.border;
			strokeAlpha = 1
		}
		lineWidth = Math.sqrt(this.GUI.w)/2;
		//lineWidth = this.GUI.w / 20;

		fillRect(0,0,this.GUI.w,this.GUI.h);
		globalAlpha = strokeAlpha
		strokeRect(lineWidth/2,lineWidth/2,this.GUI.w-lineWidth,this.GUI.h-lineWidth);
		globalAlpha = 1
	}

	this.drawLabel();
	
}

toggle.prototype.click = function() {
	if (!this.val.value) {
		this.val.value = 1;
	} else {
		this.val.value = 0;
	}
	this.draw();
	this.transmit(this.val);
}
},{"../core/widget":3,"../utils/drawing":5,"util":51}],41:[function(require,module,exports){
var math = require('../utils/math')
var util = require('util');
var widget = require('../core/widget');

/** 
	@class trace      
	Path/gesture drawing canvas
	```html
	<canvas nx="trace"></canvas>
	```
	<canvas nx="trace" style="margin-left:25px"></canvas>
*/

var trace = module.exports = function (target) {

	// define a default size
	this.defaultSize = { width: 200, height: 200 };

	widget.call(this, target);
	
	/** @property {integer} nodeSize Size of path node graphic. */
	this.nodeSize = 8;

	/** @property {object}  val   val is an object containing the main interactive / actionable aspects of the widget.
		| &nbsp; | data
		| --- | ---
		| *path* | array of objects containing x/y of each path node
	*/
	this.val = {
		path: []
	}

	this.limit = 20;
	this.space = 0;
	
	this.init();
}

// inherit the widget object template
util.inherits(trace, widget);

// .init() is called automatically when the widget is created on a webpage.
trace.prototype.init = function() {
	this.nodeSize = Math.min(this.GUI.h,this.GUI.w)/10;
	this.nodeSize = Math.max(this.nodeSize,10)
	this.draw();
}

// .draw() should be used for any graphics activity
trace.prototype.draw = function() {
	this.erase();
	with (this.context) {

		fillStyle = this.colors.fill;
		fillRect(0,0,this.GUI.w,this.GUI.h);
		fillStyle = this.colors.fill;

		globalAlpha = 0.7;
		for (var i=0;i<this.val.path.length;i++) {
			var drawingX = this.val.path[i].x * this.GUI.w
			var drawingY = this.val.path[i].y * this.GUI.h

			beginPath();
				fillStyle = this.colors.accent;
				arc(drawingX, drawingY, this.nodeSize, 0, Math.PI*2, true);					
				fill();
			closePath();

		}
		globalAlpha = 1;

	}
	
	this.drawLabel();
}

trace.prototype.click = function() {
	this.val.path = []
	this.space = 0;
	this.move()
	this.draw()
}

trace.prototype.move = function() {
	this.space++
	if (this.space>2 && this.val.path.length<this.limit) {
		this.space = 0
		var x = math.clip(this.clickPos.x,0,this.GUI.w) / this.GUI.w
		var y = math.clip(this.clickPos.y,0,this.GUI.h) / this.GUI.h
		this.val.path.push({ x: x, y: y })
		/*if (this.val.path.length>=this.limit) {
			this.val.path = this.val.path.slice(1)
		} */
	}
	this.draw();
}

trace.prototype.release = function() {
	this.transmit(this.val);
}

},{"../core/widget":3,"../utils/math":6,"util":51}],42:[function(require,module,exports){
var drawing = require('../utils/drawing');
var util = require('util');
var widget = require('../core/widget');

/** 
	@class typewriter      
	Computer keyboard listener and visualization. (Desktop only) <br> **Note:** Clicking on the widget toggles it inactive or active, which can be useful if you need to temporarily type without triggering the widget's events.
	```html
	<canvas nx="typewriter"></canvas>
	```
	<canvas nx="typewriter" style="margin-left:25px"></canvas>
*/

var typewriter = module.exports = function(target) {
	this.defaultSize = { width: 300, height: 100 };
	widget.call(this, target);

	
	this.letter = ""
	this.keywid = this.GUI.w/14.5;
	this.keyhgt = this.GUI.h/5

	/** @property {boolean}  active  Whether or not the widget is on (listening for events and transmitting values).*/ 
	this.active = true;

	/** @property {object}  val  Object containing the core interactive aspects of the widget, which are also its data output. Has the following properties: 
		| &nbsp; | data
		| --- | ---
		| *key* | symbol of key pressed (example: "a")
		| *ascii* | ascii value of key pressed (example: 48)
		| *on* | 0 if key is being pressed, 1 if key is being released
	*/
	this.val = {
		key: "",
		ascii: 0,
		on: 0
	}

	this.rows = [
		[
			{ symbol: "`", value: 192, width: 1, on: false },
			{ symbol: "1", value: 49, width: 1, on: false  },
			{ symbol: "2", value: 50, width: 1, on: false  },
			{ symbol: "3", value: 51, width: 1, on: false  },
			{ symbol: "4", value: 52, width: 1, on: false  },
			{ symbol: "5", value: 53, width: 1, on: false  },
			{ symbol: "6", value: 54, width: 1, on: false  },
			{ symbol: "7", value: 55, width: 1, on: false  },
			{ symbol: "8", value: 56, width: 1, on: false  },
			{ symbol: "9", value: 57, width: 1, on: false  },
			{ symbol: "0", value: 48, width: 1, on: false  },
			{ symbol: "-", value: 189, width: 1, on: false  },
			{ symbol: "=", value: 187, width: 1, on: false  },
			{ symbol: "delete", value: 46, width: 1.5, on: false  }
		],
		[
			{ symbol: "tab", value: 9, width: 1.5, on: false  },
			{ symbol: "q", value: 81, width: 1, on: false  },
			{ symbol: "w", value: 87, width: 1, on: false  },
			{ symbol: "e", value: 69, width: 1, on: false  },
			{ symbol: "r", value: 82, width: 1, on: false  },
			{ symbol: "t", value: 84, width: 1, on: false  },
			{ symbol: "y", value: 89, width: 1, on: false  },
			{ symbol: "u", value: 85, width: 1, on: false  },
			{ symbol: "i", value: 73, width: 1, on: false  },
			{ symbol: "o", value: 79, width: 1, on: false  },
			{ symbol: "p", value: 80, width: 1, on: false  },
			{ symbol: "[", value: 219, width: 1, on: false  },
			{ symbol: "]", value: 221, width: 1, on: false  },
			{ symbol: "\\", value: 220, width: 1, on: false  }
		],
		[
			{ symbol: "caps", value: 20, width: 1.75, on: false  },
			{ symbol: "a", value: 65, width: 1, on: false  },
			{ symbol: "s", value: 83, width: 1, on: false  },
			{ symbol: "d", value: 68, width: 1, on: false  },
			{ symbol: "f", value: 70, width: 1, on: false  },
			{ symbol: "g", value: 71, width: 1, on: false  },
			{ symbol: "h", value: 72, width: 1, on: false  },
			{ symbol: "j", value: 74, width: 1, on: false  },
			{ symbol: "k", value: 75, width: 1, on: false  },
			{ symbol: "l", value: 76, width: 1, on: false  },
			{ symbol: ";", value: 186, width: 1, on: false  },
			{ symbol: "'", value: 222, width: 1, on: false  },
			{ symbol: "enter", value: 13, width: 1.75, on: false }
		],
		[
			{ symbol: "shift", value: 16, width: 2.25, on: false  },
			{ symbol: "z", value: 90, width: 1, on: false  },
			{ symbol: "x", value: 88, width: 1, on: false  },
			{ symbol: "c", value: 67, width: 1, on: false  },
			{ symbol: "v", value: 86, width: 1, on: false  },
			{ symbol: "b", value: 66, width: 1, on: false  },
			{ symbol: "n", value: 78, width: 1, on: false  },
			{ symbol: "m", value: 77, width: 1, on: false  },
			{ symbol: ",", value: 188, width: 1, on: false  },
			{ symbol: ".", value: 190, width: 1, on: false  },
			{ symbol: "/", value: 191, width: 1, on: false  },
			{ symbol: "shift", value: 16, width: 2.25, on: false }
		],
		[
			{ symbol: "fn", value: 10, width: 1, on: false  },
			{ symbol: "ctrl", value: 17, width: 1, on: false  },
			{ symbol: "opt", value: 10, width: 1, on: false  },
			{ symbol: "cmd", value: 10, width: 1.25, on: false  },
			{ symbol: "space", value: 32, width: 5, on: false  },
			{ symbol: "cmd", value: 10, width: 1, on: false  },
			{ symbol: "opt", value: 10, width: 1, on: false  },
			{ symbol: "left", value: 37, width: .81, on: false  },
			{ symbol: "up", value: 38, width: .81, on: false  },
			{ symbol: "down", value: 40, width: .81, on: false  },
			{ symbol: "right", value: 39, width: .81, on: false  }
		]
	]

	this.boundType = this.typekey.bind(this);
	this.boundUntype = this.untype.bind(this);
	window.addEventListener("keydown", this.boundType);
	window.addEventListener("keyup", this.boundUntype);

	this.init();
}
util.inherits(typewriter, widget);
	
typewriter.prototype.init = function() {

	this.keywid = this.GUI.w/14.5;
	this.keyhgt = this.GUI.h/5
	
	this.draw();
}

typewriter.prototype.draw = function() {	// erase
	this.erase();

	if (!this.active) {
		this.context.globalAlpha = 0.4
	} else {
		this.context.globalAlpha = 1
	}

	with (this.context) {

		strokeStyle = this.colors.borderhl
		fillStyle = this.colors.accent 
		lineWidth = 1

		for (var i=0;i<this.rows.length;i++) {
			var currkeyL = 0;
			for (var j=0;j<this.rows[i].length;j++) {

				if (this.val.key==this.rows[i][j].symbol) {
					if (this.val.on) {
						this.rows[i][j].on = true;
					} else {
						this.rows[i][j].on = false;
					}
				}

				drawing.makeRoundRect(this.context, currkeyL , i*this.keyhgt,this.keywid*this.rows[i][j].width,this.keyhgt,4);
					
				if (this.rows[i][j].on) {
					fillStyle = this.colors.accent 
					strokeStyle = this.colors.accent 
					fill()
					stroke()
				} else {
					fillStyle = this.colors.fill 
					strokeStyle = this.colors.borderhl

					fill()
					stroke()
				}
	
				currkeyL += this.keywid*this.rows[i][j].width;

			}
		}

		if (this.val.on) {
			this.setFont();
			fillStyle = this.colors.borderhl;
			font = this.GUI.h+"px "+this.font;
			fillText(this.val.key, this.GUI.w/2, this.GUI.h/2);
			
			globalAlpha = 1
		}

		if (!this.active) {
			globalAlpha = 0.7
			fillStyle = this.colors.borderhl;
			font = (this.GUI.h/2)+"px courier";
			textAlign = "center";
			textBaseline = "middle"
			fillText("inactive", this.GUI.w/2, this.GUI.h/2);
		}
	}

	this.drawLabel();
}

typewriter.prototype.click = function(e) {
	this.active = !this.active;
	this.draw();
}

typewriter.prototype.typekey = function(e) {
	if (this.active) {
		var currKey = e.which;
		for (var i=0;i<this.rows.length;i++) {
			for (var j=0;j<this.rows[i].length;j++) {
				if (currKey == this.rows[i][j].value) {
					this.val.key = this.rows[i][j].symbol;
					this.val.on = 1;
					this.val.ascii = e.which;
					this.transmit(this.val);
					break;
				}
			}
		}
		this.draw();
	}	
}

typewriter.prototype.untype = function(e) {
	if (this.active) {
		var currKey = e.which;
		for (var i=0;i<this.rows.length;i++) {
			for (var j=0;j<this.rows[i].length;j++) {
				if (currKey == this.rows[i][j].value) {
				//	this.rows[i][j].on = false;
					this.val.key = this.rows[i][j].symbol;
					this.val.on = 0;
					this.val.ascii = e.which;
					this.transmit(this.val);
					break;
				}
			}
		}
		this.draw();
	}
}

typewriter.prototype.customDestroy = function() {
	window.removeEventListener("keydown", this.boundType);
	window.removeEventListener("keyup", this.boundUntype);
}
},{"../core/widget":3,"../utils/drawing":5,"util":51}],43:[function(require,module,exports){
var math = require('../utils/math')
var util = require('util');
var widget = require('../core/widget');

/** 
	@class vinyl      
	For the boom bap
	```html
	<canvas nx="vinyl"></canvas>
	```
<!--	<canvas nx="vinyl" style="margin-left:25px"></canvas> -->
*/

var vinyl = module.exports = function (target) {
	this.defaultSize = { width: 100, height: 100 };
	widget.call(this, target);
	
	this.circleSize;

	/** @property speed The rotation increment. Default is 0.05. Not to be confused with .val.speed (see below) which is the data output. During rotation, .speed will always move towards .defaultSpeed */
	this.speed = 0.05;
	/** @property defaultSpeed The "steady-state" rotation increment. Default is 0.05. During rotation, if .speed is changed, it will gradually move towards this. */
	this.defaultspeed = 0.05
	this.rotation = 0;
	this.hasMovedOnce = false;

	this.lockResize = true;
	
	/** @property {object}  val  Object containing the core interactive aspects of the widget, which are also its data output. Has the following properties: 
		| &nbsp; | data
		| --- | ---
		| *speed*| Current speed of the record player's rotation. (Normal is 1.)
	*/
	this.val = {
		speed: 0
	}
	this.init();
	nx.aniItems.push(this.spin.bind(this));
}
util.inherits(vinyl, widget);

vinyl.prototype.init = function() {

	this.circleSize = (Math.min(this.center.x, this.center.y)-this.lineWidth);
	this.draw();
}

vinyl.prototype.draw = function() {
	this.erase()

	with (this.context) {
		strokeStyle = this.colors.border;
		fillStyle = this.colors.fill;
		fillRect(0,0,this.GUI.w,this.GUI.h)
		
		//draw main circle
		beginPath();
		fillStyle = this.colors.black;
		arc(this.center.x, this.center.y, this.circleSize-5, 0, Math.PI*2, true);
		fill();
		closePath();


		//draw circle in center
		beginPath();
		fillStyle = this.colors.accent;
		arc(this.center.x, this.center.y*1, this.circleSize/4, 0, Math.PI*2, false);
		fill()
		closePath();


		//draw tint
		beginPath();
		globalAlpha = 0.5;
		fillStyle = this.colors.fill;
		arc(this.center.x, this.center.y, this.circleSize, this.rotation, this.rotation + 0.4, false);
		lineTo(this.center.x, this.center.y);
		arc(this.center.x, this.center.y, this.circleSize, this.rotation+Math.PI, this.rotation +Math.PI+ 0.4, false);
		lineTo(this.center.x, this.center.y);
		fill();
		globalAlpha = 1;
		closePath(); 


		//draw white circle in center
		beginPath();
		fillStyle = this.colors.white;
		arc(this.center.x, this.center.y*1, this.circleSize/16, 0, Math.PI*2, false);
		fill()
		closePath(); 

	}

	this.drawLabel();
}

vinyl.prototype.click = function(e) {
	this.hasMovedOnce = false;
	this.lastRotation = this.rotation
	this.grabAngle = this.rotation % (Math.PI*2)
	this.grabPos = math.toPolar(this.clickPos.x-this.center.x,this.clickPos.y-this.center.y).angle

}

vinyl.prototype.move = function() {

	if (!this.hasMovedOnce) {
		this.hasMovedOnce = true;
		this.grabAngle = this.rotation % (Math.PI*2)
		this.grabPos = math.toPolar(this.clickPos.x-this.center.x,this.clickPos.y-this.center.y).angle
	}

	this.rotation = math.toPolar(this.clickPos.x-this.center.x,this.clickPos.y-this.center.y).angle + this.grabAngle - this.grabPos	


}

vinyl.prototype.release = function() {
	this.speed = ((this.rotation - this.lastRotation) + (this.lastRotation-this.lastRotation2))/2 ;
}

vinyl.prototype.spin = function() {

	if (this.clicked) { 
		this.speed /= 1.1;
	} else {
		this.speed = this.speed*0.9 + this.defaultspeed*0.1
	}

	// may need to math.clip(this.val.speed,-10,10);
	this.val.speed = (this.rotation - this.lastRotation) * 20; // normalizes it to 1

	this.lastRotation2 = this.lastRotation
	this.lastRotation = this.rotation

	this.rotation += this.speed

	this.draw();

	this.transmit(this.val)
	
}

vinyl.prototype.customDestroy = function() {
	nx.removeAni(this.spin.bind(this));
}
},{"../core/widget":3,"../utils/math":6,"util":51}],44:[function(require,module,exports){
var util = require('util');
var widget = require('../core/widget');
var math = require('../utils/math')

/** 
	@class waveform      
	Waveform visualizer and selecter
	```html
	<canvas nx="waveform"></canvas>
	```
*/

var waveform = module.exports = function (target) {
	this.defaultSize = { width: 400, height: 125 };
	widget.call(this, target);

	/** @property {object}  val  Object containing core interactive aspects of widget, which are also its data output. Has the following properties: 
		| &nbsp; | data
		| --- | ---
		| *starttime* | Waveform selection start position in milliseconds (integer)
		| *stoptime* | Waveform selection end position in milliseconds (integer)
		| *looptime* | Selection size, in milliseconds (integer)
		| *start* | Waveform selection start, as fraction of waveform (float 0-1)
		| *stop* | Waveform selection end, as fraction of waveform (float 0-1)
		| *size* | Selection size, as fraction of waveform (float 0-1)
	*/
	this.val = {
		start: 0,
		stop: 0,
		size: 0,
		starttime: 0,
		stoptime: 0,
		looptime: 0
	}

	this.handle;
	this.relhandle;
	this.cap;
	this.firsttouch = "start";

	/** @property {Array} buffer  Contains multiple arrays of reduced buffer data, for visualization */
	this.buffer = []

	if (nx.isMobile) {
		/** @property {integer} definition  Horizontal definition of the visualization. Value of 3 means the waveform will be represented in 3 pixel chunks. Higher numbers (4+) lead to a smaller graphics load. Smaller numbers (1-3) look better. Default is 1 for desktop renders, 3 for mobile renders. */
		this.definition = 3;
	} else {
		this.definition = 1;
	}

	this.pieces = false;

	/** @property {integer} channels  How many channels in the waveform */
	this.channels = 1
	this.rawbuffer = []

	this.times = [
		{ dur: 10 , format: 1 },
		{ dur: 50 , format: 1 },
		{ dur: 100 , format: 1 },
		{ dur: 200 , format: 1 },
		{ dur: 500 , format: 1 },
		{ dur: 1000 , format: 1 },
		{ dur: 2000 , format: 1 },
		{ dur: 5000 , format: 1 },
		{ dur: 10000 , format: 3 },
		{ dur: 15000 , format: 3 },
		{ dur: 60000 , format: 3 }, // 1 min
		{ dur: 120000 , format: 3 }, // 2 mins
		{ dur: 300000 , format: 3 }, // 5 mins
		{ dur: 600000 , format: 3 }, // 10 mins
	]
	this.timescale = false

	// to do --
	// // sample rate adjustments
	// .select(500,1000)

	/** @property {string}  mode  Mode of interaction. "edge" mode lets you drag each edge of the waveform individually. "area" mode (default) lets you drag the waveform as a whole (with parallel mouse movement) or scale the waveform as a whole (with transverse mouse movement) */
	this.mode = "area" // modes: "edge", "area"
	this.touchdown = new Object();
	this.init();
}
util.inherits(waveform, widget);

waveform.prototype.init = function() {

	this.pieces = ~~(this.GUI.w/this.definition);

	this.draw();
}


/** 
  @method setBuffer 
  Load a web audio AudioBuffer into the waveform ui, for analysis and visualization.
  @param {AudioBuffer} [buffer] The buffer to be loaded.
  */
waveform.prototype.setBuffer = function(prebuff) {

	this.channels = prebuff.numberOfChannels
	this.duration = prebuff.duration
	this.sampleRate = prebuff.sampleRate
	this.waveHeight = this.GUI.h / this.channels

	// timescale
	this.durationMS = (this.duration * 1000) 
	this.timescale = 0
	while (~~(this.durationMS/this.times[this.timescale].dur) > 7 && this.timescale < this.times.length ) {
		this.timescale++;
	}
	this.timescale = this.times[this.timescale]

	this.rawbuffer = []
	this.buffer = []

	// reduce/crush buffers
	for (var i=0;i<this.channels;i++) {
		this.rawbuffer.push(prebuff.getChannelData(0))
		this.buffer.push([])

		// counts faster (& less accurately) through larger buffers.
		// for every 5 seconds in the buffer, our counter skips 1.
		// so a 10 second buffer will only look at every 3rd sample
		//   when calculating waveform.
		var countinc = ~~(this.rawbuffer[0].length / (this.sampleRate*5)) + 1

		var groupsize = ~~(this.rawbuffer[i].length/this.pieces)
		var cmax = 0
		var cmin = 0
		var group = 0
		var vis = []
		for (var j=0;j<this.rawbuffer[i].length;j += countinc) {
			if (this.rawbuffer[i][j]>0) {
				cmax = Math.max(cmax,this.rawbuffer[i][j])
			} else {
				cmin = Math.min(cmin,this.rawbuffer[i][j])
			}
			if (j > group * groupsize) {
				this.buffer[i].push([cmax,cmin])
				group++
				cmin = 0
				cmax = 0
			}
		}
	}

	if (this.val.start && this.val.stop) {

	}

	this.val.starttime = Math.round(this.val.start * this.durationMS)
	this.val.stoptime = Math.round(this.val.stop * this.durationMS)
	this.val.looptime = Math.round(this.val.size * this.durationMS)
	

	this.draw()

}

/** 
  @method select 
  Set the selection start and end points.
  @param {integer} [start] Selection start point in milliseconds
  @param {integer} [end] Selection end point in milliseconds
  */
waveform.prototype.select = function(start,stop) {
	this.val.start = math.clip(start / this.durationMS,0,1)
	this.val.stop = math.clip(stop / this.durationMS,0,1)
	this.val.size = this.val.stop - this.val.start
	this.val.starttime = start
	this.val.stoptime = stop
	this.val.looptime = start - stop
	this.transmit(this.val)
	this.draw()
}


waveform.prototype.draw = function() {
	//this.erase();

	with (this.context) {
		//bg
		fillStyle = this.colors.fill;
		fillRect(0,0,this.GUI.w,this.GUI.h);

		//waveform
		for (var i=0;i<this.buffer.length;i++) {
			fillStyle = this.colors.black
			this.waveTop = i*this.waveHeight;
			this.waveCenter = this.waveTop + this.waveHeight/2
			for (var j=0;j<this.buffer[i].length;j++) {
				var ht1 = this.waveCenter - this.buffer[i][j][0]*this.waveHeight
				var ht2 = this.waveCenter + Math.abs(this.buffer[i][j][1]*this.waveHeight)
				ht2 = ht2 - ht1
				fillRect( j*this.definition, ht1 , this.definition, ht2)
			}
			this.buffer[i]

		}

		//time bar - top
		globalAlpha = 0.3
		fillStyle = this.colors.border
		fillRect(0,0,this.GUI.w,16)
		globalAlpha = 1


		textBaseline = "middle"
		textAlign = "left"
		fontSize = "8px"

		//time lines
		if (this.timescale) {
			for (var i=1; i<this.durationMS/this.timescale.dur; i++) {
				var x = (i * this.timescale.dur) / this.durationMS
				x *= this.GUI.w
				fillStyle = this.colors.border
				fillRect(x,0,1,this.GUI.h)
				fillStyle = this.colors.black
				globalAlpha = 0.6
				fillText(this.msToTime(i * this.timescale.dur,this.timescale.format),x+5,8)
				globalAlpha = 1
			}	
		} 
		

		// range selection
		var x1 = this.val.start*this.GUI.w;
		var y1 = 0;
		var x2 = this.val.stop*this.GUI.w;
		var y2 = this.GUI.h;
	   
		fillStyle = this.colors.accent;
		strokeStyle = this.colors.accent;
		lineWidth = 2
		globalAlpha = 0.3
		fillRect(x1,y1,x2-x1,y2-y1);
		globalAlpha = 0.7
		strokeRect(x1,y1-2,x2-x1,y2-y1+4);
		if (this.durationMS && this.val.looptime) {
			this.val.size = this.val.stop - this.val.start
			textAlign = "center"
			var dur = this.val.looptime
			if (dur > 1000) {
				dur /= 1000
				math.prune(dur,2)
				dur += ' s'
			} else {
				math.prune(dur,0)
				dur += ' ms'
			}
			fillText(dur,x1 + (x2-x1)/2,this.GUI.h/2)
		}
		
		globalAlpha = 1

		
	}

}

waveform.prototype.msToTime = function(rawms,format) {

  var format = format ? format : 2

  var s = ~~(rawms / 1000)
  var secs = s % 60;
  s = (s - secs) / 60;
  var mins = s % 60;
  var hrs = (s - mins) / 60;
  var ms = rawms % 1000

  //correct digits
  secs = (secs < 10 && mins) ? secs + '0' : secs;
  //ms = (ms < 10 && secs) ? ms + '0' : ms;

  if (format==1) {
  	return secs + '.' + ms;
  } else if (format==2) {
  	return mins + ':' + secs + '.' + ms;
  } else if (format==3) {
  	return mins + ':' + secs;
  }

}

waveform.prototype.click = function() {
	if (this.mode=="edge") {
		if (Math.abs(this.clickPos.x-this.val.start*this.GUI.w) < Math.abs(this.clickPos.x-this.val.stop*this.GUI.w)) {
			this.firsttouch = "start"
		} else {
			this.firsttouch = "stop"
		}
	} else if (this.mode=="area") {
		this.touchdown = {
			x: this.clickPos.x,
			y: this.clickPos.y
		}
		this.startval = new Object();
		this.startval.size = this.val.stop - this.val.start;
		this.startval.loc = this.val.start + this.startval.size/2;
	}
	this.move();
}

waveform.prototype.move = function() {

	if (this.mode=="edge") {
		if (this.firsttouch=="start") {
			this.val.start = this.clickPos.x/this.GUI.w;
			if (this.clickPos.touches.length>1) {
				this.val.stop = this.clickPos.touches[1].x/this.GUI.w;
			}
		} else {
			this.val.stop = this.clickPos.x/this.GUI.w;
			if (this.clickPos.touches.length>1) {
				this.val.start = this.clickPos.touches[1].x/this.GUI.w;
			}
		}
	

		if (this.val.stop < this.val.start) {
			this.tempstart = this.val.start;
			this.val.start = this.val.stop;
			this.val.stop = this.tempstart;
			if (this.firsttouch=="start") {
				this.firsttouch = "stop";
			} else {
				this.firsttouch = "start";
			}
		} 
		
	} else if (this.mode=="area") {

		var moveloc = this.clickPos.x/this.GUI.w;
		var movesize = (this.touchdown.y - this.clickPos.y)/this.GUI.h;
	
		movesize /= 4;
		var size = this.startval.size + movesize;
		size = math.clip(size,0.001,1);

		this.val = {
			start: moveloc - size/2,
			stop: moveloc + size/2,
		}

	}

	this.val.start = math.clip(this.val.start,0,1);
	this.val.stop = math.clip(this.val.stop,0,1);

	this.val['size'] = math.clip(Math.abs(this.val.stop - this.val.start), 0, 1)

	if (this.durationMS) {
		this.val["starttime"] = Math.round(this.val.start * this.durationMS)
		this.val["stoptime"] = Math.round(this.val.stop * this.durationMS)
		this.val["looptime"] = Math.round(this.val.size * this.durationMS)
	}

	this.transmit(this.val);
	this.draw();

}
},{"../core/widget":3,"../utils/math":6,"util":51}],45:[function(require,module,exports){
var util = require('util');
var widget = require('../core/widget');
var math = require('../utils/math')

/** 
	@class wavegrain      
	wavegrain visualizer and selecter
	```html
	<canvas nx="wavegrain"></canvas>
	```
*/

var wavegrain = module.exports = function (target) {
	this.defaultSize = { width: 400, height: 125 };
	widget.call(this, target);

	/** @property {object}  val  Object containing core interactive aspects of widget, which are also its data output. Has the following properties: 
		| &nbsp; | data
		| --- | ---
		| *starttime* | wavegrain selection start position in milliseconds (integer)
		| *stoptime* | wavegrain selection end position in milliseconds (integer)
		| *looptime* | Selection size, in milliseconds (integer)
	*/
	this.val = {
		starttime: 0,
		stoptime: 0,
		looptime: 50,
		start: 0,
		stop: 0,
		size: 0,
		level: 0,
		state: "off"
	}

	this.handle;
	this.relhandle;
	this.cap;
	this.firsttouch = "start";

	/** @property {Array} buffer  Contains multiple arrays of reduced buffer data, for visualization */
	this.buffer = []

	if (nx.isMobile) {
		/** @property {integer} definition  Horizontal definition of the visualization. Value of 3 means the wavegrain will be represented in 3 pixel chunks. Higher numbers (4+) lead to a smaller graphics load. Smaller numbers (1-3) look better. Default is 1 for desktop renders, 3 for mobile renders. */
		this.definition = 1;
	} else {
		this.definition = 1;
	}

	this.pieces = false;

	/** @property {integer} channels  How many channels in the wavegrain */
	this.channels = 1
	this.rawbuffer = []

	this.times = [
		{ dur: 10 , format: 1 },
		{ dur: 50 , format: 1 },
		{ dur: 100 , format: 1 },
		{ dur: 200 , format: 1 },
		{ dur: 500 , format: 1 },
		{ dur: 1000 , format: 1 },
		{ dur: 2000 , format: 1 },
		{ dur: 5000 , format: 1 },
		{ dur: 10000 , format: 3 },
		{ dur: 15000 , format: 3 },
		{ dur: 60000 , format: 3 }, // 1 min
		{ dur: 120000 , format: 3 }, // 2 mins
		{ dur: 300000 , format: 3 }, // 5 mins
		{ dur: 600000 , format: 3 }, // 10 mins
	]
	this.timescale = false

	// to do --
	// // sample rate adjustments
	// .select(500,1000)

	/** @property {string}  mode  Mode of interaction. "edge" mode lets you drag each edge of the wavegrain individually. "area" mode (default) lets you drag the wavegrain as a whole (with parallel mouse movement) or scale the wavegrain as a whole (with transverse mouse movement) */
	this.mode = "area" // modes: "edge", "area"
	this.touchdown = new Object();
	this.init();
}
util.inherits(wavegrain, widget);

wavegrain.prototype.init = function() {

	this.pieces = ~~(this.GUI.w/this.definition);

	this.draw();
}


/** 
  @method setBuffer 
  Load a web audio AudioBuffer into the wavegrain ui, for analysis and visualization.
  @param {AudioBuffer} [buffer] The buffer to be loaded.
  */
wavegrain.prototype.setBuffer = function(prebuff) {

	this.channels = prebuff.numberOfChannels
	this.duration = prebuff.duration
	this.sampleRate = prebuff.sampleRate
	this.waveHeight = this.GUI.h / this.channels

	// timescale
	this.durationMS = (this.duration * 1000) 
	this.timescale = 0
	while (~~(this.durationMS/this.times[this.timescale].dur) > 7 && this.timescale < this.times.length ) {
		this.timescale++;
	}
	this.timescale = this.times[this.timescale]

	this.rawbuffer = []
	this.buffer = []

	// reduce/crush buffers
	for (var i=0;i<this.channels;i++) {
		this.rawbuffer.push(prebuff.getChannelData(0))
		this.buffer.push([])

		// counts faster (& less accurately) through larger buffers.
		// for every 5 seconds in the buffer, our counter skips 1.
		// so a 10 second buffer will only look at every 3rd sample
		//   when calculating wavegrain.
		var countinc = ~~(this.rawbuffer[0].length / (this.sampleRate*5)) + 1

		var groupsize = ~~(this.rawbuffer[i].length/this.pieces)
		var cmax = 0
		var cmin = 0
		var group = 0
		var vis = []
		for (var j=0;j<this.rawbuffer[i].length;j += countinc) {
			if (this.rawbuffer[i][j]>0) {
				cmax = Math.max(cmax,this.rawbuffer[i][j])
			} else {
				cmin = Math.min(cmin,this.rawbuffer[i][j])
			}
			if (j > group * groupsize) {
				this.buffer[i].push([cmax,cmin])
				group++
				cmin = 0
				cmax = 0
			}
		}
	}

	if (this.val.start && this.val.stop) {

	}

	this.val.starttime = Math.round(this.val.start * this.durationMS)
	this.val.stoptime = Math.round(this.val.stop * this.durationMS)
	//this.val.looptime = Math.round(this.val.size * this.durationMS)
	

	this.draw()

}

/** 
  @method select 
  Set the selection start and end points.
  @param {integer} [start] Selection start point in milliseconds
  @param {integer} [end] Selection end point in milliseconds
  */
wavegrain.prototype.select = function(start,stop) {
	this.val.start = math.clip(start / this.durationMS,0,1)
	this.val.stop = math.clip(stop / this.durationMS,0,1)
	this.val.size = this.val.stop - this.val.start
	this.val.starttime = start
	this.val.stoptime = stop
	this.val.looptime = start - stop
	this.transmit(this.val)
	this.draw()
}


wavegrain.prototype.draw = function() {
	//this.erase();

	with (this.context) {
		//bg
		fillStyle = this.colors.fill;
		fillRect(0,0,this.GUI.w,this.GUI.h);

		//waveform
		for (var i=0;i<this.buffer.length;i++) {
			fillStyle = this.colors.black
			this.waveTop = i*this.waveHeight;
			this.waveCenter = this.waveTop + this.waveHeight/2
			for (var j=0;j<this.buffer[i].length;j++) {
				var ht1 = this.waveCenter - this.buffer[i][j][0]*this.waveHeight
				var ht2 = this.waveCenter + Math.abs(this.buffer[i][j][1]*this.waveHeight)
				ht2 = ht2 - ht1
				fillRect( j*this.definition, ht1 , this.definition, ht2)
			}
			this.buffer[i]

		}

		//time bar - top
		globalAlpha = 0.3
		fillStyle = this.colors.border
		fillRect(0,0,this.GUI.w,16)
		globalAlpha = 1


		textBaseline = "middle"
		textAlign = "left"
		fontSize = "8px"

		//time lines
		if (this.timescale) {
			for (var i=1; i<this.durationMS/this.timescale.dur; i++) {
				var x = (i * this.timescale.dur) / this.durationMS
				x *= this.GUI.w
				fillStyle = this.colors.border
				fillRect(x,0,1,this.GUI.h)
				fillStyle = this.colors.black
				globalAlpha = 0.6
				fillText(this.msToTime(i * this.timescale.dur,this.timescale.format),x+5,8)
				globalAlpha = 1
			}	
		} 
		

		if (this.val.state=="on") {
			// range selection
			var x1 = this.val.start*this.GUI.w;
			var y1 = this.val.level * this.GUI.h;
			var x2 = this.val.stop*this.GUI.w;
			var y2 = this.GUI.h;
		   
			fillStyle = this.colors.accent;
			strokeStyle = this.colors.accent;
			lineWidth = 2
		
			globalAlpha = 0.3	
			beginPath()
			//arc(x1,y1,x2-x1,0,Math.PI*2,false)
			arc(x1,y1,30,0,Math.PI*2,false)
			fill()
			globalAlpha = 0.7
			stroke()
		
		/*	globalAlpha = 0.1
			fillRect(x1,0,x2-x1,y2);
			globalAlpha = 0.3
			strokeRect(x1,0,x2-x1,y2);
			globalAlpha = 1
			fillRect(x1,y1,x2-x1,y2-y1);
			strokeRect(x1,y1,x2-x1,y2-y1); */
			globalAlpha = 1
		}

		
	}

}

wavegrain.prototype.msToTime = function(rawms,format) {

  var format = format ? format : 2

  var s = ~~(rawms / 1000)
  var secs = s % 60;
  s = (s - secs) / 60;
  var mins = s % 60;
  var hrs = (s - mins) / 60;
  var ms = rawms % 1000

  //correct digits
  secs = (secs < 10 && mins) ? secs + '0' : secs;
  //ms = (ms < 10 && secs) ? ms + '0' : ms;

  if (format==1) {
  	return secs + '.' + ms;
  } else if (format==2) {
  	return mins + ':' + secs + '.' + ms;
  } else if (format==3) {
  	return mins + ':' + secs;
  }

}

wavegrain.prototype.click = function() {
	if (this.durationMS) {
		this.val.state = "on"
		this.move();
	//	this.tick();
	//	this.interval = setInterval(this.tick.bind(this),this.val.looptime)
	}
}

wavegrain.prototype.move = function() {

	if (this.clickPos.x < 0) { this.clickPos.x = 0 }
	if (this.clickPos.x > this.GUI.w) { this.clickPos.x = this.GUI.w }
	if (this.clickPos.y < 0) { this.clickPos.y = 0 }
	if (this.clickPos.y > this.GUI.h) { this.clickPos.y = this.GUI.h }

	this.val.state = "on"
	if (this.durationMS) {
		this.val.start = this.clickPos.x/this.GUI.w - (this.val.looptime/this.durationMS)/2

		this.val.size = this.val.looptime/this.durationMS

	//	this.val.start = math.clip(this.val.start,0,1-this.val.size)

		this.val.stop = this.val.start + this.val.size

		this.val.starttime = Math.round(this.val.start * this.durationMS)
		this.val.looptime = Math.round(this.val.size * this.durationMS)
		this.val.stoptime = this.val.starttime + this.val.looptime

		this.val.level = this.clickPos.y / this.GUI.h

		this.transmit(this.val);
	
		this.draw();
	}

}


wavegrain.prototype.release = function() {
	this.val.state = "off"
	this.transmit(this.val);
	this.draw()
//	clearInterval(this.interval)
}

wavegrain.prototype.tick = function() {
	this.val.state = "on"
	this.transmit(this.val);
}
},{"../core/widget":3,"../utils/math":6,"util":51}],46:[function(require,module,exports){
var math = require('../utils/math')
var util = require('util');
var widget = require('../core/widget');

/** 
	@class windows      
	Scalable windows
	```html
	<canvas nx="windows"></canvas>
	```
	<canvas nx="windows" style="margin-left:25px"></canvas>
*/

var windows = module.exports = function (target) {

	this.defaultSize = { width: 200, height: 200 };

	widget.call(this, target);

	this.val = {
		items: [],
		add: false,
		remove: false,
		change: false
	}

	//this.val.items = []
	this.size = .25;
	this.meta = false;
	this.resizing = false;
	
	this.init();

	document.addEventListener('keydown',function(e) {
		if (e.shiftKey && !this.meta) {
			this.meta = true;
			this.draw();
		}
	}.bind(this))
	document.addEventListener('keyup',function(e) {
		if (!e.shiftKey && this.meta) {
			this.meta = false;
			this.draw();
		}
	}.bind(this))
}
util.inherits(windows, widget);

windows.prototype.init = function() {
	this.draw();
}

windows.prototype.add = function(x,y,w,h) {
	this.val.items.push({
		x: x,
		y: y,
		w: w,
		h: h
	})
	this.draw();
}

windows.prototype.setWindow = function(index, loc) {
	this.val.items[index] = loc;
	this.draw();
}

windows.prototype.remove = function(index) {
	this.val.items.splice(index,1)
	this.val.add = false
	this.val.remove = index
	this.val.change = false
	/* this.val = {
		remove: index,
		items: this.val.items
	} */
	this.transmit(this.val)
	this.draw();
}

windows.prototype.draw = function() {
//	this.erase()
	with (this.context) {

		if (!this.meta) {
			fillStyle = this.colors.fill;
		} else {
			fillStyle = this.colors.border;
		}

		fillRect(0,0,this.GUI.w,this.GUI.h);

		globalAlpha = 0.8;
	
		for (var i=0;i<this.val.items.length;i++) {
			fillStyle = this.colors.accent;
			var x = this.val.items[i].x*this.GUI.w
			var y = this.val.items[i].y*this.GUI.h
			var w = this.val.items[i].w*this.GUI.w
			var h = this.val.items[i].h*this.GUI.h
			fillRect(x,y,w,h)
		    
			strokeStyle = this.colors.fill;
			lineWidth = 1;
		    strokeRect(x+w-10,y+h-10,10,10)
		  //  strokeRect((this.val.items[i].x + this.val.items[i].w/2)*this.GUI.w - 10, (this.val.items[i].y + this.val.items[i].h/2)*this.GUI.h - 10,10,10)
		}

		globalAlpha = 1;

	}
	
	this.drawLabel();
}

windows.prototype.click = function() {

	this.holds = false;
	var cx = this.clickPos.x / this.GUI.w;
	var cy = this.clickPos.y / this.GUI.h;
	for (var i=0;i<this.val.items.length;i++) {
		if (nx.isInside({ x: cx, y: cy }, this.val.items[i])) {
			this.holds = i;
			if (this.clickPos.x > (this.val.items[i].x+this.val.items[i].w)*this.GUI.w - 10 && this.clickPos.x < (this.val.items[i].x+this.val.items[i].w)*this.GUI.w && this.clickPos.y > (this.val.items[i].y+this.val.items[i].h)*this.GUI.h - 10 && this.clickPos.y < (this.val.items[i].y+this.val.items[i].h)*this.GUI.h) {
				this.resizing = true;
			}
		}
	}

	if (this.holds===false) {
		this.val.items.push({
			x: cx,
			y: cy,
			w: this.size,
			h: this.size
		})
		this.holds = this.val.items.length-1;
		this.hasMoved = true;
		this.val.add = this.val.items[this.holds]
		this.val.remove = false
		this.val.change = false
		/* this.val = {
			add: this.val.items[this.holds],
			items: this.val.items
		} */
		this.transmit(this.val)
	}
	if (this.meta) {
		for (var i=0;i<this.val.items.length;i++) {
			this.val.items[i].tx = this.val.items[i].x
			this.val.items[i].ty = this.val.items[i].y
		}
		this.tx = cx
		this.ty = cy
	}
	this.draw();
}

windows.prototype.move = function() {
	var cx = this.clickPos.x / this.GUI.w;
	var cy = this.clickPos.y / this.GUI.h;
	if (this.resizing) {
		if (!this.meta) {
			this.val.items[this.holds].w = cx - this.val.items[this.holds].x
			this.val.items[this.holds].h = cy - this.val.items[this.holds].y
			this.val.items[this.holds] = this.restrict(this.val.items[this.holds])
		} else {
			for (var i=0;i<this.val.items.length;i++) {
				this.val.items[i].w = cx - this.val.items[this.holds].x
				this.val.items[i].h = cy - this.val.items[this.holds].y
				this.val.items[i] = this.restrict(this.val.items[i])
			}
		}
	} else {
		if (!this.meta) {
			this.val.items[this.holds].x = cx;
			this.val.items[this.holds].y = cy;	
			this.val.items[this.holds] = this.restrict(this.val.items[this.holds])
		} else {
			for (var i=0;i<this.val.items.length;i++) {
				this.val.items[i].x = (cx - this.tx) + this.val.items[i].tx;
				this.val.items[i].y = (cy - this.ty) + this.val.items[i].ty;
				this.val.items[i] = this.restrict(this.val.items[i])	
			}
		}	
	}


	
	this.val.change = true;
	this.val.add = false;
	this.val.remove = false;
	/*this.val = {
		change: true,
		items: this.val.items
	} */
	this.transmit(this.val)
	this.draw();
}

windows.prototype.release = function() {
	if (!this.hasMoved) {
		if (this.meta) {
			this.val.add = false
			this.val.remove = "all"
			this.val.change = false
			/*this.val = {
				remove: "all",
				items: this.val.items
			} */
			this.val.items = []
		} else {
			this.val.add = false
			this.val.remove = this.holds
			this.val.change = false
		/*	this.val = {
				remove: this.holds,
				items: this.val.items
			} */
			this.val.items.splice(this.holds,1)
		}
	}
	this.resizing = false;
	this.transmit(this.val);
	this.draw();
}

windows.prototype.restrict = function(item) {
	if (item.x < 0) {
		item.x = 0
	}
	if (item.y < 0) {
		item.y = 0
	}
	if (item.x + item.w > 1) {
		item.x = 1 - item.w
	}
	if (item.y + item.h > 1) {
		item.y = 1 - item.h
	}	
	return item;
}
},{"../core/widget":3,"../utils/math":6,"util":51}],47:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],48:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],49:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],50:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],51:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":50,"_process":49,"inherits":48}],52:[function(require,module,exports){
var hasOwn = Object.prototype.hasOwnProperty;
var toString = Object.prototype.toString;
var undefined;

var isPlainObject = function isPlainObject(obj) {
	'use strict';
	if (!obj || toString.call(obj) !== '[object Object]') {
		return false;
	}

	var has_own_constructor = hasOwn.call(obj, 'constructor');
	var has_is_property_of_method = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
	// Not own constructor property must be Object
	if (obj.constructor && !has_own_constructor && !has_is_property_of_method) {
		return false;
	}

	// Own properties are enumerated firstly, so to speed up,
	// if last one is own, then all properties are own.
	var key;
	for (key in obj) {}

	return key === undefined || hasOwn.call(obj, key);
};

module.exports = function extend() {
	'use strict';
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[0],
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if (typeof target === 'boolean') {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	} else if ((typeof target !== 'object' && typeof target !== 'function') || target == null) {
		target = {};
	}

	for (; i < length; ++i) {
		options = arguments[i];
		// Only deal with non-null/undefined values
		if (options != null) {
			// Extend the base object
			for (name in options) {
				src = target[name];
				copy = options[name];

				// Prevent never-ending loop
				if (target === copy) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if (deep && copy && (isPlainObject(copy) || (copyIsArray = Array.isArray(copy)))) {
					if (copyIsArray) {
						copyIsArray = false;
						clone = src && Array.isArray(src) ? src : [];
					} else {
						clone = src && isPlainObject(src) ? src : {};
					}

					// Never move original objects, clone them
					target[name] = extend(deep, clone, copy);

				// Don't bring in undefined values
				} else if (copy !== undefined) {
					target[name] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};


},{}],53:[function(require,module,exports){
/* Web Font Loader v1.6.10 - (c) Adobe Systems, Google. License: Apache 2.0 */
(function(){function aa(a,b,c){return a.call.apply(a.bind,arguments)}function ba(a,b,c){if(!a)throw Error();if(2<arguments.length){var d=Array.prototype.slice.call(arguments,2);return function(){var c=Array.prototype.slice.call(arguments);Array.prototype.unshift.apply(c,d);return a.apply(b,c)}}return function(){return a.apply(b,arguments)}}function n(a,b,c){n=Function.prototype.bind&&-1!=Function.prototype.bind.toString().indexOf("native code")?aa:ba;return n.apply(null,arguments)}var p=Date.now||function(){return+new Date};function q(a,b){this.F=a;this.k=b||a;this.H=this.k.document}var ca=!!window.FontFace;q.prototype.createElement=function(a,b,c){a=this.H.createElement(a);if(b)for(var d in b)b.hasOwnProperty(d)&&("style"==d?a.style.cssText=b[d]:a.setAttribute(d,b[d]));c&&a.appendChild(this.H.createTextNode(c));return a};function s(a,b,c){a=a.H.getElementsByTagName(b)[0];a||(a=document.documentElement);a.insertBefore(c,a.lastChild)}
function t(a,b,c){b=b||[];c=c||[];for(var d=a.className.split(/\s+/),e=0;e<b.length;e+=1){for(var f=!1,g=0;g<d.length;g+=1)if(b[e]===d[g]){f=!0;break}f||d.push(b[e])}b=[];for(e=0;e<d.length;e+=1){f=!1;for(g=0;g<c.length;g+=1)if(d[e]===c[g]){f=!0;break}f||b.push(d[e])}a.className=b.join(" ").replace(/\s+/g," ").replace(/^\s+|\s+$/,"")}function u(a,b){for(var c=a.className.split(/\s+/),d=0,e=c.length;d<e;d++)if(c[d]==b)return!0;return!1}
function v(a){if("string"===typeof a.fa)return a.fa;var b=a.k.location.protocol;"about:"==b&&(b=a.F.location.protocol);return"https:"==b?"https:":"http:"}function x(a,b,c){function d(){l&&e&&f&&(l(g),l=null)}b=a.createElement("link",{rel:"stylesheet",href:b,media:"all"});var e=!1,f=!0,g=null,l=c||null;ca?(b.onload=function(){e=!0;d()},b.onerror=function(){e=!0;g=Error("Stylesheet failed to load");d()}):setTimeout(function(){e=!0;d()},0);s(a,"head",b)}
function y(a,b,c,d){var e=a.H.getElementsByTagName("head")[0];if(e){var f=a.createElement("script",{src:b}),g=!1;f.onload=f.onreadystatechange=function(){g||this.readyState&&"loaded"!=this.readyState&&"complete"!=this.readyState||(g=!0,c&&c(null),f.onload=f.onreadystatechange=null,"HEAD"==f.parentNode.tagName&&e.removeChild(f))};e.appendChild(f);setTimeout(function(){g||(g=!0,c&&c(Error("Script load timeout")))},d||5E3);return f}return null};function z(){this.S=0;this.K=null}function A(a){a.S++;return function(){a.S--;B(a)}}function C(a,b){a.K=b;B(a)}function B(a){0==a.S&&a.K&&(a.K(),a.K=null)};function D(a){this.ea=a||"-"}D.prototype.d=function(a){for(var b=[],c=0;c<arguments.length;c++)b.push(arguments[c].replace(/[\W_]+/g,"").toLowerCase());return b.join(this.ea)};function E(a,b){this.Q=a;this.M=4;this.L="n";var c=(b||"n4").match(/^([nio])([1-9])$/i);c&&(this.L=c[1],this.M=parseInt(c[2],10))}E.prototype.getName=function(){return this.Q};function da(a){return G(a)+" "+(a.M+"00")+" 300px "+H(a.Q)}function H(a){var b=[];a=a.split(/,\s*/);for(var c=0;c<a.length;c++){var d=a[c].replace(/['"]/g,"");-1!=d.indexOf(" ")||/^\d/.test(d)?b.push("'"+d+"'"):b.push(d)}return b.join(",")}function I(a){return a.L+a.M}
function G(a){var b="normal";"o"===a.L?b="oblique":"i"===a.L&&(b="italic");return b}function ea(a){var b=4,c="n",d=null;a&&((d=a.match(/(normal|oblique|italic)/i))&&d[1]&&(c=d[1].substr(0,1).toLowerCase()),(d=a.match(/([1-9]00|normal|bold)/i))&&d[1]&&(/bold/i.test(d[1])?b=7:/[1-9]00/.test(d[1])&&(b=parseInt(d[1].substr(0,1),10))));return c+b};function fa(a,b){this.a=a;this.j=a.k.document.documentElement;this.O=b;this.g="wf";this.e=new D("-");this.da=!1!==b.events;this.u=!1!==b.classes}function ga(a){a.u&&t(a.j,[a.e.d(a.g,"loading")]);J(a,"loading")}function K(a){if(a.u){var b=u(a.j,a.e.d(a.g,"active")),c=[],d=[a.e.d(a.g,"loading")];b||c.push(a.e.d(a.g,"inactive"));t(a.j,c,d)}J(a,"inactive")}function J(a,b,c){if(a.da&&a.O[b])if(c)a.O[b](c.getName(),I(c));else a.O[b]()};function ha(){this.t={}}function ia(a,b,c){var d=[],e;for(e in b)if(b.hasOwnProperty(e)){var f=a.t[e];f&&d.push(f(b[e],c))}return d};function L(a,b){this.a=a;this.h=b;this.m=this.a.createElement("span",{"aria-hidden":"true"},this.h)}function M(a,b){var c=a.m,d;d="display:block;position:absolute;top:-9999px;left:-9999px;font-size:300px;width:auto;height:auto;line-height:normal;margin:0;padding:0;font-variant:normal;white-space:nowrap;font-family:"+H(b.Q)+";"+("font-style:"+G(b)+";font-weight:"+(b.M+"00")+";");c.style.cssText=d}function N(a){s(a.a,"body",a.m)}L.prototype.remove=function(){var a=this.m;a.parentNode&&a.parentNode.removeChild(a)};function O(a,b,c,d,e,f){this.G=a;this.J=b;this.f=d;this.a=c;this.v=e||3E3;this.h=f||void 0}O.prototype.start=function(){var a=this.a.k.document,b=this;Promise.race([new Promise(function(a,d){setTimeout(function(){d(b.f)},b.v)}),a.fonts.load(da(this.f),this.h)]).then(function(a){1===a.length?b.G(b.f):b.J(b.f)},function(){b.J(b.f)})};function P(a,b,c,d,e,f,g){this.G=a;this.J=b;this.a=c;this.f=d;this.h=g||"BESbswy";this.s={};this.v=e||3E3;this.Z=f||null;this.D=this.C=this.A=this.w=null;this.w=new L(this.a,this.h);this.A=new L(this.a,this.h);this.C=new L(this.a,this.h);this.D=new L(this.a,this.h);M(this.w,new E(this.f.getName()+",serif",I(this.f)));M(this.A,new E(this.f.getName()+",sans-serif",I(this.f)));M(this.C,new E("serif",I(this.f)));M(this.D,new E("sans-serif",I(this.f)));N(this.w);N(this.A);N(this.C);N(this.D)}
var Q={ia:"serif",ha:"sans-serif"},R=null;function S(){if(null===R){var a=/AppleWebKit\/([0-9]+)(?:\.([0-9]+))/.exec(window.navigator.userAgent);R=!!a&&(536>parseInt(a[1],10)||536===parseInt(a[1],10)&&11>=parseInt(a[2],10))}return R}P.prototype.start=function(){this.s.serif=this.C.m.offsetWidth;this.s["sans-serif"]=this.D.m.offsetWidth;this.ga=p();T(this)};function ja(a,b,c){for(var d in Q)if(Q.hasOwnProperty(d)&&b===a.s[Q[d]]&&c===a.s[Q[d]])return!0;return!1}
function T(a){var b=a.w.m.offsetWidth,c=a.A.m.offsetWidth,d;(d=b===a.s.serif&&c===a.s["sans-serif"])||(d=S()&&ja(a,b,c));d?p()-a.ga>=a.v?S()&&ja(a,b,c)&&(null===a.Z||a.Z.hasOwnProperty(a.f.getName()))?U(a,a.G):U(a,a.J):ka(a):U(a,a.G)}function ka(a){setTimeout(n(function(){T(this)},a),50)}function U(a,b){setTimeout(n(function(){this.w.remove();this.A.remove();this.C.remove();this.D.remove();b(this.f)},a),0)};function V(a,b,c){this.a=a;this.p=b;this.P=0;this.ba=this.Y=!1;this.v=c}var la=!!window.FontFace;V.prototype.V=function(a){var b=this.p;b.u&&t(b.j,[b.e.d(b.g,a.getName(),I(a).toString(),"active")],[b.e.d(b.g,a.getName(),I(a).toString(),"loading"),b.e.d(b.g,a.getName(),I(a).toString(),"inactive")]);J(b,"fontactive",a);this.ba=!0;ma(this)};
V.prototype.W=function(a){var b=this.p;if(b.u){var c=u(b.j,b.e.d(b.g,a.getName(),I(a).toString(),"active")),d=[],e=[b.e.d(b.g,a.getName(),I(a).toString(),"loading")];c||d.push(b.e.d(b.g,a.getName(),I(a).toString(),"inactive"));t(b.j,d,e)}J(b,"fontinactive",a);ma(this)};function ma(a){0==--a.P&&a.Y&&(a.ba?(a=a.p,a.u&&t(a.j,[a.e.d(a.g,"active")],[a.e.d(a.g,"loading"),a.e.d(a.g,"inactive")]),J(a,"active")):K(a.p))};function na(a){this.F=a;this.q=new ha;this.$=0;this.T=this.U=!0}na.prototype.load=function(a){this.a=new q(this.F,a.context||this.F);this.U=!1!==a.events;this.T=!1!==a.classes;oa(this,new fa(this.a,a),a)};
function pa(a,b,c,d,e){var f=0==--a.$;(a.T||a.U)&&setTimeout(function(){var a=e||null,l=d||null||{};if(0===c.length&&f)K(b.p);else{b.P+=c.length;f&&(b.Y=f);var h,k=[];for(h=0;h<c.length;h++){var m=c[h],w=l[m.getName()],r=b.p,F=m;r.u&&t(r.j,[r.e.d(r.g,F.getName(),I(F).toString(),"loading")]);J(r,"fontloading",F);r=null;r=la?new O(n(b.V,b),n(b.W,b),b.a,m,b.v,w):new P(n(b.V,b),n(b.W,b),b.a,m,b.v,a,w);k.push(r)}for(h=0;h<k.length;h++)k[h].start()}},0)}
function oa(a,b,c){var d=[],e=c.timeout;ga(b);var d=ia(a.q,c,a.a),f=new V(a.a,b,e);a.$=d.length;b=0;for(c=d.length;b<c;b++)d[b].load(function(b,c,d){pa(a,f,b,c,d)})};function qa(a,b,c){this.N=a?a:b+ra;this.o=[];this.R=[];this.ca=c||""}var ra="//fonts.googleapis.com/css";function sa(a,b){for(var c=b.length,d=0;d<c;d++){var e=b[d].split(":");3==e.length&&a.R.push(e.pop());var f="";2==e.length&&""!=e[1]&&(f=":");a.o.push(e.join(f))}}
qa.prototype.d=function(){if(0==this.o.length)throw Error("No fonts to load!");if(-1!=this.N.indexOf("kit="))return this.N;for(var a=this.o.length,b=[],c=0;c<a;c++)b.push(this.o[c].replace(/ /g,"+"));a=this.N+"?family="+b.join("%7C");0<this.R.length&&(a+="&subset="+this.R.join(","));0<this.ca.length&&(a+="&text="+encodeURIComponent(this.ca));return a};function ta(a){this.o=a;this.aa=[];this.I={}}
var ua={latin:"BESbswy",cyrillic:"&#1081;&#1103;&#1046;",greek:"&#945;&#946;&#931;",khmer:"&#x1780;&#x1781;&#x1782;",Hanuman:"&#x1780;&#x1781;&#x1782;"},va={thin:"1",extralight:"2","extra-light":"2",ultralight:"2","ultra-light":"2",light:"3",regular:"4",book:"4",medium:"5","semi-bold":"6",semibold:"6","demi-bold":"6",demibold:"6",bold:"7","extra-bold":"8",extrabold:"8","ultra-bold":"8",ultrabold:"8",black:"9",heavy:"9",l:"3",r:"4",b:"7"},wa={i:"i",italic:"i",n:"n",normal:"n"},xa=/^(thin|(?:(?:extra|ultra)-?)?light|regular|book|medium|(?:(?:semi|demi|extra|ultra)-?)?bold|black|heavy|l|r|b|[1-9]00)?(n|i|normal|italic)?$/;
ta.prototype.parse=function(){for(var a=this.o.length,b=0;b<a;b++){var c=this.o[b].split(":"),d=c[0].replace(/\+/g," "),e=["n4"];if(2<=c.length){var f;var g=c[1];f=[];if(g)for(var g=g.split(","),l=g.length,h=0;h<l;h++){var k;k=g[h];if(k.match(/^[\w-]+$/))if(k=xa.exec(k.toLowerCase()),null==k)k="";else{var m;m=k[1];if(null==m||""==m)m="4";else{var w=va[m];m=w?w:isNaN(m)?"4":m.substr(0,1)}k=k[2];k=[null==k||""==k?"n":wa[k],m].join("")}else k="";k&&f.push(k)}0<f.length&&(e=f);3==c.length&&(c=c[2],f=
[],c=c?c.split(","):f,0<c.length&&(c=ua[c[0]])&&(this.I[d]=c))}this.I[d]||(c=ua[d])&&(this.I[d]=c);for(c=0;c<e.length;c+=1)this.aa.push(new E(d,e[c]))}};function ya(a,b){this.a=a;this.c=b}var za={Arimo:!0,Cousine:!0,Tinos:!0};ya.prototype.load=function(a){var b=new z,c=this.a,d=new qa(this.c.api,v(c),this.c.text),e=this.c.families;sa(d,e);var f=new ta(e);f.parse();x(c,d.d(),A(b));C(b,function(){a(f.aa,f.I,za)})};function W(a,b){this.a=a;this.c=b;this.X=[]}W.prototype.B=function(a){var b=this.a;return v(this.a)+(this.c.api||"//f.fontdeck.com/s/css/js/")+(b.k.location.hostname||b.F.location.hostname)+"/"+a+".js"};
W.prototype.load=function(a){var b=this.c.id,c=this.a.k,d=this;b?(c.__webfontfontdeckmodule__||(c.__webfontfontdeckmodule__={}),c.__webfontfontdeckmodule__[b]=function(b,c){for(var g=0,l=c.fonts.length;g<l;++g){var h=c.fonts[g];d.X.push(new E(h.name,ea("font-weight:"+h.weight+";font-style:"+h.style)))}a(d.X)},y(this.a,this.B(b),function(b){b&&a([])})):a([])};function X(a,b){this.a=a;this.c=b}X.prototype.B=function(a){return(this.c.api||"https://use.typekit.net")+"/"+a+".js"};X.prototype.load=function(a){var b=this.c.id,c=this.a.k;b?y(this.a,this.B(b),function(b){if(b)a([]);else if(c.Typekit&&c.Typekit.config&&c.Typekit.config.fn){b=c.Typekit.config.fn;for(var e=[],f=0;f<b.length;f+=2)for(var g=b[f],l=b[f+1],h=0;h<l.length;h++)e.push(new E(g,l[h]));try{c.Typekit.load({events:!1,classes:!1,async:!0})}catch(k){}a(e)}},2E3):a([])};function Y(a,b){this.a=a;this.c=b}Y.prototype.B=function(a,b){var c=v(this.a),d=(this.c.api||"fast.fonts.net/jsapi").replace(/^.*http(s?):(\/\/)?/,"");return c+"//"+d+"/"+a+".js"+(b?"?v="+b:"")};
Y.prototype.load=function(a){function b(){if(e["__mti_fntLst"+c]){var d=e["__mti_fntLst"+c](),g=[],l;if(d)for(var h=0;h<d.length;h++){var k=d[h].fontfamily;void 0!=d[h].fontStyle&&void 0!=d[h].fontWeight?(l=d[h].fontStyle+d[h].fontWeight,g.push(new E(k,l))):g.push(new E(k))}a(g)}else setTimeout(function(){b()},50)}var c=this.c.projectId,d=this.c.version;if(c){var e=this.a.k;y(this.a,this.B(c,d),function(c){c?a([]):b()}).id="__MonotypeAPIScript__"+c}else a([])};function Aa(a,b){this.a=a;this.c=b}Aa.prototype.load=function(a){var b,c,d=this.c.urls||[],e=this.c.families||[],f=this.c.testStrings||{},g=new z;b=0;for(c=d.length;b<c;b++)x(this.a,d[b],A(g));var l=[];b=0;for(c=e.length;b<c;b++)if(d=e[b].split(":"),d[1])for(var h=d[1].split(","),k=0;k<h.length;k+=1)l.push(new E(d[0],h[k]));else l.push(new E(d[0]));C(g,function(){a(l,f)})};var Z=new na(window);Z.q.t.custom=function(a,b){return new Aa(b,a)};Z.q.t.fontdeck=function(a,b){return new W(b,a)};Z.q.t.monotype=function(a,b){return new Y(b,a)};Z.q.t.typekit=function(a,b){return new X(b,a)};Z.q.t.google=function(a,b){return new ya(b,a)};var $={load:n(Z.load,Z)};"function"===typeof define&&define.amd?define(function(){return $}):"undefined"!==typeof module&&module.exports?module.exports=$:(window.WebFont=$,window.WebFontConfig&&Z.load(window.WebFontConfig));}());


},{}]},{},[1]);
