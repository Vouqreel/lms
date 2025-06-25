"use client";

import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Bell, BookOpen } from "lucide-react";
import Link from "next/link";
import React from "react";

const NonDashboardNavbar = () => {
	const { user } = useUser();
	const userRole = user?.publicMetadata?.userType as "student" | "teacher";

	console.log("user?.publicMetadata?.userType:", user?.publicMetadata?.userType);

	return (
		<nav className="nondashboard-navbar">
			<div className="nondashboard-navbar__container">
				<div className="nondashboard-navbar__search">
					<Link href="/" className="nondashboard-navbar__brand" scroll={false}>
						ВейзЛаб
					</Link>
					<div className="flex items-center gap-4">
						<div className="relative group">
							<Link href="/search" className="nondashboard-navbar__search-input" scroll={false}>
								<span className="hidden sm:inline">Поиск курсов</span>
								<span className="sm:hidden">Искать</span>
							</Link>
							<BookOpen className="nondashboard-navbar__search-icon" size={18} />
						</div>
					</div>
				</div>
				<div className="nondashboard-navbar__actions">
					<SignedIn>
						<UserButton
							appearance={{
								baseTheme: dark,
								elements: {
									userButtonOuterIdentifier: "text-customgreys-dirtyGrey",
									userButtonBox: "scale-90 sm:scale-100",
								},
							}}
							showName={true}
							userProfileMode="navigation"
							userProfileUrl={userRole === "teacher" ? "/teacher/profile" : "/user/profile"}
						/>
					</SignedIn>
					<SignedOut>
						<Link href="/signin" className="nondashboard-navbar__auth-button--login" scroll={false}>
							Вход
						</Link>
						<Link href="/signup" className="nondashboard-navbar__auth-button--signup" scroll={false}>
							Регистрация
						</Link>
					</SignedOut>
				</div>
			</div>
		</nav>
	);
};

export default NonDashboardNavbar;
