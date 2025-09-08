import { ThemeSwitch } from '@/components/theme-switch';
import { useAuth } from '@clerk/clerk-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Badge,
  Button,
  buttonVariants,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Separator,
} from '@mono-repo/ui';
import {
  IconEdit,
  IconSparkles,
  IconDownload,
  IconShare,
  IconCalendarEvent,
  IconFileText,
  IconX,
  IconMenu2,
  IconArrowRight,
  IconCheck,
  IconBrandFacebook,
  IconBrandInstagram,
} from '@tabler/icons-react';

import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import dashboardImage from '@/assets/images/dashboard.png';
import menuEditor from '@/assets/images/menu-editor.png';
import scheduling from '@/assets/images/scheduling.png';
import { MainPageLayout } from '@/components/layout/main-page-layout';

export const Route = createFileRoute('/')({
  component: LandingPage,
});

function LandingPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const navigate = useNavigate({ from: '/' });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      navigate({ to: '/dashboard', replace: true });
    }
  }, [isLoaded, isSignedIn, navigate]);

  // While Clerk is loading, you can show a loader
  if (!isLoaded) {
    return (
      <div className="flex h-svh items-center justify-center">
        <div className="border-primary size-8 animate-spin rounded-full border-2 border-t-transparent" />
      </div>
    );
  }

  // REFACTORED: Descriptions are now accurate and truthful.
  const features = [
    {
      icon: <IconCalendarEvent className="h-8 w-8 text-primary" />,
      title: 'Visual Calendar Planner',
      description:
        'Plan your weekly offers on an intuitive calendar. Add dishes and prices for specific days with a simple, clean interface.',
    },
    {
      icon: <IconSparkles className="h-8 w-8 text-primary" />,
      title: 'Quick-Add from Saved Dishes',
      description:
        'Save time with smart search. Instantly find and add dishes from your saved library, eliminating repetitive typing.',
    },
    {
      icon: <IconDownload className="h-8 w-8 text-primary" />,
      title: 'Print-Ready PDF Menus',
      description:
        'Generate professional, print-ready PDFs of your weekly menu with a single click. Perfect for displaying in your restaurant.',
    },
    {
      icon: <IconShare className="h-8 w-8 text-primary" />,
      title: 'Auto Social Media Posting',
      description:
        'Schedule and automatically post your menus to Facebook and Instagram. Set it once and let it run.',
    },
    {
      icon: <IconCalendarEvent className="h-8 w-8 text-primary" />,
      title: 'Plan Menus Weeks Ahead',
      description:
        'Stay organized by planning your menus weeks or even months in advance. Easily manage seasonal dishes and special events.',
    },
    {
      icon: <IconSparkles className="h-8 w-8 text-primary" />,
      title: 'AI Menu Assistant',
      description:
        "Coming soon: Get AI-powered suggestions for menu planning based on trends, seasons, and your restaurant's history.",
    },
  ];

  const testimonials = [
    {
      name: 'Maria Kovács',
      restaurant: 'Kovács Family Bistro',
      location: 'Budapest, Hungary',
      quote:
        'This tool saved me hours every week. No more formatting headaches or forgotten Facebook posts!',
    },
    {
      name: 'Giuseppe Romano',
      restaurant: "Romano's Trattoria",
      location: 'Rome, Italy',
      quote:
        'My customers love seeing our daily specials automatically posted. Sales have increased 30%.',
    },
    {
      name: 'Anna Müller',
      restaurant: 'Café Gemütlich',
      location: 'Vienna, Austria',
      quote:
        'The PDF templates are beautiful. Our printed menus look so professional now.',
    },
  ];

  // REFACTORED: "Free trial" mention removed from the first answer.
  const faqs = [
    {
      question: 'How easy is it to get started?',
      answer:
        'Very easy! Sign up for an account, connect your Facebook and Instagram pages, and start creating your first menu in minutes. No technical knowledge required.',
    },
    {
      question: 'Can I customize the look of my menus?',
      answer:
        "Choose from our professional templates or customize colors, fonts, and layouts to match your restaurant's brand.",
    },
    {
      question: 'What social media platforms do you support?',
      answer:
        'We currently support automatic posting and scheduling for both Facebook and Instagram. More platforms are on the way.',
    },
    {
      question: 'Is my data secure?',
      answer:
        'Yes, we use industry-standard encryption and security measures. Your menu data and social media accounts are completely secure.',
    },
    {
      question: 'Can I cancel anytime?',
      answer:
        'Yes, you can cancel your subscription at any time. No long-term contracts or hidden fees.',
    },
    {
      question: 'Do you offer support in Hungarian?',
      answer:
        'Yes! We provide customer support in Hungarian, English, and several other European languages.',
    },
  ];

  return (
    <MainPageLayout title="Menuportal - Simplifying Menu Management for Restaurants">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="container mx-auto px-4 text-center">
          {/* <Badge variant="secondary" className="mb-4">
            <IconSparkles className="h-4 w-4 mr-2" />
            Trusted by 500+ restaurants
          </Badge> */}

          <h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-balance mb-6">
            The Modern Way to Manage Menus
          </h1>

          <p className="text-xl text-muted-foreground text-balance mb-8 max-w-2xl mx-auto">
            Stop wasting time with spreadsheets and manual social media posts.
            Create, schedule, and share beautiful menus effortlessly.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            {/* REFACTORED: CTA changed from "Start Free Trial" */}
            <Button size="lg" className="text-lg px-8">
              Get Started
              <IconArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 bg-transparent"
            >
              Watch Demo
            </Button>
          </div>

          <div className="relative max-w-4xl mx-auto">
            <img
              src={dashboardImage}
              alt="Menuportal Dashboard"
              className="rounded-lg shadow-2xl border"
            />
          </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">
                Stop the Menu Management Nightmare
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p className="flex items-start gap-3">
                  <IconX className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                  Fighting with spreadsheet formatting for menus
                </p>
                <p className="flex items-start gap-3">
                  <IconX className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                  Taking blurry photos of printed menus for social media
                </p>
                <p className="flex items-start gap-3">
                  <IconX className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                  Forgetting to post daily specials on Facebook or Instagram
                </p>
                <p className="flex items-start gap-3">
                  <IconX className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                  Spending hours on menu updates every single week
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-6 text-primary">
                Menuportal Makes It Simple
              </h3>
              <div className="space-y-4 text-muted-foreground">
                <p className="flex items-start gap-3">
                  <IconCheck className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  Create beautiful menus in minutes with our visual planner
                </p>
                <p className="flex items-start gap-3">
                  <IconCheck className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  Automatically post to your Facebook and Instagram pages
                </p>
                <p className="flex items-start gap-3">
                  <IconCheck className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  Generate print-ready PDFs with professional templates
                </p>
                <p className="flex items-start gap-3">
                  <IconCheck className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  Plan your menus weeks ahead and schedule everything
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Everything You Need to Manage Menus
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From creation to publication, we've got every step of your menu
              workflow covered.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Screenshots Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              See Menuportal in Action
            </h2>
            <p className="text-xl text-muted-foreground">
              A quick look at our intuitive interface.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-4">
                Menu Creation Made Simple
              </h3>
              <p className="text-muted-foreground mb-6">
                Our visual editor makes it easy to add dishes, set prices, and
                organize your weekly menu. Autocomplete helps you reuse previous
                items, saving time and ensuring consistency.
              </p>
              {/* REFACTORED: Removed false claims */}
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <IconCheck className="h-4 w-4 text-primary" />
                  Plan your menu on a weekly calendar
                </li>
                <li className="flex items-center gap-2">
                  <IconCheck className="h-4 w-4 text-primary" />
                  Smart autocomplete from your dish library
                </li>
                <li className="flex items-center gap-2">
                  <IconCheck className="h-4 w-4 text-primary" />
                  Add single offers or multi-course menus
                </li>
              </ul>
            </div>
            <div>
              <img
                src={menuEditor}
                alt="Menu Creation Interface"
                className="rounded-lg shadow-lg border"
              />
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-center mt-16">
            <div className="lg:order-2">
              <h3 className="text-2xl font-bold mb-4">
                Automatic Social Media Posting
              </h3>
              <p className="text-muted-foreground mb-6">
                Connect your Facebook and Instagram accounts once, then schedule
                your menus to post automatically. Never forget to share your
                daily specials again.
              </p>
              <div className="flex gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <IconBrandFacebook className="h-5 w-5 text-blue-600" />
                  Facebook Pages
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <IconBrandInstagram className="h-5 w-5 text-pink-600" />
                  Instagram Business
                </div>
              </div>
            </div>
            <div className="lg:order-1">
              <img
                src={scheduling}
                alt="Social Media Integration"
                className="rounded-lg shadow-lg border"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Loved by Restaurant Owners
            </h2>
            <p className="text-xl text-muted-foreground">
              Join hundreds of satisfied restaurant owners across Europe.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground mb-4 italic">
                    "{testimonial.quote}"
                  </p>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.restaurant}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.location}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Simple, Affordable Pricing
            </h2>
            {/* REFACTORED: Removed "free trial" mention */}
            <p className="text-xl text-muted-foreground">
              Just €29/month for everything. No hidden fees.
            </p>
          </div>

          <div className="max-w-lg mx-auto">
            <Card className="relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-accent text-accent-foreground">
                  Most Popular
                </Badge>
              </div>
              <CardHeader className="text-center pb-8 pt-8">
                <CardTitle className="text-2xl">Professional Plan</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">€29</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <CardDescription className="text-base mt-2">
                  Everything you need to manage and promote your menus
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <IconCheck className="h-4 w-4 text-primary" />
                    <span>Unlimited menus and dishes</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <IconCheck className="h-4 w-4 text-primary" />
                    <span>Facebook & Instagram integration</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <IconCheck className="h-4 w-4 text-primary" />
                    <span>PDF export with custom templates</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <IconCheck className="h-4 w-4 text-primary" />
                    <span>Advanced scheduling</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <IconCheck className="h-4 w-4 text-primary" />
                    <span>Priority customer support</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <IconCheck className="h-4 w-4 text-primary" />
                    <span>Multi-language support</span>
                  </div>
                </div>

                {/* REFACTORED: CTA changed from "Start 14-Day Free Trial" */}
                <Button className="w-full mt-8" size="lg">
                  Get Started Now
                </Button>

                {/* REFACTORED: Removed "No credit card required" */}
                <p className="text-center text-sm text-muted-foreground">
                  Secure payment • Cancel anytime
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-muted-foreground">
              Everything you need to know about Menuportal.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            {/* FIX: Swapped `border` for `ring` to fix the last-item border issue */}
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="rounded-lg px-6 ring-1 ring-inset ring-border"
                >
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      <section className="py-20 bg-accent text-accent-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Ready to Simplify Your Menu Management?
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Have questions or want a personalized demo? Enter your email and
            we'll get in touch with you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="max-w-sm bg-background text-foreground border-card-foreground"
            />
            <Button size="lg" variant="default" className="px-8">
              Request a Demo
              <IconArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
          <div className="flex items-center justify-center gap-8 text-sm opacity-75">
            <div className="flex items-center gap-2">
              <IconCheck className="h-4 w-4" />
              Save hours every week
            </div>
            <div className="flex items-center gap-2">
              <IconCheck className="h-4 w-4" />
              Increase social engagement
            </div>
            <div className="flex items-center gap-2">
              <IconCheck className="h-4 w-4" />
              Cancel anytime
            </div>
          </div>
        </div>
      </section>
    </MainPageLayout>
  );
}
