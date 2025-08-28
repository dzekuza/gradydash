"use client"

import { Bar, BarChart, CartesianGrid, Rectangle, XAxis, Tooltip } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { BarChart3, Package, TrendingUp } from 'lucide-react'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart'

interface ProductStatusChartProps {
  statusCounts: {
    selling: number
    sold: number
    in_repair: number
    taken: number
    returned: number
    discarded: number
  }
}

export function ProductStatusChart({ statusCounts }: ProductStatusChartProps) {
  const totalProducts = Object.values(statusCounts).reduce((sum, count) => sum + count, 0)

  // Prepare chart data for product status distribution
  const chartData = [
    { status: 'selling', count: statusCounts.selling, fill: 'var(--chart-1)' },
    { status: 'sold', count: statusCounts.sold, fill: 'var(--chart-2)' },
    { status: 'in_repair', count: statusCounts.in_repair, fill: 'var(--chart-3)' },
    { status: 'taken', count: statusCounts.taken, fill: 'var(--chart-4)' },
    { status: 'returned', count: statusCounts.returned, fill: 'var(--chart-5)' },
    { status: 'discarded', count: statusCounts.discarded, fill: 'var(--chart-6)' },
  ].filter(item => item.count > 0) // Only show statuses with products

  const chartConfig = {
    count: {
      label: 'Products',
    },
    selling: {
      label: 'Selling',
      color: 'var(--chart-1)',
    },
    sold: {
      label: 'Sold',
      color: 'var(--chart-2)',
    },
    in_repair: {
      label: 'In Repair',
      color: 'var(--chart-3)',
    },
    taken: {
      label: 'Taken',
      color: 'var(--chart-4)',
    },
    returned: {
      label: 'Returned',
      color: 'var(--chart-5)',
    },
    discarded: {
      label: 'Discarded',
      color: 'var(--chart-6)',
    },
  } satisfies ChartConfig

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Product Status Distribution
        </CardTitle>
        <CardDescription>
          Breakdown of products by current status
        </CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ChartContainer config={chartConfig}>
            <BarChart accessibilityLayer data={chartData} height={300}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="status"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) =>
                  chartConfig[value as keyof typeof chartConfig]?.label
                }
              />
              <Tooltip
                content={<ChartTooltipContent config={chartConfig} hideLabel />}
              />
              <Bar
                dataKey="count"
                strokeWidth={2}
                radius={8}
              />
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Package className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold">No products yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Add some products to see the status distribution chart.
              </p>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Total products: {totalProducts} <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Showing distribution across all product statuses
        </div>
      </CardFooter>
    </Card>
  )
}
