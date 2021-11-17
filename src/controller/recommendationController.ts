import request = require("request");
import {Request, Response, NextFunction} from 'express'

class recommendationController {

    public async store(req:Request, res: Response, next: NextFunction): Promise<void> {
        var refresh_token = req.query.refresh_token;
        var authOptions = {
            url: 'https://accounts.spotify.com/api/token',
            // headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
            form: {
                grant_type: 'refresh_token',
                refresh_token: refresh_token
            },
            json: true
        };

        request.post(authOptions, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                var access_token = body.access_token;
                // res.send({
                //     'access_token': access_token
                // });
            }
        });
    }
}

export default new recommendationController();
