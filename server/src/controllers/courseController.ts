import { Request, Response } from "express";
import Course from "../models/courseModel";
import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import { getAuth } from "@clerk/express";

const s3 = new AWS.S3();

export const listCourses = async (req: Request, res: Response): Promise<void> => {
	const { category } = req.query;
	try {
		const courses =
			category && category !== "all"
				? await Course.scan("category").eq(category).exec()
				: await Course.scan().exec();
		res.json({ message: "Курсы успешно получены", data: courses });
	} catch (error) {
		res.status(500).json({ message: "Ошибка при получении курсов", error });
	}
};

export const getCourse = async (req: Request, res: Response): Promise<void> => {
	const { courseId } = req.params;
	try {
		const course = await Course.get(courseId);
		if (!course) {
			res.status(404).json({ message: "Курс не найден" });
			return;
		}

		res.json({ message: "Курс успешно получен", data: course });
	} catch (error) {
		res.status(500).json({ message: "Ошибка при получении курса", error });
	}
};

export const createCourse = async (req: Request, res: Response): Promise<void> => {
	try {
		const { teacherId, teacherName } = req.body;

		if (!teacherId || !teacherName) {
			res.status(400).json({ message: "ID преподавателя и имя обязательны" });
			return;
		}

		const newCourse = new Course({
			courseId: uuidv4(),
			teacherId,
			teacherName,
			title: "Untitled Course",
			description: "",
			category: "Uncategorized",
			image: "",
			price: 0,
			level: "Beginner",
			status: "Draft",
			sections: [],
			enrollments: [],
		});
		await newCourse.save();

		res.json({ message: "Курс успешно создан", data: newCourse });
	} catch (error) {
		res.status(500).json({ message: "Ошибка при создании курса", error });
	}
};

export const updateCourse = async (req: Request, res: Response): Promise<void> => {
	const { courseId } = req.params;
	const updateData = { ...req.body };
	const { userId } = getAuth(req);
	
	console.log('Updating course:', courseId);
	console.log('Update data received:', updateData);

	try {
		const course = await Course.get(courseId);
		if (!course) {
			res.status(404).json({ message: "Курс не найден" });
			return;
		}

		if (course.teacherId !== userId) {
			res.status(403).json({ message: "Нет прав для обновления этого курса" });
			return;
		}

		if (updateData.price) {
			const price = parseInt(updateData.price);
			if (isNaN(price)) {
				res.status(400).json({
					message: "Неверный формат цены",
					error: "Цена должна быть действительным числом",
				});
				return;
			}
			updateData.price = price * 100;
		}

		if (updateData.sections) {
			const sectionsData =
				typeof updateData.sections === "string" ? JSON.parse(updateData.sections) : updateData.sections;

			updateData.sections = sectionsData.map((section: any) => ({
				...section,
				sectionId: section.sectionId || uuidv4(),
				chapters: section.chapters.map((chapter: any) => ({
					...chapter,
					chapterId: chapter.chapterId || uuidv4(),
				})),
			}));
		}

		Object.assign(course, updateData);
		console.log('Course before save:', {
			id: course.courseId,
			title: course.title,
			image: course.image
		});
		
		await course.save();
		console.log('Course saved successfully with image:', course.image);

		res.json({ message: "Курс успешно обновлен", data: course });
	} catch (error) {
		res.status(500).json({ message: "Ошибка при обновлении курса", error });
	}
};

export const deleteCourse = async (req: Request, res: Response): Promise<void> => {
	const { courseId } = req.params;
	const { userId } = getAuth(req);

	try {
		const course = await Course.get(courseId);
		if (!course) {
			res.status(404).json({ message: "Курс не найден" });
			return;
		}

		if (course.teacherId !== userId) {
			res.status(403).json({ message: "Нет прав для удаления этого курса" });
			return;
		}

		await Course.delete(courseId);

		res.json({ message: "Курс успешно удален", data: course });
	} catch (error) {
		res.status(500).json({ message: "Ошибка при удалении курса", error });
	}
};

export const getUploadVideoUrl = async (req: Request, res: Response): Promise<void> => {
	const { fileName, fileType } = req.body;
	console.log('Upload request received:', { fileName, fileType });

	if (!fileName || !fileType) {
		res.status(400).json({ message: "Имя файла и тип обязательны" });
		return;
	}

	try {
		const uniqueId = uuidv4();
		
		// Определяем тип файла и папку
		let s3Key: string;
		let cdnPath: string;
		
		if (fileType.startsWith('image/')) {
			console.log('Detected image file type');
			// Для изображений
			s3Key = `course-images/${uniqueId}/${fileName}`;
			cdnPath = `course-images/${uniqueId}/${fileName}`;
		} else if (fileType === 'video/mp4') {
			console.log('Detected video file type');
			// Для видео
			s3Key = `videos/${uniqueId}/${fileName}`;
			cdnPath = `videos/${uniqueId}/${fileName}`;
		} else {
			console.log('Unsupported file type:', fileType);
			res.status(400).json({ message: "Поддерживаются только видео (MP4) и изображения" });
			return;
		}

		console.log('S3 Key:', s3Key);
		console.log('CDN Path:', cdnPath);

		const s3Params = {
			Bucket: process.env.S3_BUCKET_NAME || "",
			Key: s3Key,
			Expires: 60,
			ContentType: fileType,
		};

		const uploadUrl = s3.getSignedUrl("putObject", s3Params);
		const finalUrl = `${process.env.CLOUDFRONT_DOMAIN}/${cdnPath}`;

		// Возвращаем разные поля в зависимости от типа файла
		if (fileType.startsWith('image/')) {
			const response = {
				message: "URL для загрузки изображения успешно сгенерирован",
				data: { uploadUrl, imageUrl: finalUrl },
			};
			console.log('Returning image response:', response);
			res.json(response);
		} else {
			const response = {
				message: "URL для загрузки успешно сгенерирован",
				data: { uploadUrl, videoUrl: finalUrl },
			};
			console.log('Returning video response:', response);
			res.json(response);
		}
	} catch (error) {
		res.status(500).json({ message: "Ошибка при генерации URL для загрузки", error });
	}
};
