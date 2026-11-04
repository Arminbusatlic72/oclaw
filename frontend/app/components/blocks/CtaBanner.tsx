import ResolvedLink from '@/app/components/ResolvedLink'
import type {ExtractPageBuilderType} from '@/sanity/lib/types'
import type {Locale} from '@/lib/i18n'

type CtaBannerBlock = ExtractPageBuilderType<'ctaBanner'>

export default function CtaBanner({block, locale = 'en'}: {block: CtaBannerBlock; locale?: Locale}) {
  return (
    <section className="about-cta">
      <div className="container about-cta-inner">
        <div>
          {block.eyebrow && <p className="site-eyebrow">{block.eyebrow}</p>}
          <h2>{block.heading}</h2>
        </div>
        {block.button?.buttonText && block.button.link && (
          <ResolvedLink className="about-cta-link" link={block.button.link} locale={locale}>
            {block.button.buttonText}<span aria-hidden="true"> ↗</span>
          </ResolvedLink>
        )}
      </div>
    </section>
  )
}
