const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { WebcastPushConnection } = require('tiktok-live-connector');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Twój prawdziwy nick z TikToka
const tiktokUsername = "krisss8837"; 
let totalLikes = 0;

// Strona wyświetlana w TikTok Live Studio
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="pl">
        <head>
            <meta charset="UTF-8">
            <title>TikTok Live Licznik</title>
            <style>
                body {
                    margin: 0;
                    padding: 0;
                    background: transparent;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    overflow: hidden;
                }

                .container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                }

                .heart-icon {
                    width: 120px;
                    height: 120px;
                    background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23ff3366"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>');
                    background-size: contain;
                    background-repeat: no-repeat;
                    background-position: center;
                    transition: transform 0.1s ease;
                    filter: drop-shadow(3px 3px 0px #00ffff);
                }

                .pulse {
                    transform: scale(1.3);
                }

                .counter-text {
                    margin-top: 15px;
                    font-size: 55px;
                    font-weight: 900;
                    color: #ffffff;
                    text-transform: uppercase;
                    text-shadow: 
                        3px 3px 0px #ff3366, 
                        -3px -3px 0px #00ffff, 
                        3px -3px 0px #ff3366, 
                        -3px 3px 0px #00ffff,
                        5px 5px 10px rgba(0,0,0,0.8);
                    letter-spacing: 2px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div id="heart" class="heart-icon"></div>
                <div id="counter" class="counter-text">0 LIKES</div>
            </div>

            <script src="/socket.io/socket.io.js"></script>
            <script>
                const socket = io();
                const counterElement = document.getElementById('counter');
                const heartElement = document.getElementById('heart');

                socket.on('updateLikes', (likes) => {
                    counterElement.innerText = likes.toLocaleString() + " LIKES";

                    // Animacja pulsowania serduszka przy każdym odebraniu polubień
                    heartElement.classList.add('pulse');
                    setTimeout(() => {
                        heartElement.classList.remove('pulse');
                    }, 100);
                });
            </script>
        </body>
        </html>
    `);
});

// Prawdziwe połączenie z TikTokiem (uwaga: biblioteka zacznie pobierać dane, gdy faktycznie rozpoczniesz transmisję na żywo)
let tiktokStream = new WebcastPushConnection(tiktokUsername);

tiktokStream.connect().then(state => {
    console.info(`Połączono z room ID: ${state.roomId}`);
}).catch(err => {
    console.error('Błąd połączenia z TikTokiem (upewnij się, że prowadzisz live):', err);
});

// Nasłuchiwanie prawdziwych polubień od widzów
tiktokStream.on('like', (data) => {
    totalLikes += data.likeCount;
    io.emit('updateLikes', totalLikes);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Serwer licznika działa na porcie ${PORT}!`);
});