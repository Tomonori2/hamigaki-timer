const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({
    viewport: { width: 420, height: 860 }, deviceScaleFactor: 2,
    recordVideo: { dir: 'video/', size: { width: 840, height: 1720 } }
  });
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:8899/index.html');
  await p.evaluate(() => {
    const kids = [['あおき ひまり','rabbit'],['いのうえ はると','lion'],['さとう ゆい','bear'],
                  ['たなか そうた','lion'],['なかむら あおい','rabbit'],['やまだ みなと','bear']]
      .map((k,i)=>({ id:'k'+i, name:k[0], char:k[1] }));
    const now = new Date(), stamps = {};
    kids.forEach((k,i) => {
      stamps[k.id] = {};
      for (let d = 1; d < now.getDate(); d++) {
        if ((d + i*2) % 5 === 0) continue;
        const key = now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
        const day = { m:true };
        if ((d+i) % 2 === 0) day.n = true;
        if ((d+i) % 3 === 0) day.e = true;
        stamps[k.id][key] = day;
      }
      const tk = now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0')+'-'+String(now.getDate()).padStart(2,'0');
      if (i > 0) stamps[k.id][tk] = { m:true, n:true };
    });
    localStorage.setItem('hamigaki_class_v1', JSON.stringify({
      v:1, className:'ひまわりぐみ', children:kids, currentId:'k0', stamps, settings:{duration:60, sound:false}
    }));
  });
  await p.reload();
  await p.waitForTimeout(2000);

  // 1. 園児をえらぶ（キャラクターに合わせて色が変わる）
  await p.click('#kidStrip .kid-chip:nth-child(2)'); await p.waitForTimeout(1400);
  await p.click('#kidStrip .kid-chip:nth-child(3)'); await p.waitForTimeout(1400);
  await p.click('#kidStrip .kid-chip:nth-child(1)'); await p.waitForTimeout(1600);

  // 2. 「おひる」を選んでスタート
  await p.click('#slotSelect button:nth-child(2)'); await p.waitForTimeout(900);
  await p.click('#btn'); await p.waitForTimeout(3500);
  // タイマーを早送り（みがく場所ガイドが切り替わる様子を見せる）
  await p.evaluate(() => { remaining = 32; }); await p.waitForTimeout(2600);
  await p.evaluate(() => { remaining = 16; }); await p.waitForTimeout(2600);
  await p.evaluate(() => { remaining = 3; });  await p.waitForTimeout(4500);   // 完走→花火

  // 3. クラス一覧でスタンプがついていることを確認
  await p.click('.tab[data-view="class"]'); await p.waitForTimeout(2600);
  await p.click('#rosterList .kid-row:nth-child(4) .slot-toggle:nth-child(3)'); await p.waitForTimeout(1500);
  await p.click('#rosterList .kid-row:nth-child(6) .slot-toggle:nth-child(2)'); await p.waitForTimeout(1800);

  // 4. 月間の記録
  await p.click('#segMonth'); await p.waitForTimeout(3000);

  await ctx.close();
  await b.close();
  console.log('recorded');
})();
