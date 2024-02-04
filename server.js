
const fs = require("fs")

const http = require("http")
const https = require('https')
const express = require("express")
const url = require('url')

const { v4: uuidv4 } = require("uuid")
const { WebSocketServer } = require("ws")

const app = express()
const server = https.createServer(app)
const io = new WebSocketServer({ noServer: true })

const options = url.parse('https://22283.live.streamtheworld.com/938NOWAAC_SC')

let devices = []

options.headers = {
    'User-Agent': 'request'
}

io.on("connection", (socket) => {
    socket.on("close", () => {
        devices.splice(devices.filter((device) => (device[1] === socket.uuid)), 1)
    })
    socket.uuid = uuidv4()
    devices.push([socket, socket.uuid])
})

server.on("upgrade", (request, socket, head) => {
    io.handleUpgrade(request, socket, head, (socket) => {
        io.emit("connection", socket)
    })
})

server.listen(5000, () => {
    https.get(options, (stream) => {
        stream.on("data", (chunk) => {
            devices.forEach((device) => {
                device[0].send(chunk)
            })
            if (chunk.length > 10) {
                console.log(chunk.length, devices.length)
            }
        })
    })
})
