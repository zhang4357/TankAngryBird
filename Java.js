var canvasH=0;
var canvasW=0;
var borderW=10;
var Engine = Matter.Engine,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Body = Matter.Body;

var engine = Engine.create();

function Initialize() {
    var ctx=document.getElementById("Canvas").getContext("2d");
    canvasH=ctx.height;
    canvasH=ctx.width;
    var topWall = Bodies.rectangle(400, 50, 720, 20, { isStatic: true });
    var leftWall = Bodies.rectangle(50, 210, 20, 300, { isStatic: true });
    var rightWall = Bodies.rectangle(750, 210, 20, 300, { isStatic: true });
    var bottomWall = Bodies.rectangle(400, 350, 720, 20, { isStatic: true });

    box = Bodies.rectangle(90, 120, 40, 40, { friction: 0 , frictionAir: 0});
    target = createCircle(600, 200, 50);
    


    World.add(engine.world, [topWall, leftWall, rightWall, bottomWall, box, target]);
    bodies = Matter.Composite.allBodies(engine.world);


    for(i = 0; i < bodies.length; i++) {
        objects.push(createObject(bodies[i].vertices));

    }
}
function startAnimation() {
    Animation();
    Engine.run(engine);

}
function stopAnimation() {
    cancelAnimationFrame(a);
}
function Animation() {
    a=requestAnimationFrame(Animation);
    var ctx=document.getElementById("Canvas").getContext("2d");
    drawBackground();
    drawObjects();

}
function drawObjects() {
    var ctx=document.getElementById("Canvas").getContext("2d");
    ctx.fillStyle = "#000000";
    objects=[];
    bodies = Matter.Composite.allBodies(engine.world);
    for(i = 0; i < bodies.length; i++) {
        objects.push(createObject(bodies[i].vertices));
    }
    for (i = 0; i < objects.length; i++) {
        ctx.beginPath();
        //Move to first Vertex
        ctx.moveTo(objects[i].vertices[0].x, objects[i].vertices[0].y);
        //This starts at index 1 becuase the first line should be going to the second vertex
        for (v = 1; v < objects[i].vertices.length; v++) {
            ctx.lineTo(objects[i].vertices[v].x, objects[i].vertices[v].y);
        }
        //Draw line back to the first
        ctx.lineTo(objects[i].vertices[0].x, objects[i].vertices[0].y);
        //Fill in the shape with color
        ctx.fill();
    }
}

function drawBackground() {
    var ctx=document.getElementById("Canvas").getContext("2d");
    ctx.fillStyle="#FFFFFF";
    ctx.fillRect(0,0,800,600);
}

function createObject(vertices) {
    return { vertices: vertices };
}

function changeLinearV(velocity, angle) {
    Body.setVelocity( box, {x: velocity*Math.cos(angle), y:-velocity*Math.cos(angle)});
}

function changeAngularV() {
    Body.setAngularVelocity( box, Math.PI/6);
}

function createCircle(x, y, radius) {
    var circle = Bodies.circle(x, y, radius);
    return circle;
}