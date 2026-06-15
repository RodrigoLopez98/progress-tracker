/**
 * Calcula el progreso de cada etapa y el progreso general del proyecto.
 * @param {Array} stages - Array de etapas con activities y tasks
 * @returns {Object} - { stageProgress, overallProgress }
 */
export const calculateProgress = (stages) => {
    if (!stages || stages.length === 0) {
        return { stageProgress: [], overallProgress: 0 };
    }

    let totalTasks = 0;
    let completedTasks = 0;
    const stageProgress = [];

    stages.forEach((stage) => {
        let stageTotal = 0;
        let stageCompleted = 0;

        stage.activities?.forEach((activity) => {
            stageTotal += activity.tasks?.length || 0;
            stageCompleted += activity.tasks?.filter(task => task.completed).length || 0;
        });

        const percentage = stageTotal > 0
            ? Math.round((stageCompleted / stageTotal) * 100)
            : 0;

        stageProgress.push({
            id: stage.id,
            name: stage.name,
            percentage,
            completedTasks: stageCompleted,
            totalTasks: stageTotal
        });

        totalTasks += stageTotal;
        completedTasks += stageCompleted;
    });

    const overallProgress = totalTasks > 0
        ? Math.round((completedTasks / totalTasks) * 100)
        : 0;

    return {
        stageProgress,
        overallProgress
    };
};