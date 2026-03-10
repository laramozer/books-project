import { useState } from 'react'
import { StarIcon } from './Icons'

export default function StarRating({ value, onChange, readonly = false, size = 'md' }) {
  const [hovered, setHovered] = useState(0)

  const px = size === 'sm' ? 13 : 20

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const active = star <= (hovered || value)
        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => !readonly && onChange?.(star)}
            onMouseEnter={() => !readonly && setHovered(star)}
            onMouseLeave={() => !readonly && setHovered(0)}
            className={`transition-transform duration-75 ${
              readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
            } ${active ? 'text-[#b48fe0]' : 'text-purple-200'}`}
          >
            <StarIcon size={px} filled={active} />
          </button>
        )
      })}
    </div>
  )
}
