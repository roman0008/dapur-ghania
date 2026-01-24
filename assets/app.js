@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');

:root {
    --primary-brown: #4A3728;
    --accent-gold: #C5A059;
    --bg-cream: #FDFBF7;
}

body {
    font-family: 'Plus Jakarta Sans', sans-serif;
    background-color: var(--bg-cream);
}

/* Custom Scrollbar untuk Drawer */
::-webkit-scrollbar {
    width: 6px;
}

::-webkit-scrollbar-track {
    background: transparent;
}

::-webkit-scrollbar-thumb {
    background: #EAE2D5;
    border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
    background: #C5A059;
}

/* Animasi Transisi */
.cart-drawer-enter {
    transform: translateX(100%);
}

.cart-drawer-enter-active {
    transform: translateX(0);
    transition: transform 300ms ease-in-out;
}