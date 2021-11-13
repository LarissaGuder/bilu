import axios, { AxiosInstance } from "axios";

interface recentlyPlayed {
    label: string;
}

/// <reference types="spotify-api" />
class RecentesService {

    public getRecentPlayed = async (token: string): Promise<any> => {
        const api = await axios({
            method: 'get',
            baseURL: 'https://api.spotify.com/v1/me/player/recently-played',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })

        const returnSpotify: SpotifyApi.UsersRecentlyPlayedTracksResponse = api.data as any

        return returnSpotify
    }

}

export const recentesService = new RecentesService()