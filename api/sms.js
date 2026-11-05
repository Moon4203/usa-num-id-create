const axios = require('axios');

export default async function handler(req, res) {
  // Cache disable
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.setHeader('Access-Control-Allow-Origin', '*');

  const { token } = req.query;
  if (!token) {
    return res.status(400).json({ site: "Moon US Nums", error: "Missing token" });
  }

  // Timestamp (cache-buster) - PHP site isko zaroori samajhti hai
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
      // Raw text hi rakho, axios transform na kare
      transformResponse: [(data) => data],
      validateStatus: () => true,
    });

    let raw = response.data;
    if (typeof raw !== 'string') raw = JSON.stringify(raw);

    // JSON parse karo
    let data = null;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      // Kuch sites wrapper ke andar JSON bhejti hain
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

    // === CODE EXTRACT KARO (multiple fields check) ===
    let code = data.code || data.otp_code || (data.codes && data.codes[0]);

    // === CLEAN RESPONSE ===
    // Agar code "waiting" ya khali hai, to sirf status bhejo
    if (!code || code === "waiting" || code === "") {
      return res.status(200).json({
        site: "Moon US Nums",
        status: "waiting",
        message: "⏳ Waiting for OTP...",
        active: data.active === true,
      });
    }

    // Agar code aa gaya, to sirf code bhejo (competitor ka naam hide)
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
