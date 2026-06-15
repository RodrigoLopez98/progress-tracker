import { useState } from 'react'
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

function RodrigoView({ onGoBack }) {
    const [selectedPerson, setSelectedPerson] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [openStages, setOpenStages] = useState({})
    const [openActivities, setOpenActivities] = useState({})

    // Modal de confirmación
    const [showConfirmModal, setShowConfirmModal] = useState(false)
    const [pendingTask, setPendingTask] = useState(null) // { stageId, activityId, taskId }
    const [password, setPassword] = useState('')
    const [passwordError, setPasswordError] = useState(false)

    // Datos de ejemplo
    const [tasksData, setTasksData] = useState({
        rodrigo: [
            {
                "id": 1,
                "name": "Análisis, Arquitectura Técnica y Definición Funcional Completa",
                "activities": [
                    {
                        "id": 1,
                        "name": "Levantamiento y Definición de Requerimientos Funcionales Completos",
                        "tasks": [
                            { "id": 1, "title": "Realizar juntas de levantamiento de requerimientos con Alfredo", "completed": false },
                            { "id": 2, "title": "Documentar todos los tipos de usuarios de la plataforma", "completed": false },
                            { "id": 3, "title": "Definir flujos principales de cada tipo de usuario", "completed": false },
                            { "id": 4, "title": "Elaborar documento de Alcance Funcional Completo", "completed": false },
                            { "id": 5, "title": "Validar con Alfredo el alcance completo del proyecto", "completed": false }
                        ]
                    },
                    {
                        "id": 2,
                        "name": "Definición de la Arquitectura Técnica General",
                        "tasks": [
                            { "id": 6, "title": "Definir arquitectura general del sistema (Frontend, Backend, Base de datos)", "completed": false },
                            { "id": 7, "title": "Elegir y justificar stack tecnológico principal", "completed": false },
                            { "id": 8, "title": "Definir estrategia de despliegue y hosting", "completed": false },
                            { "id": 9, "title": "Documentar decisiones técnicas importantes", "completed": false }
                        ]
                    },
                    {
                        "id": 3,
                        "name": "Diseño de la Estructura de Base de Datos (Alto Nivel)",
                        "tasks": [
                            { "id": 10, "title": "Identificar entidades principales del sistema", "completed": false },
                            { "id": 11, "title": "Diseñar diagrama Entidad-Relación (ER) de alto nivel", "completed": false },
                            { "id": 12, "title": "Definir campos principales de cada entidad", "completed": false },
                            { "id": 13, "title": "Validar estructura de datos con Alfredo", "completed": false }
                        ]
                    },
                    {
                        "id": 4,
                        "name": "Definición de Módulos y Flujos Principales",
                        "tasks": [
                            { "id": 14, "title": "Definir módulos principales de la plataforma", "completed": false },
                            { "id": 15, "title": "Documentar flujos principales de cada módulo", "completed": false },
                            { "id": 16, "title": "Identificar dependencias entre módulos", "completed": false }
                        ]
                    },
                    {
                        "id": 5,
                        "name": "Documentación Técnica Inicial",
                        "tasks": [
                            { "id": 17, "title": "Elaborar documento de Arquitectura Técnica", "completed": false },
                            { "id": 18, "title": "Crear diagramas de flujo principales", "completed": false },
                            { "id": 19, "title": "Compartir y validar documentación con Alfredo", "completed": false }
                        ]
                    }
                ]
            }
        ],
        alicia: [
            {
                id: 1,
                name: "Análisis, Diseño UI/UX y Arquitectura",
                activities: [
                    {
                        id: 1,
                        name: "Diseño de interfaz de usuario",
                        tasks: [
                            { id: 1, title: "Diseñar landing page principal", completed: true },
                            { id: 2, title: "Crear sistema de diseño", completed: true },
                            { id: 3, title: "Diseñar dashboard de vendedor", completed: false },
                        ]
                    }
                ]
            }
        ]
    })

    // ========================
    // FUNCIONES
    // ========================

    // Función para inicializar datos en Firebase
    const initializeData = async (person, docRef) => {
        const initialData = tasksData[person];

        if (initialData && initialData.length > 0) {
            try {
                await setDoc(docRef, {
                    stages: initialData
                });
                console.log(`Datos inicializados para ${person}`);
            } catch (error) {
                console.error("Error al inicializar datos:", error);
            }
        }
    };

    const handleSelectPerson = async (person) => {
        setIsLoading(true);
        setSelectedPerson(person);

        try {
            const docRef = doc(db, "progress", person);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();

                // Si ya hay stages guardados, los usamos
                if (data.stages && data.stages.length > 0) {
                    setTasksData(prev => ({
                        ...prev,
                        [person]: data.stages
                    }));
                } else {
                    // Si el documento existe pero está vacío, inicializamos con datos locales
                    await initializeData(person, docRef);
                }
            } else {
                // Si el documento no existe, lo creamos con los datos locales
                await initializeData(person, docRef);
            }
        } catch (error) {
            console.error("Error al cargar datos de Firebase:", error);
        }

        setIsLoading(false);
    };

    const handleBackToSelection = () => {
        setSelectedPerson(null)
        setIsLoading(false)
    }

    const toggleStage = (stageId) => {
        setOpenStages(prev => ({
            ...prev,
            [stageId]: !prev[stageId]
        }))
    }

    const toggleActivity = (activityId) => {
        setOpenActivities(prev => ({
            ...prev,
            [activityId]: !prev[activityId]
        }))
    }

    // Abrir modal de confirmación
    const handleTaskClick = (stageId, activityId, taskId) => {
        setPendingTask({ stageId, activityId, taskId })
        setPassword('')
        setPasswordError(false)
        setShowConfirmModal(true)
    }

    // Confirmar cambio de tarea con contraseña
    const confirmTaskChange = async () => {
        if (password !== 'genexis321') {
            setPasswordError(true);
            return;
        }

        // Actualizar el estado local
        const updatedData = { ...tasksData };
        const personTasks = [...updatedData[selectedPerson]];

        const stageIndex = personTasks.findIndex(s => s.id === pendingTask.stageId);
        const activityIndex = personTasks[stageIndex].activities.findIndex(a => a.id === pendingTask.activityId);
        const taskIndex = personTasks[stageIndex].activities[activityIndex].tasks.findIndex(t => t.id === pendingTask.taskId);

        personTasks[stageIndex].activities[activityIndex].tasks[taskIndex].completed =
            !personTasks[stageIndex].activities[activityIndex].tasks[taskIndex].completed;

        updatedData[selectedPerson] = personTasks;
        setTasksData(updatedData);

        // Guardar en Firebase
        try {
            const docRef = doc(db, "progress", selectedPerson);
            await setDoc(docRef, {
                stages: personTasks
            });
            console.log("Datos guardados correctamente en Firebase");
        } catch (error) {
            console.error("Error al guardar en Firebase:", error);
        }

        // Cerrar modal
        setShowConfirmModal(false);
        setPendingTask(null);
        setPassword('');
        setPasswordError(false);
    };

    const closeModal = () => {
        setShowConfirmModal(false)
        setPendingTask(null)
        setPassword('')
        setPasswordError(false)
    }

    const currentData = tasksData[selectedPerson] || []

    // ========================
    // PANTALLA DE SELECCIÓN
    // ========================
    if (!selectedPerson) {
        return (
            <div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center px-6">
                <div className="max-w-md w-full text-center">
                    <h1 className="text-3xl font-semibold mb-2">Rodrigo</h1>
                    <p className="text-white/70 mb-8">¿A quién quieres actualizar el progreso?</p>

                    <div className="flex flex-col gap-4">
                        <button
                            onClick={() => handleSelectPerson('rodrigo')}
                            className="w-full py-4 bg-[#eeaa28] text-[#112d44] font-semibold rounded-2xl text-lg hover:bg-[#d99a1f] transition-all active:scale-[0.985]"
                        >
                            Actualizar mi progreso
                        </button>

                        <button
                            onClick={() => handleSelectPerson('alicia')}
                            className="w-full py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-2xl text-lg transition-all active:scale-[0.985]"
                        >
                            Actualizar progreso de Alicia
                        </button>
                    </div>

                    <button onClick={onGoBack} className="mt-8 text-sm text-white/60 hover:text-white transition-colors">
                        ← Volver a selección de rol
                    </button>
                </div>
            </div>
        )
    }

    // ========================
    // LOADING
    // ========================
    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-[#eeaa28] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-lg">
                        {selectedPerson === 'rodrigo' ? 'Cargando tus tareas...' : 'Cargando tareas de Alicia...'}
                    </p>
                </div>
            </div>
        )
    }

    // ========================
    // VISTA TO-DO
    // ========================
    return (
        <div className="min-h-screen bg-[#0f172a] text-white">
            <div className="max-w-5xl mx-auto px-6 py-6">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-semibold">
                            {selectedPerson === 'rodrigo' ? 'Mi Progreso' : 'Progreso de Alicia'}
                        </h1>
                        <p className="text-white/60 text-sm">Tareas detalladas • Nivel por nivel</p>
                    </div>

                    <div className="flex gap-3">
                        <button onClick={() => setSelectedPerson(null)} className="px-4 py-2 text-sm bg-white/10 hover:bg-white/20 rounded-xl transition-all">
                            Cambiar persona
                        </button>
                        <button onClick={onGoBack} className="px-4 py-2 text-sm text-white/70 hover:text-white transition-all">
                            ← Volver
                        </button>
                    </div>
                </div>

                {/* Lista de Etapas */}
                <div className="space-y-4">
                    {currentData.map((stage) => (
                        <div key={stage.id} className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">

                            {/* Nivel 1: Etapa */}
                            <div
                                onClick={() => toggleStage(stage.id)}
                                className="flex justify-between items-center p-5 cursor-pointer hover:bg-white/5 transition-colors"
                            >
                                <div>
                                    <h3 className="font-semibold text-lg">{stage.name}</h3>
                                    <p className="text-sm text-white/60">Etapa {stage.id}</p>
                                </div>
                                <span className={`text-2xl text-white/60 transition-transform duration-300 ${openStages[stage.id] ? 'rotate-180' : ''}`}>
                                    +
                                </span>
                            </div>

                            {/* Nivel 2 y 3 */}
                            <div
                                className={`transition-all duration-300 ease-in-out overflow-hidden ${openStages[stage.id] ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                                    }`}
                            >
                                <div className="px-5 pb-5 space-y-3">
                                    {stage.activities.map((activity) => (
                                        <div key={activity.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">

                                            {/* Nivel 2: Actividad */}
                                            <div
                                                onClick={() => toggleActivity(activity.id)}
                                                className="flex justify-between items-center p-4 cursor-pointer hover:bg-white/5 transition-colors"
                                            >
                                                <p className="font-medium">{activity.name}</p>
                                                <span className={`text-xl text-white/60 transition-transform duration-300 ${openActivities[activity.id] ? 'rotate-180' : ''}`}>
                                                    +
                                                </span>
                                            </div>

                                            {/* Nivel 3: Tareas */}
                                            <div
                                                className={`transition-all duration-300 ease-in-out overflow-hidden ${openActivities[activity.id] ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                                                    }`}
                                            >
                                                <div className="px-4 pb-4 space-y-2">
                                                    {activity.tasks.map((task) => (
                                                        <div
                                                            key={task.id}
                                                            onClick={() => handleTaskClick(stage.id, activity.id, task.id)}
                                                            className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                                                        >
                                                            <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${task.completed
                                                                ? 'bg-[#eeaa28] border-[#eeaa28]'
                                                                : 'border-white/40'
                                                                }`}>
                                                                {task.completed && <span className="text-[#112d44] text-xs">✓</span>}
                                                            </div>
                                                            <span className={`${task.completed ? 'line-through text-white/50' : 'text-white'}`}>
                                                                {task.title}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal de Confirmación + Contraseña */}
            {showConfirmModal && pendingTask && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-6">
                    <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-8 w-full max-w-md">
                        <h3 className="text-xl font-semibold mb-4">Confirmar cambio de tarea</h3>

                        <p className="text-white/80 mb-6">
                            ¿Estás seguro de que deseas cambiar el estado de esta tarea?
                        </p>

                        <div className="mb-4">
                            <label className="block text-sm text-white/70 mb-2">Ingresa tu contraseña</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value)
                                    setPasswordError(false)
                                }}
                                className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#eeaa28]"
                                placeholder="Contraseña"
                            />
                            {passwordError && (
                                <p className="text-red-400 text-sm mt-1">Contraseña incorrecta</p>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={closeModal}
                                className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmTaskChange}
                                className="flex-1 py-3 bg-[#eeaa28] text-[#112d44] font-semibold rounded-xl hover:bg-[#d99a1f] transition-all"
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default RodrigoView