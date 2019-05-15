var particles = [];

var particleShadows = [];

var sensitivity=0.1;

var linearSpeed=0;

var senRange;

var coverageLevelDisplay;

var objectiveValue=0;

var objectiveValueNew;

var objectiveValueArray = Array.apply(null, Array(200)).map(Number.prototype.valueOf,0);

var iterationNumberArray = Array.apply(null, {length: 200}).map(Number.call, Number);

var iterationNumber=0;

var movingAverage = 0; //starting mean

var movingAverageWindowSize = 50; 

var dwellTimeSteps = 50;


var particleDraggingMode = false;

var particleDragging;


var dwellMode = false;

var shadowsFollowingMode = false;//maybe same as isSimulationMode

var staticMode = 0;

var countTillStaticMode = 0;

var pausedMode = false;

var plotLayout = {
		title: 'Coverage Cost Increment Vs Iteration Number', 
		autosize: true,
	    width: 500,
	    height: 300,
	    xaxis: {
			title: 'Iteration Number', 
			showline: true,
			showgrid: true, 
			zeroline: true,
		}, 
		yaxis: {
			title: 'Cost Increment', 
		    showline: true,
		    showgrid: true,
		    zeroline: true,
		}
}


var cnv;

var boxDis;

var dropdown;

var hStep=0.5;//stepsize for updating the position

var ItterNum=1;//itteration numbers for updating the position

var obstacles = [];

var addObstacleMode = 0;

var isSimulationMode = false;

var isDebugMode = false;

var obstacleColor;

//for line searching
var searchResolution = 10;

var sensingDecayFactor; // 0.012

var simulationTime = 0;

var timeStep = 0.1;

var timeStepSqHf = timeStep*timeStep/2;

var trajectoryFollowInterval;

var trajectoryFollowMode = 0;

var pickWayPointsMode = 0;



var pixelMap = [];
var numberOfObstaclesOld = 0;

var width;
var height;
var numberOfAgentsDisplay;
var displayPhysicalAgentsMode = true;

var boostingMethod = 0;
var testLocalMinimaReachedInterval;
var agentPositions = []
var localMinimaReached = false;
var boostingActivated = 0;
var boostingIterationNumber = 0;

var optimalCoverageH1 = 0;
var optimalCoverageS1 = [];
var boostingParameterK;
var boostingParameterY;

//var optimalCoverageH2 = 0;


function setup() {
	
	pixelDensity(1);
	
	//Basic configurations
	
	obstacleColor = color(0,100,255);
	
	const canvasHolder = select('#canvasHolder');
    width  = canvasHolder.width;
    height = canvasHolder.height;
    cnv = createCanvas(width, height);
    cnv.parent('canvasHolder');
    console.log(canvasHolder);
    print(width + ', ' + height);
    
    

    particles[0] = new Particle(15,15);
    
    particleShadows[0] = new Particle(15,15);

    frameRate(60);
    
    
    
    
    //default obstacles
    
    //var obstacle1 = [100,100,100,500,500,500,500,100];
    //loadDefaultObstacle(obstacle1);
    //var obstacle1 = [300,200,200,400,400,400];
    //loadDefaultObstacle(obstacle1);
    //var obstacle1 = [110,390,110,550,230,550,230,390];
    //var obstacle2 = [400,110,400,250,520,250,520,20];
    //var obstacle3 = [100,150,100,290,220,290,220,60];
    //var obstacle0 = [120, 100, 120, 500, 220,500,220,100];
	//var obstacle0 = [100, 50, 100, 450, 200,450,200,50];
    //loadDefaultObstacle(obstacle0);
    //var obstacle4 = [400,200,400,400,500,400,500,200];
    //loadDefaultObstacle(obstacle4);
    //loadDefaultObstacle(obstacle1);
    //loadDefaultObstacle(obstacle2);
    //loadDefaultObstacle(obstacle3);
    //var obstacle4 = [100,150,100,400,200,400,200,150];
    //loadDefaultObstacle(obstacle4);
    
    
    // obstacle setups adding into drop down menu 
    /*var obstacleSetupNames = ["Blank","General","Room","Maze","Narrow"];
    for (var i = 0; i < 5; i++) {
    	var obstacleSetupDropdown = document.getElementById("obstacleSetupDropdown");
    	var option1 = document.createElement("option");
    	option1.text = obstacleSetupNames[i];
    	obstacleSetupDropdown.add(option1,i);
    }

    obstacleSetupDropdown.selectedIndex = 0;*/
    obstacleSetupDropdownEvent();

    boostingMethodChanged();
    boostingParameterChanged();

    


    //calc reflex vertices of obstacles
    
    for(var i = 0; i < obstacles.length; i++){
    	obstacles[i].calculateReflexVertices();
    }
    
	numberOfObstaclesOld = obstacles.length;    
    

    consolePrint("Interface Loading Finished.");
    
    
}


//step size dropdown function

function mySelectEvent() {

    var selected = document.getElementById("stepSizeMultiplier").value;
    if (selected === '1') {
        hStep=1;
        ItterNum=1;
        print("1");
    }

    if (selected === '2') {
        hStep=0.1;
        ItterNum=10;
    }

    if (selected === '3') {
        hStep=0.01;
        ItterNum=100;
    }

}


//start button function

function start(){
	
	isSimulationMode = true;
	linearSpeed = document.getElementById("stepSize").value;
    if(pausedMode==1){
    	shadowsFollowingMode=1;
    	shadowsFollowingInterval = setInterval(followShadows,100);
    	pausedMode = 0; 

    }

    consolePrint("Simulation Started"); 
	
}



// reset button function
function reset(){

    linearSpeed = 0;
    isSimulationMode = false;
 
    for (var i = 0; i < particles.length; i++){//resetting positions 
        
    	//resetting particles
    	////particles[i].x=10*i+15;
        ////particles[i].y=10*i+15;
        ////particles[i].position = new Point2(particles[i].x,particles[i].y);
        
        //resetting particle shadows
        particleShadows[i].x=10*i+15;
        particleShadows[i].y=10*i+15;
        particleShadows[i].position = new Point2(particleShadows[i].x,particleShadows[i].y);
    }
    //trajectoryFollowButton.style("background-color", "grey");
	if(shadowsFollowingMode==1){
		shadowsFollowingMode=0;
		clearInterval(shadowsFollowingInterval);
		resetParticleHistory();
	}

	consolePrint("Resetted the Shadow Agents");

}


//reset double clicked
function resetAll(){

    linearSpeed = 0;
    isSimulationMode = false;
    
    //trajectoryFollowButton.style("background-color", "grey");
	if(shadowsFollowingMode==1){
		shadowsFollowingMode=0;
		clearInterval(shadowsFollowingInterval);
		resetParticleHistory();
	}
	
    for (var i = 0; i < particles.length; i++){//resetting positions 
        
    	//resetting particles
    	particles[i].x=10*i+15;
        particles[i].y=10*i+15;
        particles[i].position = new Point2(particles[i].x,particles[i].y);
        
        //resetting particle shadows
        particleShadows[i].x=10*i+15;
        particleShadows[i].y=10*i+15;
        particleShadows[i].position = new Point2(particleShadows[i].x,particleShadows[i].y);
    }
    
    consolePrint("Real Agents and Shadow Agents Returned to Home Position");
    

}



// stop particle button

function stopParticle(){
	
	isSimulationMode = false;
    linearSpeed = 0;
    
    if(shadowsFollowingMode==1){
    	pausedMode=1;
		shadowsFollowingMode=0;
		clearInterval(shadowsFollowingInterval);
		//resetParticleHistory();
	}

	consolePrint("Simulation Paused. Click 'Start' to Resume.");
    
    
   
}



function loadDefaultObstacle(arrayInput){
	
	obstacles[obstacles.length] = new Obstacle();
	


    var obstacleDropdown = document.getElementById("obstacleDropdown");
    var option1 = document.createElement("option");
    option1.text = nf(obstacles.length);
    
    var obstacleIndex = Number(obstacleDropdown.selectedIndex);
    
    obstacleDropdown.add(option1,obstacleIndex+1);
    obstacleDropdown.selectedIndex = obstacleIndex+1;
    
	 
	for(var i=0; i < arrayInput.length/2; i++){
		obstacles[obstacles.length-1].update(arrayInput[2*i],arrayInput[2*i+1]);
	}
	
	obstacles[obstacles.length-1].drawBoarder(obstacleColor);
	
}


function loadDefaultObstacle(arrayInput,invalidNonReflexVertices){
	
	obstacles[obstacles.length] = new Obstacle();
	


    var obstacleDropdown = document.getElementById("obstacleDropdown");
    var option1 = document.createElement("option");
    option1.text = nf(obstacles.length);
    
    var obstacleIndex = Number(obstacleDropdown.selectedIndex);
    
    obstacleDropdown.add(option1,obstacleIndex+1);
    obstacleDropdown.selectedIndex = obstacleIndex+1;
    
	 
	for(var i=0; i < arrayInput.length/2; i++){
		obstacles[obstacles.length-1].update(arrayInput[2*i],arrayInput[2*i+1]);
	}
	
	obstacles[obstacles.length-1].drawBoarder(obstacleColor);
	obstacles[obstacles.length-1].invalidNonReflexVertices = invalidNonReflexVertices;
	
}







// load multiple obstacles once
function obstacleSetupDropdownEvent(){
	
	//location.reload();
	
    var obstacleSetupDropdown = document.getElementById("obstacleSetupDropdown");
    var obstacleSetupIndex = Number(obstacleSetupDropdown.selectedIndex);
    print("here");
    obstacleSetupLoad(obstacleSetupIndex);
    /*
	
	for(var i=0; i < arrayInput.length/2; i++){
		obstacles[obstacles.length-1].update(arrayInput[2*i],arrayInput[2*i+1]);
	}
	
	obstacles[obstacles.length-1].drawBoarder(obstacleColor);

	 document.getElementById("obstacleCoordinatesDisplay").value = obstacles[document.getElementById("obstacleDropdown").value-1].textString;
	*/
}


function obstacleDropdownEvent(){
	
    document.getElementById("obstacleCoordinatesDisplay").value = obstacles[document.getElementById("obstacleDropdown").value-1].textString;
	//assigned text
}



function obstacleTextInput(){
    var newString = document.getElementById("obstacleCoordinatesDisplay").value;//what if string input is empty? - need to delete obstacle; //create default obstacles
	var strArray = splitTokens(newString, ",");
	
    var obstacleDropdown = document.getElementById("obstacleDropdown");
    	

    if(strArray.length==0){
        var obstacleIndex = Number(obstacleDropdown.selectedIndex);
        obstacles.splice(obstacleIndex,1);
        //document.getElementById("obstacleDropdown").selectedIndex = obstacles.length-1;
        
        for(var i = obstacleDropdown.options.length - 1 ; i >= 0 ; i--){
            
            document.getElementById("obstacleDropdown").remove(i);

        }


        for(var i = 0; i<obstacles.length;i++){
            var option1 = document.createElement("option");
            option1.text = nf(i+1);
            print(option1.text);
            document.getElementById("obstacleDropdown").add(option1,i);
            
            
        	obstacles[i].updateIndex(i);
            
        }

        
        if(obstacles.length>0){
            document.getElementById("obstacleDropdown").selectedIndex = obstacles.length-1;
            document.getElementById("obstacleCoordinatesDisplay").value = obstacles[obstacles.length-1].textString;
        }
    }
    else{
    	
        var obstacleIndex = Number(obstacleDropdown.value)-1;

    	obstacles[obstacleIndex].x = [];
    	obstacles[obstacleIndex].y = [];

    	for(var i=0; i < strArray.length/2; i++){
            obstacles[obstacleIndex].update(int(strArray[2*i]),int(strArray[2*i+1]));
    	}

    	obstacles[obstacleIndex].drawBoarder(obstacleColor);
    	obstacles[obstacleIndex].calculateReflexVertices();

    	//CASE WHERE new obstacle was added solely using coordinates
    	if(typeof(obstacles[obstacleIndex].nonReflexVertices[0]) == "undefined"){
    		obstacles[obstacleIndex].nonReflexVertices.splice(0,1);

    	}
    	
    	if(!obstacles[obstacleIndex].isConvex){//if found non convex obstacle
    		print("Reversing cordinates");
    		var tempX = obstacles[obstacleIndex].x;
    		var tempY = obstacles[obstacleIndex].y;
    		tempX.reverse();
    		tempY.reverse();
	    	obstacles[obstacleIndex].x = [];
	    	obstacles[obstacleIndex].y = [];

	    	for(var i=0; i < tempX.length; i++){
	            obstacles[obstacleIndex].update(tempX[i],tempY[i]);
	    	}

	    	obstacles[obstacleIndex].drawBoarder(obstacleColor);
	    	obstacles[obstacleIndex].calculateReflexVertices();
	    	if(!obstacles[obstacleIndex].isConvex){
	    		obstacles.splice(obstacleIndex,1);
	    		document.getElementById("obstacleCoordinatesDisplay").placeholder = "Error... Enter cordinates in a different order";
	    		print("Enter cordinates in a different order");

	    	}

    	}
    	consolePrint("Succesfully Modified the Obstacle");

    	

    }

    strokeWeight(1);
    for (var i=0; i < obstacles.length; i++){//draw obstacles
    	obstacles[i].drawBoarder(obstacleColor);
    }
    strokeWeight(4);
    

    loadPixels();
    pixelMap = pixels;
    print("pixels loaded");
    //numberOfObstaclesOld = obstacles.length;
    


}



function addObstacle(){
	
	
	if(addObstacleMode==0){//first time
		addObstacleMode = 1;
		document.getElementById("obstacleCoordinatesDisplay").value = "";
		document.getElementById("obstacleCoordinatesDisplay").placeholder = "Type Required Obstacle Coordinates Here...";
		
		cursor(CROSS);
	}
	else if(addObstacleMode==2){//after collecting vertexes
		addObstacleMode = 0;
		//addObstacleButton.style("background-color", "grey");
		
        obstacles[obstacles.length-1].calculateReflexVertices();
        var obstacleIndex = obstacles.length-1
		if(!obstacles[obstacleIndex].isConvex){//if found non convex obstacle
    		print("Reversing cordinates");
    		var tempX = obstacles[obstacleIndex].x;
    		var tempY = obstacles[obstacleIndex].y;
    		tempX.reverse();
    		tempY.reverse();
	    	obstacles[obstacleIndex].x = [];
	    	obstacles[obstacleIndex].y = [];

	    	for(var i=0; i < tempX.length; i++){
	            obstacles[obstacleIndex].update(tempX[i],tempY[i]);
	    	}

	    	obstacles[obstacleIndex].drawBoarder(obstacleColor);
	    	obstacles[obstacleIndex].calculateReflexVertices();
	    	if(!obstacles[obstacleIndex].isConvex){
	    		obstacles.splice(obstacleIndex,1);
	    		document.getElementById("obstacleCoordinatesDisplay").placeholder = "Error... Enter cordinates in a different order";
	    		print("Enter cordinates in a different order");

	    	}

		}
		cursor(ARROW);
	}
		
	//cnv.mouseClicked(updateVertex);
		
}


function stopAddingObstacle(){
	if(addObstacleMode==2){//after collecting vertexes
		addObstacleMode = 0;
		
        obstacles[obstacles.length-1].calculateReflexVertices();
        var obstacleIndex = obstacles.length-1
		if(!obstacles[obstacleIndex].isConvex){//if found non convex obstacle
    		print("Reversing cordinates");
    		var tempX = obstacles[obstacleIndex].x;
    		var tempY = obstacles[obstacleIndex].y;
    		tempX.reverse();
    		tempY.reverse();
	    	obstacles[obstacleIndex].x = [];
	    	obstacles[obstacleIndex].y = [];

	    	for(var i=0; i < tempX.length; i++){
	            obstacles[obstacleIndex].update(tempX[i],tempY[i]);
	    	}

	    	obstacles[obstacleIndex].drawBoarder(obstacleColor);
	    	obstacles[obstacleIndex].calculateReflexVertices();
	    	if(!obstacles[obstacleIndex].isConvex){
	    		obstacles.splice(obstacleIndex,1);
	    		document.getElementById("obstacleCoordinatesDisplay").placeholder = "Error... Enter cordinates in a different order";
	    		print("Enter cordinates in a different order");

	    	}

		}
		cursor(ARROW);
	}
}



function trajectoryFollowButtonFunction(){
	//trajectoryFollowButton.style("background-color", "red");
	if(trajectoryFollowMode==0){//first time
		trajectoryFollowMode = 1;
		trjectoryFollowingInterval = setInterval(followTrajectory,100);
		
	}
	else{
		trajectoryFollowMode = 0;
		//trajectoryFollowButton.style("background-color", "grey");
		clearInterval(trjectoryFollowingInterval);
	}
	
	
	
	//particles[0].followTrajectory();
}



function pickWayPointsButtonFunction(){
	//pickWayPointsButton.style("background-color", "red");
	if(pickWayPointsMode==0){//first time
		pickWayPointsMode = 1;
		cursor(CROSS);
	}
	else if(pickWayPointsMode==2){
		pickWayPointsMode = 0;
		//pickWayPointsButton.style("background-color", "grey");
		cursor(ARROW);
	}
	
	
	
	//particles[0].followTrajectory();
}






function mouseClicked(){
	
	
	if(addObstacleMode>=1){//inserting obstacle vertexes
		
		if(mouseX>0 && mouseY>0 && mouseX<width && mouseY<height){
			//print(mouseX,mouseY);
			obstacles[obstacles.length-1].update(mouseX,mouseY);
			//obstacles[obstacles.length-1].updateBoarder();
			consolePrint("Vertex Point Added to the New Obstacle");
		}
		else{
			if(addObstacleMode==1){// just started by clicking the button
				obstacles[obstacles.length] = new Obstacle();

                var option1 = document.createElement("option");
                option1.text = nf(obstacles.length);
                document.getElementById("obstacleDropdown").add(option1);
                document.getElementById("obstacleDropdown").selectedIndex = obstacles.length-1;
				
				addObstacleMode = 2;//vertexex collecting mode
				consolePrint("Add New Obstacle - Type Vertices or Point Them in Workspace");
			}
			else{//clicked outside
				addObstacleMode = 0;
				
				obstacles[obstacles.length-1].calculateReflexVertices();
				var obstacleIndex = obstacles.length-1
				if(!obstacles[obstacleIndex].isConvex){//if found non convex obstacle
		    		print("Reversing cordinates");
		    		var tempX = obstacles[obstacleIndex].x;
		    		var tempY = obstacles[obstacleIndex].y;
		    		tempX.reverse();
		    		tempY.reverse();
			    	obstacles[obstacleIndex].x = [];
			    	obstacles[obstacleIndex].y = [];

			    	for(var i=0; i < tempX.length; i++){
			            obstacles[obstacleIndex].update(tempX[i],tempY[i]);
			    	}

			    	obstacles[obstacleIndex].drawBoarder(obstacleColor);
			    	obstacles[obstacleIndex].calculateReflexVertices();
			    	if(!obstacles[obstacleIndex].isConvex){
			    		obstacles.splice(obstacleIndex,1);
			    		document.getElementById("obstacleCoordinatesDisplay").placeholder = "Error... Enter cordinates in a different order";
			    		print("Enter cordinates in a different order");

			    	}

    			}
				cursor(ARROW);
				consolePrint("Finished Adding Obstacles");
			}
		}
	
	}
	
	else if(pickWayPointsMode>=1){
		if(mouseX>0 && mouseY>0 && mouseX<width && mouseY<height){
			append(particles[0].wayPoints,new Point2(mouseX,mouseY));
			print(mouseX,mouseY);
		}
		else{
			if(pickWayPointsMode==1){//just started
				//finish collecting
				pickWayPointsMode = 2;
				cursor(CROSS);
			}
			else{
				pickWayPointsMode = 0;
				//pickWayPointsButton.style("background-color", "grey");
				cursor(ARROW);
				//print("hgghyg");
				particles[0].generateReferencePointTrajectory();
			}
		}
		
	}
	
	
}



//this function adds a new particle at the mouse location whenever the "+" key is pressed and released

function keyReleased() {

	if(keyCode==107){
		particles.push(new Particle(mouseX, mouseY));
		particleShadows.push(new Particle(mouseX, mouseY));
	}

}



function addAgent(){

    //particles.push(new Particle(20*particles.length+20, 20*particles.length+20));
	particles.push(new Particle(10*particles.length+15, 10*particles.length+15));
	particleShadows.push(new Particle(10*particleShadows.length+15, 10*particleShadows.length+15));
	//trajectoryFollowButton.style("background-color", "grey");
	if(shadowsFollowingMode==1){
		shadowsFollowingMode=0;
		clearInterval(shadowsFollowingInterval);
		resetParticleHistory();
	}

	consolePrint("Agent Added")
}



function removeAgent(){

    particles.splice(particles.length-1,1);
    particleShadows.splice(particles.length,1);
    //trajectoryFollowButton.style("background-color", "grey");
	if(shadowsFollowingMode==1){
		shadowsFollowingMode=0;
		clearInterval(shadowsFollowingInterval);
		resetParticleHistory();
	}

	consolePrint("Agent Removed");
    
}



//This function moves the particles as we drag them

function mouseDragged() {

    /*for (var i = 0; i < particles.length; i++) {
        particles[i].clicked();
    }*/
	staticMode=0;
	countTillStaticMode=0;
	//trajectoryFollowButton.style("background-color", "grey");
	if(shadowsFollowingMode==1){
		shadowsFollowingMode=0;
		clearInterval(shadowsFollowingInterval);
		resetParticleHistory();
	}


	
	if(particleDraggingMode){
		if(particleDragging>=0){
			particleShadows[particleDragging].x = mouseX;
			particleShadows[particleDragging].y = mouseY;
			particleShadows[particleDragging].position = new Point2(mouseX,mouseY);
		}else if(particleDragging<0){
			particles[-1*particleDragging-1].x = mouseX;
			particles[-1*particleDragging-1].y = mouseY;
			particles[-1*particleDragging-1].position = new Point2(mouseX,mouseY);
		}
	}
	else{
		
		for (var i = 0; i < particleShadows.length; i++) {
			if(particleShadows[i].clicked()){
				particleDragging = i;
				particleDraggingMode = true;
			}
			else if(particles[i].clicked()){
				particleDragging = -1*(i+1);
				particleDraggingMode = true;	
			}
			
		}
	}	
	
	consolePrint("Dragging Particles");
	
	
}


function mouseReleased() {
	
	if(particleDraggingMode){
		particleDraggingMode = false;
		if(particleDragging>=0){
			particleShadows[particleDragging].x = mouseX;
			particleShadows[particleDragging].y = mouseY;
			particleShadows[particleDragging].position = new Point2(mouseX,mouseY);
		}else if(particleDragging<0){
			if(pausedMode){
				resetParticleHistory2();//have to do something here!!!
				print("special");
			}
			particles[-1*particleDragging-1].x = mouseX;
			particles[-1*particleDragging-1].y = mouseY;
			particles[-1*particleDragging-1].position = new Point2(mouseX,mouseY);
			
		}
		consolePrint("Dragging Finished")
	}
}


function boostingMethodChanged(){
	boostingMethod = Number(document.getElementById("boostingMethod").selectedIndex);
	print("Boosting Method Changed Into: "+boostingMethod);
	if(boostingMethod>0){
		testLocalMinimaReachedInterval = setInterval(testLocalMinimaReached,1000);
	}
	else{
		clearInterval(testLocalMinimaReachedInterval);
	}

	// loading boosting parameters
	document.getElementById("boostingParameterY").disabled = false;
	if(boostingMethod==0){//no boosting
		boostingParameterK = 0;
		boostingParameterY = 0;
	}else if(boostingMethod==1){// P 
		boostingParameterK = 1;
		boostingParameterY = 1;
	}else if(boostingMethod==2){// nei
		boostingParameterK = 10000;
		boostingParameterY = 1;
	}else if(boostingMethod==3){// Phi
		boostingParameterK = 10;
		boostingParameterY = 2;
	}else if(boostingMethod==4){// random
		boostingParameterK = 25;
		boostingParameterY = 0;
		document.getElementById("boostingParameterY").disabled = true;
	}
	document.getElementById("boostingParameterK").value = boostingParameterK;
	document.getElementById("boostingParameterY").value = boostingParameterY;
	boostingActivated = 0;

}


function boostingParameterChanged(){
	//boostingMethod = Number(document.getElementById("boostingMethod").selectedIndex);

	boostingParameterK = Number(document.getElementById("boostingParameterK").value);
	boostingParameterY = Number(document.getElementById("boostingParameterY").value);

}

function draw() {

	
	//slider reading
	senRange = Number(document.getElementById("sensingRange").value);
    document.getElementById("sensingRangeDisplay").innerHTML = senRange;
        
    sensingDecayFactor = Number(document.getElementById("sensingDecay").value)/1000;
    document.getElementById("sensingDecayDisplay").innerHTML = sensingDecayFactor;
    
    hStep = Number(document.getElementById("stepSizeMultiplier").value);
    document.getElementById("stepSizeMultiplierDisplay").innerHTML = hStep;

    linearSpeed = Number(document.getElementById("stepSize").value);
    document.getElementById("stepSizeDisplay").innerHTML = linearSpeed+" x "+hStep+" = "+round(100*(linearSpeed*hStep))/100;
    

    displayPhysicalAgentsMode = document.getElementById("displayPhysicalAgents").checked;

    


    
    
    
    //drawing basic environment
    background(255);
    strokeWeight(4);
    noFill();
    rect(0,0,width,height);
    
    
    if(addObstacleMode >= 1){//print cursor coordinate
    	var coordinateString = [nf(round(mouseX/10)*10),nf(round(mouseY/10)*10)];
    	fill(0);
    	strokeWeight(1);
    	if(obstacles.length>0){
    		if(obstacles[obstacles.length-1].x.length>1){
    			line(mouseX,mouseY, obstacles[obstacles.length-1].x[obstacles[obstacles.length-1].x.length-1], obstacles[obstacles.length-1].y[obstacles[obstacles.length-1].y.length-1] );
    		}
    	}
    	text("Pick Next Vertex:", mouseX+5, mouseY-15);
    	text(coordinateString, mouseX+5, mouseY+15);
    }
    

    strokeWeight(1);
    for (var i=0; i < obstacles.length; i++){//draw obstacles
    	obstacles[i].drawBoarder(obstacleColor);
    }
    strokeWeight(4);
 
 	//storing pixel map for future reference
    if((addObstacleMode==0) && ((pixelMap.length == 0) || ((obstacles.length-numberOfObstaclesOld)!=0) )){
    	loadPixels();
    	pixelMap = pixels;
    	print("pixels loaded");
    	numberOfObstaclesOld = obstacles.length;
    }





    drawSensingColorMap(10); //pixelSize = 10

    
    
    //update particleShadows
    //var timeStart = millis();
    for (var i = 0; i < particleShadows.length; i++) {
    	
        if(addObstacleMode==0 && !isDebugMode && isSimulationMode && !mouseIsPressed){
        	particleShadows[i].updateNew(i);
        }
        particleShadows[i].showShadow(i);

        if(displayPhysicalAgentsMode){
            particles[i].show(i);
        }
        //numberLabel.html(particleShadows.length);
    }
    //print(millis()-timeStart);
    
 
    //updating labels
    
    ////Objective Value

    objectiveValueNew = int(globalObjective());
    
    coverageLevelDisplay=document.getElementById("objectiveDisplay");

    coverageLevelDisplay.innerHTML=int(objectiveValueNew);
    
    
    //// Number of Agents
    numberOfAgentsDisplay = document.getElementById("numberOfAgents");

    numberOfAgentsDisplay.innerHTML=particles.length;
    
    
    
    //moving average (of coverage cost increment) update
    movingAverage = movingAverage-(objectiveValueArray[objectiveValueArray.length-movingAverageWindowSize]-(objectiveValueNew-objectiveValue))/movingAverageWindowSize;
        
    
    iterationNumber++;
    objectiveValueArray.splice(0,1);
    objectiveValueArray.push(objectiveValueNew-objectiveValue);
    iterationNumberArray.splice(0,1);
    iterationNumberArray.push(iterationNumber);

    //plotting commented
    /*var trace1 = {x:iterationNumberArray, y: objectiveValueArray,type: 'scatter'};
	var data = [trace1];
	Plotly.newPlot('myDiv', data, plotLayout,{displayModeBar: false});*/
    
    objectiveValue = objectiveValueNew; 

    
    //counting
    if(isSimulationMode==1 && displayPhysicalAgentsMode){
	    countingWithPhysicalAgents();
    }else if(isSimulationMode==1 && boostingMethod>0){
    	//need to do something here....
    	//print(agentPositions.length)
    }
    

}

