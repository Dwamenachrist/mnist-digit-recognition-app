import React, { useRef, useState } from "react";
import { ReactSketchCanvas, type ReactSketchCanvasRef } from "react-sketch-canvas";
import { debounce } from "lodash";

interface AppProps {}

const App: React.FC<AppProps> = () => {
  const canvasRef = useRef<ReactSketchCanvasRef>(null);
  const [drawnDigit, setDrawnDigit] = useState<string>("?");
  const [predictedNumber, setPredictedNumber] = useState<string>("?");
  const [aiConfidence, setAiConfidence] = useState<number>(75);
  const [isPredicting, setIsPredicting] = useState(false);

  const handleSketchChange = debounce(async () => {
    if (canvasRef.current) {
      try {
        const imgData = await canvasRef.current.exportImage("png");
        setDrawnDigit(imgData);
      } catch (error) {
        console.error("Error exporting image:", error);
      }
    }
  }, 300);

  const handleClearClick = () => {
    canvasRef.current?.resetCanvas();
    setDrawnDigit("?");
    setPredictedNumber("?");
    setAiConfidence(75);
  };

  const handlePrediction = async () => {
    if (canvasRef.current) {
      try {
        setIsPredicting(true);
        const imgData = await canvasRef.current.exportImage("png");
        setDrawnDigit(imgData);

        const response = await fetch("https://d0ee-154-161-2-46.ngrok-free.app/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: imgData }),
        });

        if (response.ok) {
          const data = await response.json();
          setPredictedNumber(data.prediction.toString());
          setAiConfidence(data.confidence * 100);
        } else {
          console.error("Prediction request failed:", response.statusText);
        }
      } catch (error) {
        console.error("Error during prediction:", error);
      } finally {
        setIsPredicting(false);
      }
    }
  };

  return (
      <div className="bg-neutral-50 rounded-lg shadow-lg flex flex-col items-center p-8 w-full max-w-5xl mx-auto">
        <h1 className="font-title text-3xl text-neutral-900 mb-6">
          Magic Canvas - MNIST Edition
        </h1>

        {/* Canvas Container */}
        <div className="relative w-full max-w-4xl aspect-w-2 aspect-h-1 bg-neutral-100 rounded-lg border border-neutral-300 shadow-sm transition-transform duration-300 ease-in-out transform hover:scale-105">
          <ReactSketchCanvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full"
              strokeWidth={10}
              strokeColor="black"
              onChange={handleSketchChange}
          />
        </div>

        {/* Buttons */}
        <div className="mt-4 flex gap-4">
          <button
              type="button"
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700 transition-colors duration-300 ease-in-out"
              onClick={handleClearClick}
          >
            Clear
          </button>
          <button
              onClick={handlePrediction}
              className={`px-4 py-2 rounded ${
                  isPredicting
                      ? "bg-gray-500 text-neutral-400"
                      : "bg-green-500 text-white hover:bg-green-700"
              } transition-colors duration-300 ease-in-out`}
              disabled={isPredicting || drawnDigit === "?"}
          >
            {isPredicting ? (
                <span className="flex items-center gap-2">
              <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
              >
                <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                ></circle>
                <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4l4-4-4-4v4a8 8 0 00-8 8z"
                ></path>
              </svg>
              Predicting...
            </span>
            ) : (
                "Predict"
            )}
          </button>
        </div>

        {/* Results */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {/* Drawn Digit */}
          <div className="bg-neutral-50 rounded-md flex flex-col items-center justify-center border border-neutral-300 shadow-sm p-4 transition-transform duration-300 ease-in-out transform hover:scale-105">
            <p className="text-neutral-600">Drawn Digit:</p>
            {drawnDigit !== "?" ? (
                <img src={drawnDigit} alt="Drawn Digit" className="w-24 h-24" />
            ) : (
                <p className="text-5xl font-semibold text-neutral-800">{drawnDigit}</p>
            )}
          </div>

          {/* Predicted Number */}
          <div className="bg-neutral-50 rounded-md flex flex-col items-center justify-center border border-neutral-300 shadow-sm p-4 transition-transform duration-300 ease-in-out transform hover:scale-105">
            <p className="text-neutral-600">Predicted Number:</p>
            <p className="text-5xl font-semibold text-neutral-800">{predictedNumber}</p>
          </div>

          {/* AI Confidence */}
          <div className="flex flex-col items-center gap-3 transition-transform duration-300 ease-in-out transform hover:scale-110">
            <span className="font-semibold text-neutral-800">AI Confidence</span>
            <div className="w-[250px] h-[20px] bg-neutral-200 rounded-full overflow-hidden shadow-sm">
              <div
                  className="bg-neutral-800 h-full rounded-full transition-all duration-500 ease-in-out"
                  style={{ width: `${aiConfidence}%` }}
              />
            </div>
            <span className="text-sm text-neutral-600">{aiConfidence}%</span>
          </div>
        </div>
      </div>
  );
};

export default App;
