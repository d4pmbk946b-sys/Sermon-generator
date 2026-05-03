export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { readings, sunday, tone, isCustom } = req.body;

  const toneDescriptions = {
    evangelical: "in the style of Tim Keller and John Stott: Christ-centred, expository, with clear application to everyday life",
    middle: "in the style of Sam Wells and Feasting on the Word: narrative, pastoral, theologically rich but accessible",
    anglocatholic: "in an Anglo-Catholic style: sacramental, liturgical, drawing on patristic and Catholic tradition"
  };

  const prompt = `You are an experienced Church of England preacher. Write a 4-5 minute homily (approximately 650-750 words) for ${sunday}, ${toneDescriptions[tone]}.

${isCustom ? 'The preacher has chosen these custom readings:' : 'The lectionary readings for this Sunday are:'}
${readings}

The homily should:
- Open with an engaging introduction
- Engage seriously with the biblical text
- Be theologically grounded and pastorally warm
- Close with a clear and memorable conclusion
- Be written in full, ready to preach from

Write only the homily text itself, with no titles, labels, or commentary.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1200,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    const sermon = data.content[0].text;
    res.status(200).json({ sermon });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate sermon' });
  }
}
