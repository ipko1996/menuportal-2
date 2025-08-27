import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@mono-repo/ui';
import {
  Eye,
  CheckCircle2,
  Facebook,
  Instagram,
  XCircle,
  AlertCircle,
} from 'lucide-react';

export function HistoryTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Post History</CardTitle>
        <CardDescription>
          View the status of all your past scheduled posts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="font-medium">Week 1</div>
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Published
                </Badge>
                <div className="text-sm text-muted-foreground">
                  December 29, 2024 at 18:00
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Start the new year with our amazing menu!
              </p>
              <div className="flex gap-2">
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <Facebook className="h-3 w-3" />
                  Published successfully
                </div>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <Instagram className="h-3 w-3" />
                  Published successfully
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              View Post
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="font-medium">Week 52</div>
                <Badge className="bg-red-100 text-red-800">
                  <XCircle className="h-3 w-3 mr-1" />
                  Failed
                </Badge>
                <div className="text-sm text-muted-foreground">
                  December 22, 2024 at 18:00
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Holiday special menu for Christmas week!
              </p>
              <div className="flex gap-2">
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <Facebook className="h-3 w-3" />
                  Published successfully
                </div>
                <div className="flex items-center gap-1 text-xs text-red-600">
                  <Instagram className="h-3 w-3" />
                  Failed - API error
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <AlertCircle className="h-4 w-4 mr-2" />
                Retry
              </Button>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="font-medium">Week 51</div>
                <Badge className="bg-yellow-100 text-yellow-800">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Partial Success
                </Badge>
                <div className="text-sm text-muted-foreground">
                  December 15, 2024 at 18:00
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Winter comfort food menu is here!
              </p>
              <div className="flex gap-2">
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <Facebook className="h-3 w-3" />
                  Published successfully
                </div>
                <div className="flex items-center gap-1 text-yellow-600">
                  <Instagram className="h-3 w-3" />
                  Published with warnings
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              View Post
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
