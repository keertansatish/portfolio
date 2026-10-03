const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

async function test() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const tmpDir = path.join(os.tmpdir(), 'chrome_cdp_' + Date.now());
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--user-data-dir=' + tmpDir,
    '--remote-debugging-port=9222',
    '--window-size=1440,920',
    '--no-first-run',
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  http.get('http://localhost:9222/json', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', async () => {
      try {
        const tabs = JSON.parse(data);
        const tab = tabs.find(t => t.type === 'page') || tabs[0];
        const ws = new globalThis.WebSocket(tab.webSocketDebuggerUrl);
        ws.onopen = () => {
          ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
          ws.send(JSON.stringify({ id: 2, method: 'Page.enable' }));
          ws.send(JSON.stringify({ id: 3, method: 'Emulation.setDeviceMetricsOverride', params: {
            width: 1440, height: 920, deviceScaleFactor: 1, mobile: false
          }}));
          ws.send(JSON.stringify({ id: 4, method: 'Page.navigate', params: { url: 'http://localhost:8085/' } }));
        };

        ws.onmessage = (msg) => {
          const ev = JSON.parse(msg.data);
          if (ev.id === 20) {
            const buffer = Buffer.from(ev.result.data, 'base64');
            fs.writeFileSync('legs_fixed_screenshot.png', buffer);
            console.log('Saved legs_fixed_screenshot.png');
            ws.close();
            chrome.kill();
            process.exit(0);
          }
        };

        // Wait 4.5 seconds for walk to complete and settle
        setTimeout(() => {
          ws.send(JSON.stringify({
            id: 20,
            method: 'Page.captureScreenshot',
            params: { format: 'png' }
          }));
        }, 4500);

      } catch (e) {
        console.error(e);
        chrome.kill();
      }
    });
  });
}
test();
