"use client"

import * as React from "react"

import { cn } from "@/lib/utils/cn"

export interface ChartConfig {
  [key: string]: {
    label: string
    color?: string
  }
}

interface ChartContainerProps {
  config: ChartConfig
  children: React.ReactNode
  className?: string
}

export function ChartContainer({
  config,
  children,
  className,
}: ChartContainerProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-wrap gap-4">
        {Object.entries(config).map(([key, value]) => (
          <div key={key} className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: value.color }}
            />
            <span className="text-sm text-muted-foreground">
              {value.label}
            </span>
          </div>
        ))}
      </div>
      {children}
    </div>
  )
}

interface ChartTooltipProps {
  active?: boolean
  payload?: any[]
  label?: string
  config?: ChartConfig
  hideLabel?: boolean
}

export function ChartTooltip({
  active,
  payload,
  label,
  config,
  hideLabel = false,
}: ChartTooltipProps) {
  if (!active || !payload) {
    return null
  }

  return (
    <div className="rounded-lg border bg-background p-2 shadow-sm">
      {!hideLabel && label && (
        <div className="mb-2 text-sm font-medium">{label}</div>
      )}
      <div className="space-y-1">
        {payload.map((item: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm text-muted-foreground">
              {config?.[item.dataKey]?.label || item.dataKey}:
            </span>
            <span className="text-sm font-medium">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ChartTooltipContent({ ...props }: ChartTooltipProps) {
  return <ChartTooltip {...props} />
}
