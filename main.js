const gravity_value = 0.4;
const initialObstacleSpeed = 3;
const flap_speed = 6;
var myGamePiece;
var myObstacles = [];
var myScore = 0;
var highscore = 0;
var canvas_width = 640;
var canvas_height = 480;
var obstacleSpeed = initialObstacleSpeed;
var obstacleRiseSpeed = 0.2;
var obstacleDistance = 0;
var toUpdateScore = true;
var flapIndex = 0;
var globalVolume = 0.1;
var difficulty = {
    'Easy': 0,
    'Medium': 1,
    'Hard': 2
}
var gameState = {
    currentState: 1,
    introState: 0,
    inGameState: 1,
    gameOverState: 2
}

var pipeColors = ["Gold", "Green", "Magenta", "Turquoise", "DarkBlue", "Brown", "MistyRose", "HotPink", "Crimson"]

function startGame() {
    myGamePiece = new component(20, 20, "red", 50, 120, "game_piece");
    myGamePiece.gravity = gravity_value;
    myGamePiece.interval = setInterval(flapAnimation, 200);
    myBackground.start();
    myGameArea.start();
    settingsScreen();
    splashScreen();
}

function flapAnimation() {
    if (gameState.currentState != gameState.gameOverState) {
        flapIndex = (flapIndex + 1) % 3;
    }
}

function settingsScreen() {
    let imgOffsetX = 20;
    let imgOffsetY = 20;

    settingsCanvas = document.getElementById('settings_canvas');
    settingsCtx = settingsCanvas.getContext('2d');
    settingsCanvas.width = 640;
    settingsCanvas.height = 480;
    settingsCanvas.style.zIndex = 1;

    if (globalVolume != 0) {
        settingsCtx.drawImage(imageRepository.volUpImg, canvas_width - imageRepository.volUpImg.width - imgOffsetX, imgOffsetY);
    } else
        settingsCtx.drawImage(imageRepository.volDownImg, canvas_width - imageRepository.volDownImg.width - imgOffsetX, imgOffsetY);

    window.addEventListener('click', e => {
        if (e.offsetX >= canvas_width - imageRepository.volUpImg.width - imgOffsetX && e.offsetX <= canvas_width - imgOffsetX && e.offsetY >= imgOffsetY && e.offsetY <= imgOffsetY + imageRepository.volUpImg.height) {
            globalVolume = globalVolume == 0.1 ? 0 : 0.1;
            if (globalVolume != 0) {
                settingsCtx.drawImage(imageRepository.volUpImg, canvas_width - imageRepository.volUpImg.width - imgOffsetX, imgOffsetY);
            } else
                settingsCtx.drawImage(imageRepository.volDownImg, canvas_width - imageRepository.volDownImg.width - imgOffsetX, imgOffsetY);

        }
    });

}

function splashScreen() {
    gameState.currentState = gameState.introState;
    splashCanvas = document.getElementById('splash_canvas');
    splashCtx = splashCanvas.getContext('2d');
    splashCanvas.width = 640;
    splashCanvas.height = 480;
    splashCanvas.style.zIndex = 2;
    splashCtx.drawImage(imageRepository.splashScreenImg, 0, 0);
    document.body.appendChild(splashCanvas);

    window.addEventListener('keydown', e => {
        if (e.code == 'Space') {
            gameState.currentState = gameState.inGameState;
            document.body.removeChild(splashCanvas);
        }
    }, {
        once: true
    });
}

function gameOver() {
    gameState.currentState = gameState.gameOverState;
    audio_play(soundsRepository.hit_audio);
    setTimeout(() => audio_play(soundsRepository.die_audio), canvas_height - myGamePiece.y);
    canvas = document.createElement('canvas')
    ctx = canvas.getContext('2d');
    canvas.id = "GameOverLayer";
    canvas.width = 640;
    canvas.height = 480;
    canvas.style.zIndex = 1
    saveHighscore();
    ctx.drawImage(imageRepository.gameOverImg, 0, 0);
    ctx.font = "68px Impact";
    ctx.textAlign = "center";
    ctx.fillStyle = '#000000';
    ctx.lineWidth = 10;
    ctx.strokeText(myScore, 235, 290);
    ctx.strokeText(localStorage.highscore, 410, 290);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(myScore, 235, 290);
    ctx.fillText(localStorage.highscore, 410, 290);
    document.body.appendChild(canvas);

    canvas.addEventListener('click', e => {
        if (e.offsetX >= 240 && e.offsetX <= 400 && e.offsetY >= 386 && e.offsetY <= 443) {
            document.body.removeChild(canvas);
            restartGame();
        }
    });
}

function restartGame() {
    toUpdateScore = true;
    obstacleSpeed = initialObstacleSpeed;
    myScore = 0;
    obstacleDistance = 0;
    myGameArea.frameNo = 0;
    myGamePiece.resetPos();
    myGamePiece.gravity = gravity_value;
    myObstacles = [];
    gameState.currentState = gameState.inGameState;
}

var imageRepository = new function () {
    this.background = new Image();
    this.background.src = "images/background.png";
    this.gamePieceImg1 = new Image();
    this.gamePieceImg1.src = "images/flap1.png";
    this.gamePieceImg2 = new Image();
    this.gamePieceImg2.src = "images/flap2.png";
    this.gamePieceImg3 = new Image();
    this.gamePieceImg3.src = "images/flap3.png";
    this.gamePieceImg = [this.gamePieceImg1, this.gamePieceImg2, this.gamePieceImg3]
    this.ground = new Image();
    this.ground.src = "images/ground.png";
    this.clouds = new Image();
    this.clouds.src = "images/clouds.png";
    this.gameOverImg = new Image();
    this.gameOverImg.src = "images/gameover.png";
    this.splashScreenImg = new Image();
    this.splashScreenImg.src = "images/splash.png";
    this.volDownImg = new Image();
    this.volDownImg.src = "images/voldown.png";
    this.volUpImg = new Image();
    this.volUpImg.src = "images/volup.png";
}

var soundsRepository = new function () {
    this.flap_audio = new Audio('sounds/sfx_wing.wav');
    this.flap_audio.volume = globalVolume;
    this.die_audio = new Audio('sounds/sfx_die.wav');
    this.die_audio.volume = globalVolume;
    this.hit_audio = new Audio('sounds/sfx_hit.wav');
    this.hit_audio.volume = globalVolume;
    this.point_audio = new Audio('sounds/sfx_point.wav');
    this.point_audio.volume = globalVolume;
    this.swooshing_audio = new Audio('sounds/sfx_swooshing.wav');
    this.swooshing_audio.volume = globalVolume;
}

function audio_play(sound_clip) {
    sound_clip.volume = globalVolume;
    sound_clip.play();
}

var myGameArea = {
    canvas: document.getElementById("game_canvas"),
    start: function () {
        this.canvas.addEventListener("touchstart", () => flap(), false);
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.frameNo = 0;
        this.ground_movement = 0;
        this.interval = setInterval(updateGameArea, 20);
        window.addEventListener('keydown', function (e) {
            e.preventDefault();
            myGameArea.keys = (myGameArea.keys || []);
            myGameArea.keys[e.code] = (e.type == "keydown");
        })
        window.addEventListener('keyup', function (e) {
            myGameArea.keys[e.code] = (e.type == "keydown");
        })
    },
    restart: function () {
        this.interval = setInterval(updateGameArea, 20);
    },
    stop: function () {
        clearInterval(this.interval);
    },
    clear: function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

function handleStart(evt) {
    flap();
}

var myBackground = {
    canvas: document.getElementById("background_canvas"),
    start: function () {
        this.scrollIndex = 0;
        this.context = this.canvas.getContext("2d");
        this.interval = setInterval(scrollBackground, 20);
    },
    restart: function () {
        this.interval = setInterval(scrollBackground, 20);

    },
    stop: function () {
        clearInterval(this.interval);
    },
    scroll: function () {
        this.clear();
        this.context.drawImage(imageRepository.background, -this.scrollIndex, -50);
        this.context.drawImage(imageRepository.background, -this.scrollIndex + imageRepository.background.width, -50);
        this.context.drawImage(imageRepository.clouds, this.canvas.width - this.scrollIndex * 1.5, 40);
    },
    clear: function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

function scrollBackground() {
    if (myBackground.scrollIndex > imageRepository.background.width) {
        myBackground.scrollIndex = 0;
    }
    if (gameState.currentState != gameState.gameOverState) {

        myBackground.scrollIndex += 0.5;
    }
    myBackground.scroll();
}

class component2 {
    constructor(width, height, color, x, y, type) {

    }
}

function component(width, height, color, x, y, type, isGoingUp = 1) {
    this.type = type;
    this.score = 0;
    this.width = width;
    this.height = height;
    this.speedX = 0;
    this.speedY = 0;
    this.x = x;
    this.y = y;
    this.gravity = 0;
    this.gravitySpeed = 0;
    this.rotation_angle = 30;
    this.isGoingUp = isGoingUp;

    this.update = function () {
        ctx = myGameArea.context;

        switch (this.type) {
            case "game_piece":
                ctx.fillStyle = color;
                this.drawImgRot(imageRepository.gamePieceImg[flapIndex], this.x - 15, this.y - 15, this.width + 30, this.height + 30, this.gravitySpeed * 5);
                break;
            case "obstacle_top":
            case "obstacle_bottom":
                var outline_color = "#20161B";
                var line_thickness = 2;
                var lip_width = 4;
                var lip_height = 15;
                ctx.fillStyle = outline_color;
                ctx.fillRect(this.x - line_thickness, this.y - line_thickness, this.width + line_thickness * 2, this.height + line_thickness * 2);
                var my_gradient = ctx.createLinearGradient(this.x - 20, this.y, this.x + this.width + 10, this.y);
                my_gradient.addColorStop(0, "black");
                my_gradient.addColorStop(0.5, color);
                my_gradient.addColorStop(1, "white");
                ctx.fillStyle = my_gradient;
                ctx.fillRect(this.x, this.y, this.width, this.height);
                var my_gradient = ctx.createLinearGradient(this.x - 40, this.y, this.x + this.width + 20, this.y);
                my_gradient.addColorStop(0, "black");
                my_gradient.addColorStop(0.5, color);
                my_gradient.addColorStop(1, "white");
                ctx.fillStyle = my_gradient;
                if (this.type == "obstacle_top") {
                    ctx.fillStyle = outline_color;
                    ctx.fillRect(this.x - lip_width - line_thickness, this.y + this.height - lip_height - line_thickness, this.width + lip_width * 2 + line_thickness * 2, lip_height + line_thickness * 2);
                    ctx.fillStyle = my_gradient;

                    ctx.fillRect(this.x - lip_width, this.y + this.height - lip_height, this.width + lip_width * 2, lip_height);
                    ctx.fillStyle = 'rgba(255,255,255,0.2)';
                    ctx.fillRect(this.x - lip_width, this.y + this.height - lip_height, this.width + lip_width * 2, 3);

                } else if (this.type == "obstacle_bottom") {
                    ctx.fillStyle = outline_color;
                    ctx.fillRect(this.x - lip_width - line_thickness, this.y - line_thickness, this.width + lip_width * 2 + line_thickness * 2, lip_height + line_thickness * 2);
                    ctx.fillStyle = my_gradient;

                    ctx.fillRect(this.x - lip_width, this.y, this.width + lip_width * 2, lip_height);
                    ctx.fillStyle = 'rgba(255,255,255,0.2)';
                    ctx.fillRect(this.x - lip_width, this.y, this.width + lip_width * 2, 3);
                }
                break;

            default:

                break;

        }

    }
    this.drawImgRot = function (img, x, y, width, height, deg) {
        ctx.save()
        var rad = deg * Math.PI / 180;
        ctx.translate(x + width / 2, y + height / 2);
        ctx.rotate(rad);
        ctx.drawImage(img, width / 2 * (-1), height / 2 * (-1), width, height);
        ctx.restore();
    }

    this.drawRectRot = function (x, y, width, height, deg) {
        ctx.save()
        var rad = deg * Math.PI / 180;
        ctx.translate(x + width / 2, y + height / 2);
        ctx.rotate(rad);
        ctx.fillRect(width / 2 * (-1), height / 2 * (-1), width, height);
        ctx.restore();
    }

    this.newPos = function () {
        this.gravitySpeed += this.gravity;
        this.x += this.speedX;
        this.y += this.speedY + this.gravitySpeed;
        this.hitBottomTop();
    }
    this.resetPos = function () {
        this.x = x;
        this.y = y;
        this.gravity = 0;
        this.gravitySpeed = 0;
    }
    this.hitBottomTop = function () {
        var rockbottom = myGameArea.canvas.height - this.height - (imageRepository.ground.height - 50);
        if (this.y > rockbottom) {
            gameOver();
        }
        if (this.y < 0) {
            this.y = 0;
        }
    }
    this.crashWith = function (otherobj) {
        var myleft = this.x;
        var myright = this.x + (this.width);
        var mytop = this.y;
        var mybottom = this.y + (this.height);
        var otherleft = otherobj.x;
        var otherright = otherobj.x + (otherobj.width);
        var othertop = otherobj.y;
        var otherbottom = otherobj.y + (otherobj.height);
        var crash = true;
        if ((mybottom < othertop) || (mytop > otherbottom) || (myright < otherleft) || (myleft >
                otherright)) {
            crash = false;
        }
        return crash;
    }
}

function saveHighscore() {
    if (typeof (Storage) !== "undefined") {
        if (localStorage.highscore) {
            if (myScore > localStorage.highscore) {
                localStorage.highscore = myScore;
            }
        } else {
            localStorage.highscore = myScore;
        }
    }
}


function updateGameArea() {
    var x, height, gap, minHeight, maxHeight, minGap, maxGap, maxGapDifference, randomColor, bufferSize;
    var obstacleWidth = 40;
    bufferSize = 300;
    minHeight = 20;
    maxHeight = 250;
    maxGapDifference = 150;

    switch (gameState.currentState) {
        case gameState.introState:
            myGameArea.clear();
            for (i = 0; i < myObstacles.length; i += 1) {
                myObstacles[i].update();
            }
            scrollGround();

            myGamePiece.update();
            break;

        case gameState.inGameState:
            for (i = 0; i < myObstacles.length; i += 1) {
                if (myGamePiece.crashWith(myObstacles[i])) {
                    gameOver();
                }
            }
            myGameArea.clear();
            myGameArea.frameNo += 1;
            obstacleDistance += obstacleSpeed;

            if (myGameArea.frameNo == 1) {
                drawObstacle();
            } else if (everyinterval(150)) {
                obstacleSpeed += 0.1;
            }

            if (obstacleDistance > 150) {
                drawObstacle();
                if (myObstacles[0].x + myObstacles[0].width < myGamePiece.x) {
                    toUpdateScore = true;
                }
                if (myObstacles[0].x < 0) {
                    myObstacles.shift();
                    myObstacles.shift();
                }
                obstacleDistance = 0;
            }

            for (i = 0; i < myObstacles.length; i += 2) {
                if (myObstacles[i].y + myObstacles[i].height < 50 && myObstacles[i].isGoingUp == 1) {
                    myObstacles[i].isGoingUp = -1;
                    myObstacles[i + 1].isGoingUp = -1;
                } else if (myObstacles[i + 1].y > 350 && myObstacles[i].isGoingUp == -1) {
                    myObstacles[i].isGoingUp = 1;
                    myObstacles[i + 1].isGoingUp = 1;
                }
            }

            for (i = 0; i < myObstacles.length; i += 1) {
                myObstacles[i].y += obstacleRiseSpeed * -myObstacles[i].isGoingUp;
                myObstacles[i].x -= obstacleSpeed;
                myObstacles[i].update();
            }

            if (myObstacles[0].x <= myGamePiece.x && toUpdateScore) {
                let point = new Audio('sounds/sfx_point.wav');
                point.volume = globalVolume;
                point.play();
                toUpdateScore = false;
                myScore++;
            }
            drawScore();
            myGamePiece.newPos();
            myGamePiece.update();
            if (myGameArea.keys && myGameArea.keys['Space']) {
                flap();
                myGameArea.keys['Space'] = false;
            }
            if (myGameArea.keys && myGameArea.keys['KeyM']) {
                globalVolume = globalVolume == 0.1 ? 0 : 0.1;
                myGameArea.keys['KeyM'] = false;
            }
            scrollGround();
            break;
        case gameState.gameOverState:
            myGameArea.clear();
            for (i = 0; i < myObstacles.length; i += 1) {
                myObstacles[i].update();
            }
            scrollGround();

            if (myGamePiece.y < myGameArea.canvas.height - (imageRepository.ground.height - 20)) {
                myGamePiece.gravitySpeed += myGamePiece.gravity;
                myGamePiece.x += myGamePiece.speedX;
                myGamePiece.y += myGamePiece.speedY + myGamePiece.gravitySpeed;
            }
            myGamePiece.update();
            break;
        default:
            break;
    }


    function drawObstacle() {
        x = myGameArea.canvas.width;
        let y = myGameArea.canvas.height;
        if (myObstacles.length > 0) {
            let previous_height = myObstacles[myObstacles.length - 2].height - bufferSize;
            let top_rand_height = Math.max(previous_height - maxGapDifference / 2, minHeight)
            let bot_rand_height = Math.min(previous_height + maxGapDifference / 2, maxHeight)
            height = Math.floor(Math.random() * (bot_rand_height - top_rand_height + 1) + top_rand_height);
        } else {
            height = Math.floor(Math.random() * (maxHeight - minHeight + 1) + minHeight);
        }
        minGap = 80;
        maxGap = 120;
        gap = Math.floor(Math.random() * (maxGap - minGap + 1) + minGap);
        randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
        let isGoingUp = Math.random() > 0.5 ? 1 : -1;
        myObstacles.push(new component(obstacleWidth, bufferSize + height, randomColor, x, 0 - bufferSize, "obstacle_top", isGoingUp));
        myObstacles.push(new component(obstacleWidth, bufferSize + y - height - gap, randomColor, x, height + gap, "obstacle_bottom", isGoingUp));
    }
}

function drawScore() {
    ctx = myGameArea.context;
    ctx.font = "42px Impact";
    ctx.textAlign = "center";
    ctx.fillStyle = '#ffffff';
    ctx.lineWidth = 6;
    ctx.strokeText(myScore, canvas_width / 2, 80);
    ctx.fillStyle = 'white';
    ctx.fillText(myScore, canvas_width / 2, 80);
}

function scrollGround() {
    this.floor_height = imageRepository.ground.height - 50;
    ctx = myGameArea.context;
    if (myGameArea.ground_movement < -canvas_width) {
        myGameArea.ground_movement = 0;
    }
    ctx.drawImage(imageRepository.ground, myGameArea.ground_movement, canvas_height - this.floor_height, canvas_width, imageRepository.ground.height);
    ctx.drawImage(imageRepository.ground, myGameArea.ground_movement + canvas_width, canvas_height - this.floor_height, canvas_width, imageRepository.ground.height);
    if (gameState.currentState != gameState.gameOverState) {
        myGameArea.ground_movement -= obstacleSpeed;

    }
}

function everyinterval(n) {
    if ((myGameArea.frameNo / n) % 1 == 0) {
        return true;
    }
    return false;
}

function flap() {
    let flap_sound = new Audio('sounds/sfx_wing.wav');
    flap_sound.volume = globalVolume;
    flap_sound.play();
    myGamePiece.gravitySpeed = -flap_speed;

}