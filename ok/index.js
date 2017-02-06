//videoの縦幅横幅を取得
const WCANVAS = 500;
// ブロックの数
const BLOCKCOUNT = 16;
// サーバーに接続
var socket = io('http://10.20.52.137');

$(function(){
  web_cam = new WebCam('camera', WCANVAS);
  copy_img = new CopyImg('camera', 'c1');
  grey_scale = new GreyScale();


  $("#server_send").click(function(){
    grey_scale.send();
  });

  $("#create").click(function(){
    copy_img.copy();
    grey_scale.start('c1', 'c2');
  });


$("#img").click(function(e){
  x = e.pageX - $(this).offset()["left"];
  y = e.pageY - $(this).offset()["top"];
console.log(x);
console.log(y);
});

$("#camera").click(function(e){
  x = e.pageX - $(this).offset()["left"];
  y = e.pageY - $(this).offset()["top"];
console.log(x);
console.log(y);
});


});
