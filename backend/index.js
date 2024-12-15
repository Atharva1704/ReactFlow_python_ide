import express from 'express';
import ivm from 'isolated-vm';
import { spawn } from 'child_process';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());  // Allow all origins (you can customize it if needed)

app.get('/', (req, res) => {
    res.send("hiii");
})

const runPythonCode = (code) => {
    return new Promise((resolve, reject) => {
        // Spawn a child process to run Python code
        const pythonProcess = spawn('/usr/bin/python3', ['-c', code]);
        // const pythonProcess = spawn('python3', ['-c', code]); // Example for Python 3

        let output = '';
        let errorOutput = '';

        // Capture stdout and stderr
        pythonProcess.stdout.on('data', (data) => {
            output += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });
        console.log("Output: ", output);
        console.log("Error Output: ", errorOutput);

        // Handle process completion
        pythonProcess.on('close', (code) => {
            if (code === 0) {
                resolve(output); // Return the output if no error
            } else {
                reject(new Error(errorOutput || 'Unknown error during Python execution.'));
            }
        });
    });
};


// Route to execute Python code
app.post('/execute/python', async (req, res) => {
    const { code } = req.body;
    if (!code) {
        return res.status(400).json({ error: 'No code provided' });
    }

    try {
        const result = await runPythonCode(code);
        res.json({ result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start the server
const PORT = 3001;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
