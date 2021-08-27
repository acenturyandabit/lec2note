import argparse
import os
import audio_pipeline
import video_pipeline
import json_pipeline

parser = argparse.ArgumentParser()
parser.add_argument("inputFile")
parser.add_argument("outputFolder")
args = parser.parse_args()

# Create the directory, using it as a temp storage location.
os.makedirs(args.outputFolder, exist_ok=True)

def audio_pipeline(inputFile, outputFolder):
    print("Doing audio pipeline...")
    pass

def video_pipeline(inputFile, outputFolder):
    print("Doing video pipeline...")
    pass

def json_pipeline(inputFile, outputFolder, audio_transcript, video_frames):
    print("Doing json pipeline...")
    pass

# Transcribe audio
audio_transcript = audio_pipeline(args.inputFile, args.outputFolder)

# process video
video_frames = video_pipeline(args.inputFile, args.outputFolder)

# merge tracks
json_pipeline(args.inputFile, args.outputFolder, audio_transcript, video_frames)
