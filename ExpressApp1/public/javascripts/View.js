'use strict'

class FlappyBirdRender {
    constructor(cvs) {
        this.cvs = cvs;
        this.cvs.width = width;
        this.cvs.height = height;
        this.ctx = this.cvs.getContext("2d");
        this.ctx.font = this.ctx.font.replace(/\d+px/, "14px");
        this.sprites = {};
        this.resourcesLoaded = false;

        this.image = new Image();
        this.image.src = atlasSrc;
        this.image.addEventListener("load", () => {
            $.get(csvSrc, result => {
                result.split('\n').forEach(line => {
                    let values = line.split(' ');
                    this.sprites[values[0]] = [
                        Math.round(parseInt(values[1])),
                        Math.round(parseInt(values[2])),
                        Math.round(parseFloat(values[3]) * this.image.width),
                        Math.round(parseFloat(values[4]) * this.image.height),
                    ];
                });
                this.resourcesLoaded = true;
            });
        });
    }

    drawSprite(spriteName, x, y) {
        var sprite = this.sprites[spriteName]
        this.ctx.drawImage(this.image, sprite[2], sprite[3], sprite[0], sprite[1], x, y, sprite[0], sprite[1]);
    }

    render(gameState) {
        if (!this.resourcesLoaded) {
            console.log('call render(gameState) before resource loaded.');
            return;
        }

        // clear
        this.ctx.fillRect(0, 0, this.cvs.width, this.cvs.height);

        // draw background
        this.drawSprite("bg_day", 0, 0);

        // draw pipes
        gameState.pipeList.forEach(pipe => {
            this.drawSprite("pipe_down", pipe.curX, pipe.gapTop - pipeHeight) // v
            this.drawSprite("pipe_up", pipe.curX, pipe.gapTop + pipeGap); // ^
        });

        // draw land
        gameState.landList.forEach(land =>
            this.drawSprite("land", land.curX, landY)
        );

        // draw bird
        this.drawSprite("bird0_" + gameState.birdSprite, birdX + birdRenderOffsetX, 
            gameState.birdY + birdRenderOffsetY);

        switch (gameState.mode) {
            case 'playing':
                var score = gameState.score.toString();
                for (let i = 0; i < score.length; ++i) {
                    var digit = score[i];
                    this.drawSprite("font_0" + (48 + parseInt(digit)), playingScoreMidX + (i - score.length / 2) * playingScoreSpacing, playingScoreY)
                }
                break;
            case 'ready':
                this.drawSprite("text_ready", readyTextX, readyTextY);
                this.drawSprite("tutorial", tutorialX, tutorialY);
                break;
            case 'dead':
                this.drawSprite("text_game_over", gameOverTextX, gameOverTextY);
                this.drawSprite("score_panel", gameOverPanelX, gameOverPanelY);

                // draw score
                var score = gameState.score.toString();
                for (let i = 0; i < score.length; ++i) {
                    var digit = score[score.length - i - 1];
                    this.drawSprite("number_score_0" + digit, panelScoreRightX - i * panelScoreSpacing, panelScoreY);
                }

                // draw max score
                var maxScore = gameState.maxScore.toString();
                for (let i = 0; i < maxScore.length; ++i) {
                    var digit = maxScore[maxScore.length - i - 1];
                    this.drawSprite("number_score_0" + digit, panelScoreRightX - i * panelScoreSpacing, panelMaxScoreY);
                }

                // draw medal
                var medal;
                if (score >= 30) medal = "3";
                else if (score >= 20) medal = "2";
                else if (score >= 10) medal = "1";
                else if (score >= 5) medal = "0";
                if (medal)
                    this.drawSprite("medals_" + medal, medalX, medalY);

                if (gameState.deadFlash < deadFlashFrame) {
                    this.ctx.globalAlpha = 1 - gameState.deadFlash / deadFlashFrame;
                    this.ctx.fillRect(0, 0, this.cvs.width, this.cvs.height);
                    this.ctx.globalAlpha = 1.0;
                }
                break;
            default:
                break;
        }
    }
}

