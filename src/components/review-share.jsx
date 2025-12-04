"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Star, ExternalLink, Copy, Share2 } from "lucide-react"

// Mock Google Reviews data
const mockReviews = [
  {
    id: 1,
    author: "Marco R.",
    rating: 5,
    text: "Servizio eccellente! Il personale è molto professionale e cortese. Consiglio vivamente!",
    date: "2 settimane fa",
    avatar: "MR",
  },
  {
    id: 2,
    author: "Giulia M.",
    rating: 5,
    text: "Esperienza fantastica. Tutto perfetto dall'inizio alla fine. Tornerò sicuramente!",
    date: "1 mese fa",
    avatar: "GM",
  },
  {
    id: 3,
    author: "Alessandro T.",
    rating: 4,
    text: "Molto soddisfatto del servizio ricevuto. Qualità ottima e tempi rispettati.",
    date: "3 settimane fa",
    avatar: "AT",
  },
  {
    id: 4,
    author: "Francesca L.",
    rating: 5,
    text: "Personale competente e disponibile. Ambiente accogliente e pulito. Raccomandato!",
    date: "1 settimana fa",
    avatar: "FL",
  },
]

export function ReviewShare() {
  const [copiedLink, setCopiedLink] = useState(false)

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText("https://g.page/r/example-business-reviews")
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const handleShareReview = () => {
    // Mock Google Reviews redirect
    window.open("https://search.google.com/local/writereview?placeid=example", "_blank")
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <Card className="shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary mb-2">Condividi la Tua Esperienza</CardTitle>
          <p className="text-muted-foreground">Aiuta altri clienti condividendo la tua recensione su Google</p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Call to Action */}
          <div className="text-center space-y-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button onClick={handleShareReview} size="lg" className="px-8 py-4 text-xl font-bold">
                <Star className="w-6 h-6 mr-2 fill-current" />
                Lascia una Recensione su Google
                <ExternalLink className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>

            <p className="text-sm text-muted-foreground">La tua opinione è importante per noi e per altri clienti</p>
          </div>

          {/* Share Options */}
          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={handleCopyLink} className="flex items-center gap-2 bg-transparent">
              <Copy className="w-4 h-4" />
              {copiedLink ? "Link Copiato!" : "Copia Link"}
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: "Recensioni - Condividi la tua esperienza",
                    text: "Lascia una recensione per aiutare altri clienti",
                    url: "https://g.page/r/example-business-reviews",
                  })
                }
              }}
              className="flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Condividi
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reviews Display */}
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Cosa Dicono i Nostri Clienti</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {mockReviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-accent text-accent-foreground rounded-full flex items-center justify-center font-bold">
                    {review.avatar}
                  </div>

                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{review.author}</h4>
                      <span className="text-sm text-muted-foreground">{review.date}</span>
                    </div>

                    {/* Stars */}
                    <div className="flex gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                        />
                      ))}
                    </div>

                    {/* Review Text */}
                    <p className="text-card-foreground leading-relaxed">{review.text}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Auto-scroll indicator */}
          <motion.div
            className="mt-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <p className="text-sm text-muted-foreground">Scorri per vedere più recensioni</p>
          </motion.div>
        </CardContent>
      </Card>
    </div>
  )
}
