import React, { useState, useEffect } from "react";
import { Layout } from "./components/layout/Layout";
import { Chapter01Vram } from "./components/chapters/Chapter01Vram";
import { Chapter02BitAnatomy } from "./components/chapters/Chapter02BitAnatomy";
import { Chapter03LinearMappingTheory } from "./components/chapters/Chapter03LinearMappingTheory";
import { Chapter04Symmetric } from "./components/chapters/Chapter04Symmetric";
import { Chapter05Asymmetric } from "./components/chapters/Chapter05Asymmetric";
import { Chapter06FullFtVsPeft } from "./components/chapters/Chapter06FullFtVsPeft";
import { Chapter07LoraWalkthrough } from "./components/chapters/Chapter07LoraWalkthrough";
import { Chapter08QloraSynthesis } from "./components/chapters/Chapter08QloraSynthesis";

export default function App() {
  const [chapter, setChapter] = useState(0);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial system preference or stored pref
    const isDarkOS = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDark(isDarkOS);
    if (isDarkOS) document.documentElement.classList.add("dark");
  }, []);

  const toggleDark = () => {
    setIsDark(prev => {
      const next = !prev;
      if (next) document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
      return next;
    });
  };

  return (
    <Layout chapter={chapter} setChapter={setChapter} isDark={isDark} toggleDark={toggleDark}>
      {chapter === 0 && <Chapter01Vram />}
      {chapter === 1 && <Chapter02BitAnatomy />}
      {chapter === 2 && <Chapter03LinearMappingTheory />}
      {chapter === 3 && <Chapter04Symmetric />}
      {chapter === 4 && <Chapter05Asymmetric />}
      {chapter === 5 && <Chapter06FullFtVsPeft />}
      {chapter === 6 && <Chapter07LoraWalkthrough />}
      {chapter === 7 && <Chapter08QloraSynthesis />}
    </Layout>
  );
}
