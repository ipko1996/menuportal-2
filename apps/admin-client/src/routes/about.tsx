import { createFileRoute } from '@tanstack/react-router';
import { Button } from '@mono-repo/ui';

export const Route = createFileRoute('/about')({
  component: About,
  head: () => ({
    meta: [
      {
        title: 'About',
      },
      {
        name: 'description',
        content: 'This is the about page of the admin client application.',
      },
      {
        name: 'keywords',
        content: 'admin, client, about, application',
      },
    ],
  }),
});

function About() {
  return (
    <div className="p-2">
      <div>hello about</div>
      <h1 className="text-3xl font-bold underline">Hello world!</h1>
      <Button variant="default" className="mt-2">
        Click Me
      </Button>
    </div>
  );
}
