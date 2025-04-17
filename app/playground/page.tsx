"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CustomizationPanel } from "../(main)/_components/customization-panel";
import { LoadingScreen } from "../(main)/_components/loading-screen";
import { PromptInput } from "../(main)/_components/prompt-input";
import { GlitchText } from "../(main)/_components/ui/glitch-text";
import SidebarWrapper from "../(main)/_components/SidebarWrapper";
import { Download } from "lucide-react";

export type VideoSettings = {
  subtitleColor: string;
  iterations: number;
  genre: string;
  backgroundVideo: string;
  backgroundMusic: string;
  voiceType: string;
};

export function VideoGenerator() {
  const [prompt, setPrompt] = useState("");
  const [settings, setSettings] = useState<VideoSettings>({
    subtitleColor: "#ff00ff",
    iterations: 2,
    genre: "adventure",
    backgroundVideo: "1",
    backgroundMusic: "1",
    voiceType: "v2/en_speaker_6",
  });
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [videoData, setVideoData] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePromptSubmit = (value: string) => {
    setPrompt(value);
    setCurrentStep(1);
  };

  const handleSettingsChange = (key: keyof VideoSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const generateVideo = async (prompt: string, settings: VideoSettings) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15 * 60 * 1000); // 15 min timeout

    try {
      // Changed endpoint from "/api/generate-video" to "/api/generate-content"
      const response = await fetch("/api/generate-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          prompt,
          genre: settings.genre,
          iterations: settings.iterations,
          // Always use "1" for background video and audio
          backgroundType: "1",
          musicType: "1",
          voiceType: settings.voiceType,
          subtitleColor: settings.subtitleColor,
        }),
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to generate video");
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      if (error.name === "AbortError") {
        throw new Error("Request timed out after 15 minutes.");
      }
      throw error;
    }
  };

  const handleNextStep = async () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      try {
        setIsLoading(true);
        setVideoData(null);
        setError(null);

        const result = await generateVideo(prompt, settings);

        if (result.success && result.video_data) {
          setVideoData(result.video_data);
          console.log("Video metrics:", result.metrics);
        } else {
          throw new Error("Video generation failed: No data returned.");
        }
      } catch (error: any) {
        console.error("Video generation error:", error);
        setError(error.message || "Unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const renderVideoPlayer = () => {
    if (!videoData) return null;

    const blobUrl = `data:video/mp4;base64,${videoData}`;

    return (
      <div className="mt-8 p-6 bg-zinc-800 rounded-xl border border-zinc-700">
        <h3 className="text-xl font-bold text-white mb-4">Your Generated Video</h3>
        <video className="w-full rounded-lg" controls autoPlay src={blobUrl} />
        <div className="mt-4 flex justify-end">
          <a
            href={blobUrl}
            download="generated-video.mp4"
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-md text-white font-medium flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download Video
          </a>
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen w-full">
      <div className="w-64">
        <SidebarWrapper />
      </div>
      <div className="flex-1 dark w-full min-h-screen bg-zinc-900">
        <div className="relative w-full max-w-7xl mx-auto p-6">
          <AnimatePresence>{isLoading && <LoadingScreen />}</AnimatePresence>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 text-center"
          >
            <GlitchText className="text-white text-5xl font-bold tracking-tighter">
              Generate Your AI Video
            </GlitchText>
            <div className="h-1 w-48 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 mx-auto mt-2" />
            <p className="text-zinc-400 mt-4 max-w-2xl mx-auto">
              Enter your video idea below and customize it with our generator. Break the rules and create
              something revolutionary!
            </p>
          </motion.div>

          {error && (
            <div className="mb-8 p-4 bg-red-900/50 border border-red-800 rounded-lg text-white">
              <p className="font-bold text-red-300">Error:</p>
              <p>{error}</p>
              <button
                onClick={() => setError(null)}
                className="mt-2 px-4 py-2 bg-red-800 hover:bg-red-700 rounded-md text-white text-sm"
              >
                Dismiss
              </button>
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-8">
            <motion.div
              className="flex-1"
              initial={{ opacity: 1 }}
              animate={{
                opacity: prompt ? 1 : 1,
                flex: prompt ? "0 0 40%" : "1 0 100%",
              }}
              transition={{ duration: 0.5 }}
            >
              <PromptInput value={prompt} onChange={setPrompt} onSubmit={handlePromptSubmit} />
            </motion.div>

            <AnimatePresence>
              {prompt && (
                <motion.div
                  className="flex-1 bg-zinc-900"
                  initial={{ opacity: 1, x: 50, width: 0 }}
                  animate={{ opacity: 1, x: 0, width: "auto" }}
                  exit={{ opacity: 0, x: 50, width: 0 }}
                  transition={{ duration: 0.5, type: "spring" }}
                >
                  <CustomizationPanel
                    settings={settings}
                    onSettingsChange={handleSettingsChange}
                    currentStep={currentStep}
                    onNextStep={handleNextStep}
                    onPrevStep={handlePrevStep}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {videoData && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              {renderVideoPlayer()}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PlaygroundPage() {
  return <VideoGenerator />;
}






// "use client";

// import { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { CustomizationPanel } from "../(main)/_components/customization-panel";
// import { LoadingScreen } from "../(main)/_components/loading-screen";
// import { PromptInput } from "../(main)/_components/prompt-input";
// import { GlitchText } from "../(main)/_components/ui/glitch-text";
// import SidebarWrapper from "../(main)/_components/SidebarWrapper";
// import { Download } from "lucide-react";

// export type VideoSettings = {
//   subtitleColor: string;
//   iterations: number;
//   genre: string;
//   backgroundVideo: string;
//   backgroundMusic: string;
//   voiceType: string;
// };

// export function VideoGenerator() {
//   const [prompt, setPrompt] = useState("");
//   const [settings, setSettings] = useState<VideoSettings>({
//     subtitleColor: "#ff00ff",
//     iterations: 2,
//     genre: "adventure",
//     backgroundVideo: "1",
//     backgroundMusic: "1",
//     voiceType: "v2/en_speaker_6",
//   });
//   const [currentStep, setCurrentStep] = useState(0);
//   const [isLoading, setIsLoading] = useState(false);
//   const [videoData, setVideoData] = useState<string | null>(null);
//   const [error, setError] = useState<string | null>(null);

//   const handlePromptSubmit = (value: string) => {
//     setPrompt(value);
//     setCurrentStep(1);
//   };

//   const handleSettingsChange = (key: keyof VideoSettings, value: any) => {
//     setSettings((prev) => ({ ...prev, [key]: value }));
//   };

//   const generateVideo = async (prompt: string, settings: VideoSettings) => {
//     const controller = new AbortController();
//     const timeout = setTimeout(() => controller.abort(), 15 * 60 * 1000); // 15 min timeout

//     try {
//       const response = await fetch("/api/generate-video", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         signal: controller.signal,
//         body: JSON.stringify({
//           prompt,
//           genre: settings.genre,
//           iterations: settings.iterations,
//           backgroundType: settings.backgroundVideo,
//           musicType: settings.backgroundMusic,
//           voiceType: settings.voiceType,
//           subtitleColor: settings.subtitleColor,
//         }),
//       });

//       clearTimeout(timeout);

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         throw new Error(errorData.error || "Failed to generate video");
//       }

//       const data = await response.json();
//       return data;
//     } catch (error: any) {
//       if (error.name === "AbortError") {
//         throw new Error("Request timed out after 15 minutes.");
//       }
//       throw error;
//     }
//   };

//   const handleNextStep = async () => {
//     if (currentStep < 4) {
//       setCurrentStep(currentStep + 1);
//     } else {
//       try {
//         setIsLoading(true);
//         setVideoData(null);
//         setError(null);

//         const result = await generateVideo(prompt, settings);

//         if (result.success && result.video_data) {
//           setVideoData(result.video_data);
//           console.log("Video metrics:", result.metrics);
//         } else {
//           throw new Error("Video generation failed: No data returned.");
//         }
//       } catch (error: any) {
//         console.error("Video generation error:", error);
//         setError(error.message || "Unexpected error occurred");
//       } finally {
//         setIsLoading(false);
//       }
//     }
//   };

//   const handlePrevStep = () => {
//     if (currentStep > 1) setCurrentStep(currentStep - 1);
//   };

//   const renderVideoPlayer = () => {
//     if (!videoData) return null;

//     const blobUrl = `data:video/mp4;base64,${videoData}`;

//     return (
//       <div className="mt-8 p-6 bg-zinc-800 rounded-xl border border-zinc-700">
//         <h3 className="text-xl font-bold text-white mb-4">Your Generated Video</h3>
//         <video className="w-full rounded-lg" controls autoPlay src={blobUrl} />
//         <div className="mt-4 flex justify-end">
//           <a
//             href={blobUrl}
//             download="generated-video.mp4"
//             className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-md text-white font-medium flex items-center gap-2"
//           >
//             <Download className="h-4 w-4" />
//             Download Video
//           </a>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="flex min-h-screen w-full">
//       <div className="w-64">
//         <SidebarWrapper />
//       </div>
//       <div className="flex-1 dark w-full min-h-screen bg-zinc-900">
//         <div className="relative w-full max-w-7xl mx-auto p-6">
//           <AnimatePresence>{isLoading && <LoadingScreen />}</AnimatePresence>

//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5 }}
//             className="mb-8 text-center"
//           >
//             <GlitchText className="text-white text-5xl font-bold tracking-tighter">
//               Generate Your AI Video
//             </GlitchText>
//             <div className="h-1 w-48 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 mx-auto mt-2" />
//             <p className="text-zinc-400 mt-4 max-w-2xl mx-auto">
//               Enter your video idea below and customize it with our punk-style generator. Break the rules and create
//               something revolutionary!
//             </p>
//           </motion.div>

//           {error && (
//             <div className="mb-8 p-4 bg-red-900/50 border border-red-800 rounded-lg text-white">
//               <p className="font-bold text-red-300">Error:</p>
//               <p>{error}</p>
//               <button
//                 onClick={() => setError(null)}
//                 className="mt-2 px-4 py-2 bg-red-800 hover:bg-red-700 rounded-md text-white text-sm"
//               >
//                 Dismiss
//               </button>
//             </div>
//           )}

//           <div className="flex flex-col lg:flex-row gap-8">
//             <motion.div
//               className="flex-1"
//               initial={{ opacity: 1 }}
//               animate={{
//                 opacity: prompt ? 1 : 1,
//                 flex: prompt ? "0 0 40%" : "1 0 100%",
//               }}
//               transition={{ duration: 0.5 }}
//             >
//               <PromptInput value={prompt} onChange={setPrompt} onSubmit={handlePromptSubmit} />
//             </motion.div>

//             <AnimatePresence>
//               {prompt && (
//                 <motion.div
//                   className="flex-1 bg-zinc-900"
//                   initial={{ opacity: 1, x: 50, width: 0 }}
//                   animate={{ opacity: 1, x: 0, width: "auto" }}
//                   exit={{ opacity: 0, x: 50, width: 0 }}
//                   transition={{ duration: 0.5, type: "spring" }}
//                 >
//                   <CustomizationPanel
//                     settings={settings}
//                     onSettingsChange={handleSettingsChange}
//                     currentStep={currentStep}
//                     onNextStep={handleNextStep}
//                     onPrevStep={handlePrevStep}
//                   />
//                 </motion.div>
//               )}
//             </AnimatePresence>
//           </div>

//           {videoData && (
//             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
//               {renderVideoPlayer()}
//             </motion.div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default function PlaygroundPage() {
//   return <VideoGenerator />;
// }


