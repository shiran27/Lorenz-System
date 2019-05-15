function Particle(x, y, z) {


    this.x = x;
    this.y = y;
    this.z = z;

    this.position = new Point2(x,y);
    
    //look at this concept
    //this.shadowPosition = new Point2(x,y);//created shadow
    this.shadowsFollowingMode = 0; 
    
    
    
    this.id;
    var r=12; //radius of the particle's circle
    //    var sensR=200; //sensing range
    
    this.velocity = new Point2(0,0);
    
    this.s = [];
    this.v = [];
    this.sRef = [];//smae as referencePointTrajectory
    this.u = [];
    
    
    this.uMaxSq = 100*100; //U_Max^2
    this.vMaxSq = 1000*1000; //V_Max^2
    
    this.trajectoryX = Array.apply(null, Array(senRange)).map(Number.prototype.valueOf,0);//same as s
    this.trajectoryY = Array.apply(null, Array(senRange)).map(Number.prototype.valueOf,0);//same as s
    
    this.timeInstant = 0;//simulation instant living
    
    this.targetReferencePoint;
    this.referencePointTrajectory = [];
    
    this.wayPoints = [];//wayPoints to track
    
    
    
    
    this.traceIt = function(particleNum) {
        noStroke();
        fill(255,204,0);
        ellipse(linearSpeed*(this.x)+width/2,linearSpeed*(this.y)+height/2, 2*r, 2*r);

        //stroke(0);
        fill(0,0,0);
        rectMode(CENTER);
        textAlign(CENTER,CENTER);
        text(particleNum+1,linearSpeed*(this.x)+width/2,linearSpeed*(this.y)+height/2,2*r,2*r);
    
    
    	fill(128,0,0);
    	//fill(colorIn);
    	//stroke(colorIn);
    	stroke(128,0,0);
    	for(var i=0 ; i<this.trajectoryX.length; i++){
    	
    		ellipse(linearSpeed*(this.trajectoryX[i])+width/2, linearSpeed*(this.trajectoryY[i])+height/2, 1, 1);
    		
    	}
    	
    	
        

    }
    
    
 // this function change the position of the particle to the mouse location if the particle is dragged
    this.clicked = function() {
    	
        var d = dist(mouseX, mouseY, linearSpeed*(this.x)+width/2, linearSpeed*(this.y)+height/2);
        if (d < r) {
            /*this.x = mouseX;
            this.y = mouseY;
            this.position = new Point2(this.x,this.y);*/
            return true;
        }
        else{
        	return false;
        }
        
    }
    
    
    //generate point to track 
    this.generateReferencePointTrajectory = function(){
    	
    	
    	//var newTrajectorySegment = getInteriorTrajectoryPointsP2(this.position,this.wayPoints[0],10);
    	var newTrajectorySegment = repeatP2(this.wayPoints[0],5);
		
    	this.referencePointTrajectory = newTrajectorySegment;
		this.targetReferencePoint = this.wayPoints[0];
		this.driveSegmentStateFeedbackControl(newTrajectorySegment.length);
		
    	for(var i=1;i<this.wayPoints.length;i++){

        	//newTrajectorySegment = getInteriorTrajectoryPointsP2(this.wayPoints[i-1],this.wayPoints[i],10);
        	newTrajectorySegment = repeatP2(this.wayPoints[i-1],5);
    		this.referencePointTrajectory = concat(this.referencePointTrajectory,newTrajectorySegment);
    		this.targetReferencePoint = this.wayPoints[i];
    		this.driveSegmentStateFeedbackControl(newTrajectorySegment.length);
    	}
    	
    	//this.driveStateFeedbackControl();
    }
    
    this.driveSegmentStateFeedbackControl = function(segmentLength){
    	
    	var W = 0;//pole position
    	var Zp = 0.95;
    	
    	var K1 = sq(Zp);//controller gains
    	var K2 = -2*Zp*cos(W);
    	
    	var fac1 = -K2-3;
    	var fac2 = -(K1+K2+1)/timeStepSqHf;
    	var fac3 = -2*(K2+2)/timeStep;
    	
    	//h^2/2 = timeStepSqHf; h=timeStep
    	s = [];
    	v = [];
    	sRef = subset(this.referencePointTrajectory,this.referencePointTrajectory.length-segmentLength,segmentLength);
    	u = [];
    	
    	if(this.s.length>0){
    		append(s,this.s[this.s.length-1]);//s_0
    		append(v,this.v[this.v.length-1]);//v_0
    	}
    	else{
    		append(s,this.position);//s_0
    		append(v,this.velocity);//v_0
    	}
    	append(u,new Point2(0,0))//u_0
    	
    	
    	for(var k=0; k<(sRef.length-2); k++){
    		var term1 = plusP2( productP2(u[k],fac1) , productP2(s[k],fac2) );
    		var term2 = plusP2( productP2(sRef[k],K1) , plusP2( productP2(sRef[k+1],K2) , sRef[k+2]) );
    		var term3 = plusP2( productP2(v[k],fac3) , productP2(term2,(1/timeStepSqHf)));
    		
    		var uNew = plusP2(term1 , plusP2(term2,term3) );
    		uNew = saturateP2(uNew,this.uMaxSq);
    		append(u, uNew);
    		
    		append(s, plusP2( s[k] , plusP2( productP2(v[k],timeStep) , productP2(u[k],timeStepSqHf) ) )  );
    		
    		var vNew = plusP2( v[k] , productP2(u[k],timeStep) );
    		vNew = saturateP2(vNew,this.vMaxSq);
    		append(v, vNew );
			
    		//print(this.targetReferencePoint);
    		if( k==(sRef.length-3) && distP2(this.targetReferencePoint,s[k+1])>5 ){
    			//print('Extending');
    			append(sRef,this.targetReferencePoint);
    		}
    		else if(k==(sRef.length-3) ){
    			//print(normP2(v[k+1]));
    			//v[k+1]=new Point2(0,0);
    			break;
    		}
    		
    		
    	}
    	//this.controlInputArray = this.u;
    	this.s = concat(this.s , s);
    	this.v = concat(this.v , v);
    	this.u = concat(this.u , u);
    	this.sRef = concat(this.sRef , sRef);
    	this.trajectory = this.s;
    	
    }
    
    
    this.driveStateFeedbackControl = function(){
    	//controller gains
    	/*var W = PI/3;//pole position
    	var Zp = 0.95;
    	var K1 = sq(Zp);
    	var K2 = -2*Zp*cos(W);*/
    	
    	var Zp = 0.95//pole position
    	
    	var K1 = sq(Zp);
    	var K2 = -2*Zp;
    	
    	var fac1 = -K2-3;
    	var fac2 = -(K1+K2+1)/timeStepSqHf;
    	var fac3 = -2*(K2+2)/timeStep;
    	
    	//h^2/2 = timeStepSqHf; h=timeStep
    	
    	
    	this.sRef = this.referencePointTrajectory;
    	append(this.s,this.position);//s_0
    	append(this.v,this.velocity);//v_0
    	append(this.u,new Point2(0,0))//u_0
    	
    	
    	for(var k=0; k<(this.sRef.length-2); k++){
    		var term1 = plusP2( productP2(this.u[k],fac1) , productP2(this.s[k],fac2) );
    		var term2 = plusP2( productP2(this.sRef[k],K1) , plusP2( productP2(this.sRef[k+1],K2) , this.sRef[k+2]) );
    		var term3 = plusP2( productP2(this.v[k],fac3) , productP2(term2,(1/timeStepSqHf)));
    		
    		var uNew = plusP2(term1 , plusP2(term2,term3) );
    		uNew = saturateP2(uNew,this.uMaxSq);
    		append(this.u, uNew);
    		
    		append(this.s, plusP2( this.s[k] , plusP2( productP2(this.v[k],timeStep) , productP2(this.u[k],timeStepSqHf) ) )  );
    		
    		var vNew = plusP2( this.v[k] , productP2(this.u[k],timeStep) );
    		vNew = saturateP2(vNew,this.vMaxSq);
    		append(this.v, vNew );
			
    		if( k==(this.sRef.length-3) && distP2(this.targetReferencePoint,this.s[k])>5 ){
    			//print('Extending');
    			append(this.sRef,this.targetReferencePoint)
    		}
    		else if(k==(this.sRef.length-3)){
    			break;
    		}
    		
    	}
    	//this.controlInputArray = this.u;
    	this.trajectory = this.s;
    	
    }
    
    
    
    this.update = function(particleNum) {//old update function
        this.id=particleNum;
        var v=[];
        v=speed(this.id);
            
        nextPosition = new  Point2(this.x+hStep*linearSpeed*v[0],this.y+hStep*linearSpeed*v[1]);    
        
        //adjustedNextPosition = this.avoidObstacles(nextPosition);
        
        this.x = nextPosition.x;
        this.y = nextPosition.y;
                            
        //moving in to use point2 arrays
        this.position = nextPosition;
        
    }
    
    this.updateNew = function(particleNum) {//new update function
        this.id = particleNum;
        var derivatives = this.getDerivatives();
        if(particleNum==1){        
        	//print(derivatives);
        }
        
        nextPosition = new  Point2(this.x+hStep*derivatives[0],this.y+hStep*derivatives[1]);    
        
        if(obstacles.length>0){
        	nextPosition = this.avoidObstacles(nextPosition);
        }
        
        
        this.x = nextPosition.x;
        this.y = nextPosition.y;
                            
        //moving in to use point2 arrays
        this.position = nextPosition;
        
        
    }
    
    this.avoidObstacles = function(nextPosition){
    	//move to cost functions. later on finalize this
    	
    	if(!isLineOfSight(this.position,nextPosition)){
    		//print("Colliding");
    		//print(this.position);print(nextPosition);
    		var collidingEdge = getIntersectingVertices(this.position,intermediateP2(this.position,nextPosition,-3));
    		//print(collidingEdge);
    		if(collidingEdge.length!=2){
    			print("Colliding Edge Finding Error");
    			return this.position;
    		}
    		var u =[];
    		var projections = [];
    		var maxIndex;
    			
    		for(var k = 0; k < 2; k++) {
    			var v_ij = collidingEdge[k];
    			u[k] = normalizeP2(minusP2(v_ij,this.position));
    			projections[k] = dotP2(u[k],minusP2(nextPosition,this.position));
    			//print(v_ij);
    		}//optimize this
    		maxIndex = projections.indexOf(max(projections));
    		minIndex = projections.indexOf(min(projections));
    		var direction = normalizeP2(minusP2(collidingEdge[maxIndex],collidingEdge[minIndex]));
    		nextPosition = plusP2(this.position,productP2(direction,projections[maxIndex]));
    	}
    	return nextPosition;
    	
    }


        

    



    this.show = function(particleNum) {
        noStroke();
        fill(255,204,0);
        ellipse(this.x, this.y, 2*r, 2*r);

        //stroke(0);
        fill(0,0,0);
        rectMode(CENTER);
        textAlign(CENTER,CENTER);
        text(particleNum+1,this.x,this.y,2*r,2*r);
        
        
        //trajectory printing
        if(this.trajectory.length>0){
        	printPointArrayP2(this.trajectory,"blue",1);
        }
        
        if(typeof this.targetReferencePoint != 'undefined'){
        	fill(0);
            ellipse(this.targetReferencePoint.x, this.targetReferencePoint.y, r, r);
            printPointArrayP2(this.referencePointTrajectory,"red",1);
            printPointArrayP2(this.sRef,"green",3);
        }

    }
    
    
    
    this.showShadow = function(particleNum) {
    	
        noStroke();
        fill(100,255,0,200);
        ellipse(this.x, this.y, 2.5*r, 2.5*r);

        //stroke(0);
        fill(0,0,0);
        rectMode(CENTER);
        textAlign(CENTER,CENTER);
        text(particleNum+1,this.x,this.y,2*r,2*r);
        
        
        //trajectory printing
        if(this.trajectory.length>0){
        	printPointArrayP2(this.trajectory,"blue",4);
        }
        
        if(typeof this.targetReferencePoint != 'undefined'){
        	fill(0);
            ellipse(this.targetReferencePoint.x, this.targetReferencePoint.y, r, r);
            printPointArrayP2(this.referencePointTrajectory,"red",1);
            printPointArrayP2(this.sRef,"green",3);
        }

    }
    

          
    this.neighbor = function() {//old code 
        var neighbors=[];
        for (var i = 0; i < particles.length; i++) {
            if(i!=this.id){
            	if (dist2P(this.position,particles[i].position)<2*senRange){
                    neighbors.push(i);
                }
            }
        }
        return neighbors;
    }
    
    this.updateDebug = function(){
    	this.x = mouseX;
    	this.y = mouseY;
    	this.position.x = this.x;
        this.position.y = this.y;
    }
    
    this.getNearbyNonReflexVertices = function(){
        
    	var nearbyNonReflexVertices = [];
        for (var i = 0; i < obstacles.length; i++) { //search all obstacle non reflex vertices
        	for (var j = 0; j < obstacles[i].nonReflexVertices.length; j++){
        		var s = this.position;
        		var v_ij = obstacles[i].nonReflexVertices[j];
        		if(distP2(s,v_ij) < senRange){
        			//check intersectin with obstacle
        			//two pixels before and after (very close) the intersection point
        			if(!isColorEqualP2C(intermediateP2(s,v_ij,-0.3), obstacleColor)){
        				if(!isColorEqualP2C(intermediateP2(s,v_ij,0.3),obstacleColor)){
        					
        					//fill(30)
        					//ellipse(v_ij.x,v_ij.y,5,5);
        					//printPointArrayP2(pointsBeyondP2(s,v_ij,searchResolution),"blue");
        					//printPointArrayP2(pointsInteriorP2(s,v_ij,searchResolution),"red");
        					
        					//result is array of pairs [obstacle index,NRV index]
        					nearbyNonReflexVertices.push(i);//obstacle index
        					nearbyNonReflexVertices.push(j);//NRV index
        					//need to get to z corresponding to s and v_ij
        				}
        			}
       			
        		}
        	}
        }
        //print(nearbyNonReflexVertices);
        //this.nearbyNonReflexVertices = nearbyNonReflexVertices;
        return nearbyNonReflexVertices;
  
    }
    
    
    
    //sensing using sensingDecayFactor by slider
    this.sensingModelFunction = function(interestedPoint) {
    	var p;
    	var dis = distP2(this.position,interestedPoint);
    	
    	if (dis > senRange) {//out of range
    	    p = 0;
    	}
    	else if(isLineOfSight(this.position,interestedPoint)==false){
    		p = 0; //not in line of sight
    		
    	}
    	else{
    	    p = Math.exp(-sensingDecayFactor*dis);
    		//print("this is it");
    	
    	}
    	return p; 
    	
    }
    
       
    this.getNeighbours = function(){
        var neighbours=[];
        for (var i = 0; i < particleShadows.length; i++) {
        	if(i!=this.id){
        		if (distP2(this.position,particleShadows[i].position)<2*senRange){
        			neighbours.push(i);//this does not include the current (this.)
        		}
        	}
        }
        return neighbours;
    }
    
    //This function calculates the joint probability of detection 
    //at a given point with the help of the neightbours
    this.detectionProbability = function(interestedPoint,exclusiveness){//exahustive method
        var neighbours = this.getNeighbours();
        var jointMissProbability = 1;
        for (var i = 0; i < neighbours.length; i++){
        	jointMissProbability = jointMissProbability*(1-particleShadows[neighbours[i]].sensingModelFunction(interestedPoint));
        }
        if(exclusiveness){
        	return (1-jointMissProbability);
        }
        else{//detection by itself
        	jointMissProbability = jointMissProbability*(1-this.sensingModelFunction(interestedPoint));
        	return (1-jointMissProbability);
        }
    }
    
    this.objectiveFunction = function(){//local yet exaustive
    	var stepSize = 50; 
    	var areaFactor = sq(stepSize);
    	var halfStepSize = stepSize/2;
    	var objectiveValue = 0;
    	   	
    		
    	for (var x = this.x-senRange+halfStepSize; x<=this.x+senRange-halfStepSize; x+=stepSize){
            for(var y = this.y-senRange+halfStepSize; y<=this.y+senRange-halfStepSize; y+=stepSize){
                //fill(0);
            	//ellipse(x,y,2,2);
                var interestedPoint = new Point2(x,y);
                var eventDensity = getEventDensity(interestedPoint);
                var dist = distP2(this.position,interestedPoint);
                
                if(eventDensity>0 && dist<senRange){
                	//ellipse(x,y,2,2);
                	objectiveValue = objectiveValue + this.detectionProbability(interestedPoint,false)*eventDensity*areaFactor;
                }
            }
        }
        //print(objectiveValue);
    	return objectiveValue;	
    }
    
    this.getDerivatives = function(){//local yet exaustive maybe
    	if(obstacles.length>0){
    		var stepSize = 50;
    	}else{
    		var stepSize = 10;
    	}
    	var areaFactor = sq(stepSize);
    	var halfStepSize = stepSize/2;
    	
    	var derivativeXPart1 = 0; var derivativeXPart2 = 0;
    	var derivativeYPart1 = 0; var derivativeYPart2 = 0;
    	
    	for (var x = this.x-senRange+halfStepSize; x<=this.x+senRange-halfStepSize; x+=stepSize){
            for(var y = this.y-senRange+halfStepSize; y<=this.y+senRange-halfStepSize; y+=stepSize){
                //fill(0);
            	//ellipse(x,y,2,2);
                var interestedPoint = new Point2(x,y);
                var eventDensity = getEventDensity(interestedPoint);
                var dist = distP2(this.position,interestedPoint);
                
                if( eventDensity>0 && dist<senRange){
                	//ellipse(x,y,2,2);
                	var distX = this.x-interestedPoint.x;
                	var distY = this.y-interestedPoint.y;
                	
                	if(dist!=0){//otherwise not defined
                		var constantTerm = eventDensity*(1-this.detectionProbability(interestedPoint,true))*(-1*sensingDecayFactor)*this.sensingModelFunction(interestedPoint)*areaFactor/dist;
                		if (distX!=0){
                    		derivativeXPart1 = derivativeXPart1 + constantTerm*distX;
                    	}
                    	if (distY!=0){
                    		derivativeYPart1 = derivativeYPart1 + constantTerm*distY;
                    	}
                	}
                	
                }
            }
        }
    	
    	//part2
    	nearbyNonReflexVertices = this.getNearbyNonReflexVertices();
    	if(nearbyNonReflexVertices.length==0){
    		derivativeXPart2 = 0;
    	}
    	else{//need to do the summation
    		for(var j = 0; j < nearbyNonReflexVertices.length; j = j+2){
    			s = this.position;
    			v_j = obstacles[nearbyNonReflexVertices[j]].nonReflexVertices[nearbyNonReflexVertices[j+1]];
    			
    			var D_j = distP2(s,v_j);
    			
    			n_j = normalizeP2(new Point2(-(s.y-v_j.y),(s.x-v_j.x)));
    			if(!isLineOfSight(s,plusP2(intermediateP2(s,v_j,-0.3),productP2(n_j,2)))){
    				n_j = productP2(n_j,-1);
    			}//now take sign(nj.x)
    			
    			//sin(theta_j)/D_j; theta_j between [0,pi/2];
    			var factor1 = Math.sign(n_j.x)*abs(v_j.y-s.y)/sq(D_j);
    			var factor2 = Math.sign(n_j.y)*abs(v_j.x-s.x)/sq(D_j);
    			
    			stepSize = stepSize/10;//for more resolution
    			
    			pointArray = pointsBeyondP2(s,v_j,stepSize);
    			pointArray.pop();
    			var sum1 = 0;
    			for(var i =0; i<pointArray.length; i++){
    				var x = pointArray[i];//phro_j(r)
    				var r = distP2(x,v_j);
    				
    				sum1 = sum1 + getEventDensity(x)*(1-this.detectionProbability(x,true))*this.sensingModelFunction(x)*r*stepSize; 
    			}
    			
    			derivativeXPart2 = derivativeXPart2 + factor1*sum1;
    			derivativeYPart2 = derivativeYPart2 + factor2*sum1;
    			
    		}
    	}
    	//print(derivativeXPart1);
    	//print(derivativeXPart2);
    	//print(derivativeYPart1);
    	//print(derivativeYPart2);
    	return ([derivativeXPart1+derivativeXPart2,derivativeYPart1+derivativeYPart2]);	
    }
    
    
    
   
    
    
}




function followTrajectory(){//update and show 
	//particleID = 0;
	//print(millis());
	
	particles[particleID].timeInstant++;
	if(particles[particleID].timeInstant<particles[particleID].trajectory.length){
		nextPosition = particles[particleID].trajectory[particles[particleID].timeInstant];
		
		simulationTimeDisplay.html(nf(particles[particleID].timeInstant/10, 2, 2)+" s");
		//print(nf(particles[particleID].controlInputArray[particles[particleID].timeInstant]));
		if(particles[particleID].timeInstant==particles[particleID].trajectory.length-1){
			controlInputDisplay.html(nf(0,2,2)+" i + "+nf(0,2,2)+ "j");	
		}
		else{
			controlInputDisplay.html(nf(particles[particleID].u[particles[particleID].timeInstant].x,2,2)+" i + "+nf(particles[particleID].u[particles[particleID].timeInstant].y,2,2)+ "j");
		}
	}
	else{
		trajectoryFollowMode = 0;
		trajectoryFollowButton.style("background-color", "grey");
		clearInterval(trjectoryFollowingInterval);
		particles[particleID].timeInstant= 0;
	}
	particles[particleID].x = nextPosition.x;
	particles[particleID].y = nextPosition.y;
                        
    //moving in to use point2 arrays
	particles[particleID].position = nextPosition;

	//plotting
	//randomizePlot(particles[particleID].timeInstant);
	
	
}




function followShadows(){//update and show 
	//particleID = 0;
	//print(millis());
	var countTemp = 0 ;
	for(var particleID=0; particleID<particles.length; particleID++){
		particles[particleID].timeInstant++;
		if(particles[particleID].timeInstant<particles[particleID].trajectory.length){
			nextPosition = particles[particleID].trajectory[particles[particleID].timeInstant];
			particles[particleID].x = nextPosition.x;
			particles[particleID].y = nextPosition.y;
			particles[particleID].position = nextPosition;
			
			simulationTimeDisplay.html(nf(particles[0].timeInstant/10, 2, 2)+" s");
		}
		else{
			countTemp++;
			//particles[particleID].shadowsFollowingMode = 0;		
			//particles[particleID].timeInstant= 0;
		}
	
		
	}
	
	if(countTemp==particles.length){
		trajectoryFollowButton.style("background-color", "grey");
		if(shadowsFollowingMode==1){
			shadowsFollowingMode=0;
			clearInterval(shadowsFollowingInterval);
			resetParticleHistory();
		}	
		for(var particleID=0; particleID<particles.length; particleID++){
			particleShadows[particleID].x = particles[particleID].x;
			particleShadows[particleID].y = particles[particleID].y;
			particleShadows[particleID].position = particles[particleID].position;
		}
		
	}
}



function getIntersectingVertices(a,b){//line AB intersecting with what? 
	
	var normalVector = new Point2(-(b.y-a.y),b.x-a.x);
	var offset = dotP2(a,normalVector);
	var result = [];
	//print(normalVector);
	
	for(var i = 0; i<obstacles.length; i++){
		
		for(var j = 0; j < obstacles[i].vertices.length-1 ; j++){
			
			var count2 = 0;//num of edges which does not intersect
			//bounding box
			if(a.x > obstacles[i].largestXArray[j] && b.x > obstacles[i].largestXArray[j]){count2++;}
			else if(a.y > obstacles[i].largestYArray[j] && b.y > obstacles[i].largestYArray[j]){count2++;}
			else if(a.x < obstacles[i].smallestXArray[j] && b.x < obstacles[i].smallestXArray[j]){count2++;}
			else if(a.y < obstacles[i].smallestYArray[j] && b.y < obstacles[i].smallestYArray[j]){count2++;}
			else{//projection check2: // rigorous check stage 3
				
				//projection 1
				var projections1 = [];
				projections1.push(dotP2(obstacles[i].vertices[j],normalVector)-offset);
				projections1.push(dotP2(obstacles[i].vertices[j+1],normalVector)-offset);
				
				//projection 2
				var projections2 = [];
				projections2.push(dotP2(a,obstacles[i].normalDirectionArray[j])-obstacles[i].offsetArray[j]);
				projections2.push(dotP2(b,obstacles[i].normalDirectionArray[j])-obstacles[i].offsetArray[j]);
				
				//print(projections);
				if(projections1[0]*projections1[1]>0 || projections2[0]*projections2[1]>0 ){count2++;}
			}
			
			if(count2==0){//intersection found with a edge (obs-i,edge-j) - stop
				return [obstacles[i].vertices[j],obstacles[i].vertices[j+1]];
			}
			
			
		}
	}
	
	return [];
	
}

function resetParticleHistory(){
	for(var particleID=0; particleID<particles.length; particleID++){
		var lastPosition = particles[particleID].trajectory[particles[particleID].timeInstant];
		if (typeof lastPosition !== 'undefined') {
			particles[particleID].x = lastPosition.x;
			particles[particleID].y = lastPosition.y;
			particles[particleID].position = lastPosition;
		}	
		else{
			//print("trouble")
		}

		particles[particleID].s = [];
		particles[particleID].v = [];
		particles[particleID].sRef = [];//smae as referencePointTrajectory
		particles[particleID].u = [];
		particles[particleID].trajectory = [];//same as s
		particles[particleID].timeInstant = 0;//simulation instant living
		particles[particleID].referencePointTrajectory = [];
		particles[particleID].wayPoints = [];
	
		//particles[particleID].show(particleID);
		
	}
}


function purturbShadows(){
	var purturbationMagnitude=50;
	
	if(obstacles.length==0){
		for (var i=0; i<particleShadows.length; i++){
			var randomDirection = 2*PI*Math.random();
			particleShadows[i].x = particleShadows[i].x + purturbationMagnitude*cos(randomDirection);
			particleShadows[i].y = particleShadows[i].y + purturbationMagnitude*sin(randomDirection);
			particleShadows[i].position = new Point2(particleShadows[i].x,particleShadows[i].y);
		}
		
	}else{
		
		
		
	}
}



function oscillate(){//van der pole oscillator
    var T = 0.1;
    
    for(particleID=0;particleID<particles.length;particleID++){
        
        var xn = particles[particleID].x;
        var yn = particles[particleID].y;  
        
        if(senRange==particles[particleID].trajectoryX.length){
        particles[particleID].trajectoryX.splice(0,1);
        particles[particleID].trajectoryY.splice(0,1);
        
        append(particles[particleID].trajectoryX,xn);
        append(particles[particleID].trajectoryY,yn);
        }
        else if(senRange>particles[particleID].trajectoryX.length){
            append(particles[particleID].trajectoryX,xn);
            append(particles[particleID].trajectoryY,yn);
        }
        else if(senRange<particles[particleID].trajectoryX.length){
            particles[particleID].trajectoryX.splice(0,2);
            particles[particleID].trajectoryY.splice(0,2);
            append(particles[particleID].trajectoryX,xn);
            append(particles[particleID].trajectoryY,yn);
        }
        
        particles[particleID].x = xn + T*yn;
        particles[particleID].y = yn + T*( mu*(1-sq(xn))*yn - xn );
        
        
        particles[particleID].timeInstant++;
    }
    
}



function lorenz(){//van der pole oscillator
    var T = 0.01;//deltaT
    
    for(particleID=0;particleID<particles.length;particleID++){
        
        var xn = particles[particleID].x;
        var yn = particles[particleID].y;
        var zn = particles[particleID].z;

        
        if(senRange==particles[particleID].trajectoryX.length){
        particles[particleID].trajectoryX.splice(0,1);
        particles[particleID].trajectoryY.splice(0,1);
        
        append(particles[particleID].trajectoryX,xn);
        append(particles[particleID].trajectoryY,yn);
        }
        else if(senRange>particles[particleID].trajectoryX.length){
            append(particles[particleID].trajectoryX,xn);
            append(particles[particleID].trajectoryY,yn);
        }
        else if(senRange<particles[particleID].trajectoryX.length){
            particles[particleID].trajectoryX.splice(0,2);
            particles[particleID].trajectoryY.splice(0,2);
            append(particles[particleID].trajectoryX,xn);
            append(particles[particleID].trajectoryY,yn);
        }
        
        particles[particleID].x = xn + sigma*T*(yn-xn);
        particles[particleID].y = yn + T*( xn*(rho-zn) - yn );
        particles[particleID].z = zn + T*( xn*yn - beta*zn );
        //print(xn,yn,zn);
        
        particles[particleID].timeInstant++;
    }
    
}





