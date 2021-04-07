var myGamePiece;
var myObstacles = [];
var myScore;
var highscore = 0;
var canvas_width = 640;
var canvas_height = 480;
var obstacleSpeed = 1;
var obstacleDistance = 0;

function startGame() {
    myGamePiece = new component(20, 20, "red", 10, 120, "game_piece");
    myGamePiece.gravity = 0.15;
    myScore = new component("30px", "Consolas", "black", canvas_width / 2, 40, "text");
    myBackground.start();
    myGameArea.start();
}

function restartGame() {
    obstacleSpeed = 1;
    obstacleDistance = 0;
    myGameArea.clear();
    myGameArea.frameNo = 0;
    myGamePiece.resetPos();
    myGamePiece.gravity = 0.15;
    myObstacles = [];
}

var imageRepository = new function () {
    this.background = new Image();
    this.background.src = "images/background.png";
    this.gamePieceImg = new Image();
    this.gamePieceImg.src = "images/flappy.png";
    this.ground = new Image();
    this.ground.src = "images/ground.png";
}

var myGameArea = {
    canvas: document.getElementById("game_canvas"),
    start: function () {
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.frameNo = 0;
        this.interval = setInterval(updateGameArea, 20);
    },
    clear: function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

var myBackground = {
    canvas: document.getElementById("background_canvas"),
    start: function () {
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.context.drawImage(imageRepository.background, 0, 0);
    }
}

function component(width, height, color, x, y, type) {
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
    this.floor_height = imageRepository.ground.height - 50;

    this.update = function () {
        ctx = myGameArea.context;
        ctx.drawImage(imageRepository.ground, 0, canvas_height - this.floor_height, canvas_width, imageRepository.ground.height);

        switch (this.type) {
            case "text":
                ctx.textAlign = "center";
                ctx.font = this.width + " " + this.height;
                ctx.fillStyle = color;
                ctx.lineWidth = 4;
                ctx.strokeText(this.text, this.x, this.y);
                ctx.fillStyle = 'white';
                ctx.fillText(this.text, this.x, this.y);
                break;
            case "game_piece":
                ctx.fillStyle = color;
                this.drawImgRot(imageRepository.gamePieceImg, this.x - 5, this.y - 5, this.width + 10, this.height + 10, this.gravitySpeed * 5);
                break;
            case "obstacle_top":
            case "obstacle_bottom":
                ctx.fillStyle = "black";
                ctx.fillRect(this.x - 2, this.y - 2, this.width + 4, this.height + 4);
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
                    ctx.fillStyle = "black";
                    ctx.fillRect(this.x - 7, this.y + this.height - 12, this.width + 14, 14);
                    ctx.fillStyle = my_gradient;

                    ctx.fillRect(this.x - 5, this.y + this.height - 10, this.width + 10, 10);
                    ctx.fillStyle = 'rgba(255,255,255,0.2)';
                    ctx.fillRect(this.x - 5, this.y + this.height - 10, this.width + 10, 3);

                } else if (this.type == "obstacle_bottom") {
                    ctx.fillStyle = "black";
                    ctx.fillRect(this.x - 7, this.y - 2, this.width + 14, 14);
                    ctx.fillStyle = my_gradient;

                    ctx.fillRect(this.x - 5, this.y, this.width + 10, 10);
                    ctx.fillStyle = 'rgba(255,255,255,0.2)';
                    ctx.fillRect(this.x - 5, this.y, this.width + 10, 3);
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
        var rockbottom = myGameArea.canvas.height - this.height - this.floor_height;
        if (this.y > rockbottom) {
            saveHighscore();
            restartGame();
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
    if (myGameArea.frameNo > highscore) {
        highscore = myGameArea.frameNo;
        document.getElementById("Highscore").innerHTML = "Highscore: " + highscore;
    }
}

function updateGameArea() {
    var x, height, gap, minHeight, maxHeight, minGap, maxGap;
    var obstacleWidth = 40;
    for (i = 0; i < myObstacles.length; i += 1) {
        if (myGamePiece.crashWith(myObstacles[i])) {
            saveHighscore();
            restartGame();
        }
    }
    myGameArea.clear();
    myGameArea.frameNo += 1;
    obstacleDistance += obstacleSpeed;

    if (myGameArea.frameNo == 1) {
        x = myGameArea.canvas.width;
        minHeight = 20;
        maxHeight = 200;
        height = Math.floor(Math.random() * (maxHeight - minHeight + 1) + minHeight);
        minGap = 60;
        maxGap = 120;
        gap = Math.floor(Math.random() * (maxGap - minGap + 1) + minGap);
        myObstacles.push(new component(obstacleWidth, height, "green", x, 0, "obstacle_top"));
        myObstacles.push(new component(obstacleWidth, x - height - gap, "green", x, height + gap, "obstacle_bottom"));
    } else if (everyinterval(150)) {
        obstacleSpeed += 0.1;
    }

    if (obstacleDistance > 150) {
        x = myGameArea.canvas.width;
        minHeight = 20;
        maxHeight = 200;
        height = Math.floor(Math.random() * (maxHeight - minHeight + 1) + minHeight);
        minGap = 60;
        maxGap = 120;
        gap = Math.floor(Math.random() * (maxGap - minGap + 1) + minGap);
        myObstacles.push(new component(obstacleWidth, height, "green", x, 0, "obstacle_top"));
        myObstacles.push(new component(obstacleWidth, x - height - gap, "green", x, height + gap, "obstacle_bottom"));
        if (myObstacles.length > 10) {
            myObstacles.shift();
            myObstacles.shift();
        }
        obstacleDistance = 0;
    }

    for (i = 0; i < myObstacles.length; i += 1) {
        myObstacles[i].x -= obstacleSpeed;
        myObstacles[i].update();
    }
    myScore.text = "SCORE: " + myGameArea.frameNo;
    myScore.update();
    myGamePiece.newPos();
    myGamePiece.update();
}

function everyinterval(n) {
    if ((myGameArea.frameNo / n) % 1 == 0) {
        return true;
    }
    return false;
}

function flap() {
    myGamePiece.gravitySpeed = -3.2;
}

window.addEventListener('keydown', this.check, false);

function check(e) {
    if (e.code == 'Space') {
        flap();
    }
}