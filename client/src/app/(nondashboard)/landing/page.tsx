"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useCarousel } from "@/hooks/useCarousel";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetCoursesQuery } from "@/state/api";
import { useRouter } from "next/navigation";
import CourseCardSearch from "@/components/CourseCardSearch";
import { useUser } from "@clerk/nextjs";
import emailjs from "@emailjs/browser";
import {
	Mail,
	Phone,
	MapPin,
	BookOpen,
	Users,
	Award,
	Star,
	Check,
	Sparkles,
	TrendingUp,
	Clock,
	Target,
	Zap,
	ArrowRight,
	Code,
	Lightbulb,
	Cpu,
	Rocket,
	Heart,
	Shield,
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const LoadingSkeleton = () => {
	return (
		<div className="landing-skeleton">
			<div className="landing-skeleton__hero">
				<div className="landing-skeleton__hero-content">
					<Skeleton className="landing-skeleton__title" />
					<Skeleton className="landing-skeleton__subtitle" />
					<Skeleton className="landing-skeleton__subtitle-secondary" />
					<Skeleton className="landing-skeleton__button" />
				</div>
			</div>

			<div className="landing-skeleton__featured">
				<Skeleton className="landing-skeleton__featured-title" />
				<Skeleton className="landing-skeleton__featured-description" />

				<div className="landing-skeleton__tags">
					{[1, 2, 3, 4, 5].map((_, index) => (
						<Skeleton key={index} className="landing-skeleton__tag" />
					))}
				</div>

				<div className="landing-skeleton__courses">
					{[1, 2, 3, 4].map((_, index) => (
						<Skeleton key={index} className="landing-skeleton__course-card" />
					))}
				</div>
			</div>
		</div>
	);
};

// Advanced Typewriter effect component with multiple phrases and cursor
const AdvancedTypewriter = ({
	phrases,
	speed = 100,
	deleteSpeed = 50,
	delayBetweenPhrases = 2000,
	initialDelay = 1000,
}: {
	phrases: string[];
	speed?: number;
	deleteSpeed?: number;
	delayBetweenPhrases?: number;
	initialDelay?: number;
}) => {
	const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
	const [currentText, setCurrentText] = useState("");
	const [isDeleting, setIsDeleting] = useState(false);
	const [showCursor, setShowCursor] = useState(true);
	const [hasStarted, setHasStarted] = useState(false);

	useEffect(() => {
		// Initial delay before starting typewriter
		const initialTimeout = setTimeout(() => {
			setHasStarted(true);
		}, initialDelay);

		return () => clearTimeout(initialTimeout);
	}, [initialDelay]);

	useEffect(() => {
		if (!hasStarted) return;

		const currentPhrase = phrases[currentPhraseIndex];

		let timeout: NodeJS.Timeout;

		if (!isDeleting && currentText === currentPhrase) {
			// Pause before starting to delete
			timeout = setTimeout(() => setIsDeleting(true), delayBetweenPhrases);
		} else if (isDeleting && currentText === "") {
			// Move to next phrase
			setIsDeleting(false);
			setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
		} else {
			// Typing or deleting
			timeout = setTimeout(
				() => {
					setCurrentText((prev) => {
						if (isDeleting) {
							return currentPhrase.substring(0, prev.length - 1);
						} else {
							return currentPhrase.substring(0, prev.length + 1);
						}
					});
				},
				isDeleting ? deleteSpeed : speed
			);
		}

		return () => clearTimeout(timeout);
	}, [currentText, isDeleting, currentPhraseIndex, phrases, speed, deleteSpeed, delayBetweenPhrases, hasStarted]);

	// Cursor blinking effect
	useEffect(() => {
		const cursorInterval = setInterval(() => {
			setShowCursor((prev) => !prev);
		}, 500);

		return () => clearInterval(cursorInterval);
	}, []);

	return (
		<span>
			{currentText}
			<span className={`${showCursor ? "opacity-100" : "opacity-0"} transition-opacity duration-100`}>|</span>
		</span>
	);
};

const Landing = () => {
	const router = useRouter();
	const { data: courses, isLoading, isError } = useGetCoursesQuery({});
	const [contactForm, setContactForm] = useState({
		name: "",
		email: "",
		message: "",
	});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [buttonText, setButtonText] = useState("Отправить сообщение");
	const [buttonClass, setButtonClass] = useState("");

	const handleCourseClick = (courseId: string) => {
		router.push(`/search?id=${courseId}`, {
			scroll: false,
		});
	};

	const handleContactSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			// Проверяем наличие переменных окружения
			const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
			const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
			const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

			if (!serviceId || !templateId || !publicKey) {
				console.error("EmailJS настройки не найдены");
				console.log("Service ID:", serviceId);
				console.log("Template ID:", templateId);
				console.log("Public Key:", publicKey);
				setButtonText("Ошибка конфигурации");
				setButtonClass("error");
				setTimeout(() => {
					setButtonText("Отправить сообщение");
					setButtonClass("");
				}, 3000);
				return;
			}

			const templateParams = {
				from_name: contactForm.name,
				from_email: contactForm.email,
				message: contactForm.message,
				time: new Date().toLocaleString("ru-RU", {
					timeZone: "Asia/Tashkent",
					year: "numeric",
					month: "long",
					day: "numeric",
					hour: "2-digit",
					minute: "2-digit",
				}),
				to_email: "vazebyte@gmail.com",
			};

			console.log("📤 Отправляем через EmailJS:", {
				serviceId,
				templateId,
				templateParams,
			});

			// Отправляем через EmailJS
			const result = await emailjs.send(serviceId, templateId, templateParams, publicKey);

			console.log("✅ Письмо отправлено через EmailJS:", result);

			// Меняем кнопку на зеленую с успешным сообщением
			setButtonText("Успешно отправлено 🎉");
			setButtonClass("success");
			setContactForm({ name: "", email: "", message: "" });

			// Возвращаем кнопку в исходное состояние через 3 секунды
			setTimeout(() => {
				setButtonText("Отправить сообщение");
				setButtonClass("");
			}, 3000);
		} catch (error) {
			console.error("❌ Ошибка отправки письма через EmailJS:", error);
			setButtonText("Ошибка отправки");
			setButtonClass("error");

			// Возвращаем кнопку в исходное состояние через 3 секунды
			setTimeout(() => {
				setButtonText("Отправить сообщение");
				setButtonClass("");
			}, 3000);
		} finally {
			setIsSubmitting(false);
		}
	};

	const faqData = [
		{
			question: "Как начать обучение на платформе?",
			answer:
				"Зарегистрируйтесь на платформе, выберите интересующий курс и начните обучение. Большинство курсов доступны сразу после регистрации.",
		},
		{
			question: "Какова стоимость курсов?",
			answer:
				"Стоимость варьируется в зависимости от курса. У нас есть как бесплатные курсы, так и платные. Цены указаны на странице каждого курса.",
		},
		{
			question: "Получу ли я сертификат после завершения курса?",
			answer:
				"Да, после успешного завершения курса вы получите сертификат о прохождении, который можно добавить в ваше портфолио или резюме.",
		},
		{
			question: "Как долго у меня есть доступ к материалам курса?",
			answer:
				"После покупки курса у вас есть пожизненный доступ к материалам. Вы можете проходить курс в удобном для вас темпе.",
		},
		{
			question: "Есть ли техническая поддержка?",
			answer:
				"Да, наша команда поддержки готова помочь вам 24/7. Вы можете связаться с нами через форму обратной связи или чат.",
		},
		{
			question: "Можно ли получить возврат средств?",
			answer:
				"Да, мы предоставляем возврат средств в течение 30 дней с момента покупки, если вы не удовлетворены качеством курса.",
		},
		{
			question: "Подходят ли курсы для начинающих?",
			answer:
				"Конечно! У нас есть курсы для всех уровней подготовки - от полных новичков до продвинутых специалистов.",
		},
		{
			question: "Как проходит процесс обучения?",
			answer:
				"Обучение проходит в формате видеоуроков, практических заданий и тестов. Вы можете учиться в своем темпе и возвращаться к материалам в любое время.",
		},
	];

	const benefits = [
		{
			icon: <BookOpen className="w-12 h-12 text-blue-600" />,
			title: "Качественное образование",
			description: "Курсы разработаны экспертами индустрии с многолетним опытом",
		},
		{
			icon: <Users className="w-12 h-12 text-green-600" />,
			title: "Сообщество",
			description: "Присоединяйтесь к сообществу единомышленников и обменивайтесь опытом",
		},
		{
			icon: <Award className="w-12 h-12 text-purple-600" />,
			title: "Сертификация",
			description: "Получайте признанные сертификаты для карьерного роста",
		},
	];

	const stats = [
		{ number: "10,000+", label: "Студентов", icon: <Users className="w-8 h-8" /> },
		{ number: "150+", label: "Курсов", icon: <BookOpen className="w-8 h-8" /> },
		{ number: "50+", label: "Экспертов", icon: <Award className="w-8 h-8" /> },
		{ number: "95%", label: "Довольных клиентов", icon: <Star className="w-8 h-8" /> },
	];

	const features = [
		{ icon: <Clock className="w-6 h-6" />, text: "Гибкий график обучения" },
		{ icon: <Target className="w-6 h-6" />, text: "Персональные цели" },
		{ icon: <Zap className="w-6 h-6" />, text: "Быстрые результаты" },
		{ icon: <TrendingUp className="w-6 h-6" />, text: "Карьерный рост" },
	];

	// Floating icons for hero section
	const floatingIcons = [
		{ icon: <Code className="w-8 h-8" />, color: "text-blue-500", delay: 0 },
		{ icon: <Lightbulb className="w-10 h-10" />, color: "text-yellow-500", delay: 0.5 },
		{ icon: <Cpu className="w-7 h-7" />, color: "text-purple-500", delay: 1 },
		{ icon: <Rocket className="w-9 h-9" />, color: "text-red-500", delay: 1.5 },
		{ icon: <Heart className="w-6 h-6" />, color: "text-pink-500", delay: 2 },
		{ icon: <Shield className="w-8 h-8" />, color: "text-green-500", delay: 2.5 },
		{ icon: <Sparkles className="w-7 h-7" />, color: "text-indigo-500", delay: 3 },
		{ icon: <Award className="w-9 h-9" />, color: "text-orange-500", delay: 3.5 },
	];

	// Phrases for typewriter effect
	const typewriterPhrases = [
		"огнём в глазах",
		"реальными кейсами",
		"движением вперёд",
		"лидерами отрасли",
		"желанием расти",
	];

	if (isLoading) return <LoadingSkeleton />;

	return (
		<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="landing">
			{/* Hero Section - White with patterns */}
			<motion.div
				initial={{ y: 20, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ duration: 0.5 }}
				className="landing__hero"
			>
				{/* Background pattern */}
				<div className="landing__hero-pattern"></div>

				{/* Floating icons */}
				<div className="landing__floating-icons">
					{floatingIcons.map((item, index) => (
						<motion.div
							key={index}
							initial={{ opacity: 0, scale: 0 }}
							animate={{
								opacity: 0.7,
								scale: 1,
								y: [0, -20, 0],
								rotate: [0, 10, -10, 0],
							}}
							transition={{
								opacity: { delay: item.delay, duration: 0.5 },
								scale: { delay: item.delay, duration: 0.5 },
								y: {
									delay: item.delay + 1,
									duration: 3,
									repeat: Infinity,
									ease: "easeInOut",
								},
								rotate: {
									delay: item.delay + 1,
									duration: 4,
									repeat: Infinity,
									ease: "easeInOut",
								},
							}}
							className={`landing__floating-icon landing__floating-icon--${index + 1} ${item.color}`}
						>
							{item.icon}
						</motion.div>
					))}
				</div>

				<div className="landing__hero-content">
					<motion.h1
						initial={{ y: 30, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ duration: 0.6, delay: 0.2 }}
						className="landing__title"
					>
						Изучайте новые навыки с{" "}
						<span className="landing__title-highlight">
							<AdvancedTypewriter
								phrases={typewriterPhrases}
								speed={80}
								deleteSpeed={40}
								delayBetweenPhrases={3000}
								initialDelay={1000}
							/>
						</span>
					</motion.h1>

					<motion.p
						initial={{ y: 30, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ duration: 0.6, delay: 2 }}
						className="landing__description"
					>
						Откройте для себя мир знаний с нашими профессиональными курсами. Учитесь в удобном темпе, получайте
						сертификаты и развивайте карьеру.
					</motion.p>

					{/* Feature badges */}
					<motion.div
						initial={{ y: 30, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ duration: 0.6, delay: 2.5 }}
						className="landing__features"
					>
						{features.map((feature, index) => (
							<motion.div
								key={index}
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								transition={{ duration: 0.3, delay: 3 + index * 0.1 }}
								className="landing__feature"
							>
								{feature.icon}
								<span>{feature.text}</span>
							</motion.div>
						))}
					</motion.div>

					<motion.div
						initial={{ y: 30, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ duration: 0.6, delay: 3.5 }}
						className="landing__cta"
					>
						<Link href="/search" scroll={false}>
							<div className="landing__cta-button landing__cta-button--primary">
								Начать обучение
								<ArrowRight className="w-5 h-5 ml-2" />
							</div>
						</Link>
						<Link href="#about" scroll={false}>
							<div className="landing__cta-button landing__cta-button--secondary">Узнать больше</div>
						</Link>
					</motion.div>
				</div>
			</motion.div>

			{/* Stats Section */}
			<motion.div
				initial={{ y: 20, opacity: 0 }}
				whileInView={{ y: 0, opacity: 1 }}
				transition={{ duration: 0.5 }}
				viewport={{ amount: 0.3, once: true }}
				className="landing__stats"
			>
				<div className="landing__stats-grid">
					{stats.map((stat, index) => (
						<motion.div
							key={index}
							initial={{ y: 20, opacity: 0 }}
							whileInView={{ y: 0, opacity: 1 }}
							transition={{ duration: 0.5, delay: index * 0.1 }}
							viewport={{ amount: 0.3, once: true }}
							className="landing__stat"
						>
							<div className="landing__stat-icon">{stat.icon}</div>
							<div className="landing__stat-number">{stat.number}</div>
							<div className="landing__stat-label">{stat.label}</div>
						</motion.div>
					))}
				</div>
			</motion.div>

			{/* Why Learn Section */}
			<motion.div
				id="about"
				initial={{ y: 20, opacity: 0 }}
				whileInView={{ y: 0, opacity: 1 }}
				transition={{ duration: 0.5 }}
				viewport={{ amount: 0.3, once: true }}
				className="landing__benefits"
			>
				<h2 className="landing__section-title">Почему стоит учиться с нами?</h2>
				<p className="landing__section-description">
					Мы предлагаем не просто курсы, а полноценную экосистему для вашего профессионального развития
				</p>

				<div className="landing__benefits-grid">
					{benefits.map((benefit, index) => (
						<motion.div
							key={index}
							initial={{ y: 50, opacity: 0 }}
							whileInView={{ y: 0, opacity: 1 }}
							transition={{ duration: 0.5, delay: index * 0.2 }}
							viewport={{ amount: 0.3, once: true }}
							className="landing__benefit"
						>
							<div className="landing__benefit-icon">{benefit.icon}</div>
							<h3 className="landing__benefit-title">{benefit.title}</h3>
							<p className="landing__benefit-description">{benefit.description}</p>
						</motion.div>
					))}
				</div>

				<div className="landing__learning-advantages">
					<h3 className="landing__advantages-title">Преимущества онлайн-обучения:</h3>
					<div className="landing__advantages-list">
						{[
							"Гибкий график - учитесь когда удобно",
							"Доступ к материалам 24/7",
							"Индивидуальный темп обучения",
							"Экономия времени на дорогу",
							"Возможность пересматривать сложные темы",
							"Современные интерактивные материалы",
						].map((advantage, index) => (
							<motion.div
								key={index}
								initial={{ x: -20, opacity: 0 }}
								whileInView={{ x: 0, opacity: 1 }}
								transition={{ duration: 0.3, delay: index * 0.1 }}
								viewport={{ amount: 0.3, once: true }}
								className="landing__advantage-item"
							>
								<Check className="w-5 h-5 text-green-500" />
								<span>{advantage}</span>
							</motion.div>
						))}
					</div>
				</div>
			</motion.div>

			{/* Featured Courses */}
			<motion.div
				initial={{ y: 20, opacity: 0 }}
				whileInView={{ y: 0, opacity: 1 }}
				transition={{ duration: 0.5 }}
				viewport={{ amount: 0.3, once: true }}
				className="landing__featured"
			>
				<h2 className="landing__section-title">Популярные курсы</h2>
				<p className="landing__section-description">
					От начинающего до продвинутого уровня, во всех отраслях, у нас есть подходящие курсы именно для вас
				</p>

				<div className="landing__tags">
					{[
						"веб-разработка",
						"backend-разработка",
						"frontend-разработка",
						"языки программирования",
						"UI/UX-дизайн",
						"графический дизайн",
						"цифровой маркетинг",
						"анализ данных",
						"создание контента",
						"финансовая грамотность",
						"предпринимательство",
						"Soft Skills",
						"английский язык",
						"публичные выступления",
						"управление проектами",
						"создание мобильных приложений",
						"машинное обучение",
						"работа с нейросетями",
						"копирайтинг",
						"разработка игр",
					].map((tag, index) => (
						<span key={index} className="landing__tag">
							{tag}
						</span>
					))}
				</div>

				<div className="landing__courses">
					{courses &&
						courses.slice(0, 8).map((course, index) => (
							<motion.div
								key={course.courseId}
								initial={{ y: 50, opacity: 0 }}
								whileInView={{ y: 0, opacity: 1 }}
								transition={{ duration: 0.5, delay: index * 0.2 }}
								viewport={{ amount: 0.4 }}
							>
								<CourseCardSearch course={course} onClick={() => handleCourseClick(course.courseId)} />
							</motion.div>
						))}
				</div>
			</motion.div>

			{/* FAQ Section with improved styling */}
			<motion.div
				initial={{ y: 20, opacity: 0 }}
				whileInView={{ y: 0, opacity: 1 }}
				transition={{ duration: 0.5 }}
				viewport={{ amount: 0.3, once: true }}
				className="landing__faq"
			>
				<h2 className="landing__section-title">Часто задаваемые вопросы</h2>
				<p className="landing__section-description">Найдите ответы на самые популярные вопросы о нашей платформе</p>

				<div className="landing__faq-container">
					<Accordion type="single" collapsible className="landing__faq-accordion">
						{faqData.map((faq, index) => (
							<AccordionItem key={index} value={`item-${index}`} className="landing__faq-item">
								<AccordionTrigger className="landing__faq-question">{faq.question}</AccordionTrigger>
								<AccordionContent className="landing__faq-answer">{faq.answer}</AccordionContent>
							</AccordionItem>
						))}
					</Accordion>
				</div>
			</motion.div>

			{/* Contact Form */}
			<motion.div
				initial={{ y: 20, opacity: 0 }}
				whileInView={{ y: 0, opacity: 1 }}
				transition={{ duration: 0.5 }}
				viewport={{ amount: 0.3, once: true }}
				className="landing__contact"
			>
				<h2 className="landing__section-title">Свяжитесь с нами</h2>
				<p className="landing__section-description">Есть вопросы? Мы всегда готовы помочь!</p>

				<div className="landing__contact-content">
					<div className="landing__contact-info">
						<h3 className="landing__contact-info-title">Контактная информация</h3>
						<div className="landing__contact-items">
							<div className="landing__contact-item">
								<Mail className="w-5 h-5 text-blue-600" />
								<span>vazebyte@gmail.com</span>
							</div>
							<div className="landing__contact-item">
								<Phone className="w-5 h-5 text-blue-600" />
								<span>+998 90 123 45 67</span>
							</div>
							<div className="landing__contact-item">
								<MapPin className="w-5 h-5 text-blue-600" />
								<span>Ташкент, Узбекистан</span>
							</div>
						</div>

						<div className="landing__contact-hours">
							<h4 className="landing__contact-hours-title">Часы работы поддержки:</h4>
							<p>Понедельник - Пятница: 9:00 - 18:00</p>
							<p>Суббота - Воскресенье: 10:00 - 16:00</p>
						</div>
					</div>

					<form onSubmit={handleContactSubmit} className="landing__contact-form">
						<div className="landing__form-group">
							<label htmlFor="name" className="landing__form-label">
								Имя
							</label>
							<input
								type="text"
								id="name"
								value={contactForm.name}
								onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
								className="landing__form-input"
								required
							/>
						</div>
						<div className="landing__form-group">
							<label htmlFor="email" className="landing__form-label">
								Email
							</label>
							<input
								type="email"
								id="email"
								value={contactForm.email}
								onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
								className="landing__form-input"
								required
							/>
						</div>
						<div className="landing__form-group">
							<label htmlFor="message" className="landing__form-label">
								Сообщение
							</label>
							<textarea
								id="message"
								value={contactForm.message}
								onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
								className="landing__form-textarea"
								rows={4}
								required
							></textarea>
						</div>
						<button
							type="submit"
							className={`landing__form-submit ${buttonClass ? `landing__form-submit--${buttonClass}` : ""}`}
							disabled={isSubmitting}
						>
							{isSubmitting ? "Отправляется..." : buttonText}
						</button>
					</form>
				</div>
			</motion.div>
		</motion.div>
	);
};

export default Landing;
