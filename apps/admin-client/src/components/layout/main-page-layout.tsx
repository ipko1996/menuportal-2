import { ThemeSwitch } from '@/components/theme-switch';
import {
  IconFileText,
  IconX,
  IconMenu2,
  IconBrandFacebook,
  IconBrandInstagram,
} from '@tabler/icons-react';
import { Button, buttonVariants, Separator } from '@mono-repo/ui';
import { Link } from '@tanstack/react-router';
import { useState, type ReactNode } from 'react';

interface MainPageLayoutProps {
  children: ReactNode;
  title: string;
}

export function MainPageLayout({ children, title }: MainPageLayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header (copied from your landing page) */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center space-x-2">
            <IconFileText className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">Menuportal</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/#features"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Features
            </Link>
            <Link
              to="/#pricing"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Pricing
            </Link>
            <Link
              to="/#testimonials"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Testimonials
            </Link>
            <Link
              to="/#faq"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              FAQ
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <ThemeSwitch />
            <Link
              to="/clerk/sign-in"
              className={buttonVariants({ variant: 'outline' })}
            >
              <Button variant="ghost" className="hidden md:inline-flex">
                Sign In
              </Button>
            </Link>
            <Button className="hidden md:inline-flex">Get Started</Button>

            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <IconX className="h-5 w-5" />
              ) : (
                <IconMenu2 className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t bg-background">
            <nav className="container mx-auto px-4 py-4 space-y-4">
                <Link to="/#features" className="block text-sm font-medium hover:text-primary transition-colors">Features</Link>
                <Link to="/#pricing" className="block text-sm font-medium hover:text-primary transition-colors">Pricing</Link>
                <Link to="/#testimonials" className="block text-sm font-medium hover:text-primary transition-colors">Testimonials</Link>
                <Link to="/#faq" className="block text-sm font-medium hover:text-primary transition-colors">FAQ</Link>
                <Separator />
                <div className="space-y-2">
                    <Button variant="ghost" className="w-full justify-start">Sign In</Button>
                    <Button className="w-full">Get Started</Button>
                </div>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-grow container mx-auto px-4 py-12 md:py-20">
        <article className="prose prose-zinc dark:prose-invert max-w-4xl mx-auto">
          <h1>{title}</h1>
          {children}
        </article>
      </main>

      {/* Footer (copied from your landing page) */}
      <footer className="py-12 border-t bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <IconFileText className="h-6 w-6 text-primary" />
                <span className="text-lg font-bold">Menuportal</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Simplifying menu management for restaurants across Europe.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/#features" className="hover:text-foreground transition-colors">Features</Link></li>
                <li><Link to="/#pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
                {/* <li><a href="#" className="hover:text-foreground transition-colors">Templates</a></li> */}
                {/* <li><a href="#" className="hover:text-foreground transition-colors">Integrations</a></li> */}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {/* <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li> */}
                <li><a href="#" className="hover:text-foreground transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">API Documentation</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Status</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/privacy-policy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
                <li><Link to="/cookie-policy" className="hover:text-foreground transition-colors">Cookie Policy</Link></li>
                {/* <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li> */}
                <li><a href="#" className="hover:text-foreground transition-colors">About Us</a></li>
              </ul>
            </div>
          </div>
          <Separator className="my-8" />
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
            <p>© 2025 Menuportal. All rights reserved.</p>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <a href="#" className="hover:text-foreground transition-colors"><IconBrandFacebook className="h-5 w-5" /></a>
              <a href="#" className="hover:text-foreground transition-colors"><IconBrandInstagram className="h-5 w-5" /></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}