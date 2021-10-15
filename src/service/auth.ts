import axios from 'axios';
import qs = require('qs');

export const getAuth = async () => {
    const BASE64_ENCODED_AUTH_CODE = "<your BASE64-Encoded Client ID/Client Secret >";
    const headers = {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${BASE64_ENCODED_AUTH_CODE}`
      }
    };
    const data = {
      grant_type: 'client_credentials',
    };
  
    try {
      const response:any = await axios.post(
        'https://accounts.spotify.com/api/token',
        qs.stringify(data),
        headers
      );
      console.log(response.data.access_token);
      return response.data.access_token;
    } catch (error) {
      console.log(error);
    }
  };