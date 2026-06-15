import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyB5rugfx-T2eFsteD1erOxHoGFfe6lyv_M",
    authDomain: "tipstate-match-progress.firebaseapp.com",
    projectId: "tipstate-match-progress",
    storageBucket: "tipstate-match-progress.firebasestorage.app",
    messagingSenderId: "46799749821",
    appId: "1:46799749821:web:a57c54eed9c82c1fdf6dd4"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar Firestore
export const db = getFirestore(app);