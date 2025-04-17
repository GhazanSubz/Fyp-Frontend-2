"use client"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import type { VideoSettings } from "@/app/playground/page"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Mic, Play, Pause } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Step4VoiceProps {
  settings: VideoSettings
  onSettingsChange: (key: keyof VideoSettings, value: any) => void
}


const VOICE_SAMPLES: { [key: string]: { label: string; sample: string } } = {
  en_speaker_4: {
    label: "Voice Option 1",
    sample: "https://dl.suno-models.io/bark/prompts/continuation_audio/en_speaker_4.mp3",
  },
  en_speaker_0: {
    label: "Voice Option 2",
    sample: "https://dl.suno-models.io/bark/prompts/continuation_audio/en_speaker_0.mp3",
  },
  en_speaker_9: {
    label: "Voice Option 3",
    sample: "https://dl.suno-models.io/bark/prompts/continuation_audio/en_speaker_9.mp3",
  },
  zh_speaker_0: {
    label: "Voice Option 4",
    sample: "https://dl.suno-models.io/bark/prompts/continuation_audio/zh_speaker_0.mp3",
  },
}

export function Step4Voice({ settings, onSettingsChange }: Step4VoiceProps) {
  const [playingVoice, setPlayingVoice] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  const togglePlayback = (voiceUrl: string | null) => {
    if (!voiceUrl) return

    if (audioRef.current) {
      if (playingVoice === voiceUrl) {
        audioRef.current.pause()
        setPlayingVoice(null)
      } else {
        audioRef.current.src = voiceUrl
        audioRef.current.play()
        setPlayingVoice(voiceUrl)
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center mb-4">
        <Label className="text-white">Voice Type</Label>
        {playingVoice && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400 animate-pulse">Playing sample...</span>
          </div>
        )}
      </div>

      <audio ref={audioRef} className="hidden" onEnded={() => setPlayingVoice(null)} />

      <RadioGroup
        value={settings.voiceType}
        onValueChange={(value: string) => onSettingsChange("voiceType", value)}
        className="space-y-3"
      >
        {Object.entries(VOICE_SAMPLES).map(([voiceKey, { label, sample }]) => (
          <motion.div
            key={voiceKey}
            whileHover={{ scale: 1.02 }}
            className={`flex items-center space-x-3 rounded-lg border p-4 cursor-pointer transition-colors ${
              settings.voiceType === voiceKey ? "border-pink-500 bg-zinc-800/50" : "border-zinc-800 bg-zinc-900"
            }`}
            onClick={() => onSettingsChange("voiceType", voiceKey)}
          >
            <RadioGroupItem value={voiceKey} id={`voice-${voiceKey}`} className="text-pink-500" />
            <div className="flex-1">
              <label
                htmlFor={`voice-${voiceKey}`}
                className="text-white font-medium cursor-pointer flex items-center"
              >
                {label}
                <Mic className="ml-2 h-4 w-4 text-pink-500" />
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-2 h-6 w-6 rounded-full bg-pink-500/20 hover:bg-pink-500/30"
                  onClick={(e) => {
                    e.stopPropagation()
                    togglePlayback(sample)
                  }}
                >
                  {playingVoice === sample ? (
                    <Pause className="h-3 w-3 text-pink-500" />
                  ) : (
                    <Play className="h-3 w-3 text-pink-500" />
                  )}
                </Button>
              </label>
              <p className="text-zinc-400 text-sm">Sample voice style</p>
              {playingVoice === sample && (
                <div className="mt-2 h-1 bg-zinc-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-pink-500 to-purple-500"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 3, ease: "linear" }}
                  />
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </RadioGroup>

      <div className="mt-6 p-4 rounded-lg border border-zinc-800 bg-zinc-900/50">
        <h4 className="text-white font-medium mb-2 flex items-center">
          <Mic className="mr-2 h-4 w-4 text-pink-500" /> Voice Sample
        </h4>
        <p className="text-zinc-400 text-sm">Play a sample of the selected voice narration.</p>
      </div>
    </motion.div>
  )
}
