import express, { Request, Response } from 'express';
import { IURL } from './model';
import axios, { AxiosError } from 'axios';

const app = express();

const urlList: IURL[] = [
  {
    "url": "https://does-not-work.perfume.new",
    "priority": 1
  },
  {
    "url": "https://gitlab.com",
    "priority": 4
  },
  {
    "url": "https://github.com",
    "priority": 4
  },
  {
    "url": "https://doesnt-work.github.com",
    "priority": 4
  },
  {
    "url": "http://app.scnt.me",
    "priority": 3
  },
  {
    "url": "https://offline.scentronix.com",
    "priority": 2
  }
];


app.get('/reachable-url', async (req: Request, res: Response) => {
  const reachablUrlsPromises: Promise<IURL>[] = urlList
    // sort by priority
    .sort(((a, b) => a.priority - b.priority))
    // map each url item into a Promise.
    // The Promise would resolve if the HEAD request method returns with a status code from 200 to 299.
    // Otherwise it rejects, that means the url is unreachable
    .map(urlItem => {
      return new Promise((resolve, reject) => {
        // Set request time out 5s, if the request does not respond after 5s, the URL is unreachable
        axios.head(urlItem.url, { timeout: 5000 }).then((res) => {
          if (res.status >= 200 && res.status <= 299) {
            resolve(urlItem);
          }
          reject(res.status);
        }).catch((e: AxiosError) => {
          reject(e.message);
        });
      });
    });

  // Apply Promise.allSettled to retrieve both fulfilled and rejected results.
  // Then filter out only fulfilled values, which are reachable URLs.
  const results = (await Promise.allSettled(reachablUrlsPromises)).map((result) => {
    if (result.status === 'fulfilled') {
      return result.value;
    }
    return null;
  }).filter((item): item is IURL => !!item);

  // Filter by priority
  const priority = req.query.priority;
  if (priority) {
    return res.send(results.filter(item => item.priority === Number(priority)));
  }

  res.send(results);
});

export default app;