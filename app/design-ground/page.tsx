"use client";

import { use, useState } from "react";
import { AIChatBubble } from "@/components/ui/system/AIChatBubble";
import { AlertCard } from "@/components/ui/system/AlertCard";
import { AnalysisCard } from "@/components/ui/system/AnalysisCard";
import { CueCard } from "@/components/ui/system/CueCard";
import { UnitCard } from "@/components/ui/system/UnitCard";
import IconButton from "@/components/ui/system/IconButton";
import { ProgressCard } from "@/components/ui/system/ProgressCard";
import { SectionNav } from "@/components/ui/system/SectionNav";
import TextButton from "@/components/ui/system/TextButton";
import { TimerChip } from "@/components/ui/system/TimerChip";
import { UserChatBubble } from "@/components/ui/system/UserChatBubble";
import { ArrowLeftIcon, BookBookmarkIcon, HeartIcon, MicrophoneIcon, SpeakerHighIcon, SubtitlesIcon, TextTIcon, TimerIcon, PlayIcon, NumberCircleOneIcon, NumberCircleTwoIcon, NumberCircleThreeIcon } from "@phosphor-icons/react";
import { RadioGroup } from "@/components/ui/system/RadioGroup";
import { TextInput } from "@/components/ui/system/TextInput";
import { AlertOption } from "@/components/ui/system/AlertOption";
import { InfoCard } from "@/components/ui/system/InfoCard";
import { RadioOption } from "@/components/ui/system/RadioOption";
import { AlertOptionGroup } from "@/components/ui/system/AlertOptionGroup";
import { TopicCard } from "@/components/ui/system/TopicCard";
import { RecordingCard } from "@/components/ui/system/RecordingCard";
import { InputField } from "@/components/ui/system/InputField";

export default function DesignGroundPage() {
  const [selected, setSelected] = useState<string>("");
  const [inputValue, setInputValue] = useState("");

  const handleSelect = (value: string) => {
    setSelected(value);
  };
  return (
    <main className="min-h-screen p-6">
      <div className="inline-flex justify-start items-center gap-6">

        <IconButton variant="base" icon={ArrowLeftIcon} />
        <h2 className="text-center justify-start text-black text-lg font-bold">Practice Unit 1 - Part 1 (Introduction)</h2>

      </div>

      <SectionNav title="Practice Unit 1 - Part 1 (Introduction)" />

      <IconButton variant="toggled" icon={SubtitlesIcon}></IconButton>
      <TimerChip icon={TimerIcon} time="00:00:50" className="success" />

      <TextButton variant="secondary">Start Practice</TextButton>
      <br />
      <AlertCard
        icon={HeartIcon}
        iconWeight="regular"
        description="You have successfully started the practice session."
        variant="text"
      />

      <CueCard
        variant="open"
        topic="Topic 1 - Memorable Event"
        status="Cue Card Open"
        question="Describe something you own which is very important to you."
        items={[
          { icon: SubtitlesIcon, text: "Where you got it from" },
          { icon: SubtitlesIcon, text: "How long you have had it" },
        ]}
      />

      <CueCard
        variant="closed"
        status="Cue Card Closed"
        transcription="Yes. One of the most important things I have is my piano..."
      />

      <AnalysisCard
        title="AI Coach Analysis"
        overallScore="9.0"
        level="C2 Expert"
        metrics={[
          {
            label: "Fluency",
            score: "9.0",
            description: "Clear and smooth delivery",
            icon: HeartIcon,
          },
          {
            label: "Vocabulary",
            score: "9.0",
            description: "Wide range of vocabulary",
            icon: BookBookmarkIcon,
          },
          {
            label: "Grammar",
            score: "9.0",
            description: "Accurate and complex usage",
            icon: TextTIcon,
          },
          {
            label: "Pronunciation",
            score: "9.0",
            description: "Natural and clear",
            icon: SpeakerHighIcon,
          },
        ]}
        recommendation="Focus on maintaining consistency in long responses."
      />

      <AIChatBubble
        variant="subtitle"
        title="Time is up!"
        message="Here’s my feedback of our practice session this time."
      />

      <AIChatBubble
        variant="speaking"
        icon={SpeakerHighIcon}
      />

      <AIChatBubble
        variant="done"
        src="/audio/sample.mp3"
      />

      <UserChatBubble
        variant="subtitle"
        message="Yes. Although it is very quiet..."
      />

      <UserChatBubble
        variant="speaking"
        icon={MicrophoneIcon}
        transcription="Good morning, my name is Davina."
      />

      <UserChatBubble
        variant="done"
        src="/audio/sample.mp3"
      />

      <ProgressCard
        title="Part 1 - Introduction"
        progress={100}
        band="9.0"
        icon={NumberCircleOneIcon}
      />

      <ProgressCard
        title="Part 2 - Individual Long Turn"
        progress={0}
        icon={NumberCircleTwoIcon}
      />

      <UnitCard
        variant="test"
        title="Practice Unit 1 - Part 1 (Introduction)"
        description="This part tests your ability to introduce yourself and answer basic questions about familiar topics."
        parts={[
          { icon: NumberCircleOneIcon, title: "Part 1 - Introduction", progress: 100, band: "9.0" },
          { icon: NumberCircleTwoIcon, title: "Part 2 - Individual Long Turn", progress: 100, band: "9.0" },
          { icon: NumberCircleThreeIcon, title: "Part 3 - Two-way Discussion", progress: 100, band: "9.0" },
        ]}
      />

      <RadioGroup
        options={[
          {
            value: "fluency",
            label: "Speak more fluently",
          },
          {
            value: "band",
            label: "Increase band score",
          },
          {
            value: "other",
            label: "Other:",
            renderInput: ({ value, onChange }) => (
              <TextInput
                value={value}
                onChange={onChange}
                placeholder="Yea..."
              />
            ),
          },
        ]}
      />

      <AlertOptionGroup
        options={[
          {
            value: "fluency",
            title: "Speak more fluently",
            description: "Focus on improving the flow and naturalness of your speech.",
            variant: "success",
          },
          {
            value: "band",
            title: "Increase band score",
            description: "Aim to achieve a higher band score in your next practice.",
            variant: "warning",
          },
          {
            value: "other",
            title: "Other:",
            description: "Please specify any other areas you want to focus on.",
            variant: "neutral",
            renderInput: ({ value, onChange }) => (
              <TextInput
                value={value}
                onChange={onChange}
                placeholder="Yea..."
              />
            ),
          },
        ]}
      />

      <InfoCard
        description="This is a sample info card."
        icon={SpeakerHighIcon}
      />

      <TopicCard
        value="fluency"
        title="Speak more fluently"
        description="Focus on improving the flow and naturalness of your speech."
        selected={selected === "fluency"}
        onSelect={setSelected}
      />

      <RecordingCard
        coachName="John Doe"
        studentName="Jane Smith"
        coachTranscription="Good morning, my name is John."
        studentTranscription="Now, in this first part, I’d like to ask you some more questions about yourself, OK? Let’s talk about your home town or village. What kind of place is it? Now, in this first part, I’d like to ask you some more questions about yourself, OK? Let’s talk about your home town or village. What kind of Now, in this first part, I’d like to ask you some more questions about yourself, OK? Let’s talk about your home town or village. What kind of"
      />

      <InputField
        value={inputValue}
        onChange={setInputValue}
      />

    </main>
  );
}
