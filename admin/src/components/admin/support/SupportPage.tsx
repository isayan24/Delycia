import { useState } from 'react'
import { toast } from 'sonner'
import {
  Phone,
  MessageCircle,
  Send,
  Lightbulb,
  Headphones,
  Mail,
  Clock,
  CheckCircle2,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useAdminAuthQuery } from '@/hooks/queries/useAdminAuthQuery'

const SUPPORT_PHONE = '9083928843'
const WHATSAPP_URL = `https://wa.me/91${SUPPORT_PHONE}`

export function SupportPage() {
  const { user } = useAdminAuthQuery()
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')

  const handleFeatureRequest = (e: React.FormEvent) => {
    e.preventDefault()

    if (!subject.trim() || !description.trim()) {
      toast.error('Please fill in both subject and description.')
      return
    }

    const userName = user?.name || user?.username || 'Unknown'
    const body = `${description.trim()}\n\n---\nSent by: ${userName}${user?.email ? ` (${user.email})` : ''}\nSent from Delycia Admin Panel`

    const mailtoUrl = `mailto:delycia.app@gmail.com?subject=${encodeURIComponent(`[Feature Request] ${subject.trim()}`)}&body=${encodeURIComponent(body)}`

    window.open(mailtoUrl, '_blank')

    toast.success('Opening your email client...', {
      description: 'Send the email to submit your feature request.',
    })
    setSubject('')
    setDescription('')
  }

  return (
    <div className="max-w-[60rem] mx-auto space-y-6 p-2 py-3">
      {/* Page Header */}
      <div>
        <h1 className="text-md sm:text-xl font-semibold text-gray-800 mb-1">
          Support & Feedback
        </h1>
        <p className="text-sm text-gray-500">
          Get help or share your ideas to improve Delycia
        </p>
      </div>

      {/* Contact Support Section */}
      <Card className="overflow-hidden border-0 shadow-md">
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <Headphones className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-white">
                Contact Support
              </h2>
              <p className="text-xs sm:text-sm text-violet-100">
                We're here to help you with any issues
              </p>
            </div>
          </div>
        </div>

        <CardContent className="p-4 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Phone Call Card */}
            <a
              href={`tel:${SUPPORT_PHONE}`}
              className="group flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50/50 p-4 transition-all hover:border-violet-200 hover:bg-violet-50/50 hover:shadow-sm"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600 transition-colors group-hover:bg-violet-600 group-hover:text-white">
                <Phone className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900">Call Us</p>
                <p className="text-lg font-semibold text-violet-700 tracking-wide">
                  {SUPPORT_PHONE}
                </p>
              </div>
            </a>

            {/* WhatsApp Card */}
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50/50 p-4 transition-all hover:border-emerald-200 hover:bg-emerald-50/50 hover:shadow-sm"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  WhatsApp Chat
                </p>
                <p className="text-sm text-gray-600">
                  Quick response on WhatsApp
                </p>
                <p className="text-xs text-emerald-600 font-medium mt-0.5">
                  Usually replies within 1 hour
                </p>
              </div>
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Feature Request Section */}
      <Card className="overflow-hidden border-0 shadow-md">
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <Lightbulb className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-white">
                Feature Request
              </h2>
              <p className="text-xs sm:text-sm text-amber-50">
                Have an idea? We'd love to hear it!
              </p>
            </div>
          </div>
        </div>

        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleFeatureRequest} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="feature-subject"
                className="text-sm font-medium text-gray-700"
              >
                Subject
              </label>
              <Input
                id="feature-subject"
                placeholder="e.g. Add dark mode, Export reports as PDF..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="h-10"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="feature-description"
                className="text-sm font-medium text-gray-700"
              >
                Description
              </label>
              <Textarea
                id="feature-description"
                placeholder="Tell us more about what you'd like to see and why it would help your business..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="resize-none"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <p className="text-xs text-gray-400 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                Sent to delycia.app@gmail.com
              </p>
              <Button
                type="submit"
                disabled={!subject.trim() || !description.trim()}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-sm gap-2"
              >
                <Send className="h-4 w-4" />
                Submit Request
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-4 sm:p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-violet-600" />
          Before contacting support
        </h3>
        <ul className="grid gap-2 text-sm text-gray-600 sm:grid-cols-2">
          {[
            'Try refreshing your browser',
            'Clear your browser cache',
            'Check your internet connection',
            'Note down any error messages you see',
          ].map((tip) => (
            <li key={tip} className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400" />
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
