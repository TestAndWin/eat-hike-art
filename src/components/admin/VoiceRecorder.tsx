import { useState, useRef, useCallback, useEffect } from 'react';
import { GableRating } from '@/components/GableRating';
import type { Entry } from '@/lib/types';

type EntryType = 'restaurant' | 'art' | 'tour';
type RecordingStep = 'idle' | 'recording' | 'transcribing' | 'reviewing' | 'generating' | 'done' | 'error';

const typeLabels: Record<EntryType, string> = {
  restaurant: 'Restaurant',
  art: 'Kunst',
  tour: 'Tour',
};

const stepMessages: Record<RecordingStep, string> = {
  idle: 'Bereit zur Aufnahme',
  recording: 'Aufnahme läuft...',
  transcribing: 'Transkribiere Audio...',
  reviewing: 'Transkript bereit',
  generating: 'Generiere Eintrag...',
  done: 'Eintrag erstellt!',
  error: 'Fehler aufgetreten',
};

export function VoiceRecorder() {
  const [category, setCategory] = useState<EntryType>('restaurant');
  const [step, setStep] = useState<RecordingStep>('idle');
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [generatedEntry, setGeneratedEntry] = useState<Entry | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  // Format seconds to MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setStep('recording');
      setRecordingTime(0);

      // Start timer
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      setError('Mikrofon-Zugriff verweigert. Bitte Berechtigung erteilen.');
      setStep('error');
    }
  }, []);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setStep('transcribing');
    }
  }, []);

  // Transcribe audio when blob is ready
  useEffect(() => {
    if (audioBlob && step === 'transcribing') {
      transcribeAudio(audioBlob);
    }
  }, [audioBlob, step]);

  // Transcribe the audio
  const transcribeAudio = async (blob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', blob, 'recording.webm');

      const response = await fetch('/api/voice/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Transkription fehlgeschlagen');
      }

      const data = await response.json();
      setTranscript(data.transcript);
      setStep('reviewing');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transkription fehlgeschlagen');
      setStep('error');
    }
  };

  // Generate entry from transcript
  const generateEntry = async () => {
    if (!transcript) return;

    setStep('generating');
    setError(null);

    try {
      const response = await fetch('/api/voice/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, category }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Generierung fehlgeschlagen');
      }

      const data = await response.json();
      setGeneratedEntry(data.entry);
      setStep('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generierung fehlgeschlagen');
      setStep('error');
    }
  };

  // Reset to start new recording
  const reset = () => {
    setStep('idle');
    setRecordingTime(0);
    setAudioBlob(null);
    setTranscript(null);
    setGeneratedEntry(null);
    setError(null);
  };

  // Retry transcription
  const retryTranscription = () => {
    if (audioBlob) {
      setError(null);
      setStep('transcribing');
      transcribeAudio(audioBlob);
    }
  };

  // Get edit URL for the generated entry
  const getEditUrl = (entry: Entry): string => {
    return `/admin/entries/${entry.type}/${entry.slug}`;
  };

  return (
    <div className="space-y-8">
      {/* Category Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Kategorie</label>
        <div className="flex gap-2">
          {(['restaurant', 'art', 'tour'] as EntryType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => step === 'idle' && setCategory(t)}
              disabled={step !== 'idle'}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                category === t
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80 disabled:opacity-50'
              }`}
            >
              {typeLabels[t]}
            </button>
          ))}
        </div>
      </div>

      {/* Recording Section */}
      <div className="rounded-lg border p-6 space-y-6">
        {/* Recording Button & Timer */}
        <div className="flex flex-col items-center gap-4">
          <div className="text-4xl font-mono tabular-nums">
            {formatTime(recordingTime)}
          </div>

          {step === 'idle' && (
            <button
              onClick={startRecording}
              className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-lg font-medium text-primary-foreground transition-transform hover:scale-105"
            >
              <MicrophoneIcon className="h-6 w-6" />
              Aufnehmen
            </button>
          )}

          {step === 'recording' && (
            <button
              onClick={stopRecording}
              className="flex items-center gap-2 rounded-full bg-red-600 px-6 py-3 text-lg font-medium text-white transition-transform hover:scale-105 animate-pulse"
            >
              <StopIcon className="h-6 w-6" />
              Stoppen
            </button>
          )}

          {(step === 'transcribing' || step === 'generating') && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <LoadingSpinner className="h-5 w-5 animate-spin" />
              <span>{stepMessages[step]}</span>
            </div>
          )}
        </div>

        {/* Status */}
        <div className="text-center text-sm text-muted-foreground">
          {stepMessages[step]}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          <div className="mt-3 flex gap-2">
            {step === 'error' && audioBlob && (
              <button
                onClick={retryTranscription}
                className="text-sm font-medium text-red-800 underline hover:no-underline dark:text-red-200"
              >
                Erneut versuchen
              </button>
            )}
            <button
              onClick={reset}
              className="text-sm font-medium text-red-800 underline hover:no-underline dark:text-red-200"
            >
              Neue Aufnahme
            </button>
          </div>
        </div>
      )}

      {/* Transcript Section */}
      {transcript && (step === 'reviewing' || step === 'generating' || step === 'done') && (
        <div className="space-y-4">
          <h3 className="font-semibold">Transkript</h3>
          <div className="rounded-lg border bg-muted/50 p-4">
            <p className="text-sm whitespace-pre-wrap">{transcript}</p>
          </div>

          {step === 'reviewing' && (
            <div className="flex gap-2">
              <button
                onClick={reset}
                className="rounded-md px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Neu aufnehmen
              </button>
              <button
                onClick={generateEntry}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Eintrag generieren
              </button>
            </div>
          )}
        </div>
      )}

      {/* Generated Entry Preview */}
      {generatedEntry && step === 'done' && (
        <div className="space-y-4">
          <h3 className="font-semibold">Vorschau</h3>
          <EntryPreview entry={generatedEntry} />

          <div className="flex gap-2">
            <a
              href={getEditUrl(generatedEntry)}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Bearbeiten
            </a>
            <button
              onClick={reset}
              className="rounded-md px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Neue Aufnahme
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Entry preview component
function EntryPreview({ entry }: { entry: Entry }) {
  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="font-semibold">{entry.name}</h4>
          {entry.type === 'restaurant' && (
            <p className="text-sm text-muted-foreground">
              {entry.cuisine.join(', ')}{entry.price_range ? ` · ${entry.price_range}` : ''}
            </p>
          )}
          {entry.type === 'art' && (
            <p className="text-sm text-muted-foreground">{entry.museum}</p>
          )}
          {entry.type === 'tour' && entry.distance_km && (
            <p className="text-sm text-muted-foreground">{entry.distance_km} km</p>
          )}
        </div>
        <GableRating rating={entry.rating} size="md" />
      </div>

      {entry.content && (
        <p className="text-sm text-muted-foreground line-clamp-3">{entry.content}</p>
      )}

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
          Entwurf
        </span>
        <span>{entry.date}</span>
      </div>
    </div>
  );
}

// Icons
function MicrophoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
    </svg>
  );
}

function StopIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <rect x="6" y="6" width="12" height="12" rx="1" />
    </svg>
  );
}

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

export default VoiceRecorder;
