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
   
    function Chartify(n) {
        // Create a RED node
        RED.nodes.createNode(this,n);
        
        var node = this;
        
   
        
		this.xtype = n.xtype ? n.xtype.type : null,
		this.xsource = n.xtype ? n.xtype.source: null,
		
		this.ytype = n.ytype ? n.ytype.type : null,
		this.ysource = n.ytype ? n.ytype.source : null,
		this.chart = n.chart;
		
		const initmsg =	{type:this.chart,  payload:{
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
        		//node.send(initmsg);
        		init = true;
        	}  	
          	
          	var payload = {}
  			
  			payload.id = msg.payload.id;
  			payload.type = 'data';      	
          	
          	
          	if (this.xtype && msg.name === this.xsource){
          		payload.x = msg.payload[this.xtype];
          	}
          	
          	if (this.ytype && msg.name === this.ysource){
          		payload.y = Number(msg.payload[this.ytype]);
          	}
          	
     		
          	node.send({type:this.chart, sourceId: node.id, payload:payload});
        
        });
        
        this.on("close", function() {
           
        });
    }

    // Register the node by name. This must be called before overriding any of the
    // Node functions.
    RED.nodes.registerType("chartify",Chartify);

}