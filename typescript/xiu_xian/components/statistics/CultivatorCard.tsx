'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Cultivator } from '@/types'
import { CultivationLevels } from '@/constants/cultivation'

interface CultivatorCardProps {
  cultivator: Cultivator
  title: string
  titleColor?: string
  icon: React.ReactNode
  borderColor?: string
  className?: string
}

export function CultivatorCard({ cultivator, title, titleColor, icon, borderColor = "border-primary/20", className }: CultivatorCardProps) {
  const levelInfo = CultivationLevels[cultivator.level as keyof typeof CultivationLevels]
  
  return (
    <Card className={className || borderColor}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          <span className={titleColor}>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">修士ID:</span>
            <span className="font-medium">{cultivator.id}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">境界:</span>
            <Badge 
              variant="outline" 
              style={{ 
                borderColor: levelInfo?.color, 
                color: levelInfo?.color 
              }}
            >
              {levelInfo?.name}期
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">修为:</span>
            <span className="font-medium">{cultivator.cultivation_points.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">年龄:</span>
            <span className="font-medium">{cultivator.age}岁</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">击败数:</span>
            <span className="font-medium text-red-600">{cultivator.defeats_count}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">胆识:</span>
            <span className="font-medium">{(cultivator.courage * 100).toFixed(1)}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">寿命:</span>
            <span className="font-medium">{cultivator.max_lifespan}岁</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}