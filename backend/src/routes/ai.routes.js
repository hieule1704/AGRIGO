const router = require('express').Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { requireAuth, requireRole } = require('../middleware/auth');

// Khoi tao Gemini API neu co key
const apiKey = process.env.GEMINI_API_KEY;
let genAI = null;
if (apiKey && apiKey.startsWith('AIza')) {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
  } catch (e) {
    console.warn('⚠️ Lỗi khởi tạo Gemini API:', e.message);
  }
}

// Danh sach quan/huyen An Giang
const AN_GIANG_DISTRICTS = [
  'Long Xuyên', 'Châu Đốc', 'Châu Phú', 'Chợ Mới',
  'Thoại Sơn', 'Tri Tôn', 'Phú Tân', 'Tân Châu',
  'Tịnh Biên', 'Châu Thành', 'An Phú'
];

// -------------------------------------------------------------
// 1. POST /api/ai/search-assistant
// Tro ly tim may bang ngon ngu tu nhien
// -------------------------------------------------------------
router.post('/search-assistant', async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: 'Vui lòng nhập câu hỏi hoặc yêu cầu tìm kiếm.' });

  let aiResult = null;

  // Thu goi Gemini API
  if (genAI) {
    try {
      const model = genAI.getGenerativeAIModel({ model: 'gemini-1.5-flash' });
      const prompt = `Bạn là trợ lý AI tìm kiếm máy nông nghiệp AgriGo tại An Giang.
Hãy phân tích yêu cầu tìm kiếm của người dùng: "${query}"

Hãy trả về CHÍNH XÁC một đối tượng JSON (không thêm bớt markdown hay ký tự khác) dạng:
{
  "district": "Tên huyện trong [Long Xuyên, Châu Đốc, Châu Phú, Chợ Mới, Thoại Sơn, Tri Tôn, Phú Tân, Tân Châu, Tịnh Biên, Châu Thành, An Phú] hoặc null",
  "category_keyword": "từ khóa loại máy (gặt, cày, sạ, phun, kéo) hoặc null",
  "summary": "tóm tắt ngắn gọn nhu cầu người dùng trong 1 câu"
}`;

      const response = await model.generateContent(prompt);
      const text = response.response.text().trim();
      const cleanJson = text.replace(/```json|```/g, '').trim();
      aiResult = JSON.parse(cleanJson);
    } catch (err) {
      console.warn('⚠️ Gemini AI Search failed/over-token, fallback to rule-based parser:', err.message);
    }
  }

  // FALLBACK MECHANISM (Neus AI qua token/loi/khong co key)
  if (!aiResult) {
    const qLower = query.toLowerCase();
    let districtMatch = AN_GIANG_DISTRICTS.find((d) => qLower.includes(d.toLowerCase())) || null;
    let catKeyword = null;
    if (qLower.includes('gặt') || qLower.includes('cắt')) catKeyword = 'gặt';
    else if (qLower.includes('cày') || qLower.includes('xới')) catKeyword = 'cày';
    else if (qLower.includes('sạ') || qLower.includes('gieo')) catKeyword = 'sạ';
    else if (qLower.includes('phun') || qLower.includes('xịt')) catKeyword = 'phun';
    else if (qLower.includes('tải') || qLower.includes('kéo')) catKeyword = 'kéo';

    aiResult = {
      district: districtMatch,
      category_keyword: catKeyword,
      summary: `Đã tự động phân tích nhu cầu tìm kiếm cho "${query}".`,
      is_fallback: true,
    };
  }

  res.json({ ok: true, result: aiResult });
});

// -------------------------------------------------------------
// 2. POST /api/ai/generate-description
// Tu sinh mo ta may cho chu may
// -------------------------------------------------------------
router.post('/generate-description', requireAuth, requireRole('owner'), async (req, res) => {
  const { name, brand, year_made, district, category_name } = req.body;
  if (!name) return res.status(400).json({ error: 'Vui lòng nhập tên máy.' });

  let description = null;

  if (genAI) {
    try {
      const model = genAI.getGenerativeAIModel({ model: 'gemini-1.5-flash' });
      const prompt = `Hãy viết một đoạn mô tả ngắn (3-4 câu) hấp dẫn, chuyên nghiệp bằng tiếng Việt để đăng cho thuê máy nông nghiệp trên ứng dụng AgriGo An Giang.
Thông tin máy:
- Tên máy: ${name}
- Loại máy: ${category_name || 'Máy nông nghiệp'}
- Thương hiệu: ${brand || 'Chất lượng cao'}
- Năm sản xuất: ${year_made || 'Mới'}
- Khu vực phục vụ: ${district || 'An Giang'}

Yêu cầu: Văn phong thân thiện với bà con nông dân, nhấn mạnh độ bền, công suất tốt, giao máy đúng giờ. Chỉ trả về nội dung đoạn mô tả.`;

      const response = await model.generateContent(prompt);
      description = response.response.text().trim();
    } catch (err) {
      console.warn('⚠️ Gemini AI GenDescription failed, fallback to template:', err.message);
    }
  }

  // FALLBACK MECHANISM
  if (!description) {
    description = `🚜 Thiết bị ${name} ${brand ? 'hãng ' + brand : ''} ${year_made ? 'đời ' + year_made : ''} hoạt động bền bỉ, công suất cao, tiết kiệm nhiên liệu. Thích hợp cho các cánh đồng khu vực ${district || 'An Giang'}. Máy đã qua kiểm tra kỹ thuật kỹ lưỡng, đảm bảo vận hành ổn định, sẵn sàng bàn giao đúng hẹn cho bà con nông dân.`;
  }

  res.json({ ok: true, description });
});

// -------------------------------------------------------------
// 3. POST /api/ai/summarize-reviews
// Tom tat danh gia va insight cho Admin
// -------------------------------------------------------------
router.post('/summarize-reviews', requireAuth, requireRole('admin'), async (req, res) => {
  const { machine_name, reviews } = req.body;
  if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
    return res.json({
      summary: `Máy ${machine_name || ''} chưa có đánh giá nào từ nông dân.`,
      insight: 'Chưa đủ dữ liệu để tổng hợp.',
    });
  }

  let result = null;

  if (genAI) {
    try {
      const model = genAI.getGenerativeAIModel({ model: 'gemini-1.5-flash' });
      const reviewText = reviews.map((r) => `- [${r.rating}/5 sao] ${r.farmer_name || 'Nông dân'}: ${r.comment}`).join('\n');
      const prompt = `Phân tích và tóm tắt các đánh giá sau đây của nông dân về máy "${machine_name}":
${reviewText}

Trả về định dạng JSON (chỉ JSON):
{
  "summary": "Đoạn tóm tắt ngắn 2 câu tổng quan đánh giá",
  "pros": ["Điểm mạnh 1", "Điểm mạnh 2"],
  "cons": ["Điểm cần cải thiện (nếu có)"],
  "admin_recommendation": "Khuyến nghị cho Admin (Ví dụ: Giữ trạng thái duyệt, Nhắc nhở chủ máy, hoặc Khóa nếu quá tệ)"
}`;

      const response = await model.generateContent(prompt);
      const text = response.response.text().trim();
      const cleanJson = text.replace(/```json|```/g, '').trim();
      result = JSON.parse(cleanJson);
    } catch (err) {
      console.warn('⚠️ Gemini AI Review Summary failed, fallback to rule analysis:', err.message);
    }
  }

  // FALLBACK MECHANISM
  if (!result) {
    const avgRating = (reviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0) / reviews.length).toFixed(1);
    result = {
      summary: `Máy ${machine_name || ''} nhận được ${reviews.length} đánh giá với điểm trung bình ${avgRating}/5 sao. Nông dân phản hồi tích cực về hiệu suất hoạt động trên đồng ruộng.`,
      pros: ['Được đánh giá tốt về khả năng vận hành', 'Chủ máy hỗ trợ nhiệt tình'],
      cons: avgRating < 4 ? ['Cần cải thiện đúng giờ khi bàn giao máy'] : [],
      admin_recommendation: avgRating >= 4 ? 'Máy hoạt động tốt, duy trì duyệt bài.' : 'Cần theo dõi thêm thái độ phục vụ.',
      is_fallback: true,
    };
  }

  res.json({ ok: true, result });
});

// -------------------------------------------------------------
// 4. POST /api/ai/moderate-content
// Soat va kiem tra noi dung dang may cho Admin
// -------------------------------------------------------------
router.post('/moderate-content', requireAuth, requireRole('admin'), async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Thiếu thông tin máy để kiểm duyệt.' });

  let result = null;

  if (genAI) {
    try {
      const model = genAI.getGenerativeAIModel({ model: 'gemini-1.5-flash' });
      const prompt = `Kiểm tra xem thông tin đăng máy nông nghiệp sau đây có vi phạm tiêu chuẩn (spam, ngôn từ tục tĩu, lừa đảo) hay không:
Tên máy: ${name}
Mô tả: ${description || ''}

Trả về định dạng JSON (chỉ JSON):
{
  "safe": true/false,
  "score": số từ 0-100 (100 là an toàn nhất),
  "flags": ["lỗi vi phạm nếu có"],
  "note": "Ghi chú ngắn cho Admin"
}`;

      const response = await model.generateContent(prompt);
      const text = response.response.text().trim();
      const cleanJson = text.replace(/```json|```/g, '').trim();
      result = JSON.parse(cleanJson);
    } catch (err) {
      console.warn('⚠️ Gemini AI Moderate failed, fallback to rule scanner:', err.message);
    }
  }

  // FALLBACK MECHANISM
  if (!result) {
    const textToCheck = `${name} ${description}`.toLowerCase();
    const badWords = ['lừa đảo', 'cờ bạc', 'sex', 'độ xe', 'hack'];
    const hasBad = badWords.some((w) => textToCheck.includes(w));

    result = {
      safe: !hasBad,
      score: hasBad ? 30 : 95,
      flags: hasBad ? ['Phát hiện từ khóa nghi vấn'] : [],
      note: hasBad ? 'Bài đăng có từ khóa cần xem xét lại.' : 'Nội dung kiểm tra tự động hợp lệ, an toàn cho duyệt bài.',
      is_fallback: true,
    };
  }

  res.json({ ok: true, result });
});

module.exports = router;
