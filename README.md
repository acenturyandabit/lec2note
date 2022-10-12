## Inspiration
Watching recorded lectures is one of the most dreary parts of uni life. After a long day working on assignments, part time work, or other ways to spend the valuable daylight hours, maintaining the focus to watch (and actually digest) 2 hours of lectures is a big ask. 

## What it does
Lec2Note turns lectures into frame-synchronised transcripts to support your learning experience. Through these transcripts, students can:
- Search through lectures and make sure nothing's missed
- Skip silences and errata, and process lectures in idle time
- Match narration with slides without the manual effort

## How we built it
Lec2Note uses Google's Speech to text API and OpenCV. 
- Google speech to text is a cost effective way of getting high quality transcriptions from audio.
- OpenCV uses local processing power to identify key turning points in the video stream.
- ffmpeg and ffprobe were used to help with file type conversions.
All of these tools are reasonably cross platform!
## Challenges we ran into
- Creating a video pipeline that was reliable enough to split chunks of video without over-splitting busy periods or missing key transitions was quite difficult. 
- File format conversions are messy. Even things like # of audio channels tripped us up.
## Accomplishments that we're proud of
Getting a robust video and audio processing pipeline up!

Also there's a super-low-dependency custom Single Page Web App framework in `controller.js`, making our app react-free and super slim :D

## What we learned
Using opencv skills to create an actual real product was fun! We also learnt a few things about nodejs express and how to use a file system as a database in a pinch XD

Also, material icons from google are fantastic assets! 

## What's next for lec2note
Popping it on a website so other people can use it would be nice :D We could also use wav2vec in the backend so that we can operate for free (sorry google)

## Setup
1. Install node.js
2. Run `npm install .` to fetch required packages.
3. Install opencv and google speech client: `pip install opencv-python google-cloud-speech`
4. Install `ffmpeg` and add `ffmpeg` and `ffprobe` to your system PATH.
5. Provide a `google-credentials.json` in the `lec2note_main` directory. This needs to be created in the google cloud console.
6. Run `node index.js` and navigate to `localhost:3234` in your browser.

You'll now be able to upload and transcribe lectures!
