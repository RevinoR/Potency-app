import heroImage from '../../images/Group 3.png'
import evoImage from '../../images/image.png'
import ReimBike from '../../images/close-up-bicycle-outdoors.png'
import chicken from '../../images/game-icons_new-born.png'

const LandingPage = () => {
    return (
      <div className="w-full">
        {/* Hero Section */}
        <section className="relative min-h-[100vh] flex flex-col justify-center px-6 md:px-12 py-20 overflow-hidden">
            <div 
                className="absolute w-full h-full y- -z-10"
                style={{
                backgroundImage: `linear-gradient(to right, 
                #FCF9F4 0%, 
                #FCF9F4 20%, 
                transparent 35%
                ), url(${heroImage})`,
                backgroundPosition: 'right center',
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                opacity: '0.9',
                }}
            />
          <div className="relative z-10 w-full">
          <h1 className="text-5xl sm:text-[9.8vw] font-bold text-black mb-12 leading-none tracking-wide"> MOMENTUM RIDE.
    </h1>
    <div className="max-w-md">
      <p className="text-gray-600 mb-8 text-base md:text-lg">
        Lorem ipsum dolor amet, consectetur adipiscing elit. Cursus at duis elementum eu egestas.
      </p>
      <button className="bg-amber-500 text-white px-8 py-3 hover:bg-gray-800">
        VIEW PRODUCT
      </button>
    </div>
  </div>
</section>
  
        {/* Evolution Section */}
        <section className="relative min-h-[110vh] flex items-center text-white px-6 md:px-12">
  {/* Background Image */}
  <div 
    className="absolute inset-0 w-full h-full -z-10"
    style={{
      backgroundImage: `url(${evoImage})`,
      backgroundPosition: 'center',
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      filter: 'brightness(0.7)'
    }}
  />
  <div className="w-full py-20">
    <div className="max-w-[90%] md:max-w-[85%] mx-auto">
      <h2 className="text-4xl md:text-6xl font-bold mb-8 max-w-3xl tracking-wide">
        THE NEXT EVOLUTION ROAD BIKING EXPERIENCE
      </h2>
      
      <p className="max-w-xl mb-20 text-gray-400 text-base md:text-lg leading-relaxed">
        Lorem ipsum dolor amet, consectetur adipiscing elit. Lorem rhoncus nisi gravit himenaeos ex pretium. Quisque neque suscipit aliquet suspendisse lacus orci efficitur augue parturient.
      </p>
      
      <div className="flex items-start space-x-8">
  <div>
    <h3 className="text-5xl md:text-6xl font-bold mb-1">500K+</h3>
    <p className="text-gray-400 text-sm leading-tight">Consumer In<br />Indonesia</p>
  </div>
  
  <div className="h-16 w-[1px] bg-gray-600 self-center"></div>
  
  <div>
    <h3 className="text-5xl md:text-6xl font-bold mb-1">10+</h3>
    <p className="text-gray-400 text-sm leading-tight">Support<br />Partner</p>
  </div>
  
  <div className="h-16 w-[1px] bg-gray-600 self-center"></div>
  
  <div>
    <h3 className="text-5xl md:text-6xl font-bold mb-1">4.9</h3>
    <p className="text-gray-400 text-sm leading-tight">Products<br />Review</p>
  </div>
</div>
    </div>
  </div>
        </section>
        {/* Products Section */}
        <section className="px-6 md:px-4 py-20">
          <div className="max-w-[90%] md:max-w-[80%] mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-16 text-black tracking-tight">OUR MOST BELOVED PRODUCT</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
              {/* Product Card 1 */}
              <div className="group cursor-pointer text-black">
                <div className="bg-gray-200 aspect-square mb-6 transition-transform duration-300 group-hover:scale-95"></div>
                <h3 className="font-bold mb-3 text-lg md:text-xl">Comme Studios Vitesse 2024 Women Short Sleeve Jersey</h3>
                <p className="text-gray-600 text-sm md:text-base">Lorem ipsum dolor amet, consectetur adipiscing elit.</p>
              </div>
              {/* Product Card 2 */}
              <div className="group cursor-pointer text-black">
                <div className="bg-gray-200 aspect-square mb-6 transition-transform duration-300 group-hover:scale-95"></div>
                <h3 className="font-bold mb-3 text-lg md:text-xl">Pas Normal Studios PNS x Porter Coin Case</h3>
                <p className="text-gray-600 text-sm md:text-base">Lorem ipsum dolor amet, consectetur adipiscing elit.</p>
              </div>
              {/* Product Card 3 */}
              <div className="group cursor-pointer text-black">
                <div className="bg-gray-200 aspect-square mb-6 transition-transform duration-300 group-hover:scale-95"></div>
                <h3 className="font-bold mb-3 text-lg md:text-xl">Pas Normal Studios Mechanism Jersey</h3>
                <p className="text-gray-600 text-sm md:text-base">Lorem ipsum dolor amet, consectetur adipiscing elit.</p>
              </div>
            </div>
          </div>
        </section>
  
        {/* Reimagined Section */}
    <section className="relative min-h-screen flex items-start text-white px-6 md:px-12 py-20">
    {/* Background Image */}
    <div 
    className="absolute inset-0 w-full h-full -z-10"
    style={{
      backgroundImage: `url(${ReimBike})`,
      backgroundPosition: 'center',
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      filter: 'brightness(0.7)'
    }}
  />
  
  <div className="w-full max-w-[90%] md:max-w-[85%] mx-auto">
    <h2 className="text-4xl md:text-6xl font-bold mb-8">
      A REIMAGINED FORM
    </h2>
    
    <p className="max-w-xl mb-20 text-gray-300 text-base md:text-lg leading-relaxed">
      Lorem ipsum dolor amet, consectetur adipiscing elit. Sed consectetuer ut lacinia sodales maecenas maximus enim torquent varius himenaeos fames, aliquiet duis.
    </p>
    
    <div className="flex flex-col gap-5">
      <h3 className="text-2xl md:text-3xl font-bold tracking-wider">
        ESTABLISHED SINCE
      </h3>
      
      <div className="flex items-start gap-4">
        <div className="flex flex-col">
          <span className="text-4xl md:text-5xl font-light  leading-none">20</span>
          <span className="text-4xl md:text-5xl font-light leading-none">21</span>
        </div>
        <div className="flex items-center gap-4 mt-4">
            <img 
              src={chicken} 
              alt="Chick Icon" 
              className="w-16 h-16 object-contain"
            />
            <div className="flex flex-col text-1xl font-light md:text-3xl">
              <span>delivering excellence</span>
              <span>in cycling</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

  
        {/* Suppliers Section */}
        <section className="px-6 md:px-12 py-20">
          <div className="max-w-[90%] md:max-w-[80%] mx-auto">
            <h2 className="text-center text-3xl md:text-4xl font-bold mb-8 text-black">Our supplies</h2>
            <p className="text-center text-gray-600 mb-16 text-base md:text-lg">
              Lorem ipsum dolor amet, consectetur adipiscing elit.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 max-w-4xl mx-auto">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="aspect-square bg-gray-100 transition-transform duration-300 hover:scale-95"></div>
              ))}
            </div>
          </div>
        </section>
      </div>
    )
  }
  
  export default LandingPage