import { writeFileSync } from "node:fs";
export default async ({ project }) => {
  const p = await project({dir: "edit-project", size: "1280x720", fps: 24, background: "#000000"});
  const video = await p.add("/home/user/warintro_w02_20260909/source.mp4");
  const voice = await p.add("/home/user/warintro_w02_20260909/voice.mp3");
  p.cut(video, {from: 0, dur: 5, at: 0, fit: "cover"});
  writeFileSync("/home/user/warintro_w02_20260909/voice_asset_id.txt", voice.id);
};
