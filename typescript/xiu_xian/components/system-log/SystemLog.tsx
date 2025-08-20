"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SystemLog as SystemLogType } from '@/types'

interface SystemLogProps {
  logs: SystemLogType[]
}

export function SystemLog({ logs }: SystemLogProps) {
  const getLogTypeColor = (type: string) => {
    switch (type) {
      case 'strongest_change':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'killer_change':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // 调整：基于日志内容进一步细分标签，区分初代/战斗/寿元/数值超越
  const getLogTypeLabel = (log: SystemLogType) => {
    const { type, message, reason } = log

    // 初代播报
    if (message.includes('初代最强修士')) return '初代最强'
    if (message.includes('初代杀戮之王')) return '初代杀王'

    // 更迭细分
    if (type === 'strongest_change') {
      if (message.includes('击杀') || (reason && reason.includes('击杀'))) return '最强更迭·战斗'
      if (message.includes('寿元耗尽') || (reason && reason.includes('寿元耗尽'))) return '最强更迭·寿元'
      if (message.includes('修为') && message.includes('超越')) return '最强更迭·数值超越'
      return '最强更迭'
    }

    if (type === 'killer_change') {
      if (message.includes('击杀') || (reason && reason.includes('击杀'))) return '杀王更迭·战斗'
      if (message.includes('寿元耗尽') || (reason && reason.includes('寿元耗尽'))) return '杀王更迭·寿元'
      if ((message.includes('击败人数') && message.includes('超越')) || (reason && reason.includes('击败人数'))) return '杀王更迭·数值超越'
      return '杀王更迭'
    }

    return '系统事件'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>系统日志</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full overflow-y-auto">
          {logs.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              暂无系统日志
            </div>
          ) : (
            <div className="space-y-4">
              {logs.slice().reverse().map((log, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge className={getLogTypeColor(log.type)}>
                      {getLogTypeLabel(log)}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      第{log.year}年
                    </span>
                  </div>
                  
                  <p className="text-sm font-medium">{log.message}</p>
                  
                  {log.oldCultivator && log.newCultivator && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-1">
                        <h4 className="font-medium text-red-600">前任:</h4>
                        <div className="bg-red-50 p-2 rounded border">
                          <div>ID: {log.oldCultivator.id}</div>
                          <div>境界: {log.oldCultivator.level}</div>
                          <div>修为: {log.oldCultivator.cultivation_points.toLocaleString()}</div>
                          <div>击败: {log.oldCultivator.defeats_count}</div>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <h4 className="font-medium text-green-600">新任:</h4>
                        <div className="bg-green-50 p-2 rounded border">
                          <div>ID: {log.newCultivator.id}</div>
                          <div>境界: {log.newCultivator.level}</div>
                          <div>修为: {log.newCultivator.cultivation_points.toLocaleString()}</div>
                          <div>击败: {log.newCultivator.defeats_count}</div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {log.reason && (
                    <div className="text-xs text-muted-foreground bg-gray-50 p-2 rounded">
                      <strong>原因:</strong> {log.reason}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}