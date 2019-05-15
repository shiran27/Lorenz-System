//This function calculates the joint probability of detection at each point
function detectionProbabilityGlobal(interestedPoint){
    var jointMissProbability = 1;
    
    if(particleShadows.length==0){//no particleShadows - nothing to detect
        output = 0;
    }
    else{
        for (var i = 0; i < particleShadows.length; i++){
        	//print(particles[i].sensingModelFunction(interestedPoint));
            jointMissProbability = jointMissProbability*(1-particleShadows[i].sensingModelFunction(interestedPoint));
        }
    }
    return (1-jointMissProbability);
}

//global objective function
function globalObjective(){//old method used to calculate the objective function
    var globalObjectiveValue = 0;
    var stepSize = 50; 
    var halfStepSize = stepSize/2;
    var areaFactor = sq(stepSize);
    
    for (var x = halfStepSize; x <= width - halfStepSize; x+=stepSize){
        for(var y = halfStepSize; y <= height - halfStepSize; y+=stepSize){
        	
        	var interestedPoint = new Point2(x,y);
            var eventDensity = getEventDensity(interestedPoint);
            
            if(eventDensity>0){
            	//print(detectionProbabilityGlobal(interestedPoint));
            	globalObjectiveValue = globalObjectiveValue + detectionProbabilityGlobal(interestedPoint)*eventDensity*areaFactor;
            }
            
        }
    }
    return globalObjectiveValue;
}



//line of sight between two points
//bounding box for convex obstacles
//sampling for non-convex

function isLineOfSight(a,b){
	
	//quick check
	//print(isColorEqualP2C(b,obstacleColor));
	if(obstacles.length>0 && isColorEqualP2C(b,obstacleColor)){
		//print("this");
		return false;
		
	}
	if(obstacles.length==0){
		return true;
	}
	
	//rigorous check stage 1
	
	var normalVector = new Point2(-(b.y-a.y),b.x-a.x);
	var offset = dotP2(a,normalVector);
	
	//print(normalVector);
	
	for(var i = 0; i<obstacles.length; i++){
		if(obstacles[i].isConvex){
			
			var count = 0;
			//bounding box
			if(a.x > obstacles[i].largestX && b.x > obstacles[i].largestX){count++;}
			else if(a.y > obstacles[i].largestY && b.y > obstacles[i].largestY){count++;}
			else if(a.x < obstacles[i].smallestX && b.x < obstacles[i].smallestX){count++;}
			else if(a.y < obstacles[i].smallestY && b.y < obstacles[i].smallestY){count++;}
			else{//projection check: //rigorous check stage 2
				// checking edge by edge for an intersection
				
				for(var j = 0; j < obstacles[i].vertices.length-1; j++){
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
					
					if(count2 == 0){//intersection found with a edge (obs-i,edge-j) - stop
						return false;
					}					
				}
				
				if(count2 == 1){
					count++;
				}
				
			}
			if(count == 0){//intersection with ith obs
				return false;
			}
		}
		else{
			if(addObstacleMode==0){
				print("Non Convex Obstacle Exists!!!");
			}
			//obstacles[i].calculateReflexVertices();
			//print(obstacles[i].isConvex);
			//sampling based tech for nonConvex obstacles 
		}
	}
	
	if(count==1){
		return true;
	}
	else{
		return false;
	}
}


function drawSensingColorMap(pixelSize){ 

	if(boxDis.checked()){

		for (var i = 0; i < width; i += pixelSize){

			for (var j = 0; j < height; j += pixelSize){
				colorMode(RGB, 255, 255, 255, 1);
				noStroke();
				
				////if(obstacles.length>0){
					detectionProbability = detectionProbabilityGlobal(new Point2(i+pixelSize/2,j+pixelSize/2));
					//fill(0, 0, 150, detectionProbability*2);
				////}
				////else{
				////	detectionProbability = sensing(i,j,senRange);
					//fill(0, 0, 150, detectionProbability);
				////}
                
                if (detectionProbability > 0.95) {
                    fill(250,0, 255);
                } else if (detectionProbability > 0.5) {
                    fill(0,255,0,detectionProbability);
                } else {
                    fill(255,210,0, detectionProbability*2);
                }
				
				
				
				rect(i,j,pixelSize,pixelSize);

			}

		}

	}
}



/*
var costMatrix = formCostMatrix();
var assignments = solveAssignmentProblem(costMatrix);*/

function formCostMatrix(){
	//use distances among particles and particleShadows to form distance (as a cost) Matrix
	var costMatrix = [];
	var N = particles.length;
	for(var i=0; i<N; i++){
		append(costMatrix,[]);
		for(var j=0; j<N; j++){
			costMatrix[i][j] = round(distP2(particles[i].position,particleShadows[j].position));
		}
	}
	return costMatrix;	
}

