import Link from 'next/link';
export default function NotFound() { return <main className="shell practice-page"><div className="practice-empty"><strong className="error-code">404</strong><h1>没有找到这个页面</h1><p>内容可能已更名或移除，请返回知识库继续浏览。</p><Link className="primary-cta" href="/library">返回知识库</Link></div></main>; }
