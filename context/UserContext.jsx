import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  calcBMI, bmiCategory, calcBMR, calcTDEE, targetCalories, calcMacros,
  waterTarget, GOALS,
} from '../lib/calc'

const UserContext = createContext(null)

const STORAGE_KEY = 'fitkoc-profile'
const LOG_KEY = 'fitkoc-workout-log'
const PROG_KEY = 'fitkoc-selected-program'
const CUSTOM_KEY = 'fitkoc-custom-programs'
const XP_KEY = 'fitkoc-muscle-xp'

export function UserProvider({ children }) {
  const [isReady, setIsReady] = useState(false)
  
  const [profile, setProfile] = useState(null)
  const [meals, setMeals] = useState([])
  const [waterMl, setWaterMl] = useState(0)
  const [burnedCal, setBurnedCal] = useState(0)
  const [workoutLog, setWorkoutLog] = useState({})
  const [selectedProgram, setSelectedProgramState] = useState(null)
  const [customPrograms, setCustomProgramsState] = useState({})
  const [muscleXP, setMuscleXP] = useState({})
  const [fatigueMap, setFatigueMap] = useState({})
  const [yesterdayBalance, setYesterdayBalance] = useState(0)
  const [userAuth, setUserAuth] = useState(null)
  
  const [streak, setStreak] = useState(0)
  const [lastStreakDate, setLastStreakDate] = useState(null)
  const [unlockedBadges, setUnlockedBadges] = useState([])

  // Türetilmiş Değerler
  const derived = useMemo(() => {
    if (!profile) return null
    const bmi = calcBMI(profile.heightCm, profile.weightKg)
    const cat = bmiCategory(bmi)
    const bmr = calcBMR(profile)
    const tdee = calcTDEE(bmr, profile.activity)
    const baseTargetCal = targetCalories(tdee, profile.goal)
    
    const adaptation = Math.min(200, Math.max(-200, yesterdayBalance * -0.2))
    const targetCal = Math.round(baseTargetCal + adaptation)

    const macros = calcMacros(targetCal, profile.weightKg, profile.goal)
    const water = waterTarget(profile.weightKg, profile.activity)
    const goalInfo = GOALS[profile.goal] || GOALS.maintain
    return { bmi, cat, bmr, tdee, targetCal, baseTargetCal, adaptation, macros, water, goalInfo }
  }, [profile, yesterdayBalance])

  const consumed = useMemo(() => {
    return meals.reduce(
      (acc, m) => ({
        calories: acc.calories + (m.calories || 0),
        protein: acc.protein + (m.protein || 0),
        carbs: acc.carbs + (m.carbs || 0),
        fat: acc.fat + (m.fat || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    )
  }, [meals])

  // Asenkron Yükleme (App Başlangıcında)
  useEffect(() => {
    async function loadData() {
      try {
        const keys = [
          STORAGE_KEY,
          LOG_KEY,
          PROG_KEY,
          CUSTOM_KEY,
          'fitkoc-fatigue',
          'fitkoc-balance',
          'fitkoc-auth',
          XP_KEY,
          'fitkoc-streak',
          'fitkoc-streak-date',
          'fitkoc-badges'
        ]

        const pairs = await AsyncStorage.multiGet(keys)
        const data = Object.fromEntries(pairs)

        const rawProfile = data[STORAGE_KEY]
        const rawLog = data[LOG_KEY]
        const rawProg = data[PROG_KEY]
        const rawCustom = data[CUSTOM_KEY]
        const rawFatigue = data['fitkoc-fatigue']
        const rawBalance = data['fitkoc-balance']
        const rawAuth = data['fitkoc-auth']
        const rawXP = data[XP_KEY]
        const rawStreak = data['fitkoc-streak']
        const rawStreakDate = data['fitkoc-streak-date']
        const rawBadges = data['fitkoc-badges']

        if (rawProfile) setProfile(JSON.parse(rawProfile))
        if (rawLog) setWorkoutLog(JSON.parse(rawLog))
        if (rawProg) setSelectedProgramState(rawProg)
        if (rawCustom) setCustomProgramsState(JSON.parse(rawCustom))
        if (rawFatigue) setFatigueMap(JSON.parse(rawFatigue))
        if (rawBalance) setYesterdayBalance(Number(rawBalance))
        if (rawAuth) setUserAuth(JSON.parse(rawAuth))
        if (rawXP) setMuscleXP(JSON.parse(rawXP))
        if (rawStreak) setStreak(Number(rawStreak))
        if (rawStreakDate) setLastStreakDate(rawStreakDate)
        if (rawBadges) setUnlockedBadges(JSON.parse(rawBadges))
        
      } catch (e) {
        console.log('Veriler yüklenirken hata:', e)
      } finally {
        setIsReady(true)
      }
    }
    loadData()
  }, [])

  // Değişiklikleri AsyncStorage'a kaydet (Debounce eklenebilir ama şu an direkt kaydediyoruz)
  useEffect(() => {
    if (!isReady) return
    if (profile) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
    else AsyncStorage.removeItem(STORAGE_KEY)
  }, [profile, isReady])

  useEffect(() => {
    if (!isReady) return
    AsyncStorage.setItem(LOG_KEY, JSON.stringify(workoutLog))
  }, [workoutLog, isReady])

  useEffect(() => {
    if (!isReady) return
    if (selectedProgram) AsyncStorage.setItem(PROG_KEY, selectedProgram)
    else AsyncStorage.removeItem(PROG_KEY)
  }, [selectedProgram, isReady])

  useEffect(() => {
    if (!isReady) return
    AsyncStorage.setItem(CUSTOM_KEY, JSON.stringify(customPrograms))
  }, [customPrograms, isReady])

  useEffect(() => {
    if (!isReady) return
    AsyncStorage.setItem('fitkoc-fatigue', JSON.stringify(fatigueMap))
  }, [fatigueMap, isReady])

  useEffect(() => {
    if (!isReady) return
    AsyncStorage.setItem('fitkoc-balance', String(yesterdayBalance))
  }, [yesterdayBalance, isReady])

  useEffect(() => {
    if (!isReady) return
    if (userAuth) AsyncStorage.setItem('fitkoc-auth', JSON.stringify(userAuth))
    else AsyncStorage.removeItem('fitkoc-auth')
  }, [userAuth, isReady])

  useEffect(() => {
    if (!isReady) return
    AsyncStorage.setItem('fitkoc-streak', String(streak))
    if (lastStreakDate) AsyncStorage.setItem('fitkoc-streak-date', String(lastStreakDate))
    AsyncStorage.setItem('fitkoc-badges', JSON.stringify(unlockedBadges))
  }, [streak, lastStreakDate, unlockedBadges, isReady])

  // Streak Sıfırlama Kontrolü (App ilk açıldığında)
  useEffect(() => {
    if (!isReady) return
    const today = new Date().toISOString().slice(0, 10)
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
    if (lastStreakDate && lastStreakDate !== today && lastStreakDate !== yesterday) {
      setStreak(0)
    }
  }, [isReady, lastStreakDate])

  // Hedef Tamamlanınca Streak Artırma
  useEffect(() => {
    if (!isReady || !derived) return
    const today = new Date().toISOString().slice(0, 10)
    
    // Kalori hedefine ulaşıldı mı? (Esneklik payı %85)
    if (consumed.calories > 0 && consumed.calories >= derived.targetCal * 0.85) {
      if (lastStreakDate !== today) {
        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
        if (lastStreakDate === yesterday) {
          setStreak(prev => prev + 1)
        } else {
          setStreak(1)
        }
        setLastStreakDate(today)
      }
    }
  }, [consumed.calories, derived, isReady, lastStreakDate])

  // Rozet (Badge) Kontrolü
  useEffect(() => {
    if (!isReady) return
    const newBadges = [...unlockedBadges]
    let changed = false
    const unlock = (id) => {
      if (!newBadges.includes(id)) {
        newBadges.push(id)
        changed = true
      }
    }
    
    if (streak >= 3) unlock('streak_3')
    if (streak >= 7) unlock('streak_7')
    if (Object.keys(customPrograms).length > 0) unlock('first_custom_program')
    
    let totalWorkouts = 0
    Object.values(workoutLog).forEach(logs => { totalWorkouts += logs.length })
    if (totalWorkouts >= 1) unlock('first_workout')
    if (totalWorkouts >= 10) unlock('workout_10')
    if (totalWorkouts >= 100) unlock('workout_100')

    if (changed) setUnlockedBadges(newBadges)
  }, [streak, customPrograms, workoutLog, unlockedBadges, isReady])

  const completeOnboarding = (data) => setProfile(data)
  const updateProfile = (data) => setProfile(prev => ({ ...prev, ...data }))
  const setSelectedProgram = (id) => setSelectedProgramState(id)

  const saveCustomProgram = (prog) => {
    setCustomProgramsState(prev => ({ ...prev, [prog.id]: prog }))
  }
  const deleteCustomProgram = (id) => {
    setCustomProgramsState(prev => {
      const next = { ...prev }
      delete next[id]
      return next
    })
    if (selectedProgram === id) setSelectedProgramState(null)
  }

  const addFatigue = (muscles, amount = 30) => {
    setFatigueMap(prev => {
      const next = { ...prev }
      muscles.forEach(m => {
        next[m] = Math.min(100, (next[m] || 0) + amount)
      })
      return next
    })
  }

  const recoverFatigue = (amount = 20) => {
    setFatigueMap(prev => {
      const next = { ...prev }
      for (const m in next) {
        next[m] = Math.max(0, next[m] - amount)
        if (next[m] === 0) delete next[m]
      }
      return next
    })
  }

  const resetProfile = async () => {
    await AsyncStorage.multiRemove([STORAGE_KEY, LOG_KEY, PROG_KEY, CUSTOM_KEY, 'fitkoc-fatigue', 'fitkoc-balance', 'fitkoc-auth'])
    setProfile(null)
    setMeals([])
    setWaterMl(0)
    setBurnedCal(0)
    setWorkoutLog({})
    setSelectedProgramState(null)
    setCustomProgramsState({})
    setFatigueMap({})
    setUserAuth(null)
  }

  const addMeal = (meal) => setMeals((prev) => [...prev, { id: Date.now(), ...meal }])
  const removeMeal = (id) => setMeals((prev) => prev.filter((m) => m.id !== id))
  const addWater = (ml) => setWaterMl((prev) => Math.max(0, prev + ml))
  const addXP = async (muscles, amount) => {
    setMuscleXP(prev => {
      const next = { ...prev };
      muscles.forEach(m => {
        next[m] = (next[m] || 0) + amount;
      });
      AsyncStorage.setItem(XP_KEY, JSON.stringify(next));
      return next;
    });
  };

  const resetWater = () => setWaterMl(0)

  // Workout Log Helpers
  const todayKey = () => new Date().toISOString().slice(0, 10)

  const todaySession = (exId) => {
    const list = workoutLog[exId] || []
    const t = todayKey()
    const found = list.find((s) => s.date === t)
    return found || { date: t, sets: [] }
  }

  const lastSession = (exId) => {
    const list = workoutLog[exId] || []
    const t = todayKey()
    return list.filter((s) => s.date !== t).slice(-1)[0] || null
  }

  const recordSet = (exId, setIdx, set) => {
    setWorkoutLog((prev) => {
      const list = prev[exId] || []
      const t = todayKey()
      let session = list.find((s) => s.date === t)
      let nextList
      if (session) {
        const nextSets = [...session.sets]
        if (setIdx == null || setIdx >= nextSets.length) {
          nextSets.push(set)
        } else {
          nextSets[setIdx] = set
        }
        const nextSession = { ...session, sets: nextSets }
        nextList = list.map((s) => (s.date === t ? nextSession : s))
      } else {
        nextList = [...list, { date: t, sets: [set] }]
      }
      return { ...prev, [exId]: nextList }
    })
  }

  const clearTodaySets = (exId) => {
    setWorkoutLog((prev) => {
      const list = prev[exId] || []
      const t = todayKey()
      return { ...prev, [exId]: list.filter((s) => s.date !== t) }
    })
  }

  const oneRM = (weight, reps) => {
    if (!weight || !reps) return 0
    return Math.round(weight * (1 + reps / 30))
  }

  const bestSet = (exId) => {
    const list = workoutLog[exId] || []
    let best = null
    for (const s of list) {
      for (const set of s.sets) {
        const rm = oneRM(set.weight, set.reps)
        if (!best || rm > best.rm) best = { ...set, rm, date: s.date }
      }
    }
    return best
  }

  const login = (email, password) => { setUserAuth({ email, isPro: false, avatarURL: null }) }
  const register = (email, password) => { setUserAuth({ email, isPro: false, avatarURL: null }) }
  const logout = () => { setUserAuth(null) }
  const upgradeToPro = () => { setUserAuth(prev => prev ? { ...prev, isPro: true } : prev) }
  const updateAvatar = (url) => { setUserAuth(prev => prev ? { ...prev, avatarURL: url } : prev) }

  const value = {
    isReady, // Componentlerin beklemesi için
    profile, derived, consumed,
    meals, waterMl, burnedCal,
    completeOnboarding, updateProfile, resetProfile,
    addMeal, removeMeal, addWater, resetWater, setBurnedCal,
    workoutLog, todaySession, lastSession,
    recordSet, clearTodaySets, oneRM, bestSet,
    selectedProgram, setSelectedProgram,
    customPrograms, saveCustomProgram, deleteCustomProgram,
    fatigueMap, addFatigue, recoverFatigue,
    yesterdayBalance, setYesterdayBalance,
    userAuth, isAuth: !!userAuth, isPro: userAuth?.isPro || false,
    login, register, logout, upgradeToPro, updateAvatar,
    muscleXP, addXP,
    streak, lastStreakDate, unlockedBadges
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUser must be used within UserProvider')
  return ctx
}
