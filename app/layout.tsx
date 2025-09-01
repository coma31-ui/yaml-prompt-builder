import './globals.css'
export const metadata = { title: 'YAML Prompt Builder (jp→en)', description: 'Generate English YAML prompts from Japanese UI' }
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="ja"><body>{children}</body></html>);
}
