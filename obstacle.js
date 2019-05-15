function Obstacle() {
   
	this.x = [];
	this.y = [];
	this.pixlSize = 1;//obstacle draw resolution
	
	this.updateIndex = function(indexValue){//this will run in case of deleting an existing obstacle
		this.obstacleIndex = indexValue;
	}
	
	this.update = function(x,y){
    	this.x.push(round(x/this.pixlSize)*this.pixlSize);
        this.y.push(round(y/this.pixlSize)*this.pixlSize);
        
        if(this.x.length>1){//text display
        	textNow = obstacleText.value();
        	obstacleText.value([textNow,this.x[this.x.length-1],this.y[this.y.length-1]]);
        }
        else{
        	obstacleText.value([this.x[this.x.length-1],this.y[this.y.length-1]]);
        }
        
        //for future use
        this.textString = obstacleText.value();
        
        this.xMean=0;
    	this.yMean=0;
    	for(var i = 0; i<this.x.length; i++){
    		this.xMean = this.xMean+this.x[i]; this.yMean = this.yMean+this.y[i];	
    	}
    	this.xMean = this.xMean/this.x.length;
    	this.yMean = this.yMean/this.y.length;
    	
    	//index
    	if(this.x.length>0){
    		this.obstacleIndex = obstacleDropdown.value()-1;//index of the object
    	}
    	
    };
    
    this.drawBoarder = function(){
    	beginShape();
    	
    	for(var i = 0; i<this.x.length; i++){
    		stroke(obstacleColor);
            fill(obstacleColor);
    		vertex(this.x[i],this.y[i]);
    	}
    	endShape(CLOSE);
    	
    	stroke(50)
    	fill(255)
    	
    	if(this.x.length>1){
    	text(this.obstacleIndex+1,this.xMean,this.yMean);
    	}
    };
    
    
  //Point2 arrays
    var reflexVertices = []; 
    var nonReflexVertices = [];
    var vertices = [];
    
    var angles = [];//angle with x+ axis
    var gradients = [];//gradient of edges
    var insideAngles = [];//interior angles
       
    this.calculateReflexVertices = function(){
    	
    	for(var i=0; i<this.x.length; i++){
    		
    		vertices[i] = new Point2(this.x[i],this.y[i]);
    		
    		if(i>0){
    			angles[i-1] = atan2P2(vertices[i-1], vertices[i]);
    			gradients[i-1] = Math.tan(angles[i-1]);
    			
    		}
    		if(i==this.x.length-1){
    			angles[i] = atan2P2(vertices[i],vertices[0]);
    			gradients[i] = Math.tan(angles[i]);
    		}
    		
    		if(i>1){
    			insideAngles[i-2]=(angles[i-2]-angles[i-1])*180/PI;
    		}
    		if(i==this.x.length-1){
    			insideAngles[i-1] = (angles[i-1]-angles[i])*180/PI;
    			insideAngles[i] = (angles[i]-angles[0])*180/PI;
    		}
    		
    		
    	}
    	
    	
    	insideAngles.unshift(insideAngles.pop());	//cycle
    	    	
    	
    	var reflexVerticesCount = 0;
    	for(var i=0; i <insideAngles.length; i++){
    		 
    		if(insideAngles[i]<-180){
    			insideAngles[i] = 360+insideAngles[i];
    		}
    		
    		if(insideAngles[i]<0 || insideAngles[i]>180){
    			reflexVertices.push(vertices[i]);
    			reflexVerticesCount += 1;
    		}
    		else{
    			nonReflexVertices.push(vertices[i]); 
    		}
    		
    	}
    	//print(insideAngles);
    	//print(nonReflexVertices);
    	this.nonReflexVertices = nonReflexVertices;
    	this.vertices = vertices;
    	
    	// for bounding box
    	this.largestX = max(this.x);
    	this.largestY = max(this.y);
    	this.smallestX = min(this.x);
    	this.smallestY = min(this.y);
    	this.isConvex = reflexVerticesCount == 0;
    	
    	// for bounding box stage 2:
    	
    	var normalDirectionArray = [];
    	var offsetArray = [];
    	var largestXArray = [];
    	var largestYArray = [];
    	var smallestXArray = [];
    	var smallestYArray = [];
		
    	for(var i=0; i<vertices.length-1; i++){
    		c = this.vertices[i];
    		d = this.vertices[i+1];
    		
    		normalDirectionArray.push(new Point2(-(d.y-c.y),d.x-c.x));
    		offsetArray.push(dotP2(c,normalDirectionArray[normalDirectionArray.length-1]));
    		largestXArray.push(max([c.x,d.x]));
    		largestYArray.push(max([c.y,d.y]));
    		smallestXArray.push(min([c.x,d.x]));
    		smallestYArray.push(min([c.y,d.y]));
    	}
    	
    	this.normalDirectionArray = normalDirectionArray;
    	this.offsetArray = offsetArray;
    	this.largestXArray = largestXArray;
    	this.largestYArray = largestYArray;
    	this.smallestXArray = smallestXArray;
    	this.smallestYArray = smallestYArray;
    }
}