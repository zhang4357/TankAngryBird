// module aliases
var Engine = Matter.Engine,
    Render = Matter.Render,
    World = Matter.World,
    Composites = Matter.Composites,
    Constraint = Matter.Constraint,
    Bodies = Matter.Bodies,
    Body = Matter.Body;


// create an engine
var engine = Engine.create();

// create a renderer
var render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        width: 1200,
        height: 600,
        showAngleIndicator: true
    }
});

function Initialize() {
    //creates all the bodies and runs the engine at start
    //creates ground, tank with cannon
    var ground = Bodies.rectangle(600, 610, 1200, 60, { isStatic: true });
    World.add(engine.world, ground);
    createTank();


// run the engine
    Engine.run(engine);

// run the renderer
    Render.run(render);
}

var angleConstraint;
var constraint5;
var pivot;
var cannon;
var wheel1;
var wheel2;
var platform;
function createTank() {
    //creates the tank and adds it to the world

    wheel1=Bodies.circle(70,550,20,{ collisionFilter: { group: -1 } });
    wheel2=Bodies.circle(130, 550, 20,{collisionFilter: { group: -1 } });
    tank=Bodies.rectangle(100,550,100,20,{collisionFilter: { group: -1 } });
    platform=Bodies.rectangle(100,500,60,20,{collisionFilter: { group: -1 } });
    cannon=Bodies.rectangle(100, 450, 70, 10, {collisionFilter: { group: -1 } });
    Matter.Body.setMass(cannon, 0.0001);
    pivot=Bodies.circle(100,500,20,{collisionFilter: { group: -1 } });
    //keypress
    document.onkeydown = Key.keyPressed;
    //document.onkeyup = Key.keyUp;
    //constrains/attaches two bodies together
    var constraint1 = Constraint.create({
        //constrains left wheel and tank body
        bodyA: tank,
        //these points are based off of the center point of the bodies
        pointA: { x: -50, y: 0 },
        bodyB: wheel1,
        pointB: { x: 0, y: 0 },
        length:0
    });
    var constraint2 = Constraint.create({
        //right wheel and tank body
        bodyA: tank,
        pointA: { x: 50, y: 0 },
        bodyB: wheel2,
        pointB: { x: 0, y: 0 },
        length:0
    });
    var constraint3 = Constraint.create({
        //platform and tank (needs two points  of constraint otherwise the body will rotate
        bodyA: tank,
        pointA: { x: -20, y: -10 },
        bodyB: platform,
        pointB: { x: -20, y: 10 },
        length:0
    });
    var constraint4 = Constraint.create({
        //platform  and tank
        bodyA: tank,
        pointA: { x: 10, y: -10 },
        bodyB: platform,
        pointB: { x: 10, y: 10 },
        length:0
    });
    constraint5 = Constraint.create({
        //pivot  and cannon anchoring point
        bodyA: cannon,
        pointA: { x: -35, y: 0 },
        bodyB: pivot,
        pointB: { x: 0, y: 0},
        length:0
    });
    var constraint6 = Constraint.create({
        //platform  and pivot (needs two so it doesn't rotate)
        bodyA: pivot,
        pointA: { x: 20, y: 0 },
        bodyB: platform,
        pointB: { x: 20, y: -10},
        length:0
    });
    var constraint7 = Constraint.create({
        //platform  and pivot (needs two so it doesn't rotate)
        bodyA: pivot,
        pointA: { x: -20, y: 0 },
        bodyB: platform,
        pointB: { x: -20, y: -10},
        length:0
    });
    angleConstraint = Constraint.create({
        //cannon  and pivot(will be used to adjust the angle)
        bodyA: pivot,
        pointA: { x: 20*Math.cos(angle), y: -20*Math.sin(angle) },
        bodyB: cannon,
        pointB: { x: -15, y: 0},
        length:0
    });
    World.add(engine.world, [wheel1,wheel2, tank, platform, cannon, pivot, constraint1, constraint2, constraint3, constraint4, constraint5, constraint6, constraint7,angleConstraint]);
}

//cannon starts out horizontal
var angle=0;
function changeAngle(deltaAngle) {
    //adjusts the angle of the cannon
    angle=angle+deltaAngle;
    World.remove(engine.world, [angleConstraint, cannon,  constraint5]);
    cannon=Bodies.rectangle(pivot.position.x, pivot.position.y, 70, 10, {collisionFilter: { group: -1 } });
    Matter.Body.setMass(cannon, 0.0001);
    angleConstraint = Constraint.create({
        //cannon  and pivot(will be used to adjust the angle)
        bodyA: pivot,
        pointA: { x: 20*Math.cos(angle), y: -20*Math.sin(angle) },
        bodyB: cannon,
        pointB: { x: -15, y: 0},
        length:0
    });
    constraint5 = Constraint.create({
        //pivot  and cannon anchoring point
        bodyA: cannon,
        pointA: { x: -35, y: 0 },
        bodyB: pivot,
        pointB: { x: 0, y: 0},
        length:0
    });
     World.add(engine.world, [angleConstraint, cannon, constraint5]);


}

function shootBullet(){
    //fires a plain bullet
    var vel=15;
    var bullet=Bodies.circle(pivot.position.x+70*Math.cos(angle),pivot.position.y-70*Math.sin(angle),5);
    World.add(engine.world, bullet);
    Body.setVelocity( bullet, {x: vel*Math.cos(angle), y:-vel*Math.sin(angle)});
}

var barrageBullet;
function startBarrage(){
    //fires a barrage shot
    var vel=20;
    barrageBullet=Bodies.circle(pivot.position.x+70*Math.cos(angle),pivot.position.y-70*Math.sin(angle),5);
    World.add(engine.world, barrageBullet);
    Body.setVelocity( barrageBullet, {x: vel*Math.cos(angle), y:-vel*Math.sin(angle)});
}


function shootBarrage(){
    //initiates the barrage/separation
    var bullet1=Bodies.circle(barrageBullet.position.x, barrageBullet.position.y, 5);
    var bullet2=Bodies.circle(barrageBullet.position.x, barrageBullet.position.y,5);
    World.add(engine.world, [bullet1,bullet2]);
    Body.setVelocity(bullet1, {x: barrageBullet.velocity.x, y:barrageBullet.velocity.y-5});
    Body.setVelocity(bullet2, {x: barrageBullet.velocity.x, y:barrageBullet.velocity.y+5});
}

var explosiveBullet;
function startExplosive() {
    //fires and explosive shot
    var vel=10;
    explosiveBullet=Bodies.circle(pivot.position.x+70*Math.cos(angle),pivot.position.y-70*Math.sin(angle),5);
    World.add(engine.world, explosiveBullet);
    Body.setVelocity( explosiveBullet, {x: vel*Math.cos(angle), y:-vel*Math.sin(angle)});

}

//shoots the explosive
function shootExplosive() {
    //initiates the explosion
    var num=20;
    var direction=0;
    World.remove(engine.world, explosiveBullet);
    for(i=0;i<num;i++){
        var bulletTemp=Bodies.circle(explosiveBullet.position.x, explosiveBullet.position.y,3);
        World.add(engine.world, [bulletTemp]);
        Body.setVelocity(bulletTemp, {x: explosiveBullet.velocity.x+5*Math.cos(direction), y:explosiveBullet.velocity.y+5*Math.sin(direction)});
        direction+=(360/num)+Math.PI/180;
    }

}

function move(o) { //for each function for movements
    var speed=5;
    switch (o) {
        case 'a' : //move backwards
            Body.setVelocity(wheel1, {x: -speed, y:0});
            Body.setVelocity(wheel2, {x: -speed, y:0});
            break;
        case 'd' : //move forwards
            Body.setVelocity(wheel1, {x: speed, y:0});
            Body.setVelocity(wheel2, {x: speed, y:0});
            break;
        case 'w' : //raise angle
            changeAngle(Math.PI/20);
            break;
        case 's' : //lower angle
            changeAngle(-Math.PI/20);
            break;
        case 'enter' : //shoot with shift
            shootBarrage();
            break;
        case 'space' : //shoot with spacebar
            startBarrage();
            break;
    }
};

var Key = { //event code for pressing keys
    keyPressed : function (event) {
        switch(event.keyCode) {
            case 65:
                move('a');
                break;
            case 68:
                move('d');
                break;
            case 87:
                move('w');
                break;
            case 83:
                move('s');
                break;
            case 13:
                move('enter');
                break;
            case 32:
                move('space');
                break;
        }},

};


