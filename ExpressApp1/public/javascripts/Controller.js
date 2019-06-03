class FlappyBirdController {
    constructor(gameState, gameView, gameLoop, updater) {
        this.gameState = gameState;
        this.gameView = gameView;
        this.gameLoop = gameLoop;
        this.updater = updater;
    }

    update(frameStamp) {
        this.gameState.curFrame = frameStamp;
        return apply(this.gameState, this.updater.getUpdaterList());
    }
}

class BaseUpdater {
    getUpdaterList() {
        return [updateLand,
            updateBird,
            updatePipes,
            updateScore,
            updateCollision,];
    }

    curPipePos(curFrame, pipe) {
        return translate(pipe.startX, xVel, curFrame - pipe.startFrame);
    }

    curLandPos(curFrame, land) {
        return translate(land.startX, xVel, curFrame - land.startFrame);
    }

    inPipe(pipe) {
        return birdX + birdWidth >= pipe.curX && birdX < pipe.curX + pipeWidth;
    }

    inPipeGap(birdY, pipe) {
        return pipe.gapTop < birdY && (pipe.gapTop + pipeGap) > birdY + birdHeight;
    }

    collideGround(birdY) {
        return birdY + birdHeight >= landY;
    }

    updateLand(gameState) {
        if (gameState.mode == "dead") return gameState;

        var curFrame = gameState.curFrame;
        var landList = gameState.landList.map(function (land) {
            land.curX = curLandPos(curFrame, land);
            return land;
        }).filter(function (land) {
            return land.curX > -landWidth;
        }).sort(function (a, b) {
            return a.curX - b.curX;
        });

        while (landList.length < 2) {
            var lastLand = last(landList);
            landList.push(newLand(curFrame, lastLand ? lastLand.curX + landWidth : landStartX));
        }

        gameState.landList = landList;
        return gameState;
    }

    updatePipes(gameState) {
        if (gameState.mode != "playing") return gameState;

        var curFrame = gameState.curFrame;
        var pipeList = gameState.pipeList.map(function (pipe) {
            pipe.curX = curPipePos(curFrame, pipe);
            return pipe;
        }).filter(function (pipe) {
            return pipe.curX > -pipeWidth;
        }).sort(function (a, b) {
            return a.curX - b.curX;
        });

        while (pipeList.length < 3) {
            var lastPipe = last(pipeList);
            pipeList.push(newPipe(curFrame, lastPipe ? lastPipe.curX + pipeSpacing : pipeStartX));
        }

        gameState.pipeList = pipeList;
        return gameState;
    }

    updateCollision(gameState) {
        var birdY = gameState.birdY;
        var pipeList = gameState.pipeList;

        if (pipeList.some(function (pipe) {
            return (inPipe(pipe) &&
                !inPipeGap(birdY, pipe)) ||
                collideGround(birdY);
        })) {
            gameState.mode = "dead";
        }

        return gameState;
    }

    jump(gameState) {
        var mode = gameState.mode;
        var curFrame = gameState.curFrame;

        if (mode !== "dead") {
            gameState.jumpFrame = curFrame;
        }

        if (mode === "ready") {
            gameState.startFrame = curFrame;
            gameState.mode = "playing";
        } else if (mode === "dead" && gameState.deadFlash > deadFlashFrame) {
            gameState = resetState(gameState);
            gameState = jump(gameState);
        }

        return gameState;
    }

    updateBird(gameState) {
        var curFrame = gameState.curFrame;
        var jumpFrame = gameState.jumpFrame;
        var birdY = gameState.birdY;
        var mode = gameState.mode;
        if (mode === "playing") {
            var curVel = Math.min(jumpVel + gravity * (curFrame - jumpFrame), maxFallVel);
            var newY = Math.min(birdY + curVel, landY - birdHeight);
            var newY = Math.max(newY, -birdHeight);
            gameState.birdY = newY;
        }
        return animation(gameState);
    }

    updateScore(gameState) {
        if (gameState.mode == "playing") {
            var curFrame = gameState.curFrame;
            var startFrame = gameState.startFrame;
            var distance = (curFrame - startFrame) * Math.abs(xVel) + (pipeWidth + birdWidth) * 0.5;
            var newScore = Math.max(Math.floor((distance - pipeStartX + pipeSpacing) / pipeSpacing), 0);
            if (newScore - gameState.score === 1) {
                gameState.score += 1;
                gameState.totalScore += 1;
                gameState.maxScore = Math.max(gameState.score, gameState.maxScore);
            }
        }

        return gameState;
    }

    animation(gameState) {
        var mode = gameState.mode;
        var curFrame = gameState.curFrame;

        if (mode === "ready" || mode === "playing")
            gameState.birdSprite = Math.floor(curFrame / swingT) % 3;

        if (mode === "ready")
            gameState.birdY = birdStartY + sineWaveA * Math.sin(curFrame * Math.PI * 2 / sineWaveT);

        if (mode === "dead") {
            gameState.deadFlash += 1;
        }

        return gameState;
    }
}

class QLUpdater extends Updater {
    getUpdaterList() {
        return [];
    }
}

class GameLoop {
    constructor() {
        this.timeScale = 1;
        this.frameCount = 0;
        this.lastTime = (new Date).getTime();
    }

    incTimeScale() {
        this.timeScale = Math.min(gameLoop.timeScale * 1.5, 10);
    }

    decTimeScale() {
        this.timeScale = Math.max(gameLoop.timeScale * 0.5, 1 / 10);
    }

    resetTimeScale() {
        this.timeScale = 1;
    }
}