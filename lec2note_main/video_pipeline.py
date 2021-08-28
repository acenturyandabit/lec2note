import os
import cv2
import numpy as np


class betterFrameCacher:
    def __init__(self, threshold):
        self.bestFrame = None
        self.prev = -1
        self.isBoring = True
        self.threshold = threshold

    def getScore(self, newFrame):
        grayFrame = cv2.cvtColor(newFrame, cv2.COLOR_BGR2GRAY)
        hist = cv2.calcHist([grayFrame], [0], None, [16], [0, 256])
        hist = np.reshape(hist, [len(hist)])
        hist = hist/np.sum(hist)
        vals = np.array(range(len(hist)))
        variance = (np.sum(vals*vals*hist))-(np.sum(vals*hist))**2
        return variance

    def update(self, newFrame):
        score = self.getScore(newFrame)
        if (score > self.prev):
            self.bestFrame = newFrame
            self.prev = score
            self.isBoring = score < self.threshold

    def set(self, newFrame):
        self.bestFrame = newFrame
        self.prev = self.getScore(newFrame)
        self.isBoring = self.prev < self.threshold
        # Get histograms of each


def video_pipeline(inputFile, outputFolder):
    print("Video pipeline started.")
    # Create the /frames directory
    if not os.path.exists(outputFolder+"/frames"):
        os.mkdir(outputFolder+"/frames")

    cap = cv2.VideoCapture(inputFile)
    prevFrame = None
    frame = None
    sequenceFrames = 0
    videoSequenceFrames = 0
    frameCount = 0
    fps = cap.get(cv2.CAP_PROP_FPS)
    #fcount = cap.get(cv2.CAP_PROP_FRAME_COUNT)
    results = []
    currentSectionIsVideo = False

    sequencebestFrameCache = betterFrameCacher(threshold=0.05)
    globalBestFrameCache = betterFrameCacher(threshold=0.05)

    def writeRecord():
        nonlocal frameCount
        nonlocal sequenceFrames
        nonlocal currentSectionIsVideo
        nonlocal sequencebestFrameCache

        # ignore snippets that are less than 0.1s
        if sequenceFrames < 0.1*fps:
            return

        # Also ignore baseline-boring frames
        if sequencebestFrameCache.isBoring:
            return

        # Write a record
        protoResult = {
            "start_time": (frameCount - sequenceFrames)/fps,
            "end_time": frameCount/fps,
            "type": "still",
            "fname": f"frames/{frameCount - sequenceFrames}_{frameCount}.jpg"
        }

        print(f"wrote record {protoResult['fname']}")
        # Behave differently for subvideos and stills
        # Arbitrary threshold of 10s to be counted as a real video
        if currentSectionIsVideo and videoSequenceFrames > 10*fps:
            # Update metadata
            # h264 video files are playable by chrome, the mp4s cv2 can generate aren't :(
            protoResult["type"] = "subvideo"
            cv2.imwrite(outputFolder+"/" +
                        protoResult["fname"], sequencebestFrameCache.bestFrame)
        else:
            cv2.imwrite(outputFolder+"/" +
                        protoResult["fname"], sequencebestFrameCache.bestFrame)

        results.append(protoResult)

        # Reset some stuff
        currentSectionIsVideo = False
        sequenceFrames = 0

    def bitsDifferent(phash1, phash2):
        # calculate bitwise difference
        hnorm = 0
        for byteIndex in range(8):
            xorPhash = phash1[0][byteIndex] ^ phash2[0][byteIndex]
            for bitIndex in range(8):
                if (xorPhash >> bitIndex) & 1 == 1:
                    hnorm += 1
        return hnorm

    oldPhash = None
    oldDiffs = []
    # Process all frames
    while True:
        ret, frame = cap.read()
        if not ret:
            break

        phash = cv2.img_hash.pHash(frame)
        if prevFrame is not None:
            difference = bitsDifferent(phash, oldPhash)
            # Check if there was a huge difference (i.e. a slide has popped up, etc)
            if difference > 2:
                significant=True
                for d in oldDiffs:
                    if difference<d+5:
                        significant=False
                if significant:
                    writeRecord()
                    # reset most interesting frame
                    sequencebestFrameCache.set(frame)
                else:
                    videoSequenceFrames += 1
                    currentSectionIsVideo = True
            oldDiffs.append(difference)
            if len(oldDiffs) > 10:
                oldDiffs.pop(0)
        # Also pick out the most interesting frames from the picture, lest we get weird fade-ins
        sequencebestFrameCache.update(frame)
        globalBestFrameCache.update(frame)

        prevFrame = frame
        oldPhash = phash
        sequenceFrames += 1
        frameCount += 1

        if frameCount % 1000 == 0:
            print(f"Processed up to {frameCount/fps}s")

        

    # write the final slide
    writeRecord()

    # write the global most interesting slide so we can have a thumbnail for the video
    cv2.imwrite(outputFolder+"/thumbnail.png", globalBestFrameCache.bestFrame)
    return results


if __name__ == "__main__":
    result = video_pipeline("audiotest.webm", ".")
    print(result)
