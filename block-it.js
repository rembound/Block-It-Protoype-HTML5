// ------------------------------------------------------------
// Making A Block It Game Prototype With HTML5
// Copyright (c) 2015 Rembound.com
// 
// This program is free software: you can redistribute it and/or modify  
// it under the terms of the GNU General Public License as published by  
// the Free Software Foundation, either version 3 of the License, or  
// (at your option) any later version.
// 
// This program is distributed in the hope that it will be useful,  
// but WITHOUT ANY WARRANTY; without even the implied warranty of  
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the  
// GNU General Public License for more details.  
// 
// You should have received a copy of the GNU General Public License  
// along with this program.  If not, see http://www.gnu.org/licenses/.
//
// http://rembound.com/articles/making-a-block-it-game-prototype-with-html5
// ------------------------------------------------------------

// The function gets called when the window is fully loaded
window.onload = function() {
    // Get the canvas and context
    var canvas = document.getElementById("viewport"); 
    var context = canvas.getContext("2d");
    
    // Timing and frames per second
    var lastframe = 0;
    var fpstime = 0;
    var framecount = 0;
    var fps = 0;
    
    // Level properties
    var level = {
        x: 80,
        y: 48,
        width: canvas.width - 160,
        height: canvas.height - 96,
        wallsize: 16
    };
    
    // Ball
    var ball = {
        x: 0,
        y: 0,
        width: 35,
        height: 35,
        xdir: 0,
        ydir: 0,
        speed: 0
    }
    
    // Variables
    var score = 0;              // Score
    var blocked = false;        // Bottom wall is active
    var blockedtime = 0;        // How long the wall has been active
    var blockedlength = 0.1;    // How long the wall will be active
    var blockcooldown = 1;      // Waiting time between wall activations
    var gameover = true;        // Game is over
    var gameovertime = 0;       // How long we have been game over
    var gameoverdelay = 1;      // Waiting time after game over
    
    // Initialize the game
    function init() {
        // Add mouse events
        canvas.addEventListener("mousedown", onMouseDown);
        
        // New game
        newGame();
    
        // Enter main loop
        main(0);
    }
    
    function newGame() {
        // Initialize the ball
        ball.x = level.x + (level.width - ball.width) / 2;
        ball.y = level.y + level.height - ball.height;
        ball.speed = 500;
        
        // Random direction
        ball.xdir = 0.4 + (Math.random())/2;
        ball.ydir = -1;
        
        // Random left or right
        if (Math.random() < 0.5) {
            ball.xdir *= -1;
        }
        
        // Normalize the direction
        var dirlen = Math.sqrt(ball.xdir*ball.xdir + ball.ydir*ball.ydir);
        ball.xdir /= dirlen;
        ball.ydir /= dirlen;
        
        // Initialize the score
        score = 0;
        
        // Initialize variables
        blocked = false;
        blockedtime = blockcooldown;
        gameover = true;
        gameovertime = 0;
    }
    
    // Main loop
    function main(tframe) {
        // Request animation frames
        window.requestAnimationFrame(main);
        
        // Update and render the game
        update(tframe);
        render();
    }
    
    // Update the game state
    function update(tframe) {
        var dt = (tframe - lastframe) / 1000;
        lastframe = tframe;
        
        // Update the fps counter
        updateFps(dt);
        
        if (!gameover) {
            updateGame(dt);
        } else {
            gameovertime += dt;
        }
    }
    
    function updateGame(dt) {
        // Move the ball, time-based
        ball.x += dt * ball.speed * ball.xdir;
        ball.y += dt * ball.speed * ball.ydir;
        
        // Open the wall after some time
        blockedtime += dt;
        if (blocked) {
            if (blockedtime > blockedlength) {
                blocked = false;
            }
        }
        
        // Handle left and right collisions with the level
        if (ball.x <= level.x) {
            // Left edge
            ball.xdir *= -1;
            ball.x = level.x;
        } else if (ball.x + ball.width >= level.x + level.width) {
            // Right edge
            ball.xdir *= -1;
            ball.x = level.x + level.width - ball.width;
        }
        
        // Handle top collisions with the level
        if (ball.y <= level.y) {
            // Top edge
            ball.ydir *= -1;
            ball.y = level.y;
        }
        
        // Check if the ball collides with the bottom wall
        // Only do this, while the ball is moving to the bottom
        if (blocked && ball.ydir > 0 &&
            rectIntersection(ball.x, ball.y, ball.width, ball.height,
                             level.x, level.y+level.height, level.width,
                             level.wallsize) && ball.ydir > 0) {

            // Wall is closed
            ball.ydir *= -1;

            // Increase the score
            score += 1;
            
            // Increase the speed of the ball by 5 percent
            ball.speed *= 1.05;
        } else if (ball.ydir > 0 && ball.y > level.y+level.height+level.wallsize) {
            // Ball escaped, game over
            ball.speed = 0;
            gameover = true;
        }
    }
    
    // Check if there is a rect intersection
    function rectIntersection(x1, y1, w1, h1, x2, y2, w2, h2) {
        if (x1 <= x2 + w2 && x1 + w1 >= x2 &&
            y1 <= y2 + h2 && y1 + h1 >= y2) {
            
            return true;
        }
        
        return false;
    }
    
    function updateFps(dt) {
        if (fpstime > 0.25) {
            // Calculate fps
            fps = Math.round(framecount / fpstime);
            
            // Reset time and framecount
            fpstime = 0;
            framecount = 0;
        }
        
        // Increase time and framecount
        fpstime += dt;
        framecount++;
    }
    
    // Render the game
    function render() {
        // Draw background
        context.fillStyle = "#577ddb";
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw walls
        context.fillStyle = "#ffffff";
        context.fillRect(level.x-level.wallsize, level.y-level.wallsize, level.wallsize,
                         level.height+2*level.wallsize); // Left
        context.fillRect(level.x+level.width, level.y-level.wallsize, level.wallsize,
                         level.height+2*level.wallsize); // Right
        context.fillRect(level.x, level.y-level.wallsize, level.width, level.wallsize); // Top
        
        // Draw bottom wall if closed
        if (blocked) {
            context.fillRect(level.x, level.y+level.height, level.width, level.wallsize);
        }
        
        // Draw score inside the level
        context.fillStyle = "rgba(255, 255, 255, 0.7)";
        context.font = "240px Verdana";
        drawCenterText(score, level.x, level.y+level.height-150, level.width);
        
        // Draw the ball
        var centerx = ball.x + ball.width/2;
        var centery = ball.y + ball.height/2;
        context.beginPath();
        context.arc(centerx, centery, ball.width/2-3, 0, 2*Math.PI, false);
        context.fillStyle = "#000000";
        context.fill();
        context.lineWidth = 5;
        context.strokeStyle = "#ffffff";
        context.stroke();
        
        // Game over
        if (gameover) {
            context.fillStyle = "rgba(0, 0, 0, 0.5)";
            context.fillRect(0, 0, canvas.width, canvas.height);
            
            context.fillStyle = "#ffffff";
            context.font = "24px Verdana";
            drawCenterText("Click to start", 0, canvas.height/2, canvas.width);
        }
    }
    
    // Draw text that is centered
    function drawCenterText(text, x, y, width) {
        var textdim = context.measureText(text);
        context.fillText(text, x + (width-textdim.width)/2, y);
    }
    
    // Mouse event handlers
    function onMouseDown(e) {
        // Get the mouse position
        var pos = getMousePos(canvas, e);
        
        // Start a new game
        if (gameover && gameovertime > gameoverdelay) {
            newGame();
            gameover = false;
        }
        
        // Show the wall
        if (!gameover && blockedtime >= blockcooldown) {
            blockedtime = 0;
            blocked = true;
        }
    }
    
    // Get the mouse position
    function getMousePos(canvas, e) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: Math.round((e.clientX - rect.left)/(rect.right - rect.left)*canvas.width),
            y: Math.round((e.clientY - rect.top)/(rect.bottom - rect.top)*canvas.height)
        };
    }
    
    // Call init to start the game
    init();
};