import { sfx } from '../../lib/sound.js'

// 線対称・点対称(6年)。方眼に 1つの 点と 対称の軸(または中心)を えがき、
// 対応する 点の マスを タップして 答える 操作。
// props: cols, rows, point[r,c], axisCol(線対称) or center(点対称), onCommit, locked
export default function SymmetrySheet({ cols, rows, point, axisCol = null, center = null, onCommit, locked, cell = 34 }) {
  const tap = (r, c) => {
    if (locked) return
    sfx.tap()
    onCommit(`${r},${c}`)
  }
  const isGiven = (r, c) => r === point[0] && c === point[1]

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-sm font-bold text-ink/60">
        {axisCol != null ? '青い線を 対称の軸として、対応する 点は?' : '中心の点を 対称の中心として、対応する 点は?'}
      </div>
      <div className="relative" style={{ width: cols * cell, height: rows * cell }}>
        {/* 対称の軸(線対称) */}
        {axisCol != null && (
          <div className="absolute top-0 bottom-0 bg-blue-400" style={{ left: axisCol * cell - 1.5, width: 3 }} />
        )}
        {/* 対称の中心(点対称) */}
        {center && (
          <div
            className="absolute w-3 h-3 rounded-full bg-purple-500 -translate-x-1/2 -translate-y-1/2"
            style={{ left: center[1] * cell, top: center[0] * cell }}
          />
        )}
        {Array.from({ length: rows }).map((_, r) =>
          Array.from({ length: cols }).map((_, c) => (
            <button
              key={`${r},${c}`}
              onClick={() => tap(r, c)}
              disabled={locked}
              aria-label="マス"
              className={`absolute border border-pink/30 ${isGiven(r, c) ? 'bg-pink' : 'bg-white/70 hover:bg-lavender/40'}`}
              style={{ left: c * cell, top: r * cell, width: cell, height: cell }}
            />
          )),
        )}
      </div>
      <div className="text-xs text-ink/40">ピンクの マスと 対応する マスを タップ</div>
    </div>
  )
}
