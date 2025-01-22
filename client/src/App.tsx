import React, { useRef, useState } from "react";
import { ReactSketchCanvas, ReactSketchCanvasRef } from "react-sketch-canvas";

type PredictionResponse = {
  prediction: number;
  confidence: number;
};

const App: React.FC = () => {
  const canvasRef = useRef<ReactSketchCanvasRef | null>(null);
  const [strokeColor, setStrokeColor] = useState<string>("#FFFFFF");
  const [canvasColor, setCanvasColor] = useState<string>("#000000");
  const [loading, setLoading] = useState<boolean>(false);
  const [predictedNumber, setPredictedNumber] = useState<string>("?");
  const [aiConfidence, setAiConfidence] = useState<number>(75);
  const [strokeWidth, setStrokeWidth] = useState<number>(10);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [drawnImage, setDrawnImage] = useState<string | null>(null);

  const predictNumber = async (image?: string): Promise<void> => {
    setLoading(true);
    setPredictedNumber("?");
    try {
      let imgData = image || null;

      if (!imgData && canvasRef.current) {
        imgData = await canvasRef.current.exportImage("png");
        setDrawnImage(imgData);
      }

      if (imgData) {
        const response = await fetch("http://127.0.0.1:5000/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: imgData }),
        });

        if (response.ok) {
          const data: PredictionResponse = await response.json();
          setPredictedNumber(data.prediction.toString());
          setAiConfidence(Math.round(data.confidence * 100));
        } else {
          console.error("Prediction request failed:", response.statusText);
          setPredictedNumber("Error");
        }
      }
    } catch (error) {
      console.error("Error during prediction:", error);
      setPredictedNumber("Error");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64Image = reader.result as string;
        setUploadedImage(base64Image);
        predictNumber(base64Image);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div
      className="w-full max-w-[900px] min-h-[700px] bg-white shadow rounded-lg p-6 mx-auto flex flex-col items-center gap-10"
    >
      <h1 className="font-title text-3xl text-neutral-950 text-center">
        Magic Canvas - MNIST Edition
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
        <div
          className="relative w-full max-w-[350px] h-[350px] mx-auto border-2 border-neutral-300 overflow-hidden rounded-md"
          style={{ backgroundColor: canvasColor }}
        >
          <ReactSketchCanvas
            ref={canvasRef}
            style={{ height: "350px", width: "350px" }}
            strokeColor={strokeColor}
            canvasColor={canvasColor}
            width="28px"
            height="28px"
            strokeWidth={strokeWidth}
          />
        </div>
        <div className="flex flex-col gap-6 justify-center items-center">
          <div className="flex gap-3 flex-wrap justify-center">
            <div className="flex items-center">
              <label
                htmlFor="stroke-color"
                className="text-neutral-950 mr-2 text-sm sm:text-base"
              >
                Stroke Color
              </label>
              <input
                id="stroke-color"
                type="color"
                value={strokeColor}
                onChange={(e) => setStrokeColor(e.target.value)}
                className="w-[40px] h-[40px] rounded-md border border-neutral-300"
              />
            </div>
            <div className="flex items-center">
              <label
                htmlFor="canvas-color"
                className="text-neutral-950 mr-2 text-sm sm:text-base"
              >
                Canvas Color
              </label>
              <input
                id="canvas-color"
                type="color"
                value={canvasColor}
                onChange={(e) => setCanvasColor(e.target.value)}
                className="w-[40px] h-[40px] rounded-md border border-neutral-300"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label
              htmlFor="stroke-width"
              className="text-neutral-950 text-sm sm:text-base"
            >
              Stroke Width
            </label>
            <input
              id="stroke-width"
              type="range"
              min="1"
              max="10"
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(Number(e.target.value))}
              className="w-[150px]"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                canvasRef.current?.clearCanvas();
                setDrawnImage(null);
              }}
              className="bg-red-500 text-white rounded-md py-2 px-4 text-sm sm:text-base"
            >
              Clear
            </button>
            <button
              onClick={() => canvasRef.current?.undo()}
              className="bg-gray-500 text-white rounded-md py-2 px-4 text-sm sm:text-base"
            >
              Undo
            </button>
            <button
              onClick={() => canvasRef.current?.redo()}
              className="bg-blue-500 text-white rounded-md py-2 px-4 text-sm sm:text-base"
            >
              Redo
            </button>
            <button
              onClick={() => {
                predictNumber();
              }}
              className="bg-indigo-950 text-white rounded-md py-2 px-4 text-sm sm:text-base"
            >
              Predict
            </button>
          </div>
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="block text-sm text-neutral-950 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-500 file:text-white hover:file:bg-primary-600"
            />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full">
        <div className="flex flex-col items-center bg-neutral-100 rounded-md p-4 w-full max-w-[260px]">
          <h2 className="text-neutral-950 text-lg mb-2 text-center">
            Predicted Number:
          </h2>
          {loading ? (
            <span className="text-neutral-950 text-lg">Loading...</span>
          ) : (
            <span className="text-neutral-950 text-2xl">{predictedNumber}</span>
          )}
        </div>
        <div className="flex flex-col items-center bg-neutral-100 rounded-md p-4 w-full max-w-[260px]">
          <h2 className="text-neutral-950 text-lg mb-2 text-center">
            AI Confidence:
          </h2>
          <div className="relative w-full bg-neutral-300 h-[20px] rounded-full overflow-hidden">
            <div
              className="absolute bg-neutral-950 h-full"
              style={{ width: `${aiConfidence}%` }}
            ></div>
          </div>
          <span className="text-neutral-950 mt-2">{aiConfidence}%</span>
        </div>
        <div className="flex flex-col items-center bg-neutral-100 rounded-md p-4 w-full max-w-[260px]">
          <h2 className="text-neutral-950 text-lg mb-2 text-center">Drawn Image:</h2>
          {drawnImage ? (
            <img
              src={drawnImage}
              alt="Drawn Digit"
              className="w-[100px] h-[100px] object-contain border border-neutral-300 rounded-md"
            />
          ) : (
            <span className="text-neutral-950 text-sm">No image available</span>
          )}
        </div>
      </div>
      {uploadedImage && (
        <div className="flex flex-col items-center bg-neutral-100 rounded-md p-4 w-full max-w-[260px]">
          <h2 className="text-neutral-950 text-lg mb-2 text-center">Uploaded Image:</h2>
          <img
            src={uploadedImage}
            alt="Uploaded Test"
            className="w-[100px] h-[100px] object-contain border border-neutral-300 rounded-md"
          />
        </div>
      )}
    </div>
  );
};

export default App;
