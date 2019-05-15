var particles = [];

var particleShadows = [];

var sensitivity=0.1;

var linearSpeed=0;

var senRange;

var ObjlDisplay;

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
		autosize: false,
	    width: 800,
	    height: 300,
	    margin: {pad:0},
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


var mu;
var sigma;
var rho;
var mu;

function centerCanvas() {

    var x = (windowWidth - width) / 2;

    var y = (windowHeight - height) / 2;

    cnv.position(windowWidth/10, y);

}

//function canvasPosition(){

//    var pos=[]

//    var x=windowWidth/10;

//    var y = (windowHeight - height) / 2;

//    pos=[x,y];

//    return pos;

//}





function windowResized() {

    centerCanvas();

}





function setup() {
	
	
	
	//Basic configurations
	
	obstacleColor = color(0,100,255);

    /*cnv = createCanvas(600, 600);

    centerCanvas();*/
    const canvasHolder = select('#canvasHolder');
    width  = canvasHolder.width;
    height = canvasHolder.height;
    cnv = createCanvas(width, height);
    cnv.parent('canvasHolder');
    console.log(canvasHolder);

    

    frameRate(60);
    
    
    
    //Run button config




    
    
    
    
    /*//slider config(Sensing Range)

    slider = createSlider(5, 80, 50);

    slider.position(cnv.x+width+155,cnv.y+70);

    sliderLabel=createP("Trace Length:" );

    sliderLabel.position(cnv.x+width+20,cnv.y+55);



    //slider config (Linear Speed)

    sliderSpeed = createSlider(0, 50, 1);

    sliderSpeed.position(cnv.x+width+155,cnv.y+100);

    sliderSpeedLabel=createP("Scale:" );

    sliderSpeedLabel.position(cnv.x+width+20,cnv.y+85);

    //slider config(sensingDecayFactor)

    sliderSensingDecayFactor = createSlider(0, 50, 1);

    sliderSensingDecayFactor.position(cnv.x+width+155,cnv.y+130);

    sliderSensingDecayFactorLabel=createP("Sensing Decay Factor:");

    sliderSensingDecayFactorLabel.position(cnv.x+width+10,cnv.y+115);*/
    
    

    

        
    //plotly
    senRange = Number(document.getElementById("sensingRange").value);
    document.getElementById("sensingRangeDisplay").innerHTML = senRange;
        
    sigma = Number(document.getElementById("sigma").value);
    document.getElementById("sigmaDisplay").innerHTML = sigma;

    rho = Number(document.getElementById("rho").value);
    document.getElementById("rhoDisplay").innerHTML = rho;

    beta = Number(document.getElementById("beta").value);
    document.getElementById("betaDisplay").innerHTML = beta;
    
    linearSpeed = Number(document.getElementById("stepSize").value);
    document.getElementById("stepSizeDisplay").innerHTML = linearSpeed;


    //senRange = getslider.value();
    particles[0] = new Particle(15,15,15);
    
}


function resetAll(){

    location.reload();
    

}


//step size dropdown function

function mySelectEvent() {

    var selected = this.selected();
    if (selected === '1') {
        hStep=1;
        ItterNum=1;
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
    
    
    //vanDerPoleInterval = setInterval(oscillate,100);
    lorenzInterval = setInterval(lorenz,10);
    
}



// reset button function
function reset(){

    linearSpeed = 0;
    isSimulationMode = false;
    
    clearInterval(oscillate);
    
    for (var i = 0; i < particles.length; i++){//resetting positions 
        
        particles[i].x=10*i+15;
        particles[i].y=10*i+15;
        particles[i].position = new Point2(particles[i].x,particles[i].y);
    }
    trajectoryFollowButton.style("background-color", "grey");
	if(shadowsFollowingMode==1){
		shadowsFollowingMode=0;
		clearInterval(shadowsFollowingInterval);
		resetParticleHistory();
	}

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
    
    
   
}




function loadDefaultObstacle(arrayInput){
	
	obstacles[obstacles.length] = new Obstacle();
	
	obstacleDropdown.option(obstacles.length,obstacles.length);
	obstacleDropdown.value(obstacles.length);
	 
	for(var i=0; i < arrayInput.length/2; i++){
		obstacles[obstacles.length-1].update(arrayInput[2*i],arrayInput[2*i+1]);
	}
	
	obstacles[obstacles.length-1].drawBoarder(obstacleColor);
	
}



function obstacleDropdownEvent(){
	//print(obstacles[obstacleDropdown.value()-1].textString);
	obstacleText.value(obstacles[obstacleDropdown.value()-1].textString);
	//assigned text
}



function obstacleTextInput(){
	
	 var newString = this.value();//what if string input is empty? - need to delete obstacle; //create default obstacles
	 
	 var strArray = splitTokens(newString, ",");
	 
	 if(strArray.length==0){
		 obstacleIndex = obstacleDropdown.value()-1;
		 obstacles.splice(obstacleIndex,1);
		 //recreating dropdown list
		 obstacleDropdown.remove();
		 obstacleDropdown = createSelect();
		 obstacleDropdown.position(cnv.x+width+250,cnv.y+height/2);
		 obstacleDropdown.size(35,25);
		 obstacleDropdown.changed(obstacleDropdownEvent);
		 obstacleDropdownLabel = createP("Select Obstacle:" );
		 obstacleDropdownLabel.position(cnv.x+width+145,cnv.y+height/2-12);
		 for(var i = 0; i<obstacles.length;i++){
			 obstacleDropdown.option(i+1,i+1);
			 obstacleDropdown.value(i+1);
			 obstacles[i].updateIndex(i);
		 }
		 if(obstacles.length>0){
			 obstacleText.value(obstacles[obstacleDropdown.value()-1].textString);
		 }
	 }
	 else{
		var obstacleIndex = obstacleDropdown.value()-1;
	 	obstacles[obstacleIndex].x = [];
	 	obstacles[obstacleIndex].y = [];
	 
	 	for(var i=0; i < strArray.length/2; i++){
		 	obstacles[obstacleIndex].update(int(strArray[2*i]),int(strArray[2*i+1]));
	 	}
	 
	 	obstacles[obstacleIndex].drawBoarder(obstacleColor);
	 	obstacles[obstacleIndex].calculateReflexVertices();
	 }
	 // this.value('some other');
}



function addObstacle(){
	
	addObstacleButton.style("background-color", "red");
	
	if(addObstacleMode==0){//first time
		addObstacleMode = 1;
		
		cursor(CROSS);
	}
	else if(addObstacleMode==2){//after collecting vertexes
		addObstacleMode = 0;
		addObstacleButton.style("background-color", "grey");
		obstacles[obstacles.length-1].calculateReflexVertices();
		cursor(ARROW);
	}
		
	//cnv.mouseClicked(updateVertex);
		
}



function trajectoryFollowButtonFunction(){
	trajectoryFollowButton.style("background-color", "red");
	if(trajectoryFollowMode==0){//first time
		trajectoryFollowMode = 1;
		trjectoryFollowingInterval = setInterval(followTrajectory,100);
		
	}
	else{
		trajectoryFollowMode = 0;
		trajectoryFollowButton.style("background-color", "grey");
		clearInterval(trjectoryFollowingInterval);
	}
	
	
	
	//particles[0].followTrajectory();
}



function pickWayPointsButtonFunction(){
	pickWayPointsButton.style("background-color", "red");
	if(pickWayPointsMode==0){//first time
		pickWayPointsMode = 1;
		cursor(CROSS);
	}
	else if(pickWayPointsMode==2){
		pickWayPointsMode = 0;
		pickWayPointsButton.style("background-color", "grey");
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
		}
		else{
			if(addObstacleMode==1){// just started by clicking the button
				obstacles[obstacles.length] = new Obstacle();
				obstacleDropdown.option(obstacles.length,obstacles.length);
				obstacleDropdown.value(obstacles.length);
				addObstacleMode = 2;//vertexex collecting mode
			}
			else{//clicked outside
				addObstacleMode = 0;
				addObstacleButton.style("background-color", "grey");
				obstacles[obstacles.length-1].calculateReflexVertices();
				cursor(ARROW);
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
				pickWayPointsButton.style("background-color", "grey");
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
	trajectoryFollowButton.style("background-color", "grey");
	if(shadowsFollowingMode==1){
		shadowsFollowingMode=0;
		clearInterval(shadowsFollowingInterval);
		resetParticleHistory();
	}
}



function removeAgent(){

    particles.splice(particles.length-1,1);
    particleShadows.splice(particles.length-1,1);
    trajectoryFollowButton.style("background-color", "grey");
	if(shadowsFollowingMode==1){
		shadowsFollowingMode=0;
		clearInterval(shadowsFollowingInterval);
		resetParticleHistory();
	}
    
}



//This function moves the particles as we drag them

function mouseDragged() {

    
	
	
	if(particleDraggingMode){
		particles[particleDragging].x = (mouseX-height/2)/linearSpeed;
		particles[particleDragging].y = (mouseY-width/2)/linearSpeed;
		particles[particleDragging].position = new Point2(particles[particleDragging].x,particles[particleDragging].y);
		//particleShadows[particleDragging].clicked();
	}
	else{
		
		for (var i = 0; i < particles.length; i++) {
			if(particles[i].clicked()){
				particleDragging = i;
				particleDraggingMode = true;
			}
			
		}
	}	
	
	
	
}


function mouseReleased() {
	
	if(particleDraggingMode){
		particleDraggingMode = false;
		particles[particleDragging].x = (mouseX-height/2)/linearSpeed;
		particles[particleDragging].y = (mouseY-width/2)/linearSpeed;
		particles[particleDragging].position = new Point2(particles[particleDragging].x,particles[particleDragging].y);
	}
}

function draw() {

	
	//slider reading
	//senRange = slider.value();
    
	//mu = sliderSensingDecayFactor.value()/50;
    
	//linearSpeed = sliderSpeed.value();
    
    
	senRange = Number(document.getElementById("sensingRange").value);
    document.getElementById("sensingRangeDisplay").innerHTML = senRange;
        
    sigma = Number(document.getElementById("sigma").value);
    document.getElementById("sigmaDisplay").innerHTML = sigma;

    rho = Number(document.getElementById("rho").value);
    document.getElementById("rhoDisplay").innerHTML = rho;

    beta = Number(document.getElementById("beta").value);
    document.getElementById("betaDisplay").innerHTML = beta;
    
    linearSpeed = Number(document.getElementById("stepSize").value);
    document.getElementById("stepSizeDisplay").innerHTML = linearSpeed;



    //drawing basic environment
    background(255);
    strokeWeight(4);
    noFill();
    rect(0,0,width,height);
    
    
    
    //updating particles
    for (var i = 0; i < particles.length; i++) {

    	// for (var j=0; j<ItterNum ;j++){
        particles[i].traceIt(i);
        

    }
    
 
    

    
    
    
    
       
    
    //rest of the labels - updating
    //sliderLabel.html("Trace Length:"+slider.value());
    
    

   //sliderSpeedLabel.html("Scale:"+sliderSpeed.value());
    
    //sliderSensingDecayFactorLabel.html("Mu: "+sliderSensingDecayFactor.value()/50);

}

