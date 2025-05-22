import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isStudentRoute = createRouteMatcher(["/user/(.*)"]);
const isTeacherRoute = createRouteMatcher(["/teacher/(.*)"]);

export default clerkMiddleware(async (auth, req) => {
	const { sessionClaims, userId } = await auth();

	let userRole = (sessionClaims?.metadata as { userType: "student" | "teacher" })?.userType;

	// Если метаданных нет в sessionClaims, получаем через API
	if (!userRole && userId) {
		try {
			const response = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
				headers: {
					Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
					"Content-Type": "application/json",
				},
			});

			if (response.ok) {
				const user = await response.json();
				userRole = user.public_metadata?.userType;
			}
		} catch (error) {
			console.error("Error fetching user metadata:", error);
		}
	}

	// Устанавливаем по умолчанию "student" если роль не найдена
	userRole = userRole || "student";

	if (isStudentRoute(req)) {
		if (userRole !== "student") {
			const url = new URL("/teacher/courses", req.url);
			return NextResponse.redirect(url);
		}
	}

	if (isTeacherRoute(req)) {
		if (userRole !== "teacher") {
			const url = new URL("/user/courses", req.url);
			return NextResponse.redirect(url);
		}
	}
});

export const config = {
	matcher: [
		"/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
		"/(api|trpc)(.*)",
	],
};
