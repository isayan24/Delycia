import {
  Link as TanStackLink,
  useLocation,
  useNavigate,
  useParams as useTanStackParams,
  useSearch,
} from '@tanstack/react-router'
import UseOptimizeImage from '@/hooks/UseOptimizeImage'
import React from 'react'

// Image Compat
export const Image = (props: any) => {
  // next/image props: src, alt, width, height, ...
  // UseOptimizeImage handles src, alt, width, height.
  return <UseOptimizeImage {...props} />
}
export default Image

// Link Compat
export const Link = (props: any) => {
  const { href, ...rest } = props
  // Map href to to
  return <TanStackLink to={href} {...rest} />
}

// Navigation Compat
export const usePathname = () => {
  const location = useLocation()
  return location.pathname
}

export const useRouter = () => {
  const navigate = useNavigate()
  return {
    push: (href: string) => navigate({ to: href }),
    replace: (href: string) => navigate({ to: href, replace: true }),
    back: () => window.history.back(),
    refresh: () => window.location.reload(),
  }
}

export const useParams = () => {
  return useTanStackParams({ strict: false })
}

export const useSearchParams = () => {
  // We can't easily hook into generic search without context,
  // but assuming we are in a context where search is available or we use window.location
  // Basic shim using window location for now as fallback, or TanStack strict false

  // Better: use window.location.search for compatibility if we want exact URLSearchParams behavior
  // because TanStack search is state-based.
  // BUT we need it reactive.
  const location = useLocation()

  const [params, setParams] = React.useState(
    () => new URLSearchParams(location.search),
  )

  React.useEffect(() => {
    setParams(new URLSearchParams(location.search))
  }, [location.search])

  return params
}
