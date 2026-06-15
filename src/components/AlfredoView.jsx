import { useState, useEffect } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import logo from '../assets/FOCO T COLOR.png'
import { calculateProgress } from '../utils/calculateProgress'

function getCurrentTask(stage) {
    if (stage.currentTask) return stage.currentTask

    for (const activity of stage.activities ?? []) {
        const incomplete = activity.tasks?.find(task => !task.completed)
        if (incomplete) return incomplete.title
    }

    return null
}

function getStageStatus(stage, progress) {
    if (stage.status) return stage.status
    if (progress === 100) return 'Completado'
    if (progress > 0) return 'En progreso'
    return 'Pendiente'
}

function AlfredoView({ onGoBack }) {
    const [stages, setStages] = useState([])
    const [loading, setLoading] = useState(true)

    const [selectedStage, setSelectedStage] = useState(null)

    useEffect(() => {
        const rodrigoRef = doc(db, "progress", "rodrigo")
        const aliciaRef = doc(db, "progress", "alicia")

        let rodrigoStages = []
        let aliciaStages = []

        // Escuchar documento de Rodrigo
        const unsubscribeRodrigo = onSnapshot(rodrigoRef, (docSnap) => {
            rodrigoStages = docSnap.exists() ? (docSnap.data().stages || []) : []
            combineStages()
        })

        // Escuchar documento de Alicia
        const unsubscribeAlicia = onSnapshot(aliciaRef, (docSnap) => {
            aliciaStages = docSnap.exists() ? (docSnap.data().stages || []) : []
            combineStages()
        })

        // Función para combinar y ordenar las etapas
        const combineStages = () => {
            const combined = [...rodrigoStages, ...aliciaStages]
            // Ordenar por id
            combined.sort((a, b) => a.id - b.id)
            setStages(combined)
            setLoading(false)
        }

        // Cleanup
        return () => {
            unsubscribeRodrigo()
            unsubscribeAlicia()
        }
    }, [])

    const getProgressColor = (progress) => {
        if (progress < 30) return '#ef4444'
        if (progress < 60) return '#eeaa28'
        return '#10b981'
    }

    const { overallProgress: totalProgress, stageProgress } = calculateProgress(stages)

    const stagesWithProgress = stages.map((stage, index) => {
        const progress = stageProgress[index]?.percentage ?? 0
        return {
            ...stage,
            progress,
            status: getStageStatus(stage, progress),
            currentTask: getCurrentTask(stage),
        }
    })

    const nextDelivery =
        stagesWithProgress.find(stage => stage.progress > 0 && stage.progress < 100) ??
        stagesWithProgress[0]

    const nextColor = nextDelivery ? getProgressColor(nextDelivery.progress) : '#eeaa28'

    const openModal = (stage) => setSelectedStage(stage)
    const closeModal = () => setSelectedStage(null)

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center">
                <p className="text-white/70">Cargando progreso...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#0f172a] text-white">

            {/* ==================== HEADER ==================== */}
            <div className="border-b border-white/10 bg-[#112d44]">
                <div className="max-w-5xl mx-auto px-4 md:px-8 py-4">

                    <div className="flex items-start justify-between gap-3">

                        {/* Lado izquierdo: Logo + Título + Botón Volver */}
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                            <img
                                src={logo}
                                alt="Tipstate"
                                className="w-9 h-9 md:w-11 md:h-11 object-contain flex-shrink-0 mt-0.5"
                            />

                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <h1 className="text-[21px] md:text-3xl font-semibold tracking-[-0.5px] truncate">
                                        Tipstate Match
                                    </h1>

                                    {/* Botón Volver (solo desktop) */}
                                    <button
                                        onClick={onGoBack}
                                        className="hidden md:flex items-center gap-1 px-3 py-1 text-xs text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all whitespace-nowrap"
                                    >
                                        ← Volver
                                    </button>
                                </div>

                                <p className="text-xs md:text-sm text-white/60 -mt-0.5">Progress Tracker</p>

                                {/* Botón Volver (móvil) */}
                                <button
                                    onClick={onGoBack}
                                    className="md:hidden flex items-center gap-1.5 mt-1 text-xs text-white/70 active:text-white"
                                >
                                    ← Volver a selección de rol
                                </button>
                            </div>
                        </div>

                        {/* Porcentaje (derecha en móvil y desktop) */}
                        <div className="flex items-baseline gap-1 flex-shrink-0">
                            <span
                                className="text-[38px] md:text-6xl font-bold transition-colors duration-300 leading-none"
                                style={{ color: getProgressColor(totalProgress) }}
                            >
                                {totalProgress}
                            </span>
                            <span className="text-lg md:text-2xl text-white/70">%</span>
                        </div>

                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-8 py-10">

                {/* Próxima Entrega Importante */}
                {nextDelivery && (
                    <div className="mb-10 bg-white/5 border border-[#eeaa28]/30 rounded-3xl p-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-[#eeaa28] text-sm font-medium tracking-wider">PRÓXIMA ENTREGA IMPORTANTE</p>
                                <h3 className="text-2xl font-semibold mt-1">{nextDelivery.name}</h3>
                                <p className="text-white/70 mt-1">{nextDelivery.currentTask || 'Sin actividad activa'}</p>
                            </div>
                            <div className="text-right">
                                <div className="text-5xl font-bold transition-colors duration-300" style={{ color: nextColor }}>
                                    {nextDelivery.progress}%
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Etapas */}
                <div className="space-y-4">
                    {stages.map((stage, index) => {
                        // Buscar el progreso calculado de esta etapa
                        const stageData = stageProgress.find(s => s.id === stage.id)
                        const percentage = stageData ? stageData.percentage : 0
                        const stageColor = getProgressColor(percentage)

                        return (
                            <div
                                key={index}
                                onClick={() => openModal(stage)}
                                className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:border-white/20 transition-all cursor-pointer active:scale-[0.995]
                 opacity-0 animate-[fadeInUp_0.5s_ease_forwards]"
                                style={{ animationDelay: `${index * 70}ms` }}
                            >
                                <div className="flex justify-between items-start mb-5">
                                    <div className="flex-1 pr-8">
                                        <h3 className="text-[21px] font-semibold tracking-tight">{stage.name}</h3>
                                        <p className="text-white/70 mt-1.5 text-[15px]">
                                            {stage.currentTask || "Sin actividad activa"}
                                        </p>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <div
                                            className="text-[42px] font-semibold leading-none transition-colors duration-300"
                                            style={{ color: stageColor }}
                                        >
                                            {percentage}
                                        </div>
                                        <div className="text-xs text-white/50 -mt-1">%</div>
                                    </div>
                                </div>

                                {/* Barra de progreso */}
                                <div className="w-full bg-white/10 rounded-full h-2.5 mb-4 overflow-hidden relative">
                                    <div
                                        className="h-2.5 rounded-full transition-all duration-[1600ms] ease-out relative overflow-hidden"
                                        style={{
                                            width: `${percentage}%`,
                                            backgroundColor: stageColor
                                        }}
                                    >
                                        {/* Shimmer */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-[shimmer_1.6s_infinite]"></div>
                                    </div>
                                </div>

                                {/* Estado */}
                                <span className={`text-xs px-4 py-1 rounded-full font-medium
        ${stage.status === "Completado" ? "bg-emerald-500/20 text-emerald-400" :
                                        stage.status === "En progreso" || stage.status === "Iniciado" ? "bg-[#eeaa28]/20 text-[#eeaa28]" :
                                            "bg-white/10 text-white/60"}`}>
                                    {stage.status}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Modal - Muestra Actividades */}
            {selectedStage && (
                <div
                    className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-6"
                    onClick={closeModal}
                >
                    <div
                        className="bg-[#0f172a] border border-white/10 rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-auto"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="p-8">
                            {/* Header del Modal */}
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-2xl font-semibold pr-8">{selectedStage.name}</h2>
                                    <p className="text-[#eeaa28] mt-1">
                                        {selectedStage.status} • {selectedStage.currentTask || "Sin actividad activa"}
                                    </p>
                                </div>
                                <button
                                    onClick={closeModal}
                                    className="text-white/50 hover:text-white text-3xl leading-none"
                                >
                                    ×
                                </button>
                            </div>

                            {/* Lista de Actividades */}
                            <div className="space-y-4">
                                {selectedStage.activities?.map((activity, index) => {
                                    const completedTasks = activity.tasks?.filter(t => t.completed).length || 0
                                    const totalTasks = activity.tasks?.length || 0
                                    const activityProgress = totalTasks > 0
                                        ? Math.round((completedTasks / totalTasks) * 100)
                                        : 0

                                    return (
                                        <div
                                            key={index}
                                            className="border border-white/10 bg-white/5 rounded-2xl p-5"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-lg text-white mb-1.5">
                                                        {activity.name}
                                                    </h4>
                                                    <p className="text-white/60 text-sm">
                                                        {completedTasks} de {totalTasks} tareas completadas
                                                    </p>
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <div className="text-2xl font-semibold text-white/90">
                                                        {activityProgress}%
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Barra de progreso de la actividad */}
                                            <div className="w-full bg-white/10 rounded-full h-2 mt-3 overflow-hidden">
                                                <div
                                                    className="h-2 rounded-full bg-[#eeaa28] transition-all duration-500"
                                                    style={{ width: `${activityProgress}%` }}
                                                />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            {(!selectedStage.activities || selectedStage.activities.length === 0) && (
                                <p className="text-white/60 text-center py-8">
                                    No hay actividades definidas aún para esta etapa.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AlfredoView