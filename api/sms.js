const axios = require('axios');

export default async function handler(req, res) {
  const { token } = req.query;

  if (!token) {
    return res.status(400).send("Missing token parameter");
  }

  const target = `https://apinums.com/apinumsofficial/smsapi/getsms.php?token=${token}`;

  try {
    const response = await axios.get(target, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json, text/plain, */*",
        "Referer": "https://apinums.com/",
        "Origin": "https://apinums.com",
      },
      timeout: 10000, // 10 second timeout
    });

    // Jo bhi content aaye (JSON ya text), waisa hi bhej dein
    res.status(response.status).send(response.data);
  } catch (error) {
    // Asli error message bhejein taake pata chale problem kya hai
    const errorMsg = error.response
      ? `Upstream Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`
      : `Fetch Error: ${error.message}`;
    res.status(500).send(errorMsg);
  }
}
