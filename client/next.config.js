/** @type {import('next').NextConfig}  */
const nextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "images.pexels.com",
				port: "",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "img.youtube.com",
				port: "",
				pathname: "/vi/**",
			},
			{
				protocol: "https",
				hostname: "d1gjlxe11kace6.cloudfront.net",
				port: "",
				pathname: "/**",
			},
		],
	},
};

module.exports = nextConfig;
