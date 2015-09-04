define(["Tone/core/Tone", "Tone/core/Types"], function (Tone) {

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
		if (this._root === null){
			this._root = new IntervalNode(event.time, event.time + event.duration, event);
		} else {
			this._root.insert(new IntervalNode(event.time, event.time + event.duration, event));
		}
		this._length++;
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
	 *  Replace the references to the node in the node's parent
	 *  with the replacement node.
	 *  @param  {IntervalNode}  node        
	 *  @param  {IntervalNode}  replacement 
	 *  @private
	 */
	Tone.IntervalTimeline.prototype._replaceNodeInParent = function(node, replacement){
		if (node.parent !== null){
			if (node.parent.left === node){
				node.parent.left = replacement;
			} else {
				node.parent.right = replacement;
			}
		} else {
			this._root = replacement;
		}
		if (replacement !== null){
			replacement.parent = node.parent;
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
			var replacement;
			if (node.right.left === null){
				replacement = node.right;
				replacement.left = node.left;
			} else {
				replacement = node.right.getMinNode();
				replacement.parent.left = replacement.right;
				replacement.left = node.left;
				replacement.right = node.right;
			}
			this._replaceNodeInParent(node, replacement);
		}
		node.dispose();
	};

	/**
	 *  Get an event whose time and duration span the give time. Will
	 *  return the match whose "time" value is closest to the given time.
	 *  @param  {Object}  event  The event to add to the timeline
	 *  @return  {Object}  The event which spans the desired time
	 */
	Tone.IntervalTimeline.prototype.getEvent = function(time){
		var results = [];
		if (this._root !== null){
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
				callback(allNodes[i].event);
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
		//iterate over the items in reverse so that removing an item doesn't break things
		time = this.toSeconds(time);
		if (this._root !== null){
			var results = [];
			this._root.search(time, results);
			for (var i = results.length - 1; i >= 0; i--){
				callback(results[i].event);
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
		//iterate over the items in reverse so that removing an item doesn't break things
		time = this.toSeconds(time);
		if (this._root !== null){
			var results = [];
			this._root.searchAfter(time, results);
			for (var i = results.length - 1; i >= 0; i--){
				callback(results[i].event);
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
	 *  Interval tree algorithm from: http://www.mif.vu.lt/~valdas/ALGORITMAI/LITERATURA/Cormen/Cormen.pdf
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
		this.left = null;
		//the nodes to the right
		this.right = null;
		//the parent node
		this.parent = null;
	};

	/** 
	 *  Insert a node into the correct spot in the tree
	 *  @param  {IntervalNode}  node
	 */
	IntervalNode.prototype.insert = function(node) {
		if (node.high > this.max){
			this.max = node.high;
		}
		if (node.low <= this.low){
			if (this.left === null){
				this.left = node;
				node.parent = this;
			} else {
				this.left.insert(node);
			}
		} else {
			if (this.right === null){
				this.right = node;
				node.parent = this;
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
			// Search both sides
			if (this.left !== null){
				this.left.searchAfter(point, results);
			}
		} 
		if (this.right !== null){
			this.right.searchAfter(point, results);
		}
	};

	/**
	 *  Search the tree for nodes which overlap 
	 *  with the given point
	 *  @param  {Number}  point  The point to query
	 */
	IntervalNode.prototype.getMinNode = function(){
		var current_node = this;
		while (current_node.left !== null){
			current_node = current_node.left;
		}
		return current_node;
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
	 *  null out references.
	 */
	IntervalNode.prototype.dispose = function() {
		this.parent = null;
		this.left = null;
		this.right = null;
		this.event = null;
	};

	///////////////////////////////////////////////////////////////////////////
	//	END INTERVAL NODE HELPER
	///////////////////////////////////////////////////////////////////////////

	return Tone.IntervalTimeline;
});