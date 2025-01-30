document
  .getElementById("imageInput")
  .addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      const img = new Image();
      img.onload = function () {
        // Display the original image
        const originalImage = document.getElementById("originalImage");
        originalImage.src = e.target.result;
        originalImage.style.display = "block";

        // Analyze the image
        const { brightness, contrast } = calculateBrightnessAndContrast(img);
        const { brightnessSegment, contrastSegment } =
          segmentBrightnessAndContrast(brightness, contrast);

        const adjustedImageData = adjustImage(img, brightness, contrast);
        const adjustedImage = document.getElementById("adjustedImage");
        adjustedImage.src = adjustedImageData;
        adjustedImage.style.display = "block";

        // Display the results
        const resultElement = document.getElementById("result");
        resultElement.innerHTML = `
          <h2>Analysis Results</h2>
          <p><strong>Brightness:</strong> ${brightness.toFixed(
            2
          )} (${brightnessSegment})</p>
          <p><strong>Contrast:</strong> ${contrast.toFixed(
            2
          )} (${contrastSegment})</p>
          <p><strong>Feedback:</strong> ${getFeedback(
            brightnessSegment,
            contrastSegment
          )}</p>
        `;
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });

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

function segmentBrightnessAndContrast(brightness, contrast) {
  // Segment brightness
  let brightnessSegment;
  if (brightness < 50) brightnessSegment = "Low";
  else if (brightness < 150) brightnessSegment = "Medium";
  else brightnessSegment = "High";

  // Segment contrast
  let contrastSegment;
  if (contrast < 30) contrastSegment = "Low";
  else if (contrast < 70) contrastSegment = "Medium";
  else contrastSegment = "High";

  return { brightnessSegment, contrastSegment };
}

function adjustImage(image, brightness, contrast) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = image.width;
  canvas.height = image.height;

  // Draw the image onto the canvas
  ctx.drawImage(image, 0, 0);

  // Get the image data (RGBA format)
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Adjust brightness and contrast
  const brightnessAdjustment = 128 - brightness; // Adjust brightness to midpoint (128)
  const contrastAdjustment = 1.5; // Increase contrast by 50%

  for (let i = 0; i < data.length; i += 4) {
    // Adjust brightness
    data[i] += brightnessAdjustment; // Red
    data[i + 1] += brightnessAdjustment; // Green
    data[i + 2] += brightnessAdjustment; // Blue

    // Adjust contrast
    data[i] = (data[i] - 128) * contrastAdjustment + 128; // Red
    data[i + 1] = (data[i + 1] - 128) * contrastAdjustment + 128; // Green
    data[i + 2] = (data[i + 2] - 128) * contrastAdjustment + 128; // Blue
  }

  // Put the adjusted data back onto the canvas
  ctx.putImageData(imageData, 0, 0);

  // Return the adjusted image as a data URL
  return canvas.toDataURL();
}

function getFeedback(brightnessSegment, contrastSegment) {
  if (brightnessSegment === "Low" || contrastSegment === "Low") {
    return "The image is too dark or has low contrast. It has been adjusted for better visibility.";
  } else if (brightnessSegment === "High" || contrastSegment === "High") {
    return "The image is overexposed or has high contrast. It has been adjusted for better visibility.";
  } else {
    return "The image has good brightness and contrast.";
  }
}
