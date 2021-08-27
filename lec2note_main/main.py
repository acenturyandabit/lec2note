import argparse
import os
import audio_pipeline
import video_pipeline
import json_pipeline

parser = argparse.ArgumentParser()
parser.add_argument("inputFile", default="audiotest.webm")
parser.add_argument("outputFolder",default=".")
args = parser.parse_args()

# Create the directory, using it as a temp and final storage location
os.makedirs(args.outputFolder, exist_ok=True)

# Transcribe audio
audio_transcript = audio_pipeline.audio_pipeline(args.inputFile, args.outputFolder)

# process video
video_frames = video_pipeline.video_pipeline(args.inputFile, args.outputFolder)

# merge tracks
json_pipeline.json_pipeline(args.inputFile, args.outputFolder, audio_transcript, video_frames)
