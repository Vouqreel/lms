import Link from "next/link";
import React from "react";

const Footer = () => {
	return (
		<div className="footer">
			<p>&copy; 2025 VazeByte. Все права защищены.</p>
			<div className="footer__links">
				{["О нас", "Политика конфиденциальности", "Лицензирование", "Контакты"].map((item, index) => {
					const urls = ["about", "privacy-policy", "licensing", "contact"];
					return (
						<Link key={item} href={`/${urls[index]}`} className="footer__link" scroll={false}>
							{item}
						</Link>
					);
				})}
			</div>
		</div>
	);
};

export default Footer;
