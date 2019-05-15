
//This function calculates the joint probability of detection at each point
//x: arbitrary point
//y: arbitrary point
//r: sensing range
function sensing (x,y,r){
    var p=1;
    var output;
    if (particles.length==0){
        output=0;
    }
    else {

        for (var i = 0; i < particles.length; i++){
            p=p*(1-pointSen(x,y,particles[i].x,particles[i].y,r));
        }
    }
    output=1-p;
    return output;
}


//This function calculates the sensing density as a function of distance from each particle
//Xc: particle's x position
//Yc:Particle's y position
//x: arbitrary point
//y: arbitrary point
//r: sensing range
function pointSen(Xc,Yc,x,y,r){
    var p;
    p=1-(sq((x-Xc))+sq((y-Yc)))/sq(r);
    if ((sq((x-Xc))+sq((y-Yc)))>=sq(r)) {
        p=0;
    }
    return p;
}
