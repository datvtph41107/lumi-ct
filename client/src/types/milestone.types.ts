export type Priority = "low" | "medium" | "high" | "critical";

export type MilestoneStatus = "pending" | "in_progress" | "review" | "completed" | "overdue" | "cancelled";

export interface Task {
	id: string | number;
	title: string;
	description?: string;
	assignee: string;
	dueDate: Date | string | null;
	status?: "pending" | "in_progress" | "completed" | "cancelled";
	estimatedHours?: number;
	tags?: string[];
	milestoneId?: number | string;
}

export interface Milestone {
	id: number | string;
	title: string;
	description?: string;
	type: string;
	dueDate: Date | string;
	priority: Priority;
	status?: MilestoneStatus;
	assignee: string;
	estimatedHours?: number;
	actualHours?: number;
	deliverables?: string[];
	tasks: Task[];
}

export interface MilestoneFormData {
	title: string;
	description: string;
	type: string;
	dueDate: Date | null;
	priority: Priority;
	assignee: string;
	estimatedHours: number;
	deliverables: string[];
}

export interface TaskFormData {
	title: string;
	description: string;
	assignee: string;
	dueDate: Date | null;
	priority: Priority;
	estimatedHours: number;
	milestoneId: number | string;
	tags: string[];
}