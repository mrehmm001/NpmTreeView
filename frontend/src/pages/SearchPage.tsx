import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { useState } from 'react';
import { useNavigate } from 'react-router';


export function NPMSearchPage () {
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    const handleSearch = () => {
        const [packageName, version] = searchQuery.split(':');
        if(version) {
            navigate(`/npm-tree-view/${packageName}/${version}`);
        } else {
            navigate(`/npm-tree-view/${packageName}`);
        }
    };

    return (
        <div className="w-screen h-screen mx-auto">
        <div className="flex flex-col items-center justify-center min-h-screen gap-8 p-8 w-full">
            <h1 className="text-4xl font-bold tracking-tight">NPM Tree Viewer</h1>
            
            <div className="flex flex-col items-center gap-4 max-w-lg w-full">
            <p className="text-sm text-gray-600 text-center">
                Search by package name (e.g. "react") or use format "packageName:version" (e.g. "react:18.2.0") to search for specific versions
            </p>
            
            <div className="flex w-full gap-2">
                <Input
                type="text"
                placeholder="Search packages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                />
                <Button
                onClick={() => handleSearch()}
                className="inline-flex h-10 items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                >
                    Search
                </Button>
            </div>
            </div>
        </div>
        </div>
    );
}
