/**#Interface
A singleton object holding all widget constructors and a couple of other methods / properties. It is automatically created as soon as interface.js is loaded.
**/

/**###Interface.extend : method  
This method deep copies all the properties and methods of one object to another.  

param **destination** Object. The object that properties and methods will be inserted into.  
param **source** Object. The object providing the properties and methods for copying.  
**/

/**###Interface.mouseDown : property  
Boolean. This property tells whether the left mouse button (in non-touch browsers) is currently pressed.
**/

/**###Interface.useTouch : property  
Boolean. Whether or not a touch UI browser is being used.
**/

/**###Interface.isAndroid : property  
Boolean. Whether or not the browser is running under Android. This is used to determine the range of accelerometer values generated.
**/
var Interface = {
  extend : function(destination, source) {
    for (var property in source) {
  		var keys = property.split(".");
      
  		if(source[property] instanceof Array && source[property].length < 100) { // don't copy large array buffers
  	    destination[property] = source[property].slice(0);
      } else {
        destination[property] = source[property];
      }
    }
    return destination;
  },
  
  isAndroid : (function() {
    var ua = navigator.userAgent.toLowerCase();
    return ua.indexOf("android") > -1;
  })(),
  
  keyCodeToChar : {8:"Backspace",9:"Tab",13:"Enter",16:"Shift",17:"Ctrl",18:"Alt",19:"Pause/Break",20:"Caps Lock",27:"Esc",32:"Space",33:"Page Up",34:"Page Down",35:"End",36:"Home",37:"Left",38:"Up",39:"Right",40:"Down",45:"Insert",46:"Delete",48:"0",49:"1",50:"2",51:"3",52:"4",53:"5",54:"6",55:"7",56:"8",57:"9",65:"A",66:"B",67:"C",68:"D",69:"E",70:"F",71:"G",72:"H",73:"I",74:"J",75:"K",76:"L",77:"M",78:"N",79:"O",80:"P",81:"Q",82:"R",83:"S",84:"T",85:"U",86:"V",87:"W",88:"X",89:"Y",90:"Z",91:"Windows",93:"Right Click",96:"Numpad 0",97:"Numpad 1",98:"Numpad 2",99:"Numpad 3",100:"Numpad 4",101:"Numpad 5",102:"Numpad 6",103:"Numpad 7",104:"Numpad 8",105:"Numpad 9",106:"Numpad *",107:"Numpad +",109:"Numpad -",110:"Numpad .",111:"Numpad /",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"Num Lock",145:"Scroll Lock",182:"My Computer",183:"My Calculator",186:";",187:"=",188:",",189:"-",190:".",191:"/",192:"`",219:"[",220:"\\",221:"]",222:"'"},
  
  panels : [],
  mouseDown : false,
  useTouch : 'ontouchstart' in document.documentElement,
  widgets : [],
};

Interface.Presets = {
  dictionary : typeof localStorage.interfacejs === 'undefined' ? {} : JSON.parse( localStorage.interfacejs ),
  
  save : function(name) {
    var preset = [];
    for(var h = 0; h < Interface.panels.length; h++) {
      var panel = Interface.panels[h];
      preset[h] = [];
      for(var i = 0; i < panel.children.length; i++) {
        var widget = panel.children[i];
        if(typeof widget.children === 'object') {
          var children = [];
          for(var j = 0; j < widget.children.length; j++) {
            children[j] = widget.children[j].value;
          }
          preset[h][i] = children;
        }else{
          preset[h][i] = widget.value;
        }
      }
      this.dictionary[ name ] = preset;
      localStorage.interfacejs = JSON.stringify( this.dictionary );
    }
  },
  
  load : function(name) {
    var preset = this.dictionary[ name ];
    for(var h = 0; h < Interface.panels.length; h++) {
      var panel = Interface.panels[h]; 
      for(var i = 0; i < panel.children.length; i++) {
        var widget = panel.children[i];
        if(typeof widget.children === 'object') {
          for(var j = 0; j < widget.children.length; j++) {
             widget.children[j].setValue( preset[h][i][j] );
          }
        }else{
          widget.setValue( preset[h][i] );
        }
      }
    }
  },
  
  list : function() {
    return Object.keys( this.dictionary );
  },
};
/**#Interface.Panel - Widget
A panel is a container for on-screen widgets. There can be multiple panels in a HTML page. Panels are the starting point for event processing in Interface.js.
**/

/**###Interface.Panel.children : property  
Array. An array of all widgets displayed in the panel
**/

/**###Interface.Panel.shouldDraw : property  
Boolean. Whenever the panel refreshes itself it will redraw widgets found in this array.
**/

/**###Interface.Panel.fps : property  
Number. The number of times the panel should refresh itself per second.
**/

/**###Interface.Panel.useRelativeSizesAndPositions : property  
Boolean. This determines whether widgets in the panel uses sizes/positions relative to the size of the panel or use absolute pixel coordinates.
**/

/**###Interface.Panel.container : property  
HTMLElement. The HTMLElement (such as a div tag) containing the Panel.
**/

/**###Interface.Panel.canvas : property  
HTMLElement. The canvas element that the Panel draws onto. This element is created when the panel is initialized.
**/

/**###Interface.Panel.touchEvent : method  
The starting point for on-screen all touch event handling in a Panel. This method distributes events to all child widgets.  
  
param **event** HTML Touch Event Object.
**/

/**###Interface.Panel.mouseEvent : method  
The starting point for on-screen all mouse event handling in a Panel. This method distributes events to all child widgets.  
  
param **event** HTML Mouse Event Object.
**/

/**###Interface.Panel.init : method  
Initialization method called automatically when panel is instantiated.
**/

/**###Interface.Panel.x : property  
Number. The x position of the panel in absolute coordinates relative to the window.
**/
/**###Interface.Panel.y : property  
Number. The y position of the panel in absolute coordinates relative to the window.
**/
/**###Interface.Panel.width : property  
Number. The width of the panel in pixels
**/
/**###Interface.Panel.width : property  
Number. The height of the panel in pixels
**/

/**###Interface.Panel.draw : method  
This method tells all 'dirty' widgets stored in the shouldDraw property to draw themselves.
**/
/**###Interface.Panel.refresh : method  
Clear the entire panel and then tell all widgets to draw themselves.
**/

/**###Interface.Panel.add : method  
Add a new widget to the panel  
  
param **widget** Object. The widget to be added. Motion widgets do not need to be added to the Panel
**/

/**###Interface.Panel.setBackgroundColor : method  
Set the background color the panel using a css color value.  
  
param **cssColor** String. Any valid css color, such as 'red', '#f00', or 'rgb(255,0,0)'.
**/

/**###Interface.Panel.background : property  
String. The default background color for all widgets in the panel. THIS IS NOT THE BACKGROUND COLOR FOR THE PANEL. Any valid css color, such as 'red', '#f00', or 'rgb(255,0,0)' can be assigned to this property.
**/
/**###Interface.Panel.fill : property  
String. The default fill color for all widgets in the panel. Any valid css color, such as 'red', '#f00', or 'rgb(255,0,0)' can be assigned to this property.
**/
/**###Interface.Panel.stroke : property  
String. The default stroke color for all widgets in the panel. Any valid css color, such as 'red', '#f00', or 'rgb(255,0,0)' can be assigned to this property.
**/
Interface.Panel = function() {
  var self = this,
      _container = arguments.length >= 1 ? arguments[0].container : undefined;

  Interface.extend(this, {
    type: 'Panel',
    active: true,
    children:     [],
    shouldDraw :  [],
    fps : 30,
    useRelativeSizesAndPositions : true,
    labelSize: '12px',
    font:'normal 12px Helvetica',
    serializeMe: ['fps', 'useRelativeSizesAndPositions', 'labelSize', 'font', 'background', 'fill', 'stroke', 'backgroundColor'],
    
    container: (function() {
      if(typeof _container === 'undefined') {
        $('body').css({
          margin : 0,
          padding: 0,
        });
        
        var d = $('<div id="container">');
        d.css({
          width:$(window).width(),
          height:$(window).height(),
          display:'block',
          margin:0,
          padding:0,
          position:'absolute',
          left:0,
          top:0
        });
        
        $('body').append(d);
        
        return d;
      }else{
        return _container;
      }
    })(),
    
    canvas:  document.createElement('canvas'),
    
    touchEvent : function(event) {
      if(self.active) {
        if( typeof event.changedTouches === 'undefined' && event.originalEvent ) {
          event.changedTouches = event.originalEvent.changedTouches
        }
        for (var j = 0; j < event.changedTouches.length; j++){
          var touch = event.changedTouches.item(j);		
        
          for(var i = 0; i < self.children.length; i++) {
            touch.x = touch.pageX - self.x;
            touch.y = touch.pageY - self.y;
            touch.type = event.type;
            self.children[i].touchEvent(touch);
          }
      		//var breakCheck = this.events[event.type].call(this, touch);

          //if(breakCheck) break;
      	}
        event.preventDefault(); // HTML Elements must simulate touch events in their touchEvent method
      }
    },
    
    mouseEvent : function(e) {
      if(self.active) {
        if(e.type === 'mousedown') {
          Interface.mouseDown = true;
        }else if(e.type === 'mouseup') {
          Interface.mouseDown = false;
        }
              
        var event = {
          x : e.offsetX || (e.pageX - self.x), // pageX and pageY is for firefox compatibility
          y : e.offsetY || (e.pageY - self.y),
          type: e.type,
        }
        //console.log("MOUSE", event, self.y, e.pageY, e.layerY, e.clientY, e );
      
        for(var i = 0; i < self.children.length; i++) {
          self.children[i].mouseEvent(event);
        }
      }
    },
    
    init : function() {
      var offset = $(this.container).offset();
      this.width  = $(this.container).width();
      this.height = $(this.container).height();
      this.x      = offset.left;
      this.y      = offset.top;
      
      if( isNaN(this.x) ) this.x = 0;
      if( isNaN(this.y) ) this.y = 0;      
      
      $(this.canvas).attr({
        'width':  this.width,
        'height': this.height,
      });

      $(this.container).css({ 'user-select': 'none', '-webkit-user-select': 'none'});
      
      $(this.container).append(this.canvas);
      
      this.ctx = this.canvas.getContext( '2d' );
      this.ctx.translate(0.5, 0.5);
      this.ctx.lineWidth = 1;
      
      if(Interface.useTouch) {
        $(this.container).on( 'touchstart', this.touchEvent );
        $(this.container).on( 'touchmove',  this.touchEvent );
        $(this.container).on( 'touchend',   this.touchEvent );
      }else{
        $(this.container).on( 'mousedown', this.mouseEvent );
        $(this.container).on( 'mousemove', this.mouseEvent );
        $(this.container).on( 'mouseup',   this.mouseEvent );                
      }
      
      $( this.container ).css({ outline: 'none' })
      $( this.container ).attr( 'tabindex', 5 )
      $( this.container ).on( 'keydown', this.keydown.bind( this ) )
      $( this.container ).on( 'keyup', this.keyup.bind( this ) )
    },
    
    keydown: function(e) {
      for( var i = 0; i < this.children.length; i++ ) {
        if( this.children[i].onkeydown ) this.children[i].onkeydown(e)
      }
    },
    
    keyup: function(e) {
      for( var i = 0; i < this.children.length; i++ ) {
        if( this.children[i].onkeyup ) this.children[i].onkeyup(e)
      }
    },
    
    draw : function() {
      if(this.active) {
        for(var i = 0; i < this.shouldDraw.length; i++) {
          this.shouldDraw[i].draw();
        }
        this.shouldDraw.length = 0;
      }
      $.publish('/draw')
    },
    
    getWidgetWithName: function( name ) {
      for(var i = 0; i < this.children.length; i++) {
        if( this.children[i].name === name) {
          return this.children[i];
        }
      }
    },
    
    redoBoundaries : function() {
      var offset = $(this.container).offset();
      this.width  = $(this.container).width();
      this.height = $(this.container).height();
      this.x      = offset.left;
      this.y      = offset.top;
      
      if( isNaN(this.x) ) this.x = 0;
      if( isNaN(this.y) ) this.y = 0;      
      
      $(this.canvas).attr({
        'width':  this.width,
        'height': this.height,
      });
      
      this.ctx.translate(0.5, 0.5);
      this.ctx.lineWidth = 1;
      
      this.refresh();
    },
    
    refresh: function() {
      if(this.active) {
        this.ctx.clearRect(0,0,this.canvas.width, this.canvas.height);
        for(var i = 0; i < this.children.length; i++) {
          this.children[i].draw();
        }
      }
    },
    
    add: function() {
      for(var i = 0; i < arguments.length; i++) {
        var widget = arguments[i];
        
        widget.panel =      this;
        widget.canvas =     this.canvas;
        widget.container =  this.container;
        widget.ctx =        this.ctx;
        
        this.children.push( widget );
        if(widget._init && !widget.added) widget._init();
        
        if(widget.oninit && !widget.added) widget.oninit();
        
        widget.draw();
        widget.added = true;
        
        if(typeof widget.add === 'function') widget.add();
      }
    },
    
    clear : function() {
      this.ctx.clearRect( 0,0,this.width,this.height );
      this.children.length = 0;
    },
    remove: function(widget) {
      this.ctx.clearRect( widget._x(), widget._y(), widget._width(), widget._height() );
      
      if(typeof widget.children !== 'undefined' && widget.type !== "XY") {
        for(var i = 0; i < widget.children.length; i++) {
          this.children.splice( this.children.indexOf( widget.children[i] ), 1 );
          Interface.widgets.splice( Interface.widgets.indexOf( widget.children[i] ), 1 );
        }
      }else{
        if(this.children.indexOf( widget ) > -1) {
          this.children.splice( this.children.indexOf( widget ), 1 );
          Interface.widgets.splice( Interface.widgets.indexOf( widget ), 1 );
          if(typeof widget.remove === 'function') widget.remove();
        }
      }
    },
  });
  
  if(typeof arguments[0] !== 'undefined') Interface.extend(this, arguments[0]);
  if(this.backgroundColor) this.setBackgroundColor( this.backgroundColor );
  
  this.init();

  this.timer = setInterval( function() { self.draw(); }, Math.round(1000 / this.fps) );

  var childBackground ='#000',
      childFill = '#666',
      childStroke = '#999',
      background = 'transparent',
      self = this,
      useRelativeSizesAndPositions = this.useRelativeSizesAndPositions;
      
  Object.defineProperties(this, {
    'useRelativeSizesAndPositions' : {
      get: function() { return useRelativeSizesAndPositions; },
      set: function(val) {
        if(val !== useRelativeSizesAndPositions) {
          useRelativeSizesAndPositions = val;
          if(val === false) {
            for(var i = 0; i < this.children.length; i++) {
              var child = this.children[i];
              child.bounds = [
                Math.round( child.x * this.width ),
                Math.round( child.y * this.height ),
                Math.round( child.width * this.width ),
                Math.round( child.height * this.height ),
              ];
            }
          }else{
            for(var i = 0; i < this.children.length; i++) {
              var child = this.children[i];
              child.bounds = [
                child.x / this.width,
                child.y / this.height,
                child.width / this.width,
                child.height / this.height,
              ];
            }
          }
        } 
        this.refresh();
      },
    },
    'background': {
      get: function() { return background; },
      set: function(val) { 
        background = val;
        $(this.container).css({ backgroundColor:background });
      },
    },
    'childBackground': {
      get: function() { return childBackground; },
      set: function(val) { 
        childBackground = val;
        self.refresh();
      },
    },
    'childStroke': {
      get: function() { return childStroke; },
      set: function(val) { 
        childStroke = val;
        self.refresh();
      },
    },
    'childFill': {
      get: function() { return childFill; },
      set: function(val) { 
        childFill = val;
        self.refresh();
      },
    }
  });
  if(arguments[0]) {
    if(arguments[0].childBackground) this.childBackground = arguments[0].childBackground;
    if(arguments[0].childFill) this.childFill = arguments[0].childFill;
    if(arguments[0].childStroke) this.childStroke = arguments[0].childStroke;    
  }
  Interface.panels.push( this );
};

var convertMouseEvent = function(eventName) {
  switch(eventName) {
    case 'mousedown':
      return 'touchmousedown';
    case 'mousemove':
      return 'touchmousemove';
    case 'mouseup':
      return 'touchmouseup';
    default:
      return eventName;
  }
};

var convertTouchEvent = function(eventName) {
  switch(eventName) {
    case 'touchstart':
      return 'touchmousedown';
    case 'touchmove':
      return 'touchmousemove';
    case 'touchend':
      return 'touchmouseup';
    default:
      return eventName;
  }
};

/**#Interface.Widget - Widget
The prototype object for all Interface.js widgets. These methods and properties are inherited by all widgets.
**/

/**###Interface.Widget.x : property  
Number. The horizontal position of the widget inside of its parent panel. By default, this position is determined relative to the size of the widget's containing panel, but absolute values can also be used if the panel's useRelativeSizesAndPositions property is set to false.
**/
/**###Interface.Widget.y : property  
Number. The vertical position of the widget inside of its parent panel. By default, this position is determined relative to the size of the widget's containing panel, but absolute values can also be used if the panel's useRelativeSizesAndPositions property is set to false.
**/
/**###Interface.Widget.width : property  
Number. The width of the widget. By default, this is determined relative to the size of the widget's containing panel, but absolute values can also be used if the panel's useRelativeSizesAndPositions property is set to false.
**/
/**###Interface.Widget.height : property  
Number. The width of the widget. By default, this is determined relative to the size of the widget's containing panel, but absolute values can also be used if the panel's useRelativeSizesAndPositions property is set to false.
**/
/**###Interface.Widget.bounds : property  
Array. A shorthand to set x,y,width and height simultaneously upon initialization. By default, these values are determined relative to the size of the widget's containing panel, but absolute values can also be used if the panel's useRelativeSizesAndPositions property is set to false.
**/
/**###Interface.Widget.min : property  
Number. Default 0. The minimum value the widget should output.
**/
/**###Interface.Widget.max : property  
Number. Default 1. The maximum value the widget should output.
**/
/**###Interface.Widget.ontouchstart : method  
Function. A user defined event handler for whenever a touch begins over a widget.
**/
/**###Interface.Widget.ontouchmove : method  
Function. A user defined event handler for whenever a touch moves over a widget.
**/
/**###Interface.Widget.ontouchend : method  
Function. A user defined event handler for whenever a touch ends.
**/
/**###Interface.Widget.onmousedown : method  
Function. A user defined event handler for whenever a mouse press occurs over a widget.
**/
/**###Interface.Widget.onmousemove : method  
Function. A user defined event handler for whenever a mouse moves over a widget while its button is pressed.
**/
/**###Interface.Widget.onmouseup : method  
Function. A user defined event handler for whenever a mouse press ends.
**/
/**###Interface.Widget.ontouchmousedown : method  
Function. A user defined event handler for whenever a mouse press or touch occurs over a widget.
**/
/**###Interface.Widget.ontouchmousemove : method  
Function. A user defined event handler for whenever a mouse or touch moves over a widget.
**/
/**###Interface.Widget.ontouchmouseup : method  
Function. A user defined event handler for whenever a mouse press ends or a touch leaves the screen.
**/

/**###Interface.Widget.init : method  
This method is called as soon as widgets are created. It copies properties passed in the constructor to the widget and also copies some default property values.  
  
param **options** Object. A dictionary of options for the widget to be initilized with.
**/
/**###Interface.Widget.refresh : method  
Tell the widget to redraw itself. This method adds the widget to the shouldDraw array of the parent panel.
**/
/**###Interface.Widget.setValue : method  
Programmatically change the value of the widget. You can optionally not have the widget redraw itself when calling this method.  
  
param **value** Number or String. The new value for the widget.  
param **doNotDraw** Optional, default false. Whether or not the widget should redraw itself.
**/
/**###Interface.Widget.hitTest : method  
Given an HTML touch or mouse event, determine if the event overlaps a graphical widget.  
  
param **event** HTMLEvent. The touch or mouse event to check
**/
/**###Interface.Widget.hitTest : method  
Given an HTML touch or mouse event, determine if the event overlaps a graphical widget.  
  
param **event** HTMLEvent. The touch or mouse event to check
**/
/**###Interface.Widget.draw : method  
Tell the widget to draw itself. This method must be overridden by every graphical widget.
**/
/**###Interface.Widget.mouseEvent : method  
The default mouse event handler for the widget. This method also calls any user defined mouse event handlers. This method should probably never be called manually, but you might want to override it.
  
param **event** HTMLEvent. The mouse event to process
**/
/**###Interface.Widget.mouseEvent : method  
The default touch event handler for the widget. This method also calls any user defined touch event handlers. This method should probably never be called manually, but you might want to override it.
  
param **event** HTMLEvent. The touch event to process
**/
/**###Interface.Widget.sendTargetMessage : method  
If the widget has a target and key property, set the key property or call the key method on the target using the widgets current value.
**/
/**###Interface.Widget._background : method  
returns Color. If the widget has a background color specified, return that, otherwise return the background color of the widget's parent panel.
**/
/**###Interface.Widget._stroke : method  
returns Color. If the widget has a stroke color specified, return that, otherwise return the stroke color of the widget's parent panel.
**/
/**###Interface.Widget._fill : method  
returns Color. If the widget has a fill color specified, return that, otherwise return the fill color of the widget's parent panel.
**/

/**###Interface.Widget._x : method  
returns Number. Return the widget's x position as a pixel value relative to the position of the panel. Note that this method will always return the pixel value, even if the panel uses relative values to determine sizes and positions.
**/
/**###Interface.Widget._y : method  
returns Number. Return the widget's y position as a pixel value relative to the position of the panel. Note that this method will always return the pixel value, even if the panel uses relative values to determine sizes and positions.
**/
/**###Interface.Widget._width : method  
returns Number. Return the widget's width. Note that this method will always return a size in pixels, even if the panel uses relative values to determine sizes and positions.
**/
/**###Interface.Widget._height : method  
returns Number. Return the widget's height. Note that this method will always return a size in pixels, even if the panel uses relative values to determine sizes and positions.
**/
var __widgetCount = 0;
var widgetDefaults = {
  hasFocus      : false,
  requiresFocus : true,
  min           : 0,
  max           : 1,
  value         : 0,
  lastValue     : null,
  name          : null,
  events : {
    ontouchstart  : null,
    ontouchmove   : null,
    ontouchend    : null,
    onmousedown   : null,
    onmousemove   : null,
    onmouseup     : null,
    ontouchmousedown : null,
    ontouchmousemove : null,    
    ontouchmouseup : null,    
    onvaluechange : null,
    onboundschange : null,  
  },
}
Interface.Widget = {
  init : function( options ) {
    this.added = false;
    Interface.extend( this, widgetDefaults);
    if( typeof options === 'undefined' ) options = {}
    
    this.name = options.name || this.type + "_" + __widgetCount++;
    this.target = "OSC";
    this.key = "/" + this.name;   
    
    Interface.extend( this, options);
        
    if(this.bounds) {
      this.x = options.bounds[0];
      this.y = options.bounds[1];
      this.width  = options.bounds[2];
      this.height = options.bounds[3];
    }
      
    if(this.colors) {
      this.background = options.colors[0];
      this.fill       = options.colors[1];
      this.stroke     = options.colors[2];                
    }
    
    this.focusedTouches = [];
    
    if(this.value) this.setValue(this.value, true);
    
    var bounds = this.bounds || [this.x, this.y, this.width, this.height],
        x = this.x, y = this.y, width = this.width, height = this.height, value = this.value;
    
    Object.defineProperties(this, {
      bounds : {
        configurable: true,
        get : function() { return bounds; },
        set : function(_bounds) { 
          bounds = _bounds; this.x = bounds[0]; this.y = bounds[1]; this.width = bounds[2]; this.height = bounds[3]; 
          if( this.onboundschange ) this.onboundschange()
        }
      },
      x : {
        configurable: true,        
        get : function() { return x; },
        set : function(val) { this.clear(); x = val; if( this.onboundschange ) this.onboundschange(); this.refresh(); },
      },
      y : {
        configurable: true,        
        get : function() { return y; },
        set : function(val) { this.clear(); y = val; if( this.onboundschange ) this.onboundschange(); this.refresh(); },
      },
      width : {
        configurable: true,        
        get : function() { return width; },
        set : function(val) { this.clear(); width = val; if( this.onboundschange ) this.onboundschange(); this.refresh(); },
      },
      height : {
        configurable: true,        
        get : function() { return height; },
        set : function(val) { this.clear(); height = val; if( this.onboundschange ) this.onboundschange(); this.refresh(); },
      },
      /*value : {
        configurable: true,        
        get : function() { return value; },
        set : function(val) { if(value !== val) { value = val; this.refresh(); } },
      },*/        
    });
    
    Interface.widgets.push( this );
  },
  
  clear : function() {
    if( this.panel ) { // must check in case widget is Acc or Gyro
      this.panel.ctx.clearRect( this._x(), this._y(), this._width(), this._height() );
    }
  },
  
  refresh : function() {
    if(this.panel && this.panel.shouldDraw.indexOf(this) === -1) {
      this.panel.shouldDraw.push(this);
    }
  },
  
  setValue : function(value, doNotDraw) {
    var r = this.max - this.min,
        v = value;
        
    this.value = value;
                
    if(this.min !== 0 || this.max !== 1) {
      v -= this.min;
      this._value = v / r;
    }else{
      this._value = this.value;
    }
    
    if(!doNotDraw) this.refresh();
  },
  
  hitTest : function(e) {
    if(e.x >= this._x() && e.x <= this._x() + this._width()) {
    	if(e.y >= this._y() && e.y <= this._y() + this._height()) {  
    		return true;
    	} 
    }
    
    return false;
  },
  
  mouseEvent : function(e) { 
    var isHit = this.hitTest(e);
    var touchMouseName = convertMouseEvent(e.type);
    
    if(isHit || this.hasFocus || !this.requiresFocus) {
      if(e.type === 'mousedown') this.hasFocus = true;
      
      if(this[e.type]) this[e.type](e, isHit);  // normal event
      
      if(this['on'+e.type]) this['on'+e.type](e, isHit); // user defined event
      if(this['on'+touchMouseName]) this['on'+touchMouseName](e, isHit);  // user defined event
    }
    if(e.type === 'mouseup') this.hasFocus = false;
  },
  
  touchEvent : function(touch) {  // event type is stored in touch by Panel
    var isHit = this.hitTest(touch);
    var touchMouseName = convertTouchEvent(touch.type);
    if(isHit || this.hasFocus || !this.requiresFocus) {
      if(touch.type === 'touchstart') {
        this.focusedTouches.push(touch);
        this.hasFocus = true;
      }
      if(this[touch.type])
        this[touch.type](touch, isHit);  // normal event
      
      if(this['on'+touch.type]) this['on'+touch.type](touch, isHit);          // user defined event
      if(this['on'+touchMouseName]) this['on'+touchMouseName](touch, isHit);  // user defined event
    }
    if(touch.type === 'touchend') {
      for(var i = 0; i < this.focusedTouches.length; i++) {
        if(this.focusedTouches[i].id === touch.id) {
          this.focusedTouches.splice(i, 1);
          if(this.focusedTouches.length === 0) this.hasFocus = false;
          break;
        }
      }
    }
  },
  
  draw : function() {},
  
  sendTargetMessage : function() {
    if(this.target && this.key) {
      if(this.target === "OSC") {
        if(Interface.OSC) {
          if(typeof this.values === 'undefined') {
            var tt = typeof this.value === 'string' ? 's' : 'f';
            Interface.OSC.send(this.key, tt, [ this.value ] );
          }else{
            if(typeof this.sendValues === 'undefined') {
              var tt = '';
              for(var i = 0; i < this.values.length; i++) {
                tt += typeof this.value === 'string' ? 's' : 'f';
              }
              Interface.OSC.send( this.key, tt, this.values );
            }else{
              this.sendValues();
            }
          }
        }
      }else if(this.target === "MIDI") {
        if(Interface.MIDI && typeof this.values === 'undefined') {
          Interface.MIDI.send( this.key[0],this.key[1],this.key[2], this.value )
        }
      }else{
        if(typeof this.target[this.key] === 'function') {
          this.target[this.key]( this.values || this.value );
        }else{
          this.target[this.key] = this.values || this.value;
        }
      }
    }  
  },
  
  _background : function() { return this.background || this.panel.childBackground; },
  _stroke : function() { return this.stroke || this.panel.childStroke; },
  _fill : function() { return this.fill || this.panel.childFill; },
  
  _x : function() { return this.panel.useRelativeSizesAndPositions ? Math.floor(this.x * this.panel.width)  : this.x; },
  _y : function() { return this.panel.useRelativeSizesAndPositions ? Math.floor(this.y * this.panel.height) : this.y; },
  _width  : function() { return this.panel.useRelativeSizesAndPositions ? Math.floor(this.width * this.panel.width)  : this.width; },
  _height : function() { return this.panel.useRelativeSizesAndPositions ? Math.floor(this.height * this.panel.height) : this.height; },
  
  _font : function() { 
    var font = this.font || this.panel.font;

    return font;
  },
  label:null,
  
  _serializeMe : [
    "background", "stroke", "fill", "x", "y", "width", "height", "value",
    "label", "onmousedown", "onmousemove", "onmouseup", "ontouchmousedown", "ontouchmousemove", "ontouchmouseup",
    "ontouchstart", "ontouchmove", "ontouchend", "onvaluechange", "name", "type", "target", "key"
  ],
};


Interface.HBox = function() {
  var me = this
  Interface.extend(this, {
    type : 'HBox',    
    
    children: [],
    proxyPanel : { active:true, x:0, y:0, width:1, height:1, shouldDraw:[], useRelativeSizesAndPositions:true }, // needed for absolute widths / heights which are set in _init call
    
    add: function() {
      for( var i = 0; i < arguments.length; i++ ) {
        var child = arguments[ i ]
        if( this.children.indexOf( child ) === -1 ) this.children.push( child )
        child.panel = this.proxyPanel
        child.ctx = this.panel.ctx
      }
      
      this.layout()
      this.draw()
    },
    
    layout : function() {
      var w = (this.width / this.children.length) / this.width,
          _widthUsed = 0;
      
      for( var i = 0; i < this.children.length; i++ ) {
        var child = this.children[ i ]
        
        child.x = _widthUsed + this.x
        child.y = this.y * (1 / this.height)
        
        child.width = w 
        child.height = 1
        
        _widthUsed += w
      }
      return this
    },
    
    draw: function() {
      this.proxyPanel.width = this._width()
      this.proxyPanel.height = this._height()
      
      for( var i = 0; i < this.children.length; i++ ) {
        this.children[ i ].draw()
      }
    },
    
    refresh: function() {      
      for( var i = 0; i < this.proxyPanel.shouldDraw.length; i++ ) {
        this.proxyPanel.shouldDraw[ i ].draw()
      }
      this.proxyPanel.shouldDraw.length = 0
    },
    
    mouseEvent: function(e){
      // e.x -= this._x()
      // e.y -= this._y()
      for( var i = 0; i < this.children.length; i++ ) { 
        var child = this.children[ i ]
        
        this.children[ i ].mouseEvent( e ) 
      } 
    },
    
    touchEvent: function(e){
      // e.x -= this._x()
      // e.y -= this._y()
      for( var i = 0; i < this.children.length; i++ ) { 
        var child = this.children[ i ]
        
        this.children[ i ].touchEvent( e ) 
      } 
    },

    _init: function() {
      this.useRelativeSizesAndPositions = this.panel.useRelativeSizesAndPositions
      this.proxyPanel.width = this._width()
      this.proxyPanel.height = this._height()
      this.proxyPanel.__proto__ = this.panel
      
      $.subscribe('/draw', this.refresh.bind( this ) )
      
      Object.defineProperties(this, {
        bounds : {
          configurable: true,
          get : function() { return bounds; },
          set : function(_bounds) { 
            bounds = _bounds; this.x = bounds[0]; this.y = bounds[1]; this.width = bounds[2]; this.height = bounds[3]; 
            this.layout()
            this.draw()
          }
        },
      })
    }
  })
  .init( arguments[0] )
};
Interface.HBox.prototype = Interface.Widget;

Interface.VBox = function() {
  Interface.extend(this, {
    type : 'VBox',    
    
    children: [],
    proxyPanel : { active:true, x:0, y:0, width:1, height:1, shouldDraw:[], useRelativeSizesAndPositions:true }, // needed for absolute widths / heights which are set in _init call
    
    add: function() {
      for( var i = 0; i < arguments.length; i++ ) {
        var child = arguments[ i ]
        this.children.push( child )
        child.panel = this.proxyPanel
        child.ctx = this.panel.ctx
      }
      
      this.layout()
      this.draw()
    },
    
    layout : function() {
      var h = this.height  / this.children.length,
          _heightUsed = 0;
      
      for( var i = 0; i < this.children.length; i++ ) {
        var child = this.children[ i ]
        
        child.x = this.x
        child.y = (this.y + _heightUsed ) * (1 / this.height)
        //
        child.width = 1
        child.height = h * ( 1/this.height)
        
        _heightUsed += h
      }
      
      return this
    },
    
    draw: function() {
      this.proxyPanel.width = this._width()
      this.proxyPanel.height = this._height()
      
      for( var i = 0; i < this.children.length; i++ ) {
        this.children[ i ].draw()
      }
    },
    
    refresh: function() {      
      for( var i = 0; i < this.proxyPanel.shouldDraw.length; i++ ) {
        this.proxyPanel.shouldDraw[ i ].draw()
      }
      this.proxyPanel.shouldDraw.length = 0
    },
    
    mouseEvent: function(e){
      // e.x -= this._x()
      // e.y -= this._y()
      for( var i = 0; i < this.children.length; i++ ) { 
        var child = this.children[ i ]
        
        this.children[ i ].mouseEvent( e ) 
      } 
    },
    
    touchEvent: function(e){
      e.x -= this._x()
      e.y -= this._y()
      for( var i = 0; i < this.children.length; i++ ) { 
        var child = this.children[ i ]
        
        this.children[ i ].touchEvent( e ) 
      } 
    },

    _init: function() {
      this.useRelativeSizesAndPositions = this.panel.useRelativeSizesAndPositions
      this.proxyPanel.width = this._width()
      this.proxyPanel.height = this._height()
      this.proxyPanel.__proto__ = this.panel
      
      $.subscribe('/draw', this.refresh.bind( this ) )
      
      Object.defineProperties(this, {
        bounds : {
          configurable: true,
          get : function() { return bounds; },
          set : function(_bounds) { 
            bounds = _bounds; this.x = bounds[0]; this.y = bounds[1]; this.width = bounds[2]; this.height = bounds[3]; 
            this.layout()
            this.draw()
          }
        },
      })
    }
  })
  .init( arguments[0] )
};
Interface.VBox.prototype = Interface.Widget;


/**#Interface.Slider - Widget
A vertical or horizontal slider.

## Example Usage##
`a = new Interface.Slider({ bounds:[0,0,1,.2], isVertical:false });  
panel = new Interface.Panel();
panel.add(a);
`  
## Constructor   
**param** *properties*: Object. A dictionary of property values (see below) to set for the slider on initialization.
- - - -
**/
/**###Interface.Slider.isVertical : property
Boolean. Whether or not the slider draws itself vertically or horizontally. Note this does not affect the boundaries of the slider, just the orientation of the slider's movement.
**/

Interface.Slider = function() {
  Interface.extend(this, {
    type : 'Slider',
    isVertical : true,
    serializeMe : ["isVertical"],
    
    draw : function() {
      var x = this._x(),
          y = this._y(),
          width = this._width(),
          height= this._height();
          
      this.ctx.fillStyle = this._background();
      this.ctx.fillRect( x, y, width, height );
      
      this.ctx.fillStyle = this._fill();
      
      if(this.isVertical) {
        this.ctx.fillRect( x, y + height - this._value * height, width, this._value * height);
      }else{
        this.ctx.fillRect( x, y, width * this._value, height);
      }
      
      if(this.label) {
        this.ctx.fillStyle = this._stroke();
        this.ctx.textBaseline = 'middle';
        this.ctx.textAlign = 'center';
        this.ctx.font = this._font();
        this.ctx.fillText(this.label, x + width / 2, y + height / 2);
      }
      
      this.ctx.strokeStyle = this._stroke();
      this.ctx.strokeRect( x, y, width, height );      
    },
    
    changeValue : function( xOffset, yOffset ) {
      if(this.hasFocus || !this.requiresFocus) {
        
        this._value = this.isVertical ? 1 - (yOffset / this._height()) : xOffset / this._width();
        
        if(this._value < 0) {
          this._value = 0;
          // this.hasFocus = false;
        }else if(this._value > 1) {
          this._value = 1;
          // this.hasFocus = false;
        }
        
        this.value = this.min + (this.max - this.min) * this._value;
        
        if(this.value !== this.lastValue) {
          this.sendTargetMessage();
          if(this.onvaluechange) this.onvaluechange();
          this.refresh();
          this.lastValue = this.value;
        }
      }     
    },
    
    mousedown : function(e, hit) { if(hit && Interface.mouseDown) this.changeValue( e.x - this._x(), e.y - this._y() ); },
    mousemove : function(e, hit) { if(hit && Interface.mouseDown) this.changeValue( e.x - this._x(), e.y - this._y() ); },
    mouseup   : function(e, hit) { if(hit && Interface.mouseDown) this.changeValue( e.x - this._x(), e.y - this._y() ); },    
    
    touchstart : function(e, hit) { if(hit) this.changeValue( e.x - this._x(), e.y - this._y() ); },
    touchmove  : function(e, hit) { if(hit) this.changeValue( e.x - this._x(), e.y - this._y() ); },
    touchend   : function(e, hit) { if(hit) this.changeValue( e.x - this._x(), e.y - this._y() ); },  
  })
  .init( arguments[0] );
};
Interface.Slider.prototype = Interface.Widget;

/**#Interface.Crossfader - Widget
A horizontal crossfader.

## Example Usage##
`a = new Interface.Crossfader({ bounds:[0,0,1,.2], crossfaderWidth:20 });  
panel = new Interface.Panel();
panel.add(a);
`  
## Constructor   
**param** *properties*: Object. A dictionary of property values (see below) to set for the crossfader on initialization.
- - - -
**/
/**###Interface.Crossfader.crossfaderWidth : property
Boolean. The width of the rectangle indicating the current position of the crossfader, in pixel values. TODO: use relative values when used by the panel.
**/
Interface.Crossfader = function() {
  Interface.extend(this, {
    type : 'Crossfader',    
    crossfaderWidth: 30,
    serializeMe : ["crossfaderWidth"],
    
    _value : .5,
    
    draw : function() {
      var x = this._x(),
          y = this._y(),
          width = this._width(),
          height= this._height();
          
      this.ctx.fillStyle = this._background();
      this.ctx.fillRect( x, y, width, height );
      
      this.ctx.fillStyle = this._fill();
      this.ctx.fillRect( x + (width - this.crossfaderWidth) * this._value, y, this.crossfaderWidth, height);
      
      this.ctx.strokeStyle = this._stroke();
      this.ctx.strokeRect( x, y, width, height );
    },
    
    changeValue : function( xOffset, yOffset ) {
      if(this.hasFocus || !this.requiresFocus) {
        this._value = xOffset / this._width();
        
        if(this._value < 0) {
          this._value = 0;
          //this.hasFocus = false;
        }else if(this._value > 1) {
          this._value = 1;
          //this.hasFocus = false;
        }
        
        this.value = this.min + (this.max - this.min) * this._value;
                
        if(this.value !== this.lastValue) {
          this.sendTargetMessage();
          if(this.onvaluechange) this.onvaluechange();
          this.refresh();
          this.lastValue = this.value;
        }
      }     
    },
    
    mousedown : function(e) { this.changeValue( e.x - this._x(), e.y - this._y() ); },
    mousemove : function(e) { this.changeValue( e.x - this._x(), e.y - this._y() ); },
    mouseup   : function(e) { this.changeValue( e.x - this._x(), e.y - this._y() ); },
    
    touchstart : function(e, hit) { if(hit) this.changeValue( e.x - this._x(), e.y - this._y() ); },
    touchmove  : function(e, hit) { if(hit) this.changeValue( e.x - this._x(), e.y - this._y() ); },
    touchend   : function(e, hit) { if(hit) this.changeValue( e.x - this._x(), e.y - this._y() ); },
  })
  .init( arguments[0] );
};
Interface.Crossfader.prototype = Interface.Widget;

/**#Interface.Button - Widget
A button with a variety of on/off modes

## Example Usage##
`a = new Interface.Button({ bounds:[0,0,.25,.25], mode:'contact', label:'test' });  
panel = new Interface.Panel();
panel.add(a);
`  
## Constructor   
**param** *properties*: Object. A dictionary of property values (see below) to set for the button on initialization.
- - - -
**/
/**###Interface.Button.mode : property
String. Can be 'toggle', 'momentary' or 'contact'. In toggle mode, the button turns on when it is pressed and off when it is pressed again. In momentary mode, the button turns on when pressed and off when released. In contact mode, the button briefly flashes when pressed and sends its value.
**/
/**###Interface.Button.label : property
String. A text label to print in the center of the button.
**/
Interface.Button = function() {
  Interface.extend(this, {
    type : 'Button',    
    _value: 0,
    serializeMe : ["mode", "label"],
    
    mode : 'toggle',
    isMouseOver : false,
    isTouchOver : false,
    label : null,
    requiresFocus : false,
    
    draw : function() {
      var x = this._x(),
          y = this._y(),
          width = this._width(),
          height= this._height();
          
      if(this._value) {
        this.ctx.fillStyle = this._fill();
      }else{
        this.ctx.fillStyle = this._background();  
      }
      this.ctx.fillRect( x, y, width, height );
      
      if(this.label !== null) {
        this.ctx.fillStyle = this._stroke();
        this.ctx.textBaseline = 'middle';
        this.ctx.textAlign = 'center';
        this.ctx.font = this._font();
        this.ctx.fillText(this.label, x + width / 2, y + height / 2);
      }
      
      this.ctx.strokeStyle = this._stroke();
      this.ctx.strokeRect( x, y, width, height );      
    },
    
    changeValue : function( xOffset, yOffset ) {
      if(this.hasFocus || !this.requiresFocus) {
        this._value = !this._value;
        
        this.value = this._value ? this.max : this.min;
                
        if(this.value !== this.lastValue || this.mode === 'contact') {
          this.sendTargetMessage();
          if(this.onvaluechange) this.onvaluechange();
          this.draw();
          this.lastValue = this.value;
        }
      }     
    },
    setValue : function(value, doNotDraw) {
      var r = this.max - this.min,
          v = value;
        
      this.value = value;
                
      if(this.min !== 0 || this.max !== 1) {
        v -= this.min;
        this._value = v / r;
      }else{
        this._value = this.value;
      }
      this.lastValue = this.value;
      if(!doNotDraw && this.mode !== 'contact') this.refresh();
    },

    mousedown : function(e, hit) {
      if(hit && Interface.mouseDown) {
        this.isMouseOver = true;
        this.changeValue();
        if(this.mode === 'contact') {
          var self = this;
          setTimeout( function() { self._value = 0; self.draw(); }, 75);
        }
      }
    },
    mousemove : function(e, hit) { 
      if(!this.requiresFocus && hit && Interface.mouseDown && !this.isMouseOver) {
        this.isMouseOver = true;
        if(this.mode !== 'contact') {
          this.changeValue();// e.x - this.x, e.y - this.y ); 
        }else{
          this._value = 1;
          this.draw();
          var self = this;
          setTimeout( function() { self._value = 0; self.draw(); }, 75);
        }
      }else if(!hit && this.isMouseOver) {
        console.log( 'moved off!' )
        this.isMouseOver = false;
      }
    },
    mouseup   : function(e) {
      if(this.mode === 'momentary') {
        this.changeValue();// e.x - this.x, e.y - this.y ); 
        this.isMouseOver = false;
      }
    },
    
    touchstart : function(e, hit) {
      if(hit) {
        this.isTouchOver = true;
        this.changeValue();
        if(this.mode === 'contact') {
          var self = this;
          setTimeout( function() { self._value = 0; self.draw(); }, 75);
        }
      }
    },
    touchmove : function(e, hit) {
      if(!this.requiresFocus && hit && !this.isTouchOver) {
        this.isTouchOver = true;
        if(this.mode !== 'contact') {
          this.changeValue();// e.x - this.x, e.y - this.y );
          
        }else{
          this._value = 1;
          this.draw();
          var self = this;
          setTimeout( function() { self._value = 0; self.draw(); }, 75);
        }
      }else if(!hit && this.isTouchOver) {
        this.isTouchOver = false;
      }
    },
    touchend   : function(e) {
      this.isTouchOver = false;
      if(this.mode === 'momentary')
        this.changeValue();// e.x - this.x, e.y - this.y ); 
    },
  })
  .init( arguments[0] );
};
Interface.Button.prototype = Interface.Widget;


/**#Interface.ButtonV - Widget
A button with a customizable shape and variety of on/off modes

*contributed by Jonathan Simozar

## Example Usage##
`a = new Interface.ButtonV({
  bounds:[.25,0,.125,.8], 
  points: [{x:1,y:0},{x:.5,y:0},{x:.5,y:.5},{x:0,y:.5},{x:0,y:1},{x:1,y:1},{x:1,y:0}],
  mode:'contact',
  label:'test',
  textLocation : {x:.5, y:.75},
});

panel = new Interface.Panel();

panel.add(a);
`
  
## Constructor   
**param** *properties*: Object. A dictionary of property values (see below) to set for the button on initialization.
- - - -
**/
/**###Interface.ButtonV.points : property
Array. A set of coordinates used to customize the button shape. The coordinates are connected in the order of the indices. The first and last point must be the same.
**/

/**###Interface.ButtonV.mode : property
String. Can be 'toggle', 'momentary' or 'contact'. In toggle mode, the button turns on when it is pressed and off when it is pressed again. In momentary mode, the button turns on when pressed and off when released. In contact mode, the button briefly flashes when pressed and sends its value.
**/

/**###Interface.ButtonV.label : property
String. A text label to print at the textLocation coordinates of the button.
**/

/**###Interface.ButtonV.textLocation : property
Set. A set of x and y coordinates which position the the label within the bounds.
**/

Interface.ButtonV = function() {
  Interface.extend(this, {
    type : 'ButtonV',    
    _value: 0,
    serializeMe : ["mode", "label"],
    
    mode : 'toggle',
    isMouseOver : false,
    isTouchOver : false,
    label : null,
    points : [{x : 0, y : 0}, {x : 0, y : 1}, {x : 1,y : 1}, {x : 1, y : 0}, {x : 0, y : 0}],
    textLocation : {x:.5, y:.5},
    
    draw : function() {
      var x = this._x(),
          y = this._y(),
          i = 0,
          width = this._width(),
          height= this._height();

        
          
      if(this._value) {
        this.ctx.fillStyle = this._fill();
      }else{
        this.ctx.fillStyle = this._background();  
      }

      this.ctx.beginPath();
      this.ctx.strokeStyle = this._stroke();

      
      for (i; i < this.points.length; i++) {
        if (i === 0) {
          this.ctx.moveTo(x + this.points[i].x*width, y + this.points[i].y*height);      
        }
        else
          this.ctx.lineTo(x + this.points[i].x*width, y + this.points[i].y*height);  
      }   //this.points[i].x is how to reference points.x
      this.ctx.lineTo(x + this.points[0].x*width, y + this.points[0].y*height);
      this.ctx.closePath();  
      this.ctx.fill();
      this.ctx.stroke();
      
      
      if(this.label !== null) {
        this.ctx.fillStyle = this._stroke();
        this.ctx.textBaseline = 'middle';
        this.ctx.textAlign = 'center';
        this.ctx.font = this._font();
        this.ctx.fillText(this.label, x + width*this.textLocation.x, y + height*this.textLocation.y);
      }
      
    },
    
    changeValue : function( xOffset, yOffset ) {
      if(this.hasFocus || !this.requiresFocus) {
        this._value = !this._value;
        
        this.value = this._value ? this.max : this.min;
                        
        if(this.value !== this.lastValue || this.mode === 'contact') {
          this.sendTargetMessage();
          if(this.onvaluechange) this.onvaluechange();
          this.draw();
          this.lastValue = this.value;
        }
      }     
    },

    hitTest : function(e) {
      var w = this._width(),
          h = this._height(),
          x = this._x(),
          y = this._y();
      if(e.x >= x && e.x <= x + w) {
        if(e.y >= y && e.y <= y + h) {
        var i = 0,
            p = this.points,
            sides = 0;

        for (i; i < p.length - 1; i++) {
          if(p[i+1].x > p[i].x) {
            if((p[i].x * w + x) <= e.x && e.x < (p[i+1].x * w + x)) {
              var yval = (p[i+1].y - p[i].y)/(p[i+1].x - p[i].x) * h/w * (e.x - p[i].x * w + x) + p[i].y * h + y;
              if(yval - e.y < 0)
                sides++;
            }
          }
          else if (p[i+1].x < p[i].x) {
            if(p[i].x * w + x >= e.x && e.x > p[i+1].x * w + x) {
              var yval = (p[i+1].y - p[i].y)/(p[i+1].x - p[i].x) * h/w * (e.x - p[i].x * w + x) + p[i].y * h + y;
              if(yval - e.y < 0)
                sides++;
            }
          }
        }
        if (sides % 2 == 1)
          return true;
      }
    }
    return false;
  },
  

    setValue : function(value, doNotDraw) {
      var r = this.max - this.min,
          v = value;
        
      this.value = value;
                
      if(this.min !== 0 || this.max !== 1) {
        v -= this.min;
        this._value = v / r;
      }else{
        this._value = this.value;
      }
      this.lastValue = this.value;
      if(!doNotDraw && this.mode !== 'contact') this.refresh();
    },

    mousedown : function(e, hit) {
      if(hit && Interface.mouseDown) {
        this.isMouseOver = true;
        this.changeValue();
        if(this.mode === 'contact') {
          var self = this;
          setTimeout( function() { self._value = 0; self.draw(); }, 75);
        }
      }
    },
     mousemove : function(e, hit) { 
      if(!this.requiresFocus && hit && Interface.mouseDown && !this.isMouseOver) {
        this.isMouseOver = true;
        if(this.mode !== 'contact') {
          this.changeValue();// e.x - this.x, e.y - this.y ); 
        }else{
          this._value = 1;
          this.draw();
          var self = this;
          setTimeout( function() { self._value = 0; self.draw(); }, 75);
        }
      }else if(!hit && this.isMouseOver) {
        this.isMouseOver = false;
        if(this.mode !== 'contact') {
          this.changeValue();// e.x - this.x, e.y - this.y ); 
        }else{
          this._value = 1;
          this.draw();
          var self = this;
          setTimeout( function() { self._value = 0; self.draw(); }, 75);
        }
      }
    },
    mouseup   : function(e) {
      if(this.mode === 'momentary') {
        if( this.requiresFocus || ( !this.requiresFocus && this.isMouseOver) ) {
          this.isMouseOver = false;
          this.changeValue();
        }
      }
    },
    
    touchstart : function(e, hit) {
      if(hit) {
        this.isTouchOver = true;
        this.changeValue();
        if(this.mode === 'contact') {
          var self = this;
          setTimeout( function() { self._value = 0; self.draw(); }, 75);
        }
      }
    },
    touchmove : function(e, hit) {
      if(!this.requiresFocus && hit && !this.isTouchOver) {
        this.isTouchOver = true;
        if(this.mode !== 'contact') {
          this.changeValue();// e.x - this.x, e.y - this.y );
        }else{
          this._value = 1;
          this.draw();
          var self = this;
          setTimeout( function() { self._value = 0; self.draw(); }, 75);
        }
      }else if(!hit && this.isTouchOver) {
        this.isTouchOver = false;
        if(this.mode !== 'contact') {
          this.changeValue();// e.x - this.x, e.y - this.y );
        }else{
          this._value = 1;
          this.draw();
          var self = this;
          setTimeout( function() { self._value = 0; self.draw(); }, 75);
        }
      }else if(!hit && this.isTouchOver) {
        this.isTouchOver = false;
      }
    },
    touchend   : function(e) {
      if( this.momentary && this.requiresFocus || ( !this.requiresFocus && this.isTouchOver) ) {
        this.changeValue();
      }
      this.isTouchOver = false;
    },
  })
  .init( arguments[0] );
};
Interface.ButtonV.prototype = Interface.Widget;


/**#Interface.Piano - Widget
A piano with adjustable ranges of pitches 

*contributed by Jonathan Simozar, with modifications by thecharlie

## Example Usage##
`var c = new Interface.Piano({ 
  bounds:[0,0,.8,.5],  
  startletter : "C",
   startoctave : 3,
   endletter : "C",
   endoctave : 5,
   noteLabels : true, 
   target: synth,
   onvaluechange : function() {this.target.note (this.frequency, this.value)},
});
panel = new Interface.Panel();
panel.add(a);
`
  
## Constructor   
**param** *properties*: Object. A dictionary of property values (see below) to set for the piano on initialization.
- - - -
**/


/**###Interface.Piano.onvaluechange : method
The event handler fired whenever a piano update is received. Used to fire the the event handler for when a button update is recieved.
**/


/**###Interface.Piano.endoctave : property
Number. A number corresponding to the ending octave of the last note in the desired range.
**/

/**###Interface.Piano.startletter : property
String. A letter corresponding to the starting pitch for the desired range. To start on an accidental use sharps, not flats. For example, C#.
**/

/**###Interface.Piano.startoctave : property
Number. A number corresponding to the starting octave of the first note in the desired range.
**/

/**###Interface.Piano.endletter : property
String. A letter corresponding to the ending pitch for the desired range. To end on an accidental use sharps, not flats. For example, C#.
**/

/**###Interface.Piano.endoctave : property
Number. A number corresponding to the ending octave of the last note in the desired range.
**/

/**###Interface.Piano.noteLabels : property
Boolean. A boolean corresponding to showing the note labels when true and hiding the note labels when false.
**/

/**###Interface.Piano.target : property
Object. The instrument used to make sound on each key.
**/



Interface.Piano = function() {
  Interface.extend(this, {
    type : 'Piano',     
    _value: 0,
    serializeMe : ['mode', 'label'],
    mode : 'toggle',
    isMouseOver : false,
    isTouchOver : false,
    label : null,
    startletter : 'C',
    startoctave : 3,
    endletter : 'C',
    endoctave : 5,
    target : null,
    noteLabels : false,
    _initialized : false,
    keyMap: [ 'Z','S','X','D','C','V','G','B','H','N','J','M',','],
    children: [],
    play: function( noteNum, duration ) {
      if( isNaN(duration) ) { 
        duration = 4410
      }
      if( typeof Gibber !== 'undefined' ) { duration = Gibber.Clock.time( duration ) }
      
      var child = this.children[ noteNum ]
      if( child ) {
        child.changeValue()
        future( function() { if( child._value == 1 ) child.changeValue() }, duration )
      } 
    },
    onkeyup: function( e ) { 
      var c = Interface.keyCodeToChar[ e.keyCode ],
          keyNum = this.keyMap.indexOf( c ),
          child = this.children[ keyNum ]
            
      if( typeof child !== 'undefined' && child._value == 1 ) {
        child.changeValue() 
      }
    },
    onkeydown: function( e ) {
      var c = Interface.keyCodeToChar[ e.keyCode ],
          keyNum = this.keyMap.indexOf( c ),
          child = this.children[ keyNum ]
      
      if( typeof child !== 'undefined' && child._value == 0 ) {
        child.changeValue()
      }
    },
    onvaluechange : function() { this.values = [this.frequency,this.value] },
    onboundschange: function() { if( this._initialized) this.placeKeys() },
    
    draw : function() {
      for( var i = 0; i < this.children.length; i++ ) { this.children[i].refresh() }
      return this
    },

    placeKeys: function() {
      var x = this._x(),
          y = this._y(),
          width = this._width(),
          height = this._height(),
          octave = this.startoctave,
          startnote = 0,
          endnote = 0,
          keylabel = ["0","C","C#/Db","D","D#/Eb","E","F","F#/Gb","G","G#/Ab","A","A#/Bb","B"],
          keyid = ["0","C","C#","D","D#","E","F","F#","G","G#","A","A#","B"],
          keynid = [0,  1,  2,  2, 3,  3,  4, 5,  5, 6,  6, 7,  7],
          notes = ( endnote + this.endoctave * 12) - (startnote + this.startoctave * 12) + 1,
          dist = ( keynid[ endnote ] + this.endoctave * 7 ) - ( keynid[ startnote ] + this.startoctave * 7 ) + 1,
          j = 0;
          
      if( this._initialized ) {
        this.clear()
        for( var i = this.children.length - 1; i >= 0; i-- ) {
          var key = this.children.pop()
          this.panel.remove( key )
        }
      }
          
      for (var i = 1; i < 13; i++) {
        if ( this.startletter === keyid[ i ] )  startnote = i;
        if ( this.endletter === keyid[ i ] )    endnote = i;
      }

      if ( [ 2,4,7,9,11 ].indexOf( endnote ) > -1 ) dist--;
      
      for (var i = 0; i < notes - 1; i++ ) {
        var points, textLocation, bg, fg, bounds, label
        
        switch( startnote ) {
          case 1:
            points = [{x:0,y:0},{x:.6,y:0},{x:.6,y:.625},{x:1,y:.625},{x:1,y:1},{x:0,y:1},{x:0,y:0}] // left
            bg = this._fill()
            textLocation = { x:.5, y:.75 }
            fg = this._background()
            bounds = [ j/dist*this.width + this.x, this.y, this.width/dist, this.height ]
            label = this.noteLabels ? keylabel[startnote] + octave : null
            break;
          case 2:
            points = [{x:.1,y:0},{x:.7,y:0},{x:.7,y:1},{x:.1,y:1},{x:.1,y:0}] //black
            textLocation = { x:.3925, y:.5 }
            bg = this._background()
            fg = this._fill()
            bounds = [(j-.5)/dist *this.width + this.x, this.y,this.width/dist,.625*this.height]
            label = this.noteLabels ? keylabel[startnote] : null
            break;
          case 3:
            points = [{x:.2,y:0},{x:.8,y:0},{x:.8,y:.625},{x:1,y:.625},{x:1,y:1},{x:0,y:1},{x:0,y:.625},{x:.2,y:.625},{x:.2,y:0}] // mid
            textLocation = { x:.5, y:.75 }
            bg = this._fill()
            fg = this._background()
            bounds = [j/dist*this.width + this.x,this.y,this.width/dist,this.height]
            label = this.noteLabels ? keylabel[startnote] : null
            break;
          case 4:
            points = [{x:.3,y:0},{x:.9,y:0},{x:.9,y:1},{x:.3,y:1},{x:.3,y:0}], //black
            textLocation = {x:.6075, y:.5}
            bg = this._background()
            fg = this._fill()
            bounds = [(j-.5)/dist *this.width + this.x, this.y,this.width/dist,.625*this.height]
            label = this.noteLabels ? keylabel[startnote] : null
            break;
          case 5:
            points = [{x:1,y:0},{x:.4,y:0},{x:.4,y:.625},{x:0,y:.625},{x:0,y:1},{x:1,y:1},{x:1,y:0}] //right
            textLocation = {x:.5, y:.75}
            bg = this._fill()
            fg = this._background()
            bounds = [j/dist*this.width+ this.x,this.y,this.width/dist,this.height]
            label = this.noteLabels ? keylabel[startnote] : null
            break;
          case 6:
            points = [{x:0,y:0},{x:0.57142857,y:0},{x:0.57142857,y:.625},{x:1,y:.625},{x:1,y:1},{x:0,y:1},{x:0,y:0}] //left
            textLocation = {x:.5, y:.75}
            bg = this._fill()
            fg = this._background()
            bounds = [j/dist*this.width+ this.x,this.y,this.width/dist,this.height]
            label = this.noteLabels ? keylabel[startnote] : null
            break;
          case 7:
            points = [{x:0.07142857,y:0},{x:0.64285714,y:0},{x:0.64285714,y:1},{x:0.07142857,y:1},{x:0.07142857,y:0}] //black
            textLocation = {x:.3925, y:.5}
            bg = this._background()
            fg = this._fill()
            bounds = [(j-.5)/dist*this.width + this.x, this.y,this.width/dist,.625*this.height]
            label = this.noteLabels ? keylabel[startnote] : null
            break;
          case 8:
            points = [{x:0.14285714,y:0},{x:0.71428571,y:0},{x:0.71428571,y:.625},{x:1,y:.625},{x:1,y:1},{x:0,y:1},{x:0,y:.625},{x:0.14285714,y:.625},{x:0.14285714,y:0}], //middle
            textLocation = {x:.5, y:.75}
            bg = this._fill()
            fg = this._background()
            bounds = [j/dist*this.width + this.x,this.y,this.width/dist,this.height]
            label = this.noteLabels ? keylabel[startnote] : null
            break; 
          case 9:
            points = [{x:0.21428571,y:0},{x:0.78571428,y:0},{x:0.78571428,y:1},{x:0.21428571,y:1},{x:0.21428571,y:0}] //black
            bg = this._background()
            fg = this._fill()
            bounds = [(j-.5)/dist*this.width + this.x, this.y,this.width/dist,.625*this.height]
            label = this.noteLabels ? keylabel[startnote] : null
            break;
          case 10:
            points = [{x:0.28571428,y:0},{x:0.85714285,y:0},{x:0.85714285,y:.625},{x:1,y:.625},{x:1,y:1},{x:0,y:1},{x:0,y:.625},{x:0.28571428,y:.625},{x:0.28571428,y:0}], //middle
            bg = this._fill()
            fg = this._background()
            textLocation = {x:.5, y:.75}
            bounds = [j/dist*this.width + this.x,this.y,this.width/dist,this.height]  
            label = this.noteLabels ? keylabel[startnote] : null
            break;
          case 11:
            points = [{x:0.35714285,y:0},{x:0.92857142,y:0},{x:0.92857142,y:1},{x:0.35714285,y:1},{x:0.35714285,y:0}], //black
            bg = this._background()
            fg = this._fill()
            textLocation = {x:.6075, y:.5}
            bounds = [(j-.5)/dist*this.width + this.x, this.y,this.width/dist,.625*this.height]
            label = this.noteLabels ? keylabel[startnote] : null
            break; 
          case 12:
            points = [{x:1,y:0},{x:0.42857142,y:0},{x:0.42857142,y:.625},{x:0,y:.625},{x:0,y:1},{x:1,y:1},{x:1,y:0}] //right
            bg = this._fill()
            fg = this._background()
            textLocation = {x:.5, y:.75}
            bounds = [j/dist*this.width+ this.x,this.y,this.width/dist,this.height]
            label = this.noteLabels ? keylabel[startnote] : null
            break;                                                                    
        }
        
        
        var _key = new Interface.ButtonV({ 
          points: points,
          textLocation : textLocation,
          target : this.target,
          onvaluechange: this.onvaluechange,
          frequency: Math.pow(2,(startnote + 12*octave - 49)/12)*261.626,
          background: bg,
          fill: fg,
          stroke: this._stroke(),
          bounds: bounds,
          label: label,
          requiresFocus : false,
          mode:'momentary',
        });
        
        if ( [ 2,4,7,9,11 ].indexOf( startnote ) === -1 ) j++;
        
        this.children.push(_key)
        this.panel.add(_key);

        startnote++;
        
        if (startnote > 12) {
          startnote = 1;
          octave++;
        }
      }
      if (startnote == 2 || startnote == 4 || startnote == 7 || startnote == 9 || startnote == 11)
        var pkeys = new Interface.ButtonV({ 
            points: [{x:.166,y:0},{x:.5,y:0},{x:.5,y:1},{x:.166,y:1},{x:.166,y:0}], //black
              target : this.target,
              onvaluechange: this.onvaluechange,
              background: this._background(),
              frequency: Math.pow(2,(startnote + 12*octave - 49)/12)*261.626,
              bounds:[(j-.5)/dist*this.width + this.x, this.y,this.width/dist,.625*this.height],  
              label: this.noteLabels ? keylabel[startnote] : null,
              stroke: this._stroke(),
              requiresFocus : false,
              mode:'momentary'
            });
      else if (startnote == 1)
        var pkeys = new Interface.ButtonV({ 
              textLocation : {x:.5, y:.75},
              target : this.target,
              onvaluechange: this.onvaluechange,
              frequency: Math.pow(2,(startnote + 12*octave - 49)/12)*261.626,
              background: this._fill(),
              fill: this._background(),
              stroke: this._stroke(),
              bounds:[j/dist*this.width + this.x,this.y,this.width/dist,this.height],  
              label: this.noteLabels ? keylabel[startnote] + octave : null,
              requiresFocus : false,
              mode:'momentary'
            });
      else if (startnote == 4)
        var pkeys = new Interface.ButtonV({ 
              textLocation : {x:.5, y:.75},
              target : this.target,
              onvaluechange: this.onvaluechange,
              frequency: Math.pow(2,(startnote + 12*octave - 49)/12)*261.626,
              background: this._fill(),
              fill: this._background(),
              stroke: this._stroke(),
              bounds:[j/dist*this.width + this.x,this.y,this.width/dist,this.height],  
              label: this.noteLabels ? keylabel[startnote] : null,
              requiresFocus : false,
              mode:'momentary'
            });
      else
        var pkeys = new Interface.ButtonV({ 
              points: [{x:1,y:0},{x:.33,y:0},{x:.33,y:.625},{x:0,y:.625},{x:0,y:1},{x:1,y:1},{x:1,y:0}], //right
              textLocation : {x:.5, y:.75},
              target : this.target,
              onvaluechange: this.onvaluechange,
              frequency: Math.pow(2,(startnote + 12*octave - 49)/12)*261.626,
              background: this._fill(),
              fill: this._background(),
              stroke: this._stroke(),
              bounds:[j/dist*this.width + this.x,this.y,this.width/dist,this.height],  
              label: this.noteLabels ? keylabel[startnote] : null,
              requiresFocus : false,
              mode:'momentary'
            });
            
      this.children.push(pkeys)      
      this.panel.add(pkeys); 
      
      this._initialized = true
    },
    _init : function() {
      this.placeKeys()
    }
  })
  .init( arguments[0] );
};
Interface.Piano.prototype = Interface.Widget;



/**#Interface.Knob - Widget
A virtual knob.

## Example Usage##
`a = new Interface.Knob({ x:.1, y:.1, radius:.3 });  
panel = new Interface.Panel();
panel.add(a);
`  
## Constructor   
**param** *properties*: Object. A dictionary of property values (see below) to set for the knob on initialization.
- - - -
**/
/**###Interface.Knob.radius : property
Number. The size of the Knob.
**/
/**###Interface.Knob.knobBuffer : property
Number. The size of the space in the middle of the knob.
**/
/**###Interface.Knob.centerZero : property
Number. If true, the knob is centered at zero. Useful for panning knobs.
**/
/**###Interface.Knob.usesRotation : property
Number. If true, the knob value is determined by the slope of the touch or mouse event in relation to the knob. When false, the user simply presses the knob and moves their finger/mouse up and down to change its value.
**/

Interface.Knob = function() {  
  Interface.extend(this, {
    type : 'Knob',    
    _value: 0,
    serializeMe : ["usesRotation", "knobBuffer"],
    knobBuffer:3,
    lastPosition: 0,
    usesRotation: true,
    
    draw : function() {
      var x = this._x(),
          y = this._y(),
          width = this._width(),
          height= this._height(),
          radius = width / 2;
          
      this.ctx.clearRect(x, y, radius * 2,radius * 2);
      this.ctx.strokeStyle = this._stroke();

    	this.ctx.fillStyle = this._background(); // draw background of widget first
    
      var angle0 = Math.PI * .6;
      var angle1 = Math.PI * .4;

      this.ctx.beginPath();
      
      this.ctx.arc(x + radius, y + radius, radius - this.knobBuffer, angle0, angle1, false);
      this.ctx.arc(x + radius, y + radius, (radius - this.knobBuffer) * .3 , angle1, angle0, true);		
      this.ctx.closePath();
      this.ctx.fill();
          
      this.ctx.fillStyle = this._fill();	// now draw foreground...

      if(this.centerZero) {
          var angle3 = Math.PI * 1.5;
          var angle4;
          if(this._value >= .5) {
            angle4 = Math.PI * (1.5 + (this._value - .5) * 1.8); // from 1.5 to 2.4
          }else{
            angle4 = Math.PI * (1.5 - ((1 - this._value * 2) * .9)); // from 1.5 to .6 
          }
          if(this._value > Math.PI * 1.8) this._value -= Math.PI * 1.8; // wrap around      
        
          this.ctx.beginPath();
          this.ctx.arc(x + radius, y + radius, radius -  this.knobBuffer, angle3, angle4, (this._value < .5));
          this.ctx.arc(x + radius, y + radius, (radius - this.knobBuffer) * 0.3,  angle4, angle3, (this._value > .5));
          this.ctx.closePath();
          
          // if(this._value > .495 && this._value < .505) { // draw circle if centered?
          //     this.ctx.beginPath();
          //     this.ctx.arc(this.x + radius , this.y + radius, (radius -  this.knobBuffer) * .3, 0, Math.PI*2, true); 
          //     this.ctx.closePath();
          // }
          this.ctx.fill();
      } else {
          if(!this.isInverted)  { 
            var angle2 = Math.PI * .6 + this._value * 1.8  * Math.PI;
            if(angle2 > 2 * Math.PI) angle2 -= 2 * Math.PI;
          }else{
            var angle2 = Math.PI * (0.4 - (1.8 * this._value));
          }
        
          this.ctx.beginPath();
          
          if(!this.isInverted) {
              this.ctx.arc(x + radius, y + radius, radius - this.knobBuffer, angle0, angle2, false);
              this.ctx.arc(x + radius, y + radius, (radius - this.knobBuffer) * .3, angle2, angle0, true);
          } else {
              this.ctx.arc(x + radius, y + radius, radius - this.knobBuffer, angle1, angle2 ,true);
              this.ctx.arc(x + radius, y + radius, (radius - this.knobBuffer) * .3, angle2, angle1, false);
          }
          this.ctx.closePath();
          this.ctx.fill();
      }
      
      this.ctx.beginPath();
      this.ctx.arc(x + radius, y + radius, radius - this.knobBuffer, angle0, angle1, false);
      this.ctx.arc(x + radius, y + radius, (radius - this.knobBuffer) * .3 , angle1, angle0, true);		
      this.ctx.closePath();
      
      this.ctx.stroke();
      
      if(this.label !== null) {
        this.ctx.fillStyle = this._stroke();
        this.ctx.textBaseline = 'middle';
        this.ctx.textAlign = 'center';
        this.ctx.font = this._font();
        this.ctx.fillText(this.label, x + radius, y + radius * 2.25);
      }
    },
    
    setValue : function(value, doNotDraw) {
      var r = this.max - this.min,
          v = value;
      
      this.lastValue = this.value;
      
      this.value = value;
                
      if(this.min !== 0 || this.max !== 1) {
        v -= this.min;
        this._value = v / r;
      }else{
        this._value = this.value;
      }
      
      if(this.value !== this.lastValue) {
        this.sendTargetMessage();
        if(this.onvaluechange) this.onvaluechange();
        this.refresh();
        this.lastValue = this.value;
      }
      
      if(!doNotDraw) this.refresh();
    },
    
    changeValue : function( xOffset, yOffset ) {
      if(this.hasFocus || !this.requiresFocus) {
        var radius = this._width() / 2;
        this.lastValue = this.value;

        if(!this.usesRotation) {
          if (this.lastPosition != -1) { 
            this._value -= (yOffset - this.lastPosition) / (radius * 2);
          }
        }else{
            var xdiff = radius - xOffset;
            var ydiff = radius - yOffset;
            var angle = Math.PI + Math.atan2(ydiff, xdiff);
            this._value =  ((angle + (Math.PI * 1.5)) % (Math.PI * 2)) / (Math.PI * 2);
            
            if(this.lastRotationValue > .8 && this._value < .2) {
              this._value = 1;
            }else if(this.lastRotationValue < .2 && this._value > .8) {
              this._value = 0;
            }
        }

        if (this._value > 1) this._value = 1;
        if (this._value < 0) this._value = 0;

      	this.lastRotationValue = this._value;
        this.lastPosition = yOffset;
      
        var range  = this.max - this.min;
        this.value = this.min + this._value * range;
      
        if(this.value !== this.lastValue) {
          this.sendTargetMessage();
          if(this.onvaluechange) this.onvaluechange();
          this.refresh();
          this.lastValue = this.value;
        }
      }
    },
    
    hitTest : function(e) {
      if( e.x >= this._x() && e.x < this._x() + this._width() ) {
      	if( e.y >= this._y() && e.y < this._y()  + this._width() ) {  
      		return true;
      	} 
      }
    
      return false;
    },
    
    mousedown : function(e) {
      this.lastPosition = e.y - this._y();
      this.changeValue( e.x - this._x(), e.y - this._y() ); 
    },
    mousemove : function(e) { this.changeValue( e.x - this._x(), e.y - this._y() ); },
    mouseup   : function(e) {},
    
    touchstart : function(e) {
      this.lastPosition = e.y - this._y();
      this.changeValue( e.x - this._x(), e.y - this._y() ); 
    },
    touchmove : function(e) { this.changeValue( e.x - this._x(), e.y - this._y() ); },
    touchend   : function(e) {},
    
    _init : function() {
      var width = this.width,
          height = this.height;
      Object.defineProperty(this, 'width', {
        configurable: true,
        get : function() { return width; },
        set : function(_width) { this.clear(); width = height = _width; this.refresh(); }
      });
      Object.defineProperty(this, 'height', {
        configurable: true,
        get : function() { return height; },
        set : function(_height) { height = _height; }
      });
    },
  })
  .init( arguments[0] );
};
Interface.Knob.prototype = Interface.Widget;

function sign(n) {
  if(n < 0) return -1;
  return 1;
}
/**#Interface.XY - Widget
A multitouch XY controller with optional built-in physics.

## Example Usage##
`a = new Interface.XY({ x:0, y:0, numChildren:2 });  
panel = new Interface.Panel();
panel.add(a);
`  
## Constructor   
**param** *properties*: Object. A dictionary of property values (see below) to set for the XY on initialization.
- - - -
**/
/**###Interface.XY.childWidth : property
Number. The size of the children, currently in pixels. TODO: use relative values when the panel is using relative sizes and positions.
**/
/**###Interface.XY.usePhysics : property
Boolean. Wheter or not the physics engine should be turned on.
**/
/**###Interface.XY.friction : property
Number. Default .9. The amount of friction in the physics system. High values mean children will decelerate quicker.
**/
/**###Interface.XY.maxVelocity : property
Number. Default 10. The maximum velocity for each child.
**/
/**###Interface.XY.detectCollisions : property
Boolean. Default true. When true, children bounce off one another.
**/
/**###Interface.XY.values : property
Array. An array of objects taking the form {x,y} that store the x and y positions of every child. So, to get the x position of child #0: myXY.values[0].x
**/
/**###Interface.XY.children : property
Array. An array of objects representing the various children of the widget.
**/
/**###Interface.XY.animate : method
This is called to run the physics engine, draw widgets with updated positions, change values of widgets and call appropriate event handlers.
**/

Interface.XY = function() {
  var self = this,
      posDiff = {x:0, y:0},
      velDiff = {x:0, y:0},
      normal  = {x:0, y:0},
      cDot = 0;
  
  Interface.extend(this, {
    type : 'XY',    
    _value            : 0,
    serializeMe       : ["childWidth", "childHeight", "numChildren", "usePhysics", "values", "friction", "maxVelocity", "detectCollisions", "fps"],
    childWidth        : 25,
    childHeight       : 25,
    children          : [],
    values            : [], // objects containing x and y values
    _values           : [], // serialized floats alternating between x and y
    numChildren       : 1,
    usePhysics        : true,
    friction          : .9,
    activeTouch       : null,
    maxVelocity       : 10,
    detectCollisions  : true,
    touchCount        : 0,
    timer             : null,
    fps               : 30,
    outputInitialValues: true,
    
    rainbow: function() {
      //console.log("RAINBOW", this.children.length);
      for(var i = 0; i < this.children.length; i++) {
        var child = this.children[i];
        child.fill = Interface.XY.colors[i % Interface.XY.colors.length]; //'rgba('+Math.round(Math.random()*255)+','+Math.round(Math.random()*255)+','+Math.round(Math.random()*255)+',.2)';
        //console.log("YUM", child.fill)
      }
      //this.refresh()
    },
    remove: function() { this.stopAnimation(); Interface.widgets.splice( Interface.widgets.indexOf( this ), 1 ); },
    add : function() { if(this.usePhysics) this.startAnimation(); },
    startAnimation : function() { 
      if(this.timer === null) { 
        this.timer = setInterval( function() { self.refresh(); }, (1 / this.fps) * 1000); 
      } 
    },
    stopAnimation : function() { clearInterval(this.timer); this.timer = null; },
    
    animate : function() {
      var x       = this._x(),
          y       = this._y(),
          width   = this._width(),
          height  = this._height(),
          shouldrunvaluechange = false;
          
      for(var i = 0; i < this.children.length; i++) {
        var moveX = moveY = false,
            child = this.children[i];
        
        if(child.x + child.vx < width && child.x + child.vx > 0) {
          child.x += child.vx;
        }else{  
          if(child.x + child.vx >= width && child.vx > 0 ) {
            child.vx *= -1;
          }else if(child.x + child.vx <= 0 && child.vx < 0) {
            child.vx *= -1;
          }else{
            child.x += child.vx;
          }
        }

        if(child.y + child.vy < height && child.y + child.vy > 0) {
          child.y += child.vy;
        }else{
          if(child.y + child.vy >= height && child.vy > 0 ) {
            child.vy *= -1;
          }else if(child.y + child.vy <= 0 && child.vy < 0) {
            child.vy *= -1;
          }else{
            child.y += child.vy;
          }
        }

        child.vx *= this.friction;
        child.vy *= this.friction;
        
        var newValueX = child.x / width;
        var newValueY = child.y / height;
        
        var range = this.max - this.min;
        if(this.values[child.id].x !== newValueX || this.values[child.id].y !== newValueY) {
          this.values[child.id].x = this.min + range * newValueX;
          this.values[child.id].y = this.min + range * newValueY;
          shouldrunvaluechange = true;
        }
        
        if(this.detectCollisions) {
          if(!child.collideFlag) {
            this.collisionTest(child);
          }else{
            child.collideFlag = false;
          }
        }
          
        child.vx = Math.abs(child.vx) > this.maxVelocity ? this.maxVelocity * sign(child.vx) : child.vx;
        child.vy = Math.abs(child.vy) > this.maxVelocity ? this.maxVelocity * sign(child.vy): child.vy;        
      }
      if(shouldrunvaluechange) {
        this.sendTargetMessage();
        
        if(this.onvaluechange) {
          this.onvaluechange();
        }
      }
    },
    
    // MultiXY sends out all child values in serialized xy pairs
    sendValues : function() {
      var tt = '';
      this._values.length = 0;
      for(var i = 0; i < this.values.length; i++) {
        tt += 'ff';
        this._values.push( this.values[i].x );
        this._values.push( this.values[i].y );        
      }
      if(this.target === "OSC") {
        if(Interface.OSC) {
          Interface.OSC.send( this.key, tt, this._values );
        }
      }
    },
    
    collisionTest : function(c1) {
      var cw2 = (this.childWidth * 2) * (this.childWidth * 2);
      for(var i = 0; i < this.children.length; i++) {
        var c2 = this.children[i];
        if(c1.id !== c2.id) {
          var distance = Math.pow(c1.x - c2.x, 2) + Math.pow(c1.y - c2.y, 2);
          
          if(distance < cw2) { // avoid square root by raising the distance check
            this.collide(c1, c2)
          }
        }
      }
    },
  
    collide : function(c1,c2) {
      // posDiff, velDiff and normal are upvalues for gc performance
      posDiff.x = c1.x - c2.x;
      posDiff.y = c1.y - c2.y;
      velDiff.x = c1.vx - c2.vx;
      velDiff.y = c1.vy - c2.vy;

      cDot = Math.sqrt( Math.pow(posDiff.x, 2) + Math.pow(posDiff.y, 2) );
            
      normal.x = posDiff.x / cDot;
      normal.y = posDiff.y / cDot;
      
      var d = (normal.x * velDiff.x) + (normal.y * velDiff.y);
      c2.vx = c1.vx + d * normal.x;
      c2.vy = c1.vy + d * normal.y;
      c1.vx = c2.vx - d * normal.x;
      c1.vy = c2.vy - d * normal.y;

      c2.x -= normal.x;
      c2.y -= normal.y;
      c1.x += normal.x;
      c1.y += normal.y;
      
      c1.vx = Math.abs(c1.vx) > this.maxVelocity ? this.maxVelocity * sign(c1.vx) : c1.vx;
      c1.vy = Math.abs(c1.vy) > this.maxVelocity ? this.maxVelocity * sign(c1.vy) : c1.vy;
      c2.vx = Math.abs(c2.vx) > this.maxVelocity ? this.maxVelocity * sign(c2.vx) : c2.vx;
      c2.vy = Math.abs(c2.vy) > this.maxVelocity ? this.maxVelocity * sign(c2.vy) : c2.vy;
      
      c1.collideFlag = true;
      c2.collideFlag = true;         
    },

    draw : function() {
      var x = this._x(),
          y = this._y(),
          width = this._width(),
          height= this._height();
          
      if(this.usePhysics) this.animate();
      
      this.ctx.fillStyle = this._background();
      //this.ctx.fillRect( this.x, this.y, this.width, this.height );
      
      this.ctx.strokeStyle = this._stroke();
      //this.ctx.strokeRect( this.x, this.y, this.width, this.height );
      
      this.ctx.save();
      
      this.ctx.beginPath();
      
      this.ctx.moveTo(x, y);
      this.ctx.lineTo(x + width, y);
      this.ctx.lineTo(x + width, y + height);
      this.ctx.lineTo(x, y + height);
      this.ctx.lineTo(x, y);
      this.ctx.fill();
      this.ctx.stroke();
      
      this.ctx.clip();
      
      this.ctx.fillStyle = this._fill();
      
      for(var i = 0; i < this.children.length; i++) {
        var child = this.children[i];
        this.ctx.lineWidth = 2
        this.ctx.fillStyle = child.fill || this._fill();
        
        this.ctx.beginPath();

        this.ctx.arc(x + child.x, y + child.y, this.childWidth, 0, Math.PI*2, true); 

        this.ctx.closePath();
        
        this.ctx.fill();
        this.ctx.stroke();
        //this.ctx.fillRect( this.x + child.x, this.y + child.y, this.childWidth, this.childHeight);
        this.ctx.textBaseline = 'middle';
        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = this._stroke();
        this.ctx.font = this._font();
        this.ctx.fillText(child.id, x + child.x, y + child.y);
      }
      
      this.ctx.closePath();
      this.ctx.restore();
    },
    
    changeValue : function( touch, xOffset, yOffset ) {
      if(this.hasFocus || !this.requiresFocus) {
        touch.x = xOffset;
        if(touch.x < 0 ) touch.x = 0;
        if(touch.x > this._width()) touch.x = this._width();
                
        touch.y = yOffset;// - this.half;
        if(touch.y < 0) touch.y = 0;
        if(touch.y > this._height()) touch.y = this._height();        
        this.values[touch.id].x = xOffset / this._width();
        this.values[touch.id].y = yOffset / this._height();
                
        if(this.onvaluechange) this.onvaluechange();
        
        if(!this.usePhysics) {
          this.sendTargetMessage();
          this.refresh();
        }
      }     
    },
    
    makeChildren : function() {
      for(var i = 0; i < this.numChildren; i++) {
        var x = Math.random() * this._width(),
            y = Math.random() * this._height()
            
        this.children.push({ id:i, x:x, y:y, vx:0, vy:0, collideFlag:false, isActive:false, lastPosition:null, });
        this.values.push({ x:null, y:null });
      }
    },
    
    touchEvent : function(touch) {
      var isHit = this.hitTest(touch);
      var touchMouseName = convertTouchEvent(touch.type);
      
      if(isHit) {
        if(touch.type === 'touchstart') {
          this.hasFocus = true;
          this.touchCount++;
          this.trackTouch(touch.x - this._x(), touch.y - this._y(), touch);
        }else{
          if(this[touch.type])
            this[touch.type](touch, isHit, touch.childID);  // normal event
        }
        
        if(this['on'+touch.type]) this['on'+touch.type](touch, isHit, touch.childId); // user defined event
        if(this['on'+touchMouseName]) this['on'+touchMouseName](touch, isHit);  // user defined event
        
      }else if(touch.type === 'touchend'){
        this.touchCount--;
        if(this.touchCount === 0) {        
          this.hasFocus = false;
        }else if(this.touchCount < 0 ) {
          this.touchCount = 0;
        }
        this.touchend(touch)
        if(this['on'+touch.type]) this['on'+touch.type](touch, isHit, touch.childId); // user defined event
        if(this['on'+touchMouseName]) this['on'+touchMouseName](touch, isHit);  // user defined event
      }
    },
    
    trackMouse : function(xPos, yPos, id) {
      var closestDiff = 10000,
          touchFound = null,
          touchNum = null;

      for(var i = 0; i < this.children.length; i++) {
        var touch = this.children[i],
            xdiff = Math.abs(touch.x - xPos),
            ydiff = Math.abs(touch.y - yPos);
        
        if(xdiff + ydiff < closestDiff) {
          closestDiff = xdiff + ydiff;
            
          touchFound = touch;
          touchNum = i;
        }
      }
      
      touchFound.isActive = true;
      touchFound.vx = 0;
      touchFound.vy = 0;
      
      if(touchFound != null) {
        this.changeValue(touchFound, xPos, yPos);
      }
      
      this.activeTouch = touchFound;
      this.activeTouch.lastTouch = null;
      
      this.lastTouched = touchFound;
    },
    
    mousedown : function(e) {
      if(this.hitTest(e)) {
        this.trackMouse(e.x - this._x(), e.y - this._y());
      }
    },
    mousemove : function(e) { 
      if(this.hitTest(e) && this.activeTouch !== null) {
        if(this.activeTouch.lastTouch === null) {
          this.activeTouch.lastTouch = {x:e.x - this._x(), y:e.y - this._y()};
        }else{
          var now = {x:e.x - this._x(), y:e.y - this._y()};
          this.activeTouch.velocity = {x:now.x - this.activeTouch.lastTouch.x, y:now.y - this.activeTouch.lastTouch.y };
          this.activeTouch.lastTouch = now;
        }

        this.changeValue(this.activeTouch, e.x - this._x(), e.y - this._y());
      }
    },
    mouseup   : function(e) {
      if(this.activeTouch !== null) {
        this.activeTouch.vx = this.activeTouch.velocity.x;
        this.activeTouch.vy = this.activeTouch.velocity.y;
        this.activeTouch.lastTouch = null;
        this.activeTouch = null;
      }
      for(var i = 0; i < this.children.length; i++) {
        this.children[i].isActive = false;
      }
    },
    
    trackTouch : function(xPos, yPos, _touch) {
      var closestDiff = 10000;
      var touchFound = null;
      var touchNum = null;
      
      for(var i = 0; i < this.children.length; i++) {
        var touch = this.children[i];
        var xdiff = Math.abs(touch.x - xPos);
        var ydiff = Math.abs(touch.y - yPos);

        if(xdiff + ydiff < closestDiff && !touch.isActive) {
          closestDiff = xdiff + ydiff;
          touchFound = touch;
          touchNum = i;
        }
      }
      
      touchFound.isActive = true;
      touchFound.vx = 0;
      touchFound.vy = 0;
      touchFound.identifier = _touch.identifier;
      touchFound.childID = touchNum;

      if(touchFound != null)
        this.changeValue(touchFound, xPos, yPos);
    
      this.lastTouched = touchFound;
      return touchFound.childID;
    },
    touchstart : function(touch) {
      // if(this.hitTest(touch)) {
      //   this.trackTouch(touch.x - this.x, touch.y - this.y, touch);
      // }
    },
    touchmove : function(touch) {
      for(var t = 0; t < this.children.length; t++) {
        _t = this.children[t];
        if(touch.identifier === _t.identifier) {
          this.changeValue(_t, touch.x - this._x(), touch.y - this._y());

          var now = {x:touch.x - this._x(), y:touch.y - this._y()};
          
          if(_t.lastPosition !== null) {
            _t.velocity = {x:now.x - _t.lastPosition.x, y:now.y - _t.lastPosition.y };
          }
          _t.lastPosition = now;
        }
      }
    },
    touchend : function(touch) {
      var found = false;
      var tu = null;
      for(var t = 0; t < this.children.length; t++) {
        var _t = this.children[t];
        
        if(touch.identifier === _t.identifier) {
          if( _t.velocity ) {
            _t.vx = _t.velocity.x;
            _t.vy = _t.velocity.y;
          }
          
          _t.lastPosition = null;
          _t.isActive = false;
          

          found = true;
          tu = t.childID;
        }
      }
      if(found) { this.touchUp = tu; }
      //if(!found) console.log("NOT FOUND", touch.identifier);
    },
    
    _init : function() { 
      this.makeChildren();
      if( this.outputInitialValues ) {
        this.sendTargetMessage(); 
      }
     },
  })
  .init( arguments[0] );
  
  this.requiresFocus = false; // is a widget default... must set after init.
  this.half = this.childWidth / 2;
  
  var numChildren = this.numChildren;
  Object.defineProperty(this, 'numChildren', {
    get : function() { return numChildren; },
    set : function(_numChildren) { 
      var temp = _numChildren;
      while(_numChildren > numChildren) {
        this.children.push({ id:this.children.length, x:Math.random() * this._width(), y:Math.random() * this._height(), vx:0, vy:0, collideFlag:false, isActive:false, lastPosition:null, });
        this.values.push({ x:null, y: null});
        numChildren++;
      }
      
      while(_numChildren < numChildren) {
        this.chidren.pop();
        this.values.pop();
        numChildren--;
      }
      this.refresh();
      numChildren = _numChildren; 
    }
  });
};

Interface.XY.prototype = Interface.Widget;
Interface.XY.colors = [
  'rgba(255,0,0,.35)',
  'rgba(0,255,0,.35)',
  'rgba(0,0,255,.35)',
  'rgba(0,255,255,.35)',
  'rgba(255,0,255,.35)',
  'rgba(255,255,0,.35)',
];
/**#Interface.Menu - Widget
A multi-option dropdown menu.
## Example Usage##
`a = new Interface.Menu({x:0, y:0, options:['red', 'yellow', 'green'] });  
a.onvaluechange = function() { b.background = this.value; }  
b = new Interface.Slider({x:.5, y:.5, width:.2, height:.3});  
panel = new Interface.Panel();  
panel.add(a,b);
`  
## Constructor   
**param** *properties*: Object. A dictionary of property values (see below) to set for the menu on initialization.
- - - -
**/
/**###Interface.Menu.options : property
Array. A list of values found in the menu.
**/
/**###Interface.Menu.css : property
Object. A dictionary of css keys / values to be applied to the menu.
**/
/**###Interface.Menu.onvaluechange : method
The event handler fired whenever the selected menu option changes.  
  
param **newValue** Number or String. The new menu value.
param **oldValue** Number or String. The previous menu value.
**/
Interface.Menu = function() {
  Interface.extend(this, {
    type : 'Menu',    
    _value: 0,
    serializeMe : ["options", "fontSize"],
    options: [],
    fontSize:15,
    touchEvent: function(e) { // we have to simulate this since the actual event was cancelled to avoid scrolling behavior
      if(this.hitTest(e)) {
        e.stopPropagation();
        /*var evt = document.createEvent('TouchEvent');
        evt.initUIEvent('touchstart', true, true);
        
        evt.view = window;
        evt.screenX = e.screenX;
        evt.screenY = e.screenY;
        evt.clientX = e.clientX;
        evt.clientY = e.clientY; 
        evt.bubbles = false;
        evt.view = window;       
        evt.altKey = false;
        evt.ctrlKey = false;
        evt.shiftKey = false;
        evt.metaKey = false;

        this.element.dispatchEvent(evt);*/
      }
    },
    _init : function() {
      this.element = $("<select>");
      
      for(var i = 0; i < this.options.length; i++) {
       var option = $("<option>" + this.options[i] + "</option>");
       this.element.append(option);
      }
      
      this.element.css({
        position:'absolute',
        backgroundColor:this._background(),
        color:this._stroke(),
        left: this._x() + this.panel.x,
        top:  this._y() + this.panel.y,
        width: this._width(),
        height: this._height(),
        fontSize: this.fontSize,
        display:'block',
        border: '1px solid ' + this._stroke(),
      });
      
      if(this.css) this.element.css( this.css );
      
      var self = this;
      this.element.change( 
        function(obj) {
          var oldValue = self.value;
          self.value = self.element.val();
          self.sendTargetMessage();
          self.onvaluechange(self.value, oldValue);
        }
      );
      
      if(this.options.indexOf( this.value ) !== -1) {
        this.element.val( this.value );
      }else{
        this.element.val( this.options[0] );
      }
      $(this.container).append(this.element);
    },   
  })
  .init( arguments[0] );
};
Interface.Menu.prototype = Interface.Widget;

/**#Interface.Label - Widget
A single line of text
## Example Usage##
`a = new Interface.Label({x:0, y:0, width:.5, height:.5, value:'test label', size:14 });  
b = new Interface.Slider({x:.5, y:.5, width:.2, height:.3, onvaluechange: function() { a.setValue( this.value; ) } });  
panel = new Interface.Panel();  
panel.add(a,b);
`  
## Constructor   
**param** *properties*: Object. A dictionary of property values (see below) to set for the label on initialization.
- - - -
**/
/**###Interface.Label.size : property
Number. The size in pixels for the font
**/
/**###Interface.Label.style : property
String. Text style. Maybe be 'normal', 'bold' or 'italics'.
**/
/**###Interface.Label.hAlign : property
String. Horizontal alignment of text. Maybe be 'left', 'right' or 'center'.
**/
/**###Interface.Label.vAlign : property
String. Vertical alignment of text. Maybe be 'top', 'bottom' or 'middle'.
**/
/**###Interface.Label.font : property
String. The font to use for text. Examples include 'sans-serif', 'Courier', 'Helvetica'
**/
Interface.Label = function() {
  Interface.extend(this, {
    type : 'Label',    
    serializeMe : ["size", "style", "hAlign", "vAlign", "font"],
    size:12,
    style:'normal',
    hAlign:'center',
    vAlign:'top',
    font : 'sans-serif',
    
    draw : function() {
      this.ctx.font = this.style + ' ' + this.size + 'px ' + this.font;
      this.ctx.textAlign = this.hAlign;
      this.ctx.textBaseline = this.vAlign;
      
      var metrics = this.ctx.measureText(this.lastValue),
          rect = {
            x: 0,
            y: this._y() - this.size / 2,
            width: metrics.width,
            height: this.size,
          };
      
      var x, y;
      switch(this.hAlign) {
        case 'center':
          x = (this._x() + this._width() / 2)
          rect.x = x - metrics.width / 2;
          break;
        case 'left':
          x = this._x();
          rect.x = x;
          break; 
        case 'right':
          x = this._x() + this._width();
          rect.x =  x - metrics.width;
          break;
      }

      switch(this.vAlign) {
        case 'middle':
          y = (this._y() + this._height() / 2)
          rect.y = y - this.size / 2;
          break;
        case 'top':
          y = this._y();
          rect.y = y;
          break; 
        case 'bottom':
          y = this._y() + this._height();
          rect.y =  y - this.size / 2;
          break;
      }
      this.ctx.clearRect(rect.x, rect.y, rect.width, rect.height * 2);      
      
      this.ctx.save();
      
      this.ctx.beginPath();
      
      this.ctx.moveTo(this._x(), this._y());
      this.ctx.lineTo(this._x() + this._width(), this._y());
      this.ctx.lineTo(this._x() + this._width(), this._y() + this._height());
      this.ctx.lineTo(this._x(), this._y() + this._height());
      this.ctx.lineTo(this._x(), this._y());
      this.ctx.closePath();
      
      this.ctx.clip();

      this.ctx.fillStyle = this._stroke();
      this.ctx.fillText(this.value, x, y);
      
      this.ctx.restore();
      this.lastValue = this.value;
    },
  })
  .init( arguments[0] );
  this.lastValue = this.value;
};
Interface.Label.prototype = Interface.Widget;

/**#Interface.TextField - Widget
A single line text field for user input. This widget is not drawn with canvas, it is an HTML <input> tag.
## Example Usage##
`a = new Interface.TextField({x:0, y:0, width:.5, height:.5, value:'starting value', onvaluechange: function() { alert( this.value ); } });    
panel = new Interface.Panel();  
panel.add(a);
`  
## Constructor   
**param** *properties*: Object. A dictionary of property values (see below) to set for the textfield on initialization.
- - - -
**/
/**###Interface.TextField.fontSize : property
Number. The size in pixels for the font used in the text field
**/
/**###Interface.TextField.css : property
Object. Extra css that you would like to apply to the input element
**/
Interface.TextField = function() {
  Interface.extend(this, {
    type : 'TextField',    
    serializeMe : ["fontSize"],
    fontSize: 15, 
    touchEvent: function(e) { // we have to simulate this since the actual event was cancelled to avoid scrolling behavior
      if(this.hitTest(e)) {
        var evt = document.createEvent('TouchEvent');
        evt.initUIEvent('touchstart', true, true);
        
        evt.view = window;
        evt.screenX = e.screenX;
        evt.screenY = e.screenY;
        evt.clientX = e.clientX;
        evt.clientY = e.clientY; 
        evt.bubbles = false;
        evt.view = window;       
        evt.altKey = false;
        evt.ctrlKey = false;
        evt.shiftKey = false;
        evt.metaKey = false;

        this.element.dispatchEvent(evt);
      }
    },
    _init : function() {
      this.element = $("<input>");
      
      if(this.value !== 0) {
        this.element.val( this.value );
      }
      this.element.css({
        position:'absolute',
        backgroundColor:this._background(),
        color:this._fill(),
        left: this._x() + this.panel.x,
        top:  this._y() + this.panel.y,
        width: this._width(),
        height: this._height(),
        fontSize: this.fontSize,
        display:'block',
        border: '1px solid ' + this._stroke(),
      });
      
      if(this.css) this.element.css( this.css );
      
      var self = this;
      this.element.change( 
        function(obj) {
          var oldValue = self.value;
          self.value = self.element.val();
          self.sendTargetMessage();
          self.onvaluechange(self.value, oldValue);
        }
      );
      
      $(this.container).append(this.element);
    },   
  })
  .init( arguments[0] );
};
Interface.TextField.prototype = Interface.Widget;

/**#Interface.MultiSlider - Widget
Multiple vertical sliders that share the same event handlers and colors. When a MultiSlider sends OSC, it comes in the form of an integer (representing the
number of the slide moved) and a float (representing the value of the slider moved). Any onvaluechange method attached to the MultiSlider widget should have a
similar signature; see the example below.
## Example Usage##
`b = new Interface.Label({ bounds:[.5,.5,.5,.5], size:12 });
a = new Interface.MultiSlider({ 
  bounds:[0,0,.5,.5], 
  fill:'red', 
  count:8,
  onvaluechange : function( sliderNumber, sliderValue) { b.setValue('number : ' + sliderNumber + ', value : ' + sliderValue) },
});    
panel = new Interface.Panel();  
panel.add(a,b);
`  
## Constructor   
**param** *properties*: Object. A dictionary of property values (see below) to set for the multislider on initialization.
- - - -
**/
/**###Interface.MultiSlider.count : property
Number. The number of sliders in the widget
**/
Interface.MultiSlider = function() {
  Interface.extend(this, {
    type : 'MultiSlider',    
    isVertical : true,
    serializeMe : ["isVertical", "count", "values"],
    values: [],
    _values: [],
    count:16,

    draw : function() {
      var x = this._x(),
          y = this._y(),
          width = this._width(),
          height= this._height(),
          sliderWidth = width / this.count;
          
      this.ctx.fillStyle = this._background();
      this.ctx.fillRect( x, y, width, height );
      
      this.ctx.fillStyle = this._fill();
      this.ctx.strokeStyle = this._stroke();
            
      for(var i = 0; i < this.count; i++) {
        var sliderX = i * sliderWidth + x;

        this.ctx.fillRect( sliderX, y + height - this._values[i] * height, sliderWidth, this._values[i] * height);
        this.ctx.strokeRect( sliderX, y, sliderWidth, height );         
      }      
    },
    setValue : function( sliderNum, value ) {
      this.values[ sliderNum ] = value
      this._values[ sliderNum ] = value
      this.refresh()
    },
    resetValues : function() {
      for( var i = 0; i < this.count; i++ ) {
        this.values[ i ] = this.min + (this.max - this.min) * this._values[ i ];
        
        if(this.target !== "OSC") {
          this.sendTargetMessage();
        }else{
          if(Interface.OSC)
            Interface.OSC.send( this.key, 'if', [ sliderHit, this.values[ sliderHit ] ] );
        }
        if(this.onvaluechange) this.onvaluechange(sliderHit, this.values[ sliderHit ]);
      }
      
      this.refresh();
    },
    changeValue : function( xOffset, yOffset ) {
      if(this.hasFocus || !this.requiresFocus) {
        var width   = this._width(),
            sliderWidth = width / this.count,
            sliderHit = Math.floor( xOffset / sliderWidth )
            _value = 0;
        
        _value = 1 - ( yOffset / this._height() );
        
        if(_value < 0) {
          _value = 0;
          // this.hasFocus = false;
        }else if(_value > 1) {
          _value = 1;
          // this.hasFocus = false;
        }
        
        this.values[ sliderHit ] = this.min + (this.max - this.min) * _value;
        this._values[ sliderHit ] = _value;
        
        if(this.target !== "OSC") {
          this.sendTargetMessage();
        }else{
          if(Interface.OSC)
            Interface.OSC.send( this.key, 'if', [ sliderHit, this.values[ sliderHit ] ] );
        }
        if(this.onvaluechange) this.onvaluechange(sliderHit, this.values[ sliderHit ]);
        this.refresh();
          //this.lastValue = this.value;
          //}
      }     
    },
    
    mousedown : function(e, hit) { if(hit && Interface.mouseDown) this.changeValue( e.x - this._x(), e.y - this._y() ); },
    mousemove : function(e, hit) { if(hit && Interface.mouseDown) this.changeValue( e.x - this._x(), e.y - this._y() ); },
    mouseup   : function(e, hit) { if(hit && Interface.mouseDown) this.changeValue( e.x - this._x(), e.y - this._y() ); },    
    
    touchstart : function(e, hit) { if(hit) this.changeValue( e.x - this._x(), e.y - this._y() ); },
    touchmove  : function(e, hit) { if(hit) this.changeValue( e.x - this._x(), e.y - this._y() ); },
    touchend   : function(e, hit) { if(hit) this.changeValue( e.x - this._x(), e.y - this._y() ); },  
    onvaluechange : function(id, value) {},
  })
  .init( arguments[0] );
  
  var x = this.x,
      y = this.y,
      width = this.width,
      height = this.height,
      bounds = [x,y,width,height],
      count = this.count;
  
  delete this.bounds;

  Object.defineProperties(this, {
    x : {
      get : function() { return x; },
      set: function(_x) { x = _x; this.refresh(); }
    },
    y : {
      get : function() { return y; },
      set: function(_y) { y = _y; this.refresh(); }
    },
    width : {
      get : function() { return width; },
      set: function(_width) { width = _width; this.refresh(); }
    },
    height : {
      get : function() { return height; },
      set: function(_height) { height = _height; this.refresh(); }
    },    
    bounds : {
      get : function() { return bounds; },
      set : function(_bounds) { bounds = _bounds; x = bounds[0]; y = bounds[1]; width = bounds[2]; height = bounds[3]; this.refresh(); }
    },
    count : {
      get : function() { return count; },
      set : function(_count) { count = _count; this.refresh(); },
    }
  })
};
Interface.MultiSlider.prototype = Interface.Widget;

/**#Interface.MultiButton - Widget
Multiple buttons that share the same event handlers and colors. When a MultiButton sends OSC, it comes in the form of three integers representing the row of the button
pressed, the column of the button pressed, and the button's value. Any onvaluechange method attached to the MultiButton widget should have a
similar signature; see the example below.
## Example Usage##
`b = new Interface.Label({ bounds:[.5,.5,.5,.5], size:12 });
a = new Interface.MultiButton({ 
  bounds:[0,0,.5,.5], 
  fill:'white',
  rows: 4,
  columns: 4,
  onvaluechange : function( row, column, value) { b.setValue('row : ' + row + ', column : ' + column + ', value : ' + value) },
});    
panel = new Interface.Panel();  
panel.add(a,b);
`  
## Constructor   
**param** *properties*: Object. A dictionary of property values (see below) to set for the multibutton on initialization.
- - - -
**/
/**###Interface.MultiButton.rows : property
Number. The number of rows of buttons in the widgets. When combined with the columns property this determines the overall number of buttons in the widget.
**/
/**###Interface.MultiButton.columns : property
Number. The number of columns of buttons in the widgets. When combined with the rows property this determines the overall number of buttons in the widget.
**/
/**###Interface.MultiButton.mode : property
String. Can be 'toggle', 'momentary' or 'contact'. In toggle mode, the button turns on when it is pressed and off when it is pressed again. In momentary mode, the button turns on when pressed and off when released. In contact mode, the button briefly flashes when pressed and sends its value.
**/
Interface.MultiButton = function() {
  Interface.extend(this, {
    type : 'MultiButton',    
    mode : 'toggle',
    serializeMe : ["mode", "rows", "columns", "requiresFocus"],
    rows:     8,
    values: [],
    _values: [],
    lastValues: [],
    mouseOver : null,
    columns:  8,
    
    draw : function() { 
      var x = this._x(),
          y = this._y(),
          width = this._width(),
          height= this._height(),
          childWidth  = width  / this.columns,
          childHeight = height / this.rows;   
      
      this.ctx.strokeStyle = this._stroke();
        
      for(var i = 0; i < this.rows; i++) {
        for(var j = 0; j < this.columns; j++) {
          var _x = x + j * childWidth,
              _y = y + i * childHeight,
              btn = i * this.columns + j;              
 
          if(this._values[ btn ]) {
            this.ctx.fillStyle = this._fill();
          }else{
            this.ctx.fillStyle = this._background();  
          }
          this.ctx.fillRect( _x, _y, childWidth, childHeight );
          this.ctx.strokeRect( _x, _y, childWidth, childHeight );          
        }
      }
    },
    
    setValue : function( row, col, value ) {
      var btnNum = row * this.columns + col
      
      this._values[ btnNum ] = this.values[ btnNum ] = this.lastValues[ btnNum ] = value
      this.draw()
    },
    
    changeValue : function( xOffset, yOffset ) {
      if(this.hasFocus || !this.requiresFocus) {
        var width   = this._width(),
            height  = this._height(),
            buttonWidth = width / this.columns,
            columnHit = Math.floor( xOffset / buttonWidth ),
            buttonHeight = height / this.rows,
            rowHit = Math.floor( yOffset / buttonHeight),
            buttonHit = (rowHit * this.columns) + columnHit,
            _value = 0;
        
        
        if( buttonHit !== this.mouseOver ) {
          this._values[ buttonHit ] = !this._values[ buttonHit ];
        
          this.values[ buttonHit ] = this._values[ buttonHit ] ? this.max : this.min;
                
          if(this.values[ buttonHit ] !== this.lastValues[ buttonHit ] || this.mode === 'contact') {
            if(this.target !== "OSC") {
              this.sendTargetMessage();
            }else{
              if(Interface.OSC)
                Interface.OSC.send( this.key, 'iif', [ rowHit, columnHit, this.values[ buttonHit ] ] );
            }

            if(this.onvaluechange) this.onvaluechange( rowHit, columnHit, this.values[ buttonHit ]);

            this.draw();
            this.lastValues[ buttonHit ] = this.values[ buttonHit ];
            
            if(this.mode === 'contact') {
              var self = this;
              setTimeout( function() { self._values[ buttonHit ] = 0; self.draw(); }, 75);
            }
          }
          
          this.mouseOver = buttonHit;
        }
      }
    },
    
    mousedown : function(e, hit) { 
      if(hit && Interface.mouseDown) { 
        this.changeValue( e.x - this._x(), e.y - this._y() );
      }
    },
    mousemove : function(e, hit) { 
      if(hit && Interface.mouseDown) {  
        this.changeValue( e.x - this._x(), e.y - this._y() );
      }
    },
    mouseup   : function(e, hit) { 
      if(hit && Interface.mouseDown) this.changeValue( e.x - this._x(), e.y - this._y() ); 
      this.mouseOver = null;
    },    
    
    touchstart : function(e, hit) { if(hit) this.changeValue( e.x - this._x(), e.y - this._y() ); },
    touchmove  : function(e, hit) { if(hit) this.changeValue( e.x - this._x(), e.y - this._y() ); },
    touchend   : function(e, hit) { if(hit) this.changeValue( e.x - this._x(), e.y - this._y() ); }, 
  })
  .init( arguments[0] );
  
  this.requiresFocus = false;
  var x = this.x,
      y = this.y,
      width = this.width,
      height = this.height,
      bounds = [x,y,width,height]
      rows = this.rows,
      columns = this.columns;
  
  delete this.bounds;

  Object.defineProperties(this, {
    x : {
      get : function() { return x; },
      set: function(_x) { x = _x; this.refresh(); }
    },
    y : {
      get : function() { return y; },
      set: function(_y) { y = _y; this.refresh(); }
    },
    width : {
      get : function() { return width; },
      set: function(_width) { width = _width; this.refresh(); }
    },
    height : {
      get : function() { return height; },
      set: function(_height) { height = _height; this.refresh(); }
    },    
    bounds : {
      get : function() { return bounds; },
      set : function(_bounds) { bounds = _bounds; x = bounds[0]; y = bounds[1]; width = bounds[2]; height = bounds[3]; this.refresh(); }
    },
    rows : {
      get : function() { return rows; },
      set : function(_rows) { rows = _rows; this.refresh(); },
    },
    columns : {
      get : function() { return columns; },
      set : function(_columns) { columns = _columns; this.refresh(); },
    },
  });
};
Interface.MultiButton.prototype = Interface.Widget;

/**#Interface.Accelerometer - Widget
Access to the Accelerometer. Unlike the Orientation widget, this is only found on mobile devices.

## Example Usage##
`var a = new Interface.Panel();  
var accelerometer = new Interface.Accelerometer({  
  onvaluechange : function(_x,_y,_z) {  
    x.setValue(_x);  
    y.setValue(_y);  
    z.setValue(_z);        
  }  
}).start();  
var x = new Interface.Slider({  
  label: 'x',  
  bounds:[.05,.05,.2,.9]  
});  
var y = new Interface.Slider({  
  label: 'y',  
  bounds:[.25,.05,.2,.9]  
});  
var z = new Interface.Slider({  
  label: 'z',   
  bounds:[.45,.05,.2,.9]  
});  
  
a.background = 'black';  
a.add(x,y,z);  
`  
## Constructor   
**param** *properties*: Object. A dictionary of property values (see below) to set for the accelerometer on initialization.
- - - -
**/
/**###Interface.Accelerometer.x : property
Number. A read-only property that gives the current accleration on the x-axis
**/
/**###Interface.Accelerometer.y : property
Number. A read-only property that gives the current accleration on the y-axis
**/
/**###Interface.Accelerometer.z : property
Number. A read-only property that gives the current accleration on the z-axis
**/
/**###Interface.Accelerometer.start : method
Starts emitting values from the Accelerometer measurements
**/
/**###Interface.Accelerometer.stop : method
Stop emitting values from the Accelerometer measurements
**/
/**###Interface.Accelerometer.onvaluechange : method
The event handler fired whenever an accelerometer update is received
  
param **x** Number. The x-acceleration of the sensor
param **y** Number. The y-acceleration of the sensor
param **x** Number. The z-acceleration of the sensor
**/
Interface.Accelerometer = function() {
  var self = this,
      metersPerSecondSquared = 9.80665;
  
  Interface.extend(this, {
    type:"Accelerometer",
    
    serializeMe : ["delay"],
    delay : 100, // measured in ms
    min: 0,
    max: 1,
    values : [0,0,0],

    update : function(event) {
      var acceleration = event.acceleration;
      self.x = self.values[0] = self.min + ((((0 - self.hardwareMin) + acceleration.x) / self.hardwareRange ) * self.max);
      self.y = self.values[1] = self.min + ((((0 - self.hardwareMin) + acceleration.y) / self.hardwareRange ) * self.max);
      self.z = self.values[2] = self.min + ((((0 - self.hardwareMin) + acceleration.z) / self.hardwareRange ) * self.max);
        
      if(typeof self.onvaluechange !== 'undefined') {
        self.onvaluechange(self.x, self.y, self.z);
      }
      
      self.sendTargetMessage();
    },
    start : function() {
      window.addEventListener('devicemotion', this.update, true);
      return this;
    },
    stop : function() {
      window.removeEventListener('devicemotion', this.update);
      return this;
    },
  })
  .init( arguments[0] );
    
	if(!Interface.isAndroid) {
	    this.hardwareMin = -2.307 * metersPerSecondSquared;  // as found here: http://www.iphonedevsdk.com/forum/iphone-sdk-development/4822-maximum-accelerometer-reading.html
	    this.hardwareMax = 2.307 * metersPerSecondSquared;   // -1 to 1 works much better for devices without gyros to measure tilt, -2 to 2 much better to measure force
	}else{
	    this.hardwareMin = metersPerSecondSquared;
	    this.hardwareMax = metersPerSecondSquared;
	}
    
  this.hardwareRange = this.hardwareMax - this.hardwareMin;
};
Interface.Accelerometer.prototype = Interface.Widget;

/**#Interface.Orientation - Widget
Access to the device's Orientation. This is only found on mobile devices, with the exception of Google Chrome, which provides pitch and roll.

## Example Usage##
`var a = new Interface.Panel()  
  
var orientation = new Interface.Orientation({  
  onvaluechange : function(_pitch, _roll, _yaw, _heading) {  
    pitch.setValue(_pitch);  
    roll.setValue(_roll);  
    yaw.setValue(_yaw);        
  }  
});  
var pitch = new Interface.Slider({  
  label: 'pitch',  
  bounds:[.05,.05,.2,.9]  
});  
var roll = new Interface.Slider({  
  label: 'roll',  
  bounds:[.25,.05,.2,.9]  
});  
var yaw = new Interface.Slider({  
  label: 'yaw',   
  bounds:[.45,.05,.2,.9]  
});  
  
a.add(pitch, roll, yaw);
`  
## Constructor   
**param** *properties*: Object. A dictionary of property values (see below) to set for the orientation on initialization.
- - - -
**/
/**###Interface.Orientation.pitch : property
Number. A read-only property that gives the current orientation on the x-axis
**/
/**###Interface.Orientation.roll : property
Number. A read-only property that gives the current orientation on the y-axis
**/
/**###Interface.Orientation.yaw : property
Number. A read-only property that gives the current orientation on the z-axis
**/
/**###Interface.Orientation.start : method
Starts emitting values from the Orientation measurements
**/
/**###Interface.Orientation.stop : method
Stop emitting values from the Orientation measurements
**/
/**###Interface.Orientation.onvaluechange : method
The event handler fired whenever an orientation update is received
  
param **pitch** Number. The pitch of the sensor
param **roll** Number. The roll of the sensor
param **yaw** Number. The yaw of the sensor
param **heading** Number. The heading of the sensor, this corresponds to the compass direction detected.
**/
Interface.Orientation = function() {
  var _self = this;
  
  Interface.extend(this, {
    type:"Orientation",
    serializeMe : ["delay"],
    delay : 100, // measured in ms
    values : [0,0,0],
    update : function(orientation) {
      _self.roll   = _self.values[0] = _self.min + ((90 + orientation.gamma)  /  180 ) * _self.max ;
      _self.pitch  = _self.values[1] = _self.min + ((180 + orientation.beta) / 360 ) * _self.max ;
      _self.yaw    = _self.values[2] = _self.min + (orientation.alpha / 360 ) * _self.max ;
      
      if( !isNaN(orientation.webkitCompassHeading) ) {
        _self.heading = _self.min + ((orientation.webkitCompassHeading  /  360 ) * _self.max );
      }
      
      _self.sendTargetMessage();
      
      if(typeof _self.onvaluechange !== 'undefined') {
        _self.onvaluechange(_self.pitch, _self.roll, _self.yaw, _self.heading);
      }
    },
    start : function() {
      window.addEventListener('deviceorientation', function (event) {
        _self.update(event);
      }, true);
      return this;
    },
    stop : function() {
      window.removeEventListener('deviceorientation');
    },
  })
  .init( arguments[0] );
};
Interface.Orientation.prototype = Interface.Widget;

Interface.Range = function() {
  Interface.extend(this, {
    type:"Range",
    serializeMe : ["handleSize"],    
    handleSize: 20,
    values:[0,1],
    _values:[0,1],
    draw : function() {
      var x = this._x(),
          y = this._y(),
          width = this._width(),
          height= this._height();
          
      this.ctx.fillStyle = this._background();
      this.ctx.clearRect(x, y, width, height);    
        
  		var rightHandlePos = x + (this._values[1] * width) - this.handleSize;
  		var leftHandlePos  = x + this._values[0]  * width;

	    this.ctx.fillStyle = this._background();
      this.ctx.fillRect(x, y, width, height);
        
	    this.ctx.fillStyle = this._fill();
      this.ctx.fillRect(leftHandlePos, y, rightHandlePos - leftHandlePos, height);

	    this.ctx.fillStyle = this._stroke();
  		this.ctx.fillRect(leftHandlePos, y, this.handleSize, height);

	    //this.ctx.fillStyle = "rgba(0,255,0,.25)";
  		this.ctx.fillRect(rightHandlePos, y, this.handleSize, height);
      
      this.ctx.strokeStyle = this._stroke();
      this.ctx.strokeRect(x, y, width, height);    
    },
    changeValue : function( xOffset, yOffset ) {
      if(this.hasFocus || !this.requiresFocus) {
        var value = this.isVertical ? 1 - (yOffset / this._height()) : xOffset / this._width();
        
        if(value < 0) {
          value = 0;
        }else if(value > 1) {
          value = 1;
        }

        var range = this.max - this.min
      	if(Math.abs( value - this._values[0]) < Math.abs( value - this._values[1])) {
          this._values[0] = value;
      		this.values[0] = this.min + range * value;
      	}else{
          this._values[1] = value;
      		this.values[1] = this.min + range * value;
      	}
        
        this.refresh();
        
        if(this.values[0] !== this.lastLeftValue || this.values[1] !== this.lastRightValue) {
          if(this.onvaluechange) this.onvaluechange(this.values[0], this.values[1]);
          this.refresh();
          this.lastLeftValue = this.values[0];
          this.lastRightValue = this.values[1];
          this.sendTargetMessage();         
        }
      }     
    },
    
    mousedown : function(e, hit) { if(hit && Interface.mouseDown) this.changeValue( e.x - this._x(), e.y - this._y() ); },
    mousemove : function(e, hit) { if(hit && Interface.mouseDown) this.changeValue( e.x - this._x(), e.y - this._y() ); },
    mouseup   : function(e, hit) { if(hit && Interface.mouseDown) this.changeValue( e.x - this._x(), e.y - this._y() ); },    
    
    touchstart : function(e, hit) { if(hit) this.changeValue( e.x - this._x(), e.y - this._y() ); },
    touchmove  : function(e, hit) { if(hit) this.changeValue( e.x - this._x(), e.y - this._y() ); },
    touchend   : function(e, hit) { if(hit) this.changeValue( e.x - this._x(), e.y - this._y() ); },  
  })
  .init( arguments[0] );
}
Interface.Range.prototype = Interface.Widget;

Interface.Paint = function() {
  Interface.extend( this, {
    lines: [],
    startTime: 0,
    isAnimating: false,
    animationPoint: 0,
    timer: null,
    shouldLoop: true,
    prevTimestamp:null,
    values:[0,0],
    draw : function() {
      var x = this._x(),
          y = this._y(),
          width = this._width(),
          height= this._height();
          
      this.ctx.fillStyle = this._background();
      //this.ctx.fillRect( this.x, this.y, this.width, this.height );
      
      this.ctx.strokeStyle = this._stroke();
      //this.ctx.strokeRect( this.x, this.y, this.width, this.height );
      
      this.ctx.save();
      
      this.ctx.beginPath();
      
      this.ctx.moveTo(x, y);
      this.ctx.lineTo(x + width, y);
      this.ctx.lineTo(x + width, y + height);
      this.ctx.lineTo(x, y + height);
      this.ctx.lineTo(x, y);
      this.ctx.fill();
      this.ctx.stroke();
      
      this.ctx.clip();
      
      this.ctx.fillStyle = this._fill();
      
      if( this.lines.length >= 1 ) {
        this.ctx.lineWidth = 8
        for( var i = 0; i < this.lines.length; i++ ) {
          var points = this.lines[ i ]
        
          if( points.length >= 2 ) { 
            this.ctx.moveTo( points[0].x * width, points[0].y * height )
            
            this.ctx.beginPath()
        
            for ( var j = 1; j < points.length - 2; j++ ) {
               var xc = ( points[ j ].x + points[ j + 1 ].x ) / 2
               var yc = ( points[ j ].y + points[ j + 1 ].y ) / 2
               this.ctx.quadraticCurveTo( points[ j ].x * width, points[ j ].y * height, xc * width, yc * height )
            }
      
            this.ctx.stroke()
            //this.ctx.closePath();
          }
        }
      }
      
      this.ctx.restore();
    },
    
    /*
    touchEvent : function(touch) {
      var isHit = this.hitTest(touch);
      var touchMouseName = convertTouchEvent(touch.type);
      
      if(isHit) {
        if(touch.type === 'touchstart') {
          this.hasFocus = true;
          this.touchCount++;
          this.trackTouch(touch.x - this._x(), touch.y - this._y(), touch);
        }else{
          if(this[touch.type])
            this[touch.type](touch, isHit, touch.childID);  // normal event
        }
        
        if(this['on'+touch.type]) this['on'+touch.type](touch, isHit, touch.childId); // user defined event
        if(this['on'+touchMouseName]) this['on'+touchMouseName](touch, isHit);  // user defined event
        
      }else if(touch.type === 'touchend'){
        this.touchCount--;
        if(this.touchCount === 0) {        
          this.hasFocus = false;
        }else if(this.touchCount < 0 ) {
          this.touchCount = 0;
        }
        this.touchend(touch)
        if(this['on'+touch.type]) this['on'+touch.type](touch, isHit, touch.childId); // user defined event
        if(this['on'+touchMouseName]) this['on'+touchMouseName](touch, isHit);  // user defined event
      }
    },
    
    trackMouse : function(xPos, yPos, id) {},
    */
    animate : function(co) {
      var me = this; 
      
      if( this.isAnimating === false ) return
      //console.log( this.lineNo, this._lines.length, this.speedMod )
      var line = this.lines[ 0 ]
      
      // if( typeof this.line === 'undefined' ) {
      //   this.context.fillStyle = '#fff'
      //   this.context.fillRect( 0, 0, this.canvas[0].width, this.canvas[0].height )      
      //   this.lineNo = this.pointNo = this.lines.length = 0
      //   if( this.shouldLoop ) setTimeout( function() { me.drawBackground(); me.animate() }, this.endTime )
      //   return
      // }
      var point = line[ this.animationPoint ],
          nextPoint = line[ this.animationPoint + 1 ]
            
      //console.log( point, nextPoint )
      
      if( this.animationPoint >= line.length - 1 ) {
        if( this.shouldLoop ) {
          this.animationPoint = 0
          this.draw()
          //var time = this.shouldLoop ? this.endTime :  (this.point.timestamp - this.prevTimestamp)
          this.timeout = setTimeout( function() { me.animate() }, 5 )
          return
        }else{
          this.ctx.fillStyle = this._background()
          this.ctx.fillRect( 0, 0, this._width(), this._height() )
          if( this.speedMod !== 0 ) return
        }
      }
      
      this.ctx.save();
      this.ctx.strokeStyle = '#f00'
      this.ctx.lineWidth = 8
      
      this.ctx.beginPath()
      
      this.ctx.moveTo( point.x * this._width(), point.y * this._height() )
      // var xc = ( point.x + nextPoint.x ) / 2
      // var yc = ( point.y + nextPoint.y ) / 2
      // this.ctx.quadraticCurveTo( nextPoint.x * this._width(), nextPoint.y * this._height(), xc * this._width(), yc * this._height() )
      this.ctx.lineTo( nextPoint.x * this._width(), nextPoint.y * this._height() )
      
      this.ctx.stroke()
      this.ctx.restore()
      
      this.timeout = setTimeout( function() { me.animate() }, point.timestamp - this.prevTimestamp )
      this.prevTimestamp = point.timestamp
      
      this.animationPoint++ 
      
      this.values = [ point.x, point.y ]
      this.sendTargetMessage()
    },
    
    startAnimation: function() {
      var self = this
      
      this.animate()
    },
    stopAnimation: function() {
      if( this.timer ) {
        clearInterval( this.timer )
      }
    },
    mousedown : function(e) {
      if(this.hitTest(e)) {
        
        this.lines = []
        this.animationPoint = 0
        
        if( this.lines.length === 0 ) {
          this.startTime = Date.now()
        }else{
          // if( this.lines[ this.lines.length - 1 ].length < 2 ) {
          //   this.lines.pop()
          // }
        }

        this.lines.push( [] )
        this.isDrawing = true;
        this.isAnimating = false;
      }
    },
    mousemove : function(e) { 
      if(this.hitTest(e) && this.activeTouch !== null) {
        //ctx.fillStyle = '#000'
  
        //if( e.pageX > canvas.width ) isDrawing = false
        if( this.isDrawing ) {
          var points = this.lines[ this.lines.length - 1 ]
          if( points ) {
            points.push({ x:e.x / this._width(), y:e.y / this._height(), timestamp: Date.now() - this.startTime })
            this.draw()
          }
        }  
      }
    },
    mouseup   : function(e) {
      this.isDrawing = false
      if( this.lines.length > 0 ) {
        this.isAnimating = true;
        this.animate()
      }
    },
    touchstart : function(touch) {
      if(this.hitTest(touch)) {
        this.lines = []
        this.animationPoint = 0
        
        if( this.lines.length === 0 ) {
          this.startTime = Date.now()
        }

        this.lines.push( [] )
        this.isDrawing = true;
        this.isAnimating = false;
      }
      
      this.activeTouch = touch
    },
    
    touchmove : function(touch) {
      if(this.hitTest(touch) && this.activeTouch !== null) {
        if( this.isDrawing ) {
          var points = this.lines[ this.lines.length - 1 ]
          if( points ) {
            points.push({ x:touch.x / this._width(), y:touch.y / this._height(), timestamp: Date.now() - this.startTime })
            this.draw()
          }
        }  
      }
    },
    
    touchend : function(touch) {
      this.isDrawing = false
      if( this.lines.length > 0 ) {
        this.isAnimating = true;
        this.animate()
      }
    },
  })
  .init( arguments[0] );
}
Interface.Paint.prototype = Interface.Widget;

Interface.Patchbay = function() {
  Interface.extend(this, {
    type:"Patchbay",
    points: [],
    minWidth:80,
    cableWidth:5,
    start:null,
    over:null,
    connections:[],
    rowLength:null,
    selectedConnection: null,
    patchOutlineWidth:3,
    
    draw : function() {
      var x = this._x(), y = this._y(), width = this._width(), height = this._height(),
          length = this.points.length
        
      this.ctx.fillStyle = this._background();
      this.ctx.strokeStyle = this._stroke();
      this.ctx.clearRect(x, y, width, height);          
      
      this.layout()
      this.drawSegments()
      this.drawPatchPoints()
      this.drawConnections()
      //this.drawLabels()
    },
    
    layout: function() {
      var x = this._x(), y = this._y(), width = this._width(), height = this._height()
      
      this.rows = 1
      
      this.patchWidth = width / this.points.length
      
      if( this.patchWidth < this.minWidth ) {
        this.patchWidth = this.minWidth
      }
      
      this.rows = Math.ceil( (this.patchWidth * this.points.length) / width )
            
      this.patchHeight = height / this.rows
      
      
      this.columns = Math.floor( width / this.patchWidth )
    },
    
    drawSegments : function() {
      var x = this._x(), y = this._y(), width = this._width(), height = this._height(),
          length = this.points.length
          
      this.ctx.fillStyle = this._fill();

      var totalWidth = 0, row = 1
      
      //console.log("SEGMENT, START:", this.start, 'OVER:', this.over )
      for( var i = 0; i < this.points.length; i++ ) {
        if( this.start === i ) {
          this.ctx.fillStyle = "#777"            
          this.ctx.fillRect(x + totalWidth, y + (this.patchHeight * (row-1)), this.patchWidth, this.patchHeight  );
        }else if( this.over === i ) {
          this.ctx.fillStyle = "#744"
          this.ctx.fillRect(x + totalWidth, y + (this.patchHeight * (row-1)), this.patchWidth, this.patchHeight );
        }
        
        this.ctx.fillStyle = this._stroke()
        this.ctx.textBaseline = 'middle'
        this.ctx.textAlign = 'center'
        this.ctx.font = this._font()
        this.ctx.font = 'normal 12px Helvetica'
        
        if( typeof this.points[i].name !== 'undefined' ) { 
          this.ctx.fillText( this.points[ i ].name ,  totalWidth + this.patchWidth / 2, y + ((row-1) * this.patchHeight + .1 * this.patchHeight)  )
        }
        
        if( typeof this.points[i].name2 !== 'undefined' ) {
          this.ctx.fillText( this.points[ i ].name2 , totalWidth + this.patchWidth / 2, y + ((row-1) * this.patchHeight + .9 * this.patchHeight)  )
        }
  
        totalWidth += this.patchWidth
        
        this.points[ i ].row = row
        
        if( totalWidth + this.patchWidth > width ) {
          totalWidth = 0
          row++
        }
      }
    },
    
    drawPatchPoints : function() {
      var x = this._x(), y = this._y(), width = this._width(), height = this._height(),
          length = this.points.length
          
      this.ctx.fillStyle = this._background();
    
      var totalWidth = 0, row = 1
      for( var i = 0; i < this.points.length; i++ ) {
        //this.ctx.fillRect(totalWidth, y, patchWidth, patchHeight);
        this.ctx.beginPath()
        this.ctx.arc( totalWidth + this.patchWidth / 2, y + this.patchHeight / 2 + (this.patchHeight * (row-1)), this.patchWidth/4, 0, Math.PI*2, true); 
        this.ctx.closePath()
        
        this.ctx.fill()
        
        this.ctx.lineWidth = this.patchOutlineWidth
        this.ctx.stroke()
        
        this.points[i].row = row
        
        this.ctx.lineWidth = 1
        this.ctx.strokeRect(totalWidth, y + (this.patchHeight * (row-1)), this.patchWidth, this.patchHeight );
              
        totalWidth += this.patchWidth
        if( totalWidth + this.patchWidth > width ) {
          totalWidth = 0
          row++
        }
      }
      
      //console.log("TOTAL ROWS = ", row )
    },
    
    drawConnections : function() {
      var x = this._x(), y = this._y(), width = this._width(), height = this._height()
      
      this.ctx.lineWidth = this.cableWidth
      
      for( var i = 0; i < this.connections.length; i++ ) {
        var connection = this.connections[ i ],
            origin = this.connections[ i ][ 0 ],
            destination = this.connections[ i ][ 1 ],
            startX = x + this.patchWidth * (origin % this.columns) + this.patchWidth / 2,
            startY = y + (this.patchHeight / 2) + (this.patchHeight * Math.floor(origin / this.columns) ),
            endX   = x + this.patchWidth * (destination % this.columns) + this.patchWidth / 2,
            endY   = y + (this.patchHeight / 2) + (this.patchHeight * Math.floor(destination / this.columns) ),
            ctrl1X = startX,
            ctrl1Y = startY + this.patchHeight * .5,
            ctrl2X = endX,
            ctrl2Y = endY + this.patchHeight * .5
        
            //console.log( "ORIGIN", this.points[origin].row, "DESTINATION", this.points[destination].row )
        if( connection.selected ) {
          this.ctx.strokeStyle = '#0f0'
        }else{
          var grd = this.ctx.createLinearGradient(startX, startY, endX, endY);
          
          grd.addColorStop( 0.000, 'rgba(64, 64, 64, 1.000)' )          
          grd.addColorStop( 1.000, 'rgba(204, 204, 204, 1.000)' )

          
          this.ctx.strokeStyle = grd
        }
        
        this.ctx.beginPath();
        this.ctx.moveTo( startX, startY )
        this.ctx.bezierCurveTo( ctrl1X, ctrl1Y, ctrl2X, ctrl2Y, endX, endY );
        this.ctx.stroke()

        connection.edge = [startX, startY, ctrl1X, ctrl1Y, ctrl2X, ctrl2Y, endX, endY]
      }
    },
    
    _init : function() {
      var x = this._x(),
          y = this._y(),
          width = this._width(),
          height= this._height()
          
      this.patchWidth = width / this.points.length
      this.patchHeight = height
      this.rows = 1 
    },
    
    createConnection : function( connection ) {
      var start = this.points[ connection[0] ],
          end   = this.points[ connection[1] ]
      
      if( end.output !== false ) {
        this.connections.push( connection )
      
        if( this.onconnection ) { 
          this.onconnection( start, end ) 
        }
      }
    },
    
    changeValue : function( xOffset, yOffset ) {  },
    
    hitTestEdges: function(e) {
      var hit = false,
          x = e.x - this._x(),
          y = e.y - this._y()
      
      for( var i = 0; i < this.connections.length; i++ ) {
        var edge = this.connections[ i ].edge
        
        this.ctx.beginPath()
        this.ctx.moveTo( edge[0], edge[1] )
        this.ctx.bezierCurveTo( edge[2], edge[3], edge[4], edge[5], edge[6], edge[7] );
        if( this.ctx.isPointInStroke( x,y ) ) {
          this.connections.forEach( function( elem, index, array ){
            elem.selected = false
          })
          
          this.connections[ i ].selected = true
          this.selectedConnection = this.connections[ i ]
          
          hit = true
          
          break;
        }
      }
      
      return hit
    },
  
    mousedown : function(e, hit) {
      if( hit && Interface.mouseDown ) {
        if( !this.hitTestEdges( e ) ) {
          //this.start = Math.floor( ( e.x - this._x() / this._width() / this.rows ) / ( this._width() / this.points.length / this.rows ) )
          var _x = Math.floor( ( e.x - this._x() / this._width() ) / ( this._width() / this.columns ) ),
              _y = Math.floor( ( e.y - this._y() / this._height()) / ( this._height() / this.rows ) )
                        
          this.start = _y * this.columns + _x
          
          if( this.selectedConnection !== null ) {
            this.selectedConnection.selected = false
            this.selectedConnection = null
          }        
        }
        
        this.draw()
      }
    },
    mousemove : function(e, hit) { 
      if( hit && Interface.mouseDown ) {
        var _x = Math.floor( ( e.x - this._x() / this._width() ) / ( this._width() / this.columns) ),
            _y = Math.floor( ( e.y - this._y() / this._height()) / ( this._height() / this.rows ) )
            
        var prevOver = this.over
        this.over = _y * this.columns + _x
        
        if( this.over !== prevOver ) {
          this.draw()
        }
      }
    },
    mouseup   : function(e, hit) { 
      if( hit ) {
        var _x = Math.floor( ( e.x - this._x() / this._width() ) / ( this._width() / this.columns ) ),
            _y = Math.floor( ( e.y - this._y() / this._height()) / ( this._height() / this.rows ) ),
            over = _y * this.columns + _x
            
        // var over = Math.floor( ( e.x - this._x() / this._width() / this.rows ) / ( this._width() / this.points.length / this.rows ) )
        
        if( this.start !== over && this.start !== null ) {
          var connection = [ this.start, over ],
              isFound = false
              
          for( var i = 0; i < this.connections.length; i++ ) {
            if( this.connections[i][0] === connection[0] && this.connections[i][1] === connection[1] ) {
              isFound = true
            }
          }
          
          if( !isFound ) this.createConnection( connection )
        }
      }
      
      this.over = null
      this.start = null
      this.draw()
    },
    
    onkeydown: function(e) {
      var key = Interface.keyCodeToChar[ e.keyCode ]
            
      if( key === 'Delete' || key === 'Backspace' ) {
        if( this.selectedConnection !== null ) {
          this.deleteConnection( this.selectedConnection )
          e.preventDefault()
        }
      }
    },
    
    deleteConnection: function( connection ) {
      this.connections.splice( this.connections.indexOf( connection ), 1 )
      
      if( this.ondisconnection ) { this.ondisconnection( this.points[ connection[0] ], this.points[ connection[1] ] ) }
      
      this.draw()
    },
    
    touchstart : function(e, hit) { if(hit) this.changeValue( e.x - this._x(), e.y - this._y() ); },
    touchmove  : function(e, hit) { if(hit) this.changeValue( e.x - this._x(), e.y - this._y() ); },
    touchend   : function(e, hit) { if(hit) this.changeValue( e.x - this._x(), e.y - this._y() ); },  
  })
  .init( arguments[0] );
}
Interface.Patchbay.prototype = Interface.Widget;

Interface.defineChildProperties = function(widget, properties) {
  for(var j = 0; j < properties.length; j++) {
    (function() {
      var key = properties[j];
      var val = widget[key]
      Object.defineProperty(widget, key, {
        get: function() { return val; },
        set: function(_val) {
          val = _val;
          for(var i = 0; i < widget.children.length; i++) {
            widget.children[i][key] = val;
          }
        }
      });
    })();
  }
};

// pub/sub for jquery && zepto, see https://github.com/martinjuhasz/pubsub-zepto/blob/master/pubsub.js
(function ($) {
	var cache = {};

	$.publish = function(/* String */topic, /* Array? */args){
		if(typeof cache[topic] === 'object') {	
			cache[topic].forEach(function(property){
				property.apply($, args || []);
			});
		}
	};

	$.subscribe = function(/* String */topic, /* Function */callback){
		if(!cache[topic]){
			cache[topic] = [];
		}
		cache[topic].push(callback);
		return [topic, callback]; // Array
	};

	$.unsubscribe = function(/* Array */handle){
		var t = handle[0];
		cache[t] && $.each(cache[t], function(idx){
			if(this == handle[1]){
				cache[t].splice(idx, 1);
			}
		});
	};

})(window.jQuery);