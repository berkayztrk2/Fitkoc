// Hedefe ve haftalık frekansa göre antrenman programları
// Her program: günler, her gün odak bölge ve egzersiz listesi (set/tekrar ile)

export const PROGRAMS = {

  // 6 gün — İleri seviye
  ppl: {
    id: 'ppl',
    name: 'Push / Pull / Legs',
    short: 'PPL',
    desc: 'Haftada 5-6 gün için. Hareket dinamiğine göre gruplandırma.',
    about: 'İtme-Çekme-Bacak programı, kasları hareket yönlerine göre bölen bilimsel bir sistemdir. Push günlerinde göğüs, omuz ve arka kol; Pull günlerinde sırt ve ön kol; Legs günlerinde ise alt vücut çalıştırılır.',
    benefits: ['Kas gruplarının sinerjik çalışması ve verimli gelişim', 'Çalışan kaslar dinlenirken diğer grupların antrene edilmesi', 'Haftada 2 kez kas uyarımı ile yüksek hipertrofi'],
    target: 'Orta ve ileri seviyede kas kütlesi kazanmak isteyenler',
    frequency: 6,
    level: 'İleri',
    forGoals: ['muscle', 'gain'],
    days: [
      {
        day: 'Pazartesi', focus: 'Push A',
        exercises: [
          { ex: 'bench', sets: 4, reps: '6-8' },
          { ex: 'inclineDbPress', sets: 3, reps: '8-10' },
          { ex: 'dbShoulderPress', sets: 3, reps: '8-10' },
          { ex: 'lateralRaise', sets: 4, reps: '12-15' },
          { ex: 'tricepsPushdown', sets: 3, reps: '10-12' },
        ],
      },
      {
        day: 'Salı', focus: 'Pull A',
        exercises: [
          { ex: 'deadlift', sets: 4, reps: '5' },
          { ex: 'pullup', sets: 4, reps: '6-10' },
          { ex: 'barbellRow', sets: 3, reps: '8-10' },
          { ex: 'facePull', sets: 3, reps: '12-15' },
          { ex: 'curl', sets: 3, reps: '10-12' },
        ],
      },
      {
        day: 'Çarşamba', focus: 'Legs A',
        exercises: [
          { ex: 'squat', sets: 4, reps: '6-8' },
          { ex: 'rdl', sets: 3, reps: '8-10' },
          { ex: 'legPress', sets: 3, reps: '10-12' },
          { ex: 'legCurl', sets: 3, reps: '10-12' },
          { ex: 'calfRaise', sets: 4, reps: '15-20' },
        ],
      },
      {
        day: 'Perşembe', focus: 'Push B',
        exercises: [
          { ex: 'inclineBench', sets: 4, reps: '6-8' },
          { ex: 'dbBench', sets: 3, reps: '8-10' },
          { ex: 'dips', sets: 3, reps: '8-12' },
          { ex: 'cableFly', sets: 3, reps: '12-15' },
          { ex: 'overheadExtension', sets: 3, reps: '10-12' },
        ],
      },
      {
        day: 'Cuma', focus: 'Pull B',
        exercises: [
          { ex: 'chinup', sets: 4, reps: '6-10' },
          { ex: 'tbarRow', sets: 3, reps: '8-10' },
          { ex: 'latPulldown', sets: 3, reps: '10-12' },
          { ex: 'reverseFly', sets: 3, reps: '12-15' },
          { ex: 'hammerCurl', sets: 3, reps: '10-12' },
        ],
      },
      {
        day: 'Cumartesi', focus: 'Legs B',
        exercises: [
          { ex: 'frontSquat', sets: 4, reps: '6-8' },
          { ex: 'lunge', sets: 3, reps: '10' },
          { ex: 'legExtension', sets: 3, reps: '12-15' },
          { ex: 'rdl', sets: 3, reps: '8-10' },
          { ex: 'hangingLegRaise', sets: 3, reps: '10-15' },
        ],
      },
    ],
  },

  // 4 gün — Orta-İleri
  upperLower: {
    id: 'upperLower',
    name: 'Upper / Lower',
    short: 'U/L',
    desc: 'Haftada 4 gün için ideal denge.',
    about: 'Vücudu üst ve alt olarak iki ana bölüme ayıran bu sistem, haftada 4 gün antrenman yapanlar için altın standarttır. Haftada iki gün üst vücut, iki gün de alt vücut yoğun şekilde hedeflenir.',
    benefits: ['Hacim ve toparlanma (recovery) arasında mükemmel denge', 'Her kas grubunu haftada 2 kez uyarma fırsatı', 'Güçlenirken dengeli kas gelişimi sağlama'],
    target: 'Haftada 4 gün zaman ayırabilen, dengeli gelişim hedefleyen orta seviye sporcular',
    frequency: 4,
    level: 'Orta',
    forGoals: ['muscle', 'gain', 'maintain'],
    days: [
      {
        day: 'Pazartesi', focus: 'Upper A',
        exercises: [
          { ex: 'bench', sets: 4, reps: '6-8' },
          { ex: 'barbellRow', sets: 4, reps: '6-8' },
          { ex: 'dbShoulderPress', sets: 3, reps: '8-10' },
          { ex: 'latPulldown', sets: 3, reps: '10-12' },
          { ex: 'curl', sets: 3, reps: '10-12' },
          { ex: 'tricepsPushdown', sets: 3, reps: '10-12' },
        ],
      },
      {
        day: 'Salı', focus: 'Lower A',
        exercises: [
          { ex: 'squat', sets: 4, reps: '6-8' },
          { ex: 'rdl', sets: 3, reps: '8-10' },
          { ex: 'legPress', sets: 3, reps: '10-12' },
          { ex: 'legCurl', sets: 3, reps: '10-12' },
          { ex: 'calfRaise', sets: 4, reps: '15-20' },
        ],
      },
      {
        day: 'Perşembe', focus: 'Upper B',
        exercises: [
          { ex: 'inclineBench', sets: 4, reps: '6-8' },
          { ex: 'pullup', sets: 4, reps: '6-10' },
          { ex: 'lateralRaise', sets: 4, reps: '12-15' },
          { ex: 'dumbbellRow', sets: 3, reps: '8-10' },
          { ex: 'hammerCurl', sets: 3, reps: '10-12' },
          { ex: 'skullCrusher', sets: 3, reps: '8-10' },
        ],
      },
      {
        day: 'Cuma', focus: 'Lower B',
        exercises: [
          { ex: 'deadlift', sets: 4, reps: '5' },
          { ex: 'frontSquat', sets: 3, reps: '8-10' },
          { ex: 'lunge', sets: 3, reps: '10' },
          { ex: 'legExtension', sets: 3, reps: '12-15' },
          { ex: 'plank', sets: 3, reps: '45sn' },
        ],
      },
    ],
  },

  // 3 gün — Başlangıç & Orta
  fullBody: {
    id: 'fullBody',
    name: 'Full Body',
    short: 'FB',
    desc: 'Haftada 3 gün, bileşke odaklı. Yeni başlayanlara ideal.',
    about: 'Her antrenmanda tüm vücut kaslarını aktif eden, bileşke (compound) hareketlere dayalı temel programdır. Spora yeni başlayanların adaptasyon sürecini hızlandırır.',
    benefits: ['Haftada 3 gün ile maksimum zaman tasarrufu', 'Temel hareketlerin formunu hızla öğrenme ve güçlenme', 'Metabolizma hızını ve yağ yakımını maksimize etme'],
    target: 'Spora yeni başlayanlar veya kısıtlı zamanı olanlar',
    frequency: 3,
    level: 'Başlangıç',
    forGoals: ['lose', 'maintain', 'muscle'],
    days: [
      {
        day: 'Pazartesi', focus: 'Tüm Vücut A',
        exercises: [
          { ex: 'squat', sets: 4, reps: '6-8' },
          { ex: 'bench', sets: 4, reps: '6-8' },
          { ex: 'barbellRow', sets: 3, reps: '8-10' },
          { ex: 'ohp', sets: 3, reps: '8-10' },
          { ex: 'plank', sets: 3, reps: '45sn' },
        ],
      },
      {
        day: 'Çarşamba', focus: 'Tüm Vücut B',
        exercises: [
          { ex: 'deadlift', sets: 3, reps: '5' },
          { ex: 'inclineDbPress', sets: 3, reps: '8-10' },
          { ex: 'pullup', sets: 3, reps: '6-10' },
          { ex: 'lateralRaise', sets: 3, reps: '12-15' },
          { ex: 'curl', sets: 3, reps: '10-12' },
        ],
      },
      {
        day: 'Cuma', focus: 'Tüm Vücut C',
        exercises: [
          { ex: 'frontSquat', sets: 3, reps: '8-10' },
          { ex: 'dips', sets: 3, reps: '8-12' },
          { ex: 'tbarRow', sets: 3, reps: '8-10' },
          { ex: 'rdl', sets: 3, reps: '8-10' },
          { ex: 'tricepsPushdown', sets: 3, reps: '10-12' },
        ],
      },
    ],
  },

  // Ekipmansız ev programı
  home: {
    id: 'home',
    name: 'Ev — Ekipmansız',
    short: 'Ev',
    desc: 'Hiç ekipman gerekmez, her yerde uygulanabilir.',
    about: 'Herhangi bir ekipmana ihtiyaç duymadan, sadece kendi vücut ağırlığınızla yapabileceğiniz fonksiyonel ev programıdır. Şınav ve plank gibi temel hareketlerle formu korumayı hedefler.',
    benefits: ['Sıfır ekipman ve maliyetle her yerde antrenman yapabilme', 'Fonksiyonel güç ve vücut kontrolü sağlama', 'Dayanıklılık ve çekirdek (core) bölgesini güçlendirme'],
    target: 'Evde spor yapmayı tercih edenler ve seyahatte olanlar',
    frequency: 3,
    level: 'Başlangıç',
    forGoals: ['lose', 'maintain'],
    days: [
      {
        day: 'Pazartesi', focus: 'Üst Vücut',
        exercises: [
          { ex: 'pushup', sets: 4, reps: '12-15' },
          { ex: 'plank', sets: 3, reps: '45sn' },
        ],
      },
      {
        day: 'Çarşamba', focus: 'Alt Vücut',
        exercises: [
          { ex: 'lunge', sets: 4, reps: '12' },
          { ex: 'plank', sets: 3, reps: '60sn' },
        ],
      },
      {
        day: 'Cuma', focus: 'Tüm Vücut',
        exercises: [
          { ex: 'pushup', sets: 3, reps: '15' },
          { ex: 'lunge', sets: 3, reps: '10' },
          { ex: 'plank', sets: 3, reps: '60sn' },
        ],
      },
    ],
  },

  // 4 gün — Bölgesel Split
  classicSplit: {
    id: 'classicSplit',
    name: 'Bölgesel Split',
    short: 'Bölgesel',
    desc: 'Göğüs/Arka Kol, Sırt/Ön Kol vb. ayrılmış popüler klasik sistem.',
    about: 'Geleneksel vücut geliştirmenin en popüler bölünmelerinden biridir. Birbirine yakın veya zıt çalışan kas gruplarını (Göğüs-Triceps gibi) eşleştirerek her bölgeyi derinlemesine yorar.',
    benefits: ['Antrenman yapılan kas grubunda maksimum pompa (pump) etkisi', 'Kasları izole ederek zayıf bölgeleri detaylıca geliştirme', 'Yüksek odaklı ve uygulaması eğlenceli antrenman yapısı'],
    target: 'Bölgesel hacim kazanmak ve kas detaylandırmak isteyen orta seviye sporcular',
    frequency: 4,
    level: 'Orta',
    forGoals: ['muscle', 'gain'],
    days: [
      {
        day: 'Pazartesi', focus: 'Göğüs & Arka Kol',
        exercises: [
          { ex: 'bench', sets: 4, reps: '8-10' },
          { ex: 'inclineDbPress', sets: 3, reps: '8-10' },
          { ex: 'cableFly', sets: 3, reps: '12-15' },
          { ex: 'dips', sets: 3, reps: '8-12' },
          { ex: 'tricepsPushdown', sets: 4, reps: '10-12' },
        ],
      },
      {
        day: 'Salı', focus: 'Sırt & Ön Kol',
        exercises: [
          { ex: 'deadlift', sets: 3, reps: '5' },
          { ex: 'pullup', sets: 4, reps: '8-10' },
          { ex: 'barbellRow', sets: 3, reps: '8-10' },
          { ex: 'curl', sets: 3, reps: '10-12' },
          { ex: 'hammerCurl', sets: 3, reps: '10-12' },
        ],
      },
      {
        day: 'Perşembe', focus: 'Bacak',
        exercises: [
          { ex: 'squat', sets: 4, reps: '6-8' },
          { ex: 'legPress', sets: 3, reps: '10-12' },
          { ex: 'legExtension', sets: 3, reps: '12-15' },
          { ex: 'legCurl', sets: 3, reps: '12-15' },
          { ex: 'calfRaise', sets: 4, reps: '15-20' },
        ],
      },
      {
        day: 'Cuma', focus: 'Omuz',
        exercises: [
          { ex: 'ohp', sets: 4, reps: '8-10' },
          { ex: 'dbShoulderPress', sets: 3, reps: '8-10' },
          { ex: 'lateralRaise', sets: 4, reps: '12-15' },
          { ex: 'facePull', sets: 3, reps: '12-15' },
          { ex: 'reverseFly', sets: 3, reps: '12-15' },
        ],
      },
    ],
  },

  // 5 gün — Bro Split
  broSplit: {
    id: 'broSplit',
    name: 'Bro Split',
    short: 'Bro Split',
    desc: 'Haftanın 5 günü, her gün tek bir kas grubuna odaklanılan ileri seviye hacim programı.',
    about: 'Haftanın her gününü tek bir ana kas grubuna (örn: Pazartesi sadece Göğüs) ayıran, klasik yüksek hacimli vücut geliştirme sistemidir.',
    benefits: ['Tek kas grubuna aşırı yükleme ile maksimal kas hasarı sağlama', 'Bir sonraki çalışmaya kadar 7 gün tam toparlanma süresi', 'Kas liflerini çok sayıda set ve tekrarla tam anlamıyla tüketme'],
    target: 'Yüksek hacimli antrenman tolere edebilen ileri seviye vücut geliştirmeciler',
    frequency: 5,
    level: 'İleri',
    forGoals: ['muscle', 'gain'],
    days: [
      {
        day: 'Pazartesi', focus: 'Göğüs',
        exercises: [
          { ex: 'bench', sets: 4, reps: '8-10' },
          { ex: 'inclineBench', sets: 3, reps: '8-10' },
          { ex: 'inclineDbPress', sets: 3, reps: '10-12' },
          { ex: 'cableFly', sets: 4, reps: '12-15' },
        ],
      },
      {
        day: 'Salı', focus: 'Sırt',
        exercises: [
          { ex: 'deadlift', sets: 4, reps: '5' },
          { ex: 'pullup', sets: 4, reps: '8-10' },
          { ex: 'barbellRow', sets: 3, reps: '8-10' },
          { ex: 'latPulldown', sets: 3, reps: '10-12' },
          { ex: 'tbarRow', sets: 3, reps: '10-12' },
        ],
      },
      {
        day: 'Çarşamba', focus: 'Omuz',
        exercises: [
          { ex: 'ohp', sets: 4, reps: '8-10' },
          { ex: 'dbShoulderPress', sets: 3, reps: '8-10' },
          { ex: 'lateralRaise', sets: 4, reps: '12-15' },
          { ex: 'facePull', sets: 4, reps: '12-15' },
        ],
      },
      {
        day: 'Perşembe', focus: 'Bacak',
        exercises: [
          { ex: 'squat', sets: 4, reps: '6-8' },
          { ex: 'legPress', sets: 3, reps: '10-12' },
          { ex: 'legExtension', sets: 3, reps: '12-15' },
          { ex: 'rdl', sets: 3, reps: '8-10' },
          { ex: 'calfRaise', sets: 4, reps: '15-20' },
        ],
      },
      {
        day: 'Cuma', focus: 'Kollar (Biceps & Triceps)',
        exercises: [
          { ex: 'curl', sets: 4, reps: '10-12' },
          { ex: 'dips', sets: 4, reps: '8-12' },
          { ex: 'hammerCurl', sets: 3, reps: '10-12' },
          { ex: 'tricepsPushdown', sets: 3, reps: '10-12' },
        ],
      },
    ],
  },

  // 6 gün — Arnold Split
  arnoldSplit: {
    id: 'arnoldSplit',
    name: 'Arnold Split',
    short: 'Arnold',
    desc: 'Göğüs/Sırt, Omuz/Kol ve Bacak odaklı yoğun 6 günlük hipertrofi programı.',
    about: 'Arnold Schwarzenegger tarafından ünlenen, zıt çalışan (antagonist) kas gruplarını (Göğüs-Sırt) bir araya getiren 6 günlük efsanevi bir yüksek frekans programıdır.',
    benefits: ['Zıt kasların birlikte çalışmasıyla üst düzey kan akışı (muazzam pump)', 'Omuzlar ve kollar için ayrılmış özel gelişim günleri', 'Haftada iki kez tüm vücudu yüksek hacimle uyararak hızlı büyüme'],
    target: 'Zamanı geniş ve toparlanma kapasitesi (beslenme/uyku) çok iyi olan ileri sporcular',
    frequency: 6,
    level: 'İleri',
    forGoals: ['muscle', 'gain'],
    days: [
      {
        day: 'Pazartesi', focus: 'Göğüs & Sırt',
        exercises: [
          { ex: 'bench', sets: 4, reps: '8-10' },
          { ex: 'pullup', sets: 4, reps: '8-10' },
          { ex: 'inclineDbPress', sets: 3, reps: '8-10' },
          { ex: 'barbellRow', sets: 3, reps: '8-10' },
          { ex: 'cableFly', sets: 3, reps: '12-15' },
        ],
      },
      {
        day: 'Salı', focus: 'Omuz & Kol',
        exercises: [
          { ex: 'ohp', sets: 4, reps: '8-10' },
          { ex: 'lateralRaise', sets: 4, reps: '12-15' },
          { ex: 'curl', sets: 3, reps: '10-12' },
          { ex: 'dips', sets: 3, reps: '8-12' },
          { ex: 'tricepsPushdown', sets: 3, reps: '10-12' },
        ],
      },
      {
        day: 'Çarşamba', focus: 'Bacak',
        exercises: [
          { ex: 'squat', sets: 4, reps: '6-8' },
          { ex: 'rdl', sets: 3, reps: '8-10' },
          { ex: 'legPress', sets: 3, reps: '10-12' },
          { ex: 'legCurl', sets: 3, reps: '12-15' },
          { ex: 'calfRaise', sets: 4, reps: '15-20' },
        ],
      },
      {
        day: 'Perşembe', focus: 'Göğüs & Sırt',
        exercises: [
          { ex: 'inclineBench', sets: 4, reps: '8-10' },
          { ex: 'latPulldown', sets: 4, reps: '8-10' },
          { ex: 'dbBench', sets: 3, reps: '8-10' },
          { ex: 'tbarRow', sets: 3, reps: '8-10' },
          { ex: 'facePull', sets: 3, reps: '12-15' },
        ],
      },
      {
        day: 'Cuma', focus: 'Omuz & Kol',
        exercises: [
          { ex: 'dbShoulderPress', sets: 4, reps: '8-10' },
          { ex: 'lateralRaise', sets: 4, reps: '12-15' },
          { ex: 'hammerCurl', sets: 3, reps: '10-12' },
          { ex: 'tricepsPushdown', sets: 3, reps: '10-12' },
        ],
      },
      {
        day: 'Cumartesi', focus: 'Bacak',
        exercises: [
          { ex: 'frontSquat', sets: 4, reps: '6-8' },
          { ex: 'lunge', sets: 3, reps: '10' },
          { ex: 'legExtension', sets: 3, reps: '12-15' },
          { ex: 'calfRaise', sets: 4, reps: '15-20' },
        ],
      },
    ],
  },

  // 2 gün — Full Body (Zamanı Kısıtlılar)
  fullBodyTwo: {
    id: 'fullBodyTwo',
    name: 'Full Body (2 Gün)',
    short: 'FB 2',
    desc: 'Haftada sadece 2 gün gidebilenler için en temel ve etkili bileşke hareketler.',
    about: 'Yoğun programı nedeniyle haftada sadece 2 gün antrenman yapabilenler için tasarlanmış, temel bileşke egzersizleri barındıran maksimum verimli tam vücut programıdır.',
    benefits: ['Minimum zaman yatırımı ile mevcut formu koruma', 'Vücudun temel kas gruplarını paslanmaktan kurtarma', 'Sürdürülebilir ve pratik egzersiz rutini'],
    target: 'Yoğun iş/okul temposuna sahip sporcular veya spora yeni dönenler',
    frequency: 2,
    level: 'Başlangıç',
    forGoals: ['maintain', 'lose'],
    days: [
      {
        day: 'Gün 1', focus: 'Tüm Vücut A',
        exercises: [
          { ex: 'squat', sets: 4, reps: '6-8' },
          { ex: 'bench', sets: 4, reps: '6-8' },
          { ex: 'barbellRow', sets: 4, reps: '8-10' },
          { ex: 'dbShoulderPress', sets: 3, reps: '8-10' },
        ],
      },
      {
        day: 'Gün 2', focus: 'Tüm Vücut B',
        exercises: [
          { ex: 'deadlift', sets: 3, reps: '5' },
          { ex: 'inclineDbPress', sets: 3, reps: '8-10' },
          { ex: 'pullup', sets: 3, reps: '6-10' },
          { ex: 'lunge', sets: 3, reps: '10' },
        ],
      },
    ],
  },
}

// Haftalık frekansa göre öneri algoritması
export function recommendByFrequencyAndGoal(freq, goal, isHome = false) {
  if (isHome) return 'home';

  if (freq >= 6) {
    return goal === 'muscle' || goal === 'gain' ? 'arnoldSplit' : 'ppl';
  }
  if (freq === 5) {
    return 'broSplit';
  }
  if (freq === 4) {
    return goal === 'muscle' || goal === 'gain' ? 'classicSplit' : 'upperLower';
  }
  if (freq === 3) {
    return 'fullBody';
  }
  return 'fullBodyTwo';
}

export const PROGRAM_LIST = Object.values(PROGRAMS)
