/*global $, jQuery*/
var NUMOFCOLUMNS = 8,
    NUMOFROWS = 3,
    PHONETICSMAP = [],
    PATH = [],
    PLAYER,
    NUMOFCLICK = 0,
    PRECLICK = -1,
    REMAINCOUNT,
    REMAINTIME,
    SPEED,
    SCORE,
    ORIGINALSPEED = 2000,
    LEVEL,
    TIMEOUT;

function checkPath(sx, sy, tx, ty, lineCnt, dir) {
    "use strict";
    var ans = false, i, fx, fy, diffDir;
    
    if (arguments.length < 5) {
        if (PHONETICSMAP[sy][sx] !== PHONETICSMAP[ty][tx]) {
            return false;
        }
    } else {
        if (lineCnt > 3) {
            return false;
        } else if (sx < -1 || sx > NUMOFCOLUMNS) {
            return false;
        } else if (sy < -1 || sy > NUMOFROWS) {
            return false;
        } else if (sx === tx && sy === ty) {
            return true;
        } else if (PATH[sy + 1][sx + 1] !== -1) {
            return false;
        } else if (sx >= 0 && sx < NUMOFCOLUMNS && sy >= 0 && sy < NUMOFROWS && PHONETICSMAP[sy][sx] !== undefined) {
            return false;
        }
    }
    
    for (i = 0; i < 4; i += 1) {
        if (arguments.length < 5) {
            lineCnt = 1;
            diffDir = 0;
        } else {
            diffDir = (i === dir) ? 0 : 1;
        }
        switch (i) {
        case 0:
            fx = sx;
            fy = sy - 1;
            break;
        case 1:
            fx = sx;
            fy = sy + 1;
            break;
        case 2:
            fx = sx - 1;
            fy = sy;
            break;
        case 3:
            fx = sx + 1;
            fy = sy;
            break;
        }
        PATH[sy + 1][sx + 1] = i;
        if (checkPath(fx, fy, tx, ty, lineCnt + diffDir, i)) {
            return true;
        }
    }
    PATH[sy + 1][sx + 1] = -1;
    return false;
}

function levelUp() {
    "use strict";
    clearTimeout(TIMEOUT);
    LEVEL += 1;
    $("#gameTable").html("");
    $(".progress").remove();
    $("#continueModal").modal("show");
}

function gameOver() {
    "use strict";
    var xmlhttp = new XMLHttpRequest();
    clearTimeout(TIMEOUT);
    
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4 && (xmlhttp.status === 200 || xmlhttp.status === 304)) {
            $("#scoreTable").html(xmlhttp.responseText);
        }
    };
    
    xmlhttp.open("GET", "php/record.php?name=" + PLAYER + "&score=" + SCORE, true);
    xmlhttp.send();
    
    $("#overModal").modal("show");
}

function timeCount() {
    "use strict";
    REMAINTIME -= 1;
    
    if (REMAINTIME >= 50) {
        $(".progress-bar-success").width((REMAINTIME - 50) + "%");
    } else if (REMAINTIME < 50 && REMAINTIME >= 20) {
        $(".progress-bar-warning").width((REMAINTIME - 20) + "%");
    } else {
        $(".progress-bar-danger").width(REMAINTIME + "%");
    }
    
    if (REMAINTIME === 0) {
        gameOver();
    } else {
        TIMEOUT = setTimeout(function () {timeCount(); }, SPEED);
    }
}

function setting() {
    "use strict";
    REMAINTIME = 100;
    SPEED = ORIGINALSPEED - (LEVEL * 200);
    
    timeCount();
    
    $(".card").click(function () {
        var coordinate = $(".card").index(this), sx, sy, tx, ty, i, j;
        sx = PRECLICK % NUMOFCOLUMNS;
        sy = Math.floor(PRECLICK / NUMOFCOLUMNS);
        tx = coordinate % NUMOFCOLUMNS;
        ty = Math.floor(coordinate / NUMOFCOLUMNS);

        if (NUMOFCLICK === 0) {
            NUMOFCLICK += 1;
            $(this).css("color", "red");
            PRECLICK = coordinate;
        } else if (NUMOFCLICK === 1) {
            for (i = 0; i <= NUMOFROWS + 1; i += 1) {
                for (j = 0; j <= NUMOFCOLUMNS + 1; j += 1) {
                    PATH[i][j] = -1;
                }
            }
            if (coordinate === PRECLICK) {
                $(this).css("color", "initial");
            } else if (checkPath(sx, sy, tx, ty)) {
                $(".card:eq(" + PRECLICK + ")").animate({opacity: 0}, "slow");
                $(this).animate({opacity: 0}, "slow");
                PHONETICSMAP[sy][sx] = undefined;
                PHONETICSMAP[ty][tx] = undefined;
                REMAINCOUNT -= 2;
                SCORE += 20;
                $("#score").html(SCORE);
                if (REMAINCOUNT === 0) {
                    levelUp();
                }
            } else {
                $(".card:eq(" + PRECLICK + ")").css("color", "initial");
            }
            NUMOFCLICK = 0;
        }
    });
    $("#buttonBlock").html('<div class="well" id="score">' + SCORE + '</div><button class="btn-lg btn-success" id="searchButton" type="button" data-toggle="modal" data-target="#searchModal">查萌典</button>').css({bottom: "60%", right: "10%"});
    $("#searchButton").click(function () {
        var selectedLetter;
        if (NUMOFCLICK === 0) {
            $("#searchModal h4").html("您還沒選字!");
            $("#searchModal .modal-body").html("");
        } else if (NUMOFCLICK === 1) {
            selectedLetter = $(".card:eq(" + PRECLICK + ")").html();
            $("#searchModal h4").html(selectedLetter);
            $("#searchModal .modal-body").html('<div class="embed-responsive embed-responsive-16by9"><iframe class="embed-responsive-item" src="https://www.moedict.tw/' + selectedLetter + '"></iframe></div>');
        }
    });
}

function startPlaying(mode) {
    "use strict";
    var i, j,
        newRow, newColumn, newCard, responseString, index,
        gameTable = document.getElementById("gameTable"),
        xmlhttp = new XMLHttpRequest();
    
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4 && (xmlhttp.status === 200 || xmlhttp.status === 304)) {
            responseString = xmlhttp.responseText;
            
            for (i = 0; i <= NUMOFROWS + 1; i += 1) {
                PATH[i] = [];
                for (j = 0; j <= NUMOFCOLUMNS + 1; j += 1) {
                    PATH[i][j] = -1;
                }
            }
            
            for (i = 0; i < NUMOFROWS; i += 1) {
                newRow = document.createElement("tr");
                PHONETICSMAP[i] = [];
                for (j = 0; j < NUMOFCOLUMNS; j += 1) {
                    index = i * NUMOFCOLUMNS + j;
                    PHONETICSMAP[i][j] = responseString.charAt(NUMOFCOLUMNS * NUMOFROWS + index);
                    newColumn = document.createElement("td");
                    newCard = document.createElement("div");
                    newCard.className = "card";
                    newCard.innerHTML = responseString.charAt(index);// + PHONETICSMAP[i][j];
                    newColumn.appendChild(newCard);
                    newRow.appendChild(newColumn);
                }
                gameTable.appendChild(newRow);
            }
            
            REMAINCOUNT = NUMOFCOLUMNS * NUMOFROWS;
            document.getElementById("mainContainer").innerHTML += '<div class="progress"><div class="progress-bar progress-bar-striped progress-bar-danger active" role="progressbar" style="width: 20%"></div><div class="progress-bar progress-bar-striped progress-bar-warning active" role="progressbar" style="width: 30%"></div><div class="progress-bar progress-bar-striped progress-bar-success active" role="progressbar" style="width: 50%"></div></div>';
            setting();
        }
    };
    
    if (mode === 1) {
        xmlhttp.open("GET", "php/phoneticsAccess.php?columns=" + NUMOFCOLUMNS + "&rows=" + NUMOFROWS + "&mode=rhyme", true);
    } else {
        xmlhttp.open("GET", "php/phoneticsAccess.php?columns=" + NUMOFCOLUMNS + "&rows=" + NUMOFROWS + "&mode=sound", true);
    }
    xmlhttp.send();
}

function initialize() {
    "use strict";
    if (window.localStorage.PLAYER === "undefined" || window.localStorage.PLAYER === undefined) {
        $("#navbar-collapse ul").append('<li><button type="button" class="btn btn-success navbar-btn" data-toggle="modal" data-target="#signinModal">我是誰</button></li>');
        PLAYER = "遊客";
    } else {
        $("#navbar-collapse ul").append('<li><button type="button" class="btn btn-success navbar-btn" onclick="signout()">忘記我</button></li>');
        PLAYER = window.localStorage.PLAYER;
    }
    $("#navbar-collapse p").html(PLAYER);
    $("#signinModal").on("shown.bs.modal", function () {
        $(this).find("input:first").focus();
    });
    SCORE = 0;
    LEVEL = 0;
}

function signout() {
    "use strict";
    window.localStorage.PLAYER = undefined;
    PLAYER = "遊客";
    $("#navbar-collapse ul li:eq(1)").remove();
    $("#navbar-collapse ul").append('<li><button type="button" class="btn btn-success navbar-btn" data-toggle="modal" data-target="#signinModal">我是誰</button></li>');
    $("#navbar-collapse p").html(PLAYER);
}

function signin(ele) {
    "use strict";
    var str = $("#signinModal .form-group input").val();
    if (str.length < 5) {
        $("#signinModal .alert-msg").html("Please input more than 5 characters!");
        $("#signinModal .alert").fadeIn();
    } else if (str.length > 25) {
        
        $("#signinModal .alert-msg").html("Please input less than 25 characters!");
        $("#signinModal .alert").fadeIn();
    } else {
        $("#signinModal .alert").hide();
        $("#signinModal .form-group input").val("");
        PLAYER = str;
        if ($("#signinModal label input").prop("checked") === true) {
            window.localStorage.PLAYER = PLAYER;
        }
        $("#navbar-collapse p").html(PLAYER);
        $("#navbar-collapse ul li:eq(1)").remove();
        $("#navbar-collapse ul").append('<li><button type="button" class="btn btn-success navbar-btn" onclick="signout()">忘記我</button></li>');
        $(ele).siblings().click();
    }
}
