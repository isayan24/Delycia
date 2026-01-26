"use client";
import React from "react"; 
import Header from "./Header";

export default function HeaderWrapper() { 
 
  return (
    <div className={`min-[700px]:visible invisible`}>
      <Header />
    </div>
  );
}
