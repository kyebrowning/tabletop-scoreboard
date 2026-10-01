const socket = io({ query: { role: 'overlay' } });
const frame = document.getElementById('gameFrame');

let currentGame = null;

socket.on('state:sync', (payload) => {
    if (payload.activeGame === currentGame) return;
    currentGame = payload.activeGame;
    frame.src = `/games/${currentGame}/overlay/overlay.html`;
});
