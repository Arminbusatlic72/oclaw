import {ArrowUpRight} from 'lucide-react'
import {stegaClean} from '@sanity/client/stega'

import YoutubeVideoPlayer from '@/app/components/blocks/YoutubeVideoPlayer'
import type {ExtractPageBuilderType} from '@/sanity/lib/types'

type YoutubeVideosBlock = ExtractPageBuilderType<'youtubeVideos'>

function getYoutubeId(value?: string | null) {
  if (!value) return null

  try {
    const url = new URL(stegaClean(value))
    const host = url.hostname.replace(/^www\./, '').replace(/^m\./, '')
    const id = host === 'youtu.be' ? url.pathname.split('/')[1] : url.searchParams.get('v') || url.pathname.match(/^\/(?:shorts|embed)\/([^/]+)/)?.[1]
    return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null
  } catch {
    return null
  }
}

export default function YoutubeVideos({block}: {block: YoutubeVideosBlock}) {
  const videos = (block.videos ?? [])
    .map((video) => ({...video, videoId: getYoutubeId(video.url)}))
    .filter((video): video is typeof video & {videoId: string} => Boolean(video.title && video.videoId))
    .slice(0, 3)

  if (!videos.length) return null

  const isDark = stegaClean(block.theme) === 'dark'

  return (
    <section
      id={block.anchor?.current || undefined}
      className={`youtube-videos-section ${isDark ? 'youtube-videos-dark' : 'youtube-videos-light'}`}
    >
      <div className="container">
        <header className="youtube-videos-header">
          <div>
            {block.eyebrow && <p className="site-eyebrow">{block.eyebrow}</p>}
            <h2 className="site-block-heading">{block.heading}</h2>
          </div>
          {block.description && <p>{block.description}</p>}
        </header>

        <div className="youtube-videos-grid">
          {videos.map((video, index) => (
            <article className="youtube-video-card" key={video._key || video.videoId}>
              <YoutubeVideoPlayer id={video.videoId} title={video.title!} />
              <div className="youtube-video-title">
                <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                <h3>{video.title}</h3>
              </div>
            </article>
          ))}
        </div>

        {block.channelUrl && block.buttonLabel && (
          <div className="youtube-videos-cta">
            <a
              className="site-button-outline"
              href={stegaClean(block.channelUrl)}
              target="_blank"
              rel="noopener noreferrer"
            >
              {block.buttonLabel}
              <ArrowUpRight aria-hidden="true" size={18} />
            </a>
          </div>
        )}
      </div>
    </section>
  )
}
