import { Request, Response } from "express";
import axios from "axios";

export const usernames = async (req: Request, res: Response) => {
  const response = await axios.get(
    `https://api.twitter.com/2/users/by?usernames=${req.query.users}&user.fields=url,profile_image_url,description`,
    {
      headers: {
        Authorization: `Bearer ${process.env.TWITTER_BEARER}`,
      },
    }
  );

  res.send({ data: response.data.data });
};