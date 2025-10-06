'use client';

import Link from 'next/link';
import './landing.css';
import { Dancing_Script } from 'next/font/google';

const dancingScript = Dancing_Script({ 
  subsets: ['latin'],
  variable: '--font-dancing-script'
});

export default function Home() {
  return (
    <div className={`min-h-screen flex items-center justify-center ${dancingScript.variable} bg-[rgba(0,37,39,0.8)]`}>
      <div className="w-full">
        {/* Hero Section */}
        <div className="text-center px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 pt-8 sm:pt-12 lg:pt-16">
          {/* Headline */}
          <h1 className="hero-headline font-black mb-6 px-4 text-white">
            AI-powered feedback to make every speech stronger.
          </h1>

          {/* Sub-headline */}
          <p className="hero-subheadline font-normal mb-12 max-w-5xl mx-auto px-4 text-white">
          Confication analyzes your speech in real time — delivery, language, and content — and gives on-point feedback with targeted drills.
          </p>

          {/* Call to Action Button */}
          <div className="flex justify-center items-center mb-8 px-4">
            <Link 
              href="/login"
              className="hero-button w-full sm:w-auto rounded-xl font-bold transition-all duration-200 transform hover:scale-105 bg-[rgba(234,128,64)] hover:bg-[rgba(234,128,64,0.9)] text-white shadow-lg hover:shadow-xl"
            >
              Try It Free
            </Link>
          </div>

          {/* Small disclaimer text */}
          <p className="hero-disclaimer px-4 text-gray-300">
            No downloads required. Runs in your browser.
          </p>
        </div>

        {/* What is Confication Section - Under Hero */}
        <div className="py-12 lg:py-16 bg-white px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20">
          <div className="text-left space-y-6">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-[rgba(0,37,39)]">
              What is Confication?
            </h2>
            
            <p className="text-lg sm:text-xl leading-relaxed text-[rgba(0,37,39)]">
            The name comes from confi (confident) and cation (communication)
            </p>
            
            <p className="text-lg sm:text-xl leading-relaxed text-[rgba(0,37,39)]">
            Whether you're preparing for an interview, pitching an idea, or speaking on stage, Confication helps you build the confidence to communicate clearly and with impact.
            </p>
          </div>
        </div>

        {/* What to Expect Section */}
        <div className="py-16 lg:py-20 bg-[rgba(0,37,39)] px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-12 lg:mb-16">
              What to Expect
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
              {/* Feature 1 */}
              <div className="text-left">
                <div className="text-6xl sm:text-7xl lg:text-8xl font-bold text-white mb-4">
                  1
                </div>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-4">
                  Smart Analysis
                </h3>
                <p className="text-base sm:text-lg leading-relaxed text-white">
                  Get instant feedback with AI-powered scoring.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="text-left">
                <div className="text-6xl sm:text-7xl lg:text-8xl font-bold text-white mb-4">
                  2
                </div>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-4">
                  Actionable Feedback
                </h3>
                <p className="text-base sm:text-lg leading-relaxed text-white">
                  No vague tips — see exactly what to improve, with evidence highlighted in your transcript.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="text-left">
                <div className="text-6xl sm:text-7xl lg:text-8xl font-bold text-white mb-4">
                  3
                </div>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-4">
                  Practice Drills
                </h3>
                <p className="text-base sm:text-lg leading-relaxed text-white">
                  Targeted exercises to strengthen weak spots, from pacing to sentence structure.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="py-16 lg:py-20 bg-white px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[rgba(0,37,39)] mb-12 lg:mb-16">
              How It Works
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
              {/* Step 1 */}
              <div className="text-left">
                <div className="text-6xl sm:text-7xl lg:text-8xl font-bold text-[rgba(0,37,39)] mb-4">
                  1
                </div>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[rgba(0,37,39)] mb-4">
                  Speak or Upload
                </h3>
                <p className="text-base sm:text-lg leading-relaxed text-[rgba(0,37,39)]">
                  Record speech directly in your browser.
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-left">
                <div className="text-6xl sm:text-7xl lg:text-8xl font-bold text-[rgba(0,37,39)] mb-4">
                  2
                </div>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[rgba(0,37,39)] mb-4">
                  AI Analysis
                </h3>
                <p className="text-base sm:text-lg leading-relaxed text-[rgba(0,37,39)]">
                Confication transcribes your speech and evaluates it against 10 essential aspects of effective communication.
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-left">
                <div className="text-6xl sm:text-7xl lg:text-8xl font-bold text-[rgba(0,37,39)] mb-4">
                  3
                </div>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[rgba(0,37,39)] mb-4">
                  Personalized Feedback
                </h3>
                <p className="text-base sm:text-lg leading-relaxed text-[rgba(0,37,39)]">
                  See scores, highlighted problem areas, and suggestions tailored to your speech.
                </p>
              </div>

              {/* Step 4 */}
              <div className="text-left">
                <div className="text-6xl sm:text-7xl lg:text-8xl font-bold text-[rgba(0,37,39)] mb-4">
                  4
                </div>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[rgba(0,37,39)] mb-4">
                  Practice & Repeat
                </h3>
                <p className="text-base sm:text-lg leading-relaxed text-[rgba(0,37,39)]">
                  Use targeted drills and repeat the routine regularly to track progress and build lasting confidence.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Building Together Section */}
        <div className="py-16 lg:py-20 bg-[rgba(0,37,39)] px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-8 lg:mb-12">
              Building Together
            </h2>
            
            <div className="text-left max-w-4xl mx-auto">
              <p className="text-lg sm:text-xl leading-relaxed text-white mb-6 font-handwriting">
                Confication is my attempt to make communication coaching accessible to everyone. Right now, it's just an MVP — but with your feedback, it can grow into something truly valuable. Please try it, explore, and tell me what you think.
              </p>
              
              <p className="text-lg sm:text-xl text-white font-handwriting">
                — Sidhartha
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}