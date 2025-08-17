export type Priority = "low" | "medium" | "high" | "critical";

export interface Task {
	id: number;
	title: string;
	description?: string;
	assignee: string;
	dueDate: Date;
	status: "pending" | "in_progress" | "completed" | "overdue";
	priority: Priority;
	estimatedHours?: number;
}

export interface Milestone {
	id: number;
	title: string;
	description?: string;
	type: string;
	dueDate: Date;
	priority: Priority;
	assignee: string;
	status: "pending" | "in_progress" | "completed" | "overdue" | "review" | "cancelled";
	tasks: Task[];
	estimatedHours?: number;
	actualHours?: number;
	deliverables?: string[];
}

export interface Notification {
	id: number;
	title: string;
	message: string;
	createdAt: Date;
	type: "milestone" | "task";
	isRead: boolean;
}

// Re-export options from constants to keep a single source of truth
export { MILESTONE_TYPES as milestoneTypes, PRIORITY_OPTIONS as priorityOptions, STATUS_OPTIONS as statusOptions, TASK_TAGS as taskTags } from "~/constants/milestone.constants";

export const defaultNotificationDays = {
	milestone: [7, 3, 1],
	task: [3, 1],
};