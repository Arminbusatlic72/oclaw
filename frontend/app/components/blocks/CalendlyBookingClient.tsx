'use client'

import * as Dialog from '@radix-ui/react-dialog'
import {CalendarDays, Clock, ExternalLink, Lock, ShieldCheck, X} from 'lucide-react'
import {forwardRef, useEffect, useId, useState, type ButtonHTMLAttributes, type ReactNode} from 'react'

import {Button, buttonVariants} from '@/components/ui/button'
import type {Locale} from '@/lib/i18n'

import type {CalendlyBookingOption as BookingOption} from '@/lib/calendly'

type Props = {
  heading: string
  description?: string | null
  displayMode: 'inline' | 'popup'
  buttonLabel?: string | null
  privacyNotice?: string | null
  fallbackLinkLabel?: string | null
  embedHeight: number
  options: BookingOption[]
  locale: Locale
}

const interfaceCopy = {
  en: {
    eyebrow: 'Schedule online',
    allOffices: 'All offices',
    chooseOffice: 'Choose an office',
    consent: 'Calendly is a third-party scheduling service. Loading it will share technical data, such as your IP address, with Calendly. Do not enter case details or confidential legal information.',
    load: 'Load scheduling calendar',
    loading: 'Loading scheduling calendar…',
    error: 'The scheduling calendar is taking longer than expected.',
    close: 'Close scheduling calendar',
    fallback: 'Open scheduling page in a new tab',
    frameTitle: 'Calendly scheduling calendar',
    benefits: [
      {icon: ShieldCheck, label: 'Confidential & private'},
      {icon: Clock, label: 'Pick a time that works for you'},
      {icon: Lock, label: 'Secure third-party scheduling'},
    ],
  },
  es: {
    eyebrow: 'Agende en línea',
    allOffices: 'Todas las oficinas',
    chooseOffice: 'Elija una oficina',
    consent: 'Calendly es un servicio externo de programación. Al cargarlo, se compartirán con Calendly datos técnicos, como su dirección IP. No ingrese detalles del caso ni información legal confidencial.',
    load: 'Cargar calendario de citas',
    loading: 'Cargando calendario de citas…',
    error: 'El calendario de citas está tardando más de lo esperado.',
    close: 'Cerrar calendario de citas',
    fallback: 'Abrir la página de citas en una pestaña nueva',
    frameTitle: 'Calendario de citas de Calendly',
    benefits: [
      {icon: ShieldCheck, label: 'Confidencial y privado'},
      {icon: Clock, label: 'Elija la hora que mejor le convenga'},
      {icon: Lock, label: 'Programación segura de terceros'},
    ],
  },
} as const

function CalendlyFrame({url, height, title, loadingLabel, errorLabel}: {url: string; height: number; title: string; loadingLabel: string; errorLabel: string}) {
  const [loading, setLoading] = useState(true)
  const [timedOut, setTimedOut] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setTimedOut(true), 15000)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <div className="calendly-frame-shell" style={{height}}>
      {loading && <div className="calendly-frame-status" role="status"><span className="calendly-spinner" aria-hidden="true" />{timedOut ? errorLabel : loadingLabel}</div>}
      <iframe
        className="calendly-frame"
        src={url}
        title={title}
        height={height}
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        onLoad={() => setLoading(false)}
        onError={() => setTimedOut(true)}
      />
    </div>
  )
}

function OfficePicker({options, selectedId, setSelectedId, groupName, locale}: {
  options: BookingOption[]
  selectedId: string
  setSelectedId: (value: string) => void
  groupName: string
  locale: Locale
}) {
  if (options.length <= 1) return null
  const t = interfaceCopy[locale]

  return (
    <div className="calendly-office-picker">
      <span className="calendly-office-picker-label">{t.chooseOffice}</span>
      <div className="calendly-office-pills" role="radiogroup" aria-label={t.chooseOffice}>
        {options.map((option) => (
          <label key={option.id} className="calendly-office-pill" data-active={option.id === selectedId || undefined}>
            <input
              type="radio"
              name={groupName}
              value={option.id}
              checked={option.id === selectedId}
              onChange={() => setSelectedId(option.id)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  )
}

function BookingContent({options, selectedId, setSelectedId, groupName, consented, setConsented, privacyNotice, fallbackLinkLabel, embedHeight, locale}: {
  options: BookingOption[]
  selectedId: string
  setSelectedId: (value: string) => void
  groupName: string
  consented: boolean
  setConsented: (value: boolean) => void
  privacyNotice?: string | null
  fallbackLinkLabel?: string | null
  embedHeight: number
  locale: Locale
}) {
  const t = interfaceCopy[locale]
  const selected = options.find((option) => option.id === selectedId) || options[0]

  return (
    <div className="calendly-booking-content">
      <OfficePicker options={options} selectedId={selectedId} setSelectedId={setSelectedId} groupName={groupName} locale={locale} />

      {!consented ? <div className="calendly-consent">
        <span className="calendly-consent-badge"><CalendarDays aria-hidden="true" size={30} strokeWidth={1.5} /></span>
        <p>{privacyNotice || t.consent}</p>
        <Button type="button" size="lg" className="calendly-consent-button" onClick={() => setConsented(true)}>{t.load}</Button>
      </div> : <CalendlyFrame key={selected.url} url={selected.url} height={embedHeight} title={`${t.frameTitle}: ${selected.label}`} loadingLabel={t.loading} errorLabel={t.error} />}

      <a className="calendly-fallback-link" href={selected.url} target="_blank" rel="noopener noreferrer">
        {fallbackLinkLabel || t.fallback}<ExternalLink aria-hidden="true" size={16} />
      </a>
    </div>
  )
}

type CalendlyPopupTriggerProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  children: ReactNode
  options: BookingOption[]
  locale: Locale
  heading?: string | null
  description?: string | null
  privacyNotice?: string | null
  fallbackLinkLabel?: string | null
  embedHeight?: number
}

export const CalendlyPopupTrigger = forwardRef<HTMLButtonElement, CalendlyPopupTriggerProps>(
  function CalendlyPopupTrigger(
    {
      children,
      options,
      locale,
      heading,
      description,
      privacyNotice,
      fallbackLinkLabel,
      embedHeight = 760,
      type = 'button',
      ...buttonProps
    },
    ref,
  ) {
    const t = interfaceCopy[locale]
    const title = heading || (locale === 'es' ? 'Programar una consulta' : 'Schedule a Consultation')
    const dialogDescriptionId = useId()
    const groupName = useId()
    const [selectedId, setSelectedId] = useState(options[0].id)
    const [consented, setConsented] = useState(false)

    return (
      <Dialog.Root>
        <Dialog.Trigger asChild>
          <button {...buttonProps} ref={ref} type={type}>{children}</button>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="calendly-dialog-overlay" />
          <Dialog.Content className="calendly-dialog-content" aria-describedby={description ? dialogDescriptionId : undefined}>
            <div className="calendly-dialog-heading">
              <div>
                <Dialog.Title>{title}</Dialog.Title>
                {description && <Dialog.Description id={dialogDescriptionId}>{description}</Dialog.Description>}
              </div>
              <Dialog.Close className="calendly-dialog-close" aria-label={t.close}><X aria-hidden="true" /></Dialog.Close>
            </div>
            <BookingContent
              options={options}
              selectedId={selectedId}
              setSelectedId={setSelectedId}
              groupName={groupName}
              consented={consented}
              setConsented={setConsented}
              privacyNotice={privacyNotice}
              fallbackLinkLabel={fallbackLinkLabel}
              embedHeight={Math.min(1200, Math.max(600, embedHeight))}
              locale={locale}
            />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    )
  },
)

export default function CalendlyBookingClient(props: Props) {
  const {heading, description, displayMode, buttonLabel, options, locale} = props
  const t = interfaceCopy[locale]
  const headingId = useId()
  const groupName = useId()
  const [selectedId, setSelectedId] = useState(options[0].id)
  const [consented, setConsented] = useState(false)

  const bookingContent = <BookingContent {...props} selectedId={selectedId} setSelectedId={setSelectedId} groupName={groupName} consented={consented} setConsented={setConsented} />

  if (displayMode === 'popup') {
    return (
      <section className="calendly-booking-section calendly-booking-popup-section" aria-labelledby={headingId}>
        <div className="container calendly-booking-intro calendly-booking-intro--center">
          <p className="calendly-eyebrow">{t.eyebrow}</p>
          <h2 id={headingId}>{heading}</h2>
          {description && <p>{description}</p>}
          <CalendlyPopupTrigger
            options={options}
            locale={locale}
            heading={heading}
            description={description}
            privacyNotice={props.privacyNotice}
            fallbackLinkLabel={props.fallbackLinkLabel}
            embedHeight={props.embedHeight}
            className={buttonVariants({size: 'lg', className: 'calendly-block-trigger'})}
          >
            {buttonLabel || (locale === 'es' ? 'Programar una consulta' : 'Schedule a Consultation')}
          </CalendlyPopupTrigger>
        </div>
      </section>
    )
  }

  return (
    <section className="calendly-booking-section" aria-labelledby={headingId}>
      <div className="container calendly-booking-grid">
        <div className="calendly-booking-intro">
          <p className="calendly-eyebrow">{t.eyebrow}</p>
          <h2 id={headingId}>{heading}</h2>
          {description && <p>{description}</p>}
          <ul className="calendly-benefits">
            {t.benefits.map(({icon: Icon, label}) => (
              <li key={label}>
                <span className="calendly-benefit-icon"><Icon aria-hidden="true" size={18} strokeWidth={1.75} /></span>
                {label}
              </li>
            ))}
          </ul>
        </div>
        <div className="calendly-booking-panel">{bookingContent}</div>
      </div>
    </section>
  )
}
