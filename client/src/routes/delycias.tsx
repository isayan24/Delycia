import { createFileRoute } from '@tanstack/react-router'
import ShowAllDelycia from '@/components/all-delycias/ShowAllDelycia'

export const Route = createFileRoute('/delycias')({
  component: DelyciasPage,
})

function DelyciasPage() {
  return <ShowAllDelycia />
}
