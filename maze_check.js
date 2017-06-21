var MazeCheck = function(){
    'use strict';
    this.visit = {};
    this.check = function(start_x, start_y, goal_x, goal_y, maze){
        maze[goal_x][goal_y] = 0,maze[start_x][start_y] = 0;
        for(var i = 0;i < maze.length;i++){
            this.visit[i] = {};
            for(var j = 0;j < maze[i].length;j++){
                this.visit[i][j] = false;
            }
        }
        // 処理
        return this.scan(start_x, start_y, goal_x, goal_y, maze);
    }
    this.scan = function(x, y, goal_x, goal_y, maze){
        this.visit[x][y] = true;
        // ゴールできたチェック
        if ((x == goal_x) && (y == goal_y)) {
            return true;
        }
        // 現在の↑のマスをチェック
        var next_x = x,next_y = y - 1;
        if ((next_x >= 0) && (next_y >= 0) && (next_x < maze.length) && (next_y < maze[next_x].length) && (maze[next_x][next_y] == 0) && (this.visit[next_x][next_y] == false)) {
            if (this.scan(next_x, next_y, goal_x, goal_y, maze)) {
                return true;
            }
        }
        // 現在の↓のマスをチェック
        next_x = x;next_y = y + 1;
        if ((next_x >= 0) && (next_y >= 0) && (next_x < maze.length) && (next_y < maze[next_x].length) && (maze[next_x][next_y] == 0) && (this.visit[next_x][next_y] == false)) {
            if (this.scan(next_x, next_y, goal_x, goal_y, maze)) {
                return true;
            }
        }
        // 現在の←のマスをチェック
        next_x = x - 1;next_y = y;
        if ((next_x >= 0) && (next_y >= 0) && (next_x < maze.length) && (next_y < maze[next_x].length) && (maze[next_x][next_y] == 0) && (this.visit[next_x][next_y] == false)) {
            if (this.scan(next_x, next_y, goal_x, goal_y, maze)) {
                return true;
            }
        }
        // 現在の→のマスをチェック
        next_x = x + 1;next_y = y;
        if ((next_x >= 0) && (next_y >= 0) && (next_x < maze.length) && (next_y < maze[next_x].length) && (maze[next_x][next_y] == 0) && (this.visit[next_x][next_y] == false)) {
            if (this.scan(next_x, next_y, goal_x, goal_y, maze)) {
                return true;
            }
        }
        return false;
    }
}

// 
// var maze_heck = new MazeCheck(16);
// tmp = [
//     [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0]
//     ,[1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 0]
//     ,[0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0]
//     ,[0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 1, 0]
//     ,[0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 0, 0]
//     ,[1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 1, 0, 1]
//     ,[2, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1]
//     ,[1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1]
//     ,[1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 0, 1]
//     ,[1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1]
//     ,[1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0]
//     ,[1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0]
//     ,[1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0]
//     ,[1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0]
//     ,[1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0]
//     ,[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0]
// ];
//
// console.log(maze_heck.check(0, 0, 15, 15, tmp));