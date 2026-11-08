export type MediaResult = { stream: MediaStream } | { error: "denied" | "unavailable" }

async function request(constraints: MediaStreamConstraints): Promise<MediaResult> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) return { error: "unavailable" }
  try {
    return { stream: await navigator.mediaDevices.getUserMedia(constraints) }
  } catch (err) {
    const name = err instanceof DOMException ? err.name : ""
    return { error: name === "NotAllowedError" || name === "SecurityError" ? "denied" : "unavailable" }
  }
}

export function requestMic() {
  return request({ audio: true })
}

export function requestCamera(facing: "environment" | "user") {
  return request({ video: { facingMode: { ideal: facing } }, audio: false })
}

const VIDEO_TYPES = ["video/webm;codecs=vp9", "video/webm", "video/mp4"]
const AUDIO_TYPES = ["audio/webm", "audio/mp4"]

/** MediaRecorder with the first supported container for the stream's kind. */
export function createRecorder(stream: MediaStream) {
  const candidates = stream.getVideoTracks().length > 0 ? VIDEO_TYPES : AUDIO_TYPES
  const mimeType = candidates.find((type) => MediaRecorder.isTypeSupported(type))
  return new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
}

export function stopStream(stream: MediaStream | null | undefined) {
  stream?.getTracks().forEach((track) => track.stop())
}
