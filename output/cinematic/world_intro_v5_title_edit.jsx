import path from "node:path";
export default async ({ project }) => {
  const root = process.cwd();
  const p = await project({ dir: root, size: "1280x720", fps: 24, background: "#000000" });
  const source = await p.add(path.join(root, "input/intro_v4.mp4"));
  const title = await p.add(path.join(root, "input/title.png"));
  const titleAt = 2623 / 24, titleDuration = 4;
  p.cut(source, { at: 0, from: 0, dur: titleAt, fit: "contain" });
  p.compose(
    <media file={title} x={0} y={0} width={1280} height={720} fit="contain"
      animate={[{property:"opacity", keyframes:[
        {at:0,value:0}, {at:0.75,value:1,easing:"linear"},
        {at:3.6,value:1}, {at:4,value:0,easing:"linear"}
      ]}]} />,
    { at: titleAt, dur: titleDuration, name: "approved-metal-title" }
  );
  await p.frame(titleAt + 2, "renders/title-proof.png");
};
