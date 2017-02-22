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
    // var socket = io('http://10.20.52.137');
    var socket = null;

    var rego = new ScanRego(BLOCKCOUNT);
    var auto_render = false;

    var web_cam = new WebCam(camera, WCANVAS, function(){
        rego.setDataSource(camera, before, after);
    });

    $("#" + camera).click(function(){
        if (auto_render == false) {
            auto_render = setInterval(function(){
                rego.setDataSource(camera, before, after);
                var maze_data = maze();
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
        if ((data[0][0] == 1) || (data[BLOCKCOUNT - 1][BLOCKCOUNT - 1] == 1)) {
            return false;
        }
        data[0][0] = 0;
        data[BLOCKCOUNT - 1][BLOCKCOUNT - 1] = 0;
        if (socket != null) {
            socket.emit('maze_update', data);
        }
    }





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
