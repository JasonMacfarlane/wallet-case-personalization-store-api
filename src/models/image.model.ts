
import * as sharp from 'sharp';

const fsPromises = require('fs').promises

const printFileHeight = 2114;
const printFileWidth = 2457;

const imageHeight = 1117;
const imageWidth = 1350;

/**
 * Resizes an image.
 */
export async function resize(body: any) {
  const img = body;

  try {
    const metadata = await sharp(img).metadata();

    const height = metadata.height;
    const width = metadata.width;

    if (height > printFileHeight || width > printFileWidth) {
      try {
        const resizedImage = await sharp(img).resize({
          height: printFileHeight,
          width: printFileWidth,
          fit: 'outside',
        }).jpeg().toBuffer();

        const data = {
          format: 'jpeg',
          base64: resizedImage.toString('base64'),
        };
        
        return data;
      } catch (err) {
        throw err;
      }
    } else {
      const resizedImage = await sharp(img).jpeg().toBuffer();

      const data = {
        format: 'jpeg',
        base64: resizedImage.toString('base64'),
      };
      
      return data;
    }
  } catch (err) {
    console.error('line 58');
    console.log(err);
    throw err;
  }
}

export async function generatePreviews(body: any) {
  const imageCroppedUrl = body.imageCroppedUrl;
  const imageStyle = body.imageStyle;
  const isTextHidden = body.isTextHidden;
  const textData = body.textData;
  const textImageUrl = body.textImageUrl;

  try {
    const imagesStaticData = await Promise.all([
      fsPromises.readFile(__dirname + '/../public/img/case/open/bg.jpg'),
      fsPromises.readFile(__dirname + '/../public/img/case/closed/bg.jpg'),
      fsPromises.readFile(__dirname + '/../public/img/case/open/fg.png'),
      fsPromises.readFile(__dirname + '/../public/img/case/closed/fg.png'),
    ]);
  
    const imagesStatic = await Promise.all([
      sharp(imagesStaticData[0]).toBuffer(),
      sharp(imagesStaticData[1]).toBuffer(),
      sharp(imagesStaticData[2]).toBuffer(),
      sharp(imagesStaticData[3]).toBuffer(),
    ]);
  
    const bg = [imagesStatic[0], imagesStatic[1]];
    const fg = [imagesStatic[2], imagesStatic[3]];
  
    const imagesUser = await Promise.all([
      updateMainImage(imageCroppedUrl, imageStyle),
      updateMainText(textData, textImageUrl, isTextHidden),
    ]);
  
    const images = await mergeImagesToCase(bg, fg, imagesUser[0], imagesUser[1]);
  
    const data = {
      previewImages: images.previews,
      printFile: images.printFile,
      bgImage: images.bgImage,
    };
  
    return data;
  } catch (err) {
    console.error('line 104');
    console.log(err);
    throw err;
  }
}

async function updateMainImage(imageCroppedUrl: string, imageStyle: string): Promise<any> {
  if (imageCroppedUrl === '') {
    return false;
  }

  try {
    const image = await sharp({
      create: {
        background: { r: 0, g: 0, b: 0 },
        channels: 4,
        height: printFileHeight,
        width: printFileWidth,
      },
    }).jpeg();

    const imageCroppedBuffer = Buffer.from(imageCroppedUrl.replace(/^data:image\/[a-z]+;base64,/, ''), 'base64');
    const imgUser = await sharp(imageCroppedBuffer).jpeg().toBuffer();

    if (imageStyle === 'full') {
      image.composite([{ input: imgUser, left: 0, top: 0, }]);
    } else if (imageStyle === 'repeat') {
      image.composite([
        { input: imgUser, left: 0, top: 0 },
        { input: imgUser, left: 1229, top: 0 },
      ]);
    } else {
      const imgUserFlop = await sharp(imageCroppedBuffer).flop().jpeg().toBuffer();

      image.composite([
        { input: imgUserFlop, left: 0, top: 0 },
        { input: imgUser, left: 1229, top: 0 },
      ]);
    }

    const imageBuffer = image.jpeg().toBuffer();

    return imageBuffer;
  } catch(err) {
    console.error('line 148');
    console.log(err);
    throw err;
  }
}

async function updateMainText(textData: any, imageTextUrl: string, isTextHidden: boolean): Promise<any> {
  if (isTextHidden === true) {
    return null;
  } else if (!imageTextUrl) {
    return null;
  }

  try {
    const image = await sharp({
      create: {
        background: { r: 0, g: 0, b: 0, alpha: 0 },
        channels: 4,
        height: printFileHeight,
        width: printFileWidth,
      },
    }).png();
  
    const imgTextBuffer = Buffer.from(imageTextUrl.replace(/^data:image\/[a-z]+;base64,/, ''), 'base64');
    const imgText = await sharp(imgTextBuffer).png().toBuffer();
  
    image.composite([
      { input: imgText, left: Math.round(textData.position.x + 10), top: Math.round(textData.position.y) },
      { input: imgText, left: Math.round(textData.position.x + 1229), top: Math.round(textData.position.y) },
    ]);

    const imageBuffer = await image.toBuffer();

    return imageBuffer;
  } catch (err) {
    console.error('line 183');
    console.log(err);
    throw err;
  }
}

async function mergeImagesToCase(bg: any, fg: any, imageBackground: Buffer, imageText: Buffer): Promise<any> {
  try {
    const printFile = await sharp({
      create: {
        background: { r: 0, g: 0, b: 0 },
        channels: 4,
        height: printFileHeight,
        width: printFileWidth,
      },
    }).jpeg();
    // .toColourspace('cmyk');

    const imageFile = await sharp({
      create: {
        background: { r: 0, g: 0, b: 0 },
        channels: 4,
        height: imageHeight,
        width: imageWidth,
      },
    }).jpeg();
  
    const imgBg = await sharp(imageBackground).toBuffer();
    printFile.composite([{ input: imgBg, left: 0, top: 0 }]);
  
    if (imageText === null) {
      printFile.composite([{ input: imgBg, left: 0, top: 0 }]);
    } else {
      const imgText = await sharp(imageText).png().toBuffer();
  
      printFile.composite([
        { input: imgBg, left: 0, top: 0 },
        { input: imgText, left: 0, top: 0 },
      ]);
    }
  
    const printFileBuffer = await printFile.toBuffer();
    const printFileResized = await sharp(printFileBuffer).resize(908, 770).jpeg(70).toBuffer();
    
    const preview1 = async () => {
      try {
        const image = imageFile.clone();
  
        const imagesStaticData = await Promise.all([
          fsPromises.readFile(__dirname + '/../public/img/case/open/case.png'),
          fsPromises.readFile(__dirname + '/../public/img/case/open/case-clip.png'),
        ]);
  
        const imagesStatic = await Promise.all([
          sharp(imagesStaticData[0]).toBuffer(),
          sharp(imagesStaticData[1]).toBuffer(),
        ]);
  
        const getMaskedImage = async () => {
          return await sharp(printFileResized).composite([
            { input: imagesStatic[1], left: 30, top: 30, blend: 'dest-in' },
          ]).png().toBuffer()
        };
  
        image.composite([
          { input: bg[0], left: 0, top: 0 },
          { input: imagesStatic[0], left: 260, top: 305 },
          { input: await getMaskedImage(), left: 229, top: 275, blend: 'multiply' },
          { input: fg[0], left: 0, top: 0 },
        ]);
  
        const imageBuffer = await image.jpeg(70).toBuffer();

        return { format: 'jpeg', base64: imageBuffer.toString('base64') };
      } catch (err) {
        console.error('line 255');
        console.log(err);
        throw err;
      }
    };
    
    const preview2 = async () => {
      try {
        const image = imageFile.clone();
  
        const imagesStaticData = await Promise.all([
          fsPromises.readFile(__dirname + '/../public/img/case/closed/case.png'),
          fsPromises.readFile(__dirname + '/../public/img/case/closed/case-clip.png'),
        ]);
  
        const imagesStatic = await Promise.all([
          sharp(imagesStaticData[0]).toBuffer(),
          sharp(imagesStaticData[1]).toBuffer(),
        ]);
  
        const getMaskedImage = async () => {
          return await sharp(printFileResized).composite([
            { input: imagesStatic[1], left: 474, top: 28, blend: 'dest-in' },
          ]).png().toBuffer()
        };
  
        image.composite([
          { input: bg[1], left: 0, top: 0 },
          { input: imagesStatic[0], left: 486, top: 298 },
          { input: await getMaskedImage(), left: 12, top: 270, blend: 'multiply' },
          { input: fg[1], left: 0, top: 0 },
        ]);
  
        const imageBuffer = await image.jpeg(70).toBuffer();

        return { format: 'jpeg', base64: imageBuffer.toString('base64') };
      } catch (err) {
        console.error('line 299');
        console.log(err);
        throw err;
      }
    };
  
    const previews = await Promise.all([
      preview1(),
      preview2(),
    ]);
  
    const result = {
      previews: previews,
      printFile: { format: 'jpeg', base64: printFileBuffer.toString('base64') },
      bgImage: { format: 'jpeg', base64: imgBg.toString('base64') },
    };
  
    return result;
  } catch (err) {
    console.error('line 318');
    console.log(err);
    throw err;
  }
}
