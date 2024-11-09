import { useNavigate, useParams } from 'react-router';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { applyEdgeChanges, applyNodeChanges, Background, Controls, Edge, EdgeChange, Node, NodeChange, ReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Package, useGetTreeView } from '../api/getTreeView';

export function NPMTreeViewPage () {
    const { packageName, version } = useParams<{ packageName: string, version: string }>();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [searchPackage, setSearchPackage] = useState("");
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const { data, isLoading } = useGetTreeView(packageName ?? '', version ?? '');
    const VERTICAL_SPACING = 150; // Space between levels
    const HORIZONTAL_SPACING = 200; // Space between nodes on same level

    useEffect(() => {
        setSearchQuery(packageName + (version ? `:${version}` : ''));
    }, [packageName, version]);

    const handleSearch = () => {
        const [packageName, version] = searchQuery.split(':');
        navigate(`/npm-tree-view/${packageName}/${version}`);
    };

    const constructTree = useCallback((packageName: string, dependencyTree: Record<string, Package>, edges: Edge[]=[], nodes: Node[]=[]) => {
        const dependencyNames = Object.keys(dependencyTree);
        
        // Calculate total width needed for all children
        const getSubtreeWidth = (deps: Record<string, Package>): number => {
            const children = Object.keys(deps);
            if (children.length === 0) return HORIZONTAL_SPACING;
            return children.reduce((sum, child) => 
                sum + getSubtreeWidth(deps[child].dependencies), 0);
        };

        // Calculate starting X position to center parent above children
        const totalWidth = getSubtreeWidth(dependencyTree);
        const parentNode = nodes.find(node => node.id === packageName);
        const parentY = parentNode ? parentNode.position.y : 0;
        const parentX = parentNode ? parentNode.position.x : 0;
        
        let currentX = parentX - (totalWidth / 2) + (HORIZONTAL_SPACING / 2);

        dependencyNames.forEach((name) => {
            const {dependencies, version} = dependencyTree[name];
            const uniqueId = `${packageName}-${name}`;
            
            // Calculate width of current subtree
            const subtreeWidth = getSubtreeWidth(dependencies);
            
            // Position node centered above its own subtree
            const nodeX = currentX + (subtreeWidth / 2) - (HORIZONTAL_SPACING / 2);
            
            nodes.push({
                id: uniqueId,
                data: { label: `${name}@${version}` },
                position: { 
                    x: nodeX,
                    y: parentY + VERTICAL_SPACING
                }
            });

            edges.push({
                id: `${packageName}-${uniqueId}`,
                source: packageName,
                target: uniqueId,
            });

            // Recursively position children
            constructTree(uniqueId, dependencies, edges, nodes);
            
            // Move currentX by the width of the current subtree
            currentX += subtreeWidth;
        });

        return {edges, nodes};
    }, []);

    useEffect(()=>{
        // add parent node
        const nodes: Node[] = [
            {
                id:data?.name ?? '',
                data: { label: `${data?.name}@${data?.version}` },
                position: { x: 0, y: 0 }
            }
        ];
        const edges: Edge[] = [];
        if(data){
            const {nodes: newNodes, edges: newEdges} = constructTree?.(data.name, data.dependencies, edges, nodes);
            setEdges(newEdges);
            setNodes(newNodes);
        }
    }, [data]);

    const onNodesChange = useCallback(
        (changes: NodeChange<Node>[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
        [],
    );
    const onEdgesChange = useCallback(
        (changes: EdgeChange<Edge>[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        [],
    );

    return (
        <div className="h-screen w-screen flex flex-col">
            <div className="flex flex-col items-center gap-8 p-4 w-full ">
                <div className="flex flex-col items-center gap-4 w-full border-b border-solid border-gray-200 h-full p-4">
                    <div className="flex w-full gap-2 items-center">
                        <Input
                        type="text" 
                        placeholder="Search packages..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex h-10 w-full  rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                        />
                        <Button
                        onClick={handleSearch}
                        className="inline-flex h-10 items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                        >
                        Search
                        </Button>
                    </div>
                </div>
            </div>
            <div className="flex-1 p-4">
                {isLoading ? (
                    <div className="h-full w-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900" />
                    </div>
                ) : (
                    <>
                        <ReactFlow 
                            nodes={nodes} 
                            edges={edges}
                            onNodesChange={onNodesChange}
                            onEdgesChange={onEdgesChange}
                        >
                            <Background />
                            <Controls />
                        </ReactFlow>
                    </>
                )}
            </div>
        </div>
    );
}
