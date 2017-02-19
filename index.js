$(function(){
    'use strict';
    //videoの縦幅横幅を取得
    const WCANVAS = 500;
    // ブロックの数
    const BLOCKCOUNT = 16;
    // サーバーに接続
    // var socket = io('http://10.20.52.137');

    var source = 'img'
    var before = 'c1';
    var after = 'c2';
    var deb_after = 'c3';
    var camera = 'camera';
    // var socket = io('http://10.20.52.137');

    var rego = new ScanRego(BLOCKCOUNT);
    var auto_render = false;

    var web_cam = new WebCam(camera, WCANVAS, function(){
        rego.setDataSource(camera, before, after);
    });

    $("#" + camera).click(function(){
        if (auto_render == false) {
            auto_render = setInterval(function(){
                rego.setDataSource(camera, before, after);
                maze();
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
        var block = rego.getBlockInitData(w_b_rgba);
        // レゴだけの画像
        var only_block_rgba = rego.pullBlock(rego.origin_data, block);
        rego.drawData(w_b_rgba, deb_after);
    });
    $("#maze_ts").change(function(){
        clearInterval(auto_render);
        auto_render = false;
        maze();
    });

    function maze(){
        // blockデータを出すためにレゴの左上と右下が黒くなるように2値化する。
        // ※右上と左下は黒くなっても良いが、左上と右下はレゴ以外は白くなっていること
        var w_b_rgba = rego.greyScale($("#ts").val());
        var block = rego.getBlockInitData(w_b_rgba);
        // レゴだけの画像
        var only_block_rgba = rego.pullBlock(rego.origin_data, block);
        var maze = rego.maze(only_block_rgba, $("#maze_ts").val());
        var maze_rgba = rego.mazeRestoration(maze);
        rego.drawData(maze_rgba, after);
        rego.drawData(only_block_rgba, deb_after);
    }

    function send(data){
        data[0][0] = 0;
        data[BLOCKCOUNT - 1][BLOCKCOUNT - 1] = 0;
        socket.emit('maze_update', data);
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
