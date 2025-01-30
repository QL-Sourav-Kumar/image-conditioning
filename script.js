function calculateBrightnessAndContrast(image) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = image.width;
  canvas.height = image.height;

  // Draw the image onto the canvas
  ctx.drawImage(image, 0, 0);

  // Get the image data (RGBA format)
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  let sum = 0;
  let sumSquared = 0;
  let pixelCount = 0;

  // Loop through the pixel data (4 values per pixel: R, G, B, A)
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Calculate pixel intensity (average of R, G, B)
    const intensity = (r + g + b) / 3;

    sum += intensity;
    sumSquared += intensity * intensity;
    pixelCount++;
  }

  // Calculate brightness (average intensity)
  const brightness = sum / pixelCount;

  // Calculate contrast (standard deviation of intensity)
  const variance = sumSquared / pixelCount - (sum / pixelCount) ** 2;
  const contrast = Math.sqrt(variance);

  return { brightness, contrast };
}

function computeLightingScore(brightness, contrast) {
  // Ideal ranges
  const minBrightness = 100;
  const maxBrightness = 150;
  const minContrast = 50;
  const maxContrast = 100;

  // Brightness score (0–100%)
  let brightnessScore;
  if (brightness < minBrightness) {
    brightnessScore = (brightness / minBrightness) * 50; // Below ideal range
  } else if (brightness > maxBrightness) {
    brightnessScore =
      100 - ((brightness - maxBrightness) / (255 - maxBrightness)) * 50; // Above ideal range
  } else {
    brightnessScore = 100; // Within ideal range
  }

  // Contrast score (0–100%)
  let contrastScore;
  if (contrast < minContrast) {
    contrastScore = (contrast / minContrast) * 50; // Below ideal range
  } else if (contrast > maxContrast) {
    contrastScore = 100 - ((contrast - maxContrast) / (255 - maxContrast)) * 50; // Above ideal range
  } else {
    contrastScore = 100; // Within ideal range
  }

  // Overall lighting score (average of brightness and contrast scores)
  const overallScore = (brightnessScore + contrastScore) / 2;

  return { brightnessScore, contrastScore, overallScore };
}

function evaluateImage(image) {
  const resultElement = document.getElementById("result");
  const viewElement = document.getElementById("view");

  const { brightness, contrast } = calculateBrightnessAndContrast(image);
  const { brightnessScore, contrastScore, overallScore } = computeLightingScore(
    brightness,
    contrast
  );

  console.log(
    `Brightness: ${brightness.toFixed(2)} (Score: ${brightnessScore.toFixed(
      2
    )}%)`
  );
  console.log(
    `Contrast: ${contrast.toFixed(2)} (Score: ${contrastScore.toFixed(2)}%)`
  );
  console.log(`Overall Lighting Score: ${overallScore.toFixed(2)}%`);

  result.innerHTML =
    `Brightness: ${brightness.toFixed(2)} (Score: ${brightnessScore.toFixed(
      2
    )}%) <br />` +
    `Contrast: ${contrast.toFixed(2)} (Score: ${contrastScore.toFixed(
      2
    )}%) <br />` +
    `Overall Lighting Score: ${overallScore.toFixed(2)}% <br />`;

  if (overallScore >= 90) {
    viewElement.innerHTML = "The image has excellent lighting conditions.";
  } else if (overallScore >= 70) {
    viewElement.innerHTML =
      "The image has good lighting conditions but could be improved.";
  } else {
    viewElement.innerHTML =
      "The image has poor lighting conditions. Please retake it.";
  }
}

document
  .getElementById("imageInput")
  .addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      const img = new Image();
      img.src = e.target.result;
      img.onload = function () {
        evaluateImage(img);
      };
    };
    reader.readAsDataURL(file);
  });

// function checkTranslucency(image) {
//   const canvas = document.createElement("canvas");
//   const ctx = canvas.getContext("2d");

//   canvas.width = image.width;
//   canvas.height = image.height;

//   // Draw the image onto the canvas
//   ctx.drawImage(image, 0, 0);

//   // Get the image data (RGBA format)
//   const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
//   const data = imageData.data;

//   let isTranslucent = false;

//   // Loop through the pixel data (4 values per pixel: R, G, B, A)
//   for (let i = 3; i < data.length; i += 4) {
//     const alpha = data[i]; // Alpha value of the pixel
//     if (alpha > 0 && alpha < 255) {
//       isTranslucent = true;
//       break;
//     }
//   }

//   return isTranslucent;
// }

// function analyzeLighting(image) {
//   const canvas = document.createElement("canvas");
//   const ctx = canvas.getContext("2d");

//   canvas.width = image.width;
//   canvas.height = image.height;

//   // Draw the image onto the canvas
//   ctx.drawImage(image, 0, 0);

//   // Get the image data (RGBA format)
//   const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
//   const data = imageData.data;

//   let sum = 0;
//   let sumSquared = 0;
//   let pixelCount = 0;

//   // Loop through the pixel data (4 values per pixel: R, G, B, A)
//   for (let i = 0; i < data.length; i += 4) {
//     const r = data[i];
//     const g = data[i + 1];
//     const b = data[i + 2];

//     // Calculate pixel intensity (average of R, G, B)
//     const intensity = (r + g + b) / 3;

//     sum += intensity;
//     sumSquared += intensity * intensity;
//     pixelCount++;
//   }

//   // Calculate brightness (average intensity)
//   const brightness = sum / pixelCount;

//   // Calculate contrast (standard deviation of intensity)
//   const variance = sumSquared / pixelCount - (sum / pixelCount) ** 2;
//   const contrast = Math.sqrt(variance);

//   // Determine lighting conditions
//   if (brightness < 50) {
//     return "The image is too dark. Please retake it in better lighting.";
//   } else if (brightness > 200) {
//     return "The image is overexposed. Please avoid strong light.";
//   } else if (contrast < 30) {
//     return "The image has low contrast. Please ensure proper lighting.";
//   } else {
//     return "The image is suitable for replication.";
//   }
// }

// function evaluateImage(image) {
//   const resultElement = document.getElementById("result");

//   console.log(resultElement)

//   // Check translucency
//   const isTranslucent = checkTranslucency(image);
//   resultElement.innerHTML = isTranslucent
//     ? "The image contains translucent pixels.<br>"
//     : "The image does not contain translucent pixels.<br>";

//   // Analyze lighting
//   const lightingFeedback = analyzeLighting(image);
//   resultElement.innerHTML += lightingFeedback;
// }
