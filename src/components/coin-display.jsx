"use client"
import { motion } from "framer-motion"
import { Coins } from "lucide-react"

export function CoinDisplay({ coins }) {
  return (
    <motion.div
      className="flex items-center gap-2 bg-card px-4 py-2 rounded-full shadow-lg border"
      whileHover={{ scale: 1.05 }}
      layout
    >
      <motion.div
        animate={{ rotate: coins > 0 ? 360 : 0 }}
        transition={{ duration: 0.5 }}
      >
        <Coins className="w-6 h-6 text-accent" />
      </motion.div>
      <motion.span
        key={coins}
        initial={{ scale: 1.5, color: "#8b5cf6" }}
        animate={{ scale: 1, color: "#374151" }}
        className="font-bold text-lg"
      >
        {coins}
      </motion.span>
    </motion.div>
  )
}
