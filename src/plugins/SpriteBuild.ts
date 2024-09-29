import fs from "fs";
import Spritesmith from "spritesmith";

const writeJson = (versionFile: number | fs.PathLike, content: string | NodeJS.ArrayBufferView) => {
  // 写入文件
  fs.writeFile(versionFile, content, (err) => {
    if (err) throw err;
  });
};

const createSpriteFile = async (dir: string) => {
  const readDir = await fs.readdirSync(dir);
  const sprites = readDir.map((value) => `${dir}/${value}`);
  Spritesmith.run({ src: sprites }, (_err: any, result: any) => {
    function getFileNameWithoutExtension(filePath: string) {
      return filePath?.match(/\/([^/.]+)\.\w+$/)?.[1] || "error";
    }
    const json: any = {};
    Object.keys(result.coordinates).forEach((key) => {
      const item = result.coordinates[key];
      const name = getFileNameWithoutExtension(key);
      json[name] = {
        "sdf": false,
        "pixelRatio": 1,
        "x": item.x,
        "y": item.y,
        "width": item.width,
        "height": item.height,
      };
    });
    writeJson("./public/images/sprite/sprite.png", result.image);
    writeJson("./public/images/sprite/sprite.json", JSON.stringify(json));
  });
};

export const SpriteBuild = () => {
  return {
    name: "sprite-build",

    buildStart() {
      const dir = "./src/assets/images/layerIcon";
      fs.watch(dir, () => {
        createSpriteFile(dir);
      });
    },
  };
};
