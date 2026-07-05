// ふりがな表示(§4.2)。`｜漢字《かんじ》` 記法をルビに変換。
// furigana=false のときは読みを外して漢字のみ表示。
export default function Furigana({ text, furigana = true }) {
  if (!text) return null
  const parts = []
  const re = /｜([^《]+)《([^》]+)》/g
  let last = 0
  let m
  let key = 0
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index))
    if (furigana) {
      parts.push(
        <ruby key={key++}>
          {m[1]}
          <rt>{m[2]}</rt>
        </ruby>,
      )
    } else {
      parts.push(m[1])
    }
    last = re.lastIndex
  }
  if (last < text.length) parts.push(text.slice(last))
  // 改行を活かす
  return (
    <>
      {parts.map((p, i) =>
        typeof p === 'string'
          ? p.split('\n').map((line, j, arr) => (
              <span key={`${i}-${j}`}>
                {line}
                {j < arr.length - 1 && <br />}
              </span>
            ))
          : p,
      )}
    </>
  )
}
