import { Loader2 } from 'lucide-react'
import { useDashboard } from '@/hooks/useDashboard'
import { WelcomeSection } from '@/components/dashboard/WelcomeSection'
import { StatCard } from '@/components/dashboard/StatCard'
import { DashboardCharts } from '@/components/dashboard/DashboardCharts'
import { ActivityTimeline } from '@/components/dashboard/ActivityTimeline'
import { QuickActions } from '@/components/dashboard/QuickActions'

export function DashboardPage() {
  const { stats, activities, loading } = useDashboard();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <WelcomeSection />
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Top KPIs — click a card to open the related module.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats && stats.length > 0 ? (
                stats.map((stat, i) => (
                  <StatCard key={stat.id} stat={stat} index={i} />
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No dashboard statistics available.</p>
              )}
        </div>
      </div>
      <DashboardCharts />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <QuickActions />
        </div>
        <ActivityTimeline activities={activities} />
      </div>
    </div>
  );
}
export default DashboardPage;
