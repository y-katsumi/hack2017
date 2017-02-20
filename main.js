var ScanRego = function(BLOCKCOUNT){
    'use strict';

    this.origin_data = {};
    this.source = {};
    this.before = {};
    this.after = {};
    this.after_data = {};
    this.grey_data = {};
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
        // this.before.setAttribute("width", ~~(width / 1.5));
        // this.before.setAttribute("height", ~~(height / 1.5));
        // var ctx = this.before.getContext('2d');
        // ctx.drawImage(this.source, -~~(width / 4), -~~(height / 4), ~~(width), ~~(height));
        // this.after_data = ctx.getImageData(0, 0, ~~(width / 1.5), ~~(height / 1.5));

        this.before.setAttribute("width", ~~(width / 2));
        this.before.setAttribute("height", ~~(height / 2));
        var ctx = this.before.getContext('2d');
        ctx.drawImage(this.source, -~~(width / 4), -~~(height / 4), ~~(width), ~~(height));
        this.after_data = ctx.getImageData(0, 0, ~~(width / 2), ~~(height / 2));
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
    this.pullBlock = function(rgba, block, correction){
        // ブロックだけのデータにする
        var block_rgba = {data: [], width: 0, height: 0};
        var ii = 0;
        var start = convertXY(block.start / 4, rgba.width);
        var end = convertXY(block.end / 4, rgba.width);
        // 右下を多めにとる
        var correction = 3;
        for (var i = block.start; i < block.end + correction; i = i + 4) {
            var tmp = convertXY(i / 4, rgba.width);
            // 左側を飛ばす
            if (tmp.j < start.j) {
                continue;
            }
            // 右側を飛ばす
            if (tmp.j >= end.j + correction) {
                continue;
            }
            block_rgba.data[ii] = rgba.data[i];
            block_rgba.data[ii + 1] = rgba.data[i + 1];
            block_rgba.data[ii + 2] = rgba.data[i + 2];
            block_rgba.data[ii + 3] = rgba.data[i + 3];
            ii += 4;
        }
        block_rgba.width = end.j - start.j + correction;
        block_rgba.height = end.i - start.i + correction;
        return block_rgba;
    }
    // 2値化データから最初の位置と最後の位置,ブロックの幅と高さを取得
    this.getBlockInitData = function(rgba){
        var block = {};
        var length = rgba.data.length;
        var start = {i: 9999,j: 9999};
        var end = {i: 0,j: 0};
        // 左上の位置
        for (var i = 0; i < length / 3; i = i + 4) {
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
        for (var i = length - 1; i >= length / 3; i = i - 4) {
            if (rgba.data[i - 2] !== 255) {
                var tmp = {};
                tmp = convertXY(i / 4, rgba.width);
                if ((tmp.i + tmp.j) >= (end.i + end.j)) {
                    block.end = i;
                    end = tmp;
                }
            }
        }
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
        var i_end = ~~(rgba.height / BLOCKCOUNT);
        var j_end = ~~(rgba.width / BLOCKCOUNT);
        for(var i = 0; i < BLOCKCOUNT; i++){
            maze[i] = [];
            for (var j = 0; j < BLOCKCOUNT; j++) {
                maze[i][j] = getRegoColorFlag(grid, i_start, j_start, i_end, j_end, maze_ts);
                j_start = j_end;
                j_end += ~~(rgba.width / BLOCKCOUNT);
            }
            i_start = i_end;
            i_end += ~~(rgba.height / BLOCKCOUNT);
            j_start = 0;
            j_end = ~~(rgba.width / BLOCKCOUNT);
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
        var color = {r: 0, g: 0, b: 0, a: 0};
        // 真ん中周辺の平均値にする
        for(var i = ~~((i_end + i_start) / 2) - 1; i < ~~((i_end + i_start) / 2) + 1; i++){
            for(var j = ~~((j_end + j_start) / 2) - 1; j < ~~((j_end + j_start) / 2) + 1; j++){
                color.r += rgba[i][j].r;
                color.g += rgba[i][j].g;
                color.b += rgba[i][j].b;
            }
        }
        color.r = ~~(color.r / 9);color.g = ~~(color.g / 9);color.b = ~~(color.b / 9);
        // color = rgba[~~((i_end + i_start) / 2)][~~((j_end + j_start) / 2)];
        var g = ~~(0.299 * color.r + 0.587 * color.g + 0.114 * color.b);
        if (g >= maze_ts) {
            // color.r = color.g = color.b = 255;
            color = 0;
        } else {
            color = 1;
        }
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
                        } else if (maze[i][j] == 0) {
                            maze_rgba.data[ii]     = 255;
                            maze_rgba.data[ii + 1] = 255;
                            maze_rgba.data[ii + 2] = 255;
                            maze_rgba.data[ii + 3] = 255;
                        } else if (maze[i][j] == 1) {
                            maze_rgba.data[ii]     = 0;
                            maze_rgba.data[ii + 1] = 0;
                            maze_rgba.data[ii + 2] = 0;
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