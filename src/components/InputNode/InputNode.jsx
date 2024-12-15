import { useCallback, useState, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';
import axios from 'axios';
import { Box, Typography, TextField, Button, Card, CardContent } from '@mui/material';
import './InputNode.css';

const handleStyle = { left: 10 };

function InputNode({ data, isConnectable }) {
    const [pythonCode, setPythonCode] = useState('');
    const [output, setOutput] = useState(null);

    const nodeId = data.nodeId;

    const onChange = useCallback((evt) => {
        setPythonCode(evt.target.value);
    }, []);

    const fetchParentCode = (nodeId) => {
        try {
            const edges = JSON.parse(localStorage.getItem('edges')) || [];
            const currentNodeEdges = edges.filter(edge => edge.target === nodeId);

            if (currentNodeEdges.length === 0) return '';

            const codeMap = JSON.parse(localStorage.getItem('codeMap')) || {};
            let parentCode = '';
            for (let edge of currentNodeEdges) {
                const parentNodeId = edge.source;
                console.log("parentNode: ", parentNodeId);
                // Recursively fetch the parent node's code first
                parentCode = parentCode + fetchParentCode(parentNodeId);

                // Then add the current parent node's code
                const parentNodeCode = codeMap[parentNodeId] || '';
                parentCode = parentCode + `${parentNodeCode}\n`;
                console.log("parent code: ", parentCode);
            }
            return parentCode;
        } catch (err) {
            console.error("Error fetching parent code:", err);
            return '';
        }
    };

    const executePythonCode = async () => {
        try {
            const currentNodeId = data.nodeId;
            const parentCode = fetchParentCode(currentNodeId);
            const combinedCode = parentCode + pythonCode;
            console.log(combinedCode);
            const response = await axios.post('http://localhost:3001/execute/python', {
                code: combinedCode,
            });

            localStorage.setItem(currentNodeId, response.data.result);
            setOutput(response.data.result);

            const codeMap = JSON.parse(localStorage.getItem('codeMap')) || {};
            codeMap[currentNodeId] = pythonCode;
            localStorage.setItem('codeMap', JSON.stringify(codeMap));

        } catch (error) {
            const errorMsg = error.response?.data?.error || 'Unknown error';
            localStorage.setItem(`pythonOutput-${nodeId}`, errorMsg);
            setOutput(errorMsg);
        }
    };

    useEffect(() => {
        const storedOutput = localStorage.getItem(`pythonOutput-${nodeId}`);
        const codeMap = JSON.parse(localStorage.getItem('codeMap')) || {};
        const storedCode = codeMap[nodeId];

        if (storedOutput) setOutput(storedOutput);
        if (storedCode) setPythonCode(storedCode);
    }, [nodeId]);

    return (
        <Card
            sx={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(4px)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                borderRadius: '16px',
                padding: '16px',
                color: '#fff',
                width: '400px',
            }}
        >
            <Handle
                type="target"
                position={Position.Top}
                isConnectable={isConnectable}
            />
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Node ID: {nodeId}
                </Typography>
                <Typography variant="body1" gutterBottom>
                    Enter Python Code:
                </Typography>
                <TextField
                    fullWidth
                    multiline
                    rows={4}
                    variant="outlined"
                    value={pythonCode}
                    onChange={onChange}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            color: '#fff',
                            borderColor: 'rgba(255, 255, 255, 0.6)',
                        },
                        '& .MuiInputBase-input': {
                            color: '#fff',
                        },
                    }}
                />
                <Button
                    variant="outlined"
                    onClick={executePythonCode}
                    sx={{
                        marginTop: '16px',
                        backgroundColor: '#6200EA',
                        color: '#fff',
                        '&:hover': {
                            backgroundColor: '#3700B3',
                        },
                    }}
                >
                    Execute Python
                </Button>
            </CardContent>
            {output && (
                <Box
                    sx={{
                        marginTop: '16px',
                        padding: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        color: '#fff',
                    }}
                >
                    <Typography variant="body1" gutterBottom>
                        Python Output:
                    </Typography>
                    <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                        {output}
                    </Typography>
                </Box>
            )}
            <Handle
                type="source"
                position={Position.Bottom}
                id="a"
                style={handleStyle}
                isConnectable={isConnectable}
            />
            <Handle
                type="source"
                position={Position.Bottom}
                id="b"
                isConnectable={isConnectable}
            />
        </Card>
    );
}

export default InputNode;
