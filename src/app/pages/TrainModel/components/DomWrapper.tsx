import NodeCreator from "../components/components/NodeCreator";
import ReactDOM from "react-dom/client";
import React from "react";


export default function DomWrapperCreator(title: string, contents: unknown) {

    const rootContainer = document.getElementById("train-logger-container");
    
    if (!rootContainer) return;

    while (rootContainer?.firstChild) {
        rootContainer?.removeChild(rootContainer.firstChild);
    }

    const container = document.createElement("div");

    rootContainer.appendChild(container);
    const root = ReactDOM.createRoot(container);

    root.render(
        <React.StrictMode>
            <NodeCreator title={title} contents={contents} />
        </React.StrictMode>
    );
}
