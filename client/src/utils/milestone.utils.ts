import type { Milestone, Task } from "../types/milestone.types";

// Format date (dd/mm/yyyy) and optional time
export const formatDateTime = (date: Date | string | null, includeTime = false): string => {
    if (!date) return "Chưa xác định";
    const d = new Date(date);

    const day = d.getDate().toString().padStart(2, "0");
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const year = d.getFullYear();

    if (includeTime) {
        const hour = d.getHours().toString().padStart(2, "0");
        const minute = d.getMinutes().toString().padStart(2, "0");
        return `${day}/${month}/${year} ${hour}:${minute}`;
    }

    return `${day}/${month}/${year}`;
};

// Calculate remaining days until due date
export const getDaysUntilDue = (dueDate: Date | string | null): number => {
    if (!dueDate) return 0;
    const d = new Date(dueDate);
    const now = new Date();
    const diffTime = d.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Map status to color
export const getStatusColor = (status: string): string => {
    const statusMap = {
        pending: "#6c757d",
        in_progress: "#007bff",
        review: "#ffc107",
        completed: "#28a745",
        overdue: "#dc3545",
        cancelled: "#6c757d",
    };
    return statusMap[status as keyof typeof statusMap] || "#6c757d";
};

// Calculate progress of a single milestone
export const calculateMilestoneProgress = (milestone: Milestone): number => {
    if (milestone.tasks.length === 0) return 0;
    const completedTasks = milestone.tasks.filter((task) => task.status === "completed").length;
    return Math.round((completedTasks / milestone.tasks.length) * 100);
};

// Calculate total estimated hours across all milestones and tasks
export const getTotalEstimatedHours = (milestones: Milestone[]): number => {
    return milestones.reduce((total, milestone) => {
        const milestoneHours = milestone.estimatedHours || 0;
        const taskHours = milestone.tasks.reduce((taskTotal, task) => taskTotal + (task.estimatedHours || 0), 0);
        return total + milestoneHours + taskHours;
    }, 0);
};

// Calculate overall progress across all tasks in all milestones
export const getOverallProgress = (milestones: Milestone[]): number => {
    if (milestones.length === 0) return 0;
    const totalTasks = milestones.reduce((total, milestone) => total + milestone.tasks.length, 0);
    if (totalTasks === 0) return 0;

    const completedTasks = milestones.reduce(
        (total, milestone) => total + milestone.tasks.filter((task) => task.status === "completed").length,
        0,
    );

    return Math.round((completedTasks / totalTasks) * 100);
};

// Get milestones and tasks with upcoming deadlines within `days`
export const getUpcomingDeadlines = (milestones: Milestone[], days = 7): (Milestone | Task)[] => {
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    const upcomingItems: (Milestone | Task)[] = [];

    const isWithinRange = (inputDate: Date | string | null) => {
        if (!inputDate) return false;
        const d = new Date(inputDate);
        return d >= now && d <= futureDate;
    };

    milestones.forEach((milestone) => {
        if (isWithinRange(milestone.dueDate)) {
            upcomingItems.push(milestone);
        }

        milestone.tasks.forEach((task) => {
            if (isWithinRange(task.dueDate)) {
                upcomingItems.push(task);
            }
        });
    });

    return upcomingItems.sort((a, b) => new Date(a.dueDate as string).getTime() - new Date(b.dueDate as string).getTime());
};
