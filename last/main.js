var WebCam = function(video_id, width){
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
    }, onFailSoHard);
  }
}

var CopyImg = function(video_id, canvas_id){
  var video = document.getElementById(video_id);
  var canvas = document.getElementById(canvas_id);

  this.copy = function(){
    var width = video.offsetWidth;
    var height = video.offsetHeight;
    canvas.setAttribute("width", width);
    canvas.setAttribute("height", height);

    var ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, width, height);
    ctx.createImageData(width, height);
  }
}

var GreyScale = function(){
  this.rego = {
    i : {start: 0, end: 0, add: 0}
    ,j : {start: 0, end: 0, add: 0}
  }
  this.block_json = {};
  this.start = function(source_id, target_id){

    json = [];

    var s_obj = document.getElementById(source_id);
    var t_obj = document.getElementById(target_id);

    t_obj.setAttribute("width", s_obj.width);
    t_obj.setAttribute("height", s_obj.height);

    var t_ctx = t_obj.getContext("2d");
    var s_ctx = s_obj.getContext("2d");
    var src = s_ctx.getImageData(0, 0, s_obj.width, s_obj.height);
    var dst = t_ctx.createImageData(s_obj.width, s_obj.height);

    var length = src.data.length;
    for (var i = 0; i < length; i = i + 4) {
      // 二次元配列に変換
      i_json = parseInt(parseInt(i / 4) / s_obj.width);
      j_json = parseInt(parseInt(i / 4) % s_obj.width);
      if (typeof json[i_json] === 'undefined') {
        json[i_json] = [];
      }
      json[i_json][j_json] = {
        r:  src.data[i]
        ,g:  src.data[i + 1]
        ,b:  src.data[i + 2]
        ,a:  src.data[i + 3]
      };

      // 青
      r = 41; g = 39; b = 135; r_gosa = 30; g_gosa = 30; b_gosa = 30;
      if (
        (this.rego.i.start == 0) && checkColor(json[i_json][j_json], r, g, b, r_gosa, g_gosa, b_gosa)
          // (this.rego.i.start == 0)
          // && (json[i_json][j_json].b >= 100) && (json[i_json][j_json].b <= 150)
          // && (json[i_json][j_json].r <= 100) && (json[i_json][j_json].g <= 100)
      ) {
        this.rego.i.start = i_json;
        this.rego.j.start = j_json;
      }
      // r = 52; g = 59; b = 149; r_gosa = 30; g_gosa = 30; b_gosa = 30;
      r = 60; g = 40; b = 130; r_gosa = 20; g_gosa = 20; b_gosa = 40;
      if ((this.rego.i.end == 0) && (i_json > 300) && (j_json > 200)
       && checkColor(json[i_json][j_json], r, g, b, r_gosa, g_gosa, b_gosa)) {
        this.rego.i.end = i_json;
        this.rego.j.end = j_json;
      }
    }
console.log(this.rego);
    this.rego.i.add = parseInt((this.rego.i.end - this.rego.i.start) / (BLOCKCOUNT - 1));
    this.rego.j.add = parseInt((this.rego.j.end - this.rego.j.start) / (BLOCKCOUNT - 1));

    block_json = this.separate(json);

    block_json = editColor(block_json);
    this.block_json = block_json;
    this.json_debug(block_json, target_id);
  }

  // ブロックにわける
  this.separate = function(json){
    var block_json = [];
    var i_start = this.rego.i.start;
    var j_start = this.rego.j.start;
    var i_add = this.rego.i.add;
    var j_add = this.rego.j.add;
    for(var i_block = 0; i_block < BLOCKCOUNT; i_block++){
      block_json[i_block] = [];
      for(var j_block = 0; j_block < BLOCKCOUNT; j_block++){
        block_json[i_block][j_block] = getMedian(json, i_start, j_start, i_add, j_add);
        j_start += j_add;
      }
      i_start += i_add;
      j_start -= j_add * BLOCKCOUNT;
    }
    return block_json;

    // 中心近くのアベレージの値
    function getMedian(json, i_start, j_start, i_add, j_add){
      ii = 0;
      grey = [];
      for(i_ = i_start; i_ < i_start + i_add; i_++){
        for(j_ = j_start; j_ < j_start + j_add; j_++){
          grey[ii] = [];
          grey[ii]['atai'] = ~~(0.299 * json[i_][j_].r + 0.587 * json[i_][j_].g + 0.114 * json[i_][j_].b);
          grey[ii]['i_'] = i_;
          grey[ii]['j_'] = j_;
          ii++;
        }
      }
      grey.sort(function(a,b){
        if(a['atai'] < b['atai']) return -1;
        if(a['atai'] > b['atai']) return 1;
        return 0;
      });


      block = {};
      i = grey[parseInt(ii / 2) + 1].i_;
      j = grey[parseInt(ii / 2) + 1].j_;

      r = json[i][j].r;
      g = json[i][j].g;
      b = json[i][j].b;
      block = {
        r: r
        ,g: g
        ,b: b
        ,a: json[i][j].a
      };

      return block;
    }

  }

  function editColor(block_json){
    var i_length = block_json.length;
    var j_length = block_json[0].length;

    for(var i = 0; i < i_length; i++){
      for(var j = 0; j < j_length; j++){
        check_flag = false;
        // 青
        r = 33; g = 24; b = 119;
        // r = 78; g = 17; b = 109;
        if (
          (block_json[i][j].b >= 90) && (block_json[i][j].b <= 125)
          && (block_json[i][j].r <= 100) && (block_json[i][j].g <= 100)
        ) {
          block_json[i][j].r = r; block_json[i][j].g = g; block_json[i][j].b = b;
          block_json[i][j].f = 0;
          check_flag = true;
        }
        // 赤
        r = 153; g = 0; b = 1;
        // r = 192; g = 69; b = 82;
        if (
          (block_json[i][j].r >= 140) && (block_json[i][j].r <= 200)
          && (block_json[i][j].g <= 100) && (block_json[i][j].b <= 100)
        ) {
          block_json[i][j].r = r; block_json[i][j].g = g; block_json[i][j].b = b;
          block_json[i][j].f = 1;
          check_flag = true;
        }
        if (!check_flag) {
          r = 255; g = 255; b = 255;
          block_json[i][j].r = r; block_json[i][j].g = g; block_json[i][j].b = b;
          block_json[i][j].f = 0;
        }
      }
    }
    return block_json;
  }
  function checkColor(b_j_ij, r, g, b, r_gosa, g_gosa, b_gosa){
    if ( ( (b_j_ij.r > r - r_gosa) && (b_j_ij.r < r + r_gosa) )
      && ( (b_j_ij.g > g - g_gosa) && (b_j_ij.g < g + g_gosa) )
      && ( (b_j_ij.b > b - b_gosa) && (b_j_ij.b < b + b_gosa) ) ) {
       return true;
    } else {
      return false;
    }
  }

  this.send = function(){
    block_json = this.block_json;
    var i_length = block_json.length;
    var j_length = block_json[0].length;
    var send = [];

    for(var i = 0; i < i_length; i++){
      for(var j = 0; j < j_length; j++){
        if (typeof send[i] === 'undefined') {
          send[i] = [];
        }
        send[i][j] = block_json[i][j].f;
      }
    }
    send[0][0] = 0;
    send[BLOCKCOUNT - 1][BLOCKCOUNT - 1] = 0;
    socket.emit('maze_update', send);
  }


  this.json_debug = function(json, target_id){
    var t_obj = document.getElementById(target_id);
    var t_ctx = t_obj.getContext("2d");

    var ii = 0;
    var i_length = json.length;
    var j_length = json[0].length;

    var dst = t_ctx.createImageData(i_length * BLOCKCOUNT, j_length * BLOCKCOUNT);

    for (var i = 0; i < i_length; i++) {
      for(aaa = 0; aaa < BLOCKCOUNT; aaa++){
        for (var j = 0; j < j_length; j++) {

          for(bbb = 0; bbb < BLOCKCOUNT; bbb++){
            dst.data[ii] = json[i][j].r;
            dst.data[ii + 1] = json[i][j].g;
            dst.data[ii + 2] = json[i][j].b;
            dst.data[ii + 3] = json[i][j].a;
            ii += 4;
          }
        }
      }
    }

    t_ctx.putImageData(dst, 0, 0);
  }
}
