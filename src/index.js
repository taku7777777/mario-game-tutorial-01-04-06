// キーボードの入力状態を記録する配列の定義
var input_key_buffer = new Array();

// キーボードの入力イベントをトリガーに配列のフラグ値を更新させる
window.addEventListener("keydown", handleKeydown);
function handleKeydown(e) {
  e.preventDefault();
  input_key_buffer[e.keyCode] = true;
}

window.addEventListener("keyup", handleKeyup);
function handleKeyup(e) {
  e.preventDefault();
  input_key_buffer[e.keyCode] = false;
}

// canvas要素の取得
const canvas = document.getElementById("maincanvas");
const ctx = canvas.getContext("2d");

// 画像を表示するの座標の定義 & 初期化
var x = 0;
var y = 300;

// 上下方向の速度
var vy = 0;
// ジャンプしたか否かのフラグ値
var isJump = false;

// ゲームオーバーか否かのフラグ値
var isGameOver = false;

// ブロック要素の定義
var blocks = [
  { x: 0, y: 332, w: 200, h: 32 },
  { x: 250, y: 232, w: 200, h: 32 },
  { x: 500, y: 132, w: 530, h: 32 }
];

// ロード時に画面描画の処理が実行されるようにする
window.addEventListener("load", update);

// 画面を更新する関数を定義 (繰り返しここの処理が実行される)
function update() {
  // 画面全体をクリア
  ctx.clearRect(0, 0, 640, 480);

  // 更新後の座標
  var updatedX = x;
  var updatedY = y;

  if (isGameOver) {
    // 上下方向は速度分をたす
    updatedY = y + vy;

    // 落下速度はだんだん大きくなる
    vy = vy + 0.5;

    if (y > 500) {
      // ゲームオーバーのキャラが更に下に落ちてきた時にダイアログを表示し、各種変数を初期化する
      alert("GAME OVER");
      isGameOver = false;
      isJump = false;
      updatedX = 0;
      updatedY = 300;
      vy = 0;
    }
  } else {
    // 入力値の確認と反映
    if (input_key_buffer[37]) {
      updatedX = x - 2;
    }
    if (input_key_buffer[38]) {
      vy = -7;
      isJump = true;
    }
    if (input_key_buffer[39]) {
      updatedX = x + 2;
    }

    // ジャンプ中である場合のみ落下するように調整する
    if (isJump) {
      // 上下方向は速度分をたす
      updatedY = y + vy;

      // 落下速度はだんだん大きくなる
      vy = vy + 0.5;

      // 主人公が乗っているブロックを取得する
      const blockTargetIsOn = getBlockTargrtIsOn(x, y, updatedX, updatedY);

      // ブロックが取得できた場合には、そのブロックの上に立っているよう見えるように着地させる
      if (blockTargetIsOn !== null) {
        updatedY = blockTargetIsOn.y - 32;
        isJump = false;
      }
    } else {
      // ブロックの上にいなければジャンプ中の扱いとして初期速度0で落下するようにする
      if (getBlockTargrtIsOn(x, y, updatedX, updatedY) === null) {
        isJump = true;
        vy = 0;
      }
    }

    if (y > 500) {
      // 下まで落ちてきたらゲームオーバーとし、上方向の初速度を与える
      isGameOver = true;
      updatedY = 500;
      vy = -15;
    }
  }

  x = updatedX;
  y = updatedY;

  // 主人公の画像を表示
  var image = new Image();
  if (isGameOver) {
    // ゲームオーバーの場合にはゲームオーバーの画像が表示する
    image.src = "../images/character-01/game-over.png";
  } else {
    image.src = "../images/character-01/base.png";
  }
  ctx.drawImage(image, x, y, 32, 32);

  // 地面の画像を表示
  var groundImage = new Image();
  groundImage.src = "../images/ground-01/base.png";
  for (const block of blocks) {
    ctx.drawImage(groundImage, block.x, block.y, block.w, block.h);
  }

  // 再描画
  window.requestAnimationFrame(update);
}

// 変更前後のxy座標を受け取って、ブロック上に存在していればそのブロックの情報を、存在していなければnullを返す
function getBlockTargrtIsOn(x, y, updatedX, updatedY) {
  // 全てのブロックに対して繰り返し処理をする
  for (const block of blocks) {
    if (y + 32 <= block.y && updatedY + 32 >= block.y) {
      if (
        (x + 32 <= block.x || x >= block.x + block.w) &&
        (updatedX + 32 <= block.x || updatedX >= block.x + block.w)
      ) {
        // ブロックの上にいない場合には何もしない
        continue;
      }
      // ブロックの上にいる場合には、そのブロック要素を返す
      return block;
    }
  }
  // 最後までブロック要素を返さなかった場合はブロック要素の上にいないということなのでnullを返却する
  return null;
}
