import { axios } from '../../libs/axios';

export type Package = {
    version: string;
    dependencies: Record<string, Package>;
};

export interface ITreeView {
    name: string;
    version: string;
    dependencies: Record<string, Package>;
}


export const getTreeView = async (packageName: string, version: string): Promise<ITreeView> => {
    return await axios.get(`/package/${packageName}/${version}`);
}

import { useQuery } from '@tanstack/react-query';

export const useGetTreeView = (packageName: string, version: string) => {
    return useQuery({
        queryKey: ['treeView', packageName, version],
        queryFn: ()=>getTreeView(packageName, version),
        enabled: !!packageName && !!version,
    });
};


