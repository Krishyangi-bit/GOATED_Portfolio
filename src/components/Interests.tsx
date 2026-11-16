import { ORIGIN } from '../content/origin';
import './Interests.css';

type Key = (typeof ORIGIN.file.interests)[number]['key'];

/** Tiny looping illustration per interest. Decorative; the label carries the meaning. */
function Art({ k }: { k: Key }) {
  if (k === 'yap') {
    return (
      <div className="int-art int-art--yap" aria-hidden="true">
        <span className="int-yap__bubble">
          <b>yap</b>
          <b>yap</b>
          <b>yap!</b>
        </span>
        <span className="int-yap__bubble int-yap__bubble--small">
          <b>…and</b>
          <b>another</b>
          <b>thing</b>
        </span>
      </div>
    );
  }
  if (k === 'music') {
    return (
      <div className="int-art int-art--music" aria-hidden="true">
        <span className="int-eq">
          {[0, 1, 2, 3, 4].map((i) => (
            <i key={i} style={{ ['--i' as string]: i }} />
          ))}
        </span>
        <span className="int-note int-note--1">♪</span>
        <span className="int-note int-note--2">♫</span>
        <span className="int-note int-note--3">♪</span>
      </div>
    );
  }
  // word search: CODE hides in row 2 and gets circled
  const grid = ['MUSICK', 'XCODEW', 'YAPQRT', 'FUNBUG'];
  return (
    <div className="int-art int-art--ws" aria-hidden="true">
      <div className="int-ws">
        {grid.map((row, r) => (
          <div key={r} className="int-ws__row">
            {row.split('').map((ch, c) => (
              <span key={c} className={r === 1 && c >= 1 && c <= 4 ? 'is-word' : ''}>
                {ch}
              </span>
            ))}
          </div>
        ))}
        <span className="int-ws__circle" />
      </div>
    </div>
  );
}

export function Interests() {
  return (
    <section className="interests" aria-labelledby="interests-title">
      <h4 id="interests-title" className="interests__title">
        Off-duty interests
      </h4>
      <ul className="interests__list">
        {ORIGIN.file.interests.map((it, i) => (
          <li key={it.key} className={`interest interest--${it.key}`} data-reveal style={{ ['--tilt' as string]: `${[-1.6, 1.2, -0.8][i]}deg` }}>
            <Art k={it.key} />
            <strong className="interest__label">{it.label}</strong>
            <span className="interest__quip">{it.quip}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
