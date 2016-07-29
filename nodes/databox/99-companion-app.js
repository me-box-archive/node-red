/**
 * Copyright 2014 IBM Corp.
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
var client;

// Sample Node-RED node file
var sendmessage = function(msg){
    try{
        client.publish('webapp', JSON.stringify(msg.payload));
    }catch(err){
        console.log(err);
    }
}

module.exports = function(RED) {
    "use strict";
    var mqtt = require('mqtt');
    // require any external libraries we may need....
    //var foo = require("foo-library");

    // The main node definition - most things happen in here
    function CompanionApp(n) {
        // Create a RED node
        RED.nodes.createNode(this,n);
		//'mqtt://mosquitto:1883'
        client = mqtt.connect('mqtt://mosquitto:1883');

        // Store local copies of the node configuration (as defined in the .html)
        this.topic = n.topic;

        // copy "this" object in case we need it in context of callbacks of other functions.
        var node = this;

        // respond to inputs....
        this.on('input', function (m) {

            var msg = {}

            msg.payload = {
                id:   node.id,
                name: node.name || "app", 
                view: m.type || "text", 
                data: m.payload, //{keys: Object.keys(m.payload.values[0]), rows: m.payload.values}
            }
            sendmessage(msg);
        });

        this.on("close", function() {
            // Called when the node is shutdown - eg on redeploy.
            // Allows ports to be closed, connections dropped etc.
            // eg: node.client.disconnect();
        });
    }

    // Register the node by name. This must be called before overriding any of the
    // Node functions.
    RED.nodes.registerType("app",CompanionApp);

}