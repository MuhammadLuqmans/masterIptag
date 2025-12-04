"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const emojis = [
  {
    emoji: "😡",
    label: "Molto Arrabbiato",
    value: 1,
    color: "border-red-500 bg-red-50"
  },
  {
    emoji: "😢",
    label: "Triste",
    value: 2,
    color: "border-orange-500 bg-orange-50"
  },
  {
    emoji: "😐",
    label: "Neutrale",
    value: 3,
    color: "border-yellow-500 bg-yellow-50"
  },
  {
    emoji: "😊",
    label: "Felice",
    value: 4,
    color: "border-green-500 bg-green-50"
  },
  {
    emoji: "😍",
    label: "Fantastico",
    value: 5,
    color: "border-purple-500 bg-purple-50"
  }
]

export function FeedbackForm({ onSubmit }) {
  const [selectedRating, setSelectedRating] = useState(null)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!selectedRating) return

    setIsSubmitting(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    onSubmit()
    setIsSubmitting(false)
  }

  const isCommentRequired = selectedRating !== null && selectedRating <= 3

  return (
    <Card className="max-w-2xl mx-auto shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold text-primary mb-2">
          Come è stata la tua esperienza?
        </CardTitle>
        <p className="text-muted-foreground">
          Il tuo feedback ci aiuta a migliorare il servizio
        </p>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* Emoji Rating */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-center">
            Valuta la tua esperienza
          </h3>
          <div className="flex justify-center gap-4 flex-wrap">
            {emojis.map((item, index) => (
              <motion.button
                key={item.value}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedRating(item.value)}
                className={`
                  p-4 rounded-2xl border-2 transition-all duration-300
                  ${
                    selectedRating === item.value
                      ? `${item.color} border-opacity-100 shadow-lg`
                      : "border-border hover:border-accent/50 bg-card"
                  }
                `}
              >
                <div className="text-4xl mb-2">{item.emoji}</div>
                <div className="text-sm font-medium text-card-foreground">
                  {item.label}
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Comment Section */}
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{
            opacity: selectedRating ? 1 : 0.5,
            height: selectedRating ? "auto" : 0
          }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              {isCommentRequired
                ? "Raccontaci di più *"
                : "Commento (opzionale)"}
            </h3>
            {isCommentRequired && (
              <span className="text-sm text-destructive">Obbligatorio</span>
            )}
          </div>

          <Textarea
            placeholder={
              selectedRating && selectedRating >= 4
                ? "Cosa ti è piaciuto di più?"
                : "Come possiamo migliorare?"
            }
            value={comment}
            onChange={e => setComment(e.target.value)}
            className="min-h-[120px] resize-none"
            disabled={!selectedRating}
          />
        </motion.div>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: selectedRating ? 1 : 0.5 }}
          className="text-center"
        >
          <Button
            onClick={handleSubmit}
            disabled={
              !selectedRating ||
              (isCommentRequired && !comment.trim()) ||
              isSubmitting
            }
            size="lg"
            className="px-8 py-3 text-lg font-semibold"
          >
            {isSubmitting ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear"
                }}
                className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full mr-2"
              />
            ) : null}
            {isSubmitting ? "Invio in corso..." : "Invia Feedback (+1 🪙)"}
          </Button>
        </motion.div>

        {/* Next Steps Preview */}
        {selectedRating && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center p-4 bg-accent/10 rounded-lg border border-accent/20"
          >
            <p className="text-sm text-muted-foreground">
              Dopo aver inviato il feedback, potrai girare la ruota per vincere
              monete extra! 🎰
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}
