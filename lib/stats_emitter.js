'use strict'

const util = require('util');
const EventEmitter = require('events').EventEmitter;
const once = require('once');
const httpHeaders = require('http-headers');
const Request = require('./request');
const utils = require('./utils');

const StatsEmitter = module.exports = function(){
    EventEmitter.call(this);
}
util.inherits(StatsEmitter, EventEmitter)

StatsEmitter.prototype._server = function (server, onStats) {
    this._attach(onStats)
    server.on('request', this._request.bind(this))
}

StatsEmitter.prototype._request = function(req, res, onStats){
    const that = this;
    const start = process.hrtime();
    this.emit('request', new Request(req, res));
    this._attach(onStats)
    const emit = once(function (ok) {
        const bytesReadPreviously = req.socket._requestStats ?
            req.socket._requestStats.bytesRead : 0;
        const bytesWrittenPreviously = req.socket._requestStats ?
            req.socket._requestStats.bytesWritten : 0;
        const socket = req.socket.ssl && req.socket.ssl._parentWrap ||
            req.socket;
        const bytesReadDelta = socket.bytesRead - bytesReadPreviously;
        const bytesWrittenDelta = socket.bytesWritten - bytesWrittenPreviously;
        const ip = getIp(req);
        req.socket._requestStats = {
           bytesRead: socket.bytesRead,
           bytesWritten: socket.bytesWritten,
        };
        that.emit('complete', {
            ok: ok,
            time: utils.toMilliseconds(process.hrtime(start)),
            req: {
                bytes: bytesReadDelta,
                headers: req.headers,
                method: req.method,
                path: req.url,
                ip: ip,
                raw: req,
            },
            res: {
                bytes: bytesWrittenDelta,
                headers: httpHeaders(res, true),
                status: res.statusCode,
                raw: res,
            },
        });
    });
    res.once('finish', emit.bind(null, true));
    res.once('close', emit.bind(null, false));
};

function getIp(req){
    const ip = req.headers['x-forwarded-for'];
    if (!ip) {
        ip = req.socket && req.socket.remoteAddress;
        if (!ip && req.socket)
        {
            ip = req.socket.remoteAddress ||
                (req.socket.socket && req.socket.socket.remoteAddress);
        }
    }
    return ip;
}

StatsEmitter.prototype._attach = function(listener){
    if (typeof listener==='function')
        this.on('complete', listener);
};
