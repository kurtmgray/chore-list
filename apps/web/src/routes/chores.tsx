import { createFileRoute } from '@tanstack/react-router'
import { AllChores } from '../pages/AllChores'

export const Route = createFileRoute('/chores')({
  component: AllChores,
})