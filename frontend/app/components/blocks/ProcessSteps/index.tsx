import ResolvedLink from '@/app/components/ResolvedLink'
import ScrollReveal from '@/components/animations/ScrollReveal'
import StaggeredGrid from '@/components/animations/StaggeredGrid'
import {Button} from '@/components/ui/button'
import {ExtractPageBuilderType} from '@/sanity/lib/types'

type ProcessStepsBlock = ExtractPageBuilderType<'processSteps'>
type ProcessStep = NonNullable<ProcessStepsBlock['steps']>[number]

type ProcessStepsProps = {
  block: ProcessStepsBlock
}

const toIdFragment = (value?: string) => {
  const base = value?.trim() ? value : 'process-steps'

  return base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function ProcessSteps({block}: ProcessStepsProps) {
  const {eyebrow, heading, subheading, steps, button, theme = 'light'} = block
  const normalizedSteps = (steps ?? []).filter((step): step is ProcessStep => Boolean(step?.title))

  if (!normalizedSteps.length) {
    return null
  }

  const sectionId = `process-steps-${toIdFragment(heading ?? undefined)}`
  const isDark = theme === 'dark'
  const sectionClass = isDark
    ? 'bg-slate-950 text-slate-100'
    : 'bg-gradient-to-b from-white via-slate-50 to-white text-slate-950'
  const shellClass = isDark
    ? 'border-slate-800/80 bg-slate-900/80 shadow-black/20'
    : 'border-slate-200 bg-white/90 shadow-slate-900/5'
  const cardClass = isDark
    ? 'border-slate-800 bg-slate-900/90 text-slate-100'
    : 'border-slate-200 bg-white text-slate-900'
  const mutedClass = isDark ? 'text-slate-300' : 'text-slate-600'
  const badgeClass = isDark
    ? 'border-slate-700 bg-slate-800 text-slate-200'
    : 'border-slate-300 bg-slate-100 text-slate-700'

  return (
    <section aria-labelledby={sectionId} className={`py-16 sm:py-24 ${sectionClass}`}>
      <div className="container">
        <div
          className={`overflow-hidden rounded-[2rem] border p-8 shadow-xl sm:p-10 ${shellClass}`}
        >
          <ScrollReveal direction="up" className="mx-auto max-w-3xl text-center">
            {eyebrow && (
              <span
                className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${badgeClass}`}
              >
                {eyebrow}
              </span>
            )}
            {heading && (
              <h2
                id={sectionId}
                className="mt-5 text-3xl font-semibold tracking-tight md:text-4xl lg:text-5xl"
              >
                {heading}
              </h2>
            )}
            {subheading && <p className={`mt-4 text-base leading-7 ${mutedClass}`}>{subheading}</p>}
          </ScrollReveal>

          <div className="mt-10 sm:mt-14">
            <StaggeredGrid columns={3} className="xl:grid-cols-3">
              {normalizedSteps.map((step, index) => (
                <article
                  key={step._key ?? `${step.title}-${index}`}
                  className={`group relative flex h-full flex-col rounded-3xl border p-6 transition-transform duration-300 hover:-translate-y-1 ${cardClass}`}
                >
                  <span
                    className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold ${badgeClass}`}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  {step.eyebrow && (
                    <p
                      className={`mt-5 text-xs font-semibold uppercase tracking-[0.18em] ${mutedClass}`}
                    >
                      {step.eyebrow}
                    </p>
                  )}
                  <h3 className="mt-3 text-xl font-semibold">{step.title}</h3>
                  {step.description && (
                    <p className={`mt-3 text-sm leading-6 sm:text-base ${mutedClass}`}>
                      {step.description}
                    </p>
                  )}
                  <div className="mt-6 h-px flex-1 bg-gradient-to-r from-transparent via-slate-300/40 to-transparent dark:via-slate-700/50" />
                </article>
              ))}
            </StaggeredGrid>
          </div>

          {button?.buttonText && button.link && (
            <ScrollReveal direction="up" delay={0.12} className="mt-10 flex justify-center">
              <Button asChild size="lg" className="rounded-full px-6">
                <ResolvedLink link={button.link}>{button.buttonText}</ResolvedLink>
              </Button>
            </ScrollReveal>
          )}
        </div>
      </div>
    </section>
  )
}
