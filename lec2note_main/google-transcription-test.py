import os
import json
from google.cloud import speech

os.environ["GOOGLE_APPLICATION_CREDENTIALS"]=os.path.dirname (os.path.abspath(__file__)) + "/google-credentials.json"

inputFile = "test.flac"

print ("hi")
client = speech.SpeechClient()
audio_file=open(inputFile, "rb")
content = audio_file.read()
audio = speech.RecognitionAudio(content=content)
config = speech.RecognitionConfig(
    encoding=speech.RecognitionConfig.AudioEncoding.FLAC,
    audio_channel_count=2,
    sample_rate_hertz=16000,
    language_code="en-US",
    enable_word_time_offsets=True,
)
print ("got here")

operation = client.long_running_recognize(config=config, audio=audio)
result = operation.result(timeout=90)
persistent_results = []
for result in result.results:
    # Do this encoding otherwise referenceerror ensues
    alternatives = []
    for a in result.alternatives:
        altPacket = {
            "transcript":a.transcript,
            "confidence":a.confidence,
            "words":[]
        }
        for w in a.words:
            altPacket["words"].append({
                "word":w.word,
                "start_time":w.start_time.total_seconds(),
                "end_time":w.end_time.total_seconds(),
            })
        alternatives.append(altPacket)
    persistent_results.append(alternatives)
# Save the persistent result to cache
with open("test.output.json","w") as cacheFile:
    json.dump(persistent_results,cacheFile)