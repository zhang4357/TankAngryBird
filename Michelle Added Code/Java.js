// module aliases
var Engine = Matter.Engine,
    Render = Matter.Render,
    World = Matter.World,
    Composite = Matter.Composite,
    Constraint = Matter.Constraint,
    Bodies = Matter.Bodies,
    Events = Matter.Events,
    Common = Matter.Common,
    Body = Matter.Body,
    MouseConstraint = Matter.MouseConstraint,
    Mouse = Matter.Mouse;


// create an engine
var engine = Engine.create();

// create a renderer
var render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        width: 1200,
        height: 600,
        showAngleIndicator: true,
        wireframes: false,
        background: '#ffffff',
    }
});
// add mouse control
var mouse = Mouse.create(render.canvas),
    mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
            stiffness: 0.2,
            render: {
                visible: false
            }
        }
    });

World.add(engine.world, mouseConstraint);

// keep the mouse in sync with rendering
render.mouse = mouse;

var ground;
var ceiling;
var play;
function Initialize() {
    //creates start menu and runs the engine at start

    play=Bodies.circle(600,300,250, {
        isStatic: true,
        render: {
            strokeStyle: '#ffffff',
            sprite: {
                texture: './img/playbtn.png',
            }
        }
    });
    World.add(engine.world, play);

// run the engine
    Engine.run(engine);

// run the renderer
    Render.run(render);
}


Events.on(mouseConstraint, 'mousedown', function() {
    if (mouseConstraint.body===play) {
        //checks if the play button is clicked
        World.remove(engine.world, [play,mouse,mouseConstraint]);
        levelSelection();
    }
    else if(mouseConstraint.body===level1){
        //checks if the level one button is clicked
        World.remove(engine.world, [level1,mouse,mouseConstraint]);
        setLevel1();
    }
});

// an example of using beforeUpdate event on an engine
Events.on(engine, 'afterUpdate', function() {
    //resets the level if the tank falls off the edge
    //console.log(pivot.position.y);
    if(pivot.position.y>600){
        //World.remove(engine.world, [Composite.allBodies(engine.world)]);
        World.clear(engine.world);
        //console.log("hi");
        bullettype=1;
        setLevel1();
    }
});

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
    for(t = 0; t < targetList.length; t++) {
        if (targetHealth[t] > 0) {
            checkCollision(bullet, targetList[t], t, true, 10);
        }
    }
}

var barrageBullet;
function startBarrage(){
    //fires a barrage shot
    var vel=20;
    barrageBullet=Bodies.circle(pivot.position.x+70*Math.cos(angle),pivot.position.y-70*Math.sin(angle),5);
    World.add(engine.world, barrageBullet);
    Body.setVelocity( barrageBullet, {x: vel*Math.cos(angle), y:-vel*Math.sin(angle)});
    for(t = 0; t < targetList.length; t++) {
        if (targetHealth[t] > 0) {
            checkCollision(barrageBullet, targetList[t], t, true, 20);
        }
    }

}


function shootBarrage(){
    //initiates the barrage/separation
    var bullet1=Bodies.circle(barrageBullet.position.x, barrageBullet.position.y, 5);
    var bullet2=Bodies.circle(barrageBullet.position.x, barrageBullet.position.y,5);
    World.add(engine.world, [bullet1,bullet2]);
    Body.setVelocity(bullet1, {x: barrageBullet.velocity.x, y:barrageBullet.velocity.y-5});
    Body.setVelocity(bullet2, {x: barrageBullet.velocity.x, y:barrageBullet.velocity.y+5});
    for(t = 0; t < targetList.length; t++) {
        if (targetHealth[t] > 0) {
            checkCollision(bullet1, targetList[t], t, true, 30);
        }
    }
    for(t = 0; t < targetList.length; t++) {
        if (targetHealth[t] > 0) {
            checkCollision(bullet2, targetList[t], t, true, 30);
        }
    }
}

var explosiveBullet;
function startExplosive() {
    //fires an explosive shot
    var vel=10;
    explosiveBullet=Bodies.circle(pivot.position.x+70*Math.cos(angle),pivot.position.y-70*Math.sin(angle),5);
    World.add(engine.world, explosiveBullet);
    Body.setVelocity( explosiveBullet, {x: vel*Math.cos(angle), y:-vel*Math.sin(angle)});
    for(t = 0; t < targetList.length; t++) {
        if (targetHealth[t] > 0) {
            checkCollision(explosiveBullet, targetList[t], t, true, 20);
        }
    }

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
        for(t = 0; t < targetList.length; t++) {
            if (targetHealth[t] > 0) {
                checkCollision(bulletTemp, targetList[t], t, true, 50);
            }
        }
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
        case 'enter' : //activate shot
            if(bullettype === 2) {
                shootBarrage();
            }
            else if(bullettype === 3) {
                shootExplosive();
            }
            break;
        case 'space' : //shoot with spacebar
            if(bullettype === 1) {
                shootBullet();
            }
            else if(bullettype === 2) {
                startBarrage();
            }
            else {
                startExplosive();
            }
            break;
    }
}


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
        }
        if(event.keyCode === 49 || event.keyCode === 50 || event.keyCode === 51) {
            console.log("changing");
            changeBullet(event.keyCode - 48);
        }},

};

var targetList = [];
var targetHealth = [];
function createTargets(x, y, radius, amount) {
    for(i = 0; i < amount; i++) {
        var target = Bodies.circle(x+(100*i), y, radius, {
            //gravity: 0
             isStatic: true
        });
        targetList.push(target);
        targetHealth.push(100);
        World.add(engine.world, target);
    }
    //console.log(targetList.length);
}

/**
 * Constantly checks to see if an object hit the other.
 * It'll wait for the first object to hit the ground before it stops checking.
 * @param object1
 * @param object2
 * @param index of object2 if it's in an array. if not needed, put a really big number.
 * @param bullet if it's true, it'll check for hitting a target. if it's just waiting for it to hit the ground, it won't.
 */
function checkCollision(object1, object2, index, bullet, damage) {
    console.log("index; " + index);
    var check = false;
    var target = setInterval(function() {
        if(Matter.SAT.collides(object1, object2, null).collided && !check && bullet) {
            check = true;
            if(checkTargetHealth(index, damage)) {
                explodeTarget(object2, index);
                World.remove(engine.world, object2);
                //targetList.splice(index, 1);
                //targetHealth.splice(index, 1);
            }
        }
        if(Matter.SAT.collides(object1, ground, null).collided) {
            removeBody(object1);
            clearInterval(target);
        }
    }, 10);
}

function explodeTarget(target, index) {
    var num = Math.floor(Math.random() * 5) + 10;
    //var num=30;
    var direction = 0;
    for(i = 0; i < num; i++) {
        var targetShard = Bodies.circle(target.position.x, target.position.y, 4);
        World.add(engine.world, targetShard);
        Body.setVelocity(targetShard, {x: Math.cos(direction), y: Math.sin(direction)});
        direction += (360/num) + (Math.PI/180);
        checkCollision(targetShard, ceiling, index, false);
    }
}

/**
 * Sets a timer for the body to be removed from the screen.
 * @param body: body to be removed
 */
function removeBody(body) {
    setTimeout(function () {
        World.remove(engine.world, body);
    }, 1750);
}


/**
 Lowers the health of the target that got hit.
 If the target's health is <= 0 (dead), it'll return true. If not, false.
 @param index - index of targetHealth array
 @param damage - damage to be done to the target. varies depending on bullet type
 */
function checkTargetHealth(index, damage) {
    targetHealth[index] -= damage;
    console.log("health: " + targetHealth +"index:" + index);
    return targetHealth[index] <=0 && targetHealth[index]>-50;
}


function setLevel1(){
    //sets up the first level
    ground = Bodies.rectangle(200, 610, 400, 60, { isStatic: true });
    ceiling=Bodies.rectangle(600, 0, 1200, 60, { isStatic: true });

    createTank();

    for (k=1;k<=5;k++){
        createTargets(400, 100*k, 25, 1);
    }
    createTargets(990, 300, 40, 1);

    var bottomPlatform=Bodies.rectangle(600, 200, 200, 20);
    Matter.Body.setMass(bottomPlatform, 0.2);
    var bottomConstraint = Constraint.create({
        pointA: { x: 700, y: 550 },
        bodyB: bottomPlatform,
        length: 0
    });
    var midPlatform=Bodies.rectangle(600, 200, 20, 450);
    Matter.Body.setMass(midPlatform, 0.3);
    var constraintMid = Constraint.create({
        pointA: { x: 700, y: 300 },
        bodyB: midPlatform,
        length: 0
    });
    //var ball = Bodies.circle(650, 150, 20);
    World.add(engine.world, [ground, ceiling, midPlatform,constraintMid, bottomConstraint, bottomPlatform]);

}

var level1;
function levelSelection(){
    level1=Bodies.circle(600,300,100, {
        isStatic: true,
        render: {
            strokeStyle: '#ffffff',
            sprite: {
                texture: './img/buttonOne.png',
            }
        }
    });
    World.add(engine.world, level1);
}

/**
 Changes the bullet type depending on the button they press.
 1 - Normal
 2 - Explosive
 3 - Barrage
 */
var bullettype=1;
function changeBullet(type) {
    bullettype = type;
}