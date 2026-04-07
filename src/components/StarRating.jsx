import { useState } from 'react'

function Star({ size, state, id }) {
  const points = '12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2'
  const clipId = `star-half-${id}`

  if (state === 'full') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points={points} />
      </svg>
    )
  }

  if (state === 'half') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
        <defs>
          <clipPath id={clipId}>
            <rect x="0" y="0" width="12" height="24" />
          </clipPath>
        </defs>
        <polygon points={points} fill="none" stroke="currentColor" strokeWidth="1.5" />
        <polygon points={points} fill="currentColor" stroke="currentColor" strokeWidth="1.5" clipPath={`url(#${clipId})`} />
      </svg>
    )
  }

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points={points} />
    </svg>
  )
}

export default function StarRating({ value, onChange, readonly = false, size = 'md' }) {
  const [hovered, setHovered] = useState(null)
  const px = size === 'sm' ? 13 : 20
  const display = hovered ?? value ?? 0

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const state = display >= star ? 'full' : display >= star - 0.5 ? 'half' : 'empty'

        return (
          <div
            key={star}
            className={`relative shrink-0 text-[#b48fe0] transition-transform duration-75 ${
              readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
            } ${state === 'empty' ? 'text-[#d4bef0]' : 'text-[#b48fe0]'}`}
            style={{ width: px, height: px }}
            onMouseLeave={() => !readonly && setHovered(null)}
          >
            <Star size={px} state={state} id={`${star}`} />
            {!readonly && (
              <>
                <div
                  className="absolute inset-0 w-1/2"
                  onMouseEnter={() => setHovered(star - 0.5)}
                  onClick={() => onChange?.(hovered)}
                />
                <div
                  className="absolute inset-0 left-1/2"
                  onMouseEnter={() => setHovered(star)}
                  onClick={() => onChange?.(hovered)}
                />
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}
