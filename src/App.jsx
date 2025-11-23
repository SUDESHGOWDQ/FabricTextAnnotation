import React, { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import "./App.css";


const fonts = ["Roboto","Times New Roman","Arial","Georgia","Courier New"];
const sizes = [20, 32, 56, 72, 96];
const durations = ["Whole sequence", "First half", "Second half"];
const colors = ["Black", "White", "Red", "Green", "Blue", "Yellow"];

 function FabricTextAnnotationApp() {

  const canvasRef = useRef(null);
  const fabricRef = useRef(null);
  const [text, setText] = useState("StartTyping...");
  const [font, setFont] = useState(fonts[0]);
  const [size, setSize] = useState(sizes[0]);
  const [color, setColor] = useState(colors[0]);
  const [duration, setDuration] = useState(durations[0]);
  const [editing, setEditing] = useState(true);

  // Initialize Fabric.js canvas
  useEffect(() => {
	const canvas = new fabric.Canvas(canvasRef.current, {
	  width: canvasRef.current.parentElement.offsetWidth,
	  height: canvasRef.current.parentElement.offsetHeight,
	  backgroundColor: "transparent",
	  selection: false,
	});
	fabricRef.current = canvas;

	// Add initial text object with 'StartTyping...'
	const minCharsPerLine = 50;
	const avgCharWidth = 0.6 * size; // Estimate average character width in px
	const minWidth = minCharsPerLine * avgCharWidth;
	const initialText = "StartTyping...";
	
	const tempTextbox = new fabric.Textbox(initialText, {
	  fontFamily: font,
	  fontSize: size,
	});
	const contentWidth = tempTextbox.width;
	tempTextbox.dispose();
	const textObj = new fabric.Textbox(initialText, {
	  left: 50,
	  top: 50,
	  fontFamily: font,
	  fontSize: size,
	  width: contentWidth,
	  editable: true,
	  backgroundColor: "transparent",
	  borderColor: "black",
	  padding: 6,
      borderDashArray: [5, 5],
	});
	canvas.add(textObj);
	canvas.setActiveObject(textObj);

	// Dragging is handled by Fabric.js
	// Editing: double-click to edit
	textObj.on("editing:entered", () => setEditing(true));
	textObj.on("editing:exited", () => setEditing(false));

	// Sync text changes
	textObj.on("changed", () => {
	  // If the initial text is present and user types something new, remove it
		if (textObj.text !== initialText && text === initialText) {
			textObj.set({ text: textObj.text });
			setText(textObj.text);
		} else {
			setText(textObj.text);
		}

	  // Use content width for 'StartTyping...', minWidth otherwise
	  if (textObj.text === initialText) {
		const temp = new fabric.Textbox(initialText, {
		  fontFamily: font,
		  fontSize: size,
		});
		textObj.set({ width: temp.width });
		temp.dispose();
	  } else {
		textObj.set({ width: minWidth });
	  }
	  fabricRef.current.renderAll();
	});

	return () => {
	  canvas.dispose();
	};
  }, []);

  // Update text object when toolbar changes
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const textObj = canvas.getObjects("textbox")[0];
    if (!textObj) return;
    textObj.set({
      text,
      fontFamily: font,
      fontSize: size,
      fill: color,
    });
    canvas.renderAll();
  }, [text, font, size, color]);

	// Toolbar position state
	const [toolbarPos, setToolbarPos] = useState({ left: 50, top: 10 });

	// Toolbar actions
	const handleDelete = () => {
		const canvas = fabricRef.current;
		if (!canvas) return;
		const textObj = canvas.getObjects("textbox")[0];
		if (textObj) {
			textObj.set({ text: "" });
			setText("");
			textObj.set({ left: 50, top: 50 });
			canvas.setActiveObject(textObj);
			canvas.renderAll();
			setToolbarPos({ left: 50, top: 10 });
		}
	};

	// Move toolbar with text object
	useEffect(() => {
		const canvas = fabricRef.current;
		if (!canvas) return;
		const textObj = canvas.getObjects("textbox")[0];
		if (!textObj) return;
		const container = canvasRef.current.parentElement;
		function updateToolbarPosition() {
			let left = textObj.left;
			let top = textObj.top - 80; 
			left = Math.max(0, Math.min(left, container.offsetWidth - 250));
			top = Math.max(0, Math.min(top, container.offsetHeight - 50));
			setToolbarPos({ left, top });
		}
		textObj.on("moving", updateToolbarPosition);
		// Initial position
		updateToolbarPosition();
		return () => {
			textObj.off("moving", updateToolbarPosition);
		};
	}, [text, font, size, color]);

	return (
		<div className="annotation-bg">
			<div className="annotation-container" style={{ position: "relative" }}>
				<canvas ref={canvasRef} />
				<div
					className="annotation-toolbar"
					style={{
						position: "absolute",
						left: toolbarPos.left,
						top: toolbarPos.top,
						zIndex: 10,
						borderRadius: 8,
						boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
						padding: 8,
						display: "flex",
						alignItems: "center"
					}}
				>
					<span>Text</span>
					<select value={color} onChange={e => setColor(e.target.value)}>
						{colors.map(item => (
							<option key={item} value={item}>{item}</option>
						))}
					</select>
					<span className="toolbar-divider" />
					<select value={font} onChange={e => setFont(e.target.value)}>
						{fonts.map(f => <option key={f}>{f}</option>)}
					</select>
					<span className="toolbar-divider" />
					<select value={size} onChange={e => setSize(Number(e.target.value))}>
						{sizes.map(s => <option key={s} value={s}>{s} pt</option>)}
					</select>
					<span className="toolbar-divider" />
					<span>Duration:</span>
					<select value={duration} onChange={e => setDuration(e.target.value)}>
						{durations.map(d => <option key={d}>{d}</option>)}
					</select>
					<span className="toolbar-divider" />
					<button
						className="toolbar-delete"
						title="Delete annotation"
						onClick={handleDelete}
					>
						🗑️
					</button>
				</div>
			</div>
		</div>
	);
}

export default FabricTextAnnotationApp;