import React, { useRef, useState } from "react";
import { ReactSketchCanvas, type ReactSketchCanvasRef } from "react-sketch-canvas";
import { debounce } from "lodash";
import './App.css'


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
      <div id="webcrumbs">
        <div
            className="bg-neutral-50 rounded-lg shadow-lg flex flex-col items-center p-6 md:p-8 w-full max-w-5xl mx-auto">
          <h1 className="font-title text-2xl md:text-3xl text-neutral-900 mb-4 md:mb-6 text-center">
            Magic Canvas - MNIST Edition
          </h1>

          <div
              className="relative w-full h-[300px] md:h-[400px] bg-neutral-100 rounded-lg border border-neutral-300 shadow-md transition-transform duration-300 ease-in-out transform hover:scale-105">
            <ReactSketchCanvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full"
                strokeWidth={10}
                strokeColor="black"
                onChange={handleSketchChange}
            />
          </div>

          <div className="mt-4 flex flex-col sm:flex-row gap-4 w-full justify-center">
            <button
                type="button"
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 active:scale-95 transition duration-300"
                onClick={handleClearClick}
            >
              Clear
            </button>
            <button
                onClick={handlePrediction}
                className={`px-4 py-2 rounded-md ${
                    isPredicting
                        ? "bg-gray-500 text-neutral-400 cursor-not-allowed"
                        : "bg-green-500 text-white hover:bg-green-600 active:scale-95"
                } transition-all duration-300`}
                disabled={isPredicting || drawnDigit === "?"}
            >
              {isPredicting ? (
                  <span className="flex items-center gap-2">
	          <svg
                  className="animate-spin h-[20px] w-[20px] text-white"
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

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full">
            <div
                className="bg-neutral-50 rounded-md flex flex-col items-center justify-center border border-neutral-300 shadow-sm p-4 transition-transform duration-300 ease-in-out transform hover:scale-105">
              <p className="text-neutral-600 font-medium">Drawn Digit:</p>
              {drawnDigit !== "?" ? (
                  <img
                      src={drawnDigit}
                      alt="Drawn Digit"
                      className="w-[96px] h-[96px] object-cover"
                  />
              ) : (
                  <p className="text-4xl md:text-5xl font-semibold text-neutral-800">
                    {drawnDigit}
                  </p>
              )}
            </div>

            <div
                className="bg-neutral-50 rounded-md flex flex-col items-center justify-center border border-neutral-300 shadow-sm p-4 transition-transform duration-300 ease-in-out transform hover:scale-105">
              <p className="text-neutral-600 font-medium">Predicted Number:</p>
              <p className="text-4xl md:text-5xl font-semibold text-neutral-800">
                {predictedNumber}
              </p>
            </div>

            <div
                className="flex flex-col items-center gap-3 p-4 bg-neutral-50 rounded-md border border-neutral-300 shadow-sm transition-transform duration-300 ease-in-out transform hover:scale-105">
              <span className="font-semibold text-neutral-800">AI Confidence</span>
              <div className="w-full max-w-[250px] h-[20px] bg-neutral-200 rounded-full overflow-hidden shadow-sm">
                <div
                    className="bg-neutral-800 h-full rounded-full transition-all duration-500 ease-in-out"
                    style={{width: `${aiConfidence}%`}}
                />
              </div>
              <span className="text-sm text-neutral-600">{aiConfidence}%</span>
            </div>
          </div>
        </div>
      </div>
  );
};

export default App;
