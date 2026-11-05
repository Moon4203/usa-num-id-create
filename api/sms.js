const axios = require('axios');

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Access-Control-Allow-Origin', '*');

  const { token } = req.query;
  if (!token) {
    return res.status(400).json({ site: "Moon US Nums", error: "Missing token" });
  }

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

    let code = data.code || data.otp_code || (data.codes && data.codes[0]);
    const isWaiting = !code || code === "waiting" || code === "";

    // ============ HTML FORMAT ============
    if (req.query.format === 'html') {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');

      const displayContent = isWaiting
        ? `<div class="status-badge waiting-badge">
             <span class="dot-pulse"></span>
             Waiting for OTP
           </div>
           <div class="otp-placeholder">--- ---</div>
           <div class="info-text">Your code will appear here automatically</div>
           <div class="progress-bar"><div class="progress-fill"></div></div>`
        : `<div class="status-badge success-badge">
             <span class="dot-check">✓</span>
             Code Received
           </div>
           <div class="otp-code">${code}</div>
           <div class="info-text">Copy this code and use it quickly</div>
           <div class="progress-bar"><div class="progress-fill success"></div></div>`;

      const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Moon US Nums - OTP</title>
  <meta http-equiv="refresh" content="5">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: radial-gradient(circle at top, #1e293b 0%, #0f172a 60%, #020617 100%);
      color: white;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
      position: relative;
      overflow: hidden;
    }

    body::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle at 30% 40%, rgba(34, 197, 94, 0.08) 0%, transparent 50%),
                  radial-gradient(circle at 70% 60%, rgba(59, 130, 246, 0.06) 0%, transparent 50%);
      animation: float 20s ease-in-out infinite;
      pointer-events: none;
    }

    @keyframes float {
      0%, 100% { transform: translate(0, 0) rotate(0deg); }
      50% { transform: translate(30px, -30px) rotate(5deg); }
    }

    .box {
      background: rgba(30, 41, 59, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 44px 36px;
      border-radius: 28px;
      text-align: center;
      box-shadow: 
        0 30px 60px -20px rgba(0, 0, 0, 0.6),
        0 0 0 1px rgba(255, 255, 255, 0.05) inset;
      backdrop-filter: blur(24px);
      max-width: 420px;
      width: 100%;
      position: relative;
      z-index: 1;
      animation: slideUp 0.6s ease-out;
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .brand-logo {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 32px;
      padding: 10px 20px;
      background: linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(59, 130, 246, 0.15));
      border: 1px solid rgba(34, 197, 94, 0.3);
      border-radius: 100px;
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 2px;
    }

    .brand-logo .moon-icon {
      font-size: 18px;
      filter: drop-shadow(0 0 8px rgba(34, 197, 94, 0.6));
      animation: glow 2s ease-in-out infinite;
    }

    @keyframes glow {
      0%, 100% { filter: drop-shadow(0 0 8px rgba(34, 197, 94, 0.6)); }
      50% { filter: drop-shadow(0 0 16px rgba(34, 197, 94, 1)); }
    }

    .brand-logo .brand-name {
      background: linear-gradient(135deg, #22c55e, #3b82f6);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      font-weight: 800;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 8px 18px;
      border-radius: 100px;
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 26px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .waiting-badge {
      background: rgba(245, 158, 11, 0.12);
      color: #f59e0b;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }

    .success-badge {
      background: rgba(34, 197, 94, 0.12);
      color: #22c55e;
      border: 1px solid rgba(34, 197, 94, 0.3);
    }

    .dot-pulse {
      display: inline-block;
      width: 8px;
      height: 8px;
      background: #f59e0b;
      border-radius: 50%;
      box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.7);
      animation: pulse 1.5s infinite;
    }

    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.7); }
      70% { box-shadow: 0 0 0 10px rgba(245, 158, 11, 0); }
      100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
    }

    .dot-check {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 18px;
      height: 18px;
      background: #22c55e;
      color: #0f172a;
      border-radius: 50%;
      font-size: 12px;
      font-weight: 800;
    }

    .otp-code {
      font-size: 62px;
      font-weight: 900;
      color: #22c55e;
      letter-spacing: 14px;
      margin: 20px 0 10px 0;
      text-shadow: 
        0 0 30px rgba(34, 197, 94, 0.6),
        0 0 60px rgba(34, 197, 94, 0.3);
      font-family: 'Courier New', monospace;
      animation: popIn 0.5s ease-out;
      padding-left: 14px;
    }

    @keyframes popIn {
      0% { transform: scale(0.5); opacity: 0; }
      60% { transform: scale(1.08); }
      100% { transform: scale(1); opacity: 1; }
    }

    .otp-placeholder {
      font-size: 48px;
      font-weight: 700;
      color: rgba(148, 163, 184, 0.4);
      letter-spacing: 8px;
      margin: 20px 0 10px 0;
      font-family: 'Courier New', monospace;
    }

    .info-text {
      color: #94a3b8;
      font-size: 13px;
      margin-bottom: 22px;
      line-height: 1.5;
    }

    .progress-bar {
      height: 4px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 100px;
      overflow: hidden;
      margin-bottom: 28px;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #f59e0b, #f97316);
      border-radius: 100px;
      width: 30%;
      animation: loading 5s ease-in-out infinite;
    }

    .progress-fill.success {
      background: linear-gradient(90deg, #22c55e, #16a34a);
      width: 100%;
      animation: none;
    }

    @keyframes loading {
      0% { width: 5%; }
      50% { width: 85%; }
      100% { width: 5%; }
    }

    .divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
      margin: 0 0 24px 0;
    }

    .site-link {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 14px 28px;
      background: linear-gradient(135deg, #3b82f6, #6366f1);
      color: white;
      text-decoration: none;
      border-radius: 14px;
      font-weight: 700;
      font-size: 14px;
      letter-spacing: 0.3px;
      transition: all 0.3s ease;
      box-shadow: 0 10px 30px -10px rgba(59, 130, 246, 0.6);
      width: 100%;
    }

    .site-link:hover {
      transform: translateY(-2px);
      box-shadow: 0 15px 40px -10px rgba(59, 130, 246, 0.8);
      background: linear-gradient(135deg, #2563eb, #4f46e5);
    }

    .site-link:active {
      transform: translateY(0);
    }

    .site-link .arrow {
      transition: transform 0.3s ease;
    }

    .site-link:hover .arrow {
      transform: translateX(4px);
    }

    .footer-text {
      color: #475569;
      font-size: 11px;
      margin-top: 20px;
      letter-spacing: 0.5px;
    }

    @media (max-width: 480px) {
      .box { padding: 36px 24px; border-radius: 22px; }
      .otp-code { font-size: 48px; letter-spacing: 10px; }
      .otp-placeholder { font-size: 36px; letter-spacing: 6px; }
      .brand-logo { font-size: 11px; padding: 8px 16px; }
    }
  </style>
</head>
<body>
  <div class="box">
    <div class="brand-logo">
      <span class="moon-icon">🌙</span>
      <span class="brand-name">Moon US Nums</span>
    </div>

    ${displayContent}

    <div class="divider"></div>

    <a href="https://moon-us-nums.free.nf/" target="_blank" class="site-link">
      <span>🌐</span>
      <span>Visit Our Website</span>
      <span class="arrow">→</span>
    </a>

    <div class="footer-text">
      Powered by Moon US Nums · Auto-refreshing
    </div>
  </div>
</body>
</html>`;
      return res.status(200).send(html);
    }

    // ============ JSON FORMAT ============
    if (isWaiting) {
      return res.status(200).json({
        site: "Moon US Nums",
        website: "https://moon-us-nums.free.nf/",
        status: "waiting",
        message: "⏳ Waiting for OTP...",
        active: data.active === true,
      });
    }

    return res.status(200).json({
      site: "Moon US Nums",
      website: "https://moon-us-nums.free.nf/",
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
