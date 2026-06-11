import { motion } from 'framer-motion'
import { quickActionDefinitions } from '@/config/quick-actions'
import { useDashboardActions } from '@/context/DashboardActionContext'
import { cn } from '@/lib/utils'

export function QuickActions() {
  const { runQuickAction } = useDashboardActions()

  return (
    <div>
      <h3 className="mb-4 text-lg font-semibold">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {quickActionDefinitions.map((action, i) => {
          const Icon = action.icon
          return (
            <motion.button
              key={action.id}
              type="button"
              onClick={() => runQuickAction(action.id)}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                'flex flex-col items-center gap-2 rounded-xl p-4 text-white shadow-md transition-shadow hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50',
                `bg-gradient-to-br ${action.color}`
              )}
            >
              <Icon className="h-6 w-6" />
              <span className="text-center text-xs font-medium">{action.label}</span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
