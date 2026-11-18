const CORES = ['#00694a', '#3b4fa8', '#f0a43a', '#9aa3b5'];

export default function Donut({ titulo, centro, segmentos }) {
  const total = segmentos.reduce((s, x) => s + x.valor, 0) || 1;
  const R = 40, C = 2 * Math.PI * R;
  let acc = 0;
  return (
    <figure className="donut">
      <svg viewBox="0 0 100 100" role="img" aria-label={`${titulo}: ${segmentos.map((s) => `${s.label} ${Math.round((s.valor / total) * 100)}%`).join(', ')}`}>
        <g transform="rotate(-90 50 50)">
          {segmentos.map((s, i) => {
            const len = (s.valor / total) * C;
            const el = (
              <circle key={s.label} cx="50" cy="50" r={R} fill="none" stroke={CORES[i % CORES.length]}
                      strokeWidth="14" strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-acc} />
            );
            acc += len;
            return el;
          })}
        </g>
        <text x="50" y="52" textAnchor="middle" className="donut-center">{centro}</text>
      </svg>
      <figcaption>
        <ul className="legend">
          {segmentos.map((s, i) => (
            <li key={s.label}>
              <span className="dot" style={{ background: CORES[i % CORES.length] }} aria-hidden="true" />
              {s.label} <strong>{Math.round((s.valor / total) * 100)}%</strong>
            </li>
          ))}
        </ul>
      </figcaption>
    </figure>
  );
}
