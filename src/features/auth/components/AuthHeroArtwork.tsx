import * as React from "react";
import { useNavigate } from "react-router-dom";
import prymeLogo from "@/assets/pryme-typo-logo.svg";
import authHeroImg from "@/assets/images/auth-hero-v2.jpg";

export function AuthHeroArtwork() {
  const navigate = useNavigate();

  return (
    <>
      <div
        className="absolute top-8 left-8 z-10 cursor-pointer pointer-events-auto"
        onClick={() => navigate("/")}
      >
        <img
          src={prymeLogo}
          alt="PRYME"
          className="h-6 md:h-7 w-auto object-contain"
        />
      </div>

      <div className="absolute inset-0 h-full w-full bg-slate-50">
        <img
          src={authHeroImg}
          alt=""
          className="h-full w-full object-cover object-center opacity-70"
          aria-hidden="true"
          loading="eager"
          decoding="async"
          draggable={false}
        />
      </div>
    </>
  );
}
