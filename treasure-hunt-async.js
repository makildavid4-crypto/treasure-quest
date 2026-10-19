// ============================================================
//  寻宝游戏 · async/await 重写版
//  在原版 Promise 链式调用的基础上：
//    1) 用 async/await 重写整个寻宝流程
//    2) 新增「星辰罗盘」「沙漠商队」「风之迷宫」「守护神兽」等情节
//  运行： node treasure-hunt-async.js
// ============================================================

// ---------------- 工具函数 ----------------
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let _start = 0;
const C = {
  dim: "\x1b[90m", reset: "\x1b[0m", white: "\x1b[37m",
  green: "\x1b[32m", yellow: "\x1b[33m", red: "\x1b[31m", cyan: "\x1b[36m", gold: "\x1b[93m",
};

/** 带时间戳的日志 */
function log(msg, type = "info") {
  const t = ((Date.now() - _start) / 1000).toFixed(2).padStart(5);
  const tag = { info: "[  ]", ok: "[OK]", warn: "[ !]", err: "[XX]" }[type];
  const color = { info: C.white, ok: C.green, warn: C.yellow, err: C.red }[type];
  console.log(`${C.dim}[${t}s]${C.reset} ${color}${tag}${C.reset} ${msg}`);
}

/** 通用重试：把「可能失败」的异步任务自动重试，符合探索类游戏的叙事 */
async function withRetry(task, attempts, onFail) {
  for (let i = 1; i <= attempts; i++) {
    try {
      return await task(i);
    } catch (e) {
      log(e.message, "warn");
      if (onFail) await onFail(i);
      if (i === attempts) {
        throw new Error(`${e.message} —— 尝试了 ${attempts} 次仍未成功`);
      }
    }
  }
}

// ============================================================
//  宝藏地图 API
// ============================================================
class TreasureMap {
  // ---------- 原有 API ----------
  static getInitialClue() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve("在古老的图书馆里找到了第一个线索...");
      }, 1000);
    });
  }

  static decodeAncientScript(clue) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!clue) {
          reject(new Error("没有线索可以解码!"));
          return;
        }
        resolve("解码成功!宝藏在一座古老的神庙中...");
      }, 1500);
    });
  }

  static searchTemple(location) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() < 0.5) {
          reject(new Error("糟糕!遇到了神庙守卫!"));
          return;
        }
        resolve("找到了一个神秘的箱子...");
      }, 2000);
    });
  }

  static openTreasureBox() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve("恭喜!你找到了传说中的宝藏!");
      }, 1000);
    });
  }

  // ---------- 新增情节：星辰罗盘（异步） ----------
  static consultStarlightCompass(clue) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!clue) {
          reject(new Error("没有线索，星辰罗盘无法校准方向!"));
          return;
        }
        const dirs = [
          { name: "西北 · 赤沙戈壁", hint: "北斗第三星正指向那片会唱歌的沙子" },
          { name: "东南 · 雾隐山谷", hint: "启明星落下的地方，山谷在夜里低语" },
          { name: "西南 · 沉钟海岸", hint: "老人星指引着一座沉在浪里的钟楼" },
        ];
        const picked = dirs[Math.floor(Math.random() * dirs.length)];
        resolve(picked);
      }, 1200);
    });
  }

  // ---------- 新增情节：沙漠商队交易（异步） ----------
  static tradeWithDesertCaravan(direction) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const merchants = ["独眼商人萨利姆", "驼铃少女阿依莎", "沉默的星象师"];
        const merchant = merchants[Math.floor(Math.random() * merchants.length)];
        const price = 1 + Math.floor(Math.random() * 3);
        resolve({
          merchant,
          price,
          item: "古铜钥匙",
          line: `${merchant}愿意以「古铜钥匙」交换，索要 ${price} 份勇气值`,
          direction,
        });
      }, 1600);
    });
  }

  // ---------- 新增情节：风之迷宫（异步，可能迷路） ----------
  static solveWindMaze() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() < 0.45) {
          reject(new Error("在风之迷宫里转晕了，又绕回了原地..."));
          return;
        }
        resolve("顺着风的方向穿过迷宫，眼前豁然开朗...");
      }, 1800);
    });
  }

  // ---------- 新增情节：安抚守护神兽（异步） ----------
  static sootheTempleGuardian() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve("你举起古铜钥匙，守卫认出了神庙的印记，恭敬地退到一旁...");
      }, 1500);
    });
  }
}

// ============================================================
//  用 async/await 串起整条寻宝流程
// ============================================================
async function findTreasureWithAsync() {
  _start = Date.now();
  const inventory = [];
  let courage = 100;

  console.log(`${C.gold}==============================================`);
  console.log(`${C.gold}   寻宝之旅 · async / await 版   开始！`);
  console.log(`${C.gold}==============================================${C.reset}`);
  log("你站在落满尘埃的图书馆门前，深吸一口气。");
  log(`初始状态：勇气 ${courage} 点，道具：无`);

  try {
    // 1) 图书馆：拿到第一个线索
    const clue = await TreasureMap.getInitialClue();
    log(clue, "ok");
    inventory.push("羊皮纸残片");
    log(`获得道具：羊皮纸残片  ->  背包 = [${inventory.join("、")}]`);

    // 2) 新增情节：用星辰罗盘校准方向
    log("你摊开羊皮纸，发现背面画着一圈星图 —— 需要借助星辰罗盘定位。");
    const direction = await TreasureMap.consultStarlightCompass(clue);
    log(`罗盘指针缓缓停下…… 方位锁定：${direction.name}`, "ok");
    log(`星象低语：「${direction.hint}」`);

    // 3) 新增情节：沙漠商队交易，换得关键道具
    log("你循着星象走进大漠，夜色里响起一串驼铃。");
    const deal = await TreasureMap.tradeWithDesertCaravan(direction);
    log(deal.line, "warn");
    if (courage >= deal.price * 10) {
      courage -= deal.price * 10; // 每 1 份 = 10 点勇气值
      inventory.push(deal.item);
      log(`交易达成！获得道具：${deal.item}  ->  背包 = [${inventory.join("、")}]`, "ok");
      log(`当前勇气值：${courage}`);
    } else {
      log("勇气不足，你只能把残片上的星图当作抵押……", "err");
    }

    // 4) 原情节：解码古老文字
    const location = await TreasureMap.decodeAncientScript(clue);
    log(location, "ok");

    // 5) 新增情节：风之迷宫（可能迷路，自动重试）
    log("神庙前的回廊被永不停息的风灌满，你走进了风之迷宫。");
    await withRetry(
      async () => {
        const r = await TreasureMap.solveWindMaze();
        log(r, "ok");
      },
      3,
      async (i) => log(`第 ${i} 次尝试失败，你退回来重新辨认风的走向……`, "warn")
    );

    // 6) 原情节：搜索神庙（有概率遇到守卫，用古铜钥匙化解）
    log("穿过迷宫，你终于站到了神庙大门前。");
    const box = await withRetry(
      async () => {
        const r = await TreasureMap.searchTemple(location);
        log(r, "ok");
        return r;
      },
      3,
      async () => {
        if (inventory.includes("古铜钥匙")) {
          const r = await TreasureMap.sootheTempleGuardian();
          log(r, "ok");
        } else {
          log("没有钥匙，你只能悄悄绕开守卫的视线……", "warn");
          courage -= 15;
        }
      }
    );

    // 7) 原情节：打开宝箱
    const treasure = await TreasureMap.openTreasureBox();
    log(treasure, "ok");

    // 8) 结局
    await sleep(400);
    console.log(`${C.gold}----------------------------------------------`);
    log(`寻宝完成！总耗时 ${((Date.now() - _start) / 1000).toFixed(2)}s`, "ok");
    log(`最终背包：[${inventory.join("、")}]`, "ok");
    log(`剩余勇气值：${courage}`, "ok");
    log("你抱着宝箱走出神庙，漫天星辰为你亮起。", "ok");
    console.log(`${C.gold}----------------------------------------------${C.reset}`);
  } catch (error) {
    console.error(`${C.red}[XX] 任务失败: ${error.message}${C.reset}`);
  }
}

findTreasureWithAsync();
