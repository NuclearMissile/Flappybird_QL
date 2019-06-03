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

class Bird {
    constructor() {

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
        var round = this.round;
        var curFrame = this.curFrame;
        var totalScore = this.totalScore;
        var maxScore = this.maxScore;
        var newState = new GameState();

        newState.startFrame = curFrame;
        newState.curFrame = curFrame;
        newState.round = round;
        newState.totalScore = totalScore;
        newState.maxScore = maxScore;
        return newState;
    };
};

