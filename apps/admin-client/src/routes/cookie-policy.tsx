import { createFileRoute } from '@tanstack/react-router';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import cookiePolicy from '../assets/docs/cookie-policy.md?raw';
import { MainPageLayout } from '@/components/layout/main-page-layout';

export const Route = createFileRoute('/cookie-policy')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <MainPageLayout title="Cookie Policy">
      <ReactMarkdown children={cookiePolicy} remarkPlugins={[remarkGfm]} />
    </MainPageLayout>
  );
}