# ModelCube

A desktop application built with Electron, React, and TypeScript for working with AI models.

## Features

*   **Local LLM Chat:** Interact with local language models.
*   **Model Training:** Train your own models.
*   **Download Models:** Download and manage AI models.
*   **Tune Model Configurations:** Optimize AI model settings for efficient performance and resource utilization.

## Tech Stack

*   **Electron + Vite:** For building the desktop application.
*   **React:** For the user interface
*   **TypeScript:** For static typing.
*   **Vite:** For the build tooling.
*   **Tailwind CSS:** For styling.

## Getting Started

To get started with ModelCube, you'll need to have Node.js and npm installed on your system.

### Setup and Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/abijeetraut1/ModelCube.git
    cd modelcube
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm start
    ```

This will start the application in development mode.

### Building the Application

To create a distributable version of the application, you can use the following command:

```bash
npm run make
```

This will generate the application for your current operating system in the `out/make` directory.

## Project Structure

```
.
├── src
│   ├── main.ts       # Electron main process
│   ├── preload.ts    # Electron preload script
│   ├── renderer      # React application
│   └── ...
├── forge.config.ts   # Electron Forge configuration
├── package.json      # Project metadata and dependencies
└── ...
```
