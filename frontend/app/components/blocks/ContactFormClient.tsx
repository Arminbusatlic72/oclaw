'use client'

import {FormEvent, useEffect, useRef, useState} from 'react'

import type {Locale} from '@/lib/i18n'
import type {ExtractPageBuilderType} from '@/sanity/lib/types'

type Block = ExtractPageBuilderType<'contactForm'>
type Option = {id: string; label: string}
type Props = {block: Block; locale: Locale; practiceAreas: Option[]; offices: Option[]; privacyPolicyHref: string}
type Status = 'idle' | 'submitting' | 'success' | 'error'

const labels = {
  en: {
    name: 'Your name', email: 'Your email', phone: 'Your phone', practice: 'Practice area', practicePlaceholder: 'Select a practice area', office: 'Office', officePlaceholder: 'Select an office', date: 'Preferred date', time: 'Preferred time', message: 'Message', caseDescription: 'Describe your case', privacyBefore: 'I have read and accept the', privacyLink: 'Privacy Policy', disclaimer: 'Submitting this form does not create an attorney-client relationship. An appointment request is a preference only and is not confirmed until OC Law Group contacts you.', upload: 'Supporting documents', uploadUnavailable: 'Secure document upload is unavailable until approved storage and retention controls are configured.', required: 'Required', requiredNote: 'All fields marked Required must be completed.', generalInquiry: 'General inquiry', appointmentRequest: 'Appointment request', errorSummary: 'Please correct the highlighted fields.', unavailableOptions: 'No published options are currently available.',
  },
  es: {
    name: 'Su nombre', email: 'Su correo electrónico', phone: 'Su teléfono', practice: 'Área de práctica', practicePlaceholder: 'Seleccione un área de práctica', office: 'Oficina', officePlaceholder: 'Seleccione una oficina', date: 'Fecha preferida', time: 'Hora preferida', message: 'Mensaje', caseDescription: 'Describa su caso', privacyBefore: 'He leído y acepto la', privacyLink: 'Política de Privacidad', disclaimer: 'Enviar este formulario no crea una relación abogado-cliente. Una solicitud de cita es solo una preferencia y no queda confirmada hasta que OC Law Group se comunique con usted.', upload: 'Documentos de respaldo', uploadUnavailable: 'La carga segura de documentos no está disponible hasta que se aprueben el almacenamiento y los controles de retención.', required: 'Obligatorio', requiredNote: 'Todos los campos marcados como Obligatorio deben completarse.', generalInquiry: 'Consulta general', appointmentRequest: 'Solicitud de cita', errorSummary: 'Corrija los campos indicados.', unavailableOptions: 'Actualmente no hay opciones publicadas disponibles.',
  },
} as const

export default function ContactFormClient({block, locale, practiceAreas, offices, privacyPolicyHref}: Props) {
  const t = labels[locale]
  const isAppointment = block.formMode === 'appointmentRequest'
  const startedAt = useRef(0)
  const submissionId = useRef('')
  const [status, setStatus] = useState<Status>('idle')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    startedAt.current = Date.now()
  }, [])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    if (!form.reportValidity() || status === 'submitting') return
    setStatus('submitting')
    setErrors({})
    if (!submissionId.current) submissionId.current = crypto.randomUUID()
    const formData = new FormData(form)
    const payload = {
      submissionId: submissionId.current,
      startedAt: startedAt.current,
      website: formData.get('website'),
      locale,
      mode: isAppointment ? 'appointmentRequest' : 'generalInquiry',
      name: formData.get('name'), email: formData.get('email'), phone: formData.get('phone'),
      practiceAreaId: formData.get('practiceAreaId'), officeId: formData.get('officeId'),
      preferredDate: formData.get('preferredDate'), preferredTime: formData.get('preferredTime'),
      message: formData.get('message'), privacyAccepted: formData.get('privacyAccepted') === 'on',
    }
    try {
      const response = await fetch('/api/contact', {method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify(payload)})
      const result = await response.json() as {ok?: boolean; message?: string; errors?: Record<string, string>}
      if (!response.ok || !result.ok) {
        setErrors(result.errors || {form: result.message || block.errorMessage})
        setStatus('error')
        return
      }
      setStatus('success')
      form.reset()
    } catch {
      setErrors({form: block.errorMessage})
      setStatus('error')
    }
  }

  const errorFor = (name: string) => errors[name] ? <span className="contact-field-error" id={`${block._key}-${name}-error`}>{errors[name]}</span> : null
  const describedBy = (name: string) => errors[name] ? `${block._key}-${name}-error` : undefined

  return <section className="contact-form-section">
    <div className="container">
      <header className="contact-form-heading">
        <h2>{block.heading}</h2>
        {block.description && <p>{block.description}</p>}
      </header>
      <div className="contact-form-shell">
        {status === 'success' ? <div className="contact-form-success" role="status" tabIndex={-1}><h3>{block.successMessage}</h3><p>{t.disclaimer}</p></div> : <form onSubmit={submit} noValidate={false} aria-busy={status === 'submitting'}>
          <div className="contact-form-meta"><span>{isAppointment ? t.appointmentRequest : t.generalInquiry}</span><p>{t.requiredNote}</p></div>
          {status === 'error' && <div className="contact-form-alert" role="alert"><strong>{errors.form || block.errorMessage}</strong>{Object.keys(errors).some((key) => key !== 'form') && <p>{t.errorSummary}</p>}</div>}
          <div className="contact-honeypot" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
          <div className="contact-form-grid">
            <label><span>{t.name} <em>{t.required}</em></span><input name="name" autoComplete="name" minLength={2} maxLength={120} required aria-invalid={!!errors.name} aria-describedby={describedBy('name')} />{errorFor('name')}</label>
            <label><span>{t.email} <em>{t.required}</em></span><input name="email" type="email" autoComplete="email" maxLength={254} required aria-invalid={!!errors.email} aria-describedby={describedBy('email')} />{errorFor('email')}</label>
            <label><span>{t.phone} <em>{t.required}</em></span><input name="phone" type="tel" autoComplete="tel" minLength={7} maxLength={30} required aria-invalid={!!errors.phone} aria-describedby={describedBy('phone')} />{errorFor('phone')}</label>
            {!isAppointment && <label><span>{t.practice} <em>{t.required}</em></span><select name="practiceAreaId" required disabled={!practiceAreas.length} defaultValue="" aria-invalid={!!errors.practiceAreaId} aria-describedby={describedBy('practiceAreaId')}><option value="" disabled>{practiceAreas.length ? t.practicePlaceholder : t.unavailableOptions}</option>{practiceAreas.map((option) => <option value={option.id} key={option.id}>{option.label}</option>)}</select>{errorFor('practiceAreaId')}</label>}
            {isAppointment && <>
              <label><span>{t.date} <em>{t.required}</em></span><input name="preferredDate" type="date" min={new Date().toISOString().slice(0, 10)} required aria-invalid={!!errors.preferredDate} aria-describedby={describedBy('preferredDate')} />{errorFor('preferredDate')}</label>
              <label><span>{t.time} <em>{t.required}</em></span><input name="preferredTime" type="time" required aria-invalid={!!errors.preferredTime} aria-describedby={describedBy('preferredTime')} />{errorFor('preferredTime')}</label>
              <label><span>{t.office} <em>{t.required}</em></span><select name="officeId" required disabled={!offices.length} defaultValue="" aria-invalid={!!errors.officeId} aria-describedby={describedBy('officeId')}><option value="" disabled>{offices.length ? t.officePlaceholder : t.unavailableOptions}</option>{offices.map((option) => <option value={option.id} key={option.id}>{option.label}</option>)}</select>{errorFor('officeId')}</label>
              <div className="contact-upload-disabled"><span>{t.upload}</span><button type="button" disabled>{t.upload}</button><small>{t.uploadUnavailable}</small></div>
            </>}
          </div>
          <label className="contact-message"><span>{isAppointment ? t.caseDescription : t.message} <em>{t.required}</em></span><textarea name="message" minLength={10} maxLength={5000} rows={8} required aria-invalid={!!errors.message} aria-describedby={describedBy('message')} />{errorFor('message')}</label>
          <label className="contact-privacy"><input name="privacyAccepted" type="checkbox" required aria-invalid={!!errors.privacyAccepted} aria-describedby={describedBy('privacyAccepted')} /><span>{t.privacyBefore} <a href={privacyPolicyHref} target="_blank" rel="noreferrer">{t.privacyLink}</a>. <em>{t.required}</em></span>{errorFor('privacyAccepted')}</label>
          <p className="contact-disclaimer">{t.disclaimer}</p>
          <div className="contact-submit"><button className="site-button-outline" type="submit" disabled={status === 'submitting' || (!isAppointment && !practiceAreas.length) || (isAppointment && !offices.length)}>{status === 'submitting' ? '…' : block.submitButtonLabel}</button></div>
        </form>}
      </div>
    </div>
  </section>
}
