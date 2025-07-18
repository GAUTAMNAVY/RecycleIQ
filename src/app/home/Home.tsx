"use client";
import React from 'react'
import Hero from './Hero'
import Features from './Features'
import FAQ from './FAQ'

type Props = {}

const Home = (props: Props) => {
  return (
    <div suppressHydrationWarning={true as any}>
    <Hero/>
    <Features/>
    <FAQ/>
    </div>
  )
}

export default Home