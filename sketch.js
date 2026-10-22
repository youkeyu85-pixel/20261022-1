/*
  幼兒園生活常識拖曳配對測驗
  使用方式：
  1. 將本檔案儲存為 sketch.js。
  2. 放入 p5.js 專案中。
  3. 若有自己的 GIF 圖片，請修改 quizItems 裡面的 gifUrl。
  4. 所有介面都由 p5.js 畫布繪製，不需要額外 HTML 或 CSS。
*/

// 儲存六個題目的資料
const quizItems = [
  {
    title: "保護牙齒",
    answer: "早晚刷牙",
    emoji: "🪥",
    color: "#FFD166",
    gifUrl: "https://media.giphy.com/media/3o7TKMt1VVNkHV2PaE/giphy.gif"
  },
  {
    title: "保持乾淨",
    answer: "洗手手",
    emoji: "🧼",
    color: "#90DBF4",
    gifUrl: "https://media.giphy.com/media/1lqR3UQZVfeY4/giphy.gif"
  },
  {
    title: "安全過馬路",
    answer: "看紅綠燈",
    emoji: "🚦",
    color: "#FF8FA3",
    gifUrl: "https://media.giphy.com/media/26gsspfbt1HfVQ9va/giphy.gif"
  },
  {
    title: "健康好習慣",
    answer: "喝開水",
    emoji: "💧",
    color: "#A0E7E5",
    gifUrl: "https://media.giphy.com/media/3o7TKU8RvQuomFfUUU/giphy.gif"
  },
  {
    title: "保護皮膚",
    answer: "戴帽防曬",
    emoji: "🧢",
    color: "#F7A072",
    gifUrl: "https://media.giphy.com/media/26BRv0ThflsHCqDrG/giphy.gif"
  },
  {
    title: "整理環境",
    answer: "收好玩具",
    emoji: "🧸",
    color: "#CDB4DB",
    gifUrl: "https://media.giphy.com/media/3oKIPavRPgJYaNI97W/giphy.gif"
  }
];

// 儲存載入完成的 GIF 圖片
let gifImages = [];

// 儲存每個圖片卡片的位置與大小
let imageCards = [];

// 儲存每個文字選項的位置與大小
let textCards = [];

// 儲存目前正在拖曳的文字選項編號
let draggingIndex = -1;

// 儲存拖曳中的文字卡片位置
let draggingX = 0;
let draggingY = 0;

// 記錄滑鼠或手指最後位置
let lastPointerX = 0;
let lastPointerY = 0;

// 記錄目前是否正在作答
let submitted = false;

// 儲存答對題數
let correctCount = 0;

// 儲存目前提示文字
let feedbackMessage = "";

// 儲存提示文字顏色
let feedbackColor = "#333333";

// 儲存提示文字顯示時間
let feedbackTimer = 0;

// 儲存交卷按鈕位置
let submitButton = {
  x: 0,
  y: 0,
  w: 190,
  h: 58
};

// 儲存重新作答按鈕位置
let restartButton = {
  x: 0,
  y: 0,
  w: 190,
  h: 58
};

// 儲存彩帶物件
let confetti = [];

// 控制是否正在播放彩帶效果
let showConfetti = false;

// 預先載入 GIF 圖片
function preload() {
  // 逐一載入六張動畫 GIF 圖片
  for (let i = 0; i < quizItems.length; i++) {
    // 載入 GIF，若失敗則使用 null 作為替代標記
    gifImages[i] = loadImage(
      quizItems[i].gifUrl,
      function () {
        // 圖片成功載入時不需要額外處理
      },
      function () {
        // 圖片載入失敗時保留 null，之後會顯示 Emoji 替代圖案
        gifImages[i] = null;
      }
    );
  }
}

// 建立畫布與初始資料
function setup() {
  // 建立符合視窗大小的畫布
  createCanvas(windowWidth, windowHeight);

  // 設定文字對齊方式
  textAlign(CENTER, CENTER);

  // 設定繪圖模式
  rectMode(CORNER);

  // 設定畫布顯示在最上層
  canvasElementStyle();

  // 建立初始文字選項
  resetQuiz();

  // 產生彩帶資料
  createConfetti();
}

// 設定畫布的基本樣式
function canvasElementStyle() {
  // 取得目前 p5.js 的畫布元素
  const canvas = document.querySelector("canvas");

  // 確認畫布存在後設定樣式
  if (canvas) {
    // 避免手機拖曳時觸發網頁捲動
    canvas.style.touchAction = "none";

    // 讓畫布以區塊方式顯示
    canvas.style.display = "block";

    // 讓畫布不會超出瀏覽器寬度
    canvas.style.maxWidth = "100%";
  }

  // 設定網頁本身的基本樣式
  document.body.style.margin = "0";
  document.body.style.overflow = "hidden";
  document.body.style.backgroundColor = "#FFF8E7";
}

// 每一幀都會執行的繪圖函式
function draw() {
  // 繪製淡黃色背景
  background("#FFF8E7");

  // 計算目前響應式版面配置
  calculateLayout();

  // 繪製背景裝飾
  drawBackgroundDecoration();

  // 繪製標題
  drawHeader();

  // 繪製上方固定圖片選項
  drawImageCards();

  // 繪製下方拖曳文字選項
  drawTextCards();

  // 繪製提示訊息
  drawFeedback();

  // 繪製交卷或重新作答按鈕
  drawActionButton();

  // 若已經交卷，繪製成績畫面
  if (submitted) {
    drawResultPanel();
  }

  // 若分數超過 80%，繪製彩帶
  if (showConfetti) {
    updateAndDrawConfetti();
  }
}

// 計算響應式版面
function calculateLayout() {
  // 設定左右留白
  const margin = min(width * 0.05, 60);

  // 計算可用寬度
  const availableWidth = width - margin * 2;

  // 設定六欄之間的間隔
  const gap = min(width * 0.015, 18);

  // 計算每張圖片卡片的寬度
  const cardWidth = (availableWidth - gap * 5) / 6;

  // 計算圖片卡片高度
  const cardHeight = min(180, max(125, height * 0.22));

  // 設定圖片卡片的頂端位置
  const imageTop = max(150, height * 0.22);

  // 清空圖片卡片陣列
  imageCards = [];

  // 建立六張圖片卡片的位置
  for (let i = 0; i < quizItems.length; i++) {
    // 計算圖片卡片的 X 座標
    const cardX = margin + i * (cardWidth + gap);

    // 儲存圖片卡片的位置與大小
    imageCards.push({
      x: cardX,
      y: imageTop,
      w: cardWidth,
      h: cardHeight
    });
  }

  // 設定文字卡片的寬度
  const textWidth = min(230, max(145, width * 0.18));

  // 設定文字卡片的高度
  const textHeight = min(70, max(52, height * 0.075));

  // 設定文字卡片的間距
  const textGap = min(16, max(8, width * 0.012));

  // 計算文字選項總寬度
  const totalTextWidth = quizItems.length * textWidth + 5 * textGap;

  // 計算文字選項起始位置
  const textStartX = max(margin, (width - totalTextWidth) / 2);

  // 設定文字選項的頂端位置
  const textTop = min(height - 170, imageTop + cardHeight + 90);

  // 若目前尚未建立文字卡片，建立六張文字卡片
  if (textCards.length === 0) {
    // 建立六個文字選項
    for (let i = 0; i < quizItems.length; i++) {
      // 將文字卡片加入陣列
      textCards.push({
        x: textStartX + i * (textWidth + textGap),
        y: textTop,
        w: textWidth,
        h: textHeight,
        originalX: textStartX + i * (textWidth + textGap),
        originalY: textTop,
        matched: false
      });
    }
  } else {
    // 更新尚未配對文字卡片的位置
    for (let i = 0; i < textCards.length; i++) {
      // 已配對卡片不重新排列
      if (!textCards[i].matched) {
        // 重新計算文字卡片的位置
        textCards[i].x = textStartX + i * (textWidth + textGap);
        textCards[i].y = textTop;
        textCards[i].originalX = textCards[i].x;
        textCards[i].originalY = textCards[i].y;
      }
    }
  }

  // 計算交卷按鈕的位置
  submitButton.w = min(210, width * 0.42);
  submitButton.h = 58;
  submitButton.x = width - submitButton.w - margin;
  submitButton.y = height - submitButton.h - 25;

  // 計算重新作答按鈕的位置
  restartButton.w = min(210, width * 0.42);
  restartButton.h = 58;
  restartButton.x = width / 2 - restartButton.w / 2;
  restartButton.y = height * 0.68;
}

// 繪製背景裝飾
function drawBackgroundDecoration() {
  // 暫時儲存目前繪圖狀態
  push();

  // 設定無外框
  noStroke();

  // 繪製左上角裝飾圓
  fill(255, 214, 102, 70);
  circle(40, 100, 80);

  // 繪製右上角裝飾圓
  fill(144, 219, 244, 70);
  circle(width - 40, 130, 100);

  // 繪製左下角裝飾圓
  fill(205, 180, 219, 70);
  circle(35, height - 75, 90);

  // 繪製右下角裝飾圓
  fill(255, 143, 163, 70);
  circle(width - 30, height - 85, 110);

  // 還原繪圖狀態
  pop();
}

// 繪製標題區域
function drawHeader() {
  // 暫時儲存繪圖狀態
  push();

  // 設定標題顏色
  fill("#5B3A29");

  // 設定標題文字大小
  textSize(min(38, max(25, width * 0.038)));

  // 繪製主標題
  text("🌈 幼兒生活常識配對王 🌈", width / 2, 48);

  // 設定副標題文字大小
  textSize(min(20, max(14, width * 0.019)));

  // 設定副標題顏色
  fill("#866A52");

  // 繪製副標題
  text("請把下方的生活小習慣，拖曳到上方正確的圖卡中！", width / 2, 92);

  // 繪製題數提示
  textSize(min(16, max(12, width * 0.016)));
  fill("#AA8060");
  text("一共有六題，全部完成後就可以交卷囉！", width / 2, 120);

  // 還原繪圖狀態
  pop();
}

// 繪製上方圖片卡片
function drawImageCards() {
  // 逐一繪製六張圖片卡片
  for (let i = 0; i < imageCards.length; i++) {
    // 取得目前圖片卡片
    const card = imageCards[i];

    // 取得目前題目資料
    const item = quizItems[i];

    // 判斷目前圖片是否已經配對成功
    const matched = textCards.some(function (textCard) {
      return textCard.matched && textCard.answerIndex === i;
    });

    // 暫時儲存繪圖狀態
    push();

    // 繪製卡片陰影
    drawingContext.shadowColor = "rgba(70, 50, 30, 0.18)";
    drawingContext.shadowBlur = 12;
    drawingContext.shadowOffsetY = 5;

    // 設定卡片背景顏色
    fill(item.color);

    // 繪製圓角卡片
    rect(card.x, card.y, card.w, card.h, 22);

    // 關閉陰影
    drawingContext.shadowColor = "transparent";

    // 設定圖片區域內距
    const padding = min(12, card.w * 0.08);

    // 計算圖片繪製範圍
    const imageX = card.x + padding;
    const imageY = card.y + padding;
    const imageW = card.w - padding * 2;
    const imageH = card.h - padding * 2 - 34;

    // 確認 GIF 圖片已載入且有效
    if (gifImages[i] && gifImages[i].width > 0) {
      // 計算圖片比例
      const imageRatio = gifImages[i].width / gifImages[i].height;

      // 計算容器比例
      const boxRatio = imageW / imageH;

      // 預設圖片繪製尺寸
      let drawW = imageW;
      let drawH = imageH;

      // 依照比例調整圖片大小
      if (imageRatio > boxRatio) {
        drawH = imageW / imageRatio;
      } else {
        drawW = imageH * imageRatio;
      }

      // 置中繪製 GIF 圖片
      image(
        gifImages[i],
        imageX + (imageW - drawW) / 2,
        imageY + (imageH - drawH) / 2,
        drawW,
        drawH
      );
    } else {
      // GIF 載入失敗時顯示 Emoji 替代圖案
      textSize(min(65, max(35, card.w * 0.42)));
      text(item.emoji, card.x + card.w / 2, card.y + card.h * 0.48);
    }

    // 繪製圖片卡片標題
    fill("#5B3A29");
    textSize(min(18, max(11, card.w * 0.12)));
    text(item.title, card.x + card.w / 2, card.y + card.h - 18);

    // 若已經配對成功，繪製成功標記
    if (matched) {
      fill(255, 255, 255, 210);
      circle(card.x + card.w - 22, card.y + 22, 30);

      fill("#36A269");
      textSize(22);
      text("✓", card.x + card.w - 22, card.y + 22);
    }

    // 還原繪圖狀態
    pop();
  }
}

// 繪製下方文字選項
function drawTextCards() {
  // 逐一繪製六個文字卡片
  for (let i = 0; i < textCards.length; i++) {
    // 取得目前文字卡片
    const card = textCards[i];

    // 若目前卡片正在拖曳，改用拖曳座標
    const drawX = draggingIndex === i ? draggingX - card.w / 2 : card.x;
    const drawY = draggingIndex === i ? draggingY - card.h / 2 : card.y;

    // 暫時儲存繪圖狀態
    push();

    // 正確配對後使用綠色，未配對使用白色
    if (card.matched) {
      fill("#B9F6CA");
    } else {
      fill("#FFFFFF");
    }

    // 繪製卡片陰影
    drawingContext.shadowColor = "rgba(70, 50, 30, 0.18)";
    drawingContext.shadowBlur = draggingIndex === i ? 18 : 9;
    drawingContext.shadowOffsetY = draggingIndex === i ? 8 : 4;

    // 繪製文字卡片
    rect(drawX, drawY, card.w, card.h, 18);

    // 關閉陰影
    drawingContext.shadowColor = "transparent";

    // 設定文字大小
    textSize(min(21, max(14, card.w * 0.13)));

    // 設定文字顏色
    fill(card.matched ? "#267A4B" : "#5B3A29");

    // 繪製文字內容
    text(quizItems[i].answer, drawX + card.w / 2, drawY + card.h / 2);

    // 若卡片已配對成功，顯示小勾勾
    if (card.matched) {
      fill("#36A269");
      textSize(20);
      text("✓", drawX + card.w - 17, drawY + 17);
    }

    // 還原繪圖狀態
    pop();
  }
}

// 繪製提示訊息
function drawFeedback() {
  // 若沒有提示文字，直接結束
  if (feedbackMessage === "") {
    return;
  }

  // 計算提示文字透明度
  const alphaValue = feedbackTimer > 0 ? 255 : 0;

  // 暫時儲存繪圖狀態
  push();

  // 設定提示文字顏色
  fill(red(feedbackColor), green(feedbackColor), blue(feedbackColor), alphaValue);

  // 設定提示文字大小
  textSize(min(23, max(15, width * 0.021)));

  // 繪製提示文字
  text(feedbackMessage, width / 2, height - 105);

  // 每幀減少提示時間
  if (feedbackTimer > 0) {
    feedbackTimer--;
  }

  // 還原繪圖狀態
  pop();
}

// 繪製交卷或重新作答按鈕
function drawActionButton() {
  // 暫時儲存繪圖狀態
  push();

  // 判斷目前要顯示哪一個按鈕
  if (!submitted) {
    // 設定交卷按鈕顏色
    fill("#FF8FA3");

    // 設定按鈕文字顏色
    stroke("#E66C83");

    // 繪製交卷按鈕
    rect(
      submitButton.x,
      submitButton.y,
      submitButton.w,
      submitButton.h,
      18
    );

    // 關閉外框
    noStroke();

    // 設定按鈕文字
    fill("#FFFFFF");
    textSize(min(20, max(14, width * 0.018)));
    text("📮 交卷看成績", submitButton.x + submitButton.w / 2, submitButton.y + submitButton.h / 2);
  } else {
    // 設定重新作答按鈕顏色
    fill("#6EC6A8");

    // 繪製重新作答按鈕
    rect(
      restartButton.x,
      restartButton.y,
      restartButton.w,
      restartButton.h,
      18
    );

    // 設定按鈕文字
    fill("#FFFFFF");
    textSize(min(20, max(14, width * 0.018)));
    text("🔄 重新作答", restartButton.x + restartButton.w / 2, restartButton.y + restartButton.h / 2);
  }

  // 還原繪圖狀態
  pop();
}

// 繪製成績結果面板
function drawResultPanel() {
  // 計算得分百分比
  const score = correctCount / quizItems.length * 100;

  // 暫時儲存繪圖狀態
  push();

  // 繪製半透明遮罩
  fill(91, 58, 41, 155);
  rect(0, 0, width, height);

  // 計算結果面板大小
  const panelW = min(500, width * 0.82);
  const panelH = min(390, height * 0.62);

  // 計算結果面板位置
  const panelX = width / 2 - panelW / 2;
  const panelY = height / 2 - panelH / 2;

  // 繪製結果面板陰影
  drawingContext.shadowColor = "rgba(0, 0, 0, 0.3)";
  drawingContext.shadowBlur = 25;
  drawingContext.shadowOffsetY = 8;

  // 繪製結果面板
  fill("#FFFDF5");
  rect(panelX, panelY, panelW, panelH, 28);

  // 關閉陰影
  drawingContext.shadowColor = "transparent";

  // 繪製結果標題
  fill("#5B3A29");
  textSize(min(34, max(24, width * 0.035)));
  text("🎉 作答完成！", width / 2, panelY + 60);

  // 繪製分數
  fill(score >= 80 ? "#36A269" : "#E68A3A");
  textSize(min(68, max(45, width * 0.065)));
  text(`${score}%`, width / 2, panelY + 145);

  // 繪製答題結果
  fill("#866A52");
  textSize(min(22, max(16, width * 0.022)));
  text(
    `答對 ${correctCount} 題，共 ${quizItems.length} 題`,
    width / 2,
    panelY + 205
  );

  // 根據分數顯示鼓勵文字
  fill("#5B3A29");
  textSize(min(23, max(16, width * 0.023)));

  if (score >= 80) {
    text("太棒了！你是生活常識小達人！", width / 2, panelY + 255);
  } else {
    text("再試一次，你一定會更棒！", width / 2, panelY + 255);
  }

  // 還原繪圖狀態
  pop();
}

// 建立彩帶資料
function createConfetti() {
  // 清空原本的彩帶
  confetti = [];

  // 建立 160 個彩帶物件
  for (let i = 0; i < 160; i++) {
    // 將彩帶加入陣列
    confetti.push({
      x: random(width),
      y: random(-height, 0),
      size: random(6, 13),
      speed: random(2, 6),
      drift: random(-1.4, 1.4),
      rotation: random(TWO_PI),
      rotationSpeed: random(-0.12, 0.12),
      color: random([
        "#FF6B6B",
        "#FFD166",
        "#06D6A0",
        "#118AB2",
        "#CDB4DB",
        "#FF8FA3"
      ])
    });
  }
}

// 更新並繪製彩帶
function updateAndDrawConfetti() {
  // 暫時儲存繪圖狀態
  push();

  // 逐一更新彩帶
  for (let i = 0; i < confetti.length; i++) {
    // 取得目前彩帶
    const piece = confetti[i];

    // 更新彩帶垂直位置
    piece.y += piece.speed;

    // 更新彩帶水平漂移
    piece.x += piece.drift;

    // 更新彩帶旋轉角度
    piece.rotation += piece.rotationSpeed;

    // 若彩帶掉出畫面，重新從上方出現
    if (piece.y > height + 20) {
      piece.y = random(-100, -20);
      piece.x = random(width);
    }

    // 繪製旋轉彩帶
    push();
    translate(piece.x, piece.y);
    rotate(piece.rotation);
    noStroke();
    fill(piece.color);
    rect(-piece.size / 2, -piece.size / 2, piece.size, piece.size * 2.2, 3);
    pop();
  }

  // 還原繪圖狀態
  pop();
}

// 判斷某個座標是否位於指定矩形內
function isPointInsideRect(px, py, rectObject) {
  // 回傳座標是否在矩形範圍內
  return (
    px >= rectObject.x &&
    px <= rectObject.x + rectObject.w &&
    py >= rectObject.y &&
    py <= rectObject.y + rectObject.h
  );
}

// 找出目前座標碰到哪一張圖片卡片
function findImageCard(px, py) {
  // 逐一檢查六張圖片卡片
  for (let i = 0; i < imageCards.length; i++) {
    // 若座標位於卡片內，回傳卡片編號
    if (isPointInsideRect(px, py, imageCards[i])) {
      return i;
    }
  }

  // 沒有碰到任何卡片時回傳 -1
  return -1;
}

// 找出目前座標碰到哪一張文字卡片
function findTextCard(px, py) {
  // 逐一檢查六張文字卡片
  for (let i = textCards.length - 1; i >= 0; i--) {
    // 已經配對的卡片不能再次拖曳
    if (textCards[i].matched) {
      continue;
    }

    // 若座標位於文字卡片內，回傳卡片編號
    if (isPointInsideRect(px, py, textCards[i])) {
      return i;
    }
  }

  // 沒有碰到任何卡片時回傳 -1
  return -1;
}

// 滑鼠按下時執行
function mousePressed() {
  // 如果已經交卷，不再接受拖曳
  if (submitted) {
    // 檢查是否按下重新作答按鈕
    if (isPointInsideRect(mouseX, mouseY, restartButton)) {
      resetQuiz();
    }

    // 結束滑鼠事件
    return false;
  }

  // 檢查是否按下交卷按鈕
  if (isPointInsideRect(mouseX, mouseY, submitButton)) {
    submitQuiz();
    return false;
  }

  // 找出被按下的文字卡片
  const selectedIndex = findTextCard(mouseX, mouseY);

  // 如果找到文字卡片，就開始拖曳
  if (selectedIndex !== -1) {
    draggingIndex = selectedIndex;
    draggingX = mouseX;
    draggingY = mouseY;
    lastPointerX = mouseX;
    lastPointerY = mouseY;
  }

  // 阻止瀏覽器預設行為
  return false;
}

// 滑鼠移動時執行
function mouseDragged() {
  // 沒有拖曳中的卡片時直接結束
  if (draggingIndex === -1 || submitted) {
    return false;
  }

  // 更新拖曳卡片位置
  draggingX = mouseX;
  draggingY = mouseY;

  // 記錄最後游標位置
  lastPointerX = mouseX;
  lastPointerY = mouseY;

  // 阻止瀏覽器預設行為
  return false;
}

// 滑鼠放開時執行
function mouseReleased() {
  // 沒有拖曳中的卡片時直接結束
  if (draggingIndex === -1 || submitted) {
    return false;
  }

  // 完成拖曳判斷
  finishDragging(mouseX, mouseY);

  // 阻止瀏覽器預設行為
  return false;
}

// 手指開始觸控時執行
function touchStarted() {
  // 使用第一根手指的座標
  const touchX = touches.length > 0 ? touches[0].x : mouseX;
  const touchY = touches.length > 0 ? touches[0].y : mouseY;

  // 如果已經交卷，檢查重新作答按鈕
  if (submitted) {
    if (isPointInsideRect(touchX, touchY, restartButton)) {
      resetQuiz();
    }

    return false;
  }

  // 檢查是否按下交卷按鈕
  if (isPointInsideRect(touchX, touchY, submitButton)) {
    submitQuiz();
    return false;
  }

  // 找出觸控位置的文字卡片
  const selectedIndex = findTextCard(touchX, touchY);

  // 如果找到文字卡片，就開始拖曳
  if (selectedIndex !== -1) {
    draggingIndex = selectedIndex;
    draggingX = touchX;
    draggingY = touchY;
    lastPointerX = touchX;
    lastPointerY = touchY;
  }

  // 阻止手機瀏覽器預設行為
  return false;
}

// 手指拖曳時執行
function touchMoved() {
  // 沒有拖曳中的卡片時直接結束
  if (draggingIndex === -1 || submitted) {
    return false;
  }

  // 使用第一根手指更新位置
  draggingX = touches.length > 0 ? touches[0].x : mouseX;
  draggingY = touches.length > 0 ? touches[0].y : mouseY;

  // 記錄最後位置
  lastPointerX = draggingX;
  lastPointerY = draggingY;

  // 阻止手機瀏覽器預設行為
  return false;
}

// 手指放開時執行
function touchEnded() {
  // 沒有拖曳中的卡片時直接結束
  if (draggingIndex === -1 || submitted) {
    return false;
  }

  // 使用最後記錄的位置完成拖曳判斷
  finishDragging(lastPointerX, lastPointerY);

  // 阻止手機瀏覽器預設行為
  return false;
}

// 完成拖曳並判斷答案
function finishDragging(dropX, dropY) {
  // 記錄目前拖曳的文字卡片編號
  const selectedTextIndex = draggingIndex;

  // 找出文字卡片放置的圖片卡片
  const targetImageIndex = findImageCard(dropX, dropY);

  // 清除拖曳狀態
  draggingIndex = -1;

  // 如果沒有放到任何圖片卡片，顯示提示
  if (targetImageIndex === -1) {
    feedbackMessage = "請把文字拖到上方的圖卡中喔！";
    feedbackColor = "#E68A3A";
    feedbackTimer = 130;
    return;
  }

  // 檢查文字答案是否與圖片卡片相符
  if (selectedTextIndex === targetImageIndex) {
    // 將文字卡片標記為配對成功
    textCards[selectedTextIndex].matched = true;

    // 記錄配對到哪一張圖片卡片
    textCards[selectedTextIndex].answerIndex = targetImageIndex;

    // 將文字卡片移動到圖片卡片中央
    textCards[selectedTextIndex].x =
      imageCards[targetImageIndex].x +
      imageCards[targetImageIndex].w / 2 -
      textCards[selectedTextIndex].w / 2;

    textCards[selectedTextIndex].y =
      imageCards[targetImageIndex].y +
      imageCards[targetImageIndex].h -
      textCards[selectedTextIndex].h -
      8;

    // 顯示正確提示
    feedbackMessage = "答對了！你好厲害！ ⭐";
    feedbackColor = "#36A269";
    feedbackTimer = 130;
  } else {
    // 顯示錯誤提示
    feedbackMessage = "再想一想，這張圖卡不是這個答案喔！";
    feedbackColor = "#D95D39";
    feedbackTimer = 150;
  }
}

// 交卷並計算成績
function submitQuiz() {
  // 防止重複交卷
  if (submitted) {
    return;
  }

  // 計算答對題數
  correctCount = 0;

  // 逐一檢查文字卡片是否完成正確配對
  for (let i = 0; i < textCards.length; i++) {
    if (textCards[i].matched) {
      correctCount++;
    }
  }

  // 設定為已交卷
  submitted = true;

  // 計算百分比
  const score = correctCount / quizItems.length * 100;

  // 顯示交卷提示
  feedbackMessage = `你的成績是 ${score}%！`;
  feedbackColor = score >= 80 ? "#36A269" : "#E68A3A";
  feedbackTimer = 240;

  // 分數達到 80% 以上時啟動彩帶效果
  if (score >= 80) {
    showConfetti = true;
    createConfetti();
  } else {
    showConfetti = false;
  }
}

// 重新開始測驗
function resetQuiz() {
  // 清除所有文字卡片
  textCards = [];

  // 清除拖曳狀態
  draggingIndex = -1;

  // 清除成績
  correctCount = 0;

  // 設定為尚未交卷
  submitted = false;

  // 清除提示文字
  feedbackMessage = "";
  feedbackTimer = 0;

  // 關閉彩帶效果
  showConfetti = false;

  // 重新計算版面
  calculateLayout();
}

// 視窗尺寸改變時重新調整畫布
function windowResized() {
  // 重新建立符合新視窗尺寸的畫布
  resizeCanvas(windowWidth, windowHeight);

  // 重新設定畫布樣式
  canvasElementStyle();

  // 重新計算響應式版面
  calculateLayout();

  // 重新建立彩帶
  createConfetti();
}