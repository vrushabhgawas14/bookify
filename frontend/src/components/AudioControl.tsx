import { Play, Pause, ArrowUp, ArrowDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface myProps {
  extractedText: string;
}

export default function AudioControl({ extractedText }: myProps) {
  // Audio
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [isControlsOpen, setControlsOpen] = useState(false);

  // Audio Settings
  const [speed, setSpeed] = useState(1);
  const [volume, setVolume] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [selectedVoice, setSelectedVoice] =
    useState<SpeechSynthesisVoice | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    // Load available voices
    const loadVoices = () => {
      const synthVoices = window.speechSynthesis.getVoices();
      setVoices(synthVoices);
      if (synthVoices.length > 0) setSelectedVoice(synthVoices[0]); // Default to first voice
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    // Cancel speech on component unmount (refresh or navigate away)
    return () => {
      speechSynthesis.cancel();
    };
  }, []);

  const startSpeaking = () => {
    if (!extractedText) return;

    const utterance = new SpeechSynthesisUtterance(extractedText);
    utterance.lang = selectedVoice?.lang || "en-US";
    utterance.rate = speed;
    utterance.volume = volume;
    utterance.pitch = pitch;
    if (selectedVoice) utterance.voice = selectedVoice;

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    speechSynthesis.cancel();
    speechSynthesisRef.current = utterance;
    speechSynthesis.speak(utterance);
  };

  // Pause Text-to-Speech
  const handlePlayPause = () => {
    if (speechSynthesis.speaking) {
      if (isPaused) {
        speechSynthesis.resume();
        setIsPaused(false);
        setIsPlaying(true);
      } else {
        speechSynthesis.pause();
        setIsPaused(true);
        setIsPlaying(false);
      }
    } else {
      startSpeaking();
    }
  };

  useEffect(() => {
    if (isPlaying) {
      startSpeaking();
    }
  }, [extractedText, speed, volume, pitch, selectedVoice]);

  useEffect(() => {
    const cancelSpeech = () => {
      speechSynthesis.cancel();
    };

    window.addEventListener("beforeunload", cancelSpeech);

    return () => {
      cancelSpeech();
      window.removeEventListener("beforeunload", cancelSpeech);
    };
  }, [extractedText]);

  return (
    <>
      {/* Audio */}
      <div className="flex flex-col gap-y-10 justify-center mt-4">
        <div className="flex justify-center gap-x-10">
          <button
            onClick={handlePlayPause}
            className="px-4 py-2 bg-message text-textColor_primary rounded-lg hover:bg-backgroundDull font-semibold border border-borderColor_primary flex items-center gap-x-2"
          >
            {isPlaying && !isPaused ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5" />
            )}
            <span>{isPlaying && !isPaused ? "Pause" : "Play"}</span>
          </button>
          <button
            onClick={() => setControlsOpen(!isControlsOpen)}
            className="px-4 py-2 bg-message text-textColor_primary rounded-lg hover:bg-backgroundDull font-semibold border border-borderColor_primary flex items-center gap-x-2"
          >
            <span>Controls</span>
            <span>{isControlsOpen ? <ArrowUp /> : <ArrowDown />}</span>
          </button>
        </div>

        {isControlsOpen && (
          <section className="grid grid-cols-2 gap-4 px-4 ease-in-out duration-300">
            {/* Volume Slider */}
            <div className="flex flex-col gap-y-2 bg-borderColor_secondary p-2 rounded-lg">
              <label className="text-base font-semibold text-textColor_primary">
                Volume: {volume.toFixed(1)}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-full h-4 bg-gray-300 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Speed Slider */}
            <div className="flex flex-col gap-y-2 bg-borderColor_secondary p-2 rounded-lg">
              <label className="text-base font-semibold text-textColor_primary">
                Speed: {speed.toFixed(1)}
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-full h-4 bg-gray-300 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Pitch Slider */}
            <div className="flex flex-col gap-y-2 bg-borderColor_secondary p-2 rounded-lg">
              <label className="text-base font-semibold text-textColor_primary">
                Pitch: {pitch.toFixed(1)}
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={pitch}
                onChange={(e) => setPitch(parseFloat(e.target.value))}
                className="w-full h-4 bg-gray-300 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Language Dropdown */}
            <div className="flex flex-col gap-y-2 bg-borderColor_secondary p-2 rounded-lg">
              <label>Language:</label>
              <select
                value={selectedVoice?.name}
                onChange={(e) => {
                  const voice = voices.find((v) => v.name === e.target.value);
                  setSelectedVoice(voice || null);
                }}
                className="bg-background rounded-lg border-2 border-borderColor_primary px-2 py-1"
              >
                {voices.map((voice, index) => (
                  <option key={index} value={voice.name}>
                    {voice.name} ({voice.lang})
                  </option>
                ))}
              </select>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
