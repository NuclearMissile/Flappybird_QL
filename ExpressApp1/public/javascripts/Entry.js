'use strict'

var convas = document.getElementById("cvs");
var controller = new QLController(new FlappyBirdRender(convas));

$("#ql-btn").click(() => {
    controller.qlEnabled = !controller.qlEnabled;
    if (controller.qlEnabled) {
        this.innerText = "Disable Q-learning";
    } else {
        this.innerText = "Enable Q-learning";
    }
});

$("#inc-fps-btn").click(() => controller.incFrameRate());

$("#dec-fps-btn").click(() => controller.decFrameRate());

$("#rst-fps-btn").click(() => controller.resetFrameRate());

$("#panel-btn").click(() => this.toggle());

var fpsSpan = $("#fps-span");
var roundSpan = $("#round-span");
var maxScoreSpan = $("#mscore-span");
var averageScoreSpan = $("#ascore-span");
var qlStateSpan = $("#qstate-span");

var round = 0;
var maxScore = 0;
var averageScore = 0;
var qlState = 0;

controller.loopCallbacks.push(gameState => {
    if (!panel.is(":visible"))
        return;
    var newRound = controller.round;
    if (round !== newRound) {
        round = newRound;
        roundSpan.text(round);
    }

    var newMaxScore = controller.maxScore;
    if (maxScore !== newMaxScore) {
        maxScore = newMaxScore;
        maxScoreSpan.text(maxScore);
    }

    var newAverageScore = (round == 0 ? 0 : controller.totalScore / round).toFixed(3);
    if (averageScore !== newAverageScore) {
        averageScore = newAverageScore;
        averageScoreSpan.text(averageScore);
    }

    var newQLState = controller.Q ? Object.keys(updateQL.Q).length : 0;
    if (qlState !== newQLState) {
        qlState = newQLState;
        qlStateSpan.text(qlState);
    }
});

controller.start();
