import Stripe from "stripe";
import dotenv from "dotenv";
import { Request, Response } from "express";
import Course from "../models/courseModel";
import Transaction from "../models/transactionModel";
import UserCourseProgress from "../models/userCourseProgressModel";

dotenv.config();

if (!process.env.STRIPE_SECRET_KEY) {
	throw new Error("STRIPE_SECRET_KEY обязателен, но не найден в переменных окружения");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const listTransactions = async (req: Request, res: Response): Promise<void> => {
	const { userId } = req.query;

	try {
		const transactions = userId
			? await Transaction.query("userId").eq(userId).exec()
			: await Transaction.scan().exec();

		res.json({
			message: "Транзакции успешно получены",
			data: transactions,
		});
	} catch (error) {
		res.status(500).json({ message: "Ошибка при получении транзакций", error });
	}
};

export const createStripePaymentIntent = async (req: Request, res: Response): Promise<void> => {
	let { amount } = req.body;

	if (!amount || amount <= 0) {
		amount = 50;
	}

	try {
		const paymentIntent = await stripe.paymentIntents.create({
			amount,
			currency: "usd",
			automatic_payment_methods: {
				enabled: true,
				allow_redirects: "never",
			},
		});

		res.json({
			message: "Платежное намерение успешно создано",
			data: {
				clientSecret: paymentIntent.client_secret,
			},
		});
	} catch (error) {
		res.status(500).json({ message: "Ошибка при создании платежного намерения Stripe", error });
	}
};

export const createTransaction = async (req: Request, res: Response): Promise<void> => {
	const { userId, courseId, transactionId, amount, paymentProvider } = req.body;

	try {
		// 1. получить информацию о курсе
		const course = await Course.get(courseId);

		// 2. создать запись транзакции
		const newTransaction = new Transaction({
			dateTime: new Date().toISOString(),
			userId,
			courseId,
			transactionId,
			amount,
			paymentProvider,
		});
		await newTransaction.save();

		// 3. создать начальный прогресс курса
		const initialProgress = new UserCourseProgress({
			userId,
			courseId,
			enrollmentDate: new Date().toISOString(),
			overallProgress: 0,
			sections: course.sections.map((section: any) => ({
				sectionId: section.sectionId,
				chapters: section.chapters.map((chapter: any) => ({
					chapterId: chapter.chapterId,
					completed: false,
				})),
			})),
			lastAccessedTimestamp: new Date().toISOString(),
		});
		await initialProgress.save();

		// 4. добавить регистрацию к соответствующему курсу
		await Course.update(
			{ courseId },
			{
				$ADD: {
					enrollments: [{ userId }],
				},
			}
		);

		res.json({
			message: "Курс успешно приобретен",
			data: {
				transaction: newTransaction,
				courseProgress: initialProgress,
			},
		});
	} catch (error) {
		res.status(500).json({ message: "Ошибка при создании транзакции и регистрации", error });
	}
};
