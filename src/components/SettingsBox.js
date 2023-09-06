import "./SettingsBox.css";

export const SettingsBox = ({ graphSettings, setGraphSettings }) => {
	let { lineWidth, lineLength, FOV, frameLength, base, numberLength, maxDigits } = graphSettings;
	let changeableSettings = { lineWidth, lineLength, FOV, frameLength, base, numberLength };
	const minMax = {
		lineWidth: [1, 20, "range", "line width (px)"],
		lineLength: [1, 400, "range", "line length (px)"],
		FOV: [1, 16, "range", "field of vision"],
		frameLength: [0, 100, "number", "animation speed (ms)"],
		base: [2, 36, "range", "base (radix)"],
		numberLength: [1, maxDigits, "number", "how many decimals"],
	};

	let settingsMenu = [];
	let entryIndex = 0;
	for (let entry in changeableSettings) {
		settingsMenu.push(
			<div key={entry}>
				<span>{minMax[entry][3]}: </span>
				{minMax[entry][2] === "number" ? null : <span>{graphSettings[entry]}</span>}
				<input
					type={minMax[entry][2]}
					min={minMax[entry][0]}
					max={minMax[entry][1]}
					defaultValue={graphSettings[entry]}
					className="settings-slider"
					onChange={(e) =>
						setGraphSettings((prev) => {
							let ret = { ...prev };
							ret[entry] = e.target.value;
							return ret;
						})
					}
				/>
			</div>
		);
		entryIndex++;
	}
	return <div className="settings-container">{settingsMenu}</div>;
};
