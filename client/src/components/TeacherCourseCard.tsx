import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Pencil, Trash2 } from "lucide-react";

const TeacherCourseCard = ({ course, onEdit, onDelete, isOwner }: TeacherCourseCardProps) => {
	// Функция для перевода статуса курса
	const getStatusText = (status: string) => {
		switch (status) {
			case "Published":
				return "Опубликован";
			case "Draft":
				return "Черновик";
			default:
				return status;
		}
	};

	return (
		<Card className="course-card-teacher group">
			<CardHeader className="course-card-teacher__header">
				<Image
					src={course.image || "/placeholder.png"}
					alt={course.title}
					width={370}
					height={150}
					className="course-card-teacher__image"
					priority
				/>
			</CardHeader>

			<CardContent className="course-card-teacher__content">
				<div className="flex flex-col">
					<CardTitle className="course-card-teacher__title">{course.title}</CardTitle>

					<CardDescription className="course-card-teacher__category">{course.category}</CardDescription>

					<p className="text-sm mb-2">
						Статус:{" "}
						<span
							className={cn(
								"font-semibold px-2 py-1 rounded",
								course.status === "Published" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
							)}
						>
							{getStatusText(course.status)}
						</span>
					</p>
					{course.enrollments && (
						<p className="ml-1 mt-1 inline-block text-secondary bg-secondary/10 text-sm font-normal">
							<span className="font-bold text-white-100">Студентов: {course.enrollments.length}</span>
						</p>
					)}
				</div>

				<div className="w-full xl:flex space-y-2 xl:space-y-0 gap-2 mt-3">
					{isOwner ? (
						<>
							<div>
								<Button className="course-card-teacher__edit-button" onClick={() => onEdit(course)}>
									<Pencil className="w-4 h-4 mr-2" />
									Редактировать
								</Button>
							</div>
							<div>
								<Button className="course-card-teacher__delete-button" onClick={() => onDelete(course)}>
									<Trash2 className="w-4 h-4 mr-2" />
									Удалить
								</Button>
							</div>
						</>
					) : (
						<p className="text-sm text-gray-500 italic">Только просмотр</p>
					)}
				</div>
			</CardContent>
		</Card>
	);
};

export default TeacherCourseCard;
