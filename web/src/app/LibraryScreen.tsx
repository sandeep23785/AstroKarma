// Illustrative content for now. In Phase 5 this aggregates real saved data
// (AI-generated flashcards) queried by planet/house/sign/tag. See docs/SPEC.md §10.
const LIBRARY_CARDS = [
  {
    title: 'Lagna & the 1st house',
    count: '6 notes',
    body: 'Planets on the ascendant colour the whole personality. Sun on the Lagna → identity built on visibility and leadership; Budha-Aditya adds sharp expression.',
    tags: ['#lagna', '#budha-aditya', '#identity'],
  },
  {
    title: 'Mars by house',
    count: '9 notes',
    body: 'Mars in the 10th = relentless, steady career engine (earth signs especially). In the 7th it can heat up partnerships — direct, impatient with delay.',
    tags: ['#mars', '#10th-house', '#drive'],
  },
  {
    title: 'Rahu / Ketu axis',
    count: '4 notes',
    body: 'Rahu in the 6th pours ambition into work, service and problem-solving; Ketu opposite in the 12th quietly detaches. Watch over-identification with the fight.',
    tags: ['#rahu', '#nodes', '#6-12-axis'],
  },
  {
    title: 'Saturn lessons',
    count: '5 notes',
    body: 'Saturn delays then secures. In the 7th, partnerships arrive late but endure; the lesson is patience and earned trust rather than denial.',
    tags: ['#saturn', '#patience', '#7th-house'],
  },
]

export function LibraryScreen() {
  return (
    <div style={{ padding: '28px 30px' }}>
      <div style={{ maxWidth: 860 }}>
        <h1 style={{ fontSize: 28 }}>Learning library</h1>
        <p style={{ margin: '6px 0 22px', fontSize: 13.5, color: 'var(--sub-text)' }}>
          Findings you've saved across charts, grouped by what you were studying.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {LIBRARY_CARDS.map((c) => (
            <div
              key={c.title}
              style={{
                border: '1px solid var(--hairline)',
                borderRadius: 14,
                background: 'var(--surface)',
                padding: '18px 20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <h3 style={{ fontSize: 17 }}>{c.title}</h3>
                <span
                  style={{
                    fontSize: 11.5,
                    color: 'var(--sub-text)',
                    padding: '4px 10px',
                    borderRadius: 14,
                    background: 'var(--surface-2)',
                    border: '1px solid var(--hairline)',
                  }}
                >
                  {c.count}
                </span>
              </div>
              <p style={{ margin: '0 0 10px', fontSize: 13.5, lineHeight: 1.6, color: 'var(--ink)' }}>{c.body}</p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {c.tags.map((t) => (
                  <span
                    key={t}
                    style={{
                      fontSize: 11.5,
                      padding: '4px 9px',
                      borderRadius: 6,
                      background: 'var(--surface-2)',
                      border: '1px solid var(--hairline)',
                      color: 'var(--sub-text)',
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
