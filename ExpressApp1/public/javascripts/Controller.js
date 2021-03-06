﻿'use strict'

class BaseController {
    constructor(gameState, gameRender) {
        this.gameState = gameState;
        this.gameRender = gameRender;
        this.timeScale = 1;
        this.lastFrame = 0;
        this.curFrame = 0;
        this.lastTime = DATE.getTime();
        this.loopCallbacks = [];
        this.onLoad();
    }

    onLoad() {
        throw new NotImplementError("BaseController::init");
    }

    getUpdaterList() {
        throw new NotImplementError("BaseController::getUpdaterList");
    }

    static loop() {
        controller = controller.update(controller.curFrame++);
        controller.gameRender.render(controller.gameState);
        var curTime = DATE.getTime();
        var deltaTime = curTime - controller.lastTime;
        if (deltaTime > fpsRefreshInterval) {
            controller.lastTime = curTime;
            var deltaFrame = controller.curFrame - controller.lastFrame;
            controller.lastFrame = controller.curFrame;
            controller.gameRender.ctx.fillText(Math.floor(1000 * deltaFrame / deltaTime) + 'fps', 15, 25);
        }
            
        controller.loopCallbacks.forEach(fn => fn());
        setTimeout(BaseController.loop, inverseDefaultFPS / this.timeScale);
    }

    start() {
        setTimeout(BaseController.loop(this), inverseDefaultFPS);
    }

    incFrameRate() {
        this.timeScale = Math.min(this.timeScale * 1.5, 10);
    }

    decFrameRate() {
        this.timeScale = Math.max(this.timeScale * 0.5, 1 / 10);
    }

    resetFrameRate() {
        this.timeScale = 1;
    }

    update(frameStamp) {
        this.gameState.curFrame = frameStamp;
        return apply(this, this.getUpdaterList());
    }

    static curPipePos(curFrame, pipe) {
        return translate(pipe.startX, xVel, curFrame - pipe.startFrame);
    }

    static curLandPos(curFrame, land) {
        return translate(land.startX, xVel, curFrame - land.startFrame);
    }

    static inPipe(pipe) {
        return birdX + birdWidth >= pipe.curX && birdX < pipe.curX + pipeWidth;
    }

    static inPipeGap(birdY, pipe) {
        return pipe.gapTop < birdY && (pipe.gapTop + pipeGap) > birdY + birdHeight;
    }

    static collideGround(birdY) {
        return birdY + birdHeight >= landY;
    }

    static jump(controller) {
        var gameState = controller.gameState;
        var mode = gameState.mode;
        var curFrame = gameState.curFrame;

        if (mode !== "dead") {
            gameState.jumpFrame = curFrame;
        }

        if (mode === "ready") {
            gameState.startFrame = curFrame;
            gameState.mode = "playing";
        } else if (mode === "dead" && gameState.deadFlash > deadFlashFrame) {
            gameState = gameState.reset();
            gameState = BaseController.jump(gameState);
        }

        return controller;
    }

    static animation(controller) {
        var gameState = controller.gameState;
        var mode = gameState.mode;
        var curFrame = gameState.curFrame;

        if (mode === "ready" || mode === "playing")
            gameState.birdSprite = Math.floor(curFrame / swingT) % 3;

        if (mode === "ready")
            gameState.birdY = birdStartY + sineWaveA * Math.sin(curFrame * Math.PI * 2 / sineWaveT);

        if (mode === "dead") {
            gameState.deadFlash += 1;
        }

        return controller;
    }

    static updateLand(controller) {
        var gameState = controller.gameState;
        if (gameState.mode == "dead")
            return controller;

        var curFrame = gameState.curFrame;
        var landList = gameState.landList.map(land => {
            land.curX = BaseController.curLandPos(curFrame, land);
            return land;
        }).filter(function (land) {
            return land.curX > -landWidth;
        }).sort(function (a, b) {
            return a.curX - b.curX;
        });

        while (landList.length < 2) {
            var lastLand = last(landList);
            landList.push(new Land(curFrame, lastLand ? lastLand.curX + landWidth : landStartX));
        }

        gameState.landList = landList;
        return controller;
    }

    static updatePipes(controller) {
        var gameState = controller.gameState;
        if (gameState.mode != "playing")
            return controller;

        var curFrame = gameState.curFrame;
        var pipeList = gameState.pipeList
            .map(pipe => {
                pipe.curX = BaseController.curPipePos(curFrame, pipe);
                return pipe;
            })
            .filter(pipe => pipe.curX > -pipeWidth)
            .sort((a, b) => a.curX - b.curX);

        while (pipeList.length < 3) {
            var lastPipe = last(pipeList);
            pipeList.push(new Pipe(curFrame, lastPipe ? lastPipe.curX + pipeSpacing : pipeStartX));
        }

        gameState.pipeList = pipeList;
        return controller;
    }

    static updateCollision(controller) {
        var gameState = controller.gameState;
        var birdY = gameState.birdY;
        var pipeList = gameState.pipeList;

        if (pipeList.some(pipe => (BaseController.inPipe(pipe) && !BaseController.inPipeGap(birdY, pipe))
            || BaseController.collideGround(birdY))) {
            gameState.mode = "dead";
        }

        return controller;
    }

    static updateBird(controller) {
        var gameState = controller.gameState;
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
        return BaseController.animation(controller);
    }

    static updateScore(controller) {
        var gameState = controller.gameState;
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

        return controller;
    }
}

class QLController extends BaseController {
    constructor(render) {
        super(new GameState(), render);
        this.qlEnabled = false;
        this.skip = false;
        this.A = null;
        this.Q = {};
        this.S = null;
    }

    onLoad() {
        var qlHanlder = (e) => {
            e.preventDefault();
            if (this.qlEnabled)
                this.skip = true;
            this.gameState = QLController.jump(this);
        };
        this.gameRender.cvs.addEventListener('mousedown', qlHanlder);
        this.gameRender.cvs.addEventListener('touchstart', qlHanlder);
    }

    getUpdaterList() {
        return [QLController.updateLand,
        QLController.updateBird,
        QLController.updatePipes,
        QLController.updateScore,
        QLController.updateCollision,
        QLController.updateQL,]
    }

    static updateQL(controller) {
        var gameState = controller.gameState;
        if (!controller.qlEnabled)
            return controller;

        if (controller.skip) {
            controller.A = null;
            controller.S = null;
        }

        if (!controller.Q) {
            controller.Q = {};
            controller.S = null;
        }

        var Q = controller.Q;

        // prev state
        var S = controller.S;
        // prev action 
        var A = controller.A;
        // current state
        var S_ = controller.getQLState(gameState);

        if (S_ && !(S_ in Q)) Q[S_] = [0, 0];

        if (gameState.mode == "playing") {
            controller.Q = controller.reward(Q, S, S_, A, qlAliveReward);
            controller.S = S_;

            // current action, 0 for stay, 1 for jump
            var A_ = 0;

            if (Math.random() < qlEpsilon) { // explore
                A_ = Math.random() < qlExploreJumpRate ? 1 : 0;
            } else if (S_ in Q) { // exploit 
                A_ = Q[S_][0] >= Q[S_][1] ? 0 : 1;
            }

            if (A_ === 1) gameState = QLController.jump(controller);
            controller.A = A_;
        } else if (gameState.mode == "dead") {
            controller.Q = controller.reward(Q, S, S_, A, qlDeadReward);
            controller.S = null;
            controller.A = null;

            // restart the game
            controller.skip = false;
            gameState = QLController.jump(controller);
        }

        return controller;
    }

    static reward(Q, S, S_, A, R) {
        if (S && S_ && A in [0, 1] && S in Q && S_ in Q)
            Q[S][A] = (1 - qlAlpha) * Q[S][A] + qlAlpha * (R + qlGamma * max(Q[S_]));
        return Q;
    }

    static getQLState(gameState) {
        var pipeList = gameState.pipeList;
        var birdY = gameState.birdY;
        var pipeList = pipeList
            .filter(pipe => birdX < pipe.curX + pipeWidth)
            .sort((a, b) => a.curX - b.curX);

        var firstPipe = first(pipeList);
        var S = null;

        if (firstPipe) {
            S = [Math.floor(firstPipe.curX / qlResolution),
            Math.floor((firstPipe.gapTop - birdY) / qlResolution)]
                .join(',');
        }

        return S;
    }
}

