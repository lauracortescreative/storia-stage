import React, { useState } from 'react';

interface StarRatingProps {
    value?: number;          // current rating (0-5, undefined = unrated)
    onChange?: (rating: number) => void;
    readonly?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

const sizes = { sm: 18, md: 26, lg: 36 };

export default function StarRating({ value, onChange, readonly = false, size = 'md' }: StarRatingProps) {
    const [hovered, setHovered] = useState<number | null>(null);
    const px = sizes[size];
    const active = hovered ?? value ?? 0;

    return (
        <div
            style={{ display: 'inline-flex', gap: 4, alignItems: 'center', lineHeight: 1 }}
            onMouseLeave={() => !readonly && setHovered(null)}
            aria-label={`Rating: ${value ?? 'none'} out of 5`}
        >
            {[1, 2, 3, 4, 5].map(star => {
                const filled = star <= active;
                return (
                    <button
                        key={star}
                        type="button"
                        aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
                        disabled={readonly}
                        onClick={() => !readonly && onChange?.(star === value ? 0 : star)}
                        onMouseEnter={() => !readonly && setHovered(star)}
                        style={{
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            cursor: readonly ? 'default' : 'pointer',
                            color: filled ? '#FBBF24' : 'rgba(255,255,255,0.2)',
                            transition: 'color 0.15s, transform 0.1s',
                            transform: (!readonly && hovered === star) ? 'scale(1.2)' : 'scale(1)',
                            fontSize: px,
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <svg width={px} height={px} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'}
                            stroke="currentColor" strokeWidth={filled ? 0 : 1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round"
                                d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                        </svg>
                    </button>
                );
            })}
        </div>
    );
}
