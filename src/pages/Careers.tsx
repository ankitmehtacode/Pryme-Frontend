import { Helmet } from "react-helmet-async";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SmoothScroll from "@/components/SmoothScroll";
import { PageShell } from "@/components/layout/PageShell";
import { Surface, Section, Container } from "@/components/layout/Primitives";
import { Button } from "@/components/ui/button";
import { Users, Lightbulb, Heart, ShieldCheck, Rocket, Code, PenTool, Megaphone, BarChart, BookOpen, PartyPopper, Gift, Briefcase, MapPin, ArrowRight } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { Link } from "react-router-dom";
import careersTeamImg from "@/assets/careers-team.jpg";

export default function Careers() {
  const whyJoinReasons = [
    {
      icon: Users,
      title: "Impact First",
      description: "Build products that simplify financial decisions for millions.",
    },
    {
      icon: Lightbulb,
      title: "Innovate Always",
      description: "Work with modern technology and solve real world problems.",
    },
    {
      icon: Heart,
      title: "Grow Together",
      description: "Continuous learning, mentorship and a culture that helps you grow.",
    },
    {
      icon: ShieldCheck,
      title: "Integrity",
      description: "We believe in transparency, trust and doing what is right for our users.",
    },
    {
      icon: Rocket,
      title: "Ownership",
      description: "Take initiative, own your work and make a meaningful difference.",
    }
  ];

  const openPositions = [
    {
      title: "Full Stack Developer",
      department: "Engineering",
      icon: Code,
      iconColor: "text-blue-600 dark:text-blue-400",
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
      location: "Indore, MP",
      type: "Full-time",
    },
    {
      title: "UI/UX Designer",
      department: "Design",
      icon: PenTool,
      iconColor: "text-green-600 dark:text-green-400",
      iconBg: "bg-green-100 dark:bg-green-900/30",
      location: "Indore, MP",
      type: "Full-time",
    },
    {
      title: "Digital Marketing Intern",
      department: "Marketing",
      icon: Megaphone,
      iconColor: "text-purple-600 dark:text-purple-400",
      iconBg: "bg-purple-100 dark:bg-purple-900/30",
      location: "Indore, MP",
      type: "Internship",
    },
    {
      title: "Data Analyst",
      department: "Analytics",
      icon: BarChart,
      iconColor: "text-orange-600 dark:text-orange-400",
      iconBg: "bg-orange-100 dark:bg-orange-900/30",
      location: "Indore, MP",
      type: "Full-time",
    }
  ];

  const lifeAtPryme = [
    {
      icon: Users,
      iconColor: "text-blue-500",
      title: "Collaborative culture",
      description: "Work with passionate people who support and inspire you.",
    },
    {
      icon: BookOpen,
      iconColor: "text-green-500",
      title: "Learning opportunities",
      description: "Upskill yourself with workshops, resources and real challenges.",
    },
    {
      icon: Heart,
      iconColor: "text-purple-500",
      title: "Work life balance",
      description: "Flexible environment to help you do your best work.",
    },
    {
      icon: Gift,
      iconColor: "text-red-500",
      title: "Employee benefits",
      description: "Health insurance, wellness programs and more.",
    },
    {
      icon: PartyPopper,
      iconColor: "text-yellow-500",
      title: "Celebrate wins",
      description: "We celebrate milestones and the people behind them.",
    }
  ];

  return (
    <>
      <Helmet>
        <title>Careers | PRYME</title>
        <meta name="description" content="Join PRYME and help build the future of lending." />
        <meta property="og:title" content="Careers | PRYME" />
        <meta property="og:description" content="Join PRYME and help build the future of lending." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.prymeloans.in/careers" />
        <meta property="og:image" content="https://www.prymeloans.in/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://www.prymeloans.in/careers" />
      </Helmet>
      
      <SmoothScroll>
        <PageShell className="bg-white dark:bg-[#080d1e]">
          <Header />
          
          <main className="flex-1 w-full pt-20 md:pt-24 lg:pt-28">
            {/* HERO SECTION */}
            <Section spacing="md" className="relative overflow-hidden" style={{ paddingBlockStart: 0, paddingBlockEnd: "var(--space-md)" }}>
              <Container size="expanded">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8">
                  
                  {/* Left Column - Copy */}
                  <div className="w-full lg:w-5/12 z-10 text-center lg:text-left">
                    <ScrollReveal direction="up" duration={0.8}>
                      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.1] mb-6">
                        Build the future<br />
                        of <span className="text-primary">lending</span> with us
                      </h1>
                      <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-xl mx-auto lg:mx-0">
                        At PRYME, we are on a mission to make borrowing simpler, smarter and more transparent for everyone. Join a team that is using technology and innovation to create real impact.
                      </p>
                      <Button size="lg" className="rounded-full px-8 text-base shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow">
                        View Open Positions
                      </Button>
                    </ScrollReveal>
                  </div>

                  {/* Right Column - Image */}
                  <div className="w-full lg:w-7/12 relative">
                    <ScrollReveal direction="left" duration={1}>
                      <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent z-10" />
                        <img 
                          src={careersTeamImg} 
                          alt="PRYME team collaborating"
                          className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-700"
                        />
                      </div>
                    </ScrollReveal>
                  </div>
                </div>
              </Container>
            </Section>

            {/* WHY JOIN SECTION */}
            <Section spacing="md" className="bg-slate-50/50 dark:bg-slate-900/20">
              <Container size="default">
                <ScrollReveal direction="up">
                  <div className="text-center mb-10">
                    <h2 className="text-3xl md:text-4xl font-semibold text-slate-900 dark:text-white tracking-tight">
                      Why join PRYME?
                    </h2>
                  </div>
                </ScrollReveal>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                  {whyJoinReasons.map((reason, idx) => (
                    <ScrollReveal key={idx} direction="up" delay={idx * 0.1}>
                      <div className="flex flex-col items-center text-center p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300 h-full group">
                        <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                          <reason.icon className="w-8 h-8 text-primary" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">{reason.title}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                          {reason.description}
                        </p>
                      </div>
                    </ScrollReveal>
                  ))}
                </div>
              </Container>
            </Section>

            {/* OPEN POSITIONS SECTION */}
            <Section spacing="md">
              <Container size="default">
                <ScrollReveal direction="up">
                  <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4">
                    <h2 className="text-3xl md:text-4xl font-semibold text-slate-900 dark:text-white tracking-tight">
                      Open Positions
                    </h2>
                    <Link to="#" className="text-primary hover:text-primary/80 font-medium flex items-center gap-2 group text-sm md:text-base">
                      View all openings <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </ScrollReveal>

                <div className="flex flex-col gap-4">
                  {openPositions.map((job, idx) => (
                    <ScrollReveal key={idx} direction="up" delay={idx * 0.1}>
                      <div className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300 gap-6">
                        {/* Job Info */}
                        <div className="flex items-center gap-5">
                          <div className={`w-14 h-14 rounded-xl ${job.iconBg} flex items-center justify-center shrink-0`}>
                            <job.icon className={`w-6 h-6 ${job.iconColor}`} strokeWidth={1.5} />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{job.title}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{job.department}</p>
                          </div>
                        </div>

                        {/* Meta & Action */}
                        <div className="flex flex-wrap md:flex-nowrap items-center gap-6 md:gap-10">
                          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm">
                            <MapPin className="w-4 h-4" />
                            {job.location}
                          </div>
                          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm">
                            <Briefcase className="w-4 h-4" />
                            {job.type}
                          </div>
                          <Button variant="outline" className="w-full md:w-auto rounded-full px-6 hover:bg-primary hover:text-white transition-colors border-slate-200 dark:border-slate-700">
                            Apply Now
                          </Button>
                        </div>
                      </div>
                    </ScrollReveal>
                  ))}
                </div>
              </Container>
            </Section>

            {/* LIFE AT PRYME SECTION */}
            <Section spacing="md" className="bg-slate-50/50 dark:bg-slate-900/20">
              <Container size="default">
                <ScrollReveal direction="up">
                  <div className="text-center mb-10">
                    <h2 className="text-3xl md:text-4xl font-semibold text-slate-900 dark:text-white tracking-tight">
                      Life at PRYME
                    </h2>
                  </div>
                </ScrollReveal>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-6">
                  {lifeAtPryme.map((item, idx) => (
                    <ScrollReveal key={idx} direction="up" delay={idx * 0.1}>
                      <div className="flex flex-col items-center text-center group">
                        <item.icon className={`w-12 h-12 mb-6 ${item.iconColor} group-hover:scale-110 transition-transform duration-300`} strokeWidth={1.5} />
                        <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-[200px]">
                          {item.description}
                        </p>
                      </div>
                    </ScrollReveal>
                  ))}
                </div>
              </Container>
            </Section>

            {/* BOTTOM CTA */}
            <Section spacing="md" className="pb-16">
              <Container size="default">
                <ScrollReveal direction="up" duration={0.8}>
                  <div className="bg-[#0a192f] dark:bg-slate-900 rounded-3xl p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-2xl border border-[#1e2d4a] dark:border-white/10">
                    {/* Decorative glow */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 blur-3xl rounded-full translate-x-1/3 -translate-y-1/2 pointer-events-none" />
                    
                    <div className="w-full md:w-1/2 z-10 text-center md:text-left">
                      <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
                        Ready to build something <span className="text-blue-400">meaningful?</span>
                      </h2>
                    </div>
                    
                    <div className="w-full md:w-5/12 flex flex-col items-center md:items-start gap-6 z-10">
                      <p className="text-slate-300 text-center md:text-left text-sm md:text-base">
                        Explore opportunities and be a part of our mission to transform the lending experience.
                      </p>
                      <Button variant="default" size="lg" className="bg-white text-slate-900 hover:bg-slate-100 rounded-full px-8 font-medium">
                        Explore Careers
                      </Button>
                    </div>
                  </div>
                </ScrollReveal>
              </Container>
            </Section>
          </main>
          
          <Footer />
        </PageShell>
      </SmoothScroll>
    </>
  );
}
