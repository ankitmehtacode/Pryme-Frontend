import React, { useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SmoothScroll from "@/components/SmoothScroll";
import { ArrowLeft, Clock, Share2, Facebook, Twitter, Linkedin } from "lucide-react";
import { blogs } from "@/data/blogs";

const BlogDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  const blog = blogs.find((b) => b.slug === slug);

  // Scroll to top and handle 404
  useEffect(() => {
    window.scrollTo(0, 0);
    if (!blog) {
      navigate("/blogs");
    }
  }, [slug, blog, navigate]);

  if (!blog) return null; // Will redirect in useEffect

  const shareUrl = window.location.href;
  const shareTitle = blog.title;

  const shareOnFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      "_blank",
      "noopener,noreferrer,width=600,height=400"
    );
  };

  const shareOnTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
      "_blank",
      "noopener,noreferrer,width=600,height=400"
    );
  };

  const shareOnLinkedIn = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      "_blank",
      "noopener,noreferrer,width=600,height=400"
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#080d1e]">
      <Helmet>
        <title>{blog.title} | PRYME Insights</title>
        <meta name="description" content={blog.title} />
      </Helmet>
      
      <Header />
      
      <SmoothScroll>
        <main className="flex-1 pt-24 md:pt-32 pb-24">
          <article className="container mx-auto px-4 max-w-4xl">
            {/* Back Button */}
            <Link to="/blogs" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#103783] transition-colors font-medium mb-8">
              <ArrowLeft className="w-4 h-4" />
              Back to Insights
            </Link>

            {/* Header Section */}
            <div className="mb-10 text-center">
              <span className="inline-block px-4 py-1.5 rounded-full bg-[#103783]/10 text-[#103783] text-xs font-bold uppercase tracking-widest mb-6 border border-[#103783]/20">
                {blog.cat}
              </span>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#0a1530] leading-tight mb-6">
                {blog.title}
              </h1>
              <div className="flex items-center justify-center gap-6 text-sm text-slate-500 font-medium">
                <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> {blog.date}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                <span>4 Min Read</span>
              </div>
            </div>

            {/* Featured Image */}
            <div className="w-full h-[300px] md:h-[500px] rounded-3xl overflow-hidden shadow-2xl mb-12">
              <img src={blog.img} alt={blog.title} className="w-full h-full object-cover" />
            </div>

            {/* Content Body */}
            <div className="prose prose-lg md:prose-xl prose-slate max-w-none mx-auto whitespace-pre-line text-slate-700 leading-relaxed mb-16">
              {blog.content}
            </div>

            {/* Share Section */}
            <div className="border-t border-slate-200 pt-8 mt-12 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-2 text-slate-700 font-semibold">
                <Share2 className="w-5 h-5" />
                <span>Share this Insight</span>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={shareOnFacebook}
                  className="p-3 rounded-full bg-slate-100 hover:bg-[#1877F2] hover:text-white transition-colors text-slate-600 cursor-pointer"
                  aria-label="Share on Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </button>
                <button
                  onClick={shareOnTwitter}
                  className="p-3 rounded-full bg-slate-100 hover:bg-[#1DA1F2] hover:text-white transition-colors text-slate-600 cursor-pointer"
                  aria-label="Share on Twitter"
                >
                  <Twitter className="w-5 h-5" />
                </button>
                <button
                  onClick={shareOnLinkedIn}
                  className="p-3 rounded-full bg-slate-100 hover:bg-[#0A66C2] hover:text-white transition-colors text-slate-600 cursor-pointer"
                  aria-label="Share on LinkedIn"
                >
                  <Linkedin className="w-5 h-5" />
                </button>
              </div>
            </div>

          </article>
        </main>
        <Footer />
      </SmoothScroll>
    </div>
  );
};

export default BlogDetail;
