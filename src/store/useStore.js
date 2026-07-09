import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { todayKey } from '../lib/date.js'

// マスタリー閾値・スコア変動(§3.4 / §6.4)
const CORRECT_BASE = 5
const WRONG_DELTA = -3
const MASTER_SCORE = 90

const emptyUnit = () => ({
  masteryScore: 0,
  level: 1, // 1=易 2=中 3=難
  lastStudied: null,
  mastered: false,
  hardStreak: 0, // 難レベルでの連続正解
})

function applyAnswer(unit, { correct, difficulty, combo }) {
  const u = { ...(unit || emptyUnit()) }
  if (correct) {
    const bonus = Math.min(3, Math.max(0, combo - 1)) // 連続正解ボーナス +1〜+3
    const weight = difficulty // 難しい問題ほど重み
    u.masteryScore = Math.min(100, u.masteryScore + CORRECT_BASE + bonus + (weight - 1))
    if (u.level >= 3) u.hardStreak += 1
  } else {
    u.masteryScore = Math.max(0, u.masteryScore + WRONG_DELTA)
    u.hardStreak = 0
  }
  // 難易度レベルの昇降(閾値 30 / 70)
  if (u.masteryScore >= 70) u.level = 3
  else if (u.masteryScore >= 30) u.level = 2
  else u.level = 1
  // マスター判定:スコア90以上 かつ 難レベルで連続8問正解
  if (u.masteryScore >= MASTER_SCORE && u.hardStreak >= 8) u.mastered = true
  u.lastStudied = Date.now()
  return u
}

export const useStore = create(
  persist(
    (set, get) => ({
      // ---- 永続データ(UserProgress) ----
      selectedGrade: null, // 'grade1' | 'grade2' | ...
      unitProgress: {},
      subSkillProgress: {}, // 九九の段別など
      wrongHistory: {},
      lessonDone: {}, // 単元ID → レッスン完了(スターは初回のみ)
      stars: 0,
      ownedItems: ['ribbon-pink'],
      equippedItems: { hat: null, accessory: 'ribbon-pink' },
      studyCalendar: [],
      settings: {
        sound: true,
        furigana: true,
        carryMemo: true, // ひっ算の繰り上がりメモ表示
        dailyLimitMin: 0, // 0=無制限
      },

      // ---- アクション ----
      setGrade: (grade) => set({ selectedGrade: grade }),

      updateSetting: (key, value) =>
        set((s) => ({ settings: { ...s.settings, [key]: value } })),

      markStudiedToday: () =>
        set((s) => {
          const t = todayKey()
          if (s.studyCalendar.includes(t)) return {}
          return { studyCalendar: [...s.studyCalendar, t] }
        }),

      addStars: (n) => set((s) => ({ stars: s.stars + n })),

      markLessonDone: (unitId) =>
        set((s) => (s.lessonDone[unitId] ? {} : { lessonDone: { ...s.lessonDone, [unitId]: true } })),

      buyItem: (item) =>
        set((s) => {
          if (s.ownedItems.includes(item.id) || s.stars < item.price) return {}
          return { stars: s.stars - item.price, ownedItems: [...s.ownedItems, item.id] }
        }),

      equipItem: (slot, itemId) =>
        set((s) => ({ equippedItems: { ...s.equippedItems, [slot]: itemId } })),

      // 演習の1問回答を記録
      recordAnswer: ({ unitId, templateId, subSkill, correct, difficulty, combo }) =>
        set((s) => {
          const nextUnit = applyAnswer(s.unitProgress[unitId], { correct, difficulty, combo })
          const patch = {
            unitProgress: { ...s.unitProgress, [unitId]: nextUnit },
          }
          // 九九などのサブスキル
          if (subSkill) {
            const cur = s.subSkillProgress[subSkill]?.masteryScore ?? 0
            const nextScore = correct
              ? Math.min(100, cur + CORRECT_BASE + 1)
              : Math.max(0, cur + WRONG_DELTA)
            patch.subSkillProgress = {
              ...s.subSkillProgress,
              [subSkill]: { masteryScore: nextScore },
            }
          }
          // 間違い履歴(間隔反復用)
          if (!correct && templateId) {
            const prev = s.wrongHistory[templateId] || { count: 0 }
            patch.wrongHistory = {
              ...s.wrongHistory,
              [templateId]: { count: prev.count + 1, lastWrong: Date.now() },
            }
          }
          return patch
        }),

      resetAll: () =>
        set({
          selectedGrade: get().selectedGrade,
          unitProgress: {},
          subSkillProgress: {},
          wrongHistory: {},
          lessonDone: {},
          stars: 0,
          ownedItems: ['ribbon-pink'],
          equippedItems: { hat: null, accessory: 'ribbon-pink' },
          studyCalendar: [],
        }),
    }),
    {
      name: 'sansuu-land-progress-v2',
      partialize: (s) => ({
        selectedGrade: s.selectedGrade,
        unitProgress: s.unitProgress,
        subSkillProgress: s.subSkillProgress,
        wrongHistory: s.wrongHistory,
        lessonDone: s.lessonDone,
        stars: s.stars,
        ownedItems: s.ownedItems,
        equippedItems: s.equippedItems,
        studyCalendar: s.studyCalendar,
        settings: s.settings,
      }),
    },
  ),
)

// 単元の進捗状態ラベル(未学習 / 学習中 / マスター)
export function unitStatus(progress) {
  if (!progress || progress.masteryScore === 0) return 'new'
  if (progress.mastered) return 'mastered'
  return 'learning'
}
