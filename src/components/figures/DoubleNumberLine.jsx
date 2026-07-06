// 二重数直線(5年 単位量・速さ・割合)。上下2本の 数直線で
// 2つの 量の 対応を 見せ、「1あたり」や「かける・わる」の 関係を つかむ。
// props: top = {label, values:[..]}, bottom = {label, values:[..]}, unknownAt(index)
export default function DoubleNumberLine({ top, bottom, unknownAt = null }) {
  const w = 320
  const n = top.values.length
  const x = (i) => 40 + (i / (n - 1)) * (w - 70)
  const val = (arr, i) => (i === unknownAt ? '?' : arr[i])

  return (
    <svg viewBox={`0 0 ${w} 120`} width={w} height={120} className="max-w-full">
      <text x={4} y={26} fontSize="10" fontWeight="700" fill="#B08AA8">{top.label}</text>
      <line x1={40} y1={40} x2={w - 20} y2={40} stroke="#FF6FA5" strokeWidth="2.5" />
      <text x={4} y={98} fontSize="10" fontWeight="700" fill="#7A5FA0">{bottom.label}</text>
      <line x1={40} y1={82} x2={w - 20} y2={82} stroke="#C9A8E8" strokeWidth="2.5" />
      {top.values.map((_, i) => (
        <g key={i}>
          <line x1={x(i)} y1={36} x2={x(i)} y2={86} stroke="#EADCE6" strokeWidth="1" />
          <line x1={x(i)} y1={36} x2={x(i)} y2={44} stroke="#FF6FA5" strokeWidth="2" />
          <line x1={x(i)} y1={78} x2={x(i)} y2={86} stroke="#C9A8E8" strokeWidth="2" />
          <text x={x(i)} y={28} textAnchor="middle" fontSize="11" fontWeight="700" fill={i === unknownAt ? '#E24A7A' : '#5D4A55'}>
            {val(top.values, i)}
          </text>
          <text x={x(i)} y={104} textAnchor="middle" fontSize="11" fontWeight="700" fill={i === unknownAt ? '#E24A7A' : '#5D4A55'}>
            {val(bottom.values, i)}
          </text>
        </g>
      ))}
    </svg>
  )
}
