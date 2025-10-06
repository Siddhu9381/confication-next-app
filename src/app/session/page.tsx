'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CircularRing from '@/components/CircularRing';
import LoadingModal from '@/components/LoadingModal';
import { useTheme } from '@/contexts/ThemeContext';
import { StreamingTranscriber } from 'assemblyai';

export default function SessionPage() {
  const { isDarkMode } = useTheme();
  const router = useRouter();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState('Idle');
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [showStartModal, setShowStartModal] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [isTokenFetched, setIsTokenFetched] = useState(false);
  const [sessionCredits, setSessionCredits] = useState<number | null>(null);
  const [showNoCreditsModal, setShowNoCreditsModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const fillDuration = 120000; // Fixed 120 seconds (2 minutes)
  
  // Audio recording refs and state
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const stopTimerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const stopTimeRef = useRef<number>(0);
  const assemblyAiTokenRef = useRef<string | null>(null);
  
  // Assembly AI transcriber ref
  const transcriberRef = useRef<StreamingTranscriber | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioWorkletNodeRef = useRef<AudioWorkletNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const isStoppingRef = useRef<boolean>(false);
  const audioBufferRef = useRef<Float32Array[]>([]);
  const targetSamplesRef = useRef<number>(1600); // 100ms at 16kHz (16000 * 0.1)
  const processedTurnsRef = useRef<Set<string>>(new Set()); // Track processed turn IDs
  
  // Refs for current values (to avoid stale state in auto-stop)
  const finalTranscriptRef = useRef<string>('');
  const wordTimestampsRef = useRef<any[]>([]);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Transcript state (kept for finalization, but not updated in real-time)
  const [partialTranscript, setPartialTranscript] = useState<string>('');
  const [finalTranscript, setFinalTranscript] = useState<string>('');
  const [wordTimestamps, setWordTimestamps] = useState<Array<{text: string, start: number, end: number}>>([]);

  // Check authentication on component mount
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    
    try {
      const user = JSON.parse(userData);
      if (!user.idToken) {
        router.push('/login');
        return;
      }
      // Authentication successful
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/login');
    }
  }, [router]);

  // Fetch session data and Assembly AI token
  const fetchSessionData = async () => {
    try {
      setRecordingStatus('Creating session...');
      
      // Get ID token from localStorage (we'll use the stored token for now)
      const userData = localStorage.getItem('user');
      if (!userData) {
        throw new Error('User not authenticated. Please login again.');
      }
      
      const user = JSON.parse(userData);
      const idToken = user.idToken;
      
      if (!idToken) {
        throw new Error('ID token not found. Please login again.');
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_CONFICATION_URL}/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch token: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Check for session credits first
      if (data.session_credits !== undefined) {
        setSessionCredits(data.session_credits);
        
        if (data.session_credits === 0) {
          setShowNoCreditsModal(true);
          setShowStartModal(false); // Close the start recording modal
          setRecordingStatus('No credits remaining');
          return data; // Return early, don't proceed with session setup
        }
      }
      
      // Validate response structure only if we have credits
      if (!data.session_id || !data.assemblyai || !data.assemblyai.token) {
        throw new Error('Invalid session response structure');
      }
      
      // Store session ID and Assembly AI token
      sessionIdRef.current = data.session_id;
      assemblyAiTokenRef.current = data.assemblyai.token;
      
      console.log('Session created successfully:', {
        sessionId: data.session_id,
        assemblyAiToken: data.assemblyai.token,
        expiresAt: data.assemblyai.expires_at,
        expiresInSeconds: data.assemblyai.expires_in_seconds,
        maxSessionDurationSeconds: data.assemblyai.max_session_duration_seconds
      });
      
      return data;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  };


  // Reset transcript state for new recording
  const resetTranscriptState = () => {
    setPartialTranscript('');
    setFinalTranscript('');
    setWordTimestamps([]);
    // Reset refs as well
    finalTranscriptRef.current = '';
    wordTimestampsRef.current = [];
  };

  // Get final session results - use refs to get the most current values
  const getSessionResults = () => {
    // Use refs to get the most up-to-date values, especially important for auto-stop
    const currentTranscript = finalTranscriptRef.current || finalTranscript;
    const currentWordTimestamps = wordTimestampsRef.current || wordTimestamps;
    
    const results = {
      finalTranscript: currentTranscript.trim(),
      wordTimestamps: currentWordTimestamps,
      wordCount: currentWordTimestamps.length,
      sessionId: sessionIdRef.current,
      duration: stopTimeRef.current > 0 ? Math.round(stopTimeRef.current - startTimeRef.current) : 0
    };
    
    
    return results;
  };


  // Save final transcript to localStorage whenever it changes
  useEffect(() => {
    if (finalTranscript && typeof window !== 'undefined') {
      localStorage.setItem('finalTranscript', finalTranscript);
    }
  }, [finalTranscript]);

  // Send finalize request to API
  const finalizeSession = async () => {
    try {
      const results = getSessionResults();
      
      if (!results.sessionId) {
        console.error('No session ID available for finalization');
        return;
      }

      // Check if we have valid transcript data before sending to /process
      if (!results.wordTimestamps || results.wordTimestamps.length === 0 || 
          !results.finalTranscript || results.finalTranscript.trim() === '') {
        console.log('No transcript data available, skipping /process request');
        setRecordingStatus('Recording completed - no transcript data to process');
        setShowLoadingModal(false);
        return;
      }
      
      // Show loading modal
      setShowLoadingModal(true);
      setRecordingStatus('Finalizing session...');
      
      const API_BASE = process.env.NEXT_PUBLIC_CONFICATION_URL || 'http://localhost:8000';
      const payload = {
        sessionId: results.sessionId,
        wordTimestamps: results.wordTimestamps,
        finalTranscript: results.finalTranscript,
        wordCount: results.wordCount,
        duration: results.duration
      };

      // Get ID token from localStorage
      const userData = localStorage.getItem('user');
      if (!userData) {
        throw new Error('User not authenticated. Please login again.');
      }
      
      const user = JSON.parse(userData);
      const idToken = user.idToken;
      
      if (!idToken) {
        throw new Error('ID token not found. Please login again.');
      }

      const response = await fetch(`${API_BASE}/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Finalize request failed: ${response.status} ${response.statusText}`);
      }

      const responseData = await response.json();
      setRecordingStatus('Session completed and finalized.');
      
      // Save report data to localStorage to avoid refetching
      if (typeof window !== 'undefined') {
        localStorage.setItem('sessionReportData', JSON.stringify(responseData));
      }
      
      // Navigate to session-report page after successful finalization
      setTimeout(() => {
        window.location.href = '/session-report';
      }, 2000); // 2 second delay for smooth transition
      
      return responseData;
    } catch (error) {
      console.error('Error finalizing session:', error);
      setRecordingStatus(`Finalization failed: ${error instanceof Error ? error.message : error}`);
      setShowLoadingModal(false); // Hide loading modal on error
      throw error;
    }
  };

  // Start recording (simplified - just token fetch and session creation)
  // Start countdown function
  const startCountdown = async () => {
    setIsCountingDown(true);
    setCountdown(10);
    
    // Start connecting to Assembly AI during countdown (best time to reduce latency)
    const connectPromise = connectToAssemblyAI();
    
    countdownTimerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          // Countdown finished, start recording
          if (countdownTimerRef.current) {
            clearInterval(countdownTimerRef.current);
            countdownTimerRef.current = null;
          }
          setIsCountingDown(false);
          setShowStartModal(false);
          setIsRecording(true);
          
          // Wait for connection to complete, then start recording
          connectPromise.then(() => {
            startRecording();
          }).catch((error) => {
            console.error('Failed to connect to Assembly AI:', error);
            setRecordingStatus('Failed to connect. Please try again.');
            setIsRecording(false);
          });
          
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Connect to Assembly AI (called during countdown)
  const connectToAssemblyAI = async () => {
    const token = assemblyAiTokenRef.current;
    
    if (!token) {
      throw new Error('No Assembly AI token available');
    }

    // Use existing session ID (no need to create another session)
    setRecordingStatus(`Session: ${sessionIdRef.current} — setting up transcriber...`);

    // Initialize StreamingTranscriber
    const transcriber = new StreamingTranscriber({
      token,
      sampleRate: 16000,
      encoding: 'pcm_s16le',
      formatTurns: true,
    });

    transcriberRef.current = transcriber;

    // Set up transcriber event handlers
    transcriber.on('open', async ({ id }) => {
        console.log(`✅ Session opened: ${id}`);
        setRecordingStatus(`Session: ${sessionIdRef.current} — connected (${id})`);
        
        // Now set up audio processing after connection is established
        try {
          setRecordingStatus(`Session: ${sessionIdRef.current} — setting up audio...`);
          console.log("🎤 Setting up audio processing after connection...");
          
          // Create AudioContext with 16kHz sample rate
          const ctx = new AudioContext({ sampleRate: 16000 });
          audioContextRef.current = ctx;
          console.log("✅ AudioContext created with 16kHz sample rate");

          // Add inline Float32 AudioWorklet module
          await ctx.audioWorklet.addModule(URL.createObjectURL(new Blob([`
            class Float32Processor extends AudioWorkletProcessor {
              process(i){
                const c = i[0][0]; if(!c) return true;
                // Send Float32Array directly for pcm_f32le encoding
                this.port.postMessage(c);
                return true;
              }
            }
            registerProcessor('float32', Float32Processor);
          `], {type:'application/javascript'})));
          console.log("✅ Float32 AudioWorklet module loaded");

          // Get microphone access
          const mic = await navigator.mediaDevices.getUserMedia({ audio: true });
          mediaStreamRef.current = mic;
          console.log("✅ Microphone access granted");

          // Create audio source and worklet node
          const src = ctx.createMediaStreamSource(mic);
          const node = new AudioWorkletNode(ctx, 'float32');
          audioWorkletNodeRef.current = node;
          console.log("🔧 AudioWorkletNode created:", node);
          
          // Set up message handler - now it's safe to send audio
          node.port.onmessage = (e) => {
            console.log("🎤 Audio message received from worklet:", e.data.length, "samples");
            
            if (transcriberRef.current && e.data instanceof Float32Array) {
              try {
                // Buffer audio to meet Assembly AI's 100-2000ms requirement
                audioBufferRef.current.push(e.data);
                
                // Calculate total buffered samples
                const totalSamples = audioBufferRef.current.reduce((sum, chunk) => sum + chunk.length, 0);
                console.log("🔍 Buffered samples:", totalSamples, "Target:", targetSamplesRef.current);
                
                // Send when we have enough samples (100ms worth)
                if (totalSamples >= targetSamplesRef.current) {
                  console.log("🔍 Sending buffered audio chunk...");
                  
                  // Concatenate all buffered audio
                  const combinedAudio = new Float32Array(totalSamples);
                  let offset = 0;
                  for (const chunk of audioBufferRef.current) {
                    combinedAudio.set(chunk, offset);
                    offset += chunk.length;
                  }
                  
                  console.log("🔍 Combined audio length:", combinedAudio.length, "samples");
                  console.log("🔍 Audio duration:", (combinedAudio.length / 16000 * 1000).toFixed(1), "ms");
                  
                  // Convert to Int16Array for PCM16 encoding
                  const int16Array = new Int16Array(combinedAudio.length);
                  for (let i = 0; i < combinedAudio.length; i++) {
                    int16Array[i] = Math.max(-1, Math.min(1, combinedAudio[i])) * 0x7FFF;
                  }
                  
                  console.log("🔍 Sending ArrayBuffer of length:", int16Array.buffer.byteLength, "bytes");
                  transcriberRef.current.sendAudio(int16Array.buffer);
                  console.log("✅ Audio sent successfully!");
                  
                  // Clear buffer
                  audioBufferRef.current = [];
                }
              } catch (error) {
                console.error("❌ Error sending audio:", error);
                console.error("❌ Error details:", error instanceof Error ? error.message : String(error));
                
                // Stop recording on socket error to prevent error spam
                if (error instanceof Error && error.message.includes("Socket is not open") && !isStoppingRef.current) {
                  console.log("🛑 Socket error detected - stopping recording to prevent spam...");
                  isStoppingRef.current = true;
                  stopRecording();
                }
              }
            } else {
              console.warn("⚠️ No transcriber available or invalid audio data");
            }
          };
          
          // Connect audio chain
          src.connect(node);
          console.log("✅ Audio processing setup complete");
          
          // Wait a moment to ensure connection is fully stable
          await new Promise(resolve => setTimeout(resolve, 500));
          console.log("✅ Connection stability delay completed");
          
          setRecordingStatus(`Session: ${sessionIdRef.current} — recording...`);
        } catch (error) {
          console.error("❌ Error setting up audio processing:", error);
          setRecordingStatus(`Audio setup failed: ${error}`);
          
          // Stop recording on audio setup error
          if (!isStoppingRef.current) {
            console.log("🛑 Audio setup failed - stopping recording...");
            isStoppingRef.current = true;
            stopRecording();
          }
        }
      });

      transcriber.on('turn', (t) => {
        
        // Process the turn to collect transcript and word timestamps
        // Only process final formatted turns (end_of_turn: true AND turn_is_formatted: true) to avoid redundancy from partial turns
        if (t.end_of_turn && t.turn_is_formatted && t.transcript && t.transcript.trim()) {
          // Create a unique identifier for this turn
          const turnId = `${t.turn_order}-${t.transcript.trim()}`;
          
          // Check if we've already processed this turn
        if (processedTurnsRef.current.has(turnId)) {
          return;
        }
          
          // Mark this turn as processed
          processedTurnsRef.current.add(turnId);
          
          // Add to final transcript
          setFinalTranscript(prev => {
            const newTranscript = prev + (prev ? ' ' : '') + t.transcript.trim();
            // Update ref with current value
            finalTranscriptRef.current = newTranscript;
            return newTranscript;
          });
          
          // Collect word timestamps from the same turn
          if (t.words && Array.isArray(t.words) && t.words.length > 0) {
            setWordTimestamps(prev => {
              const newTimestamps = [...prev, ...t.words];
              // Update ref with current value
              wordTimestampsRef.current = newTimestamps;
              return newTimestamps;
            });
          }
        }
        
        // Skip logging for non-matching turns to reduce noise
      });

      transcriber.on('error', (e) => {
        console.error(`❌ Transcriber Error: ${e}`);
        setRecordingStatus(`Transcription Error: ${e}`);
        
        // Automatically stop recording on error to prevent error spam
        if (!isStoppingRef.current) {
          console.log("🛑 Stopping recording due to error...");
          isStoppingRef.current = true;
          stopRecording();
        }
      });

      transcriber.on('close', (event) => {
        console.log('🔌 Connection closed unexpectedly!');
        console.log('🔍 Close event details:', event);
        console.log('🔍 Close event details - transcriber ref:', transcriberRef.current);
        setRecordingStatus("Recording finished.");
        transcriberRef.current = null;
      });

    // Connect to Assembly AI
    console.log("🔌 Connecting to Assembly AI...");
    await transcriber.connect();
    console.log("✅ Connected to Assembly AI");
    
    setRecordingStatus(`Session: ${sessionIdRef.current} — ready to record`);
  };

  const startRecording = async () => {
    try {
      // Reset stopping flag
      isStoppingRef.current = false;
      
      // Reset transcript state for new recording
      resetTranscriptState();
      
      // Clear processed turns tracking
      processedTurnsRef.current.clear();
      
      // Clear countdown timer if running
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
      
      // Reset token fetched state
      setIsTokenFetched(false);

      // Start recording timer
      startTimeRef.current = performance.now();
      stopTimeRef.current = 0;

      // Set timer to auto-stop after 2 minutes
      if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
      stopTimerRef.current = setTimeout(() => {
        stopRecording();
      }, fillDuration); // 2 minutes

      setRecordingStatus(`Session: ${sessionIdRef.current} — recording...`);

    } catch (error) {
      console.error('Error starting recording:', error);
      
      // Clean up any partial state
      assemblyAiTokenRef.current = null;
      
      // Set appropriate error message based on the error type
      if (error instanceof Error) {
        if (error.message.includes('Assembly AI token')) {
          setRecordingStatus(`Token Error: ${error.message}`);
        } else {
          setRecordingStatus(`Recording Error: ${error.message}`);
        }
      } else {
        setRecordingStatus(`Error: ${error}`);
      }
      
      // Ensure recording state is reset on error
      setIsRecording(false);
      console.log("🛑 Recording state reset due to error");
    }
  };

  // Stop recording (simplified)
  const stopRecording = () => {
    console.log('🛑 stopRecording called');
    try {
      // Reset stopping flag and clear audio buffer
      isStoppingRef.current = false;
      audioBufferRef.current = [];
      
      // 1) Close transcriber
      if (transcriberRef.current) {
        transcriberRef.current.close();
        transcriberRef.current = null;
        console.log("Transcription stopped");
      }

      // 2) Disconnect audio worklet node
      if (audioWorkletNodeRef.current) {
        audioWorkletNodeRef.current.disconnect();
        audioWorkletNodeRef.current.port.close();
        audioWorkletNodeRef.current = null;
      }

      // 3) Close audio context
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }

      // 4) Stop media stream
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      }

      // 5) Clear timer
      if (stopTimerRef.current) {
        clearTimeout(stopTimerRef.current);
        stopTimerRef.current = null;
      }
      
      // 6) Clear Assembly AI token
      assemblyAiTokenRef.current = null;
      
      // 7) Update timing
      stopTimeRef.current = performance.now();
      
      // 8) Finalize session
      finalizeSession();
      
      console.log("Recording stopped and cleaned up");
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  };


  const handleRecordingToggle = async () => {
    if (isRecording) {
      // Stop recording
      stopRecording();
      setIsRecording(false);
      setRecordingStatus('Stopped');
    } else {
      // Check if user has credits before proceeding
      if (sessionCredits === 0) {
        setShowNoCreditsModal(true);
        setRecordingStatus('No credits remaining');
        return;
      }
      
      // Show start modal and fetch token in background
      setShowStartModal(true);
      
      // Create session and fetch Assembly AI token in background if not already done
      if (!isTokenFetched) {
        try {
          await fetchSessionData();
          setIsTokenFetched(true);
        } catch (error) {
          console.error('Failed to create session:', error);
          setRecordingStatus('Failed to prepare recording. Please try again.');
          setShowStartModal(false);
        }
      }
    }
  };


  // Show loading state while checking authentication
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Checking authentication...</div>
      </div>
    );
  }

  return (
    <div 
      className="relative flex flex-col items-center justify-center px-4 space-y-8"
      style={{ height: 'calc(100vh - 97px)' }}
    >
      <CircularRing 
            isDarkMode={isDarkMode}
            size={200}
            strokeWidth={12}
            isRecording={isRecording}
            fillDuration={fillDuration}
          />
      
               {/* Recording Status */}
               <div className="text-center">
                 <div className={`text-sm font-medium ${
                   isDarkMode ? 'text-gray-300' : 'text-gray-600'
                 }`}>
                   {recordingStatus}
                 </div>
               </div>

      
      <div className="flex space-x-4">
        <button 
          onClick={handleRecordingToggle}
          disabled={sessionCredits === 0}
          className={`px-8 py-3 rounded-lg font-semibold text-lg transition-colors duration-200 ${
            isRecording
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : sessionCredits === 0
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : isDarkMode 
                  ? 'bg-teal-600 hover:bg-teal-700 text-white' 
                  : 'bg-teal-600 hover:bg-teal-700 text-white'
          }`}
        >
          {isRecording ? 'Stop Recording' : sessionCredits === 0 ? 'No Credits Available' : 'Start Recording'}
        </button>

        
      </div>
      
      {/* Start Recording Modal */}
      {showStartModal && (
        <div className="absolute inset-0 flex items-center justify-center z-50">
          <div className={`p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 backdrop-blur-sm ${
            isDarkMode ? 'bg-gray-800/80 text-white border border-gray-600' : 'bg-white/80 text-gray-900 border border-gray-300'
          }`}>
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-6">Ready to Record?</h2>
              
              <div className="space-y-4 mb-6 text-left">
                <div className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    isDarkMode ? 'bg-white' : 'bg-gray-800'
                  }`}></div>
                  <p className="text-sm">You'll have a <strong>10-second countdown</strong> before recording starts</p>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    isDarkMode ? 'bg-white' : 'bg-gray-800'
                  }`}></div>
                  <p className="text-sm">Recording will last <strong>2 minutes</strong> and cannot be retaken</p>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    isDarkMode ? 'bg-white' : 'bg-gray-800'
                  }`}></div>
                  <p className="text-sm">Recording will be <strong>automatically submitted</strong> for analysis when stopped</p>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    isDarkMode ? 'bg-white' : 'bg-gray-800'
                  }`}></div>
                  <p className="text-sm">Find a <strong>quiet environment</strong> for better speech analysis</p>
                </div>
              </div>
              
              {isCountingDown ? (
                <div className="space-y-4">
                  <div className="text-6xl font-bold text-teal-500 mb-4">
                    {countdown}
                  </div>
                  <p className="text-lg">Get ready...</p>
                </div>
              ) : (
                <div className="flex space-x-4">
                  <button
                    onClick={() => {
                      setShowStartModal(false);
                      setIsTokenFetched(false);
                    }}
                    className={`px-6 py-3 rounded-lg font-semibold transition-colors duration-200 ${
                      isDarkMode 
                        ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                        : 'bg-gray-300 hover:bg-gray-400 text-gray-900'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={startCountdown}
                    disabled={!isTokenFetched}
                    className={`px-6 py-3 rounded-lg font-semibold transition-colors duration-200 ${
                      isTokenFetched
                        ? 'bg-teal-600 hover:bg-teal-700 text-white'
                        : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    {isTokenFetched ? 'Start Recording' : 'Preparing...'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Loading Modal */}
      <LoadingModal 
        isVisible={showLoadingModal}
        message="Processing your session..."
        isDarkMode={isDarkMode}
      />

      {/* No Credits Modal */}
      {showNoCreditsModal && (
        <div className="absolute inset-0 flex items-center justify-center z-50">
          <div className={`p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 backdrop-blur-sm ${
            isDarkMode ? 'bg-gray-800/80 text-white border border-gray-600' : 'bg-white/80 text-gray-900 border border-gray-300'
          }`}>
            <div className="text-center">
              {/* No Credits Icon */}
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>

              <h2 className="text-2xl font-bold mb-4">
                No Credits Remaining
              </h2>
              
              <p className="text-gray-600 mb-6">
                You have used all your available recording credits.
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => setShowNoCreditsModal(false)}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
