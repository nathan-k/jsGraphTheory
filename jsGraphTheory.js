var jsGraph = (function(){
    
    /**
     * Create a Graph
     * @constructor
     * @param {jsGraph} graphToClone - An optional graph to clone
     */
    function jsGraph(graphToClone){
        this._nodes = {};
        this._size = 0;
        
        if(graphToClone){
			// Clone graph
            var nodeObj = graphToClone.get_nodes_obj();
            
            // Copy all nodes
            for(var nodeId in nodeObj){
                var curNode = nodeObj[nodeId];
                this._nodes[nodeId] = {adjNodes: [], nodeId: curNode.nodeId};
                
                // Copy edges
                for(var i=0, adjNodeCount=curNode.adjNodes.length; i< adjNodeCount; i++){
                    this._nodes[nodeId].adjNodes.push(curNode.adjNodes[i]);
                }
            }
            
            // Set graph data
            this._nodes = graphToClone.get_nodes_obj();
            this._size = graphToClone.get_size();
        }
    }
    
    /**
     * Get a pointer to the adjacency list
     * @returns {Object} Pointer to the adjacency list for this graph
     */
    jsGraph.prototype.get_nodes_obj = function(){
        return this._nodes;
    }
    
    /**
     * Used internally by the library to display errors in the console.
     * @param {String} message - The error message to display
     */
    jsGraph.prototype.error = function(message){
        console.log("jsGraphTheory error>>> "+message);
        return false;
    }
    
    /**
     * Add a node with to the graph
     * @param nodeId - The id of the new node
     * @param nodeValue - An optional value for the node
     */
    jsGraph.prototype.add_node = function(nodeId, nodeValue){
        nodeId = String(nodeId);
        if(this._nodes.hasOwnProperty(nodeId)){
            return this.error("Cannot add node; nodeId '"+nodeId+"' already exists.");
        }
        
        this._nodes[nodeId] = {
            adjNodes: [],
            edgeValues: [],  // Same index as adjNodes; not yet implemented, will be used for weights
            nodeValue: nodeValue,
            nodeId: nodeId,
        };
    }
    
    
    /**
     * Add an edge to the graph between two nodes
     * @param {Array} edgeArray - An array containing two nodeIds
     */
    jsGraph.prototype.add_edge = function(edgeArray){
        var node1Id = String(edgeArray[0]);
        var node2Id = String(edgeArray[1]);
        if(!this._nodes.hasOwnProperty(node1Id)){
            return this.error("Cannot add edge ["+node1Id+", "+node2Id+"]; node '"+node1Id+"' does not exist.");
        }
        if(!this._nodes.hasOwnProperty(node2Id)){
            return this.error("Cannot add edge ["+node1Id+", "+node2Id+"]; node '"+node2Id+"' does not exist.");
        }
        
        this._nodes[node1Id].adjNodes.push(node2Id);
        
        // Add adjacency to other node unless edge is a loop
        if(node1Id != node2Id){
            this._nodes[node2Id].adjNodes.push(node1Id);
        }
        
        this._size++;
    }
    
    
    /**
     * Remove a node from the graph, and all incident edges
     * @param {String} nodeId - The id of the node to delete
     */
    jsGraph.prototype.remove_node = function(nodeId){
        var nodeId = String(nodeId);
        if(!this._nodes.hasOwnProperty(nodeId)){
            return this.error("Cannot remove non-existent node '"+nodeId+"'.");
        }
        
        var node = this._nodes[nodeId];
        
        // Remove all edges incident with this node
        for(var i=node.adjNodes.length-1; i>=0; i--){
            this.remove_edge([nodeId, node.adjNodes[i]]);
        }
        
        delete this._nodes[nodeId];
    }
    
    
    /**
     * Remove and edge from the graph
     * @param {Array} edgeArray - An array containing two nodeIds
     */
    jsGraph.prototype.remove_edge = function(edgeArray){
        var node1Id = String(edgeArray[0]);
        var node2Id = String(edgeArray[1]);
        if(!this._nodes.hasOwnProperty(node1Id)){
            return this.error("Cannot remove edge ["+node1Id+", "+node2Id+"]; node '"+node1Id+"' does not exist.");
        }
        if(!this._nodes.hasOwnProperty(node2Id)){
            return this.error("Cannot remove edge ["+node1Id+", "+node2Id+"]; node '"+node2Id+"' does not exist.");
        }
        
        var node1 = this._nodes[node1Id];
        var node2 = this._nodes[node2Id];
        var indexInNode1 = node1.adjNodes.indexOf(node2Id);
        var indexInNode2 = node2.adjNodes.indexOf(node1Id);
        
        if(indexInNode1 == -1){
            return this.error("Cannot remove edge ["+node1Id+", "+node2Id+"]; no such edge exists.");
        }
        
        // Remove the reference from the first node
        node1.adjNodes.splice(indexInNode1, 1);
        
        // Remove the reference from the other node if it is not a loop (self-reference)
        if(node1Id != node2Id){
            node2.adjNodes.splice(indexInNode2, 1);
        }
        
        this._size--;
    }
    
    
    /**
     * Determine if two nodes are adjacent
     * @param {String} node1Id - The id of the first node
     * @param {String} node2Id - The id of the second node
     * @return {Boolean} Whether or not the nodes are adjacent
     */
    jsGraph.prototype.is_adjacent = function(node1Id, node2Id){
        var node1Id = String(node1Id);
        var node2Id = String(node2Id);
        if(!this._nodes.hasOwnProperty(node1Id)){
            return this.error("Cannot run is_adjacent, node "+node1Id+" doesn't exist.");
        }
        if(!this._nodes.hasOwnProperty(node2Id)){
            return this.error("Cannot run is_adjacent, node "+node2Id+" doesn't exist.");
        }
        
        return (this._nodes[node1Id].adjNodes.indexOf(node2Id) != -1);
    }
    
    /**
     * Return all neighbors of the specified node
     * @param {String} nodeId - The id of the node
     * @returns {Array} An array of all adjacent nodes
     */
    jsGraph.prototype.get_neighbors = function(nodeId){
        var nodeId = String(nodeId);
        if(!this._nodes.hasOwnProperty(nodeId)){
            return this.error("Cannot get_neighbors(), node "+nodeId+" doesn't exist.");
        }
        
        return this._nodes[nodeId].adjNodes;
    }
    
    /**
     * Get the value of the specified node
     * @param {String} nodeId - The id of the node
     * @returns {String|Number} The value of the node
     */
    jsGraph.prototype.get_node_value = function(nodeId){
        var nodeId = String(nodeId);
        if(!this._nodes.hasOwnProperty(nodeId)){
            return this.error("Cannot get_node_value(), node "+nodeId+" doesn't exist.");
        }
        
        return this._nodes[nodeId].nodeValue;
    }
    
    
    /**
     * Set the value of a node
     * @param {String} nodeId - The id of the node
     * @param {String|Number} value - The value of the node
     */
    jsGraph.prototype.set_node_value = function(nodeId, value){
        var nodeId = String(nodeId);
        if(!this._nodes.hasOwnProperty(nodeId)){
            return this.error("Cannot get_node_value(), node "+nodeId+" doesn't exist.");
        }
        
        this._nodes[nodeId].nodeValue = value;
    }
    
    
    /**
     * Get the order of the graph
     * @returns {Number} The order of the graph
     */
    jsGraph.prototype.get_order = function(){
        return Object.keys(this._nodes).length;
    }
    
    
    /**
     * Get the size of the graph
     * @returns {Number} The size of the graph
     */
    jsGraph.prototype.get_size = function(){
        return this._size;
    }
    
    
    /**
     * Get the degree of the node
     * @param {String} nodeId - The id of the node
     * @returns {Number} The degree of the node
     */
    jsGraph.prototype.get_degree = function(nodeId){
        if(!this._nodes.hasOwnProperty(nodeId)){
            return this.error("Cannot get_degree(), node "+nodeId+" doesn't exist.");
        }
        
        return this._nodes[nodeId].adjNodes.length;
    }
    
    
    
    /**
     * Debugging function used to display information about the graph
     */
    jsGraph.prototype.display_info = function(){
        console.log("this._nodes: ", this._nodes);
        console.log("Size: "+this.get_size()+"; Order: "+this.get_order()+"; Components: "+this.count_components());
        
        for(var nodeId in this._nodes){
            console.log("Adjacent to node "+nodeId+": "+this._nodes[nodeId].adjNodes);
        }
    }
    
    /**
     * Count the number of components in the graph
     * @returns {Number} The number of components in the graph
     */
    jsGraph.prototype.count_components = function(){
        var componentCount = 0;
        var visited = {};
        var nodeArray = this._nodes;
        
        var dfs = function(node){
            var adjNodes = node.adjNodes;
            for(var i=0, adjNodeCount=adjNodes.length; i<adjNodeCount; i++){
                if(visited[adjNodes[i]] != true){
                    visited[adjNodes[i]] = true;
                    dfs(nodeArray[adjNodes[i]]);
                }
            }
        }
        
        for(nodeId in this._nodes){
            if(!visited.hasOwnProperty(nodeId) || visited[nodeId] != true){
                componentCount++;
                visited[nodeId] = true;
                dfs(this._nodes[nodeId]);
            }
        }
        
        return componentCount;
    }
    
    
    /**
     * Get the ids of all nodes
     * @returns {Array} An array containing every node id
     */
    jsGraph.prototype.get_node_ids = function(){
        return Object.keys(this._nodes);
    }
    
    
    /**
     * Determine if an edge is a bridge
     * @param edge {Array} - An edge array containing two node ids
     * @returns {Boolean} True if the edge is a bridge, otherwise false
     */
    jsGraph.prototype.is_bridge = function(edge){
    // Need to add weight back in once weighted graphs are supported
        edge[0] = String(edge[0]);
        edge[1] = String(edge[1]);
        var componentCountStart = this.count_components();
        var returnVal = false;
        
        if(!this.is_adjacent(edge[0], edge[1])){
            return this.error("Cannot run is_bridge(), edge ["+edge[0]+", "+edge[1]+"] doesn't exis");
        }
        
        this.remove_edge(edge);
        if(this.count_components() != componentCountStart){
            // Not a bridge
            returnVal = true;
        }
        
        this.add_edge(edge);
        
        return returnVal;
    }
    
    /**
     * Use fleury's algorithm to find an Euler circuit
     * @startNode {String} The id of the node to start from (optional)
     * @returns {jsGraph} A new graph representing the circuit
     */
    jsGraph.prototype.algo_fleury = function(startNode){
      // Runs fleury's algorithm and returns an Euler circuit. Accepts a start node
      
        // Check if the graph is connected
        if(this.count_components() != 1){
            // Graph not connected
            return this.error("Cannot run algo_fleury(), graph is not connected.");
        }
        
        // Check if all vertices are even degree
        for(var nodeId in this._nodes){
            if(this.get_degree(nodeId) % 2 != 0){
                // Not all even degreed
                return this.error("Cannot run algo_fleury(), not all vertices even degree.");
            }
        }
        
        if(!startNode){
            // No startNode specified; pick one
            var startNodeId = Object.keys(this._nodes)[0];
        }
        
        // Clone the graph
        var tempGraph = new jsGraph(this);
        
        
        
        // Run the algo
        var curU = startNodeId;
        var curV;
        var eulerCircuit = [curU];
        
        
        while(tempGraph.get_size() > 0){
            var curUNeighbors = this.get_neighbors(curU);
            curV = curUNeighbors[0];
            var i = 1;
            
            // If [curU, curV] is a bridge, choose a different edge until one not a bridge is found
            while(this.is_bridge([curU, curV]) && i < curUNeighbors.length){
                curV = curUNeighbors[i];
                i++;
            }
            
            eulerCircuit.push(curV);
            tempGraph.remove_edge([curU, curV]);
            curU = curV;
        }
        
        return eulerCircuit;
    }
    
    
    return jsGraph;
    
}());
