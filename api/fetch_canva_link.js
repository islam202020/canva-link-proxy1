// هذا الكود ليس لبلوجر، بل لسيرفر خارجي (الـ Proxy)
const axios = require('axios'); // لجلب الصفحات من الإنترنت
const cheerio = require('cheerio'); // لتحليل محتوى الصفحات HTML

module.exports = async (req, res) => {
  // عنوان صفحة Biozium اللي عايزين نجيب منها اللينك
  const targetUrl = 'https://biozium.com/public/bio-links/eric-paul/';

  // السماح لأي موقع بالوصول للـ Proxy (مهم عشان بلوجر تقدر تكلمه)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // لو الطلب جاي عشان يشوف إذا كان مسموح بالوصول ولا لأ (preflight request)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // 1. الوسيط بيطلب صفحة Biozium
    const { data } = await axios.get(targetUrl);

    // 2. الوسيط بيحلل محتوى الصفحة عشان يلاقي اللينك
    const $ = cheerio.load(data);
    let canvaLink = null;

    // ******** هذا الجزء يحتاج مراجعة دقيقة **********
    // أنت محتاج تفتح صفحة Biozium دي بنفسك: https://biozium.com/public/bio-links/eric-paul/
    // وتشوف رابط دعوة Canva شكله إيه بالظبط في مصدر الصفحة (Inspect Element).
    // غالباً هيكون رابط (<a>) وممكن يكون ليه كلاس معين أو نص معين.
    // هذا الكود بيبحث عن أي رابط (a) يحتوي على 'canva.com/join'
    // إذا كان الرابط ده مش موجود بالشكل ده، هنحتاج نعدل الكود ده.
    $('a').each((i, element) => {
      const href = $(element).attr('href');
      if (href && href.includes('canva.com/join')) {
        canvaLink = href;
        return false; // يوقف البحث لما يلاقي أول رابط
      }
    });

    if (canvaLink) {
      // 3. الوسيط بيرجع اللينك لصفحة بلوجر
      res.status(200).json({ canvaLink: canvaLink });
    } else {
      res.status(404).json({ error: 'Canva link not found on the page.' });
    }

  } catch (error) {
    console.error('Error in proxy:', error);
    res.status(500).json({ error: 'Failed to process request.' });
  }
};
