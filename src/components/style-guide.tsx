"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function StyleGuide() {
  const colorTokens = [
    { name: 'background', class: 'bg-background', text: 'text-foreground' },
    { name: 'card', class: 'bg-card', text: 'text-card-foreground' },
    { name: 'popover', class: 'bg-popover', text: 'text-popover-foreground' },
    { name: 'primary', class: 'bg-primary', text: 'text-primary-foreground' },
    { name: 'secondary', class: 'bg-secondary', text: 'text-secondary-foreground' },
    { name: 'muted', class: 'bg-muted', text: 'text-muted-foreground' },
    { name: 'accent', class: 'bg-accent', text: 'text-accent-foreground' },
    { name: 'destructive', class: 'bg-destructive', text: 'text-destructive-foreground' },
    { name: 'border', class: 'bg-border', text: 'text-foreground' },
    { name: 'input', class: 'bg-input', text: 'text-foreground' },
  ]

  const sidebarTokens = [
    { name: 'sidebar', class: 'bg-sidebar', text: 'text-sidebar-foreground' },
    { name: 'sidebar-primary', class: 'bg-sidebar-primary', text: 'text-sidebar-primary-foreground' },
    { name: 'sidebar-accent', class: 'bg-sidebar-accent', text: 'text-sidebar-accent-foreground' },
    { name: 'sidebar-border', class: 'bg-sidebar-border', text: 'text-sidebar-foreground' },
  ]

  const chartTokens = [
    { name: 'chart-1', class: 'bg-chart-1', text: 'text-foreground' },
    { name: 'chart-2', class: 'bg-chart-2', text: 'text-foreground' },
    { name: 'chart-3', class: 'bg-chart-3', text: 'text-foreground' },
    { name: 'chart-4', class: 'bg-chart-4', text: 'text-foreground' },
    { name: 'chart-5', class: 'bg-chart-5', text: 'text-foreground' },
    { name: 'chart-6', class: 'bg-chart-6', text: 'text-foreground' },
  ]

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2">Design System Style Guide</h1>
        <p className="text-muted-foreground">Testing the new color scheme implementation</p>
      </div>

      {/* Color Tokens */}
      <Card>
        <CardHeader>
          <CardTitle>Color Tokens</CardTitle>
          <CardDescription>Core design system colors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {colorTokens.map((token) => (
              <div key={token.name} className="space-y-2">
                <div className={`h-20 rounded-lg border ${token.class} ${token.text} flex items-center justify-center text-sm font-medium`}>
                  {token.name}
                </div>
                <p className="text-xs text-muted-foreground text-center">{token.class}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sidebar Tokens */}
      <Card>
        <CardHeader>
          <CardTitle>Sidebar Tokens</CardTitle>
          <CardDescription>Sidebar-specific colors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {sidebarTokens.map((token) => (
              <div key={token.name} className="space-y-2">
                <div className={`h-20 rounded-lg border ${token.class} ${token.text} flex items-center justify-center text-sm font-medium`}>
                  {token.name}
                </div>
                <p className="text-xs text-muted-foreground text-center">{token.class}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chart Tokens */}
      <Card>
        <CardHeader>
          <CardTitle>Chart Tokens</CardTitle>
          <CardDescription>Chart and data visualization colors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {chartTokens.map((token) => (
              <div key={token.name} className="space-y-2">
                <div className={`h-20 rounded-lg border ${token.class} ${token.text} flex items-center justify-center text-sm font-medium`}>
                  {token.name}
                </div>
                <p className="text-xs text-muted-foreground text-center">{token.class}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Component Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Component Examples</CardTitle>
          <CardDescription>How components look with the new color scheme</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Buttons */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Buttons</h3>
            <div className="flex flex-wrap gap-2">
              <Button variant="default">Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </div>
          </div>

          {/* Badges */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Badges</h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant="default">Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
          </div>

          {/* Cards */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Cards</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Card Title</CardTitle>
                  <CardDescription>Card description text</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>This is a sample card with the new color scheme.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Another Card</CardTitle>
                  <CardDescription>More card content</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Testing different card variations.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
