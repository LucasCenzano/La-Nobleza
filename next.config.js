/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // SEGURIDAD: Solo se permite HTTPS. HTTP fue eliminado para evitar
    // imágenes sin cifrar. El wildcard '**' es necesario porque el admin
    // puede cargar URLs de cualquier CDN externo (Cloudinary, ImgBB, etc.).
    // Si en el futuro las imágenes vienen de un único CDN, restringir aquí.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async headers() {
    return [
      {
        // Aplica estos headers a todas las rutas de la aplicación.
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff', // Mitiga el MIME-sniffing
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY', // Mitiga el Clickjacking
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload', // Fuerza HTTPS
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block', // Protección contra ataques XSS
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin', // Controla la información del referrer
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()', // Restringe el acceso a APIs del navegador
          }
        ],
      },
    ];
  },
};

module.exports = nextConfig;
