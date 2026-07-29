export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { narrativeInput, templateId, templateName, templateFields, customApiKey } = body;

    if (!narrativeInput || !templateFields) {
      return NextResponse.json({ error: 'Olay anlatımı ve şablon alanları zorunludur.' }, { status: 400 });
    }
    const apiKey = customApiKey || process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey.trim() === '') {
      return NextResponse.json({
        error: 'Gemini API Anahtarı (GEMINI_API_KEY) bulunamadı.',
        missingKey: true,
        message: 'Lütfen Google AI Studio (aistudio.google.com) üzerinden bir API anahtarı alıp .env dosyanıza GEMINI_API_KEY=AIzaSy... şeklinde ekleyin veya sayfadaki API Anahtarı giriş kutusuna yapıştırın.'
      }, { status: 400 });
    }

    // Build fields summary for Gemini
    const fieldsDescription = templateFields.map((f: any) => 
      `"${f.id}": (${f.label} - Tür: ${f.type})`
    ).join(",\n  ");

    const systemPrompt = `Sen Los Angeles Polis Departmanı (LAC) için çalışan üst düzey, profesyonel bir Yapay Zeka Rapor ve Tutanak Asistanısın (L.A.R.S.).
Görevin: Memur tarafından serbest dille veya eksik kelimelerle anlatılan olay özetini inceleyerek, seçilen "${templateName}" (${templateId}) şablonunun alanlarını yasal, resmi ve kusursuz bir polis diliyle otomatik olarak doldurmaktır.

Aşağıdaki JSON anahtarlarını (keys) eksiksiz olarak doldurarak SADECE geçerli bir JSON nesnesi (object) döndür:
{
  ${fieldsDescription}
}

Kurallar ve Önemli Talimatlar:
1. Tarih (date) alanları için YYYY-MM-DD formatını veya bugünün tarihini kullan. Saat (time) alanları için HH:MM formatını kullan.
2. Memurun anlattığı olayda geçen kişi isimlerini, plakaları, adresleri, suç maddelerini (Penal Code / Vehicle Code) ve silah/delil bilgilerini ilgili alanlara tam olarak yerleştir.
3. "narrative", "incident_narrative", "arrest_narrative" veya "case_summary" gibi uzun anlatım / açıklama alanlarına memurun anlattığı olayı çok profesyonel, kronolojik, resmi polis tutanağı üslubuyla (örn: "Belirtilen tarih ve saatte devriye görevimiz esnasında...", "Şüpheli şahıs kanuna aykırı olarak...", "Hakları okunarak muhafaza altına alınmıştır.") genişleterek ve düzenleyerek yaz.
4. SADECE JSON döndür. Başında veya sonunda markdown backtick (\`\`\`json ...) veya ek açıklama metni BULUNMASIN. Sadece saf JSON string döndür.`;

    const userPrompt = `Memurun Olay Anlatımı:\n"${narrativeInput}"\n\nLütfen yukarıdaki anlatıma dayanarak şablon alanlarını JSON olarak doldur:`;

    // Try multiple model names in order until one works
    const modelsToTry = [
      'gemini-2.0-flash',
      'gemini-flash-latest',
      'gemini-2.5-flash',
    ];

    let response: Response | null = null;
    for (const modelName of modelsToTry) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`;
      const attempt = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': apiKey
        },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: systemPrompt + "\n\n" + userPrompt }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 3000, responseMimeType: "application/json" }
        })
      });
      // Stop if it worked OR if it's a non-404 error (like 429 quota)
      if (attempt.ok || attempt.status !== 404) {
        response = attempt;
        break;
      }
    }

    if (!response) {
      return NextResponse.json({ error: 'Uygun model bulunamadı. API anahtarınızı kontrol edin.' }, { status: 500 });
    }

    if (!response.ok) {
      const errData = await response.json().catch(() => ({})) as any;
      const status = response.status;
      if (status === 429) {
        return NextResponse.json({
          error: '⚠️ API kotası doldu veya dakikada çok fazla istek gönderildi. Birkaç saniye bekleyip tekrar deneyin.'
        }, { status: 429 });
      }
      console.error("Gemini API Error:", errData);
      return NextResponse.json({
        error: `Gemini API Hatası (${status}): ${errData?.error?.message || 'Bilinmeyen hata.'}`
      }, { status: 500 });
    }


    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      return NextResponse.json({ error: 'Yapay zekadan boş yanıt alındı.' }, { status: 500 });
    }

    // Clean markdown formatting if any exists despite instructions
    let cleanedText = candidateText.trim();
    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    let parsedFields: Record<string, any> = {};
    try {
      parsedFields = JSON.parse(cleanedText);
    } catch (parseErr) {
      console.error("JSON Parse Error:", parseErr, "Text:", cleanedText);
      return NextResponse.json({ error: 'Yapay zeka yanıtı geçerli JSON formatında oluşturulamadı.', rawText: candidateText }, { status: 500 });
    }

    return NextResponse.json({ success: true, fields: parsedFields });
  } catch (error: any) {
    console.error("AI Report Generation Error:", error);
    return NextResponse.json({ error: error.message || 'Rapor oluşturulurken sunucu hatası.' }, { status: 500 });
  }
}
