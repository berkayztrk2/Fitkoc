import AsyncStorage from '@react-native-async-storage/async-storage'

const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'
const MODEL = 'gemini-2.5-flash'

export const API_KEY_STORAGE = 'fitkoc-api-key'

// Önce kullanıcının Ayarlar'dan girdiği anahtarı, yoksa build-time env değişkenini kullan.
async function getApiKey() {
  try {
    const stored = await AsyncStorage.getItem(API_KEY_STORAGE)
    if (stored && stored.trim()) return stored.trim()
  } catch {}
  return process.env.EXPO_PUBLIC_GEMINI_API_KEY || ''
}

async function callGemini(contents, { systemInstruction, maxTokens = 1024 } = {}) {
  const apiKey = await getApiKey()
  if (!apiKey) {
    throw new Error('API anahtarı bulunamadı. Profil > Ayarlar > "Gemini API Anahtarı" bölümünden anahtarını gir veya .env dosyasına EXPO_PUBLIC_GEMINI_API_KEY ekle.')
  }

  const body = {
    contents,
    generationConfig: { maxOutputTokens: maxTokens, temperature: 0.7, thinkingConfig: { thinkingBudget: 0 } },
  }
  if (systemInstruction) {
    body.systemInstruction = { parts: [{ text: systemInstruction }] }
  }

  const res = await fetch(`${API_BASE}/${MODEL}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text()
    if (res.status === 429) throw new Error('API kota limiti aşıldı. Biraz bekleyip tekrar dene.')
    if (res.status === 403 || res.status === 401) throw new Error('API anahtarı geçersiz. Ayarlar\'dan kontrol et.')
    throw new Error(`API hatası (${res.status}): ${text.substring(0, 200)}`)
  }

  const data = await res.json()
  const parts = data.candidates?.[0]?.content?.parts || []
  const text = parts.filter(p => p.text).map(p => p.text).join('')
  if (!text) throw new Error('API boş yanıt döndürdü.')
  return text
}

export async function analyzeFoodPhoto(base64Data, userNotes = '', mediaType = 'image/jpeg') {
  const prompt =
    'Bu yiyecek veya içecek fotoğrafını analiz et. ' +
    (userNotes ? `Kullanıcı şu ek detayları verdi: "${userNotes}". Lütfen kalori ve besin değerlerini bu detayları da göz önünde bulundurarak tahmin et (örneğin ekstra yağ, şeker, pişirme yöntemi vb. belirtildiyse kaloriyi ve makroları buna göre ayarla). ` : '') +
    'YALNIZCA aşağıdaki formatta geçerli JSON döndür, ' +
    'başka hiçbir metin veya açıklama yazma:\n' +
    '{"foods":["isim1","isim2"],"calories":sayı,"protein_g":sayı,"carbs_g":sayı,' +
    '"fat_g":sayı,"note":"kısa Türkçe beslenme notu"}\n' +
    'Görüntüde yiyecek veya İÇECEK yoksa calories değerini 0 yap. İçecekler (kahve, kola, bira vb.) için mutlaka değer döndür.'

  const contents = [{
    parts: [
      { inlineData: { mimeType: mediaType, data: base64Data } },
      { text: prompt },
    ],
  }]

  const raw = await callGemini(contents, { maxTokens: 800 })
  const clean = raw.replace(/```json|```/g, '').trim()
  try {
    return JSON.parse(clean)
  } catch {
    throw new Error('Analiz sonucu okunamadı. Lütfen tekrar deneyin.')
  }
}

export async function askCoach(history, profile) {
  const systemInstruction =
    'Sen FitKoç uygulamasının AI fitness ve beslenme koçusun. Kullanıcı bilgileri: ' +
    `${profile.heightCm || '?'}cm boy, ${profile.weightKg || '?'}kg kilo, ${profile.age || '?'} yaş, ` +
    `cinsiyet ${profile.gender === 'female' ? 'kadın' : 'erkek'}, ` +
    `hedef "${profile.goalLabel || '?'}", günlük kalori hedefi ${profile.targetCal || '?'} kal, ` +
    `makrolar: protein ${profile.macros?.protein || '?'}g, karbonhidrat ${profile.macros?.carbs || '?'}g, yağ ${profile.macros?.fat || '?'}g. ` +
    'Türkçe, kısa, samimi ve motive edici cevaplar ver. Beslenme ve egzersiz ' +
    'konusunda bilimsel ama anlaşılır öneriler sun. Markdown kullanma, düz metin yaz. ' +
    'Tıbbi tanı koyma; ciddi durumlarda bir uzmana yönlendir.'

  const contents = history.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))

  return callGemini(contents, { maxTokens: 1024, systemInstruction })
}

export async function generateRecipeFromIngredients(ingredients, profile) {
  const systemInstruction = 
    'Sen FitKoç uygulamasının "AI Menü Oluşturucu" asistanısın. ' +
    'Kullanıcı sana sevdiği yiyecekleri veya elindeki malzemeleri söyleyecek. ' +
    'GÖREVİN: Bu listedeki malzemelerin HEPSİNİ aynı yemeğe KOYMAK ZORUNDA DEĞİLSİN! ' +
    'Mantıklı, lezzetli ve sağlıklı TEK BİR PORSİYONLUK harika bir fitness tarifi oluştur. ' +
    'Sadece birbiriyle uyumlu olanları seç, saçma kombinasyonlar (örneğin makarnalı tost) YAPMA. ' +
    'Eğer liste tamamen uyumsuzsa, içinden en sağlıklı olanı seçip yanına temel şeyler ekleyerek mantıklı bir öğün yarat. ' +
    'Sert, motive edici (brutalist) bir ton kullan. ' +
    'Kullanıcının hedefi: ' + (profile?.goalLabel || 'Bilinmiyor') + '. ' +
    'YALNIZCA aşağıdaki formatta geçerli JSON döndür, başka hiçbir metin yazma:\n' +
    '{"name":"Tarifin Havalı Adı","prepTime":"hazırlık süresi","calories":sayı,"protein_g":sayı,' +
    '"carbs_g":sayı,"fat_g":sayı,"instructions":["adım 1","adım 2"],"description":"tarif açıklaması"}'

  const contents = [{
    role: 'user',
    parts: [{ text: `Girdiğim yiyecekler: ${ingredients}. Lütfen bunlardan uyumlu olanları seçerek bana MANTIKLI ve yenilebilir bir fitness öğünü yarat.` }]
  }]

  try {
    const raw = await callGemini(contents, { maxTokens: 1024, systemInstruction })
    const clean = raw.replace(/```json|```/g, '').trim()
    return JSON.parse(clean)
  } catch (err) {
    console.error('API Hatası, sahte veri dönülüyor:', err)
    // API yoğunluk (503) vb. hatalar için fallback (MOCK)
    return {
      name: `Özel ${ingredients.split(',')[0]?.trim() || 'Protein'} Bombası`,
      prepTime: "15 dk",
      calories: 450,
      protein_g: 45,
      carbs_g: 35,
      fat_g: 15,
      instructions: [
        `${ingredients || 'Malzemeleri'} tezgahın üzerine dök!`,
        "Hepsini doğra ve yüksek ateşte biraz sızma zeytinyağı ile sotele.",
        "Hedeflerine odaklan ve bu yakıtı vücuduna al. Antrenmana hazırsın!"
      ],
      description: "API yoğunluğundan dolayı sana özel çevrimdışı oluşturduğumuz kurtarıcı tarif!"
    }
  }
}
