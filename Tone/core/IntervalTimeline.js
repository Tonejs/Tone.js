define(["Tone/core/Tone", "Tone/core/Type"], function (Tone) {

	"use strict";

	/**
	 *  @class Similar to Tone.Timeline, but all events represent
	 *         intervals with both "time" and "duration" times. The 
	 *         events are placed in a tree structure optimized
	 *         for querying an intersection point with the timeline
	 *         events. Internally uses an [Interval Tree](https://en.wikipedia.org/wiki/Interval_tree)
	 *         to represent the data.
	 *  @extends {Tone}
	 */
	Tone.IntervalTimeline = function(){

		/**
		 *  The root node of the inteval tree
		 *  @type  {IntervalNode}
		 *  @private
		 */
		this._root = null;

		/**
		 *  Keep track of the length of the timeline.
		 *  @type  {Number}
		 *  @private
		 */
		this._length = 0;
	};

	Tone.extend(Tone.IntervalTimeline);

	/**
	 *  The event to add to the timeline. All events must 
	 *  have a time and duration value
	 *  @param  {Object}  event  The event to add to the timeline
	 *  @return  {Tone.IntervalTimeline}  this
	 */
	Tone.IntervalTimeline.prototype.addEvent = function(event){
		if (this.isUndef(event.time) || this.isUndef(event.duration)){
			throw new Error("events must have time and duration parameters");
		}
		var node = new IntervalNode(event.time, event.time + event.duration, event);
		if (this._root === null){
			this._root = node;
		} else {
			this._root.insert(node);
		}
		this._length++;
		// Restructure tree to be balanced
		while (node !== null) {
			node.updateHeight();
			node.updateMax();
			this._rebalance(node);
			node = node.parent;
		}
		return this;
	};

	/**
	 *  Remove an event from the timeline.
	 *  @param  {Object}  event  The event to remove from the timeline
	 *  @return  {Tone.IntervalTimeline}  this
	 */
	Tone.IntervalTimeline.prototype.removeEvent = function(event){
		if (this._root !== null){
			var results = [];
			this._root.search(event.time, results);
			for (var i = 0; i < results.length; i++){
				var node = results[i];
				if (node.event === event){
					this._removeNode(node);
					this._length--;
					break;
				}
			}
		}
		return this;
	};

	/**
	 *  The number of items in the timeline.
	 *  @type {Number}
	 *  @memberOf Tone.IntervalTimeline#
	 *  @name length
	 *  @readOnly
	 */
	Object.defineProperty(Tone.IntervalTimeline.prototype, "length", {
		get : function(){
			return this._length;
		}
	});

	/**
	 *  Remove events whose time time is after the given time
	 *  @param  {Time}  time  The time to query.
	 *  @returns {Tone.IntervalTimeline} this
	 */
	Tone.IntervalTimeline.prototype.cancel = function(after){
		after = this.toSeconds(after);
		this.forEachAfter(after, function(event){
			this.removeEvent(event);
		}.bind(this));
		return this;
	};

	/**
	 *  Set the root node as the given node
	 *  @param {IntervalNode} node
	 *  @private
	 */
	Tone.IntervalTimeline.prototype._setRoot = function(node){
		this._root = node;
		if (this._root !== null){
			this._root.parent = null;
		}
	};

	/**
	 *  Replace the references to the node in the node's parent
	 *  with the replacement node.
	 *  @param  {IntervalNode}  node        
	 *  @param  {IntervalNode}  replacement 
	 *  @private
	 */
	Tone.IntervalTimeline.prototype._replaceNodeInParent = function(node, replacement){
		if (node.parent !== null){
			if (node.isLeftChild()){
				node.parent.left = replacement;
			} else {
				node.parent.right = replacement;
			}
			this._rebalance(node.parent);
		} else {
			this._setRoot(replacement);
		}
	};

	/**
	 *  Remove the node from the tree and replace it with 
	 *  a successor which follows the schema.
	 *  @param  {IntervalNode}  node
	 *  @private
	 */
	Tone.IntervalTimeline.prototype._removeNode = function(node){
		if (node.left === null && node.right === null){
			this._replaceNodeInParent(node, null);
		} else if (node.right === null){
			this._replaceNodeInParent(node, node.left);
		} else if (node.left === null){
			this._replaceNodeInParent(node, node.right);
		} else {
			var balance = node.getBalance();
			var replacement, temp;
			if (balance > 0){
				if (node.left.right === null){
					replacement = node.left;
					replacement.right = node.right;
					temp = replacement;
				} else {
					replacement = node.left.right;
					while (replacement.right !== null){
						replacement = replacement.right;
					}
					replacement.parent.right = replacement.left;
					temp = replacement.parent;
					replacement.left = node.left;
					replacement.right = node.right;
				}
			} else {
				if (node.right.left === null){
					replacement = node.right;
					replacement.left = node.left;
					temp = replacement;
				} else {
					replacement = node.right.left;
					while (replacement.left !== null) {
						replacement = replacement.left;
					}
					replacement.parent = replacement.parent;
					replacement.parent.left = replacement.right;
					temp = replacement.parent;
					replacement.left = node.left;
					replacement.right = node.right;
				}
			}
			if (node.parent !== null){
				if (node.isLeftChild()){
					node.parent.left = replacement;
				} else {
					node.parent.right = replacement;
				}
			} else {
				this._setRoot(replacement);
			}
			// this._replaceNodeInParent(node, replacement);
			this._rebalance(temp);
		}
		node.dispose();
	};

	/**
	 *  Rotate the tree to the left
	 *  @param  {IntervalNode}  node
	 *  @private
	 */
	Tone.IntervalTimeline.prototype._rotateLeft = function(node){
		var parent = node.parent;
		var isLeftChild = node.isLeftChild();

		// Make node.right the new root of this sub tree (instead of node)
		var pivotNode = node.right;
		node.right = pivotNode.left;
		pivotNode.left = node;

		if (parent !== null){
			if (isLeftChild){
				parent.left = pivotNode;
			} else{
				parent.right = pivotNode;
			}
		} else{
			this._setRoot(pivotNode);
		}
	};

	/**
	 *  Rotate the tree to the right
	 *  @param  {IntervalNode}  node
	 *  @private
	 */
	Tone.IntervalTimeline.prototype._rotateRight = function(node){
		var parent = node.parent;
		var isLeftChild = node.isLeftChild();
 
		// Make node.left the new root of this sub tree (instead of node)
		var pivotNode = node.left;
		node.left = pivotNode.right;
		pivotNode.right = node;

		if (parent !== null){
			if (isLeftChild){
				parent.left = pivotNode;
			} else{
				parent.right = pivotNode;
			}
		} else{
			this._setRoot(pivotNode);
		}
	};

	/**
	 *  Balance the BST
	 *  @param  {IntervalNode}  node
	 *  @private
	 */
	Tone.IntervalTimeline.prototype._rebalance = function(node){
		var balance = node.getBalance();
		if (balance > 1){
			if (node.left.getBalance() < 0){
				this._rotateLeft(node.left);
			} else {
				this._rotateRight(node);
			}
		} else if (balance < -1) {
			if (node.right.getBalance() > 0){
				this._rotateRight(node.right);
			} else {
				this._rotateLeft(node);
			}
		}
	};

	/**
	 *  Get an event whose time and duration span the give time. Will
	 *  return the match whose "time" value is closest to the given time.
	 *  @param  {Object}  event  The event to add to the timeline
	 *  @return  {Object}  The event which spans the desired time
	 */
	Tone.IntervalTimeline.prototype.getEvent = function(time){
		if (this._root !== null){
			var results = [];
			this._root.search(time, results);
			if (results.length > 0){
				var max = results[0];
				for (var i = 1; i < results.length; i++){
					if (results[i].low > max.low){
						max = results[i];
					}
				}
				return max.event;
			} 
		}
		return null;
	};

	/**
	 *  Iterate over everything in the timeline.
	 *  @param  {Function}  callback The callback to invoke with every item
	 *  @returns {Tone.IntervalTimeline} this
	 */
	Tone.IntervalTimeline.prototype.forEach = function(callback){
		if (this._root !== null){
			var allNodes = [];
			if (this._root !== null){
				this._root.traverse(function(node){
					allNodes.push(node);
				});
			}
			for (var i = 0; i < allNodes.length; i++){
				var ev = allNodes[i].event;
				if (ev){
					callback(ev);
				}
			}
		}
		return this;
	};

	/**
	 *  Iterate over everything in the array in which the given time
	 *  overlaps with the time and duration time of the event.
	 *  @param  {Time}  time The time to check if items are overlapping
	 *  @param  {Function}  callback The callback to invoke with every item
	 *  @returns {Tone.IntervalTimeline} this
	 */
	Tone.IntervalTimeline.prototype.forEachOverlap = function(time, callback){
		time = this.toSeconds(time);
		if (this._root !== null){
			var results = [];
			this._root.search(time, results);
			for (var i = results.length - 1; i >= 0; i--){
				var ev = results[i].event;
				if (ev){
					callback(ev);
				}
			}
		}
		return this;
	};

	/**
	 *  Iterate over everything in the array in which the time is greater
	 *  than the given time.
	 *  @param  {Time}  time The time to check if items are before
	 *  @param  {Function}  callback The callback to invoke with every item
	 *  @returns {Tone.IntervalTimeline} this
	 */
	Tone.IntervalTimeline.prototype.forEachAfter = function(time, callback){
		time = this.toSeconds(time);
		if (this._root !== null){
			var results = [];
			this._root.searchAfter(time, results);
			for (var i = results.length - 1; i >= 0; i--){
				var ev = results[i].event;
				if (ev){
					callback(ev);
				}
			}
		}
		return this;
	};

	/**
	 *  Clean up
	 *  @return  {Tone.IntervalTimeline}  this
	 */
	Tone.IntervalTimeline.prototype.dispose = function() {
		var allNodes = [];
		if (this._root !== null){
			this._root.traverse(function(node){
				allNodes.push(node);
			});
		}
		for (var i = 0; i < allNodes.length; i++){
			allNodes[i].dispose();
		}
		allNodes = null;
		this._root = null;
		return this;
	};

	///////////////////////////////////////////////////////////////////////////
	//	INTERVAL NODE HELPER
	///////////////////////////////////////////////////////////////////////////

	/**
	 *  Represents a node in the binary search tree, with the addition
	 *  of a "high" value which keeps track of the highest value of
	 *  its children. 
	 *  References: 
	 *  https://brooknovak.wordpress.com/2013/12/07/augmented-interval-tree-in-c/
	 *  http://www.mif.vu.lt/~valdas/ALGORITMAI/LITERATURA/Cormen/Cormen.pdf
	 *  @param {Number} low
	 *  @param {Number} high
	 *  @private
	 */
	var IntervalNode = function(low, high, event){
		//the event container
		this.event = event;
		//the low value
		this.low = low;
		//the high value
		this.high = high;
		//the high value for this and all child nodes
		this.max = this.high;
		//the nodes to the left
		this._left = null;
		//the nodes to the right
		this._right = null;
		//the parent node
		this.parent = null;
		//the number of child nodes
		this.height = 0;
	};

	/** 
	 *  Insert a node into the correct spot in the tree
	 *  @param  {IntervalNode}  node
	 */
	IntervalNode.prototype.insert = function(node) {
		if (node.low <= this.low){
			if (this.left === null){
				this.left = node;
			} else {
				this.left.insert(node);
			}
		} else {
			if (this.right === null){
				this.right = node;
			} else {
				this.right.insert(node);
			}
		}
	};

	/**
	 *  Search the tree for nodes which overlap 
	 *  with the given point
	 *  @param  {Number}  point  The point to query
	 *  @param  {Array}  results  The array to put the results
	 */
	IntervalNode.prototype.search = function(point, results) {
		// If p is to the right of the rightmost point of any interval
		// in this node and all children, there won't be any matches.
		if (point > this.max){
			return;
		}
		// Search left children
		if (this.left !== null){
			this.left.search(point, results);
		}
		// Check this node
		if (this.low <= point && this.high >= point){
			results.push(this);
		}
		// If p is to the left of the time of this interval,
		// then it can't be in any child to the right.
		if (this.low > point){
			return;
		}
		// Search right children
		if (this.right !== null){
			this.right.search(point, results);
		}
	};

	/**
	 *  Search the tree for nodes which are less 
	 *  than the given point
	 *  @param  {Number}  point  The point to query
	 *  @param  {Array}  results  The array to put the results
	 */
	IntervalNode.prototype.searchAfter = function(point, results) {
		// Check this node
		if (this.low >= point){
			results.push(this);
			if (this.left !== null){
				this.left.searchAfter(point, results);
			}
		} 
		// search the right side
		if (this.right !== null){
			this.right.searchAfter(point, results);
		}
	};

	/**
	 *  Invoke the callback on this element and both it's branches
	 *  @param  {Function}  callback
	 */
	IntervalNode.prototype.traverse = function(callback){
		callback(this);
		if (this.left !== null){
			this.left.traverse(callback);
		}
		if (this.right !== null){
			this.right.traverse(callback);
		}
	};

	/**
	 *  Update the height of the node
	 */
	IntervalNode.prototype.updateHeight = function(){
		if (this.left !== null && this.right !== null){
			this.height = Math.max(this.left.height, this.right.height) + 1;
		} else if (this.right !== null){
			this.height = this.right.height + 1;
		} else if (this.left !== null){
			this.height = this.left.height + 1;
		} else {
			this.height = 0;
		}
	};

	/**
	 *  Update the height of the node
	 */
	IntervalNode.prototype.updateMax = function(){
		this.max = this.high;
		if (this.left !== null){
			this.max = Math.max(this.max, this.left.max);
		}
		if (this.right !== null){
			this.max = Math.max(this.max, this.right.max);
		}
	};

	/**
	 *  The balance is how the leafs are distributed on the node
	 *  @return  {Number}  Negative numbers are balanced to the right
	 */
	IntervalNode.prototype.getBalance = function() {
		var balance = 0;
		if (this.left !== null && this.right !== null){
			balance = this.left.height - this.right.height;
		} else if (this.left !== null){
			balance = this.left.height + 1;
		} else if (this.right !== null){
			balance = -(this.right.height + 1);
		}
		return balance;
	};

	/**
	 *  @returns {Boolean} true if this node is the left child
	 *  of its parent
	 */
	IntervalNode.prototype.isLeftChild = function() {
		return this.parent !== null && this.parent.left === this;
	};

	/**
	 *  get/set the left node
	 *  @type {IntervalNode}
	 */
	Object.defineProperty(IntervalNode.prototype, "left", {
		get : function(){
			return this._left;
		},
		set : function(node){
			this._left = node;
			if (node !== null){
				node.parent = this;
			}
			this.updateHeight();
			this.updateMax();
		}
	});

	/**
	 *  get/set the right node
	 *  @type {IntervalNode}
	 */
	Object.defineProperty(IntervalNode.prototype, "right", {
		get : function(){
			return this._right;
		},
		set : function(node){
			this._right = node;
			if (node !== null){
				node.parent = this;
			}
			this.updateHeight();
			this.updateMax();
		}
	});

	/**
	 *  null out references.
	 */
	IntervalNode.prototype.dispose = function() {
		this.parent = null;
		this._left = null;
		this._right = null;
		this.event = null;
	};

	///////////////////////////////////////////////////////////////////////////
	//	END INTERVAL NODE HELPER
	///////////////////////////////////////////////////////////////////////////

	return Tone.IntervalTimeline;
});