import { useState, useCallback, useEffect } from 'react'
import { useStore } from './store/useStore.js'
import { setSpeechEnabled } from './lib/speech.js'
import { setSoundEnabled } from './lib/sound.js'

import TitleScreen from './screens/TitleScreen.jsx'
import GradeSelectScreen from './screens/GradeSelectScreen.jsx'
import HomeScreen from './screens/HomeScreen.jsx'
import ModeSelectScreen from './screens/ModeSelectScreen.jsx'
import LessonScreen from './screens/LessonScreen.jsx'
import PracticeScreen from './screens/PracticeScreen.jsx'
import ResultScreen from './screens/ResultScreen.jsx'
import KukuScreen from './screens/KukuScreen.jsx'
import KisekaeScreen from './screens/KisekaeScreen.jsx'
import CalendarScreen from './screens/CalendarScreen.jsx'
import ParentScreen from './screens/ParentScreen.jsx'

const screens = {
  title: TitleScreen,
  grade: GradeSelectScreen,
  home: HomeScreen,
  mode: ModeSelectScreen,
  lesson: LessonScreen,
  practice: PracticeScreen,
  result: ResultScreen,
  kuku: KukuScreen,
  kisekae: KisekaeScreen,
  calendar: CalendarScreen,
  parent: ParentScreen,
}

export default function App() {
  const [stack, setStack] = useState([{ screen: 'title' }])
  const settings = useStore((s) => s.settings)

  useEffect(() => {
    setSpeechEnabled(settings.sound)
    setSoundEnabled(settings.sound)
  }, [settings.sound])

  const go = useCallback((screen, extra = {}) => {
    setStack((s) => [...s, { screen, ...extra }])
  }, [])

  // replace: 履歴を積まずに置き換え(演習→リザルト等)
  const replace = useCallback((screen, extra = {}) => {
    setStack((s) => [...s.slice(0, -1), { screen, ...extra }])
  }, [])

  const back = useCallback(() => {
    setStack((s) => (s.length > 1 ? s.slice(0, -1) : s))
  }, [])

  const home = useCallback(() => {
    setStack([{ screen: 'title' }, { screen: 'home' }])
  }, [])

  const current = stack[stack.length - 1]
  const Screen = screens[current.screen] || TitleScreen
  const nav = { go, replace, back, home, canBack: stack.length > 1 }

  return (
    <div className="min-h-full w-full max-w-3xl mx-auto relative">
      <Screen nav={nav} route={current} />
    </div>
  )
}
