import { CourseStatus } from "../enums/course.status.enum.js";
import { DifficultyLevel } from "../enums/difficulty.level.enum.js";

export interface Lesson {
	title: string;
	type: string;
	content: Record<string, any>;
}

export interface Module {
	title: string;
	order: number;
	lessons: Lesson[];
}

export interface CourseDetails extends Document {
	course_id: string;
	version_number: number;
	thumbnail_url: string;
	estimated_duration_minutes: number;
	syllabus: Module[];
}

export interface Course {
	title: string;
	description: string;
	creator: string;
	status: CourseStatus;
	versions: CourseDetails[];
	tags: string[];
	difficulty_level: DifficultyLevel;
	accessibility_features: string[];
}
