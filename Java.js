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
        height: 600
    }
});

function Initialize() {
    //creates all the bodies and runs the engine at start
    //creates ground, tank with cannon

    World.add(engine.world, ground);
    World.add(engine.world, ceiling);
    createTank();
    createTargets(400, 400, 25, 3);

// run the engine
    Engine.run(engine);

// run the renderer
    Render.run(render);
}

var ground = Bodies.rectangle(600, 610, 1200, 60, { isStatic: true });
var ceiling = Bodies.rectangle(600, 0, 1200, 60, { isStatic: true });
var angleConstraint;
var constraint5;
var pivot;
var cannon;
// var target;
var targetList = [];
var targetHealth = [];
function createTank() {
    //creates the tank and adds it to the world
    var wheel1=Bodies.circle(70,550,20,{ collisionFilter: { group: -1 } });
    var wheel2=Bodies.circle(130, 550, 20,{collisionFilter: { group: -1 } });
    var tank=Bodies.rectangle(100,550,100,20,{collisionFilter: { group: -1 } });
    var platform=Bodies.rectangle(100,500,60,20,{collisionFilter: { group: -1 } });
    cannon=Bodies.rectangle(100, 450, 70, 10, {collisionFilter: { group: -1 } });
    Matter.Body.setMass(cannon, 0.0001);
    pivot=Bodies.circle(100,500,20,{collisionFilter: { group: -1 } });

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
    cannon=Bodies.rectangle(100, 450, 70, 10, {collisionFilter: { group: -1 } });
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
    var bullet=Bodies.circle(pivot.position.x+70*Math.cos(angle),pivot.position.y-70*Math.sin(angle),10);
    World.add(engine.world, bullet);
    Body.setVelocity( bullet, {x: 15*Math.cos(angle), y:-15*Math.sin(angle)});
    for(t = 0; t < targetList.length; t++) {
        if (targetHealth[t] > 0) {
            checkCollision(bullet, targetList[t], t, true);
        }
    }
}

function createTargets(x, y, radius, amount) {
    for(i = 0; i < amount; i++) {
        var target = Bodies.circle(x+(100*i), y, radius, {
            // gravity: 0
            isStatic: true
        });
        targetList.push(target);
        targetHealth.push(100);
        World.add(engine.world, targetList[i]);
    }
}

/**
 * Constantly checks to see if an object hit the other.
 * It'll wait for the first object to hit the ground before it stops checking.
 * @param object1
 * @param object2
 * @param index of object2 if it's in an array. if not needed, put a really big number.
 * @param bullet if it's true, it'll check for hitting a target. if it's just waiting for it to hit the ground, it won't.
 */
function checkCollision(object1, object2, index, bullet) {
    console.log("index; " + index);
    var check = false;
    var target = setInterval(function() {
        if(Matter.SAT.collides(object1, object2, null).collided && !check && bullet) {
            check = true;
            if(checkTargetHealth(index, 50)) {
                explodeTarget(object2, index);
                World.remove(engine.world, object2);
                targetList.splice(index, 1);
                targetHealth.splice(index, 1);
            }
        }
        if(Matter.SAT.collides(object1, ground, null).collided) {
            removeBody(object1);
            clearInterval(target);
        }
    }, 10);
}

function explodeTarget(target, index) {
    var num = Math.floor(Math.random() * 5) + 5;
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
    console.log("health: " + targetHealth);
    return targetHealth[index] <= 0;
}