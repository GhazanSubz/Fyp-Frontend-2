import { motion } from "framer-motion";
import { VideoSettings } from "@/app/playground/page";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface Step2BackgroundProps {
  settings: VideoSettings;
  onSettingsChange: (key: keyof VideoSettings, value: any) => void;
}

export function Step2Background({ settings, onSettingsChange }: Step2BackgroundProps) {
  const backgroundOptions = [
    {
      value: "urban",
      label: "Minecraft",
      description: "Gritty city streets with neon signs and graffiti",
      preview: "https://qbhnvyynbrkwonkfxkwn.supabase.co/storage/v1/object/public/fypcontent//Stardust.mp4",
      type: "video",
    },
    {
      value: "concert",
      label: "Stardust",
      description: "Energetic live performance setting with lights",
      preview: "https://qbhnvyynbrkwonkfxkwn.supabase.co/storage/v1/object/public/fypcontent//Stardust.mp4",
      type: "video",
    },
    {
      value: "abstract",
      label: "Nature",
      description: "Distorted digital patterns and visual noise",
      preview: "https://qbhnvyynbrkwonkfxkwn.supabase.co/storage/v1/object/public/fypcontent//backgroundVideo69.mp4", 
      type: "video",
    },
    {
      value: "industrial",
      label: "",
      description: "Abandoned factories and rusty machinery",
      preview: "https://qbhnvyynbrkwonkfxkwn.supabase.co/storage/v1/object/public/fypcontent//bro.mp4",
      type: "video",
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Label className="text-white mb-4 block">Background Video Type</Label>

      <RadioGroup
        value={settings.backgroundVideo}
        onValueChange={(value) => onSettingsChange("backgroundVideo", value)}
        className="space-y-3"
      >
        {backgroundOptions.map((option) => (
          <motion.div
            key={option.value}
            whileHover={{ scale: 1.02 }}
            className={`flex items-center space-x-3 rounded-lg border p-4 cursor-pointer transition-colors ${
              settings.backgroundVideo === option.value
                ? "border-pink-500 bg-zinc-800/50"
                : "border-zinc-800 bg-zinc-900"
            }`}
            onClick={() => onSettingsChange("backgroundVideo", option.value)}
          >
            <RadioGroupItem value={option.value} id={`background-${option.value}`} className="text-pink-500" />
            <div className="flex-1 flex items-center gap-4">
              <div className="flex-shrink-0 rounded-md overflow-hidden border border-zinc-700">
                {option.type === "image" ? (
                  <img
                    src={option.preview}
                    alt={option.label}
                    width={120}
                    height={80}
                    className="object-cover"
                  />
                ) : (
                  <video
                    src={option.preview}
                    width={120}
                    height={80}
                    className="object-cover"
                    autoPlay
                    loop
                    muted
                  />
                )}
              </div>
              <div>
                <label htmlFor={`background-${option.value}`} className="text-white font-medium cursor-pointer">
                  {option.label}
                </label>
                <p className="text-zinc-400 text-sm">{option.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </RadioGroup>
    </motion.div>
  );
}