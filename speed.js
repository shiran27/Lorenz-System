// This function calculates the speed on x axis
function speed(ID){
    var v=[];
    var der=dHdxdy(ID);
    //    senRangeM=senRange-5;
    //    senRangeM=senRange;
    //    return random(-10, 10);
    //    dHdxVal=dHdx(ID);
    //    dHdyVal=dHdy(ID);
    //    var dHdx=der[0];
    //    var dHdy=der[1];
    //    var dHdx=der[2];
    //    var dHdy=der[3];
    var dHdx=der[0];
    var dHdy=der[1];
    //we do this to prevent having NaN values (zero in denumirator)
    if (sq(dHdx)+sq(dHdy)<0.0001){
        v[0]=0;
        v[1]=0;
    }
    else{
        v[0]=dHdx/sqrt(sq(dHdx)+sq(dHdy));
        v[1]=dHdy/sqrt(sq(dHdx)+sq(dHdy));
    }




    v[2]=particles[ID].x;
    v[3]=particles[ID].y;
    //    v[4]=der[2];
    //    v[5]=der[3];


    return v;


}


///////////////////////////////////////////////
// Here we define the necessary functions to calculate the integartion
function Py (y,ID){
    //x: arb x, y: arb y, ID: particle's number

    return sensing(particles[ID].x+sqrt(sq(senRange)-sq(y-particles[ID].y)),y,senRange)-sensing(particles[ID].x-sqrt(sq(senRange)-sq(y-particles[ID].y)),y,senRange);


}

function Px (x,ID){

    return sensing(x,particles[ID].y+sqrt(sq(senRange)-sq(x-particles[ID].x)),senRange)-sensing(x,particles[ID].y-sqrt(sq(senRange)-sq(x-particles[ID].x)),senRange);
    //        return sensing(x,particles[ID].y+senRange,senRange)-sensing(x,particles[ID].y-senRange,senRange);

}

function Hxy (x,y,ID){
    var outFun=[];
    var sum=1;
    var multip=1;
    if(particles.length==1){
        sum=1;
        multip=1;
    }
    else{

        for (var ii=0;ii<particles.length;ii++){
//            if(ii!=ID && dist(particles[ID].x,particles[ID].y,particles[ii].x,particles[ii].y)<=2*senRange){
            if(ii!=ID){
                sum=sum*(1-pointSen(particles[ii].x,particles[ii].y,x,y,senRange));

            }
            multip=sum/(1-pointSen(particles[ID].x,particles[ID].y,x,y,senRange));
        }
    }
    outFun[0]= 2*(x-particles[ID].x)/sq(senRange) *multip;//Hx
    outFun[1]=2*(y-particles[ID].y)/sq(senRange)*multip;//Hy

    return outFun;
}




function dHdxdy(ID){
    //    var stepsize=senRange/80;
   // var stepsize=10;
    var stepsize=5;
    var velocity=[];
    var objetiveDerX=0;
    var objetiveDerY=0
    var objective=0;
    var xStart=0;
    var xEnd=0;
    var yStart=0;
    var yEnd=0;
    //    for (var x=0;x<=width;x+=stepsize){
    //        for(var y=0;y<=height;y+=stepsize){
    //            objective+=sensing(x,y,senRange);
    //            if(dist(x,y,particles[ID].x,particles[ID].y)<=senRange){
    //                objetiveDerX+=sq(stepsize)*Hx(x,y,ID);
    //                objetiveDerY+=sq(stepsize)*Hy(x,y,ID);
    //            }
    //        }
    //    }
    if (particles[ID].x-senRange<=0){
        xStart=0;
    }
    else {
        xStart=particles[ID].x-senRange ;
    }
    if(particles[ID].x+senRange>=width){
        xEnd=width;
    }
    else{
        xEnd=particles[ID].x+senRange ;
    }



    if (particles[ID].y-senRange<=0){
        yStart=0;
    }
    else {
        yStart=particles[ID].y-senRange
    }
    if(particles[ID].y+senRange>=height){
        yEnd=height;
    }
    else{
        yEnd=particles[ID].y+senRange ;
    }

    //    for (var x=xStart;x<=xEnd;x+=stepsize){
    //        for(var y=yStart;y<=yEnd;y+=stepsize){
    //            //            objective+=sensing(x,y,senRange);
    //            if(dist(x,y,particles[ID].x,particles[ID].y)<=senRange){
    //                objetiveDerX+=sq(stepsize)*Hx(x,y,ID);
    //                objetiveDerY+=sq(stepsize)*Hy(x,y,ID);
    //            }
    //        }
    //    }
    for (var x=xStart+0.5*stepsize;x<=xEnd-0.5*stepsize;x+=stepsize){
        for(var y=yStart+0.5*stepsize;y<=yEnd-0.5*stepsize;y+=stepsize){
            //            objective+=sensing(x,y,senRange);
            if(dist(x,y,particles[ID].x,particles[ID].y)<=senRange){
                objetiveDerX+=sq(stepsize)*Hxy(x,y,ID)[0];
                objetiveDerY+=sq(stepsize)*Hxy(x,y,ID)[1];
            }
        }
    }
    //    velocity[0]=objetiveDerX+simpson1D(particles[ID].y-senRange,particles[ID].y+senRange,sensitivity,Py,ID);
    //    velocity[1]=objetiveDerY+simpson1D(particles[ID].x-senRange,particles[ID].x+senRange,sensitivity,Px,ID);
    //    velocity[3]=objetiveDerY;
    //    velocity[2]=objetiveDerX;
    //    velocity[2]=objetiveDerX;
    //    velocity[3]=objetiveDerY;
    //    if(objetiveDerX<3 && objetiveDerX>-3){
    //        objetiveDerX=0;
    //    }
    //    if(objetiveDerY<3 && objetiveDerY>-3){
    //        objetiveDerY=0;
    //    }
    velocity[0]=int(10*objetiveDerX);
    velocity[1]=int(10*objetiveDerY);

    return velocity;
}




// Simpson integration for functions with one input
//note that this code is in the original coordinate system (600*600) and the step size should be 1/10 if wqants to be used in the main code
function simpson1D(x0,xn,h,f,ID){

    var x=[];
    var y=[];

    n=floor((xn-x0)/h);

    //    if(n%2==1)
    //    {
    //        n=n+1;
    //    }
    //    h=(xn-x0)/n;

    for(var i=0; i<n; i++)
    {
        x[i]=x0+i*h;
        y[i]=f(x[i],ID);

    }
    var so=0;
    var  se=0;
    for(var i=1; i<n; i++)
    {
        if(i%2==1)
        {
            so=so+y[i];
        }
        else
        {
            se=se+y[i];
        }

    }
    ans=h/3*(y[0]+y[n-1]+4*so+2*se);
    return ans;
}

function objective (){//old method used to calculate the objective function
    Obj=0;
    stepsize=10;
    for (var x=0+0.5*stepsize;x<=width-0.5*stepsize;x+=stepsize){
        for(var y=0+0.5*stepsize;y<=height-0.5*stepsize;y+=stepsize){
            Obj+=sq(stepsize)*sensing(x,y,senRange);
        }
    }
    return Obj;
}









