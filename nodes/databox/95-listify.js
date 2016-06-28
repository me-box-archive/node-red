/**
 * Copyright 2016 Tom Lodge
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

// If you use this as a template, update the copyright with your own name.


var _extractkeys = function(payload){
	if (payload.values){
		return Object.keys(payload.values.reduce(function(acc, obj){
          	return Object.keys(obj).reduce(function(acc, key){
          			acc[key] = true;
          			return acc;
          	}, acc);
        }, {}));
    }
    return Object.keys(payload);
}

var _extractdata = function(payload){
	return payload.values ? payload.values : [payload];
}

module.exports = function(RED) {
    "use strict";
   
   
    //Listify assumes that the incoming object with have a payload that either has
    //a single object, or had an objet with a values array
   
    function Listify(n) {
        // Create a RED node
        RED.nodes.createNode(this,n);
		
		var sources = {};
		var keys = [];
		var ticks = {};
        var node = this;
		var TICK_TTL = 2;
		
		this.on('input', function (msg) {
          	
          	if (!sources[msg.payload.id]){
          		
          		//collect list of unique keys of objects contained in the payload values array.  Could
          		//assume that all objects will have same attributes and just pull out keys from the
          		//first element, but probably better to pick up all.
          		
          		var newkeys = _extractkeys(msg.payload);
          		 
          		//combine current set of keys with new keys discovered above
          		keys = keys.concat(newkeys.filter(function (item) {
    					return keys.indexOf(item) < 0;
				}));
          		
          	}
          	
          	TICK_TTL = Math.max(Object.keys(sources).length * 2, TICK_TTL);
          	
          	//remember last set of values for this data source
          	sources[msg.payload.id] = _extractdata(msg.payload);
          	
        
        	//record how many ticks (a tick === datasource event);
        	  	
          	ticks[msg.payload.id] = 0;
        
          	ticks = Object.keys(ticks).reduce(function(acc, key){
          		acc[key] = (key === msg.payload.id) ? ticks[key] : ticks[key] + 1; 
          		return acc;
          	}, {});
          	
          	
          	//flush old data          	
          	var flushed = false;
          	
          	sources = Object.keys(sources).reduce(function(acc,item){
          		if (ticks[item] < TICK_TTL){
          			 acc[item] = sources[item];
          		}else{
          			delete sources[item];
          			delete ticks[item];
          			flushed = true;
          		}
          		return acc;
          	},{})
          	
          	if (flushed){ //recalculate all keys
          		keys = [];
          		
          		Object.keys(sources).forEach(function(key){
					
					var newkeys = Object.keys(sources[key].reduce(function(acc, obj){
						return Object.keys(obj).reduce(function(acc, key){
							acc[key] = true;
							return acc;
						}, acc);
					}, {}));
				
					//combine current set of keys with new keys discovered above
					keys = keys.concat(newkeys.filter(function (item) {
							return keys.indexOf(item) < 0;
					}));
          			
          		});
          	}
          	
          	
          	
          	//create rows as a combination of all of the last values for each datasource
          	var rows = Object.keys(sources).reduce(function(acc, key){
          		return acc.concat(sources[key]);
          	},[]);
          	
          	msg.payload = {
          		timestamp: Date.now(),
          		keys:keys,
          		rows:rows,
          	}
          	
          	node.send(msg);
        
        });
        
        this.on("close", function() {
           
        });
    }

    // Register the node by name. This must be called before overriding any of the
    // Node functions.
    RED.nodes.registerType("listify",Listify);

}