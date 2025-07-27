import { createFileRoute } from '@tanstack/react-router'
import { Calendar } from '../pages/Calendar'

export const Route = createFileRoute('/calendar')({
  component: Calendar,
})