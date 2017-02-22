var ScanRego = function(BLOCKCOUNT){
    'use strict';
    const WHITE_FLAG  = 0;
    const RED_FLAG    = 1;
    const GREEN_FLAG  = 2;
    const PURPLE_FLAG = 3;
    const BLACK_FLAG  = 4; // 影

    const WHITE = {
        h: 0, s: 0, v: 100
        ,r: 255, g: 255, b: 255
    };
    const RED    = {
        h: 359, s: 100, v: 76
        ,r: 200, g: 0, b: 0
    };
    const GREEN  = {
        h: 136, s: 100, v: 38
        ,r: 0, g: 200, b: 0
    };
    const PURPLE = {
        h: 268, s: 44, v: 76
        ,r: 100, g: 0, b: 100
    };
    const BLACK = {
        h: 0, s: 0, v: 0
        ,r: 0, g: 0, b: 0
    };
    var COLOR = [];
    COLOR[WHITE_FLAG]  = WHITE;
    COLOR[RED_FLAG]    = RED;
    COLOR[GREEN_FLAG]  = GREEN;
    COLOR[PURPLE_FLAG] = PURPLE;
    COLOR[BLACK_FLAG]  = BLACK;

    this.origin_data    = {};
    this.source         = {};
    this.before         = {};
    this.after          = {};
    this.after_data     = {};
    this.grey_data      = {};
    this.grey_data.data = [];


    this.setDataSource = function(source, before, after){
        this.source = document.getElementById(source);
        this.before = document.getElementById(before);
        this.after = document.getElementById(after);

        this.createBefore();

        var ctx = this.before.getContext("2d");
        this.origin_data = ctx.getImageData(0, 0, this.source.offsetWidth, this.source.offsetHeight);
    }
    this.createBefore = function(){
        var width = this.source.offsetWidth;
        var height = this.source.offsetHeight;

        // this.before.setAttribute("width", width);
        // this.before.setAttribute("height", height);
        // var ctx = this.before.getContext('2d');
        // ctx.drawImage(this.source, 0, 0, width, height);
        // this.after_data = ctx.getImageData(0, 0, width, height);

        // トリミング
        this.before.setAttribute("width", ~~(width / 1.5));
        this.before.setAttribute("height", ~~(height / 1.5));
        var ctx = this.before.getContext('2d');
        ctx.drawImage(this.source, -~~(width / 4), -~~(height / 4), ~~(width), ~~(height));
        this.after_data = ctx.getImageData(0, 0, ~~(width / 1.5), ~~(height / 1.5));

        // this.before.setAttribute("width", ~~(width / 2));
        // this.before.setAttribute("height", ~~(height / 2));
        // var ctx = this.before.getContext('2d');
        // ctx.drawImage(this.source, -~~(width / 4), -~~(height / 4), ~~(width), ~~(height));

        // goGaussian();
        // var ctx = this.before.getContext('2d');

        // this.after_data = ctx.getImageData(0, 0, ~~(width / 2), ~~(height / 2));
    }

    this.greyScale = function(ts = null){
        var length = this.after_data.data.length;
        for (var i = 0; i < length; i = i + 4) {
            var g = ~~(0.299 * this.after_data.data[i] + 0.587 * this.after_data.data[i + 1] + 0.114 * this.after_data.data[i + 2]);
            if (ts) {
                g = (g > ts)? 255: 0;
            }
            this.grey_data.data[i] = this.grey_data.data[i + 1] = this.grey_data.data[i + 2] = g;
            this.grey_data.data[i + 3] = this.after_data.data[i+ 3];
        }
        this.grey_data.width = this.after_data.width;
        this.grey_data.height = this.after_data.height;
        return this.grey_data;
    }
    // 画像抽出
    this.pullBlock = function(rgba, block){
        // ブロックだけのデータにする
        var block_rgba = {data: [], width: 0, height: 0};
        var ii = 0;
        var start = convertXY(block.start / 4, rgba.width);
        var end = convertXY(block.end / 4, rgba.width);

        for (var i = block.start; i < block.end; i = i + 4) {
            var tmp = convertXY(i / 4, rgba.width);
            // 左側を飛ばす
            if (tmp.j < start.j) {
                continue;
            }
            // 右側を飛ばす
            if (tmp.j >= end.j) {
                continue;
            }
            block_rgba.data[ii] = rgba.data[i];
            block_rgba.data[ii + 1] = rgba.data[i + 1];
            block_rgba.data[ii + 2] = rgba.data[i + 2];
            block_rgba.data[ii + 3] = rgba.data[i + 3];
            ii += 4;
        }
        block_rgba.width = end.j - start.j;
        block_rgba.height = end.i - start.i;
        return block_rgba;
    }
    // 2値化データから最初の位置と最後の位置,ブロックの幅と高さを取得
    this.getBlockInitData = function(rgba, correction){
        var block = {};
        var length = rgba.data.length;
        var start = {i: 9999,j: 9999};
        var end = {i: 0,j: 0};
        // 左上の位置
        for (var i = 0; i < length / 2; i = i + 4) {
            if (rgba.data[i] !== 255) {
                var tmp = {};
                tmp = convertXY(i / 4, rgba.width);
                if ((tmp.i + tmp.j) <= (start.i + start.j)) {
                    block.start = i;
                    start = tmp;
                }
            }
        }
        // 右下の位置
        for (var i = length - 1; i >= length / 2; i = i - 4) {
            if (rgba.data[i - 2] !== 255) {
                var tmp = {};
                tmp = convertXY(i / 4, rgba.width);
                if ((tmp.i + tmp.j) >= (end.i + end.j)) {
                    block.end = i;
                    end = tmp;
                }
            }
        }
        // endは少し足す
        correction = ~~(correction);
        block.end = block.end + (rgba.width * 4 * correction) + (4 * correction);
        // 考えにくいのでxyで考える
        start = convertXY(block.start / 4, rgba.width);
        end = convertXY(block.end / 4, rgba.width);
        console.log('start:', start);
        console.log('end:', end);
        return block;
    }
    // 迷路データにする
    this.maze = function(rgba, maze_ts){
        var grid = convertArray(rgba);
        var i_length = grid.length;
        var j_length = grid[0].length;
        var maze = [];
        var i_start = 0;
        var j_start = 0;

        var i_end = ~~(rgba.height / BLOCKCOUNT * 10) / 10;
        var j_end = ~~(rgba.width / BLOCKCOUNT * 10) / 10;
        for(var i = 0; i < BLOCKCOUNT; i++){
            maze[i] = [];
            for (var j = 0; j < BLOCKCOUNT; j++) {
                maze[i][j] = getRegoColorFlag(grid, i_start, j_start, i_end, j_end, maze_ts);
                j_start = j_end;
                j_end += ~~(rgba.width / BLOCKCOUNT * 10) / 10;
            }
            i_start = i_end;
            i_end += ~~(rgba.height / BLOCKCOUNT * 10) / 10;
            j_start = 0;
            j_end = ~~(rgba.width / BLOCKCOUNT * 10) / 10;
        }
        return maze;
    }
    // 1次元の配列を2次元の配列に変換
    function convertArray(rgba){
        var data = [];
        var length = rgba.data.length;
        for(var i = 0; i < length; i += 4){
            var key = convertXY(i / 4, rgba.width);
            if (typeof data[key.i] === 'undefined') {
                data[key.i] = [];
            }
            data[key.i][key.j] = {
                r: rgba.data[i], g: rgba.data[i + 1], b: rgba.data[i + 2], a: rgba.data[i + 3]
            };
        }
        return data;
    }
    // ひとマスの色を決める
    function getRegoColorFlag(rgba, i_start, j_start, i_end, j_end, maze_ts){
        var count = 0;
        var color = {r: 0, g: 0, b: 0, a: 255};
        // 真ん中周辺の平均値にする
        for(var i = ~~((i_end + i_start) / 2) - 1; i < ~~((i_end + i_start) / 2) + 1; i++){
            for(var j = ~~((j_end + j_start) / 2) - 1; j < ~~((j_end + j_start) / 2) + 1; j++){
                color.r += rgba[i][j].r;
                color.g += rgba[i][j].g;
                color.b += rgba[i][j].b;
                count++;
            }
        }
        color.r = ~~(color.r / count);color.g = ~~(color.g / count);color.b = ~~(color.b / count);
        // color = rgba[~~((i_end + i_start) / 2)][~~((j_end + j_start) / 2)];

        // // 色判定
        var g = ~~(0.299 * color.r + 0.587 * color.g + 0.114 * color.b);
        // 影を消す
        if (g >= maze_ts) {
            color.r = color.g = color.b = 255;
        }
        var hsv = rgbToHsv(color);
        var check = [];
        check[WHITE_FLAG] = colorDistance(hsv, WHITE);
        check[RED_FLAG] = colorDistance(hsv, RED);
        check[GREEN_FLAG] = colorDistance(hsv, GREEN);
        check[PURPLE_FLAG] = colorDistance(hsv, PURPLE);
        check[BLACK_FLAG] = colorDistance(hsv, BLACK);
        var min = Math.min.apply(null,check);
        color = check.indexOf(min);
        // 影と紫は白
        if ((color == BLACK_FLAG) || (color == PURPLE_FLAG)) {
            color = WHITE_FLAG;
        }
        // 近い色がなければ白
        // if (min >= 60) {
        //     color = WHITE_FLAG;
        // }
        // var g = ~~(0.299 * color.r + 0.587 * color.g + 0.114 * color.b);
        // if (g >= maze_ts) {
        //     // color.r = color.g = color.b = 255;
        //     color = 0;
        // } else {
        //     color = 1;
        // }
        return color;
    }
    // 迷路データを復元する
    this.mazeRestoration = function(maze){
        var px = 30;
        var maze_rgba = {data: [], width: BLOCKCOUNT * px, height: BLOCKCOUNT * px};
        var ii = 0;

        for (var i = 0; i < BLOCKCOUNT; i++) {
            for(var i_magni = 0; i_magni < px; i_magni++){
                for (var j = 0; j < BLOCKCOUNT; j++) {
                    for(var j_magni = 0; j_magni < px; j_magni++){
                        if (typeof maze[i][j] != 'number') {
                            maze_rgba.data[ii]     = maze[i][j].r;
                            maze_rgba.data[ii + 1] = maze[i][j].g;
                            maze_rgba.data[ii + 2] = maze[i][j].b;
                            maze_rgba.data[ii + 3] = maze[i][j].a;
                        } else {
                            maze_rgba.data[ii]     = COLOR[maze[i][j]].r;
                            maze_rgba.data[ii + 1] = COLOR[maze[i][j]].g;
                            maze_rgba.data[ii + 2] = COLOR[maze[i][j]].b;
                            maze_rgba.data[ii + 3] = 255;
                        }
                        ii += 4;
                    }
                }
            }
        }
        return maze_rgba;
    }
    /*
    data.height, data.width
    data.data[i] = r, data.data[i + 1] = g, data.data[i + 2] = b, data.data[i + 3] = a
    */
    this.drawData = function(rgba, canvas_id){
        var cavas_obj = document.getElementById(canvas_id);
        cavas_obj.setAttribute("width", rgba.width);
        cavas_obj.setAttribute("height", rgba.height);
        var ctx = cavas_obj.getContext("2d");
        var dst = ctx.createImageData(rgba.width, rgba.height);
        var length = rgba.data.length;
        for (var i = 0; i < length; i++) {
            dst.data[i] = rgba.data[i];
        }
        ctx.putImageData(dst, 0, 0);
    }
    // 1次元を2次元の位置に変換
    function convertXY(i, width){
        var data = {};
        data.i = ~~(~~(i) / width);
        data.j = ~~(~~(i) % width);
        return data;
    }

    function rgbToHsv(rgb) {
        var hsv = { h: 0, s: 0, v: 0};
        var r = rgb.r / 255;
        var g = rgb.g / 255;
        var b = rgb.b / 255;
        var max = Math.max(Math.max(r, g), b);
        var min = Math.min(Math.min(r, g), b);

        if (max === min ) hsv.h = 0;
        else if (max === r) hsv.h = ( 60 * (g - b) / (max - min ) + 360 ) % 360;
        else if (max === g) hsv.h = 60 * (b - r ) / (max - min ) + 120;
        else if (max === b) hsv.h = 60 * (r - g ) / (max - min ) + 240;

        if (max === 0 ) hsv.s = 0;
        else hsv.s = 1 - min / max;

        hsv.v = max * 100;
        hsv.s *= 100;

        return hsv;
    }
    function colorDistance(a, b) {
        var hueDiff = 0;
        if (a.h > b.h) {
            hueDiff = Math.min(a.h - b.h, b.h - a.h + 360);
        } else {
            hueDiff = Math.min(b.h - a.h, a.h - b.h + 360);
        }
        return ~~(Math.sqrt(Math.pow(hueDiff, 2)
                    + Math.pow(a.s - b.s, 2)
                    + Math.pow(a.v- b.v, 2)));
    }
}

var WebCam = function(video_id, width, callBack){
    var video = document.getElementById(video_id);
    video.width = width;

    this.localMediaStream = null;
    //カメラ使えるかチェック
    var hasGetUserMedia = function() {
        return (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
    };

    //エラー
    var onFailSoHard = function(e) {
        console.log('エラー!', e);
    };

    if(!hasGetUserMedia()) {
        alert("未対応ブラウザです。");
    } else {
        window.URL = window.URL || window.webkitURL;
        navigator.getUserMedia  = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
        navigator.getUserMedia({video: true}, function(stream) {
            video.src = window.URL.createObjectURL(stream);
            this.localMediaStream = stream;
            callBack();
        }, onFailSoHard);
    }
}