"use client"

import Hero from "@/components/hero"
import Certifications from "@/components/certifications"
import About from "@/components/about"
import Benefits from "@/components/benefits"
import Testimonials from "@/components/testimonials"
import Contact from "@/components/contact"
import Footer from "@/components/footer"

export default function Home() {
  return (
    <>
      {/* Header is rendered once in `app/layout.tsx` */}
      <Hero />
      <Certifications />
      <About />
      <Benefits />
      <Testimonials />
      <Contact />
      <Footer />
    </>
  )
}
