import { useState, useEffect } from 'react';
import logo from '../assets/FOCO T COLOR.png'

const preguntas = [
    "¿Quién quiere ver el progreso de la nueva herramienta de las inmobiliarias?",
    "¿Listo para conocer cómo avanza el futuro de Tipstate?",
    "¿Quieres ver el desarrollo de la plataforma que está transformando el sector inmobiliario?",
    "¿Interesado en seguir de cerca la evolución de Tipstate Match?",
    "¿Quién desea conocer el avance de la nueva solución para el mercado inmobiliario?",
    "¿Preparado para ver cómo se construye la herramienta que cambiará la forma de trabajar en inmobiliarias?",
    "¿Quieres estar al tanto del progreso de la plataforma más innovadora del sector?"
];

function RoleSelection({ onSelectRole }) {
    const [preguntaActual, setPreguntaActual] = useState('');
    const [isVisible, setIsVisible] = useState(true);

    // Función para cambiar a una pregunta aleatoria diferente
    const cambiarPregunta = () => {
        setIsVisible(false); // Inicia la animación de salida

        setTimeout(() => {
            let nuevaPregunta;
            do {
                const randomIndex = Math.floor(Math.random() * preguntas.length);
                nuevaPregunta = preguntas[randomIndex];
            } while (nuevaPregunta === preguntaActual); // Evita repetir la misma pregunta

            setPreguntaActual(nuevaPregunta);
            setIsVisible(true); // Inicia la animación de entrada
        }, 400); // Tiempo de la animación de salida
    };

    // Seleccionar pregunta inicial y configurar el cambio automático
    useEffect(() => {
        const randomIndex = Math.floor(Math.random() * preguntas.length);
        setPreguntaActual(preguntas[randomIndex]);

        // Cambiar pregunta cada 4.5 segundos
        const interval = setInterval(() => {
            cambiarPregunta();
        }, 4500);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-6">
            <div className="max-w-2xl w-full text-center">

                {/* Logo + Título */}
                <div className="flex justify-center mb-8">
                    <img src={logo} alt="Tipstate" className="w-16 h-16" />
                </div>

                <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-white mb-4">
                    Tipstate Match
                </h1>

                {/* Pregunta con animación suave */}
                <div className="h-24 md:h-28 flex items-center justify-center mb-12">
                    <p
                        className={`text-2xl md:text-3xl text-white/90 font-light leading-tight transition-all duration-500 ease-in-out
              ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'}`}
                    >
                        {preguntaActual}
                    </p>
                </div>

                {/* Botones de selección de rol */}
                <div className="flex flex-col md:flex-row gap-4 justify-center">
                    <button
                        onClick={() => onSelectRole('alfredo')}
                        className="px-8 py-4 bg-white text-[#112d44] font-semibold rounded-2xl text-lg hover:bg-[#eeaa28] hover:text-white transition-all active:scale-[0.985]"
                    >
                        Alfredo (Contratante)
                    </button>

                    <button
                        onClick={() => onSelectRole('rodrigo')}
                        className="px-8 py-4 bg-[#112d44] text-white font-semibold rounded-2xl text-lg border border-white/20 hover:bg-white hover:text-[#112d44] transition-all active:scale-[0.985]"
                    >
                        Rodrigo (Programador)
                    </button>
                </div>

                <p className="mt-8 text-white/50 text-sm">
                    Selecciona tu rol para ver el progreso del proyecto
                </p>
            </div>
        </div>
    );
}

export default RoleSelection;