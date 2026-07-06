import { grade1 } from './grade1.js'
import { grade2 } from './grade2.js'
import { grade3 } from './grade3.js'
import { grade4 } from './grade4.js'
import { grade5 } from './grade5.js'

export const grades = { grade1, grade2, grade3, grade4, grade5 }
export const gradeList = [grade1, grade2, grade3, grade4, grade5]

export function getGrade(id) {
  return grades[id]
}

export function getUnit(gradeId, unitId) {
  const g = grades[gradeId]
  if (!g) return null
  return g.units.find((u) => u.id === unitId) || null
}

// 単元IDから所属学年を含めて探す(前提単元リンク用)
export function findUnitAnywhere(unitId) {
  for (const g of gradeList) {
    const u = g.units.find((x) => x.id === unitId)
    if (u) return { grade: g, unit: u }
  }
  return null
}
