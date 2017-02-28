$(function(){
    'use strict';
    //videoの縦幅横幅を取得
    const WCANVAS = 800;
    // ブロックの数
    const BLOCKCOUNT = 16;

    var source = 'img'
    var before = 'c1';
    var after = 'c2';
    var deb_after = 'c3';
    var camera = 'camera';
    // var socket = io('http://192.168.1.121');
    var socket = null;

    var rego = new ScanRego(BLOCKCOUNT);
    var auto_render = false;

    var maze_data = {0: null, 1: null};
    var maze_send = null;
    var maze_counter = 0;

    var web_cam = new WebCam(camera, WCANVAS, function(){
        rego.setDataSource(camera, before, after);
    });

    // 1秒づつ撮る。一個前に撮ったデータと同じだったら送信する。
    $("#" + camera).click(function(){
        if (auto_render == false) {
            auto_render = setInterval(function(){
                maze_data[maze_counter] = null;
                rego.setDataSource(camera, before, after);
                maze_data[maze_counter] = maze();
                maze_counter = (maze_counter + 1) % 2;
                send(maze_data);
            }, 1000);
        }
    });
    $("#" + source).click(function(){
        clearInterval(auto_render);
        auto_render = false;
        rego.setDataSource(source, before, after);
    });

    $("#ts").change(function(){
        clearInterval(auto_render);
        auto_render = false;
        var w_b_rgba = rego.greyScale($("#ts").val());
        var block = rego.getBlockInitData(w_b_rgba, $("#correction").val());
        // レゴだけの画像
        var only_block_rgba = rego.pullBlock(rego.after_data, block);
        rego.drawData(w_b_rgba, deb_after);
    });
    $("#maze_ts").change(function(){
        clearInterval(auto_render);
        auto_render = false;
        maze();
    });

    // レゴだけ抜き出す
    function w_b_rego_rgba(){
        // 白い紙の位置を取得
        var w_paper_rgba = rego.greyScale($("#ts").val());
        var w_paper_block = rego.getBlockInitData(w_paper_rgba, $("#correction").val());
        // blockデータを出すためにレゴの左上と右下が黒くなるように2値化する。
        // ※右上と左下は黒くなっても良いが、左上と右下はレゴ以外は白くなっていること
        var block = rego.getBlockInitData(w_paper_rgba, $("#correction").val());

        return block;
    }

    function maze(){
        var w_b_rgba = rego.greyScale($("#ts").val());
        var block = rego.getBlockInitData(w_b_rgba, $("#correction").val());
        // レゴだけの画像
        var only_block_rgba = rego.pullBlock(rego.after_data, block);
        var maze = rego.maze(only_block_rgba, $("#maze_ts").val());
        var maze_rgba = rego.mazeRestoration(maze);
        rego.drawData(maze_rgba, after);
        rego.drawData(only_block_rgba, deb_after);
        return maze;
    }

    function send(data){
        // 送信前チェック
        for(var i = 0; i < 2; i++){
            if ((data[i] instanceof Array === false) || (data[i][0] instanceof Array === false)) {
                return false;
            }
            var i_length = data[i].length;
            var j_length = data[i][0].length;

            if ((i_length != BLOCKCOUNT) || (j_length != BLOCKCOUNT)) {
                return false;
            }
        }
        // 2回撮影して同じデータだったらok
        for(var i = 0; i < i_length; i++){
            for(var j = 0; j < j_length; j++){
                if (data[0][i][j] != data[1][i][j]) {
                    return false;
                }
            }
        }
        // 既に同じデータを送っていたら送らない
        if (maze_send != null) {
            var all_check = false;
            for(var i = 0; i < i_length; i++){
                for(var j = 0; j < j_length; j++){
                    if (data[0][i][j] != maze_send[i][j]) {
                        all_check = true;
                    }
                }
            }
            if (!all_check) {
                return false;
            }
        }

        maze_send = [];
        var tmp_data = [];
        for(var i = 0; i < i_length; i++){
            tmp_data[i] = [];
            maze_send[i] = [];
            for(var j = 0; j < j_length; j++){
                tmp_data[i][j] = data[0][i][j];
                maze_send[i][j] = data[0][i][j];
            }
        }
console.log(maze_send);
        for(var i = 0; i < i_length; i++){
            for(var j = 0; j < j_length; j++){
                // 2以上は1にする
                if (tmp_data[i][j] > 1) {
                    tmp_data[i][j] = 1;
                }
            }
        }
        tmp_data[0][0] = 0;
        tmp_data[BLOCKCOUNT - 1][BLOCKCOUNT - 1] = 0;
        if (socket != null) {
            socket.emit('maze_update', tmp_data);
        }
    }

    //=======================================
    // データ送信
    // document.onkeydown = keydown;
    // function keydown() {
    //     // 黒曜石のnext
    //     if (event.keyCode == 34) {
    //         send(maze_data);
    //         return false;
    //     }
    // }
    // $(".send_maze").click(function(){
    //     send(maze_data);
    // });
    // データ送信
    //=======================================





    check();
    function check(){
        $("#" + source).click(function(e){
            var x = e.pageX - $(this).offset()["left"];
            var y = e.pageY - $(this).offset()["top"];
            console.log(x);
            console.log(y);
        });

        $("#" + before).click(function(e){
            var x = e.pageX - $(this).offset()["left"];
            var y = e.pageY - $(this).offset()["top"];
            console.log(x);
            console.log(y);
        });
        $("#" + after).click(function(e){
            var x = e.pageX - $(this).offset()["left"];
            var y = e.pageY - $(this).offset()["top"];
            console.log(x);
            console.log(y);
        });
    }
});
