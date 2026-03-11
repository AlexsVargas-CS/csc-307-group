import axios from 'axios';

import { env } from '../config/env.js';
import { ApiError } from '../utils/apiError.js';

const client = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
  timeout: 10000
});

export const tmdbRequest = async (path, params = {}) => {
  try {
    const response = await client.get(path, {
      params: {
        api_key: env.TMDB_API_KEY,
        ...params
      }
    });
    return response.data;
  } catch (error) {
    const status = error.response?.status || 502;
    const message = error.response?.data?.status_message || 'TMDB request failed';

    throw new ApiError(message, 'TMDB_REQUEST_FAILED', status);
  }
};
