import subprocess
import os
import json
from google.cloud import speech

# Include the key path in the environment variable.
os.environ["GOOGLE_APPLICATION_CREDENTIALS"]=os.path.dirname (os.path.abspath(__file__)) + "/google-credentials.json"


def transcribe_file(speech_file, cache_dir=None, start_time=0, audioChannels=2):
    print("Transcribing file using google speech...")
    cache_path = None
    if cache_dir!=None:
        # check the cache
        cache_path = f"{cache_dir}/{os.path.basename(speech_file)}.json"
        if os.path.exists(cache_path):
            print("Cache found, attempting read...")
            try:
                with open(cache_path,"r") as cacheFile:
                    return json.load(cacheFile)
            except:
                os.unlink(cache_path) # file was invalid

    # Cache doesn't exist, actually do the query now
    print("Cache miss or empty, using Google Speech...")
    client = speech.SpeechClient()
    audio_file=open(speech_file, "rb")
    content = audio_file.read()
    audio = speech.RecognitionAudio(content=content)
    config = speech.RecognitionConfig(
        encoding=speech.RecognitionConfig.AudioEncoding.FLAC,
        audio_channel_count=audioChannels,
        sample_rate_hertz=16000,
        language_code="en-US",
        enable_word_time_offsets=True,
    )
    operation = client.long_running_recognize(config=config, audio=audio)
    result = operation.result(timeout=90)
    # result = client.recognize(config=config, audio=audio)
    persistent_results = []
    for result in result.results:
        # Do this encoding otherwise referenceerror ensues? not entirely sure but better safe than sorry
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
                    "start_time":w.start_time.total_seconds()+start_time,
                    "end_time":w.end_time.total_seconds()+start_time,
                })
            alternatives.append(altPacket)
        persistent_results.append(alternatives)
    # Save the persistent result to cache
    with open(cache_path,"w") as cacheFile:
        json.dump(persistent_results,cacheFile)
    return persistent_results


def run_ffmpeg(inputFile, outputFolder, tstart, duration, outputFile = None):
    # Start ffmpeg to convert video to audio
    if outputFile == None:
        outputFile = f"{outputFolder}/audioOnly_{tstart}_{tstart+duration}.flac"
    if os.path.exists(outputFile):
        print ("Skip ffmpeg - cache hit")
        return 0
    process = subprocess.Popen([
        "ffmpeg",
        "-i", str(inputFile), # Specify the input file
        "-y", # overwrite whatever is there
        "-ss", str(tstart), # start time
        "-to", str(tstart+duration), # end time
        "-map", "a", # audio only
        "-ar", "16000", # Set 16000 sample rate because google needs it
        str(outputFile) # Filename for the output 
    ],stdout=subprocess.PIPE, stderr=subprocess.PIPE) # silence output
    
    # Wait for the process to finish
    while process.poll() is None:
        pass
    return process.returncode

def get_file_size(inputFile):
    return float((subprocess.check_output(
        ["ffprobe", "-v", "error", "-show_entries",
        "format=duration", "-of",
        "default=noprint_wrappers=1:nokey=1",
        inputFile]
    )).decode('utf-8'))

def get_audio_channels(inputFile):
    return int((subprocess.check_output(
        ["ffprobe", "-v", "0", "-show_entries",
        "stream=channels", "-of",
        "compact=p=0:nk=1",
        inputFile]
    )).decode('utf-8'))

def audio_pipeline(inputFile, outputFolder, verbose=False):

    # Create the audio file caches folder if it doesn't exist
    audioCacheDir = outputFolder+"/audio_caches"
    if not os.path.exists(audioCacheDir):
        os.mkdir(audioCacheDir)

    # Create the transcript caches folder if it doesn't exist
    transcriptCacheDir = outputFolder+"/transcript_caches"
    if not os.path.exists(transcriptCacheDir):
        os.mkdir(transcriptCacheDir)

    # Cut the file into 10s snippets and send to google cloud
    timeCompletedUpTo=0
    duration = 15 # seconds - each request is rounded up to 15s.
    timeToComplete = get_file_size(inputFile)
    channelCount = get_audio_channels(inputFile)
    fullTranscript = []
    while timeCompletedUpTo<timeToComplete:
        print (f"transcribing {timeCompletedUpTo} to {timeCompletedUpTo+duration}s...")
        outputFile = f"{audioCacheDir}/audioOnly_{timeCompletedUpTo}_{timeCompletedUpTo+duration}.flac"
        run_ffmpeg(inputFile, audioCacheDir, timeCompletedUpTo, duration, outputFile)
        partialTranscript = transcribe_file(outputFile, cache_dir = transcriptCacheDir, start_time=timeCompletedUpTo, audioChannels=channelCount)
        fullTranscript.append(partialTranscript)
        timeCompletedUpTo += duration
    if verbose:
        return fullTranscript
    else:
        # get the non verbose version
        # by picking only the highest confidence (first) result and taking the words
        collapsedWords=[]
        for transcriptChunk in fullTranscript:
            bestAccuracyOnly = [r[0] for r in transcriptChunk]
            wordsOnly = [s["words"] for s in bestAccuracyOnly]
            for wordsList in wordsOnly:
                for word in wordsList:
                    collapsedWords.append(word)
        return collapsedWords


if __name__=="__main__":
    result = audio_pipeline("audioTest.webm", ".")
    print(result)
