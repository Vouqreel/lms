import SharedNotificationSettings from "@/components/SharedNotificationSettings";
import React from "react";

const UserSettings = () => {
	return (
		<div className="w-3/5">
			<SharedNotificationSettings
				title="Настройки пользователя"
				subtitle="Управление пользовательскими уведомлениями"
			/>
		</div>
	);
};

export default UserSettings;
