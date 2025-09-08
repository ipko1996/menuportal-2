import { createFileRoute } from '@tanstack/react-router';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import privacyPolicy from '../assets/docs/privacy-policy.md?raw';
import { MainPageLayout } from '@/components/layout/main-page-layout';


export const Route = createFileRoute('/privacy-policy')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <MainPageLayout title="Privacy Policy">
      <ReactMarkdown children={privacyPolicy} remarkPlugins={[remarkGfm]} />
    </MainPageLayout>
  );
}