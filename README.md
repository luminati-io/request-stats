# request-stats

[![Build Status](https://travis-ci.org/watson/request-stats.png)](https://travis-ci.org/watson/request-stats)

Get stats on your Node.js HTTP server requests.

Emits an `stats` event for each request with a single object as its
first argument, containing the following properties:

- `read`: Number of bytes sent by the client
- `written`: Number of bytes sent back to the client
- `method`: The HTTP method used by the client
- `status`: The HTTP status code returned to the client

## Installation

```
npm install request-stats
```

## Usage

```javascript
var requestStats = require('request-stats');

http.createServer(function (req, res) {
  requestStats(req, res).on('stats', function (stats) {
    console.log(stats); // { read: 42, written: 123, method: 'PUT', status: 200 }
  });
});
```

Can also be used as [Connect](https://github.com/senchalabs/connect)/[Express](http://expressjs.com/) middleware:

```javascript
app.use(requestStats.middleware());

requestStats().on('stats', function (stats) {
  console.log(stats); // { read: 42, written: 123, method: 'PUT', status: 200 }
});
```

## Acknowledgement

Thanks to [mafintosh](https://github.com/mafintosh) for coming up with
the initial concept and pointing me in the right direction.

## License

MIT