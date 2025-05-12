import React, { useState } from "react";
import groupie from "../../images/freepik__adjust__77620.png";

const AboutPage = () => {
  // State for FAQ items
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  // FAQ data
  const faqItems = [
    {
      question: "How do I make a refund?",
      answer:
        "Lorem ipsum odor amet, consectetur adipiscing elit. Lorem rhoncus nisi aptent himenaeos ex praesent. Quisque neque suscipit aliquet suspendisse lacus orci efficitur augue parturient.",
    },
    {
      question: "What shipping methods are available?",
      answer:
        "We offer standard, express, and next-day shipping options. Shipping times vary based on your location and the selected shipping method. For international orders, additional customs fees may apply.",
    },
    {
      question: "How do I find the right bike size?",
      answer:
        "Finding the right bike size is crucial for comfort and performance. You can use our online size guide that considers your height, inseam length, and riding style. If you're between sizes, we recommend going for the smaller size for more control.",
    },
    {
      question: "What warranty do you provide?",
      answer:
        "All our bikes come with a 2-year warranty against manufacturing defects. Accessories typically have a 1-year warranty. Extended warranty options are available for purchase at checkout.",
    },
    {
      question: "Do you offer custom bike builds?",
      answer:
        "Yes, we offer custom bike builds for enthusiasts who want a personalized riding experience. Contact our customer service team to discuss your specific requirements and get a quote.",
    },
  ];

  // Toggle FAQ item
  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? -1 : index);
  };

  return (
    <div className="w-full">
      {/* Hero Section - Fixed */}
      <section className="px-6 md:px-12 py-20">
        <div className="relative rounded-3xl overflow-hidden">
          {/* Background Layer */}
          <div
            className="absolute inset-0 w-full h-full"
            style={{
              backgroundImage: `url(${groupie})`,
              backgroundPosition: "top",
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
            }}
          />

          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black opacity-70"></div>

          {/* Content */}
          <div className="relative z-10 py-40 px-8 md:px-20 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 max-w-4xl mx-auto leading-tight text-white">
              WE'RE TRANSFORMING HOW
              <br />
              THE WORLD OPERATES
            </h1>
            <p className="text-gray-400 max-w-xl mx-auto text-base md:text-lg">
              Fedbius arcu ullamcorper ex malesuada convallis pretis. Sociosqu
              posuere accumsan ipsum auto.
            </p>
          </div>
        </div>
      </section>

      {/* Evidence Section */}
      <section className="py-20 px-6 md:px-12 text-black">
        <div className="max-w-[90%] md:max-w-[85%] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16">
            {/* Title in first column */}
            <div className="flex flex-col justify-center">
              <h2 className="text-3xl md:text-4xl font-bold">
                EVIDENCE OF
                <br />
                EXCELLENCE
              </h2>
            </div>

            {/* Stats in remaining columns */}
            <div className="flex flex-col">
              <h3 className="text-4xl md:text-5xl font-bold mb-2">123+</h3>
              <p className="text-gray-600">Consumers Worldwide</p>
            </div>

            <div className="flex flex-col">
              <h3 className="text-4xl md:text-5xl font-bold mb-2">99.9%</h3>
              <p className="text-gray-600">Positive Reviews</p>
            </div>

            <div className="flex flex-col">
              <h3 className="text-4xl md:text-5xl font-bold mb-2">123+</h3>
              <p className="text-gray-600">Support Partners</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 md:px-12 text-black">
        <div className="flex flex-col md:flex-row gap-12">
          <div className="w-full md:w-1/2">
            <h2 className="text-3xl font-bold mb-8">
              MAIN FEATURES OF POTENCY.
            </h2>
            <div className="space-y-6">
              {[
                "Premium quality materials for durability and performance",
                "Innovative design for superior aerodynamics and efficiency",
                "Customizable components to match your riding style",
                "Expert craftsmanship with attention to every detail",
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-6 h-6 border border-black rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                  </div>
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="w-full md:w-1/2">
            <div className="bg-black aspect-video w-full overflow-hidden rounded-lg">
              {/* Video placeholder - You could replace this with an actual video */}
              <div className="h-full w-full flex items-center justify-center text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-20 w-20"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold mt-6 mb-4">
              Excellence in Every Ride
            </h3>
            <p className="text-gray-600">
              Our bikes are designed with a perfect balance of performance,
              comfort, and style. Each component is carefully selected and
              tested to ensure the highest quality and reliability. Whether
              you're a professional cyclist or weekend warrior, our products
              will elevate your riding experience.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section - Interactive */}
      <section className="py-20 px-6 md:px-12 text-black">
        <div className="max-w-[90%] md:max-w-[85%] mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold mb-16 text-center">
            FREQUENTLY ASKED QUESTIONS
          </h2>

          <div className="max-w-4xl mx-auto space-y-4">
            {faqItems.map((item, index) => (
              <div
                key={index}
                className="border-t border-gray-200 py-6 text-black"
              >
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => toggleFaq(index)}
                >
                  <h3 className="text-xl font-medium">{item.question}</h3>
                  <button
                    className={`text-2xl transform transition-transform duration-200 ${
                      openFaqIndex === index ? "rotate-45" : ""
                    }`}
                  >
                    +
                  </button>
                </div>
                {openFaqIndex === index && (
                  <p className="mt-4 text-gray-600 animate-fadeIn">
                    {item.answer}
                  </p>
                )}
              </div>
            ))}
            <div className="border-t border-gray-200"></div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
