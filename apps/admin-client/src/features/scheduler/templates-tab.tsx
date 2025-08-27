import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@mono-repo/ui';
import { Plus } from 'lucide-react';

export function TemplatesTab() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-muted-foreground">
              Message Templates
            </CardTitle>
            <CardDescription>
              This feature is currently disabled
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          <Plus className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Templates feature is coming soon</p>
        </div>
      </CardContent>
    </Card>
  );
}
