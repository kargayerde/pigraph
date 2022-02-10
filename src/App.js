import { useRef, useEffect, useState } from "react";
import pie from "./pi.json";
import "./App.css";

function App() {
	const TAU = Math.PI * 2;
	const tauDecimal = String(TAU).split(".")[1];
	const maxDigits = pie.length;

	const [graphSettings, setGraphSettings] = useState({
		canvasWidth: 1800,
		canvasHeight: 850,
		lineWidth: 4,
		lineLength: 20,
		FOV: 1,
		frameLength: 100,
		base: 10,
		numberLength: Math.min(100000, maxDigits),
	});
	const [graphInfo, setGraphInfo] = useState({ currentDigit: "" });
	const canvasRef = useRef();
	let { canvasWidth, canvasHeight, lineWidth, lineLength, FOV, frameLength, base, numberLength } =
		graphSettings;
	const midPoint = [(canvasWidth * FOV) / 2, (canvasHeight * FOV) / 2];

	const canvasStyle = { width: canvasWidth, height: canvasHeight };

	const drawLine = (context, angle, startPosition, length = lineLength) => {
		const [x1, y1] = startPosition;
		const [x2, y2] = [x1 + length * Math.cos(angle), y1 + length * Math.sin(angle)];
		context.beginPath();
		context.strokeStyle = `hsla(${(angle / TAU) * 360}, 80%, 50%, 0.5)`;
		context.moveTo(x1, y1);
		context.lineTo(x2, y2);
		context.stroke();
		return [x2, y2];
	};

	const drawGraph = (context, numbers, base, startPosition) => {
		let [index, end] = [0, numbers.length - 1];

		let interval = setInterval(() => {
			if (index > end) clearInterval(interval);
			else {
				setGraphInfo((prev) => {
					return { ...prev, currentDigit: index };
				});
				let rotation = (TAU * numbers[index++]) / base;
				startPosition = drawLine(context, rotation, startPosition);
			}
		}, frameLength);
	};

	useEffect(() => {
		const context = canvasRef.current.getContext("2d");
		canvasRef.current.width = canvasWidth * FOV;
		canvasRef.current.height = canvasHeight * FOV;
		context.clearRect(0, 0, canvasWidth, canvasHeight);
		context.lineWidth = lineWidth;
		drawGraph(context, pie.slice(0, numberLength), base, midPoint);
	}, []);

	return (
		<div className="App">
			<div className="info-box">
				<div>{pie[graphInfo.currentDigit]}</div>
				<div>Drawing {graphInfo.currentDigit + 1}th digit</div>
				<div>Selected Digit Count: {numberLength}</div>
				<div>Max Digit Count: {maxDigits}</div>
			</div>
			<canvas className="animation-frame" ref={canvasRef} style={canvasStyle} />
		</div>
	);
}

export default App;
