import NodeCreator from "../components/components/NodeCreator";
import ReactDOM from "react-dom/client";
import React from "react";

export default function DomWrapperCreator(title, contents) {

    const rootContainer = document.getElementById("train-logger-container");
    while (rootContainer?.firstChild) {
        rootContainer?.removeChild(rootContainer.firstChild);
    }
    if (!rootContainer) return;

    const container = document.createElement("div");

    rootContainer.appendChild(container);
    const root = ReactDOM.createRoot(container);


    // root.render(<NodeCreator title={"Unique labels"} contents={uniqueLabels} />);
    root.render(
        <React.StrictMode>
            <NodeCreator title={title} contents={contents} />
        </React.StrictMode>
    );
}
