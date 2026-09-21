export const BoardSkeleton = () => {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', animation: 'fadeIn 0.3s ease' }}>
      {/* Toolbar skeleton */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexShrink: 0 }}>
        <div style={{ height: 14, width: 140, borderRadius: 6 }} className="skeleton" />
        <div style={{ height: 36, width: 120, borderRadius: 40 }} className="skeleton" />
      </div>

      {/* Columns skeleton */}
      <div style={{ display: 'flex', gap: 16, height: '100%', overflow: 'hidden' }}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              width: 300,
              flexShrink: 0,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16,
              padding: 14,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            {/* Column header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <div style={{ height: 14, width: 80, borderRadius: 6 }} className="skeleton" />
              <div style={{ height: 20, width: 24, borderRadius: 20 }} className="skeleton" />
            </div>

            {/* Task cards */}
            {[1, 2, 3].map((j) => (
              <div
                key={j}
                style={{
                  height: j === 2 ? 88 : 72,
                  borderRadius: 10,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  padding: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div style={{ height: 12, width: `${60 + j * 12}%`, borderRadius: 4 }} className="skeleton" />
                {j === 2 && <div style={{ height: 10, width: '75%', borderRadius: 4 }} className="skeleton" />}
                <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                  <div style={{ height: 18, width: 52, borderRadius: 20 }} className="skeleton" />
                  <div style={{ height: 18, width: 64, borderRadius: 20 }} className="skeleton" />
                </div>
              </div>
            ))}

            {/* Add task button skeleton */}
            <div style={{ height: 32, borderRadius: 8, marginTop: 4 }} className="skeleton" />
          </div>
        ))}
      </div>
    </div>
  )
}