import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@mono-repo/ui';
import { CheckCircle2, Facebook, Instagram } from 'lucide-react';

export function ScheduledTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Scheduled Posts</CardTitle>
        <CardDescription>
          Posts that are scheduled and ready to be published automatically
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="font-medium">Week 2</div>
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Scheduled
                </Badge>
                <div className="text-sm text-muted-foreground">
                  January 5, 2025 at 18:00
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Next week's delicious menu is ready!
              </p>
              <div className="flex gap-2">
                <div className="flex items-center gap-1 text-xs">
                  <Facebook className="h-3 w-3" />
                  facebook
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <Instagram className="h-3 w-3" />
                  instagram
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
