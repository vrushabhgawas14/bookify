import React from "react";
import {
  FileText,
  Headphones,
  BookOpen,
  Users,
  Volume2,
  Languages,
  Clock,
  Settings,
  ChevronRight,
} from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-background text-textColor_primary">
      {/* Hero Section */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-6">About Bookify</h1>
          <p className="text-xl text-textColor_secondary">
            Transform long documents into concise, accessible knowledge with our
            intelligent text processing platform.
          </p>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-12 px-6 bg-backgroundDull">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">
            Core Features
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<FileText className="w-8 h-8" />}
              title="Document Processing"
              description="Efficiently process PDF and DOCX files up to 12 pages, maintaining accuracy and context in summaries."
            />
            <FeatureCard
              icon={<Headphones className="w-8 h-8" />}
              title="Audio Conversion"
              description="Convert summaries to natural-sounding audio with playback controls for speed, volume, and pitch."
            />
            <FeatureCard
              icon={<Languages className="w-8 h-8" />}
              title="Multi-language Support"
              description="Access content in multiple languages with our advanced translation capabilities."
            />
          </div>
        </div>
      </section>

      {/* User Groups */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">
            Who Benefits from Bookify?
          </h2>
          <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8">
            <UserGroupCard
              icon={<Users className="w-12 h-12" />}
              title="Visually Impaired Users"
              features={[
                "Audio playback of documents",
                "Adjustable speech settings",
                "Easy-to-use interface",
                "Screen reader compatibility",
              ]}
            />
            <UserGroupCard
              icon={<BookOpen className="w-12 h-12" />}
              title="Students"
              features={[
                "Quick document summaries",
                "Study material condensation",
                "Audio learning support",
                "Research paper processing",
              ]}
            />
            <UserGroupCard
              icon={<Settings className="w-12 h-12" />}
              title="Professionals"
              features={[
                "Efficient document review",
                "Time-saving summaries",
                "Mobile-friendly access",
                "Premium content library",
              ]}
            />
          </div>
        </div>
      </section>

      {/* How to Use */}
      <section className="py-16 px-6 bg-backgroundDull">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">
            How to Use Bookify
          </h2>
          <div className="space-y-8">
            <Step
              number="1"
              title="Upload Your Document"
              description="Select and upload your PDF or DOCX file (up to 12 pages) using our simple interface."
            />
            <Step
              number="2"
              title="Get Your Summary"
              description="Our AI processes your document and generates a concise, accurate summary maintaining key information."
            />
            <Step
              number="3"
              title="Listen or Read"
              description="Choose between reading the summary or listening to it with our customizable audio playback features."
            />
          </div>
        </div>
      </section>

      {/* Audio Controls Guide */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">
            Audio Playback Features
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AudioFeature
              icon={<Volume2 className="w-6 h-6" />}
              title="Volume Control"
              description="Adjust audio volume to your preferred level"
            />
            <AudioFeature
              icon={<Clock className="w-6 h-6" />}
              title="Playback Speed"
              description="Control reading speed from 0.5x to 2x"
            />
            <AudioFeature
              icon={<Languages className="w-6 h-6" />}
              title="Language Selection"
              description="Choose from multiple voice options"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: any) {
  return (
    <div className="p-6 rounded-lg border border-borderColor_primary bg-background">
      <div className="text-colorBright mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-textColor_secondary">{description}</p>
    </div>
  );
}

function UserGroupCard({ icon, title, features }: any) {
  return (
    <div className="p-6 rounded-lg border border-borderColor_primary bg-background">
      <div className="text-colorBright mb-6 flex justify-center">{icon}</div>
      <h3 className="text-xl font-semibold mb-4 text-center">{title}</h3>
      <ul className="space-y-3">
        {features.map((feature: any, index: any) => (
          <li
            key={index}
            className="flex items-center text-textColor_secondary"
          >
            <ChevronRight className="w-4 h-4 mr-2 text-colorBright" />
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Step({ number, title, description }: any) {
  return (
    <div className="flex items-start space-x-4">
      <div className="w-12 h-12 flex-shrink-0 rounded-full bg-background border border-borderColor_primary flex items-center justify-center text-xl font-bold">
        {number}
      </div>
      <div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-textColor_secondary">{description}</p>
      </div>
    </div>
  );
}

function AudioFeature({ icon, title, description }: any) {
  return (
    <div className="p-6 rounded-lg border border-borderColor_primary bg-background text-center">
      <div className="flex justify-center mb-4 text-colorBright">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-textColor_secondary">{description}</p>
    </div>
  );
}
