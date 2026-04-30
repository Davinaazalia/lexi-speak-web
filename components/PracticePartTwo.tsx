"use client";

type SpeakingAnalysis = {
  overallScore: number;
  summary: string;
  personalizedInsight?: {
    strengths?: string[];
    focusAreas?: string[];
    goalAlignedTips?: string[];
    levelComparison?: string;
    timelineAdvice?: string;
  };
};

type SpeakingCard = {
  id: number;
  title: string;
  promptText: string;
};

type Part2Topic = {
  shortLabel: string;
  prompt: string;
  bulletPoints: string[];
};

type PracticePartTwoProps = {
  topics: Part2Topic[];
  selectedTopicIndex: number | null;
  selectedTopic: Part2Topic | null;
  activeSpeakingCard: SpeakingCard | null;
  isPart2PrepActive: boolean;
  part2PrepTimeLeft: number;
  hasPart2FlashCardClosed: boolean;
  isAnswerRecording: boolean;
  answerTranscript: string;
  responseTimeLeft: number;
  sessionTimeLeft: number;
  isAnalyzing: boolean;
  latestAnalysis: SpeakingAnalysis | null;
  speechError: string;
  isAiSpeaking: boolean;
  isTtsSupported: boolean;
  part2Warning: string;
  part2RecordingWarning: string;
  onSelectTopic: (index: number) => void;
  onStartPreparation: () => void;
  onSpeakCardText: () => void;
  onStopAnswerRecording: () => void;
  onMoveToNextCard: () => Promise<void>;
  onSubmitCurrentAnswerAnalysis: () => Promise<boolean>;
  onSetTtsRate: (value: number) => void;
};

export default function PracticePartTwo({
  topics,
  selectedTopicIndex,
  selectedTopic,
  activeSpeakingCard,
  isPart2PrepActive,
  part2PrepTimeLeft,
  hasPart2FlashCardClosed,
  isAnswerRecording,
  answerTranscript,
  responseTimeLeft,
  sessionTimeLeft,
  isAnalyzing,
  latestAnalysis,
  speechError,
  isAiSpeaking,
  isTtsSupported,
  part2Warning,
  part2RecordingWarning,
  onSelectTopic,
  onStartPreparation,
  onSpeakCardText,
  onStopAnswerRecording,
  onMoveToNextCard,
  onSubmitCurrentAnswerAnalysis,
}: PracticePartTwoProps) {
  return (
    <div className="space-y-6 rounded-4xl border border-neutral-200 bg-white/95 p-6 shadow-sm backdrop-blur-sm dark:border-neutral-700 dark:bg-white/6">
      <div className="space-y-3">
        <div className="text-sm font-semibold text-neutral-900">IELTS Part 2 Practice</div>
        <p className="text-sm leading-6 text-neutral-600">
          Choose one of four cue card topics, prepare for one minute, then speak for up to two minutes.
          Focus on covering all bullet points clearly and finish with a short summary.
        </p>
      </div>

      {!selectedTopic && (
        <div className="space-y-4 rounded-3xl border border-neutral-200 bg-[#f8fafc] p-5">
          <div className="text-sm font-semibold text-neutral-900">Choose a Part 2 topic</div>
          <div className="grid gap-3 md:grid-cols-2">
            {topics.map((topic, index) => (
              <button
                key={topic.shortLabel}
                type="button"
                onClick={() => onSelectTopic(index)}
                className="rounded-2xl border border-neutral-200 bg-white px-4 py-4 text-left text-sm transition hover:border-(--primary) hover:bg-(--tertiary)/70"
              >
                <div className="font-medium text-neutral-900">{topic.shortLabel}</div>
                <div className="mt-2 text-xs text-neutral-500">{topic.prompt}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedTopic && (
        <div className="space-y-5">
          <div className="space-y-4 rounded-3xl border border-neutral-200 bg-[#f8fafc] p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm font-semibold text-neutral-900">Preparation stage</div>
                <div className="mt-1 text-sm text-neutral-600">
                  Press Start to open the flash card. It will close automatically after 60 seconds.
                </div>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm">
                <span className="font-semibold">60s</span>
                <span>preparation</span>
              </div>
            </div>

            {!isPart2PrepActive && !hasPart2FlashCardClosed && (
              <button
                type="button"
                onClick={onStartPreparation}
                className="w-full rounded-full bg-(--primary) px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
              >
                Start preparation
              </button>
            )}

            {isPart2PrepActive && (
              <div className="rounded-3xl border border-neutral-200 bg-white p-4">
                <div className="flex items-center justify-between text-sm font-semibold text-neutral-900 mb-4">
                  <span>Flash card is visible</span>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-(--primary)/10 px-3 py-1 text-xs font-semibold text-(--primary)">
                      IELTS Part 2
                    </span>
                    <span>{part2PrepTimeLeft}s left</span>
                  </div>
                </div>
                <div className="mt-3 rounded-2xl border border-neutral-200 bg-[#fdf4f4] p-5">
                  <div className="font-semibold text-neutral-900 mb-3">{selectedTopic.shortLabel}</div>
                  <div className="text-sm text-neutral-700 mb-4">{selectedTopic.prompt}</div>
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-neutral-600 uppercase tracking-wide">You should say:</div>
                    {selectedTopic.bulletPoints.map((point) => (
                      <div key={point} className="text-sm text-neutral-700 flex gap-3">
                        <span className="text-neutral-400 shrink-0">•</span>
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-neutral-200">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-(--primary) to-(--secondary) transition-all duration-500"
                    style={{ width: `${(part2PrepTimeLeft / 60) * 100}%` }}
                  />
                </div>
                {part2Warning && <div className="mt-3 rounded-2xl bg-yellow-50 px-4 py-3 text-sm text-yellow-800">{part2Warning}</div>}
              </div>
            )}

            {hasPart2FlashCardClosed && (
              <div className="rounded-3xl border border-neutral-200 bg-white p-4 text-sm text-neutral-700">
                <div className="font-semibold text-neutral-900">Preparation completed</div>
                <div className="mt-2">The flash card is closed. Your recording will start automatically and run for up to 120 seconds.</div>
              </div>
            )}
          </div>

          {hasPart2FlashCardClosed && (
            <div className="space-y-4 rounded-3xl border border-neutral-200 bg-[#fcfcff] p-5">
              <div className="flex items-center justify-between gap-3 text-sm text-neutral-700">
                <div>
                  <div className="font-semibold text-neutral-900">Recording stage</div>
                  <div className="text-xs text-neutral-500">Speak continuously and expand your answer with details, reasons, and examples.</div>
                </div>
                <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-neutral-700 shadow-sm">
                  {responseTimeLeft}s remaining
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={isAnswerRecording ? onStopAnswerRecording : onSpeakCardText}
                  disabled={isAiSpeaking}
                  className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700"
                >
                  {isAnswerRecording ? "Stop recording" : "Start recording"}
                </button>
              </div>

              {speechError && <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800">{speechError}</div>}
              {part2RecordingWarning && <div className="rounded-2xl bg-yellow-50 px-4 py-3 text-sm text-yellow-800">{part2RecordingWarning}</div>}

              <div className="rounded-3xl border border-neutral-200 bg-white p-4 text-sm text-neutral-700">
                <div className="text-sm font-semibold text-neutral-900">Answer transcript</div>
                <div className="mt-2 min-h-14 whitespace-pre-wrap leading-6 text-neutral-700">
                  {answerTranscript || "No spoken answer captured yet."}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={async () => {
                    await onSubmitCurrentAnswerAnalysis();
                  }}
                  disabled={isAnalyzing || !answerTranscript.trim()}
                  className="rounded-full border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isAnalyzing ? "Analyzing..." : "Analyze answer"}
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await onMoveToNextCard();
                  }}
                  className="rounded-full bg-(--primary) px-4 py-3 text-sm font-semibold text-white shadow-sm"
                >
                  Finish Part 2
                </button>
              </div>
            </div>
          )}

          {latestAnalysis && (
            <div className="rounded-3xl border border-neutral-200 bg-white p-4 text-sm text-neutral-700">
              <div className="text-sm font-semibold text-neutral-900">IELTS Analysis</div>
              <div className="mt-2 text-sm text-neutral-500">Overall score: {latestAnalysis.overallScore}/9</div>
              <div className="mt-3 text-sm leading-6 text-neutral-700">{latestAnalysis.summary}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
