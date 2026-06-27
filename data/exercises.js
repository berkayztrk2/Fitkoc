// Egzersiz veritabanı
// Her egzersiz: hedef kaslar (primer/yardımcı/stabilizatör), adımlar, ipuçları,
// aktive olan kas bölgeleri (MuscleMap için).
//
// Kas bölgesi anahtarları MuscleMap bileşenindeki PARTS ile eşleşir.
// Renk rolü: 'primary' (kırmızı), 'secondary' (mavi), 'stabilizer' (gri)

export const MUSCLE_ROLE = {
  primary:    { color: '#D94040', label: 'Primer' },
  secondary:  { color: '#2E7DC4', label: 'Yardımcı' },
  stabilizer: { color: '#7A7A7A', label: 'Stabilizatör' },
}

// Kas grubu kategorileri (filtre & kategori sayfası için)
export const MUSCLE_GROUPS = {
  chest:     { label: 'Göğüs',   icon: '🫁' },
  back:      { label: 'Sırt',     icon: '🪢' },
  legs:      { label: 'Bacak',    icon: '🦵' },
  shoulders: { label: 'Omuz',     icon: '🪖' },
  arms:      { label: 'Kol',      icon: '💪' },
  core:      { label: 'Karın',    icon: '🔥' },
}

// Ekipman tipleri
export const EQUIPMENT = {
  barbell:    { label: 'Bar' },
  dumbbell:   { label: 'Dambıl' },
  machine:    { label: 'Makine' },
  bodyweight: { label: 'Vücut ağırlığı' },
  cable:      { label: 'Kablo' },
  bar:        { label: 'Çekme barı' },
}

// Kısayollar — sık kullanılan kas bölgesi setleri
const F_CHEST = { f_chest_l: 'primary', f_chest_r: 'primary' }
const F_FRONT_DELT = { f_delt_l: 'secondary', f_delt_r: 'secondary' }
const F_TRI = { f_tri_l: 'secondary', f_tri_r: 'secondary' }
const F_BI = { f_bicep_l: 'primary', f_bicep_r: 'primary' }
const F_FOREARM = { f_fgarm_l: 'stabilizer', f_fgarm_r: 'stabilizer' }
const F_CORE = { f_core: 'stabilizer' }
const F_QUAD = { f_quad_l: 'primary', f_quad_r: 'primary' }

export const EXERCISES = {

  // ============ GÖĞÜS ============
  bench: {
    id: 'bench', name: 'Bench Press', category: 'chest', muscleGroup: 'chest',
    equipment: 'barbell', defaultRestSec: 150, difficulty: 'Orta',
    front: { ...F_CHEST, ...F_FRONT_DELT, ...F_TRI, ...F_CORE },
    back: {},
    legend: [
      { role: 'primary', name: 'Pektoralis Major' },
      { role: 'secondary', name: 'Ön Deltoid' },
      { role: 'secondary', name: 'Triceps' },
    ],
    steps: [
      { t: 'Bench pozisyon', s: 'Sırt düz, ayaklar yerde sabit, hafif bel arkı' },
      { t: 'Tutuş', s: 'Bar orta parmak halka hizasında, bilek düz' },
      { t: 'İndir', s: 'Bar göğüs alt kısmına, dirsekler 45° açıda' },
      { t: 'İt', s: 'Patlayıcı güçle it, kürek kemiklerini bench\'e sabit bas' },
    ],
    tips: [
      'Kürek kemikleri bench\'e basılı kalmalı',
      'Bar tam göğse değmeli — yarım hareket etkisiz',
      'İterken nefes ver',
    ],
  },

  inclineBench: {
    id: 'inclineBench', name: 'Incline Bench Press', category: 'chest', muscleGroup: 'chest',
    equipment: 'barbell', defaultRestSec: 150, difficulty: 'Orta',
    front: { ...F_CHEST, f_delt_l: 'primary', f_delt_r: 'primary', ...F_TRI, ...F_CORE },
    back: {},
    legend: [
      { role: 'primary', name: 'Üst Pektoralis' },
      { role: 'primary', name: 'Ön Deltoid' },
      { role: 'secondary', name: 'Triceps' },
    ],
    steps: [
      { t: 'Bench ayarı', s: 'Sırt desteğini 30-45° eğimde sabitle' },
      { t: 'Tutuş', s: 'Bench\'tekinden biraz dar tut, omuzları çek geri' },
      { t: 'İndir', s: 'Bar üst göğse, dirsekler 30-45° açıda' },
      { t: 'İt', s: 'Düz yukarı it, kilitleme yapmadan duraksat' },
    ],
    tips: [
      '45°\'den dik açılar ön omuza yükü kaydırır',
      'Bench\'i çok dik kurma — üst göğüsten omuza geçer',
      'Bar göğse temas etmeli',
    ],
  },

  dbBench: {
    id: 'dbBench', name: 'Dumbbell Bench Press', category: 'chest', muscleGroup: 'chest',
    equipment: 'dumbbell', defaultRestSec: 120, difficulty: 'Orta',
    front: { ...F_CHEST, ...F_FRONT_DELT, ...F_TRI, ...F_CORE },
    back: {},
    legend: [
      { role: 'primary', name: 'Pektoralis Major' },
      { role: 'secondary', name: 'Ön Deltoid' },
      { role: 'secondary', name: 'Triceps' },
    ],
    steps: [
      { t: 'Başlangıç', s: 'Dambıllar göğüs hizasında, avuçlar ileri' },
      { t: 'İt', s: 'Dambılları yukarı it, üstte hafif birbirine dokundur' },
      { t: 'İndir', s: 'Yavaş ve kontrollü, göğüs hizasının biraz altına in' },
      { t: 'Tekrarla', s: 'Sırt bench\'e basılı, omuzlar geri tut' },
    ],
    tips: [
      'Daha geniş hareket aralığı sağlar — bar\'a göre avantaj',
      'Dengeli iniş için aceleci olma',
      'Bilek nötr, sağa-sola sallanma',
    ],
  },

  inclineDbPress: {
    id: 'inclineDbPress', name: 'Incline Dumbbell Press', category: 'chest', muscleGroup: 'chest',
    equipment: 'dumbbell', defaultRestSec: 120, difficulty: 'Orta',
    front: { ...F_CHEST, f_delt_l: 'primary', f_delt_r: 'primary', ...F_TRI, ...F_CORE },
    back: {},
    legend: [
      { role: 'primary', name: 'Üst Pektoralis' },
      { role: 'primary', name: 'Ön Deltoid' },
      { role: 'secondary', name: 'Triceps' },
    ],
    steps: [
      { t: 'Hazırlık', s: 'Bench 30-45° eğimde, dambıllar göğüs hizasında' },
      { t: 'İt', s: 'Dambılları üst göğüs hizasında düz yukarı it' },
      { t: 'Tepe', s: 'Üstte 1 sn duraksat, kasları sık' },
      { t: 'İndir', s: 'Kontrollü olarak başlangıç pozisyonuna dön' },
    ],
    tips: [
      'Üst göğüs gelişimi için en etkili egzersizlerden biri',
      'Dambıllar boyun değil göğüs hizasında inmeli',
      'Omuz ağrısı varsa açıyı azalt',
    ],
  },

  dips: {
    id: 'dips', name: 'Dips (Paralel)', category: 'chest', muscleGroup: 'chest',
    equipment: 'bodyweight', defaultRestSec: 90, difficulty: 'Zor',
    front: { ...F_CHEST, ...F_FRONT_DELT, ...F_TRI, ...F_CORE },
    back: {},
    legend: [
      { role: 'primary', name: 'Alt Pektoralis' },
      { role: 'primary', name: 'Triceps' },
      { role: 'secondary', name: 'Ön Deltoid' },
    ],
    steps: [
      { t: 'Pozisyon', s: 'Paralel barlarda kollar gergin, gövde hafif öne eğik' },
      { t: 'İn', s: 'Omuzlar dirseklerin altına inene kadar yavaşça in' },
      { t: 'İt', s: 'Patlayıcı güçle yukarı it, üstte kilitleme yapma' },
      { t: 'Kontrol', s: 'Sallanma yapma, hareket boyunca core sıkı' },
    ],
    tips: [
      'Göğüs için: öne eğil, dirsekler dışa açılsın',
      'Triceps için: dik dur, dirsekler vücuda yakın',
      'Zorlanıyorsan band veya makineli versiyonla başla',
    ],
  },

  pushup: {
    id: 'pushup', name: 'Şınav', category: 'chest', muscleGroup: 'chest',
    equipment: 'bodyweight', defaultRestSec: 60, difficulty: 'Kolay',
    front: { ...F_CHEST, ...F_TRI, ...F_FRONT_DELT, ...F_CORE },
    back: {},
    legend: [
      { role: 'primary', name: 'Pektoralis Major' },
      { role: 'secondary', name: 'Triceps' },
      { role: 'secondary', name: 'Ön Deltoid' },
      { role: 'stabilizer', name: 'Core' },
    ],
    steps: [
      { t: 'Pozisyon', s: 'Eller omuz genişliğinde, vücut düz çizgi, core sıkı' },
      { t: 'İndir', s: 'Göğüs yere yaklaşana dek in, dirsekler 45°' },
      { t: 'İt', s: 'Patlayıcı güçle it, dirsekleri tam uzat' },
      { t: 'Tekrarla', s: 'Kalçanı düşürme veya kaldırma, hat sabit kalsın' },
    ],
    tips: [
      'Kalça sarkmamalı veya yükselmemeli',
      'Boyun nötr — yere bakma',
      'Zorlaşırsa dizden başla',
    ],
  },

  cableFly: {
    id: 'cableFly', name: 'Cable Fly', category: 'chest', muscleGroup: 'chest',
    equipment: 'cable', defaultRestSec: 75, difficulty: 'Orta',
    front: { ...F_CHEST, ...F_FRONT_DELT, ...F_CORE },
    back: {},
    legend: [
      { role: 'primary', name: 'Pektoralis Major' },
      { role: 'secondary', name: 'Ön Deltoid' },
    ],
    steps: [
      { t: 'Hazırlık', s: 'İki kablo tutamağı yüksek, bir ayak öne, hafif öne eğil' },
      { t: 'Çek', s: 'Kollar hafif bükük, eller önde geniş yay çizerek birleştir' },
      { t: 'Tepe', s: 'Göğüsleri sık, 1-2 sn duraksat' },
      { t: 'Aç', s: 'Yavaşça kontrollü olarak başlangıca dön' },
    ],
    tips: [
      'Dirsekleri kilitleme — hafif bükük tut',
      'Hareket göğüsten gelmeli, koldan değil',
      'Yüksek/orta/düşük açılarda dene',
    ],
  },

  // ============ SIRT ============
  deadlift: {
    id: 'deadlift', name: 'Deadlift', category: 'back', muscleGroup: 'back',
    equipment: 'barbell', defaultRestSec: 210, difficulty: 'Zor',
    front: { f_quad_l: 'secondary', f_quad_r: 'secondary', ...F_FOREARM, ...F_CORE, f_oblq_l: 'stabilizer', f_oblq_r: 'stabilizer' },
    back: {
      b_lo_bk: 'primary', b_mid_bk: 'primary', b_trap: 'primary', b_erect: 'primary',
      b_glute: 'primary', b_ham_l: 'primary', b_ham_r: 'primary',
      b_lat_l: 'secondary', b_lat_r: 'secondary',
    },
    legend: [
      { role: 'primary', name: 'Lomber / Sırt' },
      { role: 'primary', name: 'Gluteus' },
      { role: 'primary', name: 'Hamstring' },
      { role: 'primary', name: 'Trapezius' },
    ],
    steps: [
      { t: 'Pozisyon', s: 'Bar ayak üzerinde, ayaklar kalça genişliğinde' },
      { t: 'Kavra', s: 'Double overhand veya mixed grip, kollar dikey' },
      { t: 'Göğsü şişir', s: 'Sırt düz, kalça aşağı, nefes al ve kilitle' },
      { t: 'Kaldır', s: 'Kalça ve diz eş zamanlı aç, bar bacağa temas ederek çıkar' },
    ],
    tips: [
      'Sırt asla yuvarlak olmamalı — en kritik nokta',
      'Bar tüm yolda bacağa temas etmeli',
      'Valsalva manövrü şarttır',
    ],
  },

  pullup: {
    id: 'pullup', name: 'Pull-up', category: 'back', muscleGroup: 'back',
    equipment: 'bar', defaultRestSec: 120, difficulty: 'Zor',
    front: { f_bicep_l: 'secondary', f_bicep_r: 'secondary', ...F_FOREARM },
    back: {
      b_lat_l: 'primary', b_lat_r: 'primary', b_mid_bk: 'primary',
      b_delt_l: 'secondary', b_delt_r: 'secondary',
      b_tri_l: 'stabilizer', b_tri_r: 'stabilizer',
    },
    legend: [
      { role: 'primary', name: 'Latissimus Dorsi' },
      { role: 'primary', name: 'Orta Sırt' },
      { role: 'secondary', name: 'Biceps' },
    ],
    steps: [
      { t: 'Tutuş', s: 'Overhand, omuz genişliğinden geniş' },
      { t: 'Kürek çek', s: 'Kürekleri önce aşağı-geri çek, omuzları düşür' },
      { t: 'Çek', s: 'Dirsekler aşağı ve geri — çene bar üstüne geçmeli' },
      { t: 'Kontrollü in', s: 'Kollar tamamen uzayacak şekilde yavaş in' },
    ],
    tips: [
      'Çene bar üstüne geçmeli',
      'Lat\'ı hissetmek için "barı kır" düşün',
      'Ağırlık belt ile progresyon yap',
    ],
  },

  chinup: {
    id: 'chinup', name: 'Chin-up', category: 'back', muscleGroup: 'back',
    equipment: 'bar', defaultRestSec: 120, difficulty: 'Orta',
    front: { ...F_BI, ...F_FOREARM, ...F_CORE },
    back: {
      b_lat_l: 'primary', b_lat_r: 'primary', b_mid_bk: 'secondary',
    },
    legend: [
      { role: 'primary', name: 'Latissimus Dorsi' },
      { role: 'primary', name: 'Biceps' },
      { role: 'secondary', name: 'Orta Sırt' },
    ],
    steps: [
      { t: 'Tutuş', s: 'Underhand (avuçlar sana dönük), omuz genişliğinde' },
      { t: 'Sabitle', s: 'Core sıkı, ayaklar arkada çapraz' },
      { t: 'Çek', s: 'Dirsekler aşağı-geri, çene bar üstüne çık' },
      { t: 'İn', s: 'Yavaş kontrollü olarak başa dön' },
    ],
    tips: [
      'Pull-up\'tan biraz daha kolaydır — biceps daha aktif',
      'Tam asılma pozisyonuna kadar in',
      'Salınım yapma',
    ],
  },

  barbellRow: {
    id: 'barbellRow', name: 'Barbell Row', category: 'back', muscleGroup: 'back',
    equipment: 'barbell', defaultRestSec: 120, difficulty: 'Orta',
    front: { ...F_FOREARM, ...F_CORE },
    back: {
      b_lat_l: 'primary', b_lat_r: 'primary', b_mid_bk: 'primary', b_trap: 'secondary',
      b_delt_l: 'secondary', b_delt_r: 'secondary', b_lo_bk: 'stabilizer',
    },
    legend: [
      { role: 'primary', name: 'Latissimus Dorsi' },
      { role: 'primary', name: 'Orta Sırt' },
      { role: 'secondary', name: 'Trapezius' },
      { role: 'secondary', name: 'Arka Deltoid' },
    ],
    steps: [
      { t: 'Hazırlık', s: 'Bar yerden, ayaklar omuz genişliğinde' },
      { t: 'Pozisyon', s: 'Kalça geri, gövde 45° öne, sırt düz' },
      { t: 'Çek', s: 'Barı göbek-alt kaburga hizasına çek' },
      { t: 'İndir', s: 'Kontrollü olarak başlangıca, lat gerginliği bozulmasın' },
    ],
    tips: [
      'Gövde sabit, sallanma yok',
      'Dirsekler vücuda yakın çek',
      'Sırt yuvarlamadan dur',
    ],
  },

  dumbbellRow: {
    id: 'dumbbellRow', name: 'Tek Kol Dambıl Row', category: 'back', muscleGroup: 'back',
    equipment: 'dumbbell', defaultRestSec: 75, difficulty: 'Kolay',
    front: { ...F_FOREARM, ...F_CORE },
    back: {
      b_lat_l: 'primary', b_lat_r: 'primary', b_mid_bk: 'primary',
      b_delt_l: 'secondary', b_delt_r: 'secondary',
    },
    legend: [
      { role: 'primary', name: 'Latissimus Dorsi' },
      { role: 'primary', name: 'Orta Sırt' },
      { role: 'secondary', name: 'Arka Deltoid' },
    ],
    steps: [
      { t: 'Hazırlık', s: 'Bir diz ve eli bench\'te, sırt düz' },
      { t: 'Tutuş', s: 'Diğer elde dambıl, kol uzanmış' },
      { t: 'Çek', s: 'Dirseği yukarı-geri çek, kalçaya doğru' },
      { t: 'İndir', s: 'Tam uzanma noktasına yavaşça in' },
    ],
    tips: [
      'Vücudu döndürme — sırt sabit',
      'Hareket dirsekten başlamalı',
      'Tepe noktada kürek kemiğini sık',
    ],
  },

  latPulldown: {
    id: 'latPulldown', name: 'Lat Pulldown', category: 'back', muscleGroup: 'back',
    equipment: 'cable', defaultRestSec: 75, difficulty: 'Kolay',
    front: { ...F_BI, ...F_FOREARM, ...F_CORE },
    back: {
      b_lat_l: 'primary', b_lat_r: 'primary', b_mid_bk: 'secondary',
    },
    legend: [
      { role: 'primary', name: 'Latissimus Dorsi' },
      { role: 'secondary', name: 'Orta Sırt' },
      { role: 'secondary', name: 'Biceps' },
    ],
    steps: [
      { t: 'Hazırlık', s: 'Geniş tutuş, dizler ped altında sabit' },
      { t: 'Çek', s: 'Bar göğüs üstüne, dirsekler aşağı-geri' },
      { t: 'Tepe', s: 'Kürekleri sık, 1 sn duraksat' },
      { t: 'Salıver', s: 'Yavaşça başlangıç pozisyonuna dön' },
    ],
    tips: [
      'Geriye yatma — gövde dik',
      'Barı göğse çek, ense arkasına değil',
      'Lat\'ı hissetmek için omuzları aşağıda tut',
    ],
  },

  tbarRow: {
    id: 'tbarRow', name: 'T-Bar Row', category: 'back', muscleGroup: 'back',
    equipment: 'barbell', defaultRestSec: 120, difficulty: 'Orta',
    front: { ...F_FOREARM, ...F_CORE },
    back: {
      b_lat_l: 'primary', b_lat_r: 'primary', b_mid_bk: 'primary', b_trap: 'secondary',
      b_lo_bk: 'stabilizer',
    },
    legend: [
      { role: 'primary', name: 'Sırt (orta-üst)' },
      { role: 'primary', name: 'Latissimus Dorsi' },
      { role: 'secondary', name: 'Trapezius' },
    ],
    steps: [
      { t: 'Pozisyon', s: 'Barın üzerine eğil, V-handle ile kavra' },
      { t: 'Hazırlık', s: 'Gövde 45°, sırt düz, dizler hafif bükük' },
      { t: 'Çek', s: 'Tutamacı göbeğe çek, dirsekler geri' },
      { t: 'İndir', s: 'Kontrollü iniş, lat gerilimi koru' },
    ],
    tips: [
      'Kalın sırt için ideal hareket',
      'Bel kasılmasın — kalçadan eğilim olmalı',
      'Aşırı ağırlıkta form bozulur, düşür',
    ],
  },

  facePull: {
    id: 'facePull', name: 'Face Pull', category: 'shoulders', muscleGroup: 'shoulders',
    equipment: 'cable', defaultRestSec: 60, difficulty: 'Kolay',
    front: {},
    back: {
      b_delt_l: 'primary', b_delt_r: 'primary', b_trap: 'secondary',
      b_mid_bk: 'secondary',
    },
    legend: [
      { role: 'primary', name: 'Arka Deltoid' },
      { role: 'secondary', name: 'Trapezius (orta)' },
      { role: 'secondary', name: 'Rotator Cuff' },
    ],
    steps: [
      { t: 'Hazırlık', s: 'Kablo yüz hizasında, halat tutamacı' },
      { t: 'Çek', s: 'Halat yüz hizasına, dirsekler yüksek geri' },
      { t: 'Dış rotasyon', s: 'Tepede başparmaklar geriye dönsün' },
      { t: 'Salıver', s: 'Yavaşça başlangıca dön' },
    ],
    tips: [
      'Omuz sağlığı için en iyi yardımcı hareket',
      'Dirsekler yüksek tut — aşağı düşürme',
      'Hafif kilo, yüksek tekrar daha etkili',
    ],
  },

  // ============ BACAK ============
  squat: {
    id: 'squat', name: 'Squat', category: 'legs', muscleGroup: 'legs',
    equipment: 'barbell', defaultRestSec: 180, difficulty: 'Zor',
    front: { ...F_QUAD, f_hip: 'primary', f_addc: 'secondary', f_kn_l: 'secondary', f_kn_r: 'secondary', ...F_CORE, f_oblq_l: 'stabilizer', f_oblq_r: 'stabilizer' },
    back: {
      b_glute: 'primary', b_ham_l: 'secondary', b_ham_r: 'secondary',
      b_calf_l: 'secondary', b_calf_r: 'secondary',
      b_erect: 'stabilizer', b_lo_bk: 'stabilizer',
    },
    legend: [
      { role: 'primary', name: 'Quadriceps' },
      { role: 'primary', name: 'Gluteus' },
      { role: 'secondary', name: 'Hamstring' },
    ],
    steps: [
      { t: 'Pozisyon al', s: 'Bar trapeziusa, ayaklar omuz genişliğinde, parmaklar 30° dışa' },
      { t: 'Nefes ve kilit', s: 'Derin nefes al, karın içe bas (Valsalva), sırt nötr tut' },
      { t: 'Çömel', s: 'Kalça geri-aşağı, diz parmak yönünde, uyluk paralel veya altı' },
      { t: 'Kalk', s: 'Topuktan patlayıcı it, kalça ve diz eş zamanlı aç' },
    ],
    tips: [
      'Diz içe çökmemeli — aktif olarak dışa it',
      'Topuklar yerden kalkmamalı',
      'Her hafta 2.5 kg ekle (lineer progresyon)',
    ],
  },

  frontSquat: {
    id: 'frontSquat', name: 'Front Squat', category: 'legs', muscleGroup: 'legs',
    equipment: 'barbell', defaultRestSec: 150, difficulty: 'Zor',
    front: { f_quad_l: 'primary', f_quad_r: 'primary', f_hip: 'primary', ...F_CORE, f_oblq_l: 'primary', f_oblq_r: 'primary' },
    back: {
      b_glute: 'secondary', b_ham_l: 'secondary', b_ham_r: 'secondary',
      b_erect: 'primary',
    },
    legend: [
      { role: 'primary', name: 'Quadriceps' },
      { role: 'primary', name: 'Core / Erektör' },
      { role: 'secondary', name: 'Gluteus' },
    ],
    steps: [
      { t: 'Bar pozisyonu', s: 'Bar ön omuzda, dirsekler yukarı paralel' },
      { t: 'Kilitle', s: 'Core sıkı, sırt dik, ayaklar omuz genişliğinde' },
      { t: 'Çömel', s: 'Daha dik gövde, dizler öne, alçal' },
      { t: 'Kalk', s: 'Topuktan it, dirsekleri yukarıda tut' },
    ],
    tips: [
      'Gövde squat\'a göre daha dik',
      'Bilek esnekliği yetersizse cross grip dene',
      'Quad odaklı progresyon için ideal',
    ],
  },

  legPress: {
    id: 'legPress', name: 'Leg Press', category: 'legs', muscleGroup: 'legs',
    equipment: 'machine', defaultRestSec: 120, difficulty: 'Kolay',
    front: { f_quad_l: 'primary', f_quad_r: 'primary', f_hip: 'secondary' },
    back: {
      b_glute: 'primary', b_ham_l: 'secondary', b_ham_r: 'secondary',
    },
    legend: [
      { role: 'primary', name: 'Quadriceps' },
      { role: 'primary', name: 'Gluteus' },
      { role: 'secondary', name: 'Hamstring' },
    ],
    steps: [
      { t: 'Pozisyon', s: 'Sırt sıkıca pad\'e bas, ayaklar omuz genişliğinde' },
      { t: 'Salıver', s: 'Güvenlik kolunu aç, pedalı yavaş indir' },
      { t: 'Çömel', s: 'Dizler göğse yaklaşana kadar in (90° altı)' },
      { t: 'İt', s: 'Topuktan it, dizleri kilitlemeden bitir' },
    ],
    tips: [
      'Sırt bel ile pad\'den ayrılmamalı',
      'Ayak konumu kasları değiştirir: yukarı→glute, aşağı→quad',
      'Dizler ayak yönünde gitmeli',
    ],
  },

  lunge: {
    id: 'lunge', name: 'Lunge', category: 'legs', muscleGroup: 'legs',
    equipment: 'dumbbell', defaultRestSec: 75, difficulty: 'Orta',
    front: { f_quad_l: 'primary', f_quad_r: 'primary', f_hip: 'secondary', ...F_CORE },
    back: {
      b_glute: 'primary', b_ham_l: 'secondary', b_ham_r: 'secondary',
    },
    legend: [
      { role: 'primary', name: 'Quadriceps' },
      { role: 'primary', name: 'Gluteus' },
      { role: 'secondary', name: 'Hamstring' },
    ],
    steps: [
      { t: 'Hazırlık', s: 'Dik dur, dambıllar yanda' },
      { t: 'Adım', s: 'Bir bacakla öne uzun adım at' },
      { t: 'İn', s: 'Ön diz 90°, arka diz yere yaklaşana kadar' },
      { t: 'Kalk', s: 'Ön topuktan iterek başlangıca dön' },
    ],
    tips: [
      'Ön diz ayak parmaklarını geçmemeli',
      'Gövde dik kalmalı',
      'Walking lunge varyasyonu daha zor',
    ],
  },

  rdl: {
    id: 'rdl', name: 'Romanian Deadlift', category: 'legs', muscleGroup: 'legs',
    equipment: 'barbell', defaultRestSec: 120, difficulty: 'Orta',
    front: { ...F_CORE, ...F_FOREARM },
    back: {
      b_ham_l: 'primary', b_ham_r: 'primary', b_glute: 'primary',
      b_lo_bk: 'secondary', b_erect: 'secondary',
      b_calf_l: 'secondary', b_calf_r: 'secondary',
    },
    legend: [
      { role: 'primary', name: 'Hamstring' },
      { role: 'primary', name: 'Gluteus' },
      { role: 'secondary', name: 'Lomber Sırt' },
    ],
    steps: [
      { t: 'Başlangıç', s: 'Bar belde tutulmuş, dik duruş, dizler hafif bükük' },
      { t: 'Öne eğil', s: 'Kalçayı geri iterek öne eğil, sırt düz' },
      { t: 'Hamstring', s: 'Bar bacak boyunca aşağı süzülür, gerilimi hisset' },
      { t: 'Kalk', s: 'Kalçayı öne iterek dik gel, glute\'u sık' },
    ],
    tips: [
      'Dizleri sabit tut — bacak curl değil',
      'Bar bacağa temas etmeli',
      'Esneklik sınırını aşma, sırtı koru',
    ],
  },

  legCurl: {
    id: 'legCurl', name: 'Leg Curl', category: 'legs', muscleGroup: 'legs',
    equipment: 'machine', defaultRestSec: 75, difficulty: 'Kolay',
    front: {},
    back: {
      b_ham_l: 'primary', b_ham_r: 'primary',
      b_calf_l: 'secondary', b_calf_r: 'secondary',
    },
    legend: [
      { role: 'primary', name: 'Hamstring' },
      { role: 'secondary', name: 'Gastroknemius' },
    ],
    steps: [
      { t: 'Pozisyon', s: 'Yüz üstü uzan, pad ayak bileğinin üstünde' },
      { t: 'Kasla', s: 'Topukları kalçaya çekecek şekilde bük' },
      { t: 'Tepe', s: 'Üstte 1 sn duraksat, hamstring\'i sık' },
      { t: 'İndir', s: '3-4 sn kontrollü iniş, tam uzanma noktasına' },
    ],
    tips: [
      'Kalçayı kaldırma — paddan ayırma',
      'Negatif fazı yavaşlat',
      'Hafif kilo, doğru form ön planda',
    ],
  },

  legExtension: {
    id: 'legExtension', name: 'Leg Extension', category: 'legs', muscleGroup: 'legs',
    equipment: 'machine', defaultRestSec: 60, difficulty: 'Kolay',
    front: { f_quad_l: 'primary', f_quad_r: 'primary' },
    back: {},
    legend: [
      { role: 'primary', name: 'Quadriceps' },
    ],
    steps: [
      { t: 'Pozisyon', s: 'Sırt pad\'e dayalı, pad ayak bileği üstünde' },
      { t: 'Kasla', s: 'Bacakları tamamen düzleştir' },
      { t: 'Tepe', s: 'Üstte quad\'ı sıkıştır, 1 sn duraksat' },
      { t: 'İndir', s: 'Kontrollü olarak 90°\'ye dön' },
    ],
    tips: [
      'İzole quad çalışması — squat\'ı tamamlar',
      'Patlayıcı ama kontrollü hareket et',
      'Diz sorunu varsa hareket aralığını azalt',
    ],
  },

  calfRaise: {
    id: 'calfRaise', name: 'Calf Raise', category: 'legs', muscleGroup: 'legs',
    equipment: 'machine', defaultRestSec: 60, difficulty: 'Kolay',
    front: {},
    back: { b_calf_l: 'primary', b_calf_r: 'primary' },
    legend: [
      { role: 'primary', name: 'Gastroknemius' },
      { role: 'secondary', name: 'Soleus' },
    ],
    steps: [
      { t: 'Pozisyon', s: 'Parmaklar pedalda, topuklar boşta' },
      { t: 'Aşağı', s: 'Topukları tam aşağı sarkıt, baldırı ger' },
      { t: 'Yukarı', s: 'Parmak ucuna kalk, üstte sık' },
      { t: 'Tekrarla', s: 'Tam hareket aralığı, kontrollü iniş' },
    ],
    tips: [
      'Sıçramadan, yavaş ve kontrollü hareket et',
      'Yüksek tekrar (15-20) ile çalışır',
      'Dizler düz dur: gastroknemius için',
    ],
  },

  // ============ OMUZ ============
  ohp: {
    id: 'ohp', name: 'Military Press (OHP)', category: 'shoulders', muscleGroup: 'shoulders',
    equipment: 'barbell', defaultRestSec: 150, difficulty: 'Orta',
    front: { f_delt_l: 'primary', f_delt_r: 'primary', ...F_TRI, ...F_CORE },
    back: {
      b_trap: 'secondary', b_delt_l: 'secondary', b_delt_r: 'secondary',
    },
    legend: [
      { role: 'primary', name: 'Deltoid (ön/yan)' },
      { role: 'secondary', name: 'Triceps' },
      { role: 'secondary', name: 'Trapezius' },
    ],
    steps: [
      { t: 'Başlangıç', s: 'Bar klavikula önünde, bilek düz, dirsekler hafif öne' },
      { t: 'Kilitle', s: 'Core sık, kalça sıkıştır' },
      { t: 'İt', s: 'Bar kulak hizasını geçince kafa öne gel, düz yukarı it' },
      { t: 'İndir', s: 'Kontrollü klavikulaya geri, nefes al' },
    ],
    tips: [
      'Bar kafanın tam üzerinde olmalı — öne yatma',
      'Bel aşırı açılmamalı',
      'Haftalık 1-2 kg artış hedefle',
    ],
  },

  dbShoulderPress: {
    id: 'dbShoulderPress', name: 'Dumbbell Shoulder Press', category: 'shoulders', muscleGroup: 'shoulders',
    equipment: 'dumbbell', defaultRestSec: 120, difficulty: 'Orta',
    image: '/exercises/dumbbell-shoulder-press.png',
    front: { f_delt_l: 'primary', f_delt_r: 'primary', ...F_TRI, ...F_CORE },
    back: { b_trap: 'secondary' },
    legend: [
      { role: 'primary', name: 'Deltoid (ön/yan)' },
      { role: 'secondary', name: 'Triceps' },
    ],
    steps: [
      { t: 'Hazırlık', s: 'Dambıllar omuz hizasında, avuçlar ileri' },
      { t: 'İt', s: 'Dambılları başın üzerine, üstte hafif yaklaştır' },
      { t: 'Tepe', s: 'Üstte kilitleme yapma, dirsekleri uzat' },
      { t: 'İndir', s: 'Yavaşça omuz hizasına in' },
    ],
    tips: [
      'Bench arkalığı dikçe tut — omuz korunur',
      'Bel\'i bench\'ten kaldırma',
      'OHP\'a göre daha güvenli, hareket aralığı daha geniş',
    ],
  },

  lateralRaise: {
    id: 'lateralRaise', name: 'Lateral Raise', category: 'shoulders', muscleGroup: 'shoulders',
    equipment: 'dumbbell', defaultRestSec: 60, difficulty: 'Kolay',
    front: { f_delt_l: 'primary', f_delt_r: 'primary' },
    back: {
      b_delt_l: 'secondary', b_delt_r: 'secondary',
    },
    legend: [
      { role: 'primary', name: 'Yan Deltoid' },
      { role: 'secondary', name: 'Trapezius (üst)' },
    ],
    steps: [
      { t: 'Hazırlık', s: 'Dik dur, dambıllar yanda, hafif öne eğik' },
      { t: 'Kaldır', s: 'Kolları yanlara aç, dirsekler hafif bükük' },
      { t: 'Tepe', s: 'Eller omuz hizasında, başparmak hafif aşağı' },
      { t: 'İndir', s: '3 sn kontrollü iniş' },
    ],
    tips: [
      'Hafif kilo, yüksek tekrar (12-20) optimal',
      'Trap\'i devreye sokma — omuzları aşağı tut',
      'Salınım yapma',
    ],
  },

  frontRaise: {
    id: 'frontRaise', name: 'Front Raise', category: 'shoulders', muscleGroup: 'shoulders',
    equipment: 'dumbbell', defaultRestSec: 60, difficulty: 'Kolay',
    front: { f_delt_l: 'primary', f_delt_r: 'primary', f_chest_l: 'secondary', f_chest_r: 'secondary' },
    back: {},
    legend: [
      { role: 'primary', name: 'Ön Deltoid' },
      { role: 'secondary', name: 'Üst Pektoralis' },
    ],
    steps: [
      { t: 'Hazırlık', s: 'Dik dur, dambıllar uyluk önünde' },
      { t: 'Kaldır', s: 'Bir veya iki dambılı omuz hizasına kaldır' },
      { t: 'Tepe', s: 'Omuz hizasında durdur' },
      { t: 'İndir', s: 'Kontrollü iniş' },
    ],
    tips: [
      'Bench Press zaten ön deltoidi çalıştırır — abartma',
      'Kontrollü hareket, sallama yok',
      'Bel\'i koru — gövde dik kalmalı',
    ],
  },

  reverseFly: {
    id: 'reverseFly', name: 'Reverse Fly', category: 'shoulders', muscleGroup: 'shoulders',
    equipment: 'dumbbell', defaultRestSec: 60, difficulty: 'Kolay',
    front: {},
    back: {
      b_delt_l: 'primary', b_delt_r: 'primary', b_mid_bk: 'secondary', b_trap: 'secondary',
    },
    legend: [
      { role: 'primary', name: 'Arka Deltoid' },
      { role: 'secondary', name: 'Trapezius (orta)' },
    ],
    steps: [
      { t: 'Hazırlık', s: 'Öne eğil, sırt düz, dambıllar omuzun altında' },
      { t: 'Aç', s: 'Kolları yanlara aç, dirsekler hafif bükük' },
      { t: 'Tepe', s: 'Kürekleri sık, kollar omuz hizasında' },
      { t: 'İndir', s: 'Yavaşça başlangıca dön' },
    ],
    tips: [
      'Posture\'u düzeltir — bench\'in zıt egzersizi',
      'Hafif kilo etkili',
      'Boyun nötr',
    ],
  },

  // ============ KOL ============
  curl: {
    id: 'curl', name: 'Barbell Curl', category: 'arms', muscleGroup: 'arms',
    equipment: 'barbell', defaultRestSec: 75, difficulty: 'Kolay',
    front: { ...F_BI, ...F_FOREARM },
    back: {},
    legend: [
      { role: 'primary', name: 'Biceps' },
      { role: 'secondary', name: 'Önkol' },
    ],
    steps: [
      { t: 'Tutuş', s: 'Bar omuz genişliğinde, avuçlar yukarı (supinasyon)' },
      { t: 'Sabitlen', s: 'Dirsekler vücuda yapışık, sadece ön kol hareket eder' },
      { t: 'Kaldır', s: 'Barı kontrollü yukarı çek, tepe noktada 1-2 sn sık' },
      { t: 'İndir', s: '4 saniyede kontrollü olarak başlangıca dön' },
    ],
    tips: [
      'Sallanarak hız alma — izole çalış',
      'Tam hareket aralığı kullan',
      'Negatif (iniş) fazını yavaşlat',
    ],
  },

  hammerCurl: {
    id: 'hammerCurl', name: 'Hammer Curl', category: 'arms', muscleGroup: 'arms',
    equipment: 'dumbbell', defaultRestSec: 60, difficulty: 'Kolay',
    front: { ...F_BI, ...F_FOREARM },
    back: {},
    legend: [
      { role: 'primary', name: 'Brachialis' },
      { role: 'primary', name: 'Biceps' },
      { role: 'primary', name: 'Önkol (Brachioradialis)' },
    ],
    steps: [
      { t: 'Tutuş', s: 'Dambıllar yanda, avuçlar birbirine bakacak şekilde' },
      { t: 'Kaldır', s: 'Bilek nötr (çekiç gibi), omuza doğru kaldır' },
      { t: 'Tepe', s: 'Üstte sık, 1 sn duraksat' },
      { t: 'İndir', s: 'Kontrollü olarak başa dön' },
    ],
    tips: [
      'Kol kalınlığı için en iyi hareket',
      'Önkol da çok aktif çalışır',
      'Alternatif yapabilirsin (tek tek)',
    ],
  },

  preacherCurl: {
    id: 'preacherCurl', name: 'Preacher Curl', category: 'arms', muscleGroup: 'arms',
    equipment: 'barbell', defaultRestSec: 60, difficulty: 'Orta',
    front: { ...F_BI, ...F_FOREARM },
    back: {},
    legend: [
      { role: 'primary', name: 'Biceps (alt baş)' },
    ],
    steps: [
      { t: 'Pozisyon', s: 'Kollar preacher pad üzerinde, omuz pad üstünde' },
      { t: 'Tutuş', s: 'EZ-bar veya düz bar, supinasyon' },
      { t: 'Kaldır', s: 'Bar omuz hizasına, dirsekler sabit' },
      { t: 'İndir', s: 'Tam uzanma noktasına yavaşça' },
    ],
    tips: [
      'İzole biceps çalışması — kopya yok',
      'Hafif kilo doğru form',
      'Negatif fazda esneme hissi olmalı',
    ],
  },

  tricepsPushdown: {
    id: 'tricepsPushdown', name: 'Triceps Pushdown', category: 'arms', muscleGroup: 'arms',
    equipment: 'cable', defaultRestSec: 60, difficulty: 'Kolay',
    front: { ...F_TRI, ...F_CORE },
    back: { b_tri_l: 'primary', b_tri_r: 'primary' },
    legend: [
      { role: 'primary', name: 'Triceps' },
    ],
    steps: [
      { t: 'Hazırlık', s: 'Kablo yüksek, halat veya bar tut' },
      { t: 'Sabitle', s: 'Dirsekler vücuda yapışık, gövde hafif öne' },
      { t: 'İt', s: 'Sadece dirsek hareket eder, aşağı it' },
      { t: 'Geri', s: 'Yavaşça 90°\'ye dön' },
    ],
    tips: [
      'Dirsekler dışa açılmamalı',
      'Üst kol sabit, sadece önkol hareket eder',
      'Tam uzatmada triceps\'i sık',
    ],
  },

  skullCrusher: {
    id: 'skullCrusher', name: 'Skull Crusher', category: 'arms', muscleGroup: 'arms',
    equipment: 'barbell', defaultRestSec: 75, difficulty: 'Orta',
    front: { ...F_TRI },
    back: { b_tri_l: 'primary', b_tri_r: 'primary' },
    legend: [
      { role: 'primary', name: 'Triceps (uzun baş)' },
    ],
    steps: [
      { t: 'Pozisyon', s: 'Sırt üstü bench, EZ-bar göğüs üzerinde tutulmuş' },
      { t: 'İndir', s: 'Sadece dirsek bük, barı alın hizasına in' },
      { t: 'İt', s: 'Triceps\'le yukarı uzat' },
      { t: 'Tepe', s: 'Üstte kilitleme yapma' },
    ],
    tips: [
      'Üst kol dik kalmalı — sallanmamalı',
      'Adı korkutucu ama doğru yapılırsa güvenli',
      'EZ-bar bilek için daha rahat',
    ],
  },

  overheadExtension: {
    id: 'overheadExtension', name: 'Overhead Triceps Extension', category: 'arms', muscleGroup: 'arms',
    equipment: 'dumbbell', defaultRestSec: 60, difficulty: 'Orta',
    front: { ...F_TRI, ...F_CORE },
    back: { b_tri_l: 'primary', b_tri_r: 'primary' },
    legend: [
      { role: 'primary', name: 'Triceps (uzun baş)' },
    ],
    steps: [
      { t: 'Hazırlık', s: 'Tek dambıl iki elle, başın üzerinde' },
      { t: 'İndir', s: 'Dirseğin etrafında dambılı arkaya in' },
      { t: 'Uzat', s: 'Triceps\'i kasarak yukarı uzat' },
      { t: 'Tepe', s: 'Üstte tam uzanma, kilitleme yok' },
    ],
    tips: [
      'Dirsekler kulağa yakın kalmalı',
      'Uzun baş aktif — kol arkası dolgun olur',
      'Gerilim hissetmek için tam aralık kullan',
    ],
  },

  // ============ KARIN ============
  plank: {
    id: 'plank', name: 'Plank', category: 'core', muscleGroup: 'core',
    equipment: 'bodyweight', defaultRestSec: 60, difficulty: 'Kolay',
    image: '/exercises/plank.png',
    front: { ...F_CORE, f_oblq_l: 'primary', f_oblq_r: 'primary', ...F_FRONT_DELT },
    back: { b_erect: 'secondary', b_lo_bk: 'stabilizer' },
    legend: [
      { role: 'primary', name: 'Karın (Rektus)' },
      { role: 'primary', name: 'Oblik' },
      { role: 'secondary', name: 'Erektör' },
    ],
    steps: [
      { t: 'Pozisyon', s: 'Yere yüz üstü, dirsekler omuz altında' },
      { t: 'Kaldır', s: 'Gövdeyi yerden kaldır, ayaklar parmak ucunda' },
      { t: 'Sabit', s: 'Düz çizgi: omuz-kalça-ayak bileği' },
      { t: 'Tut', s: 'Pozisyonu nefes alarak 30-60 sn tut' },
    ],
    tips: [
      'Kalça düşmemeli veya yükselmemeli',
      'Karın sıkı, glute sıkı',
      'Süreyi yavaş yavaş artır',
    ],
  },

  hangingLegRaise: {
    id: 'hangingLegRaise', name: 'Hanging Leg Raise', category: 'core', muscleGroup: 'core',
    equipment: 'bar', defaultRestSec: 75, difficulty: 'Zor',
    image: '/exercises/hanging-leg-raise.png',
    front: { ...F_CORE, f_oblq_l: 'secondary', f_oblq_r: 'secondary', f_hip: 'secondary' },
    back: {},
    legend: [
      { role: 'primary', name: 'Alt Karın' },
      { role: 'secondary', name: 'Hip Flexor' },
      { role: 'secondary', name: 'Oblik' },
    ],
    steps: [
      { t: 'Asılı pozisyon', s: 'Bar\'a tutun, vücut tam asılı' },
      { t: 'Kaldır', s: 'Bacakları düz veya dizleri bük, kalça hizasına' },
      { t: 'Tepe', s: 'Üstte karını sık, kontrollü tut' },
      { t: 'İndir', s: 'Yavaşça başa dön, salınım yapma' },
    ],
    tips: [
      'Salınım yapma — momentum hile',
      'Kolayı: knee raise (diz bük)',
      'Zoru: toes to bar',
    ],
  },

  cableCrunch: {
    id: 'cableCrunch', name: 'Cable Crunch', category: 'core', muscleGroup: 'core',
    equipment: 'cable', defaultRestSec: 60, difficulty: 'Kolay',
    image: '/exercises/cable-crunch.png',
    front: { ...F_CORE, f_oblq_l: 'secondary', f_oblq_r: 'secondary' },
    back: {},
    legend: [
      { role: 'primary', name: 'Karın (Rektus)' },
      { role: 'secondary', name: 'Oblik' },
    ],
    steps: [
      { t: 'Pozisyon', s: 'Diz çök, kablo halatı başın arkasında' },
      { t: 'Çek', s: 'Karını kasarak gövdeyi öne büküver' },
      { t: 'Tepe', s: 'Dirsekler uyluğa, karın tam kasılır' },
      { t: 'Geri', s: 'Yavaşça başlangıca dön' },
    ],
    tips: [
      'Hareket karından gelmeli — kalçayı kullanma',
      'Ağırlık kaldırma değil — sıkıştırma',
      'Üstte 1-2 sn duraksa',
    ],
  },

  russianTwist: {
    id: 'russianTwist', name: 'Russian Twist', category: 'core', muscleGroup: 'core',
    equipment: 'dumbbell', defaultRestSec: 45, difficulty: 'Kolay',
    front: { ...F_CORE, f_oblq_l: 'primary', f_oblq_r: 'primary' },
    back: {},
    legend: [
      { role: 'primary', name: 'Oblik' },
      { role: 'secondary', name: 'Karın (Rektus)' },
    ],
    steps: [
      { t: 'Pozisyon', s: 'Otur, dizler bükük, gövde 45° geri' },
      { t: 'Tut', s: 'İki elinde dambıl veya plate' },
      { t: 'Döndür', s: 'Gövdeyi sağa-sola döndür, ağırlık yere yakın' },
      { t: 'Tekrarla', s: 'Sürekli kontrollü hareket' },
    ],
    tips: [
      'Sırt düz kalmalı',
      'Oblik (yan karın) için harika',
      'Ayakları kaldırmak zorluğu artırır',
    ],
  },

  tricepsPushdown: {
    id: 'tricepsPushdown', name: 'Triceps Pushdown', category: 'arms', muscleGroup: 'arms',
    equipment: 'cable', defaultRestSec: 60, difficulty: 'Kolay',
    front: { f_tri_l: 'primary', f_tri_r: 'primary' },
    back: { b_tri_l: 'primary', b_tri_r: 'primary' },
    legend: [
      { role: 'primary', name: 'Triceps' }
    ],
    steps: [
      { t: 'Hazırlık', s: 'Kablo makinesinde halat veya düz bar kullanın.' },
      { t: 'Kavrama', s: 'Dirsekleri vücuda yapıştırın, hareket ettirmeyin.' },
      { t: 'İt', s: 'Elleri aşağı doğru iterek triceps kasını tam sıkıştırın.' },
      { t: 'Dön', s: 'Kontrollü bir şekilde başlangıç noktasına dönün.' }
    ],
    tips: [
      'Dirsekleri sabit tutmak izole çalışma için çok önemlidir.',
      'Bileklerinizi düz tutun.'
    ],
  },
  crunch: {
    id: 'crunch', name: 'Crunch', category: 'core', muscleGroup: 'core',
    equipment: 'bodyweight', defaultRestSec: 45, difficulty: 'Kolay',
    front: { f_core: 'primary' },
    back: {},
    legend: [
      { role: 'primary', name: 'Rektus Abdominis' }
    ],
    steps: [
      { t: 'Pozisyon', s: 'Sırt üstü uzanın, dizler bükük ayaklar yerde.' },
      { t: 'Kalkış', s: 'Omuzlarınızı yerden hafifçe kaldırarak karın kaslarınızı sıkıştırın.' },
      { t: 'Dön', s: 'Sırtınızı yavaşça yere indirin.' }
    ],
    tips: [
      'Boynunuzu çekmeyin, hareket karından gelmeli.',
      'Sadece omuzların kalkması yeterlidir, tam doğrulmaya gerek yok.'
    ],
  },
  seatedRow: {
    id: 'seatedRow', name: 'Seated Cable Row', category: 'back', muscleGroup: 'back',
    equipment: 'cable', defaultRestSec: 90, difficulty: 'Orta',
    front: { f_bicep_l: 'secondary', f_bicep_r: 'secondary' },
    back: { b_lat_l: 'primary', b_lat_r: 'primary', b_mid_bk: 'primary', b_trap: 'secondary' },
    legend: [
      { role: 'primary', name: 'Latissimus Dorsi' },
      { role: 'primary', name: 'Orta Sırt' },
      { role: 'secondary', name: 'Biceps' }
    ],
    steps: [
      { t: 'Pozisyon', s: 'Makineye oturun, ayaklarınızı desteklere yerleştirin, dizler hafif bükük.' },
      { t: 'Çek', s: 'Kolu karnınıza doğru çekerken kürek kemiklerinizi sıkıştırın.' },
      { t: 'Dön', s: 'Sırtınızın gerildiğini hissederek yavaşça başlangıca dönün.' }
    ],
    tips: [
      'Gövdenizi ileri geri çok fazla sallamayın.',
      'Çekerken omuzlarınızı aşağıda tutun.'
    ],
  },

}

export const EXERCISE_LIST = Object.values(EXERCISES)
