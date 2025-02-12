import groupie from '../../images/freepik__adjust__77620.png'

const AboutPage = () => {
    return (
      <div className="w-full">
        {/* Hero Section */}
<section className="px-6 md:px-12 py-20">
  <div 
    className="relative rounded-3xl py-40 px-8 md:px-20 text-center overflow-hidden"
  >
    {/* Background Image */}
    <div 
      className="absolute inset-0 w-full h-full -z-10"
      style={{
        backgroundImage: `url(${groupie})`,
        backgroundPosition: 'top',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        filter: 'brightness(0.3)' // Darkens the image for text readability
      }}
    />

    <h1 className="text-4xl md:text-6xl font-bold mb-6 max-w-4xl mx-auto leading-tight text-white">
      WE'RE TRANSFORMING HOW<br />
      THE WORLD OPERATES
    </h1>
    <p className="text-gray-400 max-w-xl mx-auto text-base md:text-lg">
      Fedbius arcu ullamcorper ex malesuada convallis pretis. Sociosqu
      posuere accumsan ipsum auto.
    </p>
  </div>
</section>


 {/* Evidence Section */}
<section className="py-20 px-6 md:px-12 text-black">
  <div className="max-w-[90%] md:max-w-[85%] mx-auto">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-16">
      {/* Title in first column */}
      <div className="flex flex-col justify-center">
        <h2 className="text-3xl md:text-4xl font-bold">
          EVIDENCE OF<br />EXCELLENCE
        </h2>
      </div>
      
      {/* Stats in remaining columns */}
      <div className="flex flex-col">
        <h3 className="text-4xl md:text-5xl font-bold mb-2">123+</h3>
        <p className="text-gray-600">Consumer in the World</p>
      </div>
      
      <div className="flex flex-col">
        <h3 className="text-4xl md:text-5xl font-bold mb-2">99.9%</h3>
        <p className="text-gray-600">Product reviews</p>
      </div>
      
      <div className="flex flex-col">
        <h3 className="text-4xl md:text-5xl font-bold mb-2">123+</h3>
        <p className="text-gray-600">Support partner</p>
      </div>
    </div>
  </div>
</section>


  
        {/* Features Section */}
        <section className="py-20 px-6 md:px-12 text-black">
          <div className="flex flex-col md:flex-row gap-12">
            <div className="w-full md:w-1/2">
              <h2 className="text-3xl font-bold mb-8">MAIN FEATURES OF POTENCY.</h2>
              <div className="space-y-6">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="flex items-center gap-4">
                    <div className="w-6 h-6 border border-black rounded-full"></div>
                    <p>Lorem ipsum odor amet, consectetur adipiscing elit.</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <div className="bg-black aspect-video w-full"></div>
              <h3 className="text-2xl font-bold mt-6 mb-4">Lorem ipsum odor amet, consectetuer.</h3>
              <p className="text-gray-600">
                Lorem ipsum odor amet, consectetuer adipiscing elit. Lorem rhoncus nisi aptent himenaeos ex praesent. Quisque neque suscipit aliquet suspendisse lacus orci efficitur augue parturient.
              </p>
            </div>
          </div>
        </section>
  
        {/* FAQ Section */}
<section className="py-20 px-6 md:px-12 text-black">
  <div className="max-w-[90%] md:max-w-[85%] mx-auto">
    <h2 className="text-3xl md:text-5xl font-bold mb-16 text-center">
      FREQUENTLY ASKED QUESTIONS
    </h2>
    
    <div className="max-w-4xl mx-auto space-y-4">
      {/* FAQ Item - Open */}
      <div className="border-t border-gray-200 py-6 text-black">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-medium">How do I make a refund?</h3>
          <button className="text-2xl transform rotate-45">+</button>
        </div>
        <p className="mt-4 text-gray-600">
          Lorem ipsum odor amet, consectetur adipiscing elit. Lorem rhoncus nisi aptent himenaeos ex praesent. Quisque neque suscipit aliquet suspendisse lacus orci efficitur augue parturient.
        </p>
      </div>

      {/* FAQ Items - Closed */}
      {[2, 3, 4, 5].map((item) => (
        <div key={item} className="border-t border-gray-200 py-6 text-black">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-medium">How do I make a refund?</h3>
            <button className="text-2xl">+</button>
          </div>
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
  