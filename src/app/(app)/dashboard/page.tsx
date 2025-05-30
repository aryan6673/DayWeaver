import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, CalendarPlus, ListChecks, BarChart3, CalendarDays } from 'lucide-react'; // Added CalendarDays, removed Shuffle
import Image from 'next/image';

export default function DashboardPage() {
  const features = [
    {
      title: 'Create Your Schedule',
      description: 'Let AI craft your perfect day. Just tell us your goals.',
      href: '/schedule/create',
      icon: <CalendarPlus className="h-8 w-8 text-primary" />,
      cta: 'Start Planning',
      image: 'https://placehold.co/600x400.png',
      aiHint: 'planning schedule'
    },
    {
      title: 'Manage Your Tasks',
      description: 'View, update, and track your daily to-dos effortlessly.',
      href: '/tasks',
      icon: <ListChecks className="h-8 w-8 text-primary" />,
      cta: 'View Tasks',
      image: 'https://placehold.co/600x400.png',
      aiHint: 'task list'
    },
    {
      title: 'View Your Calendar',
      description: 'See your tasks and schedule visually on a calendar.',
      href: '/calendar',
      icon: <CalendarDays className="h-8 w-8 text-primary" />,
      cta: 'Open Calendar',
      image: 'https://placehold.co/600x400.png',
      aiHint: 'calendar view'
    },
    {
      title: 'See Your Progress',
      description: 'Visualize your achievements and time usage with insightful analytics.',
      href: '/analytics',
      icon: <BarChart3 className="h-8 w-8 text-primary" />,
      cta: 'View Analytics',
      image: 'https://placehold.co/600x400.png',
      aiHint: 'charts data'
    },
    // Removed "Need to Reschedule?" card
  ];

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Welcome to Day Weaver!</CardTitle>
          <CardDescription className="text-lg">
            Your day, your goals, no stress. Let AI handle the mess.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            Day Weaver is your intelligent assistant for mastering your schedule. 
            Create, adapt, and visualize your plans with the power of AI.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {features.map((feature) => (
          <Card key={feature.title} className="flex flex-col shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="relative h-48 w-full">
              <Image 
                src={feature.image} 
                alt={feature.title} 
                layout="fill" 
                objectFit="cover" 
                className="rounded-t-lg"
                data-ai-hint={feature.aiHint}
              />
            </div>
            <CardHeader className="flex-grow">
              <div className="flex items-center space-x-3 mb-2">
                {feature.icon}
                <CardTitle>{feature.title}</CardTitle>
              </div>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href={feature.href}>
                  {feature.cta} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
