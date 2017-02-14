var ScanRego = function(){
    'use strict';
    const BLOCKCOUNT = 16;

    this.origin_data = {};
    this.source = {};
    this.before = {};
    this.after = {};
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

        this.before.setAttribute("width", width);
        this.before.setAttribute("height", height);
        var ctx = this.before.getContext('2d');
        ctx.drawImage(this.source, 0, 0, width, height);
    }

    this.greyScale = function(ts = null){
        var length = this.origin_data.data.length;
        for (var i = 0; i < length; i = i + 4) {
            var g = ~~(0.299 * this.origin_data.data[i] + 0.587 * this.origin_data.data[i + 1] + 0.114 * this.origin_data.data[i + 2]);
            if (ts) {
                g = (g > ts)? 255: 0;
            }
            this.grey_data.data[i] = this.grey_data.data[i + 1] = this.grey_data.data[i + 2] = g;
            this.grey_data.data[i + 3] = this.origin_data.data[i+ 3];
        }
        this.grey_data.width = this.origin_data.width;
        this.grey_data.height = this.origin_data.height;
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
    this.maze = function(rgba){
        var maze = [
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
            ,[0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
            ,[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
            ,[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
            ,[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
            ,[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
            ,[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
            ,[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
            ,[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
            ,[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
            ,[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
            ,[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
            ,[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
            ,[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
            ,[0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0]
            ,[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
        ];
        return maze;
    }
    // 迷路データを復元する
    this.mazeRgba = function(maze){
        var px = 30;
        var maze_rgba = {data: [], width: BLOCKCOUNT * px, height: BLOCKCOUNT * px};
        var ii = 0;

        for (var i = 0; i < BLOCKCOUNT; i++) {
            for(var i_magni = 0; i_magni < px; i_magni++){
                for (var j = 0; j < BLOCKCOUNT; j++) {
                    for(var j_magni = 0; j_magni < px; j_magni++){
                        if (maze[i][j] == 0) {
                            maze_rgba.data[ii]     = 255;
                            maze_rgba.data[ii + 1] = 255;
                            maze_rgba.data[ii + 2] = 255;
                            maze_rgba.data[ii + 3] = 255;
                        }
                        if (maze[i][j] == 1) {
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
console.log(ii);
        return maze_rgba;
    }
    /*
    data.height, data.width
    data.data[i] = r, data.data[i + 1] = g, data.data[i + 2] = b, data.data[i + 3] = a
    */
    this.drawData = function(rgba){
console.log(rgba);
        this.after.setAttribute("width", rgba.width);
        this.after.setAttribute("height", rgba.height);
        var ctx = this.after.getContext("2d");
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
        data.i = parseInt(parseInt(i) / width);
        data.j = parseInt(parseInt(i) % width);
        return data;
    }
}