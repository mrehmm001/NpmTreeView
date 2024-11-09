import axios from 'axios';
import { API_BASE_URL } from '../config';

const axiosInstance = axios.create({
    baseURL: API_BASE_URL
});

axiosInstance.interceptors.response.use((response) => {
    return response.data;
}, (error) => {
    return Promise.reject(error);
});


export { axiosInstance as axios };
