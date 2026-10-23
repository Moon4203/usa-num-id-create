export default async function handler(req, res) {
  const { token } = req.query;

  if (!token) {
    return res.status(400).send("Missing token parameter");
  }

  const target = `https://apinums.com/apinumsofficial/smsapi/getsms.php?token=${token}`;

  try {
    const response = await fetch(target, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://apinums.com/",
        "Origin": "https://apinums.com",
      },
    });

    const data = await response.text();
    res.status(response.status).send(data);
  } catch (error) {
    res.status(500).send("API Error: " + error.message);
  }
}
