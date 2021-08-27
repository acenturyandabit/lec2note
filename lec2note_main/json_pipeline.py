import os, json
def json_pipeline(inputFile, outputFolder, audio_transcript,video_frames):

    # Generate the json data file to tell the what to render
    dataFile = {}
    dataFile["meta"] = {
        "fileName":os.path.basename(inputFile)
    }

    # Video chunks take priority - so align the text to the video chunks
    dataFile["scenes"] = video_frames
    
    # For each video chunk, grab all the text on it. Then put the chunk meta + text into the datafile array.    
    # Initialise the first chunk
    frame_index=0
    dataFile["scenes"][frame_index]["words"]=""
    for word in audio_transcript:
        while word["end_time"]>dataFile["scenes"][frame_index]["end_time"] and frame_index<len(dataFile["scenes"])-1:
            frame_index+=1
            dataFile["scenes"][frame_index]["words"]=""
        dataFile["scenes"][frame_index]["words"]+=word["word"]+" "

    # Write it out
    with open(outputFolder+"/data.json","w") as f:
        json.dump(dataFile,f)