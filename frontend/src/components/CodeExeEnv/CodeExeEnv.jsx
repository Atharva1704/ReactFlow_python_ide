import {
    ReactFlow,
    Controls,
    Background,
    MiniMap,
    applyNodeChanges,
    applyEdgeChanges,
    addEdge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useState, useCallback } from 'react';
import InputNode from '../InputNode/InputNode';
import OutputNode from '../OutputNodes/OutputNode';
import { v4 as uuidv4 } from 'uuid';

const nodeTypes = { inputNode: InputNode, outputNode: OutputNode };

const rfStyle = {
    backgroundColor: '#343434',
    borderRadius: '10px'
};
const initialNodes = [
    {
        id: `d5e14b92-bba8-4969-a9a8-0917748ff2a8`,
        data: {
            label: `Node 1`,
            nodeId: 'd5e14b92-bba8-4969-a9a8-0917748ff2a8', // You can also store the ID as a separate field in data
        },
        position: { x: 0, y: 0 },
        type: 'inputNode',
    },
];

const initialEdges = [];

function CodeExeEnv() {
    const [nodes, setNodes] = useState(initialNodes);
    const [edges, setEdges] = useState(initialEdges);

    const onNodesChange = useCallback(
        (changes) => {
            const updatedNodes = applyNodeChanges(changes, nodes);
            setNodes(updatedNodes);
            localStorage.setItem('nodes', JSON.stringify(updatedNodes));
        },
        [nodes],
    );

    const onEdgesChange = useCallback(
        (changes) => {
            const updatedEdges = applyEdgeChanges(changes, edges);
            setEdges(updatedEdges);

            localStorage.setItem('edges', JSON.stringify(updatedEdges));
        },
        [edges],
    );

    const onConnect = useCallback(
        (params) => {
            const newEdges = addEdge(params, edges);
            setEdges(newEdges);

            localStorage.setItem('edges', JSON.stringify(newEdges));
        },
        [edges],
    );


    const addNode = () => {
        const ides = uuidv4();
        const newNode = {
            id: ides,
            data: {
                label: `Node ${nodes.length + 1}`,
                nodeId: ides,
            },
            position: { x: Math.random() * 400, y: Math.random() * 400 },
            type: 'inputNode',
        };

        setNodes((nds) => [...nds, newNode]);
    };


    return (
        <div style={{ height: '80vh', width: '90vw', marginLeft: "5vw" }}>
            <ReactFlow
                nodes={nodes}
                onNodesChange={onNodesChange}
                edges={edges}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                fitView
                style={rfStyle}
            >
                <Background />
                <Controls />
                <MiniMap />
            </ReactFlow>
            <button
                onClick={addNode}
            >
                Add Node
            </button>
        </div>
    );
}

export default CodeExeEnv;
