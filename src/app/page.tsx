import Hero from '@/components/sections/hero';
import Features from '@/components/sections/features';
import Products from '@/components/sections/products';
import Categories from '@/components/sections/categories';
import About from '@/components/sections/about';
import HowItWorks from '@/components/sections/how-it-works';
import Testimonials from '@/components/sections/testimonials';
import Stats from '@/components/sections/stats';
import Brands from '@/components/sections/brands';
import Team from '@/components/sections/team';
import Blog from '@/components/sections/blog';
import Newsletter from '@/components/sections/newsletter';
import Contact from '@/components/sections/contact';
import Faq from '@/components/sections/faq';
import Cta from '@/components/sections/cta';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Features />
      <Products />
      <Categories />
      <About />
      <HowItWorks />
      <Testimonials />
      <Stats />
      <Brands />
      <Team />
      <Blog />
      <Newsletter />
      <Faq />
      <Contact />
      <Cta />
      </main>
  );
}
