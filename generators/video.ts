import * as ffmpeg from "fluent-ffmpeg";
import { OUTPUT_VIDEO_DIR, OUTPUT_FRAMES_DIR } from "../constants/directories";

export async function generateVideo() {
  console.log("Video generation started 🏎");
  ffmpeg()
    .input(`./${OUTPUT_FRAMES_DIR}/output%01d.png`)
    .loop(5)
    .fps(5)
    .on('end', () => { console.log("Video generation finished 🏁!") })
    .save(`./${OUTPUT_VIDEO_DIR}/output.webm`);
}
