"use strict";

class Pipe {
    constructor(curFrame, startX) {
        this.startFrame = curFrame;
        this.startX = startX;
        this.curX = startX;
        this.gapTop = Math.floor(pipeRandomBoundary + Math.random() * (landY - pipeGap - 2 * pipeRandomBoundary));
    }
}

class Land {
    constructor(curFrame, startX) {
        this.startFrame = curFrame;
        this.startX = startX;
        this.curX = startX;
    }
}

class GameState {
    constructor() {
        // ready, playing, dead
        this.mode = 'ready';
        this.startFrame = 0;
        this.jumpFrame = 0;
        this.birdY = birdStartY;
        this.curFrame = 0;
        this.birdSprite = 0;
        this.round = 0;
        this.score = 0;
        this.totalScore = 0;
        this.maxScore = 0;
        this.deadFlash = 0;
        this.fps = 0;
        this.pipeList = [];
        this.landList = [];
    };

    reset() {
        this.mode = 'ready';
        this.startFrame = this.curFrame;
        this.jumpFrame = 0;
        this.birdY = birdStartY;
        this.birdSprite = 0;
        this.round += 1;
        this.score = 0;
        this.deadFlash = 0;
        this.fps = 0;
        this.pipeList = [];
        this.landList = [];
        return this;
    };
};

