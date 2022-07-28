import Jimp from 'jimp';
import inquirer from 'inquirer';
import fs from 'fs';

const dirs = ['./build/watermarkGenerator/inputs', './build/watermarkGenerator/outputs'];

const initDirs = () => {
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdir(dir, { recursive: false }, (err) => {
        if (err) throw err;
      });
    }
  }
};

initDirs();

const createInputPath = (imageName: string) => `./build/watermarkGenerator/inputs/${imageName}`;

const createOutputPath = (imageName: string) => {
  const [fileName, format] = imageName.split('.');
  const pathSuffix = '(1)'
  const outputPath = `./build/watermarkGenerator/outputs/`;
  const filename = `${fileName}-with-watermark.${format}`
  if (fs.existsSync(outputPath + filename)) {
    const newFileName = `${fileName}-with-watermark${pathSuffix}.${format}`
    return outputPath + newFileName;
  }
  return outputPath + filename;
};

const watermarkError = () => {
  console.log(`Invalid image path. Reloading app...`);
  initApp();
};

const addTextWatermark = async (imagePath: string, text: string, outputPath: string) => {
  try {
    const image = await Jimp.read(imagePath);
    const font = await Jimp.loadFont(Jimp.FONT_SANS_128_BLACK);
    const textData = {
      text: text,
      alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
      alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
    };
    image.print(font, 0, 0, textData, image.getWidth(), image.getHeight());
    image.quality(100).writeAsync(outputPath);
  } catch {
    watermarkError();
  }
};

const addImageWatermark = async (
  imagePath: string,
  watermarkImagePath: string,
  outputPath: string
) => {
  try {
    const image = await Jimp.read(imagePath);
    const watermark = await Jimp.read(watermarkImagePath);
    const watermarkSettings = {
      mode: Jimp.BLEND_SOURCE_OVER,
      opacitySource: 0.5,
      opacityDest: 1,
    };
    image.composite(
      watermark,
      (image.bitmap.width - watermark.bitmap.width) / 2,
      (image.bitmap.height - watermark.bitmap.height) / 2,
      watermarkSettings
    );
    image.quality(100).writeAsync(outputPath);
  } catch {
    watermarkError();
  }
};

const prompt = inquirer.createPromptModule();

const initApp = async () => {
  const { start } = await prompt({
    name: 'start',
    message:
      'Please put your image files in the created inputs folder and confirm to proceed. Select "no" if you wish to quit.',
    type: 'confirm',
  });

  if (!start) process.exit();

  const { inputImage } = await prompt({
    name: 'inputImage',
    type: 'input',
    message:
      'Please provide a full name of an image in inputs folder that you wish to add watermark on:',
  });

  const { action } = await prompt({
    name: 'action',
    type: 'list',
    message: 'Choose type of watermark that you wish to add',
    choices: ['Text', new inquirer.Separator(), 'Image'],
  });

  if (action === 'Text') {
    const { watermarkText } = await prompt({
      name: 'watermarkText',
      type: 'input',
      message: 'Please enter watermark text:',
    });
    addTextWatermark(createInputPath(inputImage), watermarkText, createOutputPath(inputImage));
  }

  if (action === 'Image') {
    const { watermarkImage } = await prompt({
      name: 'watermarkImage',
      type: 'input',
      message:
        'Provide a full name of an image in inputs folder that you wish to be the watermark:',
    });
    addImageWatermark(
      createInputPath(inputImage),
      createInputPath(watermarkImage),
      createOutputPath(inputImage)
    );
  }
};

initApp();
