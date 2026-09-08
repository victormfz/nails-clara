// Verificação no Chrome instalado, sem dependências adicionais.
// Execute depois de npm run build: node scripts/verify-ui.cjs
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { spawn } = require('node:child_process');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'node_modules', '.cache', 'clara-ui');
fs.mkdirSync(output, { recursive: true });
const chromePath = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.json': 'application/json' };
const server = http.createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const build = path.join(root, 'build');
  const file = path.resolve(build, `.${pathname === '/' ? '/index.html' : pathname}`);
  if (!file.startsWith(build + path.sep) || !fs.existsSync(file)) { res.writeHead(404); res.end(); return; }
  res.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const siteUrl = `http://127.0.0.1:${server.address().port}`;
  const browser = spawn(chromePath, ['--headless=new', '--no-first-run', '--no-default-browser-check', '--disable-background-networking', '--remote-debugging-port=0', `--user-data-dir=${path.join(output, `profile-${Date.now()}`)}`, 'about:blank'], { windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'] });
  let socket;
  let failure;
  try {
    const browserUrl = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Chrome não iniciou em 20 segundos.')), 20000);
      browser.once('error', error => { clearTimeout(timeout); reject(error); });
      browser.stderr.on('data', chunk => {
        const match = chunk.toString().match(/DevTools listening on (ws:\/\/\S+)/);
        if (match) { clearTimeout(timeout); resolve(match[1]); }
      });
    });
    socket = new WebSocket(browserUrl);
    await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
    let nextId = 0;
    const pending = new Map();
    const errors = [];
    socket.onmessage = event => {
      const message = JSON.parse(event.data);
      if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.text);
      if (message.id && pending.has(message.id)) {
        const { resolve, reject, timeout } = pending.get(message.id);
        clearTimeout(timeout);
        pending.delete(message.id);
        message.error ? reject(new Error(message.error.message)) : resolve(message.result);
      }
    };
    const send = (method, params = {}, sessionId) => new Promise((resolve, reject) => {
      const id = ++nextId;
      const timeout = setTimeout(() => { pending.delete(id); reject(new Error(`Timeout: ${method}`)); }, 15000);
      pending.set(id, { resolve, reject, timeout });
      socket.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
    });
    const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
    const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
    const cdp = (method, params) => send(method, params, sessionId);
    const evaluate = async expression => {
      const result = await cdp('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
      if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
      return result.result.value;
    };
    const until = async expression => {
      for (let i = 0; i < 60; i++) { if (await evaluate(expression)) return; await delay(100); }
      throw new Error(`Condição não atendida: ${expression}`);
    };
    const screenshot = async name => {
      const { data } = await cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
      fs.writeFileSync(path.join(output, `${name}.png`), Buffer.from(data, 'base64'));
    };
    await cdp('Page.enable');
    await cdp('Runtime.enable');
    await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
    await cdp('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
    await cdp('Page.navigate', { url: siteUrl });
    await until('document.querySelectorAll(".work-card").length === 6');
    await evaluate('Promise.race([document.fonts.ready, new Promise(resolve => setTimeout(resolve, 5000))]).then(() => true)');
    await until('Array.from(document.images).filter(image => image.loading !== "lazy").every(image => image.complete && image.naturalWidth > 0)');
    assert.equal(await evaluate('document.documentElement.lang'), 'pt-BR');
    assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true, 'Sem overflow no desktop');
    assert.equal(await evaluate('Array.from(document.links).filter(link => link.hostname === "wa.me").every(link => link.href.includes("5500000000000?text="))'), true, 'WhatsApp centralizado');
    await screenshot('desktop');
    await evaluate('document.querySelector("#portfolio").scrollIntoView()');
    await until('Array.from(document.querySelectorAll(".work-image img")).slice(0,3).every(image => image.complete && image.naturalWidth > 0)');
    await screenshot('portfolio-desktop');
    await evaluate('document.querySelector(".carousel-controls > button:last-child").click()');
    await until('document.querySelector(".portfolio-track").scrollLeft > 100');
    assert.equal(await evaluate('document.querySelector(".carousel-controls > .previous").disabled'), false);
    await evaluate('document.querySelector(".carousel-controls > .previous").click()');
    await until('document.querySelector(".portfolio-track").scrollLeft < 5');
    await evaluate('document.querySelector(".work-image").focus(); document.querySelector(".work-image").click()');
    await until('document.querySelector("dialog").open');
    assert.equal(await evaluate('document.body.style.overflow'), 'hidden');
    await cdp('Input.dispatchKeyEvent', { type: 'keyDown', key: 'ArrowRight', code: 'ArrowRight', windowsVirtualKeyCode: 39 });
    await until('document.querySelector(".lightbox-caption h3").textContent === "Delicada e marcante"');
    await cdp('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
    await until('!document.querySelector("dialog").open');
    await until('document.body.style.overflow === ""');
    assert.equal(await evaluate('document.activeElement.classList.contains("work-image")'), true, 'Foco retorna para a foto');
    await evaluate('document.querySelector(".faq-list summary").click()');
    assert.equal(await evaluate('document.querySelector(".faq-list details").open'), true);
    for (const width of [768, 390, 320]) {
      await cdp('Emulation.setDeviceMetricsOverride', { width, height: 844, deviceScaleFactor: 1, mobile: false });
      await delay(150);
      assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true, `Sem overflow em ${width}px`);
    }
    await cdp('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
    await evaluate('window.scrollTo(0,0)');
    await screenshot('mobile');
    await evaluate('document.querySelector(".menu-toggle").click()');
    assert.equal(await evaluate('document.querySelector(".menu-toggle").getAttribute("aria-expanded")'), 'true');
    await evaluate('document.querySelectorAll(".navigation a")[1].click()');
    assert.equal(await evaluate('document.querySelector(".menu-toggle").getAttribute("aria-expanded")'), 'false');
    await evaluate('document.querySelector("#portfolio").scrollIntoView()');
    await screenshot('portfolio-mobile');
    const swipe = await evaluate('(() => { const rect = document.querySelector(".work-image").getBoundingClientRect(); return { x: Math.min(rect.right - 25, innerWidth - 40), y: Math.min(rect.top + 160, innerHeight - 100) }; })()');
    await cdp('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: swipe.x, y: swipe.y }] });
    for (let i = 1; i <= 6; i++) {
      await cdp('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: swipe.x - i * 35, y: swipe.y }] });
      await delay(30);
    }
    await cdp('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await until('document.querySelector(".portfolio-track").scrollLeft > 100');
    await delay(250);
    for (let i = 0; i < 6; i++) { await evaluate('document.querySelector(".carousel-controls > button:last-child").click()'); await delay(100); }
    await until('document.querySelector(".carousel-controls > button:last-child").disabled');
    assert.equal(await evaluate('document.querySelector(".carousel-count").textContent'), '06 / 06');
    await evaluate('document.querySelectorAll(".work-image")[5].click()');
    await until('document.querySelector("dialog").open');
    await evaluate('document.querySelector(".lightbox-caption > button:last-child").click()');
    await until('document.querySelector(".lightbox-caption h3").textContent === "Um toque de magia"');
    await evaluate('document.querySelector(".lightbox-close").click()');
    await until('!document.querySelector("dialog").open');
    await cdp('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
    await evaluate('window.scrollTo(0,0)');
    await delay(150);
    const dimensions = await cdp('Page.getLayoutMetrics');
    const fullpage = await cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width: 1440, height: dimensions.cssContentSize.height, scale: 1 } });
    fs.writeFileSync(path.join(output, 'desktop-full.png'), Buffer.from(fullpage.data, 'base64'));
    assert.deepEqual(errors, [], 'Sem exceções JavaScript');
    console.log('OK: desktop, tablet e celular sem overflow; 6 fotos; carrossel; deslize por toque; ampliação; teclado; foco; FAQ; menu; WhatsApp.');
    console.log(`Capturas: ${output}`);
    await send('Browser.close');
  } catch (error) {
    failure = error;
  } finally {
    if (socket) socket.close();
    browser.kill();
    server.close();
  }
  if (failure) throw failure;
})().catch(error => { console.error(error); process.exitCode = 1; });
