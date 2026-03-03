import React from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Pricing from '../components/Pricing';
import Footer from '../components/Footer';

const Home = () => {
    return (
        <>
            {/* Background ambient glows */}
            <div className="blob blob-cyan"></div>
            <div className="blob blob-purple"></div>

            <Header />

            <main>
                <Hero />
                <Features />
                <Pricing />
            </main>

            <Footer />
        </>
    );
}

export default Home;
