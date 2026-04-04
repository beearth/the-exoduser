const DEFAULT_ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1';
const DEFAULT_MODEL_ID = 'eleven_multilingual_v2';
const DEFAULT_OUTPUT_FORMAT = 'mp3_44100_128';

function requireNonEmpty(value, label) {
  if (!value || !String(value).trim()) {
    throw new Error(`${label} is missing`);
  }
  return String(value).trim();
}

export function buildElevenLabsTtsRequest({
  apiKey,
  voiceId,
  text,
  modelId = DEFAULT_MODEL_ID,
  outputFormat = DEFAULT_OUTPUT_FORMAT,
  voiceSettings,
  baseUrl = DEFAULT_ELEVENLABS_BASE_URL,
}) {
  const resolvedApiKey = requireNonEmpty(apiKey, 'ElevenLabs API key');
  const resolvedVoiceId = requireNonEmpty(voiceId, 'ElevenLabs voice id');
  const resolvedText = requireNonEmpty(text, 'ElevenLabs text');
  const resolvedBaseUrl = requireNonEmpty(baseUrl, 'ElevenLabs base url');
  const resolvedModelId = requireNonEmpty(modelId, 'ElevenLabs model id');
  const resolvedOutputFormat = requireNonEmpty(outputFormat, 'ElevenLabs output format');

  const base = resolvedBaseUrl.endsWith('/') ? resolvedBaseUrl : `${resolvedBaseUrl}/`;
  const url = new URL(`text-to-speech/${encodeURIComponent(resolvedVoiceId)}`, base).toString();

  const body = {
    text: resolvedText,
    model_id: resolvedModelId,
    output_format: resolvedOutputFormat,
  };
  if (voiceSettings && typeof voiceSettings === 'object' && Object.keys(voiceSettings).length > 0) {
    body.voice_settings = voiceSettings;
  }

  return {
    url,
    init: {
      method: 'POST',
      headers: {
        'xi-api-key': resolvedApiKey,
        Accept: 'audio/mpeg',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    },
  };
}
