// Sağlık ve beslenme hesaplamaları

// Boy Kilo İndeksi (BKİ)
export function calcBMI(heightCm, weightKg) {
  const h = heightCm / 100
  return weightKg / (h * h)
}

export function bmiCategory(bmi) {
  if (bmi < 18.5) return { key: 'under', label: 'Zayıf', color: '#2E7DC4' }
  if (bmi < 25) return { key: 'normal', label: 'Normal', color: '#3B6D11' }
  if (bmi < 30) return { key: 'over', label: 'Fazla kilolu', color: '#BA7517' }
  return { key: 'obese', label: 'Obez', color: '#D94040' }
}

// İdeal kilo aralığı (BKİ 18.5 - 24.9)
export function idealWeightRange(heightCm) {
  const h = heightCm / 100
  return {
    min: Math.round(18.5 * h * h),
    max: Math.round(24.9 * h * h),
  }
}

// Bazal Metabolizma Hızı (Mifflin-St Jeor)
export function calcBMR({ gender, weightKg, heightCm, age }) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age
  return gender === 'female' ? base - 161 : base + 5
}

// Aktivite çarpanları
export const ACTIVITY = {
  sedentary: { mult: 1.2, label: 'Hareketsiz', desc: 'Masa başı, az yürüyüş' },
  light: { mult: 1.375, label: 'Az aktif', desc: 'Haftada 1-3 gün egzersiz' },
  moderate: { mult: 1.55, label: 'Orta aktif', desc: 'Haftada 3-5 gün egzersiz' },
  active: { mult: 1.725, label: 'Çok aktif', desc: 'Haftada 6-7 gün egzersiz' },
  athlete: { mult: 1.9, label: 'Sporcu', desc: 'Günde 2 antrenman / ağır iş' },
}

// Günlük toplam enerji harcaması (TDEE)
export function calcTDEE(bmr, activityKey) {
  const a = ACTIVITY[activityKey] || ACTIVITY.moderate
  return Math.round(bmr * a.mult)
}

// Hedefler ve kalori ayarlaması
export const GOALS = {
  lose: {
    label: 'Kilo vermek',
    desc: 'Sağlıklı ve kalıcı yağ yakımı',
    icon: 'trending-down',
    adjust: -500,
    color: '#D94040',
    soft: '#FCEAEA',
  },
  maintain: {
    label: 'Sağlıklı beslenmek',
    desc: 'Kilonu koru, enerjini dengele',
    icon: 'activity',
    adjust: 0,
    color: '#2E7DC4',
    soft: '#E6EEF8',
  },
  healthy: {
    label: 'Sağlıklı Beslenmek',
    desc: 'Genel sağlık ve zindelik',
    icon: 'heart',
    adjust: 0,
    color: '#3B6D11',
    soft: '#EBF4E5',
  },
  muscle: {
    label: 'Kas kütlesi kazanmak',
    desc: 'Yüksek protein, kontrollü fazla',
    icon: 'dumbbell',
    adjust: 200,
    color: '#7F77DD',
    soft: '#EEEDFE',
  },
  gain: {
    label: 'Kilo almak',
    desc: 'Sağlıklı kilo artışı, hacim',
    icon: 'trending-up',
    adjust: 400,
    color: '#BA7517',
    soft: '#F5EDD9',
  },
}

// Hedef arayüz paleti — onboarding ve profil düzenleme ekranlarının
// aynı renkleri kullanması için TEK kaynak.
export const GOAL_UI = {
  lose:     { color: '#FF3B30', soft: 'rgba(255,59,48,0.1)' },
  maintain: { color: '#007AFF', soft: 'rgba(0,122,255,0.1)' },
  gain:     { color: '#34C759', soft: 'rgba(52,199,89,0.1)' },
  muscle:   { color: '#AF52DE', soft: 'rgba(175,82,222,0.1)' },
  healthy:  { color: '#FF2D55', soft: 'rgba(255,45,85,0.1)' },
}

// Hedefe göre günlük kalori hedefi
export function targetCalories(tdee, goalKey) {
  const g = GOALS[goalKey] || GOALS.maintain
  return tdee + g.adjust
}

// Hedefe göre makro dağılımı (gram)
export function calcMacros(calories, weightKg, goalKey) {
  let proteinPerKg, fatPct
  switch (goalKey) {
    case 'lose':
      proteinPerKg = 2.2; fatPct = 0.28; break
    case 'muscle':
      proteinPerKg = 2.5; fatPct = 0.25; break
    case 'gain':
      proteinPerKg = 1.8; fatPct = 0.30; break
    default:
      proteinPerKg = 1.8; fatPct = 0.28; break
  }
  const protein = Math.round(weightKg * proteinPerKg)
  const fat = Math.round((calories * fatPct) / 9)
  const carbs = Math.max(0, Math.round((calories - protein * 4 - fat * 9) / 4))
  return { protein, carbs, fat }
}

// Su ihtiyacı (litre) — kilo başına ~45 ml + aktivite
export function waterTarget(weightKg, activityKey) {
  const base = weightKg * 0.035
  const extra = (ACTIVITY[activityKey]?.mult || 1.55) > 1.5 ? 0.5 : 0
  return Math.round((base + extra) * 10) / 10
}
