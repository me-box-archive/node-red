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
    //a single object, or had an object with a values array
   
    function Chartify(n) {
        // Create a RED node
        RED.nodes.createNode(this,n);
        
        var node = this;
		this.xtype = n.xtype.type,
		this.xsource = n.xtype.source,
		
		this.ytype = n.ytype.type,
		this.ysource = n.ytype.source,
		this.chart = n.chart;
		
		const initmsg =	{type:"chart",  payload:{
			type:'init',
			chart: this.chart,
			xscale: 'auto',
			yscale: 'auto',
			ticks: 5,
			title: 'a test title',
			xlabel: 'a test x label',
			ylabel: 'a test y label',
			maxreadings: 10,
		}};
		
		let init = false;
		
		this.on('input', function (msg) {
        	
        	if (!init){
        		node.send(initmsg);
        		init = true;
        	}  	
          	
          	var payload = {}
  			
  			payload.id = msg.payload.id;
  			payload.type = 'data';      	
          	
          	
          	if (msg.name === this.xsource){
          		payload.x = msg.payload[this.xtype];
          	}
          	
          	if (msg.name === this.ysource){
          		payload.y = Number(msg.payload[this.ytype]);
          	}
          	
          	console.log({type:'chart', payload:payload});
          	node.send({type:'chart', payload:payload});
        
        });
        
        this.on("close", function() {
           
        });
    }

    // Register the node by name. This must be called before overriding any of the
    // Node functions.
    RED.nodes.registerType("chartify",Chartify);

}