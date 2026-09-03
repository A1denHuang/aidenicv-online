'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpenText, CircuitBoard, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
const navigation = [{ href: '/', label: '概览' }, { href: '/practice', label: '开始刷题' }, { href: '/library', label: '知识库' }];
export function SiteHeader() { const pathname = usePathname(); const [open, setOpen] = useState(false); return <header className="site-header"><div className="shell header-inner"><Link href="/" className="brand" aria-label="AidenICV 首页"><span className="brand-mark"><CircuitBoard /></span><span><strong>AidenICV</strong><small>数字 IC 验证题库</small></span></Link><nav className="desktop-nav" aria-label="主导航">{navigation.map((item) => <Link key={item.href} href={item.href} className={pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href)) ? 'active' : ''}>{item.label}</Link>)}</nav><div className="header-actions"><a className="source-link" href="https://github.com/qingxuanxx/sv_uvm_axi_notes" target="_blank" rel="noreferrer"><BookOpenText /> 来源仓库</a><Button variant="ghost" size="icon" className="mobile-menu" aria-label={open ? '关闭菜单' : '打开菜单'} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</Button></div></div>{open && <nav className="mobile-nav shell" aria-label="移动端导航">{navigation.map((item) => <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>{item.label}</Link>)}</nav>}</header>; }
