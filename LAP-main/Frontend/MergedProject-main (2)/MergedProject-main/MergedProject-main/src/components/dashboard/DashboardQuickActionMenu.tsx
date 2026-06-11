import { Plus } from 'lucide-react'
import { quickActionDefinitions } from '@/config/quick-actions'
import { useDashboardActions } from '@/context/DashboardActionContext'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function DashboardQuickActionMenu() {
  const { runQuickAction } = useDashboardActions()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" className="gap-1 shadow-md">
          <Plus className="h-4 w-4" />
          Quick Action
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {quickActionDefinitions.map((action) => {
          const Icon = action.icon
          return (
            <DropdownMenuItem
              key={action.id}
              className="gap-2 cursor-pointer"
              onClick={() => runQuickAction(action.id)}
            >
              <Icon className="h-4 w-4" />
              {action.label}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
