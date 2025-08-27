import { Card, CardHeader, Skeleton, CardContent } from '@mono-repo/ui';

export default function SettingsLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>

            <div className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-64" />
              </div>
              <Skeleton className="h-6 w-11 rounded-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-3 w-48" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-3 w-56" />
            </div>

            <div className="flex justify-end">
              <Skeleton className="h-10 w-32" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-1">
        <Card className="sticky top-4">
          <CardHeader>
            <Skeleton className="h-6 w-28" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-lg bg-muted/20">
              <div className="flex items-center gap-2 mb-3">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-3" />
              <Skeleton className="w-full h-32 rounded-md mb-3" />
              <div className="flex gap-2 mt-3 pt-3 border-t">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-4" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
