'use client'

import {useState} from 'react'
import {Play} from 'lucide-react'

type YoutubeVideoPlayerProps = {
  id: string
  title: string
}

export default function YoutubeVideoPlayer({id, title}: YoutubeVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)

  if (isPlaying) {
    return (
      <iframe
        className="youtube-video-iframe"
        src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    )
  }

  return (
    <button
      className="youtube-video-poster"
      type="button"
      onClick={() => setIsPlaying(true)}
      aria-label={`Play video: ${title}`}
    >
      {/* YouTube's static image CDN is much lighter than loading an iframe per card. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
        alt=""
        width="480"
        height="360"
        loading="lazy"
        decoding="async"
      />
      <span className="youtube-video-shade" aria-hidden="true" />
      <span className="youtube-video-play" aria-hidden="true">
        <Play fill="currentColor" size={26} />
      </span>
    </button>
  )
}
