import { React, useState, useEffect } from "react";
import "./App.css";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

const ffmpeg = createFFmpeg({ log: true });
function App() {
  const [isUpload, setUpload] = useState();
  const [getStart, setStart] = useState(1);
  const [getEnd, setEnd] = useState(0);
  const [videoUploaded, getVideoUploaded] = useState(false);
  const [isVideoReady, setVideoReady] = useState(false);
  const [GIF, getConvertedGIF] = useState();
  console.log(isUpload);

  useEffect(() => {
    loadVideo();
  }, []);

  const loadVideo = async () => {
    await ffmpeg.load();
    setVideoReady(true);
  };

  const convertVideoToGIFCreator = async () => {
    // Write the .mp4 video to the FFmpeg file system
    ffmpeg.FS("writeFile", "video.mp4", await fetchFile(isUpload));
    // handle converting the video to gif
    await ffmpeg.run(
      "-i",
      "video.mp4",
      "-s",
      "480x320",
      "-r",
      "3",
      "-t",
      getEnd,
      "-ss",
      getStart,
      "-f",
      "gif",
      "output.gif"
    );
    // handle converting the gif to a base64 string
    const data = ffmpeg.FS("readFile", "output.gif");
    const url = URL.createObjectURL(
      new Blob([data.buffer], { type: "image/gif" })
    );
    getConvertedGIF(url);
  };
  return (
    <div className=" w-screen h-screen">
      <div className=" w-full bg-slate-900 pt-60 pb-12 px-4 text-white">
        <h1 className=" text-2xl font-semibold text-blue-600 absolute top-3">
          React Video to GIF Converter
        </h1>
        <h2 className=" font-bold text-3xl">Convert Videos to GIF</h2>
        <p>
          Upload, convert your vidoes to GIFs and download them for your use
        </p>
      </div>
      {!videoUploaded ? (
        <div className=" w-full flex justify-center items-center mt-4">
          <input
            type="file"
            id="file"
            className=" px-3 py-2 rounded-md text-white bg-blue-500"
            onChange={(e) => {
              // When video gets uploaded we set the state to the value of the uploaded item
              setUpload(e.target.files?.item(0));
              //setting getVideoUploaded to true will update the state videoUploaded, hides the button and renders the code in the truth block
              getVideoUploaded(true);
            }}
          />
          <label for="file">Choose Video</label>
        </div>
      ) : (
        <div className=" w-full px-3 py 4 mt-4 flex justify-center items-center flex-col">
          <div className=" bg-white shadow-xl py-4 px-3 w-max flex justify-between gap-8 border items-center">
            <div>
              <h2 className=" font-bold text-small text-zinc-800">
                <span className=" text-blue-500 font-semibold">File Name:</span>{" "}
                {isUpload ? isUpload.name : "No video Uploaded"}
              </h2>
            </div>
            <div className=" border-2 border-blue-500 rounded-md">
              <input
                type="number"
                value={getStart}
                placeholder="start time"
                className=" px-2 py-1 bg-transparent outline-none"
                onChange={(event) => {
                  if (event.target.value.length === 3)
                    return false; //limits to 2 digit entry
                  else if (event.target.value > 30) return false; //limits to 2 digit entry

                  setStart(event?.target.value); //saving input to state
                }}
              />
            </div>
            <div className=" border-2 border-blue-500 rounded-md">
              <input
                type="number"
                value={getEnd}
                placeholder="End time"
                className=" px-2 py-1 bg-transparent outline-none"
                onChange={(event) => {
                  if (event.target.value.length === 3)
                    return false; //limits to 2 digit entry
                  else if (event.target.value > 30 || event.target.value <= 0)
                    return false; //limits to 2 digit entry

                  setEnd(event?.target.value); //saving input to state
                }}
              />
            </div>
            <button
              className=" text-xl font-semibold text-blue-600"
              onClick={() => {
                convertVideoToGIFCreator();
              }}
            >
              Convert Video
            </button>
          </div>
          <div className=" mt-5 w-4/5">
            {isUpload && (
              <div className=" flex justify-between">
                <div>
                  <h2 className=" text-left font-medium mb-3">
                    Uploaded Video
                  </h2>
                  <video
                    controls
                    width="400"
                    src={URL.createObjectURL(isUpload)}
                  ></video>
                </div>
                {isVideoReady ? (
                  <div>
                    {GIF && (
                      <div>
                        <h2 className=" text-left font-medium mb-3">
                          Converted GIF
                        </h2>
                        <img src={GIF} alt="gif" className=" w-80 h-52" />
                        {/* for the button to download the GIF */}
                        <button
                          className=" px-3 py-1 mt-2 rounded-md text-white bg-blue-500"
                          onClick={(e) => {
                            e.preventDefault();
                            const link = document.createElement("a");
                            link.href = GIF;
                            link.download = isUpload.name.split(".")[0];
                            link.click();
                          }}
                        >
                          Download GIF
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <h2>Converting Video</h2>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
