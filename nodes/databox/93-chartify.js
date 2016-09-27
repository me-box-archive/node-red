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

const _extractkeys = function(payload){
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

const  _extractdata = function(payload){
	return payload.values ? payload.values : [payload];
}

const _isstring = (value, notstring)=>{
		
	if (value ==  null || value == undefined){
		return notnumber;
	}
	
	if (typeof value === 'string' || value instanceof String){
		if (value.trim() === "")
			return notstring;
		return value;
	}

	if (parseString(value).trim() != ""){
		return parseString(value);
	}
	
	return notstring;
}
		
const _isnumber = (value, notnumber)=>{
	
	if (value ==  null || value == undefined){
		return notnumber;
	}
	
	if (typeof value === 'string' || value instanceof String){
		if (value.trim() === "")
			return notnumber;
		if (/^\d+$/.test(value))
			return Number(value);
	}
	
	if(!isNaN(value)){
		return value;
	}
	
	return notnumber;
}

module.exports = function(RED) {
    "use strict";
    
    function Chartify(n) {
    
    console.log("in chartify node!!!");
        // Create a RED node
        RED.nodes.createNode(this,n);
        
        var node = this; 
		this.xtype = n.xtype ? n.xtype.length > 0 ? n.xtype : null : null;
		this.ytype = n.ytype ? n.ytype.length > 0 ? n.ytype : null : null;
		this.chart = n.chart;
		
		
		const _options = {
			title: _isstring(n.title),	
			xlabel: _isstring(n.xlabel),
			ylabel: _isstring(n.ylabel),
			yaxismin: _isnumber(n.yaxismin),
			yaxismax: _isnumber(n.yaxismax),
			ticks: _isnumber(n.ticks),
			maxreadings: _isnumber(n.maxreadings),
		};
		
		//remove all keys that are undefined.
		const options = Object.keys(_options).reduce((acc, key)=>{
			if (_options[key] != undefined){
				acc[key] = _options[key];
			}	
			return acc;
		},{});		
	
	
		this.on('input', function (msg) {
        	console.log(msg);
        	
          	if (this.xtype && this.ytype){
          		
          		
          		let payload = {};
          		
          		this.ytype.forEach((item)=>{
          			if (item.source === msg.type){
          				let payload = {};      			
	      				payload.options = options;
          			
          				payload.values = {
        					id: `${msg.payload.id} ${item.name}`,
        					type: 'data',
        					dataid: Date.now(),
        				};
    
        				payload.values.x = msg.payload[this.xtype[0].name];
        				payload.values.y =  Number(msg.payload[item.name]);	
        				node.send({type:this.chart, sourceId: node.id, payload:payload});
        			}
          		});
          	}
          	
          	else if (this.xtype){
          		this.xtype.forEach((item)=>{
          			if (item.source === msg.type){
          				let payload = {};
          				payload.options = options;
          			
          				payload.values = {
        					id: `${msg.payload.id} ${item.name}`,
        					type: 'data',
        					dataid: Date.now(),
        				};
        				payload.values.x = msg.payload[item.name];	
        				node.send({type:this.chart, sourceId: node.id, payload:payload});
          			}
        		});
          	}
        });
        
        this.on("close", function() {
           
        });
    }

    // Register the node by name. This must be called before overriding any of the
    // Node functions.
    RED.nodes.registerType("chartify",Chartify);

}