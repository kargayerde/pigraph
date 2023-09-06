/* global BigInt */
import { useRef, useEffect, useState } from "react";
import { SettingsBox } from "./components/SettingsBox";
import pie from "./pi.json";
import "./App.css";

function App() {
	const TAU = Math.PI * 2;
	const tauDecimal = String(TAU).split(".")[1];
	const maxDigits = pie.length;

	const [viewportWidth, viewportHeight] = [window.innerWidth, window.innerHeight];

	const [graphSettings, setGraphSettings] = useState({
		canvasWidth: viewportWidth,
		canvasHeight: viewportHeight,
		lineWidth: 6,
		lineLength: 150,
		FOV: 2,
		frameLength: 0,
		base: 6,
		numberLength: Math.min(100000, maxDigits),
		scrollAmount: 300,
		maxDigits,
	});
	const [graphInfo, setGraphInfo] = useState({ currentDigit: "", scrollX: 0, scrollY: 0 });
	const canvasRef = useRef();
	let { canvasWidth, canvasHeight, lineWidth, lineLength, FOV, frameLength, base, numberLength } =
		graphSettings;
	const midPoint = [(canvasWidth * FOV) / 2, (canvasHeight * FOV) / 2];

	const canvasStyle = { width: canvasWidth, height: canvasHeight };

	// const calcPi = () => {
	// 	let len = 10200n;
	// 	let i = 1n;
	// 	let x = 3n * 10n ** len;
	// 	let pi = x;
	// 	while (x > 0) {
	// 		x = (x * i) / ((i + 1n) * 4n);
	// 		pi += x / (i + 2n);
	// 		i += 2n;
	// 	}
	// 	let result = pi / 10n ** 20n;
	// 	let bbase = 10;
	// 	result = BigInt(result.toString(10).split("").slice(1).join("")).toString(6);
	// 	console.log(
	// 		`%c${result}`,
	// 		`color: rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`
	// 	);
	// 	return result;
	// };

	const drawLine = ({
		context,
		angle,
		startPosition,
		length = lineLength,
		suppressScroll = false,
	}) => {
		const [x1, y1] = startPosition;
		const [x2, y2] = [x1 + length * Math.cos(angle), y1 + length * Math.sin(angle)];

		if (!suppressScroll) {
			if (y2 < 0 - graphInfo.scrollY) {
				panGraph("up");
			}
			if (y2 > canvasHeight * graphSettings.FOV - graphInfo.scrollY) {
				panGraph("down");
			}
			if (x2 > canvasWidth * graphSettings.FOV - graphInfo.scrollX) {
				panGraph("right");
			}
			if (x2 < 0 - graphInfo.scrollX) {
				panGraph("left");
			}
		}
		// context.translate(graphInfo.scrollX * -1, graphInfo.scrollY * -1);
		// context.setTransform(1, 0, 0, 1, 0, 0);
		context.beginPath();
		// context.strokeStyle = `hsla(${(angle / TAU) * 360}, 80%, 50%, 0.5)`;
		context.strokeStyle = `hsla(${(angle / TAU) * 360}, 80%, 40%, 0.3)`;
		context.moveTo(x1 + graphInfo.scrollX, y1 + graphInfo.scrollY);
		context.lineTo(x2 + graphInfo.scrollX, y2 + graphInfo.scrollY);
		context.stroke();
		// context.translate(graphInfo.scrollX, graphInfo.scrollY);
		// console.log(graphInfo.scrollX, graphInfo.scrollY);

		return [x2, y2];
	};

	const drawGraph = ({ context, numbers, base, startPosition, continueFrom = 0 }) => {
		let [index, end] = [continueFrom, numbers.length - 1];

		if (continueFrom > 0) {
			for (let i = 0; i < index; i++) {
				let rotation = (TAU * parseInt(numbers[i], base)) / base;
				startPosition = drawLine({
					context,
					angle: rotation,
					startPosition,
					suppressScroll: true,
				});
			}
		}

		intervalRef.current = setInterval(() => {
			if (index > end) clearInterval(intervalRef.current);
			else {
				setGraphInfo((prev) => {
					return { ...prev, currentDigit: index };
				});
				let rotation = (TAU * parseInt(numbers[index++], base)) / base;
				startPosition = drawLine({ context, angle: rotation, startPosition });
			}
		}, frameLength);
	};

	const panGraph = (direction) => {
		const context = canvasRef.current.getContext("2d");

		switch (direction) {
			case "up":
				setGraphInfo((prev) => {
					return { ...prev, scrollY: prev.scrollY + graphSettings.scrollAmount };
				});
				context.translate(0, graphSettings.scrollAmount);
				break;
			case "down":
				setGraphInfo((prev) => {
					return { ...prev, scrollY: prev.scrollY - graphSettings.scrollAmount };
				});
				context.translate(0, -graphSettings.scrollAmount);
				break;
			case "right":
				setGraphInfo((prev) => {
					return { ...prev, scrollX: prev.scrollX - graphSettings.scrollAmount };
				});
				context.translate(-graphSettings.scrollAmount, 0);
				break;
			case "left":
				setGraphInfo((prev) => {
					return { ...prev, scrollX: prev.scrollX + graphSettings.scrollAmount };
				});
				context.translate(graphSettings.scrollAmount, 0);
				break;
		}
	};

	const handleKeys = (e) => {
		switch (e.code) {
			case "ArrowUp":
				panGraph("up");
				break;
			case "ArrowDown":
				panGraph("down");
				break;
			case "ArrowRight":
				panGraph("right");
				break;
			case "ArrowLeft":
				panGraph("left");
				break;
		}
	};

	const intervalRef = useRef();
	const theNumber = BigInt(pie.slice(0, numberLength)).toString(graphSettings.base);
	// console.log(theNumber, typeof theNumber);

	useEffect(() => {
		// calcPi();
		const context = canvasRef.current.getContext("2d");
		canvasRef.current.width = canvasWidth * FOV;
		canvasRef.current.height = canvasHeight * FOV;
		context.lineWidth = lineWidth;
		context.clearRect(0, 0, canvasWidth, canvasHeight);
		drawGraph({ context, numbers: theNumber, base, startPosition: midPoint });
	}, []);
	useEffect(() => {
		clearInterval(intervalRef.current);
		const context = canvasRef.current.getContext("2d");
		canvasRef.current.width = canvasWidth * FOV;
		canvasRef.current.height = canvasHeight * FOV;
		context.lineWidth = lineWidth;
		context.clearRect(0, 0, canvasWidth, canvasHeight);
		drawGraph({
			context,
			numbers: theNumber,
			base,
			startPosition: midPoint,
			continueFrom: graphInfo.currentDigit,
		});
	}, [graphInfo.scrollX, graphInfo.scrollY, graphSettings]);

	return (
		<div className="App" onKeyDown={(e) => handleKeys(e)} tabIndex={-1}>
			<div className="info-box">
				<div>Current Digit: {pie[graphInfo.currentDigit]}</div>
				<div>Drawing {graphInfo.currentDigit + 1}th digit</div>
				<div>Max Possible Decimals: {maxDigits}</div>
				<SettingsBox graphSettings={graphSettings} setGraphSettings={setGraphSettings} />
			</div>
			<canvas className="animation-frame" ref={canvasRef} style={canvasStyle} />
		</div>
	);
}

export default App;
