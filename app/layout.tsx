import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { SiteHeader } from '@/components/site-header';
import { WebMcpTools } from '@/components/webmcp-tools';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: { default: 'AidenICV 数字 IC 验证题库', template: '%s · AidenICV' },
  description: 'SystemVerilog、UVM、AXI 高频面试题与数字 IC 验证学习笔记。',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SiteHeader />
        <WebMcpTools />
        {children}
        <footer className="site-footer"><div className="shell footer-inner"><span>© 2026 AidenICV · 为数字 IC 验证学习者整理</span><a href="https://github.com/qingxuanxx/sv_uvm_axi_notes/blob/main/LICENSE" target="_blank" rel="noreferrer">MIT License</a></div></footer>
      </body>
    </html>
  );
}
