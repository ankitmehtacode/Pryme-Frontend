import re

with open("src/pages/Dashboard.tsx", "r") as f:
    content = f.read()

# Add imports
import_str = 'import { PageShell, Surface, Stack, Inline, ContentContainer, SplitLayout, MediaPanel } from "@/components/layout";\n'
content = content.replace('import Header from "@/components/layout/Header";', import_str + 'import Header from "@/components/layout/Header";')

# Now for the return statement
# Before:
#   return (
#     <>
#       <Helmet><title>Client Portal | PRYME Bank-Grade Solutions</title></Helmet>
#       <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20">
#         <Header />
#
#         <main className="flex-1 pb-24">
#           <AnimatePresence mode="wait">
#             {viewState === "FUNNEL" && (
#               <motion.div 
#                 key="funnel"
#                 initial={{ opacity: 0 }} 
#                 animate={{ opacity: 1 }} 
#                 exit={{ opacity: 0 }}
#                 className="pt-24 px-4 md:px-8 max-w-6xl mx-auto"
#               >
#                 <div className="relative rounded-[2.5rem] p-8 md:p-12 mb-10 overflow-hidden shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-white/40 dark:border-white/10 bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl">
#                   {/* Subtle Glowing Orbs */}
#                   <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

# Replace `<main...>` with `<PageShell>`
content = content.replace('<main className="flex-1 pb-24">', '<main className="flex-1 pb-24">\n          <PageShell>')
content = content.replace('</main>', '</PageShell>\n        </main>')

# Fix motion div for funnel
funnel_div = """                <motion.div 
                  key="funnel"
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }}
                  className="pt-24 px-4 md:px-8 max-w-6xl mx-auto"
                >"""
new_funnel_div = """                <motion.div 
                  key="funnel"
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }}
                >"""
content = content.replace(funnel_div, new_funnel_div)

# Fix Surface for Funnel top header
top_header = """<div className="relative rounded-[2.5rem] p-8 md:p-12 mb-10 overflow-hidden shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-white/40 dark:border-white/10 bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl">"""
new_top_header = """<Surface className="relative overflow-hidden mb-[var(--space-8)] p-[var(--space-8)] md:p-[var(--space-12)] border border-[hsl(var(--border))]/40 dark:border-[hsl(var(--border))]/10 bg-[hsl(var(--background))]/60 backdrop-blur-3xl">"""
content = content.replace(top_header, new_top_header)
content = content.replace('<!-- End Surface -->', '</Surface>') # We need to properly close Surface. Wait, I will just do regex.

# Replace the inner div of Top Header
top_inner = """<div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-10">"""
new_top_inner = """<Inline justify="space-between" align="center" className="relative z-10 mb-[var(--space-10)] flex-col md:flex-row gap-[var(--space-8)] items-start">"""
content = content.replace(top_inner, new_top_inner)

top_inner_close = """</Inline>
                    
                    <div className="flex flex-col items-start md:items-end w-full md:w-auto bg-white/40 dark:bg-black/20 p-5 rounded-2xl border border-white/50 dark:border-white/5 backdrop-blur-lg">"""
# It's getting complicated to do simple replaces. I will output a new file instead using AST or rewrite.

with open("scratch/replace_dashboard.py", "w") as f2:
    pass
