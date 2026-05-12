import type { Metadata } from 'next'
import './globals.css'
import SplashScreen from './components/SplashScreen'

export const metadata: Metadata = {
  title: 'MenuMind — Optimisez votre menu en 30 secondes',
  description: 'Intelligence artificielle pour restaurateurs : générez un menu de la semaine adapté à votre cuisine, la météo et votre budget.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;1,9..144,300;1,9..144,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <SplashScreen />
        {children}
      </body>
    </html>
  )
}
