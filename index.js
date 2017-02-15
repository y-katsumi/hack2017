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

    var rego = new ScanRego();

    rego.setDataSource(source, before, after);
    rego.greyScale();
    rego.drawData(rego.grey_data);

    $("#ts").change(function(){
        var w_b_rgba = rego.greyScale($("#ts").val());
        rego.drawData(w_b_rgba);
    });
    $("#sep").click(function(){
        // blockデータを出すために左上と右下が黒くなるように2値化する。その際レゴ以外の部分が黒くならないように要調整
        var w_b_rgba = rego.greyScale($("#ts").val());
        var block = rego.getBlockInitData(w_b_rgba);
        // レゴだけの画像
        var only_block_rgba = rego.pullBlock(rego.origin_data, block);
        var maze = rego.maze(only_block_rgba);
        var maze_rgba = rego.mazeRestoration(maze);
        rego.drawData(maze_rgba);
    });




  $("#server_send").click(function(){
    grey_scale.send();
  });

  $("#create").click(function(){
    copy_img.copy();
    grey_scale.start('c1', 'c2');
  });


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


});
