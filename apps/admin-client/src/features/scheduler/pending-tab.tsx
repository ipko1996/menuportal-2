import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@mono-repo/ui';
import { Clock, Eye, Plus, CheckCircle2 } from 'lucide-react';

export function PendingTab() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Posts Waiting to be Scheduled</CardTitle>
            <CardDescription>
              Draft posts that need menu content before they can be scheduled
            </CardDescription>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create New Post
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="font-medium">Week 3</div>
                <Badge className="bg-yellow-100 text-yellow-800">
                  <Clock className="h-3 w-3 mr-1" />
                  Pending
                </Badge>
                <div className="text-sm text-muted-foreground">
                  Planned for January 12, 2025 at 18:00
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Another amazing week of flavors awaits!
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Review
              </Button>
              <Button size="sm">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Schedule
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
