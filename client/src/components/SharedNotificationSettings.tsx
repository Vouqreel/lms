"use client";

import { NotificationSettingsFormData, notificationSettingsSchema } from "@/lib/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUpdateUserMutation } from "@/state/api";
import { useUser } from "@clerk/nextjs";
import React from "react";
import { useForm } from "react-hook-form";
import Header from "./Header";
import { Form } from "@/components/ui/form";
import { CustomFormField } from "./CustomFormField";
import { Button } from "@/components/ui/button";

const SharedNotificationSettings = ({
	title = "Настройки уведомлений",
	subtitle = "Управление настройками уведомлений",
}: SharedNotificationSettingsProps) => {
	const { user } = useUser();
	const [updateUser] = useUpdateUserMutation();

	const currentSettings = (user?.publicMetadata as { settings?: UserSettings })?.settings || {};

	const methods = useForm<NotificationSettingsFormData>({
		resolver: zodResolver(notificationSettingsSchema),
		defaultValues: {
			courseNotifications: currentSettings.courseNotifications || false,
			emailAlerts: currentSettings.emailAlerts || false,
			smsAlerts: currentSettings.smsAlerts || false,
			notificationFrequency: currentSettings.notificationFrequency || "daily",
		},
	});

	const onSubmit = async (data: NotificationSettingsFormData) => {
		if (!user) return;

		const updatedUser = {
			userId: user.id,
			publicMetadata: {
				...user.publicMetadata,
				settings: {
					...currentSettings,
					...data,
				},
			},
		};

		try {
			await updateUser(updatedUser);
		} catch (error) {
			console.error("Failed to update user settings: ", error);
		}
	};

	if (!user) return <div>Войдите в аккаунт для управления настройками</div>;

	return (
		<div className="notification-settings">
			<Header title={title} subtitle={subtitle} />
			<Form {...methods}>
				<form onSubmit={methods.handleSubmit(onSubmit)} className="notification-settings__form">
					<div className="notification-settings__fields">
						<CustomFormField name="courseNotifications" label="Уведомления о курсах" type="switch" />
						<CustomFormField name="emailAlerts" label="Уведомления на почту" type="switch" />
						<CustomFormField name="smsAlerts" label="SMS-уведомления" type="switch" />

						<CustomFormField
							name="notificationFrequency"
							label="Частота уведомлений"
							type="select"
							options={[
								{ value: "immediate", label: "Немедленно" },
								{ value: "daily", label: "Ежедневно" },
								{ value: "weekly", label: "Еженедельно" },
							]}
						/>
					</div>

					<Button type="submit" className="notification-settings__submit">
						Обновить настройки
					</Button>
				</form>
			</Form>
		</div>
	);
};

export default SharedNotificationSettings;
