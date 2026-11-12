import React from 'react';

export default function SimilarityMap({ songs, selectedIndex, onSelect, isDemo }) {
  const selected = songs[selectedIndex];
  if (!selected) return <p className="similarity-empty">No similar tracks were returned for this song.</p>;
  const score = Math.max(-1, Math.min(1, selected.similarity));
  const angle = Math.acos(score);
  const radius = 150;
  const point = { x: 64 + radius * Math.cos(angle), y: 208 - radius * Math.sin(angle) };
  const arc = { x: 64 + 48 * Math.cos(angle), y: 208 - 48 * Math.sin(angle) };

  return (
    <section className="similarity-map" aria-label="Cosine similarity explained">
      <div className="map-topline"><span><i /> VECTOR ALIGNMENT</span><span className="map-badge">{isDemo ? 'DEMO DATA' : 'LIVE RESULTS'}</span></div>
      <svg viewBox={songs.some(song => song.similarity < 0) ? "-110 0 460 270" : "0 0 350 270"} role="img" aria-label={`${selected.title}: cosine similarity ${score.toFixed(3)}, angle ${(angle * 180 / Math.PI).toFixed(1)} degrees. Smaller angles mean more similar embeddings.`}>
        <defs>
          <pattern id="map-grid" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="0.7" fill="#bcaee0" opacity=".2" /></pattern>
          <linearGradient id="vector-glow"><stop stopColor="#8872fa" /><stop offset="1" stopColor="#c6b6ff" /></linearGradient>
        </defs>
        <rect width="350" height="250" fill="url(#map-grid)" />
        <path d="M 64 58 A 150 150 0 0 1 214 208" className="unit-arc" />
        <path d="M 64 208 L 214 208" className="reference-vector" />
        <path d={`M 64 208 L 112 208 A 48 48 0 ${angle > Math.PI ? 1 : 0} 0 ${arc.x} ${arc.y} Z`} className="angle-sector" />
        {songs.map((song, index) => {
          const a = Math.acos(Math.max(-1, Math.min(1, song.similarity)));
          return <line key={song.title} x1="64" y1="208" x2={64 + radius * Math.cos(a)} y2={208 - radius * Math.sin(a)} className={`candidate-vector ${index === selectedIndex ? 'selected-vector' : ''}`} />;
        })}
        <circle cx="64" cy="208" r="5" fill="#fff" />
        <circle cx="214" cy="208" r="5" fill="#79e2d0" />
        <circle cx={point.x} cy={point.y} r="11" className="vector-halo" />
        <circle cx={point.x} cy={point.y} r="5" fill="#c6b6ff" />
        <text x="64" y="237" className="map-label">Shared origin</text>
        <text x="227" y="212" className="map-label reference-label">Your song</text>
        <text x={point.x + 15} y={point.y - 10} className="map-label match-label">Match {String(selectedIndex + 1).padStart(2, '0')}</text>
      </svg>
      <div className="map-metrics" aria-live="polite">
        <div><span>Cosine similarity</span><strong>{score.toFixed(3)}<small> / 1</small></strong></div>
        <div><span>Angle between songs</span><strong>{(angle * 180 / Math.PI).toFixed(1)}<small>°</small></strong></div>
      </div>
      <div className="match-switcher" aria-label="Choose a match to compare">
        {songs.map((song, index) => <button key={song.title} type="button" aria-pressed={index === selectedIndex} aria-label={`Compare match ${index + 1}: ${song.title}`} onClick={() => onSelect(index)}>{String(index + 1).padStart(2, '0')}</button>)}
      </div>
      <p className="map-explanation"><strong>Closer in direction. Closer in sound.</strong> The model turns each song into a vector of learned audio features. We compare your vector with the library using cosine similarity and rank the highest scores first. A smaller angle means a closer match, even across genres.</p>
      <p className="cosine-formula" aria-label="Cosine similarity equals the dot product of vectors a and b divided by the product of their lengths">cos(θ) = (a · b) / (‖a‖ ‖b‖)</p>
      <p className="map-footnote">Angle illustration of the score, not a projection of the full embedding. Similarity is not a probability.</p>
    </section>
  );
}
