module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { readings, sunday, tone, isCustom, extraNotes } = req.body;

  const toneDescriptions = {
    evangelical: "in the style of Tim Keller and John Stott: Christ-centred, expository, with clear application to everyday life. Ground the sermon firmly in the text, draw out its gospel logic, and apply it directly and personally to the congregation.",
    middle: "in the style of Sam Wells and the Feasting on the Word commentary series: narrative, pastoral, and theologically rich but accessible. Use story and image, take the congregation on a journey through the text, and end with something that stays with them.",
    anglocatholic: "in an Anglo-Catholic style: sacramental, liturgical, and drawing on patristic and Catholic tradition. Connect the readings to the Church's liturgical life, the sacraments, and the great tradition of Christian spirituality."
  };

  const notesSection = extraNotes
    ? `\n\nAdditional context for this service provided by the preacher:\n${extraNotes}`
    : '';

  const prompt = `You are an experienced Church of England preacher preparing a Sunday homily. Write a 4-5 minute homily (approximately 650-750 words) for ${sunday}, ${toneDescriptions[tone]}.

${isCustom ? 'The preacher has chosen these custom readings:' : 'The lectionary readings for this Sunday are:'}
${readings}${notesSection}

The homily should:
- Open with an engaging introduction that draws the congregation in
- Engage seriously and imaginatively with the biblical text
- Be theologically grounded and pastorally warm
- ${extraNotes ? 'Weave in the additional context provided naturally, without it feeling forced' : 'Speak to the ordinary joys and struggles of Christian life'}
- Close with a clear, memorable, and hopeful conclusion
- Be written in full sentences, ready to preach from the page

Write only the homily text itself. Do not include a title, headings, labels, or any commentary outside the sermon.`;

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

    if (!data.content || !data.content[0]) {
      throw new Error('Unexpected API response');
    }

    res.status(200).json({ sermon: data.content[0].text });

  } catch (error) {
    console.error('Sermon generation error:', error);
    res.status(500).json({ error: 'Failed to generate sermon' });
  }
}
