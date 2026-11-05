const axios = require('axios');

export default async function handler(req, res) {
  // Cache disable
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Access-Control-Allow-Origin', '*');

  const { token } = req.query;
  if (!token) {
    return res.status(400).json({ site: "Moon US Nums", error: "Missing token" });
  }

  // Timestamp (cache-buster)
  const timestamp = Date.now();
  const target = `https://apinums.com/apinumsofficial/smsapi/poll.php?token=${token}&_=${timestamp}`;

  try {
    const response = await axios.get(target, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Linux; Android 16; Pixel 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Mobile Safari/537.36",
        "Accept": "application/json",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
        "Referer": `https://apinums.com/apinumsofficial/smsapi/getsms.php?token=${token}`,
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
        "X-Requested-With": "XMLHttpRequest",
      },
      timeout: 15000,
      transformResponse: [(data) => data],
      validateStatus: () => true,
    });

    let raw = response.data;
    if (typeof raw !== 'string') raw = JSON.stringify(raw);

    // JSON parse
    let data = null;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try { data = JSON.parse(jsonMatch[0]); } catch (e2) {}
      }
    }

    if (!data) {
      return res.status(200).json({
        site: "Moon US Nums",
        status: "waiting",
        debug: "Invalid upstream JSON",
        raw_preview: raw.substring(0, 200),
      });
    }

    // Code extract karo
    let code = data.code || data.otp_code || (data.codes && data.codes[0]);
    const isWaiting = !code || code === "waiting" || code === "";

    // ============ HTML FORMAT (agar ?format=html) ============
    if (req.query.format === 'html') {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');

      const displayContent = isWaiting
        ? `<div class="waiting">⏳ Waiting for OTP...</div>
           <div class="sub">Page will auto-refresh every 5 seconds</div>`
        : `<div class="label">Your OTP Code</div>
           <div class="code">${code}</div>
           <div class="sub">Auto-refreshing for new codes...</div>`;

      const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Moon US Nums - OTP</title>
  <meta http-equiv="refresh" content="5">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      color: white;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
    }
    .box {
      background: rgba(30, 41, 59, 0.9);
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 50px 70px;
      border-radius: 24px;
      text-align: center;
      box-shadow: 0 30px 60px -20px rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(20px);
      min-width: 320px;
    }
    .brand {
      font-size: 14px;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 30px;
      font-weight: 600;
    }
    .brand span { color: #22c55e; }
    .label {
      color: #64748b;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      margin-bottom: 15px;
    }
    .code {
      font-size: 54px;
      color: #22c55e;
      font-weight: 800;
      letter-spacing: 10px;
      margin: 15px 0;
      text-shadow: 0 0 30px rgba(34, 197, 94, 0.4);
      font-family: 'Courier New', monospace;
    }
    .waiting {
      color: #f59e0b;
      font-size: 24px;
      font-weight: 600;
      margin: 20px 0;
      animation: pulse 1.5s infinite;
    }
    .sub {
      color: #64748b;
      font-size: 12px;
      margin-top: 20px;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    .dot {
      display: inline-block;
      width: 8px;
      height: 8px;
      background: #22c55e;
      border-radius: 50%;
      margin-right: 8px;
      animation: pulse 1.5s infinite;
    }
  </style>
</head>
<body>
  <div class="box">
    <div class="brand"><span class="dot"></span>Moon <span>US Nums</span></div>
    ${displayContent}
  </div>
</body>
</html>`;
      return res.status(200).send(html);
    }

    // ============ JSON FORMAT (default) ============
    if (isWaiting) {
      return res.status(200).json({
        site: "Moon US Nums",
        status: "waiting",
        message: "⏳ Waiting for OTP...",
        active: data.active === true,
      });
    }

    return res.status(200).json({
      site: "Moon US Nums",
      status: "success",
      code: code,
    });

  } catch (error) {
    const errorMsg = error.response
      ? `Upstream Error: ${error.response.status}`
      : `Fetch Error: ${error.message}`;
    return res.status(500).json({
      site: "Moon US Nums",
      error: errorMsg,
    });
  }
}
