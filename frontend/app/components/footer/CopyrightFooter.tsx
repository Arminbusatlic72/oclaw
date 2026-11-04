const COPYRIGHT_OWNER = 'OC Law Group'

export default function CopyrightFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <p className="site-footer-copyright">
      Copyright &copy; {currentYear} {COPYRIGHT_OWNER}
    </p>
  )
}
