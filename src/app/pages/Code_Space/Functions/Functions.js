export const CodeTextSeprator = (text) => {
    // Seprate the code and text

    const codebase = {
        path: "./root/app.js",
        code: "console.log('Hello world')",
        text: "Hello world"
    };

    return codebase;
}


export const getLanguageFromFilename = (filename) => {
    const extension = filename.split('.').pop();
    const map = {
        js: 'javascript',
        ts: 'typescript',
        jsx: 'javascript',
        tsx: 'typescript',
        py: 'python',
        java: 'java',
        c: 'c',
        cpp: 'cpp',
        cs: 'csharp',
        html: 'html',
        css: 'css',
        json: 'json',
        md: 'markdown',
        php: 'php',
        go: 'go',
        sh: 'shell',
        sql: 'sql',
        yaml: 'yaml',
        yml: 'yaml',
        xml: 'xml',
        txt: 'plaintext',
    };


    return map[extension] || 'plaintext';
}
